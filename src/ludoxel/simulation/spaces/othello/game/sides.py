# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

SIDE_EMPTY: int = 0
SIDE_BLACK: int = 1
SIDE_WHITE: int = 2
BOARD_CELL_COUNT: int = 64

_SIDE_TOKENS: dict[int, str] = {SIDE_EMPTY: ".", SIDE_BLACK: "B", SIDE_WHITE: "W"}
_TOKEN_SIDES: dict[str, int] = {value: key for key, value in _SIDE_TOKENS.items()}


def normalize_side(value: object, *, default: int = SIDE_EMPTY) -> int:
  """I define N_s(x) in {0,1,2} as the canonical side normalizer with the encoding 0 = empty, 1 = black, and 2 = white. I first resolve string aliases through a finite lexical map, I then coerce numerically when lexical resolution is absent, and I finally return the designated fallback whenever x is not admissible in the state space of a disc side."""
  if isinstance(value, str):
    raw = str(value).strip().lower()
    if raw in ("black", "player_first", "first", "b"):
      return SIDE_BLACK
    if raw in ("white", "player_second", "second", "w"):
      return SIDE_WHITE
    if raw in ("empty", ".", "none", ""):
      return SIDE_EMPTY

  try:
    side = int(value)
  except Exception:
    side = int(default)

  if side in (SIDE_EMPTY, SIDE_BLACK, SIDE_WHITE):
    return side
  fallback = int(default)
  if fallback in (SIDE_EMPTY, SIDE_BLACK, SIDE_WHITE):
    return fallback
  return SIDE_EMPTY


def other_side(side: int) -> int:
  """I define O(s) by O(1) = 2, O(2) = 1, and O(0) = 0. This involution satisfies O(O(s)) = s for s in {1,2} and preserves the empty element as a fixed point."""
  norm = normalize_side(side, default=SIDE_EMPTY)
  if norm == SIDE_BLACK:
    return SIDE_WHITE
  if norm == SIDE_WHITE:
    return SIDE_BLACK
  return SIDE_EMPTY


def normalize_player_side(value: object, *, default: int = SIDE_BLACK) -> int:
  """I define N_p(x) = N_s(x) with the additional constraint N_p(x) != 0. Whenever the raw value collapses to the empty side, I project it onto the designated player-side fallback so that turn assignment and AI-side derivation remain total."""
  side = normalize_side(value, default=default)
  if side == SIDE_EMPTY:
    return SIDE_BLACK if int(default) == SIDE_EMPTY else normalize_side(default, default=SIDE_BLACK)
  return side


def side_name(side: int) -> str:
  """I define L_s : {0,1,2} -> {empty,black,white} as the canonical textual projection of a normalized side token. I use this map in persistence payloads and message generation so that external state remains semantically explicit."""
  norm = normalize_side(side, default=SIDE_EMPTY)
  if norm == SIDE_BLACK:
    return "black"
  if norm == SIDE_WHITE:
    return "white"
  return "empty"
