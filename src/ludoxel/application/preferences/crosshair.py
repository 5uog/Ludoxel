# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

CROSSHAIR_GRID_SIZE = 16
CROSSHAIR_MODE_DEFAULT = "default"
CROSSHAIR_MODE_CUSTOM = "custom"
_EMPTY_ROW = "0" * int(CROSSHAIR_GRID_SIZE)
DEFAULT_CROSSHAIR_PIXELS: tuple[str, ...] = (
  _EMPTY_ROW,
  _EMPTY_ROW,
  "0000000100000000",
  "0000000100000000",
  "0000000100000000",
  "0000000100000000",
  "0000000100000000",
  "0011111111111000",
  "0000000100000000",
  "0000000100000000",
  "0000000100000000",
  "0000000100000000",
  "0000000100000000",
  _EMPTY_ROW,
  _EMPTY_ROW,
  _EMPTY_ROW,
)
EMPTY_CROSSHAIR_PIXELS: tuple[str, ...] = tuple(_EMPTY_ROW for _ in range(CROSSHAIR_GRID_SIZE))


def normalize_crosshair_mode(value: object) -> str:
  if str(value or "").strip().lower() == CROSSHAIR_MODE_CUSTOM:
    return CROSSHAIR_MODE_CUSTOM
  return CROSSHAIR_MODE_DEFAULT


def normalize_crosshair_pixels(value: object) -> tuple[str, ...]:
  rows: list[str] = []
  if isinstance(value, (list, tuple)):
    for raw_row in value[:CROSSHAIR_GRID_SIZE]:
      text = str(raw_row or "")
      row = "".join("1" if ch == "1" else "0" for ch in text[:CROSSHAIR_GRID_SIZE])
      rows.append(row.ljust(CROSSHAIR_GRID_SIZE, "0"))
  while len(rows) < CROSSHAIR_GRID_SIZE:
    rows.append(_EMPTY_ROW)
  return tuple(rows[:CROSSHAIR_GRID_SIZE])
