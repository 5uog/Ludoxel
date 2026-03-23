# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from PyQt6.QtCore import QTimer, Qt, pyqtSignal
from PyQt6.QtGui import QColor, QPalette
from PyQt6.QtWidgets import QComboBox, QDialog, QDoubleSpinBox, QFrame, QHBoxLayout, QLabel, QPushButton, QScrollArea, QSizePolicy, QSpinBox, QStackedWidget, QVBoxLayout, QWidget

from ..domain.game.types import DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR, DEFAULT_OTHELLO_BOOK_LEAF_ERROR, DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR, OTHELLO_AI_HASH_LEVEL_MAX, OTHELLO_AI_HASH_LEVEL_MIN, OTHELLO_AI_SACRIFICE_LEVEL_MAX, OTHELLO_AI_SACRIFICE_LEVEL_MIN, OTHELLO_AI_THREAD_MAX, OTHELLO_AI_THREAD_MIN, OTHELLO_ANIMATION_FAST, OTHELLO_ANIMATION_OFF, OTHELLO_ANIMATION_SLOW, OTHELLO_BOOK_LEARNING_DEPTH_MAX, OTHELLO_BOOK_LEARNING_DEPTH_MIN, OTHELLO_DIFFICULTY_INSANE, OTHELLO_DIFFICULTY_INSANE_PLUS, OTHELLO_DIFFICULTY_MEDIUM, OTHELLO_DIFFICULTY_STRONG, OTHELLO_DIFFICULTY_WEAK, OTHELLO_TIME_CONTROL_OFF, OTHELLO_TIME_CONTROL_PER_MOVE_10S, OTHELLO_TIME_CONTROL_PER_MOVE_30S, OTHELLO_TIME_CONTROL_PER_MOVE_5S, OTHELLO_TIME_CONTROL_PER_SIDE_10M, OTHELLO_TIME_CONTROL_PER_SIDE_1M, OTHELLO_TIME_CONTROL_PER_SIDE_20M, OTHELLO_TIME_CONTROL_PER_SIDE_3M, OTHELLO_TIME_CONTROL_PER_SIDE_5M, SIDE_BLACK, SIDE_WHITE, OthelloSettings


