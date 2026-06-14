# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable

from PyQt6.QtWidgets import QCheckBox, QComboBox, QDoubleSpinBox, QHBoxLayout, QLabel, QLineEdit, QPushButton, QWidget

from ludoxel.presentation.interface.common.sidebar_dialog import SidebarDialogBase
from ludoxel.presentation.interface.common.themed_notice_dialog import show_themed_notice
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
  AiSpawnEggSettings,
)

_AI_NAME_INPUT_MAX_LENGTH = int(AI_NAME_BODY_MAX_LENGTH) + 5
_REGEN_CAP_MIN_UI = 1.0
_REGEN_CAP_MAX_UI = 20.0
_REGEN_DELAY_MIN_UI = 0.0
_REGEN_DELAY_MAX_UI = 60.0
_REGEN_TIME_TO_CAP_MIN_UI = 0.5
_REGEN_TIME_TO_CAP_MAX_UI = 3600.0


class AiSettingsOverlay(SidebarDialogBase):
  """
  選択中の AI actor 一体の設定を責務別 page(Identity、Display、Health、Behavior、Safety、Block Placement、Route)で編集する detached dialog を表す。
  入力は AiSpawnEggSettings として受け取り、保存時は settings() が同型の正規化済み値を返す。名前の重複検査は生存 actor 集合を知る session 側 validator を name_validator として注入する。
  自動回復の interval は UI 上では「上限まで回復し切るのに要する秒数」として編集し、保存時に interval = time_to_cap * amount / cap へ写像する。amount は既存設定値を保持する。
  """

  def __init__(self, *, parent: QWidget | None = None, settings: AiSpawnEggSettings, name_validator: Callable[[str], str | None] | None = None) -> None:
    super().__init__(
      parent,
      as_window=True,
      root_object_name="settingsRoot",
      window_title="AI Settings",
      window_size=(920, 720),
      minimum_window_size=(820, 640),
      panel_minimum_size=(760, 560),
      sidebar_object_name="settingsSidebar",
      content_object_name="settingsContent",
      stack_object_name="settingsStack",
    )
    self._settings = settings.normalized()
    self._name_validator = name_validator
    self._edit_route_requested = False
    self._delete_requested = False

    self._tab_identity = self._make_tab_button("Identity", 0, self._set_page)
    self._tab_display = self._make_tab_button("Display", 1, self._set_page)
    self._tab_health = self._make_tab_button("Health", 2, self._set_page)
    self._tab_behavior = self._make_tab_button("Behavior", 3, self._set_page)
    self._tab_safety = self._make_tab_button("Safety", 4, self._set_page)
    self._tab_placement = self._make_tab_button("Block Placement", 5, self._set_page)
    self._tab_route = self._make_tab_button("Route", 6, self._set_page)
    self._tab_buttons = (self._tab_identity, self._tab_display, self._tab_health, self._tab_behavior, self._tab_safety, self._tab_placement, self._tab_route)
    for button in self._tab_buttons:
      self._sidebar_layout.addWidget(button)
    self._sidebar_layout.addStretch(1)
    self._delete_button = self._make_tab_button("Delete AI", 99, self._request_delete)
    self._delete_button.setChecked(False)
    self._delete_button.setAutoExclusive(False)
    self._sidebar_layout.addWidget(self._delete_button)

    self._build_identity_page()
    self._build_display_page()
    self._build_health_page()
    self._build_behavior_page()
    self._build_safety_page()
    self._build_placement_page()
    self._build_route_page()
    self._build_footer()
    self._load_settings(self._settings)
    self._sync_route_controls()
    self._sync_regen_controls()
    self._set_page(0)

  @staticmethod
  def _add_section_title(layout, host: QWidget, text: str) -> None:
    title = QLabel(str(text), host)
    title.setObjectName("sectionTitle")
    layout.addWidget(title)

  @staticmethod
  def _add_subtitle(layout, host: QWidget, text: str) -> QLabel:
    label = QLabel(str(text), host)
    label.setObjectName("subtitle")
    label.setWordWrap(True)
    layout.addWidget(label)
    return label

  @staticmethod
  def _add_value_label(layout, host: QWidget, text: str) -> None:
    label = QLabel(str(text), host)
    label.setObjectName("valueLabel")
    layout.addWidget(label)

  def _build_identity_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    self._add_section_title(layout, host, "Identity")
    self._add_subtitle(
      layout,
      host,
      "The AI name is shown on the nametag above the AI. The name body may contain only letters and digits, cannot start with a digit, and must be 1 to 16 characters long. "
      "A numbered suffix from #0001 to #9999 can distinguish AI that share the same name body. Names of live AI must be unique; names of dead or removed AI are released.",
    )
    self._add_value_label(layout, host, "AI Name")
    self._name_edit = QLineEdit(host)
    self._name_edit.setMaxLength(int(_AI_NAME_INPUT_MAX_LENGTH))
    self._name_edit.setPlaceholderText("Example: Guard or Guard#0001")
    self._name_edit.textChanged.connect(self._sync_name_feedback)
    layout.addWidget(self._name_edit)
    self._name_feedback = self._add_subtitle(layout, host, "")
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_display_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    self._add_section_title(layout, host, "Display")
    self._add_subtitle(layout, host, "The nametag always shows the AI name in the world. The health indicator draws the AI's hearts near the nametag; one heart equals two health points.")
    self._add_value_label(layout, host, "Health indicator")
    self._health_indicator_combo = QComboBox(host)
    self._health_indicator_combo.addItem("Off", userData=AI_HEALTH_INDICATOR_OFF)
    self._health_indicator_combo.addItem("Above nametag", userData=AI_HEALTH_INDICATOR_ABOVE)
    self._health_indicator_combo.addItem("Below nametag", userData=AI_HEALTH_INDICATOR_BELOW)
    layout.addWidget(self._health_indicator_combo)
    self._add_subtitle(layout, host, "Off hides the hearts entirely and is the default. Above nametag and Below nametag place the heart row directly above or below the name without overlapping it.")
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_health_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    self._add_section_title(layout, host, "Health")
    self._add_subtitle(
      layout,
      host,
      "Auto regeneration is disabled by default, which keeps the current behavior: the AI never heals on its own. "
      "When enabled, the AI waits for the configured delay after its most recent damage, then recovers gradually up to the configured cap. Taking damage restarts the delay.",
    )
    self._regen_enabled = QCheckBox("Enable auto regeneration", host)
    self._regen_enabled.toggled.connect(self._sync_regen_controls)
    layout.addWidget(self._regen_enabled)

    self._add_value_label(layout, host, "Regeneration start delay (seconds after last damage)")
    self._regen_delay_spin = QDoubleSpinBox(host)
    self._regen_delay_spin.setRange(float(_REGEN_DELAY_MIN_UI), float(_REGEN_DELAY_MAX_UI))
    self._regen_delay_spin.setDecimals(1)
    self._regen_delay_spin.setSingleStep(0.5)
    self._regen_delay_spin.valueChanged.connect(self._sync_regen_summary)
    layout.addWidget(self._regen_delay_spin)

    self._add_value_label(layout, host, "Regeneration cap (health points)")
    self._regen_cap_spin = QDoubleSpinBox(host)
    self._regen_cap_spin.setRange(float(_REGEN_CAP_MIN_UI), float(_REGEN_CAP_MAX_UI))
    self._regen_cap_spin.setDecimals(0)
    self._regen_cap_spin.setSingleStep(1.0)
    self._regen_cap_spin.valueChanged.connect(self._sync_regen_summary)
    layout.addWidget(self._regen_cap_spin)

    self._add_value_label(layout, host, "Time to reach the cap (seconds of uninterrupted healing)")
    self._regen_time_to_cap_spin = QDoubleSpinBox(host)
    self._regen_time_to_cap_spin.setRange(float(_REGEN_TIME_TO_CAP_MIN_UI), float(_REGEN_TIME_TO_CAP_MAX_UI))
    self._regen_time_to_cap_spin.setDecimals(1)
    self._regen_time_to_cap_spin.setSingleStep(1.0)
    self._regen_time_to_cap_spin.valueChanged.connect(self._sync_regen_summary)
    layout.addWidget(self._regen_time_to_cap_spin)

    self._regen_summary = self._add_subtitle(layout, host, "")
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_behavior_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    self._add_section_title(layout, host, "Behavior")
    self._add_subtitle(layout, host, "This overlay edits the selected AI instance. Newly spawned AI stays on standby until a role is assigned here.")
    self._add_value_label(layout, host, "Mode")
    self._mode_combo = QComboBox(host)
    self._mode_combo.addItem("Standby", userData=AI_MODE_IDLE)
    self._mode_combo.addItem("Free Roam / PVP", userData=AI_MODE_WANDER)
    self._mode_combo.addItem("Route Patrol", userData=AI_MODE_ROUTE)
    layout.addWidget(self._mode_combo)
    self._add_value_label(layout, host, "Personality")
    self._personality_combo = QComboBox(host)
    self._personality_combo.addItem("Aggressive", userData=AI_PERSONALITY_AGGRESSIVE)
    self._personality_combo.addItem("Peaceful", userData=AI_PERSONALITY_PEACEFUL)
    layout.addWidget(self._personality_combo)
    self._mode_description = self._add_subtitle(layout, host, "")
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_safety_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    self._add_section_title(layout, host, "Safety")
    self._add_subtitle(
      layout,
      host,
      "Movement safety is always active and has no toggles. Before walking forward on the ground, the AI checks whether the next footing exists. "
      "If there is no landing surface within a safe drop below the next step, the AI stops instead of walking off the edge.",
    )
    self._add_subtitle(
      layout,
      host,
      "In Free Roam and PVP, drops of up to three blocks onto solid ground are allowed; deeper gaps and the void stop the chase or make the AI turn away. "
      "While following a route, deeper descents are allowed only when ground exists below the next step; a void ahead always stops forward movement.",
    )
    self._add_subtitle(
      layout,
      host,
      "When block placement is allowed, the AI may bridge a gap by securing the next footing before advancing. When block placement is disabled, the AI stops or turns away rather than falling.",
    )
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_placement_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    self._add_section_title(layout, host, "Block Placement")
    self._can_place_blocks = QCheckBox("Allow block placement", host)
    layout.addWidget(self._can_place_blocks)
    self._add_subtitle(
      layout,
      host,
      "Block placement is a movement aid, not a free build permission. The AI uses it to bridge gaps, secure the next footing before stepping forward, escape when boxed in, and protect itself in combat.",
    )
    self._add_subtitle(
      layout,
      host,
      "Placement requires a clear line of sight: if any block sits between the AI's eyes and the targeted placement face, the placement is cancelled instead of being placed through the obstruction. "
      "While bridging, the AI does not keep walking ahead of an unfinished bridge; forward movement waits until the next footing exists.",
    )
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_route_page(self) -> None:
    scroll, host, layout = self._make_scroll_page()
    self._add_section_title(layout, host, "Route")
    self._add_subtitle(layout, host, "Route patrol uses the dedicated route hotbar. The first slot confirms the draft, the second slot is the eraser, and the rightmost slot cancels the edit.")

    self._add_value_label(layout, host, "Route style")
    self._route_style_combo = QComboBox(host)
    self._route_style_combo.addItem("Strict", userData=AI_ROUTE_STYLE_STRICT)
    self._route_style_combo.addItem("Flexible", userData=AI_ROUTE_STYLE_FLEXIBLE)
    layout.addWidget(self._route_style_combo)
    self._add_subtitle(
      layout,
      host,
      "Strict follows the authored route directly and does not search for detours; getting stuck against blocks is accepted. "
      "Flexible plans a walkable path toward each route point in a background worker, can detour, recover from blocked spots, and bridge gaps when block placement is allowed. "
      "Route points that repeatedly fail are skipped for a cooldown period instead of being retried without limit.",
    )

    self._route_run = QCheckBox("Run route segments", host)
    layout.addWidget(self._route_run)
    self._add_subtitle(
      layout, host, "When enabled, the AI sprints while traveling along each route segment instead of walking. Only the movement speed changes; the route order and targets stay the same."
    )

    self._route_closed = QCheckBox("Treat route as a closed loop", host)
    layout.addWidget(self._route_closed)
    self._add_subtitle(
      layout,
      host,
      "When enabled, the final route point connects back to the first route point, and that closing segment is part of the patrol loop. "
      "When disabled, the AI still returns toward the first route point after the final one, but the direct closing connection is not treated as an authored segment.",
    )

    self._route_summary = self._add_subtitle(layout, host, "")

    button_row = QHBoxLayout()
    self._edit_route_button = QPushButton("Edit Route", host)
    self._edit_route_button.setObjectName("menuBtn")
    self._edit_route_button.clicked.connect(self._request_route_edit)
    button_row.addWidget(self._edit_route_button)
    button_row.addStretch(1)
    layout.addLayout(button_row)
    layout.addStretch(1)
    self._stack.addWidget(scroll)

  def _build_footer(self) -> None:
    footer = QWidget(self)
    footer_layout = QHBoxLayout(footer)
    footer_layout.setContentsMargins(18, 14, 18, 0)
    footer_layout.setSpacing(12)
    footer_layout.addStretch(1)

    self._cancel_button = QPushButton("Cancel", footer)
    self._cancel_button.setObjectName("menuBtn")
    self._cancel_button.clicked.connect(self.reject)
    footer_layout.addWidget(self._cancel_button)

    self._save_button = QPushButton("Save", footer)
    self._save_button.setObjectName("menuBtn")
    self._save_button.clicked.connect(self._accept_with_validation)
    footer_layout.addWidget(self._save_button)
    self._content_layout.addWidget(footer)

  def _set_page(self, index: int) -> None:
    self._set_stack_page(index=index, max_index=len(self._tab_buttons) - 1, tab_buttons=self._tab_buttons)

  @staticmethod
  def _time_to_cap_from_settings(settings: AiSpawnEggSettings) -> float:
    """
    保存値 (interval, amount, cap) から UI 表示用の「上限まで回復し切る秒数」を計算する。
    回復 tick 数は cap / amount であり、time_to_cap = interval * cap / amount を UI spin の値域へ clamp して返す。
    """
    amount = max(1e-6, float(settings.regen_amount_hp))
    cap = max(float(_REGEN_CAP_MIN_UI), float(settings.regen_cap_hp))
    time_to_cap = float(settings.regen_interval_s) * float(cap) / float(amount)
    return float(min(float(_REGEN_TIME_TO_CAP_MAX_UI), max(float(_REGEN_TIME_TO_CAP_MIN_UI), float(time_to_cap))))

  def _interval_from_ui(self) -> float:
    """
    UI の「上限まで回復し切る秒数」と cap、既存設定の amount から保存用の回復間隔秒数を計算する。
    interval = time_to_cap * amount / cap であり、値域の最終 clamp は AiSpawnEggSettings.normalized() が行う。
    """
    amount = max(1e-6, float(self._settings.regen_amount_hp))
    cap = max(float(_REGEN_CAP_MIN_UI), float(self._regen_cap_spin.value()))
    return float(self._regen_time_to_cap_spin.value()) * float(amount) / float(cap)

  def _load_settings(self, settings: AiSpawnEggSettings) -> None:
    self._settings = settings.normalized()
    self._name_edit.setText(str(self._settings.name))
    self._set_combo_value(self._health_indicator_combo, str(self._settings.health_indicator))
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
    self._route_summary.setText(self._route_summary_text())
    self._mode_combo.currentIndexChanged.connect(self._sync_route_controls)
    self._mode_combo.currentIndexChanged.connect(self._sync_mode_description)
    self._sync_mode_description()
    self._sync_name_feedback()
    self._sync_regen_summary()

  def _route_summary_text(self) -> str:
    point_count = len(self._settings.route_points)
    loop_text = "Closed loop" if bool(self._settings.route_closed) else "Open route"
    return f"{point_count} point(s) recorded. {loop_text}."

  @staticmethod
  def _set_combo_value(combo: QComboBox, value: str) -> None:
    target = str(value)
    for index in range(combo.count()):
      if str(combo.itemData(index)) == target:
        combo.setCurrentIndex(index)
        return

  def _current_name_error(self) -> str | None:
    """
    名前入力欄の現在値に対する validation error を返す。
    形式規則は naming module の検査を常に適用し、session 側 validator が注入されている場合は生存 AI との重複検査を加える。
    有効な場合は None を返す。
    """
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
      self._name_feedback.setText("This name is available.")
      return
    self._name_feedback.setText(f"Cannot save: {error}")

  def _sync_regen_controls(self) -> None:
    enabled = bool(self._regen_enabled.isChecked())
    self._regen_delay_spin.setEnabled(enabled)
    self._regen_cap_spin.setEnabled(enabled)
    self._regen_time_to_cap_spin.setEnabled(enabled)
    self._sync_regen_summary()

  def _sync_regen_summary(self) -> None:
    if not bool(self._regen_enabled.isChecked()):
      self._regen_summary.setText("Auto regeneration is disabled. The AI keeps the current behavior and never heals on its own.")
      return
    delay = float(self._regen_delay_spin.value())
    cap = float(self._regen_cap_spin.value())
    time_to_cap = float(self._regen_time_to_cap_spin.value())
    amount = max(1e-6, float(self._settings.regen_amount_hp))
    interval = max(1e-6, float(time_to_cap) * float(amount) / max(1.0, float(cap)))
    self._regen_summary.setText(
      f"After {delay:.1f} s without damage, the AI heals {amount:.1f} health point(s) every {interval:.1f} s, "
      f"up to {cap:.0f} health points (capped by the AI's max health). Healing the full cap takes about {time_to_cap:.1f} s. Taking damage restarts the delay."
    )

  def _sync_route_controls(self) -> None:
    route_mode = str(self._mode_combo.currentData()) == AI_MODE_ROUTE
    self._route_style_combo.setEnabled(bool(route_mode))
    self._route_run.setEnabled(bool(route_mode))
    self._route_closed.setEnabled(bool(route_mode))
    self._edit_route_button.setEnabled(True)

  def _sync_mode_description(self) -> None:
    mode = str(self._mode_combo.currentData())
    if mode == AI_MODE_ROUTE:
      self._mode_description.setText(
        "Route Patrol follows the authored path, can engage the player at close range, and returns to the route when the target escapes. Walking near edges uses the movement safety checks from the Safety page."
      )
      return
    if mode == AI_MODE_WANDER:
      self._mode_description.setText(
        "Free Roam / PVP uses the player kinematics, collision, jump, placement, and interaction path and can attack in survival mode when the target is inside the melee line. "
        "Before stepping forward, the AI checks the next footing and stops or turns away instead of walking into the void."
      )
      return
    self._mode_description.setText("Standby keeps the AI waiting at its current position until a role is assigned.")

  def _accept_with_validation(self) -> None:
    name_error = self._current_name_error()
    if name_error is not None:
      show_themed_notice(parent=self, title="AI Name", message=str(name_error), nav_label="AI Name")
      self._set_page(0)
      return
    if str(self._mode_combo.currentData()) == AI_MODE_ROUTE and len(self._settings.route_points) < 2:
      show_themed_notice(parent=self, title="AI Route", message="Route mode requires at least two route points.", nav_label="AI Route")
      self._set_page(6)
      return
    self.accept()

  def _request_route_edit(self) -> None:
    self._set_combo_value(self._mode_combo, AI_MODE_ROUTE)
    self._sync_route_controls()
    self._sync_mode_description()
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
