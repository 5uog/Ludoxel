# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.worlds.generation.flat import generate_flat_world
from ludoxel.simulation.worlds.state.world import WorldState


def generate_test_map(seed: int = 0, params=None) -> WorldState:
  _ = int(seed)
  _ = params
  return generate_flat_world()
