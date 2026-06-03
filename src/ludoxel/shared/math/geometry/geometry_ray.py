# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.shared.math.math_vec3 import Vec3


@dataclass(frozen=True)
class Ray:
  origin: Vec3
  direction: Vec3
