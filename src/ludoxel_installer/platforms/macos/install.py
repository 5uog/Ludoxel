# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import plistlib
import subprocess
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

from ludoxel_installer.foundations.version_compare import compare_versions

APPLICATIONS_DIR = Path("/Applications")
APP_BUNDLE_NAME = "Ludoxel.app"
PROCESS_NAME = "Ludoxel"


def installed_app_path(applications_dir: Path | None = None) -> Path:
  base = Path(applications_dir) if applications_dir is not None else APPLICATIONS_DIR
  return base / APP_BUNDLE_NAME


def existing_installed_version(app_path: Path) -> str | None:
  plist_path = Path(app_path) / "Contents" / "Info.plist"
  if not plist_path.is_file():
    return None
  try:
    with plist_path.open("rb") as handle:
      data = plistlib.load(handle)
  except (plistlib.InvalidFileException, OSError):
    return None
  version = data.get("CFBundleShortVersionString")
  return str(version) if isinstance(version, str) and version.strip() else None


class InstallDecision(Enum):
  FRESH_INSTALL = "fresh_install"
  SAME_VERSION_REINSTALL = "same_version_reinstall"
  UPGRADE = "upgrade"
  DOWNGRADE_REFUSED = "downgrade_refused"


@dataclass(frozen=True)
class InstallPlan:
  app_path: Path
  decision: InstallDecision
  existing_version: str | None
  target_version: str


def plan_installation(app_path: Path, target_version: str) -> InstallPlan:
  bundle_exists = Path(app_path).is_dir()
  existing_version = existing_installed_version(app_path) if bundle_exists else None

  if not bundle_exists:
    decision = InstallDecision.FRESH_INSTALL
  elif existing_version is None:
    decision = InstallDecision.UPGRADE
  else:
    comparison = compare_versions(target_version, existing_version)
    if comparison < 0:
      decision = InstallDecision.DOWNGRADE_REFUSED
    elif comparison == 0:
      decision = InstallDecision.SAME_VERSION_REINSTALL
    else:
      decision = InstallDecision.UPGRADE

  return InstallPlan(app_path=Path(app_path), decision=decision, existing_version=existing_version, target_version=str(target_version))


def is_ludoxel_process_running() -> bool:
  try:
    completed = subprocess.run(["pgrep", "-x", PROCESS_NAME], capture_output=True, text=True, check=False, timeout=10)
  except (OSError, subprocess.SubprocessError):
    return False
  return completed.returncode == 0 and bool(completed.stdout.strip())
