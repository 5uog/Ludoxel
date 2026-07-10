# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.geometry.native import ray_aabb_face
from ludoxel.foundations.mathematics.geometry.ray import Ray
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.rules.picking.block import BlockPick

MELEE_ATTACK_REACH_BLOCKS = 3.0


@dataclass(frozen=True)
class PlayerTargetHit:
  actor_id: str
  distance: float
  point: Vec3


def pick_player_target(*, origin: Vec3, direction: Vec3, reach: float, block_hit: BlockPick | None, candidates: tuple[tuple[str, PlayerEntity], ...]) -> PlayerTargetHit | None:
  ray_direction = direction.normalized()
  if float(ray_direction.length()) <= 1e-6:
    return None
  ray = Ray(origin=origin, direction=ray_direction)
  limit = float(reach)
  if block_hit is not None:
    limit = min(float(limit), float(block_hit.t))

  best_hit: PlayerTargetHit | None = None
  for actor_id, player in candidates:
    if not bool(player.alive()):
      continue
    hit = ray_aabb_face(ray, player.aabb_at(player.position))
    if hit is None:
      continue
    distance = float(hit.t_enter)
    if float(distance) < 0.0 or float(distance) > float(limit):
      continue
    if best_hit is None or float(distance) < float(best_hit.distance):
      best_hit = PlayerTargetHit(actor_id=str(actor_id), distance=float(distance), point=Vec3(float(hit.point.x), float(hit.point.y), float(hit.point.z)))
  return best_hit
