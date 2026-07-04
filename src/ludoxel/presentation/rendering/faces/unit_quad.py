# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


def _textured_face_vertices(nx: int, ny: int, nz: int, corners: tuple[tuple[float, float, float], ...]) -> list[tuple[float, ...]]:
  a, b, c, d = corners
  return [(*a, nx, ny, nz, 0.0, 0.0), (*b, nx, ny, nz, 1.0, 0.0), (*c, nx, ny, nz, 1.0, 1.0), (*a, nx, ny, nz, 0.0, 0.0), (*c, nx, ny, nz, 1.0, 1.0), (*d, nx, ny, nz, 0.0, 1.0)]


def _unit_face_corners(face_idx: int) -> tuple[tuple[int, int, int], tuple[tuple[float, float, float], ...]]:
  p = 0.5
  face = int(face_idx)
  if face == 0:
    return (1, 0, 0), ((p, -p, -p), (p, -p, p), (p, p, p), (p, p, -p))
  if face == 1:
    return (-1, 0, 0), ((-p, -p, p), (-p, -p, -p), (-p, p, -p), (-p, p, p))
  if face == 2:
    return (0, 1, 0), ((-p, p, -p), (p, p, -p), (p, p, p), (-p, p, p))
  if face == 3:
    return (0, -1, 0), ((-p, -p, p), (p, -p, p), (p, -p, -p), (-p, -p, -p))
  if face == 4:
    return (0, 0, 1), ((p, -p, p), (-p, -p, p), (-p, p, p), (p, p, p))
  return (0, 0, -1), ((-p, -p, -p), (p, -p, -p), (p, p, -p), (-p, p, -p))


def textured_unit_face_vertices(face_idx: int) -> list[tuple[float, ...]]:
  (nx, ny, nz), corners = _unit_face_corners(int(face_idx))
  return _textured_face_vertices(nx, ny, nz, corners)


def textured_unit_face_wire_vertices(face_idx: int) -> list[tuple[float, ...]]:
  # Four edges of one unit-cube face as a line list (eight vertices), for
  # drawing the merged cloud silhouette without internal faces.
  (nx, ny, nz), corners = _unit_face_corners(int(face_idx))
  a, b, c, d = corners
  rows: list[tuple[float, ...]] = []
  for start, end in ((a, b), (b, c), (c, d), (d, a)):
    rows.append((*start, nx, ny, nz, 0.0, 0.0))
    rows.append((*end, nx, ny, nz, 0.0, 0.0))
  return rows
