# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Callable

from ludoxel.simulation.spaces.othello.books.opening import canonical_position_key, load_opening_book_lines, save_opening_book_lines
from ludoxel.simulation.spaces.othello.engines.insane import InsaneSearchCache, analyze_insane_position
from ludoxel.simulation.spaces.othello.game.rules import apply_move, create_initial_board, find_legal_moves, other_side
from ludoxel.simulation.spaces.othello.game.state import (
  DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR,
  DEFAULT_OTHELLO_BOOK_LEAF_ERROR,
  DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR,
  DEFAULT_OTHELLO_HASH_LEVEL,
  DEFAULT_OTHELLO_SACRIFICE_LEVEL,
  SIDE_BLACK,
  normalize_book_error,
  normalize_book_learning_depth,
  normalize_hash_level,
  normalize_sacrifice_level,
)

_FLUSH_INTERVAL_S: float = 0.75
_FLUSH_POSITION_STEP: int = 12


@dataclass(frozen=True)
class BookLearningResult:
  """
  一回の opening-book 学習実行の終端 summary である。
  requested depth、追加 line 数、総 line 数、探索 position 数を保持し、UI と persistence はこの量だけで実行コストと成果を表示できる。
  """

  requested_depth: int
  added_lines: int
  total_lines: int
  explored_positions: int


class BookLearningCancelled(RuntimeError):
  """
  学習 recursion 内で cooperative cancellation が検出された場合に送出する sentinel 例外である。
  通常の実行失敗と分けることで、途中成果の flush 経路を保つ。
  """

  pass


class _LearningProgressReporter:
  """
  学習中の progress payload を rate limit 付きで送出する emitter である。
  payload は board、side、line、legal moves、explored positions、remaining depth、requested depth を含み、
  UI 同期が探索コストを支配しないよう 0.12 秒以上の間隔を設ける。
  """

  def __init__(self, *, sink: Callable[[dict[str, object]], None] | None, requested_depth: int) -> None:
    """
    progress sink と requested root depth を保持し、後続 emit が自己記述的な payload を構成できるようにする。
    emission rate 自体が学習処理の契約に含まれるため、直近送出時刻も状態として持つ。
    """
    self._sink = sink
    self._requested_depth = int(requested_depth)
    self._last_emit_s = 0.0

  def emit(self, *, board: tuple[int, ...], side: int, line: tuple[int, ...], legal_moves: tuple[int, ...], explored_positions: int, remaining_depth: int, force: bool = False) -> None:
    """
    `force` が真の場合又は直近送出から 0.12 秒以上経過した場合だけ progress payload を送出する。
    現在の line と board の観測可能性を保ちながら、UI 同期の過剰な介入を抑える。
    """
    if self._sink is None:
      return
    now = time.perf_counter()
    if (not bool(force)) and (float(now) - float(self._last_emit_s)) < 0.12:
      return
    self._last_emit_s = float(now)
    payload = {
      "board": tuple(int(value) for value in tuple(board)),
      "side_to_move": int(side),
      "line": tuple(int(move) for move in tuple(line)),
      "legal_moves": tuple(int(move) for move in tuple(legal_moves)),
      "explored_positions": int(explored_positions),
      "remaining_depth": int(remaining_depth),
      "requested_depth": int(self._requested_depth),
    }
    self._sink(payload)


class _LearningCommitter:
  """
  学習済み line 集合を段階的に永続化する gate である。
  強制 flush、十分な件数増加、一定時間の経過のいずれかが成立した場合だけ書き込み、
  recursive leaf ごとの同期書き込みで探索時間が歪むことを避ける。
  """

  def __init__(self, *, project_root=None, learned_lines: set[tuple[int, ...]]) -> None:
    """
    mutable な learned-line set と project root を結び付け、flush が正しい user-book store へ向かうようにする。
    直近 flush 時刻と件数は、書き込み間隔を決定するために保持する。
    """
    self._project_root = project_root
    self._learned_lines = learned_lines
    self._last_flush_s = 0.0
    self._last_flushed_count = len(learned_lines)

  def flush(self, *, force: bool = False) -> tuple[tuple[int, ...], ...] | None:
    """
    throttling 条件が成立したときだけ learned-line set を永続化し、成立しない場合は `None` を返す。
    条件は強制 flush、12 本以上の増加、又は増加を伴う 0.75 秒以上の経過である。
    """
    current_count = len(self._learned_lines)
    now = time.perf_counter()
    if not bool(force):
      if current_count == int(self._last_flushed_count):
        return None
      if (current_count - int(self._last_flushed_count)) < int(_FLUSH_POSITION_STEP) and (float(now) - float(self._last_flush_s)) < float(_FLUSH_INTERVAL_S):
        return None
    saved_lines = save_opening_book_lines(sorted(self._learned_lines), project_root=self._project_root)
    self._last_flush_s = float(now)
    self._last_flushed_count = current_count
    return saved_lines


