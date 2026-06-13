# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


def _textured_face_vertices(nx: int, ny: int, nz: int, corners: tuple[tuple[float, float, float], ...]) -> list[tuple[float, ...]]:
  a, b, c, d = corners
  return [(*a, nx, ny, nz, 0.0, 0.0), (*b, nx, ny, nz, 1.0, 0.0), (*c, nx, ny, nz, 1.0, 1.0), (*a, nx, ny, nz, 0.0, 0.0), (*c, nx, ny, nz, 1.0, 1.0), (*d, nx, ny, nz, 0.0, 1.0)]


def textured_unit_face_vertices(face_idx: int) -> list[tuple[float, ...]]:
  p = 0.5
  face = int(face_idx)
  if face == 0:
    return _textured_face_vertices(1, 0, 0, ((p, -p, -p), (p, -p, p), (p, p, p), (p, p, -p)))
  if face == 1:
    return _textured_face_vertices(-1, 0, 0, ((-p, -p, p), (-p, -p, -p), (-p, p, -p), (-p, p, p)))
  if face == 2:
    return _textured_face_vertices(0, 1, 0, ((-p, p, -p), (p, p, -p), (p, p, p), (-p, p, p)))
  if face == 3:
    return _textured_face_vertices(0, -1, 0, ((-p, -p, p), (p, -p, p), (p, -p, -p), (-p, -p, -p)))
  if face == 4:
    return _textured_face_vertices(0, 0, 1, ((p, -p, p), (-p, -p, p), (-p, p, p), (p, p, p)))
  return _textured_face_vertices(0, 0, -1, ((-p, -p, -p), (p, -p, -p), (p, p, -p), (-p, p, -p)))
