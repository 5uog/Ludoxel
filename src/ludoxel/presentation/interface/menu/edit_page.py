# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QLineEdit, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.persistence.schema.world_library import normalize_world_name
from ludoxel.presentation.interface.common.screen_title_bar import ScreenTitleBar
from ludoxel.presentation.interface.menu.formatting import game_mode_label


class WorldEditPage(QWidget):
  back_requested = pyqtSignal()
  rename_requested = pyqtSignal(str, str)
  export_requested = pyqtSignal(str)
  delete_requested = pyqtSignal(str)

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._world_id = ""
    self._current_name = ""
    self.setObjectName("worldEditorPage")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)

    self._title_bar = ScreenTitleBar("Edit World", parent=self)
    self._title_bar.back_requested.connect(self.back_requested.emit)
    root.addWidget(self._title_bar)

    body = QVBoxLayout()
    body.setContentsMargins(0, 0, 0, 0)
    body.setSpacing(0)
    body.addStretch(2)
    body.addWidget(self._build_form_panel(), alignment=Qt.AlignmentFlag.AlignHCenter)
    body.addStretch(3)
    root.addLayout(body, stretch=1)

  def _build_form_panel(self) -> QWidget:
    panel = QFrame(self)
    panel.setObjectName("worldEditorFormPanel")
    panel.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
    panel.setMinimumWidth(460)

    layout = QVBoxLayout(panel)
    layout.setContentsMargins(24, 22, 24, 22)
    layout.setSpacing(12)

    self._mode_label = QLabel("Survival world", panel)
    self._mode_label.setObjectName("worldEditorHint")
    layout.addWidget(self._mode_label)

    name_label = QLabel("World name", panel)
    name_label.setObjectName("worldEditorLabel")
    layout.addWidget(name_label)

    rename_row = QHBoxLayout()
    rename_row.setContentsMargins(0, 0, 0, 0)
    rename_row.setSpacing(8)
    self._name_input = QLineEdit(panel)
    self._name_input.setObjectName("worldEditorInput")
    self._name_input.textChanged.connect(self._update_rename_enabled)
    self._name_input.returnPressed.connect(self._on_rename)
    rename_row.addWidget(self._name_input, stretch=1)
    self._rename_button = QPushButton("Rename World", panel)
    self._rename_button.setObjectName("menuBtn")
    self._rename_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._rename_button.clicked.connect(self._on_rename)
    rename_row.addWidget(self._rename_button)
    layout.addLayout(rename_row)

    self._export_button = QPushButton("Export (.ldxworld)", panel)
    self._export_button.setObjectName("menuBtn")
    self._export_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._export_button.clicked.connect(lambda: self.export_requested.emit(self._world_id))
    layout.addWidget(self._export_button)

    self._delete_button = QPushButton("Delete World", panel)
    self._delete_button.setObjectName("menuBtn")
    self._delete_button.setProperty("buttonStyle", "danger")
    self._delete_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._delete_button.clicked.connect(self._show_delete_confirm)
    layout.addWidget(self._delete_button)

    self._confirm_panel = QFrame(panel)
    self._confirm_panel.setObjectName("worldDeleteConfirm")
    self._confirm_panel.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    confirm_layout = QVBoxLayout(self._confirm_panel)
    confirm_layout.setContentsMargins(14, 12, 14, 12)
    confirm_layout.setSpacing(10)
    self._confirm_label = QLabel("Delete this world permanently? This cannot be undone.", self._confirm_panel)
    self._confirm_label.setObjectName("worldDeleteConfirmLabel")
    self._confirm_label.setWordWrap(True)
    confirm_layout.addWidget(self._confirm_label)
    confirm_buttons = QHBoxLayout()
    confirm_buttons.setContentsMargins(0, 0, 0, 0)
    confirm_buttons.setSpacing(8)
    confirm_buttons.addStretch(1)
    cancel_delete = QPushButton("Cancel", self._confirm_panel)
    cancel_delete.setObjectName("menuBtn")
    cancel_delete.setCursor(Qt.CursorShape.PointingHandCursor)
    cancel_delete.clicked.connect(self._hide_delete_confirm)
    confirm_buttons.addWidget(cancel_delete)
    confirm_delete = QPushButton("Delete", self._confirm_panel)
    confirm_delete.setObjectName("menuBtn")
    confirm_delete.setProperty("buttonStyle", "danger")
    confirm_delete.setCursor(Qt.CursorShape.PointingHandCursor)
    confirm_delete.clicked.connect(lambda: self.delete_requested.emit(self._world_id))
    confirm_buttons.addWidget(confirm_delete)
    confirm_layout.addLayout(confirm_buttons)
    self._confirm_panel.setVisible(False)
    layout.addWidget(self._confirm_panel)

    return panel

  def configure(self, *, world_id: str, name: str, game_mode: str) -> None:
    self._world_id = str(world_id)
    self._current_name = normalize_world_name(name)
    self._title_bar.set_title(f"Edit {self._current_name}")
    self._mode_label.setText(f"{game_mode_label(game_mode)} world")
    self._name_input.setText(self._current_name)
    self._hide_delete_confirm()
    self._update_rename_enabled()

  def _has_name(self) -> bool:
    return bool(str(self._name_input.text()).strip())

  def _update_rename_enabled(self) -> None:
    self._rename_button.setEnabled(self._has_name())

  def _on_rename(self) -> None:
    if not self._has_name():
      return
    self.rename_requested.emit(self._world_id, normalize_world_name(self._name_input.text()))

  def _show_delete_confirm(self) -> None:
    self._confirm_panel.setVisible(True)

  def _hide_delete_confirm(self) -> None:
    self._confirm_panel.setVisible(False)


__all__ = ["WorldEditPage"]
