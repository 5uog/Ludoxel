# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.scalars.numeric import clampf, clampi

CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND: float = 0.0
CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND: float = 4.0
DEFAULT_CLOUD_SPEED_VARIATION_ENABLED: bool = True
DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND: float = 0.50
DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND: float = 0.90

CLOUD_Y_MIN: int = 28
CLOUD_Y_MAX: int = 250
DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED: bool = True
DEFAULT_CLOUD_FIXED_Y: int = CLOUD_Y_MIN
DEFAULT_CLOUD_SPAWN_Y_MIN: int = CLOUD_Y_MIN
DEFAULT_CLOUD_SPAWN_Y_MAX: int = 35
DEFAULT_CLOUD_PREFERRED_Y_MIN: int = CLOUD_Y_MIN
DEFAULT_CLOUD_PREFERRED_Y_MAX: int = 30
DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT: int = 70


def normalize_cloud_speed_range(min_speed: object, max_speed: object) -> tuple[float, float]:
  lo = clampf(float(min_speed), float(CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND), float(CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND))
  hi = clampf(float(max_speed), float(CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND), float(CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND))
  if float(lo) > float(hi):
    lo, hi = float(hi), float(lo)
  return (float(lo), float(hi))


def normalize_cloud_height_settings(
  fixed_y: object, spawn_y_min: object, spawn_y_max: object, preferred_y_min: object, preferred_y_max: object, preferred_y_probability_percent: object
) -> tuple[int, int, int, int, int, int]:
  fixed = clampi(int(fixed_y), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
  spawn_lo = clampi(int(spawn_y_min), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
  spawn_hi = clampi(int(spawn_y_max), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
  if int(spawn_lo) > int(spawn_hi):
    spawn_lo, spawn_hi = int(spawn_hi), int(spawn_lo)

  preferred_lo = clampi(int(preferred_y_min), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
  preferred_hi = clampi(int(preferred_y_max), int(CLOUD_Y_MIN), int(CLOUD_Y_MAX))
  if int(preferred_lo) > int(preferred_hi):
    preferred_lo, preferred_hi = int(preferred_hi), int(preferred_lo)
  preferred_lo = clampi(int(preferred_lo), int(spawn_lo), int(spawn_hi))
  preferred_hi = clampi(int(preferred_hi), int(spawn_lo), int(spawn_hi))

  probability = clampi(int(preferred_y_probability_percent), 0, 100)
  return (int(fixed), int(spawn_lo), int(spawn_hi), int(preferred_lo), int(preferred_hi), int(probability))
