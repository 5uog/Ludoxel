# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.worlds.generation.spec import WorldGenerationSpec
from ludoxel.simulation.worlds.state.world import WorldState


@dataclass(frozen=True)
class PersistedWorld:
  generation: WorldGenerationSpec = field(default_factory=WorldGenerationSpec.static_spec)
  revision: int = 0
  placed_blocks: dict[tuple[int, int, int], str] = field(default_factory=dict)
  broken_cells: tuple[tuple[int, int, int], ...] = ()

  @property
  def blocks(self) -> dict[tuple[int, int, int], str]:
    return self.placed_blocks

  def is_empty(self) -> bool:
    return (not self.placed_blocks) and (not self.broken_cells) and int(self.revision) <= 0 and self.generation.is_static()

  def to_world_state(self) -> WorldState:
    return WorldState(blocks=dict(self.placed_blocks), revision=int(max(1, int(self.revision))), generation=self.generation, broken_cells=tuple(self.broken_cells))

  @staticmethod
  def from_world_state(world: WorldState, *, placed_override: dict[tuple[int, int, int], str] | None = None) -> "PersistedWorld":
    placed = placed_override if placed_override is not None else world.placed_snapshot()
    return PersistedWorld(
      generation=world.generation_spec(),
      revision=int(world.revision),
      placed_blocks={(int(k[0]), int(k[1]), int(k[2])): str(v) for k, v in placed.items()},
      broken_cells=tuple(world.broken_snapshot()),
    )

  def to_dict(self) -> dict[str, Any]:
    world = self.to_world_state()
    return world.to_persisted_dict()

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PersistedWorld":
    world = WorldState.from_persisted_dict(d)
    return PersistedWorld(generation=world.generation_spec(), revision=int(world.revision), placed_blocks=world.placed_snapshot(), broken_cells=tuple(world.broken_snapshot()))
