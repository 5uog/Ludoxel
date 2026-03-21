# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QFrame, QLabel, QVBoxLayout, QWidget


class StatusOverlayFrame(QFrame):

    def __init__(self, *, title_text: str, status_text: str, object_name: str, title_object_name: str, status_object_name: str, parent: QWidget | None=None, flags=Qt.WindowType.Widget) -> None:
        super().__init__(parent, flags)
        self.setObjectName(str(object_name))
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"QFrame#{object_name} {{ background: #121212; }}" f"QLabel#{title_object_name} {{ color: #f4f4f4; font-size: 28px; font-weight: 700; }}" f"QLabel#{status_object_name} {{ color: #c8c8c8; font-size: 14px; }}")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.addStretch(1)

        self._title = QLabel(str(title_text).strip(), self)
        self._title.setObjectName(str(title_object_name))
        self._title.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        layout.addWidget(self._title)

        self._status = QLabel("", self)
        self._status.setObjectName(str(status_object_name))
        self._status.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        layout.addWidget(self._status)

        layout.addStretch(1)
        self.set_status_text(str(status_text))

    def set_title_text(self, text: str) -> None:
        self._title.setText(str(text).strip())

    def set_status_text(self, text: str) -> None:
        self._status.setText(str(text).strip() or "Loading...")
