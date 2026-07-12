# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import sys
import threading
from pathlib import Path

from PyQt6.QtCore import QObject, QThread, pyqtSignal

from ludoxel_installer.domain.installer_state import InstallerMode
from ludoxel_installer.domain.payload.extraction import cleanup_temp_root, create_temp_root, extract_payload
from ludoxel_installer.domain.payload.verification import VerifiedPayload, verify_payload
from ludoxel_installer.domain.progress import CANCELLABLE_STAGES, ProgressStage
from ludoxel_installer.domain.rollback import RollbackJournal
from ludoxel_installer.foundations.errors import InstallationError, InstallerError, UnsupportedPlatformError, map_exception
from ludoxel_installer.foundations.platform_info import WINDOWS, detect_platform
from ludoxel_installer.foundations.resource_root import payload_root
from ludoxel_installer.platforms import macos, windows


class CancelledByUser(InstallerError):
  def __init__(self) -> None:
    super().__init__("Installation was cancelled.")


class InstallWorker(QObject):
  stage_changed = pyqtSignal(object, str)
  succeeded = pyqtSignal(str)
  cancelled = pyqtSignal()
  failed = pyqtSignal(str, str)

  def __init__(self, mode: InstallerMode) -> None:
    super().__init__()
    self._mode = mode
    self._cancel_event = threading.Event()
    self._windows_install_dir: Path | None = None

  def request_cancel(self) -> None:
    self._cancel_event.set()

  def run(self) -> None:
    if self._mode is InstallerMode.INSTALL:
      self._run_install()
    else:
      self._run_windows_uninstall()

  def _check_cancelled(self, stage: ProgressStage) -> None:
    if stage in CANCELLABLE_STAGES and self._cancel_event.is_set():
      raise CancelledByUser

  def _report(self, stage: ProgressStage, *, detail: str = "") -> None:
    self.stage_changed.emit(stage, detail)

  def _run_install(self) -> None:
    temp_root: Path | None = None
    try:
      platform_info = detect_platform()
      if not platform_info.is_supported:
        raise UnsupportedPlatformError(f"Ludoxel Installer does not support this operating system ({platform_info.platform_id}).")

      root = payload_root()
      if root is None:
        raise InstallationError("This installer has no embedded application payload to install.")

      self._report(ProgressStage.VERIFYING)
      verified = verify_payload(root, platform_info)
      self._check_cancelled(ProgressStage.VERIFYING)

      self._report(ProgressStage.PREPARING)
      temp_root = create_temp_root()
      extracted = extract_payload(verified, temp_root)
      self._check_cancelled(ProgressStage.PREPARING)

      self._report(ProgressStage.INSTALLING)
      rollback = RollbackJournal()
      if platform_info.platform_id == WINDOWS:
        self._install_windows(verified, extracted.extracted_path, rollback)
      else:
        self._install_macos(verified, extracted.extracted_path, rollback)

      self._report(ProgressStage.REGISTERING)
      if platform_info.platform_id == WINDOWS:
        self._register_windows(verified)
      else:
        macos.bundle_replace.register_with_launch_services(macos.install.installed_app_path())

      self._report(ProgressStage.COMPLETE)
      self.succeeded.emit(verified.manifest.application_version)
    except CancelledByUser:
      self.cancelled.emit()
    except Exception as error:
      mapped = map_exception(error)
      self.failed.emit(mapped.user_message, mapped.detail)
    finally:
      if temp_root is not None:
        cleanup_temp_root(temp_root)

  def _install_windows(self, verified: VerifiedPayload, extracted_exe: Path, rollback: RollbackJournal) -> None:
    if windows.install.is_ludoxel_process_running():
      raise InstallationError("Ludoxel is currently running. Close Ludoxel and run the installer again.")

    install_dir = windows.install.default_install_dir()
    plan = windows.install.plan_installation(install_dir, verified.manifest.application_version)
    if plan.decision is windows.install.InstallDecision.DOWNGRADE_REFUSED:
      raise InstallationError(f"An installed Ludoxel version ({plan.existing_version}) is newer than this installer's version ({verified.manifest.application_version}). Downgrading is not supported by this installer.")

    destination = windows.install.atomic_replace_executable(extracted_exe, install_dir)
    rollback.record(f"remove installed {destination}", lambda: destination.unlink(missing_ok=True))
    windows.install.write_install_receipt(install_dir, application_version=verified.manifest.application_version)
    self._windows_install_dir = install_dir

  def _register_windows(self, verified: VerifiedPayload) -> None:
    assert self._windows_install_dir is not None
    install_dir = self._windows_install_dir
    executable_path = windows.install.installed_executable_path(install_dir)

    current_exe = Path(sys.executable)
    uninstaller_path = windows.install.atomic_write_uninstaller(current_exe, install_dir) if current_exe.is_file() else windows.install.installed_uninstaller_path(install_dir)

    windows.registration.create_start_menu_shortcut(target_path=executable_path, icon_path=executable_path)
    windows.registration.register_uninstall_entry(install_dir=install_dir, application_version=verified.manifest.application_version, executable_path=executable_path, uninstaller_path=uninstaller_path)

  def _install_macos(self, verified: VerifiedPayload, extracted_bundle: Path, rollback: RollbackJournal) -> None:
    if macos.install.is_ludoxel_process_running():
      raise InstallationError("Ludoxel is currently running. Quit Ludoxel and run the installer again.")

    app_path = macos.install.installed_app_path()
    plan = macos.install.plan_installation(app_path, verified.manifest.application_version)
    if plan.decision is macos.install.InstallDecision.DOWNGRADE_REFUSED:
      raise InstallationError(f"An installed Ludoxel version ({plan.existing_version}) is newer than this installer's version ({verified.manifest.application_version}). Downgrading is not supported by this installer.")

    macos.bundle_replace.stage_and_replace(extracted_bundle, app_path, rollback)

  def _run_windows_uninstall(self) -> None:
    try:
      install_dir = windows.install.default_install_dir()

      if windows.install.is_ludoxel_process_running():
        raise InstallationError("Ludoxel is currently running. Close Ludoxel and run the uninstaller again.")

      self._report(ProgressStage.UNREGISTERING)
      _removed_shortcut, _removed_registration = windows.uninstall.unregister_installation()

      self._report(ProgressStage.UNINSTALLING)
      removed_install_dir = windows.uninstall.remove_installed_files(install_dir)

      self._report(ProgressStage.UNINSTALL_COMPLETE)
      self.succeeded.emit("uninstalled" if removed_install_dir else "partially-uninstalled")
    except Exception as error:
      mapped = map_exception(error)
      self.failed.emit(mapped.user_message, mapped.detail)


class InstallController(QObject):
  stage_changed = pyqtSignal(object, str)
  succeeded = pyqtSignal(str)
  cancelled = pyqtSignal()
  failed = pyqtSignal(str, str)

  def __init__(self, mode: InstallerMode, parent: QObject | None = None) -> None:
    super().__init__(parent)
    self._thread = QThread(self)
    self._worker = InstallWorker(mode)
    self._worker.moveToThread(self._thread)

    self._thread.started.connect(self._worker.run)
    self._worker.stage_changed.connect(self.stage_changed)
    self._worker.succeeded.connect(self._on_finished)
    self._worker.cancelled.connect(self._on_finished)
    self._worker.failed.connect(self._on_finished)
    self._worker.succeeded.connect(self.succeeded)
    self._worker.cancelled.connect(self.cancelled)
    self._worker.failed.connect(self.failed)

  def start(self) -> None:
    self._thread.start()

  def request_cancel(self) -> None:
    self._worker.request_cancel()

  def _on_finished(self, *_args: object) -> None:
    self._thread.quit()
    self._thread.wait()
