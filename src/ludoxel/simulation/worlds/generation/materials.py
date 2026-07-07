# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

MATERIAL_AIR: int = 0

TERRAIN_MATERIALS: tuple[str, ...] = (
  "",
  "ludoxel:bedrock",
  "ludoxel:grass_block",
  "ludoxel:dirt",
  "ludoxel:coarse_dirt",
  "ludoxel:gravel",
  "ludoxel:stone",
  "ludoxel:andesite",
  "ludoxel:granite",
  "ludoxel:diorite",
  "ludoxel:tuff",
  "ludoxel:deepslate",
  "ludoxel:coal_ore",
  "ludoxel:copper_ore",
  "ludoxel:iron_ore",
  "ludoxel:gold_ore",
  "ludoxel:redstone_ore",
  "ludoxel:lapis_ore",
  "ludoxel:diamond_ore",
  "ludoxel:emerald_ore",
  "ludoxel:deepslate_coal_ore",
  "ludoxel:deepslate_copper_ore",
  "ludoxel:deepslate_iron_ore",
  "ludoxel:deepslate_gold_ore",
  "ludoxel:deepslate_redstone_ore",
  "ludoxel:deepslate_lapis_ore",
  "ludoxel:deepslate_diamond_ore",
  "ludoxel:deepslate_emerald_ore",
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