class OthelloSettingsOverlay(QDialog):
    back_requested = pyqtSignal()
    settings_applied = pyqtSignal(object)
    book_learning_requested = pyqtSignal(object)
    book_learning_cancel_requested = pyqtSignal()
    book_import_requested = pyqtSignal()
    book_export_requested = pyqtSignal()

    def __init__(self, parent: QWidget | None = None, *, as_window: bool = False) -> None:
        super().__init__(parent)

        self.setVisible(False)
        self._deferred_reveal_pending: bool = False
        self._syncing_values: bool = False
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.setObjectName("othelloSettingsRoot")
        self._as_window = bool(as_window)
        self.setProperty("detachedWindow", bool(self._as_window))
        if bool(self._as_window):
            self.setWindowFlag(Qt.WindowType.Dialog, True)
            self.setWindowFlag(Qt.WindowType.CustomizeWindowHint, True)
            self.setWindowFlag(Qt.WindowType.WindowTitleHint, True)
            self.setWindowFlag(Qt.WindowType.WindowCloseButtonHint, True)
            self.setWindowModality(Qt.WindowModality.ApplicationModal)
            self.setWindowTitle("Othello Settings")
            self.resize(920, 780)
            self.setMinimumSize(800, 720)
            self.setAutoFillBackground(True)
            self.setAttribute(Qt.WidgetAttribute.WA_OpaquePaintEvent, True)
            palette = self.palette()
            palette.setColor(QPalette.ColorRole.Window, QColor("#181818"))
            palette.setColor(QPalette.ColorRole.Base, QColor("#181818"))
            self.setPalette(palette)

        root = QVBoxLayout(self)
        if bool(self._as_window):
            root.setContentsMargins(0, 0, 0, 0)
        else:
            root.setContentsMargins(32, 28, 32, 28)
        root.setSpacing(0)
        if not bool(self._as_window):
            root.addStretch(1)

        panel = QFrame(self)
        panel.setObjectName("panel")
        panel.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        panel.setMinimumWidth(760)
        panel.setMinimumHeight(640)

        layout = QHBoxLayout(panel)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self._sidebar = QWidget(panel)
        self._sidebar.setObjectName("othelloSettingsSidebar")
        self._sidebar.setMinimumWidth(236)
        self._sidebar.setMaximumWidth(280)
        sidebar_layout = QVBoxLayout(self._sidebar)
        sidebar_layout.setContentsMargins(0, 12, 0, 12)
        sidebar_layout.setSpacing(0)
        self._tab_match = self._make_tab_button("Match", 0, self._sidebar)
        self._tab_book = self._make_tab_button("Opening Book", 1, self._sidebar)
        sidebar_layout.addWidget(self._tab_match)
        sidebar_layout.addWidget(self._tab_book)
        sidebar_layout.addStretch(1)

        self._content = QWidget(panel)
        self._content.setObjectName("othelloSettingsContent")
        content_layout = QVBoxLayout(self._content)
        content_layout.setContentsMargins(18, 18, 18, 18)
        content_layout.setSpacing(0)
        self._stack = QStackedWidget(self._content)
        self._stack.setObjectName("othelloSettingsStack")
        content_layout.addWidget(self._stack, stretch=1)

        layout.addWidget(self._sidebar, stretch=2)
        layout.addWidget(self._content, stretch=8)

        self._build_match_page()
        self._build_book_page()
        self._connect_setting_fields()
        self.sync_values(OthelloSettings())
        self.set_book_summary_text("")
        self._set_page(0)

        if bool(self._as_window):
            root.addWidget(panel, stretch=1)
        else:
            root.addWidget(panel, alignment=Qt.AlignmentFlag.AlignHCenter)
            root.addStretch(1)

    def _build_match_page(self) -> None:
        scroll, host, layout = self._make_scroll_page()

        self._difficulty = self._add_combo(layout, host, "AI difficulty",((OTHELLO_DIFFICULTY_WEAK, "Weak"),(OTHELLO_DIFFICULTY_MEDIUM, "Medium"),(OTHELLO_DIFFICULTY_STRONG, "Strong"),(OTHELLO_DIFFICULTY_INSANE, "Insane"),(OTHELLO_DIFFICULTY_INSANE_PLUS, "Insane+")))
        self._time_control = self._add_combo(layout, host, "Time control",((OTHELLO_TIME_CONTROL_OFF, "Timer off"),(OTHELLO_TIME_CONTROL_PER_MOVE_5S, "1 move 5 seconds"),(OTHELLO_TIME_CONTROL_PER_MOVE_10S, "1 move 10 seconds"),(OTHELLO_TIME_CONTROL_PER_MOVE_30S, "1 move 30 seconds"),(OTHELLO_TIME_CONTROL_PER_SIDE_1M, "1 minute per side"),(OTHELLO_TIME_CONTROL_PER_SIDE_3M, "3 minutes per side"),(OTHELLO_TIME_CONTROL_PER_SIDE_5M, "5 minutes per side"),(OTHELLO_TIME_CONTROL_PER_SIDE_10M, "10 minutes per side"),(OTHELLO_TIME_CONTROL_PER_SIDE_20M, "20 minutes per side")))
        self._animation_mode = self._add_combo(layout, host, "Disc animation",((OTHELLO_ANIMATION_OFF, "Animation off"),(OTHELLO_ANIMATION_FAST, "Ripple fast"),(OTHELLO_ANIMATION_SLOW, "Ripple slow")))
        self._player_side = self._add_combo(layout, host, "Player order",((SIDE_BLACK, "Player moves first"),(SIDE_WHITE, "Player moves second")))
        self._sacrifice_level = self._add_spin(layout, host, "Sacrifice level", minimum=int(OTHELLO_AI_SACRIFICE_LEVEL_MIN), maximum=int(OTHELLO_AI_SACRIFICE_LEVEL_MAX))
        self._thread_count = self._add_spin(layout, host, "Worker count", minimum=int(OTHELLO_AI_THREAD_MIN), maximum=int(OTHELLO_AI_THREAD_MAX))
        self._hash_level = self._add_spin(layout, host, "Hash level", minimum=int(OTHELLO_AI_HASH_LEVEL_MIN), maximum=int(OTHELLO_AI_HASH_LEVEL_MAX))
        layout.addStretch(1)
        self._stack.addWidget(scroll)

    def _build_book_page(self) -> None:
        scroll, host, layout = self._make_scroll_page()

        self._book_summary = QLabel("", host)
        self._book_summary.setObjectName("subtitle")
        self._book_summary.setWordWrap(True)
        layout.addWidget(self._book_summary)

        self._book_learning_depth = self._add_spin(layout, host, "Book depth", minimum=int(OTHELLO_BOOK_LEARNING_DEPTH_MIN), maximum=int(OTHELLO_BOOK_LEARNING_DEPTH_MAX))
        self._book_per_move_error = self._add_double_spin(layout, host, "Per-move error", minimum=0.0, maximum=100000.0, default=float(DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR))
        self._book_cumulative_error = self._add_double_spin(layout, host, "Cumulative error", minimum=0.0, maximum=100000.0, default=float(DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR))
        self._book_leaf_error = self._add_double_spin(layout, host, "Leaf error", minimum=0.0, maximum=100000.0, default=float(DEFAULT_OTHELLO_BOOK_LEAF_ERROR))

        self._learning_status = QLabel("", host)
        self._learning_status.setObjectName("subtitle")
        self._learning_status.setWordWrap(True)
        layout.addWidget(self._learning_status)

        io_row = QHBoxLayout()
        self._btn_import_book = QPushButton("Import Book", host)
        self._btn_import_book.setObjectName("menuBtn")
        self._btn_import_book.clicked.connect(self.book_import_requested.emit)
        io_row.addWidget(self._btn_import_book)

        self._btn_export_book = QPushButton("Export Book", host)
        self._btn_export_book.setObjectName("menuBtn")
        self._btn_export_book.clicked.connect(self.book_export_requested.emit)
        io_row.addWidget(self._btn_export_book)
        io_row.addStretch(1)
        layout.addLayout(io_row)

        button_row = QHBoxLayout()
        self._btn_learn_book = QPushButton("Learn Opening Book", host)
        self._btn_learn_book.setObjectName("menuBtn")
        self._btn_learn_book.clicked.connect(self._request_book_learning)
        button_row.addWidget(self._btn_learn_book)

        self._btn_cancel_learning = QPushButton("Cancel Learning", host)
        self._btn_cancel_learning.setObjectName("menuBtn")
        self._btn_cancel_learning.clicked.connect(self.book_learning_cancel_requested.emit)
        self._btn_cancel_learning.setEnabled(False)
        button_row.addWidget(self._btn_cancel_learning)
        button_row.addStretch(1)
        layout.addLayout(button_row)

        layout.addStretch(1)
        self._stack.addWidget(scroll)

    def _connect_setting_fields(self) -> None:
        for combo in (self._difficulty, self._time_control, self._animation_mode, self._player_side):
            combo.currentIndexChanged.connect(self._on_settings_field_changed)
        for spin in (self._sacrifice_level, self._thread_count, self._hash_level, self._book_learning_depth):
            spin.valueChanged.connect(self._on_settings_field_changed)
        for spin in (self._book_per_move_error, self._book_cumulative_error, self._book_leaf_error):
            spin.valueChanged.connect(self._on_settings_field_changed)

    def prepare_to_show(self) -> None:
        if not bool(self._as_window):
            return
        self._deferred_reveal_pending = True
        self.setWindowOpacity(0.0)
        self.winId()
        self.ensurePolished()
        layout = self.layout()
        if layout is not None:
            layout.activate()
        self.adjustSize()
        self.updateGeometry()

    def showEvent(self, event) -> None:
        if bool(self._as_window) and bool(self._deferred_reveal_pending):
            self.setWindowOpacity(0.0)
            QTimer.singleShot(0, self._finish_deferred_reveal)
        super().showEvent(event)

    def _finish_deferred_reveal(self) -> None:
        if not bool(self._deferred_reveal_pending):
            return
        self._deferred_reveal_pending = False
        if not self.isVisible():
            return
        self.setWindowOpacity(1.0)

    def _make_tab_button(self, text: str, index: int, parent: QWidget) -> QPushButton:
        button = QPushButton(text, parent)
        button.setObjectName("navBtn")
        button.setCheckable(True)
        button.setAutoExclusive(True)
        button.setAutoDefault(False)
        button.setDefault(False)
        button.setFlat(True)
        button.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        button.setFixedHeight(64)
        button.clicked.connect(lambda _checked=False, i=index: self._set_page(i))
        return button

    def _make_scroll_page(self) -> tuple[QScrollArea, QWidget, QVBoxLayout]:
        scroll = QScrollArea(self._stack)
        scroll.setObjectName("settingsScroll")
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        viewport = scroll.viewport()
        viewport.setObjectName("settingsViewport")
        viewport.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        viewport.setAutoFillBackground(True)

        host = QWidget(scroll)
        host.setObjectName("settingsPage")
        host.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        host.setAutoFillBackground(True)
        layout = QVBoxLayout(host)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.setSpacing(12)
        scroll.setWidget(host)
        return scroll, host, layout

    @staticmethod
    def _add_combo(layout: QVBoxLayout, parent: QWidget, label_text: str, entries: tuple[tuple[object, str], ...]) -> QComboBox:
        label = QLabel(str(label_text), parent)
        label.setObjectName("valueLabel")
        layout.addWidget(label)

        combo = QComboBox(parent)
        for value, text in entries:
            combo.addItem(str(text), userData=value)
        layout.addWidget(combo)
        return combo

    @staticmethod
    def _add_spin(layout: QVBoxLayout, parent: QWidget, label_text: str, *, minimum: int, maximum: int) -> QSpinBox:
        label = QLabel(str(label_text), parent)
        label.setObjectName("valueLabel")
        layout.addWidget(label)

        spin = QSpinBox(parent)
        spin.setRange(int(minimum), int(maximum))
        layout.addWidget(spin)
        return spin

    @staticmethod
    def _add_double_spin(layout: QVBoxLayout, parent: QWidget, label_text: str, *, minimum: float, maximum: float, default: float) -> QDoubleSpinBox:
        label = QLabel(str(label_text), parent)
        label.setObjectName("valueLabel")
        layout.addWidget(label)

        spin = QDoubleSpinBox(parent)
        spin.setRange(float(minimum), float(maximum))
        spin.setDecimals(1)
        spin.setSingleStep(1.0)
        spin.setValue(float(default))
        layout.addWidget(spin)
        return spin

    def _set_page(self, index: int) -> None:
        selected_index = int(max(0, min(1, int(index))))
        self._stack.setCurrentIndex(selected_index)
        current_page = self._stack.currentWidget()
        if isinstance(current_page, QScrollArea):
            current_page.verticalScrollBar().setValue(0)
            current_page.viewport().update()
            page_host = current_page.widget()
            if page_host is not None:
                page_host.update()
        self._stack.update()
        self._tab_match.setChecked(selected_index == 0)
        self._tab_book.setChecked(selected_index == 1)

    def sync_values(self, settings: OthelloSettings) -> None:
        normalized = settings.normalized()
        self._syncing_values = True
        try:
            self._set_combo_data(self._difficulty, normalized.difficulty)
            self._set_combo_data(self._time_control, normalized.time_control)
            self._set_combo_data(self._animation_mode, normalized.animation_mode)
            self._set_combo_data(self._player_side, normalized.player_side)
            self._set_spin_value(self._thread_count, int(normalized.thread_count))
            self._set_spin_value(self._hash_level, int(normalized.hash_level))
            self._set_spin_value(self._sacrifice_level, int(normalized.sacrifice_level))
            self._set_spin_value(self._book_learning_depth, int(normalized.book_learning_depth))
            self._set_double_spin_value(self._book_per_move_error, float(normalized.book_per_move_error))
            self._set_double_spin_value(self._book_cumulative_error, float(normalized.book_cumulative_error))
            self._set_double_spin_value(self._book_leaf_error, float(normalized.book_leaf_error))
        finally:
            self._syncing_values = False

    @staticmethod
    def _set_combo_data(combo: QComboBox, target_value: object) -> None:
        for index in range(combo.count()):
            if combo.itemData(index) == target_value:
                combo.blockSignals(True)
                combo.setCurrentIndex(index)
                combo.blockSignals(False)
                return

    @staticmethod
    def _set_spin_value(spin: QSpinBox, value: int) -> None:
        spin.blockSignals(True)
        spin.setValue(int(value))
        spin.blockSignals(False)

    @staticmethod
    def _set_double_spin_value(spin: QDoubleSpinBox, value: float) -> None:
        spin.blockSignals(True)
        spin.setValue(float(value))
        spin.blockSignals(False)

    def current_settings(self) -> OthelloSettings:
        return OthelloSettings(difficulty=str(self._difficulty.currentData()), time_control=str(self._time_control.currentData()), animation_mode=str(self._animation_mode.currentData()), player_side=int(self._player_side.currentData()), sacrifice_level=int(self._sacrifice_level.value()), thread_count=int(self._thread_count.value()), hash_level=int(self._hash_level.value()), book_learning_depth=int(self._book_learning_depth.value()), book_per_move_error=float(self._book_per_move_error.value()), book_cumulative_error=float(self._book_cumulative_error.value()), book_leaf_error=float(self._book_leaf_error.value())).normalized()

    def set_book_summary_text(self, text: str) -> None:
        self._book_summary.setText(str(text))

    def set_learning_running(self, running: bool, *, status_text: str = "") -> None:
        enabled = not bool(running)
        self._btn_learn_book.setEnabled(enabled)
        self._btn_import_book.setEnabled(enabled)
        self._btn_export_book.setEnabled(True)
        self._btn_learn_book.setText("Learning..." if bool(running) else "Learn Opening Book")
        self._btn_cancel_learning.setEnabled(bool(running))
        self._learning_status.setText(str(status_text))

    def _on_settings_field_changed(self, *_args) -> None:
        if bool(self._syncing_values):
            return
        self.settings_applied.emit(self.current_settings())

    def _request_book_learning(self) -> None:
        self.book_learning_requested.emit(self.current_settings())

    def keyPressEvent(self, e) -> None:
        if int(e.key()) == int(Qt.Key.Key_Escape):
            self.back_requested.emit()
            return
        super().keyPressEvent(e)

    def closeEvent(self, event) -> None:
        if bool(self._as_window):
            event.ignore()
            self.back_requested.emit()
            return
        super().closeEvent(event)
