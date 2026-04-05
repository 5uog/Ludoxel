# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QPixmap, QMouseEvent
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, QSizePolicy, QGridLayout, QLineEdit, QScrollArea

from ....application.runtime.keybinds import ACTION_TOGGLE_INVENTORY, KeybindSettings, action_for_key
from ...blocks.registry.block_registry import BlockRegistry
from ...world.inventory.hotbar import HOTBAR_SIZE, normalize_hotbar_index, normalize_hotbar_slots
from ...world.inventory.special_items import iter_catalog_special_items
from ..common import DraggableItemButton, ItemPhotoProvider, apply_item_slot_state, hotbar_index_from_key, hotbar_slot_tooltip, item_id_from_mime


class _InventoryItemButton(DraggableItemButton):
    activated = pyqtSignal(str)
    hovered_item = pyqtSignal(str)
    hover_left = pyqtSignal()

    def __init__(self, item_id: str, display_name: str, parent: QWidget | None=None) -> None:
        super().__init__(parent)
        self._item_id = str(item_id)
        self._display_name = str(display_name)
        self.set_drag_item_id(self._item_id)

        self.setObjectName("slot")
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setCheckable(False)
        self.setFixedSize(QSize(46, 46))
        self.setIconSize(QSize(36, 36))
        self.setToolTip(f"{self._display_name}\n{self._item_id}")

        self.clicked.connect(lambda: self.activated.emit(str(self._item_id)))

    def item_id(self) -> str:
        return self._item_id

    def set_icon_pixmap(self, pm: QPixmap | None) -> None:
        apply_item_slot_state(self, item_id=self._item_id, tooltip=f"{self._display_name}\n{self._item_id}", selected=False, pixmap=pm)

    def enterEvent(self, e) -> None:
        self.hovered_item.emit(str(self._item_id))
        super().enterEvent(e)

    def leaveEvent(self, e) -> None:
        self.hover_left.emit()
        super().leaveEvent(e)


class _HotbarSlotButton(DraggableItemButton):
    slot_selected = pyqtSignal(int)
    item_dropped = pyqtSignal(int, str)

    def __init__(self, slot_index: int, parent: QWidget | None=None) -> None:
        super().__init__(parent)
        self._slot_index = int(slot_index)
        self._item_id = ""

        self.setObjectName("slot")
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setAcceptDrops(True)
        self.setFixedSize(QSize(46, 46))
        self.setIconSize(QSize(36, 36))
        self.setToolTip(f"Hotbar Slot {int(self._slot_index) + 1}\nEmpty Hand")

    def slot_index(self) -> int:
        return int(self._slot_index)

    def item_id(self) -> str:
        return str(self._item_id)

    def set_slot_state(self, *, item_id: str | None, selected: bool, tooltip: str, pixmap: QPixmap | None) -> None:
        normalized_item_id = "" if item_id is None else str(item_id).strip()
        self._item_id = normalized_item_id
        self.set_drag_item_id(normalized_item_id)
        apply_item_slot_state(self, item_id=normalized_item_id, tooltip=tooltip, selected=selected, pixmap=pixmap)

    def mousePressEvent(self, e: QMouseEvent) -> None:
        if e.button() == Qt.MouseButton.LeftButton:
            self.slot_selected.emit(int(self._slot_index))
        super().mousePressEvent(e)

    def dragEnterEvent(self, e) -> None:
        item_id = item_id_from_mime(e.mimeData())
        if item_id:
            e.acceptProposedAction()
            return
        e.ignore()

    def dragMoveEvent(self, e) -> None:
        item_id = item_id_from_mime(e.mimeData())
        if item_id:
            e.acceptProposedAction()
            return
        e.ignore()

    def dropEvent(self, e) -> None:
        item_id = item_id_from_mime(e.mimeData())
        if not item_id:
            e.ignore()
            return

        self.item_dropped.emit(int(self._slot_index), str(item_id))
        self.slot_selected.emit(int(self._slot_index))
        e.acceptProposedAction()


