# FILE: domain/blocks/catalog/planks/acaciaPlanks.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry

def register_acacia_planks(reg: BlockRegistry) -> None:
    tex = BlockTextures(
        pos_x="planks_acacia",
        neg_x="planks_acacia",
        pos_y="planks_acacia",
        neg_y="planks_acacia",
        pos_z="planks_acacia",
        neg_z="planks_acacia",
    )

    reg.register(
        BlockDefinition(
            block_id="minecraft:acacia_planks",
            display_name="Acacia Planks",
            textures=tex,
            is_full_cube=True,
            is_solid=True,
        )
    )