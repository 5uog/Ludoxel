# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.passes.textured_block import TexturedBlockPassBase
from ludoxel.presentation.rendering.visuals.players.first_person_geometry import build_first_person_held_block_face_rows
from ludoxel.presentation.rendering.visuals.players.render_state import FirstPersonRenderState


class HeldBlockPass(TexturedBlockPassBase):
  def draw(self, *, first_person: FirstPersonRenderState | None, view_proj: np.ndarray, sun_dir: Vec3) -> tuple[int, int]:
    if not self._ready() or self._uv_lookup is None or self._def_lookup is None:
      return (0, 0)

    rows = build_first_person_held_block_face_rows(first_person, projection=view_proj, uv_lookup=self._uv_lookup, def_lookup=self._def_lookup)
    return self._draw_rows(rows=rows, view_proj=view_proj, sun_dir=sun_dir)
