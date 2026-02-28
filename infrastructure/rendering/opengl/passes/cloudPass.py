# FILE: infrastructure/rendering/opengl/passes/cloudPass.py
from __future__ import annotations

"""
CloudPass is a deliberately self-contained translucent pass that renders a stylized "volumetric hint"
using instanced axis-aligned boxes. The responsibility of this file is not to model physically-based
participating media, but to provide a cheap depth-aware layer that can be tuned independently from
the opaque world path. Isolation matters because translucent rendering is extremely sensitive to GL
state (blending, depth writes, culling) and accidental state coupling commonly causes hard-to-debug
regressions.

The implementation combines conservative CPU frustum culling with GPU instancing. Culling keeps the
instance count proportional to the visible volume, while instancing amortizes draw-call overhead by
reusing a single cube mesh and a single program. Time-based motion is implemented as a uniform shift
instead of regenerating geometry, which preserves determinism of the cached pattern-space field and
keeps per-frame CPU work bounded by "visible set" rather than "world size".
"""

import time
import numpy as np

from OpenGL.GL import (
    glEnable, glDisable, glDepthMask, glDepthFunc,
    glBlendFunc, glBlendEquation,
    glCullFace, glPolygonMode,
    glBindVertexArray, glDrawArraysInstanced,
    GL_DEPTH_TEST, GL_LESS,
    GL_BLEND, GL_FUNC_ADD, GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA,
    GL_CULL_FACE, GL_BACK,
    GL_FRONT_AND_BACK, GL_LINE, GL_FILL,
    GL_TRIANGLES,
)

from core.math.vec3 import Vec3
from ..gl.shaderProgram import ShaderProgram
from ..gl.meshBuffer import MeshBuffer
from ..scene.cloudField import CloudField
from ..glRendererParams import CloudParams, CameraParams

class CloudPass:
    def __init__(self, clouds: CloudParams, camera: CameraParams) -> None:
        self._cfg = clouds
        self._cam = camera

        self._prog: ShaderProgram | None = None
        self._mesh: MeshBuffer | None = None

        # CloudField owns deterministic pattern-space generation and a cache indexed by a coarse anchor key.
        # This architectural split is meaningful because it decouples temporal animation (uniform shift) from
        # spatial distribution (cached boxes), avoiding "moving noise" artifacts and reducing CPU churn.
        self._field = CloudField(self._cfg)

        # Wireframe is a debugging aid that must not affect geometry or buffers.
        # Keeping it as a mode inside the pass prevents leaking debug state into other passes.
        self._wireframe = False
        self._t0 = time.perf_counter()

    def initialize(self, prog: ShaderProgram, mesh: MeshBuffer) -> None:
        # This pass does not own shader compilation nor mesh creation.
        # Receiving prebuilt resources makes GL object lifetime coherent and eliminates double-creation.
        self._prog = prog
        self._mesh = mesh

    def set_wireframe(self, on: bool) -> None:
        self._wireframe = bool(on)

    def draw(self, eye: Vec3, view_proj: np.ndarray, forward: Vec3, fov_deg: float, aspect: float, sun_dir: Vec3) -> None:
        if self._prog is None or self._mesh is None:
            return

        # The time origin is stored once to avoid cumulative floating error in long sessions.
        # The "seconds since start" parameter is stable enough for uniform animation.
        t = float(time.perf_counter() - self._t0)

        # Shift implements advection-like motion as a continuous translation in world space.
        # This is intentionally done as a uniform to keep the cached pattern-space distribution invariant.
        shift = self._field.shift(t)

        # Culling must be conservative to avoid visible popping.
        # The frustum test in CloudField uses a sphere bound per box;
        # this slightly over-accepts but is stable.
        boxes = self._field.visible_boxes(
            eye=eye,
            shift=shift,
            forward=forward,
            fov_deg=float(fov_deg),
            aspect=float(aspect),
            z_far=float(self._cam.z_far),
        )
        if not boxes:
            return

        # Instance payload is packed as 7 float32 values: (center.xyz, size.xyz, alphaMul).
        # float32 is chosen because the GPU path consumes float attributes and the
        # scale of the scene is within a range where float32 precision is more than sufficient.
        data = np.array(
            [[b.center.x, b.center.y, b.center.z, b.size.x, b.size.y, b.size.z, b.alpha_mul] for b in boxes],
            dtype=np.float32,
        )
        self._mesh.upload_instances(data)
        inst_count = int(data.shape[0])

        # Clouds are translucent, so blending must be enabled.
        # Depth test remains enabled so clouds are occluded by opaque geometry.
        # Depth writes are kept enabled as a pragmatic compromise to avoid expensive sorting;
        # this choice can cause order-dependent artifacts for overlapping translucent volumes,
        # which is why the pass is isolated and can be evolved independently if higher fidelity becomes necessary.
        glEnable(GL_DEPTH_TEST)
        glDepthMask(True)
        glDepthFunc(GL_LESS)

        glEnable(GL_BLEND)
        glBlendEquation(GL_FUNC_ADD)
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

        # Back-face culling is used because boxes are closed convex shapes.
        # It halves fragment work on average and reduces overdraw, which matters under blending.
        glEnable(GL_CULL_FACE)
        glCullFace(GL_BACK)

        if self._wireframe:
            # Wireframe is useful to validate culling planes and instance placement.
            glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)

        self._prog.use()
        self._prog.set_mat4("u_viewProj", view_proj)
        self._prog.set_vec3("u_shift", shift.x, shift.y, shift.z)

        # u_color and u_alpha are artist-facing controls.
        # Keeping alpha separate from per-box alphaMul enables global tuning without regenerating data.
        col = self._cfg.color
        self._prog.set_vec3("u_color", float(col.x), float(col.y), float(col.z))
        self._prog.set_float("u_alpha", float(self._cfg.alpha))

        # The cloud shader uses a mild N·L term plus heavy ambient.
        # Passing sun_dir makes the "volume hint" read consistently with the world lighting direction.
        self._prog.set_vec3("u_sunDir", sun_dir.x, sun_dir.y, sun_dir.z)

        glBindVertexArray(self._mesh.vao)
        glDrawArraysInstanced(GL_TRIANGLES, 0, self._mesh.vertex_count, inst_count)
        glBindVertexArray(0)

        if self._wireframe:
            glPolygonMode(GL_FRONT_AND_BACK, GL_FILL)

        glDisable(GL_CULL_FACE)
        glDisable(GL_BLEND)