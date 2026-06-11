# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QCheckBox, QComboBox, QFrame, QGridLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.preferences.camera import CAMERA_PERSPECTIVE_LABELS, CAMERA_PERSPECTIVE_ORDER
from ludoxel.application.preferences.keybinds import CONTROL_SECTION_GAMEPLAY, CONTROL_SECTION_MOVEMENT, HOTBAR_ACTIONS
from ludoxel.application.preferences.runtime import RuntimePreferences
from ludoxel.presentation.interface.settings.cloud_flow import CLOUD_FLOW_OPTIONS
from ludoxel.presentation.interface.settings.surface import add_page_header, add_setting_row, add_settings_card
from ludoxel.presentation.interface.settings.widgets.crosshair import CrosshairPixelEditor, CrosshairPreviewWidget
from ludoxel.presentation.interface.settings.widgets.scalar import AdvancedScalarControl
from ludoxel.simulation.worlds.config.movement import DEFAULT_MOVEMENT_PARAMS

if TYPE_CHECKING:
  from ludoxel.presentation.interface.settings.overlay import SettingsOverlay


def build_display_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  add_page_header(layout, host, title="Display", subtitle="Camera, window, HUD, view motion, player model, and crosshair presentation.")
  _camera_card, camera_body, camera_layout = add_settings_card(layout, host, title="Display", description="Camera projection, mouse response, perspective, and axis direction.")

  overlay._lbl_fov = QLabel("FOV: 80 deg", host)
  overlay._sld_fov = overlay._new_slider(host, int(overlay._params.fov_min), int(overlay._params.fov_max))
  overlay._sld_fov.valueChanged.connect(overlay._on_fov)
  add_setting_row(camera_layout, camera_body, label="Field of view", description="Vertical camera field of view in degrees.", control=overlay._sld_fov, label_widget=overlay._lbl_fov)

  overlay._lbl_camera_perspective = QLabel("Camera perspective", host)
  overlay._cmb_camera_perspective = QComboBox(host)
  for value in CAMERA_PERSPECTIVE_ORDER:
    overlay._cmb_camera_perspective.addItem(str(CAMERA_PERSPECTIVE_LABELS[str(value)]), userData=str(value))
  overlay._cmb_camera_perspective.currentIndexChanged.connect(overlay._on_camera_perspective)
  add_setting_row(
    camera_layout,
    camera_body,
    label="Camera perspective",
    description="First-person, third-person back, or third-person front view.",
    control=overlay._cmb_camera_perspective,
    label_widget=overlay._lbl_camera_perspective,
  )

  overlay._lbl_sens = QLabel("Mouse sensitivity: 0.090 deg/px", host)
  overlay._sld_sens = overlay._new_slider(host, int(overlay._params.sens_milli_min), int(overlay._params.sens_milli_max))
  overlay._sld_sens.valueChanged.connect(overlay._on_sens)
  add_setting_row(camera_layout, camera_body, label="Mouse sensitivity", description="Camera rotation in degrees per relative mouse pixel.", control=overlay._sld_sens, label_widget=overlay._lbl_sens)

  invert_control = QWidget(camera_body)
  invert_layout = QHBoxLayout(invert_control)
  invert_layout.setContentsMargins(0, 0, 0, 0)
  invert_layout.setSpacing(12)
  overlay._cb_inv_x = QCheckBox("Invert X", invert_control)
  overlay._cb_inv_y = QCheckBox("Invert Y", invert_control)
  overlay._cb_inv_x.toggled.connect(overlay.invert_x_changed.emit)
  overlay._cb_inv_y.toggled.connect(overlay.invert_y_changed.emit)
  invert_layout.addWidget(overlay._cb_inv_x)
  invert_layout.addWidget(overlay._cb_inv_y)
  add_setting_row(camera_layout, camera_body, label="Invert axes", description="Reverse horizontal or vertical mouse-look direction.", control=invert_control)

  _window_card, window_body, window_layout = add_settings_card(layout, host, title="Window and HUD", description="Desktop mode and first-person presentation visibility.")
  overlay._tg_fullscreen = overlay._add_toggle(window_layout, window_body, "Fullscreen", overlay.fullscreen_changed.emit)
  overlay._tg_hide_hud = overlay._add_toggle(window_layout, window_body, "Hide HUD", overlay.hide_hud_changed.emit)
  overlay._tg_hide_hand = overlay._add_toggle(window_layout, window_body, "Hide Hand", overlay.hide_hand_changed.emit)

  _model_card, model_body, model_layout = add_settings_card(layout, host, title="Player Model", description="First-person arm rotation and swing timing limits.")

  overlay._ctl_arm_rotation_limit_min = AdvancedScalarControl(
    title="Arm rotation minimum",
    min_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MIN_DEG),
    max_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MAX_DEG),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MIN_DEG),
    parent=model_body,
  )
  overlay._ctl_arm_rotation_limit_min.value_changed.connect(overlay.arm_rotation_limit_min_changed.emit)
  model_layout.addWidget(overlay._ctl_arm_rotation_limit_min)

  overlay._ctl_arm_rotation_limit_max = AdvancedScalarControl(
    title="Arm rotation maximum",
    min_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MIN_DEG),
    max_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MAX_DEG),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MAX_DEG),
    parent=model_body,
  )
  overlay._ctl_arm_rotation_limit_max.value_changed.connect(overlay.arm_rotation_limit_max_changed.emit)
  model_layout.addWidget(overlay._ctl_arm_rotation_limit_max)

  overlay._ctl_arm_swing_duration = AdvancedScalarControl(
    title="Arm swing duration",
    min_value=float(RuntimePreferences.ARM_SWING_DURATION_MIN_S),
    max_value=float(RuntimePreferences.ARM_SWING_DURATION_MAX_S),
    slider_scale=100.0,
    decimals=2,
    default_value=float(RuntimePreferences.DEFAULT_ARM_SWING_DURATION_S),
    parent=model_body,
  )
  overlay._ctl_arm_swing_duration.value_changed.connect(overlay.arm_swing_duration_changed.emit)
  model_layout.addWidget(overlay._ctl_arm_swing_duration)

  _motion_card, motion_body, motion_layout = add_settings_card(layout, host, title="View Motion", description="Camera movement effects and their strength.")

  overlay._tg_view_bobbing = overlay._add_toggle(motion_layout, motion_body, "View bobbing", overlay._on_view_bobbing_toggled)
  overlay._lbl_view_bobbing_strength = QLabel("View bobbing strength: 35%", host)
  overlay._sld_view_bobbing_strength = overlay._new_slider(host, int(overlay._params.bob_strength_percent_min), int(overlay._params.bob_strength_percent_max))
  overlay._sld_view_bobbing_strength.valueChanged.connect(overlay._on_view_bobbing_strength)
  add_setting_row(
    motion_layout,
    motion_body,
    label="View bobbing strength",
    description="Amplitude applied while walking.",
    control=overlay._sld_view_bobbing_strength,
    label_widget=overlay._lbl_view_bobbing_strength,
  )

  overlay._tg_camera_shake = overlay._add_toggle(motion_layout, motion_body, "Camera shake", overlay._on_camera_shake_toggled)
  overlay._lbl_camera_shake_strength = QLabel("Camera shake strength: 20%", host)
  overlay._sld_camera_shake_strength = overlay._new_slider(host, int(overlay._params.shake_strength_percent_min), int(overlay._params.shake_strength_percent_max))
  overlay._sld_camera_shake_strength.valueChanged.connect(overlay._on_camera_shake_strength)
  add_setting_row(
    motion_layout,
    motion_body,
    label="Camera shake strength",
    description="Amplitude applied by camera shake events.",
    control=overlay._sld_camera_shake_strength,
    label_widget=overlay._lbl_camera_shake_strength,
  )

  _crosshair_card, crosshair_body, crosshair_layout = add_settings_card(layout, host, title="Crosshair", description="Edit the custom 16 x 16 bitmap or return to the built-in art.")

  crosshair_preview_row = QHBoxLayout()
  overlay._crosshair_preview = CrosshairPreviewWidget(crosshair_body)
  crosshair_preview_row.addWidget(overlay._crosshair_preview)
  crosshair_preview_row.addStretch(1)
  crosshair_layout.addLayout(crosshair_preview_row)

  overlay._crosshair_editor = CrosshairPixelEditor(crosshair_body)
  overlay._crosshair_editor.pixels_changed.connect(overlay.crosshair_pixels_changed.emit)
  crosshair_layout.addWidget(overlay._crosshair_editor)

  overlay._btn_crosshair_reset = QPushButton("Reset to Built-in Crosshair", crosshair_body)
  overlay._btn_crosshair_reset.setObjectName("dangerBtn")
  overlay._btn_crosshair_reset.clicked.connect(overlay.crosshair_clear_requested.emit)
  crosshair_layout.addWidget(overlay._btn_crosshair_reset)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_world_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  add_page_header(layout, host, title="World", subtitle="Rendering distance, block visuals, particles, clouds, and sun presentation.")
  _world_card, world_body, world_layout = add_settings_card(layout, host, title="World", description="Distance and renderer modes shared by visible world geometry.")

  overlay._lbl_rd = QLabel("Render distance: 6 chunks", host)
  overlay._sld_rd = overlay._new_slider(host, int(overlay._params.render_dist_min), int(overlay._params.render_dist_max))
  overlay._sld_rd.valueChanged.connect(overlay._on_rd)
  add_setting_row(world_layout, world_body, label="Render distance", description="Chunk radius uploaded around the player.", control=overlay._sld_rd, label_widget=overlay._lbl_rd)

  overlay._tg_animated_textures = overlay._add_toggle(world_layout, world_body, "Animated Textures", overlay.animated_textures_changed.emit)
  overlay._tg_outline_sel = overlay._add_toggle(world_layout, world_body, "Outline selection", overlay.outline_selection_changed.emit)
  overlay._tg_world_wire = overlay._add_toggle(world_layout, world_body, "World wireframe", overlay.world_wireframe_changed.emit)
  overlay._tg_shadow_enabled = overlay._add_toggle(world_layout, world_body, "Shadow map", overlay.shadow_enabled_changed.emit)

  _particles_card, particles_body, particles_layout = add_settings_card(layout, host, title="Particles", description="Block-break particle emission and movement.")

  overlay._ctl_block_break_particle_spawn_rate = AdvancedScalarControl(
    title="Break particle spawn rate",
    min_value=float(overlay._params.block_break_particle_spawn_rate_milli_min) / float(overlay._params.block_break_particle_spawn_rate_scale),
    max_value=float(overlay._params.block_break_particle_spawn_rate_milli_max) / float(overlay._params.block_break_particle_spawn_rate_scale),
    slider_scale=float(overlay._params.block_break_particle_spawn_rate_scale),
    decimals=int(overlay._params.block_break_particle_spawn_rate_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPAWN_RATE),
    parent=particles_body,
  )
  overlay._ctl_block_break_particle_spawn_rate.value_changed.connect(overlay.block_break_particle_spawn_rate_changed.emit)
  particles_layout.addWidget(overlay._ctl_block_break_particle_spawn_rate)

  overlay._ctl_block_break_particle_speed_scale = AdvancedScalarControl(
    title="Break particle speed",
    min_value=float(overlay._params.block_break_particle_speed_milli_min) / float(overlay._params.block_break_particle_speed_scale),
    max_value=float(overlay._params.block_break_particle_speed_milli_max) / float(overlay._params.block_break_particle_speed_scale),
    slider_scale=float(overlay._params.block_break_particle_speed_scale),
    decimals=int(overlay._params.block_break_particle_speed_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPEED_SCALE),
    parent=particles_body,
  )
  overlay._ctl_block_break_particle_speed_scale.value_changed.connect(overlay.block_break_particle_speed_scale_changed.emit)
  particles_layout.addWidget(overlay._ctl_block_break_particle_speed_scale)

  _cloud_card, cloud_body, cloud_layout = add_settings_card(layout, host, title="Clouds", description="Visibility, wireframe, density, seed, and flow direction.")

  overlay._tg_clouds_enabled = overlay._add_toggle(cloud_layout, cloud_body, "Show clouds", overlay._on_clouds_toggled)
  overlay._tg_cloud_wire = overlay._add_toggle(cloud_layout, cloud_body, "Cloud wireframe", overlay.cloud_wireframe_changed.emit)

  overlay._lbl_cloud_flow = QLabel("Cloud flow direction", host)
  overlay._cmb_cloud_flow = QComboBox(host)
  for value, label in CLOUD_FLOW_OPTIONS:
    overlay._cmb_cloud_flow.addItem(str(label), userData=str(value))
  overlay._cmb_cloud_flow.currentIndexChanged.connect(overlay._on_cloud_flow_direction)
  add_setting_row(
    cloud_layout, cloud_body, label="Cloud flow direction", description="Horizontal direction used by cloud motion.", control=overlay._cmb_cloud_flow, label_widget=overlay._lbl_cloud_flow
  )

  overlay._lbl_cloud_density = QLabel("Cloud density: 1", host)
  overlay._sld_cloud_density = overlay._new_slider(host, 0, 4)
  overlay._sld_cloud_density.valueChanged.connect(overlay._on_cloud_density)
  add_setting_row(cloud_layout, cloud_body, label="Cloud density", description="Number of generated cloud layers.", control=overlay._sld_cloud_density, label_widget=overlay._lbl_cloud_density)

  overlay._lbl_cloud_seed = QLabel("Cloud seed: 1337", host)
  overlay._sld_cloud_seed = overlay._new_slider(host, 0, 9999)
  overlay._sld_cloud_seed.valueChanged.connect(overlay._on_cloud_seed)
  add_setting_row(cloud_layout, cloud_body, label="Cloud seed", description="Deterministic seed used by cloud placement.", control=overlay._sld_cloud_seed, label_widget=overlay._lbl_cloud_seed)

  _sun_card, sun_body, sun_layout = add_settings_card(layout, host, title="Sun", description="Azimuth and elevation used by scene lighting.")

  overlay._lbl_sun_az = QLabel("Sun azimuth: 45 deg", host)
  overlay._sld_sun_az = overlay._new_slider(host, 0, 360)
  overlay._sld_sun_az.valueChanged.connect(overlay._on_sun_az)
  add_setting_row(sun_layout, sun_body, label="Sun azimuth", description="Horizontal light direction in degrees.", control=overlay._sld_sun_az, label_widget=overlay._lbl_sun_az)

  overlay._lbl_sun_el = QLabel("Sun elevation: 60 deg", host)
  overlay._sld_sun_el = overlay._new_slider(host, 5, 85)
  overlay._sld_sun_el.valueChanged.connect(overlay._on_sun_el)
  add_setting_row(sun_layout, sun_body, label="Sun elevation", description="Vertical light angle in degrees.", control=overlay._sld_sun_el, label_widget=overlay._lbl_sun_el)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_controls_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  add_page_header(layout, host, title="Controls", subtitle="Movement, gameplay, and hotbar key assignments.")
  _movement_card, movement_body, movement_layout = add_settings_card(layout, host, title="Movement Keys", description="Bindings used for player translation, jump, sprint, crouch, and flight.")
  for action in CONTROL_SECTION_MOVEMENT:
    overlay._add_keybind_row(movement_layout, movement_body, str(action))

  _gameplay_card, gameplay_body, gameplay_layout = add_settings_card(layout, host, title="Gameplay Keys", description="Bindings used by interaction, overlays, camera, and gameplay actions.")
  for action in CONTROL_SECTION_GAMEPLAY:
    overlay._add_keybind_row(gameplay_layout, gameplay_body, str(action))

  _hotbar_card, hotbar_body, hotbar_layout = add_settings_card(layout, host, title="Hotbar Keys", description="Direct selection bindings for the nine hotbar slots.")
  for action in HOTBAR_ACTIONS:
    overlay._add_keybind_row(hotbar_layout, hotbar_body, str(action))

  btn_reset_bindings = QPushButton("Reset Keybinds", host)
  btn_reset_bindings.setObjectName("dangerBtn")
  btn_reset_bindings.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  btn_reset_bindings.clicked.connect(overlay.keybind_reset_requested.emit)
  hotbar_layout.addWidget(btn_reset_bindings)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_audio_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  add_page_header(layout, host, title="Audio", subtitle="Independent gain controls for master, ambient, block, and player audio.")
  _mixer_card, mixer_body, mixer_layout = add_settings_card(layout, host, title="Mixer", description="Master gain and category gains persisted by the audio preference schema.")

  overlay._lbl_master_volume = QLabel("Master volume: 100%", host)
  overlay._sld_master_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_master_volume.valueChanged.connect(overlay._on_master_volume)
  add_setting_row(
    mixer_layout, mixer_body, label="Master volume", description="Global output gain applied before category gain.", control=overlay._sld_master_volume, label_widget=overlay._lbl_master_volume
  )

  overlay._lbl_ambient_volume = QLabel("Ambient volume: 100%", host)
  overlay._sld_ambient_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_ambient_volume.valueChanged.connect(overlay._on_ambient_volume)
  add_setting_row(
    mixer_layout, mixer_body, label="Ambient volume", description="Ambient loop gain multiplied by master gain.", control=overlay._sld_ambient_volume, label_widget=overlay._lbl_ambient_volume
  )

  overlay._lbl_block_volume = QLabel("Block volume: 100%", host)
  overlay._sld_block_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_block_volume.valueChanged.connect(overlay._on_block_volume)
  add_setting_row(
    mixer_layout, mixer_body, label="Block volume", description="Placement, breaking, and interaction effect gain.", control=overlay._sld_block_volume, label_widget=overlay._lbl_block_volume
  )

  overlay._lbl_player_volume = QLabel("Player volume: 100%", host)
  overlay._sld_player_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_player_volume.valueChanged.connect(overlay._on_player_volume)
  add_setting_row(mixer_layout, mixer_body, label="Player volume", description="Player and actor effect gain.", control=overlay._sld_player_volume, label_widget=overlay._lbl_player_volume)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_game_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  add_page_header(layout, host, title="Player", subtitle="Game mode, identity, interaction timing, movement, flight, and advanced reset.")
  _mode_card, mode_body, mode_layout = add_settings_card(layout, host, title="Game Mode", description="Switch between survival and creative runtime behavior.")

  overlay._btn_mode_toggle = QPushButton(mode_body)
  overlay._btn_mode_toggle.setObjectName("modeToggle")
  overlay._btn_mode_toggle.setCheckable(True)
  overlay._btn_mode_toggle.clicked.connect(overlay._on_mode_toggle_clicked)
  mode_layout.addWidget(overlay._btn_mode_toggle)

  _options_card, options_body, options_layout = add_settings_card(layout, host, title="Player Options", description="Automatic movement assists.")

  overlay._tg_auto_jump = overlay._add_toggle(options_layout, options_body, "Auto-Jump", overlay.auto_jump_changed.emit)
  overlay._tg_auto_sprint = overlay._add_toggle(options_layout, options_body, "Auto-Sprint", overlay.auto_sprint_changed.emit)

  _identity_card, identity_body, identity_layout = add_settings_card(layout, host, title="Player Identity", description="Persisted display name or per-launch random-name fallback.")

  overlay._name_edit = QLineEdit(identity_body)
  overlay._name_edit.setPlaceholderText("Leave blank for a random name each launch")
  overlay._name_edit.editingFinished.connect(overlay._on_player_name_edited)

  overlay._player_name_hint = QLabel("", identity_body)
  overlay._player_name_hint.setObjectName("subtitle")
  overlay._player_name_hint.setWordWrap(True)
  add_setting_row(identity_layout, identity_body, label="Player name", description="Blank values use the resolved random identity shown here.", control=overlay._name_edit)
  identity_layout.addWidget(overlay._player_name_hint)

  _interaction_card, interaction_body, interaction_layout = add_settings_card(
    layout, host, title="Interaction Parameters", description="Repeat intervals for break, place, and state-changing interaction input."
  )

  overlay._ctl_block_break_repeat_interval = AdvancedScalarControl(
    title="Break repeat interval",
    min_value=float(overlay._params.block_break_repeat_interval_milli_min) / float(overlay._params.block_break_repeat_interval_scale),
    max_value=float(overlay._params.block_break_repeat_interval_milli_max) / float(overlay._params.block_break_repeat_interval_scale),
    slider_scale=float(overlay._params.block_break_repeat_interval_scale),
    decimals=int(overlay._params.block_break_repeat_interval_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_BREAK_REPEAT_INTERVAL_S),
    parent=interaction_body,
  )
  overlay._ctl_block_break_repeat_interval.value_changed.connect(overlay.block_break_repeat_interval_changed.emit)
  interaction_layout.addWidget(overlay._ctl_block_break_repeat_interval)

  overlay._ctl_block_place_repeat_interval = AdvancedScalarControl(
    title="Place repeat interval",
    min_value=float(overlay._params.block_place_repeat_interval_milli_min) / float(overlay._params.block_place_repeat_interval_scale),
    max_value=float(overlay._params.block_place_repeat_interval_milli_max) / float(overlay._params.block_place_repeat_interval_scale),
    slider_scale=float(overlay._params.block_place_repeat_interval_scale),
    decimals=int(overlay._params.block_place_repeat_interval_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S),
    parent=interaction_body,
  )
  overlay._ctl_block_place_repeat_interval.value_changed.connect(overlay.block_place_repeat_interval_changed.emit)
  interaction_layout.addWidget(overlay._ctl_block_place_repeat_interval)

  overlay._ctl_block_interact_repeat_interval = AdvancedScalarControl(
    title="Interact repeat interval",
    min_value=float(overlay._params.block_interact_repeat_interval_milli_min) / float(overlay._params.block_interact_repeat_interval_scale),
    max_value=float(overlay._params.block_interact_repeat_interval_milli_max) / float(overlay._params.block_interact_repeat_interval_scale),
    slider_scale=float(overlay._params.block_interact_repeat_interval_scale),
    decimals=int(overlay._params.block_interact_repeat_interval_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_INTERACT_REPEAT_INTERVAL_S),
    parent=interaction_body,
  )
  overlay._ctl_block_interact_repeat_interval.value_changed.connect(overlay.block_interact_repeat_interval_changed.emit)
  interaction_layout.addWidget(overlay._ctl_block_interact_repeat_interval)

  _movement_card, movement_body, movement_layout = add_settings_card(layout, host, title="Movement Parameters", description="Gravity, walking, sprinting, jump velocity, and automatic jump cooldown.")

  overlay._ctl_gravity = AdvancedScalarControl(
    title="Gravity",
    min_value=float(overlay._params.gravity_milli_min) / float(overlay._params.gravity_scale),
    max_value=float(overlay._params.gravity_milli_max) / float(overlay._params.gravity_scale),
    slider_scale=float(overlay._params.gravity_scale),
    decimals=int(overlay._params.gravity_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.gravity),
    parent=movement_body,
  )
  overlay._ctl_gravity.value_changed.connect(overlay.gravity_changed.emit)
  movement_layout.addWidget(overlay._ctl_gravity)

  overlay._ctl_walk_speed = AdvancedScalarControl(
    title="Walk speed",
    min_value=float(overlay._params.walk_speed_milli_min) / float(overlay._params.walk_speed_scale),
    max_value=float(overlay._params.walk_speed_milli_max) / float(overlay._params.walk_speed_scale),
    slider_scale=float(overlay._params.walk_speed_scale),
    decimals=int(overlay._params.walk_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.walk_speed),
    parent=movement_body,
  )
  overlay._ctl_walk_speed.value_changed.connect(overlay.walk_speed_changed.emit)
  movement_layout.addWidget(overlay._ctl_walk_speed)

  overlay._ctl_sprint_speed = AdvancedScalarControl(
    title="Sprint speed",
    min_value=float(overlay._params.sprint_speed_milli_min) / float(overlay._params.sprint_speed_scale),
    max_value=float(overlay._params.sprint_speed_milli_max) / float(overlay._params.sprint_speed_scale),
    slider_scale=float(overlay._params.sprint_speed_scale),
    decimals=int(overlay._params.sprint_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.sprint_speed),
    parent=movement_body,
  )
  overlay._ctl_sprint_speed.value_changed.connect(overlay.sprint_speed_changed.emit)
  movement_layout.addWidget(overlay._ctl_sprint_speed)

  overlay._ctl_jump_v0 = AdvancedScalarControl(
    title="Jump velocity",
    min_value=float(overlay._params.jump_v0_milli_min) / float(overlay._params.jump_v0_scale),
    max_value=float(overlay._params.jump_v0_milli_max) / float(overlay._params.jump_v0_scale),
    slider_scale=float(overlay._params.jump_v0_scale),
    decimals=int(overlay._params.jump_v0_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.jump_v0),
    parent=movement_body,
  )
  overlay._ctl_jump_v0.value_changed.connect(overlay.jump_v0_changed.emit)
  movement_layout.addWidget(overlay._ctl_jump_v0)

  overlay._ctl_auto_jump_cooldown = AdvancedScalarControl(
    title="Auto-jump cooldown",
    min_value=float(overlay._params.auto_jump_cooldown_milli_min) / float(overlay._params.auto_jump_cooldown_scale),
    max_value=float(overlay._params.auto_jump_cooldown_milli_max) / float(overlay._params.auto_jump_cooldown_scale),
    slider_scale=float(overlay._params.auto_jump_cooldown_scale),
    decimals=int(overlay._params.auto_jump_cooldown_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.auto_jump_cooldown_s),
    parent=movement_body,
  )
  overlay._ctl_auto_jump_cooldown.value_changed.connect(overlay.auto_jump_cooldown_changed.emit)
  movement_layout.addWidget(overlay._ctl_auto_jump_cooldown)

  _flight_card, flight_body, flight_layout = add_settings_card(layout, host, title="Flight Parameters", description="Creative flight speed and vertical rates.")

  overlay._ctl_fly_speed = AdvancedScalarControl(
    title="Flight speed",
    min_value=float(overlay._params.fly_speed_milli_min) / float(overlay._params.fly_speed_scale),
    max_value=float(overlay._params.fly_speed_milli_max) / float(overlay._params.fly_speed_scale),
    slider_scale=float(overlay._params.fly_speed_scale),
    decimals=int(overlay._params.fly_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.fly_speed),
    parent=flight_body,
  )
  overlay._ctl_fly_speed.value_changed.connect(overlay.fly_speed_changed.emit)
  flight_layout.addWidget(overlay._ctl_fly_speed)

  overlay._ctl_fly_ascend_speed = AdvancedScalarControl(
    title="Ascend speed",
    min_value=float(overlay._params.fly_ascend_speed_milli_min) / float(overlay._params.fly_ascend_speed_scale),
    max_value=float(overlay._params.fly_ascend_speed_milli_max) / float(overlay._params.fly_ascend_speed_scale),
    slider_scale=float(overlay._params.fly_ascend_speed_scale),
    decimals=int(overlay._params.fly_ascend_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.fly_ascend_speed),
    parent=flight_body,
  )
  overlay._ctl_fly_ascend_speed.value_changed.connect(overlay.fly_ascend_speed_changed.emit)
  flight_layout.addWidget(overlay._ctl_fly_ascend_speed)

  overlay._ctl_fly_descend_speed = AdvancedScalarControl(
    title="Descend speed",
    min_value=float(overlay._params.fly_descend_speed_milli_min) / float(overlay._params.fly_descend_speed_scale),
    max_value=float(overlay._params.fly_descend_speed_milli_max) / float(overlay._params.fly_descend_speed_scale),
    slider_scale=float(overlay._params.fly_descend_speed_scale),
    decimals=int(overlay._params.fly_descend_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.fly_descend_speed),
    parent=flight_body,
  )
  overlay._ctl_fly_descend_speed.value_changed.connect(overlay.fly_descend_speed_changed.emit)
  flight_layout.addWidget(overlay._ctl_fly_descend_speed)

  _advanced_card, advanced_body, advanced_layout = add_settings_card(layout, host, title="Advanced Reset", description="Restore interaction and movement parameters to built-in defaults.")
  btn_reset_adv = QPushButton("Reset Advanced to Defaults", advanced_body)
  btn_reset_adv.setObjectName("dangerBtn")
  btn_reset_adv.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  btn_reset_adv.clicked.connect(overlay.advanced_reset_requested.emit)
  advanced_layout.addWidget(btn_reset_adv)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_about_tab(overlay: "SettingsOverlay") -> None:
  from PyQt6.QtCore import QSize, QUrl
  from PyQt6.QtGui import QDesktopServices, QIcon, QPixmap

  from ludoxel.presentation.interface.common.status_overlay import status_overlay_title_image_path
  from ludoxel.presentation.interface.settings.about import (
    ABOUT_ACADEMIC_DIRECTION_TEXT as _ABOUT_ACADEMIC_DIRECTION_TEXT,
    ABOUT_CREATOR_AGE as _CREATOR_AGE,
    ABOUT_CREATOR_DISPLAY_NAME as _CREATOR_DISPLAY_NAME,
    ABOUT_CREATOR_GENDER as _CREATOR_GENDER,
    ABOUT_CREATOR_HANDLE as _CREATOR_HANDLE,
    ABOUT_CREATOR_ROLE as _CREATOR_ROLE,
    ABOUT_ETYMOLOGY_PARAGRAPHS,
    ABOUT_GITHUB_URL as _ABOUT_GITHUB_URL,
    ABOUT_PROFILE_BIO_TEXT as _ABOUT_PROFILE_BIO_TEXT,
    ABOUT_PROJECT_OVERVIEW_SECTIONS,
    ABOUT_WORK_TEXT as _ABOUT_WORK_TEXT,
    about_meta_row as _about_meta_row,
    about_pill as _about_pill,
    about_text as _about_text,
    github_image_path as _github_image_path,
    profile_image_path as _profile_image_path,
    render_about_sections,
  )

  scroll, host, layout = overlay._make_scroll_page(page_object_name="aboutPage")
  layout.setContentsMargins(8, 8, 8, 8)
  layout.setSpacing(16)
  add_page_header(layout, host, title="About", subtitle="Project architecture, runtime behavior, resources, verification, and legal boundaries.")

  title_image_path = None if overlay._resource_root is None else status_overlay_title_image_path(overlay._resource_root)
  profile_path = _profile_image_path(overlay._resource_root)
  github_path = _github_image_path(overlay._resource_root)

  profile_card = QFrame(host)
  profile_card.setObjectName("aboutProfileCard")
  profile_layout = QGridLayout(profile_card)
  profile_layout.setContentsMargins(0, 0, 0, 24)
  profile_layout.setHorizontalSpacing(18)
  profile_layout.setVerticalSpacing(0)
  profile_layout.setColumnMinimumWidth(0, 176)
  profile_layout.setColumnStretch(0, 0)
  profile_layout.setColumnStretch(1, 1)
  profile_layout.setRowMinimumHeight(0, 140)
  profile_layout.setRowStretch(0, 0)
  profile_layout.setRowStretch(1, 1)

  cover = QFrame(profile_card)
  cover.setObjectName("aboutProfileCover")
  cover.setFixedHeight(140)
  cover.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  cover_layout = QVBoxLayout(cover)
  cover_layout.setContentsMargins(22, 18, 22, 18)
  cover_layout.setSpacing(0)

  mark_label = QLabel("Ludoxel", cover)
  mark_label.setObjectName("aboutProfileMark")
  mark_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
  if title_image_path is not None:
    mark_pixmap = QPixmap(str(title_image_path))
    if not mark_pixmap.isNull():
      mark_label.setText("")
      mark_label.setPixmap(mark_pixmap.scaled(300, 96, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))
  cover_layout.addWidget(mark_label, alignment=Qt.AlignmentFlag.AlignRight)
  profile_layout.addWidget(cover, 0, 0, 1, 2)

  avatar_layer = QWidget(profile_card)
  avatar_layer.setObjectName("aboutAvatarLayer")
  avatar_layer_layout = QVBoxLayout(avatar_layer)
  avatar_layer_layout.setContentsMargins(22, 112, 22, 0)
  avatar_layer_layout.setSpacing(0)

  avatar = QLabel("KK", profile_card)
  avatar.setObjectName("aboutAvatar")
  avatar.setFixedSize(132, 132)
  avatar.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  if profile_path is not None:
    avatar_pixmap = QPixmap(str(profile_path))
    if not avatar_pixmap.isNull():
      avatar.setText("")
      avatar.setPixmap(avatar_pixmap.scaled(132, 132, Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation))
  avatar_layer_layout.addWidget(avatar, alignment=Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft)
  avatar_layer_layout.addStretch(1)
  profile_layout.addWidget(avatar_layer, 0, 0, 2, 1)

  profile_text_column = QVBoxLayout()
  profile_text_column.setContentsMargins(0, 22, 22, 0)
  profile_text_column.setSpacing(8)

  display_name = QLabel(_CREATOR_DISPLAY_NAME, profile_card)
  display_name.setObjectName("aboutProfileName")
  profile_text_column.addWidget(display_name)

  handle = QLabel(f"@{_CREATOR_HANDLE}", profile_card)
  handle.setObjectName("aboutProfileHandle")
  profile_text_column.addWidget(handle)

  role = QLabel(_CREATOR_ROLE, profile_card)
  role.setObjectName("aboutProfileRole")
  role.setWordWrap(True)
  profile_text_column.addWidget(role)

  pill_row = QHBoxLayout()
  pill_row.setContentsMargins(0, 4, 0, 0)
  pill_row.setSpacing(8)
  pill_row.addWidget(_about_pill(profile_card, "Engineering"))
  pill_row.addWidget(_about_pill(profile_card, "Law"))
  pill_row.addWidget(_about_pill(profile_card, "Voxel Systems"))
  pill_row.addStretch(1)
  profile_text_column.addLayout(pill_row)

  profile_text_column.addWidget(_about_text(profile_card, _ABOUT_PROFILE_BIO_TEXT, "aboutProfileBio"))

  github_button = QPushButton("GitHub Repository", profile_card)
  github_button.setObjectName("aboutGithubButton")
  github_button.setCursor(Qt.CursorShape.PointingHandCursor)
  github_button.setToolTip(_ABOUT_GITHUB_URL)
  if github_path is not None:
    github_icon = QIcon(str(github_path))
    if not github_icon.isNull():
      github_button.setIcon(github_icon)
      github_button.setIconSize(QSize(24, 24))
  github_button.clicked.connect(lambda _checked=False: QDesktopServices.openUrl(QUrl(_ABOUT_GITHUB_URL)))

  github_row = QHBoxLayout()
  github_row.setContentsMargins(0, 2, 0, 0)
  github_row.setSpacing(0)
  github_row.addWidget(github_button)
  github_row.addStretch(1)
  profile_text_column.addLayout(github_row)

  profile_layout.addLayout(profile_text_column, 1, 1)
  layout.addWidget(profile_card)

  meta_card = QFrame(host)
  meta_card.setObjectName("aboutCard")
  meta_layout = QGridLayout(meta_card)
  meta_layout.setContentsMargins(18, 18, 18, 18)
  meta_layout.setHorizontalSpacing(18)
  meta_layout.setVerticalSpacing(10)
  _about_meta_row(meta_layout, 0, "Name", _CREATOR_DISPLAY_NAME, meta_card)
  _about_meta_row(meta_layout, 1, "Handle", f"@{_CREATOR_HANDLE}", meta_card)
  _about_meta_row(meta_layout, 2, "Age", _CREATOR_AGE, meta_card)
  _about_meta_row(meta_layout, 3, "Gender", _CREATOR_GENDER, meta_card)
  _about_meta_row(meta_layout, 4, "Work", _ABOUT_WORK_TEXT, meta_card)
  _about_meta_row(meta_layout, 5, "Academic direction", _ABOUT_ACADEMIC_DIRECTION_TEXT, meta_card)
  layout.addWidget(meta_card)

  etymology_card = QFrame(host)
  etymology_card.setObjectName("aboutCard")
  etymology_layout = QVBoxLayout(etymology_card)
  etymology_layout.setContentsMargins(18, 18, 18, 18)
  etymology_layout.setSpacing(10)

  etymology_title = QLabel("Etymology", etymology_card)
  etymology_title.setObjectName("sectionTitle")
  etymology_layout.addWidget(etymology_title)

  for paragraph in ABOUT_ETYMOLOGY_PARAGRAPHS:
    etymology_layout.addWidget(_about_text(etymology_card, paragraph))

  layout.addWidget(etymology_card)

  overview_card = QFrame(host)
  overview_card.setObjectName("aboutCard")
  overview_layout = QVBoxLayout(overview_card)
  overview_layout.setContentsMargins(18, 18, 18, 18)
  overview_layout.setSpacing(10)

  overview_title = QLabel("Project Overview", overview_card)
  overview_title.setObjectName("sectionTitle")
  overview_layout.addWidget(overview_title)
  render_about_sections(parent=overview_card, layout=overview_layout, sections=ABOUT_PROJECT_OVERVIEW_SECTIONS, text_factory=_about_text)
  layout.addWidget(overview_card)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)
