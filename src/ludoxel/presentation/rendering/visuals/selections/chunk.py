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
  chunk key と camera chunk を正規化したうえで、x, y, z の三軸に同一の render distance 半径を適用する chebyshev 判定で draw-visible 可否を返す。
  返値は `max(abs(dx), abs(dy), abs(dz)) <= render_distance_chunks` の真偽であり、ここで `(dx, dy, dz)` は chunk と camera chunk の各軸 chunk 距離である。
  水平方向と同様に垂直方向も render distance に比例させ、Y 軸だけを固定帯に制限しないため、camera の上昇・下降時にも resident chunk が draw pass の predicate で突然除外されない。
  world geometry の fog 終端は block 単位で `min(render_distance_chunks * CHUNK_SIZE, z_far)` であり常に `render_distance_chunks` chunk 以内に収まるため、この立方体は fog でまだ視認可能な距離にある geometry の chunk を draw 対象から落とさない。
  視錐台による棄却は `select_visible_chunks` 側の frustum clip が別途担い、この predicate は render distance policy のみを表す。
  """
  ck = normalize_chunk_key(chunk_key)
  cam = normalize_chunk_key(camera_chunk)
  rd = int(render_distance_chunks)

  dx = abs(int(ck[0]) - int(cam[0]))
  dy = abs(int(ck[1]) - int(cam[1]))
  dz = abs(int(ck[2]) - int(cam[2]))
  return (dx <= rd) and (dy <= rd) and (dz <= rd)


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
