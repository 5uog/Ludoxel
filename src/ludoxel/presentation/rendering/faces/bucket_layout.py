# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Sequence

import numpy as np

FACE_COUNT = 6
BucketCounts = tuple[int, int, int, int, int, int]


def normalize_bucket_counts(bucket_counts: Sequence[int]) -> BucketCounts:
  """
  六つの voxel face に対応する count 列を正規化する。
  各成分は `max(0, int(c_i))` とし、不足分は 0 で埋め、七番目以降は捨てることで、
  全 renderer bucket が同じ face 順序を共有する。
  """
  vals = tuple(int(max(0, int(v))) for v in tuple(bucket_counts)[:FACE_COUNT])
  if len(vals) < FACE_COUNT:
    vals = vals + (0,) * (FACE_COUNT - len(vals))
  return (int(vals[0]), int(vals[1]), int(vals[2]), int(vals[3]), int(vals[4]), int(vals[5]))


def bucket_offsets(bucket_counts: Sequence[int]) -> BucketCounts:
  """
  正規化された六 face count から prefix offset を作る。
  各 offset は `O_i = Σ_{k<i} c_k` であり、平坦 payload から face-local な連続領域を取り出す基準になる。
  """
  c0, c1, c2, c3, c4, _c5 = normalize_bucket_counts(bucket_counts)
  return (0, int(c0), int(c0 + c1), int(c0 + c1 + c2), int(c0 + c1 + c2 + c3), int(c0 + c1 + c2 + c3 + c4))


def empty_face_bucket_arrays(row_width: int, *, dtype: object = np.float32) -> list[np.ndarray]:
  """
  六 face それぞれに対して、行数 0、列数 `max(0, row_width)` の `float32` 配列を作る。
  空 payload でも shape と dtype を固定することで、upload 側の分岐を減らす。
  """
  width = int(max(0, int(row_width)))
  return [np.zeros((0, width), dtype=dtype) for _ in range(FACE_COUNT)]
