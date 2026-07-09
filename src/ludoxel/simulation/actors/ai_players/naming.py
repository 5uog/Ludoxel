# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import re

from ludoxel.foundations.text.format_codes import strip_formatting

AI_NAME_BODY_MIN_LENGTH: int = 1
AI_NAME_BODY_MAX_LENGTH: int = 16
AI_NAME_SUFFIX_MIN: int = 1
AI_NAME_SUFFIX_MAX: int = 9999
AI_DEFAULT_NAME_BODY: str = "AI"

_AI_NAME_BODY_PATTERN = re.compile(r"\A[A-Za-z][A-Za-z0-9]{0,15}\Z")
_AI_NAME_SUFFIX_PATTERN = re.compile(r"\A[0-9]{4}\Z")


def ai_plain_display_name(name: object) -> str:
  return strip_formatting(str(name)).strip()


def split_ai_display_name(name: object) -> tuple[str, int | None] | None:
  text = ai_plain_display_name(name)
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
  if suffix is None:
    return str(body)
  return f"{str(body)}#{int(suffix):04d}"


def ai_display_name_format_error(name: object) -> str | None:
  text = ai_plain_display_name(name)
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
  return ai_plain_display_name(name).casefold()


def allocate_suffixed_ai_name(body: str, taken_keys: set[str]) -> str | None:
  for suffix in range(int(AI_NAME_SUFFIX_MIN), int(AI_NAME_SUFFIX_MAX) + 1):
    candidate = format_ai_display_name(str(body), int(suffix))
    if ai_name_duplicate_key(candidate) not in taken_keys:
      return candidate
  return None


def allocate_default_spawn_ai_name(taken_keys: set[str]) -> str | None:
  return allocate_suffixed_ai_name(str(AI_DEFAULT_NAME_BODY), taken_keys)
