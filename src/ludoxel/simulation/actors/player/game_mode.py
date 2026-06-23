# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.actors.player.entity import PlayerEntity


def apply_player_game_mode(player: PlayerEntity, *, creative: bool) -> None:
  if not bool(creative):
    player.flying = False
