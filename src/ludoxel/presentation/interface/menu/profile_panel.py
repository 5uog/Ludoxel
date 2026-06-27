# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QLayout, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.interface.overlays.skin_preview import PlayerSkinPreviewWidget

_PROFILE_ACTION_SPACING_PX = 8
_PROFILE_BUTTON_WIDTH_PX = 240


class MenuProfilePanel(QWidget):
  change_skin_requested = pyqtSignal()
  reset_skin_requested = pyqtSignal()
  preview_changed = pyqtSignal()

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("menuProfilePanel")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(0, 0, 0, 0)
    layout.setSpacing(int(_PROFILE_ACTION_SPACING_PX))
    layout.setSizeConstraint(QLayout.SizeConstraint.SetFixedSize)

    self._skin_preview = PlayerSkinPreviewWidget(self)
    self._skin_preview.view_changed.connect(self.preview_changed.emit)
    layout.addWidget(self._skin_preview, stretch=0, alignment=Qt.AlignmentFlag.AlignHCenter)

    self._btn_change_skin = QPushButton("Change Skin", self)
    self._btn_change_skin.setObjectName("menuBtn")
    self._btn_change_skin.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    self._btn_change_skin.setFixedWidth(int(_PROFILE_BUTTON_WIDTH_PX))
    self._btn_change_skin.setCursor(Qt.CursorShape.PointingHandCursor)
    self._btn_change_skin.clicked.connect(self.change_skin_requested.emit)
    layout.addWidget(self._btn_change_skin, alignment=Qt.AlignmentFlag.AlignHCenter)

    self._btn_reset_skin = QPushButton("Reset to Alex", self)
    self._btn_reset_skin.setObjectName("menuBtn")
    self._btn_reset_skin.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    self._btn_reset_skin.setFixedWidth(int(_PROFILE_BUTTON_WIDTH_PX))
    self._btn_reset_skin.setCursor(Qt.CursorShape.PointingHandCursor)
    self._btn_reset_skin.clicked.connect(self.reset_skin_requested.emit)
    layout.addWidget(self._btn_reset_skin, alignment=Qt.AlignmentFlag.AlignHCenter)

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
