# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass

from ludoxel.presentation.rendering.contracts.lookups import DefLookup, UVRect, WorldUVLookup
from ludoxel.presentation.rendering.visuals.worlds.texture_variation import resolve_uv_rotation_steps, resolve_variant_texture_name
from ludoxel.simulation.blocks.definitions.block import BlockDefinition
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.blocks.structures.axis_orientation import resolve_oriented_texture_name

_DEFAULT_UV_RECT: UVRect = (0.0, 0.0, 1.0, 1.0)


@dataclass(frozen=True)
class BlockVisualResolver:
  uv_by_texture: Mapping[str, UVRect]
  blocks: BlockRegistry

  def def_lookup(self, base_id: str) -> BlockDefinition | None:
    return self.blocks.get(str(base_id))

  def _uv_for_texture(self, texture_name: str) -> UVRect:
    uv = self.uv_by_texture.get(str(texture_name))
    if uv is None:
      uv = self.uv_by_texture.get("default", _DEFAULT_UV_RECT)
    return (float(uv[0]), float(uv[1]), float(uv[2]), float(uv[3]))

  def atlas_uv_face(self, block_state_or_id: str, face_idx: int) -> UVRect:
    base_id, props = parse_state(str(block_state_or_id))
    block = self.blocks.get(str(base_id))
    if block is None:
      return self._uv_for_texture("default")
    texture_name = resolve_oriented_texture_name(block, props, int(face_idx))
    return self._uv_for_texture(texture_name)

  def world_face_visual(self, x: int, y: int, z: int, block_state_or_id: str, face_idx: int) -> tuple[UVRect, float]:
    base_id, props = parse_state(str(block_state_or_id))
    block = self.blocks.get(str(base_id))
    if block is None:
      return (self._uv_for_texture("default"), 0.0)

    fi = int(face_idx)
    oriented_name = resolve_oriented_texture_name(block, props, fi)
    resolved_name = resolve_variant_texture_name(oriented_name, int(x), int(y), int(z))
    uv = self._uv_for_texture(resolved_name)
    rotation_steps = resolve_uv_rotation_steps(resolved_name, int(x), int(y), int(z), fi)
    return (uv, float(rotation_steps))

  def display_name(self, block_state_or_id: str) -> str:
    base_id, _props = parse_state(str(block_state_or_id))
    block = self.blocks.get(str(base_id))
    if block is None:
      return str(base_id)
    return str(block.display_name)

  def world_build_tools(self) -> tuple[WorldUVLookup, DefLookup]:
    return (self.world_face_visual, self.def_lookup)
