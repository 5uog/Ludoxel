# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ludoxel.foundations.mathematics.scalars.numeric import coerce_clampf, coerce_clampi
from ludoxel.simulation.spaces.othello.game.animations import OTHELLO_ANIMATION_OFF, normalize_animation_mode
from ludoxel.simulation.spaces.othello.game.clocks import OTHELLO_TIME_CONTROL_PER_SIDE_20M, normalize_time_control, time_control_limit_s
from ludoxel.simulation.spaces.othello.game.sides import SIDE_BLACK, normalize_player_side, side_name

OTHELLO_DIFFICULTY_WEAK: str = "weak"
OTHELLO_DIFFICULTY_MEDIUM: str = "medium"
OTHELLO_DIFFICULTY_STRONG: str = "strong"
OTHELLO_DIFFICULTY_INSANE: str = "insane"
OTHELLO_DIFFICULTY_INSANE_PLUS: str = "insane_plus"
OTHELLO_DIFFICULTIES: tuple[str, ...] = (OTHELLO_DIFFICULTY_WEAK, OTHELLO_DIFFICULTY_MEDIUM, OTHELLO_DIFFICULTY_STRONG, OTHELLO_DIFFICULTY_INSANE, OTHELLO_DIFFICULTY_INSANE_PLUS)

OTHELLO_AI_THREAD_MIN: int = 1
OTHELLO_AI_THREAD_MAX: int = 8
OTHELLO_AI_HASH_LEVEL_MIN: int = 0
OTHELLO_AI_HASH_LEVEL_MAX: int = 6
OTHELLO_AI_SACRIFICE_LEVEL_MIN: int = 0
OTHELLO_AI_SACRIFICE_LEVEL_MAX: int = 4
OTHELLO_BOOK_LEARNING_DEPTH_MIN: int = 0
OTHELLO_BOOK_LEARNING_DEPTH_MAX: int = 60
DEFAULT_OTHELLO_THREAD_COUNT: int = 1
DEFAULT_OTHELLO_HASH_LEVEL: int = 2
DEFAULT_OTHELLO_SACRIFICE_LEVEL: int = 2
DEFAULT_OTHELLO_BOOK_LEARNING_DEPTH: int = 55
DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR: float = 22.0
DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR: float = 19.0
DEFAULT_OTHELLO_BOOK_LEAF_ERROR: float = 20.0
OTHELLO_BOOK_ERROR_MIN: float = 0.0
OTHELLO_BOOK_ERROR_MAX: float = 24.0


def normalize_difficulty(value: object, *, default: str = OTHELLO_DIFFICULTY_MEDIUM) -> str:
  """
  Othello engine difficulty token を有限集合へ正規化する。
  raw token は小文字化・trim され、既知の difficulty だけが採用され、未知値は fallback 又は medium へ収束する。
  """
  raw = str(value).strip().lower()
  if raw in OTHELLO_DIFFICULTIES:
    return raw
  fallback = str(default).strip().lower()
  if fallback in OTHELLO_DIFFICULTIES:
    return fallback
  return OTHELLO_DIFFICULTY_MEDIUM


def difficulty_display_name(value: object) -> str:
  """
  正規化済み difficulty を表示 label へ写す。
  engine mode の識別子と UI 文言を分けるため、presentation-only の射影として保持する。
  """
  normalized = normalize_difficulty(value)
  if normalized == OTHELLO_DIFFICULTY_WEAK:
    return "Weak"
  if normalized == OTHELLO_DIFFICULTY_MEDIUM:
    return "Medium"
  if normalized == OTHELLO_DIFFICULTY_STRONG:
    return "Strong"
  if normalized == OTHELLO_DIFFICULTY_INSANE:
    return "Insane"
  if normalized == OTHELLO_DIFFICULTY_INSANE_PLUS:
    return "Insane+"
  return "Medium"


def normalize_thread_count(value: object, *, default: int = DEFAULT_OTHELLO_THREAD_COUNT) -> int:
  """
  worker thread 数を整数へ変換し、許容される最小・最大値へ射影する。
  engine の process-management envelope を超える並列度を保存値から復元しない。
  """
  return coerce_clampi(value, default=int(default), lo=int(OTHELLO_AI_THREAD_MIN), hi=int(OTHELLO_AI_THREAD_MAX))


def normalize_hash_level(value: object, *, default: int = DEFAULT_OTHELLO_HASH_LEVEL) -> int:
  """
  hash level を整数へ変換し、transposition table の calibrated capacity 範囲へ射影する。
  保存値が過大でも無制限の memory growth へ進まない。
  """
  return coerce_clampi(value, default=int(default), lo=int(OTHELLO_AI_HASH_LEVEL_MIN), hi=int(OTHELLO_AI_HASH_LEVEL_MAX))


def normalize_sacrifice_level(value: object, *, default: int = DEFAULT_OTHELLO_SACRIFICE_LEVEL) -> int:
  """
  sacrifice profile selector を calibrated profile family の整数範囲へ射影する。
  後続の evaluation weight へ直接写されるため、範囲外の値を保持しない。
  """
  return coerce_clampi(value, default=int(default), lo=int(OTHELLO_AI_SACRIFICE_LEVEL_MIN), hi=int(OTHELLO_AI_SACRIFICE_LEVEL_MAX))


def normalize_book_learning_depth(value: object, *, default: int = DEFAULT_OTHELLO_BOOK_LEARNING_DEPTH) -> int:
  """
  opening-book learning depth を許容された整数範囲へ射影する。
  offline line expansion の search horizon を有限かつ明示的に制限するための正規化である。
  """
  return coerce_clampi(value, default=int(default), lo=int(OTHELLO_BOOK_LEARNING_DEPTH_MIN), hi=int(OTHELLO_BOOK_LEARNING_DEPTH_MAX))


