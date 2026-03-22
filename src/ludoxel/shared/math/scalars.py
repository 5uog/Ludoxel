# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations


def clampi(x: int, lo: int, hi: int) -> int:
    """I define clamp_Z(x; lo, hi) = lo if x < lo, = hi if x > hi, and = x otherwise. This is the canonical integer interval projection that I reuse across settings, timing, and index normalization."""
    value = int(x)
    low = int(lo)
    high = int(hi)
    if value < low:
        return low
    if value > high:
        return high
    return value


def clampf(x: float, lo: float, hi: float) -> float:
    """I define clamp_R(x; lo, hi) = lo if x < lo, = hi if x > hi, and = x otherwise. I treat this scalar projector as the primary bounded-real primitive inside shared numeric normalization code."""
    value = float(x)
    low = float(lo)
    high = float(hi)
    if value < low:
        return low
    if value > high:
        return high
    return value


def clamp01f(x: float) -> float:
    """I define clamp01(x) = clamp_R(x; 0, 1). This specialization exists because [0,1] is the dominant codomain for normalized strengths, opacities, and interpolation parameters."""
    return clampf(float(x), 0.0, 1.0)


def round_clampi(x: float, lo: int, hi: int) -> int:
    """I define round_clamp(x; lo, hi) = clamp_Z(round(x); lo, hi). I use this map whenever a real-valued control variable must be quantized onto a bounded integer slider domain."""
    return clampi(int(round(float(x))), int(lo), int(hi))


def coerce_clampi(value: object, *, default: int, lo: int, hi: int) -> int:
    """I define C_Z(value) = clamp_Z(int(value), lo, hi) with total fallback to `default` on coercion failure. This keeps persistence and UI decoding total on malformed scalar input."""
    try:
        numeric = int(value)
    except Exception:
        numeric = int(default)
    return clampi(int(numeric), int(lo), int(hi))


def coerce_clampf(value: object, *, default: float, lo: float, hi: float) -> float:
    """I define C_R(value) = clamp_R(float(value), lo, hi) with total fallback to `default` on coercion failure. I rely on this operator whenever an external scalar enters the codebase through persistence or Qt widgets."""
    try:
        numeric = float(value)
    except Exception:
        numeric = float(default)
    return clampf(float(numeric), float(lo), float(hi))


def lerpf(a: float, b: float, t: float) -> float:
    """I define lerp(a,b,t) = a + (b - a)*t. I keep this affine interpolant in shared math because it is structurally independent of any particular renderer or gameplay subsystem."""
    return float(a) + (float(b) - float(a)) * float(t)
