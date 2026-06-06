# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.simulation.spaces.othello.game.state import OthelloAnimationState


@dataclass(frozen=True)
class OthelloRenderState:
  enabled: bool = False
  board: tuple[int, ...] = ()
  legal_move_indices: tuple[int, ...] = ()
  hover_square_index: int | None = None
  last_move_index: int | None = None
  animations: tuple[OthelloAnimationState, ...] = ()
