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

AI_DEFAULT_HELD_ITEM_ID: str = "minecraft:oak_planks"

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
  """
  設定値として受け取った任意 object を有限 float へ変換し、与えられた閉区間へ収めて返す。
  float() が TypeError 又は ValueError を送出する入力、及び NaN は default へ退避し、default 自体も同じ区間へ clamp する。
  返値は AiSpawnEggSettings.normalized() と AiPlayerState.normalized() の自動回復 parameter が persistence と UI の双方から同一値域で復元されることを保証する。
  """
  try:
    numeric = float(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    numeric = float(default)
  if numeric != numeric:
    numeric = float(default)
  return float(min(float(maximum), max(float(minimum), float(numeric))))


def normalize_ai_regen_start_delay_s(value: object) -> float:
  """
  最終被弾から自動回復開始までの待機秒数を 0.0〜600.0 秒へ正規化する。
  既定値は Minecraft の自然回復周期に合わせた 4.0 秒であり、不正入力は既定値へ退避する。
  """
  return _clamp_float(value, minimum=float(AI_REGEN_START_DELAY_MIN_S), maximum=float(AI_REGEN_START_DELAY_MAX_S), default=float(AI_REGEN_DEFAULT_START_DELAY_S))


def normalize_ai_regen_interval_s(value: object) -> float:
  """
  自動回復 1 回あたりの間隔秒数を 0.05〜600.0 秒へ正規化する。
  既定値は 4.0 秒(4 秒ごとに 1 health point)であり、0 以下の値による無限回復 loop を値域下限で防ぐ。
  """
  return _clamp_float(value, minimum=float(AI_REGEN_INTERVAL_MIN_S), maximum=float(AI_REGEN_INTERVAL_MAX_S), default=float(AI_REGEN_DEFAULT_INTERVAL_S))


def normalize_ai_regen_amount_hp(value: object) -> float:
  """
  自動回復 1 回あたりの回復量を health points 単位で 0.05〜100.0 へ正規化する。
  既定値は 1.0(half heart)であり、1 heart は 2 health points に対応する。
  """
  return _clamp_float(value, minimum=float(AI_REGEN_AMOUNT_MIN_HP), maximum=float(AI_REGEN_AMOUNT_MAX_HP), default=float(AI_REGEN_DEFAULT_AMOUNT_HP))


def normalize_ai_regen_cap_hp(value: object) -> float:
  """
  自動回復の上限体力を health points 単位で 1.0〜1000.0 へ正規化する。
  既定値は 20.0 であり、実行時の有効上限は manager 側で min(cap, max_health) として適用される。
  """
  return _clamp_float(value, minimum=float(AI_REGEN_CAP_MIN_HP), maximum=float(AI_REGEN_CAP_MAX_HP), default=float(AI_REGEN_DEFAULT_CAP_HP))


@dataclass(frozen=True)
class AiSpawnEggSettings:
  """
  AI Settings overlay と spawn egg が往復させる actor 単位の設定一式を表す。
  name は `#` suffix を含む表示名全体であり、空文字は spawn 時の自動割当(`AI#0001` 形式)を要求する値として扱う。
  health_indicator は "off"、"above"、"below" の三値で既定は "above" であり、skin_mode は player skin 共有を表す "player"、同梱 Alex skin を表す "alex"、actor 固有 import skin を表す "custom" の三値で既定は "player" である。custom skin は file path ではなく opaque な skin_id で参照し、skin_id が空の場合は import skin の実体が無いため normalized() で skin_mode を "player" へ落とす。Alex skin は同梱 resource として常に解決できるため file 参照を要しない。
  自動回復 parameter は normalize_ai_regen_*() の値域、route 設定は従来どおり mode が route の場合にのみ意味を持つ。
  """

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
