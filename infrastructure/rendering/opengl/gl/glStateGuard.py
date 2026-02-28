# FILE: infrastructure/rendering/opengl/gl/glStateGuard.py
from __future__ import annotations

"""
glStateGuard provides a narrow, explicit GL state boundary primitive for pass isolation. 
The responsibility of this module is not to snapshot "all GL state" (which is expensive and incomplete 
in portable OpenGL), but to capture and restore a carefully selected subset of high-impact states that 
are commonly mutated by rendering passes and are frequent sources of regressions when they leak.

This guard targets framebuffer binding, viewport, enable caps, cull face mode, and polygon mode. 
These are the states most likely to be modified by depth-only, translucent, and debug visualization passes.

The design is intentionally minimal: 
it keeps the pass cost bounded and makes the boundary policy explicit at the call site.
"""

from dataclasses import dataclass
from typing import Sequence

from OpenGL.GL import (
    glGetIntegerv, glIsEnabled, glEnable, glDisable, glBindFramebuffer, glViewport, glCullFace, glPolygonMode,
    GL_FRAMEBUFFER, GL_FRAMEBUFFER_BINDING, GL_VIEWPORT, GL_CULL_FACE_MODE, GL_POLYGON_MODE, GL_FRONT, GL_BACK,
)

@dataclass(frozen=True)
class _EnableCapState:
    cap: int
    enabled: bool

class GLStateGuard:
    def __init__(
        self,
        *,
        capture_framebuffer: bool = True,
        capture_viewport: bool = True,
        capture_enables: Sequence[int] = (),
        capture_cull_mode: bool = False,
        capture_polygon_mode: bool = False,
    ) -> None:
        self._cap_fb = bool(capture_framebuffer)
        self._cap_vp = bool(capture_viewport)
        self._cap_en = tuple(int(x) for x in capture_enables)
        self._cap_cull = bool(capture_cull_mode)
        self._cap_poly = bool(capture_polygon_mode)

        self._prev_fb: int | None = None
        self._prev_vp: tuple[int, int, int, int] | None = None
        self._prev_en: list[_EnableCapState] = []
        self._prev_cull_mode: int | None = None
        self._prev_poly: tuple[int, int] | None = None  # (front, back)

    def __enter__(self) -> "GLStateGuard":
        if self._cap_fb:
            self._prev_fb = int(glGetIntegerv(GL_FRAMEBUFFER_BINDING))

        if self._cap_vp:
            vp = glGetIntegerv(GL_VIEWPORT)
            if vp is not None and len(vp) == 4:
                self._prev_vp = (int(vp[0]), int(vp[1]), int(vp[2]), int(vp[3]))
            else:
                self._prev_vp = None

        if self._cap_en:
            self._prev_en = [_EnableCapState(cap=c, enabled=bool(glIsEnabled(c))) for c in self._cap_en]

        if self._cap_cull:
            self._prev_cull_mode = int(glGetIntegerv(GL_CULL_FACE_MODE))

        if self._cap_poly:
            pm = glGetIntegerv(GL_POLYGON_MODE)
            # GL_POLYGON_MODE returns [frontMode, backMode] in core profiles.
            if pm is not None and len(pm) >= 2:
                self._prev_poly = (int(pm[0]), int(pm[1]))
            else:
                self._prev_poly = None

        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        if self._cap_poly and self._prev_poly is not None:
            front_mode, back_mode = self._prev_poly
            glPolygonMode(GL_FRONT, int(front_mode))
            glPolygonMode(GL_BACK, int(back_mode))

        if self._cap_cull and self._prev_cull_mode is not None:
            glCullFace(int(self._prev_cull_mode))

        if self._prev_en:
            for st in self._prev_en:
                if st.enabled:
                    glEnable(int(st.cap))
                else:
                    glDisable(int(st.cap))

        if self._cap_fb and self._prev_fb is not None:
            glBindFramebuffer(GL_FRAMEBUFFER, int(self._prev_fb))

        if self._cap_vp and self._prev_vp is not None:
            x, y, w, h = self._prev_vp
            glViewport(int(x), int(y), int(w), int(h))