# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import QByteArray, QMimeData, QPoint, QRectF, QSize, Qt
from PyQt6.QtGui import QDrag, QIcon, QMouseEvent, QPainter, QPixmap
from PyQt6.QtWidgets import QApplication, QPushButton

from ludoxel.presentation.interface.common.hotbar_support import refresh_widget_style

ITEM_SLOT_MIME_TYPE = "application/x-ludoxel-block-id"
_BLOCK_THUMBNAIL_SOURCE_SIZE = 300
_BLOCK_THUMBNAIL_SLOT_HORIZONTAL_OFFSET_PX = 0.5
_BLOCK_THUMBNAIL_SLOT_VERTICAL_OFFSET_PX = 0.5


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
  def __init__(self, parent=None) -> None:
    super().__init__(parent)
    self._item_pixmap = QPixmap()
    self._item_icon_size = QSize(36, 36)
    super().setIcon(QIcon())
    super().setIconSize(QSize(0, 0))

  def setIcon(self, icon: QIcon) -> None:
    del icon
    super().setIcon(QIcon())

  def setIconSize(self, size: QSize) -> None:
    requested = QSize(size)
    self._item_icon_size = QSize(max(1, int(requested.width())), max(1, int(requested.height())))
    super().setIconSize(QSize(0, 0))
    self.update()

  def item_icon_size(self) -> QSize:
    return QSize(self._item_icon_size)

  def set_item_pixmap(self, pixmap: QPixmap | None) -> None:
    super().setIcon(QIcon())
    self._item_pixmap = QPixmap() if pixmap is None else QPixmap(pixmap)
    self.update()

  def item_pixmap(self) -> QPixmap:
    return QPixmap(self._item_pixmap)

  def paintEvent(self, event) -> None:
    super().paintEvent(event)
    pixmap = self._item_pixmap
    if pixmap.isNull():
      return

    target_rect = self._target_rect_for_pixmap(pixmap)
    if target_rect.isNull() or target_rect.width() <= 0.0 or target_rect.height() <= 0.0:
      return

    source_rect = QRectF(0.0, 0.0, float(pixmap.width()), float(pixmap.height()))

    painter = QPainter(self)
    painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform, False)
    painter.drawPixmap(target_rect, pixmap, source_rect)
    painter.end()

  def _target_rect_for_pixmap(self, pixmap: QPixmap) -> QRectF:
    source_width = max(1.0, float(pixmap.width()))
    source_height = max(1.0, float(pixmap.height()))
    icon_width = max(1.0, float(self._item_icon_size.width()))
    icon_height = max(1.0, float(self._item_icon_size.height()))

    scale = min(icon_width / source_width, icon_height / source_height)
    target_width = min(icon_width, source_width * scale, float(max(1, int(self.width()))))
    target_height = min(icon_height, source_height * scale, float(max(1, int(self.height()))))

    left = (float(self.width()) - float(target_width)) * 0.5 + self._thumbnail_horizontal_bias(pixmap)
    top = (float(self.height()) - float(target_height)) * 0.5 + self._thumbnail_vertical_bias(pixmap)
    return QRectF(float(left), float(top), float(target_width), float(target_height))

  @staticmethod
  def _thumbnail_horizontal_bias(pixmap: QPixmap) -> float:
    if int(pixmap.width()) == int(_BLOCK_THUMBNAIL_SOURCE_SIZE) and int(pixmap.height()) == int(_BLOCK_THUMBNAIL_SOURCE_SIZE):
      return float(_BLOCK_THUMBNAIL_SLOT_HORIZONTAL_OFFSET_PX)
    return 0.0

  @staticmethod
  def _thumbnail_vertical_bias(pixmap: QPixmap) -> float:
    if int(pixmap.width()) == int(_BLOCK_THUMBNAIL_SOURCE_SIZE) and int(pixmap.height()) == int(_BLOCK_THUMBNAIL_SOURCE_SIZE):
      return float(_BLOCK_THUMBNAIL_SLOT_VERTICAL_OFFSET_PX)
    return 0.0


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
