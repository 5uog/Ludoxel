# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from ...blocks.registry.block_registry import BlockRegistry
from ...world.inventory.special_items import get_special_item_descriptor


def _item_display_name(registry: BlockRegistry, item_id: str | None) -> str:
    normalized_item_id = "" if item_id is None else str(item_id).strip()
    if not normalized_item_id:
        return "Empty Hand"

    special = get_special_item_descriptor(normalized_item_id)
    if special is not None:
        return str(special.display_name)

    block = registry.get(normalized_item_id)
    if block is None:
        return normalized_item_id
    return str(block.display_name)


def hotbar_slot_tooltip(registry: BlockRegistry, *, slot_index: int, item_id: str | None) -> str:
    normalized_item_id = "" if item_id is None else str(item_id).strip()
    if not normalized_item_id:
        return f"Hotbar Slot {int(slot_index) + 1}\nEmpty Hand"
    return f"Hotbar Slot {int(slot_index) + 1}\n{_item_display_name(registry, normalized_item_id)}\n{normalized_item_id}"
