# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import unicodedata
from random import Random

WIDTH_CLASS_SPACE: str = "space"
WIDTH_CLASS_WIDE: str = "wide"
WIDTH_CLASS_NARROW: str = "narrow"

_WIDE_POOL: str = "あいうえおカキクケコ漢字記号工夫森林山川天空雲雨日月火水木金土"
_NARROW_POOL: str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&?/\\|=+*"


def width_class_for_char(ch: str) -> str:
  if not ch:
    return WIDTH_CLASS_NARROW
  if ch.isspace():
    return WIDTH_CLASS_SPACE
  if unicodedata.east_asian_width(ch) in ("W", "F"):
    return WIDTH_CLASS_WIDE
  return WIDTH_CLASS_NARROW


def obfuscation_pool_for_class(width_class: str) -> str:
  if str(width_class) == WIDTH_CLASS_WIDE:
    return _WIDE_POOL
  return _NARROW_POOL


def obfuscated_char_for(ch: str, rng: Random) -> str:
  width_class = width_class_for_char(ch)
  if width_class == WIDTH_CLASS_SPACE:
    return ch
  pool = obfuscation_pool_for_class(width_class)
  return pool[rng.randrange(len(pool))]
