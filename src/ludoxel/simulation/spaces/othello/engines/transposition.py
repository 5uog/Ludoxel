# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

BOUND_EXACT = 0
BOUND_LOWER = 1
BOUND_UPPER = -1


@dataclass(frozen=True)
class TranspositionEntry:
  depth: int
  score: int
  bound: int
  best_move: int | None


def store_transposition(cache, key: tuple[int, int], entry: TranspositionEntry) -> None:
  if int(cache.hash_level) <= 0 or int(cache.transposition_soft_limit) <= 0:
    return
  if len(cache.transposition) >= int(cache.transposition_soft_limit):
    cache.transposition.clear()
  cache.transposition[key] = entry


def store_exact_transposition(cache, key: tuple[int, int, int], score: int) -> None:
  if int(cache.hash_level) <= 1 or int(cache.transposition_soft_limit) <= 0:
    return
  if len(cache.exact_transposition) >= int(cache.transposition_soft_limit):
    cache.exact_transposition.clear()
  cache.exact_transposition[key] = int(score)
