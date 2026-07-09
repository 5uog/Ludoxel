# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import random
import time
from dataclasses import dataclass, field

from ludoxel.simulation.spaces.othello.books.opening import OpeningBook, load_opening_book, normalize_project_root
from ludoxel.simulation.spaces.othello.engines.bitboards import apply_move_bits, bit_count, bitboard_to_moves, bitboards_from_board, legal_moves_bitboard
from ludoxel.simulation.spaces.othello.engines.evaluation import LOSS_SCORE, WIN_SCORE, evaluate_position
from ludoxel.simulation.spaces.othello.engines.native import create_native_insane_search
from ludoxel.simulation.spaces.othello.engines.ordering import ordered_moves
from ludoxel.simulation.spaces.othello.engines.search import EXACT_SOLVE_EMPTY_SQUARE_THRESHOLD, check_deadline, negamax, solve_exact
from ludoxel.simulation.spaces.othello.engines.transposition import TranspositionEntry
from ludoxel.simulation.spaces.othello.game.state import BOARD_CELL_COUNT, DEFAULT_OTHELLO_HASH_LEVEL, DEFAULT_OTHELLO_SACRIFICE_LEVEL, SIDE_BLACK, SIDE_WHITE, coerce_board, normalize_hash_level, normalize_sacrifice_level, normalize_side

_EMPTY_OPENING_BOOK = OpeningBook(moves_by_key={})
_DISABLED_TRANSPOSITION_SOFT_LIMIT: int = 0
_TRANSPOSITION_SOFT_LIMIT_BASE_SHIFT: int = 11
_TRANSPOSITION_SOFT_LIMIT_MAX_SHIFT: int = 21
_TRANSPOSITION_SOFT_LIMIT_HASH_LEVEL_SHIFT_FACTOR: int = 2
_DEFAULT_TRANSPOSITION_SOFT_LIMIT_SHIFT: int = min(_TRANSPOSITION_SOFT_LIMIT_MAX_SHIFT, _TRANSPOSITION_SOFT_LIMIT_BASE_SHIFT + DEFAULT_OTHELLO_HASH_LEVEL * _TRANSPOSITION_SOFT_LIMIT_HASH_LEVEL_SHIFT_FACTOR)
_SEARCH_SCORE_TIE_EPSILON: float = 1e-9
_MIN_INSANE_TIME_BUDGET_SECONDS: float = 0.25
_DEFAULT_INSANE_TIME_BUDGET_SECONDS: float = 4.0
_INSANE_ITERATIVE_DEEPENING_MIN_DEPTH: int = 6
_INSANE_ITERATIVE_DEEPENING_MAX_DEPTH: int = 24


@dataclass(frozen=True)
class InsaneDepthSample:
  depth: int
  score: float
  solved: bool = False


@dataclass(frozen=True)
class InsaneMoveEvaluation:
  move_index: int
  score: float
  solved: bool = False
  depth_reached: int = 0


@dataclass(frozen=True)
class InsaneAnalysis:
  best_move_index: int | None = None
  score: float = 0.0
  solved: bool = False
  depth_reached: int = 0
  depth_samples: tuple[InsaneDepthSample, ...] = ()
  move_evaluations: tuple[InsaneMoveEvaluation, ...] = ()


