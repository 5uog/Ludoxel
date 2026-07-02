# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.simulation.worlds.generation.spawn import spawn_for_generation
from ludoxel.simulation.worlds.generation.spec import WorldGenerationSpec
from ludoxel.simulation.worlds.state.world import WorldState

MY_WORLD_YAW_DEG: float = 0.0
MY_WORLD_PITCH_DEG: float = 0.0


def my_world_spawn(spec: WorldGenerationSpec) -> tuple[float, float, float]:
  return spawn_for_generation(spec)


@dataclass(frozen=True)
class MyWorldSessionSeed:
  generation: WorldGenerationSpec = field(default_factory=WorldGenerationSpec)
  yaw_deg: float = MY_WORLD_YAW_DEG
  pitch_deg: float = MY_WORLD_PITCH_DEG

  @property
  def seed(self) -> int:
    return int(self.generation.seed)

  @property
  def spawn(self) -> tuple[float, float, float]:
    return my_world_spawn(self.generation)


def make_my_world_state(generation: WorldGenerationSpec) -> WorldState:
  spec = generation.normalized()
  return WorldState(blocks={}, revision=1, generation=spec)
