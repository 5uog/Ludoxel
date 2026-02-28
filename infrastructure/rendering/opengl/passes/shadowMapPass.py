# FILE: infrastructure/rendering/opengl/passes/shadowMapPass.py
from __future__ import annotations

"""
ShadowMapPass renders a depth-only shadow map for a directional light and exposes it as a depth-compare
texture suitable for sampler2DShadow sampling in the lighting shader. The responsibility of this file is
to own the FBO/texture pair and define the shadow pass’ GL state boundary in a way that remains robust
under iterative tuning. Directional shadow mapping is numerically delicate because it is dominated by
quantization (shadow map texels) and floating error (light-space transforms), so explicit state control
and data caching are not "nice to have"; they are required for stability.

This pass uses a single instanced cube mesh as a shadow caster proxy. That choice is intentional for an
MVP: it preserves the mental model that every voxel block casts a block-sized shadow, and it avoids the
complexity of face-only casters or silhouette extrusion. The pass is configured to output a GPU-native
comparison texture, enabling hardware depth compare and built-in PCF when GL_LINEAR filtering is used.

State boundary note (robustness):
The pass restores framebuffer and viewport, and also restores key enable states that are commonly affected
by translucent passes (blend) and debugging toggles (cull / polygon offset). This reduces accidental GL
state coupling across passes.
"""

from dataclasses import dataclass
import numpy as np

from OpenGL.GL import (
    glGenFramebuffers, glDeleteFramebuffers, glBindFramebuffer, glCheckFramebufferStatus, glGenTextures,
    glDeleteTextures, glBindTexture, glTexImage2D, glTexParameteri, glTexParameterfv, glFramebufferTexture2D,
    glDrawBuffer, glReadBuffer, glViewport, glClear, glEnable, glDisable, glDepthMask, glDepthFunc, glCullFace,
    glPolygonOffset, glBindVertexArray, glDrawArraysInstanced,
    GL_FRAMEBUFFER, GL_FRAMEBUFFER_COMPLETE, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, GL_DEPTH_COMPONENT24,
    GL_DEPTH_COMPONENT, GL_UNSIGNED_INT, GL_TEXTURE_MIN_FILTER, GL_TEXTURE_MAG_FILTER, GL_LINEAR,
    GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER, GL_TEXTURE_BORDER_COLOR, GL_TEXTURE_COMPARE_MODE,
    GL_TEXTURE_COMPARE_FUNC, GL_COMPARE_REF_TO_TEXTURE, GL_LEQUAL, GL_NONE, GL_BLEND, GL_DEPTH_TEST, GL_LESS,
    GL_DEPTH_BUFFER_BIT, GL_CULL_FACE, GL_BACK, GL_FRONT, GL_POLYGON_OFFSET_FILL, GL_TRIANGLES,
)

from ..gl.shaderProgram import ShaderProgram
from ..gl.meshBuffer import MeshBuffer
from ..gl.glStateGuard import GLStateGuard
from ..glRendererParams import ShadowParams

@dataclass
class ShadowMapInfo:
    ok: bool
    size: int
    tex_id: int
    inst_count: int

