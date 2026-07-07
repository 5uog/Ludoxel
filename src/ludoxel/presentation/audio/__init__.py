# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.presentation.audio.catalogs.ambient import AMBIENT_KEY_MY_WORLD
from ludoxel.presentation.audio.catalogs.material import BLOCK_EVENT_BREAK, BLOCK_EVENT_INTERACT_CLOSE, BLOCK_EVENT_INTERACT_OPEN, BLOCK_EVENT_PLACE, PLAYER_EVENT_STEP
from ludoxel.presentation.audio.catalogs.player import PLAYER_EVENT_ATTACK_STRONG, PLAYER_EVENT_ATTACK_WEAK, PLAYER_EVENT_DAMAGE_HIT, PLAYER_EVENT_LAND, PLAYER_EVENT_LAND_BIG, PLAYER_EVENT_LAND_SMALL, PLAYER_EVENT_OTHELLO_FLIP, PLAYER_EVENT_OTHELLO_PLACE

__all__ = [
  "AMBIENT_KEY_MY_WORLD",
  "AudioManager",
  "BLOCK_EVENT_BREAK",
  "BLOCK_EVENT_INTERACT_CLOSE",
  "BLOCK_EVENT_INTERACT_OPEN",
  "BLOCK_EVENT_PLACE",
  "PLAYER_EVENT_ATTACK_STRONG",
  "PLAYER_EVENT_ATTACK_WEAK",
  "PLAYER_EVENT_DAMAGE_HIT",
  "PLAYER_EVENT_LAND",
  "PLAYER_EVENT_LAND_BIG",
  "PLAYER_EVENT_LAND_SMALL",
  "PLAYER_EVENT_OTHELLO_FLIP",
  "PLAYER_EVENT_OTHELLO_PLACE",
  "PLAYER_EVENT_STEP",
]


def __getattr__(name: str):
  if str(name) == "AudioManager":
    from ludoxel.presentation.audio.playback.manager import AudioManager

    return AudioManager
  raise AttributeError(str(name))
