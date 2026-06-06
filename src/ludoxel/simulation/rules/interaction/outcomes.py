# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

INTERACTION_ACTION_BREAK = "break"
INTERACTION_ACTION_PLACE = "place"
INTERACTION_ACTION_INTERACT = "interact"


@dataclass(frozen=True)
class InteractionOutcome:
  success: bool
  action: str | None = None
  target_block_state: str | None = None
  target_position: tuple[int, int, int] | None = None
