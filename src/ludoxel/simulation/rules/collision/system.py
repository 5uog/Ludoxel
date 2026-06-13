# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.models.api import collision_aabbs_for_block
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.blocks.states.values import prop_as_bool
from ludoxel.simulation.blocks.states.view import def_from_state, world_state_at
from ludoxel.simulation.blocks.structures.structural_rules import is_fence_gate
from ludoxel.simulation.rules.collision.depenetration import _depenetrate
from ludoxel.simulation.rules.collision.sneak import _apply_sneak_edge_clamp
from ludoxel.simulation.rules.collision.stepping import _resolve_downward_snap, _resolve_horizontal_axis_move, _try_step_up_height
from ludoxel.simulation.rules.collision.support import SupportBlockContact, _ground_probe, _iter_intersections, support_block_beneath, world_aabb_intersects
from ludoxel.simulation.rules.gravity.system import GRAVITY_AFFECTED_TAG
from ludoxel.simulation.worlds.config.collision import DEFAULT_COLLISION_PARAMS, CollisionParams
from ludoxel.simulation.worlds.state.world import WorldState

__all__ = ("CollisionReport", "SupportBlockContact", "can_auto_jump_one_block", "integrate_with_collisions", "support_block_beneath")


@dataclass(frozen=True)
class CollisionReport:
  supported_before: bool
  supported_after: bool
  landed_now: bool
  stepped_up: bool
  step_up_dy: float
  y_correction_dy: float


def _active_fence_gate_overlap_exemption(player: PlayerEntity, world: WorldState, *, block_registry: BlockRegistry) -> tuple[int, int, int] | None:
  cell = player.fence_gate_overlap_exemption
  if cell is None:
    return None

  x, y, z = (int(cell[0]), int(cell[1]), int(cell[2]))
  state_str = world_state_at(world, int(x), int(y), int(z))
  defn = def_from_state(state_str, block_registry)
  if state_str is None or defn is None or (not is_fence_gate(defn)):
    player.fence_gate_overlap_exemption = None
    return None

  _base, props = parse_state(str(state_str))
  if prop_as_bool(props, "open", False):
    player.fence_gate_overlap_exemption = None
    return None

  player_aabb = player.aabb_at(player.position)
  for box in collision_aabbs_for_block(str(state_str), lambda gx, gy, gz: world_state_at(world, gx, gy, gz), block_registry.get, int(x), int(y), int(z)):
    if player_aabb.intersects(box):
      return (int(x), int(y), int(z))

  player.fence_gate_overlap_exemption = None
  return None


def _active_gravity_block_overlap_exemptions(player: PlayerEntity, world: WorldState, *, block_registry: BlockRegistry) -> frozenset[tuple[int, int, int]]:
  cells = tuple(player.gravity_block_overlap_exemptions)
  if not cells:
    return frozenset()

  player_aabb = player.aabb_at(player.position)
  active: set[tuple[int, int, int]] = set()
  for cell in cells:
    x, y, z = (int(cell[0]), int(cell[1]), int(cell[2]))
    state_str = world_state_at(world, int(x), int(y), int(z))
    defn = def_from_state(state_str, block_registry)
    if state_str is None or defn is None or (not defn.has_tag(GRAVITY_AFFECTED_TAG)):
      continue
    for box in collision_aabbs_for_block(str(state_str), lambda gx, gy, gz: world_state_at(world, gx, gy, gz), block_registry.get, int(x), int(y), int(z)):
      if player_aabb.intersects(box):
        active.add((int(x), int(y), int(z)))
        break

  player.gravity_block_overlap_exemptions = tuple(sorted(active))
  return frozenset(active)


def _active_collision_exempt_cells(player: PlayerEntity, world: WorldState, *, block_registry: BlockRegistry) -> frozenset[tuple[int, int, int]]:
  out: set[tuple[int, int, int]] = set()
  fence_gate_cell = _active_fence_gate_overlap_exemption(player, world, block_registry=block_registry)
  if fence_gate_cell is not None:
    out.add((int(fence_gate_cell[0]), int(fence_gate_cell[1]), int(fence_gate_cell[2])))
  out.update(_active_gravity_block_overlap_exemptions(player, world, block_registry=block_registry))
  return frozenset(out)


def can_auto_jump_one_block(player: PlayerEntity, world: WorldState, dx: float, dz: float, *, block_registry: BlockRegistry, params: CollisionParams = DEFAULT_COLLISION_PARAMS) -> bool:
  pos = player.position
  if abs(float(dx)) + abs(float(dz)) <= 1e-9:
    return False

  collision_exempt_cell = _active_collision_exempt_cells(player, world, block_registry=block_registry)

  if _try_step_up_height(player, world, pos, float(dx), float(dz), float(params.step_height), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell) is not None:
    return False

  if _try_step_up_height(player, world, pos, float(dx), float(dz), 1.0, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell) is None:
    return False

  return True


