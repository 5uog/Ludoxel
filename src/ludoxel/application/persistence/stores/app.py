# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, replace
from pathlib import Path

from ludoxel.application.persistence.integrity.manifest import update_runtime_integrity_manifest, verify_runtime_file
from ludoxel.application.persistence.schema.app import AppState
from ludoxel.application.persistence.schema.files import APP_STATE_FILE_VERSION, PersistedAppFile
from ludoxel.application.persistence.schema.othello import PersistedOthelloSpace
from ludoxel.application.persistence.schema.play_space import PersistedPlaySpace
from ludoxel.application.persistence.schema.world_library import DEFAULT_WORLD_NAME, WORLD_GAME_MODE_SURVIVAL, world_game_mode_from_creative, world_game_mode_is_creative
from ludoxel.application.persistence.stores.json_file import JsonFileStore
from ludoxel.application.persistence.stores.world_library import WorldLibraryStore, default_my_world_space
from ludoxel.foundations.locations.roots import default_runtime_data_root, previous_configs_root, runtime_state_root
from ludoxel.simulation.worlds.generation.spec import WorldGenerationSpec

_APP_STATE_FILENAME = "app_state.json"
_APP_STATE_RELATIVE = f"state/{_APP_STATE_FILENAME}"


def default_new_world_space(generation: WorldGenerationSpec | None = None) -> PersistedPlaySpace:
  return default_my_world_space(generation)


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

  def _resolve_active_world_id(self, library: WorldLibraryStore) -> str:
    active_id = library.active_world_id()
    if active_id:
      return active_id
    if library.index_exists():
      return ""
    return str(library.create_world(name=DEFAULT_WORLD_NAME, game_mode=WORLD_GAME_MODE_SURVIVAL, space=default_new_world_space(), make_active=True).world_id)

  def _state_path(self, name: str) -> Path:
    return runtime_state_root(self._data_root()) / str(name)

  def _previous_config_path(self, name: str) -> Path:
    return previous_configs_root(Path(self.project_root)) / str(name)

  def _app_store(self) -> JsonFileStore:
    return JsonFileStore(path=self._state_path(_APP_STATE_FILENAME))

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
    raw_app = self._read_runtime_or_previous(_APP_STATE_FILENAME)
    app_file = PersistedAppFile.from_dict(raw_app or {})

    library = self._library()
    active_id = self._resolve_active_world_id(library)
    entry = library.load_entry(active_id) if active_id else None
    my_world = entry.space if entry is not None else default_new_world_space()
    creative = world_game_mode_is_creative(entry.metadata.game_mode) if entry is not None else False
    settings = replace(app_file.settings, creative_mode=bool(creative))

    return AppState(current_space_id=app_file.current_space_id, settings=settings, othello_settings=app_file.othello_settings.normalized(), my_world=my_world, othello_space=app_file.othello_space)

  def save(self, state: AppState, *, my_world_thumbnail_bytes: bytes | None = None) -> None:
    app_file = PersistedAppFile(version=int(APP_STATE_FILE_VERSION), current_space_id=state.current_space_id, settings=state.settings, othello_settings=state.othello_settings.normalized(), othello_space=(state.othello_space if isinstance(state.othello_space, PersistedOthelloSpace) else PersistedOthelloSpace()))

    self._app_store().write(app_file.to_dict())
    update_runtime_integrity_manifest(self._data_root(), (_APP_STATE_RELATIVE,))

    library = self._library()
    active_id = self._resolve_active_world_id(library)
    if not active_id:
      return
    my_world = state.my_world if isinstance(state.my_world, PersistedPlaySpace) else default_new_world_space()
    if not library.save_space(active_id, my_world, game_mode=world_game_mode_from_creative(state.settings.creative_mode), thumbnail_bytes=my_world_thumbnail_bytes):
      raise OSError(f"failed to save My World package for active world {active_id}")
