# FILE: domain/blocks/catalog/planks/sprucePlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_spruce_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="planks_spruce",
        neg_x="planks_spruce",
        pos_y="planks_spruce",
        neg_y="planks_spruce",
        pos_z="planks_spruce",
        neg_z="planks_spruce",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:spruce_planks",
            display_name="Spruce Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )