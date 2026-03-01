# FILE: domain/blocks/catalog/planks/crimsonPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_crimson_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="crimson_planks",
        neg_x="crimson_planks",
        pos_y="crimson_planks",
        neg_y="crimson_planks",
        pos_z="crimson_planks",
        neg_z="crimson_planks",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:crimson_planks",
            display_name="Crimson Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )