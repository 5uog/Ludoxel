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
  """I define N_a(x) in A, where A = {off, fast, slow} is the animation-mode alphabet. I collapse previous disabled-state spellings onto `off` and reject every value outside A so that rendered flip timing remains formally well-defined."""
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
  """I define L_a : A -> HumanReadable by a total label map over animation modes. I keep this projection separate from N_a so that storage and presentation remain decoupled."""
  normalized = normalize_animation_mode(value)
  if normalized == OTHELLO_ANIMATION_SLOW:
    return "Ripple slow"
  if normalized == OTHELLO_ANIMATION_FAST:
    return "Ripple fast"
  return "Animation off"


@dataclass(frozen=True)
class OthelloAnimationState:
  """I model one disc-flip trajectory as alpha = (square, from, to, elapsed, duration, delay, lift). The effective phase is t = clamp((elapsed - delay)/duration, 0, 1), and I preserve delay explicitly so that ripple schedules can be represented without duplicating per-mode timing code in the renderer."""

  square_index: int
  from_side: int
  to_side: int
  elapsed_s: float = 0.0
  duration_s: float = 0.22
  start_delay_s: float = 0.0
  lift_height: float = 0.075

  def normalized(self) -> "OthelloAnimationState":
    """I define N_alpha(alpha_raw) by clamping the square index into [0,63], enforcing elapsed >= 0, duration > 0, delay >= 0, and lift >= 0, and normalizing both side tokens. This prevents the renderer from receiving singular or negative timing parameters."""
    try:
      square_index = int(self.square_index)
    except Exception:
      square_index = 0
    square_index = clampi(square_index, 0, BOARD_CELL_COUNT - 1)
    elapsed = max(0.0, float(self.elapsed_s))
    duration = max(1e-6, float(self.duration_s))
    start_delay = max(0.0, float(self.start_delay_s))
    lift = max(0.0, float(self.lift_height))
    return OthelloAnimationState(
      square_index=int(square_index),
      from_side=normalize_side(self.from_side),
      to_side=normalize_side(self.to_side),
      elapsed_s=float(elapsed),
      duration_s=float(duration),
      start_delay_s=float(start_delay),
      lift_height=float(lift),
    )

  def total_duration_s(self) -> float:
    """I define T(alpha) = delay + duration. I use this scalar as the completion threshold in the match controller so that staggered animations terminate only after the last delayed phase has elapsed."""
    normalized = self.normalized()
    return float(normalized.start_delay_s) + float(normalized.duration_s)

  def to_dict(self) -> dict[str, Any]:
    """I define phi_alpha : alpha -> JSONMap by serializing the normalized trajectory state, including its explicit start delay. I persist delay because ripple schedules are part of the semantic match state rather than transient renderer-local data."""
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
    """I define weak deserialization for alpha by reading an arbitrary mapping and then applying N_alpha. This guarantees that restored animation state remains renderable even when persistence inputs are partial or stale."""
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
