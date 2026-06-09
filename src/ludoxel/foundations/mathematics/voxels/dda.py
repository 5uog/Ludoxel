# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


@dataclass(frozen=True)
class DDAHit:
  """
  voxel grid traversal の各 step で訪問された cell と ray parameter を保持する。
  `cell_x`、`cell_y`、`cell_z` は grid cell index、`t` は `origin + direction * t` の parameter、
  `enter_face` は直前境界を越えて現在 cell に入った face index 又は開始 cell を表す -1 である。
  """

  cell_x: int
  cell_y: int
  cell_z: int
  t: float
  enter_face: int = -1


def dda_grid_traverse(origin: Vec3, direction: Vec3, t_max: float, cell_size: float = 1.0):
  """
  ray が通過する voxel cell を Amanatides-Woo 型の DDA で順に生成する。
  `origin` と `direction` は同じ world 座標系の `Vec3`、`cell_size` は正の grid 間隔として扱われ、direction が零 vector の場合は何も yield しない。
  この Python source は native extension build の対象でもあり、block picking と third-person camera collision は traversal 順序と face index の同じ契約に依存する。
  """
  d = direction
  if abs(d.x) < 1e-12 and abs(d.y) < 1e-12 and abs(d.z) < 1e-12:
    return

  x = math.floor(origin.x / cell_size)
  y = math.floor(origin.y / cell_size)
  z = math.floor(origin.z / cell_size)

  step_x = 1 if d.x > 0 else -1
  step_y = 1 if d.y > 0 else -1
  step_z = 1 if d.z > 0 else -1

  def int_bound(s: float, ds: float) -> float:
    """
    現在位置から次の整数 grid 境界までの ray parameter 増分を一軸について計算する。
    `ds > 0` では上側境界までの距離、`ds <= 0` では下側境界までの距離を返し、DDA の `tmx`、`tmy`、`tmz` 初期値を決定する。
    """
    if ds > 0:
      s = s - math.floor(s)
      return (1.0 - s) / ds
    else:
      s = s - math.floor(s)
      return s / (-ds)

  tmx = int_bound(origin.x / cell_size, d.x) if abs(d.x) > 1e-12 else 1e30
  tmy = int_bound(origin.y / cell_size, d.y) if abs(d.y) > 1e-12 else 1e30
  tmz = int_bound(origin.z / cell_size, d.z) if abs(d.z) > 1e-12 else 1e30

  tdx = (cell_size / abs(d.x)) if abs(d.x) > 1e-12 else 1e30
  tdy = (cell_size / abs(d.y)) if abs(d.y) > 1e-12 else 1e30
  tdz = (cell_size / abs(d.z)) if abs(d.z) > 1e-12 else 1e30

  t = 0.0
  enter_face = -1

  while t <= t_max:
    yield DDAHit(int(x), int(y), int(z), float(t), int(enter_face))

    if tmx < tmy and tmx < tmz:
      x += step_x
      t = tmx
      tmx += tdx
      enter_face = 1 if step_x > 0 else 0
    elif tmy < tmz:
      y += step_y
      t = tmy
      tmy += tdy
      enter_face = 3 if step_y > 0 else 2
    else:
      z += step_z
      t = tmz
      tmz += tdz
      enter_face = 5 if step_z > 0 else 4
