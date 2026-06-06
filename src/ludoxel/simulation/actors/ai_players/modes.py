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
