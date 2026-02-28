# FILE: infrastructure/rendering/opengl/resources/textureAtlas.py
from __future__ import annotations

"""
TextureAtlas packs block textures into a single GL texture and provides per-block UV rectangles. The
responsibility of this file is to reduce per-frame texture binds and to make material selection a pure
per-instance attribute, which is essential for scalable voxel rendering.

Nearest filtering is used because voxel textures are authored for crisp sampling. Linear filtering would
introduce blur and, more importantly, bleed across tile boundaries unless careful padding is implemented.
Clamp-to-edge is used to prevent UV interpolation from sampling neighboring tiles. Tile size is fixed so
UV rectangles remain stable and deterministic; images are scaled as a pragmatic choice to keep the packer
simple and robust in an MVP.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Tuple
import math

from PyQt6.QtGui import QImage, QPainter, QColor
from OpenGL.GL import (
    glGenTextures, glBindTexture, glTexImage2D, glTexParameteri, glDeleteTextures,
    GL_TEXTURE_2D, GL_RGBA, GL_UNSIGNED_BYTE,
    GL_TEXTURE_MIN_FILTER, GL_TEXTURE_MAG_FILTER, GL_NEAREST,
    GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE,
)

UVRect = Tuple[float, float, float, float]

@dataclass
class TextureAtlas:
    tex_id: int
    uv: Dict[str, UVRect]
    width: int
    height: int

    @staticmethod
    def build_from_dir(block_dir: Path, tile_size: int = 64) -> "TextureAtlas":
        items = _collect_images(block_dir, tile_size)
        if not items:
            items = [("default", _placeholder(tile_size, QColor(180, 180, 180)))]

        n = len(items)
        cols = int(math.ceil(math.sqrt(n)))
        rows = int(math.ceil(n / cols))
        w = cols * tile_size
        h = rows * tile_size

        atlas = QImage(w, h, QImage.Format.Format_RGBA8888)
        atlas.fill(QColor(0, 0, 0, 0))

        painter = QPainter(atlas)
        uv: Dict[str, UVRect] = {}

        for i, (name, img) in enumerate(items):
            cx = (i % cols) * tile_size
            cy = (i // cols) * tile_size
            painter.drawImage(cx, cy, img)

            # UVs are normalized atlas coordinates.
            # Using rect endpoints enables interpolation with base quad UVs without extra math in the shader.
            u0 = cx / w
            v0 = cy / h
            u1 = (cx + tile_size) / w
            v1 = (cy + tile_size) / h
            uv[name] = (u0, v0, u1, v1)

        painter.end()

        atlas = atlas.convertToFormat(QImage.Format.Format_RGBA8888)
        ptr = atlas.bits()
        ptr.setsize(atlas.sizeInBytes())
        data = bytes(ptr)

        tex_id = int(glGenTextures(1))
        glBindTexture(GL_TEXTURE_2D, tex_id)
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, data)

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE)

        glBindTexture(GL_TEXTURE_2D, 0)
        return TextureAtlas(tex_id=tex_id, uv=uv, width=w, height=h)

    def destroy(self) -> None:
        if int(self.tex_id) != 0:
            glDeleteTextures(1, [int(self.tex_id)])
            self.tex_id = 0

def _collect_images(block_dir: Path, tile_size: int) -> list[tuple[str, QImage]]:
    out: list[tuple[str, QImage]] = []
    if not block_dir.exists():
        return out
    for p in sorted(block_dir.glob("*.png")):
        name = p.stem
        img = QImage(str(p))
        if img.isNull():
            continue
        img = img.convertToFormat(QImage.Format.Format_RGBA8888)
        if img.width() != tile_size or img.height() != tile_size:
            # Scaling keeps packing predictable.
            # For voxel textures, uniform scaling to the atlas tile size is typically acceptable.
            img = img.scaled(tile_size, tile_size)
        out.append((name, img))
    return out

def _placeholder(tile: int, c: QColor) -> QImage:
    img = QImage(tile, tile, QImage.Format.Format_RGBA8888)
    img.fill(c)
    painter = QPainter(img)
    painter.fillRect(0, 0, tile // 2, tile // 2, QColor(120, 120, 120))
    painter.fillRect(tile // 2, tile // 2, tile // 2, tile // 2, QColor(120, 120, 120))
    painter.end()
    return img