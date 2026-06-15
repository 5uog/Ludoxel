# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

import ludoxel.foundations.mathematics.linear.mat4 as mat4
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.contracts.config import BackendShadowParams, BackendSunParams


def _snap(value: float, quantum: float) -> float:
  q = float(max(1e-9, float(quantum)))
  return float(np.round(float(value) / q) * q)


def _coverage_scaled_sun_extents(sun: BackendSunParams, coverage_radius: float | None) -> tuple[float, float, float, float]:
  """
  shadow の light-space orthographic 範囲を、覆うべき可視半径に合わせて拡縮した `(ortho_radius, light_distance, ortho_near, ortho_far)` を返す。
  `coverage_radius` が `None` の場合は `BackendSunParams` の既定値をそのまま返す。値が与えられた場合は、orthographic 半径を `ortho_radius = max(sun.ortho_radius, coverage_radius)` とし、
  基準半径 `sun.ortho_radius` に対する比率 `scale = ortho_radius / sun.ortho_radius (>= 1)` を light distance と far plane へ同じく乗じる。near plane は `sun.ortho_near` を維持する。
  呼び出し側は `coverage_radius` に Shadow map quality preset が定める shadow 専用の light-space coverage 半径 (block 単位) を渡す。この半径は render distance chunks から導出してはならず、`render_distance_fog_range` の fog 終端のような可視距離由来の値を渡すと、render distance を広げるほど `ortho_radius` が拡大し同一 shadow map size のまま texel 密度が劣化する結合が生じる。coverage 半径を render distance と独立な品質方針として固定することで、この結合を断つ。
  light box は camera を中心とし、light 方向に直交する平面で半径 `r = ortho_radius` の角柱を成し、light 軸に沿った深度は light_pos からの距離で区間 `[ortho_near, ortho_far]` を占める。
  camera 中心は light_pos から距離 `light_distance` にあるため、camera を中心とする半径 `r` の球は深度方向で区間 `[light_distance - r, light_distance + r]` を占める。
  既定 `BackendSunParams` の比率では `light_distance = 2 r` かつ `ortho_far = (140 / 30) r` となるため、near 側余裕は `light_distance - ortho_near = 2 r - ortho_near >= r`、
  far 側余裕は `ortho_far - light_distance = (80 / 30) r >= r` を満たし、視差方向の半幅も `r` であるから、light box は半径 `r` の球を全方向で内包する。
  この結果、camera から半径 `coverage_radius` 以内の shadow caster はすべて light box の coverage に入り、その範囲では shadow 実効 texel 寸法 `(2 r) / shadow_size` が render distance に依らず一定に保たれる。coverage 半径を超える遠方の caster は light box 外として shadow を持たないが、この打ち切りは render distance ではなく shadow 専用 policy が支配する固定境界である。
  """
  base_radius = float(sun.ortho_radius)
  if coverage_radius is None or base_radius <= 1e-6:
    return (base_radius, float(sun.light_distance), float(sun.ortho_near), float(sun.ortho_far))
  ortho_radius = float(max(float(base_radius), float(coverage_radius)))
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
