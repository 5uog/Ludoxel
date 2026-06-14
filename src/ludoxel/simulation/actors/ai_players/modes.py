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
  """
  AI の体力表示位置設定を三値の何れかへ正規化する。
  入力は任意 object を許容し、文字列化と前後空白除去と小文字化の後に "off"、"above"、"below" と一致した値を採用し、それ以外の入力は既定の "above" として返す。
  返値は AiSpawnEggSettings、AiPlayerState、PersistedAiPlayer、renderer 向け snapshot が共有する安定値であり、presentation 側はこの三値以外を受け取らないことに依存する。
  """
  raw = str(value).strip().lower()
  if raw == AI_HEALTH_INDICATOR_OFF:
    return AI_HEALTH_INDICATOR_OFF
  if raw == AI_HEALTH_INDICATOR_ABOVE:
    return AI_HEALTH_INDICATOR_ABOVE
  if raw == AI_HEALTH_INDICATOR_BELOW:
    return AI_HEALTH_INDICATOR_BELOW
  return AI_HEALTH_INDICATOR_ABOVE


def normalize_ai_skin_mode(value: object) -> str:
  """
  AI actor が player skin と actor 固有 custom skin の何れを使用するかを二値へ正規化する。
  "custom" だけを actor 固有 skin として採用し、欠落値、旧保存 data、不正値は player skin 共有を維持する "player" へ退避する。
  """
  raw = str(value).strip().lower()
  if raw == AI_SKIN_MODE_CUSTOM:
    return AI_SKIN_MODE_CUSTOM
  return AI_SKIN_MODE_PLAYER


def normalize_ai_skin_id(value: object) -> str:
  """
  actor 固有 skin file を参照する opaque identifier を安全な小文字英数字へ正規化する。
  UUID hex 以外の path separator、dot、空白を拒否し、runtime file path の構成要素として使用できない値は空文字へ退避する。
  """
  raw = str(value or "").strip().lower()
  if len(raw) != 32 or any(character not in "0123456789abcdef" for character in raw):
    return ""
  return raw
