# FILE: domain/blocks/catalog/grassBlock.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_grass_block(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="grass_side_carried",
        neg_x="grass_side_carried",
        pos_y="grass_carried",
        neg_y="dirt",
        pos_z="grass_side_carried",
        neg_z="grass_side_carried",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:grass_block",
            display_name="Grass Block",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )