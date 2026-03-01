# FILE: domain/blocks/catalog/planks/warpedPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_warped_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="warped_planks",
        neg_x="warped_planks",
        pos_y="warped_planks",
        neg_y="warped_planks",
        pos_z="warped_planks",
        neg_z="warped_planks",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:warped_planks",
            display_name="Warped Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )