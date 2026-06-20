# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterable

import numpy as np

from ludoxel.presentation.rendering.contracts.lookups import DefLookup, GetState, UVLookup
from ludoxel.presentation.rendering.faces.chunk_payload_sources import BucketCounts, build_chunk_face_sources, split_face_sources_to_buckets


def _clone_face_buckets(face_buckets: list[np.ndarray]) -> list[np.ndarray]:
  return [np.array(bucket, dtype=np.float32, copy=True, order="C") for bucket in face_buckets]


def build_chunk_face_payload_sources(*, blocks: Iterable[tuple[int, int, int, str]], get_state: GetState, uv_lookup: UVLookup, def_lookup: DefLookup) -> tuple[np.ndarray, BucketCounts]:
  return build_chunk_face_sources(blocks=blocks, get_state=get_state, uv_lookup=uv_lookup, def_lookup=def_lookup)


def build_chunk_mesh_cpu(*, blocks: Iterable[tuple[int, int, int, str]], get_state: GetState, uv_lookup: UVLookup, def_lookup: DefLookup) -> tuple[list[np.ndarray], list[np.ndarray]]:
  face_sources, bucket_counts = build_chunk_face_payload_sources(blocks=blocks, get_state=get_state, uv_lookup=uv_lookup, def_lookup=def_lookup)
  faces_np = split_face_sources_to_buckets(face_sources, bucket_counts)
  shadow_faces_np = _clone_face_buckets(faces_np)
  return faces_np, shadow_faces_np
