# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = [
  "AppState",
  "AppStateStore",
  "PersistedAiPlayer",
  "PersistedInventory",
  "PersistedOthelloSpace",
  "PersistedPlaySpace",
  "PersistedPlayer",
  "PersistedSettings",
  "PersistedWorld",
  "PlayerStateFile",
  "WorldStateFile",
]

_SCHEMA_EXPORTS = {
  "AppState",
  "PersistedAiPlayer",
  "PersistedInventory",
  "PersistedOthelloSpace",
  "PersistedPlaySpace",
  "PersistedPlayer",
  "PersistedSettings",
  "PersistedWorld",
  "PlayerStateFile",
  "WorldStateFile",
}


def __getattr__(name: str):
  if str(name) == "AppStateStore":
    from ludoxel.application.runtime.persistence.persistence_app_state_store import AppStateStore

    return AppStateStore

  if str(name) in _SCHEMA_EXPORTS:
    from ludoxel.application.runtime.persistence import persistence_app_state_schema as schema

    return getattr(schema, str(name))

  raise AttributeError(str(name))
