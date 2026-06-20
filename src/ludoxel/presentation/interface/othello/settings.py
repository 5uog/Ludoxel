# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QComboBox, QDoubleSpinBox, QHBoxLayout, QLabel, QPushButton, QSpinBox, QVBoxLayout, QWidget

from ludoxel.presentation.interface.common.sidebar_dialog import SidebarDialogBase
from ludoxel.presentation.interface.settings.surface import add_page_header, add_setting_row, add_settings_card
from ludoxel.simulation.spaces.othello.game.state import (
  DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR,
  DEFAULT_OTHELLO_BOOK_LEAF_ERROR,
  DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR,
  OTHELLO_AI_HASH_LEVEL_MAX,
  OTHELLO_AI_HASH_LEVEL_MIN,
  OTHELLO_AI_SACRIFICE_LEVEL_MAX,
  OTHELLO_AI_SACRIFICE_LEVEL_MIN,
  OTHELLO_AI_THREAD_MAX,
  OTHELLO_AI_THREAD_MIN,
  OTHELLO_ANIMATION_FAST,
  OTHELLO_ANIMATION_OFF,
  OTHELLO_ANIMATION_SLOW,
  OTHELLO_BOOK_ERROR_MAX,
  OTHELLO_BOOK_ERROR_MIN,
  OTHELLO_BOOK_LEARNING_DEPTH_MAX,
  OTHELLO_BOOK_LEARNING_DEPTH_MIN,
  OTHELLO_DIFFICULTY_INSANE,
  OTHELLO_DIFFICULTY_INSANE_PLUS,
  OTHELLO_DIFFICULTY_MEDIUM,
  OTHELLO_DIFFICULTY_STRONG,
  OTHELLO_DIFFICULTY_WEAK,
  OTHELLO_TIME_CONTROL_OFF,
  OTHELLO_TIME_CONTROL_PER_MOVE_5S,
  OTHELLO_TIME_CONTROL_PER_MOVE_10S,
  OTHELLO_TIME_CONTROL_PER_MOVE_30S,
  OTHELLO_TIME_CONTROL_PER_SIDE_1M,
  OTHELLO_TIME_CONTROL_PER_SIDE_3M,
  OTHELLO_TIME_CONTROL_PER_SIDE_5M,
  OTHELLO_TIME_CONTROL_PER_SIDE_10M,
  OTHELLO_TIME_CONTROL_PER_SIDE_20M,
  SIDE_BLACK,
  SIDE_WHITE,
  OthelloSettings,
)


