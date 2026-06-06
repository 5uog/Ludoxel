# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.blocks.catalogs.variant_recipes import CatalogVariantRecipe, register_catalog_variants
from ludoxel.simulation.blocks.families.decorative_stone import DECORATIVE_STONE_TYPES
from ludoxel.simulation.blocks.families.ore import ORE_TYPES
from ludoxel.simulation.blocks.families.sandstone import SANDSTONE_TYPES
from ludoxel.simulation.blocks.families.special_dirt import SPECIAL_DIRT_TYPES
from ludoxel.simulation.blocks.families.special_stone import SPECIAL_STONE_TYPES
from ludoxel.simulation.blocks.families.stone import STONE_TYPES, StoneType, block_id, fence_id, slab_id, stairs_id, wall_id
from ludoxel.simulation.blocks.registries.block import BlockRegistry

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


_STONE_VARIANT_RECIPES: tuple[CatalogVariantRecipe, ...] = (
  CatalogVariantRecipe(
    variant_id=lambda stone: block_id(stone), display_name=lambda stone: str(stone.display), kind=lambda stone: str(stone.kind), family="block", is_full_cube=lambda stone: bool(stone.is_full_cube)
  ),
  CatalogVariantRecipe(variant_id=lambda stone: slab_id(stone), display_name=lambda stone: _variant_display(str(stone.display), "Slab"), kind="slab", family="slab", is_full_cube=False),
  CatalogVariantRecipe(variant_id=lambda stone: stairs_id(stone), display_name=lambda stone: _variant_display(str(stone.display), "Stairs"), kind="stairs", family="stairs", is_full_cube=False),
  CatalogVariantRecipe(variant_id=lambda stone: wall_id(stone), display_name=lambda stone: _variant_display(str(stone.display), "Wall"), kind="wall", family="wall", is_full_cube=False),
  CatalogVariantRecipe(variant_id=lambda stone: fence_id(stone), display_name=lambda stone: _variant_display(str(stone.display), "Fence"), kind="fence", family="fence", is_full_cube=False),
)


def register_stones(reg: BlockRegistry) -> None:
  for v in _all_stones():
    stone_tags = tuple(_STONE_LIKE_TAGS) + tuple(str(tag) for tag in getattr(v, "tags", ()))
    register_catalog_variants(reg, v, textures=v.textures, tags=stone_tags, recipes=_STONE_VARIANT_RECIPES, sound_group=lambda stone: getattr(stone, "sound_group", "stone"))
