# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path

from ludoxel_installer.domain.legal.license_identity import verify_license_identity
from ludoxel_installer.domain.payload.manifest import PayloadManifest, load_manifest
from ludoxel_installer.foundations.errors import PayloadVerificationError
from ludoxel_installer.foundations.platform_info import PlatformInfo, expected_payload_format

_HASH_CHUNK_SIZE = 1024 * 1024


def _sha256_file(path: Path) -> str:
  digest = hashlib.sha256()
  with path.open("rb") as handle:
    while True:
      chunk = handle.read(_HASH_CHUNK_SIZE)
      if not chunk:
        break
      digest.update(chunk)
  return digest.hexdigest()


@dataclass(frozen=True)
class VerifiedPayload:
  manifest: PayloadManifest
  payload_path: Path


def verify_payload(payload_root: Path, current_platform: PlatformInfo) -> VerifiedPayload:
  manifest = load_manifest(payload_root)

  if manifest.platform != current_platform.platform_id:
    raise PayloadVerificationError("This installer's embedded payload does not match the current operating system.", detail=f"manifest.platform={manifest.platform!r}, running on {current_platform.platform_id!r}")

  if manifest.architecture != current_platform.architecture:
    raise PayloadVerificationError("This installer's embedded payload does not match the current processor architecture.", detail=f"manifest.architecture={manifest.architecture!r}, running on {current_platform.architecture!r}")

  expected_format = expected_payload_format(current_platform.platform_id)
  if manifest.payload_format != expected_format:
    raise PayloadVerificationError("This installer's embedded payload is not in the expected format.", detail=f"manifest.payload_format={manifest.payload_format!r}, expected {expected_format!r}")

  payload_path = Path(payload_root) / manifest.payload_file_name
  if not payload_path.is_file():
    raise PayloadVerificationError("This installer's embedded payload file is missing.", detail=f"missing {payload_path}")

  actual_size = payload_path.stat().st_size
  if actual_size != manifest.payload_size_bytes:
    raise PayloadVerificationError("This installer's embedded payload size does not match its manifest.", detail=f"expected {manifest.payload_size_bytes} bytes, found {actual_size} bytes at {payload_path}")

  actual_sha256 = _sha256_file(payload_path)
  if actual_sha256 != manifest.payload_sha256:
    raise PayloadVerificationError("This installer's embedded payload failed integrity verification.", detail=f"expected sha256={manifest.payload_sha256}, computed {actual_sha256} for {payload_path}")

  license_identity = verify_license_identity(manifest.license_text_sha256)
  if not license_identity.matches:
    raise PayloadVerificationError("This installer's License Text does not match the License Text its payload manifest was built against.", detail=f"installer license sha256={license_identity.installer_license_sha256}, manifest license sha256={license_identity.manifest_license_sha256}")

  return VerifiedPayload(manifest=manifest, payload_path=payload_path)
