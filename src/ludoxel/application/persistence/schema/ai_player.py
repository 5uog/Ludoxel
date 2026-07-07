# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.application.persistence.schema.player import coerce_xyz_triplet
from ludoxel.foundations.mathematics.scalars.coercion import coerce_bool, coerce_float, coerce_int, mapping_str
from ludoxel.simulation.actors.ai_players.settings import AI_REGEN_DEFAULT_AMOUNT_HP, AI_REGEN_DEFAULT_CAP_HP, AI_REGEN_DEFAULT_ENABLED, AI_REGEN_DEFAULT_INTERVAL_S, AI_REGEN_DEFAULT_START_DELAY_S, normalize_ai_regen_amount_hp, normalize_ai_regen_cap_hp, normalize_ai_regen_interval_s, normalize_ai_regen_start_delay_s
from ludoxel.simulation.actors.ai_players.state import (
  AI_DEFAULT_HELD_ITEM_ID,
  AI_HEALTH_INDICATOR_ABOVE,
  AI_SKIN_MODE_CUSTOM,
  AI_SKIN_MODE_PLAYER,
  AiPlayerState,
  AiRoutePoint,
  normalize_ai_health_indicator,
  normalize_ai_mode,
  normalize_ai_personality,
  normalize_ai_route_style,
  normalize_ai_skin_id,
  normalize_ai_skin_mode,
  normalize_route_points,
)


