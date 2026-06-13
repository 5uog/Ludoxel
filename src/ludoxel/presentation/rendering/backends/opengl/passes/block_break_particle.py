# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from ludoxel.application.sessions.pipelines.render_snapshot import BlockBreakParticleRenderSampleDTO
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.gl.shader_program import ShaderProgram
from ludoxel.presentation.rendering.backends.opengl.passes.textured_face import TexturedFacePass
from ludoxel.presentation.rendering.backends.opengl.resources.texture_atlas import TextureAtlas
from ludoxel.presentation.rendering.contracts.config import DistanceFog
from ludoxel.presentation.rendering.faces.break_particles import build_block_break_particle_face_rows


@dataclass
class BlockBreakParticlePass:
  _face_pass: TexturedFacePass | None = None
  _atlas: TextureAtlas | None = None

  def initialize(self, *, prog: ShaderProgram, atlas: TextureAtlas) -> None:
    self._face_pass = TexturedFacePass()
    self._face_pass.initialize(prog)
    self._atlas = atlas

  def destroy(self) -> None:
    if self._face_pass is not None:
      self._face_pass.destroy()
    self._face_pass = None
    self._atlas = None

  def draw(self, *, samples: tuple[BlockBreakParticleRenderSampleDTO, ...], view_proj: np.ndarray, sun_dir: Vec3, camera_forward: Vec3, fog: DistanceFog | None = None) -> tuple[int, int]:
    if self._face_pass is None or self._atlas is None or not samples:
      return (0, 0)

    rows = build_block_break_particle_face_rows(samples=samples, camera_forward=camera_forward)
    return self._face_pass.draw(face_rows=rows, view_proj=view_proj, tex_id=int(self._atlas.tex_id), sun_dir=sun_dir, fog=fog)
