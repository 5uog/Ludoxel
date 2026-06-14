# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE

HOTBAR_SLOT_SIDE_PX = 46
HOTBAR_SLOT_ICON_SIDE_PX = 36
HOTBAR_SLOT_GAP_PX = 6
HOTBAR_BOTTOM_MARGIN_PX = 18
HOTBAR_HEALTH_GAP_PX = 8


@dataclass(frozen=True, slots=True)
class HotbarPanelGeometry:
  x: int
  y: int
  width: int
  height: int


def hotbar_panel_width(slot_count: int = HOTBAR_SIZE) -> int:
  count = max(1, int(slot_count))
  return int(count * int(HOTBAR_SLOT_SIDE_PX) + max(0, count - 1) * int(HOTBAR_SLOT_GAP_PX))


def centered_hotbar_panel_geometry(*, container_width: int, container_height: int, panel_height: int, slot_count: int = HOTBAR_SIZE) -> HotbarPanelGeometry:
  width = int(hotbar_panel_width(slot_count=int(slot_count)))
  height = max(1, int(panel_height))
  x = max(0, (int(container_width) - int(width)) // 2)
  y = max(0, int(container_height) - int(height) - int(HOTBAR_BOTTOM_MARGIN_PX))
  return HotbarPanelGeometry(x=int(x), y=int(y), width=int(width), height=int(height))
