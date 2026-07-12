# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QHBoxLayout, QLabel, QProgressBar, QPushButton, QVBoxLayout, QWidget

from ludoxel_installer.domain.installer_state import InstallerMode
from ludoxel_installer.domain.progress import CANCELLABLE_STAGES, STAGE_TEXT, ProgressStage, initial_stage, stage_progress_fraction, terminal_stage

CANCEL_BUTTON_TEXT = "Cancel"
RETRY_BUTTON_TEXT = "Retry"
FINISH_BUTTON_TEXT = "Finish"
CANCELLED_TEXT: dict[InstallerMode, str] = {InstallerMode.INSTALL: "Installation cancelled.", InstallerMode.UNINSTALL: "Uninstallation cancelled."}
FAILED_TEXT: dict[InstallerMode, str] = {InstallerMode.INSTALL: "Installation failed.", InstallerMode.UNINSTALL: "Uninstallation failed."}


class ProgressScreen(QWidget):
  cancel_requested = pyqtSignal()
  retry_requested = pyqtSignal()
  finish_requested = pyqtSignal()

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(24, 20, 24, 20)
    layout.setSpacing(12)
    layout.addStretch(1)

    self._stage_label = QLabel(self)
    self._stage_label.setObjectName("progressStageLabel")
    layout.addWidget(self._stage_label)
    layout.addSpacing(14)

    self._progress_bar = QProgressBar(self)
    self._progress_bar.setObjectName("installerProgressBar")
    self._progress_bar.setTextVisible(False)
    layout.addWidget(self._progress_bar)

    self._detail_label = QLabel(self)
    self._detail_label.setObjectName("progressDetailLabel")
    self._detail_label.setWordWrap(True)
    self._detail_label.setVisible(False)
    layout.addWidget(self._detail_label)

    layout.addStretch(1)

    button_row = QWidget(self)
    button_layout = QHBoxLayout(button_row)
    button_layout.setContentsMargins(0, 0, 0, 0)
    button_layout.setSpacing(12)
    button_layout.addStretch(1)

    self._cancel_button = QPushButton(CANCEL_BUTTON_TEXT, button_row)
    self._cancel_button.setObjectName("secondaryButton")
    self._cancel_button.clicked.connect(self.cancel_requested.emit)
    button_layout.addWidget(self._cancel_button)

    self._retry_button = QPushButton(RETRY_BUTTON_TEXT, button_row)
    self._retry_button.setObjectName("secondaryButton")
    self._retry_button.setVisible(False)
    self._retry_button.clicked.connect(self.retry_requested.emit)
    button_layout.addWidget(self._retry_button)

    self._finish_button = QPushButton(FINISH_BUTTON_TEXT, button_row)
    self._finish_button.setObjectName("primaryButton")
    self._finish_button.setVisible(False)
    self._finish_button.clicked.connect(self.finish_requested.emit)
    button_layout.addWidget(self._finish_button)

    layout.addWidget(button_row)

    self._mode = InstallerMode.INSTALL
    self.reset(InstallerMode.INSTALL)

  def reset(self, mode: InstallerMode) -> None:
    self._mode = mode
    self._detail_label.setVisible(False)
    self._detail_label.setProperty("state", "")
    self._cancel_button.setVisible(True)
    self._cancel_button.setEnabled(True)
    self._retry_button.setVisible(False)
    self._finish_button.setVisible(False)
    self.set_stage(initial_stage(mode))

  def set_stage(self, stage: ProgressStage, *, detail: str = "") -> None:
    self._stage_label.setText(STAGE_TEXT[stage])
    self._cancel_button.setEnabled(stage in CANCELLABLE_STAGES)
    self._progress_bar.setRange(0, 100)
    self._progress_bar.setValue(round(stage_progress_fraction(stage) * 100))
    if detail:
      self._detail_label.setText(detail)
      self._detail_label.setVisible(True)

  def set_cancelled(self) -> None:
    self._stage_label.setText(CANCELLED_TEXT[self._mode])
    self._progress_bar.setRange(0, 100)
    self._progress_bar.setValue(0)
    self._cancel_button.setVisible(False)
    self._retry_button.setVisible(True)
    self._finish_button.setVisible(True)

  def set_error(self, user_message: str) -> None:
    self._stage_label.setText(FAILED_TEXT[self._mode])
    self._progress_bar.setRange(0, 100)
    self._progress_bar.setValue(0)
    self._detail_label.setText(user_message)
    self._detail_label.setProperty("state", "error")
    self._detail_label.style().unpolish(self._detail_label)
    self._detail_label.style().polish(self._detail_label)
    self._detail_label.setVisible(True)
    self._cancel_button.setVisible(False)
    self._retry_button.setVisible(True)
    self._finish_button.setVisible(True)

  def set_success(self) -> None:
    self.set_stage(terminal_stage(self._mode))
    self._cancel_button.setVisible(False)
    self._retry_button.setVisible(False)
    self._finish_button.setVisible(True)
