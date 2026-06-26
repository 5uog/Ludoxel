# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, replace
from pathlib import Path

from ludoxel.application.persistence.integrity.manifest import update_runtime_integrity_manifest, verify_runtime_file
from ludoxel.application.persistence.schema.app import AppState
from ludoxel.application.persistence.schema.files import PlayerStateFile, WorldStateFile
from ludoxel.application.persistence.schema.othello import PersistedOthelloSpace
from ludoxel.application.persistence.schema.play_space import PersistedPlaySpace
from ludoxel.application.persistence.schema.player import PersistedPlayer
from ludoxel.application.persistence.schema.world_library import DEFAULT_WORLD_NAME, WORLD_GAME_MODE_SURVIVAL, world_game_mode_from_creative, world_game_mode_is_creative
from ludoxel.application.persistence.stores.json_file import JsonFileStore
from ludoxel.application.persistence.stores.world_library import WorldLibraryStore
from ludoxel.foundations.locations.roots import default_runtime_data_root, previous_configs_root, runtime_state_root
from ludoxel.simulation.spaces.my_world.session import MY_WORLD_PITCH_DEG, MY_WORLD_SPAWN, MY_WORLD_YAW_DEG


def default_new_world_space() -> PersistedPlaySpace:
  return PersistedPlaySpace(
    player=PersistedPlayer(pos_x=float(MY_WORLD_SPAWN[0]), pos_y=float(MY_WORLD_SPAWN[1]), pos_z=float(MY_WORLD_SPAWN[2]), yaw_deg=float(MY_WORLD_YAW_DEG), pitch_deg=float(MY_WORLD_PITCH_DEG))
  )


@dataclass
class AppStateStore:
  project_root: Path
  data_root: Path | None = None

  def _data_root(self) -> Path:
    if self.data_root is not None:
      return Path(self.data_root)
    return default_runtime_data_root(Path(self.project_root))

  def _library(self) -> WorldLibraryStore:
    return WorldLibraryStore(project_root=self.project_root, data_root=self.data_root)

  def _ensure_active_world_id(self, library: WorldLibraryStore) -> str:
    active_id = library.active_world_id()
    if active_id:
      return active_id
    return str(library.create_world(name=DEFAULT_WORLD_NAME, game_mode=WORLD_GAME_MODE_SURVIVAL, space=default_new_world_space(), make_active=True).world_id)

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

    player_file = PlayerStateFile.from_dict(raw_player or {})
    world_file = WorldStateFile.from_dict(raw_world or {})

    library = self._library()
    active_id = self._ensure_active_world_id(library)
    entry = library.load_entry(active_id)
    my_world = entry.space if entry is not None else default_new_world_space()
    creative = world_game_mode_is_creative(entry.metadata.game_mode) if entry is not None else False
    settings = replace(player_file.settings, creative_mode=bool(creative))

    return AppState(
      current_space_id=player_file.current_space_id,
      settings=settings,
      inventory=player_file.inventory,
      othello_settings=player_file.othello_settings.normalized(),
      my_world=my_world,
      othello_space=world_file.othello_space,
    )

  def save(self, state: AppState) -> None:
    player_file = PlayerStateFile(version=9, current_space_id=state.current_space_id, settings=state.settings, inventory=state.inventory, othello_settings=state.othello_settings.normalized())
    world_file = WorldStateFile(version=4, othello_space=(state.othello_space if isinstance(state.othello_space, PersistedOthelloSpace) else PersistedOthelloSpace()))

    self._player_store().write(player_file.to_dict())
    self._world_store().write(world_file.to_dict())
    update_runtime_integrity_manifest(self._data_root(), ("state/player_state.json", "state/world_state.json"))

    library = self._library()
    active_id = self._ensure_active_world_id(library)
    my_world = state.my_world if isinstance(state.my_world, PersistedPlaySpace) else default_new_world_space()
    library.save_space(active_id, my_world, game_mode=world_game_mode_from_creative(state.settings.creative_mode))
