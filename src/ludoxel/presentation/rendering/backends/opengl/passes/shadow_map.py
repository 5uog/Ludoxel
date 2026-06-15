# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Callable

import numpy as np
from OpenGL.GL import (
  GL_BLEND,
  GL_CLAMP_TO_BORDER,
  GL_COMPARE_REF_TO_TEXTURE,
  GL_CULL_FACE,
  GL_DEPTH_ATTACHMENT,
  GL_DEPTH_BUFFER_BIT,
  GL_DEPTH_COMPONENT,
  GL_DEPTH_COMPONENT24,
  GL_DEPTH_TEST,
  GL_FRAMEBUFFER,
  GL_FRAMEBUFFER_BINDING,
  GL_FRAMEBUFFER_COMPLETE,
  GL_FRONT,
  GL_LEQUAL,
  GL_LESS,
  GL_LINEAR,
  GL_MAX_TEXTURE_SIZE,
  GL_NONE,
  GL_POLYGON_OFFSET_FILL,
  GL_TEXTURE_2D,
  GL_TEXTURE_BINDING_2D,
  GL_TEXTURE_BORDER_COLOR,
  GL_TEXTURE_COMPARE_FUNC,
  GL_TEXTURE_COMPARE_MODE,
  GL_TEXTURE_MAG_FILTER,
  GL_TEXTURE_MIN_FILTER,
  GL_TEXTURE_WRAP_S,
  GL_TEXTURE_WRAP_T,
  GL_UNSIGNED_INT,
  glBindFramebuffer,
  glBindTexture,
  glCheckFramebufferStatus,
  glClear,
  glCullFace,
  glDeleteFramebuffers,
  glDeleteTextures,
  glDepthFunc,
  glDepthMask,
  glDisable,
  glDrawBuffer,
  glEnable,
  glFramebufferTexture2D,
  glGenFramebuffers,
  glGenTextures,
  glGetIntegerv,
  glPolygonOffset,
  glReadBuffer,
  glTexImage2D,
  glTexParameterfv,
  glTexParameteri,
  glViewport,
)

from ludoxel.foundations.mathematics.chunks.grid import ChunkKey
from ludoxel.presentation.rendering.backends.opengl.gl.shader_program import ShaderProgram
from ludoxel.presentation.rendering.backends.opengl.gl.state_guard import GLStateGuard
from ludoxel.presentation.rendering.backends.opengl.passes.aggregated_face_batch import AggregatedFaceBatch
from ludoxel.presentation.rendering.backends.opengl.runtime.metrics import PassFrameMetrics
from ludoxel.presentation.rendering.contracts.config import BackendShadowParams
from ludoxel.presentation.rendering.visuals.selections.chunk import select_visible_chunks, within_render_distance


@dataclass
class ShadowMapInfo:
  ok: bool
  size: int
  tex_id: int
  inst_count: int


ExtraShadowDraw = Callable[[np.ndarray], tuple[int, int]]


def _gl_int(name: int, default: int = 0) -> int:
  value = glGetIntegerv(int(name))
  if value is None:
    return int(default)
  if hasattr(value, "__len__"):
    if len(value) <= 0:
      return int(default)
    return int(value[0])
  return int(value)


