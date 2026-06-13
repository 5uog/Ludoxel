# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

import numpy as np

from ludoxel.presentation.rendering.contracts.lookups import DefLookup, GetState
from ludoxel.presentation.rendering.faces.occlusion import is_block_face_occluded, is_local_face_occluded
from ludoxel.simulation.blocks.models.api import render_boxes_for_block
from ludoxel.simulation.blocks.models.common import LocalBox


@dataclass(frozen=True)
class SelectionOutlineBuilder:
  """
  一つの block state realization を world-space outline segment 群へ写す builder である。
  block definition lookup を instance に束ね、outline construction が常に同じ block-model semantics を参照するようにする。
  """

  def_lookup: DefLookup

  @staticmethod
  def _quant(v: float, q: float = 1e-6) -> int:
    """
    `Q(v) = round(v / q)` によって浮動小数座標を量子化する。
    微小誤差だけ異なる edge endpoint を同じ幾何 key として扱うための前処理である。
    """
    return int(round(float(v) / float(q)))

  def _edge_key(self, a: tuple[float, float, float], b: tuple[float, float, float]) -> tuple[int, ...]:
    """
    二つの endpoint を量子化し、辞書式順序で並べた対称 key を返す。
    outline segment が発見順に依存して重複登録されることを防ぐ。
    """
    qa = (self._quant(a[0]), self._quant(a[1]), self._quant(a[2]))
    qb = (self._quant(b[0]), self._quant(b[1]), self._quant(b[2]))

    if qa <= qb:
      return (qa[0], qa[1], qa[2], qb[0], qb[1], qb[2])

    return (qb[0], qb[1], qb[2], qa[0], qa[1], qa[2])

  @staticmethod
  def _quant_16(v: float) -> int:
    """
    `Q16(v) = round(16v)` により、voxel の自然な 1/16 格子へ座標を射影する。
    outline の face subdivision はこの格子上で表される。
    """
    return int(round(float(v) * 16.0))

  @staticmethod
  def _outline_boxes(state_str: str, get_state: GetState, get_def: DefLookup, x: int, y: int, z: int) -> list[LocalBox]:
    """
    指定 world position に置かれた block state の render box decomposition を返す。
    outline extraction はこの分解を幾何の権威的情報源として使う。
    """
    return list(render_boxes_for_block(str(state_str), get_state, get_def, int(x), int(y), int(z)))

  @staticmethod
  def _plane_rect_for_face(*, box: LocalBox, face_idx: int, x: int, y: int, z: int) -> tuple[float, float, float, float, float]:
    """
    world-space face plane と、その plane 上の二つの座標 interval を返す。
    可視 face は量子化された二次元格子上の occupied cell として扱われる。
    """
    if int(face_idx) == 0:
      return (float(x) + float(box.mx_x), float(y) + float(box.mn_y), float(y) + float(box.mx_y), float(z) + float(box.mn_z), float(z) + float(box.mx_z))
    if int(face_idx) == 1:
      return (float(x) + float(box.mn_x), float(y) + float(box.mn_y), float(y) + float(box.mx_y), float(z) + float(box.mn_z), float(z) + float(box.mx_z))
    if int(face_idx) == 2:
      return (float(y) + float(box.mx_y), float(x) + float(box.mn_x), float(x) + float(box.mx_x), float(z) + float(box.mn_z), float(z) + float(box.mx_z))
    if int(face_idx) == 3:
      return (float(y) + float(box.mn_y), float(x) + float(box.mn_x), float(x) + float(box.mx_x), float(z) + float(box.mn_z), float(z) + float(box.mx_z))
    if int(face_idx) == 4:
      return (float(z) + float(box.mx_z), float(x) + float(box.mn_x), float(x) + float(box.mx_x), float(y) + float(box.mn_y), float(y) + float(box.mx_y))
    return (float(z) + float(box.mn_z), float(x) + float(box.mn_x), float(x) + float(box.mx_x), float(y) + float(box.mn_y), float(y) + float(box.mx_y))

  def _segment_points(self, *, face_idx: int, plane: float, u0: int, v0: int, u1: int, v1: int, eps: float) -> tuple[tuple[float, float, float], tuple[float, float, float]]:
    """
    face plane 上の lattice edge を world-space endpoint に戻し、face normal 方向へ符号付き epsilon だけ持ち上げる。
    block surface と同一深度にならないようにして z-fighting を避ける。
    """
    fu0 = float(u0) / 16.0
    fv0 = float(v0) / 16.0
    fu1 = float(u1) / 16.0
    fv1 = float(v1) / 16.0
    if int(face_idx) == 0:
      px = float(plane) + float(eps)
      return ((px, fu0, fv0), (px, fu1, fv1))
    if int(face_idx) == 1:
      px = float(plane) - float(eps)
      return ((px, fu0, fv0), (px, fu1, fv1))
    if int(face_idx) == 2:
      py = float(plane) + float(eps)
      return ((fu0, py, fv0), (fu1, py, fv1))
    if int(face_idx) == 3:
      py = float(plane) - float(eps)
      return ((fu0, py, fv0), (fu1, py, fv1))
    if int(face_idx) == 4:
      pz = float(plane) + float(eps)
      return ((fu0, fv0, pz), (fu1, fv1, pz))
    pz = float(plane) - float(eps)
    return ((fu0, fv0, pz), (fu1, fv1, pz))

  def build(self, *, x: int, y: int, z: int, state_str: str, get_state: GetState) -> np.ndarray:
    """
    block model の外部可視 face を 1/16 格子へ分割し、occupied cell の境界 edge だけを world-space segment として出力する。
    重複 segment は量子化 key により除去される。
    """
    seen: set[tuple[int, ...]] = set()
    out: list[tuple[float, float, float]] = []
    face_cells: dict[tuple[int, int], set[tuple[int, int]]] = defaultdict(set)

    eps = 0.002
    boxes = self._outline_boxes(str(state_str), get_state, self.def_lookup, int(x), int(y), int(z))
    if not boxes:
      return np.zeros((0, 3), dtype=np.float32)

    for box in boxes:
      for face_idx in range(6):
        if is_local_face_occluded(box=box, face_idx=int(face_idx), boxes=boxes):
          continue
        if is_block_face_occluded(x=int(x), y=int(y), z=int(z), box=box, face_idx=int(face_idx), get_state=get_state, def_lookup=self.def_lookup):
          continue

        plane, u0, u1, v0, v1 = self._plane_rect_for_face(box=box, face_idx=int(face_idx), x=int(x), y=int(y), z=int(z))
        u0i = self._quant_16(float(u0))
        u1i = self._quant_16(float(u1))
        v0i = self._quant_16(float(v0))
        v1i = self._quant_16(float(v1))
        if int(u1i) <= int(u0i) or int(v1i) <= int(v0i):
          continue
        face_cells[(int(face_idx), self._quant_16(float(plane)))].update((int(u), int(v)) for u in range(int(u0i), int(u1i)) for v in range(int(v0i), int(v1i)))

    for (face_idx, plane_q), cells in face_cells.items():
      plane = float(plane_q) / 16.0
      for u, v in cells:
        candidate_segments = []
        if (int(u) - 1, int(v)) not in cells:
          candidate_segments.append((int(u), int(v), int(u), int(v) + 1))
        if (int(u) + 1, int(v)) not in cells:
          candidate_segments.append((int(u) + 1, int(v), int(u) + 1, int(v) + 1))
        if (int(u), int(v) - 1) not in cells:
          candidate_segments.append((int(u), int(v), int(u) + 1, int(v)))
        if (int(u), int(v) + 1) not in cells:
          candidate_segments.append((int(u), int(v) + 1, int(u) + 1, int(v) + 1))

        for u0, v0, u1, v1 in candidate_segments:
          a, b = self._segment_points(face_idx=int(face_idx), plane=float(plane), u0=int(u0), v0=int(v0), u1=int(u1), v1=int(v1), eps=float(eps))
          key = self._edge_key(a, b)
          if key in seen:
            continue
          seen.add(key)
          out.append(a)
          out.append(b)

    if not out:
      return np.zeros((0, 3), dtype=np.float32)

    return np.asarray(out, dtype=np.float32)
