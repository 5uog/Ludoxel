# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

import numpy as np
from OpenGL.GL import GL_BLEND, GL_DEPTH_TEST, GL_FUNC_ADD, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA, GL_TRIANGLES, glBindVertexArray, glBlendEquation, glBlendFunc, glDepthMask, glDisable, glDrawArrays, glDrawArraysInstanced, glEnable

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.gl.shader_program import ShaderProgram
from ludoxel.presentation.rendering.contracts.config import BackendSunParams

_GLARE_HALF_ANGLE_DEG = 62.0


class SunPass:
  def __init__(self, cfg: BackendSunParams) -> None:
    self._cfg = cfg
    self._prog: ShaderProgram | None = None
    self._flare_prog: ShaderProgram | None = None

    self._empty_vao: int = 0

  def initialize(self, prog: ShaderProgram, flare_prog: ShaderProgram, empty_vao: int) -> None:
    self._prog = prog
    self._flare_prog = flare_prog
    self._empty_vao = int(empty_vao)

  def draw(self, eye: Vec3, view_proj: np.ndarray, sun_dir: Vec3, *, ultra: bool = False) -> None:
    if self._prog is None or int(self._empty_vao) == 0:
      return

    glDisable(GL_DEPTH_TEST)
    glDepthMask(False)

    glEnable(GL_BLEND)
    glBlendEquation(GL_FUNC_ADD)
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

    sun_center, sun_u, sun_v, sun_half = self._sun_quad(eye=eye, d=sun_dir.normalized())

    self._prog.use()
    self._prog.set_mat4("u_viewProj", view_proj)
    self._prog.set_vec3("u_center", sun_center.x, sun_center.y, sun_center.z)
    self._prog.set_vec3("u_u", sun_u.x, sun_u.y, sun_u.z)
    self._prog.set_vec3("u_v", sun_v.x, sun_v.y, sun_v.z)
    self._prog.set_float("u_halfSize", float(sun_half))
    self._prog.set_float("u_ultra", 1.0 if bool(ultra) else 0.0)
    self._prog.set_float("u_mode", 0.0)
    self._prog.set_float("u_glare", 0.0)

    glBindVertexArray(int(self._empty_vao))
    glDrawArraysInstanced(GL_TRIANGLES, 0, 6, 1)
    glBindVertexArray(0)

    glDisable(GL_BLEND)

  def draw_glare(self, eye: Vec3, view_proj: np.ndarray, sun_dir: Vec3, forward: Vec3, *, strength: float) -> None:
    # Ultra-only veiling glare. A camera-facing billboard is centered on the sun direction; the shader whitens the scene it covers most strongly
    # toward the sun so the world stays visible while looking into the light dazzles it.
    if self._prog is None or int(self._empty_vao) == 0 or float(strength) <= 0.0:
      return

    glare_center, glare_u, glare_v, glare_half = self._glare_quad(eye=eye, d=sun_dir.normalized(), forward=forward.normalized())

    # The veil is drawn as background before the world pass, so it writes no depth and never tests against it.
    # The opaque world drawn next overdraws the veil wherever geometry stands, so foreground blocks occlude the glow at the terrain silhouette.
    # Depth-testing this flat card at its single world depth instead cut a hard line across the fogged terrain and framed the veil against the sky;
    # leaving it as background keeps the falloff continuous.
    glDisable(GL_DEPTH_TEST)
    glDepthMask(False)

    glEnable(GL_BLEND)
    glBlendEquation(GL_FUNC_ADD)
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

    self._prog.use()
    self._prog.set_mat4("u_viewProj", view_proj)
    self._prog.set_vec3("u_center", glare_center.x, glare_center.y, glare_center.z)
    self._prog.set_vec3("u_u", glare_u.x, glare_u.y, glare_u.z)
    self._prog.set_vec3("u_v", glare_v.x, glare_v.y, glare_v.z)
    self._prog.set_float("u_halfSize", float(glare_half))
    self._prog.set_float("u_ultra", 1.0)
    self._prog.set_float("u_mode", 1.0)
    self._prog.set_float("u_glare", float(max(0.0, strength)))

    glBindVertexArray(int(self._empty_vao))
    glDrawArraysInstanced(GL_TRIANGLES, 0, 6, 1)
    glBindVertexArray(0)

    glDisable(GL_BLEND)
    glDepthMask(True)
    glEnable(GL_DEPTH_TEST)

  def draw_flare(self, sun_ndc: tuple[float, float], strength: float, aspect: float) -> None:
    # Screen-space lens flare drawn as a final overlay. A fullscreen triangle covers the frame;
    # the fragment stage places ghost discs along the axis through the sun's screen position and the frame centre.
    # It writes no depth and blends over the composed scene, so it reads as a lens artifact sitting outside the world geometry.
    if self._flare_prog is None or int(self._empty_vao) == 0 or float(strength) <= 0.0:
      return

    glDisable(GL_DEPTH_TEST)
    glDepthMask(False)

    glEnable(GL_BLEND)
    glBlendEquation(GL_FUNC_ADD)
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

    self._flare_prog.use()
    self._flare_prog.set_vec2("u_sunNdc", float(sun_ndc[0]), float(sun_ndc[1]))
    self._flare_prog.set_float("u_strength", float(max(0.0, strength)))
    self._flare_prog.set_float("u_aspect", float(max(1e-6, aspect)))

    glBindVertexArray(int(self._empty_vao))
    glDrawArrays(GL_TRIANGLES, 0, 3)
    glBindVertexArray(0)

    glDisable(GL_BLEND)
    glDepthMask(True)
    glEnable(GL_DEPTH_TEST)

  def _glare_quad(self, eye: Vec3, d: Vec3, forward: Vec3) -> tuple[Vec3, Vec3, Vec3, float]:
    up = Vec3(0.0, 1.0, 0.0)
    u = forward.cross(up)
    if u.length() <= 1e-6:
      u = forward.cross(Vec3(1.0, 0.0, 0.0))
    u = u.normalized()
    v = u.cross(forward).normalized()

    glare_dist = float(self._cfg.distance)
    glare_center = eye + d * glare_dist
    glare_half = math.tan(math.radians(float(_GLARE_HALF_ANGLE_DEG))) * glare_dist
    return glare_center, u, v, float(glare_half)

  def _sun_quad(self, eye: Vec3, d: Vec3) -> tuple[Vec3, Vec3, Vec3, float]:
    up = Vec3(0.0, 1.0, 0.0)

    u = up.cross(d)
    if u.length() <= 1e-6:
      u = Vec3(1.0, 0.0, 0.0).cross(d)
    u = u.normalized()
    v = d.cross(u).normalized()

    sun_dist = float(self._cfg.distance)
    sun_center = eye + d * sun_dist

    half_angle = float(self._cfg.half_angle_deg)
    sun_half = math.tan(math.radians(half_angle)) * sun_dist
    return sun_center, u, v, float(sun_half)
