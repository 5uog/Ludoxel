# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QEventLoop, Qt, pyqtSignal
from PyQt6.QtWidgets import QApplication, QFrame, QLabel, QProgressBar, QPushButton, QSizePolicy, QStackedWidget, QVBoxLayout, QWidget

from ludoxel.application.preferences.camera import CAMERA_PERSPECTIVE_FIRST_PERSON
from ludoxel.application.preferences.keybinds import action_display_name
from ludoxel.application.preferences.shadow import SHADOW_MAP_QUALITY_DEFAULT, SHADOW_MAP_QUALITY_ORDER, normalize_shadow_map_quality
from ludoxel.presentation.interface.common.sidebar_dialog import SidebarDialogBase
from ludoxel.presentation.interface.config.pause_overlay import DEFAULT_PAUSE_OVERLAY_PARAMS, PauseOverlayParams
from ludoxel.presentation.interface.settings.pages import build_audio_tab, build_controls_tab, build_display_tab, build_game_tab, build_world_tab
from ludoxel.presentation.interface.settings.sync import sync_overlay_values
from ludoxel.presentation.interface.settings.widgets.controls import BedrockToggleRow, KeybindRow, WheelPassthroughSlider
from ludoxel.presentation.rendering.contracts.state import DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION


class SettingsOverlay(SidebarDialogBase):
  back_requested = pyqtSignal()
  fov_changed = pyqtSignal(float)
  sens_changed = pyqtSignal(float)
  invert_x_changed = pyqtSignal(bool)
  invert_y_changed = pyqtSignal(bool)
  fullscreen_changed = pyqtSignal(bool)
  hide_hud_changed = pyqtSignal(bool)
  hide_hand_changed = pyqtSignal(bool)
  crosshair_pixels_changed = pyqtSignal(object)
  crosshair_clear_requested = pyqtSignal()
  camera_perspective_changed = pyqtSignal(str)
  view_bobbing_changed = pyqtSignal(bool)
  camera_shake_changed = pyqtSignal(bool)
  view_bobbing_strength_changed = pyqtSignal(float)
  camera_shake_strength_changed = pyqtSignal(float)
  animated_textures_changed = pyqtSignal(bool)
  outline_selection_changed = pyqtSignal(bool)
  arm_rotation_limit_min_changed = pyqtSignal(float)
  arm_rotation_limit_max_changed = pyqtSignal(float)
  arm_swing_duration_changed = pyqtSignal(float)
  cloud_wireframe_changed = pyqtSignal(bool)
  clouds_enabled_changed = pyqtSignal(bool)
  cloud_density_changed = pyqtSignal(int)
  cloud_seed_changed = pyqtSignal(int)
  cloud_flow_direction_changed = pyqtSignal(str)
  cloud_speed_variation_enabled_changed = pyqtSignal(bool)
  cloud_speed_min_changed = pyqtSignal(float)
  cloud_speed_max_changed = pyqtSignal(float)
  cloud_height_variation_enabled_changed = pyqtSignal(bool)
  cloud_fixed_y_changed = pyqtSignal(int)
  cloud_spawn_y_min_changed = pyqtSignal(int)
  cloud_spawn_y_max_changed = pyqtSignal(int)
  cloud_preferred_y_min_changed = pyqtSignal(int)
  cloud_preferred_y_max_changed = pyqtSignal(int)
  cloud_preferred_y_probability_changed = pyqtSignal(int)
  world_wireframe_changed = pyqtSignal(bool)
  shadow_enabled_changed = pyqtSignal(bool)
  shadow_map_quality_changed = pyqtSignal(int)
  sun_azimuth_changed = pyqtSignal(float)
  sun_elevation_changed = pyqtSignal(float)
  creative_mode_changed = pyqtSignal(bool)
  auto_jump_changed = pyqtSignal(bool)
  auto_sprint_changed = pyqtSignal(bool)
  block_break_repeat_interval_changed = pyqtSignal(float)
  block_place_repeat_interval_changed = pyqtSignal(float)
  block_interact_repeat_interval_changed = pyqtSignal(float)
  block_break_particle_spawn_rate_changed = pyqtSignal(float)
  block_break_particle_speed_scale_changed = pyqtSignal(float)
  gravity_changed = pyqtSignal(float)
  walk_speed_changed = pyqtSignal(float)
  sprint_speed_changed = pyqtSignal(float)
  jump_v0_changed = pyqtSignal(float)
  auto_jump_cooldown_changed = pyqtSignal(float)
  fly_speed_changed = pyqtSignal(float)
  fly_ascend_speed_changed = pyqtSignal(float)
  fly_descend_speed_changed = pyqtSignal(float)
  player_regen_enabled_changed = pyqtSignal(bool)
  player_regen_start_delay_changed = pyqtSignal(float)
  player_regen_cap_changed = pyqtSignal(float)
  player_regen_time_to_cap_changed = pyqtSignal(float)
  advanced_reset_requested = pyqtSignal()
  render_distance_changed = pyqtSignal(int)
  keybind_changed = pyqtSignal(str, str)
  keybind_reset_requested = pyqtSignal()
  master_volume_changed = pyqtSignal(float)
  ambient_volume_changed = pyqtSignal(float)
  block_volume_changed = pyqtSignal(float)
  player_volume_changed = pyqtSignal(float)
  player_name_changed = pyqtSignal(str)
  preview_requested = pyqtSignal()

  def __init__(
    self, parent: QWidget | None = None, params: PauseOverlayParams = DEFAULT_PAUSE_OVERLAY_PARAMS, *, resource_root: Path | None = None, as_window: bool = False, include_preview_button: bool = True
  ) -> None:
    super().__init__(
      parent,
      as_window=as_window,
      root_object_name="settingsRoot",
      window_title="Settings",
      window_size=(1120, 780),
      minimum_window_size=(1000, 720),
      panel_minimum_size=(960, 620),
      sidebar_object_name="settingsSidebar",
      content_object_name="settingsContent",
      stack_object_name="settingsStack",
    )
    self._params = params
    self._resource_root = None if resource_root is None else Path(resource_root)
    self._keybind_rows: dict[str, KeybindRow] = {}

    self._tab_display = self._make_tab_button("Display", 0, self._set_tab)
    self._tab_world = self._make_tab_button("World", 1, self._set_tab)
    self._tab_game = self._make_tab_button("Player", 2, self._set_tab)
    self._tab_controls = self._make_tab_button("Controls", 3, self._set_tab)
    self._tab_audio = self._make_tab_button("Audio", 4, self._set_tab)
    self._tab_about = self._make_tab_button("About", 5, self._set_tab)
    self._sidebar_layout.addWidget(self._tab_display)
    self._sidebar_layout.addWidget(self._tab_world)
    self._sidebar_layout.addWidget(self._tab_game)
    self._sidebar_layout.addWidget(self._tab_controls)
    self._sidebar_layout.addWidget(self._tab_audio)
    self._preview_button: QPushButton | None = None
    if bool(include_preview_button):
      self._preview_button = self._make_sidebar_action_button("Preview", self.preview_requested.emit)
      self._sidebar_layout.addWidget(self._preview_button)
    self._sidebar_layout.addStretch(1)
    self._sidebar_layout.addWidget(self._tab_about)
    self._close_button: QPushButton | None = None
    if not bool(as_window):
      self._close_button = self._make_sidebar_action_button("Close", self.back_requested.emit)
      self._sidebar_layout.addWidget(self._close_button)

    build_display_tab(self)
    build_world_tab(self)
    build_game_tab(self)
    build_controls_tab(self)
    build_audio_tab(self)
    self._about_built = False
    self._about_content_page: QWidget | None = None
    self._about_page = self._create_about_page_shell()
    self._stack.addWidget(self._about_page)
    self._set_tab(0)

  @staticmethod
  def _sep(parent: QWidget) -> QFrame:
    separator = QFrame(parent)
    separator.setObjectName("sep")
    separator.setFrameShape(QFrame.Shape.HLine)
    return separator

  @staticmethod
  def _section(parent: QWidget, text: str) -> QLabel:
    label = QLabel(text, parent)
    label.setObjectName("sectionTitle")
    return label

  def _current_cloud_flow_value(self) -> str:
    data = self._cmb_cloud_flow.currentData()
    return str(DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION) if data is None else str(data)

  def _current_camera_perspective_value(self) -> str:
    data = self._cmb_camera_perspective.currentData()
    return str(CAMERA_PERSPECTIVE_FIRST_PERSON) if data is None else str(data)

  def _current_shadow_map_quality_value(self) -> int:
    data = self._cmb_shadow_quality.currentData()
    return int(SHADOW_MAP_QUALITY_DEFAULT) if data is None else int(data)

  def _on_shadow_enabled_toggled(self, on: bool) -> None:
    enabled = bool(on)
    self._cmb_shadow_quality.setEnabled(enabled)
    self.shadow_enabled_changed.emit(enabled)

  def _on_shadow_map_quality(self, _index: int) -> None:
    self.shadow_map_quality_changed.emit(int(self._current_shadow_map_quality_value()))

  def _sync_shadow_map_quality(self, quality: int, shadow_enabled: bool) -> None:
    normalized = normalize_shadow_map_quality(quality)
    index = 0
    for candidate_index, candidate in enumerate(SHADOW_MAP_QUALITY_ORDER):
      if int(candidate) == int(normalized):
        index = int(candidate_index)
        break
    self._cmb_shadow_quality.blockSignals(True)
    self._cmb_shadow_quality.setCurrentIndex(int(index))
    self._cmb_shadow_quality.blockSignals(False)
    self._cmb_shadow_quality.setEnabled(bool(shadow_enabled))

  def _new_slider(self, parent: QWidget, min_value: int, max_value: int) -> WheelPassthroughSlider:
    slider = WheelPassthroughSlider(Qt.Orientation.Horizontal, parent)
    slider.setRange(int(min_value), int(max_value))
    return slider

  def _add_toggle(self, layout: QVBoxLayout, parent: QWidget, text: str, slot) -> BedrockToggleRow:
    row = BedrockToggleRow(str(text), parent)
    row.toggled.connect(slot)
    layout.addWidget(row)
    return row

  def _add_keybind_row(self, layout: QVBoxLayout, parent: QWidget, action: str) -> KeybindRow:
    row = KeybindRow(action_display_name(str(action)), parent)
    row.binding_changed.connect(lambda binding_text, action_id=str(action): self.keybind_changed.emit(str(action_id), str(binding_text)))
    row.clear_requested.connect(lambda action_id=str(action): self.keybind_changed.emit(str(action_id), ""))
    layout.addWidget(row)
    self._keybind_rows[str(action)] = row
    return row

  def _update_mode_toggle_text(self, creative_mode: bool) -> None:
    self._btn_mode_toggle.setText("Game Mode: Creative" if bool(creative_mode) else "Game Mode: Survival")

  def _on_mode_toggle_clicked(self, checked: bool) -> None:
    self._update_mode_toggle_text(bool(checked))
    self.creative_mode_changed.emit(bool(checked))

  def _set_tab(self, index: int) -> None:
    selected = int(max(0, min(5, int(index))))
    if selected == 5 and not bool(self._about_built):
      self._set_stack_page(index=selected, max_index=5, tab_buttons=(self._tab_display, self._tab_world, self._tab_game, self._tab_controls, self._tab_audio, self._tab_about))
      self._show_about_loader()
      self._paint_about_loader_once()
      self._ensure_about_tab()
      return
    self._set_stack_page(index=selected, max_index=5, tab_buttons=(self._tab_display, self._tab_world, self._tab_game, self._tab_controls, self._tab_audio, self._tab_about))

  def _create_about_page_shell(self) -> QWidget:
    page = QWidget(self._stack)
    page.setObjectName("aboutPage")
    page.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    page.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

    page_layout = QVBoxLayout(page)
    page_layout.setContentsMargins(0, 0, 0, 0)
    page_layout.setSpacing(0)

    self._about_page_stack = QStackedWidget(page)
    self._about_page_stack.setObjectName("aboutPageStack")
    self._about_page_stack.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
    page_layout.addWidget(self._about_page_stack, stretch=1)

    self._about_loader_page = QWidget(self._about_page_stack)
    self._about_loader_page.setObjectName("aboutLoaderPage")
    self._about_loader_page.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

    loader_layout = QVBoxLayout(self._about_loader_page)
    loader_layout.setContentsMargins(24, 24, 24, 24)
    loader_layout.setSpacing(12)
    loader_layout.addStretch(1)

    loader_card = QFrame(self._about_loader_page)
    loader_card.setObjectName("aboutLoaderCard")
    loader_card.setSizePolicy(QSizePolicy.Policy.MinimumExpanding, QSizePolicy.Policy.Fixed)
    loader_card.setMinimumWidth(360)
    loader_card.setMaximumWidth(520)

    loader_card_layout = QVBoxLayout(loader_card)
    loader_card_layout.setContentsMargins(22, 20, 22, 20)
    loader_card_layout.setSpacing(12)

    self._about_loader_label = QLabel("Loading About section...", loader_card)
    self._about_loader_label.setObjectName("settingsPageSubtitle")
    self._about_loader_label.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
    self._about_loader_label.setWordWrap(True)
    loader_card_layout.addWidget(self._about_loader_label)

    self._about_loader_progress = QProgressBar(loader_card)
    self._about_loader_progress.setObjectName("aboutLoaderProgress")
    self._about_loader_progress.setRange(0, 100)
    self._about_loader_progress.setValue(0)
    self._about_loader_progress.setTextVisible(True)
    self._about_loader_progress.setMinimumHeight(22)
    self._about_loader_progress.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
    loader_card_layout.addWidget(self._about_loader_progress)

    loader_layout.addWidget(loader_card, alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
    loader_layout.addStretch(1)

    self._about_page_stack.addWidget(self._about_loader_page)
    self._about_page_stack.setCurrentWidget(self._about_loader_page)
    return page

  def _set_about_loader_progress(self, value: int) -> None:
    progress = int(max(0, min(100, int(value))))
    self._about_loader_label.setText("Loading About section...")
    self._about_loader_progress.setValue(progress)

  def _show_about_loader(self) -> None:
    self._set_about_loader_progress(0)
    self._about_page_stack.setCurrentWidget(self._about_loader_page)

  def _paint_about_loader_once(self) -> None:
    self._set_about_loader_progress(25)
    self._about_loader_page.ensurePolished()
    self._about_loader_page.updateGeometry()
    self._about_page_stack.repaint()
    self._stack.repaint()
    self._content.repaint()
    QApplication.processEvents(QEventLoop.ProcessEventsFlag.ExcludeUserInputEvents)

  def _ensure_about_tab(self) -> None:
    if bool(self._about_built):
      self._about_page_stack.setCurrentWidget(self._about_content_page)
      return

    from ludoxel.presentation.interface.settings.about.page import build_about_tab

    self._set_about_loader_progress(50)
    content_page = build_about_tab(self, parent=self._about_page_stack)
    self._set_about_loader_progress(75)
    self._about_page_stack.addWidget(content_page)
    self._about_content_page = content_page
    self._set_about_loader_progress(100)
    self._about_page_stack.setCurrentWidget(content_page)
    self._about_built = True

  def sync_values(self, **kwargs) -> None:
    sync_overlay_values(self, **kwargs)

  def _on_player_name_edited(self) -> None:
    self.player_name_changed.emit(str(self._name_edit.text()))

  def _on_fov(self, value: int) -> None:
    self._lbl_fov.setText(f"FOV: {int(value)}")
    self.fov_changed.emit(float(value))

  def _on_sens(self, value: int) -> None:
    sensitivity = float(value) / float(self._params.sens_scale)
    self._lbl_sens.setText(f"Mouse sensitivity: {sensitivity:.3f} deg/px")
    self.sens_changed.emit(sensitivity)

  def _on_view_bobbing_toggled(self, on: bool) -> None:
    enabled = bool(on)
    self._sld_view_bobbing_strength.setEnabled(enabled)
    self.view_bobbing_changed.emit(enabled)

  def _on_camera_shake_toggled(self, on: bool) -> None:
    enabled = bool(on)
    self._sld_camera_shake_strength.setEnabled(enabled)
    self.camera_shake_changed.emit(enabled)

  def _on_player_regen_toggled(self, on: bool) -> None:
    enabled = bool(on)
    self._ctl_player_regen_start_delay.setEnabled(enabled)
    self._ctl_player_regen_cap.setEnabled(enabled)
    self._ctl_player_regen_time_to_cap.setEnabled(enabled)
    self.player_regen_enabled_changed.emit(enabled)

  def _update_cloud_controls_enabled(self, enabled: bool) -> None:
    self._sld_cloud_density.setEnabled(bool(enabled))
    self._sld_cloud_seed.setEnabled(bool(enabled))
    self._tg_cloud_speed_variation.setEnabled(bool(enabled))
    self._tg_cloud_height_variation.setEnabled(bool(enabled))
    speed_variation_enabled = bool(enabled) and bool(self._tg_cloud_speed_variation.isChecked())
    self._ctl_cloud_speed_min.setEnabled(bool(speed_variation_enabled))
    self._ctl_cloud_speed_max.setEnabled(bool(speed_variation_enabled))
    height_variation_enabled = bool(enabled) and bool(self._tg_cloud_height_variation.isChecked())
    self._ctl_cloud_fixed_y.setEnabled(bool(enabled) and (not bool(height_variation_enabled)))
    self._ctl_cloud_spawn_y_min.setEnabled(bool(height_variation_enabled))
    self._ctl_cloud_spawn_y_max.setEnabled(bool(height_variation_enabled))
    self._ctl_cloud_preferred_y_min.setEnabled(bool(height_variation_enabled))
    self._ctl_cloud_preferred_y_max.setEnabled(bool(height_variation_enabled))
    self._ctl_cloud_preferred_y_probability.setEnabled(bool(height_variation_enabled))

  def _on_clouds_toggled(self, on: bool) -> None:
    enabled = bool(on)
    self._update_cloud_controls_enabled(enabled)
    self.clouds_enabled_changed.emit(enabled)

  def _on_cloud_speed_variation_toggled(self, on: bool) -> None:
    enabled = bool(on)
    self._update_cloud_controls_enabled(bool(self._tg_clouds_enabled.isChecked()))
    self.cloud_speed_variation_enabled_changed.emit(enabled)

  def _on_cloud_height_variation_toggled(self, on: bool) -> None:
    enabled = bool(on)
    self._update_cloud_controls_enabled(bool(self._tg_clouds_enabled.isChecked()))
    self.cloud_height_variation_enabled_changed.emit(enabled)

  def _on_view_bobbing_strength(self, value: int) -> None:
    percent = int(max(int(self._params.bob_strength_percent_min), min(int(self._params.bob_strength_percent_max), int(value))))
    self._lbl_view_bobbing_strength.setText(f"View Bobbing strength: {percent}%")
    self.view_bobbing_strength_changed.emit(float(percent) / 100.0)

  def _on_camera_shake_strength(self, value: int) -> None:
    percent = int(max(int(self._params.shake_strength_percent_min), min(int(self._params.shake_strength_percent_max), int(value))))
    self._lbl_camera_shake_strength.setText(f"Camera Shake strength: {percent}%")
    self.camera_shake_strength_changed.emit(float(percent) / 100.0)

  def _on_camera_perspective(self, _index: int) -> None:
    self.camera_perspective_changed.emit(str(self._current_camera_perspective_value()))

  def _on_rd(self, value: int) -> None:
    render_distance = int(value)
    self._lbl_rd.setText(f"Render distance: {render_distance} chunks")
    self.render_distance_changed.emit(int(render_distance))

  def _on_sun_az(self, value: int) -> None:
    self._lbl_sun_az.setText(f"Sun azimuth: {int(value)} deg")
    self.sun_azimuth_changed.emit(float(value))

  def _on_sun_el(self, value: int) -> None:
    self._lbl_sun_el.setText(f"Sun elevation: {int(value)} deg")
    self.sun_elevation_changed.emit(float(value))

  def _on_cloud_density(self, value: int) -> None:
    density = int(value)
    self._lbl_cloud_density.setText(f"Cloud density: {density}")
    self.cloud_density_changed.emit(int(density))

  def _on_cloud_seed(self, value: int) -> None:
    seed = int(value)
    self._lbl_cloud_seed.setText(f"Cloud seed: {seed}")
    self.cloud_seed_changed.emit(int(seed))

  def _on_cloud_flow_direction(self, _index: int) -> None:
    self.cloud_flow_direction_changed.emit(str(self._current_cloud_flow_value()))

  def _on_master_volume(self, value: int) -> None:
    percent = int(max(0, min(100, int(value))))
    self._lbl_master_volume.setText(f"Master volume: {percent}%")
    self.master_volume_changed.emit(float(percent) / 100.0)

  def _on_ambient_volume(self, value: int) -> None:
    percent = int(max(0, min(100, int(value))))
    self._lbl_ambient_volume.setText(f"Ambient volume: {percent}%")
    self.ambient_volume_changed.emit(float(percent) / 100.0)

  def _on_block_volume(self, value: int) -> None:
    percent = int(max(0, min(100, int(value))))
    self._lbl_block_volume.setText(f"Block volume: {percent}%")
    self.block_volume_changed.emit(float(percent) / 100.0)

  def _on_player_volume(self, value: int) -> None:
    percent = int(max(0, min(100, int(value))))
    self._lbl_player_volume.setText(f"Player volume: {percent}%")
    self.player_volume_changed.emit(float(percent) / 100.0)

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
