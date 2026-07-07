# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.application.persistence.schema.othello import PersistedOthelloSpace
from ludoxel.application.persistence.schema.settings import PersistedSettings
from ludoxel.foundations.mathematics.scalars.coercion import coerce_int
from ludoxel.simulation.spaces.othello.game.state import OthelloSettings
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_MY_WORLD, normalize_play_space_id

APP_STATE_FILE_VERSION: int = 1


@dataclass(frozen=True)
class PersistedAppFile:
  version: int = APP_STATE_FILE_VERSION
  current_space_id: str = PLAY_SPACE_MY_WORLD
  settings: PersistedSettings = field(default_factory=PersistedSettings)
  othello_settings: OthelloSettings = field(default_factory=OthelloSettings)
  othello_space: PersistedOthelloSpace = field(default_factory=PersistedOthelloSpace)

  def to_dict(self) -> dict[str, Any]:
    return {"version": int(self.version), "current_space_id": str(normalize_play_space_id(self.current_space_id)), "settings": self.settings.to_dict(), "othello_settings": self.othello_settings.normalized().to_dict(), "othello_space": self.othello_space.to_dict()}

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PersistedAppFile":
    if not isinstance(d, dict):
      return PersistedAppFile()

    version = coerce_int(d.get("version", APP_STATE_FILE_VERSION), APP_STATE_FILE_VERSION)
    raw_settings = d.get("settings", {})
    raw_othello_settings = d.get("othello_settings", {})
    raw_othello_space = d.get("othello_space", {})

    settings = PersistedSettings.from_dict(raw_settings) if isinstance(raw_settings, dict) else PersistedSettings()
    othello_settings = OthelloSettings.from_dict(raw_othello_settings) if isinstance(raw_othello_settings, dict) else OthelloSettings()
    othello_space = PersistedOthelloSpace.from_dict(raw_othello_space) if isinstance(raw_othello_space, dict) else PersistedOthelloSpace()

    return PersistedAppFile(version=int(max(1, version)), current_space_id=normalize_play_space_id(d.get("current_space_id", PLAY_SPACE_MY_WORLD)), settings=settings, othello_settings=othello_settings, othello_space=othello_space)
