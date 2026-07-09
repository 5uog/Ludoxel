# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtGui import QImage

from ludoxel.presentation.rendering.faces.bucket_layout import FACE_COUNT
from ludoxel.presentation.rendering.faces.preview import DEFAULT_PREVIEW_FIT_PADDING_PX, DEFAULT_PREVIEW_PITCH_DEGREES, DEFAULT_PREVIEW_ROLL_DEGREES, DEFAULT_PREVIEW_SCALE_FACTOR, DEFAULT_PREVIEW_YAW_DEGREES, PREVIEW_CANVAS_SIZE, write_block_preview_png
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


def _resolve_repo_path(project_root: Path, value: str | Path | None) -> Path | None:
  if value is None:
    return None
  raw = str(value).strip()
  if not raw:
    return None
  path = Path(raw)
  return path.resolve() if path.is_absolute() else (Path(project_root) / path).resolve()


def _normalize_category(value: str) -> str:
  category = str(value).strip().lower()
  return "cube" if category in ("full", "full_block") else category


def _state_overrides(values: Iterable[str]) -> dict[str, str]:
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
  kind = str(block.kind_name())
  if kind == "slab":
    return {"type": "bottom"}
  if kind == "stairs":
    return {"facing": "east", "half": "bottom", "shape": "straight"}
  if kind == "fence_gate":
    return {"facing": "south", "in_wall": "false", "open": "false", "powered": "false", "waterlogged": "false"}
  if kind == "wall":
    return {"north": "low", "east": "none", "south": "low", "west": "none", "up": "true", "waterlogged": "false"}
  return {}


def _make_state_getter(block: BlockDefinition, state_str: str, neighbors: Sequence[BlockPreviewNeighbor]) -> GetState:
  explicit = {str(neighbor.direction): str(neighbor.state) for neighbor in neighbors}
  if not explicit and str(block.kind_name()) in ("fence", "wall"):
    explicit = {"north": str(block.block_id), "south": str(block.block_id)}
  states: dict[tuple[int, int, int], str] = {(0, 0, 0): str(state_str)}
  for direction, state in explicit.items():
    offset = _DIRECTION_OFFSETS.get(str(direction))
    if offset is not None:
      states[offset] = str(state)

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
  return not image.isNull() and int(image.width()) == PREVIEW_CANVAS_SIZE and int(image.height()) == PREVIEW_CANVAS_SIZE and bool(image.hasAlphaChannel())


def _resolve_roots(registry: BlockRegistry, request: BlockPreviewRequest) -> tuple[Path, Path]:
  texture_root = _resolve_repo_path(request.project_root, request.texture_root)
  output_root = _resolve_repo_path(request.project_root, request.output_root)
  if texture_root is not None and output_root is not None:
    return texture_root, output_root
  roots = resolve_visual_asset_roots(request.project_root / "assets", required_texture_names=registry.required_texture_names())
  return (roots.texture_root if texture_root is None else texture_root, roots.block_thumbnail_dir if output_root is None else output_root)


def _build_plans(registry: BlockRegistry, request: BlockPreviewRequest, texture_root: Path, output_root: Path) -> tuple[list[BlockPreviewPlan], list[str], int]:
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

    for texture_name in sorted({block.texture_for_face(face_idx) for face_idx in range(FACE_COUNT)}):
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
  parser.add_argument("--yaw", type=float, default=DEFAULT_PREVIEW_YAW_DEGREES)
  parser.add_argument("--pitch", type=float, default=DEFAULT_PREVIEW_PITCH_DEGREES)
  parser.add_argument("--roll", type=float, default=DEFAULT_PREVIEW_ROLL_DEGREES)
  parser.add_argument("--scale", type=float, default=DEFAULT_PREVIEW_SCALE_FACTOR)
  parser.add_argument("--fit-padding", type=float, default=DEFAULT_PREVIEW_FIT_PADDING_PX)
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
    write_block_preview_png(block=plan.block, state_str=plan.state_str, get_state=plan.get_state, def_lookup=registry.get, texture_root=texture_root, output_path=plan.output_path, yaw_deg=request.yaw, pitch_deg=request.pitch, roll_deg=request.roll, scale=request.scale, fit_padding=request.fit_padding)
    print(f"[generate_block_thumbnails] wrote {plan.output_path}")
  return 0


def main(argv: Sequence[str] | None = None) -> int:
  try:
    return run(_parse_arguments(argv))
  except SystemExit as exc:
    return int(exc.code) if isinstance(exc.code, int) else 1
  except Exception as exc:
    print(f"[generate_block_thumbnails] {exc}", file=sys.stderr)
    return 1


if __name__ == "__main__":
  raise SystemExit(main())
