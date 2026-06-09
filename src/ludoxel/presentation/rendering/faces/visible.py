# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass

from ludoxel.foundations.mathematics.voxels.faces import face_neighbor_offset
from ludoxel.presentation.rendering.faces.axes import face_touches_cell_boundary
from ludoxel.presentation.rendering.faces.occlusion import is_block_face_occluded, is_local_face_occluded
from ludoxel.presentation.rendering.snapshots.dto import DefLookup, GetState
from ludoxel.simulation.blocks.models.api import render_boxes_for_block
from ludoxel.simulation.blocks.models.common import LocalBox
from ludoxel.simulation.blocks.states.codec import parse_state


@dataclass(frozen=True)
class VisibleFace:
  """
  local box、face index、world-space bounds からなる、occlusion 後に残った一つの可視 face を表す中間 record である。
  model visibility analysis と renderer payload packing の間で共有される。
  """

  box: LocalBox
  face_idx: int
  mn: tuple[float, float, float]
  mx: tuple[float, float, float]


def _neighbor_is_full_cube_solid(*, x: int, y: int, z: int, face_idx: int, get_state: GetState, def_lookup: DefLookup) -> bool:
  """
  face normal 方向の隣接 voxel が solid full cube として解決されるかを判定する。
  成立する場合、接触 face は詳細な geometry inspection を行わず完全に occlude される。
  """
  dx, dy, dz = face_neighbor_offset(int(face_idx))
  nx = int(x) + int(dx)
  ny = int(y) + int(dy)
  nz = int(z) + int(dz)

  nst = get_state(int(nx), int(ny), int(nz))
  if nst is None:
    return False

  nb, _np = parse_state(str(nst))
  nd = def_lookup(str(nb))
  if nd is None:
    return False

  return bool(nd.is_full_cube) and bool(nd.is_solid)


def _boundary_neighbor_is_full_cube_solid(*, x: int, y: int, z: int, face_idx: int, box: LocalBox, get_state: GetState, def_lookup: DefLookup) -> bool:
  """
  local face が voxel 境界に達している条件を加えた full-cube neighbor 判定である。
  multi-box model の内部 face に対して隣接 cell を誤って照会しないための絞り込みである。
  """
  if not face_touches_cell_boundary(int(face_idx), box):
    return False

  return _neighbor_is_full_cube_solid(x=int(x), y=int(y), z=int(z), face_idx=int(face_idx), get_state=get_state, def_lookup=def_lookup)


def iter_visible_faces(*, x: int, y: int, z: int, state_str: str, get_state: GetState, def_lookup: DefLookup, fast_boundary_full_cube_only: bool = False) -> Iterator[VisibleFace]:
  """
  block state の render boxes から、local occlusion と neighbor occlusion を通過した face を順に生成する。
  chunk payload synthesis を含む face-level renderer 入力は、この visibility walk を共通の根拠とする。
  """
  base, _props = parse_state(str(state_str))
  defn = def_lookup(str(base))
  boxes = list(render_boxes_for_block(str(state_str), get_state, def_lookup, int(x), int(y), int(z)))

  if not boxes:
    return

  full_cube_fast_path = bool(defn is not None and bool(defn.is_full_cube) and bool(defn.is_solid))

  for box in boxes:
    mn = (float(x) + float(box.mn_x), float(y) + float(box.mn_y), float(z) + float(box.mn_z))
    mx = (float(x) + float(box.mx_x), float(y) + float(box.mx_y), float(z) + float(box.mx_z))

    for fi in range(6):
      if is_local_face_occluded(box=box, face_idx=int(fi), boxes=boxes):
        continue

      if bool(fast_boundary_full_cube_only):
        if _boundary_neighbor_is_full_cube_solid(x=int(x), y=int(y), z=int(z), face_idx=int(fi), box=box, get_state=get_state, def_lookup=def_lookup):
          continue
      else:
        if full_cube_fast_path and _neighbor_is_full_cube_solid(x=int(x), y=int(y), z=int(z), face_idx=int(fi), get_state=get_state, def_lookup=def_lookup):
          continue

        if is_block_face_occluded(x=int(x), y=int(y), z=int(z), box=box, face_idx=int(fi), get_state=get_state, def_lookup=def_lookup):
          continue

      yield VisibleFace(box=box, face_idx=int(fi), mn=mn, mx=mx)
