# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.foundations.mathematics.linear.native import yaw_pitch_deg_from_forward
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.ai_players.navigation import _limit_angle_delta, _movement_inputs_toward_target, _parkour_takeoff_point, _support_cell_center, _yaw_diff_deg
from ludoxel.simulation.actors.ai_players.runtime import _AI_TURN_RATE_DEG_PER_S, _AiPlayerRuntime
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.actors.player.kinematics import PlayerStepInput


def _parkour_control(*, player: PlayerEntity, target: Vec3, dt: float, sprint: bool, auto_jump_enabled: bool, jump_pressed: bool = False, crouch: bool = False, commit_forward: bool = False) -> PlayerStepInput:
  delta = target - player.eye_pos()
  horizontal_length = math.hypot(float(delta.x), float(delta.z))
  if horizontal_length <= 1e-6 and abs(float(delta.y)) <= 1e-6:
    desired_yaw_deg = float(player.yaw_deg)
    desired_pitch_deg = 0.0
  else:
    desired_yaw_deg, desired_pitch_deg = yaw_pitch_deg_from_forward(delta.normalized())
  yaw_delta_deg = _limit_angle_delta(_yaw_diff_deg(float(player.yaw_deg), float(desired_yaw_deg)), max_step_deg=float(_AI_TURN_RATE_DEG_PER_S) * max(0.0, float(dt)))
  pitch_delta_deg = _limit_angle_delta(float(desired_pitch_deg) - float(player.pitch_deg), max_step_deg=float(_AI_TURN_RATE_DEG_PER_S) * max(0.0, float(dt)))
  remaining_yaw_error_deg = abs(float(_yaw_diff_deg(float(player.yaw_deg) + float(yaw_delta_deg), float(desired_yaw_deg))))
  move_f, move_s = _movement_inputs_toward_target(player=player, target=target, yaw_deg=float(player.yaw_deg) + float(yaw_delta_deg), remaining_yaw_error_deg=float(remaining_yaw_error_deg), slowdown_radius=0.28)
  if float(remaining_yaw_error_deg) > 18.0 and (bool(jump_pressed) or bool(commit_forward)):
    move_f = 0.0
    move_s = 0.0
  elif bool(jump_pressed) or bool(commit_forward):
    move_f = max(float(move_f), 1.0)
    move_s = float(clampf(float(move_s), -0.20, 0.20))
  return PlayerStepInput(move_f=float(move_f), move_s=float(move_s), jump_held=bool(jump_pressed), jump_pressed=bool(jump_pressed), sprint=bool(sprint), crouch=bool(crouch), yaw_delta_deg=float(yaw_delta_deg), pitch_delta_deg=float(pitch_delta_deg), auto_jump_enabled=bool(auto_jump_enabled))


def _parkour_navigation_target(actor: _AiPlayerRuntime, *, current_support: tuple[int, int, int] | None) -> Vec3 | None:
  next_cell = None if actor.nav_next_support_cell is None else tuple(int(value) for value in actor.nav_next_support_cell)
  if next_cell is None:
    return None
  landing = _support_cell_center(tuple(int(value) for value in next_cell))
  if current_support is None or (not bool(actor.player.on_ground)):
    return landing
  span = max(abs(int(next_cell[0]) - int(current_support[0])), abs(int(next_cell[2]) - int(current_support[2])))
  if int(span) <= 1 and int(next_cell[1]) == int(current_support[1]):
    return landing
  return _parkour_takeoff_point(tuple(int(value) for value in current_support), tuple(int(value) for value in next_cell))
