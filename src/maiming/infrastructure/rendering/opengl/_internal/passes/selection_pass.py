# FILE: src/maiming/infrastructure/rendering/opengl/_internal/passes/selection_pass.py
from __future__ import annotations

from dataclasses import dataclass
from ctypes import c_void_p

import numpy as np

from OpenGL.GL import (
    glGenVertexArrays,
    glBindVertexArray,
    glGenBuffers,
    glBindBuffer,
    glBufferData,
    glBufferSubData,
    glEnableVertexAttribArray,
    glVertexAttribPointer,
    glDeleteBuffers,
    glDeleteVertexArrays,
    glDrawArrays,
    glEnable,
    glDisable,
    glDepthMask,
    glDepthFunc,
    GL_ARRAY_BUFFER,
    GL_STREAM_DRAW,
    GL_FLOAT,
    GL_LINES,
    GL_DEPTH_TEST,
    GL_LEQUAL,
    GL_BLEND,
    GL_CULL_FACE,
)

from maiming.infrastructure.rendering.opengl._internal.gl.shader_program import ShaderProgram
from maiming.infrastructure.rendering.opengl._internal.gl.gl_state_guard import GLStateGuard

@dataclass
class SelectionPass:
    _prog: ShaderProgram | None = None

    _vao: int = 0
    _vbo: int = 0

    _vertex_count: int = 0
    _capacity_bytes: int = 0

    def initialize(self, prog: ShaderProgram) -> None:
        self._prog = prog

        vao = glGenVertexArrays(1)
        glBindVertexArray(int(vao))

        vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, int(vbo))
        glBufferData(GL_ARRAY_BUFFER, 0, None, GL_STREAM_DRAW)

        glEnableVertexAttribArray(0)
        glVertexAttribPointer(0, 3, GL_FLOAT, False, 3 * 4, c_void_p(0))

        glBindVertexArray(0)
        glBindBuffer(GL_ARRAY_BUFFER, 0)

        self._vao = int(vao)
        self._vbo = int(vbo)
        self._vertex_count = 0
        self._capacity_bytes = 0

    def destroy(self) -> None:
        if int(self._vbo) != 0:
            glDeleteBuffers(1, [int(self._vbo)])
            self._vbo = 0
        if int(self._vao) != 0:
            glDeleteVertexArrays(1, [int(self._vao)])
            self._vao = 0
        self._prog = None
        self._vertex_count = 0
        self._capacity_bytes = 0

    def clear(self) -> None:
        self._vertex_count = 0

    def set_lines(self, vertices_xyz: np.ndarray) -> None:
        if int(self._vao) == 0 or int(self._vbo) == 0:
            return

        v = vertices_xyz
        if v is None:
            self._vertex_count = 0
            return

        if v.dtype != np.float32:
            v = v.astype(np.float32, copy=False)
        if not v.flags["C_CONTIGUOUS"]:
            v = np.ascontiguousarray(v, dtype=np.float32)

        if v.ndim != 2 or v.shape[1] != 3:
            self._vertex_count = 0
            return

        nbytes = int(v.nbytes)
        self._vertex_count = int(v.shape[0])

        glBindBuffer(GL_ARRAY_BUFFER, int(self._vbo))

        if nbytes <= 0 or int(self._vertex_count) <= 0:
            glBufferData(GL_ARRAY_BUFFER, 0, None, GL_STREAM_DRAW)
            self._capacity_bytes = 0
            glBindBuffer(GL_ARRAY_BUFFER, 0)
            self._vertex_count = 0
            return

        if int(self._capacity_bytes) > 0 and nbytes <= int(self._capacity_bytes):
            glBufferSubData(GL_ARRAY_BUFFER, 0, nbytes, v)
        else:
            glBufferData(GL_ARRAY_BUFFER, nbytes, v, GL_STREAM_DRAW)
            self._capacity_bytes = int(nbytes)

        glBindBuffer(GL_ARRAY_BUFFER, 0)

    def draw(self, view_proj: np.ndarray) -> None:
        if self._prog is None or int(self._vao) == 0:
            return
        if int(self._vertex_count) <= 0:
            return

        with GLStateGuard(
            capture_framebuffer=False,
            capture_viewport=False,
            capture_enables=(GL_BLEND, GL_DEPTH_TEST, GL_CULL_FACE),
            capture_cull_mode=False,
            capture_polygon_mode=False,
        ):
            glDisable(GL_BLEND)
            glDisable(GL_CULL_FACE)

            glEnable(GL_DEPTH_TEST)
            glDepthMask(False)
            glDepthFunc(GL_LEQUAL)

            self._prog.use()
            self._prog.set_mat4("u_viewProj", view_proj)

            glBindVertexArray(int(self._vao))
            glDrawArrays(GL_LINES, 0, int(self._vertex_count))
            glBindVertexArray(0)

            glDepthMask(True)