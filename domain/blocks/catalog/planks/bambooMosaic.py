# FILE: domain/blocks/catalog/planks/bambooMosaic.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_bamboo_mosaic(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="bamboo_mosaic",
        neg_x="bamboo_mosaic",
        pos_y="bamboo_mosaic",
        neg_y="bamboo_mosaic",
        pos_z="bamboo_mosaic",
        neg_z="bamboo_mosaic",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:bamboo_mosaic",
            display_name="Bamboo Mosaic",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )