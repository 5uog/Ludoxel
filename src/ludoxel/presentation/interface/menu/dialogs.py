# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QButtonGroup, QDialog, QFrame, QHBoxLayout, QLabel, QLineEdit, QPushButton, QVBoxLayout, QWidget

from ludoxel.application.persistence.schema.world_library import WORLD_GAME_MODE_CREATIVE, WORLD_GAME_MODE_SURVIVAL, normalize_world_name


def _normalized_names(existing_names: tuple[str, ...]) -> set[str]:
  return {str(name).strip().casefold() for name in existing_names if str(name).strip()}


class WorldCreateDialog(QDialog):
  def __init__(self, *, existing_names: tuple[str, ...], parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._existing = _normalized_names(existing_names)
    self.setObjectName("worldEditorDialog")
    self.setWindowTitle("Create New World")
    self.setModal(True)

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)
    panel = QFrame(self)
    panel.setObjectName("worldEditorPanel")
    panel.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    root.addWidget(panel)

    layout = QVBoxLayout(panel)
    layout.setContentsMargins(22, 20, 22, 20)
    layout.setSpacing(12)

    title = QLabel("Create New World", panel)
    title.setObjectName("worldEditorTitle")
    layout.addWidget(title)

    name_label = QLabel("World name", panel)
    name_label.setObjectName("worldEditorLabel")
    layout.addWidget(name_label)
    self._name_input = QLineEdit(panel)
    self._name_input.setObjectName("worldEditorInput")
    self._name_input.setPlaceholderText("My World")
    self._name_input.textChanged.connect(self._validate)
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
    self._creative_button = QPushButton("Creative", panel)
    self._creative_button.setObjectName("modeToggle")
    self._creative_button.setCheckable(True)
    mode_group = QButtonGroup(self)
    mode_group.setExclusive(True)
    mode_group.addButton(self._survival_button)
    mode_group.addButton(self._creative_button)
    mode_row.addWidget(self._survival_button)
    mode_row.addWidget(self._creative_button)
    layout.addLayout(mode_row)

    self._error_label = QLabel("", panel)
    self._error_label.setObjectName("worldEditorError")
    self._error_label.setVisible(False)
    layout.addWidget(self._error_label)

    button_row = QHBoxLayout()
    button_row.setContentsMargins(0, 0, 0, 0)
    button_row.setSpacing(8)
    button_row.addStretch(1)
    cancel = QPushButton("Cancel", panel)
    cancel.setObjectName("menuBtn")
    cancel.clicked.connect(self.reject)
    button_row.addWidget(cancel)
    self._confirm = QPushButton("Create", panel)
    self._confirm.setObjectName("menuBtn")
    self._confirm.setProperty("buttonStyle", "prominent")
    self._confirm.clicked.connect(self._on_confirm)
    button_row.addWidget(self._confirm)
    layout.addLayout(button_row)

    self._validate()

  def _on_confirm(self) -> None:
    if self._validation_error() is None:
      self.accept()

  def _validation_error(self) -> str | None:
    raw = str(self._name_input.text())
    if not raw.strip():
      return "Enter a world name."
    if normalize_world_name(raw).casefold() in self._existing:
      return "A world with this name already exists."
    return None

  def _validate(self) -> None:
    error = self._validation_error()
    self._confirm.setEnabled(error is None)
    self._error_label.setText("" if error is None else str(error))
    self._error_label.setVisible(error is not None)

  def selected_name(self) -> str:
    return normalize_world_name(self._name_input.text())

  def selected_game_mode(self) -> str:
    return WORLD_GAME_MODE_CREATIVE if self._creative_button.isChecked() else WORLD_GAME_MODE_SURVIVAL


class WorldRenameDialog(QDialog):
  def __init__(self, *, current_name: str, existing_names: tuple[str, ...], parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._existing = _normalized_names(existing_names)
    self.setObjectName("worldEditorDialog")
    self.setWindowTitle("Rename World")
    self.setModal(True)

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)
    panel = QFrame(self)
    panel.setObjectName("worldEditorPanel")
    panel.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    root.addWidget(panel)

    layout = QVBoxLayout(panel)
    layout.setContentsMargins(22, 20, 22, 20)
    layout.setSpacing(12)

    title = QLabel("Rename World", panel)
    title.setObjectName("worldEditorTitle")
    layout.addWidget(title)

    self._name_input = QLineEdit(panel)
    self._name_input.setObjectName("worldEditorInput")
    self._name_input.setText(str(current_name))
    self._name_input.textChanged.connect(self._validate)
    layout.addWidget(self._name_input)

    self._error_label = QLabel("", panel)
    self._error_label.setObjectName("worldEditorError")
    self._error_label.setVisible(False)
    layout.addWidget(self._error_label)

    button_row = QHBoxLayout()
    button_row.setContentsMargins(0, 0, 0, 0)
    button_row.setSpacing(8)
    button_row.addStretch(1)
    cancel = QPushButton("Cancel", panel)
    cancel.setObjectName("menuBtn")
    cancel.clicked.connect(self.reject)
    button_row.addWidget(cancel)
    self._confirm = QPushButton("Rename", panel)
    self._confirm.setObjectName("menuBtn")
    self._confirm.setProperty("buttonStyle", "prominent")
    self._confirm.clicked.connect(self._on_confirm)
    button_row.addWidget(self._confirm)
    layout.addLayout(button_row)

    self._validate()

  def _on_confirm(self) -> None:
    if self._validation_error() is None:
      self.accept()

  def _validation_error(self) -> str | None:
    raw = str(self._name_input.text())
    if not raw.strip():
      return "Enter a world name."
    if normalize_world_name(raw).casefold() in self._existing:
      return "A world with this name already exists."
    return None

  def _validate(self) -> None:
    error = self._validation_error()
    self._confirm.setEnabled(error is None)
    self._error_label.setText("" if error is None else str(error))
    self._error_label.setVisible(error is not None)

  def selected_name(self) -> str:
    return normalize_world_name(self._name_input.text())
