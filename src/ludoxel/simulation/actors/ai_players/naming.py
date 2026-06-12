# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import re

AI_NAME_BODY_MIN_LENGTH: int = 1
AI_NAME_BODY_MAX_LENGTH: int = 16
AI_NAME_SUFFIX_MIN: int = 1
AI_NAME_SUFFIX_MAX: int = 9999
AI_DEFAULT_NAME_BODY: str = "AI"

_AI_NAME_BODY_PATTERN = re.compile(r"\A[A-Za-z][A-Za-z0-9]{0,15}\Z")
_AI_NAME_SUFFIX_PATTERN = re.compile(r"\A[0-9]{4}\Z")


def split_ai_display_name(name: object) -> tuple[str, int | None] | None:
  """
  AI の表示名を本体部と数値 suffix へ分解する。
  入力は任意 object を許容し、文字列化と前後空白除去の後、`Body` 形式は `(body, None)`、`Body#NNNN` 形式は `(body, int(NNNN))` を返す。
  本体部が英字始まりの英数字 1〜16 文字でない場合、`#` が二回以上現れる場合、suffix が 4 桁の `0001` 〜 `9999` でない場合は、不正形式として None を返す。
  返値の suffix は zero padding を除いた int であり、表示へ戻す際は format_ai_display_name() で再び 4 桁へ固定する。
  """
  text = str(name).strip()
  if "#" not in text:
    if _AI_NAME_BODY_PATTERN.match(text) is None:
      return None
    return (text, None)
  head, separator, tail = text.partition("#")
  del separator
  if "#" in tail:
    return None
  if _AI_NAME_BODY_PATTERN.match(head) is None:
    return None
  if _AI_NAME_SUFFIX_PATTERN.match(tail) is None:
    return None
  suffix = int(tail)
  if suffix < int(AI_NAME_SUFFIX_MIN) or suffix > int(AI_NAME_SUFFIX_MAX):
    return None
  return (head, int(suffix))


def format_ai_display_name(body: str, suffix: int | None) -> str:
  """
  本体部と任意の数値 suffix から AI の表示名を構成する。
  suffix が None の場合は本体部だけを返し、suffix が与えられた場合は `Body#NNNN` 形式の 4 桁 zero padding 表示へ固定して返す。
  suffix の値域検査は呼び出し側が split_ai_display_name() 又は allocate 系 helper で保証する前提であり、この関数は表示形式の一意性だけを担う。
  """
  if suffix is None:
    return str(body)
  return f"{str(body)}#{int(suffix):04d}"


def ai_display_name_format_error(name: object) -> str | None:
  """
  AI の表示名が形式規則を満たすかを検査し、満たさない場合に UI 表示可能な英文 error message を返す。
  検査対象は文字列化と前後空白除去後の値であり、空文字、英字以外で始まる本体、英数字以外の文字、16 文字を超える本体、不正な `#NNNN` suffix を区別して報告する。
  形式が有効な場合は None を返す。重複検査は生存 actor 集合を所有する AiPlayerManager 側の責務であり、この関数は形式だけを判定する。
  """
  text = str(name).strip()
  if not text:
    return "AI name cannot be empty."
  body = text.partition("#")[0]
  if not body:
    return "AI name must start with its name body before '#'."
  if body[0].isdigit():
    return "AI name cannot start with a number."
  if _AI_NAME_BODY_PATTERN.match(body) is None:
    if len(body) > int(AI_NAME_BODY_MAX_LENGTH):
      return f"AI name body must be at most {int(AI_NAME_BODY_MAX_LENGTH)} characters."
    return "AI name body may contain only letters and digits."
  if "#" not in text:
    return None
  if split_ai_display_name(text) is None:
    return f"Name suffix must have the form #0001 to #{int(AI_NAME_SUFFIX_MAX):04d}."
  return None


def ai_name_duplicate_key(name: object) -> str:
  """
  生存 AI 間の表示名重複判定に用いる正規化 key を返す。
  保存値と表示値は入力された大文字小文字をそのまま保持する一方、重複判定は casefold による case-insensitive 比較とする。
  この方針は、player name 側に重複概念と case 規則が存在しないため本実装で確定したものであり、nametag 上で視覚的に区別できない `AI` と `ai` の併存を防ぐことを目的とする。
  """
  return str(name).strip().casefold()


def allocate_suffixed_ai_name(body: str, taken_keys: set[str]) -> str | None:
  """
  指定した本体部に対し、`#0001` から `#9999` の範囲で未使用の最小 suffix を持つ表示名を割り当てる。
  taken_keys は ai_name_duplicate_key() で正規化済みの生存 AI 名集合であり、suffix 候補を順に照合して最初の空きを返す。
  全 suffix が使用済みの場合は None を返し、呼び出し側はこれを fallback error(同一本体名の numbered variant 枯渇)として扱う。
  """
  for suffix in range(int(AI_NAME_SUFFIX_MIN), int(AI_NAME_SUFFIX_MAX) + 1):
    candidate = format_ai_display_name(str(body), int(suffix))
    if ai_name_duplicate_key(candidate) not in taken_keys:
      return candidate
  return None


def allocate_default_spawn_ai_name(taken_keys: set[str]) -> str | None:
  """
  spawn egg で召喚された AI の既定表示名を `AI#0001` 形式で割り当てる。
  本体名 `AI` を使う既存生存 AI の有無にかかわらず suffix 付きの候補だけを探索し、未使用の最小番号を返す。
  `AI#0001` から `AI#9999` がすべて生存 AI に使用されている場合は None を返し、呼び出し側は spawn を失敗として扱う。
  """
  return allocate_suffixed_ai_name(str(AI_DEFAULT_NAME_BODY), taken_keys)
