# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.foundations.mathematics.chunks.grid import CHUNK_SIZE, ChunkKey, chunk_bounds


def chunk_corners_homogeneous(chunk_key: ChunkKey) -> np.ndarray:
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


def chunk_corners_homogeneous_batch(keys_xyz: np.ndarray) -> np.ndarray:
  keys = np.asarray(keys_xyz, dtype=np.float32).reshape(-1, 3)
  x0 = keys[:, 0] * float(CHUNK_SIZE)
  y0 = keys[:, 1] * float(CHUNK_SIZE)
  z0 = keys[:, 2] * float(CHUNK_SIZE)
  x1 = x0 + float(CHUNK_SIZE)
  y1 = y0 + float(CHUNK_SIZE)
  z1 = z0 + float(CHUNK_SIZE)

  n = int(keys.shape[0])
  ones = np.ones(n, dtype=np.float32)
  corners = np.empty((n, 8, 4), dtype=np.float32)
  corners[:, 0] = np.stack([x0, y0, z0, ones], axis=1)
  corners[:, 1] = np.stack([x1, y0, z0, ones], axis=1)
  corners[:, 2] = np.stack([x0, y1, z0, ones], axis=1)
  corners[:, 3] = np.stack([x1, y1, z0, ones], axis=1)
  corners[:, 4] = np.stack([x0, y0, z1, ones], axis=1)
  corners[:, 5] = np.stack([x1, y0, z1, ones], axis=1)
  corners[:, 6] = np.stack([x0, y1, z1, ones], axis=1)
  corners[:, 7] = np.stack([x1, y1, z1, ones], axis=1)
  return corners


def chunks_intersect_clip_volume_batch(keys_xyz: np.ndarray, matrix: np.ndarray) -> np.ndarray:
  keys = np.asarray(keys_xyz, dtype=np.int64).reshape(-1, 3)
  if int(keys.shape[0]) <= 0:
    return np.zeros((0,), dtype=bool)

  corners = chunk_corners_homogeneous_batch(keys)
  clip = corners @ matrix.astype(np.float32, copy=False).T

  xs = clip[:, :, 0]
  ys = clip[:, :, 1]
  zs = clip[:, :, 2]
  ws = clip[:, :, 3]

  outside = np.all(xs < -ws, axis=1) | np.all(xs > ws, axis=1) | np.all(ys < -ws, axis=1) | np.all(ys > ws, axis=1) | np.all(zs < -ws, axis=1) | np.all(zs > ws, axis=1)
  return ~outside
