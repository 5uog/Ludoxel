# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.voxels.faces import FACE_NEG_X, FACE_NEG_Y, FACE_NEG_Z, FACE_POS_X, FACE_POS_Y, FACE_POS_Z
from ludoxel.presentation.rendering.contracts.lookups import DefLookup
from ludoxel.simulation.blocks.models.common import LocalBox
from ludoxel.simulation.blocks.models.dimensions import px_box
from ludoxel.simulation.blocks.models.fence_gate import boxes_for_fence_gate
from ludoxel.simulation.blocks.models.slab import boxes_for_slab
from ludoxel.simulation.blocks.models.stairs import boxes_for_stairs
from ludoxel.simulation.blocks.models.wall import boxes_for_wall


@dataclass(frozen=True)
class TexturedBox:
  """
  local cuboid `B` と、六 voxel face に対応する任意の pixel UV rectangle 群 `U` を組にした record である。
  held-item rendering はこの record により、block family 実装へ直接結合せず幾何と atlas addressing を受け渡す。
  """

  box: LocalBox
  face_uv_pixels: dict[int, tuple[float, float, float, float]] | None = None


_FENCE_INVENTORY_BOXES: tuple[TexturedBox, ...] = (
  TexturedBox(
    box=px_box(6, 0, 6, 10, 16, 10),
    face_uv_pixels={
      FACE_POS_X: (10.0, 0.0, 14.0, 16.0),
      FACE_NEG_X: (6.0, 0.0, 10.0, 16.0),
      FACE_POS_Y: (6.0, 6.0, 10.0, 10.0),
      FACE_NEG_Y: (10.0, 6.0, 14.0, 10.0),
      FACE_POS_Z: (6.0, 0.0, 10.0, 16.0),
      FACE_NEG_Z: (14.0, 0.0, 10.0, 16.0),
    },
  ),
  TexturedBox(
    box=px_box(7, 6, -2, 9, 9, 18),
    face_uv_pixels={
      FACE_POS_X: (9.0, 6.0, 11.0, 9.0),
      FACE_NEG_X: (7.0, 6.0, 9.0, 9.0),
      FACE_POS_Y: (7.0, 0.0, 9.0, 4.0),
      FACE_NEG_Y: (9.0, 0.0, 11.0, 4.0),
      FACE_POS_Z: (7.0, 4.0, 9.0, 7.0),
      FACE_NEG_Z: (11.0, 4.0, 13.0, 7.0),
    },
  ),
  TexturedBox(
    box=px_box(7, 12, -2, 9, 15, 18),
    face_uv_pixels={
      FACE_POS_X: (9.0, 12.0, 11.0, 15.0),
      FACE_NEG_X: (7.0, 12.0, 9.0, 15.0),
      FACE_POS_Y: (7.0, 7.0, 9.0, 11.0),
      FACE_NEG_Y: (9.0, 7.0, 11.0, 11.0),
      FACE_POS_Z: (7.0, 9.0, 9.0, 12.0),
      FACE_NEG_Z: (11.0, 9.0, 13.0, 12.0),
    },
  ),
)

_WALL_INVENTORY_BOXES: tuple[TexturedBox, ...] = tuple(
  TexturedBox(box=b)
  for b in boxes_for_wall(props={"north": "low", "south": "low", "east": "none", "west": "none", "up": "true"}, get_state=(lambda _x, _y, _z: None), get_def=(lambda _block_id: None), x=0, y=0, z=0)
)

_HELD_BLOCK_KIND_SCALE_MULTIPLIERS: dict[str, float] = {"cube": 1.0, "slab": 1.0, "stairs": 1.0, "wall": 1.16, "fence": 1.12, "fence_gate": 1.72}


def _normalize_kind(kind: str | None) -> str:
  """
  block kind 文字列を小文字化・strip し、欠落値は空文字列へ正規化する。
  nullable 又は緩い入力でも held-block geometry catalogue の lookup を全域的に行えるようにする。
  """
  return "" if kind is None else str(kind).strip().lower()


def held_block_model_boxes(block_id: str | None, def_lookup: DefLookup) -> tuple[TexturedBox, ...]:
  """
  inventory item identifier から block definition を解決し、その kind に対応する held-block cuboid 群を返す。
  registry で解決できない identifier は空 tuple となり、renderer は未定義 block を描かない。
  """
  if block_id is None:
    return ()

  block_def = def_lookup(str(block_id))
  if block_def is None:
    return ()

  return held_block_model_boxes_for_kind(block_def.kind_name())


def held_block_model_boxes_for_kind(kind: str | None) -> tuple[TexturedBox, ...]:
  """
  `cube`、`slab`、`stairs`、`wall`、`fence`、`fence_gate` の有限集合を held-item 用 cuboid decomposition へ写す catalogue である。
  first-person と third-person はこの同じ幾何源を消費する。
  """
  normalized = _normalize_kind(kind)
  if normalized == "slab":
    return tuple(TexturedBox(box=b) for b in boxes_for_slab({"type": "bottom"}))
  if normalized == "stairs":
    boxes = boxes_for_stairs(
      base_id="minecraft:stone_stairs", props={"facing": "east", "half": "bottom", "shape": "straight"}, get_state=(lambda _x, _y, _z: None), get_def=(lambda _block_id: None), x=0, y=0, z=0
    )
    return tuple(TexturedBox(box=b) for b in boxes)
  if normalized == "wall":
    return _WALL_INVENTORY_BOXES
  if normalized == "fence":
    return _FENCE_INVENTORY_BOXES
  if normalized == "fence_gate":
    return tuple(TexturedBox(box=b) for b in boxes_for_fence_gate({"facing": "south", "open": "false", "in_wall": "false"}))
  return (TexturedBox(box=LocalBox(0.0, 0.0, 0.0, 1.0, 1.0, 1.0)),)


def held_block_kind_scale_multiplier(kind: str | None) -> float:
  """
  block kind ごとの held-item camera transform 補正倍率を返す。
  細い block や疎な block が同一 composition law の下で過度に小さく又は大きく見えないよう、screen-space mass を調整する。
  """
  normalized = _normalize_kind(kind)
  return float(_HELD_BLOCK_KIND_SCALE_MULTIPLIERS.get(normalized, 1.0))
