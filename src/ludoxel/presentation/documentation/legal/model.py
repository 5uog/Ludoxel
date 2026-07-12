# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

_THIRD_PARTY_LICENSE_FILE_NAME = "LICENSE.txt"
_PACKAGE_DIR = Path(__file__).resolve().parent


@dataclass(frozen=True)
class ThirdPartyMaterial:
  name: str
  license_text: str


def _dev_tree_license_text() -> str | None:
  cursor = _PACKAGE_DIR
  for _ in range(8):
    candidate = cursor / "LICENSE"
    if candidate.is_file() and (cursor / "third-party").is_dir():
      return candidate.read_text(encoding="utf-8")
    parent = cursor.parent
    if parent == cursor:
      return None
    cursor = parent
  return None


def load_license_text() -> str | None:
  try:
    from ludoxel.presentation.documentation.legal._generated_license_text import LICENSE_TEXT

    return LICENSE_TEXT
  except ImportError:
    return _dev_tree_license_text()


def list_third_party_materials(resource_root: Path | None) -> tuple[ThirdPartyMaterial, ...]:
  if resource_root is None:
    return ()
  third_party_root = Path(resource_root) / "third-party"
  if not third_party_root.is_dir():
    return ()

  materials: list[ThirdPartyMaterial] = []
  for entry in sorted(third_party_root.iterdir(), key=lambda path: path.name.lower()):
    if not entry.is_dir():
      continue
    license_path = entry / _THIRD_PARTY_LICENSE_FILE_NAME
    if not license_path.is_file():
      continue
    materials.append(ThirdPartyMaterial(name=entry.name, license_text=license_path.read_text(encoding="utf-8")))

  return tuple(materials)
