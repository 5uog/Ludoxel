# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

FACE_POS_X: int = 0
FACE_NEG_X: int = 1
FACE_POS_Y: int = 2
FACE_NEG_Y: int = 3
FACE_POS_Z: int = 4
FACE_NEG_Z: int = 5


def face_neighbor_offset(face_idx: int) -> tuple[int, int, int]:
  """
  face index に対応する隣接 voxel への一軸 offset を返す。
  `FACE_POS_X` から `FACE_NEG_Z` までの六面は `(±1,0,0)`、`(0,±1,0)`、`(0,0,±1)` に対応し、
  範囲外の index は負 z 面と同じ `(0,0,-1)` へ退避する。
  """
  fi = int(face_idx)

  if fi == FACE_POS_X:
    return (1, 0, 0)
  if fi == FACE_NEG_X:
    return (-1, 0, 0)
  if fi == FACE_POS_Y:
    return (0, 1, 0)
  if fi == FACE_NEG_Y:
    return (0, -1, 0)
  if fi == FACE_POS_Z:
    return (0, 0, 1)
  return (0, 0, -1)
