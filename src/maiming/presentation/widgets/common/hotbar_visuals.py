# FILE: src/maiming/presentation/widgets/common/hotbar_visuals.py
from __future__ import annotations

from ....domain.blocks.block_registry import BlockRegistry

def _block_display_name(registry: BlockRegistry, block_id: str | None) -> str:
    bid = "" if block_id is None else str(block_id).strip()
    if not bid:
        return "Empty Hand"

    block = registry.get(bid)
    if block is None:
        return bid
    return str(block.display_name)

def hotbar_slot_tooltip(registry: BlockRegistry, *, slot_index: int, block_id: str | None) -> str:
    bid = "" if block_id is None else str(block_id).strip()
    if not bid:
        return f"Hotbar Slot {int(slot_index) + 1}\nEmpty Hand"
    return f"Hotbar Slot {int(slot_index) + 1}\n{_block_display_name(registry, bid)}\n{bid}"