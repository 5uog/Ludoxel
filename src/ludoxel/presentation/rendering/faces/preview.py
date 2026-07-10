# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QImage, QPainter

from ludoxel.presentation.rendering.contracts.lookups import DefLookup, GetState
from ludoxel.presentation.rendering.faces.bucket_layout import FACE_COUNT
from ludoxel.presentation.rendering.faces.row_utils import atlas_face_uv
from ludoxel.presentation.rendering.faces.visible import iter_visible_faces
from ludoxel.presentation.resources.asset_roots import resolve_block_texture_path
from ludoxel.simulation.blocks.definitions.block import BlockDefinition
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.blocks.structures.axis_orientation import resolve_oriented_texture_name

PREVIEW_CANVAS_SIZE_PX = 300
PREVIEW_RASTER_SCALE_FACTOR = 4
DEFAULT_PREVIEW_YAW_DEGREES = 45.0
DEFAULT_PREVIEW_PITCH_DEGREES = 30.0
DEFAULT_PREVIEW_ROLL_DEGREES = 0.0
DEFAULT_PREVIEW_SCALE_FACTOR = 1.0
DEFAULT_PREVIEW_FIT_PADDING_PX = 18.0
RGBA_CHANNEL_COUNT = 4
ALPHA_CHANNEL_OFFSET = 3
COLOR_CHANNEL_MAX = 255
_PREVIEW_BLOCK_CENTER_OFFSET = 0.5
_PREVIEW_PIXEL_CENTER_OFFSET = 0.5
_MIN_PROJECTED_FACE_SPAN_PX = 1e-9
_BACKFACE_NORMAL_EPSILON = 1e-8
_TRIANGLE_AREA_EPSILON = 1e-9
_BARYCENTRIC_EDGE_EPSILON = 1e-7
_FACE_VERTEX_COUNT = 4

PREVIEW_CANVAS_SIZE = PREVIEW_CANVAS_SIZE_PX
PREVIEW_RASTER_SCALE = PREVIEW_RASTER_SCALE_FACTOR
PREVIEW_RASTER_SIZE = PREVIEW_CANVAS_SIZE * PREVIEW_RASTER_SCALE

_FACE_SHADE_ALPHA_BY_FACE: tuple[int, ...] = (102, 102, 0, 128, 51, 51)


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
  if int(face_idx) < 0 or int(face_idx) >= min(FACE_COUNT, len(_FACE_SHADE_ALPHA_BY_FACE)):
    return 0

  return int(_FACE_SHADE_ALPHA_BY_FACE[int(face_idx)])


def _project_faces(*, block: BlockDefinition, state_str: str, get_state: GetState, texture_root: Path, def_lookup: DefLookup, yaw: float, pitch: float, roll: float) -> list[ProjectedPreviewFace]:
  faces: list[ProjectedPreviewFace] = []
  _base_id, props = parse_state(str(state_str))

  for visible in iter_visible_faces(x=0, y=0, z=0, state_str=str(state_str), get_state=get_state, def_lookup=def_lookup, fast_boundary_full_cube_only=True):
    face_idx = int(visible.face_idx)

    rotated_normal = _rotate_point(_normal_for_face(face_idx), yaw=float(yaw), pitch=float(pitch), roll=float(roll))

    if float(rotated_normal[2]) <= _BACKFACE_NORMAL_EPSILON:
      continue

    texture_name = resolve_oriented_texture_name(block, props, face_idx)
    texture_path = resolve_block_texture_path(texture_root / "block", texture_name)

    u0, v0, u1, v1 = atlas_face_uv((0.0, 0.0, 1.0, 1.0), face_idx, visible.box, kind=str(block.kind_name()))

    source_uvs = ((float(u0), float(v0)), (float(u1), float(v0)), (float(u1), float(v1)), (float(u0), float(v1)))

    rotated = tuple(_rotate_point((x - _PREVIEW_BLOCK_CENTER_OFFSET, y - _PREVIEW_BLOCK_CENTER_OFFSET, z - _PREVIEW_BLOCK_CENTER_OFFSET), yaw=float(yaw), pitch=float(pitch), roll=float(roll)) for x, y, z in _quad_from_bounds(visible.mn, visible.mx, face_idx))

    vertices = tuple((float(point[0]), -float(point[1]), float(point[2]), float(uv[0]), float(uv[1])) for point, uv in zip(rotated, source_uvs, strict=True))

    faces.append(ProjectedPreviewFace(texture_path=texture_path, uv_rect=(float(u0), float(v0), float(u1), float(v1)), vertices=vertices, shade_alpha=_shade_alpha_for_face(face_idx)))

  return faces


