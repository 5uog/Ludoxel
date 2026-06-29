# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QPushButton, QWidget


def use_layout_widget_rect(button: QPushButton) -> QPushButton:
  button.setAttribute(Qt.WidgetAttribute.WA_LayoutUsesWidgetRect, True)
  return button


def make_menu_button(text: str, parent: QWidget | None = None) -> QPushButton:
  button = QPushButton(str(text), parent)
  button.setObjectName("menuBtn")
  button.setCursor(Qt.CursorShape.PointingHandCursor)
  return use_layout_widget_rect(button)


__all__ = ["make_menu_button", "use_layout_widget_rect"]