def _analysis_time_budget_s(*, requested_depth: int, ply_index: int, hash_level: int) -> float:
  """
  学習局面ごとの local evaluation budget を `min(2.0, 0.30 + 0.05 max(1, D - p) + 0.04 max(0, h))` として求める。
  要求 depth の深部と hash allocation の増加には時間を与えつつ、局所探索の上限を 2 秒に固定する。
  """
  remaining = max(1, int(requested_depth) - int(ply_index))
  return float(min(2.0, 0.30 + 0.05 * float(remaining) + 0.04 * float(max(0, int(hash_level)))))


def _next_side_to_move(board: tuple[int, ...], side: int) -> int | None:
  """
  Othello の pass rule に従い、次に手番を持つ side を返す。
  相手に合法手があれば相手、相手に無く自分にだけ合法手があれば自分を返し、双方が打てない終局でだけ `None` となる。
  """
  next_side = other_side(int(side))
  if find_legal_moves(board, int(next_side)):
    return int(next_side)
  if find_legal_moves(board, int(side)):
    return int(side)
  return None


def _ensure_not_cancelled(cancel_check: Callable[[], bool] | None) -> None:
  """
  cancel predicate を評価する cooperative cancellation barrier である。
  真になった時点で `BookLearningCancelled` を送出し、recursive exploration を途中成果 flush へ巻き戻す。
  """
  if cancel_check is not None and bool(cancel_check()):
    raise BookLearningCancelled("Opening book learning was cancelled.")


def _should_skip_position(*, board: tuple[int, ...], side: int, remaining_depth: int, cumulative_error: float, visited_costs: dict[tuple[str, int], float]) -> bool:
  """
  canonical position-depth key に記録された最良累積誤差と現在の誤差を比較し、同一対称局面を劣った bound で再探索する枝を剪定する。
  累積誤差が厳密に改善しない探索は、新しい許容 line を追加しない。
  """
  canonical_key, _transform_id = canonical_position_key(board, int(side))
  visit_key = (str(canonical_key), int(remaining_depth))
  best_error = visited_costs.get(visit_key)
  if best_error is not None and float(best_error) <= float(cumulative_error) + 1e-9:
    return True
  visited_costs[visit_key] = float(cumulative_error)
  return False


def _learn_from_position(
  *,
  board: tuple[int, ...],
  side: int,
  remaining_depth: int,
  cumulative_error: float,
  line: tuple[int, ...],
  per_move_error: float,
  cumulative_error_limit: float,
  leaf_error: float,
  cache: InsaneSearchCache,
  requested_depth: int,
  explored_counter: list[int],
  learned_lines: set[tuple[int, ...]],
  progress: _LearningProgressReporter,
  cancel_check: Callable[[], bool] | None,
  visited_costs: dict[tuple[str, int], float],
  committer: _LearningCommitter,
) -> None:
  """
  局面から opening line を閾値付きで再帰展開する。
  候補手 `m` ごとの局所誤差 `delta_m` と累積誤差 `e + delta_m` が指定上限内にある場合だけ再帰し、
  終端又は depth 到達時は leaf 閾値又は principal move 条件により line を採用する。
  """
  _ensure_not_cancelled(cancel_check)
  if _should_skip_position(board=board, side=int(side), remaining_depth=int(remaining_depth), cumulative_error=float(cumulative_error), visited_costs=visited_costs):
    return

  legal_moves = tuple(int(move) for move in find_legal_moves(board, int(side)))
  progress.emit(board=tuple(board), side=int(side), line=tuple(line), legal_moves=tuple(legal_moves), explored_positions=int(explored_counter[0]), remaining_depth=int(remaining_depth))
  if not legal_moves:
    if line:
      learned_lines.add(tuple(line))
      committer.flush()
    return

  analysis = analyze_insane_position(
    board,
    int(side),
    random_seed=0,
    time_budget_s=_analysis_time_budget_s(requested_depth=int(requested_depth), ply_index=max(0, int(requested_depth) - int(remaining_depth)), hash_level=int(cache.hash_level)),
    cache=cache,
  )
  explored_counter[0] = int(explored_counter[0]) + 1
  progress.emit(board=tuple(board), side=int(side), line=tuple(line), legal_moves=tuple(legal_moves), explored_positions=int(explored_counter[0]), remaining_depth=int(remaining_depth))
  evaluations = tuple(analysis.move_evaluations)
  if not evaluations:
    learned_lines.add(tuple([*line, int(legal_moves[0])]))
    committer.flush()
    return

  best_evaluation = evaluations[0]
  best_score = float(best_evaluation.score)

  candidates = []
  for evaluation in evaluations:
    move_error = max(0.0, float(best_score) - float(evaluation.score))
    next_cumulative_error = float(cumulative_error) + float(move_error)
    if float(move_error) > float(per_move_error):
      continue
    if float(next_cumulative_error) > float(cumulative_error_limit):
      continue
    candidates.append((evaluation, float(move_error), float(next_cumulative_error)))

  if not candidates:
    candidates.append((best_evaluation, 0.0, float(cumulative_error)))

  for evaluation, move_error, next_cumulative_error in candidates:
    _ensure_not_cancelled(cancel_check)
    next_line = tuple([*line, int(evaluation.move_index)])
    next_board, _flipped = apply_move(board, side=int(side), index=int(evaluation.move_index))
    next_side = _next_side_to_move(next_board, int(side))

    if int(remaining_depth) <= 1 or next_side is None:
      if float(move_error) <= float(leaf_error) or int(evaluation.move_index) == int(best_evaluation.move_index):
        learned_lines.add(tuple(next_line))
        committer.flush()
      continue

    _learn_from_position(
      board=next_board,
      side=int(next_side),
      remaining_depth=int(remaining_depth) - 1,
      cumulative_error=float(next_cumulative_error),
      line=tuple(next_line),
      per_move_error=float(per_move_error),
      cumulative_error_limit=float(cumulative_error_limit),
      leaf_error=float(leaf_error),
      cache=cache,
      requested_depth=int(requested_depth),
      explored_counter=explored_counter,
      learned_lines=learned_lines,
      progress=progress,
      cancel_check=cancel_check,
      visited_costs=visited_costs,
      committer=committer,
    )


