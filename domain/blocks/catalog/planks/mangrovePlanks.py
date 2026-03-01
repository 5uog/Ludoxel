# FILE: domain/blocks/catalog/planks/mangrovePlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_mangrove_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="mangrove_planks",
        neg_x="mangrove_planks",
        pos_y="mangrove_planks",
        neg_y="mangrove_planks",
        pos_z="mangrove_planks",
        neg_z="mangrove_planks",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:mangrove_planks",
            display_name="Mangrove Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )