# FILE: src/maiming/domain/blocks/default_registry.py
from __future__ import annotations

from threading import Lock

from maiming.domain.blocks.block_registry import BlockRegistry

_DEFAULT_REGISTRY: BlockRegistry | None = None
_DEFAULT_REGISTRY_LOCK = Lock()

def _build_default_registry() -> BlockRegistry:
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

    reg.seal()
    return reg

def create_default_registry() -> BlockRegistry:
    global _DEFAULT_REGISTRY

    reg = _DEFAULT_REGISTRY
    if reg is not None:
        return reg

    with _DEFAULT_REGISTRY_LOCK:
        reg = _DEFAULT_REGISTRY
        if reg is None:
            reg = _build_default_registry()
            _DEFAULT_REGISTRY = reg
        return reg