# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import Set, Tuple

CHUNK_SIZE: int = 16
ChunkKey = Tuple[int, int, int]


def normalize_chunk_key(k: ChunkKey) -> ChunkKey:
  """
  chunk key を三成分の整数 tuple として正規化する。
  入力 tuple の各成分は `int` へ変換され、world state、renderer upload、
  frustum culling が共有する `ChunkKey = (cx, cy, cz)` の key 安定性を保つ。
  """
  return (int(k[0]), int(k[1]), int(k[2]))


def chunk_key(x: int, y: int, z: int) -> ChunkKey:
  """
  block 又は cell の world 座標を `CHUNK_SIZE = 16` の chunk 座標へ写像する。
  各軸で Python の床除算 `coord // 16` を用いるため、
  負座標は 0 方向へ丸められず数学的な floor division と同じ chunk に割り当てられる。
  """
  return (int(x) // CHUNK_SIZE, int(y) // CHUNK_SIZE, int(z) // CHUNK_SIZE)


def chunk_bounds(k: ChunkKey) -> tuple[int, int, int, int, int, int]:
  """
  chunk key に対応する半開直方体範囲を world cell 座標で返す。
  返値は `(x0, x1, y0, y1, z0, z1)` であり、各軸は `[c * 16, c * 16 + 16)` を表すため、
  frustum corner 生成と renderer の chunk 範囲判定が同じ境界を使う。
  """
  cx, cy, cz = normalize_chunk_key(k)
  x0 = cx * CHUNK_SIZE
  y0 = cy * CHUNK_SIZE
  z0 = cz * CHUNK_SIZE
  return (x0, x0 + CHUNK_SIZE, y0, y0 + CHUNK_SIZE, z0, z0 + CHUNK_SIZE)


def neighbor_chunk_keys_for_cell(x: int, y: int, z: int) -> Set[ChunkKey]:
  """
  指定 cell を変更したときに再評価が必要になる chunk key 集合を返す。
  cell が chunk 内 local 座標 0 又は 15 に位置する軸では隣接 chunk を追加し、
  world state の dirty chunk 登録は境界面の可視性が変化する隣接 chunk を取り落とさない。
  """
  xi = int(x)
  yi = int(y)
  zi = int(z)
  cx, cy, cz = chunk_key(xi, yi, zi)
  keys: Set[ChunkKey] = {(int(cx), int(cy), int(cz))}

  lx = int(xi - int(cx) * CHUNK_SIZE)
  ly = int(yi - int(cy) * CHUNK_SIZE)
  lz = int(zi - int(cz) * CHUNK_SIZE)

  if int(lx) <= 0:
    keys.add((int(cx) - 1, int(cy), int(cz)))
  if int(lx) >= int(CHUNK_SIZE - 1):
    keys.add((int(cx) + 1, int(cy), int(cz)))
  if int(ly) <= 0:
    keys.add((int(cx), int(cy) - 1, int(cz)))
  if int(ly) >= int(CHUNK_SIZE - 1):
    keys.add((int(cx), int(cy) + 1, int(cz)))
  if int(lz) <= 0:
    keys.add((int(cx), int(cy), int(cz) - 1))
  if int(lz) >= int(CHUNK_SIZE - 1):
    keys.add((int(cx), int(cy), int(cz) + 1))
  return keys
