# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


def clampi(x: int, lo: int, hi: int) -> int:
  value = int(x)
  low = int(lo)
  high = int(hi)
  if value < low:
    return low
  if value > high:
    return high
  return value


def clampf(x: float, lo: float, hi: float) -> float:
  value = float(x)
  low = float(lo)
  high = float(hi)
  if value < low:
    return low
  if value > high:
    return high
  return value


def clamp01f(x: float) -> float:
  return clampf(float(x), 0.0, 1.0)


def round_clampi(x: float, lo: int, hi: int) -> int:
  return clampi(int(round(float(x))), int(lo), int(hi))


def coerce_clampi(value: object, *, default: int, lo: int, hi: int) -> int:
  try:
    numeric = int(value)
  except Exception:
    numeric = int(default)
  return clampi(int(numeric), int(lo), int(hi))


def coerce_clampf(value: object, *, default: float, lo: float, hi: float) -> float:
  try:
    numeric = float(value)
  except Exception:
    numeric = float(default)
  return clampf(float(numeric), float(lo), float(hi))


def lerpf(a: float, b: float, t: float) -> float:
  return float(a) + (float(b) - float(a)) * float(t)
