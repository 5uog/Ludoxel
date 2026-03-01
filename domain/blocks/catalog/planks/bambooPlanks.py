# FILE: domain/blocks/catalog/planks/bambooPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_bamboo_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="bamboo_planks",
        neg_x="bamboo_planks",
        pos_y="bamboo_planks",
        neg_y="bamboo_planks",
        pos_z="bamboo_planks",
        neg_z="bamboo_planks",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:bamboo_planks",
            display_name="Bamboo Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )