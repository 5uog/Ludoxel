# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import shutil
import tarfile
import tempfile
from dataclasses import dataclass
from pathlib import Path

from ludoxel_installer.domain.payload.verification import VerifiedPayload
from ludoxel_installer.foundations.errors import ExtractionError

_TEMP_DIR_PREFIX = "ludoxel-installer-"


@dataclass(frozen=True)
class ExtractedPayload:
  temp_root: Path
  extracted_path: Path


def create_temp_root() -> Path:
  return Path(tempfile.mkdtemp(prefix=_TEMP_DIR_PREFIX))


def cleanup_temp_root(temp_root: Path) -> None:
  shutil.rmtree(temp_root, ignore_errors=True)


def _extract_windows_onefile(verified: VerifiedPayload, temp_root: Path) -> Path:
  destination = temp_root / verified.manifest.payload_file_name
  shutil.copyfile(verified.payload_path, destination)
  return destination


def _extract_macos_bundle_tar(verified: VerifiedPayload, temp_root: Path) -> Path:
  bundle_name = f"{Path(verified.manifest.payload_file_name).stem}"
  try:
    with tarfile.open(verified.payload_path, mode="r:*") as archive:
      archive.extractall(path=temp_root, filter="data")
  except tarfile.TarError as error:
    raise ExtractionError("Ludoxel Installer could not extract the embedded application bundle.", detail=str(error)) from error

  extracted_bundle = temp_root / bundle_name
  if not extracted_bundle.is_dir():
    raise ExtractionError("Ludoxel Installer extracted the embedded archive but did not find the expected application bundle inside it.", detail=f"expected {extracted_bundle} after extracting {verified.payload_path}")
  return extracted_bundle


def extract_payload(verified: VerifiedPayload, temp_root: Path) -> ExtractedPayload:
  if verified.manifest.payload_format == "windows-onefile-exe":
    extracted_path = _extract_windows_onefile(verified, temp_root)
  elif verified.manifest.payload_format == "macos-app-bundle-tar":
    extracted_path = _extract_macos_bundle_tar(verified, temp_root)
  else:
    raise ExtractionError("Ludoxel Installer does not recognize this payload's format.", detail=f"payload_format={verified.manifest.payload_format!r}")

  return ExtractedPayload(temp_root=temp_root, extracted_path=extracted_path)
