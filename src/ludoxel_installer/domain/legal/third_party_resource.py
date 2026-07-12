# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ludoxel_installer.foundations.resource_root import dev_repository_root, embedded_legal_root

_LICENSE_FILE_NAME = "LICENSE.txt"


@dataclass(frozen=True)
class ThirdPartyMaterial:
  name: str
  license_text: str


def third_party_root() -> Path | None:
  legal_root = embedded_legal_root()
  if legal_root is not None:
    candidate = legal_root / "third-party"
    return candidate if candidate.is_dir() else None

  dev_root = dev_repository_root()
  if dev_root is not None:
    candidate = dev_root / "third-party"
    return candidate if candidate.is_dir() else None

  return None


def list_third_party_materials() -> tuple[ThirdPartyMaterial, ...]:
  root = third_party_root()
  if root is None:
    return ()

  materials: list[ThirdPartyMaterial] = []
  for entry in sorted(root.iterdir(), key=lambda path: path.name.lower()):
    if not entry.is_dir():
      continue
    license_path = entry / _LICENSE_FILE_NAME
    if not license_path.is_file():
      continue
    materials.append(ThirdPartyMaterial(name=entry.name, license_text=license_path.read_text(encoding="utf-8")))

  return tuple(materials)
