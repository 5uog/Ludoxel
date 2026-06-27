# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QEvent, QSize, Qt, pyqtSignal
from PyQt6.QtGui import QCursor, QIcon, QPixmap
from PyQt6.QtWidgets import QFrame, QLabel, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.interface.menu.profile_panel import MenuProfilePanel

_PAGE_HORIZONTAL_MARGIN_PX = 48
_PAGE_TOP_MARGIN_PX = 32
_PAGE_BOTTOM_MARGIN_PX = 28
_LOGO_TOP_OFFSET_PX = 64
_LOGO_MAX_WIDTH_PX = 520
_LOGO_MAX_HEIGHT_PX = 200
_LOGO_TO_BUTTON_PANEL_GAP_PX = 48
_BUTTON_PANEL_WIDTH_PX = 420
_NOTIFICATION_BUTTON_SIZE_PX = 56
_BOTTOM_ITEM_GAP_PX = 10
_SIDE_EDGE_MIN_GAP_PX = 8
_MENU_TO_PROFILE_MIN_GAP_PX = 28
_SIDE_BOTTOM_LIFT_PX = 80


class StartupMenuPage(QWidget):
  play_my_world_requested = pyqtSignal()
  play_othello_requested = pyqtSignal()
  notifications_requested = pyqtSignal()
  change_skin_requested = pyqtSignal()
  reset_skin_requested = pyqtSignal()
  preview_changed = pyqtSignal()
  quit_requested = pyqtSignal()

  def __init__(self, *, resource_root: Path, version_text: str, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._resource_root = Path(resource_root)
    self._version_text = str(version_text)
    self.setObjectName("startupMenuPage")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setMouseTracking(True)

    self._logo = QLabel(self)
    self._logo.setObjectName("menuLogo")
    self._logo.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop)
    self._apply_logo_pixmap()

    self._button_panel = self._build_button_panel()

    self._profile_panel = MenuProfilePanel(self)
    self._profile_panel.change_skin_requested.connect(self.change_skin_requested.emit)
    self._profile_panel.reset_skin_requested.connect(self.reset_skin_requested.emit)
    self._profile_panel.preview_changed.connect(self.preview_changed.emit)

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

    self._creator_label = QLabel("A work created by 5uog.", self)
    self._creator_label.setObjectName("menuCreatorLabel")
    self._creator_label.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignBottom)

    self._version_label = QLabel(self._version_text, self)
    self._version_label.setObjectName("menuVersionLabel")
    self._version_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignBottom)

    self._install_pointer_tracking()
    self._layout_menu()

  @property
  def profile_panel(self) -> MenuProfilePanel:
    return self._profile_panel

  def _build_button_panel(self) -> QWidget:
    panel = QFrame(self)
    panel.setObjectName("panel")
    panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    panel.setFixedWidth(int(_BUTTON_PANEL_WIDTH_PX))

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

    self._btn_quit = QPushButton("Quit", panel)
    self._btn_quit.setObjectName("menuBtn")
    self._btn_quit.setProperty("buttonStyle", "danger")
    self._btn_quit.setCursor(Qt.CursorShape.PointingHandCursor)
    self._btn_quit.clicked.connect(self.quit_requested.emit)
    layout.addWidget(self._btn_quit)
    return panel

  def _apply_logo_pixmap(self) -> None:
    logo_path = self._resource_root / "assets" / "branding" / "ludoxel.png"
    pixmap = QPixmap(str(logo_path)) if logo_path.is_file() else QPixmap()
    if pixmap.isNull():
      self._logo.setText("Ludoxel")
      self._logo.adjustSize()
      return
    scaled = pixmap.scaled(int(_LOGO_MAX_WIDTH_PX), int(_LOGO_MAX_HEIGHT_PX), Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
    self._logo.setPixmap(scaled)
    self._logo.adjustSize()

  def set_version_text(self, text: str) -> None:
    self._version_label.setText(str(text))
    self._layout_menu()

  def resizeEvent(self, event) -> None:
    self._layout_menu()
    super().resizeEvent(event)

  def _layout_menu(self) -> None:
    page_w = int(max(1, self.width()))
    page_h = int(max(1, self.height()))

    self._logo.adjustSize()
    logo_hint = self._logo.sizeHint()
    logo_w = int(min(int(_LOGO_MAX_WIDTH_PX), max(1, logo_hint.width())))
    logo_h = int(min(int(_LOGO_MAX_HEIGHT_PX), max(1, logo_hint.height())))
    logo_x = int(round((page_w - logo_w) * 0.5))
    logo_y = int(_PAGE_TOP_MARGIN_PX + _LOGO_TOP_OFFSET_PX)
    self._logo.setGeometry(logo_x, logo_y, logo_w, logo_h)

    self._button_panel.adjustSize()
    button_hint = self._button_panel.sizeHint()
    button_w = int(max(int(_BUTTON_PANEL_WIDTH_PX), button_hint.width()))
    button_h = int(max(1, button_hint.height()))
    button_x = int(round((page_w - button_w) * 0.5))

    self._creator_label.adjustSize()
    self._version_label.adjustSize()
    creator_hint = self._creator_label.sizeHint()
    version_hint = self._version_label.sizeHint()
    creator_w = int(max(1, creator_hint.width()))
    creator_h = int(max(1, creator_hint.height()))
    version_w = int(max(1, version_hint.width()))
    version_h = int(max(1, version_hint.height()))

    creator_x = int(_PAGE_HORIZONTAL_MARGIN_PX)
    creator_y = int(max(0, page_h - int(_PAGE_BOTTOM_MARGIN_PX) - creator_h))
    self._creator_label.setGeometry(creator_x, creator_y, creator_w, creator_h)

    version_x = int(max(0, page_w - int(_PAGE_HORIZONTAL_MARGIN_PX) - version_w))
    version_y = int(max(0, page_h - int(_PAGE_BOTTOM_MARGIN_PX) - version_h))
    self._version_label.setGeometry(version_x, version_y, version_w, version_h)

    notify_w = int(_NOTIFICATION_BUTTON_SIZE_PX)
    notify_h = int(_NOTIFICATION_BUTTON_SIZE_PX)
    left_region_center_x = float(button_x) * 0.5
    notify_x = int(round(left_region_center_x - float(notify_w) * 0.5))
    notify_x = int(max(int(_SIDE_EDGE_MIN_GAP_PX), min(button_x - notify_w - int(_SIDE_EDGE_MIN_GAP_PX), notify_x)))
    notify_y = int(max(int(_PAGE_TOP_MARGIN_PX), creator_y - int(_BOTTOM_ITEM_GAP_PX) - notify_h - int(_SIDE_BOTTOM_LIFT_PX)))
    self._notification_button.setGeometry(notify_x, notify_y, notify_w, notify_h)

    self._profile_panel.adjustSize()
    profile_hint = self._profile_panel.sizeHint()
    profile_w = int(max(1, profile_hint.width()))
    profile_h = int(max(1, profile_hint.height()))
    button_right = int(button_x + button_w)
    right_region_center_x = (float(button_right) + float(page_w)) * 0.5
    profile_x = int(round(right_region_center_x - float(profile_w) * 0.5))
    min_profile_x = int(button_right + int(_MENU_TO_PROFILE_MIN_GAP_PX))
    max_profile_x = int(page_w - int(_SIDE_EDGE_MIN_GAP_PX) - profile_w)
    if max_profile_x >= min_profile_x:
      profile_x = int(max(min_profile_x, min(max_profile_x, profile_x)))
    else:
      profile_x = int(max(int(_SIDE_EDGE_MIN_GAP_PX), max_profile_x))
    profile_y = int(page_h - int(_PAGE_BOTTOM_MARGIN_PX) - version_h - int(_BOTTOM_ITEM_GAP_PX) - profile_h - int(_SIDE_BOTTOM_LIFT_PX))
    profile_y = int(max(int(_PAGE_TOP_MARGIN_PX), profile_y))
    self._profile_panel.setGeometry(profile_x, profile_y, profile_w, profile_h)

    logo_bottom = int(logo_y + logo_h)
    minimum_button_y = int(logo_bottom + int(_LOGO_TO_BUTTON_PANEL_GAP_PX))
    lower_text_top = int(min(creator_y, version_y))
    maximum_button_y = int(lower_text_top - int(_BOTTOM_ITEM_GAP_PX) - button_h)
    centered_button_y = int(round((page_h - button_h) * 0.5))
    button_y = int(max(minimum_button_y, centered_button_y))
    if maximum_button_y >= minimum_button_y:
      button_y = int(min(button_y, maximum_button_y))
    self._button_panel.setGeometry(button_x, button_y, button_w, button_h)

  # --- page-wide skin preview pointer reaction -----------------------------

  def _install_pointer_tracking(self) -> None:
    for widget in (self, *self.findChildren(QWidget)):
      widget.installEventFilter(self)
      widget.setMouseTracking(True)

  def _skin_preview(self):
    return self._profile_panel.skin_preview

  def _map_event_position(self, watched, event):
    if not isinstance(watched, QWidget) or not hasattr(event, "position"):
      return None
    return watched.mapTo(self, event.position().toPoint())

  def eventFilter(self, watched, event) -> bool:
    event_type = event.type()
    preview = self._skin_preview()
    if event_type == QEvent.Type.MouseButtonPress and hasattr(event, "button") and event.button() == Qt.MouseButton.LeftButton:
      pos = self._map_event_position(watched, event)
      if pos is not None:
        preview.begin_drag(x=float(pos.x()))
        self.setCursor(Qt.CursorShape.ClosedHandCursor)
        self.preview_changed.emit()
    elif event_type == QEvent.Type.MouseMove and hasattr(event, "position"):
      pos = self._map_event_position(watched, event)
      if pos is not None:
        preview.move_pointer(x=float(pos.x()), y=float(pos.y()), area_width=int(self.width()), area_height=int(self.height()))
        self.preview_changed.emit()
    elif event_type == QEvent.Type.MouseButtonRelease and hasattr(event, "button") and event.button() == Qt.MouseButton.LeftButton:
      pos = self._map_event_position(watched, event)
      if pos is not None:
        preview.end_drag(x=float(pos.x()), y=float(pos.y()), area_width=int(self.width()), area_height=int(self.height()))
      else:
        preview.note_pointer_left()
      self.setCursor(Qt.CursorShape.ArrowCursor)
      self.preview_changed.emit()
    elif event_type == QEvent.Type.Leave and watched is self:
      cursor_pos = self.mapFromGlobal(QCursor.pos())
      if not self.rect().contains(cursor_pos):
        preview.note_pointer_left()
      self.setCursor(Qt.CursorShape.ArrowCursor)
      self.preview_changed.emit()
    return super().eventFilter(watched, event)
