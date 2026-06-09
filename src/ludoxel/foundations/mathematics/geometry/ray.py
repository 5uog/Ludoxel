# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


@dataclass(frozen=True)
class Ray:
  """
  始点 `origin` と方向 `direction` により三次元 ray を表す基礎型である。
  `direction` の正規化は型の生成時には強制されず、picking、camera collision、
  ray-AABB 判定の呼び出し側が距離 parameter `t` の単位を方向 vector の長さに対応させる。
  """

  origin: Vec3
  direction: Vec3