@dataclass(frozen=True)
class PersistedAiPlayer:
  actor_id: str = ""
  mode: str = "idle"
  personality: str = "aggressive"
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
  route_style: str = "strict"
  route_target_index: int = 0

  def to_dict(self) -> dict[str, Any]:
    return {
      "actor_id": str(self.actor_id),
      "mode": str(self.mode),
      "personality": str(self.personality),
      "can_place_blocks": bool(self.can_place_blocks),
      "held_item_id": (None if self.held_item_id is None else str(self.held_item_id)),
      "name": str(self.name),
      "health_indicator": str(self.health_indicator),
      "skin_mode": str(self.skin_mode),
      "skin_id": str(self.skin_id),
      "auto_regen_enabled": bool(self.auto_regen_enabled),
      "regen_start_delay_s": float(self.regen_start_delay_s),
      "regen_interval_s": float(self.regen_interval_s),
      "regen_amount_hp": float(self.regen_amount_hp),
      "regen_cap_hp": float(self.regen_cap_hp),
      "pos": [float(self.pos_x), float(self.pos_y), float(self.pos_z)],
      "vel": [float(self.vel_x), float(self.vel_y), float(self.vel_z)],
      "yaw_deg": float(self.yaw_deg),
      "pitch_deg": float(self.pitch_deg),
      "health": float(self.health),
      "max_health": float(self.max_health),
      "on_ground": bool(self.on_ground),
      "flying": bool(self.flying),
      "route_points": [[float(point.x), float(point.y), float(point.z)] for point in normalize_route_points(self.route_points)],
      "route_closed": bool(self.route_closed),
      "route_run": bool(self.route_run),
      "route_style": str(self.route_style),
      "route_target_index": int(self.route_target_index),
    }

  def to_state(self) -> AiPlayerState:
    return AiPlayerState(
      actor_id=str(self.actor_id),
      mode=normalize_ai_mode(self.mode),
      personality=normalize_ai_personality(self.personality),
      can_place_blocks=bool(self.can_place_blocks),
      held_item_id=(None if self.held_item_id is None else str(self.held_item_id)),
      name=str(self.name).strip(),
      health_indicator=normalize_ai_health_indicator(self.health_indicator),
      skin_mode=normalize_ai_skin_mode(self.skin_mode),
      skin_id=normalize_ai_skin_id(self.skin_id),
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
      max_health=float(self.max_health),
      on_ground=bool(self.on_ground),
      flying=bool(self.flying),
      route_points=normalize_route_points(self.route_points),
      route_closed=bool(self.route_closed),
      route_run=bool(self.route_run),
      route_style=normalize_ai_route_style(self.route_style),
      route_target_index=int(self.route_target_index),
    ).normalized()

  @staticmethod
  def from_state(state: AiPlayerState) -> "PersistedAiPlayer":
    normalized = state.normalized()
    return PersistedAiPlayer(
      actor_id=str(normalized.actor_id),
      mode=str(normalized.mode),
      personality=str(normalized.personality),
      can_place_blocks=bool(normalized.can_place_blocks),
      held_item_id=(None if normalized.held_item_id is None else str(normalized.held_item_id)),
      name=str(normalized.name),
      health_indicator=str(normalized.health_indicator),
      skin_mode=str(normalized.skin_mode),
      skin_id=str(normalized.skin_id),
      auto_regen_enabled=bool(normalized.auto_regen_enabled),
      regen_start_delay_s=float(normalized.regen_start_delay_s),
      regen_interval_s=float(normalized.regen_interval_s),
      regen_amount_hp=float(normalized.regen_amount_hp),
      regen_cap_hp=float(normalized.regen_cap_hp),
      pos_x=float(normalized.pos_x),
      pos_y=float(normalized.pos_y),
      pos_z=float(normalized.pos_z),
      vel_x=float(normalized.vel_x),
      vel_y=float(normalized.vel_y),
      vel_z=float(normalized.vel_z),
      yaw_deg=float(normalized.yaw_deg),
      pitch_deg=float(normalized.pitch_deg),
      health=float(normalized.health),
      max_health=float(normalized.max_health),
      on_ground=bool(normalized.on_ground),
      flying=bool(normalized.flying),
      route_points=tuple(normalized.route_points),
      route_closed=bool(normalized.route_closed),
      route_run=bool(normalized.route_run),
      route_style=str(normalized.route_style),
      route_target_index=int(normalized.route_target_index),
    )

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "PersistedAiPlayer":
    if not isinstance(data, dict):
      return PersistedAiPlayer()
    pos_x, pos_y, pos_z = coerce_xyz_triplet(data.get("pos"), default=(0.0, 1.0, 0.0))
    vel_x, vel_y, vel_z = coerce_xyz_triplet(data.get("vel"), default=(0.0, 0.0, 0.0))
    held_item_id_raw = data.get("held_item_id", AI_DEFAULT_HELD_ITEM_ID)
    held_item_id = None if held_item_id_raw is None else str(held_item_id_raw).strip()
    skin_id = normalize_ai_skin_id(data.get("skin_id", ""))
    skin_mode = normalize_ai_skin_mode(data.get("skin_mode", AI_SKIN_MODE_PLAYER))
    if skin_mode == AI_SKIN_MODE_CUSTOM and not skin_id:
      skin_mode = AI_SKIN_MODE_PLAYER
    return PersistedAiPlayer(
      actor_id=mapping_str(data, "actor_id", ""),
      mode=normalize_ai_mode(data.get("mode", "idle")),
      personality=normalize_ai_personality(data.get("personality", "aggressive")),
      can_place_blocks=coerce_bool(data.get("can_place_blocks", False), False),
      held_item_id=(held_item_id if held_item_id else None),
      name=mapping_str(data, "name", "").strip(),
      health_indicator=normalize_ai_health_indicator(data.get("health_indicator", AI_HEALTH_INDICATOR_ABOVE)),
      skin_mode=skin_mode,
      skin_id=skin_id,
      auto_regen_enabled=coerce_bool(data.get("auto_regen_enabled", AI_REGEN_DEFAULT_ENABLED), bool(AI_REGEN_DEFAULT_ENABLED)),
      regen_start_delay_s=normalize_ai_regen_start_delay_s(coerce_float(data.get("regen_start_delay_s", AI_REGEN_DEFAULT_START_DELAY_S), float(AI_REGEN_DEFAULT_START_DELAY_S))),
      regen_interval_s=normalize_ai_regen_interval_s(coerce_float(data.get("regen_interval_s", AI_REGEN_DEFAULT_INTERVAL_S), float(AI_REGEN_DEFAULT_INTERVAL_S))),
      regen_amount_hp=normalize_ai_regen_amount_hp(coerce_float(data.get("regen_amount_hp", AI_REGEN_DEFAULT_AMOUNT_HP), float(AI_REGEN_DEFAULT_AMOUNT_HP))),
      regen_cap_hp=normalize_ai_regen_cap_hp(coerce_float(data.get("regen_cap_hp", AI_REGEN_DEFAULT_CAP_HP), float(AI_REGEN_DEFAULT_CAP_HP))),
      pos_x=pos_x,
      pos_y=pos_y,
      pos_z=pos_z,
      vel_x=vel_x,
      vel_y=vel_y,
      vel_z=vel_z,
      yaw_deg=coerce_float(data.get("yaw_deg", 0.0), 0.0),
      pitch_deg=coerce_float(data.get("pitch_deg", 0.0), 0.0),
      health=coerce_float(data.get("health", 20.0), 20.0),
      max_health=max(1.0, coerce_float(data.get("max_health", 20.0), 20.0)),
      on_ground=coerce_bool(data.get("on_ground", False), False),
      flying=coerce_bool(data.get("flying", False), False),
      route_points=normalize_route_points(data.get("route_points", ())),
      route_closed=coerce_bool(data.get("route_closed", False), False),
      route_run=coerce_bool(data.get("route_run", False), False),
      route_style=normalize_ai_route_style(data.get("route_style", "strict")),
      route_target_index=max(0, coerce_int(data.get("route_target_index", 0), 0)),
    )
