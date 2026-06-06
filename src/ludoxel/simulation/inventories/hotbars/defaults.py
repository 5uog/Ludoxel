# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE, normalize_hotbar_slots


def default_hotbar_slots(*, size: int = HOTBAR_SIZE) -> tuple[str, ...]:
  return normalize_hotbar_slots(None, size=int(size))
