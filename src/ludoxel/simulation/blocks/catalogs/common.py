# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.blocks.definitions.block import BlockDefinition, BlockTextures
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.sounds.groups import DEFAULT_BLOCK_SOUND_GROUP


def register_block_variant(reg: BlockRegistry, *, block_id: str, display_name: str, textures: BlockTextures, kind: str, family: str, is_full_cube: bool, is_solid: bool = True, tags: tuple[str, ...] = (), sound_group: str = DEFAULT_BLOCK_SOUND_GROUP) -> None:
  reg.register(BlockDefinition(block_id=str(block_id), display_name=str(display_name), textures=textures, kind=str(kind), family=str(family), is_full_cube=bool(is_full_cube), is_solid=bool(is_solid), tags=tuple(str(x) for x in tags), sound_group=str(sound_group)))