def integrate_with_collisions(
  player: PlayerEntity,
  world: WorldState,
  dt: float,
  *,
  block_registry: BlockRegistry,
  params: CollisionParams = DEFAULT_COLLISION_PARAMS,
  crouch: bool = False,
  jump_pressed: bool = False,
  flying: bool = False,
) -> CollisionReport:
  is_flying = bool(flying)
  collision_exempt_cell = _active_collision_exempt_cells(player, world, block_registry=block_registry)
  rising_eps = float(max(float(params.eps), 1e-6))

  if world_aabb_intersects(world, player.aabb_at(player.position), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    depenetrated_pos, initial_shift = _depenetrate(player, world, player.position, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)
    if abs(float(initial_shift.x)) > 1e-9:
      player.velocity = Vec3(0.0, player.velocity.y, player.velocity.z)
    if abs(float(initial_shift.y)) > 1e-9:
      player.velocity = Vec3(player.velocity.x, 0.0, player.velocity.z)
    if abs(float(initial_shift.z)) > 1e-9:
      player.velocity = Vec3(player.velocity.x, player.velocity.y, 0.0)
    player.position = depenetrated_pos

  supported_before = (
    False
    if bool(is_flying)
    else (
      (bool(player.on_ground) and float(player.velocity.y) <= float(rising_eps))
      or ((not bool(player.on_ground)) and _ground_probe(player, world, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell))
    )
  )

  delta = player.velocity * float(dt)
  pos0 = player.position
  pos = pos0

  if supported_before and bool(crouch) and (not bool(jump_pressed)) and (not bool(is_flying)):
    delta = _apply_sneak_edge_clamp(player, world, pos, delta, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)

  intended_y = float(pos0.y) + float(delta.y)

  allow_step = (not bool(is_flying)) and bool(supported_before) and (not bool(jump_pressed)) and float(delta.y) <= 1e-9

  hit_ground = False
  stepped_up = False
  step_up_dy = 0.0

  if abs(delta.x) > 0.0:
    x_result = _resolve_horizontal_axis_move(
      player, world, pos, axis="x", delta=float(delta.x), allow_step=bool(allow_step), params=params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell
    )
    pos = x_result.pos
    hit_ground = bool(hit_ground or x_result.hit_ground)
    if bool(x_result.stepped_up):
      stepped_up = True
      step_up_dy = float(x_result.step_up_dy)

  if abs(delta.y) > 0.0:
    eps = float(params.eps)
    pos_y = Vec3(pos.x, pos.y + delta.y, pos.z)
    aabb = player.aabb_at(pos_y)
    if delta.y > 0.0:
      lowest_ceiling_y: float | None = None
      for _bx, _by, _bz, ba in _iter_intersections(world, aabb, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
        bottom_y = float(ba.mn.y)
        if lowest_ceiling_y is None or bottom_y < float(lowest_ceiling_y):
          lowest_ceiling_y = float(bottom_y)
      if lowest_ceiling_y is not None:
        pos_y = Vec3(pos_y.x, float(lowest_ceiling_y) - player.height - eps, pos_y.z)
        player.velocity = Vec3(player.velocity.x, 0.0, player.velocity.z)
    else:
      highest_floor_y: float | None = None
      for _bx, _by, _bz, ba in _iter_intersections(world, aabb, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
        top_y = float(ba.mx.y)
        if highest_floor_y is None or top_y > float(highest_floor_y):
          highest_floor_y = float(top_y)
      if highest_floor_y is not None:
        pos_y = Vec3(pos_y.x, float(highest_floor_y) + eps, pos_y.z)
        player.velocity = Vec3(player.velocity.x, 0.0, player.velocity.z)
        hit_ground = True
    pos = pos_y

  if abs(delta.z) > 0.0:
    z_result = _resolve_horizontal_axis_move(
      player, world, pos, axis="z", delta=float(delta.z), allow_step=bool(allow_step), params=params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell
    )
    pos = z_result.pos
    hit_ground = bool(hit_ground or z_result.hit_ground)
    if bool(z_result.stepped_up):
      stepped_up = True
      step_up_dy = float(z_result.step_up_dy)

  if (not bool(is_flying)) and bool(supported_before) and (not bool(jump_pressed)) and (not bool(hit_ground)) and float(player.velocity.y) <= 1e-9:
    snapped, snap_hit = _resolve_downward_snap(player, world, pos, float(params.step_height), params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)
    if bool(snap_hit):
      pos = snapped
      hit_ground = True

  player.position = pos
  supported_after = (
    bool(hit_ground)
    if bool(is_flying)
    else (bool(hit_ground) or ((float(player.velocity.y) <= float(rising_eps)) and _ground_probe(player, world, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)))
  )
  player.on_ground = supported_after

  landed_now = (not bool(is_flying)) and (not bool(supported_before)) and bool(supported_after)

  y_correction = float(pos.y) - float(intended_y)

  return CollisionReport(
    supported_before=bool(supported_before),
    supported_after=bool(supported_after),
    landed_now=bool(landed_now),
    stepped_up=bool(stepped_up),
    step_up_dy=float(step_up_dy),
    y_correction_dy=float(y_correction),
  )
