# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import argparse
import math
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QImage

from ludoxel.presentation.rendering.faces.row_utils import atlas_face_uv
from ludoxel.presentation.rendering.faces.visible import iter_visible_faces
from ludoxel.presentation.resources.asset_roots import VisualAssetRoots, resolve_block_texture_path, resolve_visual_asset_roots
from ludoxel.simulation.blocks.definitions.block import BlockDefinition
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.registries.default import create_default_registry
from ludoxel.simulation.blocks.states.codec import format_state, parse_state

PREVIEW_CANVAS_SIZE = 300
PREVIEW_RASTER_SCALE = 4
PREVIEW_RASTER_SIZE = PREVIEW_CANVAS_SIZE * PREVIEW_RASTER_SCALE

_DIRECTION_OFFSETS: dict[str, tuple[int, int, int]] = {"north": (0, 0, -1), "east": (1, 0, 0), "south": (0, 0, 1), "west": (-1, 0, 0), "up": (0, 1, 0), "down": (0, -1, 0)}

"""
Face order is the same as _normal_for_face:
+X, -X, +Y, -Y, +Z, -Z.

This is not sun lighting and not shadow-map lighting. It is the fixed
default block side-shade model used by block previews so that the top,
side, and bottom planes remain visually separable when the same texture
appears on every face.

Brightness model:
  UP   = 1.00 -> alpha 0
  DOWN = 0.50 -> alpha 128
  Z    = 0.80 -> alpha 51
  X    = 0.60 -> alpha 102
"""

_FACE_SHADE_ALPHA_BY_FACE: tuple[int, int, int, int, int, int] = (102, 102, 0, 128, 51, 51)

GetState = Callable[[int, int, int], str | None]
DefLookup = Callable[[str], BlockDefinition | None]


@dataclass(frozen=True)
class BlockPreviewNeighbor:
  direction: str
  state: str


@dataclass(frozen=True)
class BlockPreviewRequest:
  mode: str
  texture_root: Path | None
  output_root: Path | None
  blocks: tuple[str, ...]
  all_blocks: bool
  model_category: str
  state_overrides: tuple[str, ...]
  neighbors: tuple[BlockPreviewNeighbor, ...]
  yaw: float
  pitch: float
  roll: float
  scale: float
  fit_padding: float
  dry_run: bool
  allow_overwrite: bool
  project_root: Path


@dataclass(frozen=True)
class BlockPreviewPlan:
  block: BlockDefinition
  state_str: str
  get_state: GetState
  output_path: Path


@dataclass(frozen=True)
class ProjectedPreviewFace:
  texture_path: Path
  uv_rect: tuple[float, float, float, float]
  vertices: tuple[tuple[float, float, float, float, float], ...]
  shade_alpha: int


@dataclass(frozen=True)
class BlockPreviewSummary:
  selected: int
  existing: int
  texture_root: Path
  output_root: Path
  written: tuple[Path, ...]


@dataclass(frozen=True)
class TexturePixels:
  width: int
  height: int
  data: bytes


def _resolve_repo_path(project_root: Path, value: str | Path | None) -> Path | None:
  if value is None:
    return None

  raw = str(value).strip()
  if not raw:
    return None

  path = Path(raw)
  if path.is_absolute():
    return path.resolve()

  return (Path(project_root) / path).resolve()


def _normalize_category(value: str) -> str:
  category = str(value).strip().lower()

  if category in ("full", "full_block"):
    return "cube"

  return category


def _state_overrides(values: Iterable[str]) -> dict[str, str]:
  out: dict[str, str] = {}

  for raw in values:
    text = str(raw).strip()
    if not text:
      continue

    if "=" not in text:
      raise ValueError(f"--state must use key=value: {text}")

    key, value = text.split("=", 1)
    key = key.strip()

    if key:
      out[str(key)] = str(value).strip()

  if "orientation" in out and "facing" not in out:
    out["facing"] = str(out.pop("orientation"))

  if "slab_half" in out and "type" not in out:
    out["type"] = str(out.pop("slab_half"))

  if "stair_half" in out and "half" not in out:
    out["half"] = str(out.pop("stair_half"))

  return out