def normalize_book_error(value: object, *, default: float) -> float:
  """
  book learning の error threshold を `[0, 24]` の実数範囲へ射影する。
  learning UI と persistence は無制限実数ではなく、調整済みの有限 error domain を共有する。
  """
  return coerce_clampf(value, default=float(default), lo=float(OTHELLO_BOOK_ERROR_MIN), hi=float(OTHELLO_BOOK_ERROR_MAX))


@dataclass(frozen=True)
class OthelloSettings:
  """
  persistent match configuration を保持する record である。
  difficulty、time control、animation、player side、sacrifice level、thread/hash、
  book-learning parameters は各許容領域に正規化され、game construction、UI、persistence が同じ値域を参照する。
  """

  difficulty: str = OTHELLO_DIFFICULTY_MEDIUM
  time_control: str = OTHELLO_TIME_CONTROL_PER_SIDE_20M
  animation_mode: str = OTHELLO_ANIMATION_OFF
  player_side: int = SIDE_BLACK
  sacrifice_level: int = DEFAULT_OTHELLO_SACRIFICE_LEVEL
  thread_count: int = DEFAULT_OTHELLO_THREAD_COUNT
  hash_level: int = DEFAULT_OTHELLO_HASH_LEVEL
  book_learning_depth: int = DEFAULT_OTHELLO_BOOK_LEARNING_DEPTH
  book_per_move_error: float = DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR
  book_cumulative_error: float = DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR
  book_leaf_error: float = DEFAULT_OTHELLO_BOOK_LEAF_ERROR

  def normalized(self) -> "OthelloSettings":
    """
    settings record の全 field を成分ごとに正規化し、冪等な正規形を返す。
    `N_S(N_S(S)) = N_S(S)` が成り立つことを persistence と controller が前提にする。
    """
    return OthelloSettings(
      difficulty=normalize_difficulty(self.difficulty),
      time_control=normalize_time_control(self.time_control),
      animation_mode=normalize_animation_mode(self.animation_mode),
      player_side=normalize_player_side(self.player_side),
      sacrifice_level=normalize_sacrifice_level(self.sacrifice_level),
      thread_count=normalize_thread_count(self.thread_count),
      hash_level=normalize_hash_level(self.hash_level),
      book_learning_depth=normalize_book_learning_depth(self.book_learning_depth),
      book_per_move_error=normalize_book_error(self.book_per_move_error, default=float(DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR)),
      book_cumulative_error=normalize_book_error(self.book_cumulative_error, default=float(DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR)),
      book_leaf_error=normalize_book_error(self.book_leaf_error, default=float(DEFAULT_OTHELLO_BOOK_LEAF_ERROR)),
    )

  def default_time_limit_s(self) -> float | None:
    """
    settings に保存された time-control token から nominal timer limit を取り出す。
    timer mode の分岐は clocks module に集約され、呼び出し側で重複しない。
    """
    return time_control_limit_s(self.time_control)

  def to_dict(self) -> dict[str, Any]:
    """
    正規化済み settings を stable scalar field の JSON map へ変換する。
    UI label ではなく意味を持つ identifier を保存するため、presentation 変更で state file が変質しない。
    """
    normalized = self.normalized()
    return {
      "difficulty": str(normalized.difficulty),
      "time_control": str(normalized.time_control),
      "animation_mode": str(normalized.animation_mode),
      "player_side": str(side_name(normalized.player_side)),
      "sacrifice_level": int(normalized.sacrifice_level),
      "thread_count": int(normalized.thread_count),
      "hash_level": int(normalized.hash_level),
      "book_learning_depth": int(normalized.book_learning_depth),
      "book_per_move_error": float(normalized.book_per_move_error),
      "book_cumulative_error": float(normalized.book_cumulative_error),
      "book_leaf_error": float(normalized.book_leaf_error),
    }

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "OthelloSettings":
    """
    信頼できない mapping から settings を復元し、各成分を独立に正規化する。
    欠落又は不正な payload は有効な既定値へ収束し、未定義の game configuration を作らない。
    """
    if not isinstance(data, dict):
      return OthelloSettings()
    return OthelloSettings(
      difficulty=normalize_difficulty(data.get("difficulty", OTHELLO_DIFFICULTY_MEDIUM)),
      time_control=normalize_time_control(data.get("time_control", OTHELLO_TIME_CONTROL_PER_SIDE_20M)),
      animation_mode=normalize_animation_mode(data.get("animation_mode", OTHELLO_ANIMATION_OFF)),
      player_side=normalize_player_side(data.get("player_side", SIDE_BLACK)),
      sacrifice_level=normalize_sacrifice_level(data.get("sacrifice_level", DEFAULT_OTHELLO_SACRIFICE_LEVEL)),
      thread_count=normalize_thread_count(data.get("thread_count", DEFAULT_OTHELLO_THREAD_COUNT)),
      hash_level=normalize_hash_level(data.get("hash_level", DEFAULT_OTHELLO_HASH_LEVEL)),
      book_learning_depth=normalize_book_learning_depth(data.get("book_learning_depth", DEFAULT_OTHELLO_BOOK_LEARNING_DEPTH)),
      book_per_move_error=normalize_book_error(data.get("book_per_move_error", DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR), default=float(DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR)),
      book_cumulative_error=normalize_book_error(data.get("book_cumulative_error", DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR), default=float(DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR)),
      book_leaf_error=normalize_book_error(data.get("book_leaf_error", DEFAULT_OTHELLO_BOOK_LEAF_ERROR), default=float(DEFAULT_OTHELLO_BOOK_LEAF_ERROR)),
    )
