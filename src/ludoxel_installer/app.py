# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

from ludoxel_installer.domain.installer_state import InstallerMode


@dataclass(frozen=True)
class LaunchArgs:
  mode: InstallerMode
  quiet: bool


def parse_launch_args(argv: list[str]) -> LaunchArgs:
  uninstall = "--uninstall" in argv
  return LaunchArgs(mode=InstallerMode.UNINSTALL if uninstall else InstallerMode.INSTALL, quiet="--quiet" in argv)


def _run_quiet_windows_uninstall() -> int:
  from ludoxel_installer.platforms.windows.install import default_install_dir, is_ludoxel_process_running
  from ludoxel_installer.platforms.windows.uninstall import uninstall

  install_dir = default_install_dir()
  if is_ludoxel_process_running():
    return 1
  result = uninstall(install_dir)
  return 0 if result.removed_install_dir else 1


def _describe_windows_installation() -> tuple[str | None, Path | None]:
  from ludoxel_installer.platforms.windows.install import default_install_dir, existing_installed_version

  install_dir = default_install_dir()
  return existing_installed_version(install_dir), install_dir


def _run_gui(launch_args: LaunchArgs) -> int:
  from PyQt6.QtWidgets import QApplication

  from ludoxel_installer.domain.legal.license_resource import load_license_text
  from ludoxel_installer.domain.legal.third_party_resource import list_third_party_materials
  from ludoxel_installer.foundations.errors import InstallerError
  from ludoxel_installer.foundations.resource_root import fonts_root, installer_resource_root
  from ludoxel_installer.presentation.fonts import apply_application_font, install_kaisei_opti
  from ludoxel_installer.presentation.main_window import InstallerMainWindow
  from ludoxel_installer.presentation.stylesheet import load_installer_stylesheet

  application = QApplication(sys.argv)
  application.setApplicationName("Ludoxel Installer")

  font_dir = fonts_root()
  if font_dir is not None:
    font_result = install_kaisei_opti(font_dir=font_dir)
    if font_result.ok:
      apply_application_font(app=application, family=font_result.family)

  styles_dir = installer_resource_root() / "presentation" / "styles"
  application.setStyleSheet(load_installer_stylesheet(styles_dir))

  try:
    license_text = load_license_text()
  except InstallerError as error:
    license_text = f"{error.user_message}\n\n{error.detail}"

  third_party_materials = list_third_party_materials()

  installed_version: str | None = None
  install_dir: Path | None = None
  if launch_args.mode is InstallerMode.UNINSTALL and sys.platform.startswith("win"):
    installed_version, install_dir = _describe_windows_installation()

  window = InstallerMainWindow(launch_args.mode, license_text, third_party_materials, installed_version, install_dir)
  window.show()

  return application.exec()


def run(argv: list[str] | None = None) -> int:
  launch_args = parse_launch_args(list(sys.argv[1:] if argv is None else argv))

  if launch_args.mode is InstallerMode.UNINSTALL and launch_args.quiet and sys.platform.startswith("win"):
    return _run_quiet_windows_uninstall()

  return _run_gui(launch_args)
