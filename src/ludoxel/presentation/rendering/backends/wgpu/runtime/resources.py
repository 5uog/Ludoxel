# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class WgpuRendererResources:
  adapter: object
  device: object
  context: object
  target_format: object
  depth_format: object
  camera_buffers: tuple[object, ...]
  camera_bind_group_layout: object
  camera_bind_groups: tuple[object, ...]
  atlas_bind_group_layout: object
  atlas_bind_group: object
  skin_bind_group: object | None
  face_vertex_buffer: object
  face_wire_vertex_buffer: object
  face_wire_vertex_count: int
  world_pipeline: object
  world_shadowed_pipeline: object
  world_wireframe_pipeline: object
  sun_pipeline: object
  cloud_pipeline: object
  cloud_volume_pipeline: object
  cloud_wireframe_pipeline: object
  cloud_cube_vertex_buffer: object
  cloud_cube_vertex_count: int
  othello_pipeline: object
  othello_overlay_pipeline: object
  othello_shadow_pipeline: object
  transform_shadow_pipeline: object
  shadow_depth_pipeline: object
  textured_face_pipeline: object
  name_tag_pipeline: object
  selection_pipeline: object
  othello_board_vertex_buffer: object
  othello_board_vertex_count: int
  othello_piece_vertex_buffer: object
  othello_piece_vertex_count: int
  shadow_bind_group_layout: object
  shadow_bind_group: object | None = None
  shadow_texture: object | None = None
  shadow_view: object | None = None
  shadow_sampler: object | None = None
  shadow_size: int = 0
  depth_texture: object | None = None
  depth_view: object | None = None
  depth_size: tuple[int, int] = (0, 0)
  sun_glare_pipeline: object | None = None
  sun_flare_pipeline: object | None = None

  def destroy(self) -> None:
    for obj in (self.shadow_texture, self.depth_texture, self.face_vertex_buffer, self.face_wire_vertex_buffer, self.cloud_cube_vertex_buffer, self.othello_board_vertex_buffer, self.othello_piece_vertex_buffer, *self.camera_buffers):
      if obj is not None and hasattr(obj, "destroy"):
        obj.destroy()
    self.shadow_texture = None
    self.shadow_view = None
    self.shadow_sampler = None
    self.shadow_bind_group = None
    self.shadow_size = 0
    self.depth_texture = None
    self.depth_view = None
    self.skin_bind_group = None
