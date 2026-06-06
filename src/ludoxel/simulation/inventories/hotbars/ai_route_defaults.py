# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE, normalize_hotbar_slots
from ludoxel.simulation.inventories.special_items.core import AI_ROUTE_CANCEL_ITEM_ID, AI_ROUTE_CONFIRM_ITEM_ID, AI_ROUTE_ERASE_ITEM_ID


def default_ai_route_hotbar_slots(*, size: int = HOTBAR_SIZE) -> tuple[str, ...]:
  return normalize_hotbar_slots((AI_ROUTE_CONFIRM_ITEM_ID, AI_ROUTE_ERASE_ITEM_ID, "", "", "", "", "", "", AI_ROUTE_CANCEL_ITEM_ID), size=int(size))
