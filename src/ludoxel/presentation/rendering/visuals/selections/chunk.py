# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable, Iterable

import numpy as np

from ludoxel.foundations.mathematics.chunks.grid import ChunkKey, normalize_chunk_key
from ludoxel.foundations.mathematics.frustums.clip import chunk_intersects_clip_volume

ChunkPredicate = Callable[[ChunkKey], bool]


def within_render_distance(chunk_key: ChunkKey, camera_chunk: ChunkKey, render_distance_chunks: int) -> bool:
  """
  chunk key と camera chunk を正規化したうえで、水平距離を render distance、垂直距離を固定範囲 `|dy| <= 1` によって判定する。
  renderer は水平方向だけを設定可能距離とし、垂直方向は局所作業帯に制限する。
  """
  ck = normalize_chunk_key(chunk_key)
  cam = normalize_chunk_key(camera_chunk)
  rd = int(render_distance_chunks)

  dx = abs(int(ck[0]) - int(cam[0]))
  dy = abs(int(ck[1]) - int(cam[1]))
  dz = abs(int(ck[2]) - int(cam[2]))
  return (dx <= rd) and (dy <= 1) and (dz <= rd)


def select_visible_chunks(chunk_keys: Iterable[ChunkKey], matrix: np.ndarray, *, predicate: ChunkPredicate | None = None) -> list[ChunkKey]:
  """
  chunk key 列を正規化し、render-distance 等の任意 predicate と frustum clip を通過したものだけを返す。
  traversal state を持たない純粋選択にして、frustum rejection と policy filter を合成可能にする。
  """
  out: list[ChunkKey] = []

  for chunk_key in chunk_keys:
    ck = normalize_chunk_key(chunk_key)

    if predicate is not None and (not bool(predicate(ck))):
      continue

    if not chunk_intersects_clip_volume(ck, matrix):
      continue

    out.append(ck)

  return out
