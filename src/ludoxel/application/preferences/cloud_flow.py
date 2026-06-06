# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION: str = "west_to_east"
BACKEND_CLOUD_FLOW_DIRECTIONS: tuple[str, str, str, str] = ("east_to_west", DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION, "south_to_north", "north_to_south")


def normalize_backend_cloud_flow_direction(raw: object) -> str:
  value = str(raw or "").strip().lower()
  if value in BACKEND_CLOUD_FLOW_DIRECTIONS:
    return value
  return DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION
