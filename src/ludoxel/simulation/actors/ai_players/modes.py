# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

AI_MODE_ROUTE: str = "route"
AI_MODE_IDLE: str = "idle"
AI_MODE_WANDER: str = "wander"
AI_PERSONALITY_AGGRESSIVE: str = "aggressive"
AI_PERSONALITY_PEACEFUL: str = "peaceful"
AI_ROUTE_STYLE_STRICT: str = "strict"
AI_ROUTE_STYLE_FLEXIBLE: str = "flexible"
AI_HEALTH_INDICATOR_OFF: str = "off"
AI_HEALTH_INDICATOR_ABOVE: str = "above"
AI_HEALTH_INDICATOR_BELOW: str = "below"
AI_SKIN_MODE_PLAYER: str = "player"
AI_SKIN_MODE_TIMO: str = "timo"
AI_SKIN_MODE_CUSTOM: str = "custom"


def normalize_ai_mode(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_MODE_IDLE:
    return AI_MODE_IDLE
  if raw == AI_MODE_ROUTE:
    return AI_MODE_ROUTE
  return AI_MODE_WANDER


def normalize_ai_personality(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_PERSONALITY_PEACEFUL:
    return AI_PERSONALITY_PEACEFUL
  return AI_PERSONALITY_AGGRESSIVE


def normalize_ai_route_style(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_ROUTE_STYLE_FLEXIBLE:
    return AI_ROUTE_STYLE_FLEXIBLE
  return AI_ROUTE_STYLE_STRICT


def normalize_ai_health_indicator(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_HEALTH_INDICATOR_OFF:
    return AI_HEALTH_INDICATOR_OFF
  if raw == AI_HEALTH_INDICATOR_ABOVE:
    return AI_HEALTH_INDICATOR_ABOVE
  if raw == AI_HEALTH_INDICATOR_BELOW:
    return AI_HEALTH_INDICATOR_BELOW
  return AI_HEALTH_INDICATOR_ABOVE


def normalize_ai_skin_mode(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_SKIN_MODE_TIMO:
    return AI_SKIN_MODE_TIMO
  if raw == AI_SKIN_MODE_CUSTOM:
    return AI_SKIN_MODE_CUSTOM
  return AI_SKIN_MODE_PLAYER


def normalize_ai_skin_id(value: object) -> str:
  raw = str(value or "").strip().lower()
  if len(raw) != 32 or any(character not in "0123456789abcdef" for character in raw):
    return ""
  return raw
