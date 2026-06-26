# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import QBuffer, QByteArray, QIODevice, Qt
from PyQt6.QtGui import QImage

_THUMBNAIL_WIDTH_PX = 512
_THUMBNAIL_HEIGHT_PX = 288


def encode_thumbnail_png(image: QImage | None) -> bytes | None:
  if image is None or image.isNull():
    return None
  scaled = image.scaled(int(_THUMBNAIL_WIDTH_PX), int(_THUMBNAIL_HEIGHT_PX), Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation)
  if int(scaled.width()) > int(_THUMBNAIL_WIDTH_PX) or int(scaled.height()) > int(_THUMBNAIL_HEIGHT_PX):
    left = max(0, (int(scaled.width()) - int(_THUMBNAIL_WIDTH_PX)) // 2)
    top = max(0, (int(scaled.height()) - int(_THUMBNAIL_HEIGHT_PX)) // 2)
    scaled = scaled.copy(int(left), int(top), min(int(_THUMBNAIL_WIDTH_PX), int(scaled.width())), min(int(_THUMBNAIL_HEIGHT_PX), int(scaled.height())))

  buffer = QBuffer(QByteArray())
  if not buffer.open(QIODevice.OpenModeFlag.WriteOnly):
    return None
  saved = bool(scaled.save(buffer, "PNG"))
  data = bytes(buffer.data())
  buffer.close()
  if not saved or not data:
    return None
  return data
