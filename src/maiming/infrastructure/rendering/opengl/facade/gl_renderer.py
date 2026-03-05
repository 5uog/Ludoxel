# FILE: src/maiming/infrastructure/rendering/opengl/facade/gl_renderer.py
from __future__ import annotations

import math
from pathlib import Path
from typing import Callable

import numpy as np
from OpenGL.GL import (
    glClearColor,
    glClear,
    glViewport,
    glEnable,
    glDepthFunc,
    glDepthMask,
    glGetString,
    GL_COLOR_BUFFER_BIT,
    GL_DEPTH_BUFFER_BIT,
    GL_DEPTH_TEST,
    GL_LESS,
    GL_VENDOR,
    GL_RENDERER,
    GL_VERSION,
    GL_SHADING_LANGUAGE_VERSION,
)

from maiming.core.math.vec3 import Vec3
from maiming.core.math import mat4
from maiming.core.math.view_angles import forward_from_yaw_pitch_deg, sun_dir_from_az_el_deg
from maiming.domain.blocks.state_codec import parse_state
from maiming.domain.blocks.block_definition import BlockDefinition
from maiming.domain.blocks.models.api import render_boxes_for_block
from maiming.domain.world.chunking import ChunkKey, chunk_key

from maiming.infrastructure.rendering.opengl.facade.gl_renderer_params import (
    GLRendererParams,
    default_gl_renderer_params,
)
from maiming.infrastructure.rendering.opengl.facade.gl_resources import GLResources
from maiming.infrastructure.rendering.opengl._internal.passes.shadow_map_pass import ShadowMapPass
from maiming.infrastructure.rendering.opengl._internal.passes.world_pass import (
    WorldPass,
    WorldDrawInputs,
)
from maiming.infrastructure.rendering.opengl._internal.passes.sun_pass import SunPass
from maiming.infrastructure.rendering.opengl._internal.passes.cloud_pass import CloudPass
from maiming.infrastructure.rendering.opengl._internal.passes.selection_pass import SelectionPass
from maiming.infrastructure.rendering.opengl._internal.pipeline.light_space import compute_light_view_proj

GetState = Callable[[int, int, int], str | None]

