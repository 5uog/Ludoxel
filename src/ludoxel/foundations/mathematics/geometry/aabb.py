# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


@dataclass(frozen=True)
class AABB:
  """
  world 空間又は block local 空間の軸平行境界箱を最小点 `mn` と最大点 `mx` で表す。
  各成分は `Vec3` であり、collision、picking、camera occlusion はこの型を半開区間 `[mn, mx)` の直方体として扱う。
  """
  mn: Vec3
  mx: Vec3

  def intersects(self, o: "AABB") -> bool:
    """
    二つの AABB が正の体積を持って重なっているかを三軸の半開区間で判定する。
    いずれかの軸で `self.max <= other.min` 又は `self.min >= other.max` が成立する場合は非交差とし、
    境界面で接するだけの状態は collision overlap として扱わない。
    """
    return not (self.mx.x <= o.mn.x or self.mn.x >= o.mx.x or self.mx.y <= o.mn.y or self.mn.y >= o.mx.y or self.mx.z <= o.mn.z or self.mn.z >= o.mx.z)
