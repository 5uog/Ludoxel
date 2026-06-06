# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.presentation.audio.catalogs.ambient import AMBIENT_KEY_MY_WORLD
from ludoxel.simulation.worlds.state.play_space import is_my_world_space


def ambient_desired_key(*, enabled: bool, current_space_id: str) -> str | None:
  if bool(enabled) and is_my_world_space(str(current_space_id)):
    return AMBIENT_KEY_MY_WORLD
  return None
