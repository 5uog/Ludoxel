# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, ClassVar

from ludoxel.foundations.mathematics.scalars.coercion import coerce_int
from ludoxel.simulation.inventories.hotbars.ai_route_defaults import default_ai_route_hotbar_slots
from ludoxel.simulation.inventories.hotbars.defaults import default_hotbar_slots
from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE as DOMAIN_HOTBAR_SIZE, normalize_hotbar_index, normalize_hotbar_slots
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

  creative_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  creative_selected_hotbar_index: int = 0
  survival_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  survival_selected_hotbar_index: int = 0
  othello_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_othello_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  othello_selected_hotbar_index: int = 0
  route_hotbar_slots: tuple[str, ...] = field(default_factory=lambda: default_ai_route_hotbar_slots(size=DOMAIN_HOTBAR_SIZE))
  route_selected_hotbar_index: int = 0

  def to_dict(self) -> dict[str, Any]:
    creative_slots, creative_idx = _inventory_branch_to_dict(slots=self.creative_hotbar_slots, selected_index=self.creative_selected_hotbar_index, size=self.HOTBAR_SIZE)
    survival_slots, survival_idx = _inventory_branch_to_dict(slots=self.survival_hotbar_slots, selected_index=self.survival_selected_hotbar_index, size=self.HOTBAR_SIZE)
    othello_slots, othello_idx = _inventory_branch_to_dict(slots=self.othello_hotbar_slots, selected_index=self.othello_selected_hotbar_index, size=self.HOTBAR_SIZE)
    route_slots, route_idx = _inventory_branch_to_dict(slots=self.route_hotbar_slots, selected_index=self.route_selected_hotbar_index, size=self.HOTBAR_SIZE)

    return {
      "creative_hotbar_slots": creative_slots,
      "creative_selected_hotbar_index": int(creative_idx),
      "survival_hotbar_slots": survival_slots,
      "survival_selected_hotbar_index": int(survival_idx),
      "othello_hotbar_slots": othello_slots,
      "othello_selected_hotbar_index": int(othello_idx),
      "route_hotbar_slots": route_slots,
      "route_selected_hotbar_index": int(route_idx),
    }

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PersistedInventory":
    previous_slots, previous_idx = _inventory_branch_from_dict(
      d.get("hotbar_slots"), d.get("selected_hotbar_index", 0), size=PersistedInventory.HOTBAR_SIZE, default_slots=default_hotbar_slots(size=PersistedInventory.HOTBAR_SIZE), default_index=0
    )
    creative_slots, creative_idx = _inventory_branch_from_dict(
      d.get("creative_hotbar_slots", previous_slots),
      d.get("creative_selected_hotbar_index", previous_idx),
      size=PersistedInventory.HOTBAR_SIZE,
      default_slots=previous_slots,
      default_index=previous_idx,
    )
    survival_slots, survival_idx = _inventory_branch_from_dict(
      d.get("survival_hotbar_slots", previous_slots),
      d.get("survival_selected_hotbar_index", previous_idx),
      size=PersistedInventory.HOTBAR_SIZE,
      default_slots=previous_slots,
      default_index=previous_idx,
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
      creative_hotbar_slots=creative_slots,
      creative_selected_hotbar_index=int(creative_idx),
      survival_hotbar_slots=survival_slots,
      survival_selected_hotbar_index=int(survival_idx),
      othello_hotbar_slots=othello_slots,
      othello_selected_hotbar_index=int(othello_idx),
      route_hotbar_slots=route_slots,
      route_selected_hotbar_index=int(route_idx),
    )
