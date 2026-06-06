# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.application.sessions.pipelines.render_snapshot import CameraDTO, FallingBlockRenderSampleDTO, RenderSnapshotDTO
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.player.kinematics import PLAYER_WALK_MAX_SWING_SCALE, build_player_model_snapshot


def make_camera_snapshot_for_session(session, *, enable_camera_shake: bool = True, camera_shake_strength: float = 0.20) -> CameraDTO:
  eye = session.player.eye_pos()
  player = session.player
  speed = math.hypot(float(player.velocity.x), float(player.velocity.z))
  walk_speed = max(1e-6, float(session.settings.movement.walk_speed))
  speed_ratio = clampf(float(speed) / float(walk_speed), 0.0, float(PLAYER_WALK_MAX_SWING_SCALE))

  bob = 0.5 * float(speed_ratio)
  if bool(player.flying):
    bob *= 0.40
  elif not bool(player.on_ground):
    bob *= 0.75

  phase = float(session._player_motion.walk_phase_rad)
  sin_phase = math.sin(float(phase))
  cos_phase = math.cos(float(phase))
  pitch_wave = abs(math.cos(float(phase) - 0.2))
  step_eye_offset = float(player.step_eye_offset)
  camera_shake_scale = clampf(float(camera_shake_strength), 0.0, 1.0)

  cam_shake_tx = float(sin_phase * bob * 0.04) * float(camera_shake_scale)
  cam_shake_ty = float((-abs(cos_phase) * bob * 0.06) + step_eye_offset * 0.30) * float(camera_shake_scale)
  cam_shake_pitch_deg = float(pitch_wave * bob * 5.0) * float(camera_shake_scale)
  cam_shake_roll_deg = float(sin_phase * bob * 3.0) * float(camera_shake_scale)
  hurt_strength = float(player.hurt_camera_strength())
  if float(hurt_strength) > 1e-6:
    cam_shake_tx += float(player.hurt_tilt_sign) * float(hurt_strength) * 0.02 * float(camera_shake_scale)
    cam_shake_ty += float(hurt_strength) * 0.015 * float(camera_shake_scale)
    cam_shake_pitch_deg += float(hurt_strength) * 8.0 * float(camera_shake_scale)
    cam_shake_roll_deg += float(player.hurt_tilt_sign) * float(hurt_strength) * 13.0 * float(camera_shake_scale)

  if not bool(enable_camera_shake):
    cam_shake_tx = 0.0
    cam_shake_ty = 0.0
    cam_shake_pitch_deg = 0.0
    cam_shake_roll_deg = 0.0

  return CameraDTO(
    eye_x=eye.x,
    eye_y=eye.y,
    eye_z=eye.z,
    yaw_deg=session.player.yaw_deg,
    pitch_deg=session.player.pitch_deg,
    fov_deg=session.settings.fov_deg,
    shake_tx=float(cam_shake_tx),
    shake_ty=float(cam_shake_ty),
    shake_tz=0.0,
    shake_yaw_deg=0.0,
    shake_pitch_deg=float(cam_shake_pitch_deg),
    shake_roll_deg=float(cam_shake_roll_deg),
  )


def make_render_snapshot_for_session(
  session, *, enable_view_bobbing: bool = True, enable_camera_shake: bool = True, view_bobbing_strength: float = 0.35, camera_shake_strength: float = 0.20, is_first_person_view: bool = True
) -> RenderSnapshotDTO:
  camera = make_camera_snapshot_for_session(session, enable_camera_shake=bool(enable_camera_shake), camera_shake_strength=float(camera_shake_strength))
  player_model = build_player_model_snapshot(
    player=session.player, motion=session._player_motion, walk_speed=float(session.settings.movement.walk_speed), is_first_person_view=bool(is_first_person_view)
  )
  scale = 0.0 if not bool(enable_view_bobbing) else clampf(float(view_bobbing_strength), 0.0, 1.0)
  player_model = type(player_model)(
    base_x=float(player_model.base_x),
    base_y=float(player_model.base_y),
    base_z=float(player_model.base_z),
    body_yaw_deg=float(player_model.body_yaw_deg),
    head_yaw_deg=float(player_model.head_yaw_deg),
    head_pitch_deg=float(player_model.head_pitch_deg),
    limb_phase_rad=float(player_model.limb_phase_rad),
    limb_swing_amount=float(player_model.limb_swing_amount),
    crouch_amount=float(player_model.crouch_amount),
    hurt_tint_strength=float(player_model.hurt_tint_strength),
    first_person_tx=float(player_model.first_person_tx) * float(scale),
    first_person_ty=float(player_model.first_person_ty) * float(scale),
    first_person_tz=float(player_model.first_person_tz) * float(scale),
    first_person_yaw_deg=float(player_model.first_person_yaw_deg) * float(scale),
    first_person_pitch_deg=float(player_model.first_person_pitch_deg) * float(scale),
    first_person_roll_deg=float(player_model.first_person_roll_deg) * float(scale),
    is_first_person=bool(player_model.is_first_person),
  )

  falling_blocks = tuple(FallingBlockRenderSampleDTO(state_str=str(sample.state_str), x=float(sample.x), y=float(sample.y), z=float(sample.z)) for sample in session.gravity.render_samples())
  return RenderSnapshotDTO(world_revision=int(session.world.revision), camera=camera, player_model=player_model, falling_blocks=falling_blocks)
