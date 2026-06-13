# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass

from ludoxel.presentation.rendering.contracts.lookups import DefLookup, UVLookup, UVRect
from ludoxel.simulation.blocks.definitions.block import BlockDefinition
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import parse_state


@dataclass(frozen=True)
class BlockVisualResolver:
  uv_by_texture: Mapping[str, UVRect]
  blocks: BlockRegistry

  def def_lookup(self, base_id: str) -> BlockDefinition | None:
    return self.blocks.get(str(base_id))

  def atlas_uv_face(self, block_state_or_id: str, face_idx: int) -> UVRect:
    base_id, _props = parse_state(str(block_state_or_id))
    block = self.blocks.get(str(base_id))
    texture_name = block.texture_for_face(int(face_idx)) if block is not None else "default"
    uv = self.uv_by_texture.get(str(texture_name))
    if uv is None:
      uv = self.uv_by_texture.get("default", (0.0, 0.0, 1.0, 1.0))
    return (float(uv[0]), float(uv[1]), float(uv[2]), float(uv[3]))

  def display_name(self, block_state_or_id: str) -> str:
    base_id, _props = parse_state(str(block_state_or_id))
    block = self.blocks.get(str(base_id))
    if block is None:
      return str(base_id)
    return str(block.display_name)

  def world_build_tools(self) -> tuple[UVLookup, DefLookup]:
    return (self.atlas_uv_face, self.def_lookup)
