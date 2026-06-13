# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

import ludoxel.foundations.mathematics.linear.mat4 as mat4
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.presentation.rendering.contracts.config import SHADOW_MAX_ORTHO_RADIUS, BackendShadowParams, BackendSunParams


def _snap(value: float, quantum: float) -> float:
  q = float(max(1e-9, float(quantum)))
  return float(np.round(float(value) / q) * q)


def _coverage_scaled_sun_extents(sun: BackendSunParams, coverage_radius: float | None) -> tuple[float, float, float, float]:
  """
  shadow の light-space orthographic 範囲を render distance に合わせて拡縮した `(ortho_radius, light_distance, ortho_near, ortho_far)` を返す。
  `coverage_radius` が `None` の場合は `BackendSunParams` の既定値をそのまま返す。値が与えられた場合は、覆うべき水平半径を `[sun.ortho_radius, SHADOW_MAX_ORTHO_RADIUS]` へ clamp し、その比率 `scale = ortho_radius / sun.ortho_radius (>= 1)` を light distance と far plane へ同じく乗じる。
  これにより既定 render distance では従来と同一の影品質を保ちつつ、render distance を広げた場合は同じ shadow map 解像度を広い範囲へ割り当てて、render distance 内の caster が light frustum から外れて影が欠落することを防ぐ。near plane は基準値を維持し、far plane と light distance のみ拡大することで coverage 拡大に伴う深度範囲不足を避ける。
  """
  base_radius = float(sun.ortho_radius)
  if coverage_radius is None or base_radius <= 1e-6:
    return (base_radius, float(sun.light_distance), float(sun.ortho_near), float(sun.ortho_far))
  ortho_radius = float(clampf(float(coverage_radius), float(base_radius), float(SHADOW_MAX_ORTHO_RADIUS)))
  scale = float(ortho_radius) / float(base_radius)
  return (float(ortho_radius), float(sun.light_distance) * float(scale), float(sun.ortho_near), float(sun.ortho_far) * float(scale))


def _light_up_hint(light_forward: Vec3) -> Vec3:
  world_up = Vec3(0.0, 1.0, 0.0)
  if abs(light_forward.dot(world_up)) < 0.999:
    return world_up
  return Vec3(0.0, 0.0, 1.0) if abs(float(light_forward.z)) < 0.999 else Vec3(1.0, 0.0, 0.0)


def compute_light_view_proj(*, center: Vec3, sun_dir: Vec3, sun: BackendSunParams, shadow: BackendShadowParams, shadow_size: int, coverage_radius: float | None = None) -> np.ndarray:
  sdir = sun_dir.normalized()
  light_forward = Vec3(-sdir.x, -sdir.y, -sdir.z).normalized()
  up_hint = _light_up_hint(light_forward)

  r, ld, ortho_near, ortho_far = _coverage_scaled_sun_extents(sun, coverage_radius)

  anchor_center = Vec3(float(center.x), float(center.y), float(center.z))

  if bool(shadow.stabilize):
    probe_eye = Vec3(float(center.x) + float(sdir.x) * ld, float(center.y) + float(sdir.y) * ld, float(center.z) + float(sdir.z) * ld)
    probe_view = mat4.look_dir(probe_eye, light_forward, up_hint).astype(np.float32, copy=False)

    right = Vec3(float(probe_view[0, 0]), float(probe_view[0, 1]), float(probe_view[0, 2]))
    up = Vec3(float(probe_view[1, 0]), float(probe_view[1, 1]), float(probe_view[1, 2]))
    light_axis = Vec3(float(probe_view[2, 0]), float(probe_view[2, 1]), float(probe_view[2, 2]))

    s = float(max(1, int(shadow_size)))
    texel = (2.0 * r) / s

    cx = right.dot(center)
    cy = up.dot(center)
    cz = light_axis.dot(center)

    sx = _snap(float(cx), float(texel))
    sy = _snap(float(cy), float(texel))

    anchor_center = (right * float(sx)) + (up * float(sy)) + (light_axis * float(cz))

  light_pos = Vec3(float(anchor_center.x) + float(sdir.x) * ld, float(anchor_center.y) + float(sdir.y) * ld, float(anchor_center.z) + float(sdir.z) * ld)

  view = mat4.look_dir(light_pos, light_forward, up_hint)
  proj = mat4.ortho(-r, r, -r, r, float(ortho_near), float(ortho_far))
  return mat4.mul(proj, view).astype(np.float32)
