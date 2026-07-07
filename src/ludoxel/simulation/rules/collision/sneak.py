# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.rules.collision.stepping import _resolve_downward_snap
from ludoxel.simulation.rules.collision.support import _has_support_at
from ludoxel.simulation.worlds.config.collision import CollisionParams
from ludoxel.simulation.worlds.state.world import WorldState


def _backoff(delta: float, step: float) -> float:
  if abs(delta) <= step:
    return 0.0
  s = 1.0 if delta > 0.0 else -1.0
  v = delta - s * step
  if s > 0.0:
    return max(0.0, v)
  return min(0.0, v)


def _has_support_within_drop(player: PlayerEntity, world: WorldState, pos: Vec3, max_drop: float, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None) -> bool:
  _p, hit = _resolve_downward_snap(player, world, pos, float(max_drop), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)
  return bool(hit)


def _has_sneak_support(player: PlayerEntity, world: WorldState, pos: Vec3, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None) -> bool:
  if _has_support_at(player, world, pos, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    return True
  return _has_support_within_drop(player, world, pos, float(params.step_height), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)


def _apply_sneak_edge_clamp(player: PlayerEntity, world: WorldState, pos: Vec3, delta: Vec3, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None) -> Vec3:
  step = float(params.sneak_step)
  dx = float(delta.x)
  dz = float(delta.z)

  for _ in range(128):
    if dx == 0.0:
      break
    cand = Vec3(pos.x + dx, pos.y, pos.z)
    if _has_sneak_support(player, world, cand, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
      break
    dx = _backoff(dx, step)

  for _ in range(128):
    if dz == 0.0:
      break
    cand = Vec3(pos.x + dx, pos.y, pos.z + dz)
    if _has_sneak_support(player, world, cand, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
      break
    dz = _backoff(dz, step)

  for _ in range(256):
    if dx == 0.0 or dz == 0.0:
      break
    cand = Vec3(pos.x + dx, pos.y, pos.z + dz)
    if _has_sneak_support(player, world, cand, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
      break

    if abs(dx) >= abs(dz):
      dx = _backoff(dx, step)
    else:
      dz = _backoff(dz, step)

  return Vec3(dx, delta.y, dz)
