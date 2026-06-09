# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterable

import numpy as np

from ludoxel.presentation.rendering.faces.bucket_layout import FACE_COUNT, BucketCounts, empty_face_bucket_arrays, normalize_bucket_counts
from ludoxel.presentation.rendering.faces.row_utils import atlas_face_uv
from ludoxel.presentation.rendering.faces.visible import iter_visible_faces
from ludoxel.presentation.rendering.snapshots.dto import DefLookup, GetState, UVLookup
from ludoxel.simulation.blocks.states.codec import parse_state


def _as_face_source_rows(face_sources: np.ndarray) -> np.ndarray:
  """
  face source 入力を contiguous な `float32` 配列へ整える。
  shape は `N x 14` であり、bounds、UV、flags、face index、slot という行 schema が後続の bucket split によって参照される。
  """
  arr = np.asarray(face_sources, dtype=np.float32)
  if arr.ndim != 2 or int(arr.shape[1]) != 14:
    raise ValueError("face_sources must be a float32 Nx14 array")
  if not arr.flags["C_CONTIGUOUS"]:
    arr = np.ascontiguousarray(arr, dtype=np.float32)
  return arr


def empty_face_buckets() -> list[np.ndarray]:
  """
  metadata 列を落とした後の split face-source bucket として、六つの `0 x 12` 配列を返す。
  空 chunk でも renderer upload layout の shape と face 順序を保つ。
  """
  return empty_face_bucket_arrays(12)


def split_face_sources_to_buckets(face_sources: np.ndarray, bucket_counts: BucketCounts) -> list[np.ndarray]:
  """
  flat source row を face index と slot に従って六つの bucket へ散布する。
  `row[12] = i`、`row[13] = s` のとき `B_i[s, :] = row[:12]` となり、未使用 slot は 0 のまま残る。
  """
  counts = normalize_bucket_counts(bucket_counts)
  out = [np.zeros((int(c), 12), dtype=np.float32) for c in counts]

  if face_sources.size <= 0:
    return out

  src = _as_face_source_rows(face_sources)

  for row in src:
    fi = int(round(float(row[12])))
    slot = int(round(float(row[13])))

    if fi < 0 or fi >= FACE_COUNT:
      continue
    if slot < 0 or slot >= int(counts[fi]):
      continue

    out[fi][slot, :] = row[:12]

  return out


def build_chunk_face_sources(*, blocks: Iterable[tuple[int, int, int, str]], get_state: GetState, uv_lookup: UVLookup, def_lookup: DefLookup) -> tuple[np.ndarray, BucketCounts]:
  """
  chunk iterator から可視 face を列挙し、`(mn, mx, uv, 1, 0, face_idx, slot)` の source row と六 face count を作る。
  visibility walk はここで一度だけ行い、後段は純粋な配列再配置として扱う。
  """
  rows: list[list[float]] = []
  bucket_counts = [0 for _ in range(FACE_COUNT)]

  for x, y, z, state_str in blocks:
    x = int(x)
    y = int(y)
    z = int(z)

    base, _p = parse_state(str(state_str))
    defn = def_lookup(str(base))

    for face in iter_visible_faces(x=int(x), y=int(y), z=int(z), state_str=str(state_str), get_state=get_state, def_lookup=def_lookup, fast_boundary_full_cube_only=True):
      fi = int(face.face_idx)
      if fi < 0 or fi >= FACE_COUNT:
        continue

      slot = int(bucket_counts[fi])
      bucket_counts[fi] += 1

      mnx, mny, mnz = face.mn
      mxx, mxy, mxz = face.mx

      atlas = uv_lookup(str(state_str), int(fi))
      u0, v0, u1, v1 = atlas_face_uv(atlas, int(fi), face.box, kind=(None if defn is None else str(defn.kind)))

      rows.append([float(mnx), float(mny), float(mnz), float(mxx), float(mxy), float(mxz), float(u0), float(v0), float(u1), float(v1), 1.0, 0.0, float(fi), float(slot)])

  counts = normalize_bucket_counts(bucket_counts)

  if not rows:
    return np.zeros((0, 14), dtype=np.float32), counts

  return np.asarray(rows, dtype=np.float32), counts
