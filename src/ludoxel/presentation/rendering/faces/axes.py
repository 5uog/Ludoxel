# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.blocks.models.common import LocalBox

FACE_EPSILON = 1e-7


def approx_eq(a: float, b: float) -> bool:
  """
  `|a - b| <= FACE_EPSILON` を同値近似として用いる境界判定である。
  model 分解や affine 合成で生じる微小誤差により、face が voxel 境界から外れたと誤判定されることを防ぐ。
  """
  return abs(float(a) - float(b)) <= FACE_EPSILON


def face_touches_cell_boundary(face_idx: int, box: LocalBox) -> bool:
  """
  指定 face が local box の属する単位 cell 境界に接しているかを判定する。
  境界に達した face だけが隣接 voxel による occlusion の対象となり、内部 face は block 内の幾何関係だけで扱われる。
  """
  fi = int(face_idx)

  if fi == 0:
    return approx_eq(float(box.mx_x), 1.0)
  if fi == 1:
    return approx_eq(float(box.mn_x), 0.0)
  if fi == 2:
    return approx_eq(float(box.mx_y), 1.0)
  if fi == 3:
    return approx_eq(float(box.mn_y), 0.0)
  if fi == 4:
    return approx_eq(float(box.mx_z), 1.0)
  return approx_eq(float(box.mn_z), 0.0)


def face_rect(face_idx: int, box: LocalBox) -> tuple[float, float, float, float]:
  """
  指定 face をその face 固有の二次元座標平面へ射影した矩形として返す。
  local occlusion と neighbor occlusion は、この矩形上の被覆問題として処理される。
  """
  fi = int(face_idx)

  if fi in (0, 1):
    return (float(box.mn_y), float(box.mx_y), float(box.mn_z), float(box.mx_z))
  if fi in (2, 3):
    return (float(box.mn_x), float(box.mx_x), float(box.mn_z), float(box.mx_z))

  return (float(box.mn_x), float(box.mx_x), float(box.mn_y), float(box.mx_y))
