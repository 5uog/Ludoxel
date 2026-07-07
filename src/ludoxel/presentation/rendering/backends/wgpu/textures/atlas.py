# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QColor, QImage, QPainter

from ludoxel.presentation.rendering.contracts.lookups import UVRect
from ludoxel.presentation.resources.asset_roots import resolve_block_texture_path


@dataclass(frozen=True)
class WgpuAtlasTile:
  x: int
  y: int


@dataclass
class WgpuTextureAtlas:
  uv: Dict[str, UVRect]
  width: int
  height: int
  tiles: Dict[str, WgpuAtlasTile]
  tile_size: int
  pad: int
  image: QImage
  texture: object | None = None
  texture_view: object | None = None
  sampler: object | None = None

  @staticmethod
  def build_from_dir(block_dir: Path, tile_size: int = 64, names: Iterable[str] | None = None, pad: int = 1) -> "WgpuTextureAtlas":
    items = _collect_images(block_dir, tile_size, names=names, pad=pad)
    if not any(n == "default" for (n, _img) in items):
      items.append(("default", _placeholder(tile_size, QColor(180, 180, 180), pad=pad)))

    n = len(items)
    cols = int(math.ceil(math.sqrt(n)))
    rows = int(math.ceil(n / cols))
    cell = int(tile_size + 2 * max(0, int(pad)))
    w = cols * cell
    h = rows * cell

    atlas = QImage(w, h, QImage.Format.Format_RGBA8888)
    atlas.fill(QColor(0, 0, 0, 0))

    painter = QPainter(atlas)
    uv: Dict[str, UVRect] = {}
    tiles: Dict[str, WgpuAtlasTile] = {}
    p = int(max(0, int(pad)))

    for i, (name, img) in enumerate(items):
      cx = (i % cols) * cell
      cy = (i // cols) * cell
      painter.drawImage(cx, cy, img)
      u0 = (cx + p) / w
      v0 = (cy + p) / h
      u1 = (cx + p + tile_size) / w
      v1 = (cy + p + tile_size) / h
      uv[str(name)] = (float(u0), float(v0), float(u1), float(v1))
      tiles[str(name)] = WgpuAtlasTile(x=int(cx), y=int(cy))

    painter.end()
    return WgpuTextureAtlas(uv=uv, width=int(w), height=int(h), tiles=tiles, tile_size=int(tile_size), pad=int(p), image=atlas.convertToFormat(QImage.Format.Format_RGBA8888))

  def upload(self, *, device) -> None:
    import wgpu

    image = self.image.convertToFormat(QImage.Format.Format_RGBA8888)
    ptr = image.bits()
    ptr.setsize(image.sizeInBytes())
    data = bytes(ptr)

    texture = device.create_texture(label="ludoxel-block-atlas", size=(int(self.width), int(self.height), 1), format=wgpu.TextureFormat.rgba8unorm, usage=wgpu.TextureUsage.TEXTURE_BINDING | wgpu.TextureUsage.COPY_DST)
    device.queue.write_texture({"texture": texture}, data, {"bytes_per_row": int(self.width) * 4, "rows_per_image": int(self.height)}, (int(self.width), int(self.height), 1))
    self.texture = texture
    self.texture_view = texture.create_view(label="ludoxel-block-atlas-view")
    self.sampler = device.create_sampler(label="ludoxel-block-atlas-sampler", mag_filter="nearest", min_filter="nearest", mipmap_filter="nearest")

  def destroy(self) -> None:
    texture = self.texture
    if texture is not None and hasattr(texture, "destroy"):
      texture.destroy()
    self.texture = None
    self.texture_view = None
    self.sampler = None


def _collect_images(block_dir: Path, tile_size: int, names: Iterable[str] | None = None, pad: int = 1) -> list[tuple[str, QImage]]:
  out: list[tuple[str, QImage]] = []
  if not block_dir.exists():
    return out

  p = int(max(0, int(pad)))
  if names is None:
    candidates = tuple((path.stem, path) for path in sorted(block_dir.glob("*.png")))
  else:
    candidates = tuple((str(name), resolve_block_texture_path(block_dir, str(name))) for name in names)

  for name, path in candidates:
    if not path.exists():
      continue
    img = QImage(str(path))
    if img.isNull():
      continue
    out.append((str(name), _prep_image(img, tile_size=int(tile_size), pad=int(p))))

  return out


def _prep_image(img: QImage, *, tile_size: int, pad: int) -> QImage:
  image = img.convertToFormat(QImage.Format.Format_RGBA8888)
  if image.width() != int(tile_size) or image.height() != int(tile_size):
    image = image.scaled(int(tile_size), int(tile_size), Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation)
  image = image.mirrored(False, True)
  if int(pad) <= 0:
    return image
  return _pad_extrude(image, pad=int(pad))


def _pad_extrude(src: QImage, pad: int) -> QImage:
  p = int(max(0, int(pad)))
  w = int(src.width())
  h = int(src.height())
  dst = QImage(w + 2 * p, h + 2 * p, QImage.Format.Format_RGBA8888)
  dst.fill(QColor(0, 0, 0, 0))

  painter = QPainter(dst)
  painter.drawImage(p, p, src)
  painter.drawImage(0, p, src.copy(0, 0, 1, h).scaled(p, h, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.drawImage(p + w, p, src.copy(w - 1, 0, 1, h).scaled(p, h, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.drawImage(p, 0, src.copy(0, 0, w, 1).scaled(w, p, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.drawImage(p, p + h, src.copy(0, h - 1, w, 1).scaled(w, p, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.drawImage(0, 0, src.copy(0, 0, 1, 1).scaled(p, p, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.drawImage(p + w, 0, src.copy(w - 1, 0, 1, 1).scaled(p, p, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.drawImage(0, p + h, src.copy(0, h - 1, 1, 1).scaled(p, p, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.drawImage(p + w, p + h, src.copy(w - 1, h - 1, 1, 1).scaled(p, p, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation))
  painter.end()
  return dst


def _placeholder(tile: int, c: QColor, pad: int = 1) -> QImage:
  img = QImage(int(tile), int(tile), QImage.Format.Format_RGBA8888)
  img.fill(c)
  painter = QPainter(img)
  painter.fillRect(0, 0, int(tile) // 2, int(tile) // 2, QColor(120, 120, 120))
  painter.fillRect(int(tile) // 2, int(tile) // 2, int(tile) // 2, int(tile) // 2, QColor(120, 120, 120))
  painter.end()
  img = img.mirrored(False, True)
  if int(pad) > 0:
    img = _pad_extrude(img, pad=int(pad))
  return img
