# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import QSize, Qt, pyqtSignal
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import QFrame, QGridLayout, QHBoxLayout, QLabel, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.persistence.stores.world_library import WorldLibrarySummary
from ludoxel.presentation.interface.common.buttons import use_layout_widget_rect
from ludoxel.presentation.interface.menu.formatting import format_world_size, format_world_timestamp, game_mode_label

_GRID_THUMBNAIL_SIZE = QSize(220, 124)
_LIST_THUMBNAIL_SIZE = QSize(128, 72)
_GRID_CARD_MARGIN_PX = 10
# The library page lays grid cards out in fixed-width columns;
# the card width is therefore a hard bound and must not follow the name label's preferred text width.
GRID_CARD_WIDTH_PX = int(_GRID_THUMBNAIL_SIZE.width() + 2 * _GRID_CARD_MARGIN_PX)


class _ElidedNameLabel(QLabel):
  # A QLabel reports its full text width as both size hint and minimum size hint, so a long world name widens any fixed layout that contains it.
  # This label never requests width for its text and elides the stored name to whatever width the layout actually grants.
  def __init__(self, text: str, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._full_text = str(text)
    self.setSizePolicy(QSizePolicy.Policy.Ignored, QSizePolicy.Policy.Preferred)
    self.setToolTip(self._full_text)
    self.setText(self._full_text)

  def resizeEvent(self, event) -> None:
    super().resizeEvent(event)
    elided = self.fontMetrics().elidedText(self._full_text, Qt.TextElideMode.ElideRight, max(0, int(self.width())))
    if elided != self.text():
      self.setText(elided)


def _thumbnail_pixmap(thumbnail_bytes: bytes | None, size: QSize) -> QPixmap:
  pixmap = QPixmap()
  if thumbnail_bytes:
    pixmap.loadFromData(bytes(thumbnail_bytes))
  if pixmap.isNull():
    placeholder = QPixmap(size)
    placeholder.fill(Qt.GlobalColor.transparent)
    return placeholder
  return pixmap.scaled(size, Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation)


def _game_mode_badge(game_mode: str, parent: QWidget) -> QLabel:
  badge = QLabel(game_mode_label(game_mode), parent)
  badge.setObjectName("worldModeBadge")
  badge.setProperty("gameMode", str(game_mode).strip().lower())
  badge.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
  return badge


class WorldGridCard(QFrame):
  open_requested = pyqtSignal(str)
  edit_requested = pyqtSignal(str)

  def __init__(self, summary: WorldLibrarySummary, *, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._world_id = str(summary.metadata.world_id)
    self.setObjectName("worldGridCard")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    self.setFixedWidth(int(GRID_CARD_WIDTH_PX))

    layout = QVBoxLayout(self)
    layout.setContentsMargins(_GRID_CARD_MARGIN_PX, _GRID_CARD_MARGIN_PX, _GRID_CARD_MARGIN_PX, _GRID_CARD_MARGIN_PX)
    layout.setSpacing(6)

    thumb_holder = QFrame(self)
    thumb_holder.setObjectName("worldThumbnail")
    thumb_holder.setFixedSize(_GRID_THUMBNAIL_SIZE)
    thumb_layout = QGridLayout(thumb_holder)
    thumb_layout.setContentsMargins(6, 6, 6, 6)
    thumb_image = QLabel(thumb_holder)
    thumb_image.setObjectName("worldThumbnailImage")
    thumb_image.setAlignment(Qt.AlignmentFlag.AlignCenter)
    thumb_image.setPixmap(_thumbnail_pixmap(summary.thumbnail_bytes, _GRID_THUMBNAIL_SIZE))
    thumb_layout.addWidget(thumb_image, 0, 0)
    thumb_layout.addWidget(_game_mode_badge(summary.metadata.game_mode, thumb_holder), 0, 0, alignment=Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignBottom)
    layout.addWidget(thumb_holder, alignment=Qt.AlignmentFlag.AlignHCenter)

    name_row = QHBoxLayout()
    name_row.setContentsMargins(0, 0, 0, 0)
    name_row.setSpacing(6)
    name_label = _ElidedNameLabel(str(summary.metadata.name), self)
    name_label.setObjectName("worldName")
    name_row.addWidget(name_label, stretch=1)
    edit_button = use_layout_widget_rect(QPushButton("Edit", self))
    edit_button.setObjectName("worldEditButton")
    edit_button.setCursor(Qt.CursorShape.PointingHandCursor)
    edit_button.clicked.connect(lambda: self.edit_requested.emit(self._world_id))
    name_row.addWidget(edit_button, alignment=Qt.AlignmentFlag.AlignRight)
    layout.addLayout(name_row)

    created = QLabel(f"Created {format_world_timestamp(summary.metadata.created_at)}", self)
    created.setObjectName("worldMeta")
    layout.addWidget(created)
    updated = QLabel(f"Updated {format_world_timestamp(summary.metadata.updated_at)}", self)
    updated.setObjectName("worldMeta")
    layout.addWidget(updated)

  def mouseDoubleClickEvent(self, event) -> None:
    if event.button() == Qt.MouseButton.LeftButton:
      self.open_requested.emit(self._world_id)
      event.accept()
      return
    super().mouseDoubleClickEvent(event)


class WorldListRow(QFrame):
  open_requested = pyqtSignal(str)
  edit_requested = pyqtSignal(str)

  def __init__(self, summary: WorldLibrarySummary, *, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._world_id = str(summary.metadata.world_id)
    self.setObjectName("worldListRow")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)

    layout = QHBoxLayout(self)
    layout.setContentsMargins(10, 8, 10, 8)
    layout.setSpacing(12)

    thumb_image = QLabel(self)
    thumb_image.setObjectName("worldThumbnailImage")
    thumb_image.setFixedSize(_LIST_THUMBNAIL_SIZE)
    thumb_image.setAlignment(Qt.AlignmentFlag.AlignCenter)
    thumb_image.setPixmap(_thumbnail_pixmap(summary.thumbnail_bytes, _LIST_THUMBNAIL_SIZE))
    layout.addWidget(thumb_image, alignment=Qt.AlignmentFlag.AlignVCenter)

    text_column = QVBoxLayout()
    text_column.setContentsMargins(0, 0, 0, 0)
    text_column.setSpacing(2)
    name_label = _ElidedNameLabel(str(summary.metadata.name), self)
    name_label.setObjectName("worldName")
    text_column.addWidget(name_label)
    text_column.addWidget(_game_mode_badge(summary.metadata.game_mode, self), alignment=Qt.AlignmentFlag.AlignLeft)
    meta = QLabel(f"Created {format_world_timestamp(summary.metadata.created_at)}   ·   Updated {format_world_timestamp(summary.metadata.updated_at)}", self)
    meta.setObjectName("worldMeta")
    text_column.addWidget(meta)
    layout.addLayout(text_column, stretch=1)

    right_column = QVBoxLayout()
    right_column.setContentsMargins(0, 0, 0, 0)
    right_column.setSpacing(6)
    size_label = QLabel(format_world_size(summary.size_bytes), self)
    size_label.setObjectName("worldSize")
    size_label.setAlignment(Qt.AlignmentFlag.AlignRight)
    right_column.addWidget(size_label, alignment=Qt.AlignmentFlag.AlignRight)
    edit_button = use_layout_widget_rect(QPushButton("Edit", self))
    edit_button.setObjectName("worldEditButton")
    edit_button.setCursor(Qt.CursorShape.PointingHandCursor)
    edit_button.clicked.connect(lambda: self.edit_requested.emit(self._world_id))
    right_column.addWidget(edit_button, alignment=Qt.AlignmentFlag.AlignRight)
    layout.addLayout(right_column)

  def mouseDoubleClickEvent(self, event) -> None:
    if event.button() == Qt.MouseButton.LeftButton:
      self.open_requested.emit(self._world_id)
      event.accept()
      return
    super().mouseDoubleClickEvent(event)
