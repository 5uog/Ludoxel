# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.actors.ai_players.runtime import _AI_STUCK_AVOID_CELL_S, _AiPlayerRuntime


def active_avoid_support_cells(actor: _AiPlayerRuntime) -> tuple[tuple[int, int, int], ...]:
  return tuple(tuple(int(value) for value in cell) for cell, ttl in actor.nav_avoid_support_cells.items() if float(ttl) > 1e-6)


def remember_avoid_support_cell(actor: _AiPlayerRuntime, cell: tuple[int, int, int] | None, *, cooldown_s: float | None = None) -> None:
  if cell is None:
    return
  normalized = tuple(int(value) for value in cell)
  base_cooldown = float(_AI_STUCK_AVOID_CELL_S if cooldown_s is None else cooldown_s)
  retry_bonus = min(1.2, float(max(0, int(actor.nav_failure_retry_count))) * 0.20)
  next_ttl = max(0.0, float(base_cooldown) + float(retry_bonus))
  actor.nav_avoid_support_cells[normalized] = max(float(actor.nav_avoid_support_cells.get(normalized, 0.0)), float(next_ttl))
  while len(actor.nav_avoid_support_cells) > 12:
    actor.nav_avoid_support_cells.pop(next(iter(actor.nav_avoid_support_cells)), None)


def decay_avoid_support_cells(actor: _AiPlayerRuntime, *, dt: float) -> None:
  expired = [cell for cell, ttl in actor.nav_avoid_support_cells.items() if float(ttl) - max(0.0, float(dt)) <= 1e-6]
  for cell in tuple(expired):
    actor.nav_avoid_support_cells.pop(tuple(int(value) for value in cell), None)
  for cell in tuple(actor.nav_avoid_support_cells.keys()):
    actor.nav_avoid_support_cells[tuple(int(value) for value in cell)] = max(0.0, float(actor.nav_avoid_support_cells[cell]) - max(0.0, float(dt)))
