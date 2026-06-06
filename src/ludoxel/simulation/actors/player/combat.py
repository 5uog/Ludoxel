# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.simulation.actors.player.entity import PlayerEntity


def attack_sprinting(*, attacker: PlayerEntity, walk_speed: float) -> bool:
  horizontal_speed = float(math.hypot(float(attacker.velocity.x), float(attacker.velocity.z)))
  return float(horizontal_speed) >= float(max(1e-6, float(walk_speed))) * 1.18
