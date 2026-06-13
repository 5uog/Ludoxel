# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
"""
block model の visible face を固定 orthographic view へ投影し、300 x 300 RGBA preview として rasterize する。
face index は正負 X、正負 Y、正負 Z の順であり、上面、下面、Z 面、X 面へそれぞれ 1.00、0.50、0.80、0.60 の固定明度を適用する。
この明度は sun 又は shadow-map lighting ではなく、同一 texture を使う面の向きを preview 内で識別可能にする表示契約である。
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QImage

from ludoxel.presentation.rendering.contracts.lookups import DefLookup, GetState
from ludoxel.presentation.rendering.faces.row_utils import atlas_face_uv
from ludoxel.presentation.rendering.faces.visible import iter_visible_faces
from ludoxel.presentation.resources.asset_roots import resolve_block_texture_path
from ludoxel.simulation.blocks.definitions.block import BlockDefinition

PREVIEW_CANVAS_SIZE = 300
PREVIEW_RASTER_SCALE = 4
PREVIEW_RASTER_SIZE = PREVIEW_CANVAS_SIZE * PREVIEW_RASTER_SCALE

_FACE_SHADE_ALPHA_BY_FACE: tuple[int, int, int, int, int, int] = (102, 102, 0, 128, 51, 51)


@dataclass(frozen=True)
class ProjectedPreviewFace:
  texture_path: Path
  uv_rect: tuple[float, float, float, float]
  vertices: tuple[tuple[float, float, float, float, float], ...]
  shade_alpha: int


@dataclass(frozen=True)
class TexturePixels:
  width: int
  height: int
  data: bytes


def _rotate_point(point: tuple[float, float, float], *, yaw: float, pitch: float, roll: float) -> tuple[float, float, float]:
  x, y, z = point

  yaw_r = math.radians(float(yaw))
  pitch_r = math.radians(float(pitch))
  roll_r = math.radians(float(roll))

  x, z = (x * math.cos(yaw_r) + z * math.sin(yaw_r), -x * math.sin(yaw_r) + z * math.cos(yaw_r))

  y, z = (y * math.cos(pitch_r) - z * math.sin(pitch_r), y * math.sin(pitch_r) + z * math.cos(pitch_r))

  x, y = (x * math.cos(roll_r) - y * math.sin(roll_r), x * math.sin(roll_r) + y * math.cos(roll_r))

  return (float(x), float(y), float(z))


def _normal_for_face(face_idx: int) -> tuple[float, float, float]:
  return ((1.0, 0.0, 0.0), (-1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (0.0, -1.0, 0.0), (0.0, 0.0, 1.0), (0.0, 0.0, -1.0))[int(face_idx)]


def _quad_from_bounds(mn: tuple[float, float, float], mx: tuple[float, float, float], face_idx: int) -> tuple[tuple[float, float, float], ...]:
  x0, y0, z0 = float(mn[0]), float(mn[1]), float(mn[2])
  x1, y1, z1 = float(mx[0]), float(mx[1]), float(mx[2])

  faces = (
    ((x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)),
    ((x0, y0, z1), (x0, y0, z0), (x0, y1, z0), (x0, y1, z1)),
    ((x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)),
    ((x0, y0, z1), (x1, y0, z1), (x1, y0, z0), (x0, y0, z0)),
    ((x1, y0, z1), (x0, y0, z1), (x0, y1, z1), (x1, y1, z1)),
    ((x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)),
  )

  return faces[int(face_idx)]


def _shade_alpha_for_face(face_idx: int) -> int:
  if int(face_idx) < 0 or int(face_idx) >= len(_FACE_SHADE_ALPHA_BY_FACE):
    return 0

  return int(_FACE_SHADE_ALPHA_BY_FACE[int(face_idx)])


def _project_faces(*, block: BlockDefinition, state_str: str, get_state: GetState, texture_root: Path, def_lookup: DefLookup, yaw: float, pitch: float, roll: float) -> list[ProjectedPreviewFace]:
  faces: list[ProjectedPreviewFace] = []

  for visible in iter_visible_faces(x=0, y=0, z=0, state_str=str(state_str), get_state=get_state, def_lookup=def_lookup, fast_boundary_full_cube_only=True):
    face_idx = int(visible.face_idx)

    rotated_normal = _rotate_point(_normal_for_face(face_idx), yaw=float(yaw), pitch=float(pitch), roll=float(roll))

    if float(rotated_normal[2]) <= 1e-8:
      continue

    texture_name = block.texture_for_face(face_idx)
    texture_path = resolve_block_texture_path(texture_root / "block", texture_name)

    u0, v0, u1, v1 = atlas_face_uv((0.0, 0.0, 1.0, 1.0), face_idx, visible.box, kind=str(block.kind_name()))

    source_uvs = ((float(u0), float(v0)), (float(u1), float(v0)), (float(u1), float(v1)), (float(u0), float(v1)))

    rotated = tuple(_rotate_point((x - 0.5, y - 0.5, z - 0.5), yaw=float(yaw), pitch=float(pitch), roll=float(roll)) for x, y, z in _quad_from_bounds(visible.mn, visible.mx, face_idx))

    vertices = tuple((float(point[0]), -float(point[1]), float(point[2]), float(uv[0]), float(uv[1])) for point, uv in zip(rotated, source_uvs, strict=True))

    faces.append(ProjectedPreviewFace(texture_path=texture_path, uv_rect=(float(u0), float(v0), float(u1), float(v1)), vertices=vertices, shade_alpha=_shade_alpha_for_face(face_idx)))

  return faces


def _fit_faces_to_canvas(faces: Sequence[ProjectedPreviewFace], *, canvas_size: int, scale: float, fit_padding: float) -> list[ProjectedPreviewFace]:
  xs = [vertex[0] for face in faces for vertex in face.vertices]
  ys = [vertex[1] for face in faces for vertex in face.vertices]

  if not xs or not ys:
    return []

  width = max(max(xs) - min(xs), 1e-9)
  height = max(max(ys) - min(ys), 1e-9)

  available = max(1.0, float(canvas_size) - (2.0 * float(fit_padding)))
  fit = min(available / width, available / height) * float(scale)

  center_x = 0.5 * (min(xs) + max(xs))
  center_y = 0.5 * (min(ys) + max(ys))

  out: list[ProjectedPreviewFace] = []

  for face in faces:
    vertices = tuple(((x - center_x) * fit + canvas_size * 0.5, (y - center_y) * fit + canvas_size * 0.5, z, u, v) for x, y, z, u, v in face.vertices)

    out.append(ProjectedPreviewFace(texture_path=face.texture_path, uv_rect=face.uv_rect, vertices=vertices, shade_alpha=face.shade_alpha))

  return out


def _texture_pixels(path: Path, cache: dict[Path, TexturePixels]) -> TexturePixels | None:
  resolved = Path(path).resolve()

  if resolved in cache:
    return cache[resolved]

  image = QImage(str(resolved)).convertToFormat(QImage.Format.Format_RGBA8888)

  if image.isNull():
    return None

  ptr = image.bits()
  ptr.setsize(image.sizeInBytes())
  pixels = TexturePixels(width=int(image.width()), height=int(image.height()), data=bytes(ptr))
  cache[resolved] = pixels

  return pixels


def _sample_texture(texture: TexturePixels, u: float, v: float) -> tuple[int, int, int, int]:
  uu = min(1.0, max(0.0, float(u)))
  vv = min(1.0, max(0.0, float(v)))

  x = int(round(uu * float(texture.width - 1)))
  y = int(round(vv * float(texture.height - 1)))

  offset = ((y * int(texture.width)) + x) * 4
  return (int(texture.data[offset]), int(texture.data[offset + 1]), int(texture.data[offset + 2]), int(texture.data[offset + 3]))


def _shade_rgba(rgba: tuple[int, int, int, int], shade_alpha: int) -> tuple[int, int, int, int]:
  r, g, b, a = rgba
  shade = max(0, min(255, int(shade_alpha)))

  if shade <= 0:
    return (int(r), int(g), int(b), int(a))

  factor = (255 - shade) / 255.0
  return (int(round(float(r) * factor)), int(round(float(g) * factor)), int(round(float(b) * factor)), int(a))


def _triangle_area(a: tuple[float, float, float, float, float], b: tuple[float, float, float, float, float], c: tuple[float, float, float, float, float]) -> float:
  return ((float(b[0]) - float(a[0])) * (float(c[1]) - float(a[1]))) - ((float(b[1]) - float(a[1])) * (float(c[0]) - float(a[0])))


def _rasterize_triangle(
  *,
  out: bytearray,
  zbuffer: list[float],
  size: int,
  texture: TexturePixels,
  shade_alpha: int,
  a: tuple[float, float, float, float, float],
  b: tuple[float, float, float, float, float],
  c: tuple[float, float, float, float, float],
) -> None:
  area = _triangle_area(a, b, c)

  if abs(area) <= 1e-9:
    return

  min_x = max(0, int(math.floor(min(float(a[0]), float(b[0]), float(c[0])))))
  max_x = min(int(size) - 1, int(math.ceil(max(float(a[0]), float(b[0]), float(c[0])))))
  min_y = max(0, int(math.floor(min(float(a[1]), float(b[1]), float(c[1])))))
  max_y = min(int(size) - 1, int(math.ceil(max(float(a[1]), float(b[1]), float(c[1])))))

  if min_x > max_x or min_y > max_y:
    return

  inv_area = 1.0 / area

  for py in range(min_y, max_y + 1):
    sy = float(py) + 0.5

    for px in range(min_x, max_x + 1):
      sx = float(px) + 0.5

      w0 = (((float(b[0]) - sx) * (float(c[1]) - sy)) - ((float(b[1]) - sy) * (float(c[0]) - sx))) * inv_area
      w1 = (((float(c[0]) - sx) * (float(a[1]) - sy)) - ((float(c[1]) - sy) * (float(a[0]) - sx))) * inv_area
      w2 = 1.0 - w0 - w1

      if w0 < -1e-7 or w1 < -1e-7 or w2 < -1e-7:
        continue

      z = (w0 * float(a[2])) + (w1 * float(b[2])) + (w2 * float(c[2]))
      z_index = (py * int(size)) + px

      if z <= zbuffer[z_index]:
        continue

      u = (w0 * float(a[3])) + (w1 * float(b[3])) + (w2 * float(c[3]))
      v = (w0 * float(a[4])) + (w1 * float(b[4])) + (w2 * float(c[4]))
      r, g, b_channel, alpha = _shade_rgba(_sample_texture(texture, u, v), int(shade_alpha))

      if alpha <= 0:
        continue

      out_index = z_index * 4
      out[out_index] = r
      out[out_index + 1] = g
      out[out_index + 2] = b_channel
      out[out_index + 3] = alpha
      zbuffer[z_index] = z


def _rasterize_face(*, out: bytearray, zbuffer: list[float], size: int, face: ProjectedPreviewFace, texture_cache: dict[Path, TexturePixels]) -> None:
  texture = _texture_pixels(face.texture_path, texture_cache)

  if texture is None:
    return

  if len(face.vertices) != 4:
    return

  v0, v1, v2, v3 = face.vertices

  _rasterize_triangle(out=out, zbuffer=zbuffer, size=int(size), texture=texture, shade_alpha=int(face.shade_alpha), a=v0, b=v1, c=v2)

  _rasterize_triangle(out=out, zbuffer=zbuffer, size=int(size), texture=texture, shade_alpha=int(face.shade_alpha), a=v0, b=v2, c=v3)


def _image_from_rgba_bytes(width: int, height: int, data: bytearray) -> QImage:
  image = QImage(bytes(data), int(width), int(height), QImage.Format.Format_RGBA8888)
  return image.copy()


def _downsample_preview(raster: QImage) -> QImage:
  image = raster.scaled(PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.SmoothTransformation)

  return image.convertToFormat(QImage.Format.Format_RGBA8888)


def image_has_visible_alpha(image: QImage) -> bool:
  if image.isNull() or not image.hasAlphaChannel():
    return False

  rgba = image.convertToFormat(QImage.Format.Format_RGBA8888)
  ptr = rgba.bits()
  ptr.setsize(rgba.sizeInBytes())
  data = bytes(ptr)

  return any(data[index] > 0 for index in range(3, len(data), 4))


def render_block_preview_frame(
  *,
  block: BlockDefinition,
  state_str: str,
  get_state: GetState,
  def_lookup: DefLookup,
  texture_root: Path,
  width: int = PREVIEW_CANVAS_SIZE,
  height: int = PREVIEW_CANVAS_SIZE,
  yaw_deg: float = 45.0,
  pitch_deg: float = 30.0,
  roll_deg: float = 0.0,
  scale: float = 1.0,
  fit_padding: float = 36.0,
) -> QImage:
  if int(width) != PREVIEW_CANVAS_SIZE or int(height) != PREVIEW_CANVAS_SIZE:
    raise ValueError("block preview frames must be 300x300")

  faces = _fit_faces_to_canvas(
    _project_faces(
      block=block, state_str=str(state_str), get_state=get_state, texture_root=Path(texture_root), def_lookup=def_lookup, yaw=float(yaw_deg), pitch=float(pitch_deg), roll=float(roll_deg)
    ),
    canvas_size=PREVIEW_RASTER_SIZE,
    scale=float(scale),
    fit_padding=float(fit_padding) * PREVIEW_RASTER_SCALE,
  )

  out = bytearray(PREVIEW_RASTER_SIZE * PREVIEW_RASTER_SIZE * 4)
  zbuffer = [-float("inf")] * (PREVIEW_RASTER_SIZE * PREVIEW_RASTER_SIZE)
  texture_cache: dict[Path, TexturePixels] = {}

  for face in faces:
    _rasterize_face(out=out, zbuffer=zbuffer, size=PREVIEW_RASTER_SIZE, face=face, texture_cache=texture_cache)

  raster = _image_from_rgba_bytes(PREVIEW_RASTER_SIZE, PREVIEW_RASTER_SIZE, out)
  return _downsample_preview(raster)


def write_block_preview_png(
  *,
  block: BlockDefinition,
  state_str: str,
  get_state: GetState,
  def_lookup: DefLookup,
  texture_root: Path,
  output_path: Path,
  yaw_deg: float = 45.0,
  pitch_deg: float = 30.0,
  roll_deg: float = 0.0,
  scale: float = 1.0,
  fit_padding: float = 36.0,
) -> None:
  image = render_block_preview_frame(
    block=block,
    state_str=str(state_str),
    get_state=get_state,
    def_lookup=def_lookup,
    texture_root=Path(texture_root),
    width=PREVIEW_CANVAS_SIZE,
    height=PREVIEW_CANVAS_SIZE,
    yaw_deg=float(yaw_deg),
    pitch_deg=float(pitch_deg),
    roll_deg=float(roll_deg),
    scale=float(scale),
    fit_padding=float(fit_padding),
  )

  if not image_has_visible_alpha(image):
    raise RuntimeError(f"rendered preview is transparent for {state_str}")

  output = Path(output_path)
  output.parent.mkdir(parents=True, exist_ok=True)

  if not image.save(str(output), "PNG"):
    raise RuntimeError(f"unable to write PNG: {output}")

  verified = QImage(str(output))

  if verified.isNull() or int(verified.width()) != PREVIEW_CANVAS_SIZE or int(verified.height()) != PREVIEW_CANVAS_SIZE or not verified.hasAlphaChannel() or not image_has_visible_alpha(verified):
    raise RuntimeError(f"generated preview is not a visible 300x300 alpha PNG: {output}")
