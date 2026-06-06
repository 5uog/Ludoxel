# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.simulation.actors.player.motion import PlayerModelSnapshotDTO


@dataclass(frozen=True)
class CameraDTO:
  eye_x: float
  eye_y: float
  eye_z: float
  yaw_deg: float
  pitch_deg: float
  fov_deg: float
  shake_tx: float = 0.0
  shake_ty: float = 0.0
  shake_tz: float = 0.0
  shake_yaw_deg: float = 0.0
  shake_pitch_deg: float = 0.0
  shake_roll_deg: float = 0.0


@dataclass(frozen=True)
class FallingBlockRenderSampleDTO:
  state_str: str
  x: float
  y: float
  z: float


@dataclass(frozen=True)
class BlockBreakParticleRenderSampleDTO:
  x: float
  y: float
  z: float
  size: float
  u0: float
  v0: float
  u1: float
  v1: float


@dataclass(frozen=True)
class RenderSnapshotDTO:
  world_revision: int
  camera: CameraDTO
  player_model: PlayerModelSnapshotDTO
  falling_blocks: tuple[FallingBlockRenderSampleDTO, ...] = ()
  block_break_particles: tuple[BlockBreakParticleRenderSampleDTO, ...] = ()
