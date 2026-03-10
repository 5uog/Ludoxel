# FILE: src/maiming/core/grid/face_index.py
from __future__ import annotations

FACE_POS_X: int = 0
FACE_NEG_X: int = 1
FACE_POS_Y: int = 2
FACE_NEG_Y: int = 3
FACE_POS_Z: int = 4
FACE_NEG_Z: int = 5

def face_neighbor_offset(face_idx: int) -> tuple[int, int, int]:
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