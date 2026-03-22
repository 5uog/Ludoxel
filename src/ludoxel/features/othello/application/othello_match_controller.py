# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import replace

from ..domain.game.board import square_index_to_row_col
from ..domain.game.rules import apply_move, counts_for_board, create_initial_board, find_legal_moves, winner_for_board
from ..domain.game.types import OTHELLO_ANIMATION_FAST, OTHELLO_ANIMATION_SLOW, OTHELLO_GAME_STATE_AI_TURN, OTHELLO_GAME_STATE_ANIMATING, OTHELLO_GAME_STATE_FINISHED, OTHELLO_GAME_STATE_IDLE, OTHELLO_GAME_STATE_PLAYER_TURN, SIDE_BLACK, SIDE_WHITE, OthelloAnimationState, OthelloGameState, OthelloSettings, normalize_animation_mode, other_side, side_name, time_control_is_per_move, time_control_limit_s

_ANIMATION_DURATION_S: float = 0.22
_ANIMATION_FAST_STEP_S: float = 0.15
_ANIMATION_SLOW_STEP_S: float = _ANIMATION_DURATION_S


def _turn_status_for_player_side(player_side: int, current_turn: int) -> str:
    """I define Sigma(p,t) = player_turn if t = p and ai_turn otherwise. This two-state projection is the bridge between side arithmetic and the user-facing control flow of the match controller."""
    if int(current_turn) == int(player_side):
        return OTHELLO_GAME_STATE_PLAYER_TURN
    return OTHELLO_GAME_STATE_AI_TURN


def _animation_start_delay_s(*, mode: str, flip_order_index: int) -> float:
    """I define delta(mode, k) by delta(off, k) = 0, delta(fast, k) = 0.15*k, and delta(slow, k) = 0.22*k for k >= 0. This schedule encodes the inter-flip ripple spacing used by the renderer and match-tick completion logic."""
    normalized_mode = normalize_animation_mode(mode)
    order_index = max(0, int(flip_order_index))
    if normalized_mode == OTHELLO_ANIMATION_SLOW:
        return float(order_index) * float(_ANIMATION_SLOW_STEP_S)
    if normalized_mode == OTHELLO_ANIMATION_FAST:
        return float(order_index) * float(_ANIMATION_FAST_STEP_S)
    return 0.0


def _ordered_flipped_squares(*, placed_square_index: int, flipped: tuple[int, ...] | list[int]) -> tuple[int, ...]:
    """I define the flip order as the lexicographic order induced by (||x_i - x_0||^2, row_i, col_i), where x_0 is the placed square center. This produces a deterministic outward ripple from the placed disc without introducing floating-point distance ambiguity."""
    placed_row, placed_col = square_index_to_row_col(int(placed_square_index))

    def sort_key(square_index: int) -> tuple[int, int, int]:
        row, col = square_index_to_row_col(int(square_index))
        d_row = int(row) - int(placed_row)
        d_col = int(col) - int(placed_col)
        distance_sq = int(d_row * d_row + d_col * d_col)
        return (int(distance_sq), int(row), int(col))

    return tuple(sorted((int(index) for index in tuple(flipped)), key=sort_key))


def _reset_turn_timer_if_needed(state: OthelloGameState, *, next_turn: int) -> OthelloGameState:
    """I define ResetClock(G, t_next) as the state obtained by setting the active side clock to tau(settings) exactly when the timer mode is per move. I leave per-side modes untouched because their clocks encode cumulative remaining time, not per-turn budgets."""
    settings = state.settings.normalized()
    if not time_control_is_per_move(settings.time_control):
        return state
    limit_s = time_control_limit_s(settings.time_control)
    if limit_s is None:
        return state
    if int(next_turn) == int(SIDE_BLACK):
        return replace(state, black_time_remaining_s=float(limit_s)).normalized()
    if int(next_turn) == int(SIDE_WHITE):
        return replace(state, white_time_remaining_s=float(limit_s)).normalized()
    return state


