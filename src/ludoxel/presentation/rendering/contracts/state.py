# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.application.preferences.cloud_flow import DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION, normalize_backend_cloud_flow_direction
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
  normalize_cloud_height_settings,
  normalize_cloud_speed_range,
)
from ludoxel.application.preferences.shadow import SHADOW_MAP_QUALITY_DEFAULT, normalize_shadow_map_quality
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import sun_dir_from_az_el_deg


@dataclass
class BackendRendererRuntimeState:
  debug_shadow: bool = False
  shadow_enabled: bool = True
  shadow_quality: int = SHADOW_MAP_QUALITY_DEFAULT
  world_wireframe: bool = False
  outline_selection_enabled: bool = True

  cloud_wireframe: bool = False
  cloud_enabled: bool = True
  cloud_density: int = 1
  cloud_seed: int = 1337
  cloud_flow_direction: str = DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION
  cloud_speed_variation_enabled: bool = DEFAULT_CLOUD_SPEED_VARIATION_ENABLED
  cloud_speed_min_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND
  cloud_speed_max_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND
  cloud_height_variation_enabled: bool = DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED
  cloud_fixed_y: int = DEFAULT_CLOUD_FIXED_Y
  cloud_spawn_y_min: int = DEFAULT_CLOUD_SPAWN_Y_MIN
  cloud_spawn_y_max: int = DEFAULT_CLOUD_SPAWN_Y_MAX
  cloud_preferred_y_min: int = DEFAULT_CLOUD_PREFERRED_Y_MIN
  cloud_preferred_y_max: int = DEFAULT_CLOUD_PREFERRED_Y_MAX
  cloud_preferred_y_probability_percent: int = DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT
  animated_textures_enabled: bool = True

  sun_azimuth_deg: float = 45.0
  sun_elevation_deg: float = 60.0
  sun_dir: Vec3 = field(init=False)

  def __post_init__(self) -> None:
    self.set_shadow_quality(int(self.shadow_quality))
    self.set_sun_angles(float(self.sun_azimuth_deg), float(self.sun_elevation_deg))
    self.set_cloud_density(int(self.cloud_density))
    self.set_cloud_seed(int(self.cloud_seed))
    self.set_cloud_flow_direction(str(self.cloud_flow_direction))
    self.set_cloud_speed_variation(bool(self.cloud_speed_variation_enabled), float(self.cloud_speed_min_blocks_per_second), float(self.cloud_speed_max_blocks_per_second))
    self.set_cloud_height_variation(
      bool(self.cloud_height_variation_enabled),
      int(self.cloud_fixed_y),
      int(self.cloud_spawn_y_min),
      int(self.cloud_spawn_y_max),
      int(self.cloud_preferred_y_min),
      int(self.cloud_preferred_y_max),
      int(self.cloud_preferred_y_probability_percent),
    )

  def set_shadow_quality(self, quality: int) -> None:
    """
    Shadow map quality 段階を `[1, 5]` の有効値へ正規化して保持する。
    型不一致、欠落、範囲外値はいずれも `Standard` (3) へ収束させ、renderer backend はこの段階値から `effective_backend_shadow_params` を通じて実効 shadow パラメータを毎 frame 解決する。この段階は render distance とは独立であり、render distance chunks の変更ではこの値は変化しない。
    """
    self.shadow_quality = normalize_shadow_map_quality(quality)

  def set_sun_angles(self, azimuth_deg: float, elevation_deg: float) -> None:
    az = float(azimuth_deg) % 360.0
    if az < 0.0:
      az += 360.0
    el = max(0.0, min(90.0, float(elevation_deg)))
    self.sun_azimuth_deg = float(az)
    self.sun_elevation_deg = float(el)
    self.sun_dir = sun_dir_from_az_el_deg(float(self.sun_azimuth_deg), float(self.sun_elevation_deg))

  def set_cloud_density(self, density: int) -> None:
    self.cloud_density = int(max(0, int(density)))

  def set_cloud_seed(self, seed: int) -> None:
    self.cloud_seed = int(seed)

  def set_cloud_flow_direction(self, direction: str) -> None:
    self.cloud_flow_direction = normalize_backend_cloud_flow_direction(str(direction))

  def set_cloud_speed_variation(self, enabled: bool, min_speed: float, max_speed: float) -> None:
    speed_min, speed_max = normalize_cloud_speed_range(min_speed, max_speed)
    self.cloud_speed_variation_enabled = bool(enabled)
    self.cloud_speed_min_blocks_per_second = float(speed_min)
    self.cloud_speed_max_blocks_per_second = float(speed_max)

  def set_cloud_height_variation(self, enabled: bool, fixed_y: int, spawn_y_min: int, spawn_y_max: int, preferred_y_min: int, preferred_y_max: int, preferred_y_probability_percent: int) -> None:
    fixed, spawn_min, spawn_max, preferred_min, preferred_max, probability = normalize_cloud_height_settings(
      fixed_y, spawn_y_min, spawn_y_max, preferred_y_min, preferred_y_max, preferred_y_probability_percent
    )
    self.cloud_height_variation_enabled = bool(enabled)
    self.cloud_fixed_y = int(fixed)
    self.cloud_spawn_y_min = int(spawn_min)
    self.cloud_spawn_y_max = int(spawn_max)
    self.cloud_preferred_y_min = int(preferred_min)
    self.cloud_preferred_y_max = int(preferred_max)
    self.cloud_preferred_y_probability_percent = int(probability)
