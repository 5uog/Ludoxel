# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor, QPalette
from PyQt6.QtWidgets import QDialog, QLabel, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.interface.overlays.skin_preview import PlayerSkinPreviewWidget

_PREVIEW_WINDOW_BACKGROUND = QColor("#151515")


class AiPreviewDialog(QDialog):
  """
  選択中の AI actor を中央に据えた見た目確認用の Debug preview を、本体画面へ埋め込んだ AI Settings とは別の detached dialog として表示する。
  preview の描画自体は viewport 側が renderer の offscreen player preview 経路で対象 AI の skin と model pose を 1 frame ずつ生成して `preview_widget()` の `set_frame_image` へ供給するため、
  この dialog は描画 frame の受け皿と回転操作の入力面だけを担い、renderer や simulation を直接保持しない。
  pointer の press・move・release を、mouse 透過に設定された preview widget へ写し替えて body yaw の回転に用いる。view_changed は呼び出し側が次 frame の preview 再描画を要求するために用い、
  closed は dialog が閉じられたことを呼び出し側へ通知して preview lifecycle を終了させるために用いる。
  """

  closed = pyqtSignal()
  view_changed = pyqtSignal()

  def __init__(self, parent: QWidget | None = None, *, title: str = "AI Preview") -> None:
    super().__init__(parent)
    self.setObjectName("settingsRoot")
    self.setProperty("detachedWindow", True)
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setWindowFlag(Qt.WindowType.Dialog, True)
    self.setWindowFlag(Qt.WindowType.CustomizeWindowHint, True)
    self.setWindowFlag(Qt.WindowType.WindowTitleHint, True)
    self.setWindowFlag(Qt.WindowType.WindowCloseButtonHint, True)
    self.setWindowModality(Qt.WindowModality.NonModal)
    self.setWindowTitle(str(title))
    self.setMinimumSize(360, 540)

    palette = self.palette()
    palette.setColor(QPalette.ColorRole.Window, _PREVIEW_WINDOW_BACKGROUND)
    palette.setColor(QPalette.ColorRole.Base, _PREVIEW_WINDOW_BACKGROUND)
    self.setPalette(palette)
    self.setAutoFillBackground(True)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(24, 24, 24, 24)
    layout.setSpacing(12)

    title_label = QLabel(str(title), self)
    title_label.setObjectName("settingsPageTitle")
    title_label.setWordWrap(True)
    title_label.setAlignment(Qt.AlignmentFlag.AlignHCenter)
    layout.addWidget(title_label)

    hint_label = QLabel("Drag to rotate. Skin source changes apply immediately.", self)
    hint_label.setObjectName("settingsPageSubtitle")
    hint_label.setWordWrap(True)
    hint_label.setAlignment(Qt.AlignmentFlag.AlignHCenter)
    layout.addWidget(hint_label)

    layout.addStretch(1)
    self._preview = PlayerSkinPreviewWidget(self)
    self._preview.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    layout.addWidget(self._preview, alignment=Qt.AlignmentFlag.AlignHCenter)
    layout.addStretch(1)

  def preview_widget(self) -> PlayerSkinPreviewWidget:
    return self._preview

  def preview_angles(self) -> tuple[float, float, float]:
    return self._preview.preview_angles()

  def _local_preview_point(self, event) -> tuple[float, float]:
    point = self._preview.mapFrom(self, event.position().toPoint())
    return (float(point.x()), float(point.y()))

  def mousePressEvent(self, event) -> None:
    if event.button() == Qt.MouseButton.LeftButton:
      x, _y = self._local_preview_point(event)
      self._preview.begin_drag(x=float(x))
      self.setCursor(Qt.CursorShape.ClosedHandCursor)
      self.view_changed.emit()
    super().mousePressEvent(event)

  def mouseMoveEvent(self, event) -> None:
    x, y = self._local_preview_point(event)
    self._preview.move_pointer(x=float(x), y=float(y), area_width=int(self._preview.width()), area_height=int(self._preview.height()))
    self.view_changed.emit()
    super().mouseMoveEvent(event)

  def mouseReleaseEvent(self, event) -> None:
    if event.button() == Qt.MouseButton.LeftButton:
      x, y = self._local_preview_point(event)
      self._preview.end_drag(x=float(x), y=float(y), area_width=int(self._preview.width()), area_height=int(self._preview.height()))
      self.setCursor(Qt.CursorShape.ArrowCursor)
      self.view_changed.emit()
    super().mouseReleaseEvent(event)

  def keyPressEvent(self, event) -> None:
    if int(event.key()) == int(Qt.Key.Key_Escape):
      self.close()
      return
    super().keyPressEvent(event)

  def closeEvent(self, event) -> None:
    self.closed.emit()
    super().closeEvent(event)
