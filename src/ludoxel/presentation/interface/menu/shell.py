# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QStackedWidget, QVBoxLayout, QWidget

from ludoxel.application.persistence.stores.world_library import WorldLibrarySummary
from ludoxel.presentation.interface.menu.changelog_page import ChangelogPage
from ludoxel.presentation.interface.menu.library_page import MyWorldLibraryPage
from ludoxel.presentation.interface.menu.menu_page import StartupMenuPage

_PAGE_MENU = 0
_PAGE_LIBRARY = 1
_PAGE_CHANGELOG = 2


class StartupShellOverlay(QWidget):
  enter_my_world_requested = pyqtSignal(str)
  enter_othello_requested = pyqtSignal()
  change_skin_requested = pyqtSignal()
  reset_skin_requested = pyqtSignal()
  preview_changed = pyqtSignal()
  create_world_requested = pyqtSignal()
  import_world_requested = pyqtSignal()
  edit_world_requested = pyqtSignal(str)

  def __init__(self, *, resource_root: Path, version_text: str, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("startupShellRoot")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
    self.setVisible(False)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(0, 0, 0, 0)
    layout.setSpacing(0)

    self._stack = QStackedWidget(self)
    layout.addWidget(self._stack)

    self._menu_page = StartupMenuPage(resource_root=resource_root, version_text=version_text, parent=self._stack)
    self._library_page = MyWorldLibraryPage(resource_root=resource_root, parent=self._stack)
    self._changelog_page = ChangelogPage(resource_root=resource_root, parent=self._stack)
    self._stack.addWidget(self._menu_page)
    self._stack.addWidget(self._library_page)
    self._stack.addWidget(self._changelog_page)

    self._menu_page.play_my_world_requested.connect(self.show_library)
    self._menu_page.play_othello_requested.connect(self.enter_othello_requested.emit)
    self._menu_page.notifications_requested.connect(self.show_changelog)
    self._menu_page.change_skin_requested.connect(self.change_skin_requested.emit)
    self._menu_page.reset_skin_requested.connect(self.reset_skin_requested.emit)
    self._menu_page.preview_changed.connect(self.preview_changed.emit)

    self._library_page.back_requested.connect(self.show_menu)
    self._library_page.open_world_requested.connect(self.enter_my_world_requested.emit)
    self._library_page.edit_world_requested.connect(self.edit_world_requested.emit)
    self._library_page.create_world_requested.connect(self.create_world_requested.emit)
    self._library_page.import_world_requested.connect(self.import_world_requested.emit)

    self._changelog_page.back_requested.connect(self.show_menu)

  # --- page navigation -----------------------------------------------------

  def current_page(self) -> int:
    return int(self._stack.currentIndex())

  def show_menu(self) -> None:
    self._stack.setCurrentIndex(_PAGE_MENU)
    self.setFocus(Qt.FocusReason.OtherFocusReason)

  def show_library(self) -> None:
    self._stack.setCurrentIndex(_PAGE_LIBRARY)

  def show_changelog(self) -> None:
    self._changelog_page.ensure_loaded()
    self._stack.setCurrentIndex(_PAGE_CHANGELOG)
    self._changelog_page.focus_scroll()

  def on_menu_page(self) -> bool:
    return int(self._stack.currentIndex()) == _PAGE_MENU

  # --- data + preview ------------------------------------------------------

  def set_worlds(self, summaries: tuple[WorldLibrarySummary, ...]) -> None:
    self._library_page.set_worlds(tuple(summaries))

  def set_version_text(self, text: str) -> None:
    self._menu_page.set_version_text(str(text))

  def set_player_skin(self, image: QImage, *, slim_arm: bool) -> None:
    self._menu_page.profile_panel.set_player_skin(image, slim_arm=bool(slim_arm))

  def set_player_preview_frame(self, image: QImage) -> None:
    self._menu_page.profile_panel.set_player_preview_frame(image)

  def set_player_preview_name_tag(self, text: str, *, visible: bool, opacity: float = 1.0) -> None:
    self._menu_page.profile_panel.set_player_preview_name_tag(text, visible=bool(visible), opacity=float(opacity))

  def player_preview_angles(self) -> tuple[float, float, float]:
    return self._menu_page.profile_panel.player_preview_angles()

  def player_preview_widget(self) -> QWidget:
    return self._menu_page.profile_panel.skin_preview

  def menu_preview_visible(self) -> bool:
    return bool(self.isVisible()) and self.on_menu_page()

  def keyPressEvent(self, event) -> None:
    if int(event.key()) == int(Qt.Key.Key_Escape) and not self.on_menu_page():
      self.show_menu()
      event.accept()
      return
    super().keyPressEvent(event)
