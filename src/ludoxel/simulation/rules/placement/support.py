# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.models.api import collision_aabbs_for_block
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import format_state, parse_state
from ludoxel.simulation.blocks.states.values import slab_type_value
from ludoxel.simulation.blocks.structures.structural_rules import is_slab
from ludoxel.simulation.worlds.state.world import WorldState


def choose_half_type(hit_face: int, hit_point: Vec3) -> str:
  if int(hit_face) == 2:
    return "bottom"
  if int(hit_face) == 3:
    return "top"

  base_y = math.floor(float(hit_point.y))
  fy = float(hit_point.y) - float(base_y)
  fy = max(0.0, min(1.0, float(fy)))
  return "top" if fy >= 0.5 else "bottom"


def resolve_same_slab_merge_state(*, block_registry: BlockRegistry, existing_state: str, block_id: str, desired_type: str) -> str | None:
  base, props = parse_state(str(existing_state))
  if str(base) != str(block_id):
    return None

  defn = block_registry.get(str(base))
  if defn is None or (not is_slab(defn)):
    return None

  want = str(desired_type)
  if want not in ("bottom", "top"):
    return None

  cur = slab_type_value(props)
  if cur == "double" or cur == want:
    return None

  return format_state(str(base), {"type": "double"})


def placement_intersects_player(*, block_registry: BlockRegistry, player: PlayerEntity, world: WorldState, px: int, py: int, pz: int, place_state: str) -> bool:
  pa = player.aabb_at(player.position)

  def get_state(x: int, y: int, z: int) -> str | None:
    k = (int(x), int(y), int(z))
    if k == (int(px), int(py), int(pz)):
      return str(place_state)
    return world.blocks.get(k)

  for ba in collision_aabbs_for_block(str(place_state), get_state, block_registry.get, int(px), int(py), int(pz)):
    if pa.intersects(ba):
      return True

  return False
