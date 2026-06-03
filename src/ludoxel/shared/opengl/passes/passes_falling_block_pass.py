# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import numpy as np

from ludoxel.shared.blocks.blocks_block_definition import BlockDefinition
from ludoxel.shared.math.math_vec3 import Vec3
from ludoxel.shared.opengl.gl.gl_shader_program import ShaderProgram
from ludoxel.shared.opengl.passes.passes_textured_face_pass import TexturedFacePass
from ludoxel.shared.opengl.resources.resources_texture_atlas import TextureAtlas
from ludoxel.shared.rendering.faces.faces_falling_block_face_rows import build_falling_block_face_rows
from ludoxel.shared.rendering.rendering_render_snapshot import FallingBlockRenderSampleDTO

UVRect = tuple[float, float, float, float]


@dataclass
class FallingBlockPass:
  _face_pass: TexturedFacePass | None = None
  _atlas: TextureAtlas | None = None
  _uv_lookup: Callable[[str, int], UVRect] | None = None
  _def_lookup: Callable[[str], BlockDefinition | None] | None = None

  def initialize(self, *, prog: ShaderProgram, atlas: TextureAtlas, uv_lookup, def_lookup) -> None:
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

  def draw(self, *, samples: tuple[FallingBlockRenderSampleDTO, ...], view_proj: np.ndarray, sun_dir: Vec3) -> tuple[int, int]:
    if self._face_pass is None or self._atlas is None or self._uv_lookup is None or self._def_lookup is None:
      return (0, 0)

    rows = build_falling_block_face_rows(samples=samples, uv_lookup=self._uv_lookup, def_lookup=self._def_lookup)
    return self._face_pass.draw(face_rows=rows, view_proj=view_proj, tex_id=int(self._atlas.tex_id), sun_dir=sun_dir)
