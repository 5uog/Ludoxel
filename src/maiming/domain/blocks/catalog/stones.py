# FILE: src/maiming/domain/blocks/catalog/stones.py
from __future__ import annotations

from ..block_registry import BlockRegistry
from ..families.stone_types import StoneType, STONE_TYPES, block_id, slab_id, stairs_id, wall_id, fence_id
from ..families.decorative_stone_types import DECORATIVE_STONE_TYPES
from ..families.sandstone_types import SANDSTONE_TYPES
from ..families.ore_types import ORE_TYPES
from ..families.special_stone_types import SPECIAL_STONE_TYPES
from ..families.special_dirt_types import SPECIAL_DIRT_TYPES
from .common import register_block_variant

_STONE_LIKE_TAGS = ("stone_like",)

def _variant_display(display: str, suffix: str) -> str:
    s = str(display)
    if s.endswith("Bricks"):
        s = s[:-1]
    elif s.endswith("Tiles"):
        s = s[:-1]
    return f"{s} {suffix}"

def _all_stones() -> tuple[StoneType, ...]:
    return STONE_TYPES + DECORATIVE_STONE_TYPES + SANDSTONE_TYPES + ORE_TYPES + SPECIAL_STONE_TYPES + SPECIAL_DIRT_TYPES

def _register_base(reg: BlockRegistry, v: StoneType) -> None:
    register_block_variant(reg, block_id=block_id(v), display_name=str(v.display), textures=v.textures, kind=str(v.kind), family="block", is_full_cube=bool(v.is_full_cube), tags=_STONE_LIKE_TAGS)

def _register_slab(reg: BlockRegistry, v: StoneType) -> None:
    bid = slab_id(v)
    if bid is None:
        return
    register_block_variant(reg, block_id=bid, display_name=_variant_display(str(v.display), "Slab"), textures=v.textures, kind="slab", family="slab", is_full_cube=False, tags=_STONE_LIKE_TAGS)

def _register_stairs(reg: BlockRegistry, v: StoneType) -> None:
    bid = stairs_id(v)
    if bid is None:
        return
    register_block_variant(reg, block_id=bid, display_name=_variant_display(str(v.display), "Stairs"), textures=v.textures, kind="stairs", family="stairs", is_full_cube=False, tags=_STONE_LIKE_TAGS)

def _register_wall(reg: BlockRegistry, v: StoneType) -> None:
    bid = wall_id(v)
    if bid is None:
        return
    register_block_variant(reg, block_id=bid, display_name=_variant_display(str(v.display), "Wall"), textures=v.textures, kind="wall", family="wall", is_full_cube=False, tags=_STONE_LIKE_TAGS)

def _register_fence(reg: BlockRegistry, v: StoneType) -> None:
    bid = fence_id(v)
    if bid is None:
        return
    register_block_variant(reg, block_id=bid, display_name=_variant_display(str(v.display), "Fence"), textures=v.textures, kind="fence", family="fence", is_full_cube=False, tags=_STONE_LIKE_TAGS)

def register_stones(reg: BlockRegistry) -> None:
    for v in _all_stones():
        _register_base(reg, v)
        _register_slab(reg, v)
        _register_stairs(reg, v)
        _register_wall(reg, v)
        _register_fence(reg, v)