# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QHBoxLayout, QLabel, QPlainTextEdit, QPushButton, QVBoxLayout, QWidget

HEADING_TEXT = "Uninstall Ludoxel"
RETENTION_TEXT = "Your Ludoxel worlds, settings, and other user data will be preserved."
UNKNOWN_VERSION_TEXT = "Ludoxel version: unknown"
UNKNOWN_LOCATION_TEXT = "Installed at: unknown location"
CANCEL_BUTTON_TEXT = "Cancel"
UNINSTALL_BUTTON_TEXT = "Uninstall"


def build_detail_text(installed_version: str | None, install_dir: Path | None) -> str:
  version_line = f"Ludoxel version: {installed_version}" if installed_version else UNKNOWN_VERSION_TEXT
  location_line = f"Installed at: {install_dir}" if install_dir is not None else UNKNOWN_LOCATION_TEXT
  return f"{version_line}\n{location_line}"


class UninstallConfirmScreen(QWidget):
  cancelled = pyqtSignal()
  confirmed = pyqtSignal()

  def __init__(self, installed_version: str | None, install_dir: Path | None, parent: QWidget | None = None) -> None:
    super().__init__(parent)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(28, 24, 28, 24)
    layout.setSpacing(0)

    heading = QLabel(HEADING_TEXT, self)
    heading.setObjectName("installerHeading")
    layout.addWidget(heading)
    layout.addSpacing(20)

    self._detail_view = QPlainTextEdit(self)
    self._detail_view.setObjectName("uninstallDetailView")
    self._detail_view.setReadOnly(True)
    self._detail_view.setPlainText(build_detail_text(installed_version, install_dir))
    self._detail_view.setLineWrapMode(QPlainTextEdit.LineWrapMode.WidgetWidth)
    layout.addWidget(self._detail_view, stretch=1)
    layout.addSpacing(16)

    retention_notice = QLabel(RETENTION_TEXT, self)
    retention_notice.setObjectName("retentionNoticeLabel")
    retention_notice.setWordWrap(True)
    layout.addWidget(retention_notice)
    layout.addSpacing(18)

    button_row = QWidget(self)
    button_layout = QHBoxLayout(button_row)
    button_layout.setContentsMargins(0, 0, 0, 0)
    button_layout.setSpacing(12)
    button_layout.addStretch(1)

    cancel_button = QPushButton(CANCEL_BUTTON_TEXT, button_row)
    cancel_button.setObjectName("secondaryButton")
    cancel_button.clicked.connect(self.cancelled.emit)
    button_layout.addWidget(cancel_button)

    uninstall_button = QPushButton(UNINSTALL_BUTTON_TEXT, button_row)
    uninstall_button.setObjectName("primaryButton")
    uninstall_button.clicked.connect(self.confirmed.emit)
    button_layout.addWidget(uninstall_button)

    layout.addWidget(button_row)
