# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable
from dataclasses import replace

from PyQt6.QtCore import QSignalBlocker
from PyQt6.QtWidgets import QCheckBox, QComboBox, QDoubleSpinBox, QLabel, QLineEdit, QPushButton, QWidget

from ludoxel.presentation.interface.common.sidebar_dialog import SidebarDialogBase
from ludoxel.presentation.interface.common.themed_notice_dialog import show_themed_notice
from ludoxel.presentation.interface.settings.surface import add_page_header, add_setting_row, add_settings_card
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

_AI_NAME_INPUT_MAX_LENGTH = int(AI_NAME_BODY_MAX_LENGTH) + 5
_REGEN_CAP_MIN_UI = 1.0
_REGEN_CAP_MAX_UI = 20.0
_REGEN_DELAY_MIN_UI = 0.0
_REGEN_DELAY_MAX_UI = 60.0
_REGEN_TIME_TO_CAP_MIN_UI = 0.5
_REGEN_TIME_TO_CAP_MAX_UI = 3600.0


class AiSettingsOverlay(SidebarDialogBase):
  """
  選択中の AI actor 一体を、Pause 画面の Settings dialog と同じ sidebar、page header、card、setting row 構造で編集する detached dialog を表す。
  編集対象は責務別 page(Identity、Display、Skin、Health、Behavior、Block Placement)に分割し、独立した Safety tab と Route tab は持たず、
  Safety guidance は Block Placement page の section、Route 操作は Behavior page の section として統合する。
  footer の Save/Cancel button は持たず、有効な各変更は settings_updater を介して session 境界へ即時反映するため、dialog の close 又は reject は既に反映済みの値を取り消さない。
  入力は AiSpawnEggSettings として受け取り、settings() は現在の control 状態を同型の正規化済み値として返す。
  名前の重複検査は生存 actor 集合を知る session 側 validator を name_validator として注入する。
  skin source は player skin 共有、同梱 Alex skin、actor 固有 import PNG の三択であり、actor 固有 import PNG の登録は Skin source combo で Imported PNG を選択した時だけ skin_importer を介して presentation の skin resource 経路へ委譲する。import 済み PNG の実体保存・参照解決・renderer push は dialog の外側が担い、dialog は skin_mode と skin_id の選択だけを所有する。
  自動回復の interval は UI 上では「上限まで回復し切るのに要する秒数」として編集し、保存時に interval = time_to_cap * amount / cap へ写像する。amount は既存設定値を保持する。
  """

  def __init__(
    self,
    *,
    parent: QWidget | None = None,
    settings: AiSpawnEggSettings,
    name_validator: Callable[[str], str | None] | None = None,
    settings_updater: Callable[[AiSpawnEggSettings], bool] | None = None,
    skin_importer: Callable[[str], str | None] | None = None,
    skin_available: Callable[[str], bool] | None = None,
  ) -> None:
    super().__init__(
      parent,
      as_window=True,
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
    self._edit_route_requested = False
    self._delete_requested = False

    self._tab_identity = self._make_tab_button("Identity", 0, self._set_page)
    self._tab_display = self._make_tab_button("Display", 1, self._set_page)
    self._tab_skin = self._make_tab_button("Skin", 2, self._set_page)
    self._tab_health = self._make_tab_button("Health", 3, self._set_page)
    self._tab_behavior = self._make_tab_button("Behavior", 4, self._set_page)
    self._tab_placement = self._make_tab_button("Block Placement", 5, self._set_page)
    self._tab_buttons = (self._tab_identity, self._tab_display, self._tab_skin, self._tab_health, self._tab_behavior, self._tab_placement)
    for button in self._tab_buttons:
      self._sidebar_layout.addWidget(button)
    self._sidebar_layout.addStretch(1)

    self._delete_button = self._make_tab_button("Delete AI", 0, self._request_delete)
    self._delete_button.setObjectName("dangerBtn")
    self._delete_button.setCheckable(False)
    self._delete_button.setAutoExclusive(False)
    self._sidebar_layout.addWidget(self._delete_button)

    self._build_identity_page()
    self._build_display_page()
    self._build_skin_page()
    self._build_health_page()
    self._build_behavior_page()
    self._build_placement_page()
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

  def _connect_immediate_updates(self) -> None:
    """
    各 control の値変更を、有効な変更を session 境界へ即時反映する handler へ接続する。
    接続は control 値を初期化する _load_settings の後に行うため、初期 load 中の signal は反映経路を起動しない。
    skin mode の変更だけは custom 選択時の import 要求を伴うため専用 handler を経由し、
    その他の control は変更種別に応じた sync と _persist_current_settings を呼ぶ。
    """
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
    """
    与えられた settings の値を各 control へ反映し、派生表示も初期化する。
    この呼び出しは _connect_immediate_updates より前に行われ、ここで control 値を設定しても即時反映経路は起動しない。skin source の combo 反映後に _sync_skin_controls を呼び、skin status を初期化する。
    """
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
    """
    現在の skin_mode と skin_id の状態から、Skin Source card 内の skin status 文言だけを更新する。
    Imported PNG は独立した section や button を持たず、Skin source combo の三択だけで選択する。
    """
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
    """
    skin source combo の変更を処理する。
    Imported PNG を選択し、かつ有効な import 済み PNG が無い場合は import を要求し、import が失敗又は cancel された場合は直前に反映済みの skin source へ戻して反映しない。それ以外は現在の skin source を即時反映し、status 表記を更新する。
    """
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
    """
    actor 固有 import PNG の登録を要求し、成功した場合に Imported PNG mode と新 skin_id を即時反映する。
    skin_importer が未注入の場合は通知して偽を返す。importer が新 skin_id を返した場合は combo を Imported PNG へ揃えてから skin_mode と skin_id を含む候補を反映する。反映に失敗した場合は combo を直前の skin source へ戻す。旧 skin_id file の解放は呼び出し側 apply 経路が skin_id の変化として処理する。
    """
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
    """
    正規化済み候補を session 境界へ反映する。
    候補が直前に反映済みの settings と同一なら no-op として真を返す。settings_updater が注入され、反映に失敗した場合は必要に応じて通知して偽を返し、反映済み settings は更新しない。反映に成功した場合は反映済み settings を候補へ更新し、route summary を再表示する。
    """
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
    """
    現在の control 状態から候補を構築し、即時反映する。
    名前が無効な間はその名前を反映せず直前の有効名を保持し、route mode かつ route point が 2 点未満の間は route mode を反映せず直前の mode を保持する。
    これにより無効入力の途中状態が runtime や persistence へ反映されることを防ぐ。
    """
    candidate = self.settings()
    if self._current_name_error() is not None:
      candidate = replace(candidate, name=str(self._settings.name)).normalized()
    if str(candidate.mode) == AI_MODE_ROUTE and len(candidate.route_points) < 2:
      candidate = replace(candidate, mode=str(self._settings.mode)).normalized()
    return self._persist_candidate(candidate)

  def _request_route_edit(self) -> None:
    """
    名前が有効であることを確認したうえで、現在の非 route 設定を反映してから world 上の route 編集へ遷移する。
    名前が無効な場合は Identity page へ誘導して遷移しない。route mode は route point が確定するまで反映できないため、
    反映候補の mode は直前の有効な mode へ固定し、反映に成功した場合だけ route 編集要求を立てて dialog を閉じる。
    """
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
