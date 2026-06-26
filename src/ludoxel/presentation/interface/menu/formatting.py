# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time

_SIZE_UNITS = ("B", "KB", "MB", "GB", "TB")


def format_world_size(size_bytes: int) -> str:
  value = float(max(0, int(size_bytes)))
  unit_index = 0
  while value >= 1024.0 and unit_index < len(_SIZE_UNITS) - 1:
    value /= 1024.0
    unit_index += 1
  if unit_index == 0:
    return f"{int(value)} {_SIZE_UNITS[unit_index]}"
  return f"{value:.1f} {_SIZE_UNITS[unit_index]}"


def format_world_timestamp(epoch_seconds: float) -> str:
  if float(epoch_seconds) <= 0.0:
    return "Unknown"
  try:
    return time.strftime("%Y-%m-%d %H:%M", time.localtime(float(epoch_seconds)))
  except (OverflowError, ValueError, OSError):
    return "Unknown"


def game_mode_label(game_mode: str) -> str:
  return "Creative" if str(game_mode).strip().lower() == "creative" else "Survival"
