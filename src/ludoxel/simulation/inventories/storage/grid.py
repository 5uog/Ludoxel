# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Sequence

from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE, normalize_hotbar_slots, with_hotbar_assignment

UPPER_INVENTORY_SIZE: int = 27
UPPER_INVENTORY_COLUMNS: int = 9
UPPER_INVENTORY_ROWS: int = 3
CRAFTING_INPUT_SIZE: int = 4
CRAFTING_INPUT_COLUMNS: int = 2
CRAFTING_INPUT_ROWS: int = 2


def normalize_upper_inventory_slots(raw: Sequence[object] | None) -> tuple[str, ...]:
  return normalize_hotbar_slots(raw, size=UPPER_INVENTORY_SIZE)


def normalize_crafting_slots(raw: Sequence[object] | None) -> tuple[str, ...]:
  return normalize_hotbar_slots(raw, size=CRAFTING_INPUT_SIZE)


def default_upper_inventory_slots() -> tuple[str, ...]:
  return normalize_hotbar_slots(None, size=UPPER_INVENTORY_SIZE)


def first_empty_slot_index(slots: Sequence[object]) -> int | None:
  for index, value in enumerate(slots):
    if not str(value).strip():
      return int(index)
  return None


def with_slot_assignment(slots: Sequence[object] | None, index: int, item_id: str | None, *, size: int) -> tuple[str, ...]:
  return with_hotbar_assignment(slots, int(index), item_id, size=int(size))


def insert_into_first_empty(slots: Sequence[object] | None, item_id: str | None, *, size: int) -> tuple[tuple[str, ...], int | None]:
  normalized = list(normalize_hotbar_slots(slots, size=int(size)))
  target = first_empty_slot_index(normalized)
  if target is None:
    return tuple(normalized), None
  normalized[int(target)] = "" if item_id is None else str(item_id).strip()
  return tuple(normalized), int(target)


def place_into_storage_priority(hotbar: Sequence[object] | None, upper: Sequence[object] | None, item_id: str | None) -> tuple[tuple[str, ...], tuple[str, ...], bool]:
  normalized_hotbar = normalize_hotbar_slots(hotbar, size=HOTBAR_SIZE)
  normalized_upper = normalize_upper_inventory_slots(upper)
  inserted_hotbar, hotbar_index = insert_into_first_empty(normalized_hotbar, item_id, size=HOTBAR_SIZE)
  if hotbar_index is not None:
    return inserted_hotbar, normalized_upper, True
  inserted_upper, upper_index = insert_into_first_empty(normalized_upper, item_id, size=UPPER_INVENTORY_SIZE)
  return normalized_hotbar, inserted_upper, upper_index is not None
