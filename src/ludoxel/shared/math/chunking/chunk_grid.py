# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from typing import Set, Tuple

CHUNK_SIZE: int = 16
ChunkKey = Tuple[int, int, int]


def normalize_chunk_key(k: ChunkKey) -> ChunkKey:
    return (int(k[0]), int(k[1]), int(k[2]))


def chunk_key(x: int, y: int, z: int) -> ChunkKey:
    return (int(x) // CHUNK_SIZE, int(y) // CHUNK_SIZE, int(z) // CHUNK_SIZE)


def chunk_bounds(k: ChunkKey) -> tuple[int, int, int, int, int, int]:
    cx, cy, cz = normalize_chunk_key(k)
    x0 = cx * CHUNK_SIZE
    y0 = cy * CHUNK_SIZE
    z0 = cz * CHUNK_SIZE
    return (x0, x0 + CHUNK_SIZE, y0, y0 + CHUNK_SIZE, z0, z0 + CHUNK_SIZE)


def neighbor_chunk_keys_for_cell(x: int, y: int, z: int) -> Set[ChunkKey]:
    xi = int(x)
    yi = int(y)
    zi = int(z)
    cx, cy, cz = chunk_key(xi, yi, zi)
    keys: Set[ChunkKey] = {(int(cx), int(cy), int(cz))}

    lx = int(xi - int(cx) * CHUNK_SIZE)
    ly = int(yi - int(cy) * CHUNK_SIZE)
    lz = int(zi - int(cz) * CHUNK_SIZE)

    if int(lx) <= 0:
        keys.add((int(cx) - 1, int(cy), int(cz)))
    if int(lx) >= int(CHUNK_SIZE - 1):
        keys.add((int(cx) + 1, int(cy), int(cz)))
    if int(ly) <= 0:
        keys.add((int(cx), int(cy) - 1, int(cz)))
    if int(ly) >= int(CHUNK_SIZE - 1):
        keys.add((int(cx), int(cy) + 1, int(cz)))
    if int(lz) <= 0:
        keys.add((int(cx), int(cy), int(cz) - 1))
    if int(lz) >= int(CHUNK_SIZE - 1):
        keys.add((int(cx), int(cy), int(cz) + 1))
    return keys