@dataclass
class InsaneSearchCache:
  generation: int = -1
  hash_level: int = DEFAULT_OTHELLO_HASH_LEVEL
  sacrifice_level: int = DEFAULT_OTHELLO_SACRIFICE_LEVEL
  project_root_key: str = ""
  transposition: dict[tuple[int, int], TranspositionEntry] = field(default_factory=dict)
  exact_transposition: dict[tuple[int, int, int], int] = field(default_factory=dict)
  opening_book: OpeningBook = field(default_factory=lambda: _EMPTY_OPENING_BOOK)
  opening_book_project_root_key: str = ""
  exact_threshold: int = EXACT_SOLVE_EMPTY_SQUARE_THRESHOLD
  transposition_soft_limit: int = 1 << _DEFAULT_TRANSPOSITION_SOFT_LIMIT_SHIFT
  native_search: object | None = field(default=None, repr=False)

  def ensure_opening_book(self, project_root=None) -> None:
    raw_project_root = project_root
    if raw_project_root is None and not str(self.project_root_key).strip():
      raw_project_root = None
    elif raw_project_root is None:
      raw_project_root = str(self.project_root_key)
    normalized_project_root_key = str(normalize_project_root(raw_project_root))
    if normalized_project_root_key == str(self.opening_book_project_root_key):
      return
    self.opening_book = load_opening_book(normalized_project_root_key)
    self.opening_book_project_root_key = str(normalized_project_root_key)

  def prepare(self, generation: int, *, project_root=None, hash_level: int = DEFAULT_OTHELLO_HASH_LEVEL, sacrifice_level: int = DEFAULT_OTHELLO_SACRIFICE_LEVEL) -> None:
    normalized_generation = int(max(0, int(generation)))
    normalized_hash_level = normalize_hash_level(hash_level, default=DEFAULT_OTHELLO_HASH_LEVEL)
    normalized_sacrifice_level = normalize_sacrifice_level(sacrifice_level, default=DEFAULT_OTHELLO_SACRIFICE_LEVEL)
    normalized_project_root_key = str(normalize_project_root(project_root))
    changed = bool(normalized_generation != int(self.generation) or normalized_hash_level != int(self.hash_level) or normalized_sacrifice_level != int(self.sacrifice_level) or normalized_project_root_key != str(self.project_root_key))

    self.generation = int(normalized_generation)
    self.hash_level = int(normalized_hash_level)
    self.sacrifice_level = int(normalized_sacrifice_level)
    self.project_root_key = str(normalized_project_root_key)
    self.exact_threshold = EXACT_SOLVE_EMPTY_SQUARE_THRESHOLD
    self.transposition_soft_limit = _DISABLED_TRANSPOSITION_SOFT_LIMIT if int(self.hash_level) <= 0 else int(1 << min(_TRANSPOSITION_SOFT_LIMIT_MAX_SHIFT, _TRANSPOSITION_SOFT_LIMIT_BASE_SHIFT + int(self.hash_level) * _TRANSPOSITION_SOFT_LIMIT_HASH_LEVEL_SHIFT_FACTOR))
    self.ensure_opening_book(self.project_root_key)

    if bool(changed):
      self.transposition.clear()
      self.exact_transposition.clear()
      # The native session pins hash and sacrifice levels at construction,
      # so a settings change replaces it instead of clearing it.
      self.native_search = None

  def ensure_native_search(self):
    if self.native_search is None:
      self.native_search = create_native_insane_search(hash_level=int(self.hash_level), sacrifice_level=int(self.sacrifice_level))
    return self.native_search


def opening_book_moves(cache: InsaneSearchCache | None, board: tuple[int, ...] | list[int], side: int) -> tuple[int, ...]:
  active_cache = cache or InsaneSearchCache()
  active_cache.ensure_opening_book()
  materialized = coerce_board(board)
  normalized_side = normalize_side(side, default=SIDE_BLACK)
  if normalized_side not in (SIDE_BLACK, SIDE_WHITE):
    return ()
  return tuple(int(move) for move in active_cache.opening_book.moves_for(materialized, normalized_side))


def _choose_tied_best(move_evaluations: tuple[InsaneMoveEvaluation, ...], *, random_seed: int) -> int | None:
  if not move_evaluations:
    return None
  best_score = float(move_evaluations[0].score)
  tied = [int(evaluation.move_index) for evaluation in move_evaluations if abs(float(evaluation.score) - float(best_score)) <= _SEARCH_SCORE_TIE_EPSILON]
  if not tied:
    return int(move_evaluations[0].move_index)
  chooser = random.Random(int(random_seed))
  return int(chooser.choice(tuple(sorted(tied))))


