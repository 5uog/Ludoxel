# FILE: infrastructure/rendering/opengl/resources/textureAtlas.py
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Tuple, Iterable
import math

from PyQt6.QtCore import Qt
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
    def build_from_dir(block_dir: Path, tile_size: int = 64, names: Iterable[str] | None = None) -> "TextureAtlas":
        items = _collect_images(block_dir, tile_size, names=names)

        has_default = any(n == "default" for (n, _img) in items)
        if not has_default:
            items.append(("default", _placeholder(tile_size, QColor(180, 180, 180))))

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

def _collect_images(block_dir: Path, tile_size: int, names: Iterable[str] | None = None) -> list[tuple[str, QImage]]:
    out: list[tuple[str, QImage]] = []
    if not block_dir.exists():
        return out

    def _prep(img: QImage) -> QImage:
        img = img.convertToFormat(QImage.Format.Format_RGBA8888)
        if img.width() != tile_size or img.height() != tile_size:
            img = img.scaled(
                tile_size,
                tile_size,
                Qt.AspectRatioMode.IgnoreAspectRatio,
                Qt.TransformationMode.FastTransformation,
            )

        # Coordinate-system correction (single-source-of-truth):
        # QImage pixel data is top-origin, while the GL texture sampling convention expects bottom-origin V.
        # We correct this once by vertically mirroring each tile image before atlas packing.
        # This keeps UV rectangles and mesh UVs in a conventional, non-special-cased form.
        img = img.mirrored(False, True)
        return img

    if names is None:
        for p in sorted(block_dir.glob("*.png")):
            name = p.stem
            img = QImage(str(p))
            if img.isNull():
                continue
            out.append((name, _prep(img)))
        return out

    # Deterministic ordering is inherited from the provided iteration order.
    for nm in names:
        name = str(nm)
        p = block_dir / f"{name}.png"
        if not p.exists():
            continue
        img = QImage(str(p))
        if img.isNull():
            continue
        out.append((name, _prep(img)))

    return out

def _placeholder(tile: int, c: QColor) -> QImage:
    img = QImage(tile, tile, QImage.Format.Format_RGBA8888)
    img.fill(c)
    painter = QPainter(img)
    painter.fillRect(0, 0, tile // 2, tile // 2, QColor(120, 120, 120))
    painter.fillRect(tile // 2, tile // 2, tile // 2, tile // 2, QColor(120, 120, 120))
    painter.end()

    # Keep placeholder consistent with the same pixel-origin convention as real tiles.
    return img.mirrored(False, True)