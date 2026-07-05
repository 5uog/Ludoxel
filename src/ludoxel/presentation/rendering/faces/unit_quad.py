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
  # Line list of the face's two triangles' edges: the four perimeter edges
  # plus the shared triangulation diagonal (twelve vertices, six segments).
  # The two triangles are (a, b, c) and (a, c, d), the same split as
  # textured_unit_face_vertices, so their edges are (a, b), (b, c), (c, a),
  # (a, c), (c, d), (d, a). World blocks in wireframe mode render their
  # triangulated faces in line polygon mode and show exactly this diagonal;
  # emitting it here gives the merged cloud silhouette the same edge on both
  # the OpenGL and WGPU line paths, which share this vertex list.
  (nx, ny, nz), corners = _unit_face_corners(int(face_idx))
  a, b, c, d = corners
  rows: list[tuple[float, ...]] = []
  for start, end in ((a, b), (b, c), (c, a), (a, c), (c, d), (d, a)):
    rows.append((*start, nx, ny, nz, 0.0, 0.0))
    rows.append((*end, nx, ny, nz, 0.0, 0.0))
  return rows
