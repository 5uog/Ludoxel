# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QLabel, QVBoxLayout, QWidget


class _ChatCandidateRow(QLabel):
  activated = pyqtSignal(str)

  def mousePressEvent(self, e) -> None:
    if e.button() == Qt.MouseButton.LeftButton:
      self.activated.emit(str(self.text()))
      e.accept()
      return
    super().mousePressEvent(e)


class ChatCandidateView(QWidget):
  candidate_activated = pyqtSignal(str)

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("chatCandidateView")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    self._layout = QVBoxLayout(self)
    self._layout.setContentsMargins(10, 8, 10, 8)
    self._layout.setSpacing(4)
    self._layout.addStretch(1)
    self._rows: list[_ChatCandidateRow] = []
    self._selected_index = 0

  def set_candidates(self, candidates: tuple[str, ...]) -> None:
    for row in self._rows:
      self._layout.removeWidget(row)
      row.deleteLater()
    self._rows = []
    self._selected_index = 0

    for candidate in candidates:
      label = _ChatCandidateRow(str(candidate), self)
      label.setObjectName("chatCandidateRow")
      label.setCursor(Qt.CursorShape.PointingHandCursor)
      label.setTextInteractionFlags(Qt.TextInteractionFlag.NoTextInteraction)
      label.activated.connect(self.candidate_activated.emit)
      self._layout.insertWidget(self._layout.count() - 1, label)
      self._rows.append(label)
    self._sync_selected_row()

  def candidates(self) -> tuple[str, ...]:
    return tuple(str(row.text()) for row in self._rows)

  def has_candidates(self) -> bool:
    return len(self._rows) > 0

  def preferred_height(self) -> int:
    if not self._rows:
      return 0
    margins = self._layout.contentsMargins()
    spacing = int(self._layout.spacing())
    rows_height = sum(int(row.sizeHint().height()) for row in self._rows)
    return int(margins.top()) + int(margins.bottom()) + int(rows_height) + max(0, len(self._rows) - 1) * int(spacing)

  def move_selection(self, delta: int) -> None:
    if not self._rows:
      return
    self._selected_index = (int(self._selected_index) + int(delta)) % len(self._rows)
    self._sync_selected_row()

  def activate_selected(self) -> None:
    if not self._rows:
      return
    index = max(0, min(len(self._rows) - 1, int(self._selected_index)))
    self.candidate_activated.emit(str(self._rows[index].text()))

  def _sync_selected_row(self) -> None:
    for index, row in enumerate(self._rows):
      row.setProperty("selected", bool(int(index) == int(self._selected_index)))
      row.style().unpolish(row)
      row.style().polish(row)
      row.update()
