# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.shared.audio.catalog.catalog_ambient_audio_catalog import AMBIENT_KEY_MY_WORLD
from ludoxel.shared.audio.catalog.catalog_material_audio_catalog import BLOCK_EVENT_BREAK, BLOCK_EVENT_INTERACT_CLOSE, BLOCK_EVENT_INTERACT_OPEN, BLOCK_EVENT_PLACE, PLAYER_EVENT_STEP
from ludoxel.shared.audio.catalog.catalog_player_audio_catalog import (
  PLAYER_EVENT_ATTACK_STRONG,
  PLAYER_EVENT_ATTACK_WEAK,
  PLAYER_EVENT_DAMAGE_HIT,
  PLAYER_EVENT_LAND,
  PLAYER_EVENT_LAND_BIG,
  PLAYER_EVENT_LAND_SMALL,
  PLAYER_EVENT_OTHELLO_FLIP,
  PLAYER_EVENT_OTHELLO_PLACE,
)

from .audio_manager import AudioManager

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
