# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

import numpy as np
from PyQt6.QtGui import QImage

from ludoxel.application.preferences.cloud_flow import DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION
from ludoxel.application.sessions.pipelines.render_snapshot import BlockBreakParticleRenderSampleDTO, FallingBlockRenderSampleDTO
from ludoxel.foundations.mathematics.chunks.grid import ChunkKey
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.runtime.backend import RendererBackend
from ludoxel.presentation.rendering.backends.opengl.runtime.metrics import RendererFrameMetrics
from ludoxel.presentation.rendering.contracts.config import BackendRendererParams, default_backend_renderer_params
from ludoxel.presentation.rendering.contracts.state import BackendRendererRuntimeState
from ludoxel.presentation.rendering.visuals.name_tags import NameTagRenderState
from ludoxel.presentation.rendering.visuals.othello.state import OthelloRenderState
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.simulation.blocks.registries.block import BlockRegistry


class GLRenderer:
  def __init__(self, params: BackendRendererParams | None = None) -> None:
    self._cfg = params or default_backend_renderer_params()

    self._state = BackendRendererRuntimeState(
      debug_shadow=False,
      shadow_enabled=True,
      world_wireframe=False,
      outline_selection_enabled=True,
      cloud_wireframe=False,
      cloud_enabled=True,
      cloud_density=int(self._cfg.clouds.rects_per_cell),
      cloud_cell_size=int(self._cfg.clouds.cell_size),
      cloud_seed=int(self._cfg.clouds.seed),
      cloud_flow_direction=DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION,
      cloud_speed_variation_enabled=bool(self._cfg.clouds.speed_variation_enabled),
      cloud_speed_min_blocks_per_second=float(self._cfg.clouds.speed_min_blocks_per_second),
      cloud_speed_max_blocks_per_second=float(self._cfg.clouds.speed_max_blocks_per_second),
      cloud_height_variation_enabled=bool(self._cfg.clouds.height_variation_enabled),
      cloud_fixed_y=int(self._cfg.clouds.y),
      cloud_spawn_y_min=int(self._cfg.clouds.spawn_y_min),
      cloud_spawn_y_max=int(self._cfg.clouds.spawn_y_max),
      cloud_preferred_y_min=int(self._cfg.clouds.preferred_y_min),
      cloud_preferred_y_max=int(self._cfg.clouds.preferred_y_max),
      cloud_preferred_y_probability_percent=int(self._cfg.clouds.preferred_y_probability_percent),
      sun_azimuth_deg=float(self._cfg.sun.azimuth_deg),
      sun_elevation_deg=float(self._cfg.sun.elevation_deg),
    )

    self._backend = RendererBackend(cfg=self._cfg, state=self._state, sel_tint_strength=0.55)

  def initialize(self, assets_dir: Path, *, block_registry: BlockRegistry) -> None:
    self._backend.initialize(Path(assets_dir), block_registry=block_registry)

  def destroy(self) -> None:
    self._backend.destroy()

  def gl_info(self) -> tuple[str, str, str, str]:
    return self._backend.gl_info()

  def frame_metrics(self) -> RendererFrameMetrics:
    return self._backend.frame_metrics()

  def set_cloud_wireframe(self, on: bool) -> None:
    self._state.cloud_wireframe = bool(on)
    self._backend.apply_runtime_state()

  def set_cloud_enabled(self, on: bool) -> None:
    self._state.cloud_enabled = bool(on)
    self._backend.apply_runtime_state()

  def set_animated_textures_enabled(self, on: bool) -> None:
    self._state.animated_textures_enabled = bool(on)
    self._backend.apply_runtime_state()

  def set_cloud_density(self, density: int) -> None:
    self._state.set_cloud_density(int(density))
    self._backend.apply_runtime_state()

  def set_cloud_cell_size(self, cell_size: int) -> None:
    self._state.set_cloud_cell_size(int(cell_size))
    self._backend.apply_runtime_state()

  def set_cloud_seed(self, seed: int) -> None:
    self._state.set_cloud_seed(int(seed))
    self._backend.apply_runtime_state()

  def set_cloud_flow_direction(self, direction: str) -> None:
    self._state.set_cloud_flow_direction(str(direction))
    self._backend.apply_runtime_state()

  def set_cloud_speed_variation(self, enabled: bool, min_speed: float, max_speed: float) -> None:
    self._state.set_cloud_speed_variation(bool(enabled), float(min_speed), float(max_speed))
    self._backend.apply_runtime_state()

  def set_cloud_height_variation(self, enabled: bool, fixed_y: int, spawn_y_min: int, spawn_y_max: int, preferred_y_min: int, preferred_y_max: int, preferred_y_probability_percent: int) -> None:
    self._state.set_cloud_height_variation(bool(enabled), int(fixed_y), int(spawn_y_min), int(spawn_y_max), int(preferred_y_min), int(preferred_y_max), int(preferred_y_probability_percent))
    self._backend.apply_runtime_state()

  def set_cloud_motion_paused(self, on: bool) -> None:
    self._backend.set_cloud_motion_paused(bool(on))

  def set_texture_animation_paused(self, on: bool) -> None:
    self._backend.set_texture_animation_paused(bool(on))

  def set_world_wireframe(self, on: bool) -> None:
    self._state.world_wireframe = bool(on)

  def set_shadow_enabled(self, on: bool) -> None:
    self._state.shadow_enabled = bool(on)

  def set_shadow_map_quality(self, quality: int) -> None:
    self._state.set_shadow_quality(int(quality))

  def set_debug_shadow(self, on: bool) -> None:
    self._state.debug_shadow = bool(on)

  def set_outline_selection_enabled(self, on: bool) -> None:
    self._state.outline_selection_enabled = bool(on)
    self._backend.apply_runtime_state()

  def evict_chunks(self, *, keep_chunks: set[ChunkKey]) -> None:
    self._backend.evict_chunks(keep_chunks=keep_chunks)

  def clear_selection(self) -> None:
    self._backend.clear_selection()

  def set_selection_target(self, *, x: int, y: int, z: int, state_str: str, get_state, world_revision: int) -> None:
    self._backend.set_selection_target(x=int(x), y=int(y), z=int(z), state_str=str(state_str), get_state=get_state, world_revision=int(world_revision))

  def sun_angles(self) -> tuple[float, float]:
    return (float(self._state.sun_azimuth_deg), float(self._state.sun_elevation_deg))

  def set_sun_angles(self, azimuth_deg: float, elevation_deg: float) -> None:
    self._state.set_sun_angles(float(azimuth_deg), float(elevation_deg))

  def sun_dir(self) -> Vec3:
    return self._state.sun_dir

  def shadow_info(self) -> tuple[bool, int]:
    return self._backend.shadow_info()

  def shadow_status_text(self) -> str:
    ok, _size = self.shadow_info()
    return "SHADOWMAP_ON" if ok else "SHADOWMAP_OFF"

  def payload_validation_report(self) -> object | None:
    return self._backend.payload_validation_report()

  def atlas_uv_face(self, block_state_id: str, face_idx: int) -> tuple[float, float, float, float]:
    return self._backend.atlas_uv_face(str(block_state_id), int(face_idx))

  def world_build_tools(self):
    return self._backend.world_build_tools()

  def block_display_name(self, block_state_or_id: str) -> str:
    return self._backend.block_display_name(str(block_state_or_id))

  def submit_chunk(self, *, chunk_key: ChunkKey, world_revision: int, faces: list[np.ndarray] | None = None, shadow_faces: list[np.ndarray] | None = None, gpu_face_sources=None, gpu_bucket_counts=None) -> None:
    self._backend.submit_chunk(chunk_key=chunk_key, world_revision=int(world_revision), faces=faces, shadow_faces=shadow_faces, gpu_face_sources=gpu_face_sources, gpu_bucket_counts=gpu_bucket_counts)

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
    self._backend.render(
      w=int(w),
      h=int(h),
      eye=eye,
      yaw_deg=float(yaw_deg),
      pitch_deg=float(pitch_deg),
      roll_deg=float(roll_deg),
      fov_deg=float(fov_deg),
      render_distance_chunks=int(render_distance_chunks),
      player_state=player_state,
      extra_player_states=tuple(extra_player_states),
      name_tags=tuple(name_tags),
      othello_state=othello_state,
      falling_blocks=falling_blocks,
      block_break_particles=block_break_particles,
    )

  def set_player_skin_image(self, image: QImage) -> None:
    self._backend.set_player_skin_image(image)

  def set_ai_skin_images(self, images: dict[str, QImage]) -> None:
    self._backend.set_ai_skin_images(dict(images))

  def render_player_preview_frame(self, *, w: int, h: int, player_state: PlayerRenderState | None, restore_framebuffer: int, restore_viewport: tuple[int, int, int, int], device_pixel_ratio: float = 1.0) -> QImage:
    return self._backend.render_player_preview_frame(width=int(w), height=int(h), player_state=player_state, restore_framebuffer=int(restore_framebuffer), restore_viewport=restore_viewport, device_pixel_ratio=float(device_pixel_ratio))
