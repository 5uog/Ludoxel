# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Mapping

import numpy as np

from ludoxel.foundations.mathematics.linear.transform_matrices import compose_matrices, scale_matrix, translate_matrix
from ludoxel.presentation.rendering.faces.uv_rects import UVRect, fence_gate_uv_rect, sub_uv_rect
from ludoxel.simulation.blocks.models.common import LocalBox


def empty_textured_face_rows() -> tuple[np.ndarray, ...]:
  return tuple(np.zeros((0, 20), dtype=np.float32) for _ in range(6))


def append_face_instance(buffers: list[list[list[float]]], face_idx: int, model: np.ndarray, uv_rect: UVRect) -> None:
  row = list(np.asarray(model, dtype=np.float32).reshape(16))
  row.extend([float(uv_rect[0]), float(uv_rect[1]), float(uv_rect[2]), float(uv_rect[3])])
  buffers[int(face_idx)].append(row)


def face_rows_from_buffers(buffers: list[list[list[float]]]) -> tuple[np.ndarray, ...]:
  return tuple(np.asarray(face_rows, dtype=np.float32) if face_rows else np.zeros((0, 20), dtype=np.float32) for face_rows in buffers)


def uv_rect_from_pixels(texture_uv: UVRect, px_rect: tuple[float, float, float, float], *, texture_size_px: float = 16.0) -> UVRect:
  u0_a, v0_a, u1_a, v1_a = texture_uv
  px0, py0, px1, py1 = px_rect
  scale = max(float(texture_size_px), 1.0)
  return (float(u0_a + (u1_a - u0_a) * (float(px0) / scale)), float(v0_a + (v1_a - v0_a) * (float(py0) / scale)), float(u0_a + (u1_a - u0_a) * (float(px1) / scale)), float(v0_a + (v1_a - v0_a) * (float(py1) / scale)))


def skin_uv_rect(px_rect: tuple[float, float, float, float], *, width: int, height: int) -> UVRect:
  px0, py0, px1, py1 = px_rect
  w = max(1.0, float(width))
  h = max(1.0, float(height))
  return (float(px0) / w, 1.0 - float(py1) / h, float(px1) / w, 1.0 - float(py0) / h)


def atlas_face_uv(texture_uv: UVRect, face_idx: int, box: LocalBox, *, kind: str | None = None, face_uv_pixels: Mapping[int, tuple[float, float, float, float]] | None = None) -> UVRect:
  if face_uv_pixels is not None:
    px_rect = face_uv_pixels.get(int(face_idx))
    if px_rect is not None:
      return uv_rect_from_pixels(texture_uv, px_rect)

  normalized_kind = "" if kind is None else str(kind).strip().lower()
  if normalized_kind == "fence_gate" and bool(box.uv_hint):
    return fence_gate_uv_rect(texture_uv, int(face_idx), box)
  return sub_uv_rect(texture_uv, int(face_idx), box)


def model_matrix_for_local_box(parent_transform: np.ndarray, box: LocalBox) -> np.ndarray:
  center_x = 0.5 * (float(box.mn_x) + float(box.mx_x))
  center_y = 0.5 * (float(box.mn_y) + float(box.mx_y))
  center_z = 0.5 * (float(box.mn_z) + float(box.mx_z))
  size_x = float(box.mx_x) - float(box.mn_x)
  size_y = float(box.mx_y) - float(box.mn_y)
  size_z = float(box.mx_z) - float(box.mn_z)
  return compose_matrices(parent_transform, translate_matrix(center_x, center_y, center_z), scale_matrix(size_x, size_y, size_z))
