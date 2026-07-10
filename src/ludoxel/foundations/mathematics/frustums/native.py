# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.foundations.mathematics.frustums import clip as _fallback

try:
  from ludoxel.foundations.mathematics.frustums import _frustum_native as _native_module  # type: ignore[attr-defined]
except ImportError:
  _native_module = None


def native_frustum_available() -> bool:
  return _native_module is not None


def native_frustum_module_file() -> str | None:
  if _native_module is None:
    return None
  return str(getattr(_native_module, "__file__", "")) or None


def native_frustum_status() -> str:
  if _native_module is None:
    return "fallback:python"
  return f"native:rust:{native_frustum_module_file()}"


def chunks_intersect_clip_volume_batch(keys_xyz: np.ndarray, matrix: np.ndarray) -> np.ndarray:
  keys = np.asarray(keys_xyz, dtype=np.int64).reshape(-1, 3)
  count = int(keys.shape[0])
  if count <= 0:
    return np.zeros((0,), dtype=bool)

  if _native_module is None:
    return _fallback.chunks_intersect_clip_volume_batch(keys, matrix)

  keys_bytes = np.ascontiguousarray(keys, dtype="<i8").tobytes()
  matrix_bytes = np.ascontiguousarray(matrix, dtype="<f4").tobytes()
  raw = _native_module.chunks_intersect_clip_volume_batch(keys_bytes, matrix_bytes, count)
  return np.frombuffer(raw, dtype=np.bool_).copy()
