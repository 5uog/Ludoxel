# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QLabel, QPushButton, QSizePolicy, QVBoxLayout, QWidget


class DeathOverlay(QWidget):
  respawn_requested = pyqtSignal()

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)

    self.setVisible(False)
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
    self.setObjectName("deathRoot")

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.addStretch(1)

    panel = QFrame(self)
    panel.setObjectName("panel")
    panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    panel.setMinimumWidth(420)

    pv = QVBoxLayout(panel)
    pv.setContentsMargins(20, 18, 20, 20)
    pv.setSpacing(12)

    title = QLabel("YOU DIED", panel)
    title.setObjectName("title")
    title.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
    pv.addWidget(title)

    self._message = QLabel("Player died.", panel)
    self._message.setWordWrap(True)
    self._message.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
    pv.addWidget(self._message)

    btn = QPushButton("Respawn", panel)
    btn.setObjectName("menuBtn")
    btn.clicked.connect(self.respawn_requested.emit)
    pv.addWidget(btn)

    root.addWidget(panel, alignment=Qt.AlignmentFlag.AlignHCenter)
    root.addStretch(1)

  def set_message(self, text: str) -> None:
    body = str(text).strip()
    if not body:
      body = "Player died."
    self._message.setText(body)
