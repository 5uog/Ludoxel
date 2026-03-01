# FILE: domain/blocks/catalog/planks/junglePlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_jungle_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="planks_jungle",
        neg_x="planks_jungle",
        pos_y="planks_jungle",
        neg_y="planks_jungle",
        pos_z="planks_jungle",
        neg_z="planks_jungle",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:jungle_planks",
            display_name="Jungle Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )