# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time

import numpy as np
from OpenGL.GL import (
  GL_BACK,
  GL_BLEND,
  GL_CULL_FACE,
  GL_DEPTH_TEST,
  GL_FRONT,
  GL_FUNC_ADD,
  GL_LESS,
  GL_LINES,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_SRC_ALPHA,
  GL_TRIANGLES,
  glBindVertexArray,
  glBlendEquation,
  glBlendFunc,
  glCullFace,
  glDepthFunc,
  glDepthMask,
  glDisable,
  glDrawArraysInstanced,
  glEnable,
)

from ludoxel.application.preferences.cloud_flow import DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION, normalize_backend_cloud_flow_direction
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.backends.opengl.gl.mesh_buffer import MeshBuffer
from ludoxel.presentation.rendering.backends.opengl.gl.shader_program import ShaderProgram
from ludoxel.presentation.rendering.contracts.config import BackendCameraParams, BackendCloudParams, CloudDistanceFog
from ludoxel.presentation.rendering.visuals.worlds.cloud_field import CLOUD_FACE_COUNT, CloudField, cloud_face_rows, cloud_volume_rows


class CloudPass:
  def __init__(self, clouds: BackendCloudParams, camera: BackendCameraParams) -> None:
    self._cfg = clouds
    self._cam = camera

    self._prog: ShaderProgram | None = None
    self._volume_prog: ShaderProgram | None = None
    self._face_meshes: tuple[MeshBuffer, ...] = ()
    self._face_wire_meshes: tuple[MeshBuffer, ...] = ()
    self._volume_mesh: MeshBuffer | None = None

    self._field = CloudField(self._cfg)

    self._wireframe = False
    self._enabled = True

    self._density = int(max(0, int(self._cfg.rects_per_cell)))
    self._seed = int(self._cfg.seed)
    self._flow_direction = normalize_backend_cloud_flow_direction(DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION)

    self._motion_paused = False
    self._time_accum = 0.0
    self._last_clock = time.perf_counter()
    self._signature: tuple | None = None
    self._face_counts: list[int] = [0] * int(CLOUD_FACE_COUNT)
    self._volume_count: int = 0

    self._field.set_density(int(self._density))
    self._field.set_seed(int(self._seed))
    self._field.set_flow_direction(self._flow_direction, t_seconds=0.0)

  def initialize(self, prog: ShaderProgram, face_meshes: tuple[MeshBuffer, ...], face_wire_meshes: tuple[MeshBuffer, ...], volume_prog: ShaderProgram, volume_mesh: MeshBuffer) -> None:
    self._prog = prog
    self._face_meshes = tuple(face_meshes)
    self._face_wire_meshes = tuple(face_wire_meshes)
    self._volume_prog = volume_prog
    self._volume_mesh = volume_mesh
    self._time_accum = 0.0
    self._last_clock = time.perf_counter()
    self._signature = None
    self._field.set_flow_direction(self._flow_direction, t_seconds=0.0)

  def _advance_clock(self) -> None:
    now = time.perf_counter()
    dt = max(0.0, min(0.25, now - self._last_clock))
    self._last_clock = now
    if not bool(self._motion_paused):
      self._time_accum += float(dt)

  def _invalidate(self) -> None:
    self._signature = None

  def set_wireframe(self, on: bool) -> None:
    self._wireframe = bool(on)

  def set_enabled(self, on: bool) -> None:
    self._enabled = bool(on)

  def set_density(self, density: int) -> None:
    d = int(max(0, density))
    if d == int(self._density):
      return
    self._density = d
    self._invalidate()
    self._field.set_density(int(self._density))

  def set_cell_size(self, cell_size: int) -> None:
    if self._field.set_cell_size(int(cell_size)):
      self._invalidate()

  def set_seed(self, seed: int) -> None:
    s = int(seed)
    if s == int(self._seed):
      return
    self._seed = s
    self._invalidate()
    self._field.set_seed(int(self._seed))

  def set_flow_direction(self, direction: str) -> None:
    self._advance_clock()
    nxt = normalize_backend_cloud_flow_direction(str(direction))
    if str(nxt) == str(self._flow_direction):
      return
    self._flow_direction = str(nxt)
    self._field.set_flow_direction(str(self._flow_direction), t_seconds=float(self._time_accum))
    self._invalidate()

  def set_speed_variation(self, enabled: bool, min_speed: float, max_speed: float) -> None:
    if self._field.set_speed_variation(bool(enabled), float(min_speed), float(max_speed)):
      self._invalidate()

  def set_height_variation(self, enabled: bool, fixed_y: int, spawn_y_min: int, spawn_y_max: int, preferred_y_min: int, preferred_y_max: int, preferred_y_probability_percent: int) -> None:
    if self._field.set_height_variation(bool(enabled), int(fixed_y), int(spawn_y_min), int(spawn_y_max), int(preferred_y_min), int(preferred_y_max), int(preferred_y_probability_percent)):
      self._invalidate()

  def set_motion_paused(self, on: bool) -> None:
    self._advance_clock()
    self._motion_paused = bool(on)

  def draw(
    self, eye: Vec3, view_proj: np.ndarray, forward: Vec3, fov_deg: float, aspect: float, sun_dir: Vec3, fog: CloudDistanceFog | None = None, far_distance: float | None = None, ultra: bool = False
  ) -> None:
    self._advance_clock()

    if not bool(self._enabled):
      return
    if int(self._density) <= 0:
      return
    if self._prog is None or self._volume_prog is None or self._volume_mesh is None or not self._face_meshes:
      return

    shift = self._field.shift(float(self._time_accum))
    cull_far = float(self._cam.z_far) if far_distance is None else float(far_distance)

    shapes = self._field.visible_shapes(eye=eye, shift=shift, forward=forward, fov_deg=float(fov_deg), aspect=float(aspect), z_far=float(cull_far))
    if not shapes:
      self._invalidate()
      return

    # Three separated paths. Wireframe draws the exterior cell-face edges of
    # the merged cloud footprint (no interior faces); the flat path draws
    # the same exterior faces solid; the Ultra path raymarches a translucent
    # animated volume through one bounding box per cloud.
    use_volume = bool(ultra) and not bool(self._wireframe)
    mode = "volume" if use_volume else ("wire" if bool(self._wireframe) else "flat")
    if bool(use_volume):
      # Draw the translucent volumes back to front so a nearer cloud blends
      # over the ones behind it instead of hiding them.
      shapes = sorted(
        shapes,
        key=lambda s: (
          -(
            (float(s.bounds.center.x) + float(shift.x) * float(s.bounds.speed_multiplier) - float(eye.x)) ** 2
            + (float(s.bounds.center.y) - float(eye.y)) ** 2
            + (float(s.bounds.center.z) + float(shift.z) * float(s.bounds.speed_multiplier) - float(eye.z)) ** 2
          )
        ),
      )
    signature = (str(mode), tuple(int(id(shape)) for shape in shapes))
    if self._signature != signature:
      self._upload(shapes, mode=str(mode))
      self._signature = signature

    glEnable(GL_DEPTH_TEST)
    # The translucent volume never writes depth so it stays see-through and
    # blends front to back; the flat faces and wireframe edges write depth.
    glDepthMask(not bool(use_volume))
    glDepthFunc(GL_LESS)

    glEnable(GL_BLEND)
    glBlendEquation(GL_FUNC_ADD)
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

    if bool(use_volume):
      # Draw the box back faces so the raymarch proxy is rasterized from any
      # camera side, including inside the volume.
      glEnable(GL_CULL_FACE)
      glCullFace(GL_FRONT)
    elif bool(self._wireframe):
      glDisable(GL_CULL_FACE)
    else:
      glEnable(GL_CULL_FACE)
      glCullFace(GL_BACK)

    active_fog = fog if fog is not None else CloudDistanceFog.disabled()
    col = self._cfg.color

    if bool(use_volume):
      prog = self._volume_prog
      prog.use()
      prog.set_mat4("u_viewProj", view_proj)
      prog.set_vec3("u_shift", shift.x, shift.y, shift.z)
      prog.set_vec3("u_color", float(col.x), float(col.y), float(col.z))
      prog.set_float("u_alpha", float(self._cfg.alpha))
      prog.set_vec3("u_sunDir", sun_dir.x, sun_dir.y, sun_dir.z)
      prog.set_vec3("u_eyePos", float(eye.x), float(eye.y), float(eye.z))
      prog.set_float("u_time", float(self._time_accum))
      prog.set_float("u_cellSize", float(max(1, int(self._field.cell_size()))))
      prog.set_vec2("u_fogCamXZ", float(active_fog.cam_x), float(active_fog.cam_z))
      prog.set_float("u_fogStart", float(active_fog.start))
      prog.set_float("u_fogEnd", float(active_fog.end))
      if int(self._volume_count) > 0:
        glBindVertexArray(self._volume_mesh.vao)
        glDrawArraysInstanced(GL_TRIANGLES, 0, self._volume_mesh.vertex_count, int(self._volume_count))
        glBindVertexArray(0)
    else:
      prog = self._prog
      flow_x, flow_z = self._field.flow_dir_xz()
      prog.use()
      prog.set_mat4("u_viewProj", view_proj)
      prog.set_vec3("u_shift", shift.x, shift.y, shift.z)
      prog.set_float("u_time", float(self._time_accum))
      prog.set_vec2("u_flowDirXZ", float(flow_x), float(flow_z))
      prog.set_vec3("u_color", float(col.x), float(col.y), float(col.z))
      prog.set_float("u_alpha", float(self._cfg.alpha))
      prog.set_vec3("u_sunDir", sun_dir.x, sun_dir.y, sun_dir.z)
      prog.set_vec2("u_fogCamXZ", float(active_fog.cam_x), float(active_fog.cam_z))
      prog.set_float("u_fogStart", float(active_fog.start))
      prog.set_float("u_fogEnd", float(active_fog.end))
      meshes = self._face_wire_meshes if bool(self._wireframe) else self._face_meshes
      primitive = GL_LINES if bool(self._wireframe) else GL_TRIANGLES
      for face in range(int(CLOUD_FACE_COUNT)):
        count = int(self._face_counts[face])
        if count <= 0:
          continue
        mesh = meshes[face]
        glBindVertexArray(mesh.vao)
        glDrawArraysInstanced(primitive, 0, mesh.vertex_count, int(count))
        glBindVertexArray(0)

    glDepthMask(True)
    glDisable(GL_CULL_FACE)
    glDisable(GL_BLEND)

  def _upload(self, shapes: list, *, mode: str) -> None:
    if str(mode) == "volume":
      rows = cloud_volume_rows(shapes)
      self._volume_mesh.upload_instances(rows)
      self._volume_count = int(rows.shape[0])
      self._face_counts = [0] * int(CLOUD_FACE_COUNT)
      return
    meshes = self._face_wire_meshes if str(mode) == "wire" else self._face_meshes
    self._volume_count = 0
    for face in range(int(CLOUD_FACE_COUNT)):
      rows = cloud_face_rows(shapes, face)
      meshes[face].upload_instances(rows)
      self._face_counts[face] = int(rows.shape[0])
