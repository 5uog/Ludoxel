# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Mapping
from typing import Any

_BOOL_TRUE_TOKENS = frozenset({"1", "true", "yes", "on"})
_BOOL_FALSE_TOKENS = frozenset({"0", "false", "no", "off"})


def coerce_float(value: object, default: float) -> float:
  """
  任意の入力を `float(value)` で実数へ変換し、失敗時は `float(default)` を返す。
  返値は例外送出を伴わない `float` であり、保存値復元、UI 入力復元、
  runtime preference の正規化は malformed value を個別処理せず既定値へ退避できる。
  """
  try:
    return float(value)
  except Exception:
    return float(default)


def coerce_int(value: object, default: int) -> int:
  """
  任意の入力を `int(value)` で整数へ変換し、失敗時は `int(default)` を返す。
  返値は例外送出を伴わない `int` であり、index、個数、version、
  座標成分の復元処理は欠落値と変換不能値を同じ既定値規則で扱う。
  """
  try:
    return int(value)
  except Exception:
    return int(default)


def coerce_bool(value: object, default: bool) -> bool:
  """
  bool、数値、文字列を Ludoxel の保存形式で使う真偽値へ正規化する。
  bool はそのまま、数値は `x != 0`、文字列は `1/true/yes/on` と `0/false/no/off` の token 集合で判定し、
  判定不能な値は `default` の bool 値へ退避する。
  """
  if isinstance(value, bool):
    return bool(value)
  if isinstance(value, (int, float)):
    return bool(value)
  if isinstance(value, str):
    token = str(value).strip().lower()
    if token in _BOOL_TRUE_TOKENS:
      return True
    if token in _BOOL_FALSE_TOKENS:
      return False
  return bool(default)


def coerce_str(value: object, default: str) -> str:
  """
  `None` を欠落値として扱い、それ以外の入力を `str(value)` へ変換する。
  保存 payload の識別子、label、path 断片を復元する呼び出し側は、
  `None` による例外経路を作らず指定既定値を得る。
  """
  if value is None:
    return str(default)
  return str(value)


def mapping_float(d: Mapping[str, Any], key: str, default: float) -> float:
  """
  mapping から指定 key を読み取り、欠落又は変換不能時に既定値を返す実数射影である。
  `d.get(key, default)` を `coerce_float` へ通すため、
  application schema は key ごとの try 文を持たずに `float` 値を復元できる。
  """
  return coerce_float(d.get(str(key), default), float(default))


def mapping_int(d: Mapping[str, Any], key: str, default: int) -> int:
  """
  mapping から指定 key を読み取り、欠落又は変換不能時に既定値を返す整数射影である。
  保存 version、hotbar index、window geometry、
  個数などの field はこの関数により同じ `int` 変換規則を共有する。
  """
  return coerce_int(d.get(str(key), default), int(default))


def mapping_bool(d: Mapping[str, Any], key: str, default: bool) -> bool:
  """
  mapping から指定 key を読み取り、共通 token 規則で bool 値へ復元する。
  保存形式ごとに true/false の文字列表現を重複定義せず、判定不能値は呼び出し側が渡した既定値へ退避する。
  """
  return coerce_bool(d.get(str(key), default), bool(default))


def mapping_str(d: Mapping[str, Any], key: str, default: str) -> str:
  """
  mapping から指定 key を読み取り、`None` 又は欠落時に既定値を返す文字列射影である。
  UI label、保存識別子、設定名の復元はこの関数により、欠落値を空文字列又は指定既定値へ安定して寄せる。
  """
  return coerce_str(d.get(str(key), default), str(default))
