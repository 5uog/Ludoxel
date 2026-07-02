# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.application.persistence.schema.play_space import PersistedPlaySpace
from ludoxel.foundations.mathematics.scalars.coercion import coerce_float

WORLD_GAME_MODE_SURVIVAL: str = "survival"
WORLD_GAME_MODE_CREATIVE: str = "creative"
WORLD_GAME_MODES: tuple[str, ...] = (WORLD_GAME_MODE_SURVIVAL, WORLD_GAME_MODE_CREATIVE)

DEFAULT_WORLD_NAME: str = "My World"

WORLD_ENTRY_FILE_VERSION: int = 2
WORLD_LIBRARY_INDEX_VERSION: int = 1


def normalize_world_game_mode(value: object, *, default: str = WORLD_GAME_MODE_SURVIVAL) -> str:
  raw = str(value).strip().lower()
  if raw in WORLD_GAME_MODES:
    return raw
  fallback = str(default).strip().lower()
  return fallback if fallback in WORLD_GAME_MODES else WORLD_GAME_MODE_SURVIVAL


def world_game_mode_from_creative(creative: object) -> str:
  return WORLD_GAME_MODE_CREATIVE if bool(creative) else WORLD_GAME_MODE_SURVIVAL


def world_game_mode_is_creative(value: object) -> bool:
  return normalize_world_game_mode(value) == WORLD_GAME_MODE_CREATIVE


def normalize_world_name(value: object, *, default: str = DEFAULT_WORLD_NAME) -> str:
  text = " ".join(str(value).split()).strip()
  return text if text else str(default)


@dataclass(frozen=True)
class PersistedWorldMetadata:
  world_id: str
  name: str = DEFAULT_WORLD_NAME
  game_mode: str = WORLD_GAME_MODE_SURVIVAL
  created_at: float = 0.0
  updated_at: float = 0.0

  def normalized(self) -> "PersistedWorldMetadata":
    return PersistedWorldMetadata(
      world_id=str(self.world_id).strip(),
      name=normalize_world_name(self.name),
      game_mode=normalize_world_game_mode(self.game_mode),
      created_at=float(max(0.0, coerce_float(self.created_at, 0.0))),
      updated_at=float(max(0.0, coerce_float(self.updated_at, 0.0))),
    )

  def to_dict(self) -> dict[str, Any]:
    normalized = self.normalized()
    return {
      "id": str(normalized.world_id),
      "name": str(normalized.name),
      "game_mode": str(normalized.game_mode),
      "created_at": float(normalized.created_at),
      "updated_at": float(normalized.updated_at),
    }

  @staticmethod
  def from_dict(data: dict[str, Any], *, world_id: str | None = None) -> "PersistedWorldMetadata":
    raw = data if isinstance(data, dict) else {}
    resolved_id = str(raw.get("id", world_id if world_id is not None else "")).strip()
    return PersistedWorldMetadata(
      world_id=resolved_id,
      name=normalize_world_name(raw.get("name", DEFAULT_WORLD_NAME)),
      game_mode=normalize_world_game_mode(raw.get("game_mode", WORLD_GAME_MODE_SURVIVAL)),
      created_at=float(max(0.0, coerce_float(raw.get("created_at", 0.0), 0.0))),
      updated_at=float(max(0.0, coerce_float(raw.get("updated_at", 0.0), 0.0))),
    ).normalized()


@dataclass(frozen=True)
class PersistedWorldEntry:
  metadata: PersistedWorldMetadata
  space: PersistedPlaySpace = field(default_factory=PersistedPlaySpace)

  def to_dict(self) -> dict[str, Any]:
    return {"version": int(WORLD_ENTRY_FILE_VERSION), "metadata": self.metadata.normalized().to_dict(), "space": self.space.to_dict()}

  @staticmethod
  def from_dict(data: dict[str, Any], *, world_id: str | None = None) -> "PersistedWorldEntry":
    raw = data if isinstance(data, dict) else {}
    raw_metadata = raw.get("metadata", {})
    raw_space = raw.get("space", {})
    metadata = PersistedWorldMetadata.from_dict(raw_metadata if isinstance(raw_metadata, dict) else {}, world_id=world_id)
    space = PersistedPlaySpace.from_dict(raw_space) if isinstance(raw_space, dict) else PersistedPlaySpace()
    return PersistedWorldEntry(metadata=metadata, space=space)


@dataclass(frozen=True)
class PersistedWorldLibraryIndex:
  active_world_id: str = ""
  world_ids: tuple[str, ...] = ()

  def to_dict(self) -> dict[str, Any]:
    return {"version": int(WORLD_LIBRARY_INDEX_VERSION), "active_world_id": str(self.active_world_id), "world_ids": [str(world_id) for world_id in self.world_ids]}

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "PersistedWorldLibraryIndex":
    raw = data if isinstance(data, dict) else {}
    raw_ids = raw.get("world_ids", ())
    world_ids = tuple(str(world_id).strip() for world_id in raw_ids if str(world_id).strip()) if isinstance(raw_ids, (list, tuple)) else ()
    return PersistedWorldLibraryIndex(active_world_id=str(raw.get("active_world_id", "")).strip(), world_ids=world_ids)
