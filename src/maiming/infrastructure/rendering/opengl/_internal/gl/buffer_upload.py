# FILE: src/maiming/infrastructure/rendering/opengl/_internal/gl/buffer_upload.py
from __future__ import annotations

import numpy as np

from OpenGL.GL import glBindBuffer, glBufferData, glBufferSubData

def as_float32_c_array(data: np.ndarray) -> np.ndarray:
    arr = data
    if arr.dtype != np.float32:
        arr = arr.astype(np.float32, copy=False)
    if not arr.flags["C_CONTIGUOUS"]:
        arr = np.ascontiguousarray(arr, dtype=np.float32)
    return arr

def as_uint32_c_array(data: np.ndarray) -> np.ndarray:
    arr = data
    if arr.dtype != np.uint32:
        arr = arr.astype(np.uint32, copy=False)
    if not arr.flags["C_CONTIGUOUS"]:
        arr = np.ascontiguousarray(arr, dtype=np.uint32)
    return arr

def upload_array_buffer(*, target: int, buffer: int, usage: int, data: np.ndarray | None, capacity_bytes: int) -> int:
    nbytes = 0 if data is None else int(data.nbytes)

    glBindBuffer(int(target), int(buffer))

    if nbytes <= 0:
        glBufferData(int(target), 0, None, int(usage))
        glBindBuffer(int(target), 0)
        return 0

    if int(capacity_bytes) > 0 and nbytes <= int(capacity_bytes):
        glBufferSubData(int(target), 0, nbytes, data)
        glBindBuffer(int(target), 0)
        return int(capacity_bytes)

    glBufferData(int(target), nbytes, data, int(usage))
    glBindBuffer(int(target), 0)
    return int(nbytes)

def upload_bytes_buffer(*, target: int, buffer: int, usage: int, data: bytes, capacity_bytes: int) -> int:
    payload = bytes(data)
    nbytes = int(len(payload))

    glBindBuffer(int(target), int(buffer))

    if nbytes <= 0:
        glBufferData(int(target), 0, None, int(usage))
        glBindBuffer(int(target), 0)
        return 0

    if int(capacity_bytes) > 0 and nbytes <= int(capacity_bytes):
        glBufferSubData(int(target), 0, nbytes, payload)
        glBindBuffer(int(target), 0)
        return int(capacity_bytes)

    glBufferData(int(target), nbytes, payload, int(usage))
    glBindBuffer(int(target), 0)
    return int(nbytes)