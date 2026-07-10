# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterable

import numpy as np

from ludoxel.presentation.rendering.contracts.lookups import DefLookup, GetState, WorldUVLookup
from ludoxel.presentation.rendering.faces.bucket_layout import FACE_COUNT, BucketCounts, empty_face_bucket_arrays, normalize_bucket_counts
from ludoxel.presentation.rendering.faces.row_utils import atlas_face_uv
from ludoxel.presentation.rendering.faces.visible import iter_visible_faces
from ludoxel.simulation.blocks.states.codec import parse_state

FACE_SOURCE_ROW_FLOATS: int = 14
FACE_INSTANCE_ROW_FLOATS: int = 12
FACE_SOURCE_FACE_INDEX_COLUMN: int = 12
FACE_SOURCE_SLOT_COLUMN: int = 13
FACE_SOURCE_FULL_BRIGHTNESS: float = 1.0


def _as_face_source_rows(face_sources: np.ndarray) -> np.ndarray:
  arr = np.asarray(face_sources, dtype=np.float32)
  if arr.ndim != 2 or int(arr.shape[1]) != FACE_SOURCE_ROW_FLOATS:
    raise ValueError(f"face_sources must be a float32 Nx{FACE_SOURCE_ROW_FLOATS} array")
  if not arr.flags["C_CONTIGUOUS"]:
    arr = np.ascontiguousarray(arr, dtype=np.float32)
  return arr


def empty_face_buckets() -> list[np.ndarray]:
  return empty_face_bucket_arrays(FACE_INSTANCE_ROW_FLOATS)


def split_face_sources_to_buckets(face_sources: np.ndarray, bucket_counts: BucketCounts) -> list[np.ndarray]:
  counts = normalize_bucket_counts(bucket_counts)
  out = [np.zeros((int(c), FACE_INSTANCE_ROW_FLOATS), dtype=np.float32) for c in counts]

  if face_sources.size <= 0:
    return out

  src = _as_face_source_rows(face_sources)

  for row in src:
    fi = int(round(float(row[FACE_SOURCE_FACE_INDEX_COLUMN])))
    slot = int(round(float(row[FACE_SOURCE_SLOT_COLUMN])))

    if fi < 0 or fi >= FACE_COUNT:
      continue
    if slot < 0 or slot >= int(counts[fi]):
      continue

    out[fi][slot, :] = row[:FACE_INSTANCE_ROW_FLOATS]

  return out


def build_chunk_face_sources(*, blocks: Iterable[tuple[int, int, int, str]], get_state: GetState, uv_lookup: WorldUVLookup, def_lookup: DefLookup) -> tuple[np.ndarray, BucketCounts]:
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

      atlas, uv_rotation_steps = uv_lookup(int(x), int(y), int(z), str(state_str), int(fi))
      u0, v0, u1, v1 = atlas_face_uv(atlas, int(fi), face.box, kind=(None if defn is None else str(defn.kind)))

      rows.append([float(mnx), float(mny), float(mnz), float(mxx), float(mxy), float(mxz), float(u0), float(v0), float(u1), float(v1), FACE_SOURCE_FULL_BRIGHTNESS, float(uv_rotation_steps), float(fi), float(slot)])

  counts = normalize_bucket_counts(bucket_counts)

  if not rows:
    return np.zeros((0, FACE_SOURCE_ROW_FLOATS), dtype=np.float32), counts

  return np.asarray(rows, dtype=np.float32), counts
