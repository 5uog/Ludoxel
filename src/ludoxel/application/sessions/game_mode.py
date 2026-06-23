# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING, Iterable

from ludoxel.simulation.actors.player.game_mode import apply_player_game_mode

if TYPE_CHECKING:
  from ludoxel.application.preferences.runtime import RuntimePreferences
  from ludoxel.application.sessions.managers.session import SessionManager


def apply_game_mode(runtime: "RuntimePreferences", sessions: Iterable["SessionManager"], *, creative: bool) -> None:
  runtime.creative_mode = bool(creative)
  for session in sessions:
    apply_player_game_mode(session.player, creative=bool(creative))
