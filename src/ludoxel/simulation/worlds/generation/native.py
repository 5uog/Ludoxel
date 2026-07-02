# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.simulation.worlds.generation import fallback as _fallback

try:
  from ludoxel.simulation.worlds.generation import _terrain_native as _native_module  # type: ignore[attr-defined]
except ImportError:
  _native_module = None


def native_terrain_available() -> bool:
  return _native_module is not None


def native_terrain_module_file() -> str | None:
  if _native_module is None:
    return None
  return str(getattr(_native_module, "__file__", "")) or None


def native_terrain_status() -> str:
  if _native_module is None:
    return "fallback:python"
  return f"native:rust:{native_terrain_module_file()}"


def surface_heights(seed: int, version: int, mode: int, flat_ground_y: int, x0: int, z0: int, nx: int, nz: int) -> np.ndarray:
  count_x = int(max(0, nx))
  count_z = int(max(0, nz))
  if _native_module is None:
    return _fallback.surface_heights(int(seed), int(version), int(mode), int(flat_ground_y), int(x0), int(z0), count_x, count_z)
  raw = _native_module.surface_heights(int(seed), int(version), int(mode), int(flat_ground_y), int(x0), int(z0), count_x, count_z)
  return np.frombuffer(raw, dtype="<i4").reshape((count_x, count_z)).copy()


def terrain_materials(seed: int, version: int, mode: int, flat_ground_y: int, x0: int, y0: int, z0: int, nx: int, ny: int, nz: int) -> np.ndarray:
  count_x = int(max(0, nx))
  count_y = int(max(0, ny))
  count_z = int(max(0, nz))
  if _native_module is None:
    return _fallback.terrain_materials(int(seed), int(version), int(mode), int(flat_ground_y), int(x0), int(y0), int(z0), count_x, count_y, count_z)
  raw = _native_module.terrain_materials(int(seed), int(version), int(mode), int(flat_ground_y), int(x0), int(y0), int(z0), count_x, count_y, count_z)
  return np.frombuffer(raw, dtype=np.uint8).reshape((count_x, count_y, count_z)).copy()
