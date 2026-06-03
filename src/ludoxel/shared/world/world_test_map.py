# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from .world_gen import generate_flat_world
from .world_state import WorldState


def generate_test_map(seed: int = 0, params=None) -> WorldState:
  _ = int(seed)
  _ = params
  return generate_flat_world()
