# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QSize, Qt, pyqtSignal
from PyQt6.QtGui import QIcon
from PyQt6.QtWidgets import QButtonGroup, QFrame, QGridLayout, QHBoxLayout, QLabel, QPushButton, QScrollArea, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.persistence.stores.world_library import WorldLibrarySummary
from ludoxel.presentation.interface.common.screen_title_bar import ScreenTitleBar
from ludoxel.presentation.interface.menu.world_card import WorldGridCard, WorldListRow

_VIEW_GRID = "grid"
_VIEW_LIST = "list"
_GRID_CARD_WIDTH_PX = 244
_TOGGLE_BUTTON_SIZE_PX = 40


class MyWorldLibraryPage(QWidget):
  back_requested = pyqtSignal()
  open_world_requested = pyqtSignal(str)
  edit_world_requested = pyqtSignal(str)
  create_world_requested = pyqtSignal()
  import_world_requested = pyqtSignal()

  def __init__(self, *, resource_root: Path, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._resource_root = Path(resource_root)
    self._view_mode = _VIEW_GRID
    self._summaries: tuple[WorldLibrarySummary, ...] = ()
    self.setObjectName("myWorldLibraryPage")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)

    self._title_bar = ScreenTitleBar("Play My World", parent=self)
    self._title_bar.back_requested.connect(self.back_requested.emit)
    root.addWidget(self._title_bar)

    root.addWidget(self._build_toolbar())

    self._scroll = QScrollArea(self)
    self._scroll.setObjectName("worldLibraryScroll")
    self._scroll.setFrameShape(QFrame.Shape.NoFrame)
    self._scroll.setWidgetResizable(True)
    self._scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
    self._content = QWidget(self._scroll)
    self._content.setObjectName("worldLibraryContent")
    self._content_layout = QVBoxLayout(self._content)
    self._content_layout.setContentsMargins(24, 24, 24, 24)
    self._content_layout.setSpacing(16)
    self._scroll.setWidget(self._content)
    root.addWidget(self._scroll, stretch=1)

    self._empty_label = QLabel("No worlds yet. Use Create New World to begin.", self._content)
    self._empty_label.setObjectName("worldLibraryEmpty")
    self._empty_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

    self._rebuild()

  def _build_toolbar(self) -> QWidget:
    bar = QFrame(self)
    bar.setObjectName("worldLibraryToolbar")
    bar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    layout = QHBoxLayout(bar)
    layout.setContentsMargins(24, 10, 24, 10)
    layout.setSpacing(8)

    self._grid_button = self._build_toggle_button("grid.svg", "Grid view")
    self._list_button = self._build_toggle_button("list.svg", "List view")
    self._grid_button.setChecked(True)
    self._view_group = QButtonGroup(self)
    self._view_group.setExclusive(True)
    self._view_group.addButton(self._grid_button)
    self._view_group.addButton(self._list_button)
    self._grid_button.clicked.connect(lambda: self.set_view_mode(_VIEW_GRID))
    self._list_button.clicked.connect(lambda: self.set_view_mode(_VIEW_LIST))
    layout.addWidget(self._grid_button)
    layout.addWidget(self._list_button)

    layout.addStretch(1)

    self._import_button = QPushButton("Import World", bar)
    self._import_button.setObjectName("menuBtn")
    self._import_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._import_button.clicked.connect(self.import_world_requested.emit)
    layout.addWidget(self._import_button)

    self._create_button = QPushButton("Create New World", bar)
    self._create_button.setObjectName("menuBtn")
    self._create_button.setProperty("buttonStyle", "prominent")
    self._create_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._create_button.clicked.connect(self.create_world_requested.emit)
    layout.addWidget(self._create_button)
    return bar

  def _build_toggle_button(self, icon_name: str, tooltip: str) -> QPushButton:
    button = QPushButton(self)
    button.setObjectName("worldViewToggle")
    button.setCheckable(True)
    button.setCursor(Qt.CursorShape.PointingHandCursor)
    button.setFixedSize(int(_TOGGLE_BUTTON_SIZE_PX), int(_TOGGLE_BUTTON_SIZE_PX))
    icon_path = self._resource_root / "assets" / "ui" / "menu" / str(icon_name)
    if icon_path.is_file():
      button.setIcon(QIcon(str(icon_path)))
      button.setIconSize(QSize(22, 22))
    else:
      button.setText("#" if icon_name.startswith("grid") else "=")
    button.setToolTip(str(tooltip))
    return button

  def set_view_mode(self, mode: str) -> None:
    normalized = _VIEW_LIST if str(mode) == _VIEW_LIST else _VIEW_GRID
    if normalized == self._view_mode:
      return
    self._view_mode = normalized
    self._grid_button.setChecked(normalized == _VIEW_GRID)
    self._list_button.setChecked(normalized == _VIEW_LIST)
    self._rebuild()

  def set_worlds(self, summaries: tuple[WorldLibrarySummary, ...]) -> None:
    self._summaries = tuple(summaries)
    self._rebuild()

  def _clear_content(self) -> None:
    while self._content_layout.count():
      item = self._content_layout.takeAt(0)
      widget = item.widget()
      if widget is not None and widget is not self._empty_label:
        widget.setParent(None)
        widget.deleteLater()

  def _rebuild(self) -> None:
    self._clear_content()
    if not self._summaries:
      self._empty_label.setVisible(True)
      self._content_layout.addWidget(self._empty_label, alignment=Qt.AlignmentFlag.AlignCenter)
      self._content_layout.addStretch(1)
      return
    self._empty_label.setVisible(False)
    if self._view_mode == _VIEW_LIST:
      self._build_list_view()
    else:
      self._build_grid_view()
    self._content_layout.addStretch(1)

  def _build_list_view(self) -> None:
    for summary in self._summaries:
      row = WorldListRow(summary, parent=self._content)
      row.open_requested.connect(self.open_world_requested.emit)
      row.edit_requested.connect(self.edit_world_requested.emit)
      self._content_layout.addWidget(row)

  def _grid_columns(self) -> int:
    available = max(1, int(self._scroll.viewport().width()) - 48)
    return max(1, int(available // int(_GRID_CARD_WIDTH_PX)))

  def _build_grid_view(self) -> None:
    grid_host = QWidget(self._content)
    grid_host.setObjectName("worldGridHost")
    grid_layout = QGridLayout(grid_host)
    grid_layout.setContentsMargins(0, 0, 0, 0)
    grid_layout.setSpacing(16)
    grid_layout.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignTop)
    columns = self._grid_columns()
    for index, summary in enumerate(self._summaries):
      card = WorldGridCard(summary, parent=grid_host)
      card.open_requested.connect(self.open_world_requested.emit)
      card.edit_requested.connect(self.edit_world_requested.emit)
      grid_layout.addWidget(card, index // columns, index % columns)
    self._content_layout.addWidget(grid_host)

  def resizeEvent(self, event) -> None:
    super().resizeEvent(event)
    if self._view_mode == _VIEW_GRID and self._summaries:
      self._rebuild()


__all__ = ["MyWorldLibraryPage"]
