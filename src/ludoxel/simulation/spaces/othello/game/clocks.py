# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

OTHELLO_TIME_CONTROL_OFF: str = "off"
OTHELLO_TIME_CONTROL_PER_MOVE_5S: str = "per_move_5s"
OTHELLO_TIME_CONTROL_PER_MOVE_10S: str = "per_move_10s"
OTHELLO_TIME_CONTROL_PER_MOVE_30S: str = "per_move_30s"
OTHELLO_TIME_CONTROL_PER_SIDE_1M: str = "per_side_1m"
OTHELLO_TIME_CONTROL_PER_SIDE_3M: str = "per_side_3m"
OTHELLO_TIME_CONTROL_PER_SIDE_5M: str = "per_side_5m"
OTHELLO_TIME_CONTROL_PER_SIDE_10M: str = "per_side_10m"
OTHELLO_TIME_CONTROL_PER_SIDE_20M: str = "per_side_20m"
OTHELLO_TIME_CONTROL_NONE: str = OTHELLO_TIME_CONTROL_OFF
OTHELLO_TIME_CONTROLS: tuple[str, ...] = (
  OTHELLO_TIME_CONTROL_OFF,
  OTHELLO_TIME_CONTROL_PER_MOVE_5S,
  OTHELLO_TIME_CONTROL_PER_MOVE_10S,
  OTHELLO_TIME_CONTROL_PER_MOVE_30S,
  OTHELLO_TIME_CONTROL_PER_SIDE_1M,
  OTHELLO_TIME_CONTROL_PER_SIDE_3M,
  OTHELLO_TIME_CONTROL_PER_SIDE_5M,
  OTHELLO_TIME_CONTROL_PER_SIDE_10M,
  OTHELLO_TIME_CONTROL_PER_SIDE_20M,
)
_TIME_CONTROL_LIMITS_S: dict[str, float | None] = {
  OTHELLO_TIME_CONTROL_OFF: None,
  OTHELLO_TIME_CONTROL_PER_MOVE_5S: 5.0,
  OTHELLO_TIME_CONTROL_PER_MOVE_10S: 10.0,
  OTHELLO_TIME_CONTROL_PER_MOVE_30S: 30.0,
  OTHELLO_TIME_CONTROL_PER_SIDE_1M: 60.0,
  OTHELLO_TIME_CONTROL_PER_SIDE_3M: 180.0,
  OTHELLO_TIME_CONTROL_PER_SIDE_5M: 300.0,
  OTHELLO_TIME_CONTROL_PER_SIDE_10M: 600.0,
  OTHELLO_TIME_CONTROL_PER_SIDE_20M: 1200.0,
}
_PER_MOVE_TIME_CONTROLS: tuple[str, ...] = (OTHELLO_TIME_CONTROL_PER_MOVE_5S, OTHELLO_TIME_CONTROL_PER_MOVE_10S, OTHELLO_TIME_CONTROL_PER_MOVE_30S)
DEFAULT_TIME_LIMIT_S: float = 20.0 * 60.0


def normalize_time_control(value: object, *, default: str = OTHELLO_TIME_CONTROL_PER_SIDE_20M) -> str:
  """I define N_t(x) in T, where T is the finite set of supported timer modes. I resolve previous aliases such as `none` and `unlimited` into `off`, then I accept only canonical members of T so that persistence and UI binding operate over a single stable identifier set."""
  raw = str(value).strip().lower()
  if raw in ("no_limit", "unlimited", "none"):
    raw = OTHELLO_TIME_CONTROL_OFF
  if raw in OTHELLO_TIME_CONTROLS:
    return raw
  fallback = str(default).strip().lower()
  if fallback in OTHELLO_TIME_CONTROLS:
    return fallback
  return OTHELLO_TIME_CONTROL_PER_SIDE_20M


def time_control_limit_s(value: object) -> float | None:
  """I define tau(t) as the nominal limit in seconds associated with a normalized timer mode t. I return None exactly for the timer-off state and a finite positive scalar for every bounded per-move or per-side mode."""
  return _TIME_CONTROL_LIMITS_S.get(normalize_time_control(value), float(DEFAULT_TIME_LIMIT_S))


def time_control_is_per_move(value: object) -> bool:
  """I define chi_move(t) = 1 iff the normalized timer mode is constrained per move rather than per side. I use this predicate at turn transition so that only the active side clock is reloaded in sudden-death move-timer modes."""
  return normalize_time_control(value) in _PER_MOVE_TIME_CONTROLS


def time_control_display_name(value: object) -> str:
  """I define L_t : T -> HumanReadable by a total presentation map over the canonical timer domain. This map is deliberately non-invertible at the UI layer because serialization remains governed by the canonical identifiers rather than by labels."""
  normalized = normalize_time_control(value)
  if normalized == OTHELLO_TIME_CONTROL_OFF:
    return "Timer off"
  if normalized == OTHELLO_TIME_CONTROL_PER_MOVE_5S:
    return "5 seconds per move"
  if normalized == OTHELLO_TIME_CONTROL_PER_MOVE_10S:
    return "10 seconds per move"
  if normalized == OTHELLO_TIME_CONTROL_PER_MOVE_30S:
    return "30 seconds per move"
  if normalized == OTHELLO_TIME_CONTROL_PER_SIDE_1M:
    return "1 minute per side"
  if normalized == OTHELLO_TIME_CONTROL_PER_SIDE_3M:
    return "3 minutes per side"
  if normalized == OTHELLO_TIME_CONTROL_PER_SIDE_5M:
    return "5 minutes per side"
  if normalized == OTHELLO_TIME_CONTROL_PER_SIDE_10M:
    return "10 minutes per side"
  return "20 minutes per side"
