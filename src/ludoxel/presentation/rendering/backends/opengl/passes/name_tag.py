# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from OpenGL.GL import GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST, GL_LESS, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRIANGLES, glActiveTexture, glBindTexture, glBindVertexArray, glBlendFunc, glDepthFunc, glDepthMask, glDisable, glDrawArraysInstanced, glEnable

from ludoxel.presentation.rendering.backends.opengl.gl.mesh_buffer import MeshBuffer
from ludoxel.presentation.rendering.backends.opengl.gl.shader_program import ShaderProgram
from ludoxel.presentation.rendering.backends.opengl.gl.state_guard import GLStateGuard
from ludoxel.presentation.rendering.backends.opengl.resources.image_texture import ImageTexture
from ludoxel.presentation.rendering.visuals.name_tags import NAME_TAG_FACE_INDEX, NameTagRenderState, NameTagTextureSpec, build_name_tag_face_rows, name_tag_content_key, render_name_tag_texture


@dataclass
class _CachedNameTagTexture:
  content_key: tuple[object, ...]
  spec: NameTagTextureSpec
  texture: ImageTexture


@dataclass
class NameTagPass:
  _prog: ShaderProgram | None = None
  _mesh: MeshBuffer | None = None
  _textures: dict[str, _CachedNameTagTexture] | None = None

  def initialize(self, prog: ShaderProgram) -> None:
    self._prog = prog
    self._mesh = MeshBuffer.create_quad_transform_instanced(int(NAME_TAG_FACE_INDEX))
    self._textures = {}

  def destroy(self) -> None:
    if self._textures is not None:
      for entry in self._textures.values():
        entry.texture.destroy()
      self._textures.clear()
    if self._mesh is not None:
      self._mesh.destroy()
    self._mesh = None
    self._prog = None
    self._textures = None

  def _texture_for_tag(self, tag: NameTagRenderState) -> _CachedNameTagTexture | None:
    if self._textures is None:
      return None
    tag_id = str(tag.tag_id)
    key = name_tag_content_key(tag)
    cached = self._textures.get(tag_id)
    if cached is not None and cached.content_key == key:
      return cached
    spec = render_name_tag_texture(tag)
    if spec is None:
      return None
    texture = ImageTexture.from_image(spec.image)
    next_cached = _CachedNameTagTexture(content_key=key, spec=spec, texture=texture)
    if cached is not None:
      cached.texture.destroy()
    self._textures[tag_id] = next_cached
    return next_cached

  def _evict_stale(self, live_ids: set[str]) -> None:
    if self._textures is None:
      return
    for tag_id in [key for key in self._textures.keys() if key not in live_ids]:
      cached = self._textures.pop(str(tag_id), None)
      if cached is not None:
        cached.texture.destroy()

  def draw(self, *, name_tags: tuple[NameTagRenderState, ...], view_proj: np.ndarray) -> tuple[int, int]:
    if self._prog is None or self._mesh is None or self._textures is None:
      return (0, 0)

    draw_calls = 0
    instances = 0
    live_ids: set[str] = set()

    with GLStateGuard(capture_framebuffer=False, capture_viewport=False, capture_enables=(GL_BLEND, GL_DEPTH_TEST, GL_CULL_FACE), capture_cull_mode=False, capture_polygon_mode=False):
      glEnable(GL_BLEND)
      glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
      glDisable(GL_CULL_FACE)
      glEnable(GL_DEPTH_TEST)
      glDepthMask(False)
      glDepthFunc(GL_LESS)

      self._prog.use()
      self._prog.set_mat4("u_viewProj", view_proj.astype(np.float32, copy=False))
      self._prog.set_int("u_texture", 0)
      glActiveTexture(GL_TEXTURE0)

      for tag in tuple(name_tags):
        cached = self._texture_for_tag(tag)
        if cached is None:
          continue
        live_ids.add(str(tag.tag_id))
        rows = build_name_tag_face_rows(tag, cached.spec)[int(NAME_TAG_FACE_INDEX)]
        if rows.size <= 0 or int(rows.shape[0]) <= 0:
          continue
        glBindTexture(GL_TEXTURE_2D, int(cached.texture.tex_id))
        self._mesh.upload_instances(rows)
        glBindVertexArray(int(self._mesh.vao))
        glDrawArraysInstanced(GL_TRIANGLES, 0, int(self._mesh.vertex_count), int(rows.shape[0]))
        glBindVertexArray(0)
        draw_calls += 1
        instances += int(rows.shape[0])

      glBindTexture(GL_TEXTURE_2D, 0)
      glDepthMask(True)

    self._evict_stale(live_ids)
    return (int(draw_calls), int(instances))