def _fit_faces_to_canvas(faces: Sequence[ProjectedPreviewFace], *, canvas_size: int, scale: float, fit_padding: float) -> list[ProjectedPreviewFace]:
  xs = [vertex[0] for face in faces for vertex in face.vertices]
  ys = [vertex[1] for face in faces for vertex in face.vertices]

  if not xs or not ys:
    return []

  width = max(max(xs) - min(xs), _MIN_PROJECTED_FACE_SPAN_PX)
  height = max(max(ys) - min(ys), _MIN_PROJECTED_FACE_SPAN_PX)

  available = max(1.0, float(canvas_size) - (2.0 * float(fit_padding)))
  fit = min(available / width, available / height) * float(scale)

  center_x = _PREVIEW_PIXEL_CENTER_OFFSET * (min(xs) + max(xs))
  center_y = _PREVIEW_PIXEL_CENTER_OFFSET * (min(ys) + max(ys))

  out: list[ProjectedPreviewFace] = []

  for face in faces:
    vertices = tuple(((x - center_x) * fit + canvas_size * _PREVIEW_PIXEL_CENTER_OFFSET, (y - center_y) * fit + canvas_size * _PREVIEW_PIXEL_CENTER_OFFSET, z, u, v) for x, y, z, u, v in face.vertices)

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
  y = int(round((1.0 - vv) * float(texture.height - 1)))

  offset = ((y * int(texture.width)) + x) * RGBA_CHANNEL_COUNT
  return (int(texture.data[offset]), int(texture.data[offset + 1]), int(texture.data[offset + 2]), int(texture.data[offset + ALPHA_CHANNEL_OFFSET]))


def _shade_rgba(rgba: tuple[int, int, int, int], shade_alpha: int) -> tuple[int, int, int, int]:
  r, g, b, a = rgba
  shade = max(0, min(COLOR_CHANNEL_MAX, int(shade_alpha)))

  if shade <= 0:
    return (int(r), int(g), int(b), int(a))

  factor = (COLOR_CHANNEL_MAX - shade) / float(COLOR_CHANNEL_MAX)
  return (int(round(float(r) * factor)), int(round(float(g) * factor)), int(round(float(b) * factor)), int(a))


def _triangle_area(a: tuple[float, float, float, float, float], b: tuple[float, float, float, float, float], c: tuple[float, float, float, float, float]) -> float:
  return ((float(b[0]) - float(a[0])) * (float(c[1]) - float(a[1]))) - ((float(b[1]) - float(a[1])) * (float(c[0]) - float(a[0])))


