# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QButtonGroup, QFrame, QHBoxLayout, QLabel, QLineEdit, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.persistence.schema.world_library import WORLD_GAME_MODE_CREATIVE, WORLD_GAME_MODE_SURVIVAL, normalize_world_name
from ludoxel.presentation.interface.common.screen_title_bar import ScreenTitleBar


class WorldCreatePage(QWidget):
  back_requested = pyqtSignal()
  create_requested = pyqtSignal(str, str)

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("worldCreatePage")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)

    self._title_bar = ScreenTitleBar("Create New World", parent=self)
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
    panel.setMinimumWidth(440)

    layout = QVBoxLayout(panel)
    layout.setContentsMargins(24, 22, 24, 22)
    layout.setSpacing(12)

    name_label = QLabel("World name", panel)
    name_label.setObjectName("worldEditorLabel")
    layout.addWidget(name_label)

    self._name_input = QLineEdit(panel)
    self._name_input.setObjectName("worldEditorInput")
    self._name_input.setPlaceholderText("My World")
    self._name_input.textChanged.connect(self._update_create_enabled)
    self._name_input.returnPressed.connect(self._on_create)
    layout.addWidget(self._name_input)

    mode_label = QLabel("Game mode", panel)
    mode_label.setObjectName("worldEditorLabel")
    layout.addWidget(mode_label)

    mode_row = QHBoxLayout()
    mode_row.setContentsMargins(0, 0, 0, 0)
    mode_row.setSpacing(8)
    self._survival_button = QPushButton("Survival", panel)
    self._survival_button.setObjectName("modeToggle")
    self._survival_button.setCheckable(True)
    self._survival_button.setChecked(True)
    self._survival_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._creative_button = QPushButton("Creative", panel)
    self._creative_button.setObjectName("modeToggle")
    self._creative_button.setCheckable(True)
    self._creative_button.setCursor(Qt.CursorShape.PointingHandCursor)
    mode_group = QButtonGroup(panel)
    mode_group.setExclusive(True)
    mode_group.addButton(self._survival_button)
    mode_group.addButton(self._creative_button)
    self._mode_group = mode_group
    mode_row.addWidget(self._survival_button)
    mode_row.addWidget(self._creative_button)
    layout.addLayout(mode_row)

    self._hint_label = QLabel("Enter a world name to create a world.", panel)
    self._hint_label.setObjectName("worldEditorHint")
    self._hint_label.setWordWrap(True)
    layout.addWidget(self._hint_label)

    button_row = QHBoxLayout()
    button_row.setContentsMargins(0, 0, 0, 0)
    button_row.setSpacing(8)
    button_row.addStretch(1)
    self._create_button = QPushButton("Create", panel)
    self._create_button.setObjectName("menuBtn")
    self._create_button.setProperty("buttonStyle", "prominent")
    self._create_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._create_button.clicked.connect(self._on_create)
    button_row.addWidget(self._create_button)
    layout.addLayout(button_row)

    self._update_create_enabled()
    return panel

  def reset_form(self) -> None:
    self._name_input.clear()
    self._survival_button.setChecked(True)
    self._creative_button.setChecked(False)
    self._update_create_enabled()
    self._name_input.setFocus(Qt.FocusReason.OtherFocusReason)

  def _selected_game_mode(self) -> str:
    return WORLD_GAME_MODE_CREATIVE if self._creative_button.isChecked() else WORLD_GAME_MODE_SURVIVAL

  def _has_name(self) -> bool:
    return bool(str(self._name_input.text()).strip())

  def _update_create_enabled(self) -> None:
    self._create_button.setEnabled(self._has_name())

  def _on_create(self) -> None:
    if not self._has_name():
      return
    self.create_requested.emit(normalize_world_name(self._name_input.text()), self._selected_game_mode())


__all__ = ["WorldCreatePage"]
