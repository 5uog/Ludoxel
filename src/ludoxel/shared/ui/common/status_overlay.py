# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import QFrame, QLabel, QVBoxLayout, QWidget

_TITLE_IMAGE_CANDIDATE_NAMES = ("ludoxel.png", "ludoxel.svg", "ludoxel.jpg", "ludoxel.jpeg", "ludoxel.webp", "ludoxel.bmp")


def status_overlay_title_image_path(resource_root: Path) -> Path | None:
    base = Path(resource_root) / "assets" / "ui"
    for name in _TITLE_IMAGE_CANDIDATE_NAMES:
        candidate = base / name
        if candidate.is_file():
            return candidate.resolve()
    return None


class StatusOverlayFrame(QFrame):

    def __init__(self, *, title_text: str, status_text: str, object_name: str, title_object_name: str, status_object_name: str, title_image_path: Path | None=None, parent: QWidget | None=None, flags=Qt.WindowType.Widget) -> None:
        super().__init__(parent, flags)
        self.setObjectName(str(object_name))
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet(f"QFrame#{object_name} {{ background: #121212; }}" f"QLabel#{title_object_name} {{ color: #f4f4f4; font-size: 28px; font-weight: 700; }}" f"QLabel#{status_object_name} {{ color: #c8c8c8; font-size: 14px; }}")
        self._title_text = str(title_text).strip()
        self._title_pixmap = QPixmap()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.addStretch(1)

        self._title = QLabel(self._title_text, self)
        self._title.setObjectName(str(title_object_name))
        self._title.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        layout.addWidget(self._title)

        self._status = QLabel("", self)
        self._status.setObjectName(str(status_object_name))
        self._status.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        layout.addWidget(self._status)

        layout.addStretch(1)
        self.set_status_text(str(status_text))
        if title_image_path is not None:
            self.set_title_image_path(title_image_path)
        else:
            self.set_title_text(self._title_text)

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

    def resizeEvent(self, e) -> None:
        super().resizeEvent(e)
        self._sync_title_visual()

    def _sync_title_visual(self) -> None:
        if self._title_pixmap.isNull():
            self._title.setPixmap(QPixmap())
            self._title.setText(self._title_text)
            return

        available_width = max(1, int(self.width()) - 80)
        available_height = max(1, min(220, int(round(float(self.height()) * 0.28))))
        scaled = self._title_pixmap.scaled(available_width, available_height, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
        self._title.setText("")
        self._title.setPixmap(scaled)
