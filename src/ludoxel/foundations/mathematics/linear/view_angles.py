# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


def forward_from_yaw_pitch_deg(yaw_deg: float, pitch_deg: float) -> Vec3:
  """
  degree 単位の yaw と pitch から Ludoxel の view forward vector を生成する。
  式は `(-sin(yaw)*cos(pitch), -sin(pitch), cos(yaw)*cos(pitch))` であり、返値は単位 vector として正規化される。
  この Python source は native extension build の対象でもあり、input、selection、AI、camera が同じ角度規約を共有する。
  """
  yaw = math.radians(float(yaw_deg))
  pitch = math.radians(float(pitch_deg))

  cy = math.cos(yaw)
  sy = math.sin(yaw)
  cp = math.cos(pitch)
  sp = math.sin(pitch)

  return Vec3(-sy * cp, -sp, cy * cp).normalized()


def yaw_pitch_deg_from_forward(forward: Vec3) -> tuple[float, float]:
  """
  三次元 forward vector から degree 単位の yaw と pitch を復元する。
  入力は正規化され、`pitch = -asin(clamp(y, -1, 1))`、`yaw = atan2(-x, z)` により返されるため、
  AI navigation と third-person camera は direction vector から同じ姿勢角を得る。
  """
  direction = forward.normalized()
  pitch_rad = -math.asin(max(-1.0, min(1.0, float(direction.y))))
  yaw_rad = math.atan2(-float(direction.x), float(direction.z))
  return (float(math.degrees(yaw_rad)), float(math.degrees(pitch_rad)))


def sun_dir_from_az_el_deg(azimuth_deg: float, elevation_deg: float) -> Vec3:
  """
  degree 単位の azimuth と elevation から太陽方向の単位 vector を生成する。
  式は `(cos(el)*sin(az), sin(el), cos(el)*cos(az))` であり、
  renderer state と light-space 計算はこの方向を world 空間の光源方向として扱う。
  """
  az = math.radians(float(azimuth_deg))
  el = math.radians(float(elevation_deg))

  x = math.cos(el) * math.sin(az)
  y = math.sin(el)
  z = math.cos(el) * math.cos(az)

  return Vec3(x, y, z).normalized()
