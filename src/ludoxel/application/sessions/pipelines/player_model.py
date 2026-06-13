# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.application.sessions.pipelines.render_snapshot import PlayerModelSnapshotDTO
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.actors.player.kinematics import PLAYER_WALK_MAX_SWING_SCALE, PlayerMotionState


def build_player_model_snapshot(*, player: PlayerEntity, motion: PlayerMotionState, walk_speed: float, is_first_person_view: bool) -> PlayerModelSnapshotDTO:
  """
  simulation の player entity と歩行位相を renderer-facing scalar DTO へ射影する。
  walk_speed は正の基準速度として速度比を `[0, PLAYER_WALK_MAX_SWING_SCALE]` へ制限し、返値は body pose と first-person bob のみを保持して mutable entity への参照を含まない。
  """
  speed = math.hypot(float(player.velocity.x), float(player.velocity.z))
  crouch_amount = 0.0
  if float(player.crouch_eye_drop) > 1e-9:
    crouch_amount = float(max(0.0, min(1.0, float(player.crouch_eye_offset) / float(player.crouch_eye_drop))))

  walk_speed_safe = max(1e-6, float(walk_speed))
  speed_ratio = clampf(float(speed) / float(walk_speed_safe), 0.0, float(PLAYER_WALK_MAX_SWING_SCALE))
  limb_swing_amount = 0.5 * float(speed_ratio)
  bob = 0.5 * float(speed_ratio)
  if bool(player.flying):
    bob *= 0.40
  elif not bool(player.on_ground):
    bob *= 0.75

  phase = float(motion.walk_phase_rad)
  sin_phase = math.sin(float(phase))
  cos_phase = math.cos(float(phase))
  pitch_wave = abs(math.cos(float(phase) - 0.2))
  step_eye_offset = float(player.step_eye_offset)

  fp_tx = float(sin_phase * bob * 0.08)
  fp_ty = float((-abs(cos_phase) * bob * 0.10) + step_eye_offset * 0.45)
  fp_tz = float(-abs(sin_phase) * bob * 0.03)
  fp_yaw_deg = float(sin_phase * bob * 1.25)
  fp_pitch_deg = float(pitch_wave * bob * 6.5)
  fp_roll_deg = float(sin_phase * bob * 4.0)

  return PlayerModelSnapshotDTO(
    base_x=float(player.position.x),
    base_y=float(player.position.y) + float(step_eye_offset),
    base_z=float(player.position.z),
    body_yaw_deg=float(player.yaw_deg),
    head_yaw_deg=0.0,
    head_pitch_deg=float(player.pitch_deg),
    limb_phase_rad=float(motion.walk_phase_rad),
    limb_swing_amount=float(limb_swing_amount),
    crouch_amount=float(crouch_amount),
    hurt_tint_strength=float(player.hurt_flash_strength()),
    first_person_tx=float(fp_tx),
    first_person_ty=float(fp_ty),
    first_person_tz=float(fp_tz),
    first_person_yaw_deg=float(fp_yaw_deg),
    first_person_pitch_deg=float(fp_pitch_deg),
    first_person_roll_deg=float(fp_roll_deg),
    is_first_person=bool(is_first_person_view),
  )
