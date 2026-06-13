# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.rules.collision.support import _iter_intersections, world_aabb_intersects
from ludoxel.simulation.worlds.config.collision import CollisionParams
from ludoxel.simulation.worlds.state.world import WorldState


@dataclass(frozen=True)
class _HorizontalMoveResult:
  pos: Vec3
  hit_ground: bool
  stepped_up: bool
  step_up_dy: float


def _resolve_downward_snap(
  player: PlayerEntity, world: WorldState, pos: Vec3, drop: float, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None
) -> tuple[Vec3, bool]:
  eps = float(params.eps)
  dy = -float(max(0.0, drop))
  if dy >= 0.0:
    return pos, False

  pos_y = Vec3(pos.x, pos.y + dy, pos.z)
  aabb = player.aabb_at(pos_y)
  best_support_y: float | None = None
  for _bx, _by, _bz, ba in _iter_intersections(world, aabb, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    top_y = float(ba.mx.y)
    if best_support_y is None or top_y > float(best_support_y):
      best_support_y = float(top_y)

  if best_support_y is None:
    return pos, False

  return Vec3(pos_y.x, float(best_support_y) + eps, pos_y.z), True


def _try_step_up_height(
  player: PlayerEntity,
  world: WorldState,
  pos: Vec3,
  dx: float,
  dz: float,
  height: float,
  params: CollisionParams,
  *,
  block_registry: BlockRegistry,
  collision_exempt_cell: tuple[int, int, int] | None = None,
) -> Vec3 | None:
  sh = float(max(0.0, height))
  if sh <= 1e-6:
    return None

  up = Vec3(pos.x, pos.y + sh, pos.z)
  if world_aabb_intersects(world, player.aabb_at(up), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    return None

  moved = Vec3(up.x + float(dx), up.y, up.z + float(dz))
  if world_aabb_intersects(world, player.aabb_at(moved), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    return None

  landed, hit_ground = _resolve_downward_snap(player, world, moved, sh, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)
  if not bool(hit_ground):
    return None

  return landed


def _axis_collision_position(
  player: PlayerEntity, world: WorldState, pos_try: Vec3, *, axis: str, delta: float, params: CollisionParams, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None
) -> Vec3:
  eps = float(params.eps)
  pos_axis = pos_try
  aabb = player.aabb_at(pos_axis)

  for _bx, _by, _bz, ba in _iter_intersections(world, aabb, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    if str(axis) == "x":
      if float(delta) > 0.0:
        pos_axis = Vec3(ba.mn.x - (player.width * 0.5) - eps, pos_axis.y, pos_axis.z)
      else:
        pos_axis = Vec3(ba.mx.x + (player.width * 0.5) + eps, pos_axis.y, pos_axis.z)
      player.velocity = Vec3(0.0, player.velocity.y, player.velocity.z)
    else:
      if float(delta) > 0.0:
        pos_axis = Vec3(pos_axis.x, pos_axis.y, ba.mn.z - (player.width * 0.5) - eps)
      else:
        pos_axis = Vec3(pos_axis.x, pos_axis.y, ba.mx.z + (player.width * 0.5) + eps)
      player.velocity = Vec3(player.velocity.x, player.velocity.y, 0.0)

    aabb = player.aabb_at(pos_axis)

  return pos_axis


def _resolve_horizontal_axis_move(
  player: PlayerEntity,
  world: WorldState,
  pos: Vec3,
  *,
  axis: str,
  delta: float,
  allow_step: bool,
  params: CollisionParams,
  block_registry: BlockRegistry,
  collision_exempt_cell: tuple[int, int, int] | None = None,
) -> _HorizontalMoveResult:
  if str(axis) == "x":
    pos_try = Vec3(pos.x + float(delta), pos.y, pos.z)
    step_dx = float(delta)
    step_dz = 0.0
  else:
    pos_try = Vec3(pos.x, pos.y, pos.z + float(delta))
    step_dx = 0.0
    step_dz = float(delta)

  if allow_step and world_aabb_intersects(world, player.aabb_at(pos_try), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    stepped = _try_step_up_height(player, world, pos, float(step_dx), float(step_dz), float(params.step_height), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)
    if stepped is not None:
      return _HorizontalMoveResult(pos=stepped, hit_ground=True, stepped_up=True, step_up_dy=float(stepped.y - pos.y))

  pos_axis = _axis_collision_position(player, world, pos_try, axis=str(axis), delta=float(delta), params=params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)
  return _HorizontalMoveResult(pos=pos_axis, hit_ground=False, stepped_up=False, step_up_dy=0.0)
