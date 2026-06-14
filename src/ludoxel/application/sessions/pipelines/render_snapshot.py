# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


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
class PlayerModelSnapshotDTO:
  """
  application session が renderer へ渡す player model の不変姿勢を表す。
  座標、角度、歩行位相、視点揺動は simulation entity から切り離した scalar 値であり、presentation はこの DTO を介して domain state を変更できない。
  """

  base_x: float
  base_y: float
  base_z: float
  body_yaw_deg: float
  head_yaw_deg: float
  head_pitch_deg: float
  limb_phase_rad: float
  limb_swing_amount: float
  crouch_amount: float
  hurt_tint_strength: float = 0.0
  first_person_tx: float = 0.0
  first_person_ty: float = 0.0
  first_person_tz: float = 0.0
  first_person_yaw_deg: float = 0.0
  first_person_pitch_deg: float = 0.0
  first_person_roll_deg: float = 0.0
  is_first_person: bool = True


@dataclass(frozen=True)
class AiPlayerRenderSnapshotDTO:
  """
  AI actor 一体分の描画入力を application session 境界で固定する。
  player_model は body pose、held item と swing 値は手持ち描画、actor metadata と位置・身長は Qt overlay に用いられ、mutable な simulation entity は presentation へ渡さない。
  """

  player_model: PlayerModelSnapshotDTO
  held_item_id: str | None
  attack_swing_progress: float
  attack_prev_swing_progress: float
  actor_id: str
  name: str
  health: float
  max_health: float
  health_indicator: str
  skin_mode: str
  skin_id: str
  position_x: float
  position_y: float
  position_z: float
  height: float


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
