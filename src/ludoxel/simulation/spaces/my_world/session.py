# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.simulation.worlds.generation.test_map import generate_test_map
from ludoxel.simulation.worlds.state.world import WorldState

MY_WORLD_SPAWN: tuple[float, float, float] = (0.0, 1.0, -10.0)
MY_WORLD_YAW_DEG: float = 0.0
MY_WORLD_PITCH_DEG: float = 0.0


@dataclass(frozen=True)
class MyWorldSessionSeed:
  seed: int = 0
  spawn: tuple[float, float, float] = MY_WORLD_SPAWN
  yaw_deg: float = MY_WORLD_YAW_DEG
  pitch_deg: float = MY_WORLD_PITCH_DEG


def make_my_world_state(seed: int) -> WorldState:
  return generate_test_map(seed=int(seed))