def _default_state_props(block: BlockDefinition) -> dict[str, str]:
  kind = str(block.kind_name())

  if kind == "slab":
    return {"type": "bottom"}

  if kind == "stairs":
    return {"facing": "east", "half": "bottom", "shape": "straight"}

  if kind == "fence_gate":
    return {"facing": "south", "in_wall": "false", "open": "false", "powered": "false", "waterlogged": "false"}

  if kind == "wall":
    return {"waterlogged": "false"}

  return {}


def _neighbor_map_for_block(block: BlockDefinition, state_str: str, neighbors: Sequence[BlockPreviewNeighbor]) -> dict[tuple[int, int, int], str]:
  explicit: dict[str, str] = {}

  for neighbor in neighbors:
    explicit[str(neighbor.direction)] = str(neighbor.state)

  if not explicit and str(block.kind_name()) in ("fence", "wall"):
    explicit["north"] = str(block.block_id)
    explicit["south"] = str(block.block_id)

  out: dict[tuple[int, int, int], str] = {(0, 0, 0): str(state_str)}

  for direction, state in explicit.items():
    offset = _DIRECTION_OFFSETS.get(str(direction))
    if offset is not None:
      out[offset] = str(state)

  return out


def _make_state_getter(block: BlockDefinition, state_str: str, neighbors: Sequence[BlockPreviewNeighbor]) -> GetState:
  states = _neighbor_map_for_block(block, state_str, neighbors)

  def get_state(x: int, y: int, z: int) -> str | None:
    return states.get((int(x), int(y), int(z)))

  return get_state


def _parse_neighbor(raw: str) -> BlockPreviewNeighbor:
  text = str(raw).strip()

  if "=" not in text:
    raise ValueError(f"--neighbor must use direction=state: {text}")

  direction, state = text.split("=", 1)
  direction = direction.strip().lower()
  state = state.strip()

  if direction not in _DIRECTION_OFFSETS:
    raise ValueError(f"unsupported neighbor direction: {direction}")

  if not state:
    raise ValueError(f"--neighbor state must not be empty for {direction}")

  return BlockPreviewNeighbor(direction=str(direction), state=str(state))


def _select_blocks(registry: BlockRegistry, request: BlockPreviewRequest) -> tuple[list[BlockDefinition], list[str]]:
  requested = {str(block_id).strip() for block_id in request.blocks if str(block_id).strip()}
  category = _normalize_category(str(request.model_category))

  blocks = [block for block in registry.all_blocks() if (bool(request.all_blocks) or not requested or block.block_id in requested) and (not category or str(block.kind_name()) == str(category))]

  found_ids = {block.block_id for block in blocks}
  missing = sorted(requested - found_ids)

  return blocks, missing


def _resolve_roots(registry: BlockRegistry, request: BlockPreviewRequest) -> tuple[Path, Path]:
  texture_root = _resolve_repo_path(request.project_root, request.texture_root)
  output_root = _resolve_repo_path(request.project_root, request.output_root)

  if texture_root is not None and output_root is not None:
    return texture_root, output_root

  roots: VisualAssetRoots = resolve_visual_asset_roots(request.project_root / "assets", required_texture_names=registry.required_texture_names())

  return (roots.texture_root if texture_root is None else texture_root, roots.block_thumbnail_dir if output_root is None else output_root)


def _validate_state_known(state: str, registry: BlockRegistry, *, label: str) -> str | None:
  raw = str(state).strip()
  base_id, _props = parse_state(raw)

  if not str(base_id).strip():
    return f"{label}: empty block id"

  if "|" in raw:
    _base, tail = raw.split("|", 1)

    for fragment in tail.split(","):
      part = fragment.strip()
      if not part:
        continue

      if "=" not in part:
        return f"{label}: malformed state property: {part}"

      key, _value = part.split("=", 1)
      if not key.strip():
        return f"{label}: empty state property key"

  if registry.get(str(base_id)) is None:
    return f"{label}: unknown block id: {base_id}"

  return None


