# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable
from dataclasses import replace
from typing import TYPE_CHECKING

from PyQt6.QtCore import QSignalBlocker, QThread, pyqtSignal
from PyQt6.QtWidgets import QCheckBox, QComboBox, QDoubleSpinBox, QFileDialog, QLabel, QLineEdit, QPushButton, QWidget

from ludoxel.application.persistence.schema.ai_learning import (
  LEARNING_MODE_OBSERVE_ONLY,
  LEARNING_MODE_OFF,
  LEARNING_MODE_TRAIN_FROM_PLAYER_DATA,
  LEARNING_MODE_TRAIN_IN_SANDBOX,
  LEARNING_MODE_USE_LEARNED_POLICY,
  is_active_learning_mode,
)
from ludoxel.presentation.interface.common.sidebar_dialog import SidebarDialogBase
from ludoxel.presentation.interface.common.themed_notice_dialog import show_themed_notice
from ludoxel.presentation.interface.settings.surface import add_page_header, add_setting_row, add_settings_card
from ludoxel.simulation.actors.ai_players.learning.actions import SKILL_CATEGORIES
from ludoxel.simulation.actors.ai_players.learning.dataset import (
  RECORD_AI_DEATHS,
  RECORD_AI_DECISIONS,
  RECORD_AI_ESCAPE_ATTEMPTS,
  RECORD_AI_FAILURES,
  RECORD_AI_ROUTE_FAILURES,
  RECORD_PLAYER_BLOCK_BREAKING,
  RECORD_PLAYER_BLOCK_PLACEMENT,
  RECORD_PLAYER_COMBAT,
  RECORD_PLAYER_MOVEMENT,
  RECORD_PLAYER_PARKOUR,
  RECORD_PLAYER_TRAP,
)
from ludoxel.simulation.actors.ai_players.learning.policy_registry import POLICY_KIND_BUNDLED, POLICY_KIND_LABELS, POLICY_KIND_USER
from ludoxel.simulation.actors.ai_players.naming import AI_NAME_BODY_MAX_LENGTH, ai_display_name_format_error
from ludoxel.simulation.actors.ai_players.state import (
  AI_HEALTH_INDICATOR_ABOVE,
  AI_HEALTH_INDICATOR_BELOW,
  AI_HEALTH_INDICATOR_OFF,
  AI_MODE_IDLE,
  AI_MODE_ROUTE,
  AI_MODE_WANDER,
  AI_PERSONALITY_AGGRESSIVE,
  AI_PERSONALITY_PEACEFUL,
  AI_ROUTE_STYLE_FLEXIBLE,
  AI_ROUTE_STYLE_STRICT,
  AI_SKIN_MODE_ALEX,
  AI_SKIN_MODE_CUSTOM,
  AI_SKIN_MODE_PLAYER,
  AiSpawnEggSettings,
)

if TYPE_CHECKING:
  from ludoxel.presentation.interface.overlays.ai_learning_controller import AiLearningTabController

_LEARNING_MODE_LABELS: tuple[tuple[str, str], ...] = (
  (LEARNING_MODE_OFF, "Off"),
  (LEARNING_MODE_OBSERVE_ONLY, "Observe Only"),
  (LEARNING_MODE_USE_LEARNED_POLICY, "Use Learned Policy"),
  (LEARNING_MODE_TRAIN_FROM_PLAYER_DATA, "Train From Player Data"),
  (LEARNING_MODE_TRAIN_IN_SANDBOX, "Train In Sandbox"),
)

_LEARNING_CAPTURE_LABELS: tuple[tuple[str, str], ...] = (
  (RECORD_PLAYER_MOVEMENT, "Player movement"),
  (RECORD_PLAYER_COMBAT, "Player combat"),
  (RECORD_PLAYER_BLOCK_PLACEMENT, "Player block placement"),
  (RECORD_PLAYER_BLOCK_BREAKING, "Player block breaking"),
  (RECORD_PLAYER_PARKOUR, "Player parkour"),
  (RECORD_PLAYER_TRAP, "Player trap behavior"),
  (RECORD_AI_DECISIONS, "AI decisions"),
  (RECORD_AI_FAILURES, "AI failures"),
  (RECORD_AI_DEATHS, "AI deaths"),
  (RECORD_AI_ROUTE_FAILURES, "AI route failures"),
  (RECORD_AI_ESCAPE_ATTEMPTS, "AI escape attempts"),
)


