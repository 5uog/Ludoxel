# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


def clampi(x: int, lo: int, hi: int) -> int:
  """
  整数値 `x` を閉区間 `[lo, hi]` へ射影する。
  規則は `x < lo` のとき `lo`、`x > hi` のとき `hi`、その他は `x` であり、
  hotbar index、render distance、Othello 盤面値など有限整数領域の基礎演算として使われる。
  """
  value = int(x)
  low = int(lo)
  high = int(hi)
  if value < low:
    return low
  if value > high:
    return high
  return value


def clampf(x: float, lo: float, hi: float) -> float:
  """
  実数値 `x` を閉区間 `[lo, hi]` へ射影する。
  規則は `x < lo` のとき `lo`、`x > hi` のとき `hi`、その他は `x` であり、
  音量、強度、timer、animation progress、renderer preference の有限範囲を共有して固定する。
  """
  value = float(x)
  low = float(lo)
  high = float(hi)
  if value < low:
    return low
  if value > high:
    return high
  return value


def clamp01f(x: float) -> float:
  """
  実数値を閉区間 `[0, 1]` へ射影する `clampf` の特殊形である。
  透明度、補間率、正規化済み UV 比率、強度係数など単位区間を値域とする量を呼び出し側で明示できる。
  """
  return clampf(float(x), 0.0, 1.0)


def round_clampi(x: float, lo: int, hi: int) -> int:
  """
  実数制御値を Python の `round` で整数化し、その後 `[lo, hi]` へ射影する。
  settings slider など連続入力から離散的な個数又は index を得る場合に、丸め規則と範囲制限を一つの処理として固定する。
  """
  return clampi(int(round(float(x))), int(lo), int(hi))


def coerce_clampi(value: object, *, default: int, lo: int, hi: int) -> int:
  """
  外部入力を整数へ変換し、失敗時は `default` を採用した後で `[lo, hi]` へ射影する。
  返値は常に有効範囲内の `int` であり、保存値や UI 入力の破損が hotbar、設定値、盤面 index の未定義参照へ進まない。
  """
  try:
    numeric = int(value)
  except Exception:
    numeric = int(default)
  return clampi(int(numeric), int(lo), int(hi))


def coerce_clampf(value: object, *, default: float, lo: float, hi: float) -> float:
  """
  外部入力を実数へ変換し、失敗時は `default` を採用した後で `[lo, hi]` へ射影する。
  返値は常に有効範囲内の `float` であり、renderer、audio、runtime preference に渡る scalar の境界条件をこの層で固定する。
  """
  try:
    numeric = float(value)
  except Exception:
    numeric = float(default)
  return clampf(float(numeric), float(lo), float(hi))


def lerpf(a: float, b: float, t: float) -> float:
  """
  二つの実数 `a` と `b` の affine interpolation を `a + (b - a) * t` として計算する。
  `t` はこの関数内で clamp されないため、呼び出し側は補間、外挿、animation easing のどの意味で用いるかを事前に決める必要がある。
  """
  return float(a) + (float(b) - float(a)) * float(t)
