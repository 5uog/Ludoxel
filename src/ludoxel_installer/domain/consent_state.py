# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ConsentState:
  reached_license_end: bool = False
  checkbox_checked: bool = False

  def set_reached_license_end(self, reached: bool) -> None:
    self.reached_license_end = bool(reached)

  def set_checkbox_checked(self, checked: bool) -> None:
    self.checkbox_checked = bool(checked)

  @property
  def can_proceed(self) -> bool:
    return self.reached_license_end and self.checkbox_checked
