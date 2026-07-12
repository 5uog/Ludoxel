# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import sys
from pathlib import Path

_PACKAGE_DIR = Path(__file__).resolve().parent.parent


def is_frozen() -> bool:
  return bool(getattr(sys, "frozen", False))


def frozen_meipass() -> Path | None:
  if not is_frozen():
    return None
  meipass = getattr(sys, "_MEIPASS", None)
  return Path(meipass).resolve() if meipass else None


def installer_resource_root() -> Path:
  meipass = frozen_meipass()
  if meipass is not None:
    return meipass / "ludoxel_installer"
  return _PACKAGE_DIR


def payload_root() -> Path | None:
  meipass = frozen_meipass()
  if meipass is None:
    return None
  return meipass / "payload"


def embedded_legal_root() -> Path | None:
  meipass = frozen_meipass()
  if meipass is None:
    return None
  return meipass / "legal"


def dev_repository_root() -> Path | None:
  cursor = _PACKAGE_DIR
  for _ in range(6):
    if (cursor / "LICENSE").is_file() and (cursor / "third-party").is_dir():
      return cursor
    parent = cursor.parent
    if parent == cursor:
      return None
    cursor = parent
  return None


def fonts_root() -> Path | None:
  meipass = frozen_meipass()
  if meipass is not None:
    return meipass / "fonts"
  dev_root = dev_repository_root()
  if dev_root is None:
    return None
  candidate = dev_root / "assets" / "fonts"
  return candidate if candidate.is_dir() else None
