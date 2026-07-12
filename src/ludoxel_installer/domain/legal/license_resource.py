# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from ludoxel_installer.foundations.errors import InstallerError
from ludoxel_installer.foundations.resource_root import dev_repository_root, embedded_legal_root


def license_text_path() -> Path:
  legal_root = embedded_legal_root()
  if legal_root is not None:
    candidate = legal_root / "LICENSE"
    if candidate.is_file():
      return candidate
    raise InstallerError("Ludoxel Installer could not find its embedded License Text.", detail=f"missing {candidate}")

  dev_root = dev_repository_root()
  if dev_root is not None:
    candidate = dev_root / "LICENSE"
    if candidate.is_file():
      return candidate

  raise InstallerError("Ludoxel Installer could not locate the Ludoxel License Text.", detail="no embedded legal root and no development repository root")


def load_license_text() -> str:
  return license_text_path().read_text(encoding="utf-8")


def load_license_bytes() -> bytes:
  return license_text_path().read_bytes()
