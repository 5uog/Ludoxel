# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import time
from pathlib import Path

import numpy as np
from PyQt6.QtGui import QColor, QImage

import ludoxel.foundations.mathematics.linear.mat4 as mat4
from ludoxel.application.preferences.shadow import SHADOW_MAP_QUALITY_ULTRA
from ludoxel.application.sessions.pipelines.render_snapshot import BlockBreakParticleRenderSampleDTO, FallingBlockRenderSampleDTO
from ludoxel.foundations.mathematics.chunks.grid import ChunkKey, normalize_chunk_key
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import forward_from_yaw_pitch_deg
from ludoxel.presentation.interface.common.special_item_art import build_special_item_icon_image
from ludoxel.presentation.rendering.backends.wgpu.meshes.chunk import WgpuChunkMesh, WgpuFaceInstances, build_face_vertex_rows, build_face_wire_vertex_rows, upload_chunk_mesh, upload_face_rows, upload_transform_face_rows
from ludoxel.presentation.rendering.backends.wgpu.pipelines.factory import (
  create_cloud_pipeline,
  create_cloud_volume_pipeline,
  create_cloud_wireframe_pipeline,
  create_name_tag_pipeline,
  create_othello_pipeline,
  create_othello_shadow_pipeline,
  create_selection_pipeline,
  create_shadow_depth_pipeline,
  create_sun_flare_pipeline,
  create_sun_glare_pipeline,
  create_sun_pipeline,
  create_textured_face_pipeline,
  create_transform_shadow_pipeline,
  create_world_pipeline,
  create_world_shadowed_pipeline,
  create_world_wireframe_pipeline,
)
from ludoxel.presentation.rendering.backends.wgpu.runtime.resources import WgpuRendererResources
from ludoxel.presentation.rendering.backends.wgpu.runtime.surface import configure_wgpu_canvas
from ludoxel.presentation.rendering.backends.wgpu.textures.atlas import WgpuTextureAtlas
from ludoxel.presentation.rendering.contracts.config import (
  CloudDistanceFog,
  GeometryDistanceFog,
  cloud_far_distance,
  cloud_fog_range,
  cloud_projection_z_far,
  effective_backend_shadow_params,
  max_unfogged_render_distance_radius_blocks,
  render_distance_fog_range,
  shadow_normal_offset_world_units,
  sun_flare_screen,
  sun_glare_strength,
)
from ludoxel.presentation.rendering.contracts.metrics import BackendPassFrameMetrics, BackendRendererFrameMetrics
from ludoxel.presentation.rendering.contracts.resources import BackendRendererInfo
from ludoxel.presentation.rendering.faces.break_particles import build_block_break_particle_face_rows
from ludoxel.presentation.rendering.faces.bucket_layout import FACE_COUNT
from ludoxel.presentation.rendering.faces.falling_blocks import build_falling_block_face_rows
from ludoxel.presentation.rendering.faces.occlusion import is_local_face_occluded
from ludoxel.presentation.rendering.faces.row_utils import append_face_instance, atlas_face_uv, empty_textured_face_rows, face_rows_from_buffers, model_matrix_for_local_box
from ludoxel.presentation.rendering.visuals.name_tags import NameTagRenderState, NameTagTextureSpec, build_name_tag_face_rows, name_tag_content_key, render_name_tag_texture
from ludoxel.presentation.rendering.visuals.othello.scene import build_othello_board_vertices, build_othello_instance_rows, build_othello_piece_vertices
from ludoxel.presentation.rendering.visuals.othello.state import OthelloRenderState
from ludoxel.presentation.rendering.visuals.players.first_person_geometry import FIRST_PERSON_HAND_NEAR, build_first_person_arm_face_rows, build_first_person_held_block_face_rows, build_first_person_special_item_face_rows
from ludoxel.presentation.rendering.visuals.players.held_block_geometry import held_block_model_boxes_for_kind
from ludoxel.presentation.rendering.visuals.players.model_pose import HeldBlockPose, PlayerModelPose, build_player_model_pose
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.presentation.rendering.visuals.players.skin import normalize_player_skin_image
from ludoxel.presentation.rendering.visuals.selections.outline import SelectionOutlineBuilder
from ludoxel.presentation.rendering.visuals.worlds.block_visual_resolver import BlockVisualResolver
from ludoxel.presentation.rendering.visuals.worlds.cloud_field import CloudField, cloud_face_rows, cloud_volume_rows
from ludoxel.presentation.rendering.visuals.worlds.light_space import compute_light_view_proj
from ludoxel.presentation.rendering.visuals.worlds.texture_variation import world_atlas_texture_names
from ludoxel.presentation.resources.asset_roots import resolve_visual_asset_roots
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.structures.neighborhood import six_neighbor_state_signature
from ludoxel.simulation.inventories.special_items.registry import special_item_icon_keys

_DEPTH_FORMAT = "depth24plus"
_UNIFORM_FLOAT_COUNT = 60
_UNIFORM_SIZE_BYTES = _UNIFORM_FLOAT_COUNT * 4
_OPENGL_TO_WGPU_CLIP = np.asarray(((1.0, 0.0, 0.0, 0.0), (0.0, 1.0, 0.0, 0.0), (0.0, 0.0, 0.5, 0.5), (0.0, 0.0, 0.0, 1.0)), dtype=np.float32)
_PREVIEW_EYE = Vec3(0.0, 0.98, 6.8)
_PREVIEW_TARGET = Vec3(0.0, 0.78, 0.0)
_PREVIEW_FOV_DEG = 26.0
_PREVIEW_NEAR = 0.1
_PREVIEW_FAR = 10.0


def _adapter_info_value(info, name: str) -> str:
  if info is None:
    return ""
  if isinstance(info, dict):
    return str(info.get(name, "") or "")
  return str(getattr(info, name, "") or "")


def _opengl_clip_to_wgpu(view_proj: np.ndarray) -> np.ndarray:
  return (_OPENGL_TO_WGPU_CLIP @ np.asarray(view_proj, dtype=np.float32)).astype(np.float32)


def _look_dir(eye: Vec3, forward: Vec3, up_hint: Vec3 = Vec3(0.0, 1.0, 0.0)) -> np.ndarray:
  f = forward.normalized()
  r = up_hint.cross(f).normalized()
  if r.length() <= 1e-9:
    r = Vec3(1.0, 0.0, 0.0)
  u = f.cross(r).normalized()
  m = np.identity(4, dtype=np.float32)
  (m[0, 0], m[0, 1], m[0, 2]) = r.x, r.y, r.z
  (m[1, 0], m[1, 1], m[1, 2]) = u.x, u.y, u.z
  (m[2, 0], m[2, 1], m[2, 2]) = -f.x, -f.y, -f.z
  m[0, 3] = -r.dot(eye)
  m[1, 3] = -u.dot(eye)
  m[2, 3] = f.dot(eye)
  return m


def _qimage_rgba_bytes(image: QImage, *, mirror_y: bool) -> tuple[QImage, bytes]:
  img = QImage(image)
  if img.isNull():
    raise RuntimeError("Unable to upload a null renderer texture image.")
  img = img.convertToFormat(QImage.Format.Format_RGBA8888)
  if bool(mirror_y):
    img = img.mirrored(False, True)
  ptr = img.bits()
  ptr.setsize(img.sizeInBytes())
  return (img, bytes(ptr))


def _create_texture_bind_group(*, device, layout, label: str, image: QImage, mirror_y: bool):
  import wgpu

  img, data = _qimage_rgba_bytes(image, mirror_y=bool(mirror_y))
  texture = device.create_texture(label=f"{label}-texture", size=(int(img.width()), int(img.height()), 1), format=wgpu.TextureFormat.rgba8unorm, usage=wgpu.TextureUsage.TEXTURE_BINDING | wgpu.TextureUsage.COPY_DST)
  device.queue.write_texture({"texture": texture}, data, {"bytes_per_row": int(img.width()) * 4, "rows_per_image": int(img.height())}, (int(img.width()), int(img.height()), 1))
  view = texture.create_view(label=f"{label}-view")
  sampler = device.create_sampler(label=f"{label}-sampler", mag_filter="nearest", min_filter="nearest", mipmap_filter="nearest")
  bind_group = device.create_bind_group(label=f"{label}-bg", layout=layout, entries=[{"binding": 0, "resource": view}, {"binding": 1, "resource": sampler}])
  return texture, view, sampler, bind_group, int(img.width()), int(img.height())


