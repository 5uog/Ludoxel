# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


def pose_almost_equal(left: tuple[float, float, float, float, float, float], right: tuple[float, float, float, float, float, float], *, linear_epsilon: float, angular_epsilon_deg: float) -> bool:
  lx, ly, lz, lyaw, lpitch, lroll = left
  rx, ry, rz, ryaw, rpitch, rroll = right

  linear_eps = float(linear_epsilon)
  angular_eps = float(angular_epsilon_deg)

  return abs(lx - rx) <= linear_eps and abs(ly - ry) <= linear_eps and abs(lz - rz) <= linear_eps and abs(lyaw - ryaw) <= angular_eps and abs(lpitch - rpitch) <= angular_eps and abs(lroll - rroll) <= angular_eps


def block_center(position: tuple[int, int, int]) -> Vec3:
  return Vec3(float(position[0]) + 0.5, float(position[1]) + 0.5, float(position[2]) + 0.5)


def normalize_world_position(position: tuple[float, float, float] | Vec3 | None, *, listener_pose: tuple[float, float, float, float, float, float] | None) -> Vec3:
  if isinstance(position, Vec3):
    return Vec3(float(position.x), float(position.y), float(position.z))
  if position is not None:
    return Vec3(float(position[0]), float(position[1]), float(position[2]))
  if listener_pose is not None:
    x, y, z, _yaw_deg, _pitch_deg, _roll_deg = listener_pose
    return Vec3(float(x), float(y), float(z))
  return Vec3(0.0, 0.0, 0.0)


def listener_within_cutoff(*, position: Vec3, cutoff: float, listener_pose: tuple[float, float, float, float, float, float] | None) -> bool:
  if cutoff <= 1e-6:
    return True

  if listener_pose is None:
    return True

  px, py, pz, _yaw_deg, _pitch_deg, _roll_deg = listener_pose
  dx = float(position.x) - float(px)
  dy = float(position.y) - float(py)
  dz = float(position.z) - float(pz)
  return (dx * dx + dy * dy + dz * dz) <= float(cutoff * cutoff)


def listener_distance(*, position: Vec3, listener_pose: tuple[float, float, float, float, float, float] | None) -> float | None:
  if listener_pose is None:
    return None
  px, py, pz, _yaw_deg, _pitch_deg, _roll_deg = listener_pose
  dx = float(position.x) - float(px)
  dy = float(position.y) - float(py)
  dz = float(position.z) - float(pz)
  return float((dx * dx + dy * dy + dz * dz) ** 0.5)


def spatial_distance_gain(*, position: Vec3, cutoff: float, listener_pose: tuple[float, float, float, float, float, float] | None) -> float:
  if float(cutoff) <= 1e-6:
    return 1.0
  distance = listener_distance(position=position, listener_pose=listener_pose)
  if distance is None:
    return 1.0
  if float(distance) >= float(cutoff):
    return 0.0
  gain = 1.0 - (float(distance) / float(cutoff))
  return float(min(1.0, max(0.0, float(gain))))
