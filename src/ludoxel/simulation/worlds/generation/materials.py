# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

MATERIAL_AIR: int = 0

TERRAIN_MATERIALS: tuple[str, ...] = (
  "",
  "minecraft:bedrock",
  "minecraft:grass_block",
  "minecraft:dirt",
  "minecraft:coarse_dirt",
  "minecraft:gravel",
  "minecraft:stone",
  "minecraft:andesite",
  "minecraft:granite",
  "minecraft:diorite",
  "minecraft:tuff",
  "minecraft:deepslate",
  "minecraft:coal_ore",
  "minecraft:copper_ore",
  "minecraft:iron_ore",
  "minecraft:gold_ore",
  "minecraft:redstone_ore",
  "minecraft:lapis_ore",
  "minecraft:diamond_ore",
  "minecraft:emerald_ore",
  "minecraft:deepslate_coal_ore",
  "minecraft:deepslate_copper_ore",
  "minecraft:deepslate_iron_ore",
  "minecraft:deepslate_gold_ore",
  "minecraft:deepslate_redstone_ore",
  "minecraft:deepslate_lapis_ore",
  "minecraft:deepslate_diamond_ore",
  "minecraft:deepslate_emerald_ore",
)

MATERIAL_COUNT: int = len(TERRAIN_MATERIALS)


class UnregisteredTerrainMaterialError(RuntimeError):
  """Raised when a terrain material id is not present in the block registry."""


def material_state(code: int) -> str | None:
  index = int(code)
  if index <= 0 or index >= MATERIAL_COUNT:
    return None
  return TERRAIN_MATERIALS[index]


def validate_terrain_materials(block_registry) -> None:
  missing: list[str] = []
  for block_id in TERRAIN_MATERIALS[1:]:
    if block_registry.get(str(block_id)) is None:
      missing.append(str(block_id))
  if missing:
    raise UnregisteredTerrainMaterialError(f"Terrain material ids are not registered: {', '.join(missing)}")
