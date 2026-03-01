# FILE: presentation/widgets/inventoryOverlay.py
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QPixmap, QImage, QIcon
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QFrame,
    QSizePolicy,
    QGridLayout,
)

from domain.blocks.blockRegistry import BlockRegistry, create_default_registry

class _SlotButton(QPushButton):
    def __init__(self, block_id: str | None, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._block_id = block_id
        self.setObjectName("slot")
        self.setCheckable(False)
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        s = 46
        self.setFixedSize(QSize(s, s))
        self.setIconSize(QSize(32, 32))
        self._set_selected(False)

    def block_id(self) -> str | None:
        return self._block_id

    def set_block_id(self, block_id: str | None) -> None:
        self._block_id = block_id

    def set_icon_pixmap(self, pm: QPixmap | None) -> None:
        if pm is None:
            self.setIcon(QIcon())
            return
        self.setIcon(QIcon(pm))

    def _set_selected(self, on: bool) -> None:
        self.setProperty("selected", bool(on))
        self.style().unpolish(self)
        self.style().polish(self)
        self.update()

class InventoryOverlay(QWidget):
    closed = pyqtSignal()
    block_selected = pyqtSignal(str)

    def __init__(self, parent: QWidget | None = None, registry: BlockRegistry | None = None) -> None:
        super().__init__(parent)

        self._reg = registry or create_default_registry()

        self._project_root = Path(__file__).resolve().parents[2]
        self._tex_dir = self._project_root / "assets" / "minecraft" / "textures" / "block"

        self._selected_block_id: str | None = None
        self._slot_buttons: list[_SlotButton] = []

        self.setVisible(False)
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.setObjectName("inventoryRoot")

        self.setStyleSheet(
            "QWidget#inventoryRoot { background: rgba(0,0,0,165); }"
            "QFrame#panel { background: rgba(32,34,37,242); border: 1px solid rgba(255,255,255,45); border-radius: 10px; }"
            "QLabel { color: white; font: 13px; }"
            "QLabel#title { font: 20px; font-weight: 700; }"
            "QLabel#subtitle { color: rgba(255,255,255,210); }"
            "QPushButton#closeBtn { color: white; background: rgba(70,70,70,215); border: 1px solid rgba(255,255,255,55); padding: 8px 10px; border-radius: 6px; }"
            "QPushButton#closeBtn:hover { background: rgba(90,90,90,235); }"
            "QPushButton#slot { background: rgba(15,15,15,235); border: 2px solid rgba(255,255,255,32); border-radius: 6px; }"
            "QPushButton#slot:hover { border: 2px solid rgba(255,255,255,85); }"
            "QPushButton#slot[selected=\"true\"] { border: 2px solid rgba(255,255,255,230); }"
        )

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addStretch(1)

        panel = QFrame(self)
        panel.setObjectName("panel")
        panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        panel.setMinimumWidth(640)

        pv = QVBoxLayout(panel)
        pv.setContentsMargins(18, 16, 18, 16)
        pv.setSpacing(12)

        title_row = QHBoxLayout()
        title = QLabel("INVENTORY", panel)
        title.setObjectName("title")
        title_row.addWidget(title)

        title_row.addStretch(1)

        btn_close = QPushButton("Close (E or ESC)", panel)
        btn_close.setObjectName("closeBtn")
        btn_close.clicked.connect(self._close)
        title_row.addWidget(btn_close)
        pv.addLayout(title_row)

        sub = QLabel("Click a slot to select a block for placement.", panel)
        sub.setObjectName("subtitle")
        pv.addWidget(sub)

        grid_frame = QFrame(panel)
        grid_frame.setObjectName("gridFrame")
        gv = QVBoxLayout(grid_frame)
        gv.setContentsMargins(0, 0, 0, 0)
        gv.setSpacing(8)

        self._grid = QWidget(grid_frame)
        gl = QGridLayout(self._grid)
        gl.setContentsMargins(0, 0, 0, 0)
        gl.setHorizontalSpacing(6)
        gl.setVerticalSpacing(6)

        blocks = self._reg.all_blocks()

        cols = 9
        rows = 3
        max_slots = cols * rows

        for i in range(max_slots):
            block_id = str(blocks[i].block_id) if i < len(blocks) else None
            btn = _SlotButton(block_id, self._grid)
            btn.clicked.connect(self._on_slot_clicked)
            self._slot_buttons.append(btn)

            r = i // cols
            c = i % cols
            gl.addWidget(btn, r, c)

        gv.addWidget(self._grid, alignment=Qt.AlignmentFlag.AlignHCenter)

        hotbar = QWidget(grid_frame)
        hl = QGridLayout(hotbar)
        hl.setContentsMargins(0, 0, 0, 0)
        hl.setHorizontalSpacing(6)
        hl.setVerticalSpacing(0)

        self._hotbar_slots: list[_SlotButton] = []
        for i in range(9):
            b = _SlotButton(None, hotbar)
            b.setEnabled(False)
            self._hotbar_slots.append(b)
            hl.addWidget(b, 0, i)

        gv.addWidget(hotbar, alignment=Qt.AlignmentFlag.AlignHCenter)

        pv.addWidget(grid_frame)

        root.addWidget(panel, alignment=Qt.AlignmentFlag.AlignHCenter)
        root.addStretch(1)

        self._reload_icons()

    def _reload_icons(self) -> None:
        for btn in self._slot_buttons:
            bid = btn.block_id()
            if bid is None:
                btn.set_icon_pixmap(None)
                continue

            b = self._reg.get(bid)
            if b is None:
                btn.set_icon_pixmap(None)
                continue

            tex_name = str(b.textures.pos_y) if hasattr(b, "textures") else "default"
            pm = self._load_icon_pixmap(tex_name)
            btn.set_icon_pixmap(pm)

        self._update_selection_visuals()

    def _load_icon_pixmap(self, tex_name: str) -> QPixmap | None:
        p = self._tex_dir / f"{str(tex_name)}.png"
        if not p.exists():
            return None

        img = QImage(str(p))
        if img.isNull():
            return None

        img = img.convertToFormat(QImage.Format.Format_RGBA8888)

        # Slot icons are scaled up for readability. FastTransformation approximates nearest scaling in Qt.
        target = 32
        img = img.scaled(target, target, Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation)

        return QPixmap.fromImage(img)

    def _set_selected_block(self, block_id: str | None) -> None:
        self._selected_block_id = str(block_id) if block_id is not None else None
        self._update_selection_visuals()

    def _update_selection_visuals(self) -> None:
        sel = self._selected_block_id

        for b in self._slot_buttons:
            b._set_selected(bool(sel is not None and b.block_id() == sel))

        for hb in self._hotbar_slots:
            hb.set_icon_pixmap(None)
            hb._set_selected(False)

        if sel is not None:
            b = self._reg.get(sel)
            tex_name = str(b.textures.pos_y) if b is not None else "default"
            pm = self._load_icon_pixmap(tex_name)
            self._hotbar_slots[0].set_icon_pixmap(pm)
            self._hotbar_slots[0]._set_selected(True)

    def _on_slot_clicked(self) -> None:
        btn = self.sender()
        if not isinstance(btn, _SlotButton):
            return

        bid = btn.block_id()
        if bid is None:
            return

        self._set_selected_block(bid)
        self.block_selected.emit(str(bid))
        self._close()

    def _close(self) -> None:
        self.setVisible(False)
        self.closed.emit()

    def keyPressEvent(self, e) -> None:
        k = int(e.key())
        if k == int(Qt.Key.Key_E) or k == int(Qt.Key.Key_Escape):
            self._close()
            return
        super().keyPressEvent(e)