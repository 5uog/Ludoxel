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
  """
  side token を `0 = empty`、`1 = black`、`2 = white` の符号化へ正規化する。
  文字列 alias を有限 map で先に解決し、解決できない値は数値変換を試み、許容集合外なら fallback へ落とす。
  """
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
  """
  `black` と `white` を入れ替え、`empty` を固定点として保つ involution である。
  `s in {1, 2}` では `other_side(other_side(s)) = s` が成立する。
  """
  norm = normalize_side(side, default=SIDE_EMPTY)
  if norm == SIDE_BLACK:
    return SIDE_WHITE
  if norm == SIDE_WHITE:
    return SIDE_BLACK
  return SIDE_EMPTY


def normalize_player_side(value: object, *, default: int = SIDE_BLACK) -> int:
  """
  player side として使用できる side token へ正規化する。
  `empty` に潰れた値は fallback の player side へ射影され、turn assignment と AI-side derivation が全域的に定義される。
  """
  side = normalize_side(value, default=default)
  if side == SIDE_EMPTY:
    return SIDE_BLACK if int(default) == SIDE_EMPTY else normalize_side(default, default=SIDE_BLACK)
  return side


def side_name(side: int) -> str:
  """
  正規化済み side token を `empty`、`black`、`white` の textual identifier へ写す。
  persistence payload と message generation はこの map により side の意味を明示する。
  """
  norm = normalize_side(side, default=SIDE_EMPTY)
  if norm == SIDE_BLACK:
    return "black"
  if norm == SIDE_WHITE:
    return "white"
  return "empty"
