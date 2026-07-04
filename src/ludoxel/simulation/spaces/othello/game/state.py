# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.foundations.mathematics.scalars.numeric import clampf, clampi
from ludoxel.simulation.spaces.othello.game.animations import (
  OTHELLO_ANIMATION_FAST,
  OTHELLO_ANIMATION_MODES,
  OTHELLO_ANIMATION_OFF,
  OTHELLO_ANIMATION_SLOW,
  OthelloAnimationState,
  animation_mode_display_name,
  normalize_animation_mode,
)
from ludoxel.simulation.spaces.othello.game.clocks import (
  DEFAULT_TIME_LIMIT_S,
  OTHELLO_TIME_CONTROL_NONE,
  OTHELLO_TIME_CONTROL_OFF,
  OTHELLO_TIME_CONTROL_PER_MOVE_5S,
  OTHELLO_TIME_CONTROL_PER_MOVE_10S,
  OTHELLO_TIME_CONTROL_PER_MOVE_30S,
  OTHELLO_TIME_CONTROL_PER_SIDE_1M,
  OTHELLO_TIME_CONTROL_PER_SIDE_3M,
  OTHELLO_TIME_CONTROL_PER_SIDE_5M,
  OTHELLO_TIME_CONTROL_PER_SIDE_10M,
  OTHELLO_TIME_CONTROL_PER_SIDE_20M,
  OTHELLO_TIME_CONTROLS,
  normalize_time_control,
  time_control_display_name,
  time_control_is_per_move,
  time_control_limit_s,
)
from ludoxel.simulation.spaces.othello.game.settings import (
  DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR,
  DEFAULT_OTHELLO_BOOK_LEAF_ERROR,
  DEFAULT_OTHELLO_BOOK_LEARNING_DEPTH,
  DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR,
  DEFAULT_OTHELLO_HASH_LEVEL,
  DEFAULT_OTHELLO_SACRIFICE_LEVEL,
  DEFAULT_OTHELLO_THREAD_COUNT,
  OTHELLO_AI_HASH_LEVEL_MAX,
  OTHELLO_AI_HASH_LEVEL_MIN,
  OTHELLO_AI_SACRIFICE_LEVEL_MAX,
  OTHELLO_AI_SACRIFICE_LEVEL_MIN,
  OTHELLO_AI_THREAD_MAX,
  OTHELLO_AI_THREAD_MIN,
  OTHELLO_BOOK_ERROR_MAX,
  OTHELLO_BOOK_ERROR_MIN,
  OTHELLO_BOOK_LEARNING_DEPTH_MAX,
  OTHELLO_BOOK_LEARNING_DEPTH_MIN,
  OTHELLO_DIFFICULTIES,
  OTHELLO_DIFFICULTY_INSANE,
  OTHELLO_DIFFICULTY_INSANE_PLUS,
  OTHELLO_DIFFICULTY_MEDIUM,
  OTHELLO_DIFFICULTY_STRONG,
  OTHELLO_DIFFICULTY_WEAK,
  OthelloSettings,
  difficulty_display_name,
  normalize_book_error,
  normalize_book_learning_depth,
  normalize_difficulty,
  normalize_hash_level,
  normalize_sacrifice_level,
  normalize_thread_count,
)
from ludoxel.simulation.spaces.othello.game.sides import _SIDE_TOKENS, _TOKEN_SIDES, BOARD_CELL_COUNT, SIDE_BLACK, SIDE_EMPTY, SIDE_WHITE, normalize_player_side, normalize_side, other_side, side_name

