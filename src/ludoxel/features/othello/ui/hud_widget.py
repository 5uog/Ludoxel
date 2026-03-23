# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QLabel

from ....shared.ui.hud.hud_payload import HudPayload
from ....shared.ui.hud.hud_widget import HUDWidget


class OthelloHudWidget(HUDWidget):

    def __init__(self, parent=None) -> None:
        super().__init__()
        if parent is not None:
            self.setParent(parent)

        self._title_label = QLabel(self)
        self._title_label.setObjectName("othelloTitle")
        self._title_label.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self._title_label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        self._title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._title_label.setWordWrap(True)
        self._title_label.setText("")

        self._title_text = ""

    def set_texts(self, *, left_text: str, right_text: str="", title_text: str="") -> None:
        next_title = str(title_text)
        title_changed = bool(next_title != self._title_text)
        self._title_text = next_title
        self.set_payload(HudPayload(left_text=str(left_text), right_text=str(right_text)))
        if bool(title_changed):
            self._relayout_title()

    def resizeEvent(self, event) -> None:
        super().resizeEvent(event)
        self._relayout_title()

    def _relayout(self) -> None:
        super()._relayout()
        self._relayout_title()

    def _relayout_title(self) -> None:
        title_text = str(self._title_text).strip()
        self._title_label.setText(title_text)
        if not title_text or int(self.width()) <= 1 or int(self.height()) <= 1:
            self._title_label.setVisible(False)
            return

        width = min(680, max(320, self.width() // 2))
        height = max(64, self._title_label.sizeHint().height() + 18)
        x = max(0,(self.width() - int(width)) // 2)
        y = max(24, min(max(24, self.height() // 5), max(24, self.height() - int(height) - 24)))
        self._title_label.setGeometry(int(x), int(y), int(width), int(height))
        self._title_label.setVisible(True)
        self._title_label.raise_()
