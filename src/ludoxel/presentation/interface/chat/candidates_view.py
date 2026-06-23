# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QLabel, QVBoxLayout, QWidget


class ChatCandidateView(QWidget):
  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("chatCandidateView")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    self._layout = QVBoxLayout(self)
    self._layout.setContentsMargins(10, 8, 10, 8)
    self._layout.setSpacing(4)
    self._layout.addStretch(1)
    self._rows: list[QLabel] = []

  def set_candidates(self, candidates: tuple[str, ...]) -> None:
    for row in self._rows:
      self._layout.removeWidget(row)
      row.deleteLater()
    self._rows = []

    for candidate in candidates:
      label = QLabel(str(candidate), self)
      label.setObjectName("chatCandidateRow")
      label.setTextInteractionFlags(Qt.TextInteractionFlag.NoTextInteraction)
      self._layout.insertWidget(self._layout.count() - 1, label)
      self._rows.append(label)
