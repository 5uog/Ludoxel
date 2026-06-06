# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.simulation.actors.ai_players.modes import (
  AI_MODE_IDLE,
  AI_MODE_ROUTE,
  AI_MODE_WANDER,
  AI_PERSONALITY_AGGRESSIVE,
  AI_PERSONALITY_PEACEFUL,
  AI_ROUTE_STYLE_FLEXIBLE,
  AI_ROUTE_STYLE_STRICT,
  normalize_ai_mode,
  normalize_ai_personality,
  normalize_ai_route_style,
)
from ludoxel.simulation.actors.ai_players.serialization import AiRoutePoint, normalize_route_points
from ludoxel.simulation.actors.ai_players.settings import AI_DEFAULT_HELD_ITEM_ID, AiSpawnEggSettings

__all__ = (
  "AI_DEFAULT_HELD_ITEM_ID",
  "AI_MODE_IDLE",
  "AI_MODE_ROUTE",
  "AI_MODE_WANDER",
  "AI_PERSONALITY_AGGRESSIVE",
  "AI_PERSONALITY_PEACEFUL",
  "AI_ROUTE_STYLE_FLEXIBLE",
  "AI_ROUTE_STYLE_STRICT",
  "AiPlayerState",
  "AiRoutePoint",
  "AiSpawnEggSettings",
  "normalize_ai_mode",
  "normalize_ai_personality",
  "normalize_ai_route_style",
  "normalize_route_points",
)


@dataclass(frozen=True)
class AiPlayerState:
  actor_id: str
  mode: str = AI_MODE_IDLE
  personality: str = AI_PERSONALITY_AGGRESSIVE
  can_place_blocks: bool = False
  held_item_id: str | None = AI_DEFAULT_HELD_ITEM_ID
  pos_x: float = 0.0
  pos_y: float = 1.0
  pos_z: float = 0.0
  vel_x: float = 0.0
  vel_y: float = 0.0
  vel_z: float = 0.0
  yaw_deg: float = 0.0
  pitch_deg: float = 0.0
  health: float = 20.0
  max_health: float = 20.0
  on_ground: bool = False
  flying: bool = False
  route_points: tuple[AiRoutePoint, ...] = field(default_factory=tuple)
  route_closed: bool = False
  route_run: bool = False
  route_style: str = AI_ROUTE_STYLE_STRICT
  route_target_index: int = 0

  def normalized(self) -> "AiPlayerState":
    held_item_id = None if self.held_item_id is None else str(self.held_item_id).strip()
    return AiPlayerState(
      actor_id=str(self.actor_id).strip(),
      mode=normalize_ai_mode(self.mode),
      personality=normalize_ai_personality(self.personality),
      can_place_blocks=bool(self.can_place_blocks),
      held_item_id=(held_item_id if held_item_id else None),
      pos_x=float(self.pos_x),
      pos_y=float(self.pos_y),
      pos_z=float(self.pos_z),
      vel_x=float(self.vel_x),
      vel_y=float(self.vel_y),
      vel_z=float(self.vel_z),
      yaw_deg=float(self.yaw_deg),
      pitch_deg=float(self.pitch_deg),
      health=float(self.health),
      max_health=max(1.0, float(self.max_health)),
      on_ground=bool(self.on_ground),
      flying=bool(self.flying),
      route_points=normalize_route_points(self.route_points),
      route_closed=bool(self.route_closed),
      route_run=bool(self.route_run),
      route_style=normalize_ai_route_style(self.route_style),
      route_target_index=max(0, int(self.route_target_index)),
    )