def _existing_output_is_valid(path: Path) -> bool:
  image = QImage(str(path))

  if image.isNull():
    return False

  return int(image.width()) == PREVIEW_CANVAS_SIZE and int(image.height()) == PREVIEW_CANVAS_SIZE and bool(image.hasAlphaChannel())


def _required_texture_paths(block: BlockDefinition, texture_root: Path) -> list[Path]:
  names = sorted({block.texture_for_face(face_idx) for face_idx in range(6)})
  return [resolve_block_texture_path(texture_root / "block", name) for name in names]


def _build_plans(registry: BlockRegistry, request: BlockPreviewRequest, texture_root: Path, output_root: Path) -> tuple[list[BlockPreviewPlan], list[str], int]:
  failures: list[str] = []

  if not (texture_root / "block").is_dir():
    failures.append(f"missing block texture directory: {texture_root / 'block'}")

  selected, missing = _select_blocks(registry, request)

  if missing:
    failures.append(f"unknown or category-mismatched block ids: {', '.join(missing)}")

  if not selected:
    failures.append("no blocks selected")

  overrides = _state_overrides(request.state_overrides)
  parsed_neighbors = tuple(request.neighbors)

  for neighbor in parsed_neighbors:
    failure = _validate_state_known(neighbor.state, registry, label=f"neighbor {neighbor.direction}")
    if failure:
      failures.append(failure)

  plans: list[BlockPreviewPlan] = []
  existing = 0

  for block in selected:
    props = _default_state_props(block)
    props.update(overrides)

    state_str = format_state(str(block.block_id), props)
    failure = _validate_state_known(state_str, registry, label=str(block.block_id))

    if failure:
      failures.append(failure)

    get_state = _make_state_getter(block, state_str, parsed_neighbors)

    visible_faces = list(iter_visible_faces(x=0, y=0, z=0, state_str=state_str, get_state=get_state, def_lookup=registry.get, fast_boundary_full_cube_only=True))

    if not visible_faces:
      failures.append(f"{block.block_id}: model contract produced no visible faces for {state_str}")

    for texture_path in _required_texture_paths(block, texture_root):
      image = QImage(str(texture_path))

      if not texture_path.is_file() or image.isNull():
        failures.append(f"{block.block_id}: missing or unreadable PNG texture {texture_path}")

    output_path = output_root / f"{str(block.block_id).split(':', 1)[-1]}.png"

    if output_path.exists():
      existing += 1

      if not _existing_output_is_valid(output_path):
        failures.append(f"{block.block_id}: existing output is not a 300x300 alpha PNG: {output_path}")

      if request.mode == "generate" and not request.dry_run and not request.allow_overwrite:
        failures.append(f"{block.block_id}: output exists; pass --allow-overwrite to replace {output_path}")

    plans.append(BlockPreviewPlan(block=block, state_str=state_str, get_state=get_state, output_path=output_path))

  return plans, failures, existing


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


def _project_faces(plan: BlockPreviewPlan, texture_root: Path, *, def_lookup: DefLookup, yaw: float, pitch: float, roll: float) -> list[ProjectedPreviewFace]:
  block = plan.block
  faces: list[ProjectedPreviewFace] = []

  for visible in iter_visible_faces(x=0, y=0, z=0, state_str=plan.state_str, get_state=plan.get_state, def_lookup=def_lookup, fast_boundary_full_cube_only=True):
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

  plan = BlockPreviewPlan(block=block, state_str=str(state_str), get_state=get_state, output_path=Path())

  faces = _fit_faces_to_canvas(
    _project_faces(plan, Path(texture_root), def_lookup=def_lookup, yaw=float(yaw_deg), pitch=float(pitch_deg), roll=float(roll_deg)),
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

  if not _existing_output_is_valid(output) or not image_has_visible_alpha(verified):
    raise RuntimeError(f"generated preview is not a visible 300x300 alpha PNG: {output}")


def run_block_preview_request(request: BlockPreviewRequest, *, registry: BlockRegistry | None = None) -> BlockPreviewSummary:
  reg = registry or create_default_registry()
  texture_root, output_root = _resolve_roots(reg, request)
  plans, failures, existing = _build_plans(reg, request, texture_root, output_root)

  if failures:
    for failure in failures:
      print(f"[generate_block_thumbnails] {failure}")
    raise SystemExit(1)

  print(f"[generate_block_thumbnails] selected={len(plans)} existing={existing} texture_root={texture_root} output_root={output_root}")

  if request.mode == "check" or request.dry_run:
    print("[generate_block_thumbnails] validation complete; no files written.")
    return BlockPreviewSummary(selected=len(plans), existing=int(existing), texture_root=texture_root, output_root=output_root, written=())

  written: list[Path] = []

  for plan in plans:
    write_block_preview_png(
      block=plan.block,
      state_str=plan.state_str,
      get_state=plan.get_state,
      def_lookup=reg.get,
      texture_root=texture_root,
      output_path=plan.output_path,
      yaw_deg=request.yaw,
      pitch_deg=request.pitch,
      roll_deg=request.roll,
      scale=request.scale,
      fit_padding=request.fit_padding,
    )
    written.append(plan.output_path)
    print(f"[generate_block_thumbnails] wrote {plan.output_path}")

  return BlockPreviewSummary(selected=len(plans), existing=int(existing), texture_root=texture_root, output_root=output_root, written=tuple(written))


def _parse_cli_arguments(argv: Sequence[str] | None = None) -> BlockPreviewRequest:
  parser = argparse.ArgumentParser(add_help=False)
  parser.add_argument("--mode", choices=("generate", "check"), required=True)
  parser.add_argument("--project-root", default=".")
  parser.add_argument("--texture-root", default="")
  parser.add_argument("--output-root", default="")
  parser.add_argument("--block", action="append", default=[])
  parser.add_argument("--all", action="store_true")
  parser.add_argument("--model-category", default="")
  parser.add_argument("--state", action="append", default=[])
  parser.add_argument("--neighbor", action="append", default=[])
  parser.add_argument("--yaw", type=float, default=45.0)
  parser.add_argument("--pitch", type=float, default=30.0)
  parser.add_argument("--roll", type=float, default=0.0)
  parser.add_argument("--scale", type=float, default=1.0)
  parser.add_argument("--fit-padding", type=float, default=36.0)
  parser.add_argument("--dry-run", action="store_true")
  parser.add_argument("--allow-overwrite", action="store_true")
  args = parser.parse_args(argv)

  project_root = Path(args.project_root).resolve()
  neighbors = tuple(_parse_neighbor(raw) for raw in args.neighbor)

  return BlockPreviewRequest(
    mode=str(args.mode),
    texture_root=_resolve_repo_path(project_root, args.texture_root),
    output_root=_resolve_repo_path(project_root, args.output_root),
    blocks=tuple(str(value) for value in args.block),
    all_blocks=bool(args.all or not args.block),
    model_category=str(args.model_category),
    state_overrides=tuple(str(value) for value in args.state),
    neighbors=neighbors,
    yaw=float(args.yaw),
    pitch=float(args.pitch),
    roll=float(args.roll),
    scale=float(args.scale),
    fit_padding=float(args.fit_padding),
    dry_run=bool(args.dry_run),
    allow_overwrite=bool(args.allow_overwrite),
    project_root=project_root,
  )


def main(argv: Sequence[str] | None = None) -> int:
  try:
    request = _parse_cli_arguments(argv)
    run_block_preview_request(request)
    return 0
  except SystemExit as exc:
    return int(exc.code) if isinstance(exc.code, int) else 1
  except Exception as exc:
    print(f"[generate_block_thumbnails] {exc}")
    return 1


if __name__ == "__main__":
  raise SystemExit(main())
