# FILE: infrastructure/rendering/opengl/glRenderer.py
from __future__ import annotations

import math
import numpy as np
from pathlib import Path

from OpenGL.GL import (
    glClearColor, glClear, glViewport,
    glEnable, glDepthFunc, glDepthMask,
    GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT,
    GL_DEPTH_TEST, GL_LESS,
)

from core.math.vec3 import Vec3
from core.math import mat4
from core.math.viewAngles import forward_from_yaw_pitch_deg, sun_dir_from_az_el_deg

from .glRendererParams import GLRendererParams, default_gl_renderer_params
from .glResources import GLResources
from .passes.shadowMapPass import ShadowMapPass
from .passes.worldPass import WorldPass, WorldDrawInputs
from .passes.sunPass import SunPass
from .passes.cloudPass import CloudPass
from .scene.worldFaceBuilder import build_world_faces
from .scene.instanceTypes import BlockInstanceGPU
from .pipeline.lightSpace import compute_light_view_proj

class GLRenderer:
    def __init__(self, params: GLRendererParams | None = None) -> None:
        self._cfg = params or default_gl_renderer_params()

        self._res: GLResources | None = None

        # Runtime sun angles are presentation-controlled.
        self._sun_azimuth_deg = float(self._cfg.sun.azimuth_deg)
        self._sun_elevation_deg = float(self._cfg.sun.elevation_deg)
        self._sun_dir = sun_dir_from_az_el_deg(self._sun_azimuth_deg, self._sun_elevation_deg)

        self._shadow = ShadowMapPass(self._cfg.shadow)
        self._world = WorldPass()
        self._sun = SunPass(self._cfg.sun)
        self._cloud = CloudPass(self._cfg.clouds, self._cfg.camera)

        # Debug toggles are centralized here so the presentation layer does not need to know about pass wiring.
        self._debug_shadow = False

        # Runtime toggles.
        self._shadow_enabled = True
        self._world_wireframe = False

    def initialize(self, assets_dir: Path) -> None:
        # GLResources centralizes shader/mesh/texture creation under the active context.
        self._res = GLResources.load(assets_dir)

        glEnable(GL_DEPTH_TEST)
        glDepthFunc(GL_LESS)

        self._shadow.initialize(self._res.shadow_prog, self._res.shadow_cube_mesh, int(self._cfg.shadow.size))
        self._world.initialize(self._res.world_prog, self._res.world_meshes, self._res.atlas)
        self._sun.initialize(self._res.sun_prog, int(self._res.empty_vao))
        self._cloud.initialize(self._res.cloud_prog, self._res.cloud_mesh)

    def set_cloud_wireframe(self, on: bool) -> None:
        self._cloud.set_wireframe(bool(on))

    def set_world_wireframe(self, on: bool) -> None:
        self._world_wireframe = bool(on)

    def set_shadow_enabled(self, on: bool) -> None:
        self._shadow_enabled = bool(on)

    def set_debug_shadow(self, on: bool) -> None:
        self._debug_shadow = bool(on)

    def sun_angles(self) -> tuple[float, float]:
        return (float(self._sun_azimuth_deg), float(self._sun_elevation_deg))

    def set_sun_angles(self, azimuth_deg: float, elevation_deg: float) -> None:
        az = float(azimuth_deg) % 360.0
        if az < 0.0:
            az += 360.0
        el = float(elevation_deg)
        el = max(0.0, min(90.0, el))

        self._sun_azimuth_deg = az
        self._sun_elevation_deg = el
        self._sun_dir = sun_dir_from_az_el_deg(self._sun_azimuth_deg, self._sun_elevation_deg)

    def sun_dir(self) -> Vec3:
        return self._sun_dir

    def shadow_dark_mul(self) -> float:
        # This is exposed so CPU-side pre-baking (if enabled later) can share the same perceptual calibration.
        return float(self._cfg.shadow.dark_mul)

    def shadow_info(self) -> tuple[bool, int]:
        if not bool(self._shadow_enabled):
            return (False, 0)

        info = self._shadow.info()
        ok = bool(self._cfg.shadow.enabled and info.ok and info.tex_id != 0 and info.inst_count > 0)
        return (ok, int(info.size) if ok else 0)

    def shadow_status_text(self) -> str:
        ok, _ = self.shadow_info()
        return "SHADOWMAP_ON" if ok else "SHADOWMAP_OFF"

    def atlas_uv_face(self, block_id: str, face_idx: int) -> tuple[float, float, float, float]:
        # Atlas lookup is kept here to avoid leaking TextureAtlas internals into world building code.
        # Face-specific mapping is resolved via the domain block registry, not via renderer-side heuristics.
        if self._res is None:
            return (0.0, 0.0, 1.0, 1.0)

        b = self._res.blocks.get(str(block_id))
        tex_name = b.texture_for_face(int(face_idx)) if b is not None else "default"

        uv = self._res.atlas.uv.get(str(tex_name))
        if uv is None:
            uv = self._res.atlas.uv.get("default", (0.0, 0.0, 1.0, 1.0))

        u0, v0, u1, v1 = uv

        # Face-space convention correction:
        # The four vertical faces (+X,-X,+Z,-Z) currently sample textures with V orientation inverted relative
        # to the authored "top edge". We correct only those faces by swapping the atlas V interval.
        # This must not affect +Y/-Y, because top/bottom should remain unchanged under a "side-only" fix.
        fi = int(face_idx)
        if fi == 0 or fi == 1 or fi == 4 or fi == 5:
            return (float(u0), float(v1), float(u1), float(v0))

        return (float(u0), float(v0), float(u1), float(v1))

    def upload_world_faces(self, world_revision: int, faces_gpu: list[list[BlockInstanceGPU]]) -> None:
        if self._res is None:
            return

        faces_np: list[np.ndarray] = []
        for face in faces_gpu:
            if not face:
                faces_np.append(np.zeros((0, 8), dtype=np.float32))
                continue
            arr = np.array(
                [[i.x, i.y, i.z, i.u0, i.v0, i.u1, i.v1, i.shade] for i in face],
                dtype=np.float32,
            )
            faces_np.append(arr)

        self._world.upload_faces(int(world_revision), faces_np)

        seen: set[tuple[int, int, int]] = set()
        casters: list[tuple[int, int, int]] = []
        for face in faces_gpu:
            for inst in face:
                bx = int(math.floor(float(inst.x) - 0.5))
                by = int(math.floor(float(inst.y) - 0.5))
                bz = int(math.floor(float(inst.z) - 0.5))
                k = (bx, by, bz)
                if k in seen:
                    continue
                seen.add(k)
                casters.append(k)

        self._shadow.set_casters(int(world_revision), casters)

    def submit_world(self, world_revision: int, blocks: list[tuple[int, int, int, str]]) -> None:
        if self._res is None:
            return

        sdir = self._sun_dir.normalized()

        faces_gpu = build_world_faces(
            blocks=blocks,
            uv_lookup=self.atlas_uv_face,
            sun_dir=sdir,
            shadow_dark_mul=float(self._cfg.shadow.dark_mul),
            enable_occlusion=False,
        )

        self.upload_world_faces(int(world_revision), faces_gpu)

        casters = [(int(x), int(y), int(z)) for (x, y, z, _bid) in blocks]
        self._shadow.set_casters(int(world_revision), casters)

    def render(self, w: int, h: int, eye: Vec3, yaw_deg: float, pitch_deg: float, fov_deg: float) -> None:
        if self._res is None:
            return

        shadow_info_pre = self._shadow.info()
        light_vp = compute_light_view_proj(
            center=eye,
            sun_dir=self._sun_dir,
            sun=self._cfg.sun,
            shadow=self._cfg.shadow,
            shadow_size=int(max(1, int(shadow_info_pre.size))),
        )

        if bool(self._shadow_enabled) and self._shadow.should_render(light_vp):
            self._shadow.render(light_vp)

        forward = forward_from_yaw_pitch_deg(yaw_deg, pitch_deg)

        view = mat4.look_dir(eye, forward)
        proj = mat4.perspective(fov_deg, (w / max(h, 1)), float(self._cfg.camera.z_near), float(self._cfg.camera.z_far))
        vp = mat4.mul(proj, view)

        glViewport(0, 0, w, h)
        cc = self._cfg.sky.clear_color
        glClearColor(float(cc.x), float(cc.y), float(cc.z), 1.0)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

        self._sun.draw(eye=eye, view_proj=vp, sun_dir=self._sun_dir)

        glEnable(GL_DEPTH_TEST)
        glDepthMask(True)
        glDepthFunc(GL_LESS)

        shadow_info = self._shadow.info()
        self._world.draw(
            WorldDrawInputs(
                view_proj=vp,
                light_view_proj=light_vp,
                sun_dir=self._sun_dir,
                debug_shadow=bool(self._debug_shadow),
                shadow_enabled=bool(self._shadow_enabled),
                world_wireframe=bool(self._world_wireframe),
                shadow=self._cfg.shadow,
                shadow_info=shadow_info,
            )
        )

        self._cloud.draw(
            eye=eye,
            view_proj=vp,
            forward=forward,
            fov_deg=float(fov_deg),
            aspect=float(w) / max(float(h), 1.0),
            sun_dir=self._sun_dir,
        )