# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


def stuck_edge_key(current_support: tuple[int, int, int], next_support: tuple[int, int, int] | None) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
  if next_support is None:
    return (tuple(int(value) for value in current_support), tuple(int(value) for value in current_support))
  return (tuple(int(value) for value in current_support), tuple(int(value) for value in next_support))
