# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import QBuffer, QByteArray, QIODevice, QPoint, Qt
from PyQt6.QtGui import QGuiApplication, QImage

_THUMBNAIL_WIDTH_PX = 512
_THUMBNAIL_HEIGHT_PX = 288


def capture_widget_thumbnail_image(widget) -> QImage:
  if widget is None or not bool(widget.isVisible()):
    return QImage()
  width = int(widget.width())
  height = int(widget.height())
  if width <= 0 or height <= 0:
    return QImage()

  host = widget.window()
  screen = None
  try:
    handle = host.windowHandle() if host is not None else widget.windowHandle()
    screen = None if handle is None else handle.screen()
  except Exception:
    screen = None
  if screen is None:
    app = QGuiApplication.instance()
    screen = None if app is None else app.primaryScreen()
  if screen is None:
    return QImage()

  try:
    top_left = widget.mapToGlobal(QPoint(0, 0))
    if host is not None and bool(host.isVisible()):
      host_top_left = host.mapToGlobal(QPoint(0, 0))
      pixmap = screen.grabWindow(int(host.winId()), int(top_left.x() - host_top_left.x()), int(top_left.y() - host_top_left.y()), int(width), int(height))
    else:
      pixmap = screen.grabWindow(0, int(top_left.x()), int(top_left.y()), int(width), int(height))
  except Exception:
    return QImage()
  if pixmap.isNull():
    return QImage()
  return pixmap.toImage()


def encode_thumbnail_png(image: QImage | None) -> bytes | None:
  if image is None or image.isNull():
    return None
  scaled = image.scaled(int(_THUMBNAIL_WIDTH_PX), int(_THUMBNAIL_HEIGHT_PX), Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation)
  if int(scaled.width()) > int(_THUMBNAIL_WIDTH_PX) or int(scaled.height()) > int(_THUMBNAIL_HEIGHT_PX):
    left = max(0, (int(scaled.width()) - int(_THUMBNAIL_WIDTH_PX)) // 2)
    top = max(0, (int(scaled.height()) - int(_THUMBNAIL_HEIGHT_PX)) // 2)
    scaled = scaled.copy(int(left), int(top), min(int(_THUMBNAIL_WIDTH_PX), int(scaled.width())), min(int(_THUMBNAIL_HEIGHT_PX), int(scaled.height())))

  payload = QByteArray()
  buffer = QBuffer(payload)
  if not buffer.open(QIODevice.OpenModeFlag.WriteOnly):
    return None
  saved = bool(scaled.save(buffer, "PNG"))
  data = bytes(payload)
  buffer.close()
  if not saved or not data:
    return None
  return data
