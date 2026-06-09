# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math


def exp_alpha(rate: float, dt: float) -> float:
  """
  rate と経過時間 dt から指数平滑の混合係数 `1 - exp(-rate * dt)` を計算する。
  `rate` と `dt` はそれぞれ 0 以上へ下限処理され、どちらかが `1e-9` 以下の場合は 0.0 を返すため、時間停止時と無効 rate 時に補間が進まない。
  """
  r = float(max(0.0, rate))
  t = float(max(0.0, dt))

  if r <= 1e-9 or t <= 1e-9:
    return 0.0

  return 1.0 - math.exp(-r * t)
