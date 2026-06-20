# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field, replace

from ludoxel.application.preferences.clouds import (
  DEFAULT_CLOUD_FIXED_Y,
  DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED,
  DEFAULT_CLOUD_PREFERRED_Y_MAX,
  DEFAULT_CLOUD_PREFERRED_Y_MIN,
  DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT,
  DEFAULT_CLOUD_SPAWN_Y_MAX,
  DEFAULT_CLOUD_SPAWN_Y_MIN,
  DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND,
  DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND,
  DEFAULT_CLOUD_SPEED_VARIATION_ENABLED,
)
from ludoxel.application.preferences.shadow import normalize_shadow_map_quality
from ludoxel.foundations.mathematics.chunks.grid import CHUNK_SIZE
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.worlds.config.render_distance import RENDER_DISTANCE_MAX_CHUNKS, clamp_render_distance_chunks

RENDER_DISTANCE_FADE_START_FRACTION: float = 0.85
CLOUD_RENDER_DISTANCE_MULTIPLIER: float = 1.5
CLOUD_MIN_VISIBLE_RADIUS_BLOCKS: float = 128.0


def render_distance_radius_blocks(render_distance_chunks: int) -> float:
  return float(int(clamp_render_distance_chunks(int(render_distance_chunks))) * int(CHUNK_SIZE))


def render_distance_fog_range(render_distance_chunks: int, z_far: float) -> tuple[float, float]:
  end = min(float(render_distance_radius_blocks(int(render_distance_chunks))), float(z_far))
  start = float(end) * float(RENDER_DISTANCE_FADE_START_FRACTION)
  return (float(start), float(end))


def max_unfogged_render_distance_radius_blocks(z_far: float) -> float:
  radius = float(int(clamp_render_distance_chunks(int(RENDER_DISTANCE_MAX_CHUNKS))) * int(CHUNK_SIZE))
  start = float(radius) * float(RENDER_DISTANCE_FADE_START_FRACTION)
  return float(min(float(start), float(z_far)))


def cloud_fog_range(render_distance_chunks: int, z_far: float) -> tuple[float, float]:
  end = min(max(float(render_distance_radius_blocks(int(render_distance_chunks))) * float(CLOUD_RENDER_DISTANCE_MULTIPLIER), float(CLOUD_MIN_VISIBLE_RADIUS_BLOCKS)), float(z_far))
  start = float(end) * float(RENDER_DISTANCE_FADE_START_FRACTION)
  return (float(start), float(end))


@dataclass(frozen=True)
class GeometryDistanceFog:
  cam_x: float
  cam_y: float
  cam_z: float
  start: float
  end: float
  color: Vec3 = Vec3(0.55, 0.72, 0.98)

  @staticmethod
  def disabled() -> "GeometryDistanceFog":
    return GeometryDistanceFog(cam_x=0.0, cam_y=0.0, cam_z=0.0, start=0.0, end=-1.0, color=Vec3(0.0, 0.0, 0.0))


@dataclass(frozen=True)
class CloudDistanceFog:
  cam_x: float
  cam_z: float
  start: float
  end: float
  color: Vec3 = Vec3(0.55, 0.72, 0.98)

  @staticmethod
  def disabled() -> "CloudDistanceFog":
    return CloudDistanceFog(cam_x=0.0, cam_z=0.0, start=0.0, end=-1.0, color=Vec3(0.0, 0.0, 0.0))


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
  coverage_radius: float = 40.0
  pcf_radius: float = 0.85


@dataclass(frozen=True)
class ShadowQualityPreset:
  quality: int
  size: int
  coverage_radius: float
  pcf_radius: float


_SHADOW_QUALITY_PRESETS: dict[int, ShadowQualityPreset] = {
  1: ShadowQualityPreset(quality=1, size=1024, coverage_radius=36.0, pcf_radius=1.50),
  2: ShadowQualityPreset(quality=2, size=1536, coverage_radius=38.0, pcf_radius=1.15),
  3: ShadowQualityPreset(quality=3, size=2048, coverage_radius=40.0, pcf_radius=0.85),
  4: ShadowQualityPreset(quality=4, size=3072, coverage_radius=46.0, pcf_radius=0.55),
  5: ShadowQualityPreset(quality=5, size=4096, coverage_radius=52.0, pcf_radius=0.35),
}


def resolve_shadow_quality_preset(quality: object) -> ShadowQualityPreset:
  return _SHADOW_QUALITY_PRESETS[normalize_shadow_map_quality(quality)]


def effective_backend_shadow_params(base: BackendShadowParams, quality: object) -> BackendShadowParams:
  preset = resolve_shadow_quality_preset(quality)
  return replace(base, size=int(preset.size), coverage_radius=float(preset.coverage_radius), pcf_radius=float(preset.pcf_radius))


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
  y: int = DEFAULT_CLOUD_FIXED_Y
  thickness: int = 3
  macro: int = 32
  rects_per_cell: int = 1
  candidates_per_cell: int = 5
  view_radius: int = 150
  speed_x: float = 0.70
  speed_z: float = 0.10
  speed_variation_enabled: bool = DEFAULT_CLOUD_SPEED_VARIATION_ENABLED
  speed_min_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND
  speed_max_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND
  height_variation_enabled: bool = DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED
  spawn_y_min: int = DEFAULT_CLOUD_SPAWN_Y_MIN
  spawn_y_max: int = DEFAULT_CLOUD_SPAWN_Y_MAX
  preferred_y_min: int = DEFAULT_CLOUD_PREFERRED_Y_MIN
  preferred_y_max: int = DEFAULT_CLOUD_PREFERRED_Y_MAX
  preferred_y_probability_percent: int = DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT
  color: Vec3 = Vec3(1.0, 1.0, 1.0)
  alpha: float = 0.90
  seed: int = 1337
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
