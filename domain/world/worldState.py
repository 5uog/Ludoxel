# FILE: domain/world/worldState.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple, Iterable

BlockKey = Tuple[int, int, int]

@dataclass
class WorldState:
    blocks: Dict[BlockKey, str]
    revision: int = 0

    def set_block(self, x: int, y: int, z: int, block_id: str) -> None:
        self.blocks[(x, y, z)] = block_id
        self.revision += 1

    def remove_block(self, x: int, y: int, z: int) -> None:
        if (x, y, z) in self.blocks:
            del self.blocks[(x, y, z)]
            self.revision += 1

    def iter_blocks(self) -> Iterable[tuple[int, int, int, str]]:
        for (x, y, z), bid in self.blocks.items():
            yield x, y, z, bid

def generate_flat_world(
    *,
    half_extent: int = 32,
    ground_y: int = 0,
    block_id: str = "minecraft:grass_block",
) -> WorldState:
    blocks: Dict[BlockKey, str] = {}
    e = int(max(1, half_extent))
    gy = int(ground_y)

    for x in range(-e, e + 1):
        for z in range(-e, e + 1):
            blocks[(int(x), int(gy), int(z))] = str(block_id)

    return WorldState(blocks=blocks, revision=1)

def generate_test_map(seed: int = 0, params=None) -> WorldState:
    _ = int(seed)
    _ = params
    return generate_flat_world()