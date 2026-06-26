# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QSize, Qt, pyqtSignal
from PyQt6.QtGui import QIcon, QPixmap
from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.interface.menu.profile_panel import MenuProfilePanel

_LOGO_MAX_WIDTH_PX = 520
_LOGO_MAX_HEIGHT_PX = 200
_NOTIFICATION_BUTTON_SIZE_PX = 56


class StartupMenuPage(QWidget):
  play_my_world_requested = pyqtSignal()
  play_othello_requested = pyqtSignal()
  notifications_requested = pyqtSignal()
  change_skin_requested = pyqtSignal()
  reset_skin_requested = pyqtSignal()
  preview_changed = pyqtSignal()

  def __init__(self, *, resource_root: Path, version_text: str, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._resource_root = Path(resource_root)
    self._version_text = str(version_text)
    self.setObjectName("startupMenuPage")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    root = QVBoxLayout(self)
    root.setContentsMargins(48, 36, 48, 28)
    root.setSpacing(0)

    root.addSpacing(96)

    self._logo = QLabel(self)
    self._logo.setObjectName("menuLogo")
    self._logo.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop)
    self._apply_logo_pixmap()
    root.addWidget(self._logo, alignment=Qt.AlignmentFlag.AlignHCenter)

    root.addStretch(2)
    root.addWidget(self._build_button_panel(), alignment=Qt.AlignmentFlag.AlignHCenter)
    root.addStretch(3)

    root.addLayout(self._build_bottom_row())

  @property
  def profile_panel(self) -> MenuProfilePanel:
    return self._profile_panel

  def _build_button_panel(self) -> QWidget:
    panel = QFrame(self)
    panel.setObjectName("panel")
    panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    panel.setMinimumWidth(420)

    layout = QVBoxLayout(panel)
    layout.setContentsMargins(20, 18, 20, 20)
    layout.setSpacing(12)

    self._btn_my_world = QPushButton("Play My World", panel)
    self._btn_my_world.setObjectName("menuBtn")
    self._btn_my_world.setCursor(Qt.CursorShape.PointingHandCursor)
    self._btn_my_world.clicked.connect(self.play_my_world_requested.emit)
    layout.addWidget(self._btn_my_world)

    self._btn_othello = QPushButton("Play Othello (Reversi)", panel)
    self._btn_othello.setObjectName("menuBtn")
    self._btn_othello.setCursor(Qt.CursorShape.PointingHandCursor)
    self._btn_othello.clicked.connect(self.play_othello_requested.emit)
    layout.addWidget(self._btn_othello)
    return panel

  def _build_bottom_row(self) -> QHBoxLayout:
    row = QHBoxLayout()
    row.setContentsMargins(0, 0, 0, 0)
    row.setSpacing(0)

    left_column = QVBoxLayout()
    left_column.setContentsMargins(0, 0, 0, 0)
    left_column.setSpacing(10)
    left_column.addStretch(1)

    self._notification_button = QPushButton(self)
    self._notification_button.setObjectName("menuNotificationButton")
    self._notification_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._notification_button.setFixedSize(int(_NOTIFICATION_BUTTON_SIZE_PX), int(_NOTIFICATION_BUTTON_SIZE_PX))
    notification_icon_path = self._resource_root / "assets" / "ui" / "menu" / "notifications.svg"
    if notification_icon_path.is_file():
      self._notification_button.setIcon(QIcon(str(notification_icon_path)))
      self._notification_button.setIconSize(QSize(28, 28))
    else:
      self._notification_button.setText("!")
    self._notification_button.setToolTip("Changelog")
    self._notification_button.clicked.connect(self.notifications_requested.emit)
    left_column.addWidget(self._notification_button, alignment=Qt.AlignmentFlag.AlignLeft)

    self._creator_label = QLabel("A work created by 5uog.", self)
    self._creator_label.setObjectName("menuCreatorLabel")
    self._creator_label.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignBottom)
    left_column.addWidget(self._creator_label, alignment=Qt.AlignmentFlag.AlignLeft)
    row.addLayout(left_column)

    row.addStretch(1)

    right_column = QVBoxLayout()
    right_column.setContentsMargins(0, 0, 0, 0)
    right_column.setSpacing(8)
    right_column.addStretch(1)

    self._profile_panel = MenuProfilePanel(self)
    self._profile_panel.change_skin_requested.connect(self.change_skin_requested.emit)
    self._profile_panel.reset_skin_requested.connect(self.reset_skin_requested.emit)
    self._profile_panel.preview_changed.connect(self.preview_changed.emit)
    right_column.addWidget(self._profile_panel, alignment=Qt.AlignmentFlag.AlignRight)

    self._version_label = QLabel(self._version_text, self)
    self._version_label.setObjectName("menuVersionLabel")
    self._version_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignBottom)
    right_column.addWidget(self._version_label, alignment=Qt.AlignmentFlag.AlignRight)
    row.addLayout(right_column)
    return row

  def _apply_logo_pixmap(self) -> None:
    logo_path = self._resource_root / "assets" / "branding" / "ludoxel.png"
    pixmap = QPixmap(str(logo_path)) if logo_path.is_file() else QPixmap()
    if pixmap.isNull():
      self._logo.setText("Ludoxel")
      return
    scaled = pixmap.scaled(int(_LOGO_MAX_WIDTH_PX), int(_LOGO_MAX_HEIGHT_PX), Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
    self._logo.setPixmap(scaled)

  def set_version_text(self, text: str) -> None:
    self._version_label.setText(str(text))
