# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
import os
import subprocess
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from enum import Enum
from pathlib import Path

from ludoxel_installer.foundations.errors import InstallationError
from ludoxel_installer.foundations.version_compare import compare_versions

APP_EXECUTABLE_NAME = "Ludoxel.exe"
INSTALL_RECEIPT_FILE_NAME = "install-receipt.json"
UNINSTALLER_FILE_NAME = "Uninstall Ludoxel.exe"


def default_install_dir() -> Path:
  local_app_data = os.environ.get("LOCALAPPDATA", "").strip()
  if not local_app_data:
    raise InstallationError("Ludoxel Installer could not determine the per-user program directory (%LOCALAPPDATA%).")
  return Path(local_app_data) / "Programs" / "Ludoxel"


def installed_executable_path(install_dir: Path) -> Path:
  return Path(install_dir) / APP_EXECUTABLE_NAME


def installed_uninstaller_path(install_dir: Path) -> Path:
  return Path(install_dir) / UNINSTALLER_FILE_NAME


def _receipt_path(install_dir: Path) -> Path:
  return Path(install_dir) / INSTALL_RECEIPT_FILE_NAME


def existing_installed_version(install_dir: Path) -> str | None:
  receipt_path = _receipt_path(install_dir)
  if not receipt_path.is_file():
    return None
  try:
    data = json.loads(receipt_path.read_text(encoding="utf-8"))
  except (json.JSONDecodeError, OSError):
    return None
  version = data.get("application_version")
  return str(version) if isinstance(version, str) and version.strip() else None


class InstallDecision(Enum):
  FRESH_INSTALL = "fresh_install"
  SAME_VERSION_REINSTALL = "same_version_reinstall"
  UPGRADE = "upgrade"
  DOWNGRADE_REFUSED = "downgrade_refused"


@dataclass(frozen=True)
class InstallPlan:
  install_dir: Path
  decision: InstallDecision
  existing_version: str | None
  target_version: str


def plan_installation(install_dir: Path, target_version: str) -> InstallPlan:
  exe_exists = installed_executable_path(install_dir).is_file()
  existing_version = existing_installed_version(install_dir) if exe_exists else None

  if not exe_exists:
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

  return InstallPlan(install_dir=Path(install_dir), decision=decision, existing_version=existing_version, target_version=str(target_version))


def is_ludoxel_process_running() -> bool:
  try:
    completed = subprocess.run(["tasklist", "/FI", f"IMAGENAME eq {APP_EXECUTABLE_NAME}", "/FO", "CSV", "/NH"], capture_output=True, text=True, check=False, timeout=10)
  except (OSError, subprocess.SubprocessError):
    return False
  return APP_EXECUTABLE_NAME.lower() in completed.stdout.lower()


def _is_lock_error(error: OSError) -> bool:
  return isinstance(error, PermissionError) or getattr(error, "winerror", None) in {5, 32}


def _write_with_lock_retry(destination: Path, content: bytes, *, retries: int, retry_delay_seconds: float) -> None:
  pending = destination.with_name(f"{destination.name}.pending")
  pending.write_bytes(content)

  last_error: OSError | None = None
  for attempt in range(1, retries + 1):
    try:
      os.replace(pending, destination)
      return
    except OSError as error:
      last_error = error
      if attempt < retries and _is_lock_error(error):
        time.sleep(retry_delay_seconds)
        continue
      break

  pending.unlink(missing_ok=True)
  raise InstallationError(f"Ludoxel Installer could not replace {destination}. Close any running copy of Ludoxel and try again.", detail=str(last_error))


def atomic_replace_executable(source_exe: Path, install_dir: Path, *, retries: int = 20, retry_delay_seconds: float = 0.5) -> Path:
  install_dir = Path(install_dir)
  install_dir.mkdir(parents=True, exist_ok=True)
  destination = installed_executable_path(install_dir)
  _write_with_lock_retry(destination, Path(source_exe).read_bytes(), retries=retries, retry_delay_seconds=retry_delay_seconds)
  return destination


def atomic_write_uninstaller(source_exe: Path, install_dir: Path, *, retries: int = 20, retry_delay_seconds: float = 0.5) -> Path:
  install_dir = Path(install_dir)
  install_dir.mkdir(parents=True, exist_ok=True)
  destination = installed_uninstaller_path(install_dir)
  _write_with_lock_retry(destination, Path(source_exe).read_bytes(), retries=retries, retry_delay_seconds=retry_delay_seconds)
  return destination


def write_install_receipt(install_dir: Path, *, application_version: str) -> Path:
  receipt_path = _receipt_path(install_dir)
  payload = {"application_version": str(application_version), "installed_at": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")}
  receipt_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
  return receipt_path
