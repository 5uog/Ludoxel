# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import forward_from_yaw_pitch_deg

_WORLD_AXES: tuple[Vec3, Vec3, Vec3] = (Vec3(1.0, 0.0, 0.0), Vec3(0.0, 1.0, 0.0), Vec3(0.0, 0.0, 1.0))
_UP_HINT = Vec3(0.0, 1.0, 0.0)


def axis_screen_offsets(*, yaw_deg: float, pitch_deg: float, roll_deg: float) -> tuple[tuple[float, float] | None, tuple[float, float] | None, tuple[float, float] | None]:
  forward = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
  right = _UP_HINT.cross(forward).normalized()
  up = forward.cross(right).normalized()
  if float(right.length()) <= 1e-9 or float(up.length()) <= 1e-9:
    return (None, None, None)

  roll_rad = math.radians(float(roll_deg))
  cos_roll = math.cos(float(roll_rad))
  sin_roll = math.sin(float(roll_rad))

  offsets: list[tuple[float, float] | None] = []
  for axis in _WORLD_AXES:
    view_x = float(right.dot(axis))
    view_y = float(up.dot(axis))
    rolled_x = float(cos_roll) * float(view_x) - float(sin_roll) * float(view_y)
    rolled_y = float(sin_roll) * float(view_x) + float(cos_roll) * float(view_y)
    screen_dx = float(rolled_x)
    screen_dy = -float(rolled_y)
    if not (math.isfinite(float(screen_dx)) and math.isfinite(float(screen_dy))):
      offsets.append(None)
      continue
    offsets.append((float(screen_dx), float(screen_dy)))
  return (offsets[0], offsets[1], offsets[2])
