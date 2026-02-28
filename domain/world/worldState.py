# FILE: domain/world/worldState.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple, Iterable
import random

from domain.config.testMapParams import TestMapParams, DEFAULT_TEST_MAP_PARAMS

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

def generate_test_map(seed: int = 0, params: TestMapParams | None = None) -> WorldState:
    p = params or DEFAULT_TEST_MAP_PARAMS
    rng = random.Random(seed)
    w = WorldState(blocks={})

    e = int(p.ground_half_extent)
    for x in range(-e, e + 1):
        for z in range(-e, e + 1):
            w.set_block(x, 0, z, "ground")

    wx = int(p.wall_x)
    for z in range(int(p.wall_z_min), int(p.wall_z_max) + 1):
        w.set_block(-wx, int(p.wall_base_y), z, "wall")
        w.set_block(wx, int(p.wall_base_y), z, "wall")
        mod = int(p.wall_second_layer_mod)
        if mod > 0 and (z % mod == 0):
            w.set_block(-wx, int(p.wall_second_y), z, "wall")
            w.set_block(wx, int(p.wall_second_y), z, "wall")

    for _ in range(int(p.pillar_count)):
        px = rng.randint(int(p.pillar_x_range[0]), int(p.pillar_x_range[1]))
        pz = rng.randint(int(p.pillar_z_range[0]), int(p.pillar_z_range[1]))
        h = rng.randint(int(p.pillar_height_range[0]), int(p.pillar_height_range[1]))
        for y in range(int(p.pillar_base_y), int(p.pillar_base_y) + h):
            w.set_block(px, y, pz, "pillar")

    py = int(p.platform_y)
    for x in range(int(p.platform_x_range[0]), int(p.platform_x_range[1]) + 1):
        for z in range(int(p.platform_z_range[0]), int(p.platform_z_range[1]) + 1):
            w.set_block(x, py, z, "platform")

    return w