def _fallback_root_evaluations(player_bits: int, opponent_bits: int, legal_moves: tuple[int, ...], *, sacrifice_level: int) -> tuple[InsaneMoveEvaluation, ...]:
  evaluations: list[InsaneMoveEvaluation] = []
  for move_index in ordered_moves(int(player_bits), int(opponent_bits), legal_moves, None):
    next_player, next_opponent = apply_move_bits(int(player_bits), int(opponent_bits), int(move_index))
    score = -evaluate_position(int(next_opponent), int(next_player), sacrifice_level=int(sacrifice_level))
    evaluations.append(InsaneMoveEvaluation(move_index=int(move_index), score=float(score), solved=False, depth_reached=1))
  return tuple(sorted(evaluations, key=lambda evaluation: (-float(evaluation.score), int(evaluation.move_index))))


def _remaining_budget_s(deadline_s: float | None) -> float | None:
  if deadline_s is None:
    return None
  return max(0.0, float(deadline_s) - time.perf_counter())


def _root_move_evaluations(cache: InsaneSearchCache, player_bits: int, opponent_bits: int, legal_moves: tuple[int, ...], *, depth: int, deadline_s: float | None, exact: bool) -> tuple[InsaneMoveEvaluation, ...]:
  evaluations: list[InsaneMoveEvaluation] = []
  native_search = cache.ensure_native_search()
  if native_search is not None:
    tt_best_move = native_search.root_best_move(int(player_bits), int(opponent_bits))
  else:
    tt_entry = cache.transposition.get((int(player_bits), int(opponent_bits))) if int(cache.hash_level) > 0 else None
    tt_best_move = None if tt_entry is None else tt_entry.best_move
  for move_index in ordered_moves(int(player_bits), int(opponent_bits), legal_moves, tt_best_move):
    check_deadline(deadline_s)
    next_player, next_opponent = apply_move_bits(int(player_bits), int(opponent_bits), int(move_index))
    if bool(exact):
      if native_search is not None:
        score = -native_search.solve_exact(int(next_opponent), int(next_player), LOSS_SCORE, WIN_SCORE, _remaining_budget_s(deadline_s), 0)
      else:
        score = -solve_exact(cache, int(next_opponent), int(next_player), LOSS_SCORE, WIN_SCORE, deadline_s, 0)
      solved = True
      reached_depth = max(1, int(depth))
    else:
      if native_search is not None:
        score = -native_search.negamax(int(next_opponent), int(next_player), int(depth) - 1, LOSS_SCORE, WIN_SCORE, _remaining_budget_s(deadline_s), 0)
      else:
        score = -negamax(cache, int(next_opponent), int(next_player), int(depth) - 1, LOSS_SCORE, WIN_SCORE, deadline_s, 0)
      solved = abs(int(score)) >= int(WIN_SCORE)
      reached_depth = max(1, int(depth))
    evaluations.append(InsaneMoveEvaluation(move_index=int(move_index), score=float(score), solved=bool(solved), depth_reached=int(reached_depth)))
  return tuple(sorted(evaluations, key=lambda evaluation: (-float(evaluation.score), int(evaluation.move_index))))


