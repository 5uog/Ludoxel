# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable, Iterable, Mapping

from ludoxel.simulation.blocks.definitions.block import BlockDefinition
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.worlds.state.world import BlockKey, WorldState

GetState = Callable[[int, int, int], str | None]
DefLookup = Callable[[str], BlockDefinition | None]


def world_state_at(world: WorldState, x: int, y: int, z: int) -> str | None:
  return world.blocks.get((int(x), int(y), int(z)))


def world_state_getter(world: WorldState) -> GetState:

  def get_state(x: int, y: int, z: int) -> str | None:
    return world_state_at(world, int(x), int(y), int(z))

  return get_state


def overlay_world_state_getter(world: WorldState, *, updates: Mapping[BlockKey, str] | None = None, removals: Iterable[BlockKey] = ()) -> GetState:
  update_map = {(int(key[0]), int(key[1]), int(key[2])): str(value) for key, value in (updates or {}).items()}
  removal_set = {(int(key[0]), int(key[1]), int(key[2])) for key in removals}

  def get_state(x: int, y: int, z: int) -> str | None:
    key = (int(x), int(y), int(z))
    if key in removal_set:
      return None
    if key in update_map:
      return str(update_map[key])
    return world_state_at(world, int(x), int(y), int(z))

  return get_state


def registry_def_lookup(block_registry: BlockRegistry) -> DefLookup:

  def get_def(block_id: str) -> BlockDefinition | None:
    return block_registry.get(str(block_id))

  return get_def


def def_from_state(state_str: str | None, block_registry: BlockRegistry) -> BlockDefinition | None:
  if state_str is None:
    return None

  base, _props = parse_state(str(state_str))
  return block_registry.get(str(base))
