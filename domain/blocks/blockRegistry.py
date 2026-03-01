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
    from domain.blocks.catalog.planks import register_planks
    from domain.blocks.catalog.slabs import register_slabs
    from domain.blocks.catalog.stairs import register_stairs
    from domain.blocks.catalog.fences import register_fences
    from domain.blocks.catalog.fenceGates import register_fence_gates

    register_grass_block(reg)
    register_planks(reg)
    register_slabs(reg)
    register_stairs(reg)
    register_fences(reg)
    register_fence_gates(reg)

    return reg