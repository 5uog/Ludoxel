# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QSize, Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QIcon
from PyQt6.QtWidgets import QButtonGroup, QFrame, QGridLayout, QHBoxLayout, QLabel, QPushButton, QScrollArea, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.persistence.stores.world_library import WorldLibrarySummary
from ludoxel.presentation.interface.common.screen_title_bar import ScreenTitleBar
from ludoxel.presentation.interface.menu.world_card import WorldGridCard, WorldListRow

_VIEW_GRID = "grid"
_VIEW_LIST = "list"
_GRID_CARD_WIDTH_PX = 244
_GRID_SPACING_PX = 16
_CONTENT_MARGIN_PX = 24
_TOGGLE_BUTTON_SIZE_PX = 40
_REFLOW_DEBOUNCE_MS = 30


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
    self._grid_host: QWidget | None = None
    self._grid_layout: QGridLayout | None = None
    self._grid_cards: list[WorldGridCard] = []
    self._grid_columns_current = 0
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
    self._content_layout.setContentsMargins(_CONTENT_MARGIN_PX, _CONTENT_MARGIN_PX, _CONTENT_MARGIN_PX, _CONTENT_MARGIN_PX)
    self._content_layout.setSpacing(_GRID_SPACING_PX)
    self._scroll.setWidget(self._content)
    root.addWidget(self._scroll, stretch=1)

    self._empty_label = QLabel("No worlds yet. Use Create New World to begin.", self._content)
    self._empty_label.setObjectName("worldLibraryEmpty")
    self._empty_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

    self._reflow_timer = QTimer(self)
    self._reflow_timer.setSingleShot(True)
    self._reflow_timer.setInterval(int(_REFLOW_DEBOUNCE_MS))
    self._reflow_timer.timeout.connect(self._reflow_grid)

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
    self._view_group = QButtonGroup(self)
    self._view_group.setExclusive(True)
    self._view_group.addButton(self._grid_button)
    self._view_group.addButton(self._list_button)
    self._grid_button.setChecked(True)
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
    self._grid_button.setChecked(normalized == _VIEW_GRID)
    self._list_button.setChecked(normalized == _VIEW_LIST)
    if normalized == self._view_mode:
      return
    self._view_mode = normalized
    self._rebuild()

  def set_worlds(self, summaries: tuple[WorldLibrarySummary, ...]) -> None:
    self._summaries = tuple(summaries)
    self._rebuild()

  def _clear_content(self) -> None:
    self._grid_host = None
    self._grid_layout = None
    self._grid_cards = []
    self._grid_columns_current = 0
    while self._content_layout.count():
      item = self._content_layout.takeAt(0)
      widget = item.widget()
      if widget is not None and widget is not self._empty_label:
        # Keep the widget parented to the content while it is deleted; reparenting
        # to None would briefly promote it to a top-level window and flicker.
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
    viewport_width = int(self._scroll.viewport().width())
    if viewport_width <= 1:
      return max(1, int(self._grid_columns_current) or 1)
    scrollbar_reserve = int(self._scroll.verticalScrollBar().sizeHint().width())
    available = viewport_width - (2 * int(_CONTENT_MARGIN_PX)) - scrollbar_reserve
    unit = int(_GRID_CARD_WIDTH_PX) + int(_GRID_SPACING_PX)
    columns = (available + int(_GRID_SPACING_PX)) // unit
    return max(1, int(columns))

  def _build_grid_view(self) -> None:
    grid_host = QWidget(self._content)
    grid_host.setObjectName("worldGridHost")
    grid_host.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Fixed)
    grid_layout = QGridLayout(grid_host)
    grid_layout.setContentsMargins(0, 0, 0, 0)
    grid_layout.setSpacing(int(_GRID_SPACING_PX))
    grid_layout.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignTop)
    self._grid_host = grid_host
    self._grid_layout = grid_layout
    self._grid_cards = []
    for summary in self._summaries:
      card = WorldGridCard(summary, parent=grid_host)
      card.open_requested.connect(self.open_world_requested.emit)
      card.edit_requested.connect(self.edit_world_requested.emit)
      self._grid_cards.append(card)
    self._grid_columns_current = 0
    self._content_layout.addWidget(grid_host)
    self._place_grid_cards(self._grid_columns())

  def _place_grid_cards(self, columns: int) -> None:
    layout = self._grid_layout
    if layout is None:
      return
    columns = max(1, int(columns))
    while layout.count():
      layout.takeAt(0)
    for index, card in enumerate(self._grid_cards):
      layout.addWidget(card, index // columns, index % columns)
    self._grid_columns_current = int(columns)

  def _reflow_grid(self) -> None:
    if self._view_mode != _VIEW_GRID or not self._grid_cards or self._grid_layout is None:
      return
    columns = self._grid_columns()
    if int(columns) == int(self._grid_columns_current):
      return
    self._place_grid_cards(columns)

  def showEvent(self, event) -> None:
    super().showEvent(event)
    # The viewport width is only final after the first show; defer the column
    # computation so the initial grid wraps across the row instead of stacking.
    QTimer.singleShot(0, self._reflow_grid)

  def resizeEvent(self, event) -> None:
    super().resizeEvent(event)
    if self._view_mode == _VIEW_GRID and self._grid_cards:
      self._reflow_timer.start()


__all__ = ["MyWorldLibraryPage"]
