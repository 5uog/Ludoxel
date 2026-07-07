# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.geometry.aabb import AABB
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.models.api import collision_aabbs_for_block
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.view import def_from_state, world_state_at
from ludoxel.simulation.worlds.config.collision import DEFAULT_COLLISION_PARAMS, CollisionParams
from ludoxel.simulation.worlds.state.world import WorldState


@dataclass(frozen=True)
class SupportBlockContact:
  cell: tuple[int, int, int]
  block_state: str
  support_y: float


def _normalize_exempt_cells(collision_exempt_cell: object) -> frozenset[tuple[int, int, int]]:
  if collision_exempt_cell is None:
    return frozenset()
  if isinstance(collision_exempt_cell, frozenset):
    return collision_exempt_cell
  if isinstance(collision_exempt_cell, tuple) and len(collision_exempt_cell) == 3:
    return frozenset({(int(collision_exempt_cell[0]), int(collision_exempt_cell[1]), int(collision_exempt_cell[2]))})
  if isinstance(collision_exempt_cell, (set, list, tuple)):
    out: set[tuple[int, int, int]] = set()
    for cell in collision_exempt_cell:
      if isinstance(cell, tuple) and len(cell) == 3:
        out.add((int(cell[0]), int(cell[1]), int(cell[2])))
    return frozenset(out)
  return frozenset()


def _iter_nearby_blocks(world: WorldState, aabb: AABB, params: CollisionParams):
  pxz = int(params.nearby_xz_pad)
  pyd = int(params.nearby_y_down_pad)
  pyu = int(params.nearby_y_up_pad)

  x0 = int(aabb.mn.x) - pxz
  x1 = int(aabb.mx.x) + pxz
  y0 = int(aabb.mn.y) - pyd
  y1 = int(aabb.mx.y) + pyu
  z0 = int(aabb.mn.z) - pxz
  z1 = int(aabb.mx.z) + pxz

  for x in range(x0, x1 + 1):
    for y in range(y0, y1 + 1):
      for z in range(z0, z1 + 1):
        if (x, y, z) in world.blocks:
          yield x, y, z


def _iter_block_aabbs(world: WorldState, bx: int, by: int, bz: int, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None):
  if (int(bx), int(by), int(bz)) in _normalize_exempt_cells(collision_exempt_cell):
    return

  st = world_state_at(world, int(bx), int(by), int(bz))
  if st is None:
    return

  defn = def_from_state(st, block_registry)
  if defn is not None and (not bool(defn.is_solid)):
    return

  for ba in collision_aabbs_for_block(str(st), lambda x, y, z: world_state_at(world, x, y, z), block_registry.get, int(bx), int(by), int(bz)):
    yield ba


def _iter_intersections(world: WorldState, probe: AABB, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None):
  for bx, by, bz in _iter_nearby_blocks(world, probe, params):
    for ba in _iter_block_aabbs(world, bx, by, bz, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
      if probe.intersects(ba):
        yield (int(bx), int(by), int(bz), ba)


def world_aabb_intersects(world: WorldState, probe: AABB, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None) -> bool:
  for _bx, _by, _bz, _ba in _iter_intersections(world, probe, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
    return True
  return False


def _has_support_at(player: PlayerEntity, world: WorldState, pos: Vec3, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None) -> bool:
  eps = float(params.eps)
  gp = float(params.ground_probe)

  aabb = player.aabb_at(pos)
  probe = AABB(mn=Vec3(aabb.mn.x, aabb.mn.y - gp, aabb.mn.z), mx=Vec3(aabb.mx.x, aabb.mn.y + eps, aabb.mx.z))
  return world_aabb_intersects(world, probe, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)


def _ground_probe(player: PlayerEntity, world: WorldState, params: CollisionParams, *, block_registry: BlockRegistry, collision_exempt_cell: tuple[int, int, int] | None = None) -> bool:
  return _has_support_at(player, world, player.position, params, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell)


def support_block_beneath(player: PlayerEntity, world: WorldState, *, block_registry: BlockRegistry, params: CollisionParams = DEFAULT_COLLISION_PARAMS, collision_exempt_cell: tuple[int, int, int] | None = None) -> SupportBlockContact | None:
  feet_y = float(player.position.y)
  eps = float(max(float(params.eps), 1e-5))
  probe_depth = float(max(float(params.ground_probe), eps * 2.0, 0.25))
  aabb = player.aabb_at(player.position)
  probe = AABB(mn=Vec3(aabb.mn.x, feet_y - probe_depth, aabb.mn.z), mx=Vec3(aabb.mx.x, feet_y + eps, aabb.mx.z))

  best_contact: SupportBlockContact | None = None
  best_support_y = float("-inf")

  for bx, by, bz in _iter_nearby_blocks(world, probe, params):
    block_state = world_state_at(world, int(bx), int(by), int(bz))
    if block_state is None:
      continue

    defn = def_from_state(block_state, block_registry)
    if defn is not None and (not bool(defn.is_solid)):
      continue

    for block_aabb in _iter_block_aabbs(world, bx, by, bz, block_registry=block_registry, collision_exempt_cell=collision_exempt_cell):
      if float(block_aabb.mx.y) < float(feet_y - probe_depth) or float(block_aabb.mx.y) > float(feet_y + eps):
        continue
      if float(aabb.mx.x) <= float(block_aabb.mn.x) + eps or float(aabb.mn.x) >= float(block_aabb.mx.x) - eps:
        continue
      if float(aabb.mx.z) <= float(block_aabb.mn.z) + eps or float(aabb.mn.z) >= float(block_aabb.mx.z) - eps:
        continue
      support_y = float(block_aabb.mx.y)
      if support_y > float(best_support_y):
        best_support_y = float(support_y)
        best_contact = SupportBlockContact(cell=(int(bx), int(by), int(bz)), block_state=str(block_state), support_y=float(support_y))

  return best_contact
