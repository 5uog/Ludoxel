# FILE: domain/blocks/catalog/planks/oakPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_oak_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="planks_oak",
        neg_x="planks_oak",
        pos_y="planks_oak",
        neg_y="planks_oak",
        pos_z="planks_oak",
        neg_z="planks_oak",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:oak_planks",
            display_name="Oak Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )