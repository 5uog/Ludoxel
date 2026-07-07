# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from PyQt6.QtWidgets import QCheckBox, QComboBox, QHBoxLayout, QLabel, QLineEdit, QPushButton, QSizePolicy, QWidget

from ludoxel.application.preferences.camera import CAMERA_PERSPECTIVE_LABELS, CAMERA_PERSPECTIVE_ORDER
from ludoxel.application.preferences.keybinds import CONTROL_SECTION_GAMEPLAY, CONTROL_SECTION_MOVEMENT, HOTBAR_ACTIONS
from ludoxel.application.preferences.runtime import RuntimePreferences
from ludoxel.application.preferences.shadow import SHADOW_MAP_QUALITY_LABELS, SHADOW_MAP_QUALITY_ORDER
from ludoxel.presentation.interface.settings.cloud_flow import CLOUD_FLOW_OPTIONS
from ludoxel.presentation.interface.settings.surface import add_page_header, add_setting_row, add_settings_card
from ludoxel.presentation.interface.settings.widgets.crosshair import CrosshairPixelEditor, CrosshairPreviewWidget
from ludoxel.presentation.interface.settings.widgets.scalar import AdvancedScalarControl
from ludoxel.simulation.worlds.config.movement import DEFAULT_MOVEMENT_PARAMS
from ludoxel.simulation.worlds.config.player_health import (
  PLAYER_REGEN_CAP_MAX_HP,
  PLAYER_REGEN_CAP_MIN_HP,
  PLAYER_REGEN_DEFAULT_CAP_HP,
  PLAYER_REGEN_DEFAULT_START_DELAY_S,
  PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S,
  PLAYER_REGEN_START_DELAY_MAX_S,
  PLAYER_REGEN_START_DELAY_MIN_S,
  PLAYER_REGEN_TIME_TO_CAP_MAX_S,
  PLAYER_REGEN_TIME_TO_CAP_MIN_S,
)

if TYPE_CHECKING:
  from ludoxel.presentation.interface.settings.overlay import SettingsOverlay


def build_display_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  add_page_header(layout, host, title="Display", subtitle="Camera, window, HUD, view motion, and crosshair presentation.")
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
  overlay._tg_shadow_enabled = overlay._add_toggle(world_layout, world_body, "Shadow map", overlay._on_shadow_enabled_toggled)

  overlay._lbl_shadow_quality = QLabel("Shadow map quality", host)
  overlay._cmb_shadow_quality = QComboBox(host)
  for value in SHADOW_MAP_QUALITY_ORDER:
    overlay._cmb_shadow_quality.addItem(str(SHADOW_MAP_QUALITY_LABELS[int(value)]), userData=int(value))
  overlay._cmb_shadow_quality.currentIndexChanged.connect(overlay._on_shadow_map_quality)
  add_setting_row(
    world_layout,
    world_body,
    label="Shadow map quality",
    description="Shadow map resolution and filtering, independent of render distance.",
    control=overlay._cmb_shadow_quality,
    label_widget=overlay._lbl_shadow_quality,
  )

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

  _cloud_card, cloud_body, cloud_layout = add_settings_card(layout, host, title="Clouds", description="Visibility, placement, height, and horizontal flow behavior.")

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

  overlay._lbl_cloud_cell_size = QLabel("Cloud size: 20 blocks", host)
  overlay._sld_cloud_cell_size = overlay._new_slider(host, int(RuntimePreferences.CLOUD_CELL_SIZE_MIN), int(RuntimePreferences.CLOUD_CELL_SIZE_MAX))
  overlay._sld_cloud_cell_size.valueChanged.connect(overlay._on_cloud_cell_size)
  add_setting_row(
    cloud_layout,
    cloud_body,
    label="Cloud size",
    description="Edge length in blocks of each cloud cell; larger cells make bigger clouds.",
    control=overlay._sld_cloud_cell_size,
    label_widget=overlay._lbl_cloud_cell_size,
  )

  overlay._lbl_cloud_seed = QLabel("Cloud seed: 1337", host)
  overlay._sld_cloud_seed = overlay._new_slider(host, 0, 9999)
  overlay._sld_cloud_seed.valueChanged.connect(overlay._on_cloud_seed)
  add_setting_row(cloud_layout, cloud_body, label="Cloud seed", description="Deterministic seed used by cloud placement.", control=overlay._sld_cloud_seed, label_widget=overlay._lbl_cloud_seed)

  overlay._tg_cloud_speed_variation = overlay._add_toggle(cloud_layout, cloud_body, "Enable per-cloud speed variation", overlay._on_cloud_speed_variation_toggled)
  overlay._ctl_cloud_speed_min = AdvancedScalarControl(
    title="Slowest cloud speed (blocks/s)",
    min_value=float(RuntimePreferences.CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND),
    max_value=float(RuntimePreferences.CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND),
    slider_scale=100.0,
    decimals=2,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND),
    parent=cloud_body,
  )
  overlay._ctl_cloud_speed_min.value_changed.connect(overlay.cloud_speed_min_changed.emit)
  cloud_layout.addWidget(overlay._ctl_cloud_speed_min)

  overlay._ctl_cloud_speed_max = AdvancedScalarControl(
    title="Fastest cloud speed (blocks/s)",
    min_value=float(RuntimePreferences.CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND),
    max_value=float(RuntimePreferences.CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND),
    slider_scale=100.0,
    decimals=2,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND),
    parent=cloud_body,
  )
  overlay._ctl_cloud_speed_max.value_changed.connect(overlay.cloud_speed_max_changed.emit)
  cloud_layout.addWidget(overlay._ctl_cloud_speed_max)

  overlay._tg_cloud_height_variation = overlay._add_toggle(cloud_layout, cloud_body, "Enable cloud height variation", overlay._on_cloud_height_variation_toggled)
  overlay._ctl_cloud_fixed_y = AdvancedScalarControl(
    title="Fixed cloud Y coordinate",
    min_value=float(RuntimePreferences.CLOUD_Y_MIN),
    max_value=float(RuntimePreferences.CLOUD_Y_MAX),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_FIXED_Y),
    parent=cloud_body,
  )
  overlay._ctl_cloud_fixed_y.value_changed.connect(lambda value: overlay.cloud_fixed_y_changed.emit(int(round(float(value)))))
  cloud_layout.addWidget(overlay._ctl_cloud_fixed_y)

  overlay._ctl_cloud_spawn_y_min = AdvancedScalarControl(
    title="Random spawn Y range minimum",
    min_value=float(RuntimePreferences.CLOUD_Y_MIN),
    max_value=float(RuntimePreferences.CLOUD_Y_MAX),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_SPAWN_Y_MIN),
    parent=cloud_body,
  )
  overlay._ctl_cloud_spawn_y_min.value_changed.connect(lambda value: overlay.cloud_spawn_y_min_changed.emit(int(round(float(value)))))
  cloud_layout.addWidget(overlay._ctl_cloud_spawn_y_min)

  overlay._ctl_cloud_spawn_y_max = AdvancedScalarControl(
    title="Random spawn Y range maximum",
    min_value=float(RuntimePreferences.CLOUD_Y_MIN),
    max_value=float(RuntimePreferences.CLOUD_Y_MAX),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_SPAWN_Y_MAX),
    parent=cloud_body,
  )
  overlay._ctl_cloud_spawn_y_max.value_changed.connect(lambda value: overlay.cloud_spawn_y_max_changed.emit(int(round(float(value)))))
  cloud_layout.addWidget(overlay._ctl_cloud_spawn_y_max)

  overlay._ctl_cloud_preferred_y_min = AdvancedScalarControl(
    title="Preferred Y interval minimum",
    min_value=float(RuntimePreferences.CLOUD_Y_MIN),
    max_value=float(RuntimePreferences.CLOUD_Y_MAX),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_MIN),
    parent=cloud_body,
  )
  overlay._ctl_cloud_preferred_y_min.value_changed.connect(lambda value: overlay.cloud_preferred_y_min_changed.emit(int(round(float(value)))))
  cloud_layout.addWidget(overlay._ctl_cloud_preferred_y_min)

  overlay._ctl_cloud_preferred_y_max = AdvancedScalarControl(
    title="Preferred Y interval maximum",
    min_value=float(RuntimePreferences.CLOUD_Y_MIN),
    max_value=float(RuntimePreferences.CLOUD_Y_MAX),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_MAX),
    parent=cloud_body,
  )
  overlay._ctl_cloud_preferred_y_max.value_changed.connect(lambda value: overlay.cloud_preferred_y_max_changed.emit(int(round(float(value)))))
  cloud_layout.addWidget(overlay._ctl_cloud_preferred_y_max)

  overlay._ctl_cloud_preferred_y_probability = AdvancedScalarControl(
    title="Preferred Y interval probability (%)",
    min_value=0.0,
    max_value=100.0,
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT),
    parent=cloud_body,
  )
  overlay._ctl_cloud_preferred_y_probability.value_changed.connect(lambda value: overlay.cloud_preferred_y_probability_changed.emit(int(round(float(value)))))
  cloud_layout.addWidget(overlay._ctl_cloud_preferred_y_probability)

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

  _reset_card, reset_body, reset_layout = add_settings_card(layout, host, title="Keybind Reset", description="Restore every movement, gameplay, and hotbar key assignment to its built-in default.")
  btn_reset_bindings = QPushButton("Reset Keybinds", reset_body)
  btn_reset_bindings.setObjectName("dangerBtn")
  btn_reset_bindings.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  btn_reset_bindings.clicked.connect(overlay.keybind_reset_requested.emit)
  reset_layout.addWidget(btn_reset_bindings)

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

  _regen_card, regen_body, regen_layout = add_settings_card(
    layout, host, title="Health Regeneration", description="Automatic survival-mode health recovery once the player avoids damage for the start delay."
  )

  overlay._tg_player_regen = overlay._add_toggle(regen_layout, regen_body, "Regeneration", overlay._on_player_regen_toggled)

  overlay._ctl_player_regen_start_delay = AdvancedScalarControl(
    title="Start delay",
    min_value=float(PLAYER_REGEN_START_DELAY_MIN_S),
    max_value=float(PLAYER_REGEN_START_DELAY_MAX_S),
    slider_scale=10.0,
    decimals=1,
    default_value=float(PLAYER_REGEN_DEFAULT_START_DELAY_S),
    parent=regen_body,
  )
  overlay._ctl_player_regen_start_delay.value_changed.connect(overlay.player_regen_start_delay_changed.emit)
  regen_layout.addWidget(overlay._ctl_player_regen_start_delay)

  overlay._ctl_player_regen_cap = AdvancedScalarControl(
    title="Health cap",
    min_value=float(PLAYER_REGEN_CAP_MIN_HP),
    max_value=float(PLAYER_REGEN_CAP_MAX_HP),
    slider_scale=10.0,
    decimals=1,
    default_value=float(PLAYER_REGEN_DEFAULT_CAP_HP),
    parent=regen_body,
  )
  overlay._ctl_player_regen_cap.value_changed.connect(overlay.player_regen_cap_changed.emit)
  regen_layout.addWidget(overlay._ctl_player_regen_cap)

  overlay._ctl_player_regen_time_to_cap = AdvancedScalarControl(
    title="Time to cap",
    min_value=float(PLAYER_REGEN_TIME_TO_CAP_MIN_S),
    max_value=float(PLAYER_REGEN_TIME_TO_CAP_MAX_S),
    slider_scale=10.0,
    decimals=1,
    default_value=float(PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S),
    parent=regen_body,
  )
  overlay._ctl_player_regen_time_to_cap.value_changed.connect(overlay.player_regen_time_to_cap_changed.emit)
  regen_layout.addWidget(overlay._ctl_player_regen_time_to_cap)

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
