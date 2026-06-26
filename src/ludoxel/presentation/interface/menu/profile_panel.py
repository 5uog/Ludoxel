# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import QEvent, Qt, pyqtSignal
from PyQt6.QtGui import QCursor, QImage
from PyQt6.QtWidgets import QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.interface.overlays.skin_preview import PlayerSkinPreviewWidget


class MenuProfilePanel(QWidget):
  change_skin_requested = pyqtSignal()
  reset_skin_requested = pyqtSignal()
  preview_changed = pyqtSignal()

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("menuProfilePanel")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setMouseTracking(True)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(0, 0, 0, 0)
    layout.setSpacing(10)

    self._skin_preview = PlayerSkinPreviewWidget(self)
    self._skin_preview.view_changed.connect(self.preview_changed.emit)
    layout.addWidget(self._skin_preview, stretch=0, alignment=Qt.AlignmentFlag.AlignHCenter)

    self._btn_change_skin = QPushButton("Change Skin", self)
    self._btn_change_skin.setObjectName("menuBtn")
    self._btn_change_skin.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    self._btn_change_skin.setMinimumWidth(240)
    self._btn_change_skin.setCursor(Qt.CursorShape.PointingHandCursor)
    self._btn_change_skin.clicked.connect(self.change_skin_requested.emit)
    layout.addWidget(self._btn_change_skin, alignment=Qt.AlignmentFlag.AlignHCenter)

    self._btn_reset_skin = QPushButton("Reset to Alex", self)
    self._btn_reset_skin.setObjectName("menuBtn")
    self._btn_reset_skin.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    self._btn_reset_skin.setMinimumWidth(240)
    self._btn_reset_skin.setCursor(Qt.CursorShape.PointingHandCursor)
    self._btn_reset_skin.clicked.connect(self.reset_skin_requested.emit)
    layout.addWidget(self._btn_reset_skin, alignment=Qt.AlignmentFlag.AlignHCenter)

    self._install_pointer_tracking()

  @property
  def skin_preview(self) -> PlayerSkinPreviewWidget:
    return self._skin_preview

  def set_player_skin(self, image: QImage, *, slim_arm: bool) -> None:
    self._skin_preview.set_skin(image, slim_arm=bool(slim_arm))

  def set_player_preview_frame(self, image: QImage) -> None:
    self._skin_preview.set_frame_image(image)

  def set_player_preview_name_tag(self, text: str, *, visible: bool, opacity: float = 1.0) -> None:
    self._skin_preview.set_name_tag(text, visible=bool(visible), opacity=float(opacity))

  def player_preview_angles(self) -> tuple[float, float, float]:
    return self._skin_preview.preview_angles()

  def player_preview_size(self) -> tuple[int, int]:
    return (int(self._skin_preview.width()), int(self._skin_preview.height()))

  def _install_pointer_tracking(self) -> None:
    for widget in (self, *self.findChildren(QWidget)):
      widget.installEventFilter(self)
      widget.setMouseTracking(True)

  def _map_event_position(self, watched, event):
    if not isinstance(watched, QWidget) or not hasattr(event, "position"):
      return None
    return watched.mapTo(self, event.position().toPoint())

  def eventFilter(self, watched, event) -> bool:
    event_type = event.type()
    if event_type == QEvent.Type.MouseButtonPress and hasattr(event, "button") and event.button() == Qt.MouseButton.LeftButton:
      pos = self._map_event_position(watched, event)
      if pos is not None:
        self._skin_preview.begin_drag(x=float(pos.x()))
        self.setCursor(Qt.CursorShape.ClosedHandCursor)
        self.preview_changed.emit()
    elif event_type == QEvent.Type.MouseMove and hasattr(event, "position"):
      pos = self._map_event_position(watched, event)
      if pos is not None:
        self._skin_preview.move_pointer(x=float(pos.x()), y=float(pos.y()), area_width=int(self.width()), area_height=int(self.height()))
        self.preview_changed.emit()
    elif event_type == QEvent.Type.MouseButtonRelease and hasattr(event, "button") and event.button() == Qt.MouseButton.LeftButton:
      pos = self._map_event_position(watched, event)
      if pos is not None:
        self._skin_preview.end_drag(x=float(pos.x()), y=float(pos.y()), area_width=int(self.width()), area_height=int(self.height()))
      else:
        self._skin_preview.note_pointer_left()
      self.setCursor(Qt.CursorShape.ArrowCursor)
      self.preview_changed.emit()
    elif event_type == QEvent.Type.Leave and watched is self:
      cursor_pos = self.mapFromGlobal(QCursor.pos())
      if not self.rect().contains(cursor_pos):
        self._skin_preview.note_pointer_left()
      self.setCursor(Qt.CursorShape.ArrowCursor)
      self.preview_changed.emit()
    return super().eventFilter(watched, event)
