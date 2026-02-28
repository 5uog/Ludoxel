# FILE: infrastructure/rendering/opengl/passes/worldPass.py
from __future__ import annotations

"""
WorldPass renders opaque voxel faces using instanced drawing and a texture atlas. The responsibility of
this file is to be the single place where the world shading program is bound, its uniforms are authored,
and the draw submission is issued in a deterministic order. This separation is engineering-relevant
because opaque rendering is extremely stateful, and mixing world rendering with unrelated passes tends to
produce implicit dependencies that later block optimization.

The pass uses six face-direction meshes. This is a structural choice: by baking per-face normals and base
UVs into static vertex buffers, the shader remains branch-free with respect to face orientation, and the
instance payload stays compact. Shadow mapping is integrated by sampling a sampler2DShadow, using a
compare-mode depth texture produced by ShadowMapPass. A resolution-aware texel size uniform is provided
so that bias and sampling footprints scale correctly when shadow size changes.
"""

from dataclasses import dataclass
import numpy as np

from OpenGL.GL import (
    glActiveTexture, glBindTexture, glEnable, glDisable, glCullFace, glBindVertexArray, glDrawArraysInstanced,
    glPolygonMode,
    GL_TEXTURE0, GL_TEXTURE1, GL_TEXTURE_2D, GL_CULL_FACE, GL_BACK, GL_TRIANGLES,
    GL_FRONT_AND_BACK, GL_LINE,
)

from core.math.vec3 import Vec3
from ..gl.shaderProgram import ShaderProgram
from ..gl.meshBuffer import MeshBuffer
from ..gl.glStateGuard import GLStateGuard
from ..resources.textureAtlas import TextureAtlas
from ..glRendererParams import ShadowParams
from .shadowMapPass import ShadowMapInfo

@dataclass(frozen=True)
class WorldDrawInputs:
    view_proj: np.ndarray
    light_view_proj: np.ndarray
    sun_dir: Vec3
    debug_shadow: bool

    # Runtime toggles (presentation-driven).
    shadow_enabled: bool
    world_wireframe: bool

    # Static tuning surface (bias, dark_mul, etc.).
    shadow: ShadowParams
    shadow_info: ShadowMapInfo

class WorldPass:
    def __init__(self) -> None:
        self._prog: ShaderProgram | None = None
        self._meshes: list[MeshBuffer] | None = None
        self._atlas: TextureAtlas | None = None

        # Per-face instance counts allow skipping empty directions and reduce VAO binds.
        self._counts: list[int] = [0, 0, 0, 0, 0, 0]

        # World revision gating prevents expensive instance buffer uploads when the world is unchanged.
        self._last_revision: int = -1

    def initialize(self, prog: ShaderProgram, meshes: list[MeshBuffer], atlas: TextureAtlas) -> None:
        self._prog = prog
        self._meshes = meshes
        self._atlas = atlas

    def upload_faces(self, world_revision: int, faces: list[np.ndarray]) -> None:
        if self._meshes is None:
            return
        if int(world_revision) == int(self._last_revision):
            return
        self._last_revision = int(world_revision)

        # Exactly six face arrays are expected.
        # Padding keeps the interface stable even if upstream code provides fewer directions for debugging.
        if len(faces) != 6:
            faces = (faces + [np.zeros((0, 8), dtype=np.float32) for _ in range(6)])[:6]

        for fi in range(6):
            data = faces[fi]
            if data.dtype != np.float32:
                data = data.astype(np.float32, copy=False)
            if not data.flags["C_CONTIGUOUS"]:
                data = np.ascontiguousarray(data, dtype=np.float32)

            self._meshes[fi].upload_instances(data)
            self._counts[fi] = int(data.shape[0])

    def draw(self, inp: WorldDrawInputs) -> None:
        if self._prog is None or self._meshes is None or self._atlas is None:
            return

        # GLStateGuard is used so that debug polygon mode does not leak into other passes.
        with GLStateGuard(
            capture_framebuffer=False,
            capture_viewport=False,
            capture_enables=(GL_CULL_FACE,),
            capture_cull_mode=True,
            capture_polygon_mode=True,
        ):
            if bool(inp.world_wireframe):
                glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)

            self._prog.use()
            self._prog.set_mat4("u_viewProj", inp.view_proj)
            self._prog.set_mat4("u_lightViewProj", inp.light_view_proj)

            # u_sunDir is the only directional light term in this MVP.
            # Keeping it explicit (instead of baking into vertices) allows dynamic time-of-day later.
            self._prog.set_vec3("u_sunDir", inp.sun_dir.x, inp.sun_dir.y, inp.sun_dir.z)
            self._prog.set_int("u_atlas", 0)
            self._prog.set_int("u_debugShadow", 1 if bool(inp.debug_shadow) else 0)

            # Shadow sampling is considered valid only when enabled, the map is complete, and has casters.
            shadow_sampling_ok = bool(
                inp.shadow_enabled
                and inp.shadow_info.ok
                and int(inp.shadow_info.tex_id) != 0
                and int(inp.shadow_info.inst_count) > 0
            )
            self._prog.set_int("u_shadowEnabled", 1 if shadow_sampling_ok else 0)
            self._prog.set_int("u_shadowMap", 1)

            # u_shadowTexel allows bias and filter footprints to scale with resolution.
            ss = float(max(1, int(inp.shadow_info.size))) if shadow_sampling_ok else 1.0
            self._prog.set_vec2("u_shadowTexel", 1.0 / ss, 1.0 / ss)
            self._prog.set_float("u_shadowDarkMul", float(inp.shadow.dark_mul))
            self._prog.set_float("u_shadowBiasMin", float(inp.shadow.bias_min))
            self._prog.set_float("u_shadowBiasSlope", float(inp.shadow.bias_slope))

            glActiveTexture(GL_TEXTURE0)
            glBindTexture(GL_TEXTURE_2D, int(self._atlas.tex_id))

            glActiveTexture(GL_TEXTURE1)
            glBindTexture(GL_TEXTURE_2D, int(inp.shadow_info.tex_id) if shadow_sampling_ok else 0)

            glEnable(GL_CULL_FACE)
            glCullFace(GL_BACK)

            # The draw order is fixed by face index, which keeps frame-to-frame behavior deterministic.
            for mesh, cnt in zip(self._meshes, self._counts):
                if int(cnt) <= 0:
                    continue
                glBindVertexArray(mesh.vao)
                glDrawArraysInstanced(GL_TRIANGLES, 0, mesh.vertex_count, int(cnt))
                glBindVertexArray(0)

            glDisable(GL_CULL_FACE)

            glActiveTexture(GL_TEXTURE1)
            glBindTexture(GL_TEXTURE_2D, 0)
            glActiveTexture(GL_TEXTURE0)
            glBindTexture(GL_TEXTURE_2D, 0)