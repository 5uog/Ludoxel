# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.shared.world.inventory.inventory_core_special_items import AI_ROUTE_CANCEL_ITEM_ID, AI_ROUTE_CONFIRM_ITEM_ID, AI_ROUTE_ERASE_ITEM_ID
from ludoxel.shared.world.inventory.inventory_hotbar import HOTBAR_SIZE, normalize_hotbar_slots


def default_ai_route_hotbar_slots(*, size: int = HOTBAR_SIZE) -> tuple[str, ...]:
  return normalize_hotbar_slots((AI_ROUTE_CONFIRM_ITEM_ID, AI_ROUTE_ERASE_ITEM_ID, "", "", "", "", "", "", AI_ROUTE_CANCEL_ITEM_ID), size=int(size))
