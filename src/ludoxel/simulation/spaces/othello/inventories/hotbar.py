# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE, normalize_hotbar_slots
from ludoxel.simulation.spaces.othello.inventories.special_items import OTHELLO_SETTINGS_ITEM_ID, OTHELLO_START_ITEM_ID


def default_othello_hotbar_slots(*, size: int = HOTBAR_SIZE) -> tuple[str, ...]:
  return normalize_hotbar_slots((OTHELLO_START_ITEM_ID, "", "", "", "", "", "", "", OTHELLO_SETTINGS_ITEM_ID), size=int(size))
