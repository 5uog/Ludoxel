# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.foundations.mathematics.chunks.grid import ChunkKey, chunk_bounds


def chunk_corners_homogeneous(chunk_key: ChunkKey) -> np.ndarray:
  """
  chunk の八頂点を homogeneous coordinate の `np.float32` 配列として生成する。
  返値 shape は `(8, 4)`、各 row は `(x, y, z, 1)` であり、
  座標範囲は `chunk_bounds` の半開境界の下端と上端を用いる。
  """
  x0, x1, y0, y1, z0, z1 = chunk_bounds(chunk_key)
  return np.asarray(
    [
      [float(x0), float(y0), float(z0), 1.0],
      [float(x1), float(y0), float(z0), 1.0],
      [float(x0), float(y1), float(z0), 1.0],
      [float(x1), float(y1), float(z0), 1.0],
      [float(x0), float(y0), float(z1), 1.0],
      [float(x1), float(y0), float(z1), 1.0],
      [float(x0), float(y1), float(z1), 1.0],
      [float(x1), float(y1), float(z1), 1.0],
    ],
    dtype=np.float32,
  )


def chunk_intersects_clip_volume(chunk_key: ChunkKey, matrix: np.ndarray) -> bool:
  """
  chunk AABB が与えられた clip matrix の正規化前 clip volume と交差し得るかを保守的に判定する。
  `matrix @ corners.T` により shape `(8, 4)` の clip 座標を作り、
  全頂点が同一平面の外側 `x < -w`、`x > w`、`y < -w`、`y > w`、`z < -w`、`z > w` にある場合だけ非交差とする。
  """
  corners = chunk_corners_homogeneous(chunk_key)
  clip = (matrix.astype(np.float32, copy=False) @ corners.T).T

  xs = clip[:, 0]
  ys = clip[:, 1]
  zs = clip[:, 2]
  ws = clip[:, 3]

  if bool(np.all(xs < (-ws))):
    return False
  if bool(np.all(xs > ws)):
    return False
  if bool(np.all(ys < (-ws))):
    return False
  if bool(np.all(ys > ws)):
    return False
  if bool(np.all(zs < (-ws))):
    return False
  if bool(np.all(zs > ws)):
    return False

  return True
