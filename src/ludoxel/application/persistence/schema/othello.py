# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.application.persistence.schema.ai_player import PersistedAiPlayer
from ludoxel.application.persistence.schema.player import PersistedPlayer
from ludoxel.application.persistence.schema.world import PersistedWorld
from ludoxel.simulation.spaces.othello.game.state import OthelloGameState


@dataclass(frozen=True)
class PersistedOthelloSpace:
  player: PersistedPlayer = field(default_factory=PersistedPlayer)
  world: PersistedWorld = field(default_factory=PersistedWorld)
  othello_game_state: OthelloGameState = field(default_factory=OthelloGameState)
  ai_players: tuple[PersistedAiPlayer, ...] = field(default_factory=tuple)

  def to_dict(self) -> dict[str, Any]:
    return {"player": self.player.to_dict(), "world": self.world.to_dict(), "othello_game_state": self.othello_game_state.to_dict(), "ai_players": [player.to_dict() for player in self.ai_players]}

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "PersistedOthelloSpace":
    if not isinstance(data, dict):
      return PersistedOthelloSpace()

    raw_player = data.get("player", {})
    raw_world = data.get("world", {})
    raw_game = data.get("othello_game_state", {})
    raw_ai_players = data.get("ai_players", ())
    ai_players = tuple(PersistedAiPlayer.from_dict(entry) for entry in raw_ai_players) if isinstance(raw_ai_players, (list, tuple)) else ()
    return PersistedOthelloSpace(
      player=PersistedPlayer.from_dict(raw_player) if isinstance(raw_player, dict) else PersistedPlayer(),
      world=PersistedWorld.from_dict(raw_world) if isinstance(raw_world, dict) else PersistedWorld(),
      othello_game_state=(OthelloGameState.from_dict(raw_game) if isinstance(raw_game, dict) else OthelloGameState()),
      ai_players=ai_players,
    )
