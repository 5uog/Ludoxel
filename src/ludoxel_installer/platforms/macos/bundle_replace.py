# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from ludoxel_installer.domain.rollback import RollbackJournal
from ludoxel_installer.foundations.errors import InstallationError

_LSREGISTER = "/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
_BACKUP_SUFFIX = ".ludoxel-installer-backup"


def _privileged_shell(command: str) -> None:
  escaped = command.replace("\\", "\\\\").replace('"', '\\"')
  script = f'do shell script "{escaped}" with administrator privileges'
  completed = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, check=False, timeout=120)
  if completed.returncode != 0:
    raise InstallationError("Ludoxel Installer could not obtain permission to write to /Applications.", detail=completed.stderr.strip() or completed.stdout.strip())


def _move(source: Path, destination: Path) -> None:
  try:
    shutil.move(str(source), str(destination))
  except PermissionError:
    _privileged_shell(f"mv {_quote(source)} {_quote(destination)}")


def _remove_tree(path: Path) -> None:
  try:
    shutil.rmtree(path)
  except PermissionError:
    _privileged_shell(f"rm -rf {_quote(path)}")


def _quote(path: Path) -> str:
  return "'" + str(path).replace("'", "'\\''") + "'"


def register_with_launch_services(app_path: Path) -> None:
  try:
    subprocess.run([_LSREGISTER, "-f", str(app_path)], capture_output=True, text=True, check=False, timeout=30)
  except (OSError, subprocess.SubprocessError):
    return


def stage_and_replace(extracted_bundle: Path, target_app_path: Path, rollback: RollbackJournal) -> None:
  extracted_bundle = Path(extracted_bundle)
  target_app_path = Path(target_app_path)
  target_app_path.parent.mkdir(parents=True, exist_ok=True)

  backup_path = target_app_path.with_name(target_app_path.name + _BACKUP_SUFFIX)
  if backup_path.exists():
    _remove_tree(backup_path)

  had_existing = target_app_path.exists()
  if had_existing:
    _move(target_app_path, backup_path)
    rollback.record(f"restore previous {target_app_path}", lambda: _move(backup_path, target_app_path))

  _move(extracted_bundle, target_app_path)
  rollback.record(f"remove staged {target_app_path}", lambda: _remove_tree(target_app_path))

  executable_path = target_app_path / "Contents" / "MacOS" / "Ludoxel"
  if not executable_path.is_file():
    raise InstallationError("Ludoxel Installer staged the application bundle, but the installed copy is missing its executable.", detail=f"expected {executable_path}")

  if had_existing and backup_path.exists():
    _remove_tree(backup_path)
