# FILE: src/maiming/domain/blocks/families/sandstone_types.py
from __future__ import annotations

from maiming.domain.blocks.families.stone_types import StoneType, cube_textures, side_top_bottom_textures

SANDSTONE_TYPES: tuple[StoneType, ...] = (
    StoneType(
        key="sandstone",
        display="Sandstone",
        textures=side_top_bottom_textures("sandstone_normal", "sandstone_top", "sandstone_bottom"),
        slab_key="sandstone_slab",
        stairs_key="sandstone_stairs",
        wall_key="sandstone_wall",
    ),
    StoneType(
        key="chiseled_sandstone",
        display="Chiseled Sandstone",
        textures=cube_textures("sandstone_carved"),
    ),
    StoneType(
        key="cut_sandstone",
        display="Cut Sandstone",
        textures=cube_textures("sandstone_smooth"),
        slab_key="cut_sandstone_slab",
    ),
    StoneType(
        key="smooth_sandstone",
        display="Smooth Sandstone",
        textures=cube_textures("sandstone_top"),
        slab_key="smooth_sandstone_slab",
        stairs_key="smooth_sandstone_stairs",
    ),
    StoneType(
        key="red_sandstone",
        display="Red Sandstone",
        textures=side_top_bottom_textures("red_sandstone_normal", "red_sandstone_top", "red_sandstone_bottom"),
        slab_key="red_sandstone_slab",
        stairs_key="red_sandstone_stairs",
        wall_key="red_sandstone_wall",
    ),
    StoneType(
        key="chiseled_red_sandstone",
        display="Chiseled Red Sandstone",
        textures=cube_textures("red_sandstone_carved"),
    ),
    StoneType(
        key="cut_red_sandstone",
        display="Cut Red Sandstone",
        textures=cube_textures("red_sandstone_smooth"),
        slab_key="cut_red_sandstone_slab",
    ),
    StoneType(
        key="smooth_red_sandstone",
        display="Smooth Red Sandstone",
        textures=cube_textures("red_sandstone_top"),
        slab_key="smooth_red_sandstone_slab",
        stairs_key="smooth_red_sandstone_stairs",
    ),
)