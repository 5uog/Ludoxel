# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, replace
from pathlib import Path

from ludoxel.application.persistence.integrity.manifest import update_runtime_integrity_manifest, verify_runtime_file
from ludoxel.application.persistence.packages.ldxworld import LDXWORLD_EXTENSION, export_world_package, read_world_package, read_world_package_summary
from ludoxel.application.persistence.schema.play_space import PersistedPlaySpace
from ludoxel.application.persistence.schema.world_library import (
  DEFAULT_WORLD_NAME,
  WORLD_GAME_MODE_SURVIVAL,
  PersistedWorldEntry,
  PersistedWorldLibraryIndex,
  PersistedWorldMetadata,
  normalize_world_game_mode,
  normalize_world_name,
)
from ludoxel.application.persistence.stores.json_file import JsonFileStore
from ludoxel.foundations.locations.roots import default_runtime_data_root, runtime_state_root

_INDEX_FILENAME = "world_library.json"
_WORLDS_DIRNAME = "worlds"
_WORLD_SUFFIX = LDXWORLD_EXTENSION


def _new_world_id() -> str:
  return uuid.uuid4().hex


@dataclass(frozen=True)
class WorldLibrarySummary:
  metadata: PersistedWorldMetadata
  size_bytes: int
  thumbnail_bytes: bytes | None


