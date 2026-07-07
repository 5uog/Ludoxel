# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, ClassVar

from ludoxel.foundations.mathematics.scalars.coercion import coerce_int
from ludoxel.simulation.inventories.hotbars.ai_route_defaults import default_ai_route_hotbar_slots
from ludoxel.simulation.inventories.hotbars.defaults import default_hotbar_slots
from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE as DOMAIN_HOTBAR_SIZE, normalize_hotbar_index, normalize_hotbar_slots
from ludoxel.simulation.inventories.storage.grid import UPPER_INVENTORY_SIZE, default_upper_inventory_slots, normalize_upper_inventory_slots


def _inventory_branch_to_dict(*, slots: object, selected_index: object, size: int) -> tuple[list[str], int]:
  normalized_slots = normalize_hotbar_slots(slots, size=int(size))
  normalized_index = normalize_hotbar_index(coerce_int(selected_index, 0), size=int(size))
  return [str(value) for value in normalized_slots], int(normalized_index)


def _inventory_branch_from_dict(raw_slots: object, raw_index: object, *, size: int, default_slots: tuple[str, ...], default_index: int) -> tuple[tuple[str, ...], int]:
  normalized_slots = normalize_hotbar_slots(default_slots if raw_slots is None else raw_slots, size=int(size))
  normalized_index = normalize_hotbar_index(coerce_int(raw_index, default_index), size=int(size))
  return normalized_slots, int(normalized_index)


@dataclass(frozen=True)
class PersistedWorldInventory:
  HOTBAR_SIZE: ClassVar[int] = DOMAIN_HOTBAR_SIZE
  UPPER_INVENTORY_SIZE: ClassVar[int] = UPPER_INVENTORY_SIZE

  hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  selected_hotbar_index: int = 0
  upper_slots: tuple[str, ...] = field(default_factory=default_upper_inventory_slots)
  route_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_ai_route_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  route_selected_hotbar_index: int = 0

  def to_dict(self) -> dict[str, Any]:
    hotbar_slots, hotbar_idx = _inventory_branch_to_dict(slots=self.hotbar_slots, selected_index=self.selected_hotbar_index, size=self.HOTBAR_SIZE)
    route_slots, route_idx = _inventory_branch_to_dict(slots=self.route_hotbar_slots, selected_index=self.route_selected_hotbar_index, size=self.HOTBAR_SIZE)
    return {"hotbar_slots": hotbar_slots, "selected_hotbar_index": int(hotbar_idx), "upper_slots": [str(value) for value in normalize_upper_inventory_slots(self.upper_slots)], "route_hotbar_slots": route_slots, "route_selected_hotbar_index": int(route_idx)}

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PersistedWorldInventory":
    raw = d if isinstance(d, dict) else {}
    hotbar_slots, hotbar_idx = _inventory_branch_from_dict(raw.get("hotbar_slots"), raw.get("selected_hotbar_index", 0), size=PersistedWorldInventory.HOTBAR_SIZE, default_slots=default_hotbar_slots(size=PersistedWorldInventory.HOTBAR_SIZE), default_index=0)
    route_slots, route_idx = _inventory_branch_from_dict(raw.get("route_hotbar_slots"), raw.get("route_selected_hotbar_index", 0), size=PersistedWorldInventory.HOTBAR_SIZE, default_slots=default_ai_route_hotbar_slots(size=PersistedWorldInventory.HOTBAR_SIZE), default_index=0)
    return PersistedWorldInventory(hotbar_slots=hotbar_slots, selected_hotbar_index=int(hotbar_idx), upper_slots=normalize_upper_inventory_slots(raw.get("upper_slots")), route_hotbar_slots=route_slots, route_selected_hotbar_index=int(route_idx))
