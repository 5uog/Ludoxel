# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ludoxel.foundations.mathematics.scalars.numeric import clampi
from ludoxel.simulation.spaces.othello.game.sides import BOARD_CELL_COUNT, SIDE_EMPTY, normalize_side, side_name

OTHELLO_ANIMATION_OFF: str = "off"
OTHELLO_ANIMATION_FAST: str = "fast"
OTHELLO_ANIMATION_SLOW: str = "slow"
OTHELLO_ANIMATION_MODES: tuple[str, ...] = (OTHELLO_ANIMATION_OFF, OTHELLO_ANIMATION_FAST, OTHELLO_ANIMATION_SLOW)


def normalize_animation_mode(value: object, *, default: str = OTHELLO_ANIMATION_OFF) -> str:
  raw = str(value).strip().lower()
  if raw in ("none", "disabled", "simultaneous"):
    raw = OTHELLO_ANIMATION_OFF
  if raw in OTHELLO_ANIMATION_MODES:
    return raw
  fallback = str(default).strip().lower()
  if fallback in OTHELLO_ANIMATION_MODES:
    return fallback
  return OTHELLO_ANIMATION_OFF


def animation_mode_display_name(value: object) -> str:
  normalized = normalize_animation_mode(value)
  if normalized == OTHELLO_ANIMATION_SLOW:
    return "Ripple slow"
  if normalized == OTHELLO_ANIMATION_FAST:
    return "Ripple fast"
  return "Animation off"


@dataclass(frozen=True)
class OthelloAnimationState:
  square_index: int
  from_side: int
  to_side: int
  elapsed_s: float = 0.0
  duration_s: float = 0.22
  start_delay_s: float = 0.0
  lift_height: float = 0.075

  def normalized(self) -> "OthelloAnimationState":
    try:
      square_index = int(self.square_index)
    except Exception:
      square_index = 0
    square_index = clampi(square_index, 0, BOARD_CELL_COUNT - 1)
    elapsed = max(0.0, float(self.elapsed_s))
    duration = max(1e-6, float(self.duration_s))
    start_delay = max(0.0, float(self.start_delay_s))
    lift = max(0.0, float(self.lift_height))
    return OthelloAnimationState(square_index=int(square_index), from_side=normalize_side(self.from_side), to_side=normalize_side(self.to_side), elapsed_s=float(elapsed), duration_s=float(duration), start_delay_s=float(start_delay), lift_height=float(lift))

  def total_duration_s(self) -> float:
    normalized = self.normalized()
    return float(normalized.start_delay_s) + float(normalized.duration_s)

  def to_dict(self) -> dict[str, Any]:
    normalized = self.normalized()
    return {
      "square_index": int(normalized.square_index),
      "from_side": str(side_name(normalized.from_side)),
      "to_side": str(side_name(normalized.to_side)),
      "elapsed_s": float(normalized.elapsed_s),
      "duration_s": float(normalized.duration_s),
      "start_delay_s": float(normalized.start_delay_s),
      "lift_height": float(normalized.lift_height),
    }

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "OthelloAnimationState":
    if not isinstance(data, dict):
      return OthelloAnimationState(square_index=0, from_side=SIDE_EMPTY, to_side=SIDE_EMPTY)
    return OthelloAnimationState(
      square_index=int(data.get("square_index", 0)),
      from_side=normalize_side(data.get("from_side", SIDE_EMPTY)),
      to_side=normalize_side(data.get("to_side", SIDE_EMPTY)),
      elapsed_s=float(data.get("elapsed_s", 0.0)),
      duration_s=float(data.get("duration_s", 0.22)),
      start_delay_s=float(data.get("start_delay_s", 0.0)),
      lift_height=float(data.get("lift_height", 0.075)),
    ).normalized()
