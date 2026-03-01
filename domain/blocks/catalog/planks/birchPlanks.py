# FILE: domain/blocks/catalog/planks/birchPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_birch_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="planks_birch",
        neg_x="planks_birch",
        pos_y="planks_birch",
        neg_y="planks_birch",
        pos_z="planks_birch",
        neg_z="planks_birch",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:birch_planks",
            display_name="Birch Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )