# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import QFrame, QLabel, QSizePolicy, QVBoxLayout, QWidget

_TITLE_IMAGE_CANDIDATE_NAMES = ("ludoxel.png", "ludoxel.svg", "ludoxel.jpg", "ludoxel.jpeg", "ludoxel.webp", "ludoxel.bmp")
_TITLE_IMAGE_MAX_HEIGHT = 220
_TITLE_STATUS_SPACING = 24


def status_overlay_title_image_path(resource_root: Path) -> Path | None:
  base = Path(resource_root) / "assets" / "branding"
  for name in _TITLE_IMAGE_CANDIDATE_NAMES:
    candidate = base / name
    if candidate.is_file():
      return candidate.resolve()
  return None


class StatusOverlayFrame(QFrame):
  def __init__(self, *, title_text: str, status_text: str, object_name: str, title_object_name: str, status_object_name: str, title_image_path: Path | None = None, parent: QWidget | None = None, flags=Qt.WindowType.Widget) -> None:
    super().__init__(parent, flags)
    self.setObjectName(str(object_name))
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self._title_text = str(title_text).strip()
    self._title_pixmap = QPixmap()

    self._layout = QVBoxLayout(self)
    self._layout.setContentsMargins(40, 40, 40, 40)
    self._layout.setSpacing(_TITLE_STATUS_SPACING)
    self._layout.addStretch(1)

    self._title = QLabel(self._title_text, self)
    self._title.setObjectName(str(title_object_name))
    self._title.setAlignment(Qt.AlignmentFlag.AlignHCenter)
    self._title.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
    self._layout.addWidget(self._title)

    self._status = QLabel("", self)
    self._status.setObjectName(str(status_object_name))
    self._status.setAlignment(Qt.AlignmentFlag.AlignHCenter)
    self._status.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
    self._status.setMinimumHeight(int(self._status.fontMetrics().lineSpacing()) + 8)
    self._layout.addWidget(self._status)

    self._layout.addStretch(1)
    if title_image_path is not None:
      self.set_title_image_path(title_image_path)
    else:
      self.set_title_text(self._title_text)
    self.set_status_text(str(status_text))

  def set_title_text(self, text: str) -> None:
    self._title_text = str(text).strip()
    if self._title_pixmap.isNull():
      self._title.setPixmap(QPixmap())
      self._title.setText(self._title_text)

  def set_title_image_path(self, path: Path | None) -> None:
    pixmap = QPixmap()
    if path is not None:
      pixmap = QPixmap(str(Path(path).resolve()))
    self._title_pixmap = QPixmap(pixmap)
    self._sync_title_visual()

  def set_status_text(self, text: str) -> None:
    self._status.setText(str(text).strip() or "Loading...")
    self._status.setMinimumHeight(int(self._status.fontMetrics().lineSpacing()) + 8)
    self._status.updateGeometry()
    self._layout.activate()

  def resizeEvent(self, e) -> None:
    super().resizeEvent(e)
    self._sync_title_visual()

  def _sync_title_visual(self) -> None:
    if self._title_pixmap.isNull():
      self._title.setPixmap(QPixmap())
      self._title.setText(self._title_text)
      self._title.setFixedHeight(max(int(self._title.fontMetrics().lineSpacing()) + 8, int(self._title.sizeHint().height())))
      self._title.updateGeometry()
      self._layout.activate()
      return

    available_width = max(1, int(self.width()) - 80)
    available_height = max(1, min(_TITLE_IMAGE_MAX_HEIGHT, int(round(float(self.height()) * 0.28))))
    if int(self.width()) <= 80 or int(self.height()) <= 80:
      available_width = max(1, min(int(self._title_pixmap.width()), 720))
      available_height = max(1, min(_TITLE_IMAGE_MAX_HEIGHT, int(self._title_pixmap.height())))
    scaled = self._title_pixmap.scaled(available_width, available_height, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
    self._title.setText("")
    self._title.setPixmap(scaled)
    self._title.setFixedHeight(max(1, int(scaled.height())))
    self._title.updateGeometry()
    self._layout.activate()
