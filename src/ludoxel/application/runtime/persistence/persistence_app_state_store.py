# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ludoxel.application.runtime.persistence.persistence_app_state_schema import AppState, PersistedOthelloSpace, PersistedPlaySpace, PlayerStateFile, WorldStateFile
from ludoxel.application.runtime.persistence.persistence_integrity_manifest import update_runtime_integrity_manifest, verify_runtime_file
from ludoxel.application.runtime.persistence.persistence_json_file_store import JsonFileStore
from ludoxel.shared.shared_project_paths import default_runtime_data_root, previous_configs_root, runtime_state_root


@dataclass
class AppStateStore:
  project_root: Path
  data_root: Path | None = None

  def _data_root(self) -> Path:
    if self.data_root is not None:
      return Path(self.data_root)
    return default_runtime_data_root(Path(self.project_root))

  def _state_path(self, name: str) -> Path:
    return runtime_state_root(self._data_root()) / str(name)

  def _previous_config_path(self, name: str) -> Path:
    return previous_configs_root(Path(self.project_root)) / str(name)

  def _player_store(self) -> JsonFileStore:
    return JsonFileStore(path=self._state_path("player_state.json"))

  def _world_store(self) -> JsonFileStore:
    return JsonFileStore(path=self._state_path("world_state.json"))

  def _read_runtime_or_previous(self, name: str) -> dict | None:
    runtime_path = self._state_path(name)
    if runtime_path.exists():
      relative_path = f"state/{name}"
      if not verify_runtime_file(self._data_root(), relative_path):
        return None
      return JsonFileStore(path=runtime_path).read()

    previous_path = self._previous_config_path(name)
    if previous_path.exists():
      return JsonFileStore(path=previous_path).read()

    return None

  def load(self) -> AppState | None:
    raw_player = self._read_runtime_or_previous("player_state.json")
    raw_world = self._read_runtime_or_previous("world_state.json")

    if raw_player is None and raw_world is None:
      return None

    player_file = PlayerStateFile.from_dict(raw_player or {})
    world_file = WorldStateFile.from_dict(raw_world or {})

    return AppState(
      current_space_id=player_file.current_space_id,
      settings=player_file.settings,
      inventory=player_file.inventory,
      othello_settings=player_file.othello_settings.normalized(),
      my_world=world_file.my_world,
      othello_space=world_file.othello_space,
    )

  def save(self, state: AppState) -> None:
    player_file = PlayerStateFile(version=7, current_space_id=state.current_space_id, settings=state.settings, inventory=state.inventory, othello_settings=state.othello_settings.normalized())
    world_file = WorldStateFile(
      version=3,
      my_world=state.my_world if isinstance(state.my_world, PersistedPlaySpace) else PersistedPlaySpace(),
      othello_space=(state.othello_space if isinstance(state.othello_space, PersistedOthelloSpace) else PersistedOthelloSpace()),
    )

    self._player_store().write(player_file.to_dict())
    self._world_store().write(world_file.to_dict())
    update_runtime_integrity_manifest(self._data_root(), ("state/player_state.json", "state/world_state.json"))
