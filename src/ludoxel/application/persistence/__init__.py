# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from importlib import import_module

__all__ = [
  "AppState",
  "AppStateStore",
  "PersistedAiPlayer",
  "PersistedAppFile",
  "PersistedOthelloSpace",
  "PersistedPlaySpace",
  "PersistedPlayer",
  "PersistedSettings",
  "PersistedWorld",
  "PersistedWorldEntry",
  "PersistedWorldInventory",
  "PersistedWorldLibraryIndex",
  "PersistedWorldMetadata",
  "WorldLibraryStore",
]

_SCHEMA_EXPORTS = {
  "AppState",
  "PersistedAiPlayer",
  "PersistedAppFile",
  "PersistedOthelloSpace",
  "PersistedPlaySpace",
  "PersistedPlayer",
  "PersistedSettings",
  "PersistedWorld",
  "PersistedWorldEntry",
  "PersistedWorldInventory",
  "PersistedWorldLibraryIndex",
  "PersistedWorldMetadata",
}


def __getattr__(name: str):
  if str(name) == "AppStateStore":
    from ludoxel.application.persistence.stores.app import AppStateStore

    return AppStateStore

  if str(name) == "WorldLibraryStore":
    from ludoxel.application.persistence.stores.world_library import WorldLibraryStore

    return WorldLibraryStore

  if str(name) in _SCHEMA_EXPORTS:
    schema = import_module("ludoxel.application.persistence.schema")
    return getattr(schema, str(name))

  raise AttributeError(str(name))
