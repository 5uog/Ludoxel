# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class HudPayload:
    left_text: str
    right_text: str = ""

    @property
    def text(self) -> str:
        return str(self.left_text)
