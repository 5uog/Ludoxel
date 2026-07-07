# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from ludoxel.simulation.blocks.catalogs.common import register_block_variant
from ludoxel.simulation.blocks.definitions.block import BlockTextures
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.sounds.groups import DEFAULT_BLOCK_SOUND_GROUP


def _resolve(value, entry):
  return value(entry) if callable(value) else value


@dataclass(frozen=True)
class CatalogVariantRecipe:
  variant_id: Callable[[object], str | None]
  display_name: Callable[[object], str]
  kind: str | Callable[[object], str]
  family: str
  is_full_cube: bool | Callable[[object], bool]
  is_solid: bool = True


def register_catalog_variants(reg: BlockRegistry, entry: object, *, textures: BlockTextures, tags: tuple[str, ...], recipes: tuple[CatalogVariantRecipe, ...], sound_group=DEFAULT_BLOCK_SOUND_GROUP) -> None:
  for recipe in recipes:
    variant_id = recipe.variant_id(entry)
    if variant_id is None:
      continue
    register_block_variant(
      reg,
      block_id=str(variant_id),
      display_name=str(recipe.display_name(entry)),
      textures=textures,
      kind=str(_resolve(recipe.kind, entry)),
      family=str(recipe.family),
      is_full_cube=bool(_resolve(recipe.is_full_cube, entry)),
      is_solid=bool(recipe.is_solid),
      tags=tuple(str(tag) for tag in tags),
      sound_group=str(_resolve(sound_group, entry)),
    )
