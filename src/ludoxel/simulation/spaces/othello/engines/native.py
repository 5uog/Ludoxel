# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

try:
  from ludoxel.simulation.spaces.othello.engines import _othello_native as _native_module  # type: ignore[attr-defined]
except ImportError:
  _native_module = None


def native_othello_available() -> bool:
  return _native_module is not None


def native_othello_module_file() -> str | None:
  if _native_module is None:
    return None
  return str(getattr(_native_module, "__file__", "")) or None


def native_othello_status() -> str:
  if _native_module is None:
    return "fallback:python"
  return f"native:rust:{native_othello_module_file()}"


def create_native_insane_search(*, hash_level: int, sacrifice_level: int):
  if _native_module is None:
    return None
  return _native_module.InsaneSearch(int(hash_level), int(sacrifice_level))


def native_classic_root_scores(player_bits: int, opponent_bits: int, *, depth: int, sacrifice_level: int, budget_s: float | None) -> tuple[tuple[int, float], ...] | None:
  if _native_module is None:
    return None
  scores = _native_module.classic_root_scores(int(player_bits), int(opponent_bits), int(depth), int(sacrifice_level), None if budget_s is None else float(budget_s))
  return tuple((int(move_index), float(score)) for move_index, score in scores)
