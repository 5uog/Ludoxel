# FILE: src/maiming/domain/blocks/default_registry.py
from __future__ import annotations

from maiming.domain.blocks.block_registry import BlockRegistry

def create_default_registry() -> BlockRegistry:
    reg = BlockRegistry()

    from maiming.domain.blocks.catalog.planks import register_planks
    from maiming.domain.blocks.catalog.slabs import register_slabs
    from maiming.domain.blocks.catalog.stairs import register_stairs
    from maiming.domain.blocks.catalog.fences import register_fences
    from maiming.domain.blocks.catalog.fence_gates import register_fence_gates
    from maiming.domain.blocks.catalog.stones import register_stones

    register_planks(reg)
    register_slabs(reg)
    register_stairs(reg)
    register_fences(reg)
    register_fence_gates(reg)
    register_stones(reg)

    return reg