def learn_opening_book(
  *,
  depth: int,
  per_move_error: float,
  cumulative_error: float,
  leaf_error: float,
  project_root=None,
  hash_level: int = DEFAULT_OTHELLO_HASH_LEVEL,
  sacrifice_level: int = DEFAULT_OTHELLO_SACRIFICE_LEVEL,
  progress_sink: Callable[[dict[str, object]], None] | None = None,
  cancel_check: Callable[[], bool] | None = None,
) -> BookLearningResult:
  """
  公開学習 operator である。
  永続化された effective book から開始集合を作り、初期盤面から局所誤差、累積誤差、leaf 誤差の条件に従って探索し、
  再帰中に途中成果を flush して、最終 book と開始 book の cardinality 差を返す。
  """
  normalized_depth = normalize_book_learning_depth(depth)
  normalized_per_move_error = normalize_book_error(per_move_error, default=float(DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR))
  normalized_cumulative_error = normalize_book_error(cumulative_error, default=float(DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR))
  normalized_leaf_error = normalize_book_error(leaf_error, default=float(DEFAULT_OTHELLO_BOOK_LEAF_ERROR))
  normalized_hash_level = normalize_hash_level(hash_level, default=DEFAULT_OTHELLO_HASH_LEVEL)
  normalized_sacrifice_level = normalize_sacrifice_level(sacrifice_level, default=DEFAULT_OTHELLO_SACRIFICE_LEVEL)
  progress = _LearningProgressReporter(sink=progress_sink, requested_depth=int(normalized_depth))

  cache = InsaneSearchCache()
  cache.prepare(0, project_root=project_root, hash_level=int(normalized_hash_level), sacrifice_level=int(normalized_sacrifice_level))

  explored_counter = [0]
  learned_lines = set(load_opening_book_lines(project_root=project_root))
  base_count = len(learned_lines)
  committer = _LearningCommitter(project_root=project_root, learned_lines=learned_lines)
  visited_costs: dict[tuple[str, int], float] = {}
  _ensure_not_cancelled(cancel_check)

  initial_board = create_initial_board()
  progress.emit(
    board=tuple(initial_board),
    side=int(SIDE_BLACK),
    line=(),
    legal_moves=tuple(int(move) for move in find_legal_moves(initial_board, int(SIDE_BLACK))),
    explored_positions=0,
    remaining_depth=int(normalized_depth),
    force=True,
  )

  try:
    _learn_from_position(
      board=initial_board,
      side=SIDE_BLACK,
      remaining_depth=int(normalized_depth),
      cumulative_error=0.0,
      line=(),
      per_move_error=float(normalized_per_move_error),
      cumulative_error_limit=float(normalized_cumulative_error),
      leaf_error=float(normalized_leaf_error),
      cache=cache,
      requested_depth=int(normalized_depth),
      explored_counter=explored_counter,
      learned_lines=learned_lines,
      progress=progress,
      cancel_check=cancel_check,
      visited_costs=visited_costs,
      committer=committer,
    )
    _ensure_not_cancelled(cancel_check)
  except BookLearningCancelled:
    committer.flush(force=True)
    raise

  saved_lines = committer.flush(force=True)
  if saved_lines is None:
    saved_lines = load_opening_book_lines(project_root=project_root)
  return BookLearningResult(requested_depth=int(normalized_depth), added_lines=max(0, len(saved_lines) - int(base_count)), total_lines=len(saved_lines), explored_positions=int(explored_counter[0]))