class ShadowMapPass:
    def __init__(self, cfg: ShadowParams) -> None:
        self._cfg = cfg

        self._prog: ShaderProgram | None = None
        self._mesh: MeshBuffer | None = None

        self._fbo: int = 0
        self._tex: int = 0
        self._size: int = int(cfg.size)
        self._ok: bool = False

        # inst_count communicates whether sampling is meaningful.
        # Sampling a valid-but-empty depth texture is a common source of "everything shadowed" failures.
        self._inst_count: int = 0

        # The rendered light VP is cached to skip redundant shadow renders.
        # This is especially valuable when the shadow VP is stabilized (snapped),
        # because many camera moves do not change the effective light-space sampling grid.
        self._last_vp_rendered: np.ndarray | None = None

        # last_revision is a coarse invalidation key for instance uploads.
        # In a voxel world, geometry changes are typically sparse, and this avoids needless buffer traffic.
        self._last_revision: int = -1

        # dirty forces a re-render when caster instances change even if light VP is unchanged.
        self._dirty: bool = True

    def initialize(self, prog: ShaderProgram, cube_mesh: MeshBuffer, size: int) -> None:
        self._prog = prog
        self._mesh = cube_mesh
        self._create_shadow_map(size)

    def destroy(self) -> None:
        self._destroy_shadow_map()
        self._prog = None
        self._mesh = None
        self._last_vp_rendered = None
        self._last_revision = -1
        self._dirty = True

    def info(self) -> ShadowMapInfo:
        return ShadowMapInfo(
            ok=bool(self._ok),
            size=int(self._size),
            tex_id=int(self._tex),
            inst_count=int(self._inst_count),
        )

    def set_casters(self, world_revision: int, casters: list[tuple[int, int, int]]) -> None:
        if self._mesh is None:
            return

        if int(world_revision) == int(self._last_revision):
            return
        self._last_revision = int(world_revision)

        if not casters:
            data = np.zeros((0, 7), dtype=np.float32)
            self._mesh.upload_instances(data)
            self._inst_count = 0
            # No casters => no meaningful shadow render.
            self._dirty = False
            self._last_vp_rendered = None
            return

        # Deduplication is a direct performance win because the shadow pass is instance-count bound.
        # The integer triplet is the natural key for voxel blocks and ensures deterministic ordering.
        seen: set[tuple[int, int, int]] = set()
        centers: list[tuple[float, float, float]] = []
        for (x, y, z) in casters:
            k = (int(x), int(y), int(z))
            if k in seen:
                continue
            seen.add(k)
            centers.append((float(x) + 0.5, float(y) + 0.5, float(z) + 0.5))

        if not centers:
            data = np.zeros((0, 7), dtype=np.float32)
            self._mesh.upload_instances(data)
            self._inst_count = 0
            self._dirty = False
            self._last_vp_rendered = None
            return

        # Shadow caster instances only need translation, so i_data is kept as zeros.
        data = np.array([[cx, cy, cz, 0.0, 0.0, 0.0, 0.0] for (cx, cy, cz) in centers], dtype=np.float32)
        self._mesh.upload_instances(data)
        self._inst_count = int(data.shape[0])

        # Casters changed => shadow result must be recomputed.
        self._dirty = True

    def should_render(self, light_vp: np.ndarray) -> bool:
        # If there are no casters, rendering is pointless and would only waste work.
        if int(self._inst_count) <= 0:
            return False

        if bool(self._dirty):
            return True

        if self._last_vp_rendered is None:
            return True

        a = light_vp.astype(np.float32)
        b = self._last_vp_rendered.astype(np.float32)
        if a.shape != b.shape:
            return True

        # Max-norm change detection is chosen because it is cheap and robust to localized perturbations.
        # The epsilon 1e-6 is tuned for float32 matrices so that tiny jitter from repeated multiplications
        # does not force re-render, yet real snapping/translation changes are still detected.
        diff = float(np.max(np.abs(a - b)))
        return diff > 1e-6

    def render(self, light_vp: np.ndarray) -> None:
        if self._prog is None or self._mesh is None:
            return
        if not bool(self._cfg.enabled):
            return
        if not bool(self._ok) or int(self._fbo) == 0 or int(self._tex) == 0:
            return
        if int(self._inst_count) <= 0:
            return

        s = int(self._size)

        with GLStateGuard(
            capture_framebuffer=True,
            capture_viewport=True,
            capture_enables=(GL_BLEND, GL_DEPTH_TEST, GL_CULL_FACE, GL_POLYGON_OFFSET_FILL),
            capture_cull_mode=True,
            capture_polygon_mode=False,
        ):
            glBindFramebuffer(GL_FRAMEBUFFER, int(self._fbo))
            glViewport(0, 0, s, s)

            # This pass is depth-only, so blending is explicitly disabled.
            # Shadow maps are extremely sensitive to unintended state leakage from translucent passes.
            glDisable(GL_BLEND)

            glEnable(GL_DEPTH_TEST)
            glDepthMask(True)
            glDepthFunc(GL_LESS)

            glClear(GL_DEPTH_BUFFER_BIT)

            # Face culling is a trade-off between acne and detachment.
            # Front-face culling tends to reduce self-shadowing on convex geometry but can detach contact shadows.
            # Back-face culling preserves contact but often increases acne; the parameter is exposed for tuning.
            glEnable(GL_CULL_FACE)
            glCullFace(GL_FRONT if bool(self._cfg.cull_front) else GL_BACK)

            # Polygon offset shifts depth in light space to reduce rasterization-time self-intersections.
            # The factor/units defaults are conservative and intentionally small; large offsets hide acne but
            # quickly produce unacceptable "floating" shadows, especially at block-scale contact edges.
            glEnable(GL_POLYGON_OFFSET_FILL)
            glPolygonOffset(float(self._cfg.poly_offset_factor), float(self._cfg.poly_offset_units))

            self._prog.use()
            self._prog.set_mat4("u_lightViewProj", light_vp)

            glBindVertexArray(self._mesh.vao)
            glDrawArraysInstanced(GL_TRIANGLES, 0, self._mesh.vertex_count, int(self._inst_count))
            glBindVertexArray(0)

            glDisable(GL_POLYGON_OFFSET_FILL)
            glDisable(GL_CULL_FACE)

        self._last_vp_rendered = light_vp.copy()
        self._dirty = False

    def _destroy_shadow_map(self) -> None:
        if int(self._tex) != 0:
            glDeleteTextures(1, [int(self._tex)])
            self._tex = 0
        if int(self._fbo) != 0:
            glDeleteFramebuffers(1, [int(self._fbo)])
            self._fbo = 0
        self._ok = False
        self._last_vp_rendered = None
        self._dirty = True

    def _create_shadow_map(self, size: int) -> None:
        # The size clamp is a defensive engineering choice.
        # 64 is a functional minimum for debug; 8192 protects VRAM and avoids driver allocation failures.
        size_i = int(max(64, min(8192, int(size))))
        self._size = size_i

        self._destroy_shadow_map()

        tex = int(glGenTextures(1))
        glBindTexture(GL_TEXTURE_2D, tex)

        # DEPTH_COMPONENT24 balances precision and bandwidth for an MVP.
        # 16-bit can exhibit visible banding with large ortho ranges; 32-bit is often overkill for block scale.
        glTexImage2D(
            GL_TEXTURE_2D,
            0,
            GL_DEPTH_COMPONENT24,
            size_i,
            size_i,
            0,
            GL_DEPTH_COMPONENT,
            GL_UNSIGNED_INT,
            None,
        )

        # GL_LINEAR enables 2x2 hardware PCF for sampler2DShadow in core profiles.
        # This is a cost-effective quality win compared to manual multi-tap filtering.
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)

        # CLAMP_TO_BORDER with white border makes out-of-bounds sampling "fully lit".
        # This prevents hard dark fringes when the light-space UV leaves [0,1] due to numerical drift.
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER)
        glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, [1.0, 1.0, 1.0, 1.0])

        # Compare mode configures the texture as a comparison sampler source.
        # The shader then provides (uv, refDepth) and receives a filtered "lit fraction" in [0,1].
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_REF_TO_TEXTURE)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_FUNC, GL_LEQUAL)

        glBindTexture(GL_TEXTURE_2D, 0)

        fbo = int(glGenFramebuffers(1))
        glBindFramebuffer(GL_FRAMEBUFFER, fbo)
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, tex, 0)

        # Color writes are explicitly disabled for a depth-only FBO.
        # Relying on implicit defaults is brittle across drivers and can cause undefined behavior warnings.
        glDrawBuffer(GL_NONE)
        glReadBuffer(GL_NONE)

        status = int(glCheckFramebufferStatus(GL_FRAMEBUFFER))
        glBindFramebuffer(GL_FRAMEBUFFER, 0)

        if status != int(GL_FRAMEBUFFER_COMPLETE):
            glDeleteTextures(1, [int(tex)])
            glDeleteFramebuffers(1, [int(fbo)])
            self._tex = 0
            self._fbo = 0
            self._ok = False
            self._dirty = True
            return

        self._tex = tex
        self._fbo = fbo
        self._ok = True
        self._dirty = True