class ShadowMapPass:
  def __init__(self, cfg: BackendShadowParams) -> None:
    self._cfg = cfg

    self._prog: ShaderProgram | None = None

    self._fbo: int = 0
    self._tex: int = 0
    self._size: int = int(cfg.size)
    self._ok: bool = False

    self._batch = AggregatedFaceBatch()
    self._last_metrics = PassFrameMetrics()
    self._last_extra_instances: int = 0
    self._last_render_signature: tuple[object, ...] | None = None

  def initialize(self, prog: ShaderProgram, size: int) -> None:
    self._prog = prog
    self._create_shadow_map(size)
    self._batch.initialize()

  def destroy(self) -> None:
    self._batch.destroy()
    self._destroy_shadow_map()
    self._prog = None
    self._last_metrics = PassFrameMetrics()
    self._last_extra_instances = 0
    self._last_render_signature = None

  def info(self) -> ShadowMapInfo:
    return ShadowMapInfo(ok=bool(self._ok), size=int(self._size), tex_id=int(self._tex), inst_count=int(self._batch.total_instances() + self._last_extra_instances))

  def ensure_size(self, size: int) -> None:
    """
    shadow depth texture の一辺画素数を要求値へ合わせ、必要な場合だけ framebuffer と depth texture を再生成する。
    要求値は `_normalize_shadow_size` で OpenGL context の `GL_MAX_TEXTURE_SIZE` と renderer 側上限の小さい方へ clamp される。
    clamp 後の値が現在の `self._size` と一致する場合は何もせず、既存 GPU 資源と render 署名 cache を保持する。
    一致しない場合は古い texture と framebuffer を破棄して新しい解像度で作り直し、次 frame の shadow を新しい texel 密度で描画させる。
    この再生成は OpenGL context が current な render 経路からのみ呼ばれることを前提とし、shadow map quality の変更によって texel 密度を変えるための唯一の経路である。
    prog 未設定 (初期化前) の場合は何もしない。
    """
    if self._prog is None:
      return
    requested = self._normalize_shadow_size(size)
    if int(requested) == int(self._size) and bool(self._ok) and int(self._tex) != 0 and int(self._fbo) != 0:
      return
    self._create_shadow_map(int(requested))

  def remove_chunk(self, chunk_key: ChunkKey) -> None:
    self._batch.remove_chunk(chunk_key)

  def evict_except(self, keep: set[ChunkKey]) -> None:
    self._batch.evict_except(keep)

  def set_chunk_faces(self, *, chunk_key: ChunkKey, world_revision: int, faces: list[np.ndarray]) -> None:
    self._batch.set_chunk_faces(chunk_key=chunk_key, world_revision=int(world_revision), faces=faces)

  def render(
    self, light_vp: np.ndarray, *, camera_chunk: ChunkKey | None = None, render_distance_chunks: int | None = None, extra_draw: ExtraShadowDraw | None = None, extra_cache_key: object | None = None
  ) -> PassFrameMetrics:
    t0 = time.perf_counter()

    if self._prog is None:
      self._last_metrics = PassFrameMetrics()
      return self._last_metrics
    if not bool(self._cfg.enabled):
      self._last_metrics = PassFrameMetrics()
      return self._last_metrics
    if not bool(self._ok) or int(self._fbo) == 0 or int(self._tex) == 0:
      self._last_metrics = PassFrameMetrics()
      return self._last_metrics
    if int(self._batch.total_instances()) <= 0 and extra_draw is None:
      self._last_metrics = PassFrameMetrics()
      return self._last_metrics

    self._batch.prepare()

    s = int(self._size)
    vp = light_vp.astype(np.float32, copy=False)
    render_signature = (int(self._batch.revision()), bytes(vp.tobytes()), extra_cache_key)
    if self._last_render_signature == render_signature:
      self._last_metrics = PassFrameMetrics()
      return self._last_metrics
    self._last_extra_instances = 0

    shadow_camera_chunk = None if camera_chunk is None else (int(camera_chunk[0]), int(camera_chunk[1]), int(camera_chunk[2]))
    shadow_render_distance = None if render_distance_chunks is None else max(0, int(render_distance_chunks) + 1)
    predicate = None if shadow_camera_chunk is None or shadow_render_distance is None else (lambda ck: within_render_distance(ck, shadow_camera_chunk, int(shadow_render_distance)))
    visible_chunks = select_visible_chunks(self._batch.chunk_keys(), vp, predicate=predicate)
    commands = self._batch.build_commands(visible_chunks)

    with GLStateGuard(
      capture_framebuffer=True, capture_viewport=True, capture_enables=(GL_BLEND, GL_DEPTH_TEST, GL_CULL_FACE, GL_POLYGON_OFFSET_FILL), capture_cull_mode=True, capture_polygon_mode=False
    ):
      glBindFramebuffer(GL_FRAMEBUFFER, int(self._fbo))
      glViewport(0, 0, s, s)

      glDisable(GL_BLEND)

      if bool(self._cfg.cull_front):
        glEnable(GL_CULL_FACE)
        glCullFace(GL_FRONT)
      else:
        glDisable(GL_CULL_FACE)

      glEnable(GL_DEPTH_TEST)
      glDepthMask(True)
      glDepthFunc(GL_LESS)

      glClear(GL_DEPTH_BUFFER_BIT)

      glEnable(GL_POLYGON_OFFSET_FILL)
      glPolygonOffset(float(self._cfg.poly_offset_factor), float(self._cfg.poly_offset_units))

      self._prog.use()
      self._prog.set_mat4("u_lightViewProj", vp)

      draw_calls, instances = self._batch.draw(commands, before_face_draw=lambda fi: self._prog.set_int("u_face", int(fi)))

      if extra_draw is not None:
        extra_dc, extra_inst = extra_draw(vp)
        draw_calls += int(extra_dc)
        instances += int(extra_inst)
        self._last_extra_instances = int(extra_inst)

      glDisable(GL_POLYGON_OFFSET_FILL)

    self._last_metrics = PassFrameMetrics(cpu_ms=float((time.perf_counter() - t0) * 1000.0), draw_calls=int(draw_calls), instances=int(instances), rendered=bool(draw_calls > 0))
    self._last_render_signature = render_signature
    return self._last_metrics

  def _normalize_shadow_size(self, size: int) -> int:
    requested = int(max(64, min(8192, int(size))))
    max_texture_size = int(max(64, _gl_int(GL_MAX_TEXTURE_SIZE, requested)))
    return int(max(64, min(requested, max_texture_size)))

  def _destroy_shadow_map(self) -> None:
    if int(self._tex) != 0:
      glDeleteTextures(1, [int(self._tex)])
      self._tex = 0
    if int(self._fbo) != 0:
      glDeleteFramebuffers(1, [int(self._fbo)])
      self._fbo = 0
    self._ok = False

  def _create_shadow_map(self, size: int) -> None:
    size_i = self._normalize_shadow_size(size)
    prev_framebuffer = _gl_int(GL_FRAMEBUFFER_BINDING, 0)
    prev_texture_2d = _gl_int(GL_TEXTURE_BINDING_2D, 0)

    old_tex = int(self._tex)
    old_fbo = int(self._fbo)

    self._destroy_shadow_map()
    self._size = int(size_i)
    self._last_render_signature = None

    tex = 0
    fbo = 0
    try:
      tex = int(glGenTextures(1))
      glBindTexture(GL_TEXTURE_2D, tex)

      glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT24, size_i, size_i, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_INT, None)

      glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
      glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)

      glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER)
      glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER)
      glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, [1.0, 1.0, 1.0, 1.0])

      glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_REF_TO_TEXTURE)
      glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_FUNC, GL_LEQUAL)

      fbo = int(glGenFramebuffers(1))
      glBindFramebuffer(GL_FRAMEBUFFER, fbo)
      glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, tex, 0)

      glDrawBuffer(GL_NONE)
      glReadBuffer(GL_NONE)

      status = int(glCheckFramebufferStatus(GL_FRAMEBUFFER))
      if status != int(GL_FRAMEBUFFER_COMPLETE):
        if int(tex) != 0:
          glDeleteTextures(1, [int(tex)])
        if int(fbo) != 0:
          glDeleteFramebuffers(1, [int(fbo)])
        self._tex = 0
        self._fbo = 0
        self._ok = False
        return

      self._tex = tex
      self._fbo = fbo
      self._ok = True
    finally:
      restored_texture = 0 if int(prev_texture_2d) in {int(old_tex), int(tex)} else int(prev_texture_2d)
      restored_framebuffer = 0 if int(prev_framebuffer) in {int(old_fbo), int(fbo)} else int(prev_framebuffer)
      glBindTexture(GL_TEXTURE_2D, int(restored_texture))
      glBindFramebuffer(GL_FRAMEBUFFER, int(restored_framebuffer))
