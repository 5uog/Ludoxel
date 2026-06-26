# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.application.persistence.schema.inventory import PersistedInventory
from ludoxel.application.persistence.schema.othello import PersistedOthelloSpace
from ludoxel.application.persistence.schema.settings import PersistedSettings
from ludoxel.foundations.mathematics.scalars.coercion import coerce_int
from ludoxel.simulation.spaces.othello.game.state import OthelloSettings
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_MY_WORLD, normalize_play_space_id


@dataclass(frozen=True)
class PlayerStateFile:
  version: int = 9
  current_space_id: str = PLAY_SPACE_MY_WORLD
  settings: PersistedSettings = field(default_factory=PersistedSettings)
  inventory: PersistedInventory = field(default_factory=PersistedInventory)
  othello_settings: OthelloSettings = field(default_factory=OthelloSettings)

  def to_dict(self) -> dict[str, Any]:
    return {
      "version": int(self.version),
      "current_space_id": str(normalize_play_space_id(self.current_space_id)),
      "settings": self.settings.to_dict(),
      "inventory": self.inventory.to_dict(),
      "othello_settings": self.othello_settings.normalized().to_dict(),
    }

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PlayerStateFile":
    if not isinstance(d, dict):
      return PlayerStateFile()

    version = coerce_int(d.get("version", 1), 1)
    raw_settings = d.get("settings", {})
    raw_inventory = d.get("inventory", {})
    raw_othello_settings = d.get("othello_settings", {})

    settings = PersistedSettings.from_dict(raw_settings) if isinstance(raw_settings, dict) else PersistedSettings()
    inventory = PersistedInventory.from_dict(raw_inventory, legacy_creative_mode=bool(settings.creative_mode)) if isinstance(raw_inventory, dict) else PersistedInventory()
    othello_settings = OthelloSettings.from_dict(raw_othello_settings) if isinstance(raw_othello_settings, dict) else OthelloSettings()

    return PlayerStateFile(
      version=int(max(1, version)), current_space_id=normalize_play_space_id(d.get("current_space_id", PLAY_SPACE_MY_WORLD)), settings=settings, inventory=inventory, othello_settings=othello_settings
    )


@dataclass(frozen=True)
class WorldStateFile:
  version: int = 4
  othello_space: PersistedOthelloSpace = field(default_factory=PersistedOthelloSpace)

  def to_dict(self) -> dict[str, Any]:
    return {"version": int(self.version), "spaces": {"othello": self.othello_space.to_dict()}}

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "WorldStateFile":
    if not isinstance(d, dict):
      return WorldStateFile()

    version = coerce_int(d.get("version", 1), 1)
    raw_spaces = d.get("spaces", {})
    if not isinstance(raw_spaces, dict):
      raw_spaces = {}

    raw_othello = raw_spaces.get("othello", {})
    othello_space = PersistedOthelloSpace.from_dict(raw_othello) if isinstance(raw_othello, dict) else PersistedOthelloSpace()
    return WorldStateFile(version=int(max(4, version)), othello_space=othello_space)
