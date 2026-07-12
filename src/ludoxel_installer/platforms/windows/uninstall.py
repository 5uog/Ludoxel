# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

from ludoxel_installer.foundations.errors import InstallationError
from ludoxel_installer.platforms.windows.install import default_install_dir, installed_uninstaller_path
from ludoxel_installer.platforms.windows.registration import remove_start_menu_shortcut, unregister_uninstall_entry

_DEFERRED_REMOVAL_MAX_ATTEMPTS = 60
_DEFERRED_REMOVAL_RETRY_DELAY_SECONDS = 2


@dataclass(frozen=True)
class UninstallResult:
  install_dir: Path
  removed_shortcut: bool
  removed_registration: bool
  removed_install_dir: bool


def _running_from_inside(target_dir: Path) -> bool:
  target_dir = Path(target_dir).resolve()
  current_exe = Path(sys.executable).resolve()

  try:
    current_exe.relative_to(target_dir)
    return True
  except ValueError:
    return False


def _schedule_deferred_directory_removal(target_dir: Path) -> None:
  script_path = Path(tempfile.gettempdir()) / f"ludoxel-uninstall-cleanup-{os.getpid()}.bat"
  script_path.write_text(f'@echo off\r\nfor /l %%i in (1,1,{_DEFERRED_REMOVAL_MAX_ATTEMPTS}) do (\r\n  rmdir /s /q "{target_dir}" 2>nul\r\n  if not exist "{target_dir}" goto :done\r\n  timeout /t {_DEFERRED_REMOVAL_RETRY_DELAY_SECONDS} /nobreak >nul\r\n)\r\n:done\r\ndel "%~f0"\r\n', encoding="utf-8")
  subprocess.Popen(["cmd.exe", "/c", str(script_path)], close_fds=True, creationflags=subprocess.CREATE_NO_WINDOW)


def unregister_installation() -> tuple[bool, bool]:
  removed_shortcut = False
  try:
    remove_start_menu_shortcut()
    removed_shortcut = True
  except Exception:
    removed_shortcut = False

  removed_registration = False
  try:
    unregister_uninstall_entry()
    removed_registration = True
  except Exception:
    removed_registration = False

  return removed_shortcut, removed_registration


def remove_installed_files(target_dir: Path) -> bool:
  if not target_dir.is_dir():
    return False

  if _running_from_inside(target_dir):
    _schedule_deferred_directory_removal(target_dir)
    return True

  try:
    shutil.rmtree(target_dir)
    return True
  except OSError as error:
    raise InstallationError(f"Ludoxel Installer removed the Start Menu shortcut and Installed apps entry, but could not fully remove {target_dir}.", detail=str(error)) from error


def uninstall(install_dir: Path | None = None) -> UninstallResult:
  target_dir = Path(install_dir) if install_dir is not None else default_install_dir()
  removed_shortcut, removed_registration = unregister_installation()
  removed_install_dir = remove_installed_files(target_dir)

  return UninstallResult(install_dir=target_dir, removed_shortcut=removed_shortcut, removed_registration=removed_registration, removed_install_dir=removed_install_dir)


def installed_uninstaller_target(install_dir: Path) -> Path:
  return installed_uninstaller_path(install_dir)