class OthelloMatchController:
    """I implement the match-state transition system G_{n+1} = F(G_n, input, dt) for one Othello game. I keep the state immutable at the data layer and express every turn transition, clock update, pass rule, and animation settlement as an explicit map from one normalized state to the next."""

    def __init__(self, *, default_settings: OthelloSettings | None = None, game_state: OthelloGameState | None = None) -> None:
        """I initialize the controller with a normalized default-configuration vector and an optional persisted match state. I immediately coerce the loaded state through the transition reconciler so that restored matches satisfy the same invariants as freshly started ones."""
        self._default_settings = (default_settings or OthelloSettings()).normalized()
        self._state = (game_state or OthelloGameState()).normalized()
        self._state = self._coerce_loaded_state(self._state)

    def default_settings(self) -> OthelloSettings:
        """I return the canonical default settings vector S_0 that will be applied to the next fresh match."""
        return self._default_settings

    def set_default_settings(self, settings: OthelloSettings) -> None:
        """I assign S_0 := N_S(settings). This update does not rewrite the active match state; it only affects subsequent match initialization."""
        self._default_settings = settings.normalized()

    def game_state(self) -> OthelloGameState:
        """I return the current normalized match state G_n."""
        return self._state

    def set_game_state(self, game_state: OthelloGameState) -> None:
        """I replace the active state with a reconciled persisted snapshot. I route the incoming state through the loaded-state coercion path so that stale animation and legal-move fields are reconstructed deterministically."""
        self._state = self._coerce_loaded_state(game_state.normalized())

    def reset_to_idle(self) -> None:
        """I set G := G_idle with the canonical instructional message. This is the explicit non-match state used before a start action has been committed."""
        self._state = OthelloGameState(message="Right-click Start to begin a match. Use left click to place a disc.").normalized()

    def start_new_match(self) -> OthelloGameState:
        """I define Start(S_0) as construction of the initial Othello board, side assignment, clock initialization, and first legal-move resolution. The resulting state is not merely initialized; it is also advanced through the turn-transition reconciler so that legal moves and status are populated immediately."""
        settings = self._default_settings.normalized()
        player_side = int(settings.player_side)
        ai_side = int(other_side(player_side))
        current_turn = int(SIDE_BLACK)
        time_limit_s = settings.default_time_limit_s()

        self._state = OthelloGameState(status=OTHELLO_GAME_STATE_IDLE, board=create_initial_board(), settings=settings, player_side=player_side, ai_side=ai_side, current_turn=current_turn, black_time_remaining_s=time_limit_s, white_time_remaining_s=time_limit_s, move_count=0, consecutive_passes=0, winner=None, message="Match initialized.", last_move_index=None, animations=(), match_generation=int(self._state.match_generation) + 1, legal_moves=(), thinking=False).normalized()
        self._state = self._resolve_turn_transition(message_prefix="Match started.", reset_per_move_timer=True)
        return self.game_state()

    def restart_match(self) -> OthelloGameState:
        """I define Restart := Start. I expose the alias because the UI semantics distinguish initial start from restart even though the state transform is identical."""
        return self.start_new_match()

    def can_player_move(self, square_index: int) -> bool:
        """I evaluate chi_player(i) = 1 iff the state is in `player_turn` and i lies in the current legal-move set. This predicate is the exact authorization gate for player click submission."""
        state = self._state.normalized()
        return bool(state.status == OTHELLO_GAME_STATE_PLAYER_TURN and int(square_index) in set(state.legal_moves))

    def set_ai_thinking(self, thinking: bool) -> None:
        """I update the thinking flag while preserving all other state projections. This bit is orthogonal to board evolution but is semantically required by the HUD and AI request scheduler."""
        self._state = replace(self._state, thinking=bool(thinking)).normalized()

    def settle_animations(self) -> OthelloGameState:
        """I force every pending flip trajectory into its post-animation state and then re-enter the ordinary turn-transition path. This operator is used by persistence and space switching whenever transient animation state must collapse into a stable board position immediately."""
        state = self._state.normalized()
        if state.status != OTHELLO_GAME_STATE_ANIMATING or not state.animations:
            self._state = replace(state, animations=(), thinking=False).normalized()
            return self.game_state()

        self._state = replace(state, animations=(), thinking=False).normalized()
        self._state = self._resolve_turn_transition(message_prefix="Animation settled.", reset_per_move_timer=True)
        return self.game_state()

    def tick(self, dt: float, *, paused: bool) -> OthelloGameState:
        """I define Tick(G, dt) as the discrete-time advance of animation clocks and match clocks under dt >= 0. When status = animating, I advance each alpha_j by elapsed_j := elapsed_j + dt and settle the move when elapsed_j >= delay_j + duration_j for every j; when status is a turn state and the timer is finite, I subtract dt from the active side clock and terminate on clock exhaustion."""
        step = max(0.0, float(dt))
        state = self._state.normalized()

        if state.status == OTHELLO_GAME_STATE_ANIMATING and state.animations:
            next_animations: list[OthelloAnimationState] = []
            for animation in state.animations:
                advanced = animation.normalized()
                elapsed = float(advanced.elapsed_s) + float(step)
                if elapsed + 1e-9 < float(advanced.total_duration_s()):
                    next_animations.append(replace(advanced, elapsed_s=float(elapsed)).normalized())

            if next_animations:
                self._state = replace(state, animations=tuple(next_animations)).normalized()
                return self.game_state()

            self._state = replace(state, animations=()).normalized()
            self._state = self._resolve_turn_transition(message_prefix="Move resolved.", reset_per_move_timer=True)
            return self.game_state()

        if paused or step <= 1e-9:
            self._state = state
            return self.game_state()

        if state.status not in (OTHELLO_GAME_STATE_PLAYER_TURN, OTHELLO_GAME_STATE_AI_TURN):
            self._state = state
            return self.game_state()

        if state.settings.default_time_limit_s() is None:
            self._state = state
            return self.game_state()

        black_time = state.black_time_remaining_s
        white_time = state.white_time_remaining_s

        if state.current_turn == SIDE_BLACK and black_time is not None:
            black_time = max(0.0, float(black_time) - step)
        elif state.current_turn == SIDE_WHITE and white_time is not None:
            white_time = max(0.0, float(white_time) - step)

        timed_state = replace(state, black_time_remaining_s=black_time, white_time_remaining_s=white_time).normalized()

        if (timed_state.current_turn == SIDE_BLACK and black_time is not None and black_time <= 1e-9) or (timed_state.current_turn == SIDE_WHITE and white_time is not None and white_time <= 1e-9):
            winner = side_name(other_side(timed_state.current_turn))
            self._state = replace(timed_state, status=OTHELLO_GAME_STATE_FINISHED, legal_moves=(), winner=winner, thinking=False, message=f"{side_name(timed_state.current_turn).title()} ran out of time.").normalized()
            return self.game_state()

        self._state = timed_state
        return self.game_state()

    def submit_player_move(self, square_index: int) -> bool:
        """I apply the player move i only when chi_player(i) = 1. The return value is therefore the exact acceptance predicate of the player-input path."""
        state = self._state.normalized()
        if state.status != OTHELLO_GAME_STATE_PLAYER_TURN:
            return False
        if int(square_index) not in set(state.legal_moves):
            return False
        self._apply_turn_move(side=state.player_side, square_index=int(square_index))
        return True

    def submit_ai_move(self, square_index: int | None) -> bool:
        """I apply an AI move when the controller is in `ai_turn`. If the caller supplies None or an illegal move, I fall back to the first legal move so that asynchronous AI results cannot leave the state machine undefined."""
        state = self._state.normalized()
        if state.status != OTHELLO_GAME_STATE_AI_TURN:
            return False

        legal = tuple(state.legal_moves)
        if not legal:
            self._state = replace(state, thinking=False).normalized()
            self._state = self._resolve_turn_transition(message_prefix="AI had no legal move.", reset_per_move_timer=True)
            return False

        move_index = legal[0] if square_index is None else int(square_index)
        if move_index not in set(legal):
            move_index = int(legal[0])

        self._apply_turn_move(side=state.ai_side, square_index=int(move_index))
        return True

    def _apply_turn_move(self, *, side: int, square_index: int) -> None:
        """I define ApplyMove(G, side, i) as board evolution, ripple-animation construction, turn inversion, and message update. The animation schedule is derived from the ordered flipped set and therefore carries enough temporal structure for both simultaneous and ripple modes."""
        state = self._state.normalized()
        next_board, flipped = apply_move(state.board, side=side, index=int(square_index))
        ordered_flips = _ordered_flipped_squares(placed_square_index=int(square_index), flipped=tuple(flipped))
        animations = tuple(OthelloAnimationState(square_index=int(index), from_side=other_side(side), to_side=side, duration_s=float(_ANIMATION_DURATION_S), start_delay_s=float(_animation_start_delay_s(mode=state.settings.animation_mode, flip_order_index=order_index))).normalized() for order_index, index in enumerate(ordered_flips))

        updated = replace(state, board=next_board, current_turn=other_side(side), move_count=int(state.move_count) + 1, consecutive_passes=0, last_move_index=int(square_index), animations=animations, status=OTHELLO_GAME_STATE_ANIMATING if animations else OTHELLO_GAME_STATE_IDLE, thinking=False, legal_moves=(), message=f"{side_name(side).title()} moved to {int(square_index)}.").normalized()
        self._state = updated
        if not animations:
            self._state = self._resolve_turn_transition(message_prefix="Move applied.", reset_per_move_timer=True)

    def _coerce_loaded_state(self, state: OthelloGameState) -> OthelloGameState:
        """I reconcile a persisted snapshot with the live transition invariants. In particular, I clear stale animation state, reconstruct legal moves from the board and turn, and normalize terminal and idle states into their non-transient forms."""
        normalized = state.normalized()
        if normalized.status == OTHELLO_GAME_STATE_IDLE:
            return replace(normalized, legal_moves=(), thinking=False).normalized()
        if normalized.status == OTHELLO_GAME_STATE_FINISHED:
            return replace(normalized, legal_moves=(), thinking=False, animations=()).normalized()
        if normalized.status == OTHELLO_GAME_STATE_ANIMATING:
            normalized = replace(normalized, animations=(), thinking=False).normalized()
        self._state = normalized
        return self._resolve_turn_transition(message_prefix="Match restored.", reset_per_move_timer=False)

    def _resolve_turn_transition(self, *, message_prefix: str, reset_per_move_timer: bool) -> OthelloGameState:
        """I define Resolve(G) as the closure of pass rules, legal-move generation, terminal detection, and optional per-move timer reload. If the current side has legal moves, I expose them directly; if not, I attempt the pass transition; if neither side can move, I evaluate the winner and enter the finished state."""
        state = self._state.normalized()
        if state.status == OTHELLO_GAME_STATE_FINISHED:
            self._state = replace(state, legal_moves=(), thinking=False, animations=()).normalized()
            return self.game_state()

        current_side = int(state.current_turn)
        legal_moves = find_legal_moves(state.board, current_side)
        if legal_moves:
            next_status = _turn_status_for_player_side(state.player_side, current_side)
            next_state = replace(state, status=next_status, legal_moves=tuple(legal_moves), thinking=False, message=f"{message_prefix} {side_name(current_side).title()} to move.").normalized()
            self._state = _reset_turn_timer_if_needed(next_state, next_turn=current_side) if bool(reset_per_move_timer) else next_state
            return self.game_state()

        other = int(other_side(current_side))
        other_legal_moves = find_legal_moves(state.board, other)
        if other_legal_moves:
            next_status = _turn_status_for_player_side(state.player_side, other)
            next_state = replace(state, current_turn=other, legal_moves=tuple(other_legal_moves), consecutive_passes=min(2, int(state.consecutive_passes) + 1), status=next_status, thinking=False, message=f"{message_prefix} {side_name(current_side).title()} must pass.").normalized()
            self._state = _reset_turn_timer_if_needed(next_state, next_turn=other) if bool(reset_per_move_timer) else next_state
            return self.game_state()

        winner = winner_for_board(state.board)
        black, white = counts_for_board(state.board)
        message = f"{message_prefix} Match finished. Black {int(black)} - White {int(white)}."
        self._state = replace(state, status=OTHELLO_GAME_STATE_FINISHED, legal_moves=(), winner=winner, thinking=False, animations=(), message=message).normalized()
        return self.game_state()
