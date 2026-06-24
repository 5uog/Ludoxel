# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

PLAYER_REGEN_DEFAULT_ENABLED: bool = False
PLAYER_REGEN_DEFAULT_START_DELAY_S: float = 4.0
PLAYER_REGEN_DEFAULT_CAP_HP: float = 20.0
PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S: float = 80.0

PLAYER_REGEN_START_DELAY_MIN_S: float = 0.0
PLAYER_REGEN_START_DELAY_MAX_S: float = 600.0
PLAYER_REGEN_CAP_MIN_HP: float = 1.0
PLAYER_REGEN_CAP_MAX_HP: float = 1000.0
PLAYER_REGEN_TIME_TO_CAP_MIN_S: float = 0.5
PLAYER_REGEN_TIME_TO_CAP_MAX_S: float = 600.0


def _clamp_float(value: object, *, minimum: float, maximum: float, default: float) -> float:
  try:
    numeric = float(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    numeric = float(default)
  if numeric != numeric:
    numeric = float(default)
  return float(min(float(maximum), max(float(minimum), float(numeric))))


def normalize_player_regen_start_delay_s(value: object) -> float:
  return _clamp_float(value, minimum=float(PLAYER_REGEN_START_DELAY_MIN_S), maximum=float(PLAYER_REGEN_START_DELAY_MAX_S), default=float(PLAYER_REGEN_DEFAULT_START_DELAY_S))


def normalize_player_regen_cap_hp(value: object) -> float:
  return _clamp_float(value, minimum=float(PLAYER_REGEN_CAP_MIN_HP), maximum=float(PLAYER_REGEN_CAP_MAX_HP), default=float(PLAYER_REGEN_DEFAULT_CAP_HP))


def normalize_player_regen_time_to_cap_s(value: object) -> float:
  return _clamp_float(value, minimum=float(PLAYER_REGEN_TIME_TO_CAP_MIN_S), maximum=float(PLAYER_REGEN_TIME_TO_CAP_MAX_S), default=float(PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S))


@dataclass(frozen=True)
class PlayerRegenParams:
  enabled: bool = PLAYER_REGEN_DEFAULT_ENABLED
  start_delay_s: float = PLAYER_REGEN_DEFAULT_START_DELAY_S
  cap_hp: float = PLAYER_REGEN_DEFAULT_CAP_HP
  time_to_cap_s: float = PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S

  def normalized(self) -> "PlayerRegenParams":
    return PlayerRegenParams(
      enabled=bool(self.enabled),
      start_delay_s=normalize_player_regen_start_delay_s(self.start_delay_s),
      cap_hp=normalize_player_regen_cap_hp(self.cap_hp),
      time_to_cap_s=normalize_player_regen_time_to_cap_s(self.time_to_cap_s),
    )


DEFAULT_PLAYER_REGEN_PARAMS = PlayerRegenParams()
