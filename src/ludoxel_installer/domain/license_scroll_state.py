# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


class LicenseScrollState:
  def __init__(self) -> None:
    self._known_maximum: int | None = None
    self._reached_end = False

  def update(self, *, value: int, maximum: int) -> bool:
    value = int(value)
    maximum = int(maximum)

    if maximum != self._known_maximum:
      self._known_maximum = maximum
      self._reached_end = False

    if maximum <= 0 or value >= maximum:
      self._reached_end = True

    return self._reached_end

  def reset(self) -> None:
    self._known_maximum = None
    self._reached_end = False

  @property
  def has_reached_end(self) -> bool:
    return self._reached_end