@dataclass
class WorldLibraryStore:
  project_root: Path
  data_root: Path | None = None

  def _data_root(self) -> Path:
    if self.data_root is not None:
      return Path(self.data_root)
    return default_runtime_data_root(Path(self.project_root))

  def _state_root(self) -> Path:
    return runtime_state_root(self._data_root())

  def _worlds_root(self) -> Path:
    return self._state_root() / _WORLDS_DIRNAME

  def _index_path(self) -> Path:
    return self._state_root() / _INDEX_FILENAME

  def _world_path(self, world_id: str) -> Path:
    return self._worlds_root() / f"{str(world_id)}{_WORLD_SUFFIX}"

  def _index_relative(self) -> str:
    return f"state/{_INDEX_FILENAME}"

  def _world_relative(self, world_id: str) -> str:
    return f"state/{_WORLDS_DIRNAME}/{str(world_id)}{_WORLD_SUFFIX}"

  # --- index ---------------------------------------------------------------

  def index_exists(self) -> bool:
    return self._index_path().exists()

  def _read_index(self) -> PersistedWorldLibraryIndex:
    relative = self._index_relative()
    if self._index_path().exists() and not verify_runtime_file(self._data_root(), relative):
      return PersistedWorldLibraryIndex()
    raw = JsonFileStore(path=self._index_path()).read()
    return PersistedWorldLibraryIndex.from_dict(raw or {})

  def _write_index(self, index: PersistedWorldLibraryIndex) -> None:
    JsonFileStore(path=self._index_path()).write(index.to_dict())
    update_runtime_integrity_manifest(self._data_root(), (self._index_relative(),))

  # --- packages ------------------------------------------------------------

  def _entry_with_world_id(self, entry: PersistedWorldEntry, world_id: str) -> PersistedWorldEntry:
    metadata = replace(entry.metadata.normalized(), world_id=str(world_id))
    return PersistedWorldEntry(metadata=metadata, space=entry.space)

  def _write_package(self, world_id: str, entry: PersistedWorldEntry, *, thumbnail_bytes: bytes | None) -> None:
    path = self._world_path(world_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    export_world_package(path, entry=self._entry_with_world_id(entry, world_id), thumbnail_bytes=thumbnail_bytes)
    update_runtime_integrity_manifest(self._data_root(), (self._world_relative(world_id),))

  def load_entry(self, world_id: str) -> PersistedWorldEntry | None:
    path = self._world_path(world_id)
    if not path.exists():
      return None
    if not verify_runtime_file(self._data_root(), self._world_relative(world_id)):
      return None
    try:
      package = read_world_package(path)
    except Exception:
      return None
    return self._entry_with_world_id(package.entry, world_id)

  def has_worlds(self) -> bool:
    index = self._read_index()
    for world_id in index.world_ids:
      if self._world_path(world_id).exists():
        return True
    return False

  def list_summaries(self) -> tuple[WorldLibrarySummary, ...]:
    index = self._read_index()
    summaries: list[WorldLibrarySummary] = []
    for world_id in index.world_ids:
      path = self._world_path(world_id)
      if not path.exists() or not verify_runtime_file(self._data_root(), self._world_relative(world_id)):
        continue
      try:
        summary = read_world_package_summary(path)
      except Exception:
        continue
      try:
        size_bytes = int(path.stat().st_size)
      except OSError:
        size_bytes = 0
      metadata = replace(summary.metadata.normalized(), world_id=str(world_id))
      summaries.append(WorldLibrarySummary(metadata=metadata, size_bytes=int(size_bytes), thumbnail_bytes=summary.thumbnail_bytes))
    return tuple(summaries)

  # --- active pointer ------------------------------------------------------

  def active_world_id(self) -> str:
    index = self._read_index()
    present = tuple(world_id for world_id in index.world_ids if self._world_path(world_id).exists())
    if index.active_world_id in present:
      return str(index.active_world_id)
    return str(present[0]) if present else ""

  def set_active_world(self, world_id: str) -> None:
    index = self._read_index()
    if str(world_id) not in index.world_ids:
      return
    self._write_index(PersistedWorldLibraryIndex(active_world_id=str(world_id), world_ids=index.world_ids))

  # --- mutation ------------------------------------------------------------

  def create_world(self, *, name: str, game_mode: str, space: PersistedPlaySpace | None = None, make_active: bool = False) -> PersistedWorldMetadata:
    now = float(time.time())
    world_id = _new_world_id()
    metadata = PersistedWorldMetadata(world_id=world_id, name=normalize_world_name(name), game_mode=normalize_world_game_mode(game_mode), created_at=now, updated_at=now)
    entry = PersistedWorldEntry(metadata=metadata, space=space if isinstance(space, PersistedPlaySpace) else PersistedPlaySpace())
    self._write_package(world_id, entry, thumbnail_bytes=None)
    index = self._read_index()
    world_ids = tuple(index.world_ids) + (world_id,)
    active = world_id if make_active or not index.active_world_id else index.active_world_id
    self._write_index(PersistedWorldLibraryIndex(active_world_id=str(active), world_ids=world_ids))
    return metadata

  def import_entry(self, entry: PersistedWorldEntry, *, thumbnail_bytes: bytes | None = None, make_active: bool = False) -> PersistedWorldMetadata:
    now = float(time.time())
    world_id = _new_world_id()
    metadata = PersistedWorldMetadata(
      world_id=world_id,
      name=normalize_world_name(entry.metadata.name),
      game_mode=normalize_world_game_mode(entry.metadata.game_mode),
      created_at=float(entry.metadata.created_at) if float(entry.metadata.created_at) > 0.0 else now,
      updated_at=now,
    )
    self._write_package(world_id, PersistedWorldEntry(metadata=metadata, space=entry.space), thumbnail_bytes=thumbnail_bytes)
    index = self._read_index()
    world_ids = tuple(index.world_ids) + (world_id,)
    active = world_id if make_active or not index.active_world_id else index.active_world_id
    self._write_index(PersistedWorldLibraryIndex(active_world_id=str(active), world_ids=world_ids))
    return metadata

  def rename_world(self, world_id: str, name: str) -> bool:
    entry = self.load_entry(world_id)
    if entry is None:
      return False
    updated = PersistedWorldMetadata(world_id=str(world_id), name=normalize_world_name(name), game_mode=entry.metadata.game_mode, created_at=entry.metadata.created_at, updated_at=float(time.time()))
    self._write_package(world_id, PersistedWorldEntry(metadata=updated, space=entry.space), thumbnail_bytes=self.read_thumbnail_bytes(world_id))
    return True

  def save_space(self, world_id: str, space: PersistedPlaySpace, *, game_mode: str | None = None, thumbnail_bytes: bytes | None = None) -> bool:
    path = self._world_path(world_id)
    if not path.exists() or not verify_runtime_file(self._data_root(), self._world_relative(world_id)):
      return False
    try:
      summary = read_world_package_summary(path)
    except Exception:
      return False
    resolved_game_mode = summary.metadata.game_mode if game_mode is None else normalize_world_game_mode(game_mode)
    updated = PersistedWorldMetadata(world_id=str(world_id), name=summary.metadata.name, game_mode=resolved_game_mode, created_at=summary.metadata.created_at, updated_at=float(time.time()))
    resolved_thumbnail = thumbnail_bytes if thumbnail_bytes else summary.thumbnail_bytes
    self._write_package(world_id, PersistedWorldEntry(metadata=updated, space=space), thumbnail_bytes=resolved_thumbnail)
    return True

  def delete_world(self, world_id: str) -> bool:
    index = self._read_index()
    if str(world_id) not in index.world_ids:
      return False
    path = self._world_path(world_id)
    try:
      if path.exists():
        path.unlink()
    except OSError:
      pass
    update_runtime_integrity_manifest(self._data_root(), (self._world_relative(world_id),))
    remaining = tuple(other for other in index.world_ids if other != str(world_id))
    active = index.active_world_id if index.active_world_id in remaining else (remaining[0] if remaining else "")
    self._write_index(PersistedWorldLibraryIndex(active_world_id=str(active), world_ids=remaining))
    return True

  # --- thumbnails ----------------------------------------------------------

  def write_thumbnail_bytes(self, world_id: str, data: bytes) -> None:
    entry = self.load_entry(world_id)
    if entry is None:
      return
    self._write_package(world_id, entry, thumbnail_bytes=bytes(data))

  def read_thumbnail_bytes(self, world_id: str) -> bytes | None:
    path = self._world_path(world_id)
    if not path.exists() or not verify_runtime_file(self._data_root(), self._world_relative(world_id)):
      return None
    try:
      return read_world_package_summary(path).thumbnail_bytes
    except Exception:
      return None

  # --- migration -----------------------------------------------------------

  def ensure_initialized(self) -> str:
    if self.has_worlds():
      return self.active_world_id()
    metadata = self.create_world(name=DEFAULT_WORLD_NAME, game_mode=WORLD_GAME_MODE_SURVIVAL, space=None, make_active=True)
    return str(metadata.world_id)


__all__ = ["WorldLibraryStore", "WorldLibrarySummary"]
