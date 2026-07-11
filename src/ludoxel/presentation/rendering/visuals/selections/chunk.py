# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable, Iterable

import numpy as np

from ludoxel.foundations.mathematics.chunks.grid import ChunkKey, normalize_chunk_key
from ludoxel.foundations.mathematics.frustums.native import chunks_intersect_clip_volume_batch

ChunkPredicate = Callable[[ChunkKey], bool]


def within_render_distance(chunk_key: ChunkKey, camera_chunk: ChunkKey, render_distance_chunks: int) -> bool:
  ck = normalize_chunk_key(chunk_key)
  cam = normalize_chunk_key(camera_chunk)
  rd = int(render_distance_chunks)

  dx = abs(int(ck[0]) - int(cam[0]))
  dz = abs(int(ck[2]) - int(cam[2]))
  return (dx <= rd) and (dz <= rd)


def select_visible_chunks(chunk_keys: Iterable[ChunkKey], matrix: np.ndarray, *, predicate: ChunkPredicate | None = None) -> list[ChunkKey]:
  candidates: list[ChunkKey] = []
  for chunk_key in chunk_keys:
    ck = normalize_chunk_key(chunk_key)
    if predicate is not None and (not bool(predicate(ck))):
      continue
    candidates.append(ck)

  if not candidates:
    return []

  keys_xyz = np.asarray(candidates, dtype=np.int64)
  visible_mask = chunks_intersect_clip_volume_batch(keys_xyz, matrix)
  return [ck for ck, keep in zip(candidates, visible_mask.tolist()) if bool(keep)]
