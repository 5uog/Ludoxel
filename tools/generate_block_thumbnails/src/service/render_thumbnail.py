# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import argparse
import math
import sys
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtCore import QPointF, Qt
from PyQt6.QtGui import QColor, QImage, QPainter, QPainterPath, QPolygonF, QTransform

PROJECT_ROOT = Path(__file__).resolve().parents[4]
SOURCE_ROOT = PROJECT_ROOT / "src"
if str(SOURCE_ROOT) not in sys.path:
  sys.path.insert(0, str(SOURCE_ROOT))

from ludoxel.presentation.rendering.faces.occlusion import is_local_face_occluded  # noqa: E402
from ludoxel.presentation.rendering.faces.row_utils import atlas_face_uv  # noqa: E402
from ludoxel.presentation.resources.asset_roots import resolve_block_texture_path  # noqa: E402
from ludoxel.simulation.blocks.models.api import render_boxes_for_block  # noqa: E402
from ludoxel.simulation.blocks.registries.default import create_default_registry  # noqa: E402
from ludoxel.simulation.blocks.states.codec import format_state  # noqa: E402

CANVAS_SIZE = 300


@dataclass(frozen=True)
class ProjectedFace:
  """
  一つの model box face を描画順、texture path、canvas 上の四頂点として保持する。
  `depth` は回転後 z 座標の平均であり、orthographic view で遠方から手前へ安定して並べるために用いる。
  """

  depth: float
  texture_path: Path
  uv_rect: tuple[float, float, float, float]
  points: tuple[tuple[float, float], ...]
  shade_alpha: int


def _parse_arguments() -> argparse.Namespace:
  """
  Node.js CLI が検証済み option を Python model renderer へ渡すための引数 schema を定義する。
  repository tooling 固有の help と command dispatch は Node.js 側に残し、この helper は model contract と PNG 生成だけを担う。
  """
  parser = argparse.ArgumentParser(add_help=False)
  parser.add_argument("--mode", choices=("generate", "check"), required=True)
  parser.add_argument("--texture-root", required=True)
  parser.add_argument("--output-root", required=True)
  parser.add_argument("--block", action="append", default=[])
  parser.add_argument("--all", action="store_true")
  parser.add_argument("--model-category", default="")
  parser.add_argument("--state", action="append", default=[])
  parser.add_argument("--yaw", type=float, default=45.0)
  parser.add_argument("--pitch", type=float, default=30.0)
  parser.add_argument("--roll", type=float, default=0.0)
  parser.add_argument("--scale", type=float, default=1.0)
  parser.add_argument("--fit-padding", type=float, default=36.0)
  parser.add_argument("--connectivity-axis", choices=("north-south", "east-west", "none"), default="north-south")
  for direction in ("north", "east", "south", "west"):
    parser.add_argument(f"--{direction}", dest=direction, action="store_true")
    parser.add_argument(f"--no-{direction}", dest=direction, action="store_false")
    parser.set_defaults(**{direction: None})
  parser.add_argument("--dry-run", action="store_true")
  parser.add_argument("--allow-overwrite", action="store_true")
  return parser.parse_args()


def _state_overrides(values: list[str]) -> dict[str, str]:
  """
  repeatable `key=value` option を block state property 辞書へ正規化する。
  後勝ちで上書きし、空 key は Node 側 validation を通過していても採用しない。
  """
  out: dict[str, str] = {}
  for raw in values:
    key, value = str(raw).split("=", 1)
    if str(key).strip():
      out[str(key).strip()] = str(value).strip()
  if "orientation" in out and "facing" not in out:
    out["facing"] = str(out.pop("orientation"))
  if "slab_half" in out and "type" not in out:
    out["type"] = str(out.pop("slab_half"))
  if "stair_half" in out and "half" not in out:
    out["half"] = str(out.pop("stair_half"))
  return out


def _default_props(kind: str, args: argparse.Namespace) -> dict[str, str]:
  """
  block model kind ごとの既存 state semantics に従う thumbnail 用既定 property を返す。
  fence と wall は一軸 connectivity を既定とし、隣接 block 自体は描画せず中心 block の model state だけを変化させる。
  """
  if kind == "slab":
    return {"type": "bottom"}
  if kind == "stairs":
    return {"facing": "east", "half": "bottom", "shape": "straight"}
  if kind == "fence_gate":
    return {"facing": "south", "in_wall": "false", "open": "false", "powered": "false", "waterlogged": "false"}
  if kind == "wall":
    connections = _connections(args)
    return {
      "north": "low" if connections["north"] else "none",
      "east": "low" if connections["east"] else "none",
      "south": "low" if connections["south"] else "none",
      "west": "low" if connections["west"] else "none",
      "up": "true",
      "waterlogged": "false",
    }
  return {}


def _connections(args: argparse.Namespace) -> dict[str, bool]:
  """
  connectivity axis と個別方向 override を north/east/south/west の真偽へ展開する。
  既定 north-south は中心 fence 又は wall の接続 arm だけを有効にし、neighbor geometry は出力しない。
  """
  values = {
    "north": args.connectivity_axis == "north-south",
    "east": args.connectivity_axis == "east-west",
    "south": args.connectivity_axis == "north-south",
    "west": args.connectivity_axis == "east-west",
  }
  for direction in tuple(values):
    explicit = getattr(args, direction)
    if explicit is not None:
      values[direction] = bool(explicit)
  return values


def _state_getter(*, block_id: str, kind: str, props: dict[str, str], args: argparse.Namespace):
  """
  connectivity と stair shape を現行 model API の neighbor-state 入力として表現する getter を返す。
  thumbnail 専用 geometry rule は作らず、`render_boxes_for_block()` が通常 world と同じ state interpretation を行う。
  """
  neighbor_states: dict[tuple[int, int, int], str] = {}
  if kind == "fence":
    offsets = {"north": (0, 0, -1), "east": (1, 0, 0), "south": (0, 0, 1), "west": (-1, 0, 0)}
    for direction, enabled in _connections(args).items():
      if enabled:
        neighbor_states[offsets[direction]] = str(block_id)
  if kind == "stairs":
    facing = str(props.get("facing", "east"))
    half = str(props.get("half", "bottom"))
    shape = str(props.get("shape", "straight"))
    directions = {"east": (1, 0), "south": (0, 1), "west": (-1, 0), "north": (0, -1)}
    left = {"east": "north", "north": "west", "west": "south", "south": "east"}
    right = {"east": "south", "south": "west", "west": "north", "north": "east"}
    dx, dz = directions.get(facing, directions["east"])
    if shape in ("outer_left", "outer_right"):
      neighbor_facing = left.get(facing, "north") if shape == "outer_left" else right.get(facing, "south")
      neighbor_states[(dx, 0, dz)] = format_state(block_id, {"facing": neighbor_facing, "half": half})
    elif shape in ("inner_left", "inner_right"):
      neighbor_facing = left.get(facing, "north") if shape == "inner_left" else right.get(facing, "south")
      neighbor_states[(-dx, 0, -dz)] = format_state(block_id, {"facing": neighbor_facing, "half": half})

  def get_state(x: int, y: int, z: int) -> str | None:
    """
    中心 cell 周囲の model-state neighbor だけを返す。
    描画対象は常に中心 block 一個であり、返された neighbor は connectivity/shape 解決以外には使用されない。
    """
    return neighbor_states.get((int(x), int(y), int(z)))

  return get_state


def _rotate(point: tuple[float, float, float], *, yaw: float, pitch: float, roll: float) -> tuple[float, float, float]:
  """
  model center を原点とした点へ yaw、pitch、roll の順で右手系回転を適用する。
  角度は degree 入力であり、返値 z 成分は face culling と painter depth sort に用いる。
  """
  x, y, z = point
  yaw_r = math.radians(float(yaw))
  pitch_r = math.radians(float(pitch))
  roll_r = math.radians(float(roll))
  x, z = (x * math.cos(yaw_r) + z * math.sin(yaw_r), -x * math.sin(yaw_r) + z * math.cos(yaw_r))
  y, z = (y * math.cos(pitch_r) - z * math.sin(pitch_r), y * math.sin(pitch_r) + z * math.cos(pitch_r))
  x, y = (x * math.cos(roll_r) - y * math.sin(roll_r), x * math.sin(roll_r) + y * math.cos(roll_r))
  return (float(x), float(y), float(z))


def _face_geometry(box, face_idx: int) -> tuple[tuple[float, float, float], ...]:
  """
  LocalBox の指定 face を OpenGL/WGPU と同じ face index 順序の四頂点へ展開する。
  頂点は texture rectangle の左上、右上、右下、左下に対応する順序で返す。
  """
  x0, y0, z0 = float(box.mn_x), float(box.mn_y), float(box.mn_z)
  x1, y1, z1 = float(box.mx_x), float(box.mx_y), float(box.mx_z)
  faces = (
    ((x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)),
    ((x0, y0, z1), (x0, y0, z0), (x0, y1, z0), (x0, y1, z1)),
    ((x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)),
    ((x0, y0, z1), (x1, y0, z1), (x1, y0, z0), (x0, y0, z0)),
    ((x1, y0, z1), (x0, y0, z1), (x0, y1, z1), (x1, y1, z1)),
    ((x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)),
  )
  return faces[int(face_idx)]


def _face_normal(face_idx: int) -> tuple[float, float, float]:
  """
  renderer face index に対応する外向き単位法線を返す。
  回転後 z 成分が正の face だけを camera-facing face として thumbnail に描画する。
  """
  return ((1.0, 0.0, 0.0), (-1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (0.0, -1.0, 0.0), (0.0, 0.0, 1.0), (0.0, 0.0, -1.0))[int(face_idx)]


def _projected_faces(block, state_str: str, get_state, get_def, texture_root: Path, args: argparse.Namespace) -> list[ProjectedFace]:
  """
  現行 block model の render boxes から外部可視 face を列挙し、texture と回転済み二次元 quad を対応付ける。
  box 間で完全に覆われる local face は通常 renderer と同じ occlusion helper で除外する。
  """
  boxes = list(render_boxes_for_block(state_str, get_state, get_def, 0, 0, 0))
  faces: list[ProjectedFace] = []
  for box in boxes:
    for face_idx in range(6):
      if is_local_face_occluded(box=box, face_idx=face_idx, boxes=boxes):
        continue
      normal = _rotate(_face_normal(face_idx), yaw=args.yaw, pitch=args.pitch, roll=args.roll)
      if float(normal[2]) <= 1e-8:
        continue
      rotated = tuple(_rotate((x - 0.5, y - 0.5, z - 0.5), yaw=args.yaw, pitch=args.pitch, roll=args.roll) for x, y, z in _face_geometry(box, face_idx))
      points = tuple((float(point[0]), -float(point[1])) for point in rotated)
      texture_name = block.texture_for_face(face_idx)
      uv_rect = atlas_face_uv((0.0, 0.0, 1.0, 1.0), int(face_idx), box, kind=block.kind_name())
      shade_alpha = 0 if face_idx == 2 else (34 if face_idx in (0, 4) else 58)
      faces.append(
        ProjectedFace(
          depth=sum(point[2] for point in rotated) / 4.0, texture_path=resolve_block_texture_path(texture_root / "block", texture_name), uv_rect=uv_rect, points=points, shade_alpha=shade_alpha
        )
      )
  return sorted(faces, key=lambda face: float(face.depth))


def _canvas_faces(faces: list[ProjectedFace], args: argparse.Namespace) -> list[ProjectedFace]:
  """
  全可視 quad の projected bounds を 300x300 canvas 内へ安定 padding 付きで fit する。
  model bounds の中心を canvas 中心へ合わせ、追加 scale は同じ中心を保ったまま適用する。
  """
  xs = [point[0] for face in faces for point in face.points]
  ys = [point[1] for face in faces for point in face.points]
  if not xs or not ys:
    return []
  width = max(max(xs) - min(xs), 1e-9)
  height = max(max(ys) - min(ys), 1e-9)
  available = max(1.0, float(CANVAS_SIZE) - (2.0 * float(args.fit_padding)))
  fit = min(available / width, available / height) * float(args.scale)
  center_x = 0.5 * (min(xs) + max(xs))
  center_y = 0.5 * (min(ys) + max(ys))
  out: list[ProjectedFace] = []
  for face in faces:
    points = tuple(((x - center_x) * fit + CANVAS_SIZE * 0.5, (y - center_y) * fit + CANVAS_SIZE * 0.5) for x, y in face.points)
    out.append(ProjectedFace(depth=face.depth, texture_path=face.texture_path, uv_rect=face.uv_rect, points=points, shade_alpha=face.shade_alpha))
  return out


def _draw_face(painter: QPainter, face: ProjectedFace) -> None:
  """
  source texture rectangle を projected quad へ projective transform し、quad 外を clip して描画する。
  texture alpha を保持した後、face orientation に対応する半透明 shade を重ねる。
  """
  texture = QImage(str(face.texture_path)).convertToFormat(QImage.Format.Format_RGBA8888)
  u0, v0, u1, v1 = face.uv_rect
  width = float(texture.width())
  height = float(texture.height())
  source = QPolygonF((QPointF(u0 * width, v0 * height), QPointF(u1 * width, v0 * height), QPointF(u1 * width, v1 * height), QPointF(u0 * width, v1 * height)))
  target = QPolygonF(tuple(QPointF(float(x), float(y)) for x, y in face.points))
  transform = QTransform()
  ok = QTransform.quadToQuad(source, target, transform)
  if not bool(ok):
    return
  path = QPainterPath()
  path.addPolygon(target)
  painter.save()
  painter.setClipPath(path)
  painter.setTransform(transform)
  painter.drawImage(0, 0, texture)
  painter.restore()
  if int(face.shade_alpha) > 0:
    painter.save()
    painter.setPen(Qt.PenStyle.NoPen)
    painter.setBrush(QColor(0, 0, 0, int(face.shade_alpha)))
    painter.drawPolygon(target)
    painter.restore()


def _render_block(block, state_str: str, get_state, get_def, texture_root: Path, output_path: Path, args: argparse.Namespace) -> None:
  """
  一つの block state を透明 300x300 RGBA canvas へ描画し、PNG として保存する。
  window screenshot や既存 thumbnail の再標本化を使わず、model boxes と指定 texture root だけから deterministic output を生成する。
  """
  faces = _canvas_faces(_projected_faces(block, state_str, get_state, get_def, texture_root, args), args)
  image = QImage(CANVAS_SIZE, CANVAS_SIZE, QImage.Format.Format_RGBA8888)
  image.fill(Qt.GlobalColor.transparent)
  painter = QPainter(image)
  painter.setRenderHint(QPainter.RenderHint.Antialiasing, False)
  painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform, False)
  for face in faces:
    _draw_face(painter, face)
  painter.end()
  output_path.parent.mkdir(parents=True, exist_ok=True)
  if not image.save(str(output_path), "PNG"):
    raise RuntimeError(f"unable to write PNG: {output_path}")
  verified = QImage(str(output_path))
  if verified.isNull() or verified.width() != CANVAS_SIZE or verified.height() != CANVAS_SIZE or not verified.hasAlphaChannel():
    raise RuntimeError(f"generated image is not a 300x300 alpha PNG: {output_path}")


def main() -> int:
  """
  selected block contract と texture/output policy を検査し、generate mode のみ PNG を書き込む。
  check と dry-run は directory 又は asset file を作成せず、既存 Minecraft thumbnail の保護状態を報告する。
  """
  args = _parse_arguments()
  texture_root = (PROJECT_ROOT / args.texture_root).resolve() if not Path(args.texture_root).is_absolute() else Path(args.texture_root).resolve()
  output_root = (PROJECT_ROOT / args.output_root).resolve() if not Path(args.output_root).is_absolute() else Path(args.output_root).resolve()
  if not (texture_root / "block").is_dir():
    print(f"[generate_block_thumbnails] missing block texture directory: {texture_root / 'block'}", file=sys.stderr)
    return 1
  registry = create_default_registry()
  requested = {str(value) for value in args.block}
  category = str(args.model_category).strip().lower()
  if category in ("full", "full_block"):
    category = "cube"
  selected = [block for block in registry.all_blocks() if (not requested or block.block_id in requested) and (not category or block.kind_name() == category)]
  missing_ids = sorted(requested - {block.block_id for block in selected})
  if missing_ids:
    print(f"[generate_block_thumbnails] unknown or category-mismatched block ids: {', '.join(missing_ids)}", file=sys.stderr)
    return 1
  if not selected:
    print("[generate_block_thumbnails] no blocks selected.", file=sys.stderr)
    return 1
  overrides = _state_overrides(args.state)
  failures: list[str] = []
  plans: list[tuple[object, str, object, Path]] = []
  existing = 0
  for block in selected:
    props = _default_props(block.kind_name(), args)
    props.update(overrides)
    state_str = format_state(block.block_id, props)
    get_state = _state_getter(block_id=block.block_id, kind=block.kind_name(), props=props, args=args)
    boxes = list(render_boxes_for_block(state_str, get_state, registry.get, 0, 0, 0))
    if not boxes:
      failures.append(f"{block.block_id}: model contract produced no render boxes for {state_str}")
    required = sorted({block.texture_for_face(face_idx) for face_idx in range(6)})
    for texture_name in required:
      texture_path = resolve_block_texture_path(texture_root / "block", texture_name)
      image = QImage(str(texture_path))
      if not texture_path.is_file() or image.isNull():
        failures.append(f"{block.block_id}: missing or unreadable PNG texture {texture_path}")
    output_path = output_root / f"{block.block_id.split(':', 1)[-1]}.png"
    if output_path.exists():
      existing += 1
      existing_image = QImage(str(output_path))
      if existing_image.isNull() or existing_image.width() != CANVAS_SIZE or existing_image.height() != CANVAS_SIZE or not existing_image.hasAlphaChannel():
        failures.append(f"{block.block_id}: existing output is not a 300x300 alpha PNG: {output_path}")
      if args.mode == "generate" and not args.dry_run and not args.allow_overwrite:
        failures.append(f"{block.block_id}: output exists; pass --allow-overwrite to replace {output_path}")
    plans.append((block, state_str, get_state, output_path))
  if failures:
    for failure in failures:
      print(f"[generate_block_thumbnails] {failure}", file=sys.stderr)
    return 1
  print(f"[generate_block_thumbnails] selected={len(plans)} existing={existing} texture_root={texture_root} output_root={output_root}")
  if args.mode == "check" or args.dry_run:
    print("[generate_block_thumbnails] validation complete; no files written.")
    return 0
  for block, state_str, get_state, output_path in plans:
    _render_block(block, state_str, get_state, registry.get, texture_root, output_path, args)
    print(f"[generate_block_thumbnails] wrote {output_path}")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
