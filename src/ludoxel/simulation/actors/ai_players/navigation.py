# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import yaw_pitch_deg_from_forward
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.ai_players.runtime import _AI_NAV_TARGET_SLOW_RADIUS, _AI_PARKOUR_TAKEOFF_EDGE_OFFSET, _AI_TURN_RATE_DEG_PER_S
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.actors.player.kinematics import PlayerStepInput


def _yaw_diff_deg(current_deg: float, target_deg: float) -> float:
  delta = (float(target_deg) - float(current_deg) + 180.0) % 360.0 - 180.0
  return float(delta)


def _limit_angle_delta(delta_deg: float, *, max_step_deg: float) -> float:
  return clampf(float(delta_deg), -float(max_step_deg), float(max_step_deg))


def _point_distance_xz(a: Vec3, b: Vec3) -> float:
  return float(math.hypot(float(a.x) - float(b.x), float(a.z) - float(b.z)))


def _support_cell_beneath(player: PlayerEntity) -> tuple[int, int, int]:
  return (int(math.floor(float(player.position.x))), int(math.floor(float(player.position.y) - 0.05)), int(math.floor(float(player.position.z))))


def _support_cell_from_point(point: Vec3) -> tuple[int, int, int]:
  return (int(math.floor(float(point.x))), int(math.floor(float(point.y) - 0.01)), int(math.floor(float(point.z))))


def _support_cell_center(support_cell: tuple[int, int, int]) -> Vec3:
  return Vec3(float(support_cell[0]) + 0.5, float(support_cell[1]) + 1.0, float(support_cell[2]) + 0.5)


def _horizontal_transition_distance(from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> float:
  return float(math.hypot(float(int(to_cell[0]) - int(from_cell[0])), float(int(to_cell[2]) - int(from_cell[2]))))


def _support_direction_xz(from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> Vec3:
  start = _support_cell_center(tuple(int(value) for value in from_cell))
  end = _support_cell_center(tuple(int(value) for value in to_cell))
  delta = Vec3(float(end.x) - float(start.x), 0.0, float(end.z) - float(start.z)).normalized()
  if float(delta.length()) <= 1e-6:
    return Vec3(0.0, 0.0, 1.0)
  return delta


def _parkour_takeoff_point(from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> Vec3:
  start = _support_cell_center(tuple(int(value) for value in from_cell))
  direction = _support_direction_xz(tuple(int(value) for value in from_cell), tuple(int(value) for value in to_cell))
  offset = clampf(float(_AI_PARKOUR_TAKEOFF_EDGE_OFFSET), 0.10, 0.48)
  return Vec3(float(start.x) + float(direction.x) * float(offset), float(start.y), float(start.z) + float(direction.z) * float(offset))


def _navigation_transition_target(from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> Vec3:
  src = tuple(int(value) for value in from_cell)
  dst = tuple(int(value) for value in to_cell)
  span = max(abs(int(dst[0]) - int(src[0])), abs(int(dst[2]) - int(src[2])))
  if int(span) > 1 or int(dst[1]) != int(src[1]):
    return _parkour_takeoff_point(src, dst)
  return _support_cell_center(dst)


def _turn_toward_target(*, player: PlayerEntity, target: Vec3, dt: float) -> tuple[float, float, float, float]:
  delta = target - player.eye_pos()
  horizontal_length = math.hypot(float(delta.x), float(delta.z))
  if horizontal_length <= 1e-6 and abs(float(delta.y)) <= 1e-6:
    desired_yaw_deg = float(player.yaw_deg)
    desired_pitch_deg = 0.0
  else:
    desired_yaw_deg, desired_pitch_deg = yaw_pitch_deg_from_forward(delta.normalized())
  max_turn_step_deg = float(_AI_TURN_RATE_DEG_PER_S) * max(0.0, float(dt))
  yaw_delta_deg = _limit_angle_delta(_yaw_diff_deg(float(player.yaw_deg), float(desired_yaw_deg)), max_step_deg=float(max_turn_step_deg))
  pitch_delta_deg = _limit_angle_delta(float(desired_pitch_deg) - float(player.pitch_deg), max_step_deg=float(max_turn_step_deg))
  remaining_yaw_error_deg = float(_yaw_diff_deg(float(player.yaw_deg) + float(yaw_delta_deg), float(desired_yaw_deg)))
  return (float(yaw_delta_deg), float(pitch_delta_deg), float(remaining_yaw_error_deg), float(horizontal_length))


def _movement_inputs_toward_target(*, player: PlayerEntity, target: Vec3, yaw_deg: float, remaining_yaw_error_deg: float, slowdown_radius: float = _AI_NAV_TARGET_SLOW_RADIUS) -> tuple[float, float]:
  delta = Vec3(float(target.x) - float(player.position.x), 0.0, float(target.z) - float(player.position.z))
  distance_xz = float(delta.length())
  if float(distance_xz) <= 1e-6:
    return (0.0, 0.0)
  direction = delta.normalized()
  yaw_rad = math.radians(float(yaw_deg))
  forward = Vec3(-math.sin(float(yaw_rad)), 0.0, math.cos(float(yaw_rad)))
  right = Vec3(math.cos(float(yaw_rad)), 0.0, math.sin(float(yaw_rad)))
  move_f = clampf(float(direction.dot(forward)), -1.0, 1.0)
  move_s = clampf(float(direction.dot(right)), -1.0, 1.0)
  abs_error_deg = abs(float(remaining_yaw_error_deg))
  if float(abs_error_deg) > 60.0:
    scale = 0.0
  elif float(abs_error_deg) > 42.0:
    scale = 0.35
  elif float(abs_error_deg) > 24.0:
    scale = 0.75
  else:
    scale = 1.0
  if float(distance_xz) < float(slowdown_radius):
    scale *= clampf(float(distance_xz) / max(1e-6, float(slowdown_radius)), 0.20, 1.0)
  return (float(move_f) * float(scale), float(move_s) * float(scale))


def _pursuit_control(*, player: PlayerEntity, target: Vec3, dt: float, sprint: bool, auto_jump_enabled: bool, jump_pressed: bool = False, crouch: bool = False) -> PlayerStepInput:
  yaw_delta_deg, pitch_delta_deg, remaining_yaw_error_deg, _distance_xz = _turn_toward_target(player=player, target=target, dt=float(dt))
  move_f, move_s = _movement_inputs_toward_target(player=player, target=target, yaw_deg=float(player.yaw_deg) + float(yaw_delta_deg), remaining_yaw_error_deg=float(remaining_yaw_error_deg))
  return PlayerStepInput(
    move_f=float(move_f),
    move_s=float(move_s),
    jump_held=bool(jump_pressed),
    jump_pressed=bool(jump_pressed),
    sprint=bool(sprint),
    crouch=bool(crouch),
    yaw_delta_deg=float(yaw_delta_deg),
    pitch_delta_deg=float(pitch_delta_deg),
    auto_jump_enabled=bool(auto_jump_enabled),
  )


def _turn_only_control(*, player: PlayerEntity, target: Vec3, dt: float) -> PlayerStepInput:
  yaw_delta_deg, pitch_delta_deg, _remaining_yaw_error_deg, _distance_xz = _turn_toward_target(player=player, target=target, dt=float(dt))
  return PlayerStepInput(
    move_f=0.0, move_s=0.0, jump_held=False, jump_pressed=False, sprint=False, crouch=False, yaw_delta_deg=float(yaw_delta_deg), pitch_delta_deg=float(pitch_delta_deg), auto_jump_enabled=False
  )
