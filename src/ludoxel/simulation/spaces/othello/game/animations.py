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
  """
  animation mode token を有限集合 `{off, fast, slow}` へ正規化する。
  過去の disabled 表記は `off` へ畳み込み、集合外の値は許容しないため、flip timing は常に定義済み mode に属する。
  """
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
  """
  正規化済み animation mode を表示 label へ写す全域的な map である。
  storage identifier と presentation label を分離し、UI 文言の変更が保存値へ影響しないようにする。
  """
  normalized = normalize_animation_mode(value)
  if normalized == OTHELLO_ANIMATION_SLOW:
    return "Ripple slow"
  if normalized == OTHELLO_ANIMATION_FAST:
    return "Ripple fast"
  return "Animation off"


@dataclass(frozen=True)
class OthelloAnimationState:
  """
  一つの disc flip trajectory を表す record である。
  square、from/to side、elapsed、duration、delay、lift を持ち、
  effective phase は `clamp((elapsed - delay) / duration, 0, 1)` として renderer が読める。
  """
  square_index: int
  from_side: int
  to_side: int
  elapsed_s: float = 0.0
  duration_s: float = 0.22
  start_delay_s: float = 0.0
  lift_height: float = 0.075

  def normalized(self) -> "OthelloAnimationState":
    """
    animation state の各成分を許容範囲へ正規化する。
    square は `[0, 63]`、elapsed と delay と lift は非負、duration は正、side token は canonical side に固定される。
    """
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
    """
    animation が完了する時刻を `delay + duration` として返す。
    match controller は staggered ripple の最後の delayed phase が終わるまで animation を継続する。
    """
    normalized = self.normalized()
    return float(normalized.start_delay_s) + float(normalized.duration_s)

  def to_dict(self) -> dict[str, Any]:
    """
    正規化済み trajectory を JSON map へ変換する。
    delay は ripple schedule の意味を持つ match state の一部であり、renderer-local 一時値として捨てない。
    """
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
    """
    任意 mapping から animation state を復元し、最後に正規化する。
    古い又は部分的な保存値でも renderer が処理可能な trajectory へ落とす。
    """
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
