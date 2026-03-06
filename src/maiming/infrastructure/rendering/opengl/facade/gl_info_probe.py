# FILE: src/maiming/infrastructure/rendering/opengl/facade/gl_info_probe.py
from __future__ import annotations

from dataclasses import dataclass

from OpenGL.GL import (
    glGetString,
    GL_VENDOR,
    GL_RENDERER,
    GL_VERSION,
    GL_SHADING_LANGUAGE_VERSION,
)

@dataclass(frozen=True)
class GLInfoSnapshot:
    vendor: str
    renderer: str
    version: str
    glsl_version: str

def _gl_get_string(name: int) -> str:
    try:
        raw = glGetString(int(name))
    except Exception:
        return ""

    if raw is None:
        return ""

    if isinstance(raw, (bytes, bytearray)):
        return raw.decode("utf-8", errors="replace")

    return str(raw)

def probe_gl_info() -> GLInfoSnapshot:
    return GLInfoSnapshot(
        vendor=_gl_get_string(GL_VENDOR),
        renderer=_gl_get_string(GL_RENDERER),
        version=_gl_get_string(GL_VERSION),
        glsl_version=_gl_get_string(GL_SHADING_LANGUAGE_VERSION),
    )