# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.gl.shader_program import ShaderProgram
from ludoxel.presentation.rendering.backends.opengl.passes.textured_face import TexturedFacePass
from ludoxel.presentation.rendering.backends.opengl.resources.image_texture import ImageTexture
from ludoxel.presentation.rendering.visuals.players.first_person_geometry import build_first_person_arm_face_rows
from ludoxel.presentation.rendering.visuals.players.render_state import FirstPersonRenderState


@dataclass
class FirstPersonArmPass:
  _face_pass: TexturedFacePass | None = None
  _skin_texture: ImageTexture | None = None

  def initialize(self, *, prog: ShaderProgram, skin_texture: ImageTexture) -> None:
    self._face_pass = TexturedFacePass()
    self._face_pass.initialize(prog)
    self._skin_texture = skin_texture

  def destroy(self) -> None:
    if self._face_pass is not None:
      self._face_pass.destroy()
    self._face_pass = None
    self._skin_texture = None

  def set_skin_texture(self, skin_texture: ImageTexture) -> None:
    self._skin_texture = skin_texture

  def draw(self, *, first_person: FirstPersonRenderState | None, view_proj: np.ndarray, sun_dir: Vec3, hurt_tint_strength: float = 0.0) -> tuple[int, int]:
    if self._face_pass is None or self._skin_texture is None:
      return (0, 0)

    rows = build_first_person_arm_face_rows(first_person, projection=view_proj, skin_width=int(self._skin_texture.width), skin_height=int(self._skin_texture.height))
    return self._face_pass.draw(face_rows=rows, view_proj=view_proj, tex_id=int(self._skin_texture.tex_id), sun_dir=sun_dir, tint_mix=float(max(0.0, min(1.0, float(hurt_tint_strength)))))
