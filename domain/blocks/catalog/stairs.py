# FILE: domain/blocks/catalog/stairs.py
from __future__ import annotations

from domain.blocks.blockDefinition import BlockDefinition, BlockTextures
from domain.blocks.blockRegistry import BlockRegistry
from domain.blocks.catalog.woodTypes import WOOD_TYPES, MOSAIC_TYPES, stairs_id

def register_stairs(reg: BlockRegistry) -> None:
    for w in WOOD_TYPES + MOSAIC_TYPES:
        tex = BlockTextures(
            pos_x=w.texture,
            neg_x=w.texture,
            pos_y=w.texture,
            neg_y=w.texture,
            pos_z=w.texture,
            neg_z=w.texture,
        )
        name = f"{w.display} Stairs" if w.key != "bamboo_mosaic" else "Bamboo Mosaic Stairs"
        reg.register(
            BlockDefinition(
                block_id=stairs_id(w),
                display_name=name,
                textures=tex,
                kind="stairs",
                is_full_cube=False,
                is_solid=True,
                tags=("stairs", "wood"),
            )
        )