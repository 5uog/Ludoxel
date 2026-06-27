# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import io
import json
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ludoxel.application.persistence.schema.play_space import PersistedPlaySpace
from ludoxel.application.persistence.schema.world_library import PersistedWorldEntry, PersistedWorldMetadata
from ludoxel.foundations.identity import __version__

LDXWORLD_FORMAT_ID: str = "ludoxel.world"
LDXWORLD_FORMAT_VERSION: int = 1
LDXWORLD_EXTENSION: str = ".ldxworld"

_MANIFEST_MEMBER = "manifest.json"
_WORLD_MEMBER = "world.json"
_THUMBNAIL_MEMBER = "thumbnail.png"

# Reject pathological packages before any member is expanded into memory.
_MAX_TOTAL_UNCOMPRESSED_BYTES = 128 * 1024 * 1024
_MAX_MEMBER_COUNT = 16


class LdxworldError(Exception):
  """Raised when a `.ldxworld` package cannot be produced or is malformed."""


@dataclass(frozen=True)
class LdxworldPackage:
  entry: PersistedWorldEntry
  thumbnail_bytes: bytes | None


def _manifest_dict(metadata: PersistedWorldMetadata) -> dict[str, Any]:
  return {"format": LDXWORLD_FORMAT_ID, "format_version": int(LDXWORLD_FORMAT_VERSION), "app_version": str(__version__), "world": metadata.normalized().to_dict()}


def export_world_package(path: Path, *, entry: PersistedWorldEntry, thumbnail_bytes: bytes | None = None) -> Path:
  target = Path(path)
  target.parent.mkdir(parents=True, exist_ok=True)
  manifest = _manifest_dict(entry.metadata)
  world_payload = json.dumps(entry.space.to_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
  manifest_payload = json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":"))

  tmp = target.with_suffix(target.suffix + ".tmp")
  try:
    with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_DEFLATED) as archive:
      archive.writestr(_MANIFEST_MEMBER, manifest_payload)
      archive.writestr(_WORLD_MEMBER, world_payload)
      if thumbnail_bytes:
        archive.writestr(_THUMBNAIL_MEMBER, bytes(thumbnail_bytes))
  except OSError as error:
    raise LdxworldError(f"Could not write world package: {error}") from error

  import os

  os.replace(str(tmp), str(target))
  return target


def _read_member(archive: zipfile.ZipFile, name: str) -> bytes | None:
  try:
    return archive.read(name)
  except KeyError:
    return None


def read_world_package_archive(archive: zipfile.ZipFile) -> LdxworldPackage:
  infos = archive.infolist()
  if len(infos) > _MAX_MEMBER_COUNT:
    raise LdxworldError("World package contains too many members.")
  if sum(int(info.file_size) for info in infos) > _MAX_TOTAL_UNCOMPRESSED_BYTES:
    raise LdxworldError("World package exceeds the maximum allowed size.")

  manifest_raw = _read_member(archive, _MANIFEST_MEMBER)
  world_raw = _read_member(archive, _WORLD_MEMBER)
  if manifest_raw is None or world_raw is None:
    raise LdxworldError("World package is missing required members.")

  try:
    manifest = json.loads(manifest_raw.decode("utf-8"))
  except (UnicodeDecodeError, json.JSONDecodeError) as error:
    raise LdxworldError("World package manifest is not valid JSON.") from error
  if not isinstance(manifest, dict) or str(manifest.get("format", "")) != LDXWORLD_FORMAT_ID:
    raise LdxworldError("World package is not a Ludoxel world.")

  try:
    world_data = json.loads(world_raw.decode("utf-8"))
  except (UnicodeDecodeError, json.JSONDecodeError) as error:
    raise LdxworldError("World package world data is not valid JSON.") from error
  if not isinstance(world_data, dict):
    raise LdxworldError("World package world data is malformed.")

  raw_metadata = manifest.get("world", {})
  metadata = PersistedWorldMetadata.from_dict(raw_metadata if isinstance(raw_metadata, dict) else {})
  space = PersistedPlaySpace.from_dict(world_data)
  thumbnail_bytes = _read_member(archive, _THUMBNAIL_MEMBER)
  return LdxworldPackage(entry=PersistedWorldEntry(metadata=metadata, space=space), thumbnail_bytes=thumbnail_bytes)


def read_world_package_bytes(data: bytes) -> LdxworldPackage:
  try:
    with zipfile.ZipFile(io.BytesIO(bytes(data)), "r") as archive:
      return read_world_package_archive(archive)
  except zipfile.BadZipFile as error:
    raise LdxworldError("World package is not a valid archive.") from error


def read_world_package(path: Path) -> LdxworldPackage:
  source = Path(path)
  if not source.is_file():
    raise LdxworldError("World package does not exist.")
  try:
    with zipfile.ZipFile(source, "r") as archive:
      return read_world_package_archive(archive)
  except zipfile.BadZipFile as error:
    raise LdxworldError("World package is not a valid archive.") from error
  except OSError as error:
    raise LdxworldError(f"Could not read world package: {error}") from error


@dataclass(frozen=True)
class LdxworldSummary:
  metadata: PersistedWorldMetadata
  thumbnail_bytes: bytes | None


def read_world_package_summary(path: Path) -> LdxworldSummary:
  """Read only the manifest metadata and thumbnail without expanding world data."""
  source = Path(path)
  if not source.is_file():
    raise LdxworldError("World package does not exist.")
  try:
    with zipfile.ZipFile(source, "r") as archive:
      manifest_raw = _read_member(archive, _MANIFEST_MEMBER)
      if manifest_raw is None:
        raise LdxworldError("World package is missing required members.")
      try:
        manifest = json.loads(manifest_raw.decode("utf-8"))
      except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise LdxworldError("World package manifest is not valid JSON.") from error
      if not isinstance(manifest, dict) or str(manifest.get("format", "")) != LDXWORLD_FORMAT_ID:
        raise LdxworldError("World package is not a Ludoxel world.")
      raw_metadata = manifest.get("world", {})
      metadata = PersistedWorldMetadata.from_dict(raw_metadata if isinstance(raw_metadata, dict) else {})
      thumbnail_bytes = _read_member(archive, _THUMBNAIL_MEMBER)
      return LdxworldSummary(metadata=metadata, thumbnail_bytes=thumbnail_bytes)
  except zipfile.BadZipFile as error:
    raise LdxworldError("World package is not a valid archive.") from error
  except OSError as error:
    raise LdxworldError(f"Could not read world package: {error}") from error
