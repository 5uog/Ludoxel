# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.shared.math.math_vec3 import Vec3


@dataclass(frozen=True)
class BackendCameraParams:
  z_near: float = 0.05
  z_far: float = 200.0


@dataclass(frozen=True)
class BackendShadowParams:
  enabled: bool = True
  stabilize: bool = True
  size: int = 2048
  dark_mul: float = 0.20
  cull_front: bool = False
  bias_min: float = 0.00005
  bias_slope: float = 0.00050
  poly_offset_factor: float = 0.50
  poly_offset_units: float = 0.75


@dataclass(frozen=True)
class BackendSunParams:
  azimuth_deg: float = 45.0
  elevation_deg: float = 60.0
  distance: float = 150.0
  half_angle_deg: float = 2.6
  light_distance: float = 60.0
  ortho_radius: float = 30.0
  ortho_near: float = 0.1
  ortho_far: float = 140.0


@dataclass(frozen=True)
class BackendCloudParams:
  y: int = 28
  thickness: int = 3
  macro: int = 32
  rects_per_cell: int = 1
  candidates_per_cell: int = 5
  view_radius: int = 150
  speed_x: float = 0.70
  speed_z: float = 0.10
  color: Vec3 = Vec3(1.0, 1.0, 1.0)
  alpha: float = 0.90
  seed: int = 1337
  lane_offsets: tuple[int, int, int] = (-1, 0, 1)
  candidate_drop_threshold: float = 0.20
  overlap_thresh: float = 0.35
  rect_margin: int = 5
  rect_size_min: int = 7
  rect_size_range: int = 8
  alpha_min: float = 0.88
  alpha_range: float = 0.12


@dataclass(frozen=True)
class BackendSkyParams:
  clear_color: Vec3 = Vec3(0.55, 0.72, 0.98)


@dataclass(frozen=True)
class BackendRendererParams:
  camera: BackendCameraParams = field(default_factory=BackendCameraParams)
  shadow: BackendShadowParams = field(default_factory=BackendShadowParams)
  sun: BackendSunParams = field(default_factory=BackendSunParams)
  clouds: BackendCloudParams = field(default_factory=BackendCloudParams)
  sky: BackendSkyParams = field(default_factory=BackendSkyParams)


def default_backend_renderer_params() -> BackendRendererParams:
  return BackendRendererParams()
