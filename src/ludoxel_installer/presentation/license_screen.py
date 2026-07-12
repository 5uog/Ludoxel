# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QCheckBox, QHBoxLayout, QLabel, QPlainTextEdit, QPushButton, QVBoxLayout, QWidget

from ludoxel_installer.domain.consent_state import ConsentState
from ludoxel_installer.domain.license_scroll_state import LicenseScrollState

HEADING_TEXT = "Ludoxel License Agreement"
CHECKBOX_TEXT = "I have read and agree to the Ludoxel Independent License."
THIRD_PARTY_BUTTON_TEXT = "Third-Party Licenses"
DECLINE_BUTTON_TEXT = "Decline"
AGREE_BUTTON_TEXT = "Agree and Install"


class LicenseScreen(QWidget):
  agreed = pyqtSignal()
  declined = pyqtSignal()
  third_party_requested = pyqtSignal()

  def __init__(self, license_text: str, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._scroll_state = LicenseScrollState()
    self._consent_state = ConsentState()

    layout = QVBoxLayout(self)
    layout.setContentsMargins(28, 24, 28, 24)
    layout.setSpacing(0)

    heading = QLabel(HEADING_TEXT, self)
    heading.setObjectName("installerHeading")
    layout.addWidget(heading)
    layout.addSpacing(20)

    self._license_view = QPlainTextEdit(self)
    self._license_view.setObjectName("licenseTextView")
    self._license_view.setReadOnly(True)
    self._license_view.setPlainText(license_text)
    self._license_view.setLineWrapMode(QPlainTextEdit.LineWrapMode.WidgetWidth)
    layout.addWidget(self._license_view, stretch=1)
    layout.addSpacing(16)

    scrollbar = self._license_view.verticalScrollBar()
    scrollbar.valueChanged.connect(self._on_scroll_changed)
    scrollbar.rangeChanged.connect(self._on_scroll_range_changed)

    self._checkbox = QCheckBox(CHECKBOX_TEXT, self)
    self._checkbox.setObjectName("consentCheckbox")
    self._checkbox.toggled.connect(self._on_checkbox_toggled)
    layout.addWidget(self._checkbox)
    layout.addSpacing(18)

    button_row = QWidget(self)
    button_row.setObjectName("licenseButtonRow")
    button_layout = QHBoxLayout(button_row)
    button_layout.setContentsMargins(0, 0, 0, 0)
    button_layout.setSpacing(12)

    self._third_party_button = QPushButton(THIRD_PARTY_BUTTON_TEXT, button_row)
    self._third_party_button.setObjectName("secondaryButton")
    self._third_party_button.clicked.connect(self.third_party_requested.emit)
    button_layout.addWidget(self._third_party_button)
    button_layout.addStretch(1)

    self._decline_button = QPushButton(DECLINE_BUTTON_TEXT, button_row)
    self._decline_button.setObjectName("secondaryButton")
    self._decline_button.clicked.connect(self.declined.emit)
    button_layout.addWidget(self._decline_button)

    self._agree_button = QPushButton(AGREE_BUTTON_TEXT, button_row)
    self._agree_button.setObjectName("primaryButton")
    self._agree_button.setEnabled(False)
    self._agree_button.clicked.connect(self.agreed.emit)
    button_layout.addWidget(self._agree_button)

    layout.addWidget(button_row)

    self._sync_scroll_state()

  def _sync_scroll_state(self) -> None:
    scrollbar = self._license_view.verticalScrollBar()
    reached_end = self._scroll_state.update(value=scrollbar.value(), maximum=scrollbar.maximum())
    self._consent_state.set_reached_license_end(reached_end)
    self._sync_agree_button()

  def _on_scroll_changed(self, _value: int) -> None:
    self._sync_scroll_state()

  def _on_scroll_range_changed(self, _minimum: int, _maximum: int) -> None:
    self._sync_scroll_state()

  def _on_checkbox_toggled(self, checked: bool) -> None:
    self._consent_state.set_checkbox_checked(checked)
    self._sync_agree_button()

  def _sync_agree_button(self) -> None:
    self._agree_button.setEnabled(self._consent_state.can_proceed)

  def showEvent(self, event) -> None:
    super().showEvent(event)
    self._sync_scroll_state()

  def resizeEvent(self, event) -> None:
    super().resizeEvent(event)
    self._sync_scroll_state()
