# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.application.persistence.schema.ai_player import PersistedAiPlayer
from ludoxel.application.persistence.schema.inventory import PersistedWorldInventory
from ludoxel.application.persistence.schema.player import PersistedPlayer
from ludoxel.application.persistence.schema.world import PersistedWorld


@dataclass(frozen=True)
class PersistedPlaySpace:
  player: PersistedPlayer = field(default_factory=PersistedPlayer)
  world: PersistedWorld = field(default_factory=PersistedWorld)
  inventory: PersistedWorldInventory = field(default_factory=PersistedWorldInventory)
  ai_players: tuple[PersistedAiPlayer, ...] = field(default_factory=tuple)

  def to_dict(self) -> dict[str, Any]:
    return {"player": self.player.to_dict(), "world": self.world.to_dict(), "inventory": self.inventory.to_dict(), "ai_players": [player.to_dict() for player in self.ai_players]}

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "PersistedPlaySpace":
    if not isinstance(data, dict):
      return PersistedPlaySpace()

    raw_player = data.get("player", {})
    raw_world = data.get("world", {})
    raw_inventory = data.get("inventory", {})
    raw_ai_players = data.get("ai_players", ())
    ai_players = tuple(PersistedAiPlayer.from_dict(entry) for entry in raw_ai_players) if isinstance(raw_ai_players, (list, tuple)) else ()
    return PersistedPlaySpace(
      player=PersistedPlayer.from_dict(raw_player) if isinstance(raw_player, dict) else PersistedPlayer(),
      world=PersistedWorld.from_dict(raw_world) if isinstance(raw_world, dict) else PersistedWorld(),
      inventory=PersistedWorldInventory.from_dict(raw_inventory) if isinstance(raw_inventory, dict) else PersistedWorldInventory(),
      ai_players=ai_players,
    )
