# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QEvent, QSize, Qt, pyqtSignal
from PyQt6.QtGui import QCursor, QIcon, QImage, QMouseEvent, QPixmap
from PyQt6.QtWidgets import QApplication, QFrame, QGridLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton, QScrollArea, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.preferences.keybinds import ACTION_CLEAR_SELECTED_SLOT, ACTION_TOGGLE_INVENTORY, KeybindSettings, action_for_key
from ludoxel.presentation.interface.common.hotbar_support import hotbar_index_from_key
from ludoxel.presentation.interface.common.hotbar_visuals import hotbar_slot_tooltip
from ludoxel.presentation.interface.common.item_photo_provider import ItemPhotoProvider
from ludoxel.presentation.interface.common.item_slots import DraggableItemButton, apply_item_slot_state, item_id_from_mime
from ludoxel.presentation.interface.overlays.skin_preview import PlayerSkinPreviewWidget
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE, normalize_hotbar_index, normalize_hotbar_slots
from ludoxel.simulation.inventories.special_items.registry import iter_catalog_special_items
from ludoxel.simulation.inventories.storage.grid import (
  CRAFTING_INPUT_COLUMNS,
  CRAFTING_INPUT_SIZE,
  UPPER_INVENTORY_COLUMNS,
  UPPER_INVENTORY_SIZE,
  insert_into_first_empty,
  normalize_crafting_slots,
  normalize_upper_inventory_slots,
  place_into_storage_priority,
)

REGION_HOTBAR = "hotbar"
REGION_UPPER = "upper"
REGION_CRAFTING = "crafting"
REGION_OUTPUT = "output"
REGION_CATALOG = "catalog"

_SLOT_SIZE = 46
_SLOT_ICON_SIZE = 36
_SLOT_GAP = 6
_CATALOG_COLUMNS = 7
_GRID_WIDTH = HOTBAR_SIZE * _SLOT_SIZE + (HOTBAR_SIZE - 1) * _SLOT_GAP
_CENTER_PANEL_SIDE = _GRID_WIDTH + 58
_PANEL_VERTICAL_MARGIN = 18
_TOP_AREA_CLEARANCE = 10
_TOP_AREA_TO_UPPER_GAP = _TOP_AREA_CLEARANCE + _SLOT_GAP
_UPPER_TO_HOTBAR_GAP = 8
_UPPER_ROW_COUNT = UPPER_INVENTORY_SIZE // UPPER_INVENTORY_COLUMNS
_UPPER_GRID_HEIGHT = _UPPER_ROW_COUNT * _SLOT_SIZE + (_UPPER_ROW_COUNT - 1) * _SLOT_GAP
_TOP_AREA_HEIGHT = _CENTER_PANEL_SIDE - 2 * _PANEL_VERTICAL_MARGIN - _TOP_AREA_TO_UPPER_GAP - _UPPER_GRID_HEIGHT - _UPPER_TO_HOTBAR_GAP - _SLOT_SIZE
_PREVIEW_BOX_WIDTH = 3 * _SLOT_SIZE + 2 * _SLOT_GAP
_PREVIEW_BOX_HEIGHT = _TOP_AREA_HEIGHT


class _StorageSlotButton(DraggableItemButton):
  clicked_slot = pyqtSignal(str, int, bool)
  dropped_slot = pyqtSignal(str, int, str)
  drag_picked = pyqtSignal(str, int)
  hover_enter = pyqtSignal(str, int)
  hover_leave = pyqtSignal()

  def __init__(self, region: str, index: int, *, droppable: bool, draggable_getter, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._region = str(region)
    self._index = int(index)
    self._droppable = bool(droppable)
    self._draggable_getter = draggable_getter
    self._item_id = ""
    self._press_shift = False

    self.setObjectName("slot")
    self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
    self.setCursor(Qt.CursorShape.PointingHandCursor)
    self.setAcceptDrops(bool(droppable))
    self.setFixedSize(QSize(_SLOT_SIZE, _SLOT_SIZE))
    self.setIconSize(QSize(_SLOT_ICON_SIZE, _SLOT_ICON_SIZE))
    self.clicked.connect(self._emit_click)

  def region(self) -> str:
    return self._region

  def index(self) -> int:
    return int(self._index)

  def item_id(self) -> str:
    return str(self._item_id)

  def set_slot_state(self, *, item_id: str | None, selected: bool, tooltip: str, pixmap: QPixmap | None) -> None:
    normalized_item_id = "" if item_id is None else str(item_id).strip()
    self._item_id = normalized_item_id
    self.set_drag_item_id(normalized_item_id)
    apply_item_slot_state(self, item_id=normalized_item_id, tooltip=tooltip, selected=selected, pixmap=pixmap)

  def _emit_click(self) -> None:
    self.clicked_slot.emit(self._region, int(self._index), bool(self._press_shift))

  def mousePressEvent(self, e: QMouseEvent) -> None:
    if e.button() == Qt.MouseButton.LeftButton:
      self._press_shift = bool(e.modifiers() & Qt.KeyboardModifier.ShiftModifier)
    super().mousePressEvent(e)

  def mouseMoveEvent(self, e: QMouseEvent) -> None:
    if self._drag_start is not None and bool(e.buttons() & Qt.MouseButton.LeftButton):
      if (e.position().toPoint() - self._drag_start).manhattanLength() >= QApplication.startDragDistance():
        if (not bool(self._draggable_getter())) or (not str(self._item_id).strip()):
          self._drag_start = None
          return
        self.drag_picked.emit(self._region, int(self._index))
    super().mouseMoveEvent(e)

  def enterEvent(self, e) -> None:
    self.hover_enter.emit(self._region, int(self._index))
    super().enterEvent(e)

  def leaveEvent(self, e) -> None:
    self.hover_leave.emit()
    super().leaveEvent(e)

  def dragEnterEvent(self, e) -> None:
    if self._droppable and item_id_from_mime(e.mimeData()):
      e.acceptProposedAction()
      return
    e.ignore()

  def dragMoveEvent(self, e) -> None:
    if self._droppable and item_id_from_mime(e.mimeData()):
      e.acceptProposedAction()
      return
    e.ignore()

  def dropEvent(self, e) -> None:
    item_id = item_id_from_mime(e.mimeData())
    if (not self._droppable) or (not item_id):
      e.ignore()
      return
    self.dropped_slot.emit(self._region, int(self._index), str(item_id))
    e.acceptProposedAction()


class _CatalogItemButton(DraggableItemButton):
  clicked_item = pyqtSignal(str, bool)
  drag_picked = pyqtSignal(str)
  hover_enter_item = pyqtSignal(str)
  hover_leave = pyqtSignal()

  def __init__(self, item_id: str, display_name: str, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._item_id = str(item_id)
    self._display_name = str(display_name)
    self._press_shift = False
    self.set_drag_item_id(self._item_id)

    self.setObjectName("slot")
    self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
    self.setCursor(Qt.CursorShape.PointingHandCursor)
    self.setCheckable(False)
    self.setFixedSize(QSize(_SLOT_SIZE, _SLOT_SIZE))
    self.setIconSize(QSize(_SLOT_ICON_SIZE, _SLOT_ICON_SIZE))
    self.setToolTip(f"{self._display_name}\n{self._item_id}")
    self.clicked.connect(self._emit_click)

  def item_id(self) -> str:
    return self._item_id

  def set_icon_pixmap(self, pm: QPixmap | None) -> None:
    apply_item_slot_state(self, item_id=self._item_id, tooltip=f"{self._display_name}\n{self._item_id}", selected=False, pixmap=pm)

  def _emit_click(self) -> None:
    self.clicked_item.emit(str(self._item_id), bool(self._press_shift))

  def mousePressEvent(self, e: QMouseEvent) -> None:
    if e.button() == Qt.MouseButton.LeftButton:
      self._press_shift = bool(e.modifiers() & Qt.KeyboardModifier.ShiftModifier)
    super().mousePressEvent(e)

  def mouseMoveEvent(self, e: QMouseEvent) -> None:
    if self._drag_start is not None and bool(e.buttons() & Qt.MouseButton.LeftButton):
      if (e.position().toPoint() - self._drag_start).manhattanLength() >= QApplication.startDragDistance():
        self.drag_picked.emit(str(self._item_id))
    super().mouseMoveEvent(e)

  def enterEvent(self, e) -> None:
    self.hover_enter_item.emit(str(self._item_id))
    super().enterEvent(e)

  def leaveEvent(self, e) -> None:
    self.hover_leave.emit()
    super().leaveEvent(e)


class _InventorySearchBox(QLineEdit):
  close_requested = pyqtSignal()

  def keyPressEvent(self, event) -> None:
    if int(event.key()) == int(Qt.Key.Key_Escape):
      self.close_requested.emit()
      event.accept()
      return
    super().keyPressEvent(event)


class _InventoryPreviewWidget(PlayerSkinPreviewWidget):
  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setMinimumSize(0, 0)
    self.setMaximumSize(16777215, 16777215)
    self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
    self.set_hover_body_tracking(True)

  def sizeHint(self) -> QSize:
    return QSize(_PREVIEW_BOX_WIDTH, _PREVIEW_BOX_HEIGHT)

  def minimumSizeHint(self) -> QSize:
    return QSize(0, 0)


class InventoryOverlay(QWidget):
  closed = pyqtSignal()
  storage_changed = pyqtSignal(object)

  def __init__(self, *, parent: QWidget | None = None, resource_root: Path, registry: BlockRegistry) -> None:
    super().__init__(parent)

    self._reg = registry
    self._resource_root = Path(resource_root)
    self._photos = ItemPhotoProvider(resource_root=self._resource_root, registry=self._reg, icon_size=_SLOT_ICON_SIZE)
    self._photos.pixmap_changed.connect(self._on_item_pixmap_changed)
    self._photos.set_active(False)

    self._hotbar_slots: list[str] = list(normalize_hotbar_slots(None, size=HOTBAR_SIZE))
    self._upper_slots: list[str] = list(normalize_upper_inventory_slots(None))
    self._crafting_slots: list[str] = list(normalize_crafting_slots(None))
    self._output_slot: str = ""
    self._selected_hotbar_index: int = 0
    self._creative_mode: bool = False
    self._keybinds: KeybindSettings = KeybindSettings()

    self._carry_item_id: str = ""
    self._carry_region: str = ""
    self._carry_index: int = -1
    self._drag_source: tuple[str, int] | None = None
    self._hovered_region: str | None = None
    self._hovered_index: int | None = None
    self._hovered_item_id: str | None = None

    self._hotbar_buttons: list[_StorageSlotButton] = []
    self._upper_buttons: list[_StorageSlotButton] = []
    self._crafting_buttons: list[_StorageSlotButton] = []
    self._output_button: _StorageSlotButton | None = None
    self._catalog_buttons: list[_CatalogItemButton] = []
    self._catalog_entries: list[tuple[str, str, _CatalogItemButton]] = []

    self.setVisible(False)
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
    self.setObjectName("inventoryRoot")
    self.setMouseTracking(True)

    self._build_ui()

    self._carry_cursor = QLabel(self)
    self._carry_cursor.setObjectName("carryCursor")
    self._carry_cursor.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self._carry_cursor.setVisible(False)

    self._rebuild_catalog()
    self.set_creative_mode(False)
    self._sync_storage_buttons()
    self._install_pointer_tracking()

  # -- construction ---------------------------------------------------------

  def _build_ui(self) -> None:
    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)
    root.addStretch(1)

    content = QWidget(self)
    content_row = QHBoxLayout(content)
    content_row.setContentsMargins(0, 0, 0, 0)
    content_row.setSpacing(16)

    self._all_items_panel = self._build_all_items_panel(content)
    content_row.addWidget(self._all_items_panel, alignment=Qt.AlignmentFlag.AlignVCenter)

    self._center_panel = self._build_center_panel(content)
    content_row.addWidget(self._center_panel, alignment=Qt.AlignmentFlag.AlignVCenter)

    root.addWidget(content, alignment=Qt.AlignmentFlag.AlignHCenter)
    root.addStretch(1)

  def _build_all_items_panel(self, parent: QWidget) -> QFrame:
    panel = QFrame(parent)
    panel.setObjectName("allItemsPanel")
    panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    panel.setFixedWidth(_CATALOG_COLUMNS * _SLOT_SIZE + (_CATALOG_COLUMNS - 1) * _SLOT_GAP + 36 + 18)
    panel.setFixedHeight(_CENTER_PANEL_SIDE)

    layout = QVBoxLayout(panel)
    layout.setContentsMargins(16, 16, 16, 16)
    layout.setSpacing(10)

    self._search_box = _InventorySearchBox(panel)
    self._search_box.setPlaceholderText("Search")
    self._search_box.textChanged.connect(self._apply_filter)
    self._search_box.close_requested.connect(self._close)
    layout.addWidget(self._search_box)

    self._catalog_scroll = QScrollArea(panel)
    self._catalog_scroll.setWidgetResizable(True)
    self._catalog_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

    scroll_host = QWidget(self._catalog_scroll)
    self._catalog_host = scroll_host
    self._grid_layout = QGridLayout(scroll_host)
    self._grid_layout.setContentsMargins(0, 0, 0, 0)
    self._grid_layout.setHorizontalSpacing(_SLOT_GAP)
    self._grid_layout.setVerticalSpacing(_SLOT_GAP)
    self._grid_layout.setAlignment(Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft)

    self._catalog_scroll.setWidget(scroll_host)
    layout.addWidget(self._catalog_scroll, stretch=1)
    return panel

  def _build_center_panel(self, parent: QWidget) -> QFrame:
    panel = QFrame(parent)
    panel.setObjectName("panel")
    panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    panel.setFixedSize(QSize(_CENTER_PANEL_SIDE, _CENTER_PANEL_SIDE))

    layout = QVBoxLayout(panel)
    layout.setContentsMargins(_PANEL_VERTICAL_MARGIN, _PANEL_VERTICAL_MARGIN, _PANEL_VERTICAL_MARGIN, _PANEL_VERTICAL_MARGIN)
    layout.setSpacing(0)

    layout.addWidget(self._build_top_area(panel), alignment=Qt.AlignmentFlag.AlignHCenter)
    layout.addSpacing(_TOP_AREA_TO_UPPER_GAP)

    upper = QWidget(panel)
    upper_grid = QGridLayout(upper)
    upper_grid.setContentsMargins(0, 0, 0, 0)
    upper_grid.setHorizontalSpacing(_SLOT_GAP)
    upper_grid.setVerticalSpacing(_SLOT_GAP)
    for slot_index in range(UPPER_INVENTORY_SIZE):
      button = _StorageSlotButton(REGION_UPPER, slot_index, droppable=True, draggable_getter=self._can_begin_drag, parent=upper)
      self._wire_storage_slot(button)
      self._upper_buttons.append(button)
      upper_grid.addWidget(button, int(slot_index // UPPER_INVENTORY_COLUMNS), int(slot_index % UPPER_INVENTORY_COLUMNS))
    layout.addWidget(upper, alignment=Qt.AlignmentFlag.AlignHCenter)

    layout.addSpacing(_UPPER_TO_HOTBAR_GAP)

    hotbar = QWidget(panel)
    hotbar_grid = QGridLayout(hotbar)
    hotbar_grid.setContentsMargins(0, 0, 0, 0)
    hotbar_grid.setHorizontalSpacing(_SLOT_GAP)
    hotbar_grid.setVerticalSpacing(0)
    for slot_index in range(HOTBAR_SIZE):
      button = _StorageSlotButton(REGION_HOTBAR, slot_index, droppable=True, draggable_getter=self._can_begin_drag, parent=hotbar)
      self._wire_storage_slot(button)
      self._hotbar_buttons.append(button)
      hotbar_grid.addWidget(button, 0, int(slot_index))
    layout.addWidget(hotbar, alignment=Qt.AlignmentFlag.AlignHCenter)
    return panel

  def _build_top_area(self, panel: QWidget) -> QWidget:
    top_area = QWidget(panel)
    top_area.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    top_area.setFixedSize(QSize(_GRID_WIDTH, _TOP_AREA_HEIGHT))

    row = QHBoxLayout(top_area)
    row.setContentsMargins(0, 0, 0, 0)
    row.setSpacing(0)
    row.addWidget(self._build_preview_box(top_area))

    right_side = QWidget(top_area)
    right_side.setFixedWidth(_GRID_WIDTH - _PREVIEW_BOX_WIDTH)
    row.addWidget(right_side)

    right_layout = QVBoxLayout(right_side)
    right_layout.setContentsMargins(0, 0, 0, 0)
    right_layout.setSpacing(0)

    close_row = QHBoxLayout()
    close_row.setContentsMargins(0, 0, 0, 0)
    close_row.setSpacing(0)
    close_row.addStretch(1)
    self._close_button = QPushButton(right_side)
    self._close_button.setObjectName("closeBtn")
    self._close_button.setFocusPolicy(Qt.FocusPolicy.NoFocus)
    self._close_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._close_button.setFixedSize(QSize(30, 30))
    self._close_button.setIcon(QIcon(str(self._resource_root / "assets" / "ui" / "inventory" / "close.svg")))
    self._close_button.setIconSize(QSize(16, 16))
    self._close_button.setToolTip("Close (E or Esc)")
    self._close_button.clicked.connect(self._close)
    close_row.addWidget(self._close_button)
    right_layout.addLayout(close_row)

    right_layout.addStretch(1)
    right_layout.addWidget(self._build_crafting_cluster(right_side), alignment=Qt.AlignmentFlag.AlignHCenter)
    right_layout.addStretch(1)
    return top_area

  def _build_crafting_cluster(self, parent: QWidget) -> QWidget:
    cluster = QWidget(parent)
    cluster.setObjectName("craftingCluster")
    row = QHBoxLayout(cluster)
    row.setContentsMargins(0, 0, 0, 0)
    row.setSpacing(10)

    grid_host = QWidget(cluster)
    crafting_grid = QGridLayout(grid_host)
    crafting_grid.setContentsMargins(0, 0, 0, 0)
    crafting_grid.setHorizontalSpacing(6)
    crafting_grid.setVerticalSpacing(6)
    for slot_index in range(CRAFTING_INPUT_SIZE):
      button = _StorageSlotButton(REGION_CRAFTING, slot_index, droppable=True, draggable_getter=self._can_begin_drag, parent=grid_host)
      self._wire_storage_slot(button)
      self._crafting_buttons.append(button)
      crafting_grid.addWidget(button, int(slot_index // CRAFTING_INPUT_COLUMNS), int(slot_index % CRAFTING_INPUT_COLUMNS))
    row.addWidget(grid_host, alignment=Qt.AlignmentFlag.AlignVCenter)

    arrow = QLabel("▶", cluster)
    arrow.setObjectName("craftingArrow")
    row.addWidget(arrow, alignment=Qt.AlignmentFlag.AlignVCenter)

    self._output_button = _StorageSlotButton(REGION_OUTPUT, 0, droppable=False, draggable_getter=self._can_begin_drag, parent=cluster)
    self._wire_storage_slot(self._output_button)
    row.addWidget(self._output_button, alignment=Qt.AlignmentFlag.AlignVCenter)
    return cluster

  def _build_preview_box(self, parent: QWidget) -> QFrame:
    box = QFrame(parent)
    box.setObjectName("inventoryPreviewBox")
    box.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    box.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    box.setFixedSize(QSize(_PREVIEW_BOX_WIDTH, _PREVIEW_BOX_HEIGHT))
    box_layout = QVBoxLayout(box)
    box_layout.setContentsMargins(4, 4, 4, 4)
    box_layout.setSpacing(0)
    self._preview = _InventoryPreviewWidget(box)
    box_layout.addWidget(self._preview)
    return box

  def _wire_storage_slot(self, button: _StorageSlotButton) -> None:
    button.clicked_slot.connect(self._on_slot_clicked)
    button.dropped_slot.connect(self._on_slot_dropped)
    button.drag_picked.connect(self._on_slot_drag_picked)
    button.hover_enter.connect(self._on_slot_hover_enter)
    button.hover_leave.connect(self._on_hover_leave)

  def _wire_catalog_button(self, button: _CatalogItemButton) -> None:
    button.clicked_item.connect(self._on_catalog_clicked)
    button.drag_picked.connect(self._on_catalog_drag_picked)
    button.hover_enter_item.connect(self._on_catalog_hover_enter)
    button.hover_leave.connect(self._on_hover_leave)

  def _rebuild_catalog(self) -> None:
    self._catalog_buttons.clear()
    self._catalog_entries.clear()

    for block_def in self._reg.all_blocks():
      item_id = str(block_def.block_id)
      display_name = str(block_def.display_name)
      button = _CatalogItemButton(item_id, display_name, self._catalog_host)
      self._wire_catalog_button(button)
      button.set_icon_pixmap(self._photos.pixmap_for_item(item_id))
      self._catalog_buttons.append(button)
      self._catalog_entries.append((item_id, f"{display_name.casefold()} {item_id.casefold()}", button))

    for descriptor in iter_catalog_special_items():
      item_id = str(descriptor.item_id)
      display_name = str(descriptor.display_name)
      button = _CatalogItemButton(item_id, display_name, self._catalog_host)
      self._wire_catalog_button(button)
      button.set_icon_pixmap(self._photos.pixmap_for_item(item_id))
      self._catalog_buttons.append(button)
      search_key = f"{display_name.casefold()} {item_id.casefold()} {str(descriptor.description).casefold()}"
      self._catalog_entries.append((item_id, search_key, button))

    self._apply_filter()

  def _install_pointer_tracking(self) -> None:
    for widget in (self, *self.findChildren(QWidget)):
      widget.installEventFilter(self)
      widget.setMouseTracking(True)

  # -- public sync API ------------------------------------------------------

  def set_keybinds(self, keybinds: KeybindSettings) -> None:
    self._keybinds = keybinds.normalized()

  def set_animations_enabled(self, enabled: bool) -> None:
    self._photos.set_animations_enabled(bool(enabled))

  def set_creative_mode(self, on: bool) -> None:
    self._creative_mode = bool(on)
    self._photos.set_active(bool(self.isVisible()))
    self._all_items_panel.setVisible(bool(self._creative_mode))
    if not self._creative_mode:
      self._search_box.clear()
      if self._carry_region == REGION_CATALOG:
        self._clear_carry()
      if self._hovered_region == REGION_CATALOG:
        self._on_hover_leave()
    self._apply_filter()

  def sync_storage(self, *, slots, upper, selected_index: int) -> None:
    self._clear_carry()
    self._drag_source = None
    self._hotbar_slots = list(normalize_hotbar_slots(slots, size=HOTBAR_SIZE))
    self._upper_slots = list(normalize_upper_inventory_slots(upper))
    if not any(str(item_id).strip() for item_id in self._crafting_slots):
      self._crafting_slots = list(normalize_crafting_slots(None))
    self._selected_hotbar_index = int(normalize_hotbar_index(selected_index, size=HOTBAR_SIZE))
    self._sync_storage_buttons()

  def preview_widget(self) -> _InventoryPreviewWidget:
    return self._preview

  def set_player_preview_frame(self, image: QImage) -> None:
    self._preview.set_frame_image(image)

  # -- visibility -----------------------------------------------------------

  def setVisible(self, visible: bool) -> None:
    normalized_visible = bool(visible)
    if (not normalized_visible) and bool(self.isVisible()):
      self._cancel_carry()
      self._evacuate_crafting()
    super().setVisible(normalized_visible)
    self._photos.set_active(normalized_visible)
    if not normalized_visible:
      self._clear_carry()
      self._drag_source = None
      self._on_hover_leave()
      if hasattr(self, "_search_box"):
        self._search_box.clear()
      return
    if normalized_visible and bool(self._creative_mode) and hasattr(self, "_search_box"):
      self._search_box.setFocus(Qt.FocusReason.PopupFocusReason)
      self._search_box.selectAll()

  # -- working-state access -------------------------------------------------

  def _region_list(self, region: str) -> list[str] | None:
    if region == REGION_HOTBAR:
      return self._hotbar_slots
    if region == REGION_UPPER:
      return self._upper_slots
    if region == REGION_CRAFTING:
      return self._crafting_slots
    return None

  def _get_slot(self, region: str, index: int) -> str:
    if region == REGION_OUTPUT:
      return str(self._output_slot).strip()
    backing = self._region_list(region)
    if backing is None:
      return ""
    if 0 <= int(index) < len(backing):
      return str(backing[int(index)]).strip()
    return ""

  def _set_slot(self, region: str, index: int, item_id: str | None) -> None:
    if region == REGION_OUTPUT:
      return
    backing = self._region_list(region)
    if backing is None:
      return
    if 0 <= int(index) < len(backing):
      backing[int(index)] = "" if item_id is None else str(item_id).strip()

  def _can_begin_drag(self) -> bool:
    return not bool(self._carry_item_id)

  def _is_carrying(self) -> bool:
    return bool(self._carry_item_id)

  # -- click / carry --------------------------------------------------------

  def _on_slot_clicked(self, region: str, index: int, shift: bool) -> None:
    if bool(shift) and (not self._is_carrying()):
      self._shift_transfer_slot(str(region), int(index))
      return
    if self._is_carrying():
      self._place_carry(str(region), int(index))
      return
    self._begin_carry_from_slot(str(region), int(index))

  def _on_catalog_clicked(self, item_id: str, shift: bool) -> None:
    if not self._creative_mode:
      return
    if bool(shift) and (not self._is_carrying()):
      self._shift_transfer_into_storage(str(item_id))
      return
    if self._is_carrying():
      return
    self._begin_carry_from_catalog(str(item_id))

  def _begin_carry_from_slot(self, region: str, index: int) -> None:
    item_id = self._get_slot(region, index)
    if not item_id:
      return
    self._carry_item_id = item_id
    self._carry_region = str(region)
    self._carry_index = int(index)
    self._set_slot(region, index, "")
    self._sync_storage_buttons()
    self._update_carry_cursor()
    self._reposition_carry_cursor_to_cursor()

  def _begin_carry_from_catalog(self, item_id: str) -> None:
    normalized = str(item_id).strip()
    if not normalized:
      return
    self._carry_item_id = normalized
    self._carry_region = REGION_CATALOG
    self._carry_index = -1
    self._update_carry_cursor()
    self._reposition_carry_cursor_to_cursor()

  def _place_carry(self, dest_region: str, dest_index: int) -> None:
    if dest_region == REGION_OUTPUT:
      return
    carried = self._carry_item_id
    destination_old = self._get_slot(dest_region, dest_index)
    if self._carry_region == REGION_CATALOG:
      self._set_slot(dest_region, dest_index, carried)
    else:
      self._set_slot(dest_region, dest_index, carried)
      if not (self._carry_region == dest_region and int(self._carry_index) == int(dest_index)):
        self._set_slot(self._carry_region, self._carry_index, destination_old)
    self._clear_carry()
    self._sync_storage_buttons()
    self._emit_storage_changed()

  def _cancel_carry(self) -> None:
    if not self._is_carrying():
      return
    if self._carry_region != REGION_CATALOG:
      self._set_slot(self._carry_region, self._carry_index, self._carry_item_id)
    self._clear_carry()
    self._sync_storage_buttons()

  def _clear_carry(self) -> None:
    self._carry_item_id = ""
    self._carry_region = ""
    self._carry_index = -1
    if hasattr(self, "_carry_cursor"):
      self._carry_cursor.setVisible(False)

  # -- shift transfer -------------------------------------------------------

  def _shift_transfer_slot(self, region: str, index: int) -> None:
    item_id = self._get_slot(region, index)
    if not item_id:
      return
    if region == REGION_HOTBAR:
      new_upper, placed_index = insert_into_first_empty(self._upper_slots, item_id, size=UPPER_INVENTORY_SIZE)
      if placed_index is None:
        return
      self._upper_slots = list(new_upper)
      self._set_slot(REGION_HOTBAR, index, "")
    elif region == REGION_UPPER:
      new_hotbar, placed_index = insert_into_first_empty(self._hotbar_slots, item_id, size=HOTBAR_SIZE)
      if placed_index is None:
        return
      self._hotbar_slots = list(new_hotbar)
      self._set_slot(REGION_UPPER, index, "")
    elif region in (REGION_CRAFTING, REGION_OUTPUT):
      new_hotbar, new_upper, placed = place_into_storage_priority(self._hotbar_slots, self._upper_slots, item_id)
      if not placed:
        return
      self._hotbar_slots = list(new_hotbar)
      self._upper_slots = list(new_upper)
      self._set_slot(region, index, "")
    else:
      return
    self._sync_storage_buttons()
    self._emit_storage_changed()

  def _shift_transfer_into_storage(self, item_id: str) -> None:
    normalized = str(item_id).strip()
    if not normalized:
      return
    new_hotbar, new_upper, placed = place_into_storage_priority(self._hotbar_slots, self._upper_slots, normalized)
    if not placed:
      return
    self._hotbar_slots = list(new_hotbar)
    self._upper_slots = list(new_upper)
    self._sync_storage_buttons()
    self._emit_storage_changed()

  def _evacuate_crafting(self) -> None:
    moved = False
    for index in range(len(self._crafting_slots)):
      item_id = str(self._crafting_slots[index]).strip()
      if not item_id:
        continue
      new_hotbar, new_upper, placed = place_into_storage_priority(self._hotbar_slots, self._upper_slots, item_id)
      if placed:
        self._hotbar_slots = list(new_hotbar)
        self._upper_slots = list(new_upper)
        self._crafting_slots[index] = ""
        moved = True
    if moved:
      self._sync_storage_buttons()
      self._emit_storage_changed()

  # -- drag and drop --------------------------------------------------------

  def _on_slot_drag_picked(self, region: str, index: int) -> None:
    if self._is_carrying():
      self._drag_source = None
      return
    self._drag_source = (str(region), int(index))

  def _on_catalog_drag_picked(self, item_id: str) -> None:
    if self._is_carrying():
      self._drag_source = None
      return
    self._drag_source = (REGION_CATALOG, -1)

  def _on_slot_dropped(self, dest_region: str, dest_index: int, item_id: str) -> None:
    source = self._drag_source
    self._drag_source = None
    if dest_region == REGION_OUTPUT:
      return
    if source is None:
      return
    source_region, source_index = source
    if source_region == REGION_CATALOG:
      if not self._creative_mode:
        return
      self._set_slot(dest_region, dest_index, str(item_id))
    else:
      if source_region == REGION_OUTPUT:
        return
      if source_region == dest_region and int(source_index) == int(dest_index):
        return
      destination_old = self._get_slot(dest_region, dest_index)
      self._set_slot(dest_region, dest_index, str(item_id))
      self._set_slot(source_region, source_index, destination_old)
    self._sync_storage_buttons()
    self._emit_storage_changed()

  # -- hover ----------------------------------------------------------------

  def _on_slot_hover_enter(self, region: str, index: int) -> None:
    self._hovered_region = str(region)
    self._hovered_index = int(index)
    self._hovered_item_id = self._get_slot(region, index) or None

  def _on_catalog_hover_enter(self, item_id: str) -> None:
    self._hovered_region = REGION_CATALOG
    self._hovered_index = -1
    self._hovered_item_id = str(item_id).strip() or None

  def _on_hover_leave(self) -> None:
    self._hovered_region = None
    self._hovered_index = None
    self._hovered_item_id = None

  # -- number-key assignment ------------------------------------------------

  def _handle_number_key(self, hotbar_index: int) -> None:
    target_index = int(normalize_hotbar_index(hotbar_index, size=HOTBAR_SIZE))
    region = self._hovered_region
    if region == REGION_CATALOG:
      item_id = self._hovered_item_id
      if (not self._creative_mode) or not item_id:
        return
      self._set_slot(REGION_HOTBAR, target_index, str(item_id))
      self._sync_storage_buttons()
      self._emit_storage_changed()
      return

    if region not in (REGION_HOTBAR, REGION_UPPER, REGION_CRAFTING) or self._hovered_index is None:
      return
    hovered_index = int(self._hovered_index)
    if region == REGION_HOTBAR and int(hovered_index) == int(target_index):
      return
    hovered_item = self._get_slot(region, hovered_index)
    if not hovered_item:
      return
    hotbar_item = self._get_slot(REGION_HOTBAR, target_index)
    self._set_slot(REGION_HOTBAR, target_index, hovered_item)
    self._set_slot(region, hovered_index, hotbar_item)
    self._sync_storage_buttons()
    self._emit_storage_changed()

  def _clear_hovered_slot(self) -> None:
    if self._is_carrying():
      return
    region = self._hovered_region
    if region not in (REGION_HOTBAR, REGION_UPPER) or self._hovered_index is None:
      return
    hovered_index = int(self._hovered_index)
    if not self._get_slot(region, hovered_index):
      return
    self._set_slot(region, hovered_index, "")
    self._hovered_item_id = None
    self._sync_storage_buttons()
    self._emit_storage_changed()

  # -- rendering helpers ----------------------------------------------------

  def _apply_filter(self) -> None:
    while self._grid_layout.count() > 0:
      self._grid_layout.takeAt(0)
    for _item_id, _search_key, button in self._catalog_entries:
      button.setVisible(False)

    if not bool(self._creative_mode):
      return

    query_text = str(self._search_box.text() or "").strip().casefold()
    tokens = tuple(token for token in query_text.split() if token)
    matching_entries = [entry for entry in self._catalog_entries if all(token in entry[1] for token in tokens)]

    for index, (_item_id, _search_key, button) in enumerate(matching_entries):
      row = int(index // _CATALOG_COLUMNS)
      col = int(index % _CATALOG_COLUMNS)
      self._grid_layout.addWidget(button, row, col)
      button.setVisible(True)

    visible_ids = {item_id for item_id, _search_key, _button in matching_entries}
    if self._hovered_region == REGION_CATALOG and self._hovered_item_id is not None and str(self._hovered_item_id) not in visible_ids:
      self._on_hover_leave()

  def _item_tooltip(self, item_id: str) -> str:
    normalized = str(item_id).strip()
    if not normalized:
      return ""
    return self._photos.tooltip_for_item(normalized)

  def _sync_storage_buttons(self) -> None:
    for slot_index, button in enumerate(self._hotbar_buttons):
      item_id = str(self._hotbar_slots[slot_index]).strip()
      pixmap = self._photos.pixmap_for_item(item_id) if item_id else None
      button.set_slot_state(
        item_id=item_id, selected=(int(slot_index) == int(self._selected_hotbar_index)), tooltip=hotbar_slot_tooltip(self._reg, slot_index=slot_index, item_id=item_id), pixmap=pixmap
      )
    for slot_index, button in enumerate(self._upper_buttons):
      item_id = str(self._upper_slots[slot_index]).strip()
      pixmap = self._photos.pixmap_for_item(item_id) if item_id else None
      button.set_slot_state(item_id=item_id, selected=False, tooltip=self._item_tooltip(item_id), pixmap=pixmap)
    for slot_index, button in enumerate(self._crafting_buttons):
      item_id = str(self._crafting_slots[slot_index]).strip()
      pixmap = self._photos.pixmap_for_item(item_id) if item_id else None
      button.set_slot_state(item_id=item_id, selected=False, tooltip=self._item_tooltip(item_id), pixmap=pixmap)
    if self._output_button is not None:
      item_id = str(self._output_slot).strip()
      pixmap = self._photos.pixmap_for_item(item_id) if item_id else None
      self._output_button.set_slot_state(item_id=item_id, selected=False, tooltip=self._item_tooltip(item_id), pixmap=pixmap)

  def _emit_storage_changed(self) -> None:
    self.storage_changed.emit({"hotbar": tuple(str(value).strip() for value in self._hotbar_slots), "upper": tuple(str(value).strip() for value in self._upper_slots)})

  def _on_item_pixmap_changed(self, item_id: str) -> None:
    normalized = str(item_id).strip()
    if not normalized:
      return
    for button in self._catalog_buttons:
      if button.item_id() == normalized:
        button.set_icon_pixmap(self._photos.pixmap_for_item(normalized))
    self._sync_storage_buttons()
    self._update_carry_cursor()

  # -- carry cursor ---------------------------------------------------------

  def _update_carry_cursor(self) -> None:
    if not self._is_carrying():
      self._carry_cursor.setVisible(False)
      return
    pixmap = self._photos.pixmap_for_item(self._carry_item_id)
    if pixmap is None or pixmap.isNull():
      self._carry_cursor.setVisible(False)
      return
    if int(pixmap.width()) > _SLOT_ICON_SIZE or int(pixmap.height()) > _SLOT_ICON_SIZE:
      pixmap = pixmap.scaled(_SLOT_ICON_SIZE, _SLOT_ICON_SIZE, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.FastTransformation)
    self._carry_cursor.setPixmap(pixmap)
    self._carry_cursor.resize(pixmap.size())
    self._carry_cursor.setVisible(True)
    self._carry_cursor.raise_()

  def _move_carry_cursor(self, pos) -> None:
    self._carry_cursor.move(int(pos.x()) - int(self._carry_cursor.width() // 2), int(pos.y()) - int(self._carry_cursor.height() // 2))
    self._carry_cursor.raise_()

  def _reposition_carry_cursor_to_cursor(self) -> None:
    if not self._is_carrying():
      return
    local = self.mapFromGlobal(QCursor.pos())
    self._move_carry_cursor(local)

  def eventFilter(self, watched, event) -> bool:
    if event.type() == QEvent.Type.MouseMove:
      pos = self._map_event_position(watched, event)
      if pos is not None:
        if self._is_carrying():
          self._move_carry_cursor(pos)
        self._preview.move_pointer(x=float(pos.x()), y=float(pos.y()), area_width=int(max(1, self.width())), area_height=int(max(1, self.height())))
    return super().eventFilter(watched, event)

  def _map_event_position(self, watched, event):
    if not isinstance(watched, QWidget) or not hasattr(event, "position"):
      return None
    return watched.mapTo(self, event.position().toPoint())

  # -- close / keys ---------------------------------------------------------

  def _close(self) -> None:
    self.setVisible(False)
    self.closed.emit()

  def keyPressEvent(self, e) -> None:
    key = int(e.key())
    if key == int(Qt.Key.Key_Escape):
      self._close()
      e.accept()
      return

    search_focused = bool(self._creative_mode) and self._search_box.isVisible() and self._search_box.hasFocus()
    if search_focused:
      e.accept()
      return

    bound_action = action_for_key(int(key), self._keybinds)
    if bound_action == ACTION_TOGGLE_INVENTORY:
      self._close()
      e.accept()
      return

    if bound_action == ACTION_CLEAR_SELECTED_SLOT:
      self._clear_hovered_slot()
      e.accept()
      return

    idx = hotbar_index_from_key(key, self._keybinds)
    if idx is not None:
      self._handle_number_key(int(idx))
      e.accept()
      return

    super().keyPressEvent(e)