class WgpuRendererBackend:
  def __init__(self, *, cfg, state, canvas) -> None:
    self._cfg = cfg
    self._state = state
    self._canvas = canvas

    self._res: WgpuRendererResources | None = None
    self._atlas: WgpuTextureAtlas | None = None
    self._visuals: BlockVisualResolver | None = None
    self._info = BackendRendererInfo(api="WebGPU/wgpu-native", shading_language="GLSL 450")
    self._chunks: dict[ChunkKey, WgpuChunkMesh] = {}
    self._selection_cell: tuple[int, int, int] | None = None
    self._selection_key: tuple[object, ...] | None = None
    self._selection_outline_builder: SelectionOutlineBuilder | None = None
    self._selection_buffer: object | None = None
    self._selection_vertex_count = 0
    self._last_metrics = BackendRendererFrameMetrics()
    self._player_skin_image = QImage()
    self._skin_texture: object | None = None
    self._skin_texture_view: object | None = None
    self._skin_sampler: object | None = None
    self._skin_size: tuple[int, int] = (0, 0)
    self._ai_skin_images: dict[str, QImage] = {}
    self._ai_skin_textures: dict[str, object] = {}
    self._ai_skin_texture_views: dict[str, object] = {}
    self._ai_skin_samplers: dict[str, object] = {}
    self._ai_skin_bind_groups: dict[str, object] = {}
    self._name_tag_textures: dict[str, object] = {}
    self._name_tag_texture_views: dict[str, object] = {}
    self._name_tag_samplers: dict[str, object] = {}
    self._name_tag_bind_groups: dict[str, object] = {}
    self._name_tag_specs: dict[str, NameTagTextureSpec] = {}
    self._name_tag_content_keys: dict[str, tuple[object, ...]] = {}
    self._special_item_textures: dict[str, object] = {}
    self._special_item_bind_groups: dict[str, object] = {}
    self._cloud_field = CloudField(self._cfg.clouds)
    self._cloud_motion_paused = False
    self._cloud_time_accum = 0.0
    self._cloud_last_clock = time.perf_counter()
    self._cloud_flow_direction = str(self._state.cloud_flow_direction)
    self._last_shadow_ok = False
    self._last_shadow_size = 0
    self._last_shadow_instances = 0
    self._effective_shadow = effective_backend_shadow_params(self._cfg.shadow, int(self._state.shadow_quality))
    self._initialized = False

  def initialize(self, assets_dir: Path, *, block_registry: BlockRegistry) -> None:
    import wgpu
    import wgpu.backends.wgpu_native  # noqa: F401

    adapter = wgpu.gpu.request_adapter_sync(power_preference="high-performance", canvas=self._canvas)
    device = adapter.request_device_sync(label="ludoxel-wgpu-device")
    context, target_format = configure_wgpu_canvas(canvas=self._canvas, adapter=adapter, device=device)

    camera_bgl = device.create_bind_group_layout(label="ludoxel-camera-bgl", entries=[{"binding": 0, "visibility": wgpu.ShaderStage.VERTEX | wgpu.ShaderStage.FRAGMENT, "buffer": {"type": "uniform"}}])
    camera_buffers = []
    camera_bgs = []
    for face_idx in range(FACE_COUNT):
      camera_buffer = device.create_buffer(label=f"ludoxel-frame-uniforms-face-{face_idx}", size=_UNIFORM_SIZE_BYTES, usage=wgpu.BufferUsage.UNIFORM | wgpu.BufferUsage.COPY_DST)
      camera_buffers.append(camera_buffer)
      camera_bgs.append(device.create_bind_group(label=f"ludoxel-frame-bg-face-{face_idx}", layout=camera_bgl, entries=[{"binding": 0, "resource": {"buffer": camera_buffer, "offset": 0, "size": _UNIFORM_SIZE_BYTES}}]))

    names = block_registry.required_texture_names()
    visual_roots = resolve_visual_asset_roots(assets_dir, required_texture_names=names)
    atlas = WgpuTextureAtlas.build_from_dir(visual_roots.block_texture_dir, names=world_atlas_texture_names(block_registry))
    atlas.upload(device=device)

    atlas_bgl = device.create_bind_group_layout(label="ludoxel-texture-bgl", entries=[{"binding": 0, "visibility": wgpu.ShaderStage.FRAGMENT, "texture": {"sample_type": "float", "view_dimension": "2d", "multisampled": False}}, {"binding": 1, "visibility": wgpu.ShaderStage.FRAGMENT, "sampler": {"type": "filtering"}}])
    atlas_bg = device.create_bind_group(label="ludoxel-atlas-bg", layout=atlas_bgl, entries=[{"binding": 0, "resource": atlas.texture_view}, {"binding": 1, "resource": atlas.sampler}])
    shadow_bgl = device.create_bind_group_layout(label="ludoxel-shadow-bgl", entries=[{"binding": 0, "visibility": wgpu.ShaderStage.FRAGMENT, "texture": {"sample_type": "depth", "view_dimension": "2d", "multisampled": False}}, {"binding": 1, "visibility": wgpu.ShaderStage.FRAGMENT, "sampler": {"type": "comparison"}}])
    initial_skin = self._player_skin_image if not self._player_skin_image.isNull() else QImage(64, 64, QImage.Format.Format_RGBA8888)
    if initial_skin.isNull():
      raise RuntimeError("Unable to create the initial player skin texture.")
    if self._player_skin_image.isNull():
      initial_skin.fill(QColor(255, 255, 255, 255))
    skin_texture, skin_view, skin_sampler, skin_bg, skin_w, skin_h = _create_texture_bind_group(device=device, layout=atlas_bgl, label="ludoxel-player-skin", image=initial_skin, mirror_y=True)
    special_item_textures: dict[str, object] = {}
    special_item_bind_groups: dict[str, object] = {}
    for icon_key in special_item_icon_keys():
      key = str(icon_key)
      texture, _view, _sampler, bind_group, _w, _h = _create_texture_bind_group(device=device, layout=atlas_bgl, label=f"ludoxel-special-item-{key}", image=build_special_item_icon_image(key, size=192), mirror_y=True)
      special_item_textures[key] = texture
      special_item_bind_groups[key] = bind_group

    world_pipeline = create_world_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl, atlas_bind_group_layout=atlas_bgl)
    world_shadowed_pipeline = create_world_shadowed_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl, atlas_bind_group_layout=atlas_bgl, shadow_bind_group_layout=shadow_bgl)
    world_wireframe_pipeline = create_world_wireframe_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    sun_pipeline = create_sun_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    sun_glare_pipeline = create_sun_glare_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    sun_flare_pipeline = create_sun_flare_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    cloud_pipeline = create_cloud_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    cloud_volume_pipeline = create_cloud_volume_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    cloud_wireframe_pipeline = create_cloud_wireframe_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    othello_pipeline = create_othello_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl, shadow_bind_group_layout=shadow_bgl, overlay=False)
    othello_overlay_pipeline = create_othello_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl, shadow_bind_group_layout=shadow_bgl, overlay=True)
    shadow_depth_bias = int(round(float(self._cfg.shadow.poly_offset_units)))
    shadow_depth_slope = float(self._cfg.shadow.poly_offset_factor)
    shadow_depth_pipeline = create_shadow_depth_pipeline(device=device, depth_format="depth32float", camera_bind_group_layout=camera_bgl, depth_bias=int(shadow_depth_bias), depth_bias_slope_scale=float(shadow_depth_slope))
    othello_shadow_pipeline = create_othello_shadow_pipeline(device=device, depth_format="depth32float", camera_bind_group_layout=camera_bgl, depth_bias=int(shadow_depth_bias), depth_bias_slope_scale=float(shadow_depth_slope))
    transform_shadow_pipeline = create_transform_shadow_pipeline(device=device, depth_format="depth32float", camera_bind_group_layout=camera_bgl, depth_bias=int(shadow_depth_bias), depth_bias_slope_scale=float(shadow_depth_slope))
    textured_face_pipeline = create_textured_face_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl, texture_bind_group_layout=atlas_bgl)
    name_tag_pipeline = create_name_tag_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl, texture_bind_group_layout=atlas_bgl)
    selection_pipeline = create_selection_pipeline(device=device, target_format=target_format, depth_format=_DEPTH_FORMAT, camera_bind_group_layout=camera_bgl)
    face_vertex_buffer = device.create_buffer_with_data(label="ludoxel-static-face-vertices", data=np.ascontiguousarray(build_face_vertex_rows(), dtype=np.float32), usage=wgpu.BufferUsage.VERTEX)
    face_wire_vertices = np.ascontiguousarray(build_face_wire_vertex_rows(), dtype=np.float32)
    face_wire_vertex_buffer = device.create_buffer_with_data(label="ludoxel-static-face-wire-vertices", data=face_wire_vertices, usage=wgpu.BufferUsage.VERTEX)
    cloud_cube_vertices = np.ascontiguousarray(build_face_vertex_rows(), dtype=np.float32)
    cloud_cube_vertex_buffer = device.create_buffer_with_data(label="ludoxel-cloud-cube-vertices", data=cloud_cube_vertices, usage=wgpu.BufferUsage.VERTEX)
    othello_board_vertices = np.ascontiguousarray(build_othello_board_vertices(), dtype=np.float32)
    othello_piece_vertices = np.ascontiguousarray(build_othello_piece_vertices(), dtype=np.float32)
    othello_board_vertex_buffer = device.create_buffer_with_data(label="ludoxel-othello-board-vertices", data=othello_board_vertices, usage=wgpu.BufferUsage.VERTEX)
    othello_piece_vertex_buffer = device.create_buffer_with_data(label="ludoxel-othello-piece-vertices", data=othello_piece_vertices, usage=wgpu.BufferUsage.VERTEX)

    self._res = WgpuRendererResources(
      adapter=adapter,
      device=device,
      context=context,
      target_format=target_format,
      depth_format=_DEPTH_FORMAT,
      camera_buffers=tuple(camera_buffers),
      camera_bind_group_layout=camera_bgl,
      camera_bind_groups=tuple(camera_bgs),
      atlas_bind_group_layout=atlas_bgl,
      atlas_bind_group=atlas_bg,
      skin_bind_group=skin_bg,
      face_vertex_buffer=face_vertex_buffer,
      face_wire_vertex_buffer=face_wire_vertex_buffer,
      face_wire_vertex_count=int(face_wire_vertices.shape[0]),
      world_pipeline=world_pipeline,
      world_shadowed_pipeline=world_shadowed_pipeline,
      world_wireframe_pipeline=world_wireframe_pipeline,
      sun_pipeline=sun_pipeline,
      sun_glare_pipeline=sun_glare_pipeline,
      sun_flare_pipeline=sun_flare_pipeline,
      cloud_pipeline=cloud_pipeline,
      cloud_volume_pipeline=cloud_volume_pipeline,
      cloud_wireframe_pipeline=cloud_wireframe_pipeline,
      cloud_cube_vertex_buffer=cloud_cube_vertex_buffer,
      cloud_cube_vertex_count=int(cloud_cube_vertices.shape[0]),
      othello_pipeline=othello_pipeline,
      othello_overlay_pipeline=othello_overlay_pipeline,
      othello_shadow_pipeline=othello_shadow_pipeline,
      transform_shadow_pipeline=transform_shadow_pipeline,
      shadow_depth_pipeline=shadow_depth_pipeline,
      textured_face_pipeline=textured_face_pipeline,
      name_tag_pipeline=name_tag_pipeline,
      selection_pipeline=selection_pipeline,
      othello_board_vertex_buffer=othello_board_vertex_buffer,
      othello_board_vertex_count=int(othello_board_vertices.shape[0]),
      othello_piece_vertex_buffer=othello_piece_vertex_buffer,
      othello_piece_vertex_count=int(othello_piece_vertices.shape[0]),
      shadow_bind_group_layout=shadow_bgl,
    )
    self._skin_texture = skin_texture
    self._skin_texture_view = skin_view
    self._skin_sampler = skin_sampler
    self._skin_size = (int(skin_w), int(skin_h))
    self._special_item_textures = special_item_textures
    self._special_item_bind_groups = special_item_bind_groups
    self._atlas = atlas
    self._visuals = BlockVisualResolver(uv_by_texture=atlas.uv, blocks=block_registry)
    self._selection_outline_builder = SelectionOutlineBuilder(def_lookup=self._visuals.def_lookup)
    self._replace_ai_skin_gpu_resources()
    self.apply_runtime_state()

    info = getattr(adapter, "info", None)
    backend = _adapter_info_value(info, "backend_type") or _adapter_info_value(info, "backend")
    adapter_name = _adapter_info_value(info, "device") or _adapter_info_value(info, "description") or _adapter_info_value(info, "adapter")
    vendor = _adapter_info_value(info, "vendor") or _adapter_info_value(info, "vendor_id")
    self._info = BackendRendererInfo(vendor=vendor, renderer=adapter_name or str(info or "wgpu adapter"), api=f"WebGPU/wgpu-native {backend}".strip(), shading_language="GLSL 450")
    print(f"[ludoxel] renderer backend: {self._info.api}; adapter={self._info.renderer}; vendor={self._info.vendor}", flush=True)
    self._initialized = True

  def destroy(self) -> None:
    for mesh in tuple(self._chunks.values()):
      mesh.destroy()
    self._chunks.clear()
    if self._selection_buffer is not None and hasattr(self._selection_buffer, "destroy"):
      self._selection_buffer.destroy()
    self._selection_buffer = None
    self._selection_vertex_count = 0
    if self._atlas is not None:
      self._atlas.destroy()
    self._atlas = None
    if self._skin_texture is not None and hasattr(self._skin_texture, "destroy"):
      self._skin_texture.destroy()
    self._skin_texture = None
    self._skin_texture_view = None
    self._skin_sampler = None
    self._skin_size = (0, 0)
    self._destroy_ai_skin_gpu_resources()
    self._destroy_name_tag_gpu_resources()
    for texture in tuple(self._special_item_textures.values()):
      if texture is not None and hasattr(texture, "destroy"):
        texture.destroy()
    self._special_item_textures.clear()
    self._special_item_bind_groups.clear()
    self._last_shadow_ok = False
    self._last_shadow_size = 0
    self._last_shadow_instances = 0
    if self._res is not None:
      self._res.destroy()
    self._res = None
    self._visuals = None
    self._initialized = False

  def gl_info(self) -> tuple[str, str, str, str]:
    return self._info.as_gl_info_tuple()

  def shadow_info(self) -> tuple[bool, int]:
    active = bool(self._state.shadow_enabled or self._state.debug_shadow)
    ok = bool(active and self._last_shadow_ok and int(self._last_shadow_instances) > 0)
    return (ok, int(self._last_shadow_size) if ok else 0)

  def payload_validation_report(self) -> object | None:
    return None

  def frame_metrics(self):
    return self._last_metrics

  def apply_runtime_state(self) -> None:
    self._cloud_field.set_density(int(self._state.cloud_density))
    self._cloud_field.set_cell_size(int(self._state.cloud_cell_size))
    self._cloud_field.set_seed(int(self._state.cloud_seed))
    self._cloud_field.set_speed_variation(bool(self._state.cloud_speed_variation_enabled), float(self._state.cloud_speed_min_blocks_per_second), float(self._state.cloud_speed_max_blocks_per_second))
    self._cloud_field.set_height_variation(
      bool(self._state.cloud_height_variation_enabled), int(self._state.cloud_fixed_y), int(self._state.cloud_spawn_y_min), int(self._state.cloud_spawn_y_max), int(self._state.cloud_preferred_y_min), int(self._state.cloud_preferred_y_max), int(self._state.cloud_preferred_y_probability_percent)
    )
    direction = str(self._state.cloud_flow_direction)
    if direction != str(self._cloud_flow_direction):
      self._advance_cloud_clock()
      self._cloud_flow_direction = direction
      self._cloud_field.set_flow_direction(str(self._cloud_flow_direction), t_seconds=float(self._cloud_time_accum))

  def set_cloud_motion_paused(self, on: bool) -> None:
    self._advance_cloud_clock()
    self._cloud_motion_paused = bool(on)

  def set_texture_animation_paused(self, on: bool) -> None:
    _ = bool(on)

  def atlas_uv_face(self, block_state_id: str, face_idx: int) -> tuple[float, float, float, float]:
    if self._visuals is None:
      return (0.0, 0.0, 1.0, 1.0)
    return self._visuals.atlas_uv_face(str(block_state_id), int(face_idx))

  def world_build_tools(self):
    if self._visuals is None:
      return None
    return self._visuals.world_build_tools()

  def block_display_name(self, block_state_or_id: str) -> str:
    if self._visuals is None:
      return str(block_state_or_id)
    return self._visuals.display_name(str(block_state_or_id))

  def evict_chunks(self, *, keep_chunks: set[ChunkKey]) -> None:
    keep = {normalize_chunk_key(chunk) for chunk in keep_chunks}
    for ck in tuple(self._chunks.keys()):
      if ck in keep:
        continue
      mesh = self._chunks.pop(ck)
      mesh.destroy()

  def clear_selection(self) -> None:
    self._selection_cell = None
    self._selection_key = None
    self._selection_vertex_count = 0
    if self._selection_buffer is not None and hasattr(self._selection_buffer, "destroy"):
      self._selection_buffer.destroy()
    self._selection_buffer = None

  def set_selection_target(self, *, x: int, y: int, z: int, state_str: str, get_state, world_revision: int) -> None:
    del world_revision
    cell = (int(x), int(y), int(z))
    self._selection_cell = cell
    key: tuple[object, ...] = (*cell, str(state_str), *six_neighbor_state_signature(get_state, *cell))
    if self._selection_key == key:
      return
    if self._selection_outline_builder is None:
      self.clear_selection()
      return
    vertices = self._selection_outline_builder.build(x=cell[0], y=cell[1], z=cell[2], state_str=str(state_str), get_state=get_state)
    self._selection_key = key
    self._refresh_selection_buffer(vertices)

  def submit_chunk(self, *, chunk_key: ChunkKey, world_revision: int, faces: list[np.ndarray] | None = None, shadow_faces: list[np.ndarray] | None = None, gpu_face_sources=None, gpu_bucket_counts=None) -> None:
    del shadow_faces, gpu_face_sources, gpu_bucket_counts
    if self._res is None:
      return
    ck = normalize_chunk_key(chunk_key)
    old = self._chunks.pop(ck, None)
    if old is not None:
      old.destroy()
    mesh = upload_chunk_mesh(device=self._res.device, chunk_key=ck, world_revision=int(world_revision), faces=faces)
    if mesh is not None:
      self._chunks[ck] = mesh

  def _refresh_selection_buffer(self, vertices: np.ndarray) -> None:
    if self._res is None:
      return
    import wgpu

    if self._selection_buffer is not None and hasattr(self._selection_buffer, "destroy"):
      self._selection_buffer.destroy()
    vertices = np.asarray(vertices, dtype=np.float32)
    self._selection_vertex_count = int(vertices.shape[0])
    if self._selection_vertex_count <= 0:
      self._selection_buffer = None
      return
    self._selection_buffer = self._res.device.create_buffer_with_data(label="ludoxel-selection-lines", data=np.ascontiguousarray(vertices, dtype=np.float32), usage=wgpu.BufferUsage.VERTEX)

  def _ensure_depth_target(self, *, width: int, height: int) -> None:
    if self._res is None:
      return
    import wgpu

    w = max(1, int(width))
    h = max(1, int(height))
    if self._res.depth_texture is not None and self._res.depth_size == (w, h):
      return
    if self._res.depth_texture is not None and hasattr(self._res.depth_texture, "destroy"):
      self._res.depth_texture.destroy()
    depth = self._res.device.create_texture(label="ludoxel-depth", size=(w, h, 1), format=self._res.depth_format, usage=wgpu.TextureUsage.RENDER_ATTACHMENT)
    self._res.depth_texture = depth
    self._res.depth_view = depth.create_view(label="ludoxel-depth-view")
    self._res.depth_size = (w, h)

  def _wgpu_max_texture_dimension_2d(self, default: int) -> int:
    # wgpu-py has exposed GPUAdapter.limits under both snake_case and kebab-case keys across
    # versions; try both known spellings and fall back to `default` (today's unclamped size) so a
    # bad guess here degrades gracefully, since this is the only platform that runs it.
    adapter = self._res.adapter if self._res is not None else None
    limits = getattr(adapter, "limits", None) if adapter is not None else None
    if limits is None:
      return int(default)
    for key in ("max_texture_dimension_2d", "max-texture-dimension-2d"):
      value = limits.get(key) if hasattr(limits, "get") else getattr(limits, key, None)
      if value:
        try:
          return int(value)
        except (TypeError, ValueError):
          continue
    return int(default)

  def _ensure_shadow_target(self) -> bool:
    if self._res is None:
      return False
    import wgpu

    requested = max(1, int(self._effective_shadow.size))
    max_dim = max(1, int(self._wgpu_max_texture_dimension_2d(default=requested)))
    size = min(int(requested), int(max_dim))
    if self._res.shadow_texture is not None and int(self._res.shadow_size) == int(size) and self._res.shadow_bind_group is not None:
      return True

    if self._res.shadow_texture is not None and hasattr(self._res.shadow_texture, "destroy"):
      self._res.shadow_texture.destroy()

    texture = self._res.device.create_texture(label="ludoxel-shadow-depth", size=(int(size), int(size), 1), format=wgpu.TextureFormat.depth32float, usage=wgpu.TextureUsage.RENDER_ATTACHMENT | wgpu.TextureUsage.TEXTURE_BINDING)
    view = texture.create_view(label="ludoxel-shadow-depth-view")
    sampler = self._res.device.create_sampler(label="ludoxel-shadow-compare-sampler", address_mode_u=wgpu.AddressMode.clamp_to_edge, address_mode_v=wgpu.AddressMode.clamp_to_edge, mag_filter=wgpu.FilterMode.linear, min_filter=wgpu.FilterMode.linear, compare=wgpu.CompareFunction.less_equal)
    bind_group = self._res.device.create_bind_group(label="ludoxel-shadow-bg", layout=self._res.shadow_bind_group_layout, entries=[{"binding": 0, "resource": view}, {"binding": 1, "resource": sampler}])

    self._res.shadow_texture = texture
    self._res.shadow_view = view
    self._res.shadow_sampler = sampler
    self._res.shadow_bind_group = bind_group
    self._res.shadow_size = int(size)
    return True

  def _frame_uniform_bytes(
    self, *, view_proj: np.ndarray, light_view_proj: np.ndarray | None = None, face_idx: int, tint_value: float = 0.55, sel_mode: int = 0, sel_block: tuple[int, int, int] | None = None, shadow_enabled: bool = False, debug_shadow: bool = False, fog: GeometryDistanceFog | None = None, ultra: bool = False
  ) -> bytes:
    vp = _opengl_clip_to_wgpu(view_proj)
    light_vp = vp if light_view_proj is None else _opengl_clip_to_wgpu(light_view_proj)
    active_fog = fog if fog is not None else GeometryDistanceFog.disabled()
    uniform = np.zeros((_UNIFORM_FLOAT_COUNT,), dtype=np.float32)
    uniform[:16] = np.ascontiguousarray(vp.T, dtype=np.float32).reshape(16)
    uniform[16:32] = np.ascontiguousarray(light_vp.T, dtype=np.float32).reshape(16)
    sun = self._state.sun_dir.normalized()
    uniform[32:35] = (float(sun.x), float(sun.y), float(sun.z))
    uniform[35] = float(tint_value)
    uniform[44:48] = (float(active_fog.cam_x), float(active_fog.cam_y), float(active_fog.cam_z), float(active_fog.start))
    uniform[48:52] = (float(active_fog.color.x), float(active_fog.color.y), float(active_fog.color.z), float(active_fog.end))
    shadow = self._effective_shadow
    shadow_texel = 1.0 / float(max(1, int(shadow.size)))
    uniform[52:56] = (float(shadow_texel), float(shadow.dark_mul), float(shadow.bias_min), float(shadow.bias_slope))
    uniform[56:60] = (float(shadow.pcf_radius), 1.0 if bool(ultra) else 0.0, 1.0 if bool(shadow.ultra_filter) else 0.0, float(shadow_normal_offset_world_units(shadow)))
    raw = bytearray(uniform.tobytes())
    ints = np.frombuffer(raw, dtype=np.int32)
    ints[36] = int(face_idx)
    ints[37] = int(sel_mode)
    ints[38] = 1 if bool(shadow_enabled) else 0
    ints[39] = 1 if bool(debug_shadow) else 0
    if sel_block is not None:
      ints[40:43] = (int(sel_block[0]), int(sel_block[1]), int(sel_block[2]))
    else:
      ints[40:43] = (0, 0, 0)
    return bytes(raw)

  def _camera_view_proj(self, *, width: int, height: int, eye: Vec3, yaw_deg: float, pitch_deg: float, fov_deg: float, z_near: float | None = None, z_far: float | None = None) -> np.ndarray:
    aspect = float(max(1, int(width))) / float(max(1, int(height)))
    forward = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
    view = _look_dir(eye, forward)
    proj = mat4.perspective(float(fov_deg), aspect, float(self._cfg.camera.z_near if z_near is None else z_near), float(self._cfg.camera.z_far if z_far is None else z_far))
    return mat4.mul(proj, view).astype(np.float32)

  def _hand_view_proj(self, *, width: int, height: int, fov_deg: float) -> np.ndarray:
    aspect = float(max(1, int(width))) / float(max(1, int(height)))
    return mat4.perspective(float(fov_deg), aspect, float(FIRST_PERSON_HAND_NEAR), float(self._cfg.camera.z_far)).astype(np.float32)

  def _hand_fit_projection(self, *, width: int, height: int, fov_deg: float) -> np.ndarray:
    aspect = float(max(1, int(width))) / float(max(1, int(height)))
    return mat4.perspective(float(fov_deg), aspect, float(FIRST_PERSON_HAND_NEAR), float(self._cfg.camera.z_far)).astype(np.float32)

  def _light_view_proj(self, *, center: Vec3, coverage_radius: float | None = None) -> np.ndarray:
    shadow_size = max(1, int(self._effective_shadow.size))
    return compute_light_view_proj(center=center, sun_dir=self._state.sun_dir, sun=self._cfg.sun, shadow=self._effective_shadow, shadow_size=int(shadow_size), coverage_radius=coverage_radius).astype(np.float32)

  def _create_frame_uniform_bind_groups(
    self, *, label: str, view_proj: np.ndarray, light_view_proj: np.ndarray | None = None, tint_value: float = 0.55, sel_mode: int = 0, sel_block: tuple[int, int, int] | None = None, shadow_enabled: bool = False, debug_shadow: bool = False, fog: GeometryDistanceFog | None = None, ultra: bool = False
  ) -> tuple[tuple[object, ...], tuple[object, ...]]:
    if self._res is None:
      return ((), ())
    import wgpu

    buffers: list[object] = []
    bind_groups: list[object] = []
    for face_idx in range(FACE_COUNT):
      data = self._frame_uniform_bytes(view_proj=view_proj, light_view_proj=light_view_proj, face_idx=int(face_idx), tint_value=float(tint_value), sel_mode=int(sel_mode), sel_block=sel_block, shadow_enabled=bool(shadow_enabled), debug_shadow=bool(debug_shadow), fog=fog, ultra=bool(ultra))
      buffer = self._res.device.create_buffer_with_data(label=f"{label}-uniform-face-{face_idx}", data=data, usage=wgpu.BufferUsage.UNIFORM)
      bind_group = self._res.device.create_bind_group(label=f"{label}-bg-face-{face_idx}", layout=self._res.camera_bind_group_layout, entries=[{"binding": 0, "resource": {"buffer": buffer, "offset": 0, "size": _UNIFORM_SIZE_BYTES}}])
      buffers.append(buffer)
      bind_groups.append(bind_group)
    return (tuple(buffers), tuple(bind_groups))

  def _sun_quad(self, *, eye: Vec3) -> tuple[Vec3, Vec3, Vec3, float]:
    d = self._state.sun_dir.normalized()
    up = Vec3(0.0, 1.0, 0.0)
    u = up.cross(d)
    if u.length() <= 1e-6:
      u = Vec3(1.0, 0.0, 0.0).cross(d)
    u = u.normalized()
    v = d.cross(u).normalized()
    sun_dist = float(self._cfg.sun.distance)
    sun_center = eye + d * sun_dist
    sun_half = math.tan(math.radians(float(self._cfg.sun.half_angle_deg))) * sun_dist
    return (sun_center, u, v, float(sun_half))

  def _create_sun_uniform_bind_group(self, *, view_proj: np.ndarray, eye: Vec3, ultra: bool = False) -> tuple[object | None, object | None]:
    if self._res is None:
      return (None, None)
    import wgpu

    sun_center, sun_u, sun_v, sun_half = self._sun_quad(eye=eye)
    uniform = np.zeros((32,), dtype=np.float32)
    uniform[:16] = np.ascontiguousarray(_opengl_clip_to_wgpu(view_proj).T, dtype=np.float32).reshape(16)
    uniform[16:20] = (float(sun_center.x), float(sun_center.y), float(sun_center.z), float(sun_half))
    uniform[20:24] = (float(sun_u.x), float(sun_u.y), float(sun_u.z), 0.0)
    uniform[24:28] = (float(sun_v.x), float(sun_v.y), float(sun_v.z), 0.0)
    uniform[28:32] = (1.0 if bool(ultra) else 0.0, 0.0, 0.0, 0.0)
    data = bytes(uniform.tobytes())
    buffer = self._res.device.create_buffer_with_data(label="ludoxel-sun-frame-uniform", data=data, usage=wgpu.BufferUsage.UNIFORM)
    bind_group = self._res.device.create_bind_group(label="ludoxel-sun-frame-bg", layout=self._res.camera_bind_group_layout, entries=[{"binding": 0, "resource": {"buffer": buffer, "offset": 0, "size": len(data)}}])
    return (buffer, bind_group)

  def _glare_quad(self, *, eye: Vec3, forward: Vec3) -> tuple[Vec3, Vec3, Vec3, float]:
    d = self._state.sun_dir.normalized()
    f = forward.normalized()
    up = Vec3(0.0, 1.0, 0.0)
    u = f.cross(up)
    if u.length() <= 1e-6:
      u = f.cross(Vec3(1.0, 0.0, 0.0))
    u = u.normalized()
    v = u.cross(f).normalized()
    glare_dist = float(self._cfg.sun.distance)
    center = eye + d * glare_dist
    half = math.tan(math.radians(62.0)) * glare_dist
    return (center, u, v, float(half))

  def _create_sun_glare_uniform_bind_group(self, *, view_proj: np.ndarray, eye: Vec3, forward: Vec3, strength: float) -> tuple[object | None, object | None]:
    # Ultra veiling glare reuses the sun pipeline and uniform block. The sun-mode slots carry (ultra, glare mode, glare strength); the quad faces the
    # camera and is centered on the sun direction so the shader whitens the scene most strongly toward the sun.
    if self._res is None:
      return (None, None)
    import wgpu

    center, u, v, half = self._glare_quad(eye=eye, forward=forward)
    uniform = np.zeros((32,), dtype=np.float32)
    uniform[:16] = np.ascontiguousarray(_opengl_clip_to_wgpu(view_proj).T, dtype=np.float32).reshape(16)
    uniform[16:20] = (float(center.x), float(center.y), float(center.z), float(half))
    uniform[20:24] = (float(u.x), float(u.y), float(u.z), 0.0)
    uniform[24:28] = (float(v.x), float(v.y), float(v.z), 0.0)
    uniform[28:32] = (1.0, 1.0, float(max(0.0, strength)), 0.0)
    data = bytes(uniform.tobytes())
    buffer = self._res.device.create_buffer_with_data(label="ludoxel-sun-glare-uniform", data=data, usage=wgpu.BufferUsage.UNIFORM)
    bind_group = self._res.device.create_bind_group(label="ludoxel-sun-glare-bg", layout=self._res.camera_bind_group_layout, entries=[{"binding": 0, "resource": {"buffer": buffer, "offset": 0, "size": len(data)}}])
    return (buffer, bind_group)

  def _create_sun_flare_uniform_bind_group(self, *, sun_ndc: tuple[float, float], strength: float, aspect: float) -> tuple[object | None, object | None]:
    # Screen-space lens-flare uniforms: one vec4 carrying the sun's normalized device x/y, the flare strength, and the viewport aspect.
    # The fullscreen triangle needs no view matrix, so only these four floats are uploaded.
    if self._res is None:
      return (None, None)
    import wgpu

    uniform = np.zeros((4,), dtype=np.float32)
    uniform[0:4] = (float(sun_ndc[0]), float(sun_ndc[1]), float(max(0.0, strength)), float(max(1e-6, aspect)))
    data = bytes(uniform.tobytes())
    buffer = self._res.device.create_buffer_with_data(label="ludoxel-sun-flare-uniform", data=data, usage=wgpu.BufferUsage.UNIFORM)
    bind_group = self._res.device.create_bind_group(label="ludoxel-sun-flare-bg", layout=self._res.camera_bind_group_layout, entries=[{"binding": 0, "resource": {"buffer": buffer, "offset": 0, "size": len(data)}}])
    return (buffer, bind_group)

  def _advance_cloud_clock(self) -> None:
    now = time.perf_counter()
    dt = max(0.0, min(0.25, now - float(self._cloud_last_clock)))
    self._cloud_last_clock = float(now)
    if not bool(self._cloud_motion_paused):
      self._cloud_time_accum += float(dt)

  def _create_cloud_uniform_bind_group(self, *, view_proj: np.ndarray, shift: Vec3, eye: Vec3, time_s: float, flow_dir_xz: tuple[float, float], cell_size: float, fog: CloudDistanceFog | None = None) -> tuple[object | None, object | None]:
    if self._res is None:
      return (None, None)
    import wgpu

    color = self._cfg.clouds.color
    active_fog = fog if fog is not None else CloudDistanceFog.disabled()
    uniform = np.zeros((40,), dtype=np.float32)
    uniform[:16] = np.ascontiguousarray(_opengl_clip_to_wgpu(view_proj).T, dtype=np.float32).reshape(16)
    uniform[16:20] = (float(shift.x), float(shift.y), float(shift.z), float(self._cfg.clouds.alpha))
    uniform[20:24] = (float(color.x), float(color.y), float(color.z), float(self._cfg.clouds.alpha))
    uniform[24:28] = (float(self._state.sun_dir.x), float(self._state.sun_dir.y), float(self._state.sun_dir.z), 0.0)
    uniform[28:32] = (float(active_fog.cam_x), float(active_fog.cam_z), float(active_fog.start), float(active_fog.end))
    # xyz carry the eye position for the volume raymarch; w carries the motion clock for the noise churn and the flat-tier turbulence sway.
    uniform[32:36] = (float(eye.x), float(eye.y), float(eye.z), float(time_s))
    # xy = flow direction (flat tier sway), z = cloud cell size (volume footprint mask), w unused.
    uniform[36:40] = (float(flow_dir_xz[0]), float(flow_dir_xz[1]), float(cell_size), 0.0)
    data = bytes(uniform.tobytes())
    buffer = self._res.device.create_buffer_with_data(label="ludoxel-cloud-frame-uniform", data=data, usage=wgpu.BufferUsage.UNIFORM)
    bind_group = self._res.device.create_bind_group(label="ludoxel-cloud-frame-bg", layout=self._res.camera_bind_group_layout, entries=[{"binding": 0, "resource": {"buffer": buffer, "offset": 0, "size": len(data)}}])
    return (buffer, bind_group)

  def _upload_temp_rows(self, *, label: str, rows: np.ndarray | None) -> tuple[object | None, int]:
    if self._res is None or rows is None:
      return (None, 0)
    import wgpu

    data = np.ascontiguousarray(rows, dtype=np.float32)
    if data.ndim != 2 or int(data.shape[0]) <= 0:
      return (None, 0)
    buffer = self._res.device.create_buffer_with_data(label=str(label), data=data, usage=wgpu.BufferUsage.VERTEX)
    return (buffer, int(data.shape[0]))

  def _draw_othello_rows(self, render_pass, *, pipeline, uniform_bind_group, shadow_bind_group, vertex_buffer, vertex_count: int, rows: np.ndarray | None, label: str, temp_buffers: list[object]) -> tuple[int, int]:
    if self._res is None or uniform_bind_group is None or shadow_bind_group is None:
      return (0, 0)
    instance_buffer, instance_count = self._upload_temp_rows(label=label, rows=rows)
    if instance_buffer is None or int(instance_count) <= 0:
      return (0, 0)
    temp_buffers.append(instance_buffer)
    render_pass.set_pipeline(pipeline)
    render_pass.set_bind_group(0, uniform_bind_group)
    render_pass.set_bind_group(1, shadow_bind_group)
    render_pass.set_vertex_buffer(0, vertex_buffer)
    render_pass.set_vertex_buffer(1, instance_buffer)
    render_pass.draw(int(vertex_count), int(instance_count), 0, 0)
    return (1, int(instance_count))

  def _draw_othello_shadow_rows(self, shadow_pass, *, uniform_bind_group, rows: np.ndarray | None, label: str, temp_buffers: list[object]) -> tuple[int, int]:
    if self._res is None or uniform_bind_group is None:
      return (0, 0)
    instance_buffer, instance_count = self._upload_temp_rows(label=label, rows=rows)
    if instance_buffer is None or int(instance_count) <= 0:
      return (0, 0)
    temp_buffers.append(instance_buffer)
    shadow_pass.set_pipeline(self._res.othello_shadow_pipeline)
    shadow_pass.set_bind_group(0, uniform_bind_group)
    shadow_pass.set_vertex_buffer(0, self._res.othello_piece_vertex_buffer)
    shadow_pass.set_vertex_buffer(1, instance_buffer)
    shadow_pass.draw(int(self._res.othello_piece_vertex_count), int(instance_count), 0, 0)
    return (1, int(instance_count))

  def _draw_transform_shadow_rows(self, shadow_pass, *, uniform_bind_group, rows: np.ndarray | None, label: str, temp_buffers: list[object]) -> tuple[int, int]:
    if self._res is None or uniform_bind_group is None:
      return (0, 0)
    instance_buffer, instance_count = self._upload_temp_rows(label=label, rows=rows)
    if instance_buffer is None or int(instance_count) <= 0:
      return (0, 0)
    temp_buffers.append(instance_buffer)
    shadow_pass.set_pipeline(self._res.transform_shadow_pipeline)
    shadow_pass.set_bind_group(0, uniform_bind_group)
    shadow_pass.set_vertex_buffer(0, self._res.face_vertex_buffer)
    shadow_pass.set_vertex_buffer(1, instance_buffer)
    shadow_pass.draw(FACE_COUNT * 6, int(instance_count), 0, 0)
    return (1, int(instance_count))

  def _draw_face_instances(self, render_pass, *, face_idx: int, face: WgpuFaceInstances) -> int:
    if self._res is None or int(face.instance_count) <= 0:
      return 0
    render_pass.set_vertex_buffer(1, face.instance_buffer)
    render_pass.draw(6, int(face.instance_count), int(face_idx) * 6, 0)
    return int(face.instance_count)

  def _draw_wire_face_instances(self, render_pass, *, face_idx: int, face: WgpuFaceInstances) -> int:
    if self._res is None or int(face.instance_count) <= 0:
      return 0
    render_pass.set_vertex_buffer(1, face.instance_buffer)
    render_pass.draw(12, int(face.instance_count), int(face_idx) * 12, 0)
    return int(face.instance_count)

  @staticmethod
  def _front_facing_world_rows(rows: np.ndarray, *, face_idx: int, eye: Vec3) -> np.ndarray:
    data = np.asarray(rows, dtype=np.float32)
    if data.ndim != 2 or int(data.shape[0]) <= 0:
      return np.zeros((0, 12), dtype=np.float32)
    fi = int(face_idx)
    axis = 0 if fi in (0, 1) else (1 if fi in (2, 3) else 2)
    positive = fi in (0, 2, 4)
    surface = data[:, axis + (3 if positive else 0)]
    eye_value = (float(eye.x), float(eye.y), float(eye.z))[axis]
    visible = (float(eye_value) - surface) > 0.0 if positive else (float(eye_value) - surface) < 0.0
    return np.ascontiguousarray(data[visible], dtype=np.float32)

  def _upload_temp_face_buckets(self, face_buckets: list[np.ndarray] | tuple[np.ndarray, ...], *, label: str) -> list[WgpuFaceInstances | None]:
    if self._res is None:
      return [None for _ in range(FACE_COUNT)]
    out: list[WgpuFaceInstances | None] = []
    for face_idx in range(FACE_COUNT):
      rows = face_buckets[face_idx] if face_idx < len(face_buckets) else None
      out.append(upload_face_rows(device=self._res.device, label=f"{label}-face-{face_idx}", rows=rows))
    return out

  def _upload_temp_transform_face_buckets(self, face_buckets: list[np.ndarray] | tuple[np.ndarray, ...], *, label: str) -> list[WgpuFaceInstances | None]:
    if self._res is None:
      return [None for _ in range(FACE_COUNT)]
    out: list[WgpuFaceInstances | None] = []
    for face_idx in range(FACE_COUNT):
      rows = face_buckets[face_idx] if face_idx < len(face_buckets) else None
      out.append(upload_transform_face_rows(device=self._res.device, label=f"{label}-face-{face_idx}", rows=rows))
    return out

  def _third_person_held_block_face_rows(self, pose: HeldBlockPose | None) -> tuple[np.ndarray, ...]:
    if pose is None or self._visuals is None:
      return empty_textured_face_rows()

    boxes = list(held_block_model_boxes_for_kind(pose.block_kind))
    if not boxes:
      return empty_textured_face_rows()

    kind = "" if pose.block_kind is None else str(pose.block_kind)
    buffers: list[list[list[float]]] = [[] for _ in range(FACE_COUNT)]
    local_boxes = [textured_box.box for textured_box in boxes]
    for textured_box in boxes:
      for face_idx in range(FACE_COUNT):
        if is_local_face_occluded(box=textured_box.box, face_idx=int(face_idx), boxes=local_boxes):
          continue
        texture_uv = self._visuals.atlas_uv_face(str(pose.block_id), int(face_idx))
        uv_rect = atlas_face_uv(texture_uv, int(face_idx), textured_box.box, kind=kind, face_uv_pixels=textured_box.face_uv_pixels)
        model = model_matrix_for_local_box(pose.parent_transform, textured_box.box)
        append_face_instance(buffers, int(face_idx), model, uv_rect)
    return face_rows_from_buffers(buffers)

  def _draw_transform_buckets(self, render_pass, *, buckets: tuple[np.ndarray, ...] | list[np.ndarray], texture_bind_group, label: str, camera_bind_groups: tuple[object, ...] | None = None, pipeline=None) -> tuple[int, int, list[WgpuFaceInstances]]:
    if self._res is None or texture_bind_group is None:
      return (0, 0, [])
    frame_bgs = self._res.camera_bind_groups if camera_bind_groups is None else tuple(camera_bind_groups)
    uploaded = self._upload_temp_transform_face_buckets(buckets, label=label)
    live_uploads: list[WgpuFaceInstances] = []
    draw_calls = 0
    instances = 0
    render_pass.set_pipeline(self._res.textured_face_pipeline if pipeline is None else pipeline)
    render_pass.set_bind_group(1, texture_bind_group)
    render_pass.set_vertex_buffer(0, self._res.face_vertex_buffer)
    for face_idx, face in enumerate(uploaded):
      if face is None:
        continue
      live_uploads.append(face)
      render_pass.set_bind_group(0, frame_bgs[int(face_idx)])
      count = self._draw_face_instances(render_pass, face_idx=int(face_idx), face=face)
      if count <= 0:
        continue
      draw_calls += 1
      instances += int(count)
    return (int(draw_calls), int(instances), live_uploads)

  def render(
    self,
    *,
    w: int,
    h: int,
    eye: Vec3,
    yaw_deg: float,
    pitch_deg: float,
    roll_deg: float = 0.0,
    fov_deg: float,
    render_distance_chunks: int,
    player_state: PlayerRenderState | None = None,
    extra_player_states: tuple[PlayerRenderState, ...] = (),
    name_tags: tuple[NameTagRenderState, ...] = (),
    othello_state: OthelloRenderState | None = None,
    falling_blocks: tuple[FallingBlockRenderSampleDTO, ...] = (),
    block_break_particles: tuple[BlockBreakParticleRenderSampleDTO, ...] = (),
  ) -> None:
    del roll_deg
    if self._res is None or not bool(self._initialized):
      return
    import wgpu

    t0 = time.perf_counter()
    width = max(1, int(w))
    height = max(1, int(h))
    self._ensure_depth_target(width=width, height=height)
    if self._res.depth_view is None:
      return

    z_far = float(self._cfg.camera.z_far)
    fog_color = self._cfg.sky.clear_color
    world_fog_start, world_fog_end = render_distance_fog_range(int(render_distance_chunks), float(z_far))
    world_fog = GeometryDistanceFog(cam_x=float(eye.x), cam_y=float(eye.y), cam_z=float(eye.z), start=float(world_fog_start), end=float(world_fog_end), color=fog_color)
    cloud_fog_start, cloud_fog_end = cloud_fog_range(int(render_distance_chunks))
    cloud_fog = CloudDistanceFog(cam_x=float(eye.x), cam_z=float(eye.z), start=float(cloud_fog_start), end=float(cloud_fog_end), color=fog_color)

    self._effective_shadow = effective_backend_shadow_params(self._cfg.shadow, int(self._state.shadow_quality))
    shadow_coverage_radius = max(float(self._effective_shadow.coverage_radius), float(max_unfogged_render_distance_radius_blocks(float(z_far))))

    view_proj = self._camera_view_proj(width=width, height=height, eye=eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), fov_deg=float(fov_deg))
    forward = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
    othello_rows: tuple[np.ndarray, np.ndarray, np.ndarray] | None = None
    if othello_state is not None and bool(othello_state.enabled):
      othello_rows = build_othello_instance_rows(othello_state)
    sel_block = self._selection_cell
    sel_mode = 1 if sel_block is not None and bool(self._state.outline_selection_enabled) else (2 if sel_block is not None else 0)
    shadow_requested = bool(self._state.shadow_enabled or self._state.debug_shadow)
    light_view_proj = self._light_view_proj(center=eye, coverage_radius=float(shadow_coverage_radius)) if bool(shadow_requested) else view_proj
    player_poses: list[PlayerModelPose] = []
    for state in (player_state, *tuple(extra_player_states)):
      if state is None:
        continue
      player_poses.append(build_player_model_pose(state))

    current_texture = self._res.context.get_current_texture()
    color_view = current_texture.create_view()
    encoder = self._res.device.create_command_encoder(label="ludoxel-frame")
    temp_uniform_buffers: list[object] = []
    shadow_draw_calls = 0
    shadow_instances = 0
    shadow_ok = False
    if bool(shadow_requested) and self._ensure_shadow_target() and self._res.shadow_view is not None:
      shadow_uniform_buffers, shadow_uniform_bind_groups = self._create_frame_uniform_bind_groups(label="ludoxel-shadow-frame", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=0.0, sel_mode=0, sel_block=None, shadow_enabled=False, debug_shadow=False)
      temp_uniform_buffers.extend(shadow_uniform_buffers)
      shadow_pass = encoder.begin_render_pass(label="ludoxel-shadow-pass", color_attachments=[], depth_stencil_attachment={"view": self._res.shadow_view, "depth_clear_value": 1.0, "depth_load_op": wgpu.LoadOp.clear, "depth_store_op": wgpu.StoreOp.store})
      shadow_pass.set_pipeline(self._res.shadow_depth_pipeline)
      shadow_pass.set_vertex_buffer(0, self._res.face_vertex_buffer)
      for face_idx in range(FACE_COUNT):
        shadow_pass.set_bind_group(0, shadow_uniform_bind_groups[int(face_idx)])
        for mesh in tuple(self._chunks.values()):
          face = mesh.face(int(face_idx))
          if face is None:
            continue
          count = self._draw_face_instances(shadow_pass, face_idx=int(face_idx), face=face)
          if count <= 0:
            continue
          shadow_draw_calls += 1
          shadow_instances += int(count)
      for pose_idx, pose in enumerate(player_poses):
        player_shadow_dc, player_shadow_instances = self._draw_transform_shadow_rows(shadow_pass, uniform_bind_group=shadow_uniform_bind_groups[0], rows=pose.shadow_rows, label=f"ludoxel-player-shadow-temp-{pose_idx}", temp_buffers=temp_uniform_buffers)
        shadow_draw_calls += int(player_shadow_dc)
        shadow_instances += int(player_shadow_instances)
      if othello_rows is not None:
        _board_rows, _highlight_rows, othello_piece_rows = othello_rows
        othello_shadow_dc, othello_shadow_instances = self._draw_othello_shadow_rows(shadow_pass, uniform_bind_group=shadow_uniform_bind_groups[0], rows=othello_piece_rows, label="ludoxel-othello-shadow-piece-temp", temp_buffers=temp_uniform_buffers)
        shadow_draw_calls += int(othello_shadow_dc)
        shadow_instances += int(othello_shadow_instances)
      shadow_pass.end()
      shadow_ok = bool(int(shadow_instances) > 0)

    self._last_shadow_ok = bool(shadow_ok)
    self._last_shadow_size = int(getattr(self._res, "shadow_size", 0) or 0)
    self._last_shadow_instances = int(shadow_instances)
    shadow_sampling_ok = bool(shadow_requested and self._res.shadow_bind_group is not None and self._res.shadow_view is not None and self._res.shadow_sampler is not None and shadow_ok)
    ultra_visuals = bool(int(self._state.shadow_quality) >= int(SHADOW_MAP_QUALITY_ULTRA))
    if othello_rows is not None and self._res.shadow_bind_group is None:
      self._ensure_shadow_target()
    world_uniform_buffers, world_uniform_bind_groups = self._create_frame_uniform_bind_groups(
      label="ludoxel-world-frame", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=0.55, sel_mode=int(sel_mode), sel_block=sel_block, shadow_enabled=bool(shadow_sampling_ok), debug_shadow=bool(self._state.debug_shadow), fog=world_fog, ultra=bool(ultra_visuals)
    )
    temp_uniform_buffers.extend(world_uniform_buffers)
    temp_uploads: list[WgpuFaceInstances] = []
    render_pass = encoder.begin_render_pass(
      label="ludoxel-main-pass",
      color_attachments=[{"view": color_view, "resolve_target": None, "clear_value": (float(fog_color.x), float(fog_color.y), float(fog_color.z), 1.0), "load_op": wgpu.LoadOp.clear, "store_op": wgpu.StoreOp.store}],
      depth_stencil_attachment={"view": self._res.depth_view, "depth_clear_value": 1.0, "depth_load_op": wgpu.LoadOp.clear, "depth_store_op": wgpu.StoreOp.store},
    )

    draw_calls = 0
    instances = 0
    # Draw the veiling glare, the sun disc, and the lens flare as background, before the world pass. All three write no depth, and the opaque world
    # drawn next overdraws them, so world geometry nearer than the sun occludes them at the terrain silhouette instead of the glow being painted over
    # foreground blocks. A block that hides the sun therefore hides its glare and flare.
    if bool(ultra_visuals):
      glare_strength = sun_glare_strength(forward, self._state.sun_dir)
      if glare_strength > 0.0:
        glare_buffer, glare_bind_group = self._create_sun_glare_uniform_bind_group(view_proj=view_proj, eye=eye, forward=forward, strength=float(glare_strength))
        if glare_buffer is not None:
          temp_uniform_buffers.append(glare_buffer)
        if glare_bind_group is not None and self._res.sun_glare_pipeline is not None:
          render_pass.set_pipeline(self._res.sun_glare_pipeline)
          render_pass.set_bind_group(0, glare_bind_group)
          render_pass.draw(6, 1, 0, 0)
          draw_calls += 1
    sun_uniform_buffer, sun_uniform_bind_group = self._create_sun_uniform_bind_group(view_proj=view_proj, eye=eye, ultra=bool(ultra_visuals))
    if sun_uniform_buffer is not None:
      temp_uniform_buffers.append(sun_uniform_buffer)
    if sun_uniform_bind_group is not None:
      render_pass.set_pipeline(self._res.sun_pipeline)
      render_pass.set_bind_group(0, sun_uniform_bind_group)
      render_pass.draw(6, 1, 0, 0)
      draw_calls += 1
    if bool(ultra_visuals) and self._res.sun_flare_pipeline is not None:
      flare_x, flare_y, flare_strength = sun_flare_screen(view_proj, self._state.sun_dir, eye, forward, float(self._cfg.sun.distance))
      if flare_strength > 0.0:
        flare_buffer, flare_bind_group = self._create_sun_flare_uniform_bind_group(sun_ndc=(float(flare_x), float(flare_y)), strength=float(flare_strength), aspect=float(width) / max(float(height), 1.0))
        if flare_buffer is not None:
          temp_uniform_buffers.append(flare_buffer)
        if flare_bind_group is not None:
          render_pass.set_pipeline(self._res.sun_flare_pipeline)
          render_pass.set_bind_group(0, flare_bind_group)
          render_pass.draw(3, 1, 0, 0)
          draw_calls += 1

    use_shadow_pipeline = bool(shadow_requested and self._res.shadow_bind_group is not None)
    if bool(self._state.world_wireframe):
      render_pass.set_pipeline(self._res.world_wireframe_pipeline)
      render_pass.set_vertex_buffer(0, self._res.face_wire_vertex_buffer)
      for face_idx in range(FACE_COUNT):
        render_pass.set_bind_group(0, world_uniform_bind_groups[int(face_idx)])
        for mesh in tuple(self._chunks.values()):
          face = mesh.face(int(face_idx))
          if face is None:
            continue
          visible_rows = self._front_facing_world_rows(face.rows, face_idx=int(face_idx), eye=eye)
          visible_face = upload_face_rows(device=self._res.device, label=f"ludoxel-world-wireframe-face-{face_idx}", rows=visible_rows)
          if visible_face is None:
            continue
          temp_uploads.append(visible_face)
          count = self._draw_wire_face_instances(render_pass, face_idx=int(face_idx), face=visible_face)
          if count <= 0:
            continue
          draw_calls += 1
          instances += int(count)
    else:
      render_pass.set_pipeline(self._res.world_shadowed_pipeline if bool(use_shadow_pipeline) else self._res.world_pipeline)
      render_pass.set_bind_group(1, self._res.atlas_bind_group)
      if bool(use_shadow_pipeline):
        render_pass.set_bind_group(2, self._res.shadow_bind_group)
      render_pass.set_vertex_buffer(0, self._res.face_vertex_buffer)
      for face_idx in range(FACE_COUNT):
        render_pass.set_bind_group(0, world_uniform_bind_groups[int(face_idx)])
        for mesh in tuple(self._chunks.values()):
          face = mesh.face(int(face_idx))
          if face is None:
            continue
          count = self._draw_face_instances(render_pass, face_idx=int(face_idx), face=face)
          if count <= 0:
            continue
          draw_calls += 1
          instances += int(count)

    if self._visuals is not None:
      falling_rows = build_falling_block_face_rows(samples=tuple(falling_blocks), uv_lookup=self._visuals.atlas_uv_face, def_lookup=self._visuals.def_lookup)
      falling_uniform_buffers, falling_uniform_bind_groups = self._create_frame_uniform_bind_groups(label="ludoxel-falling-block-frame", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=0.0, sel_mode=0, sel_block=None, fog=world_fog)
      temp_uniform_buffers.extend(falling_uniform_buffers)
      dc, inst, uploads = self._draw_transform_buckets(render_pass, buckets=falling_rows, texture_bind_group=self._res.atlas_bind_group, label="ludoxel-falling-block-temp", camera_bind_groups=falling_uniform_bind_groups)
      draw_calls += int(dc)
      instances += int(inst)
      temp_uploads.extend(uploads)

    if tuple(block_break_particles):
      particle_rows = build_block_break_particle_face_rows(samples=tuple(block_break_particles), camera_forward=forward)
      particle_uniform_buffers, particle_uniform_bind_groups = self._create_frame_uniform_bind_groups(label="ludoxel-block-break-particle-frame", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=0.0, sel_mode=0, sel_block=None, fog=world_fog)
      temp_uniform_buffers.extend(particle_uniform_buffers)
      dc, inst, uploads = self._draw_transform_buckets(render_pass, buckets=particle_rows, texture_bind_group=self._res.atlas_bind_group, label="ludoxel-block-break-particle-temp", camera_bind_groups=particle_uniform_bind_groups)
      draw_calls += int(dc)
      instances += int(inst)
      temp_uploads.extend(uploads)

    for pose_idx, pose in enumerate(player_poses):
      skin_bind_group = self._res.skin_bind_group
      if pose.skin_texture_key is not None:
        skin_bind_group = self._ai_skin_bind_groups.get(str(pose.skin_texture_key), skin_bind_group)
      if skin_bind_group is not None:
        player_uniform_buffers, player_uniform_bind_groups = self._create_frame_uniform_bind_groups(label=f"ludoxel-player-skin-frame-{pose_idx}", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=float(max(0.0, min(1.0, float(pose.hurt_tint_strength)))), sel_mode=0, sel_block=None, fog=world_fog)
        temp_uniform_buffers.extend(player_uniform_buffers)
        dc, inst, uploads = self._draw_transform_buckets(render_pass, buckets=pose.skin_face_rows, texture_bind_group=skin_bind_group, label=f"ludoxel-player-skin-temp-{pose_idx}", camera_bind_groups=player_uniform_bind_groups)
        draw_calls += int(dc)
        instances += int(inst)
        temp_uploads.extend(uploads)
      held_rows = self._third_person_held_block_face_rows(pose.held_block_pose)
      held_uniform_buffers, held_uniform_bind_groups = self._create_frame_uniform_bind_groups(label=f"ludoxel-player-held-frame-{pose_idx}", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=0.0, sel_mode=0, sel_block=None, fog=world_fog)
      temp_uniform_buffers.extend(held_uniform_buffers)
      dc, inst, uploads = self._draw_transform_buckets(render_pass, buckets=held_rows, texture_bind_group=self._res.atlas_bind_group, label=f"ludoxel-player-held-temp-{pose_idx}", camera_bind_groups=held_uniform_bind_groups)
      draw_calls += int(dc)
      instances += int(inst)
      temp_uploads.extend(uploads)

    if othello_rows is not None and self._res.shadow_bind_group is not None:
      othello_uniform_buffers, othello_uniform_bind_groups = self._create_frame_uniform_bind_groups(
        label="ludoxel-othello-frame", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=0.0, sel_mode=0, sel_block=None, shadow_enabled=bool(shadow_sampling_ok), debug_shadow=bool(self._state.debug_shadow), fog=world_fog
      )
      temp_uniform_buffers.extend(othello_uniform_buffers)
      board_rows, highlight_rows, piece_rows = othello_rows
      othello_bg = othello_uniform_bind_groups[0]
      dc, inst = self._draw_othello_rows(
        render_pass,
        pipeline=self._res.othello_pipeline,
        uniform_bind_group=othello_bg,
        shadow_bind_group=self._res.shadow_bind_group,
        vertex_buffer=self._res.othello_board_vertex_buffer,
        vertex_count=int(self._res.othello_board_vertex_count),
        rows=board_rows,
        label="ludoxel-othello-board-temp",
        temp_buffers=temp_uniform_buffers,
      )
      draw_calls += int(dc)
      instances += int(inst)
      dc, inst = self._draw_othello_rows(
        render_pass,
        pipeline=self._res.othello_pipeline,
        uniform_bind_group=othello_bg,
        shadow_bind_group=self._res.shadow_bind_group,
        vertex_buffer=self._res.othello_piece_vertex_buffer,
        vertex_count=int(self._res.othello_piece_vertex_count),
        rows=piece_rows,
        label="ludoxel-othello-piece-temp",
        temp_buffers=temp_uniform_buffers,
      )
      draw_calls += int(dc)
      instances += int(inst)
      dc, inst = self._draw_othello_rows(
        render_pass,
        pipeline=self._res.othello_overlay_pipeline,
        uniform_bind_group=othello_bg,
        shadow_bind_group=self._res.shadow_bind_group,
        vertex_buffer=self._res.othello_board_vertex_buffer,
        vertex_count=int(self._res.othello_board_vertex_count),
        rows=highlight_rows,
        label="ludoxel-othello-highlight-temp",
        temp_buffers=temp_uniform_buffers,
      )
      draw_calls += int(dc)
      instances += int(inst)

    self._advance_cloud_clock()
    if bool(self._state.cloud_enabled) and int(self._state.cloud_density) > 0:
      shift = self._cloud_field.shift(float(self._cloud_time_accum))
      # Three separated paths. Wireframe draws the exterior cell-face edges of the merged cloud footprint (no interior faces);
      # below the Ultra shadow map quality tier the flat path draws the same exterior faces solid;
      # the Ultra tier raymarches a translucent animated volume through one bounding box per cloud.
      cloud_wireframe = bool(self._state.cloud_wireframe)
      cloud_ultra = bool(ultra_visuals) and not cloud_wireframe
      cloud_shapes = self._cloud_field.visible_shapes(eye=eye, shift=shift, forward=forward, fov_deg=float(fov_deg), aspect=float(width) / max(float(height), 1.0), z_far=float(cloud_far_distance(int(render_distance_chunks))))
      if cloud_shapes:
        if cloud_ultra:
          # Draw the translucent volumes back to front so a nearer cloud blends over the ones behind it instead of hiding them.
          cloud_shapes = sorted(cloud_shapes, key=lambda s: -((float(s.bounds.center.x) + float(shift.x) * float(s.bounds.speed_multiplier) - float(eye.x)) ** 2 + (float(s.bounds.center.y) - float(eye.y)) ** 2 + (float(s.bounds.center.z) + float(shift.z) * float(s.bounds.speed_multiplier) - float(eye.z)) ** 2))
        # Clouds use their own far plane so the cloud fade range is not clipped by the world camera far plane;
        # the Ultra volume pipeline does not write depth, so the projection difference does not feed back into the world depth buffer.
        cloud_view_proj = self._camera_view_proj(width=width, height=height, eye=eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), fov_deg=float(fov_deg), z_far=float(cloud_projection_z_far(int(render_distance_chunks), float(z_far))))
        cloud_uniform_buffer, cloud_uniform_bind_group = self._create_cloud_uniform_bind_group(view_proj=cloud_view_proj, shift=shift, eye=eye, time_s=float(self._cloud_time_accum), flow_dir_xz=self._cloud_field.flow_dir_xz(), cell_size=float(self._cloud_field.cell_size()), fog=cloud_fog)
        if cloud_uniform_buffer is not None:
          temp_uniform_buffers.append(cloud_uniform_buffer)
        if cloud_uniform_bind_group is not None:
          if cloud_ultra:
            volume_rows = cloud_volume_rows(cloud_shapes)
            volume_buffer, volume_count = self._upload_temp_rows(label="ludoxel-cloud-volume-temp", rows=volume_rows)
            if volume_buffer is not None and int(volume_count) > 0:
              temp_uniform_buffers.append(volume_buffer)
              render_pass.set_pipeline(self._res.cloud_volume_pipeline)
              render_pass.set_bind_group(0, cloud_uniform_bind_group)
              render_pass.set_vertex_buffer(0, self._res.cloud_cube_vertex_buffer)
              render_pass.set_vertex_buffer(1, volume_buffer)
              render_pass.draw(int(self._res.cloud_cube_vertex_count), int(volume_count), 0, 0)
              draw_calls += 1
              instances += int(volume_count)
          else:
            render_pass.set_pipeline(self._res.cloud_wireframe_pipeline if cloud_wireframe else self._res.cloud_pipeline)
            render_pass.set_bind_group(0, cloud_uniform_bind_group)
            render_pass.set_vertex_buffer(0, self._res.face_wire_vertex_buffer if cloud_wireframe else self._res.face_vertex_buffer)
            verts_per_face = 12 if cloud_wireframe else 6
            for face_idx in range(FACE_COUNT):
              face_rows = cloud_face_rows(cloud_shapes, int(face_idx))
              face_buffer, face_count = self._upload_temp_rows(label=f"ludoxel-cloud-face-{face_idx}", rows=face_rows)
              if face_buffer is None or int(face_count) <= 0:
                continue
              temp_uniform_buffers.append(face_buffer)
              render_pass.set_vertex_buffer(1, face_buffer)
              render_pass.draw(int(verts_per_face), int(face_count), int(face_idx) * int(verts_per_face), 0)
              draw_calls += 1
              instances += int(face_count)

    live_name_tag_ids: set[str] = set()
    for tag in tuple(name_tags):
      cached = self._name_tag_bind_group_for(tag)
      if cached is None:
        continue
      bind_group, spec = cached
      live_name_tag_ids.add(str(tag.tag_id))
      tag_rows = build_name_tag_face_rows(tag, spec)
      dc, inst, uploads = self._draw_transform_buckets(render_pass, buckets=tag_rows, texture_bind_group=bind_group, label=f"ludoxel-name-tag-temp-{len(live_name_tag_ids)}", camera_bind_groups=world_uniform_bind_groups, pipeline=self._res.name_tag_pipeline)
      draw_calls += int(dc)
      instances += int(inst)
      temp_uploads.extend(uploads)
    self._destroy_name_tag_gpu_resources(keep_ids=live_name_tag_ids)

    if self._selection_buffer is not None and self._selection_vertex_count > 0 and bool(self._state.outline_selection_enabled):
      selection_uniform_buffers, selection_uniform_bind_groups = self._create_frame_uniform_bind_groups(label="ludoxel-selection-frame", view_proj=view_proj, light_view_proj=light_view_proj, tint_value=0.0, sel_mode=0, sel_block=None)
      temp_uniform_buffers.extend(selection_uniform_buffers)
      render_pass.set_pipeline(self._res.selection_pipeline)
      render_pass.set_bind_group(0, selection_uniform_bind_groups[0])
      render_pass.set_vertex_buffer(0, self._selection_buffer)
      render_pass.draw(int(self._selection_vertex_count), 1, 0, 0)
      draw_calls += 1

    render_pass.end()

    first_person = None if player_state is None else player_state.first_person
    if first_person is not None and bool(first_person.show_view_model) and self._visuals is not None:
      hand_fov = float(fov_deg if float(fov_deg) <= 80.0 else 80.0 + (float(fov_deg) - 80.0) * 0.20)
      hand_vp = self._hand_view_proj(width=width, height=height, fov_deg=hand_fov)
      hand_fit_proj = self._hand_fit_projection(width=width, height=height, fov_deg=hand_fov)
      hand_rows = empty_textured_face_rows()
      hand_bind_group = self._res.atlas_bind_group
      hand_label = "ludoxel-first-person-empty"
      tint_mix = 0.0
      if first_person.visible_special_item_icon is not None:
        icon_key = str(first_person.visible_special_item_icon)
        special_bind_group = self._special_item_bind_groups.get(icon_key)
        if special_bind_group is not None:
          hand_rows = build_first_person_special_item_face_rows(first_person, projection=hand_fit_proj)
          hand_bind_group = special_bind_group
          hand_label = f"ludoxel-first-person-special-item-{icon_key}-temp"
      elif first_person.visible_block_id is not None:
        hand_rows = build_first_person_held_block_face_rows(first_person, projection=hand_fit_proj, uv_lookup=self._visuals.atlas_uv_face, def_lookup=self._visuals.def_lookup)
        hand_label = "ludoxel-first-person-held-temp"
      elif bool(first_person.show_arm) and self._res.skin_bind_group is not None:
        skin_w, skin_h = self._skin_size
        hand_rows = build_first_person_arm_face_rows(first_person, projection=hand_fit_proj, skin_width=int(max(1, skin_w)), skin_height=int(max(1, skin_h)))
        hand_bind_group = self._res.skin_bind_group
        hand_label = "ludoxel-first-person-arm-temp"
        tint_mix = float(0.0 if player_state is None else player_state.hurt_tint_strength)

      hand_uniform_buffers, hand_uniform_bind_groups = self._create_frame_uniform_bind_groups(label="ludoxel-first-person-frame", view_proj=hand_vp, tint_value=float(tint_mix), sel_mode=0, sel_block=None)
      temp_uniform_buffers.extend(hand_uniform_buffers)
      hand_pass = encoder.begin_render_pass(
        label="ludoxel-first-person-pass",
        color_attachments=[{"view": color_view, "resolve_target": None, "load_op": wgpu.LoadOp.load, "store_op": wgpu.StoreOp.store}],
        depth_stencil_attachment={"view": self._res.depth_view, "depth_clear_value": 1.0, "depth_load_op": wgpu.LoadOp.clear, "depth_store_op": wgpu.StoreOp.store},
      )
      dc, inst, uploads = self._draw_transform_buckets(hand_pass, buckets=hand_rows, texture_bind_group=hand_bind_group, label=hand_label, camera_bind_groups=hand_uniform_bind_groups)
      draw_calls += int(dc)
      instances += int(inst)
      temp_uploads.extend(uploads)
      hand_pass.end()

    self._res.device.queue.submit([encoder.finish()])
    for face in temp_uploads:
      face.destroy()
    for buffer in temp_uniform_buffers:
      if buffer is not None and hasattr(buffer, "destroy"):
        buffer.destroy()

    elapsed_ms = float((time.perf_counter() - t0) * 1000.0)
    self._last_metrics = BackendRendererFrameMetrics(world=BackendPassFrameMetrics(cpu_ms=elapsed_ms, draw_calls=int(draw_calls), instances=int(instances), rendered=True), shadow=BackendPassFrameMetrics(cpu_ms=0.0, draw_calls=int(shadow_draw_calls), instances=int(shadow_instances), rendered=bool(shadow_ok)))

  def set_player_skin_image(self, image: QImage) -> None:
    self._player_skin_image = QImage(image)
    if self._res is None or self._player_skin_image.isNull():
      return
    if self._skin_texture is not None and hasattr(self._skin_texture, "destroy"):
      self._skin_texture.destroy()
    texture, view, sampler, bind_group, width, height = _create_texture_bind_group(device=self._res.device, layout=self._res.atlas_bind_group_layout, label="ludoxel-player-skin", image=self._player_skin_image, mirror_y=True)
    self._skin_texture = texture
    self._skin_texture_view = view
    self._skin_sampler = sampler
    self._skin_size = (int(width), int(height))
    self._res.skin_bind_group = bind_group

  def _destroy_ai_skin_gpu_resources(self) -> None:
    for texture in self._ai_skin_textures.values():
      if texture is not None and hasattr(texture, "destroy"):
        texture.destroy()
    self._ai_skin_textures.clear()
    self._ai_skin_texture_views.clear()
    self._ai_skin_samplers.clear()
    self._ai_skin_bind_groups.clear()

  def _destroy_name_tag_gpu_resources(self, *, keep_ids: set[str] | None = None) -> None:
    keep = set() if keep_ids is None else {str(value) for value in keep_ids}
    for tag_id in list(self._name_tag_textures.keys()):
      if keep and str(tag_id) in keep:
        continue
      texture = self._name_tag_textures.pop(str(tag_id), None)
      if texture is not None and hasattr(texture, "destroy"):
        texture.destroy()
      self._name_tag_texture_views.pop(str(tag_id), None)
      self._name_tag_samplers.pop(str(tag_id), None)
      self._name_tag_bind_groups.pop(str(tag_id), None)
      self._name_tag_specs.pop(str(tag_id), None)
      self._name_tag_content_keys.pop(str(tag_id), None)

  def _name_tag_bind_group_for(self, tag: NameTagRenderState) -> tuple[object, NameTagTextureSpec] | None:
    if self._res is None:
      return None
    tag_id = str(tag.tag_id)
    key = name_tag_content_key(tag)
    bind_group = self._name_tag_bind_groups.get(tag_id)
    spec = self._name_tag_specs.get(tag_id)
    if bind_group is not None and spec is not None and self._name_tag_content_keys.get(tag_id) == key:
      return (bind_group, spec)
    self._destroy_name_tag_gpu_resources(keep_ids={existing_id for existing_id in self._name_tag_textures.keys() if str(existing_id) != tag_id})
    next_spec = render_name_tag_texture(tag)
    if next_spec is None:
      return None
    texture, view, sampler, next_bind_group, _width, _height = _create_texture_bind_group(device=self._res.device, layout=self._res.atlas_bind_group_layout, label=f"ludoxel-name-tag-{tag_id}", image=next_spec.image, mirror_y=True)
    self._name_tag_textures[tag_id] = texture
    self._name_tag_texture_views[tag_id] = view
    self._name_tag_samplers[tag_id] = sampler
    self._name_tag_bind_groups[tag_id] = next_bind_group
    self._name_tag_specs[tag_id] = next_spec
    self._name_tag_content_keys[tag_id] = key
    return (next_bind_group, next_spec)

  def _replace_ai_skin_gpu_resources(self) -> None:
    self._destroy_ai_skin_gpu_resources()
    if self._res is None:
      return
    textures: dict[str, object] = {}
    texture_views: dict[str, object] = {}
    samplers: dict[str, object] = {}
    bind_groups: dict[str, object] = {}
    try:
      for skin_key, image in self._ai_skin_images.items():
        texture, view, sampler, bind_group, _width, _height = _create_texture_bind_group(device=self._res.device, layout=self._res.atlas_bind_group_layout, label=f"ludoxel-ai-skin-{skin_key}", image=image, mirror_y=True)
        textures[str(skin_key)] = texture
        texture_views[str(skin_key)] = view
        samplers[str(skin_key)] = sampler
        bind_groups[str(skin_key)] = bind_group
    except Exception:
      for texture in textures.values():
        if texture is not None and hasattr(texture, "destroy"):
          texture.destroy()
      raise
    self._ai_skin_textures = textures
    self._ai_skin_texture_views = texture_views
    self._ai_skin_samplers = samplers
    self._ai_skin_bind_groups = bind_groups

  def set_ai_skin_images(self, images: dict[str, QImage]) -> None:
    self._ai_skin_images = {str(skin_key): normalize_player_skin_image(QImage(image)) for skin_key, image in images.items()}
    self._replace_ai_skin_gpu_resources()

  def render_player_preview_frame(self, *, width: int, height: int, player_state: PlayerRenderState | None, restore_framebuffer: int, restore_viewport: tuple[int, int, int, int], device_pixel_ratio: float = 1.0) -> QImage:
    del restore_framebuffer, restore_viewport
    if self._res is None or player_state is None or self._res.skin_bind_group is None:
      return QImage()
    import wgpu

    target_width = max(1, int(width))
    target_height = max(1, int(height))
    pose = build_player_model_pose(player_state)
    aspect = float(target_width) / max(1.0, float(target_height))
    view = mat4.look_dir(_PREVIEW_EYE, (_PREVIEW_TARGET - _PREVIEW_EYE).normalized())
    proj = mat4.perspective(float(_PREVIEW_FOV_DEG), float(aspect), float(_PREVIEW_NEAR), float(_PREVIEW_FAR))
    view_proj = mat4.mul(proj, view).astype(np.float32)

    color_texture = self._res.device.create_texture(label="ludoxel-preview-color", size=(int(target_width), int(target_height), 1), format=self._res.target_format, usage=wgpu.TextureUsage.RENDER_ATTACHMENT | wgpu.TextureUsage.COPY_SRC)
    depth_texture = self._res.device.create_texture(label="ludoxel-preview-depth", size=(int(target_width), int(target_height), 1), format=self._res.depth_format, usage=wgpu.TextureUsage.RENDER_ATTACHMENT)
    color_view = color_texture.create_view(label="ludoxel-preview-color-view")
    depth_view = depth_texture.create_view(label="ludoxel-preview-depth-view")
    uniform_buffers: list[object] = []
    temp_uploads: list[WgpuFaceInstances] = []
    try:
      skin_uniform_buffers, skin_uniform_bind_groups = self._create_frame_uniform_bind_groups(label="ludoxel-preview-frame", view_proj=view_proj, tint_value=float(max(0.0, min(1.0, float(pose.hurt_tint_strength)))), sel_mode=0, sel_block=None)
      uniform_buffers.extend(skin_uniform_buffers)
      encoder = self._res.device.create_command_encoder(label="ludoxel-preview-encoder")
      render_pass = encoder.begin_render_pass(
        label="ludoxel-preview-pass",
        color_attachments=[{"view": color_view, "resolve_target": None, "clear_value": (0.0, 0.0, 0.0, 0.0), "load_op": wgpu.LoadOp.clear, "store_op": wgpu.StoreOp.store}],
        depth_stencil_attachment={"view": depth_view, "depth_clear_value": 1.0, "depth_load_op": wgpu.LoadOp.clear, "depth_store_op": wgpu.StoreOp.store},
      )
      render_pass.set_pipeline(self._res.textured_face_pipeline)
      render_pass.set_vertex_buffer(0, self._res.face_vertex_buffer)
      _draw_calls, _instances, uploads = self._draw_transform_buckets(render_pass, buckets=pose.skin_face_rows, texture_bind_group=self._res.skin_bind_group, label="ludoxel-preview-player-temp", camera_bind_groups=skin_uniform_bind_groups)
      temp_uploads.extend(uploads)
      held_rows = self._third_person_held_block_face_rows(pose.held_block_pose)
      held_uniform_buffers, held_uniform_bind_groups = self._create_frame_uniform_bind_groups(label="ludoxel-preview-held-frame", view_proj=view_proj, tint_value=0.0, sel_mode=0, sel_block=None)
      uniform_buffers.extend(held_uniform_buffers)
      _held_draw_calls, _held_instances, held_uploads = self._draw_transform_buckets(render_pass, buckets=held_rows, texture_bind_group=self._res.atlas_bind_group, label="ludoxel-preview-held-temp", camera_bind_groups=held_uniform_bind_groups)
      temp_uploads.extend(held_uploads)
      render_pass.end()
      self._res.device.queue.submit([encoder.finish()])
      data = self._res.device.queue.read_texture({"texture": color_texture}, {"bytes_per_row": int(target_width) * 4, "rows_per_image": int(target_height)}, (int(target_width), int(target_height), 1))
      pixels = np.frombuffer(data, dtype=np.uint8).reshape((int(target_height), int(target_width), 4)).copy()
      if "bgra" in str(self._res.target_format).lower():
        pixels = pixels[:, :, [2, 1, 0, 3]]
      image = QImage(pixels.tobytes(), int(target_width), int(target_height), QImage.Format.Format_RGBA8888).copy()
      image.setDevicePixelRatio(max(1.0, float(device_pixel_ratio)))
      return image
    finally:
      for face in temp_uploads:
        face.destroy()
      for buffer in uniform_buffers:
        if buffer is not None and hasattr(buffer, "destroy"):
          buffer.destroy()
      for texture in (color_texture, depth_texture):
        if texture is not None and hasattr(texture, "destroy"):
          texture.destroy()
