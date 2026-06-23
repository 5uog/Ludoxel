# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.interface.settings.widgets.controls import BedrockToggleRow


class ChatSettingsPanel(QWidget):
  mute_changed = pyqtSignal(bool)
  back_requested = pyqtSignal()

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("chatSettingsRoot")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
    self.setVisible(False)

    root = QVBoxLayout(self)
    root.setContentsMargins(48, 48, 48, 48)
    root.setSpacing(0)
    root.addStretch(1)

    panel = QFrame(self)
    panel.setObjectName("chatSettingsPanel")
    panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    panel.setMinimumWidth(460)

    panel_layout = QVBoxLayout(panel)
    panel_layout.setContentsMargins(22, 20, 22, 20)
    panel_layout.setSpacing(16)

    from PyQt6.QtWidgets import QLabel

    self._title = QLabel("Chat Settings", panel)
    self._title.setObjectName("chatSettingsTitle")
    self._title.setAlignment(Qt.AlignmentFlag.AlignHCenter)
    panel_layout.addWidget(self._title)

    self._mute_row = BedrockToggleRow("Mute All Chat", panel)
    self._mute_row.toggled.connect(self.mute_changed.emit)
    panel_layout.addWidget(self._mute_row)

    self._back_button = QPushButton("Back", panel)
    self._back_button.setObjectName("menuBtn")
    self._back_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._back_button.clicked.connect(self.back_requested.emit)
    panel_layout.addWidget(self._back_button)

    root.addWidget(panel, alignment=Qt.AlignmentFlag.AlignHCenter)
    root.addStretch(1)

  def set_mute(self, value: bool) -> None:
    self._mute_row.sync_checked(bool(value))

  def keyPressEvent(self, e) -> None:
    if int(e.key()) == int(Qt.Key.Key_Escape):
      self.back_requested.emit()
      e.accept()
      return
    super().keyPressEvent(e)