class _LearningTaskThread(QThread):
  task_finished = pyqtSignal(object)

  def __init__(self, task, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._task = task

  def run(self) -> None:
    try:
      result = self._task()
    except Exception as exc:  # noqa: BLE001
      result = {"status": "failed", "message": str(exc)}
    self.task_finished.emit(result)


_AI_NAME_INPUT_MAX_LENGTH = int(AI_NAME_BODY_MAX_LENGTH) + 5
_REGEN_CAP_MIN_UI = 1.0
_REGEN_CAP_MAX_UI = 20.0
_REGEN_DELAY_MIN_UI = 0.0
_REGEN_DELAY_MAX_UI = 60.0
_REGEN_TIME_TO_CAP_MIN_UI = 0.5
_REGEN_TIME_TO_CAP_MAX_UI = 3600.0


class AiSettingsOverlay(SidebarDialogBase):
  preview_requested = pyqtSignal()

  def __init__(
    self,
    *,
    parent: QWidget | None = None,
    settings: AiSpawnEggSettings,
    name_validator: Callable[[str], str | None] | None = None,
    settings_updater: Callable[[AiSpawnEggSettings], bool] | None = None,
    skin_importer: Callable[[str], str | None] | None = None,
    skin_available: Callable[[str], bool] | None = None,
    learning_controller: "AiLearningTabController | None" = None,
    as_window: bool = False,
    include_preview_button: bool = True,
  ) -> None:
    super().__init__(
      parent,
      as_window=as_window,
      root_object_name="settingsRoot",
      window_title="AI Settings",
      window_size=(1000, 740),
      minimum_window_size=(900, 660),
      panel_minimum_size=(840, 580),
      sidebar_object_name="settingsSidebar",
      content_object_name="settingsContent",
      stack_object_name="settingsStack",
    )
    self._settings = settings.normalized()
    self._name_validator = name_validator
    self._settings_updater = settings_updater
    self._skin_importer = skin_importer
    self._skin_available = skin_available
    self._learning_controller = learning_controller
    self._edit_route_requested = False
    self._delete_requested = False

    self._tab_identity = self._make_tab_button("Identity", 0, self._set_page)
    self._tab_display = self._make_tab_button("Display", 1, self._set_page)
    self._tab_skin = self._make_tab_button("Skin", 2, self._set_page)
    self._tab_health = self._make_tab_button("Health", 3, self._set_page)
    self._tab_behavior = self._make_tab_button("Behavior", 4, self._set_page)
    self._tab_placement = self._make_tab_button("Block Placement", 5, self._set_page)
    tab_buttons = [self._tab_identity, self._tab_display, self._tab_skin, self._tab_health, self._tab_behavior, self._tab_placement]
    self._tab_learning: QPushButton | None = None
    if self._learning_controller is not None:
      self._tab_learning = self._make_tab_button("Learning", len(tab_buttons), self._set_page)
      tab_buttons.append(self._tab_learning)
    self._tab_buttons = tuple(tab_buttons)
    for button in self._tab_buttons:
      self._sidebar_layout.addWidget(button)
    self._preview_button: QPushButton | None = None
    if bool(include_preview_button):
      self._preview_button = self._make_sidebar_action_button("Preview", self.preview_requested.emit)
      self._sidebar_layout.addWidget(self._preview_button)
    self._sidebar_layout.addStretch(1)

    self._delete_button = self._make_tab_button("Delete AI", 0, self._request_delete)
    self._delete_button.setObjectName("dangerBtn")
    self._delete_button.setCheckable(False)
    self._delete_button.setAutoExclusive(False)
    self._sidebar_layout.addWidget(self._delete_button)
    self._close_button: QPushButton | None = None
    if not bool(as_window):
      self._close_button = self._make_sidebar_action_button("Close", self.reject)
      self._sidebar_layout.addWidget(self._close_button)

    self._build_identity_page()
    self._build_display_page()
    self._build_skin_page()
    self._build_health_page()
    self._build_behavior_page()
    self._build_placement_page()
    if self._learning_controller is not None:
      self._build_learning_page()
    self._load_settings(self._settings)
    self._connect_immediate_updates()
    self._sync_route_controls()
    self._sync_regen_controls()
    self._set_page(0)

  def _build_identity_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Identity", subtitle="Name and world nametag identity for this AI.")
    _card, body, body_layout = add_settings_card(
      layout,
      host,
      title="AI Name",
      description="Use 1 to 16 letters or digits, beginning with a letter. An optional suffix from #0001 to #9999 can distinguish AI that share a name body. Names of live AI must be unique.",
    )
    self._name_edit = QLineEdit(body)
    self._name_edit.setMaxLength(int(_AI_NAME_INPUT_MAX_LENGTH))
    self._name_edit.setPlaceholderText("Example: Guard or Guard#0001")
    add_setting_row(body_layout, body, label="Name", description="Shown in the world nametag above this AI.", control=self._name_edit)
    self._name_feedback = QLabel("", body)
    self._name_feedback.setObjectName("settingsCardDescription")
    self._name_feedback.setWordWrap(True)
    body_layout.addWidget(self._name_feedback)
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_display_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Display", subtitle="World-space nametag and health presentation.")
    _card, body, body_layout = add_settings_card(layout, host, title="Health Indicator", description="The AI name is always shown. One heart represents two health points.")
    self._health_indicator_combo = QComboBox(body)
    self._health_indicator_combo.addItem("Above nametag", userData=AI_HEALTH_INDICATOR_ABOVE)
    self._health_indicator_combo.addItem("Below nametag", userData=AI_HEALTH_INDICATOR_BELOW)
    self._health_indicator_combo.addItem("Off", userData=AI_HEALTH_INDICATOR_OFF)
    add_setting_row(
      body_layout, body, label="Indicator position", description="New AI defaults to Above nametag. Off hides the heart row without hiding the name.", control=self._health_indicator_combo
    )
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_skin_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Skin", subtitle="Choose the skin source for this AI.")
    _card, body, body_layout = add_settings_card(
      layout,
      host,
      title="Skin Source",
      description="Same as player follows the player's current skin. Bundled Alex uses the built-in Alex skin. Imported PNG opens a PNG picker when no valid imported image is already registered, then uses that 64x64 image for this AI only.",
    )
    self._skin_mode_combo = QComboBox(body)
    self._skin_mode_combo.addItem("Same as player", userData=AI_SKIN_MODE_PLAYER)
    self._skin_mode_combo.addItem("Bundled Alex", userData=AI_SKIN_MODE_ALEX)
    self._skin_mode_combo.addItem("Imported PNG", userData=AI_SKIN_MODE_CUSTOM)
    add_setting_row(body_layout, body, label="Skin source", description="Applied immediately to this AI.", control=self._skin_mode_combo)

    self._skin_status = QLabel("", body)
    self._skin_status.setObjectName("settingsCardDescription")
    self._skin_status.setWordWrap(True)
    body_layout.addWidget(self._skin_status)
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_health_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Health", subtitle="Automatic regeneration timing and cap for this AI.")
    _card, body, body_layout = add_settings_card(
      layout, host, title="Automatic Regeneration", description="Damage restarts the delay. Regeneration never exceeds the lower of this cap and the AI's maximum health."
    )
    self._regen_enabled = QCheckBox("Enable auto regeneration", body)
    add_setting_row(body_layout, body, label="Regeneration", description="Disabled by default.", control=self._regen_enabled)

    self._regen_delay_spin = QDoubleSpinBox(body)
    self._regen_delay_spin.setRange(float(_REGEN_DELAY_MIN_UI), float(_REGEN_DELAY_MAX_UI))
    self._regen_delay_spin.setDecimals(1)
    self._regen_delay_spin.setSingleStep(0.5)
    add_setting_row(body_layout, body, label="Start delay", description="Seconds after the most recent damage.", control=self._regen_delay_spin)

    self._regen_cap_spin = QDoubleSpinBox(body)
    self._regen_cap_spin.setRange(float(_REGEN_CAP_MIN_UI), float(_REGEN_CAP_MAX_UI))
    self._regen_cap_spin.setDecimals(0)
    self._regen_cap_spin.setSingleStep(1.0)
    add_setting_row(body_layout, body, label="Health cap", description="Health points restored up to this cap.", control=self._regen_cap_spin)

    self._regen_time_to_cap_spin = QDoubleSpinBox(body)
    self._regen_time_to_cap_spin.setRange(float(_REGEN_TIME_TO_CAP_MIN_UI), float(_REGEN_TIME_TO_CAP_MAX_UI))
    self._regen_time_to_cap_spin.setDecimals(1)
    self._regen_time_to_cap_spin.setSingleStep(1.0)
    add_setting_row(body_layout, body, label="Time to cap", description="Seconds of uninterrupted healing required to restore the full cap.", control=self._regen_time_to_cap_spin)

    self._regen_summary = QLabel("", body)
    self._regen_summary.setObjectName("settingsCardDescription")
    self._regen_summary.setWordWrap(True)
    body_layout.addWidget(self._regen_summary)
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_behavior_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Behavior", subtitle="Role, personality, and route patrol behavior for this AI.")
    _role_card, role_body, role_layout = add_settings_card(layout, host, title="Role", description="New AI remains on standby until a role is selected.")
    self._mode_combo = QComboBox(role_body)
    self._mode_combo.addItem("Standby", userData=AI_MODE_IDLE)
    self._mode_combo.addItem("Free Roam / PVP", userData=AI_MODE_WANDER)
    self._mode_combo.addItem("Route Patrol", userData=AI_MODE_ROUTE)
    add_setting_row(role_layout, role_body, label="Mode", description="Controls the actor's primary movement behavior.", control=self._mode_combo)

    self._personality_combo = QComboBox(role_body)
    self._personality_combo.addItem("Aggressive", userData=AI_PERSONALITY_AGGRESSIVE)
    self._personality_combo.addItem("Peaceful", userData=AI_PERSONALITY_PEACEFUL)
    add_setting_row(role_layout, role_body, label="Personality", description="Controls whether the AI seeks combat.", control=self._personality_combo)

    self._mode_description = QLabel("", role_body)
    self._mode_description.setObjectName("settingsCardDescription")
    self._mode_description.setWordWrap(True)
    role_layout.addWidget(self._mode_description)

    _route_card, route_body, route_layout = add_settings_card(
      layout, host, title="Route Patrol", description="Route editing uses the dedicated route hotbar in the world: confirm, eraser, and cancel remain available there."
    )
    self._route_style_combo = QComboBox(route_body)
    self._route_style_combo.addItem("Strict", userData=AI_ROUTE_STYLE_STRICT)
    self._route_style_combo.addItem("Flexible", userData=AI_ROUTE_STYLE_FLEXIBLE)
    add_setting_row(
      route_layout,
      route_body,
      label="Route style",
      description="Strict follows authored segments directly. Flexible may detour, recover, and bridge when placement is allowed.",
      control=self._route_style_combo,
    )

    self._route_run = QCheckBox("Run route segments", route_body)
    add_setting_row(route_layout, route_body, label="Movement speed", description="Sprint along route segments without changing their order.", control=self._route_run)

    self._route_closed = QCheckBox("Treat route as a closed loop", route_body)
    add_setting_row(route_layout, route_body, label="Loop connection", description="Connect the final authored point directly back to the first.", control=self._route_closed)

    self._route_summary = QLabel("", route_body)
    self._route_summary.setObjectName("settingsCardDescription")
    self._route_summary.setWordWrap(True)
    route_layout.addWidget(self._route_summary)

    self._edit_route_button = QPushButton("Edit Route in World", route_body)
    self._edit_route_button.setObjectName("primaryBtn")
    add_setting_row(route_layout, route_body, label="Route points", description="Author or revise the patrol path directly in the world.", control=self._edit_route_button)
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_placement_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Block Placement", subtitle="Placement permission and the movement safety rules that depend on it.")
    _placement_card, placement_body, placement_layout = add_settings_card(
      layout, host, title="Placement Permission", description="Block placement is a movement aid rather than unrestricted building permission."
    )
    self._can_place_blocks = QCheckBox("Allow block placement", placement_body)
    add_setting_row(
      placement_layout, placement_body, label="Placement", description="Allows bridging, securing the next footing, escaping boxed positions, and defensive placement.", control=self._can_place_blocks
    )
    placement_note = QLabel(
      "Placement requires a clear line of sight. During bridging, forward movement waits until the next footing exists instead of advancing ahead of an unfinished bridge.", placement_body
    )
    placement_note.setObjectName("settingsCardDescription")
    placement_note.setWordWrap(True)
    placement_layout.addWidget(placement_note)

    _safety_card, safety_body, safety_layout = add_settings_card(
      layout, host, title="Movement Safety", description="Safety is always active and has no independent toggle because its fallback depends on the placement permission above."
    )
    safety_text = QLabel(
      "Before walking forward on the ground, the AI checks the next footing. Free Roam and PVP allow drops of up to three blocks onto solid ground; deeper gaps and the void stop or redirect movement. "
      "Route patrol permits deeper descents only when ground exists below the next step. If placement is enabled, the AI may secure the gap with a bridge; otherwise it stops or turns away.",
      safety_body,
    )
    safety_text.setObjectName("settingsCardDescription")
    safety_text.setWordWrap(True)
    safety_layout.addWidget(safety_text)
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_learning_page(self) -> None:
    controller = self._learning_controller
    if controller is None:
      return
    state = controller.state()
    scroll, host, layout = self._make_scroll_page()
    add_page_header(layout, host, title="Learning", subtitle="Demonstration capture and learned-policy settings shared by all AI.")

    self._learning_task_thread: _LearningTaskThread | None = None
    _mode_card, mode_body, mode_layout = add_settings_card(
      layout,
      host,
      title="Learning Mode",
      description="Off, Observe Only, and Use Learned Policy apply during play. Selecting a Train mode runs training in the background and then switches to Use Learned Policy.",
    )
    self._learning_mode_combo = QComboBox(mode_body)
    for value, label in _LEARNING_MODE_LABELS:
      self._learning_mode_combo.addItem(label, userData=value)
    add_setting_row(mode_layout, mode_body, label="Mode", description="Selects how the learning foundation participates.", control=self._learning_mode_combo)
    self._learning_mode_notice = QLabel("", mode_body)
    self._learning_mode_notice.setObjectName("settingsCardDescription")
    self._learning_mode_notice.setWordWrap(True)
    mode_layout.addWidget(self._learning_mode_notice)
    self._learning_busy_label = QLabel("", mode_body)
    self._learning_busy_label.setObjectName("settingsCardDescription")
    self._learning_busy_label.setWordWrap(True)
    mode_layout.addWidget(self._learning_busy_label)

    _capture_card, capture_body, capture_layout = add_settings_card(
      layout, host, title="Data Capture", description="Recorded only while the mode is Observe Only. Records are game state and actions, never screen images."
    )
    self._learning_capture_checks: dict[str, QCheckBox] = {}
    for kind, label in _LEARNING_CAPTURE_LABELS:
      check = QCheckBox(label, capture_body)
      add_setting_row(capture_layout, capture_body, label=label, description="", control=check)
      self._learning_capture_checks[kind] = check

    _skill_card, skill_body, skill_layout = add_settings_card(layout, host, title="Skill Categories", description="Skills selected for demonstration capture and future evaluation.")
    self._learning_skill_checks: dict[str, QCheckBox] = {}
    for skill_id, label in SKILL_CATEGORIES:
      check = QCheckBox(label, skill_body)
      add_setting_row(skill_layout, skill_body, label=label, description="", control=check)
      self._learning_skill_checks[skill_id] = check

    _policy_card, policy_body, policy_layout = add_settings_card(
      layout, host, title="Policy Selection", description="A broken or unevaluated policy is never used; the AI falls back to the built-in deterministic baseline."
    )
    self._learning_policy_kind_combo = QComboBox(policy_body)
    for value, label in POLICY_KIND_LABELS:
      self._learning_policy_kind_combo.addItem(label, userData=value)
    add_setting_row(policy_layout, policy_body, label="Policy source", description="Which policy the AI uses during play.", control=self._learning_policy_kind_combo)
    self._learning_policy_id_combo = QComboBox(policy_body)
    add_setting_row(policy_layout, policy_body, label="Selected policy", description="Used when the source is a bundled or user learned policy.", control=self._learning_policy_id_combo)
    self._populate_learning_policy_id_combo()

    _eval_card, eval_body, eval_layout = add_settings_card(
      layout, host, title="Evaluation", description="Evaluates the selected policy against the engine and the headless sandbox, then reports pass or fail."
    )
    self._learning_eval_button = QPushButton("Run evaluation", eval_body)
    self._learning_eval_button.setObjectName("primaryBtn")
    add_setting_row(eval_layout, eval_body, label="Evaluate selected policy", description="Validates schema, compatibility, mask compliance, and sandbox behavior.", control=self._learning_eval_button)
    self._learning_eval_label = QLabel("", eval_body)
    self._learning_eval_label.setObjectName("settingsCardDescription")
    self._learning_eval_label.setWordWrap(True)
    eval_layout.addWidget(self._learning_eval_label)

    _data_card, data_body, data_layout = add_settings_card(layout, host, title="Data Management", description="Export, import, and clear recorded data, and manage the learned policy.")
    self._learning_export_button = QPushButton("Export learning data", data_body)
    add_setting_row(data_layout, data_body, label="Export", description="Write recorded demonstrations to a JSON Lines file.", control=self._learning_export_button)
    self._learning_import_button = QPushButton("Import learning data", data_body)
    add_setting_row(data_layout, data_body, label="Import", description="Append demonstrations from a JSON Lines file.", control=self._learning_import_button)
    self._learning_clear_button = QPushButton("Clear player demonstration data", data_body)
    self._learning_clear_button.setObjectName("dangerBtn")
    add_setting_row(data_layout, data_body, label="Clear data", description="Delete all recorded demonstrations for this dataset.", control=self._learning_clear_button)
    self._learning_reset_button = QPushButton("Reset learned policy", data_body)
    self._learning_reset_button.setObjectName("dangerBtn")
    add_setting_row(data_layout, data_body, label="Reset policy", description="Return to the built-in deterministic baseline.", control=self._learning_reset_button)
    self._learning_restore_button = QPushButton("Restore bundled policy", data_body)
    add_setting_row(data_layout, data_body, label="Restore policy", description="Use a bundled learned policy as the source.", control=self._learning_restore_button)
    self._learning_dataset_label = QLabel("", data_body)
    self._learning_dataset_label.setObjectName("settingsCardDescription")
    self._learning_dataset_label.setWordWrap(True)
    data_layout.addWidget(self._learning_dataset_label)
    self._learning_training_label = QLabel("", data_body)
    self._learning_training_label.setObjectName("settingsCardDescription")
    self._learning_training_label.setWordWrap(True)
    data_layout.addWidget(self._learning_training_label)
    self._learning_policy_version_label = QLabel("", data_body)
    self._learning_policy_version_label.setObjectName("settingsCardDescription")
    self._learning_policy_version_label.setWordWrap(True)
    data_layout.addWidget(self._learning_policy_version_label)
    self._learning_path_label = QLabel("", data_body)
    self._learning_path_label.setObjectName("settingsCardDescription")
    self._learning_path_label.setWordWrap(True)
    data_layout.addWidget(self._learning_path_label)

    layout.addStretch(1)
    self._stack.addWidget(scroll)

    self._load_learning_controls(state)
    self._connect_learning_updates()
    self._refresh_learning_dynamic()

  def _load_learning_controls(self, state) -> None:
    settings = state.settings
    blockers = [QSignalBlocker(self._learning_mode_combo), QSignalBlocker(self._learning_policy_kind_combo), QSignalBlocker(self._learning_policy_id_combo)]
    self._set_combo_value(self._learning_mode_combo, str(settings.learning_mode))
    for kind, check in self._learning_capture_checks.items():
      blocker = QSignalBlocker(check)
      check.setChecked(bool(settings.capture_flags.get(kind, False)))
      del blocker
    for skill_id, check in self._learning_skill_checks.items():
      blocker = QSignalBlocker(check)
      check.setChecked(bool(settings.skill_flags.get(skill_id, True)))
      del blocker
    self._set_combo_value(self._learning_policy_kind_combo, str(settings.selected_policy_kind))
    self._set_combo_value(self._learning_policy_id_combo, str(settings.selected_policy_id))
    del blockers
    self._sync_learning_mode_notice()
    self._sync_learning_policy_id_enabled()

  def _connect_learning_updates(self) -> None:
    self._learning_mode_combo.currentIndexChanged.connect(self._on_learning_mode_changed)
    for kind, check in self._learning_capture_checks.items():
      check.toggled.connect(lambda checked, captured_kind=str(kind): self._learning_controller.set_capture_flag(captured_kind, bool(checked)))
    for skill_id, check in self._learning_skill_checks.items():
      check.toggled.connect(lambda checked, captured_skill=str(skill_id): self._learning_controller.set_skill_flag(captured_skill, bool(checked)))
    self._learning_policy_kind_combo.currentIndexChanged.connect(self._on_learning_policy_changed)
    self._learning_policy_id_combo.currentIndexChanged.connect(self._on_learning_policy_changed)
    self._learning_eval_button.clicked.connect(self._on_run_minimal_evaluation)
    self._learning_export_button.clicked.connect(self._on_export_learning_data)
    self._learning_import_button.clicked.connect(self._on_import_learning_data)
    self._learning_clear_button.clicked.connect(self._on_clear_learning_data)
    self._learning_reset_button.clicked.connect(self._on_reset_learned_policy)
    self._learning_restore_button.clicked.connect(self._on_restore_bundled_policy)

  def _sync_learning_mode_notice(self) -> None:
    mode = str(self._learning_mode_combo.currentData())
    if mode == LEARNING_MODE_TRAIN_FROM_PLAYER_DATA:
      self._learning_mode_notice.setText("Train From Player Data learns a policy from the recorded demonstrations, evaluates it, then switches to Use Learned Policy.")
      return
    if mode == LEARNING_MODE_TRAIN_IN_SANDBOX:
      self._learning_mode_notice.setText("Train In Sandbox improves a policy in the headless sandbox against the deterministic baseline, then switches to Use Learned Policy.")
      return
    if not is_active_learning_mode(mode):
      self._learning_mode_notice.setText("This mode is not active during play.")
      return
    if mode == LEARNING_MODE_OBSERVE_ONLY:
      self._learning_mode_notice.setText("Observe Only records the selected demonstration data without changing how the AI behaves.")
      return
    if mode == LEARNING_MODE_USE_LEARNED_POLICY:
      self._learning_mode_notice.setText("Use Learned Policy applies the selected policy only if it passed evaluation; otherwise the deterministic baseline is used.")
      return
    self._learning_mode_notice.setText("Learning is off. No demonstrations are recorded and the deterministic baseline drives the AI.")

  def _populate_learning_policy_id_combo(self) -> None:
    blocker = QSignalBlocker(self._learning_policy_id_combo)
    self._learning_policy_id_combo.clear()
    self._learning_policy_id_combo.addItem("Automatic", userData="")
    for policy_id, policy_name in self._learning_controller.bundled_policy_options():
      self._learning_policy_id_combo.addItem(f"Bundled: {policy_name}", userData=str(policy_id))
    for policy_id, policy_name in self._learning_controller.user_policy_options():
      self._learning_policy_id_combo.addItem(f"User: {policy_name}", userData=str(policy_id))
    del blocker

  def _sync_learning_policy_id_enabled(self) -> None:
    kind = str(self._learning_policy_kind_combo.currentData())
    self._learning_policy_id_combo.setEnabled(kind in (POLICY_KIND_BUNDLED, POLICY_KIND_USER))

  def _on_learning_mode_changed(self, _index: int = 0) -> None:
    mode = str(self._learning_mode_combo.currentData())
    self._sync_learning_mode_notice()
    if mode == LEARNING_MODE_TRAIN_FROM_PLAYER_DATA:
      self._run_learning_task(self._learning_controller.train_from_player_data, self._on_training_done, busy_text="Training from player data...")
      return
    if mode == LEARNING_MODE_TRAIN_IN_SANDBOX:
      self._run_learning_task(self._learning_controller.train_in_sandbox, self._on_training_done, busy_text="Training in sandbox...")
      return
    self._learning_controller.set_learning_mode(mode)

  def _run_learning_task(self, task, on_done, *, busy_text: str) -> None:
    if self._learning_task_thread is not None:
      return
    self._set_learning_busy(True, busy_text)
    thread = _LearningTaskThread(task, self)
    self._learning_task_thread = thread
    thread.task_finished.connect(lambda result, captured=thread: self._finish_learning_task(result, on_done, captured))
    thread.start()

  def _finish_learning_task(self, result, on_done, thread) -> None:
    self._set_learning_busy(False, "")
    if self._learning_task_thread is thread:
      self._learning_task_thread = None
    try:
      on_done(result)
    finally:
      thread.deleteLater()

  def _set_learning_busy(self, busy: bool, text: str) -> None:
    enabled = not bool(busy)
    self._learning_busy_label.setText(str(text))
    for widget in (
      self._learning_mode_combo,
      self._learning_eval_button,
      self._learning_policy_kind_combo,
      self._learning_policy_id_combo,
      self._learning_export_button,
      self._learning_import_button,
      self._learning_clear_button,
      self._learning_reset_button,
      self._learning_restore_button,
    ):
      widget.setEnabled(bool(enabled))
    if bool(enabled):
      self._sync_learning_policy_id_enabled()

  def _on_training_done(self, result) -> None:
    status = str(result.get("status", "failed")) if isinstance(result, dict) else "failed"
    message = str(result.get("message", "Training failed.")) if isinstance(result, dict) else "Training failed."
    self._populate_learning_policy_id_combo()
    if status == "completed":
      blocker = QSignalBlocker(self._learning_mode_combo)
      self._set_combo_value(self._learning_mode_combo, LEARNING_MODE_USE_LEARNED_POLICY)
      del blocker
      self._learning_controller.set_learning_mode(LEARNING_MODE_USE_LEARNED_POLICY)
    else:
      blocker = QSignalBlocker(self._learning_mode_combo)
      self._set_combo_value(self._learning_mode_combo, str(self._learning_controller.state().settings.learning_mode))
      del blocker
    self._reload_learning_policy_controls(self._learning_controller.state())
    self._sync_learning_mode_notice()
    self._refresh_learning_dynamic()
    detail = message
    if status == "completed" and isinstance(result, dict) and result.get("policy_path"):
      passed = "passed evaluation" if bool(result.get("passed")) else "did not pass evaluation"
      detail = f"{message} The policy {passed}. Saved to {result.get('policy_path')}."
    show_themed_notice(parent=self, title="Training", message=detail, nav_label="Learning")

  def _on_evaluation_done(self, report) -> None:
    self._reload_learning_policy_controls(self._learning_controller.state())
    self._refresh_learning_dynamic()
    passed = bool(getattr(report, "passed", False))
    score = float(getattr(report, "score", 0.0))
    baseline = float(getattr(report, "baseline_score", 0.0))
    show_themed_notice(parent=self, title="Evaluation", message=f"Evaluation {'passed' if passed else 'failed'} (policy score {score:.2f} vs baseline {baseline:.2f}).", nav_label="Learning")

  def _on_learning_policy_changed(self, _index: int = 0) -> None:
    self._learning_controller.set_policy(str(self._learning_policy_kind_combo.currentData()), str(self._learning_policy_id_combo.currentData()))
    self._sync_learning_policy_id_enabled()

  def _on_run_minimal_evaluation(self) -> None:
    self._run_learning_task(self._learning_controller.run_minimal_evaluation, self._on_evaluation_done, busy_text="Evaluating selected policy...")

  def _on_export_learning_data(self) -> None:
    path, _filter = QFileDialog.getSaveFileName(self, "Export learning data", "ludoxel_demonstrations.jsonl", "JSON Lines (*.jsonl)")
    if not path:
      return
    count = self._learning_controller.export_dataset(str(path))
    self._refresh_learning_dynamic()
    show_themed_notice(parent=self, title="Learning Data", message=f"Exported {int(count)} demonstration record(s).", nav_label="Learning")

  def _on_import_learning_data(self) -> None:
    path, _filter = QFileDialog.getOpenFileName(self, "Import learning data", "", "JSON Lines (*.jsonl)")
    if not path:
      return
    count = self._learning_controller.import_dataset(str(path))
    self._refresh_learning_dynamic()
    show_themed_notice(parent=self, title="Learning Data", message=f"Imported {int(count)} demonstration record(s).", nav_label="Learning")

  def _on_clear_learning_data(self) -> None:
    self._learning_controller.clear_dataset()
    self._refresh_learning_dynamic()
    show_themed_notice(parent=self, title="Learning Data", message="Cleared the recorded demonstration data.", nav_label="Learning")

  def _on_reset_learned_policy(self) -> None:
    state = self._learning_controller.reset_learned_policy()
    self._reload_learning_policy_controls(state)
    self._refresh_learning_dynamic()

  def _on_restore_bundled_policy(self) -> None:
    state = self._learning_controller.restore_bundled_policy()
    self._reload_learning_policy_controls(state)
    self._refresh_learning_dynamic()

  def _reload_learning_policy_controls(self, state) -> None:
    self._populate_learning_policy_id_combo()
    blockers = [QSignalBlocker(self._learning_policy_kind_combo), QSignalBlocker(self._learning_policy_id_combo)]
    self._set_combo_value(self._learning_policy_kind_combo, str(state.settings.selected_policy_kind))
    self._set_combo_value(self._learning_policy_id_combo, str(state.settings.selected_policy_id))
    del blockers
    self._sync_learning_policy_id_enabled()

  def _refresh_learning_dynamic(self) -> None:
    summary = self._learning_controller.dataset_summary()
    state = self._learning_controller.state()
    self._learning_dataset_label.setText(f"Dataset size: {int(summary.record_count)} record(s), {int(summary.byte_size)} byte(s).")
    training = state.last_training_summary or {}
    if training:
      self._learning_training_label.setText(f"Last training: {str(training.get('status', 'unknown'))} - {str(training.get('message', ''))}")
    else:
      self._learning_training_label.setText("Last training: none yet.")
    self._learning_policy_version_label.setText(
      f"Selected policy: {str(state.settings.selected_policy_kind)} '{str(state.settings.selected_policy_id) or 'automatic'}' (version {int(state.policy_version)})."
    )
    self._learning_path_label.setText(f"Policy folder: {self._learning_controller.policy_save_path()}")
    evaluation = state.last_evaluation_summary or {}
    if evaluation:
      passed = bool(evaluation.get("passed", False))
      score = float(evaluation.get("score", 0.0) or 0.0)
      baseline = float(evaluation.get("baseline_score", 0.0) or 0.0)
      self._learning_eval_label.setText(f"Last evaluation: {'passed' if passed else 'not passed'} (policy score {score:.2f} vs baseline {baseline:.2f}).")
    else:
      self._learning_eval_label.setText("Last evaluation: not run yet.")

  def _connect_immediate_updates(self) -> None:
    self._name_edit.textChanged.connect(self._on_name_changed)
    self._health_indicator_combo.currentIndexChanged.connect(self._persist_current_settings)
    self._skin_mode_combo.currentIndexChanged.connect(self._on_skin_mode_changed)
    self._regen_enabled.toggled.connect(self._on_regen_changed)
    self._regen_delay_spin.valueChanged.connect(self._on_regen_changed)
    self._regen_cap_spin.valueChanged.connect(self._on_regen_changed)
    self._regen_time_to_cap_spin.valueChanged.connect(self._on_regen_changed)
    self._mode_combo.currentIndexChanged.connect(self._on_mode_changed)
    self._personality_combo.currentIndexChanged.connect(self._persist_current_settings)
    self._route_style_combo.currentIndexChanged.connect(self._on_route_changed)
    self._route_run.toggled.connect(self._on_route_changed)
    self._route_closed.toggled.connect(self._on_route_changed)
    self._can_place_blocks.toggled.connect(self._persist_current_settings)
    self._edit_route_button.clicked.connect(self._request_route_edit)

  def _set_page(self, index: int) -> None:
    self._set_stack_page(index=index, max_index=len(self._tab_buttons) - 1, tab_buttons=self._tab_buttons)

  @staticmethod
  def _time_to_cap_from_settings(settings: AiSpawnEggSettings) -> float:
    amount = max(1e-6, float(settings.regen_amount_hp))
    cap = max(float(_REGEN_CAP_MIN_UI), float(settings.regen_cap_hp))
    time_to_cap = float(settings.regen_interval_s) * float(cap) / float(amount)
    return float(min(float(_REGEN_TIME_TO_CAP_MAX_UI), max(float(_REGEN_TIME_TO_CAP_MIN_UI), float(time_to_cap))))

  def _interval_from_ui(self) -> float:
    amount = max(1e-6, float(self._settings.regen_amount_hp))
    cap = max(float(_REGEN_CAP_MIN_UI), float(self._regen_cap_spin.value()))
    return float(self._regen_time_to_cap_spin.value()) * float(amount) / float(cap)

  def _load_settings(self, settings: AiSpawnEggSettings) -> None:
    self._settings = settings.normalized()
    self._name_edit.setText(str(self._settings.name))
    self._set_combo_value(self._health_indicator_combo, str(self._settings.health_indicator))
    self._set_combo_value(self._skin_mode_combo, str(self._settings.skin_mode))
    self._sync_skin_controls()
    self._regen_enabled.setChecked(bool(self._settings.auto_regen_enabled))
    self._regen_delay_spin.setValue(float(min(float(_REGEN_DELAY_MAX_UI), max(float(_REGEN_DELAY_MIN_UI), float(self._settings.regen_start_delay_s)))))
    self._regen_cap_spin.setValue(float(min(float(_REGEN_CAP_MAX_UI), max(float(_REGEN_CAP_MIN_UI), float(self._settings.regen_cap_hp)))))
    self._regen_time_to_cap_spin.setValue(self._time_to_cap_from_settings(self._settings))
    self._set_combo_value(self._mode_combo, str(self._settings.mode))
    self._set_combo_value(self._personality_combo, str(self._settings.personality))
    self._set_combo_value(self._route_style_combo, str(self._settings.route_style))
    self._can_place_blocks.setChecked(bool(self._settings.can_place_blocks))
    self._route_run.setChecked(bool(self._settings.route_run))
    self._route_closed.setChecked(bool(self._settings.route_closed))
    self._sync_mode_description()
    self._sync_name_feedback()
    self._sync_regen_summary()
    self._sync_route_summary()

  def _route_summary_text(self) -> str:
    point_count = len(self._settings.route_points)
    loop_text = "Closed loop" if bool(self._route_closed.isChecked()) else "Open route"
    return f"{point_count} point(s) recorded. {loop_text}."

  @staticmethod
  def _set_combo_value(combo: QComboBox, value: str) -> None:
    target = str(value)
    for index in range(combo.count()):
      if str(combo.itemData(index)) == target:
        combo.setCurrentIndex(index)
        return

  def _current_name_error(self) -> str | None:
    candidate = str(self._name_edit.text()).strip()
    format_error = ai_display_name_format_error(candidate)
    if format_error is not None:
      return str(format_error)
    if self._name_validator is not None:
      return self._name_validator(candidate)
    return None

  def _sync_name_feedback(self) -> None:
    error = self._current_name_error()
    if error is None:
      self._name_feedback.setText("This name is available and is applied immediately.")
      return
    self._name_feedback.setText(f"Not applied: {error}")

  def _sync_regen_controls(self) -> None:
    enabled = bool(self._regen_enabled.isChecked())
    self._regen_delay_spin.setEnabled(enabled)
    self._regen_cap_spin.setEnabled(enabled)
    self._regen_time_to_cap_spin.setEnabled(enabled)
    self._sync_regen_summary()

  def _sync_regen_summary(self) -> None:
    if not bool(self._regen_enabled.isChecked()):
      self._regen_summary.setText("Auto regeneration is disabled. The AI does not heal on its own.")
      return
    delay = float(self._regen_delay_spin.value())
    cap = float(self._regen_cap_spin.value())
    time_to_cap = float(self._regen_time_to_cap_spin.value())
    amount = max(1e-6, float(self._settings.regen_amount_hp))
    interval = max(1e-6, float(time_to_cap) * float(amount) / max(1.0, float(cap)))
    self._regen_summary.setText(
      f"After {delay:.1f} s without damage, the AI heals {amount:.1f} health point(s) every {interval:.1f} s up to {cap:.0f} health points. Restoring the full cap takes about {time_to_cap:.1f} s."
    )

  def _has_available_imported_skin(self) -> bool:
    skin_id = str(self._settings.skin_id)
    return bool(skin_id) and (self._skin_available is None or bool(self._skin_available(skin_id)))

  def _sync_skin_controls(self) -> None:
    skin_id = str(self._settings.skin_id)
    has_import = bool(skin_id)
    available = self._has_available_imported_skin()
    mode = str(self._skin_mode_combo.currentData())
    if available:
      status = "An imported PNG skin is stored for this AI."
    elif has_import:
      status = "The imported PNG skin file is missing or invalid. Select Imported PNG again to choose a replacement PNG."
    else:
      status = "No PNG skin has been imported for this AI. Select Imported PNG to choose a 64x64 PNG file."
    if mode == AI_SKIN_MODE_CUSTOM:
      status += " This AI uses its imported PNG skin." if available else " Imported PNG is selected but no valid image is available, so the player skin is shown until one is imported."
    elif mode == AI_SKIN_MODE_ALEX:
      status += " This AI currently uses the bundled Alex skin."
    else:
      status += " This AI currently follows the player skin."
    self._skin_status.setText(status)

  def _sync_route_controls(self) -> None:
    route_mode = str(self._mode_combo.currentData()) == AI_MODE_ROUTE
    self._route_style_combo.setEnabled(bool(route_mode))
    self._route_run.setEnabled(bool(route_mode))
    self._route_closed.setEnabled(bool(route_mode))
    self._edit_route_button.setEnabled(True)

  def _sync_route_summary(self) -> None:
    self._route_summary.setText(self._route_summary_text())

  def _sync_mode_description(self) -> None:
    mode = str(self._mode_combo.currentData())
    if mode == AI_MODE_ROUTE:
      suffix = "" if len(self._settings.route_points) >= 2 else " This mode is applied after at least two route points are confirmed in the world editor."
      self._mode_description.setText(
        "Route Patrol follows the authored path, can engage the player at close range, and returns to the route when the target escapes. Edge handling follows the safety rules on Block Placement."
        + suffix
      )
      return
    if mode == AI_MODE_WANDER:
      self._mode_description.setText("Free Roam / PVP uses player kinematics, collision, jump, placement, and interaction behavior. It checks the next footing before advancing near an edge.")
      return
    self._mode_description.setText("Standby keeps the AI at its current position until another role is selected.")

  def _on_name_changed(self) -> None:
    self._sync_name_feedback()
    self._persist_current_settings()

  def _on_regen_changed(self, _value=None) -> None:
    self._sync_regen_controls()
    self._persist_current_settings()

  def _on_skin_mode_changed(self, _index: int) -> None:
    if str(self._skin_mode_combo.currentData()) == AI_SKIN_MODE_CUSTOM and not self._has_available_imported_skin():
      previous_mode = str(self._settings.skin_mode)
      if not self._import_custom_skin():
        blocker = QSignalBlocker(self._skin_mode_combo)
        self._set_combo_value(self._skin_mode_combo, previous_mode)
        del blocker
        self._sync_skin_controls()
      return
    self._persist_current_settings()
    self._sync_skin_controls()

  def _import_custom_skin(self) -> bool:
    if self._skin_importer is None:
      show_themed_notice(parent=self, title="AI Skin", message="AI skin import is not available in this context.", nav_label="AI Skin")
      return False
    skin_id = self._skin_importer(str(self._settings.skin_id))
    if not skin_id:
      return False
    blocker = QSignalBlocker(self._skin_mode_combo)
    self._set_combo_value(self._skin_mode_combo, AI_SKIN_MODE_CUSTOM)
    del blocker
    candidate = replace(self.settings(), skin_mode=AI_SKIN_MODE_CUSTOM, skin_id=str(skin_id)).normalized()
    if not self._persist_candidate(candidate, show_failure=True):
      blocker = QSignalBlocker(self._skin_mode_combo)
      self._set_combo_value(self._skin_mode_combo, str(self._settings.skin_mode))
      del blocker
      self._sync_skin_controls()
      return False
    self._sync_skin_controls()
    return True

  def _on_mode_changed(self, _index: int) -> None:
    self._sync_route_controls()
    self._sync_mode_description()
    self._persist_current_settings()

  def _on_route_changed(self, _value=None) -> None:
    self._sync_route_summary()
    self._persist_current_settings()

  def _persist_candidate(self, candidate: AiSpawnEggSettings, *, show_failure: bool = False) -> bool:
    normalized = candidate.normalized()
    if normalized == self._settings:
      return True
    if self._settings_updater is not None and not bool(self._settings_updater(normalized)):
      if bool(show_failure):
        show_themed_notice(parent=self, title="AI Settings", message="The selected AI settings could not be applied.", nav_label="AI Settings")
      return False
    self._settings = normalized
    self._sync_route_summary()
    return True

  def _persist_current_settings(self, _value=None) -> bool:
    candidate = self.settings()
    if self._current_name_error() is not None:
      candidate = replace(candidate, name=str(self._settings.name)).normalized()
    if str(candidate.mode) == AI_MODE_ROUTE and len(candidate.route_points) < 2:
      candidate = replace(candidate, mode=str(self._settings.mode)).normalized()
    return self._persist_candidate(candidate)

  def _request_route_edit(self) -> None:
    name_error = self._current_name_error()
    if name_error is not None:
      show_themed_notice(parent=self, title="AI Name", message=str(name_error), nav_label="AI Name")
      self._set_page(0)
      return
    mode_signal_blocker = QSignalBlocker(self._mode_combo)
    self._set_combo_value(self._mode_combo, AI_MODE_ROUTE)
    del mode_signal_blocker
    self._sync_route_controls()
    self._sync_mode_description()
    route_candidate = self.settings()
    persisted_candidate = replace(route_candidate, mode=str(self._settings.mode)).normalized()
    if not self._persist_candidate(persisted_candidate, show_failure=True):
      return
    self._edit_route_requested = True
    self.accept()

  def _request_delete(self, _index: int = 0) -> None:
    self._delete_requested = True
    self.accept()

  def settings(self) -> AiSpawnEggSettings:
    return AiSpawnEggSettings(
      mode=str(self._mode_combo.currentData()),
      personality=str(self._personality_combo.currentData()),
      can_place_blocks=bool(self._can_place_blocks.isChecked()),
      name=str(self._name_edit.text()).strip(),
      health_indicator=str(self._health_indicator_combo.currentData()),
      skin_mode=str(self._skin_mode_combo.currentData()),
      skin_id=str(self._settings.skin_id),
      auto_regen_enabled=bool(self._regen_enabled.isChecked()),
      regen_start_delay_s=float(self._regen_delay_spin.value()),
      regen_interval_s=float(self._interval_from_ui()),
      regen_amount_hp=float(self._settings.regen_amount_hp),
      regen_cap_hp=float(self._regen_cap_spin.value()),
      route_points=tuple(self._settings.route_points),
      route_closed=bool(self._route_closed.isChecked()),
      route_run=bool(self._route_run.isChecked()),
      route_style=str(self._route_style_combo.currentData()),
    ).normalized()

  def route_edit_requested(self) -> bool:
    return bool(self._edit_route_requested)

  def delete_requested(self) -> bool:
    return bool(self._delete_requested)
