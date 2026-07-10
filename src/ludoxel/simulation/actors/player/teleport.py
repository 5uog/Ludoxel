# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.native import yaw_pitch_deg_from_forward
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity


def look_angles_toward(eye: Vec3, target: Vec3) -> tuple[float, float] | None:
  direction = target - eye
  if float(direction.length()) <= 1e-6:
    return None
  yaw_deg, pitch_deg = yaw_pitch_deg_from_forward(direction)
  return (float(yaw_deg), float(pitch_deg))


def teleport_player(player: PlayerEntity, *, x: float, y: float, z: float, yaw_deg: float | None = None, pitch_deg: float | None = None) -> None:
  player.position = Vec3(float(x), float(y), float(z))
  player.velocity = Vec3(0.0, 0.0, 0.0)
  player.on_ground = False
  player.step_eye_offset = 0.0
  player.crouch_eye_offset = 0.0
  player.hold_jump_queued = False
  player.auto_jump_pending = False
  player.auto_jump_start_y = float(y)
  player.auto_jump_cooldown_s = 0.0
  player.fence_gate_overlap_exemption = None
  player.gravity_block_overlap_exemptions = ()
  if yaw_deg is not None:
    player.yaw_deg = float(yaw_deg)
  if pitch_deg is not None:
    player.pitch_deg = float(pitch_deg)
    player.clamp_pitch()
