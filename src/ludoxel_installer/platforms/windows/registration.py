# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from ludoxel_installer.foundations.errors import RegistrationError

if sys.platform.startswith("win"):
  import winreg
else:
  winreg = None

DISPLAY_NAME = "Ludoxel"
PUBLISHER = "Kento Konishi"
UNINSTALL_REGISTRY_SUBKEY = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\Ludoxel"


def start_menu_shortcut_path() -> Path:
  app_data = os.environ.get("APPDATA", "").strip()
  if not app_data:
    raise RegistrationError("Ludoxel Installer could not determine the per-user Start Menu directory (%APPDATA%).")
  return Path(app_data) / "Microsoft" / "Windows" / "Start Menu" / "Programs" / f"{DISPLAY_NAME}.lnk"


def create_start_menu_shortcut(*, target_path: Path, shortcut_path: Path | None = None, icon_path: Path | None = None) -> Path:
  destination = Path(shortcut_path) if shortcut_path is not None else start_menu_shortcut_path()
  destination.parent.mkdir(parents=True, exist_ok=True)
  icon_line = f'$s.IconLocation = "{icon_path}"\n' if icon_path is not None else ""

  script = f'$sh = New-Object -ComObject WScript.Shell\n$s = $sh.CreateShortcut("{destination}")\n$s.TargetPath = "{target_path}"\n$s.WorkingDirectory = "{Path(target_path).parent}"\n{icon_line}$s.Save()\n'

  completed = subprocess.run(["powershell", "-NoProfile", "-NonInteractive", "-Command", script], capture_output=True, text=True, check=False, timeout=30)
  if completed.returncode != 0 or not destination.is_file():
    raise RegistrationError("Ludoxel Installer could not create the Start Menu shortcut.", detail=completed.stderr.strip() or completed.stdout.strip())

  return destination


def remove_start_menu_shortcut(shortcut_path: Path | None = None) -> None:
  destination = Path(shortcut_path) if shortcut_path is not None else start_menu_shortcut_path()
  destination.unlink(missing_ok=True)


def register_uninstall_entry(*, install_dir: Path, application_version: str, executable_path: Path, uninstaller_path: Path) -> None:
  quoted_uninstaller = f'"{uninstaller_path}"'
  values: dict[str, tuple[int, object]] = {
    "DisplayName": (winreg.REG_SZ, DISPLAY_NAME),
    "DisplayVersion": (winreg.REG_SZ, str(application_version)),
    "Publisher": (winreg.REG_SZ, PUBLISHER),
    "InstallLocation": (winreg.REG_SZ, str(install_dir)),
    "DisplayIcon": (winreg.REG_SZ, str(executable_path)),
    "UninstallString": (winreg.REG_SZ, f"{quoted_uninstaller} --uninstall"),
    "QuietUninstallString": (winreg.REG_SZ, f"{quoted_uninstaller} --uninstall --quiet"),
    "NoModify": (winreg.REG_DWORD, 1),
    "NoRepair": (winreg.REG_DWORD, 1),
  }

  try:
    with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, UNINSTALL_REGISTRY_SUBKEY, 0, winreg.KEY_WRITE) as key:
      for name, (value_type, value) in values.items():
        winreg.SetValueEx(key, name, 0, value_type, value)
  except OSError as error:
    raise RegistrationError("Ludoxel Installer could not register Ludoxel in Installed apps.", detail=str(error)) from error


def unregister_uninstall_entry() -> None:
  try:
    winreg.DeleteKey(winreg.HKEY_CURRENT_USER, UNINSTALL_REGISTRY_SUBKEY)
  except FileNotFoundError:
    return
  except OSError as error:
    raise RegistrationError("Ludoxel Installer could not remove the Installed apps registration.", detail=str(error)) from error


def read_uninstall_entry_install_location() -> Path | None:
  try:
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, UNINSTALL_REGISTRY_SUBKEY, 0, winreg.KEY_READ) as key:
      value, _ = winreg.QueryValueEx(key, "InstallLocation")
  except OSError:
    return None
  return Path(str(value)) if str(value).strip() else None