class OthelloSettingsOverlay(SidebarDialogBase):
  back_requested = pyqtSignal()
  settings_applied = pyqtSignal(object)
  book_learning_requested = pyqtSignal(object)
  book_learning_cancel_requested = pyqtSignal()
  book_import_requested = pyqtSignal()
  book_export_requested = pyqtSignal()

  def __init__(self, parent: QWidget | None = None, *, resource_root: Path | None = None, as_window: bool = False) -> None:
    super().__init__(
      parent,
      as_window=as_window,
      root_object_name="othelloSettingsRoot",
      window_title="Othello Settings",
      window_size=(920, 780),
      minimum_window_size=(800, 720),
      panel_minimum_size=(760, 640),
      sidebar_object_name="othelloSettingsSidebar",
      content_object_name="othelloSettingsContent",
      stack_object_name="othelloSettingsStack",
    )
    self._syncing_values: bool = False
    self._resource_root = None if resource_root is None else Path(resource_root)

    self._tab_match = self._make_tab_button("Match", 0, self._set_page)
    self._tab_ai = self._make_tab_button("AI", 1, self._set_page)
    self._tab_book = self._make_tab_button("Book", 2, self._set_page)
    self._tab_learning = self._make_tab_button("Learning", 3, self._set_page)
    self._sidebar_layout.addWidget(self._tab_match)
    self._sidebar_layout.addWidget(self._tab_ai)
    self._sidebar_layout.addWidget(self._tab_book)
    self._sidebar_layout.addWidget(self._tab_learning)
    self._sidebar_layout.addStretch(1)
    self._close_button: QPushButton | None = None
    if not bool(as_window):
      self._close_button = self._make_sidebar_action_button("Close", self.back_requested.emit)
      self._sidebar_layout.addWidget(self._close_button)

    self._build_match_page()
    self._build_ai_page()
    self._build_book_page()
    self._build_learning_page()
    self._connect_setting_fields()
    self.sync_values(OthelloSettings())
    self.set_book_summary_text("")
    self._set_page(0)

  def _build_match_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Match", subtitle="Opponent strength, player order, disc animation, and clock behavior.")
    _card, body, body_layout = add_settings_card(layout, host, title="Match", description="Changes are applied immediately to the persisted Othello settings.")

    self._difficulty = self._add_combo(
      body_layout,
      body,
      "AI difficulty",
      (
        (OTHELLO_DIFFICULTY_WEAK, "Weak"),
        (OTHELLO_DIFFICULTY_MEDIUM, "Medium"),
        (OTHELLO_DIFFICULTY_STRONG, "Strong"),
        (OTHELLO_DIFFICULTY_INSANE, "Insane"),
        (OTHELLO_DIFFICULTY_INSANE_PLUS, "Insane+"),
      ),
    )
    self._time_control = self._add_combo(
      body_layout,
      body,
      "Time control",
      (
        (OTHELLO_TIME_CONTROL_OFF, "Timer off"),
        (OTHELLO_TIME_CONTROL_PER_MOVE_5S, "1 move 5 seconds"),
        (OTHELLO_TIME_CONTROL_PER_MOVE_10S, "1 move 10 seconds"),
        (OTHELLO_TIME_CONTROL_PER_MOVE_30S, "1 move 30 seconds"),
        (OTHELLO_TIME_CONTROL_PER_SIDE_1M, "1 minute per side"),
        (OTHELLO_TIME_CONTROL_PER_SIDE_3M, "3 minutes per side"),
        (OTHELLO_TIME_CONTROL_PER_SIDE_5M, "5 minutes per side"),
        (OTHELLO_TIME_CONTROL_PER_SIDE_10M, "10 minutes per side"),
        (OTHELLO_TIME_CONTROL_PER_SIDE_20M, "20 minutes per side"),
      ),
    )
    self._animation_mode = self._add_combo(
      body_layout, body, "Disc animation", ((OTHELLO_ANIMATION_OFF, "Animation off"), (OTHELLO_ANIMATION_FAST, "Ripple fast"), (OTHELLO_ANIMATION_SLOW, "Ripple slow"))
    )
    self._player_side = self._add_combo(body_layout, body, "Player order", ((SIDE_BLACK, "Player moves first"), (SIDE_WHITE, "Player moves second")))
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_ai_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="AI", subtitle="Worker, hash, and sacrifice parameters used by the Othello engine.")
    _card, body, body_layout = add_settings_card(layout, host, title="Engine", description="These values preserve the existing engine and persistence contracts.")
    self._thread_count = self._add_spin(body_layout, body, "Worker count", minimum=int(OTHELLO_AI_THREAD_MIN), maximum=int(OTHELLO_AI_THREAD_MAX))
    self._hash_level = self._add_spin(body_layout, body, "Hash level", minimum=int(OTHELLO_AI_HASH_LEVEL_MIN), maximum=int(OTHELLO_AI_HASH_LEVEL_MAX))
    self._sacrifice_level = self._add_spin(body_layout, body, "Sacrifice level", minimum=int(OTHELLO_AI_SACRIFICE_LEVEL_MIN), maximum=int(OTHELLO_AI_SACRIFICE_LEVEL_MAX))
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_book_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Book", subtitle="Inspect, import, or export the opening-book storage managed by Ludoxel.")
    _card, body, body_layout = add_settings_card(layout, host, title="Opening Book", description="Import and export are explicit repository-independent user actions.")
    self._book_summary = QLabel("", host)
    self._book_summary.setObjectName("subtitle")
    self._book_summary.setWordWrap(True)
    add_setting_row(body_layout, body, label="Book summary", description="Current built-in and user opening-book state.", control=self._book_summary)

    io_row = QHBoxLayout()
    self._btn_import_book = QPushButton("Import Book", host)
    self._btn_import_book.setObjectName("secondaryBtn")
    self._btn_import_book.clicked.connect(self.book_import_requested.emit)
    io_row.addWidget(self._btn_import_book)

    self._btn_export_book = QPushButton("Export Book", host)
    self._btn_export_book.setObjectName("secondaryBtn")
    self._btn_export_book.clicked.connect(self.book_export_requested.emit)
    io_row.addWidget(self._btn_export_book)
    io_row.addStretch(1)
    body_layout.addLayout(io_row)
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_learning_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Learning", subtitle="Opening-book learning depth, error limits, progress, and cancellation.")
    _card, body, body_layout = add_settings_card(layout, host, title="Learning Parameters", description="Learning uses the current Othello settings without changing the book schema.")
    self._book_learning_depth = self._add_spin(body_layout, body, "Book depth", minimum=int(OTHELLO_BOOK_LEARNING_DEPTH_MIN), maximum=int(OTHELLO_BOOK_LEARNING_DEPTH_MAX))
    self._book_per_move_error = self._add_double_spin(
      body_layout, body, "Per-move error", minimum=float(OTHELLO_BOOK_ERROR_MIN), maximum=float(OTHELLO_BOOK_ERROR_MAX), default=float(DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR)
    )
    self._book_cumulative_error = self._add_double_spin(
      body_layout, body, "Cumulative error", minimum=float(OTHELLO_BOOK_ERROR_MIN), maximum=float(OTHELLO_BOOK_ERROR_MAX), default=float(DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR)
    )
    self._book_leaf_error = self._add_double_spin(
      body_layout, body, "Leaf error", minimum=float(OTHELLO_BOOK_ERROR_MIN), maximum=float(OTHELLO_BOOK_ERROR_MAX), default=float(DEFAULT_OTHELLO_BOOK_LEAF_ERROR)
    )
    self._learning_status = QLabel("", host)
    self._learning_status.setObjectName("subtitle")
    self._learning_status.setWordWrap(True)
    add_setting_row(body_layout, body, label="Learning status", description="Current worker progress or completion state.", control=self._learning_status)
    button_row = QHBoxLayout()
    self._btn_learn_book = QPushButton("Learn Opening Book", host)
    self._btn_learn_book.setObjectName("primaryBtn")
    self._btn_learn_book.clicked.connect(self._request_book_learning)
    button_row.addWidget(self._btn_learn_book)

    self._btn_cancel_learning = QPushButton("Cancel Learning", host)
    self._btn_cancel_learning.setObjectName("dangerBtn")
    self._btn_cancel_learning.clicked.connect(self.book_learning_cancel_requested.emit)
    self._btn_cancel_learning.setEnabled(False)
    button_row.addWidget(self._btn_cancel_learning)
    button_row.addStretch(1)
    body_layout.addLayout(button_row)

    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _connect_setting_fields(self) -> None:
    for combo in (self._difficulty, self._time_control, self._animation_mode, self._player_side):
      combo.currentIndexChanged.connect(self._on_settings_field_changed)
    for spin in (self._sacrifice_level, self._thread_count, self._hash_level, self._book_learning_depth):
      spin.valueChanged.connect(self._on_settings_field_changed)
    for spin in (self._book_per_move_error, self._book_cumulative_error, self._book_leaf_error):
      spin.valueChanged.connect(self._on_settings_field_changed)

  @staticmethod
  def _add_combo(layout: QVBoxLayout, parent: QWidget, label_text: str, entries: tuple[tuple[object, str], ...]) -> QComboBox:
    combo = QComboBox(parent)
    for value, text in entries:
      combo.addItem(str(text), userData=value)
    add_setting_row(layout, parent, label=str(label_text), description="", control=combo)
    return combo

  @staticmethod
  def _add_spin(layout: QVBoxLayout, parent: QWidget, label_text: str, *, minimum: int, maximum: int) -> QSpinBox:
    spin = QSpinBox(parent)
    spin.setRange(int(minimum), int(maximum))
    add_setting_row(layout, parent, label=str(label_text), description="", control=spin)
    return spin

  @staticmethod
  def _add_double_spin(layout: QVBoxLayout, parent: QWidget, label_text: str, *, minimum: float, maximum: float, default: float) -> QDoubleSpinBox:
    spin = QDoubleSpinBox(parent)
    spin.setRange(float(minimum), float(maximum))
    spin.setDecimals(1)
    spin.setSingleStep(1.0)
    spin.setValue(float(default))
    add_setting_row(layout, parent, label=str(label_text), description="", control=spin)
    return spin

  def _set_page(self, index: int) -> None:
    selected = int(max(0, min(3, int(index))))
    self._set_stack_page(index=selected, max_index=3, tab_buttons=(self._tab_match, self._tab_ai, self._tab_book, self._tab_learning))

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
    return OthelloSettings(
      difficulty=str(self._difficulty.currentData()),
      time_control=str(self._time_control.currentData()),
      animation_mode=str(self._animation_mode.currentData()),
      player_side=int(self._player_side.currentData()),
      sacrifice_level=int(self._sacrifice_level.value()),
      thread_count=int(self._thread_count.value()),
      hash_level=int(self._hash_level.value()),
      book_learning_depth=int(self._book_learning_depth.value()),
      book_per_move_error=float(self._book_per_move_error.value()),
      book_cumulative_error=float(self._book_cumulative_error.value()),
      book_leaf_error=float(self._book_leaf_error.value()),
    ).normalized()

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
    if self._accept_detached_close_event(event):
      self.back_requested.emit()
      return
    super().closeEvent(event)
