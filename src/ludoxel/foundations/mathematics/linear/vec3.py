# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class Vec3:
  """
  Ludoxel の基礎三次元 vector を不変の三成分実数として表す。
  成分 `x`、`y`、`z` は world 座標、速度、方向、AABB 境界の共通表現であり、
  simulation、application persistence、renderer visual はこの型を低水準の幾何値として共有する。
  """
  x: float
  y: float
  z: float

  def __add__(self, o: "Vec3") -> "Vec3":
    """
    同じ座標系に属する二つの `Vec3` を成分ごとに加算する。
    返値は `(x1+x2, y1+y2, z1+z2)` を持つ新しい `Vec3` であり、元の vector は不変のまま保持される。
    """
    return Vec3(self.x + o.x, self.y + o.y, self.z + o.z)

  def __sub__(self, o: "Vec3") -> "Vec3":
    """
    同じ座標系に属する二つの `Vec3` を成分ごとに減算する。
    返値は `(x1-x2, y1-y2, z1-z2)` を持つ displacement vector として扱われ、距離、方向、ray 構成の基礎演算になる。
    """
    return Vec3(self.x - o.x, self.y - o.y, self.z - o.z)

  def __mul__(self, k: float) -> "Vec3":
    """
    `Vec3` の全成分に scalar `k` を乗じた新しい vector を返す。
    `__rmul__` も同じ実装を参照するため、`v * k` と `k * v` は同じ成分演算として扱われる。
    """
    return Vec3(self.x * k, self.y * k, self.z * k)

  __rmul__ = __mul__

  def dot(self, o: "Vec3") -> float:
    """
    二つの `Vec3` の内積 `x1*x2 + y1*y2 + z1*z2` を返す。
    view matrix の平行移動成分、角度判定、投影量の計算はこの scalar 値に依存する。
    """
    return self.x * o.x + self.y * o.y + self.z * o.z

  def cross(self, o: "Vec3") -> "Vec3":
    """
    二つの `Vec3` の外積を右手系の成分式で返す。
    返値は両 vector に直交する方向を表し、camera basis や横方向判定はこの向きの規約に依存する。
    """
    return Vec3(self.y * o.z - self.z * o.y, self.z * o.x - self.x * o.z, self.x * o.y - self.y * o.x)

  def length(self) -> float:
    """
    三成分の Euclidean norm `sqrt(x^2 + y^2 + z^2)` を返す。
    方向 vector の正規化、速度量、距離判定はこの非負実数を長さとして扱う。
    """
    return math.sqrt(self.x * self.x + self.y * self.y + self.z * self.z)

  def normalized(self) -> "Vec3":
    """
    長さが正の vector を単位長へ射影し、極小 vector を零 vector に退避する。
    閾値は `1e-12` であり、これ以下の norm は除算を行わず `(0, 0, 0)` を返すため、
    camera、ray、AI navigation は NaN を生じさせずに方向値を扱える。
    """
    n = self.length()
    if n <= 1e-12:
      return Vec3(0.0, 0.0, 0.0)
    inv = 1.0 / n
    return Vec3(self.x * inv, self.y * inv, self.z * inv)
