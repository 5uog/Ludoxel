# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.simulation.actors.ai_players.modes import AI_MODE_IDLE, AI_PERSONALITY_AGGRESSIVE, AI_ROUTE_STYLE_STRICT, normalize_ai_mode, normalize_ai_personality, normalize_ai_route_style
from ludoxel.simulation.actors.ai_players.serialization import AiRoutePoint, normalize_route_points

AI_DEFAULT_HELD_ITEM_ID: str = "minecraft:oak_planks"


@dataclass(frozen=True)
class AiSpawnEggSettings:
  mode: str = AI_MODE_IDLE
  personality: str = AI_PERSONALITY_AGGRESSIVE
  can_place_blocks: bool = False
  route_points: tuple[AiRoutePoint, ...] = ()
  route_closed: bool = False
  route_run: bool = False
  route_style: str = AI_ROUTE_STYLE_STRICT

  def normalized(self) -> "AiSpawnEggSettings":
    return AiSpawnEggSettings(
      mode=normalize_ai_mode(self.mode),
      personality=normalize_ai_personality(self.personality),
      can_place_blocks=bool(self.can_place_blocks),
      route_points=normalize_route_points(self.route_points),
      route_closed=bool(self.route_closed),
      route_run=bool(self.route_run),
      route_style=normalize_ai_route_style(self.route_style),
    )
