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
from ludoxel.simulation.spaces.othello.inventories.hotbar import default_othello_hotbar_slots


def _inventory_branch_to_dict(*, slots: object, selected_index: object, size: int) -> tuple[list[str], int]:
  normalized_slots = normalize_hotbar_slots(slots, size=int(size))
  normalized_index = normalize_hotbar_index(coerce_int(selected_index, 0), size=int(size))
  return [str(value) for value in normalized_slots], int(normalized_index)


def _inventory_branch_from_dict(raw_slots: object, raw_index: object, *, size: int, default_slots: tuple[str, ...], default_index: int) -> tuple[tuple[str, ...], int]:
  normalized_slots = normalize_hotbar_slots(default_slots if raw_slots is None else raw_slots, size=int(size))
  normalized_index = normalize_hotbar_index(coerce_int(raw_index, default_index), size=int(size))
  return normalized_slots, int(normalized_index)


@dataclass(frozen=True)
class PersistedInventory:
  HOTBAR_SIZE: ClassVar[int] = DOMAIN_HOTBAR_SIZE
  UPPER_INVENTORY_SIZE: ClassVar[int] = UPPER_INVENTORY_SIZE

  my_world_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  my_world_selected_hotbar_index: int = 0
  my_world_upper_slots: tuple[str, ...] = field(default_factory=default_upper_inventory_slots)
  othello_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_othello_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  othello_selected_hotbar_index: int = 0
  route_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_ai_route_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  route_selected_hotbar_index: int = 0

  def to_dict(self) -> dict[str, Any]:
    my_world_slots, my_world_idx = _inventory_branch_to_dict(slots=self.my_world_hotbar_slots, selected_index=self.my_world_selected_hotbar_index, size=self.HOTBAR_SIZE)
    othello_slots, othello_idx = _inventory_branch_to_dict(slots=self.othello_hotbar_slots, selected_index=self.othello_selected_hotbar_index, size=self.HOTBAR_SIZE)
    route_slots, route_idx = _inventory_branch_to_dict(slots=self.route_hotbar_slots, selected_index=self.route_selected_hotbar_index, size=self.HOTBAR_SIZE)

    return {
      "my_world_hotbar_slots": my_world_slots,
      "my_world_selected_hotbar_index": int(my_world_idx),
      "my_world_upper_slots": [str(value) for value in normalize_upper_inventory_slots(self.my_world_upper_slots)],
      "othello_hotbar_slots": othello_slots,
      "othello_selected_hotbar_index": int(othello_idx),
      "route_hotbar_slots": route_slots,
      "route_selected_hotbar_index": int(route_idx),
    }

  @staticmethod
  def from_dict(d: dict[str, Any], *, legacy_creative_mode: bool = False) -> "PersistedInventory":
    legacy_branch = "creative" if bool(legacy_creative_mode) else "survival"
    my_world_slots, my_world_idx = _inventory_branch_from_dict(
      d.get("my_world_hotbar_slots", d.get(f"{legacy_branch}_hotbar_slots")),
      d.get("my_world_selected_hotbar_index", d.get(f"{legacy_branch}_selected_hotbar_index", 0)),
      size=PersistedInventory.HOTBAR_SIZE,
      default_slots=default_hotbar_slots(size=PersistedInventory.HOTBAR_SIZE),
      default_index=0,
    )
    othello_slots, othello_idx = _inventory_branch_from_dict(
      d.get("othello_hotbar_slots", default_othello_hotbar_slots(size=PersistedInventory.HOTBAR_SIZE)),
      d.get("othello_selected_hotbar_index", 0),
      size=PersistedInventory.HOTBAR_SIZE,
      default_slots=default_othello_hotbar_slots(size=PersistedInventory.HOTBAR_SIZE),
      default_index=0,
    )
    route_slots, route_idx = _inventory_branch_from_dict(
      d.get("route_hotbar_slots", default_ai_route_hotbar_slots(size=PersistedInventory.HOTBAR_SIZE)),
      d.get("route_selected_hotbar_index", 0),
      size=PersistedInventory.HOTBAR_SIZE,
      default_slots=default_ai_route_hotbar_slots(size=PersistedInventory.HOTBAR_SIZE),
      default_index=0,
    )

    return PersistedInventory(
      my_world_hotbar_slots=my_world_slots,
      my_world_selected_hotbar_index=int(my_world_idx),
      my_world_upper_slots=normalize_upper_inventory_slots(d.get("my_world_upper_slots", d.get(f"{legacy_branch}_upper_slots"))),
      othello_hotbar_slots=othello_slots,
      othello_selected_hotbar_index=int(othello_idx),
      route_hotbar_slots=route_slots,
      route_selected_hotbar_index=int(route_idx),
    )
