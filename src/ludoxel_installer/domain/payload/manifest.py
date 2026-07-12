# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ludoxel_installer.foundations.errors import PayloadVerificationError

MANIFEST_SCHEMA_VERSION = 1

_REQUIRED_STRING_FIELDS = ("application_version", "platform", "architecture", "payload_file_name", "payload_format", "payload_sha256", "license_text_sha256", "created_at")


@dataclass(frozen=True)
class PayloadManifest:
  schema_version: int
  application_version: str
  platform: str
  architecture: str
  payload_file_name: str
  payload_format: str
  payload_size_bytes: int
  payload_sha256: str
  license_text_sha256: str
  created_at: str


def manifest_path_under(payload_root: Path) -> Path:
  return Path(payload_root) / "manifest.json"


def _require_object(data: Any) -> dict:
  if not isinstance(data, dict):
    raise PayloadVerificationError("Ludoxel Installer could not read the embedded payload manifest.", detail="manifest.json did not decode to a JSON object")
  return data


def parse_manifest(raw_text: str) -> PayloadManifest:
  try:
    data = _require_object(json.loads(raw_text))
  except json.JSONDecodeError as error:
    raise PayloadVerificationError("Ludoxel Installer could not read the embedded payload manifest.", detail=f"invalid JSON: {error}") from error

  schema_version = data.get("schema_version")
  if not isinstance(schema_version, int):
    raise PayloadVerificationError("Ludoxel Installer found a payload manifest with no valid schema version.", detail=f"schema_version={schema_version!r}")
  if schema_version != MANIFEST_SCHEMA_VERSION:
    raise PayloadVerificationError("Ludoxel Installer found a payload manifest built for a different manifest schema.", detail=f"expected schema_version={MANIFEST_SCHEMA_VERSION}, found {schema_version}")

  for field_name in _REQUIRED_STRING_FIELDS:
    value = data.get(field_name)
    if not isinstance(value, str) or not value.strip():
      raise PayloadVerificationError("Ludoxel Installer found an incomplete payload manifest.", detail=f"missing or empty field: {field_name}")

  payload_size_bytes = data.get("payload_size_bytes")
  if not isinstance(payload_size_bytes, int) or payload_size_bytes < 0:
    raise PayloadVerificationError("Ludoxel Installer found a payload manifest with an invalid payload size.", detail=f"payload_size_bytes={payload_size_bytes!r}")

  return PayloadManifest(
    schema_version=schema_version,
    application_version=str(data["application_version"]),
    platform=str(data["platform"]),
    architecture=str(data["architecture"]),
    payload_file_name=str(data["payload_file_name"]),
    payload_format=str(data["payload_format"]),
    payload_size_bytes=int(payload_size_bytes),
    payload_sha256=str(data["payload_sha256"]).strip().lower(),
    license_text_sha256=str(data["license_text_sha256"]).strip().lower(),
    created_at=str(data["created_at"]),
  )


def load_manifest(payload_root: Path) -> PayloadManifest:
  path = manifest_path_under(payload_root)
  if not path.is_file():
    raise PayloadVerificationError("Ludoxel Installer could not find the embedded payload manifest.", detail=f"missing {path}")
  return parse_manifest(path.read_text(encoding="utf-8"))