def analyze_insane_position(board: tuple[int, ...] | list[int], side: int, *, random_seed: int = 0, time_budget_s: float = _DEFAULT_INSANE_TIME_BUDGET_SECONDS, cache: InsaneSearchCache | None = None) -> InsaneAnalysis:
  materialized = coerce_board(board)
  normalized_side = normalize_side(side, default=SIDE_BLACK)
  if normalized_side not in (SIDE_BLACK, SIDE_WHITE):
    return InsaneAnalysis()

  black_bits, white_bits = bitboards_from_board(materialized)
  if normalized_side == SIDE_BLACK:
    player_bits = int(black_bits)
    opponent_bits = int(white_bits)
  else:
    player_bits = int(white_bits)
    opponent_bits = int(black_bits)

  legal_bb = legal_moves_bitboard(int(player_bits), int(opponent_bits))
  legal_moves = bitboard_to_moves(legal_bb)
  if not legal_moves:
    return InsaneAnalysis(best_move_index=None, score=0.0, solved=False, depth_reached=0, depth_samples=(), move_evaluations=())

  active_cache = cache or InsaneSearchCache()
  deadline = time.perf_counter() + max(_MIN_INSANE_TIME_BUDGET_SECONDS, float(time_budget_s))
  empties = BOARD_CELL_COUNT - bit_count(int(player_bits) | int(opponent_bits))

  if empties <= int(active_cache.exact_threshold):
    move_evaluations = _root_move_evaluations(active_cache, int(player_bits), int(opponent_bits), legal_moves, depth=max(1, int(empties)), deadline_s=deadline, exact=True)
    best_move_index = _choose_tied_best(move_evaluations, random_seed=int(random_seed))
    best_score = 0.0 if not move_evaluations else float(move_evaluations[0].score)
    depth_reached = max(1, int(empties))
    return InsaneAnalysis(best_move_index=best_move_index, score=float(best_score), solved=True, depth_reached=int(depth_reached), depth_samples=(InsaneDepthSample(depth=int(depth_reached), score=float(best_score), solved=True),), move_evaluations=move_evaluations)

  last_complete_evaluations: tuple[InsaneMoveEvaluation, ...] = ()
  depth_samples: list[InsaneDepthSample] = []
  max_depth = min(_INSANE_ITERATIVE_DEEPENING_MAX_DEPTH, max(_INSANE_ITERATIVE_DEEPENING_MIN_DEPTH, empties))

  for depth in range(1, max_depth + 1):
    try:
      move_evaluations = _root_move_evaluations(active_cache, int(player_bits), int(opponent_bits), legal_moves, depth=int(depth), deadline_s=deadline, exact=False)
    except TimeoutError:
      break
    last_complete_evaluations = move_evaluations
    best_score = 0.0 if not move_evaluations else float(move_evaluations[0].score)
    solved = bool(move_evaluations and move_evaluations[0].solved)
    depth_samples.append(InsaneDepthSample(depth=int(depth), score=float(best_score), solved=bool(solved)))
    if bool(solved):
      break

  if not last_complete_evaluations:
    last_complete_evaluations = _fallback_root_evaluations(int(player_bits), int(opponent_bits), legal_moves, sacrifice_level=int(active_cache.sacrifice_level))
    depth_samples.append(InsaneDepthSample(depth=1, score=float(last_complete_evaluations[0].score if last_complete_evaluations else 0.0), solved=False))

  best_move_index = _choose_tied_best(last_complete_evaluations, random_seed=int(random_seed))
  best_score = 0.0 if not last_complete_evaluations else float(last_complete_evaluations[0].score)
  solved = bool(last_complete_evaluations and last_complete_evaluations[0].solved)
  depth_reached = max((int(sample.depth) for sample in depth_samples), default=0)
  return InsaneAnalysis(best_move_index=best_move_index, score=float(best_score), solved=bool(solved), depth_reached=int(depth_reached), depth_samples=tuple(depth_samples), move_evaluations=tuple(last_complete_evaluations))


def choose_insane_move(board: tuple[int, ...] | list[int], side: int, *, random_seed: int = 0, time_budget_s: float = _DEFAULT_INSANE_TIME_BUDGET_SECONDS, cache: InsaneSearchCache | None = None, use_opening_book: bool = False) -> int | None:
  materialized = coerce_board(board)
  normalized_side = normalize_side(side, default=SIDE_BLACK)
  if normalized_side not in (SIDE_BLACK, SIDE_WHITE):
    return None

  black_bits, white_bits = bitboards_from_board(materialized)
  if normalized_side == SIDE_BLACK:
    player_bits = int(black_bits)
    opponent_bits = int(white_bits)
  else:
    player_bits = int(white_bits)
    opponent_bits = int(black_bits)

  legal_bb = legal_moves_bitboard(int(player_bits), int(opponent_bits))
  legal_moves = bitboard_to_moves(legal_bb)
  if not legal_moves:
    return None

  active_cache = cache or InsaneSearchCache()
  legal_moves_set = set(legal_moves)
  book_moves = tuple(move for move in opening_book_moves(active_cache, materialized, normalized_side) if move in legal_moves_set)
  if bool(use_opening_book) and book_moves:
    chooser = random.Random(int(random_seed))
    return int(chooser.choice(tuple(sorted(int(move) for move in book_moves))))

  analysis = analyze_insane_position(materialized, normalized_side, random_seed=int(random_seed), time_budget_s=float(time_budget_s), cache=active_cache)
  return None if analysis.best_move_index is None else int(analysis.best_move_index)
