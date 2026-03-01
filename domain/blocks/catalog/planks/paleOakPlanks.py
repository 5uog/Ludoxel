# FILE: domain/blocks/catalog/planks/paleOakPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_pale_oak_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="pale_oak_planks",
        neg_x="pale_oak_planks",
        pos_y="pale_oak_planks",
        neg_y="pale_oak_planks",
        pos_z="pale_oak_planks",
        neg_z="pale_oak_planks",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:pale_oak_planks",
            display_name="Pale Oak Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )