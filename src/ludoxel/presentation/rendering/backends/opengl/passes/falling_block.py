# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.application.sessions.pipelines.render_snapshot import FallingBlockRenderSampleDTO
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.passes.textured_block import TexturedBlockPassBase
from ludoxel.presentation.rendering.contracts.config import DistanceFog
from ludoxel.presentation.rendering.faces.falling_blocks import build_falling_block_face_rows


class FallingBlockPass(TexturedBlockPassBase):
  def draw(self, *, samples: tuple[FallingBlockRenderSampleDTO, ...], view_proj: np.ndarray, sun_dir: Vec3, fog: DistanceFog | None = None) -> tuple[int, int]:
    if not self._ready() or self._uv_lookup is None or self._def_lookup is None:
      return (0, 0)

    rows = build_falling_block_face_rows(samples=samples, uv_lookup=self._uv_lookup, def_lookup=self._def_lookup)
    return self._draw_rows(rows=rows, view_proj=view_proj, sun_dir=sun_dir, fog=fog)