def _rasterize_triangle(*, out: bytearray, zbuffer: list[float], size: int, texture: TexturePixels, shade_alpha: int, a: tuple[float, float, float, float, float], b: tuple[float, float, float, float, float], c: tuple[float, float, float, float, float]) -> None:
  area = _triangle_area(a, b, c)

  if abs(area) <= _TRIANGLE_AREA_EPSILON:
    return

  min_x = max(0, int(math.floor(min(float(a[0]), float(b[0]), float(c[0])))))
  max_x = min(int(size) - 1, int(math.ceil(max(float(a[0]), float(b[0]), float(c[0])))))
  min_y = max(0, int(math.floor(min(float(a[1]), float(b[1]), float(c[1])))))
  max_y = min(int(size) - 1, int(math.ceil(max(float(a[1]), float(b[1]), float(c[1])))))

  if min_x > max_x or min_y > max_y:
    return

  inv_area = 1.0 / area

  for py in range(min_y, max_y + 1):
    sy = float(py) + _PREVIEW_PIXEL_CENTER_OFFSET

    for px in range(min_x, max_x + 1):
      sx = float(px) + _PREVIEW_PIXEL_CENTER_OFFSET

      w0 = (((float(b[0]) - sx) * (float(c[1]) - sy)) - ((float(b[1]) - sy) * (float(c[0]) - sx))) * inv_area
      w1 = (((float(c[0]) - sx) * (float(a[1]) - sy)) - ((float(c[1]) - sy) * (float(a[0]) - sx))) * inv_area
      w2 = 1.0 - w0 - w1

      if w0 < -_BARYCENTRIC_EDGE_EPSILON or w1 < -_BARYCENTRIC_EDGE_EPSILON or w2 < -_BARYCENTRIC_EDGE_EPSILON:
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

      out_index = z_index * RGBA_CHANNEL_COUNT
      out[out_index] = r
      out[out_index + 1] = g
      out[out_index + 2] = b_channel
      out[out_index + ALPHA_CHANNEL_OFFSET] = alpha
      zbuffer[z_index] = z


def _rasterize_face(*, out: bytearray, zbuffer: list[float], size: int, face: ProjectedPreviewFace, texture_cache: dict[Path, TexturePixels]) -> None:
  texture = _texture_pixels(face.texture_path, texture_cache)

  if texture is None:
    return

  if len(face.vertices) != _FACE_VERTEX_COUNT:
    return

  v0, v1, v2, v3 = face.vertices

  _rasterize_triangle(out=out, zbuffer=zbuffer, size=int(size), texture=texture, shade_alpha=int(face.shade_alpha), a=v0, b=v1, c=v2)

  _rasterize_triangle(out=out, zbuffer=zbuffer, size=int(size), texture=texture, shade_alpha=int(face.shade_alpha), a=v0, b=v2, c=v3)


def _image_from_rgba_bytes(width: int, height: int, data: bytearray) -> QImage:
  image = QImage(bytes(data), int(width), int(height), QImage.Format.Format_RGBA8888)
  return image.copy()


def _downsample_preview(raster: QImage) -> QImage:
  image = raster.scaled(PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.SmoothTransformation)

  return _center_visible_alpha(image.convertToFormat(QImage.Format.Format_RGBA8888))


def _visible_alpha_bounds(image: QImage) -> tuple[int, int, int, int] | None:
  if image.isNull() or not image.hasAlphaChannel():
    return None

  rgba = image.convertToFormat(QImage.Format.Format_RGBA8888)
  ptr = rgba.bits()
  ptr.setsize(rgba.sizeInBytes())
  data = bytes(ptr)
  width = int(rgba.width())
  height = int(rgba.height())
  min_x = width
  min_y = height
  max_x = -1
  max_y = -1

  for y in range(height):
    for x in range(width):
      if data[((int(y) * width) + int(x)) * RGBA_CHANNEL_COUNT + ALPHA_CHANNEL_OFFSET] <= 0:
        continue
      min_x = min(min_x, int(x))
      min_y = min(min_y, int(y))
      max_x = max(max_x, int(x))
      max_y = max(max_y, int(y))

  if max_x < min_x or max_y < min_y:
    return None
  return (int(min_x), int(min_y), int(max_x), int(max_y))


def _center_visible_alpha(image: QImage) -> QImage:
  bounds = _visible_alpha_bounds(image)
  if bounds is None:
    return image

  min_x, min_y, max_x, max_y = bounds
  center_x = (float(min_x) + float(max_x)) * _PREVIEW_PIXEL_CENTER_OFFSET
  center_y = (float(min_y) + float(max_y)) * _PREVIEW_PIXEL_CENTER_OFFSET
  target_x = (float(image.width()) - 1.0) * _PREVIEW_PIXEL_CENTER_OFFSET
  target_y = (float(image.height()) - 1.0) * _PREVIEW_PIXEL_CENTER_OFFSET
  dx = int(round(float(target_x) - float(center_x)))
  dy = int(round(float(target_y) - float(center_y)))
  if dx == 0 and dy == 0:
    return image

  centered = QImage(int(image.width()), int(image.height()), QImage.Format.Format_RGBA8888)
  centered.fill(Qt.GlobalColor.transparent)
  painter = QPainter(centered)
  painter.drawImage(int(dx), int(dy), image)
  painter.end()
  return centered


