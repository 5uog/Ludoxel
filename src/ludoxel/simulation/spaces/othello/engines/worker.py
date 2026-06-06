# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.spaces.othello.books.learning import BookLearningResult, learn_opening_book
from ludoxel.simulation.spaces.othello.engines.classic import InsaneSearchCache, analyze_position, choose_ai_move

_PROCESS_CACHE: InsaneSearchCache | None = None
_FALLBACK_CACHE: InsaneSearchCache | None = None
_ANALYSIS_STRONG_BUDGET_S = 0.28
_ANALYSIS_INSANE_BUDGET_S = 0.45
_SEARCH_EXECUTOR_WORKERS = 1
_BOOK_EXECUTOR_WORKERS = 1


def _process_cache() -> InsaneSearchCache:
  global _PROCESS_CACHE
  if _PROCESS_CACHE is None:
    _PROCESS_CACHE = InsaneSearchCache()
  return _PROCESS_CACHE


def _fallback_cache() -> InsaneSearchCache:
  global _FALLBACK_CACHE
  if _FALLBACK_CACHE is None:
    _FALLBACK_CACHE = InsaneSearchCache()
  return _FALLBACK_CACHE


def _compute_ai_move(board: tuple[int, ...], side: int, difficulty: str, seed: int, generation: int, project_root: str, sacrifice_level: int, hash_level: int) -> int | None:
  return choose_ai_move(
    board,
    side,
    difficulty,
    random_seed=int(seed),
    project_root=str(project_root),
    match_generation=int(generation),
    insane_cache=_process_cache(),
    sacrifice_level=int(sacrifice_level),
    hash_level=int(hash_level),
  )


def _compute_analysis(board: tuple[int, ...], side: int, difficulty: str, seed: int, generation: int, project_root: str, sacrifice_level: int, hash_level: int):
  return analyze_position(
    board,
    side,
    difficulty,
    random_seed=int(seed),
    project_root=str(project_root),
    strong_time_budget_s=float(_ANALYSIS_STRONG_BUDGET_S),
    insane_time_budget_s=float(_ANALYSIS_INSANE_BUDGET_S),
    match_generation=int(generation),
    insane_cache=_process_cache(),
    sacrifice_level=int(sacrifice_level),
    hash_level=int(hash_level),
  )


def _push_book_learning_progress(progress_queue, payload: dict[str, object]) -> None:
  if progress_queue is None:
    return
  try:
    progress_queue.put(dict(payload))
  except Exception:
    pass


def _compute_book_learning(
  depth: int, per_move_error: float, cumulative_error: float, leaf_error: float, project_root: str, hash_level: int, sacrifice_level: int, progress_queue, cancel_event, storage_initializer=None
) -> BookLearningResult:
  if callable(storage_initializer):
    storage_initializer()

  def progress_sink(payload: dict[str, object]) -> None:
    _push_book_learning_progress(progress_queue, payload)

  def cancel_check() -> bool:
    if cancel_event is None:
      return False
    try:
      return bool(cancel_event.is_set())
    except Exception:
      return False

  return learn_opening_book(
    depth=int(depth),
    per_move_error=float(per_move_error),
    cumulative_error=float(cumulative_error),
    leaf_error=float(leaf_error),
    project_root=str(project_root),
    hash_level=int(hash_level),
    sacrifice_level=int(sacrifice_level),
    progress_sink=progress_sink,
    cancel_check=cancel_check,
  )
