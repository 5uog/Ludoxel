# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.rules.collision.support import _iter_intersections
from ludoxel.simulation.worlds.config.collision import CollisionParams
from ludoxel.simulation.worlds.state.world import WorldState


def _depenetrate(
  player: PlayerEntity, world: WorldState, pos: Vec3, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None
) -> tuple[Vec3, Vec3]:
  eps = float(params.eps)
  current = Vec3(float(pos.x), float(pos.y), float(pos.z))
  total_shift = Vec3(0.0, 0.0, 0.0)

  for _ in range(16):
    aabb = player.aabb_at(current)
    best_shift: Vec3 | None = None
    best_abs = float("inf")

    for _bx, _by, _bz, block_aabb in _iter_intersections(world, aabb, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
      shift_candidates = (
        Vec3(float(block_aabb.mn.x) - float(aabb.mx.x) - eps, 0.0, 0.0),
        Vec3(float(block_aabb.mx.x) - float(aabb.mn.x) + eps, 0.0, 0.0),
        Vec3(0.0, float(block_aabb.mn.y) - float(aabb.mx.y) - eps, 0.0),
        Vec3(0.0, float(block_aabb.mx.y) - float(aabb.mn.y) + eps, 0.0),
        Vec3(0.0, 0.0, float(block_aabb.mn.z) - float(aabb.mx.z) - eps),
        Vec3(0.0, 0.0, float(block_aabb.mx.z) - float(aabb.mn.z) + eps),
      )
      for shift in shift_candidates:
        magnitude = abs(float(shift.x)) + abs(float(shift.y)) + abs(float(shift.z))
        if magnitude < float(best_abs):
          best_abs = float(magnitude)
          best_shift = shift

    if best_shift is None:
      break

    current = Vec3(float(current.x) + float(best_shift.x), float(current.y) + float(best_shift.y), float(current.z) + float(best_shift.z))
    total_shift = Vec3(float(total_shift.x) + float(best_shift.x), float(total_shift.y) + float(best_shift.y), float(total_shift.z) + float(best_shift.z))

  return (current, total_shift)
