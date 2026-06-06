# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.runtime import _AiPlayerRuntime


def route_target_point(actor: _AiPlayerRuntime) -> Vec3 | None:
  if len(actor.route_points) <= 0:
    return None
  index = int(actor.route_target_index) % len(actor.route_points)
  route_point = actor.route_points[index]
  return route_point.as_vec3()


def advance_route_target(actor: _AiPlayerRuntime) -> None:
  point_count = len(actor.route_points)
  if point_count <= 0:
    actor.route_target_index = 0
    return
  if bool(actor.route_closed):
    actor.route_target_index = (int(actor.route_target_index) + 1) % int(point_count)
    return
  if int(actor.route_target_index) >= int(point_count) - 1:
    actor.route_target_index = 0
    return
  actor.route_target_index = int(actor.route_target_index) + 1
