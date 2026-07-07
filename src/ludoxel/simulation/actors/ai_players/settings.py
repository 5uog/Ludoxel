# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.simulation.actors.ai_players.modes import (
  AI_HEALTH_INDICATOR_ABOVE,
  AI_MODE_IDLE,
  AI_PERSONALITY_AGGRESSIVE,
  AI_ROUTE_STYLE_STRICT,
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

AI_DEFAULT_HELD_ITEM_ID: str = "ludoxel:oak_planks"

AI_REGEN_DEFAULT_ENABLED: bool = False
AI_REGEN_DEFAULT_START_DELAY_S: float = 4.0
AI_REGEN_DEFAULT_INTERVAL_S: float = 4.0
AI_REGEN_DEFAULT_AMOUNT_HP: float = 1.0
AI_REGEN_DEFAULT_CAP_HP: float = 20.0

AI_REGEN_START_DELAY_MIN_S: float = 0.0
AI_REGEN_START_DELAY_MAX_S: float = 600.0
AI_REGEN_INTERVAL_MIN_S: float = 0.05
AI_REGEN_INTERVAL_MAX_S: float = 600.0
AI_REGEN_AMOUNT_MIN_HP: float = 0.05
AI_REGEN_AMOUNT_MAX_HP: float = 100.0
AI_REGEN_CAP_MIN_HP: float = 1.0
AI_REGEN_CAP_MAX_HP: float = 1000.0


def _clamp_float(value: object, *, minimum: float, maximum: float, default: float) -> float:
  try:
    numeric = float(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    numeric = float(default)
  if numeric != numeric:
    numeric = float(default)
  return float(min(float(maximum), max(float(minimum), float(numeric))))


def normalize_ai_regen_start_delay_s(value: object) -> float:
  return _clamp_float(value, minimum=float(AI_REGEN_START_DELAY_MIN_S), maximum=float(AI_REGEN_START_DELAY_MAX_S), default=float(AI_REGEN_DEFAULT_START_DELAY_S))


def normalize_ai_regen_interval_s(value: object) -> float:
  return _clamp_float(value, minimum=float(AI_REGEN_INTERVAL_MIN_S), maximum=float(AI_REGEN_INTERVAL_MAX_S), default=float(AI_REGEN_DEFAULT_INTERVAL_S))


def normalize_ai_regen_amount_hp(value: object) -> float:
  return _clamp_float(value, minimum=float(AI_REGEN_AMOUNT_MIN_HP), maximum=float(AI_REGEN_AMOUNT_MAX_HP), default=float(AI_REGEN_DEFAULT_AMOUNT_HP))


def normalize_ai_regen_cap_hp(value: object) -> float:
  return _clamp_float(value, minimum=float(AI_REGEN_CAP_MIN_HP), maximum=float(AI_REGEN_CAP_MAX_HP), default=float(AI_REGEN_DEFAULT_CAP_HP))


@dataclass(frozen=True)
class AiSpawnEggSettings:
  mode: str = AI_MODE_IDLE
  personality: str = AI_PERSONALITY_AGGRESSIVE
  can_place_blocks: bool = False
  name: str = ""
  health_indicator: str = AI_HEALTH_INDICATOR_ABOVE
  skin_mode: str = AI_SKIN_MODE_PLAYER
  skin_id: str = ""
  auto_regen_enabled: bool = AI_REGEN_DEFAULT_ENABLED
  regen_start_delay_s: float = AI_REGEN_DEFAULT_START_DELAY_S
  regen_interval_s: float = AI_REGEN_DEFAULT_INTERVAL_S
  regen_amount_hp: float = AI_REGEN_DEFAULT_AMOUNT_HP
  regen_cap_hp: float = AI_REGEN_DEFAULT_CAP_HP
  route_points: tuple[AiRoutePoint, ...] = ()
  route_closed: bool = False
  route_run: bool = False
  route_style: str = AI_ROUTE_STYLE_STRICT

  def normalized(self) -> "AiSpawnEggSettings":
    skin_id = normalize_ai_skin_id(self.skin_id)
    skin_mode = normalize_ai_skin_mode(self.skin_mode)
    if skin_mode == AI_SKIN_MODE_CUSTOM and not skin_id:
      skin_mode = AI_SKIN_MODE_PLAYER
    return AiSpawnEggSettings(
      mode=normalize_ai_mode(self.mode),
      personality=normalize_ai_personality(self.personality),
      can_place_blocks=bool(self.can_place_blocks),
      name=str(self.name).strip(),
      health_indicator=normalize_ai_health_indicator(self.health_indicator),
      skin_mode=skin_mode,
      skin_id=skin_id,
      auto_regen_enabled=bool(self.auto_regen_enabled),
      regen_start_delay_s=normalize_ai_regen_start_delay_s(self.regen_start_delay_s),
      regen_interval_s=normalize_ai_regen_interval_s(self.regen_interval_s),
      regen_amount_hp=normalize_ai_regen_amount_hp(self.regen_amount_hp),
      regen_cap_hp=normalize_ai_regen_cap_hp(self.regen_cap_hp),
      route_points=normalize_route_points(self.route_points),
      route_closed=bool(self.route_closed),
      route_run=bool(self.route_run),
      route_style=normalize_ai_route_style(self.route_style),
    )
