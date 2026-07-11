# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.scalars.hashing import fnv1a_uint64, mix_uint64, uint64_to_unit_index
from ludoxel.simulation.blocks.registries.block import BlockRegistry

UV_ROTATION_STEP_COUNT: int = 4

TEXTURE_VARIANT_GROUPS: dict[str, tuple[str, ...]] = {
  "planks_acacia": ("planks_acacia_alt_1", "planks_acacia_alt_2"),
  "planks_birch": ("planks_birch_alt_1", "planks_birch_alt_2"),
  "planks_oak": ("planks_oak_alt_1", "planks_oak_alt_2"),
  "planks_jungle": ("planks_jungle_alt_1", "planks_jungle_alt_2"),
  "planks_big_oak": ("planks_big_oak_alt_1", "planks_big_oak_alt_2"),
  "planks_spruce": ("planks_spruce_alt_1", "planks_spruce_alt_2"),
  "crimson_planks": ("crimson_planks_alt_1", "crimson_planks_alt_2"),
  "pale_oak_planks": ("pale_oak_planks_alt_1", "pale_oak_planks_alt_2"),
  "cherry_planks": ("cherry_planks_alt_1", "cherry_planks_alt_2"),
  "warped_planks": ("warped_planks_alt_1", "warped_planks_alt_2"),
  "mangrove_planks": ("mangrove_planks_alt_1", "mangrove_planks_alt_2"),
  "dirt": ("dirt_alt_1", "dirt_alt_2", "dirt_alt_3"),
  "red_nether_brick": ("red_nether_brick_alt_1", "red_nether_brick_alt_2", "red_nether_brick_alt_3"),
  "cobblestone": ("cobblestone_alt_1",),
  "stone_granite": ("stone_granite_alt_1", "stone_granite_alt_2", "stone_granite_alt_3"),
  "stone_brick": ("stone_brick_alt_1", "stone_brick_alt_2", "stone_brick_alt_3", "stone_brick_alt_4", "stone_brick_alt_5", "stone_brick_alt_6"),
  "deepslate_tiles": ("deepslate_tiles_alt_1",),
  "deepslate": ("deepslate_alt_1", "deepslate_alt_2", "deepslate_alt_3"),
  "stone": ("stone_alt_1", "stone_alt_2", "stone_alt_3"),
  "sand": ("sand_alt_1", "sand_alt_2"),
  "red_sand": ("red_sand_alt_1", "red_sand_alt_2"),
  "sandstone_chiseled": ("sandstone_chiseled_alt_1", "sandstone_chiseled_alt_2", "sandstone_chiseled_alt_3", "sandstone_chiseled_alt_4", "sandstone_chiseled_alt_5", "sandstone_chiseled_alt_6"),
  "deepslate_bricks": ("deepslate_bricks_alt_1", "deepslate_bricks_alt_2", "deepslate_bricks_alt_3"),
  "stone_brick_mossy": ("stone_brick_mossy_alt_1", "stone_brick_mossy_alt_2", "stone_brick_mossy_alt_3", "stone_brick_mossy_alt_4"),
  "cobblestone_mossy": ("cobblestone_mossy_alt_1",),
  "polished_blackstone_bricks": ("polished_blackstone_bricks_alt_1", "polished_blackstone_bricks_alt_2"),
  "obsidian": ("obsidian_alt_1",),
  "cracked_polished_blackstone_bricks": ("cracked_polished_blackstone_bricks_alt_1",),
  "stone_diorite": ("stone_diorite_alt_1", "stone_diorite_alt_2", "stone_diorite_alt_3"),
  "nether_brick": ("nether_brick_alt_1", "nether_brick_alt_2", "nether_brick_alt_3"),
  "warped_nylium_top": ("warped_nylium_top_alt_1", "warped_nylium_top_alt_2"),
  "crimson_nylium_top": ("crimson_nylium_top_alt_1", "crimson_nylium_top_alt_2"),
}

ROTATABLE_TEXTURE_NAMES: frozenset[str] = frozenset(
  {
    "clay",
    "coarse_dirt",
    "crimson_nylium_top",
    "crimson_nylium_top_alt_1",
    "crimson_nylium_top_alt_2",
    "crying_obsidian",
    "deepslate_top",
    "dirt",
    "dirt_alt_1",
    "dirt_alt_2",
    "dirt_alt_3",
    "dirt_podzol_top",
    "dirt_with_roots",
    "grass_carried",
    "dirt_path_top",
    "magma_01",
    "mycelium_top",
    "netherrack",
    "obsidian",
    "obsidian_alt_1",
    "quartz_column_top",
    "red_sand",
    "red_sand_alt_1",
    "red_sand_alt_2",
    "red_sandstone_bottom",
    "red_sandstone_normal",
    "red_sandstone_top",
    "sand",
    "sand_alt_1",
    "sand_alt_2",
    "sandstone_bottom",
    "sandstone_normal",
    "sandstone_top",
    "warped_nylium_top",
    "warped_nylium_top_alt_1",
    "warped_nylium_top_alt_2",
  }
)


def _variant_family(base_name: str) -> tuple[str, ...]:
  alts = TEXTURE_VARIANT_GROUPS.get(str(base_name))
  if not alts:
    return (str(base_name),)
  return (str(base_name),) + tuple(str(a) for a in alts)


def resolve_variant_texture_name(base_name: str, x: int, y: int, z: int) -> str:
  candidates = _variant_family(str(base_name))
  if len(candidates) <= 1:
    return str(base_name)

  family_salt = fnv1a_uint64(str(base_name))
  mixed = mix_uint64(int(x), int(y), int(z), int(family_salt))
  return str(candidates[uint64_to_unit_index(mixed, len(candidates))])


def resolve_uv_rotation_steps(resolved_texture_name: str, x: int, y: int, z: int, face_idx: int) -> int:
  name = str(resolved_texture_name)
  if name not in ROTATABLE_TEXTURE_NAMES:
    return 0

  texture_salt = fnv1a_uint64(name)
  mixed = mix_uint64(int(x), int(y), int(z), int(face_idx), int(texture_salt))
  return int(uint64_to_unit_index(mixed, UV_ROTATION_STEP_COUNT))


def world_atlas_variant_texture_names() -> frozenset[str]:
  names: set[str] = set()
  for base, alts in TEXTURE_VARIANT_GROUPS.items():
    names.add(str(base))
    names.update(str(a) for a in alts)
  return frozenset(names)


def world_atlas_texture_names(block_registry: BlockRegistry) -> list[str]:
  names = set(block_registry.required_texture_names())
  names.update(world_atlas_variant_texture_names())
  return sorted(names)
