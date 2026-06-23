# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


class ChatRuntimeSettings:
  def __init__(self) -> None:
    self._mute_all: bool = False

  def mute_all(self) -> bool:
    return bool(self._mute_all)

  def set_mute_all(self, value: bool) -> None:
    self._mute_all = bool(value)