__all__ = (
  "BOARD_CELL_COUNT",
  "DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR",
  "DEFAULT_OTHELLO_BOOK_LEAF_ERROR",
  "DEFAULT_OTHELLO_BOOK_LEARNING_DEPTH",
  "DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR",
  "DEFAULT_OTHELLO_HASH_LEVEL",
  "DEFAULT_OTHELLO_SACRIFICE_LEVEL",
  "DEFAULT_OTHELLO_THREAD_COUNT",
  "DEFAULT_TIME_LIMIT_S",
  "OTHELLO_AI_HASH_LEVEL_MAX",
  "OTHELLO_AI_HASH_LEVEL_MIN",
  "OTHELLO_AI_SACRIFICE_LEVEL_MAX",
  "OTHELLO_AI_SACRIFICE_LEVEL_MIN",
  "OTHELLO_AI_THREAD_MAX",
  "OTHELLO_AI_THREAD_MIN",
  "OTHELLO_ANIMATION_FAST",
  "OTHELLO_ANIMATION_MODES",
  "OTHELLO_ANIMATION_OFF",
  "OTHELLO_ANIMATION_SLOW",
  "OTHELLO_BOOK_ERROR_MAX",
  "OTHELLO_BOOK_ERROR_MIN",
  "OTHELLO_BOOK_LEARNING_DEPTH_MAX",
  "OTHELLO_BOOK_LEARNING_DEPTH_MIN",
  "OTHELLO_DIFFICULTIES",
  "OTHELLO_DIFFICULTY_INSANE",
  "OTHELLO_DIFFICULTY_INSANE_PLUS",
  "OTHELLO_DIFFICULTY_MEDIUM",
  "OTHELLO_DIFFICULTY_STRONG",
  "OTHELLO_DIFFICULTY_WEAK",
  "OTHELLO_GAME_STATE_AI_TURN",
  "OTHELLO_GAME_STATE_ANIMATING",
  "OTHELLO_GAME_STATE_FINISHED",
  "OTHELLO_GAME_STATE_IDLE",
  "OTHELLO_GAME_STATE_PLAYER_TURN",
  "OTHELLO_GAME_STATUSES",
  "OTHELLO_TIME_CONTROL_NONE",
  "OTHELLO_TIME_CONTROL_OFF",
  "OTHELLO_TIME_CONTROL_PER_MOVE_5S",
  "OTHELLO_TIME_CONTROL_PER_MOVE_10S",
  "OTHELLO_TIME_CONTROL_PER_MOVE_30S",
  "OTHELLO_TIME_CONTROL_PER_SIDE_1M",
  "OTHELLO_TIME_CONTROL_PER_SIDE_3M",
  "OTHELLO_TIME_CONTROL_PER_SIDE_5M",
  "OTHELLO_TIME_CONTROL_PER_SIDE_10M",
  "OTHELLO_TIME_CONTROL_PER_SIDE_20M",
  "OTHELLO_TIME_CONTROLS",
  "OTHELLO_WINNER_DRAW",
  "OthelloAnalysis",
  "OthelloAnimationState",
  "OthelloDepthSample",
  "OthelloGameState",
  "OthelloMoveEvaluation",
  "OthelloSettings",
  "SIDE_BLACK",
  "SIDE_EMPTY",
  "SIDE_WHITE",
  "animation_mode_display_name",
  "coerce_board",
  "decode_board",
  "difficulty_display_name",
  "empty_othello_game_state",
  "encode_board",
  "normalize_animation_mode",
  "normalize_book_error",
  "normalize_book_learning_depth",
  "normalize_difficulty",
  "normalize_game_status",
  "normalize_hash_level",
  "normalize_player_side",
  "normalize_sacrifice_level",
  "normalize_side",
  "normalize_thread_count",
  "normalize_time_control",
  "other_side",
  "side_name",
  "time_control_display_name",
  "time_control_is_per_move",
  "time_control_limit_s",
)

OTHELLO_GAME_STATE_IDLE: str = "idle"
OTHELLO_GAME_STATE_PLAYER_TURN: str = "player_turn"
OTHELLO_GAME_STATE_AI_TURN: str = "ai_turn"
OTHELLO_GAME_STATE_ANIMATING: str = "animating"
OTHELLO_GAME_STATE_FINISHED: str = "finished"
OTHELLO_GAME_STATUSES: tuple[str, ...] = (OTHELLO_GAME_STATE_IDLE, OTHELLO_GAME_STATE_PLAYER_TURN, OTHELLO_GAME_STATE_AI_TURN, OTHELLO_GAME_STATE_ANIMATING, OTHELLO_GAME_STATE_FINISHED)

OTHELLO_WINNER_DRAW: str = "draw"


def _default_initial_board() -> tuple[int, ...]:
  board = [SIDE_EMPTY] * BOARD_CELL_COUNT
  board[3 * 8 + 3] = SIDE_WHITE
  board[3 * 8 + 4] = SIDE_BLACK
  board[4 * 8 + 3] = SIDE_BLACK
  board[4 * 8 + 4] = SIDE_WHITE
  return tuple(board)


def normalize_game_status(value: object, *, default: str = OTHELLO_GAME_STATE_IDLE) -> str:
  raw = str(value).strip().lower()
  if raw in OTHELLO_GAME_STATUSES:
    return raw
  fallback = str(default).strip().lower()
  if fallback in OTHELLO_GAME_STATUSES:
    return fallback
  return OTHELLO_GAME_STATE_IDLE


def decode_board(raw: object) -> tuple[int, ...]:
  text = str(raw or "")
  cells: list[int] = []
  for token in text[:BOARD_CELL_COUNT]:
    cells.append(int(_TOKEN_SIDES.get(str(token).upper(), SIDE_EMPTY)))
  while len(cells) < BOARD_CELL_COUNT:
    cells.append(SIDE_EMPTY)
  return tuple(cells[:BOARD_CELL_COUNT])


def coerce_board(board: object) -> tuple[int, ...]:
  if isinstance(board, str):
    return decode_board(board)

  try:
    raw = tuple(board)
  except Exception:
    return tuple([SIDE_EMPTY] * BOARD_CELL_COUNT)

  cells: list[int] = []
  for value in raw[:BOARD_CELL_COUNT]:
    cells.append(normalize_side(value))

  while len(cells) < BOARD_CELL_COUNT:
    cells.append(SIDE_EMPTY)

  return tuple(cells[:BOARD_CELL_COUNT])


def encode_board(board: tuple[int, ...] | list[int]) -> str:
  cells: list[str] = []
  for side in coerce_board(board):
    cells.append(_SIDE_TOKENS[side])
  return "".join(cells)


@dataclass(frozen=True)
class OthelloDepthSample:
  depth: int
  score: float
  solved: bool = False

  def normalized(self) -> "OthelloDepthSample":
    return OthelloDepthSample(depth=max(0, int(self.depth)), score=float(self.score), solved=bool(self.solved))


@dataclass(frozen=True)
class OthelloMoveEvaluation:
  move_index: int
  score: float
  solved: bool = False

  def normalized(self) -> "OthelloMoveEvaluation":
    return OthelloMoveEvaluation(move_index=clampi(int(self.move_index), 0, BOARD_CELL_COUNT - 1), score=float(self.score), solved=bool(self.solved))


@dataclass(frozen=True)
class OthelloAnalysis:
  side_to_move: int = SIDE_BLACK
  best_move_index: int | None = None
  best_line: tuple[int, ...] = ()
  score: float = 0.0
  solved: bool = False
  depth_reached: int = 0
  depth_samples: tuple[OthelloDepthSample, ...] = ()
  move_evaluations: tuple[OthelloMoveEvaluation, ...] = ()

  def normalized(self) -> "OthelloAnalysis":
    best_move = self.best_move_index
    if best_move is not None:
      best_move = clampi(int(best_move), 0, BOARD_CELL_COUNT - 1)
    best_line: list[int] = []
    for value in tuple(self.best_line):
      try:
        index = int(value)
      except Exception:
        continue
      if 0 <= index < BOARD_CELL_COUNT:
        best_line.append(index)
    return OthelloAnalysis(
      side_to_move=normalize_side(self.side_to_move, default=SIDE_BLACK),
      best_move_index=best_move,
      best_line=tuple(best_line),
      score=float(self.score),
      solved=bool(self.solved),
      depth_reached=max(0, int(self.depth_reached)),
      depth_samples=tuple(sample.normalized() for sample in tuple(self.depth_samples)),
      move_evaluations=tuple(evaluation.normalized() for evaluation in tuple(self.move_evaluations)),
    )


