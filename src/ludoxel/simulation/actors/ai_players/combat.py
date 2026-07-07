# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.navigation import _turn_toward_target
from ludoxel.simulation.actors.ai_players.runtime import _AI_COMBAT_STRAFE_DISTANCE_MAX, _AI_COMBAT_STRAFE_DISTANCE_MIN, _AI_COMBAT_STRAFE_MAG, _AI_COMBAT_W_TAP_S, _AiPlayerRuntime
from ludoxel.simulation.actors.player.kinematics import PlayerStepInput


def _combat_control(*, actor: _AiPlayerRuntime, target: Vec3, dt: float, jump_pressed: bool = False) -> PlayerStepInput:
  yaw_delta_deg, pitch_delta_deg, remaining_yaw_error_deg, distance_xz = _turn_toward_target(player=actor.player, target=target, dt=float(dt))
  abs_error_deg = abs(float(remaining_yaw_error_deg))
  strafe = 0.0
  if float(actor.combat_strafe_timer_s) > 1e-6 and float(distance_xz) >= float(_AI_COMBAT_STRAFE_DISTANCE_MIN) and float(distance_xz) <= float(_AI_COMBAT_STRAFE_DISTANCE_MAX) and float(abs_error_deg) <= 18.0:
    strafe = float(_AI_COMBAT_STRAFE_MAG) * (1.0 if int(actor.combat_strafe_sign) >= 0 else -1.0)
  if float(actor.combat_w_tap_s) > 1e-6 and float(distance_xz) <= 2.85 and float(abs_error_deg) <= 18.0:
    engage_ratio = 0.0 if float(actor.combat_w_tap_s) > float(_AI_COMBAT_W_TAP_S) * 0.5 else 1.0
    return PlayerStepInput(move_f=float(engage_ratio), move_s=float(strafe), jump_held=bool(jump_pressed), jump_pressed=bool(jump_pressed), sprint=bool(engage_ratio > 0.5), crouch=False, yaw_delta_deg=float(yaw_delta_deg), pitch_delta_deg=float(pitch_delta_deg), auto_jump_enabled=True)
  if float(abs_error_deg) <= 12.0:
    move_f = 1.0
  elif float(abs_error_deg) <= 24.0:
    move_f = 0.85
  elif float(abs_error_deg) <= 42.0:
    move_f = 0.45
  else:
    move_f = 0.0
  return PlayerStepInput(move_f=float(move_f), move_s=float(strafe), jump_held=bool(jump_pressed), jump_pressed=bool(jump_pressed), sprint=True, crouch=False, yaw_delta_deg=float(yaw_delta_deg), pitch_delta_deg=float(pitch_delta_deg), auto_jump_enabled=True)
