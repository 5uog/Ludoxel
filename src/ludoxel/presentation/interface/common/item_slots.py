# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import QByteArray, QMimeData, QPoint, QRect, Qt
from PyQt6.QtGui import QDrag, QIcon, QMouseEvent, QPainter, QPixmap
from PyQt6.QtWidgets import QApplication, QPushButton

from ludoxel.presentation.interface.common.hotbar_support import refresh_widget_style

ITEM_SLOT_MIME_TYPE = "application/x-ludoxel-block-id"


def item_id_from_mime(mime: QMimeData) -> str | None:
  if mime.hasFormat(ITEM_SLOT_MIME_TYPE):
    try:
      raw = bytes(mime.data(ITEM_SLOT_MIME_TYPE)).decode("utf-8", errors="replace")
    except Exception:
      raw = ""
    item_id = str(raw).strip()
    return item_id if item_id else None
  if mime.hasText():
    item_id = str(mime.text()).strip()
    return item_id if item_id else None
  return None


def start_item_drag(source: QPushButton, item_id: str) -> None:
  normalized = str(item_id).strip()
  if not normalized:
    return

  drag = QDrag(source)
  mime = QMimeData()
  mime.setData(ITEM_SLOT_MIME_TYPE, QByteArray(normalized.encode("utf-8")))
  mime.setText(normalized)
  drag.setMimeData(mime)

  if isinstance(source, ItemSlotButton):
    pixmap = source.item_pixmap()
  else:
    pixmap = source.icon().pixmap(source.iconSize())
  if not pixmap.isNull():
    drag.setPixmap(pixmap)

  drag.exec(Qt.DropAction.CopyAction)


def apply_item_slot_state(button: QPushButton, *, item_id: str | None, tooltip: str, selected: bool, pixmap: QPixmap | None) -> None:
  normalized_item_id = "" if item_id is None else str(item_id).strip()

  if isinstance(button, ItemSlotButton):
    button.set_item_pixmap(pixmap)
  elif pixmap is None:
    button.setIcon(QIcon())
  else:
    button.setIcon(QIcon(pixmap))

  button.setToolTip(str(tooltip))
  button.setProperty("itemId", normalized_item_id)
  button.setProperty("selected", bool(selected))
  refresh_widget_style(button)


class ItemSlotButton(QPushButton):
  """
  provider が source の配置契約に従って正規化した item canvas を、slot 外形の幾何中心へ描画する。
  button style の content rectangle 又は border 幅を item の座標基準に含めないため、通常、hover、selected、drag source の各状態で同じ中心を維持する。
  """

  def __init__(self, parent=None) -> None:
    """
    item を持たない slot button を構築し、背景、border、focus state の描画は既存の `QPushButton` style に委譲する。
    """
    super().__init__(parent)
    self._item_pixmap = QPixmap()

  def set_item_pixmap(self, pixmap: QPixmap | None) -> None:
    """
    共通 canvas へ正規化済みの pixmap を保持し、`QIcon` の platform style 依存配置を無効化して再描画を要求する。
    """
    self.setIcon(QIcon())
    self._item_pixmap = QPixmap() if pixmap is None else QPixmap(pixmap)
    self.update()

  def item_pixmap(self) -> QPixmap:
    """
    slot 表示と drag preview が共有する pixmap の値 copy を返し、呼び出し側から内部表示状態を分離する。
    """
    return QPixmap(self._item_pixmap)

  def paintEvent(self, event) -> None:
    """
    QSS の button 本体を描画した後、device-independent な item canvas を slot 外形の中心へ整数 pixel 単位で配置する。
    provider の canvas 中心は通常画像の可視画素重心又は special item の論理 frame 中心であり、button state と platform style はこの配置基準を変更しない。
    """
    super().paintEvent(event)
    pixmap = self._item_pixmap
    if pixmap.isNull():
      return

    target_size = pixmap.deviceIndependentSize().toSize().boundedTo(self.iconSize()).boundedTo(self.size())
    target_rect = QRect(QPoint(0, 0), target_size)
    target_rect.moveCenter(self.rect().center())

    painter = QPainter(self)
    painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform, False)
    painter.drawPixmap(target_rect, pixmap)
    painter.end()


class DraggableItemButton(ItemSlotButton):
  def __init__(self, parent=None) -> None:
    super().__init__(parent)
    self._drag_item_id = ""
    self._drag_start: QPoint | None = None

  def set_drag_item_id(self, item_id: str | None) -> None:
    self._drag_item_id = "" if item_id is None else str(item_id).strip()

  def drag_item_id(self) -> str:
    return str(self._drag_item_id)

  def mousePressEvent(self, e: QMouseEvent) -> None:
    if e.button() == Qt.MouseButton.LeftButton:
      self._drag_start = e.position().toPoint()
    super().mousePressEvent(e)

  def mouseMoveEvent(self, e: QMouseEvent) -> None:
    if self._drag_start is not None and bool(e.buttons() & Qt.MouseButton.LeftButton):
      if (e.position().toPoint() - self._drag_start).manhattanLength() >= QApplication.startDragDistance():
        self._drag_start = None
        start_item_drag(self, self._drag_item_id)
        return
    super().mouseMoveEvent(e)

  def mouseReleaseEvent(self, e: QMouseEvent) -> None:
    self._drag_start = None
    super().mouseReleaseEvent(e)
