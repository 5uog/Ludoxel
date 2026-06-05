# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from ludoxel.shared.math.chunking.chunking_chunk_grid import ChunkKey, normalize_chunk_key
from ludoxel.shared.rendering.faces.faces_face_bucket_layout import FACE_COUNT

_INSTANCE_ROW_WIDTH = 12
_TRANSFORM_ROW_WIDTH = 20


@dataclass
class WgpuFaceInstances:
  instance_buffer: object
  instance_count: int

  def destroy(self) -> None:
    if hasattr(self.instance_buffer, "destroy"):
      self.instance_buffer.destroy()


@dataclass
class WgpuChunkMesh:
  chunk_key: ChunkKey
  world_revision: int
  faces: tuple[WgpuFaceInstances | None, ...]

  def destroy(self) -> None:
    for face in self.faces:
      if face is not None:
        face.destroy()

  def face(self, face_idx: int) -> WgpuFaceInstances | None:
    if int(face_idx) < 0 or int(face_idx) >= len(self.faces):
      return None
    return self.faces[int(face_idx)]

  def total_instances(self) -> int:
    total = 0
    for face in self.faces:
      if face is not None:
        total += int(face.instance_count)
    return int(total)


def _face(nx, ny, nz, corners):
  (a, b, c, d) = corners
  return [(*a, nx, ny, nz, 0.0, 0.0), (*b, nx, ny, nz, 1.0, 0.0), (*c, nx, ny, nz, 1.0, 1.0), (*a, nx, ny, nz, 0.0, 0.0), (*c, nx, ny, nz, 1.0, 1.0), (*d, nx, ny, nz, 0.0, 1.0)]


def _face_lines(nx, ny, nz, corners):
  (a, b, c, d) = corners
  return [
    (*a, nx, ny, nz, 0.0, 0.0),
    (*b, nx, ny, nz, 1.0, 0.0),
    (*b, nx, ny, nz, 1.0, 0.0),
    (*c, nx, ny, nz, 1.0, 1.0),
    (*c, nx, ny, nz, 1.0, 1.0),
    (*d, nx, ny, nz, 0.0, 1.0),
    (*d, nx, ny, nz, 0.0, 1.0),
    (*a, nx, ny, nz, 0.0, 0.0),
  ]


def _quad_vertices(face: int):
  p = 0.5

  if face == 0:
    return _face(1, 0, 0, [(p, -p, -p), (p, -p, p), (p, p, p), (p, p, -p)])
  if face == 1:
    return _face(-1, 0, 0, [(-p, -p, p), (-p, -p, -p), (-p, p, -p), (-p, p, p)])
  if face == 2:
    return _face(0, 1, 0, [(-p, p, -p), (p, p, -p), (p, p, p), (-p, p, p)])
  if face == 3:
    return _face(0, -1, 0, [(-p, -p, p), (p, -p, p), (p, -p, -p), (-p, -p, -p)])
  if face == 4:
    return _face(0, 0, 1, [(p, -p, p), (-p, -p, p), (-p, p, p), (p, p, p)])
  return _face(0, 0, -1, [(-p, -p, -p), (p, -p, -p), (p, p, -p), (-p, p, -p)])


def _quad_wire_vertices(face: int):
  p = 0.5

  if face == 0:
    return _face_lines(1, 0, 0, [(p, -p, -p), (p, -p, p), (p, p, p), (p, p, -p)])
  if face == 1:
    return _face_lines(-1, 0, 0, [(-p, -p, p), (-p, -p, -p), (-p, p, -p), (-p, p, p)])
  if face == 2:
    return _face_lines(0, 1, 0, [(-p, p, -p), (p, p, -p), (p, p, p), (-p, p, p)])
  if face == 3:
    return _face_lines(0, -1, 0, [(-p, -p, p), (p, -p, p), (p, -p, -p), (-p, -p, -p)])
  if face == 4:
    return _face_lines(0, 0, 1, [(p, -p, p), (-p, -p, p), (-p, p, p), (p, p, p)])
  return _face_lines(0, 0, -1, [(-p, -p, -p), (p, -p, -p), (p, p, -p), (-p, p, -p)])


def build_face_vertex_rows() -> np.ndarray:
  rows = []
  for face_idx in range(FACE_COUNT):
    rows.extend(_quad_vertices(int(face_idx)))
  return np.asarray(rows, dtype=np.float32)


