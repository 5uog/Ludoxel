# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtWidgets import QDialog, QHBoxLayout, QLabel, QListWidget, QPlainTextEdit, QPushButton, QVBoxLayout, QWidget

from ludoxel_installer.domain.legal.third_party_resource import ThirdPartyMaterial

DIALOG_TITLE = "Third-Party Licenses"
HEADING_TEXT = "Third-Party Licenses"
CLOSE_BUTTON_TEXT = "Close"
NO_MATERIALS_TEXT = "No third-party materials are bundled with this installer."


class ThirdPartyLicenseViewer(QDialog):
  def __init__(self, materials: tuple[ThirdPartyMaterial, ...], parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("thirdPartyDialog")
    self.setWindowTitle(DIALOG_TITLE)
    self.resize(720, 520)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(28, 24, 28, 24)
    layout.setSpacing(0)

    heading = QLabel(HEADING_TEXT, self)
    heading.setObjectName("installerHeading")
    layout.addWidget(heading)
    layout.addSpacing(20)

    body = QWidget(self)
    body_layout = QHBoxLayout(body)
    body_layout.setContentsMargins(0, 0, 0, 0)
    body_layout.setSpacing(16)

    self._list = QListWidget(body)
    self._list.setObjectName("thirdPartyList")
    self._list.setFixedWidth(200)
    body_layout.addWidget(self._list)

    self._text_view = QPlainTextEdit(body)
    self._text_view.setObjectName("thirdPartyTextView")
    self._text_view.setReadOnly(True)
    self._text_view.setLineWrapMode(QPlainTextEdit.LineWrapMode.WidgetWidth)
    body_layout.addWidget(self._text_view, stretch=1)

    layout.addWidget(body, stretch=1)
    layout.addSpacing(18)

    self._materials = materials
    for material in materials:
      self._list.addItem(material.name)
    self._list.currentRowChanged.connect(self._on_selection_changed)

    if materials:
      self._list.setCurrentRow(0)
    else:
      self._text_view.setPlainText(NO_MATERIALS_TEXT)

    close_row = QHBoxLayout()
    close_row.addStretch(1)
    close_button = QPushButton(CLOSE_BUTTON_TEXT, self)
    close_button.setObjectName("secondaryButton")
    close_button.clicked.connect(self.accept)
    close_row.addWidget(close_button)
    layout.addLayout(close_row)

  def _on_selection_changed(self, row: int) -> None:
    if 0 <= row < len(self._materials):
      self._text_view.setPlainText(self._materials[row].license_text)