class _InventorySearchBox(QLineEdit):
    close_requested = pyqtSignal()
    hotbar_key_pressed = pyqtSignal(int)

    def __init__(self, parent: QWidget | None=None) -> None:
        super().__init__(parent)
        self._keybinds = KeybindSettings()

    def set_keybinds(self, keybinds: KeybindSettings) -> None:
        self._keybinds = keybinds.normalized()

    def keyPressEvent(self, event) -> None:
        key = int(event.key())
        bound_action = action_for_key(int(key), self._keybinds)
        if bound_action == ACTION_TOGGLE_INVENTORY or key == int(Qt.Key.Key_Escape):
            self.close_requested.emit()
            event.accept()
            return

        hotbar_index = hotbar_index_from_key(int(key), self._keybinds)
        if hotbar_index is not None:
            self.hotbar_key_pressed.emit(int(hotbar_index))
            event.accept()
            return

        super().keyPressEvent(event)


class InventoryOverlay(QWidget):
    closed = pyqtSignal()
    item_selected = pyqtSignal(str)
    hotbar_slot_selected = pyqtSignal(int)
    hotbar_slot_assigned = pyqtSignal(int, str)

    def __init__(self, *, parent: QWidget | None=None, resource_root: Path, registry: BlockRegistry) -> None:
        super().__init__(parent)

        self._reg = registry
        self._resource_root = Path(resource_root)
        self._photos = ItemPhotoProvider(resource_root=self._resource_root, registry=self._reg, icon_size=36)
        self._photos.pixmap_changed.connect(self._on_item_pixmap_changed)
        self._photos.set_active(False)

        self._hovered_item_id: str | None = None
        self._hotbar_slots: list[str] = list(normalize_hotbar_slots(None, size=HOTBAR_SIZE))
        self._selected_hotbar_index: int = 0
        self._creative_mode: bool = False
        self._keybinds: KeybindSettings = KeybindSettings()

        self._slot_buttons: list[_InventoryItemButton] = []
        self._slot_entries: list[tuple[str, str, _InventoryItemButton]] = []
        self._hotbar_buttons: list[_HotbarSlotButton] = []

        self.setVisible(False)
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.setObjectName("inventoryRoot")

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addStretch(1)

        panel = QFrame(self)
        panel.setObjectName("panel")
        panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        panel.setMinimumWidth(740)
        panel.setMinimumHeight(520)

        pv = QVBoxLayout(panel)
        pv.setContentsMargins(18, 16, 18, 16)
        pv.setSpacing(12)

        title_row = QHBoxLayout()
        self._title_label = QLabel("INVENTORY", panel)
        self._title_label.setObjectName("title")
        title_row.addWidget(self._title_label)

        title_row.addStretch(1)

        btn_close = QPushButton("Close (E or ESC)", panel)
        btn_close.setObjectName("closeBtn")
        btn_close.clicked.connect(self._close)
        title_row.addWidget(btn_close)
        pv.addLayout(title_row)

        self._subtitle_label = QLabel("Click assigns the hovered item to the currently selected hotbar slot. Drag items onto any hotbar slot, or hover an item and press 1-9.", panel)
        self._subtitle_label.setObjectName("subtitle")
        self._subtitle_label.setWordWrap(True)
        pv.addWidget(self._subtitle_label)

        self._search_box = _InventorySearchBox(panel)
        self._search_box.setPlaceholderText("Search items by name or id")
        self._search_box.textChanged.connect(self._apply_filter)
        self._search_box.close_requested.connect(self._close)
        self._search_box.hotbar_key_pressed.connect(self._handle_hotbar_key_request)
        pv.addWidget(self._search_box)

        self._catalog_scroll = QScrollArea(panel)
        self._catalog_scroll.setWidgetResizable(True)
        self._catalog_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        scroll_host = QWidget(self._catalog_scroll)
        self._grid_layout = QGridLayout(scroll_host)
        self._grid_layout.setContentsMargins(0, 0, 0, 0)
        self._grid_layout.setHorizontalSpacing(6)
        self._grid_layout.setVerticalSpacing(6)

        self._catalog_scroll.setWidget(scroll_host)
        pv.addWidget(self._catalog_scroll, stretch=1)

        hotbar = QWidget(panel)
        hl = QGridLayout(hotbar)
        hl.setContentsMargins(0, 0, 0, 0)
        hl.setHorizontalSpacing(6)
        hl.setVerticalSpacing(0)

        for i in range(HOTBAR_SIZE):
            button = _HotbarSlotButton(i, hotbar)
            button.slot_selected.connect(self._on_hotbar_slot_selected)
            button.item_dropped.connect(self._on_hotbar_slot_dropped)
            self._hotbar_buttons.append(button)
            hl.addWidget(button, 0, i)

        pv.addWidget(hotbar, alignment=Qt.AlignmentFlag.AlignHCenter)

        root.addWidget(panel, alignment=Qt.AlignmentFlag.AlignHCenter)
        root.addStretch(1)

        self._rebuild_grid()
        self.set_creative_mode(False)
        self.sync_hotbar(slots=self._hotbar_slots, selected_index=self._selected_hotbar_index)

    def setVisible(self, visible: bool) -> None:
        super().setVisible(bool(visible))
        self._photos.set_active(bool(visible) and bool(self._creative_mode))
        if bool(visible) and bool(self._creative_mode):
            self._search_box.setFocus(Qt.FocusReason.PopupFocusReason)
            self._search_box.selectAll()

    def set_keybinds(self, keybinds: KeybindSettings) -> None:
        self._keybinds = keybinds.normalized()
        self._search_box.set_keybinds(self._keybinds)

    def set_animations_enabled(self, enabled: bool) -> None:
        self._photos.set_animations_enabled(bool(enabled))

    def set_creative_mode(self, on: bool) -> None:
        self._creative_mode = bool(on)
        self._photos.set_active(bool(self.isVisible()) and bool(self._creative_mode))

        if bool(self._creative_mode):
            self._title_label.setText("CREATIVE INVENTORY")
            self._subtitle_label.setText("Click assigns the hovered item to the currently selected hotbar slot. Drag items onto any hotbar slot, or hover an item and press 1-9.")
            self._search_box.setVisible(True)
            self._catalog_scroll.setVisible(True)
            self._apply_filter()
            return

        self._hovered_item_id = None
        self._title_label.setText("SURVIVAL INVENTORY")
        self._subtitle_label.setText("Creative item selection is unavailable in Survival Mode.")
        self._search_box.clear()
        self._search_box.setVisible(False)
        self._catalog_scroll.setVisible(False)

    def _rebuild_grid(self) -> None:
        self._slot_buttons.clear()
        self._slot_entries.clear()

        for block_def in self._reg.all_blocks():
            item_id = str(block_def.block_id)
            display_name = str(block_def.display_name)
            button = _InventoryItemButton(item_id, display_name, self)
            button.activated.connect(self._on_item_activated)
            button.hovered_item.connect(self._on_item_hovered)
            button.hover_left.connect(self._on_item_hover_left)
            button.set_icon_pixmap(self._photos.pixmap_for_item(item_id))
            self._slot_buttons.append(button)
            self._slot_entries.append((str(item_id), f"{str(display_name).casefold()} {str(item_id).casefold()}", button))

        for descriptor in iter_catalog_special_items():
            item_id = str(descriptor.item_id)
            display_name = str(descriptor.display_name)
            button = _InventoryItemButton(item_id, display_name, self)
            button.activated.connect(self._on_item_activated)
            button.hovered_item.connect(self._on_item_hovered)
            button.hover_left.connect(self._on_item_hover_left)
            button.set_icon_pixmap(self._photos.pixmap_for_item(item_id))
            search_key = f"{str(display_name).casefold()} {str(item_id).casefold()} {str(descriptor.description).casefold()}"
            self._slot_buttons.append(button)
            self._slot_entries.append((str(item_id), search_key, button))

        self._apply_filter()

    def _apply_filter(self) -> None:
        while self._grid_layout.count() > 0:
            item = self._grid_layout.takeAt(0)
            widget = item.widget()
            if widget is not None:
                widget.setVisible(False)

        if not bool(self._creative_mode):
            return

        query_text = str(self._search_box.text() or "").strip().casefold()
        tokens = tuple(token for token in query_text.split() if token)
        matching_entries = [entry for entry in self._slot_entries if all(token in entry[1] for token in tokens)]

        cols = 12
        for index, (_item_id, _search_key, button) in enumerate(matching_entries):
            row = int(index // cols)
            col = int(index % cols)
            self._grid_layout.addWidget(button, row, col)
            button.setVisible(True)

        visible_ids = {item_id for item_id, _search_key, _button in matching_entries}
        if self._hovered_item_id is not None and str(self._hovered_item_id) not in visible_ids:
            self._hovered_item_id = None

    def _sync_hotbar_buttons(self) -> None:
        for i, button in enumerate(self._hotbar_buttons):
            item_id = str(self._hotbar_slots[i]).strip()
            pixmap = self._photos.pixmap_for_item(item_id) if item_id else None
            button.set_slot_state(item_id=item_id, selected=(int(i) == int(self._selected_hotbar_index)), tooltip=hotbar_slot_tooltip(self._reg, slot_index=i, item_id=item_id), pixmap=pixmap)

    def sync_hotbar(self, *, slots: tuple[str, ...] | list[str], selected_index: int) -> None:
        norm = normalize_hotbar_slots(slots, size=HOTBAR_SIZE)
        idx = normalize_hotbar_index(selected_index, size=HOTBAR_SIZE)

        self._hotbar_slots = list(norm)
        self._selected_hotbar_index = int(idx)
        self._sync_hotbar_buttons()

    def _on_item_hovered(self, item_id: str) -> None:
        self._hovered_item_id = str(item_id).strip()

    def _on_item_hover_left(self) -> None:
        self._hovered_item_id = None

    def _on_item_activated(self, item_id: str) -> None:
        if not bool(self._creative_mode):
            return
        self.item_selected.emit(str(item_id))
        self._close()

    def _on_hotbar_slot_selected(self, slot_index: int) -> None:
        self.hotbar_slot_selected.emit(int(slot_index))

    def _on_hotbar_slot_dropped(self, slot_index: int, item_id: str) -> None:
        self.hotbar_slot_assigned.emit(int(slot_index), str(item_id))

    def _close(self) -> None:
        self._hovered_item_id = None
        self.setVisible(False)
        self.closed.emit()

    def _handle_hotbar_key_request(self, slot_index: int) -> None:
        self.hotbar_slot_selected.emit(int(slot_index))
        if bool(self._creative_mode) and self._hovered_item_id is not None:
            self.hotbar_slot_assigned.emit(int(slot_index), str(self._hovered_item_id))

    def _on_item_pixmap_changed(self, item_id: str) -> None:
        normalized = str(item_id).strip()
        if not normalized:
            return
        for button in self._slot_buttons:
            if button.item_id() == normalized:
                button.set_icon_pixmap(self._photos.pixmap_for_item(normalized))
        self._sync_hotbar_buttons()

    def keyPressEvent(self, e) -> None:
        key = int(e.key())
        bound_action = action_for_key(int(key), self._keybinds)

        if bound_action == ACTION_TOGGLE_INVENTORY or key == int(Qt.Key.Key_Escape):
            self._close()
            return

        idx = hotbar_index_from_key(key, self._keybinds)
        if idx is not None:
            self.hotbar_slot_selected.emit(int(idx))
            if bool(self._creative_mode) and self._hovered_item_id is not None:
                self.hotbar_slot_assigned.emit(int(idx), str(self._hovered_item_id))
            return

        super().keyPressEvent(e)
