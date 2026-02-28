# FILE: domain/config/testMapParams.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Tuple

@dataclass(frozen=True)
class TestMapParams:
    ground_half_extent: int = 20

    wall_x: int = 8
    wall_z_min: int = -18
    wall_z_max: int = 18
    wall_second_layer_mod: int = 3
    wall_base_y: int = 1
    wall_second_y: int = 2

    pillar_count: int = 18
    pillar_x_range: Tuple[int, int] = (-6, 6)
    pillar_z_range: Tuple[int, int] = (-16, 16)
    pillar_height_range: Tuple[int, int] = (2, 5)
    pillar_base_y: int = 1

    platform_y: int = 3
    platform_x_range: Tuple[int, int] = (-3, 3)
    platform_z_range: Tuple[int, int] = (6, 12)

DEFAULT_TEST_MAP_PARAMS = TestMapParams()