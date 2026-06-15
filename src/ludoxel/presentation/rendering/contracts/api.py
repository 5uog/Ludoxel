# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path
from typing import Protocol

import numpy as np
from PyQt6.QtGui import QImage

from ludoxel.application.sessions.pipelines.render_snapshot import BlockBreakParticleRenderSampleDTO, FallingBlockRenderSampleDTO
from ludoxel.foundations.mathematics.chunks.grid import ChunkKey
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.visuals.othello.state import OthelloRenderState
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.simulation.blocks.registries.block import BlockRegistry


class BackendRendererApi(Protocol):
  def initialize(self, assets_dir: Path, *, block_registry: BlockRegistry) -> None: ...

  def destroy(self) -> None: ...

  def gl_info(self) -> tuple[str, str, str, str]: ...

  def shadow_info(self) -> tuple[bool, int]: ...

  def payload_validation_report(self) -> object | None: ...

  def frame_metrics(self): ...

  def apply_runtime_state(self) -> None: ...

  def set_cloud_motion_paused(self, on: bool) -> None: ...

  def set_texture_animation_paused(self, on: bool) -> None: ...

  def atlas_uv_face(self, block_state_id: str, face_idx: int) -> tuple[float, float, float, float]: ...

  def world_build_tools(self): ...

  def block_display_name(self, block_state_or_id: str) -> str: ...

  def evict_chunks(self, *, keep_chunks: set[ChunkKey]) -> None: ...

  def clear_selection(self) -> None: ...

  def set_selection_target(self, *, x: int, y: int, z: int, state_str: str, get_state, world_revision: int) -> None: ...

  def submit_chunk(
    self, *, chunk_key: ChunkKey, world_revision: int, faces: list[np.ndarray] | None = None, shadow_faces: list[np.ndarray] | None = None, gpu_face_sources=None, gpu_bucket_counts=None
  ) -> None: ...

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
    othello_state: OthelloRenderState | None = None,
    falling_blocks: tuple[FallingBlockRenderSampleDTO, ...] = (),
    block_break_particles: tuple[BlockBreakParticleRenderSampleDTO, ...] = (),
  ) -> None: ...

  def set_player_skin_image(self, image: QImage) -> None: ...

  def set_ai_skin_images(self, images: dict[str, QImage]) -> None: ...

  def render_player_preview_frame(
    self, *, width: int, height: int, player_state: PlayerRenderState | None, restore_framebuffer: int, restore_viewport: tuple[int, int, int, int], device_pixel_ratio: float = 1.0
  ) -> QImage: ...
