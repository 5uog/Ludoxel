# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.models.api import collision_aabbs_for_block
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.view import world_state_at
from ludoxel.simulation.worlds.state.world import WorldState


def _spawn_position_clear(*, player: PlayerEntity, world: WorldState, block_registry: BlockRegistry) -> bool:
  player_aabb = player.aabb_at(player.position)
  x0 = int(math.floor(float(player_aabb.mn.x))) - 1
  x1 = int(math.ceil(float(player_aabb.mx.x))) + 1
  y0 = int(math.floor(float(player_aabb.mn.y))) - 1
  y1 = int(math.ceil(float(player_aabb.mx.y))) + 1
  z0 = int(math.floor(float(player_aabb.mn.z))) - 1
  z1 = int(math.ceil(float(player_aabb.mx.z))) + 1

  def get_state(x: int, y: int, z: int) -> str | None:
    return world_state_at(world, int(x), int(y), int(z))

  for x in range(int(x0), int(x1) + 1):
    for y in range(int(y0), int(y1) + 1):
      for z in range(int(z0), int(z1) + 1):
        state_str = world.blocks.get((int(x), int(y), int(z)))
        if state_str is None:
          continue
        for box in collision_aabbs_for_block(str(state_str), get_state, block_registry.get, int(x), int(y), int(z)):
          if player_aabb.intersects(box):
            return False
  return True
