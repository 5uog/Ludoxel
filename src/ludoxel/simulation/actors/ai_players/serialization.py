# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


@dataclass(frozen=True)
class AiRoutePoint:
  x: float
  y: float
  z: float

  def as_vec3(self) -> Vec3:
    return Vec3(float(self.x), float(self.y), float(self.z))


def normalize_route_points(points: object) -> tuple[AiRoutePoint, ...]:
  if not isinstance(points, (list, tuple)):
    return ()
  normalized: list[AiRoutePoint] = []
  for point in points:
    if isinstance(point, AiRoutePoint):
      normalized.append(AiRoutePoint(float(point.x), float(point.y), float(point.z)))
      continue
    if not isinstance(point, (list, tuple)) or len(point) != 3:
      continue
    try:
      normalized.append(AiRoutePoint(float(point[0]), float(point[1]), float(point[2])))
    except (TypeError, ValueError):
      continue
  return tuple(normalized)
