# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable

from ludoxel.shared.blocks.blocks_block_definition import BlockDefinition
from ludoxel.shared.blocks.registry.registry_block_registry import BlockRegistry

from ...world.world_state import WorldState
from .state_codec import parse_state

GetState = Callable[[int, int, int], str | None]
DefLookup = Callable[[str], BlockDefinition | None]


def world_state_at(world: WorldState, x: int, y: int, z: int) -> str | None:
  return world.blocks.get((int(x), int(y), int(z)))


def world_state_getter(world: WorldState) -> GetState:

  def get_state(x: int, y: int, z: int) -> str | None:
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
