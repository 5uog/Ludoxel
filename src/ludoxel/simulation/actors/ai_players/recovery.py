# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.navigation import _support_cell_center


def fallback_route_target(current_support: tuple[int, int, int], local_recovery_target: Vec3 | None) -> Vec3:
  if local_recovery_target is not None:
    return local_recovery_target
  return _support_cell_center(tuple(int(value) for value in current_support))