def build_face_wire_vertex_rows() -> np.ndarray:
  rows = []
  for face_idx in range(FACE_COUNT):
    rows.extend(_quad_wire_vertices(int(face_idx)))
  return np.asarray(rows, dtype=np.float32)


def normalize_face_rows(arr: np.ndarray | None) -> np.ndarray:
  if arr is None:
    return np.zeros((0, _INSTANCE_ROW_WIDTH), dtype=np.float32)
  rows = np.asarray(arr, dtype=np.float32)
  if rows.ndim != 2 or int(rows.shape[0]) <= 0 or int(rows.shape[1]) < 10:
    return np.zeros((0, _INSTANCE_ROW_WIDTH), dtype=np.float32)
  out = np.zeros((int(rows.shape[0]), _INSTANCE_ROW_WIDTH), dtype=np.float32)
  width = min(_INSTANCE_ROW_WIDTH, int(rows.shape[1]))
  out[:, :width] = rows[:, :width]
  if width <= 10:
    out[:, 10] = 1.0
  return np.ascontiguousarray(out, dtype=np.float32)


def normalize_transform_face_rows(arr: np.ndarray | None) -> np.ndarray:
  if arr is None:
    return np.zeros((0, _TRANSFORM_ROW_WIDTH), dtype=np.float32)
  rows = np.asarray(arr, dtype=np.float32)
  if rows.ndim != 2 or int(rows.shape[0]) <= 0 or int(rows.shape[1]) < _TRANSFORM_ROW_WIDTH:
    return np.zeros((0, _TRANSFORM_ROW_WIDTH), dtype=np.float32)
  out = np.zeros((int(rows.shape[0]), _TRANSFORM_ROW_WIDTH), dtype=np.float32)
  out[:, :] = rows[:, :_TRANSFORM_ROW_WIDTH]
  return np.ascontiguousarray(out, dtype=np.float32)


def build_selection_vertices(selection_cell: tuple[int, int, int] | None) -> np.ndarray:
  if selection_cell is None:
    return np.zeros((0, 3), dtype=np.float32)

  x, y, z = (int(selection_cell[0]), int(selection_cell[1]), int(selection_cell[2]))
  x0, y0, z0 = float(x), float(y), float(z)
  x1, y1, z1 = float(x + 1), float(y + 1), float(z + 1)
  corners = ((x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1))
  edges = ((0, 1), (1, 2), (2, 3), (3, 0), (4, 5), (5, 6), (6, 7), (7, 4), (0, 4), (1, 5), (2, 6), (3, 7))
  out: list[tuple[float, float, float]] = []
  for a, b in edges:
    out.append(corners[int(a)])
    out.append(corners[int(b)])
  return np.asarray(out, dtype=np.float32)


def upload_face_rows(*, device, label: str, rows: np.ndarray | None) -> WgpuFaceInstances | None:
  import wgpu

  data = normalize_face_rows(rows)
  if int(data.shape[0]) <= 0:
    return None
  buffer = device.create_buffer_with_data(label=str(label), data=data, usage=wgpu.BufferUsage.VERTEX)
  return WgpuFaceInstances(instance_buffer=buffer, instance_count=int(data.shape[0]))


def upload_transform_face_rows(*, device, label: str, rows: np.ndarray | None) -> WgpuFaceInstances | None:
  import wgpu

  data = normalize_transform_face_rows(rows)
  if int(data.shape[0]) <= 0:
    return None
  buffer = device.create_buffer_with_data(label=str(label), data=data, usage=wgpu.BufferUsage.VERTEX)
  return WgpuFaceInstances(instance_buffer=buffer, instance_count=int(data.shape[0]))


def upload_chunk_mesh(*, device, chunk_key: ChunkKey, world_revision: int, faces: list[np.ndarray] | tuple[np.ndarray, ...] | None) -> WgpuChunkMesh | None:
  if not faces:
    return None

  ck = normalize_chunk_key(chunk_key)
  face_buffers: list[WgpuFaceInstances | None] = []
  total = 0
  for face_idx in range(FACE_COUNT):
    rows = faces[face_idx] if face_idx < len(faces) else None
    uploaded = upload_face_rows(device=device, label=f"chunk-{ck}-face-{face_idx}", rows=rows)
    face_buffers.append(uploaded)
    if uploaded is not None:
      total += int(uploaded.instance_count)

  if total <= 0:
    return None
  return WgpuChunkMesh(chunk_key=ck, world_revision=int(world_revision), faces=tuple(face_buffers))
