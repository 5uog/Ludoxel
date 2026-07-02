# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.simulation.worlds.generation.terrain_math import material_code, surface_height


def surface_heights(seed: int, version: int, mode: int, flat_ground_y: int, x0: int, z0: int, nx: int, nz: int) -> np.ndarray:
  count_x = int(max(0, nx))
  count_z = int(max(0, nz))
  out = np.empty((count_x, count_z), dtype=np.int32)
  for ix in range(count_x):
    wx = int(x0) + ix
    for iz in range(count_z):
      out[ix, iz] = surface_height(int(seed), int(version), int(mode), int(flat_ground_y), int(wx), int(z0) + iz)
  return out


def terrain_materials(seed: int, version: int, mode: int, flat_ground_y: int, x0: int, y0: int, z0: int, nx: int, ny: int, nz: int) -> np.ndarray:
  count_x = int(max(0, nx))
  count_y = int(max(0, ny))
  count_z = int(max(0, nz))
  out = np.zeros((count_x, count_y, count_z), dtype=np.uint8)
  for ix in range(count_x):
    wx = int(x0) + ix
    for iz in range(count_z):
      wz = int(z0) + iz
      column_height = surface_height(int(seed), int(version), int(mode), int(flat_ground_y), int(wx), int(wz))
      for iy in range(count_y):
        wy = int(y0) + iy
        out[ix, iy, iz] = material_code(int(seed), int(version), int(mode), int(flat_ground_y), int(wx), int(wy), int(wz), column_height=int(column_height))
  return out
