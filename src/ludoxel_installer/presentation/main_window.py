# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtWidgets import QApplication, QMainWindow, QStackedWidget, QVBoxLayout, QWidget

from ludoxel_installer.application.controller import InstallController
from ludoxel_installer.domain.installer_state import InstallerMode
from ludoxel_installer.domain.legal.third_party_resource import ThirdPartyMaterial
from ludoxel_installer.domain.progress import CANCELLABLE_STAGES, TERMINAL_STAGES, ProgressStage, initial_stage, terminal_stage
from ludoxel_installer.presentation.license_screen import LicenseScreen
from ludoxel_installer.presentation.progress_screen import ProgressScreen
from ludoxel_installer.presentation.third_party_viewer import ThirdPartyLicenseViewer
from ludoxel_installer.presentation.uninstall_confirm_screen import UninstallConfirmScreen

WINDOW_TITLE = "Ludoxel Installer"


class InstallerMainWindow(QMainWindow):
  def __init__(self, mode: InstallerMode, license_text: str, third_party_materials: tuple[ThirdPartyMaterial, ...], installed_version: str | None = None, install_dir: Path | None = None, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setWindowTitle(WINDOW_TITLE)
    self.resize(760, 600)
    self.setMinimumSize(640, 520)

    self._mode = mode
    self._third_party_materials = third_party_materials
    self._controller: InstallController | None = None
    self._current_stage: ProgressStage | None = None

    root = QWidget(self)
    root.setObjectName("installerRoot")
    self.setCentralWidget(root)
    root_layout = QVBoxLayout(root)
    root_layout.setContentsMargins(0, 0, 0, 0)

    self._stack = QStackedWidget(root)
    root_layout.addWidget(self._stack)

    self._license_screen = LicenseScreen(license_text, self._stack)
    self._license_screen.agreed.connect(self._on_confirmed)
    self._license_screen.declined.connect(self._on_declined)
    self._license_screen.third_party_requested.connect(self._show_third_party_viewer)
    self._stack.addWidget(self._license_screen)

    self._confirm_uninstall_screen = UninstallConfirmScreen(installed_version, install_dir, self._stack)
    self._confirm_uninstall_screen.cancelled.connect(self._on_declined)
    self._confirm_uninstall_screen.confirmed.connect(self._on_confirmed)
    self._stack.addWidget(self._confirm_uninstall_screen)

    self._progress_screen = ProgressScreen(self._stack)
    self._progress_screen.cancel_requested.connect(self._on_cancel_requested)
    self._progress_screen.retry_requested.connect(self._on_retry_requested)
    self._progress_screen.finish_requested.connect(self._on_finish_requested)
    self._stack.addWidget(self._progress_screen)

    self._stack.setCurrentWidget(self._license_screen if mode is InstallerMode.INSTALL else self._confirm_uninstall_screen)

  def _show_third_party_viewer(self) -> None:
    viewer = ThirdPartyLicenseViewer(self._third_party_materials, self)
    viewer.exec()

  def _on_declined(self) -> None:
    app = QApplication.instance()
    if app is not None:
      app.quit()

  def _on_confirmed(self) -> None:
    self._stack.setCurrentWidget(self._progress_screen)
    self._progress_screen.reset(self._mode)
    self._current_stage = initial_stage(self._mode)
    self._start_controller()

  def _start_controller(self) -> None:
    self._controller = InstallController(self._mode, self)
    self._controller.stage_changed.connect(self._on_stage_changed)
    self._controller.succeeded.connect(self._on_succeeded)
    self._controller.cancelled.connect(self._on_cancelled)
    self._controller.failed.connect(self._on_failed)
    self._controller.start()

  def _on_stage_changed(self, stage: ProgressStage, detail: str) -> None:
    self._current_stage = stage
    self._progress_screen.set_stage(stage, detail=detail)

  def _on_succeeded(self, _version: str) -> None:
    self._current_stage = terminal_stage(self._mode)
    self._progress_screen.set_success()

  def _on_cancelled(self) -> None:
    self._current_stage = None
    self._progress_screen.set_cancelled()

  def _on_failed(self, user_message: str, _detail: str) -> None:
    self._current_stage = None
    self._progress_screen.set_error(user_message)

  def _on_cancel_requested(self) -> None:
    if self._controller is not None:
      self._controller.request_cancel()

  def _on_retry_requested(self) -> None:
    self._progress_screen.reset(self._mode)
    self._current_stage = initial_stage(self._mode)
    self._start_controller()

  def _on_finish_requested(self) -> None:
    app = QApplication.instance()
    if app is not None:
      app.quit()

  def closeEvent(self, event) -> None:
    installation_in_progress = self._stack.currentWidget() is self._progress_screen and self._current_stage is not None and self._current_stage not in CANCELLABLE_STAGES and self._current_stage not in TERMINAL_STAGES
    if installation_in_progress:
      event.ignore()
      return
    if self._controller is not None:
      self._controller.request_cancel()
    super().closeEvent(event)
