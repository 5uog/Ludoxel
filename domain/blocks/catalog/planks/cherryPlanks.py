# FILE: domain/blocks/catalog/planks/cherryPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_cherry_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="cherry_planks",
        neg_x="cherry_planks",
        pos_y="cherry_planks",
        neg_y="cherry_planks",
        pos_z="cherry_planks",
        neg_z="cherry_planks",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:cherry_planks",
            display_name="Cherry Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )