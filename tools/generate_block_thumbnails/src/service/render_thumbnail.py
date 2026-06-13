# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtGui import QImage

from ludoxel.presentation.rendering.faces.preview import PREVIEW_CANVAS_SIZE, write_block_preview_png
from ludoxel.presentation.rendering.faces.visible import iter_visible_faces
from ludoxel.presentation.resources.asset_roots import resolve_block_texture_path, resolve_visual_asset_roots
from ludoxel.simulation.blocks.definitions.block import BlockDefinition
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.registries.default import create_default_registry
from ludoxel.simulation.blocks.states.codec import format_state, parse_state

GetState = Callable[[int, int, int], str | None]

_DIRECTION_OFFSETS: dict[str, tuple[int, int, int]] = {"north": (0, 0, -1), "east": (1, 0, 0), "south": (0, 0, 1), "west": (-1, 0, 0), "up": (0, 1, 0), "down": (0, -1, 0)}


@dataclass(frozen=True)
class BlockPreviewNeighbor:
  """
  thumbnail model の connectivity 解決に供給する方向と block state の組を保持する。
  direction は六近傍名、state は block registry で解決可能な state string として validation 済みであることを前提とする。
  """

  direction: str
  state: str


@dataclass(frozen=True)
class BlockPreviewRequest:
  """
  Node.js CLI が検証した thumbnail task を Python rendering service へ渡す値 object である。
  path は project root を基準に解決し、generate と check の file-system side effect を mode と dry_run で分離する。
  """

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
  """
  一つの block preview に必要な domain state、neighbor lookup、及び出力先を結合する。
  rendering geometry は presentation API が所有し、この plan は repository tool の batch 実行順だけを保持する。
  """

  block: BlockDefinition
  state_str: str
  get_state: GetState
  output_path: Path


def _resolve_repo_path(project_root: Path, value: str | Path | None) -> Path | None:
  """
  CLI path を repository root 基準の絶対 path へ正規化する。
  値が未指定又は空文字の場合は asset resolver に既定 root の選択を委ねるため None を返す。
  """
  if value is None:
    return None
  raw = str(value).strip()
  if not raw:
    return None
  path = Path(raw)
  return path.resolve() if path.is_absolute() else (Path(project_root) / path).resolve()


def _normalize_category(value: str) -> str:
  """
  CLI の full block alias を block registry が使用する cube category へ正規化する。
  未指定値及び他の既知 category は小文字化した値をそのまま返す。
  """
  category = str(value).strip().lower()
  return "cube" if category in ("full", "full_block") else category


def _state_overrides(values: Iterable[str]) -> dict[str, str]:
  """
  repeatable な key=value option を後勝ちの block-state property 辞書へ変換する。
  compatibility 名は現行 state codec の facing、type、half へ正規化し、不正形式は task failure として例外を送出する。
  """
  out: dict[str, str] = {}
  for raw in values:
    text = str(raw).strip()
    if not text:
      continue
    if "=" not in text:
      raise ValueError(f"--state must use key=value: {text}")
    key, value = text.split("=", 1)
    if key.strip():
      out[str(key).strip()] = str(value).strip()
  if "orientation" in out and "facing" not in out:
    out["facing"] = str(out.pop("orientation"))
  if "slab_half" in out and "type" not in out:
    out["type"] = str(out.pop("slab_half"))
  if "stair_half" in out and "half" not in out:
    out["half"] = str(out.pop("stair_half"))
  return out


def _default_state_props(block: BlockDefinition) -> dict[str, str]:
  """
  preview で model geometry が一義的になる block-kind 固有の既定 state を返す。
  connectivity は neighbor lookup から導出し、domain model と異なる thumbnail 専用 geometry rule は作らない。
  """
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


def _make_state_getter(block: BlockDefinition, state_str: str, neighbors: Sequence[BlockPreviewNeighbor]) -> GetState:
  """
  中心 block と明示された六近傍だけを返す model-state lookup を構築する。
  fence と wall では指定がない場合に代表形状として north-south の同種近傍を補う。
  """
  explicit = {str(neighbor.direction): str(neighbor.state) for neighbor in neighbors}
  if not explicit and str(block.kind_name()) in ("fence", "wall"):
    explicit = {"north": str(block.block_id), "south": str(block.block_id)}
  states: dict[tuple[int, int, int], str] = {(0, 0, 0): str(state_str)}
  for direction, state in explicit.items():
    offset = _DIRECTION_OFFSETS.get(str(direction))
    if offset is not None:
      states[offset] = str(state)

  def get_state(x: int, y: int, z: int) -> str | None:
    """
    model contract が照会した局所 cell に対応する state を返す。
    登録されていない cell の None は空 cell を表し、world state への副作用は持たない。
    """
    return states.get((int(x), int(y), int(z)))

  return get_state


def _parse_neighbor(raw: str) -> BlockPreviewNeighbor:
  """
  direction=state 形式を六近傍の値 object へ変換する。
  未対応方向又は空 state は Node.js validation を迂回した直接実行でも拒否する。
  """
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


def _validate_state_known(state: str, registry: BlockRegistry, *, label: str) -> str | None:
  """
  state string の block id、property fragment、及び registry 登録を検査する。
  正常時は None、異常時は batch report に付加できる label 付き説明を返す。
  """
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
  """
  既存 output が 300x300 alpha PNG として Qt から読めるかを判定する。
  pixel content は generate 後の renderer API が検証し、check mode では file contract だけを確認する。
  """
  image = QImage(str(path))
  return not image.isNull() and int(image.width()) == PREVIEW_CANVAS_SIZE and int(image.height()) == PREVIEW_CANVAS_SIZE and bool(image.hasAlphaChannel())


def _resolve_roots(registry: BlockRegistry, request: BlockPreviewRequest) -> tuple[Path, Path]:
  """
  明示 path 又は shared visual-asset resolver から texture root と thumbnail root を確定する。
  一方だけが指定された場合も、他方は同じ asset family の解決結果を使用する。
  """
  texture_root = _resolve_repo_path(request.project_root, request.texture_root)
  output_root = _resolve_repo_path(request.project_root, request.output_root)
  if texture_root is not None and output_root is not None:
    return texture_root, output_root
  roots = resolve_visual_asset_roots(request.project_root / "assets", required_texture_names=registry.required_texture_names())
  return (roots.texture_root if texture_root is None else texture_root, roots.block_thumbnail_dir if output_root is None else output_root)


def _build_plans(registry: BlockRegistry, request: BlockPreviewRequest, texture_root: Path, output_root: Path) -> tuple[list[BlockPreviewPlan], list[str], int]:
  """
  block selection、state、texture、model face、既存 output を検査して実行 plan を作る。
  check mode と generate mode は同じ検査結果を共有し、overwrite policy だけを generate side effect の直前条件として追加する。
  """
  failures: list[str] = []
  if not (texture_root / "block").is_dir():
    failures.append(f"missing block texture directory: {texture_root / 'block'}")

  requested = {str(block_id).strip() for block_id in request.blocks if str(block_id).strip()}
  category = _normalize_category(str(request.model_category))
  selected = [block for block in registry.all_blocks() if (bool(request.all_blocks) or not requested or block.block_id in requested) and (not category or str(block.kind_name()) == str(category))]
  missing = sorted(requested - {block.block_id for block in selected})
  if missing:
    failures.append(f"unknown or category-mismatched block ids: {', '.join(missing)}")
  if not selected:
    failures.append("no blocks selected")

  overrides = _state_overrides(request.state_overrides)
  for neighbor in request.neighbors:
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

    get_state = _make_state_getter(block, state_str, request.neighbors)
    if not list(iter_visible_faces(x=0, y=0, z=0, state_str=state_str, get_state=get_state, def_lookup=registry.get, fast_boundary_full_cube_only=True)):
      failures.append(f"{block.block_id}: model contract produced no visible faces for {state_str}")

    for texture_name in sorted({block.texture_for_face(face_idx) for face_idx in range(6)}):
      texture_path = resolve_block_texture_path(texture_root / "block", texture_name)
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


def _parse_arguments(argv: Sequence[str] | None = None) -> BlockPreviewRequest:
  """
  Node.js service から渡される subprocess argument schema を Python 値 object へ変換する。
  user-facing help、command dispatch、及び primary validation は Node.js CLI が所有し、この parser は process boundary の型復元だけを担う。
  """
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
  return BlockPreviewRequest(
    mode=str(args.mode),
    texture_root=_resolve_repo_path(project_root, args.texture_root),
    output_root=_resolve_repo_path(project_root, args.output_root),
    blocks=tuple(str(value) for value in args.block),
    all_blocks=bool(args.all or not args.block),
    model_category=str(args.model_category),
    state_overrides=tuple(str(value) for value in args.state),
    neighbors=tuple(_parse_neighbor(raw) for raw in args.neighbor),
    yaw=float(args.yaw),
    pitch=float(args.pitch),
    roll=float(args.roll),
    scale=float(args.scale),
    fit_padding=float(args.fit_padding),
    dry_run=bool(args.dry_run),
    allow_overwrite=bool(args.allow_overwrite),
    project_root=project_root,
  )


def run(request: BlockPreviewRequest) -> int:
  """
  検査済み plan を check 又は generate mode で実行し、process exit code を返す。
  check と dry-run は file を作成せず、generate は presentation rendering API だけを用いて PNG を書き込む。
  """
  registry = create_default_registry()
  texture_root, output_root = _resolve_roots(registry, request)
  plans, failures, existing = _build_plans(registry, request, texture_root, output_root)
  if failures:
    for failure in failures:
      print(f"[generate_block_thumbnails] {failure}", file=sys.stderr)
    return 1

  print(f"[generate_block_thumbnails] selected={len(plans)} existing={existing} texture_root={texture_root} output_root={output_root}")
  if request.mode == "check" or request.dry_run:
    print("[generate_block_thumbnails] validation complete; no files written.")
    return 0

  for plan in plans:
    write_block_preview_png(
      block=plan.block,
      state_str=plan.state_str,
      get_state=plan.get_state,
      def_lookup=registry.get,
      texture_root=texture_root,
      output_path=plan.output_path,
      yaw_deg=request.yaw,
      pitch_deg=request.pitch,
      roll_deg=request.roll,
      scale=request.scale,
      fit_padding=request.fit_padding,
    )
    print(f"[generate_block_thumbnails] wrote {plan.output_path}")
  return 0


def main(argv: Sequence[str] | None = None) -> int:
  """
  subprocess argument の復元と task 実行を一つの process exit code へ変換する。
  validation 又は rendering の例外は command prefix 付きで標準 error に報告し、非零 status を返す。
  """
  try:
    return run(_parse_arguments(argv))
  except SystemExit as exc:
    return int(exc.code) if isinstance(exc.code, int) else 1
  except Exception as exc:
    print(f"[generate_block_thumbnails] {exc}", file=sys.stderr)
    return 1


if __name__ == "__main__":
  raise SystemExit(main())