class GLRenderer:
    def __init__(self, params: GLRendererParams | None = None) -> None:
        self._cfg = params or default_gl_renderer_params()

        self._res: GLResources | None = None

        self._sun_azimuth_deg = float(self._cfg.sun.azimuth_deg)
        self._sun_elevation_deg = float(self._cfg.sun.elevation_deg)
        self._sun_dir = sun_dir_from_az_el_deg(self._sun_azimuth_deg, self._sun_elevation_deg)

        self._shadow = ShadowMapPass(self._cfg.shadow)
        self._world = WorldPass()
        self._sun = SunPass(self._cfg.sun)
        self._cloud = CloudPass(self._cfg.clouds, self._cfg.camera)
        self._select = SelectionPass()

        self._debug_shadow = False
        self._shadow_enabled = True
        self._world_wireframe = False

        self._outline_selection_enabled = True

        self._sel_block: tuple[int, int, int] | None = None
        self._sel_state: str = ""
        self._sel_world_rev: int = -1
        self._sel_outline_key: tuple[int, int, int, str, int] | None = None

        self._sel_tint_strength: float = 0.55

        self._gl_vendor: str = ""
        self._gl_renderer: str = ""
        self._gl_version: str = ""
        self._glsl_version: str = ""

    def initialize(self, assets_dir: Path) -> None:
        self._res = GLResources.load(assets_dir)

        glEnable(GL_DEPTH_TEST)
        glDepthFunc(GL_LESS)

        self._shadow.initialize(self._res.shadow_prog, int(self._cfg.shadow.size))
        self._world.initialize(self._res.world_prog, self._res.atlas)
        self._sun.initialize(self._res.sun_prog, int(self._res.empty_vao))
        self._cloud.initialize(self._res.cloud_prog, self._res.cloud_mesh)
        self._select.initialize(self._res.selection_prog)

        self._gl_vendor = self._gl_get_string(GL_VENDOR)
        self._gl_renderer = self._gl_get_string(GL_RENDERER)
        self._gl_version = self._gl_get_string(GL_VERSION)
        self._glsl_version = self._gl_get_string(GL_SHADING_LANGUAGE_VERSION)

    def destroy(self) -> None:
        self._shadow.destroy()
        self._world.destroy()
        self._select.destroy()

        if self._res is not None:
            self._res.destroy()
            self._res = None

        self._gl_vendor = ""
        self._gl_renderer = ""
        self._gl_version = ""
        self._glsl_version = ""

        self._sel_block = None
        self._sel_state = ""
        self._sel_world_rev = -1
        self._sel_outline_key = None

    @staticmethod
    def _gl_get_string(name: int) -> str:
        try:
            v = glGetString(int(name))
            if v is None:
                return ""
            if isinstance(v, (bytes, bytearray)):
                return v.decode("utf-8", errors="replace")
            return str(v)
        except Exception:
            return ""

    def gl_info(self) -> tuple[str, str, str, str]:
        return (
            str(self._gl_vendor),
            str(self._gl_renderer),
            str(self._gl_version),
            str(self._glsl_version),
        )

    def set_cloud_wireframe(self, on: bool) -> None:
        self._cloud.set_wireframe(bool(on))

    def set_cloud_enabled(self, on: bool) -> None:
        self._cloud.set_enabled(bool(on))

    def set_cloud_density(self, density: int) -> None:
        self._cloud.set_density(int(density))

    def set_cloud_seed(self, seed: int) -> None:
        self._cloud.set_seed(int(seed))

    def set_world_wireframe(self, on: bool) -> None:
        self._world_wireframe = bool(on)

    def set_shadow_enabled(self, on: bool) -> None:
        self._shadow_enabled = bool(on)

    def set_debug_shadow(self, on: bool) -> None:
        self._debug_shadow = bool(on)

    def set_outline_selection_enabled(self, on: bool) -> None:
        self._outline_selection_enabled = bool(on)
        self._sel_outline_key = None
        if not bool(self._outline_selection_enabled):
            self._select.clear()

    def clear_selection(self) -> None:
        self._sel_block = None
        self._sel_state = ""
        self._sel_world_rev = -1
        self._sel_outline_key = None
        self._select.clear()

    def set_selection_target(
        self,
        *,
        x: int,
        y: int,
        z: int,
        state_str: str,
        get_state: GetState,
        world_revision: int,
    ) -> None:
        self._sel_block = (int(x), int(y), int(z))
        self._sel_state = str(state_str)
        self._sel_world_rev = int(world_revision)

        if not bool(self._outline_selection_enabled):
            self._select.clear()
            self._sel_outline_key = None
            return

        key = (int(x), int(y), int(z), str(state_str), int(world_revision))
        if self._sel_outline_key == key:
            return

        verts = self._build_selection_outline_vertices(
            x=int(x),
            y=int(y),
            z=int(z),
            state_str=str(state_str),
            get_state=get_state,
        )
        self._select.set_lines(verts)
        self._sel_outline_key = key

    @staticmethod
    def _eq(a: float, b: float, eps: float = 1e-7) -> bool:
        return abs(float(a) - float(b)) <= float(eps)

    def _internal_face_mask(self, boxes) -> set[tuple[int, int]]:
        internal: set[tuple[int, int]] = set()

        for i, a in enumerate(boxes):
            for j, b in enumerate(boxes):
                if i == j:
                    continue

                if self._eq(a.mx_x, b.mn_x):
                    if self._eq(a.mn_y, b.mn_y) and self._eq(a.mx_y, b.mx_y) and self._eq(a.mn_z, b.mn_z) and self._eq(a.mx_z, b.mx_z):
                        internal.add((i, 0))
                        internal.add((j, 1))

                if self._eq(a.mn_x, b.mx_x):
                    if self._eq(a.mn_y, b.mn_y) and self._eq(a.mx_y, b.mx_y) and self._eq(a.mn_z, b.mn_z) and self._eq(a.mx_z, b.mx_z):
                        internal.add((i, 1))
                        internal.add((j, 0))

                if self._eq(a.mx_y, b.mn_y):
                    if self._eq(a.mn_x, b.mn_x) and self._eq(a.mx_x, b.mx_x) and self._eq(a.mn_z, b.mn_z) and self._eq(a.mx_z, b.mx_z):
                        internal.add((i, 2))
                        internal.add((j, 3))

                if self._eq(a.mn_y, b.mx_y):
                    if self._eq(a.mn_x, b.mn_x) and self._eq(a.mx_x, b.mx_x) and self._eq(a.mn_z, b.mn_z) and self._eq(a.mx_z, b.mx_z):
                        internal.add((i, 3))
                        internal.add((j, 2))

                if self._eq(a.mx_z, b.mn_z):
                    if self._eq(a.mn_x, b.mn_x) and self._eq(a.mx_x, b.mx_x) and self._eq(a.mn_y, b.mn_y) and self._eq(a.mx_y, b.mx_y):
                        internal.add((i, 4))
                        internal.add((j, 5))

                if self._eq(a.mn_z, b.mx_z):
                    if self._eq(a.mn_x, b.mn_x) and self._eq(a.mx_x, b.mx_x) and self._eq(a.mn_y, b.mn_y) and self._eq(a.mx_y, b.mx_y):
                        internal.add((i, 5))
                        internal.add((j, 4))

        return internal

    @staticmethod
    def _quant(v: float, q: float = 1e-6) -> int:
        return int(round(float(v) / float(q)))

    def _edge_key(self, a: tuple[float, float, float], b: tuple[float, float, float]) -> tuple[int, ...]:
        qa = (self._quant(a[0]), self._quant(a[1]), self._quant(a[2]))
        qb = (self._quant(b[0]), self._quant(b[1]), self._quant(b[2]))
        if qa <= qb:
            return (qa[0], qa[1], qa[2], qb[0], qb[1], qb[2])
        return (qb[0], qb[1], qb[2], qa[0], qa[1], qa[2])

    def _build_selection_outline_vertices(
        self,
        *,
        x: int,
        y: int,
        z: int,
        state_str: str,
        get_state: GetState,
    ) -> np.ndarray:
        if self._res is None:
            return np.zeros((0, 3), dtype=np.float32)

        def get_def(base_id: str) -> BlockDefinition | None:
            return self._res.blocks.get(str(base_id))

        boxes = render_boxes_for_block(
            str(state_str),
            get_state,
            get_def,
            int(x),
            int(y),
            int(z),
        )
        if not boxes:
            return np.zeros((0, 3), dtype=np.float32)

        internal = self._internal_face_mask(boxes)

        eps = 0.002

        def face_pts(mn, mx, fi: int) -> tuple[list[tuple[float, float, float]], tuple[float, float, float]]:
            mnx, mny, mnz = mn
            mxx, mxy, mxz = mx

            if fi == 0:
                pts = [(mxx, mny, mnz), (mxx, mxy, mnz), (mxx, mxy, mxz), (mxx, mny, mxz)]
                n = (1.0, 0.0, 0.0)
            elif fi == 1:
                pts = [(mnx, mny, mxz), (mnx, mxy, mxz), (mnx, mxy, mnz), (mnx, mny, mnz)]
                n = (-1.0, 0.0, 0.0)
            elif fi == 2:
                pts = [(mnx, mxy, mnz), (mxx, mxy, mnz), (mxx, mxy, mxz), (mnx, mxy, mxz)]
                n = (0.0, 1.0, 0.0)
            elif fi == 3:
                pts = [(mnx, mny, mxz), (mxx, mny, mxz), (mxx, mny, mnz), (mnx, mny, mnz)]
                n = (0.0, -1.0, 0.0)
            elif fi == 4:
                pts = [(mnx, mny, mxz), (mnx, mxy, mxz), (mxx, mxy, mxz), (mxx, mny, mxz)]
                n = (0.0, 0.0, 1.0)
            else:
                pts = [(mxx, mny, mnz), (mxx, mxy, mnz), (mnx, mxy, mnz), (mnx, mny, mnz)]
                n = (0.0, 0.0, -1.0)

            return pts, n

        seen: set[tuple[int, ...]] = set()
        out: list[tuple[float, float, float]] = []

        for bi, b in enumerate(boxes):
            mn = (float(x) + float(b.mn_x), float(y) + float(b.mn_y), float(z) + float(b.mn_z))
            mx = (float(x) + float(b.mx_x), float(y) + float(b.mx_y), float(z) + float(b.mx_z))

            for fi in range(6):
                if (bi, fi) in internal:
                    continue

                pts, n = face_pts(mn, mx, int(fi))
                ox, oy, oz = float(n[0]) * eps, float(n[1]) * eps, float(n[2]) * eps
                p = [(px + ox, py + oy, pz + oz) for (px, py, pz) in pts]

                edges = [(p[0], p[1]), (p[1], p[2]), (p[2], p[3]), (p[3], p[0])]
                for a, c in edges:
                    k = self._edge_key(a, c)
                    if k in seen:
                        continue
                    seen.add(k)
                    out.append(a)
                    out.append(c)

        if not out:
            return np.zeros((0, 3), dtype=np.float32)

        return np.asarray(out, dtype=np.float32)

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

    def shadow_info(self) -> tuple[bool, int]:
        if not bool(self._shadow_enabled):
            return (False, 0)

        info = self._shadow.info()
        ok = bool(self._cfg.shadow.enabled and info.ok and info.tex_id != 0 and info.inst_count > 0)
        return (ok, int(info.size) if ok else 0)

    def shadow_status_text(self) -> str:
        ok, _ = self.shadow_info()
        return "SHADOWMAP_ON" if ok else "SHADOWMAP_OFF"

    def atlas_uv_face(self, block_state_id: str, face_idx: int) -> tuple[float, float, float, float]:
        if self._res is None:
            return (0.0, 0.0, 1.0, 1.0)

        base_id, _p = parse_state(str(block_state_id))
        b = self._res.blocks.get(str(base_id))
        tex_name = b.texture_for_face(int(face_idx)) if b is not None else "default"

        uv = self._res.atlas.uv.get(str(tex_name))
        if uv is None:
            uv = self._res.atlas.uv.get("default", (0.0, 0.0, 1.0, 1.0))

        return (float(uv[0]), float(uv[1]), float(uv[2]), float(uv[3]))

    def world_build_tools(self):
        if self._res is None:
            return None

        def def_lookup(base_id: str) -> BlockDefinition | None:
            return self._res.blocks.get(str(base_id))

        return (self.atlas_uv_face, def_lookup)

    def block_display_name(self, block_state_or_id: str) -> str:
        raw = str(block_state_or_id)
        base, _p = parse_state(raw)
        if self._res is None:
            return str(base)
        d = self._res.blocks.get(str(base))
        return str(d.display_name) if d is not None else str(base)

    def submit_chunk(
        self,
        *,
        chunk_key: ChunkKey,
        world_revision: int,
        faces: list[np.ndarray],
        casters: np.ndarray,
    ) -> None:
        if self._res is None:
            return

        self._world.upload_chunk(
            chunk_key=chunk_key,
            world_revision=int(world_revision),
            faces=faces,
        )
        self._shadow.set_chunk_casters(
            chunk_key=chunk_key,
            world_revision=int(world_revision),
            casters=casters,
        )

    def render(
        self,
        *,
        w: int,
        h: int,
        eye: Vec3,
        yaw_deg: float,
        pitch_deg: float,
        fov_deg: float,
        render_distance_chunks: int,
    ) -> None:
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
        proj = mat4.perspective(
            fov_deg,
            (w / max(h, 1)),
            float(self._cfg.camera.z_near),
            float(self._cfg.camera.z_far),
        )
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

        bx = int(math.floor(float(eye.x)))
        by = int(math.floor(float(eye.y)))
        bz = int(math.floor(float(eye.z)))
        cam_ck = chunk_key(bx, by, bz)

        if self._sel_block is None:
            sel_mode = 0
            sx, sy, sz = 0, 0, 0
        else:
            sx, sy, sz = self._sel_block
            sel_mode = 1 if bool(self._outline_selection_enabled) else 2

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
                camera_chunk=cam_ck,
                render_distance_chunks=int(render_distance_chunks),
                sel_mode=int(sel_mode),
                sel_x=int(sx),
                sel_y=int(sy),
                sel_z=int(sz),
                sel_tint=float(self._sel_tint_strength),
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

        if bool(self._outline_selection_enabled) and self._sel_block is not None:
            self._select.draw(view_proj=vp)