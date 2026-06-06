# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.worlds.state.world import WorldState


@dataclass(frozen=True)
class PersistedWorld:
  revision: int = 0
  blocks: dict[tuple[int, int, int], str] = field(default_factory=dict)

  def to_dict(self) -> dict[str, Any]:
    world = WorldState(blocks=dict(self.blocks), revision=int(self.revision))
    return world.to_persisted_dict()

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PersistedWorld":
    world = WorldState.from_persisted_dict(d)
    return PersistedWorld(revision=int(world.revision), blocks=world.snapshot_blocks())
