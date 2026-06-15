# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.simulation.actors.ai_players.modes import (
  AI_HEALTH_INDICATOR_ABOVE,
  AI_HEALTH_INDICATOR_BELOW,
  AI_HEALTH_INDICATOR_OFF,
  AI_MODE_IDLE,
  AI_MODE_ROUTE,
  AI_MODE_WANDER,
  AI_PERSONALITY_AGGRESSIVE,
  AI_PERSONALITY_PEACEFUL,
  AI_ROUTE_STYLE_FLEXIBLE,
  AI_ROUTE_STYLE_STRICT,
  AI_SKIN_MODE_ALEX,
  AI_SKIN_MODE_CUSTOM,
  AI_SKIN_MODE_PLAYER,
  normalize_ai_health_indicator,
  normalize_ai_mode,
  normalize_ai_personality,
  normalize_ai_route_style,
  normalize_ai_skin_id,
  normalize_ai_skin_mode,
)
from ludoxel.simulation.actors.ai_players.serialization import AiRoutePoint, normalize_route_points
from ludoxel.simulation.actors.ai_players.settings import (
  AI_DEFAULT_HELD_ITEM_ID,
  AI_REGEN_DEFAULT_AMOUNT_HP,
  AI_REGEN_DEFAULT_CAP_HP,
  AI_REGEN_DEFAULT_ENABLED,
  AI_REGEN_DEFAULT_INTERVAL_S,
  AI_REGEN_DEFAULT_START_DELAY_S,
  AiSpawnEggSettings,
  normalize_ai_regen_amount_hp,
  normalize_ai_regen_cap_hp,
  normalize_ai_regen_interval_s,
  normalize_ai_regen_start_delay_s,
)

__all__ = (
  "AI_DEFAULT_HELD_ITEM_ID",
  "AI_HEALTH_INDICATOR_ABOVE",
  "AI_HEALTH_INDICATOR_BELOW",
  "AI_HEALTH_INDICATOR_OFF",
  "AI_MODE_IDLE",
  "AI_MODE_ROUTE",
  "AI_MODE_WANDER",
  "AI_PERSONALITY_AGGRESSIVE",
  "AI_PERSONALITY_PEACEFUL",
  "AI_ROUTE_STYLE_FLEXIBLE",
  "AI_ROUTE_STYLE_STRICT",
  "AI_SKIN_MODE_ALEX",
  "AI_SKIN_MODE_CUSTOM",
  "AI_SKIN_MODE_PLAYER",
  "AiPlayerState",
  "AiRoutePoint",
  "AiSpawnEggSettings",
  "normalize_ai_health_indicator",
  "normalize_ai_mode",
  "normalize_ai_personality",
  "normalize_ai_route_style",
  "normalize_ai_skin_id",
  "normalize_ai_skin_mode",
  "normalize_route_points",
)


@dataclass(frozen=True)
class AiPlayerState:
  actor_id: str
  mode: str = AI_MODE_IDLE
  personality: str = AI_PERSONALITY_AGGRESSIVE
  can_place_blocks: bool = False
  held_item_id: str | None = AI_DEFAULT_HELD_ITEM_ID
  name: str = ""
  health_indicator: str = AI_HEALTH_INDICATOR_ABOVE
  skin_mode: str = AI_SKIN_MODE_PLAYER
  skin_id: str = ""
  auto_regen_enabled: bool = AI_REGEN_DEFAULT_ENABLED
  regen_start_delay_s: float = AI_REGEN_DEFAULT_START_DELAY_S
  regen_interval_s: float = AI_REGEN_DEFAULT_INTERVAL_S
  regen_amount_hp: float = AI_REGEN_DEFAULT_AMOUNT_HP
  regen_cap_hp: float = AI_REGEN_DEFAULT_CAP_HP
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
    skin_id = normalize_ai_skin_id(self.skin_id)
    skin_mode = normalize_ai_skin_mode(self.skin_mode)
    if skin_mode == AI_SKIN_MODE_CUSTOM and not skin_id:
      skin_mode = AI_SKIN_MODE_PLAYER
    return AiPlayerState(
      actor_id=str(self.actor_id).strip(),
      mode=normalize_ai_mode(self.mode),
      personality=normalize_ai_personality(self.personality),
      can_place_blocks=bool(self.can_place_blocks),
      held_item_id=(held_item_id if held_item_id else None),
      name=str(self.name).strip(),
      health_indicator=normalize_ai_health_indicator(self.health_indicator),
      skin_mode=skin_mode,
      skin_id=skin_id,
      auto_regen_enabled=bool(self.auto_regen_enabled),
      regen_start_delay_s=normalize_ai_regen_start_delay_s(self.regen_start_delay_s),
      regen_interval_s=normalize_ai_regen_interval_s(self.regen_interval_s),
      regen_amount_hp=normalize_ai_regen_amount_hp(self.regen_amount_hp),
      regen_cap_hp=normalize_ai_regen_cap_hp(self.regen_cap_hp),
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
