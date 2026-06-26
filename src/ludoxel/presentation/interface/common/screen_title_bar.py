# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QPushButton, QWidget

_BAR_HEIGHT_PX = 56
_BAR_INNER_MARGIN_PX = 8
_SIDE_SLOT_WIDTH_PX = 160


class ScreenTitleBar(QFrame):
  back_requested = pyqtSignal()

  def __init__(self, title: str, *, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("screenTitleBar")
    self.setFixedHeight(int(_BAR_HEIGHT_PX))
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    layout = QHBoxLayout(self)
    layout.setContentsMargins(int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX))
    layout.setSpacing(0)

    self._left_slot = QWidget(self)
    self._left_slot.setFixedWidth(int(_SIDE_SLOT_WIDTH_PX))
    left_layout = QHBoxLayout(self._left_slot)
    left_layout.setContentsMargins(0, 0, 0, 0)
    left_layout.setSpacing(0)
    self._back_button = QPushButton("< Back", self._left_slot)
    self._back_button.setObjectName("screenBackButton")
    self._back_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._back_button.clicked.connect(self.back_requested.emit)
    left_layout.addWidget(self._back_button, alignment=Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
    layout.addWidget(self._left_slot)

    self._title_label = QLabel(str(title), self)
    self._title_label.setObjectName("screenTitleLabel")
    self._title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    layout.addWidget(self._title_label, stretch=1)

    self._right_slot = QWidget(self)
    self._right_slot.setFixedWidth(int(_SIDE_SLOT_WIDTH_PX))
    self._right_layout = QHBoxLayout(self._right_slot)
    self._right_layout.setContentsMargins(0, 0, 0, 0)
    self._right_layout.setSpacing(int(_BAR_INNER_MARGIN_PX))
    self._right_layout.addStretch(1)
    layout.addWidget(self._right_slot)

  def set_title(self, title: str) -> None:
    self._title_label.setText(str(title))

  def add_right_widget(self, widget: QWidget) -> None:
    widget.setParent(self._right_slot)
    self._right_layout.addWidget(widget, alignment=Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
