# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.gl.shader_program import ShaderProgram
from ludoxel.presentation.rendering.backends.opengl.passes.textured_face import TexturedFacePass
from ludoxel.presentation.rendering.backends.opengl.resources.texture_atlas import TextureAtlas
from ludoxel.presentation.rendering.contracts.config import GeometryDistanceFog
from ludoxel.presentation.rendering.contracts.lookups import DefLookup, UVLookup


@dataclass
class TexturedBlockPassBase:
  _face_pass: TexturedFacePass | None = None
  _atlas: TextureAtlas | None = None
  _uv_lookup: UVLookup | None = None
  _def_lookup: DefLookup | None = None

  def initialize(self, *, prog: ShaderProgram, atlas: TextureAtlas, uv_lookup: UVLookup, def_lookup: DefLookup) -> None:
    self._face_pass = TexturedFacePass()
    self._face_pass.initialize(prog)
    self._atlas = atlas
    self._uv_lookup = uv_lookup
    self._def_lookup = def_lookup

  def destroy(self) -> None:
    if self._face_pass is not None:
      self._face_pass.destroy()
    self._face_pass = None
    self._atlas = None
    self._uv_lookup = None
    self._def_lookup = None

  def _ready(self) -> bool:
    return self._face_pass is not None and self._atlas is not None and self._uv_lookup is not None and self._def_lookup is not None

  def _draw_rows(self, *, rows: tuple[np.ndarray, ...], view_proj: np.ndarray, sun_dir: Vec3, fog: GeometryDistanceFog | None = None) -> tuple[int, int]:
    if self._face_pass is None or self._atlas is None:
      return (0, 0)
    return self._face_pass.draw(face_rows=rows, view_proj=view_proj, tex_id=int(self._atlas.tex_id), sun_dir=sun_dir, fog=fog)
