# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.actors.player.kinematics import PlayerStepInput


def idle_control() -> PlayerStepInput:
  return PlayerStepInput(0.0, 0.0, False, False, False, False, 0.0, 0.0, True)
