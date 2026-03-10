# FILE: src/maiming/domain/blocks/catalog/planks.py
from __future__ import annotations

from ..block_definition import BlockDefinition, BlockTextures
from ..block_registry import BlockRegistry
from ..families.wood_types import MOSAIC_TYPES, WOOD_TYPES, WoodType, fence_gate_id, fence_id, planks_id, slab_id, stairs_id

_WOOD_TAGS = ("wood",)
_PLANK_TAGS = ("planks", "wood")

def _wood_textures(w: WoodType) -> BlockTextures:
    tex = str(w.texture)
    return BlockTextures(pos_x=tex, neg_x=tex, pos_y=tex, neg_y=tex, pos_z=tex, neg_z=tex)

def _all_plank_variants() -> tuple[WoodType, ...]:
    return WOOD_TYPES + MOSAIC_TYPES

def _register_variant(reg: BlockRegistry, *, block_id: str, display_name: str, textures: BlockTextures, kind: str, family: str, is_full_cube: bool, tags: tuple[str, ...]) -> None:
    reg.register(BlockDefinition(block_id=str(block_id), display_name=str(display_name), textures=textures, kind=str(kind), family=str(family), is_full_cube=bool(is_full_cube), is_solid=True, tags=tuple(str(x) for x in tags)))

def _register_plank(reg: BlockRegistry, w: WoodType) -> None:
    display = f"{w.display} Planks" if w.key != "bamboo_mosaic" else w.display
    _register_variant(reg, block_id=planks_id(w), display_name=display, textures=_wood_textures(w), kind="cube", family="block", is_full_cube=True, tags=_PLANK_TAGS)

def _register_slab(reg: BlockRegistry, w: WoodType) -> None:
    display = f"{w.display} Slab" if w.key != "bamboo_mosaic" else "Bamboo Mosaic Slab"
    _register_variant(reg, block_id=slab_id(w), display_name=display, textures=_wood_textures(w), kind="slab", family="slab", is_full_cube=False, tags=_WOOD_TAGS)

def _register_stair(reg: BlockRegistry, w: WoodType) -> None:
    display = f"{w.display} Stairs" if w.key != "bamboo_mosaic" else "Bamboo Mosaic Stairs"
    _register_variant(reg, block_id=stairs_id(w), display_name=display, textures=_wood_textures(w), kind="stairs", family="stairs", is_full_cube=False, tags=_WOOD_TAGS)

def _register_fence(reg: BlockRegistry, w: WoodType) -> None:
    _register_variant(reg, block_id=fence_id(w), display_name=f"{w.display} Fence", textures=_wood_textures(w), kind="fence", family="fence", is_full_cube=False, tags=_WOOD_TAGS)

def _register_fence_gate(reg: BlockRegistry, w: WoodType) -> None:
    _register_variant(reg, block_id=fence_gate_id(w), display_name=f"{w.display} Fence Gate", textures=_wood_textures(w), kind="fence_gate", family="fence_gate", is_full_cube=False, tags=_WOOD_TAGS)

def register_planks(reg: BlockRegistry) -> None:
    for w in _all_plank_variants():
        _register_plank(reg, w)

def register_slabs(reg: BlockRegistry) -> None:
    for w in _all_plank_variants():
        _register_slab(reg, w)

def register_stairs(reg: BlockRegistry) -> None:
    for w in _all_plank_variants():
        _register_stair(reg, w)

def register_fences(reg: BlockRegistry) -> None:
    for w in WOOD_TYPES:
        _register_fence(reg, w)

def register_fence_gates(reg: BlockRegistry) -> None:
    for w in WOOD_TYPES:
        _register_fence_gate(reg, w)

def register_wood_blocks(reg: BlockRegistry) -> None:
    register_planks(reg)
    register_slabs(reg)
    register_stairs(reg)
    register_fences(reg)
    register_fence_gates(reg)