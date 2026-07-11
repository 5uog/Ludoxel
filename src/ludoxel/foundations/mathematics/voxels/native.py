# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import struct
from typing import Iterator

from ludoxel.foundations.mathematics._native import native_module
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.voxels import dda as _fallback
from ludoxel.foundations.mathematics.voxels.dda import DDAHit

_RECORD_FORMAT = "<qqqdi"
_RECORD_SIZE = struct.calcsize(_RECORD_FORMAT)


def dda_grid_traverse(origin: Vec3, direction: Vec3, t_max: float, cell_size: float = 1.0) -> Iterator[DDAHit]:
  if native_module is None:
    yield from _fallback.dda_grid_traverse(origin, direction, t_max, cell_size)
    return

  raw = native_module.dda_grid_traverse_batch(origin.x, origin.y, origin.z, direction.x, direction.y, direction.z, float(t_max), float(cell_size))
  for offset in range(0, len(raw), _RECORD_SIZE):
    cell_x, cell_y, cell_z, t, enter_face = struct.unpack_from(_RECORD_FORMAT, raw, offset)
    yield DDAHit(cell_x=int(cell_x), cell_y=int(cell_y), cell_z=int(cell_z), t=float(t), enter_face=int(enter_face))
