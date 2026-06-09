# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterable

import numpy as np

from ludoxel.presentation.rendering.faces.chunk_payload_sources import BucketCounts, build_chunk_face_sources, split_face_sources_to_buckets
from ludoxel.presentation.rendering.snapshots.dto import DefLookup, GetState, UVLookup


def _clone_face_buckets(face_buckets: list[np.ndarray]) -> list[np.ndarray]:
  """
  六 face bucket の各 ndarray を個別に複製する。
  可視 mesh と shadow mesh が同じ幾何を参照しつつ、後続処理で同一 storage を共有しないことを保証する。
  """
  return [np.array(bucket, dtype=np.float32, copy=True, order="C") for bucket in face_buckets]


def build_chunk_face_payload_sources(*, blocks: Iterable[tuple[int, int, int, str]], get_state: GetState, uv_lookup: UVLookup, def_lookup: DefLookup) -> tuple[np.ndarray, BucketCounts]:
  """
  chunk 内 block から face-source 行列と face bucket count を構築する公開入口である。
  返値は `N x 14` の source row と六 face count に限定され、後段の bucket materialization へ依存しない。
  """
  return build_chunk_face_sources(blocks=blocks, get_state=get_state, uv_lookup=uv_lookup, def_lookup=def_lookup)


def build_chunk_mesh_cpu(*, blocks: Iterable[tuple[int, int, int, str]], get_state: GetState, uv_lookup: UVLookup, def_lookup: DefLookup) -> tuple[list[np.ndarray], list[np.ndarray]]:
  """
  face-source payload を六 face の mesh bucket へ分割し、同じ幾何から shadow 用 bucket を独立 storage として複製する。
  可視経路と影経路は同じ face 集合を使うが、以後の mutation policy を共有しない。
  """
  face_sources, bucket_counts = build_chunk_face_payload_sources(blocks=blocks, get_state=get_state, uv_lookup=uv_lookup, def_lookup=def_lookup)
  faces_np = split_face_sources_to_buckets(face_sources, bucket_counts)
  shadow_faces_np = _clone_face_buckets(faces_np)
  return faces_np, shadow_faces_np
