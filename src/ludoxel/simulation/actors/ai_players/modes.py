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
AI_SKIN_MODE_ALEX: str = "alex"
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
  入力は任意 object を許容し、文字列化と前後空白除去と小文字化の後に "off"、"above"、"below" と明示的に一致した値だけを採用する。明示的に "off" 又は "below" と書かれた既存保存値はそのまま保持され、欠落値、未知文字列、新規 actor の既定は "above" として返す。
  既定を "above" に置くのは、新規生成 AI と field 欠落の旧保存 data に対して nametag 直上へ heart 列を表示する設計を要求するためであり、明示済みの "off" を上書きしないために off を fallback ではなく明示分岐として扱う。
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
  AI actor が player skin を共有するか、同梱 Alex skin を使用するか、actor 固有 import skin を使用するかを三値へ正規化する。
  入力は任意 object を許容し、文字列化と前後空白除去と小文字化の後に "alex" を同梱 Alex skin、"custom" を actor 固有 import skin として採用し、欠落値と未知文字列はすべて player skin 共有を表す "player" へ退避する。
  返値は AiSpawnEggSettings、AiPlayerState、PersistedAiPlayer、renderer 向け snapshot が共有する安定値であり、presentation 側はこの三値以外を受け取らないことに依存する。"custom" は別途 skin_id が指す import 済み PNG の存在に依存するため、上位 normalized() は skin_id が無効な "custom" を "player" へ退避させる。Alex skin は同梱 resource として常に解決できるため file 参照を要しない。
  """
  raw = str(value).strip().lower()
  if raw == AI_SKIN_MODE_ALEX:
    return AI_SKIN_MODE_ALEX
  if raw == AI_SKIN_MODE_CUSTOM:
    return AI_SKIN_MODE_CUSTOM
  return AI_SKIN_MODE_PLAYER


def normalize_ai_skin_id(value: object) -> str:
  """
  actor 固有 import skin file を参照する opaque identifier を、runtime file path の構成要素として安全な 32 桁小文字 16 進文字列へ正規化する。
  入力は任意 object を許容し、文字列化と前後空白除去と小文字化の後に、長さ 32 かつ各文字が "0123456789abcdef" に含まれる場合だけ採用する。path separator、dot、空白、その他の長さ又は文字を含む値は file 名注入を防ぐため空文字へ退避する。
  返値が空文字の場合は import skin 参照が存在しないことを意味し、上位の skin_mode 正規化はこの空文字を player skin 共有へ落とすために用いる。同梱 Alex skin の固定 key "alex" は 32 桁 16 進ではないため、この正規化を通過せず import skin identifier と衝突しない。
  """
  raw = str(value or "").strip().lower()
  if len(raw) != 32 or any(character not in "0123456789abcdef" for character in raw):
    return ""
  return raw
