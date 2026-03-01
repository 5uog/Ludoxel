# FILE: domain/blocks/blockRegistry.py
from __future__ import annotations

from dataclasses import dataclass

from domain.blocks.blockDefinition import BlockDefinition

@dataclass
class BlockRegistry:
    _by_id: dict[str, BlockDefinition]

    def __init__(self) -> None:
        self._by_id = {}

    def register(self, block: BlockDefinition) -> None:
        bid = str(block.block_id)
        if not bid:
            raise ValueError("block_id must be non-empty")
        if bid in self._by_id:
            raise ValueError(f"Duplicate block_id: {bid}")
        self._by_id[bid] = block

    def get(self, block_id: str) -> BlockDefinition | None:
        return self._by_id.get(str(block_id))

    def all_blocks(self) -> list[BlockDefinition]:
        return [self._by_id[k] for k in sorted(self._by_id.keys())]

    def required_texture_names(self) -> list[str]:
        names: set[str] = set()
        for b in self._by_id.values():
            names.add(str(b.textures.pos_x))
            names.add(str(b.textures.neg_x))
            names.add(str(b.textures.pos_y))
            names.add(str(b.textures.neg_y))
            names.add(str(b.textures.pos_z))
            names.add(str(b.textures.neg_z))
        out = sorted(names)
        if "default" not in out:
            out.append("default")
        return out

def create_default_registry() -> BlockRegistry:
    reg = BlockRegistry()

    from domain.blocks.catalog.grassBlock import register_grass_block

    from domain.blocks.catalog.planks.oakPlanks import register_oak_planks
    from domain.blocks.catalog.planks.sprucePlanks import register_spruce_planks
    from domain.blocks.catalog.planks.birchPlanks import register_birch_planks
    from domain.blocks.catalog.planks.junglePlanks import register_jungle_planks
    from domain.blocks.catalog.planks.acaciaPlanks import register_acacia_planks
    from domain.blocks.catalog.planks.darkOakPlanks import register_dark_oak_planks
    from domain.blocks.catalog.planks.mangrovePlanks import register_mangrove_planks
    from domain.blocks.catalog.planks.cherryPlanks import register_cherry_planks
    from domain.blocks.catalog.planks.paleOakPlanks import register_pale_oak_planks
    from domain.blocks.catalog.planks.bambooPlanks import register_bamboo_planks
    from domain.blocks.catalog.planks.bambooMosaic import register_bamboo_mosaic
    from domain.blocks.catalog.planks.crimsonPlanks import register_crimson_planks
    from domain.blocks.catalog.planks.warpedPlanks import register_warped_planks

    register_grass_block(reg)

    register_oak_planks(reg)
    register_spruce_planks(reg)
    register_birch_planks(reg)
    register_jungle_planks(reg)
    register_acacia_planks(reg)
    register_dark_oak_planks(reg)
    register_mangrove_planks(reg)
    register_cherry_planks(reg)
    register_pale_oak_planks(reg)
    register_bamboo_planks(reg)
    register_bamboo_mosaic(reg)
    register_crimson_planks(reg)
    register_warped_planks(reg)

    return reg