def image_has_visible_alpha(image: QImage) -> bool:
  if image.isNull() or not image.hasAlphaChannel():
    return False

  rgba = image.convertToFormat(QImage.Format.Format_RGBA8888)
  ptr = rgba.bits()
  ptr.setsize(rgba.sizeInBytes())
  data = bytes(ptr)

  return any(data[index] > 0 for index in range(ALPHA_CHANNEL_OFFSET, len(data), RGBA_CHANNEL_COUNT))


def render_block_preview_frame(
  *,
  block: BlockDefinition,
  state_str: str,
  get_state: GetState,
  def_lookup: DefLookup,
  texture_root: Path,
  width: int = PREVIEW_CANVAS_SIZE,
  height: int = PREVIEW_CANVAS_SIZE,
  yaw_deg: float = DEFAULT_PREVIEW_YAW_DEGREES,
  pitch_deg: float = DEFAULT_PREVIEW_PITCH_DEGREES,
  roll_deg: float = DEFAULT_PREVIEW_ROLL_DEGREES,
  scale: float = DEFAULT_PREVIEW_SCALE_FACTOR,
  fit_padding: float = DEFAULT_PREVIEW_FIT_PADDING_PX,
) -> QImage:
  if int(width) != PREVIEW_CANVAS_SIZE or int(height) != PREVIEW_CANVAS_SIZE:
    raise ValueError(f"block preview frames must be {PREVIEW_CANVAS_SIZE}x{PREVIEW_CANVAS_SIZE}")

  faces = _fit_faces_to_canvas(
    _project_faces(block=block, state_str=str(state_str), get_state=get_state, texture_root=Path(texture_root), def_lookup=def_lookup, yaw=float(yaw_deg), pitch=float(pitch_deg), roll=float(roll_deg)), canvas_size=PREVIEW_RASTER_SIZE, scale=float(scale), fit_padding=float(fit_padding) * PREVIEW_RASTER_SCALE
  )

  out = bytearray(PREVIEW_RASTER_SIZE * PREVIEW_RASTER_SIZE * RGBA_CHANNEL_COUNT)
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
  yaw_deg: float = DEFAULT_PREVIEW_YAW_DEGREES,
  pitch_deg: float = DEFAULT_PREVIEW_PITCH_DEGREES,
  roll_deg: float = DEFAULT_PREVIEW_ROLL_DEGREES,
  scale: float = DEFAULT_PREVIEW_SCALE_FACTOR,
  fit_padding: float = DEFAULT_PREVIEW_FIT_PADDING_PX,
) -> None:
  image = render_block_preview_frame(
    block=block, state_str=str(state_str), get_state=get_state, def_lookup=def_lookup, texture_root=Path(texture_root), width=PREVIEW_CANVAS_SIZE, height=PREVIEW_CANVAS_SIZE, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), roll_deg=float(roll_deg), scale=float(scale), fit_padding=float(fit_padding)
  )

  if not image_has_visible_alpha(image):
    raise RuntimeError(f"rendered preview is transparent for {state_str}")

  output = Path(output_path)
  output.parent.mkdir(parents=True, exist_ok=True)

  if not image.save(str(output), "PNG"):
    raise RuntimeError(f"unable to write PNG: {output}")

  verified = QImage(str(output))

  if verified.isNull() or int(verified.width()) != PREVIEW_CANVAS_SIZE or int(verified.height()) != PREVIEW_CANVAS_SIZE or not verified.hasAlphaChannel() or not image_has_visible_alpha(verified):
    raise RuntimeError(f"generated preview is not a visible {PREVIEW_CANVAS_SIZE}x{PREVIEW_CANVAS_SIZE} alpha PNG: {output}")
