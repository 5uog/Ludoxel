# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import hashlib
from dataclasses import dataclass

from ludoxel_installer.domain.legal.license_resource import load_license_bytes


def sha256_hex(data: bytes) -> str:
  return hashlib.sha256(data).hexdigest()


@dataclass(frozen=True)
class LicenseIdentityResult:
  matches: bool
  installer_license_sha256: str
  manifest_license_sha256: str


def verify_license_identity(manifest_license_sha256: str) -> LicenseIdentityResult:
  installer_sha256 = sha256_hex(load_license_bytes())
  expected = str(manifest_license_sha256).strip().lower()
  return LicenseIdentityResult(matches=installer_sha256 == expected, installer_license_sha256=installer_sha256, manifest_license_sha256=expected)
