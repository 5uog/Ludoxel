# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.application.sessions.pipelines.render_snapshot import PlayerModelSnapshotDTO
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.actors.player.kinematics import PLAYER_HEAD_BODY_YAW_MAX_DEG, PLAYER_WALK_MAX_SWING_SCALE, PlayerMotionState

# First-person view bob is reduced while moving backward so a reverse step does not
# read as a full forward stride.
_BACKWARD_VIEW_BOB_SCALE = 0.7


def build_player_model_snapshot(*, player: PlayerEntity, motion: PlayerMotionState, walk_speed: float, is_first_person_view: bool) -> PlayerModelSnapshotDTO:
  speed = math.hypot(float(player.velocity.x), float(player.velocity.z))
  crouch_amount = 0.0
  if float(player.crouch_eye_drop) > 1e-9:
    crouch_amount = float(max(0.0, min(1.0, float(player.crouch_eye_offset) / float(player.crouch_eye_drop))))

  walk_speed_safe = max(1e-6, float(walk_speed))
  speed_ratio = clampf(float(speed) / float(walk_speed_safe), 0.0, float(PLAYER_WALK_MAX_SWING_SCALE))
  limb_swing_amount = 0.5 * float(speed_ratio)

  yaw_rad = math.radians(float(player.yaw_deg))
  forward_speed = float(player.velocity.x) * (-math.sin(yaw_rad)) + float(player.velocity.z) * math.cos(yaw_rad)
  strafe_speed = float(player.velocity.x) * math.cos(yaw_rad) + float(player.velocity.z) * math.sin(yaw_rad)
  max_ratio = float(PLAYER_WALK_MAX_SWING_SCALE)
  limb_forward_ratio = clampf(float(forward_speed) / float(walk_speed_safe), -max_ratio, max_ratio)
  limb_strafe_ratio = clampf(float(strafe_speed) / float(walk_speed_safe), -max_ratio, max_ratio)

  bob = 0.5 * float(speed_ratio)
  if float(forward_speed) < -1e-6:
    bob *= float(_BACKWARD_VIEW_BOB_SCALE)
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

  body_visual_yaw_deg = float(player.yaw_deg) if motion.body_visual_yaw_deg is None else float(motion.body_visual_yaw_deg)
  head_visual_yaw_deg = float(player.yaw_deg) if motion.head_visual_yaw_deg is None else float(motion.head_visual_yaw_deg)
  head_visual_pitch_deg = float(player.pitch_deg) if motion.head_visual_pitch_deg is None else float(motion.head_visual_pitch_deg)
  body_pose_yaw_deg = float(math.remainder(float(body_visual_yaw_deg) + float(motion.strafe_turn_deg), 360.0))
  head_yaw_rel_deg = float(math.remainder(float(head_visual_yaw_deg) - float(body_pose_yaw_deg), 360.0))

  return PlayerModelSnapshotDTO(
    base_x=float(player.position.x),
    base_y=float(player.position.y) + float(step_eye_offset),
    base_z=float(player.position.z),
    body_yaw_deg=float(body_pose_yaw_deg),
    head_yaw_deg=float(head_yaw_rel_deg),
    head_pitch_deg=float(head_visual_pitch_deg),
    limb_phase_rad=float(motion.walk_phase_rad),
    limb_swing_amount=float(limb_swing_amount),
    limb_forward_ratio=float(limb_forward_ratio),
    limb_strafe_ratio=float(limb_strafe_ratio),
    crouch_amount=float(crouch_amount),
    idle_anim_time_s=float(motion.visual_time_s),
    hurt_tint_strength=float(player.hurt_flash_strength()),
    first_person_tx=float(fp_tx),
    first_person_ty=float(fp_ty),
    first_person_tz=float(fp_tz),
    first_person_yaw_deg=float(fp_yaw_deg),
    first_person_pitch_deg=float(fp_pitch_deg),
    first_person_roll_deg=float(fp_roll_deg),
    is_first_person=bool(is_first_person_view),
  )
