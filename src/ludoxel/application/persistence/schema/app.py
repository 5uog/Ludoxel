# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.application.persistence.schema.othello import PersistedOthelloSpace
from ludoxel.application.persistence.schema.play_space import PersistedPlaySpace
from ludoxel.application.persistence.schema.settings import PersistedSettings
from ludoxel.simulation.spaces.othello.game.state import OthelloSettings
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_MY_WORLD


@dataclass(frozen=True)
class AppState:
  current_space_id: str
  settings: PersistedSettings
  othello_settings: OthelloSettings
  my_world: PersistedPlaySpace
  othello_space: PersistedOthelloSpace

  @staticmethod
  def default() -> "AppState":
    return AppState(current_space_id=PLAY_SPACE_MY_WORLD, settings=PersistedSettings(), othello_settings=OthelloSettings(), my_world=PersistedPlaySpace(), othello_space=PersistedOthelloSpace())