@dataclass(frozen=True)
class OthelloGameState:
  status: str = OTHELLO_GAME_STATE_IDLE
  board: tuple[int, ...] = field(default_factory=_default_initial_board)
  settings: OthelloSettings = field(default_factory=OthelloSettings)
  player_side: int = SIDE_BLACK
  ai_side: int = SIDE_WHITE
  current_turn: int = SIDE_BLACK
  black_time_remaining_s: float | None = DEFAULT_TIME_LIMIT_S
  white_time_remaining_s: float | None = DEFAULT_TIME_LIMIT_S
  move_count: int = 0
  consecutive_passes: int = 0
  winner: str | None = None
  message: str = "Right-click Start to begin a match. Use left click to place a disc."
  last_move_index: int | None = None
  animations: tuple[OthelloAnimationState, ...] = ()
  match_generation: int = 0
  legal_moves: tuple[int, ...] = ()
  thinking: bool = False

  def normalized(self) -> "OthelloGameState":
    status = normalize_game_status(self.status)
    settings = self.settings.normalized()
    player_side = normalize_player_side(self.player_side, default=settings.player_side)
    ai_side = other_side(player_side)
    current_turn = normalize_side(self.current_turn, default=SIDE_BLACK)
    if current_turn == SIDE_EMPTY:
      current_turn = SIDE_BLACK

    time_limit = settings.default_time_limit_s()
    if time_limit is None:
      black_time = None
      white_time = None
    else:
      base_black = time_limit if self.black_time_remaining_s is None else float(self.black_time_remaining_s)
      base_white = time_limit if self.white_time_remaining_s is None else float(self.white_time_remaining_s)
      black_time = float(clampf(base_black, 0.0, float(time_limit)))
      white_time = float(clampf(base_white, 0.0, float(time_limit)))

    try:
      move_count = max(0, int(self.move_count))
    except Exception:
      move_count = 0

    try:
      consecutive_passes = clampi(int(self.consecutive_passes), 0, 2)
    except Exception:
      consecutive_passes = 0

    try:
      generation = max(0, int(self.match_generation))
    except Exception:
      generation = 0

    last_move = self.last_move_index
    if last_move is not None:
      try:
        last_move = clampi(int(last_move), 0, BOARD_CELL_COUNT - 1)
      except Exception:
        last_move = None

    legal_moves: list[int] = []
    for value in tuple(self.legal_moves):
      try:
        index = int(value)
      except Exception:
        continue
      if 0 <= index < BOARD_CELL_COUNT and index not in legal_moves:
        legal_moves.append(index)

    animations = tuple(animation.normalized() for animation in tuple(self.animations))

    winner = None if self.winner is None else str(self.winner).strip().lower()
    if winner not in (None, "black", "white", OTHELLO_WINNER_DRAW):
      winner = None

    return OthelloGameState(
      status=str(status),
      board=coerce_board(self.board),
      settings=settings,
      player_side=int(player_side),
      ai_side=int(ai_side),
      current_turn=int(current_turn),
      black_time_remaining_s=black_time,
      white_time_remaining_s=white_time,
      move_count=int(move_count),
      consecutive_passes=int(consecutive_passes),
      winner=winner,
      message=str(self.message),
      last_move_index=last_move,
      animations=animations,
      match_generation=int(generation),
      legal_moves=tuple(legal_moves),
      thinking=bool(self.thinking),
    )

  def to_dict(self) -> dict[str, Any]:
    normalized = self.normalized()
    return {
      "status": str(normalized.status),
      "board": encode_board(normalized.board),
      "settings": normalized.settings.to_dict(),
      "player_side": str(side_name(normalized.player_side)),
      "ai_side": str(side_name(normalized.ai_side)),
      "current_turn": str(side_name(normalized.current_turn)),
      "black_time_remaining_s": None if normalized.black_time_remaining_s is None else float(normalized.black_time_remaining_s),
      "white_time_remaining_s": None if normalized.white_time_remaining_s is None else float(normalized.white_time_remaining_s),
      "move_count": int(normalized.move_count),
      "consecutive_passes": int(normalized.consecutive_passes),
      "winner": normalized.winner,
      "message": str(normalized.message),
      "last_move_index": normalized.last_move_index,
      "animations": [animation.to_dict() for animation in normalized.animations],
      "match_generation": int(normalized.match_generation),
      "legal_moves": [int(index) for index in normalized.legal_moves],
    }

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "OthelloGameState":
    if not isinstance(data, dict):
      return OthelloGameState()

    settings = OthelloSettings.from_dict(data.get("settings", {}))

    animations_raw = data.get("animations", [])
    animations: list[OthelloAnimationState] = []
    if isinstance(animations_raw, list):
      for value in animations_raw:
        if isinstance(value, dict):
          animations.append(OthelloAnimationState.from_dict(value))

    legal_moves_raw = data.get("legal_moves", [])
    legal_moves: list[int] = []
    if isinstance(legal_moves_raw, list):
      for value in legal_moves_raw:
        try:
          index = int(value)
        except Exception:
          continue
        if 0 <= index < BOARD_CELL_COUNT:
          legal_moves.append(index)

    return OthelloGameState(
      status=normalize_game_status(data.get("status", OTHELLO_GAME_STATE_IDLE)),
      board=coerce_board(data.get("board", "")),
      settings=settings,
      player_side=normalize_player_side(data.get("player_side", settings.player_side)),
      ai_side=normalize_player_side(data.get("ai_side", other_side(settings.player_side)), default=SIDE_WHITE),
      current_turn=normalize_side(data.get("current_turn", SIDE_BLACK), default=SIDE_BLACK),
      black_time_remaining_s=data.get("black_time_remaining_s", settings.default_time_limit_s()),
      white_time_remaining_s=data.get("white_time_remaining_s", settings.default_time_limit_s()),
      move_count=int(data.get("move_count", 0)),
      consecutive_passes=int(data.get("consecutive_passes", 0)),
      winner=data.get("winner", None),
      message=str(data.get("message", "Right-click Start to begin a match. Use left click to place a disc.")),
      last_move_index=data.get("last_move_index", None),
      animations=tuple(animations),
      match_generation=int(data.get("match_generation", 0)),
      legal_moves=tuple(legal_moves),
    ).normalized()


def empty_othello_game_state() -> OthelloGameState:
  return OthelloGameState().normalized()
