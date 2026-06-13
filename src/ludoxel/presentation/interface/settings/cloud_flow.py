# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.preferences.cloud_flow import BACKEND_CLOUD_FLOW_DIRECTIONS, DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION, normalize_backend_cloud_flow_direction

_LABELS: dict[str, str] = {"east_to_west": "East to West", "west_to_east": "West to East", "south_to_north": "South to North", "north_to_south": "North to South"}

CLOUD_FLOW_OPTIONS: tuple[tuple[str, str], ...] = tuple((value, _LABELS.get(str(value), str(value).replace("_", " ").title())) for value in BACKEND_CLOUD_FLOW_DIRECTIONS)


def cloud_flow_index_for_value(value: str) -> int:
  normalized = normalize_backend_cloud_flow_direction(str(value))
  for index, (entry, _label) in enumerate(CLOUD_FLOW_OPTIONS):
    if normalized == str(entry):
      return index
  for index, (entry, _label) in enumerate(CLOUD_FLOW_OPTIONS):
    if str(entry) == str(DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION):
      return index
  return 0
