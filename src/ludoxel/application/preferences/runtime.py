# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import ClassVar

from ludoxel.application.preferences.audio import AudioPreferences
from ludoxel.application.preferences.camera import CAMERA_PERSPECTIVE_FIRST_PERSON, cycle_camera_perspective, is_first_person_camera_perspective, normalize_camera_perspective
from ludoxel.application.preferences.cloud_flow import DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION, normalize_backend_cloud_flow_direction
from ludoxel.application.preferences.clouds import (
  CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND,
  CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND,
  CLOUD_Y_MAX,
  CLOUD_Y_MIN,
  DEFAULT_CLOUD_FIXED_Y,
  DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED,
  DEFAULT_CLOUD_PREFERRED_Y_MAX,
  DEFAULT_CLOUD_PREFERRED_Y_MIN,
  DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT,
  DEFAULT_CLOUD_SPAWN_Y_MAX,
  DEFAULT_CLOUD_SPAWN_Y_MIN,
  DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND,
  DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND,
  DEFAULT_CLOUD_SPEED_VARIATION_ENABLED,
  normalize_cloud_height_settings,
  normalize_cloud_speed_range,
)
from ludoxel.application.preferences.crosshair import CROSSHAIR_MODE_DEFAULT, EMPTY_CROSSHAIR_PIXELS, normalize_crosshair_mode, normalize_crosshair_pixels
from ludoxel.application.preferences.keybinds import KeybindSettings
from ludoxel.application.preferences.player_name import normalize_player_name
from ludoxel.application.preferences.player_skin import PLAYER_SKIN_KIND_ALEX, normalize_player_skin_kind
from ludoxel.application.preferences.shadow import SHADOW_MAP_QUALITY_DEFAULT, normalize_shadow_map_quality
from ludoxel.foundations.mathematics.scalars.numeric import clampf, clampi
from ludoxel.simulation.inventories.hotbars.ai_route_defaults import default_ai_route_hotbar_slots
from ludoxel.simulation.inventories.hotbars.defaults import default_hotbar_slots
from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE, cycle_hotbar_index, normalize_hotbar_index, normalize_hotbar_slots, with_hotbar_assignment
from ludoxel.simulation.inventories.special_items.registry import is_special_item_id
from ludoxel.simulation.inventories.storage.grid import default_upper_inventory_slots, normalize_upper_inventory_slots
from ludoxel.simulation.spaces.othello.game.state import OthelloSettings
from ludoxel.simulation.spaces.othello.inventories.hotbar import default_othello_hotbar_slots
from ludoxel.simulation.worlds.config.render_distance import clamp_render_distance_chunks
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_MY_WORLD, is_othello_space, normalize_play_space_id


def _coerce_optional_int(value: object) -> int | None:
  if value is None:
    return None
  try:
    return int(value)
  except (TypeError, ValueError):
    return None


def _default_hotbar_slots_list() -> list[str]:
  return list(default_hotbar_slots(size=HOTBAR_SIZE))


def _default_othello_hotbar_slots_list() -> list[str]:
  return list(default_othello_hotbar_slots(size=HOTBAR_SIZE))


def _default_route_hotbar_slots_list() -> list[str]:
  return list(default_ai_route_hotbar_slots(size=HOTBAR_SIZE))


def _default_upper_inventory_slots_list() -> list[str]:
  return list(default_upper_inventory_slots())


def _normalize_hotbar_state(slots: object, index: object, *, size: int = HOTBAR_SIZE) -> tuple[list[str], int]:
  normalized_slots = list(normalize_hotbar_slots(slots, size=int(size)))
  normalized_index = normalize_hotbar_index(index, size=int(size))
  return normalized_slots, int(normalized_index)


@dataclass
class RuntimePreferences:
  DEFAULT_BLOCK_BREAK_REPEAT_INTERVAL_S: ClassVar[float] = 0.30
  DEFAULT_BLOCK_PLACE_REPEAT_INITIAL_DELAY_S: ClassVar[float] = 0.20
  DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S: ClassVar[float] = 1.0 / 120.0
  LEGACY_DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S: ClassVar[float] = 0.20
  DEFAULT_BLOCK_INTERACT_REPEAT_INTERVAL_S: ClassVar[float] = 0.20
  BLOCK_BREAK_REPEAT_INTERVAL_MIN: ClassVar[float] = 0.0
  BLOCK_BREAK_REPEAT_INTERVAL_MAX: ClassVar[float] = 1.0
  BLOCK_PLACE_REPEAT_INTERVAL_MIN: ClassVar[float] = 0.0
  BLOCK_PLACE_REPEAT_INTERVAL_MAX: ClassVar[float] = 1.0
  BLOCK_INTERACT_REPEAT_INTERVAL_MIN: ClassVar[float] = 0.0
  BLOCK_INTERACT_REPEAT_INTERVAL_MAX: ClassVar[float] = 1.0
  DEFAULT_BLOCK_BREAK_PARTICLE_SPAWN_RATE: ClassVar[float] = 1.0
  DEFAULT_BLOCK_BREAK_PARTICLE_SPEED_SCALE: ClassVar[float] = 1.0
  BLOCK_BREAK_PARTICLE_SPAWN_RATE_MIN: ClassVar[float] = 0.0
  BLOCK_BREAK_PARTICLE_SPAWN_RATE_MAX: ClassVar[float] = 2.0
  BLOCK_BREAK_PARTICLE_SPEED_SCALE_MIN: ClassVar[float] = 0.1
  BLOCK_BREAK_PARTICLE_SPEED_SCALE_MAX: ClassVar[float] = 3.0
  DEFAULT_ARM_ROTATION_LIMIT_MIN_DEG: ClassVar[float] = -180.0
  DEFAULT_ARM_ROTATION_LIMIT_MAX_DEG: ClassVar[float] = 180.0
  ARM_ROTATION_LIMIT_ALLOWED_MIN_DEG: ClassVar[float] = -180.0
  ARM_ROTATION_LIMIT_ALLOWED_MAX_DEG: ClassVar[float] = 180.0
  DEFAULT_ARM_SWING_DURATION_S: ClassVar[float] = 6.0 / 20.0
  ARM_SWING_DURATION_MIN_S: ClassVar[float] = 0.05
  ARM_SWING_DURATION_MAX_S: ClassVar[float] = 1.50
  CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND: ClassVar[float] = CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND
  CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND: ClassVar[float] = CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND
  DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND: ClassVar[float] = DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND
  DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND: ClassVar[float] = DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND
  CLOUD_Y_MIN: ClassVar[int] = CLOUD_Y_MIN
  CLOUD_Y_MAX: ClassVar[int] = CLOUD_Y_MAX
  DEFAULT_CLOUD_FIXED_Y: ClassVar[int] = DEFAULT_CLOUD_FIXED_Y
  DEFAULT_CLOUD_SPAWN_Y_MIN: ClassVar[int] = DEFAULT_CLOUD_SPAWN_Y_MIN
  DEFAULT_CLOUD_SPAWN_Y_MAX: ClassVar[int] = DEFAULT_CLOUD_SPAWN_Y_MAX
  DEFAULT_CLOUD_PREFERRED_Y_MIN: ClassVar[int] = DEFAULT_CLOUD_PREFERRED_Y_MIN
  DEFAULT_CLOUD_PREFERRED_Y_MAX: ClassVar[int] = DEFAULT_CLOUD_PREFERRED_Y_MAX
  DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT: ClassVar[int] = DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT

  current_space_id: str = PLAY_SPACE_MY_WORLD
  invert_x: bool = False
  invert_y: bool = False
  outline_selection: bool = True
  cloud_wire: bool = False
  cloud_enabled: bool = True
  cloud_density: int = 1
  cloud_seed: int = 1337
  cloud_flow_direction: str = DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION
  cloud_speed_variation_enabled: bool = DEFAULT_CLOUD_SPEED_VARIATION_ENABLED
  cloud_speed_min_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND
  cloud_speed_max_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND
  cloud_height_variation_enabled: bool = DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED
  cloud_fixed_y: int = DEFAULT_CLOUD_FIXED_Y
  cloud_spawn_y_min: int = DEFAULT_CLOUD_SPAWN_Y_MIN
  cloud_spawn_y_max: int = DEFAULT_CLOUD_SPAWN_Y_MAX
  cloud_preferred_y_min: int = DEFAULT_CLOUD_PREFERRED_Y_MIN
  cloud_preferred_y_max: int = DEFAULT_CLOUD_PREFERRED_Y_MAX
  cloud_preferred_y_probability_percent: int = DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT
  world_wire: bool = False
  shadow_enabled: bool = True
  shadow_map_quality: int = SHADOW_MAP_QUALITY_DEFAULT
  creative_mode: bool = False
  my_world_hotbar_slots: list[str] = field(default_factory=_default_hotbar_slots_list)
  my_world_selected_hotbar_index: int = 0
  my_world_upper_slots: list[str] = field(default_factory=_default_upper_inventory_slots_list)
  othello_hotbar_slots: list[str] = field(default_factory=_default_othello_hotbar_slots_list)
  othello_selected_hotbar_index: int = 0
  route_hotbar_slots: list[str] = field(default_factory=_default_route_hotbar_slots_list)
  route_selected_hotbar_index: int = 0
  route_edit_active: bool = False
  othello_settings: OthelloSettings = field(default_factory=OthelloSettings)
  reach: float = 5.0
  block_break_repeat_interval_s: float = DEFAULT_BLOCK_BREAK_REPEAT_INTERVAL_S
  block_place_repeat_interval_s: float = DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S
  block_interact_repeat_interval_s: float = DEFAULT_BLOCK_INTERACT_REPEAT_INTERVAL_S
  block_break_particle_spawn_rate: float = DEFAULT_BLOCK_BREAK_PARTICLE_SPAWN_RATE
  block_break_particle_speed_scale: float = DEFAULT_BLOCK_BREAK_PARTICLE_SPEED_SCALE
  auto_jump_enabled: bool = False
  auto_sprint_enabled: bool = False
  hide_hud: bool = False
  hide_hand: bool = False
  player_name: str = ""
  resolved_player_name: str = ""
  crosshair_mode: str = CROSSHAIR_MODE_DEFAULT
  crosshair_pixels: tuple[str, ...] = field(default_factory=lambda: EMPTY_CROSSHAIR_PIXELS)
  player_skin_kind: str = PLAYER_SKIN_KIND_ALEX
  camera_perspective: str = CAMERA_PERSPECTIVE_FIRST_PERSON
  fullscreen: bool = False
  view_bobbing_enabled: bool = True
  camera_shake_enabled: bool = True
  view_bobbing_strength: float = 0.35
  camera_shake_strength: float = 0.20
  arm_rotation_limit_min_deg: float = DEFAULT_ARM_ROTATION_LIMIT_MIN_DEG
  arm_rotation_limit_max_deg: float = DEFAULT_ARM_ROTATION_LIMIT_MAX_DEG
  arm_swing_duration_s: float = DEFAULT_ARM_SWING_DURATION_S
  animated_textures_enabled: bool = True
  render_distance_chunks: int = 6
  sun_az_deg: float = 45.0
  sun_el_deg: float = 60.0
  debug_shadow: bool = False
  vsync_on: bool = False
  hud_visible: bool = False
  window_left: int | None = None
  window_top: int | None = None
  window_width: int = 1280
  window_height: int = 720
  window_screen_name: str = ""
  keybinds: KeybindSettings = field(default_factory=KeybindSettings)
  audio: AudioPreferences = field(default_factory=AudioPreferences)

  def normalize(self) -> None:
    self.current_space_id = normalize_play_space_id(self.current_space_id)

    self.invert_x = bool(self.invert_x)
    self.invert_y = bool(self.invert_y)
    self.outline_selection = bool(self.outline_selection)
    self.cloud_wire = bool(self.cloud_wire)
    self.cloud_enabled = bool(self.cloud_enabled)
    self.cloud_speed_variation_enabled = bool(self.cloud_speed_variation_enabled)
    self.cloud_height_variation_enabled = bool(self.cloud_height_variation_enabled)
    self.world_wire = bool(self.world_wire)
    self.shadow_enabled = bool(self.shadow_enabled)
    self.shadow_map_quality = normalize_shadow_map_quality(self.shadow_map_quality)
    self.creative_mode = bool(self.creative_mode)
    self.route_edit_active = bool(self.route_edit_active)
    self.auto_jump_enabled = bool(self.auto_jump_enabled)
    self.auto_sprint_enabled = bool(self.auto_sprint_enabled)
    self.hide_hud = bool(self.hide_hud)
    self.hide_hand = bool(self.hide_hand)
    self.player_name = normalize_player_name(self.player_name)
    self.resolved_player_name = normalize_player_name(self.resolved_player_name) or str(self.player_name)
    self.crosshair_mode = normalize_crosshair_mode(self.crosshair_mode)
    self.crosshair_pixels = normalize_crosshair_pixels(self.crosshair_pixels)
    self.player_skin_kind = normalize_player_skin_kind(self.player_skin_kind)
    self.camera_perspective = normalize_camera_perspective(self.camera_perspective)
    self.fullscreen = bool(self.fullscreen)
    self.view_bobbing_enabled = bool(self.view_bobbing_enabled)
    self.camera_shake_enabled = bool(self.camera_shake_enabled)
    self.animated_textures_enabled = bool(self.animated_textures_enabled)
    self.debug_shadow = bool(self.debug_shadow)
    self.vsync_on = bool(self.vsync_on)
    self.hud_visible = bool(self.hud_visible)

    self.cloud_density = clampi(int(self.cloud_density), 0, 4)
    self.cloud_seed = clampi(int(self.cloud_seed), 0, 9999)
    self.cloud_flow_direction = normalize_backend_cloud_flow_direction(str(self.cloud_flow_direction))
    self.cloud_speed_min_blocks_per_second, self.cloud_speed_max_blocks_per_second = normalize_cloud_speed_range(self.cloud_speed_min_blocks_per_second, self.cloud_speed_max_blocks_per_second)
    (self.cloud_fixed_y, self.cloud_spawn_y_min, self.cloud_spawn_y_max, self.cloud_preferred_y_min, self.cloud_preferred_y_max, self.cloud_preferred_y_probability_percent) = (
      normalize_cloud_height_settings(
        self.cloud_fixed_y, self.cloud_spawn_y_min, self.cloud_spawn_y_max, self.cloud_preferred_y_min, self.cloud_preferred_y_max, self.cloud_preferred_y_probability_percent
      )
    )
    self.render_distance_chunks = clamp_render_distance_chunks(int(self.render_distance_chunks))
    self.view_bobbing_strength = clampf(float(self.view_bobbing_strength), 0.0, 1.0)
    self.camera_shake_strength = clampf(float(self.camera_shake_strength), 0.0, 1.0)
    self.arm_rotation_limit_min_deg = clampf(float(self.arm_rotation_limit_min_deg), float(self.ARM_ROTATION_LIMIT_ALLOWED_MIN_DEG), float(self.ARM_ROTATION_LIMIT_ALLOWED_MAX_DEG))
    self.arm_rotation_limit_max_deg = clampf(float(self.arm_rotation_limit_max_deg), float(self.ARM_ROTATION_LIMIT_ALLOWED_MIN_DEG), float(self.ARM_ROTATION_LIMIT_ALLOWED_MAX_DEG))
    if float(self.arm_rotation_limit_min_deg) > float(self.arm_rotation_limit_max_deg):
      self.arm_rotation_limit_min_deg, self.arm_rotation_limit_max_deg = float(self.arm_rotation_limit_max_deg), float(self.arm_rotation_limit_min_deg)
    self.arm_swing_duration_s = clampf(float(self.arm_swing_duration_s), float(self.ARM_SWING_DURATION_MIN_S), float(self.ARM_SWING_DURATION_MAX_S))
    self.reach = max(0.0, float(self.reach))
    self.block_break_repeat_interval_s = clampf(float(self.block_break_repeat_interval_s), float(self.BLOCK_BREAK_REPEAT_INTERVAL_MIN), float(self.BLOCK_BREAK_REPEAT_INTERVAL_MAX))
    self.block_place_repeat_interval_s = clampf(float(self.block_place_repeat_interval_s), float(self.BLOCK_PLACE_REPEAT_INTERVAL_MIN), float(self.BLOCK_PLACE_REPEAT_INTERVAL_MAX))
    if math.isclose(float(self.block_place_repeat_interval_s), float(self.LEGACY_DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S), rel_tol=0.0, abs_tol=1e-9):
      self.block_place_repeat_interval_s = float(self.DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S)
    self.block_interact_repeat_interval_s = clampf(float(self.block_interact_repeat_interval_s), float(self.BLOCK_INTERACT_REPEAT_INTERVAL_MIN), float(self.BLOCK_INTERACT_REPEAT_INTERVAL_MAX))
    self.block_break_particle_spawn_rate = clampf(float(self.block_break_particle_spawn_rate), float(self.BLOCK_BREAK_PARTICLE_SPAWN_RATE_MIN), float(self.BLOCK_BREAK_PARTICLE_SPAWN_RATE_MAX))
    self.block_break_particle_speed_scale = clampf(float(self.block_break_particle_speed_scale), float(self.BLOCK_BREAK_PARTICLE_SPEED_SCALE_MIN), float(self.BLOCK_BREAK_PARTICLE_SPEED_SCALE_MAX))
    self.window_left = _coerce_optional_int(self.window_left)
    self.window_top = _coerce_optional_int(self.window_top)
    self.window_width = max(320, int(self.window_width))
    self.window_height = max(240, int(self.window_height))
    self.window_screen_name = str(self.window_screen_name or "").strip()

    azimuth = float(self.sun_az_deg) % 360.0
    self.sun_az_deg = azimuth if azimuth >= 0.0 else azimuth + 360.0
    self.sun_el_deg = clampf(float(self.sun_el_deg), 0.0, 90.0)

    self.my_world_hotbar_slots, self.my_world_selected_hotbar_index = _normalize_hotbar_state(self.my_world_hotbar_slots, self.my_world_selected_hotbar_index, size=HOTBAR_SIZE)
    self.my_world_upper_slots = list(normalize_upper_inventory_slots(self.my_world_upper_slots))
    self.othello_hotbar_slots, self.othello_selected_hotbar_index = _normalize_hotbar_state(self.othello_hotbar_slots, self.othello_selected_hotbar_index, size=HOTBAR_SIZE)
    self.route_hotbar_slots, self.route_selected_hotbar_index = _normalize_hotbar_state(self.route_hotbar_slots, self.route_selected_hotbar_index, size=HOTBAR_SIZE)

    self.othello_settings = self.othello_settings.normalized()
    self.keybinds = self.keybinds.normalized()
    self.audio = self.audio.normalized()

  def clone(self) -> "RuntimePreferences":
    return coerce_runtime_preferences(runtime=self)

  def is_othello_space(self) -> bool:
    return is_othello_space(self.current_space_id)

  def is_first_person_view(self) -> bool:
    return is_first_person_camera_perspective(self.camera_perspective)

  def view_model_visible(self) -> bool:
    return bool(self.is_first_person_view()) and (not bool(self.hide_hand))

  def cycle_camera_perspective(self, step: int = 1) -> None:
    self.camera_perspective = cycle_camera_perspective(self.camera_perspective, step=int(step))

  def _active_hotbar_state_attrs(self) -> tuple[str, str]:
    if self.is_othello_space():
      return ("othello_hotbar_slots", "othello_selected_hotbar_index")
    if bool(self.route_edit_active):
      return ("route_hotbar_slots", "route_selected_hotbar_index")
    return ("my_world_hotbar_slots", "my_world_selected_hotbar_index")

  def _active_hotbar_slots(self) -> list[str]:
    slots_attr, _index_attr = self._active_hotbar_state_attrs()
    return getattr(self, slots_attr)

  def _active_hotbar_index(self) -> int:
    _slots_attr, index_attr = self._active_hotbar_state_attrs()
    return int(getattr(self, index_attr))

  def active_hotbar_index(self) -> int:
    return int(self._active_hotbar_index())

  def hotbar_snapshot(self) -> tuple[str, ...]:
    return tuple(str(value).strip() for value in self._active_hotbar_slots())

  def current_item_id(self) -> str | None:
    slots = self._active_hotbar_slots()
    index = self._active_hotbar_index()
    value = str(slots[index]).strip()
    return value if value else None

  def current_block_id(self) -> str | None:
    item_id = self.current_item_id()
    if item_id is None or is_special_item_id(item_id):
      return None
    return item_id

  def current_special_item_id(self) -> str | None:
    item_id = self.current_item_id()
    if item_id is None or not is_special_item_id(item_id):
      return None
    return item_id

  def set_hotbar_slot(self, index: int, item_id: str | None) -> None:
    self.normalize()
    slots_attr, _index_attr = self._active_hotbar_state_attrs()
    active_slots = getattr(self, slots_attr)
    setattr(self, slots_attr, list(with_hotbar_assignment(active_slots, index, item_id, size=HOTBAR_SIZE)))

  def select_hotbar_index(self, index: int) -> None:
    self.normalize()
    _slots_attr, index_attr = self._active_hotbar_state_attrs()
    setattr(self, index_attr, normalize_hotbar_index(index, size=HOTBAR_SIZE))

  def cycle_hotbar(self, delta_steps: int) -> None:
    self.normalize()
    _slots_attr, index_attr = self._active_hotbar_state_attrs()
    current_index = int(getattr(self, index_attr))
    setattr(self, index_attr, cycle_hotbar_index(current_index, delta_steps, size=HOTBAR_SIZE))

  def clear_selected_hotbar_slot(self) -> None:
    self.normalize()
    self.set_hotbar_slot(self._active_hotbar_index(), None)

  def my_world_upper_snapshot(self) -> tuple[str, ...]:
    return tuple(str(value).strip() for value in self.my_world_upper_slots)

  def set_my_world_hotbar_slots(self, slots: object) -> None:
    self.my_world_hotbar_slots = list(normalize_hotbar_slots(slots, size=HOTBAR_SIZE))

  def set_my_world_upper_slots(self, slots: object) -> None:
    self.my_world_upper_slots = list(normalize_upper_inventory_slots(slots))


def coerce_runtime_preferences(*, runtime: RuntimePreferences | None = None, **overrides) -> RuntimePreferences:
  if runtime is not None:
    out = RuntimePreferences(
      current_space_id=str(runtime.current_space_id),
      invert_x=bool(runtime.invert_x),
      invert_y=bool(runtime.invert_y),
      outline_selection=bool(runtime.outline_selection),
      cloud_wire=bool(runtime.cloud_wire),
      cloud_enabled=bool(runtime.cloud_enabled),
      cloud_density=int(runtime.cloud_density),
      cloud_seed=int(runtime.cloud_seed),
      cloud_flow_direction=str(runtime.cloud_flow_direction),
      cloud_speed_variation_enabled=bool(runtime.cloud_speed_variation_enabled),
      cloud_speed_min_blocks_per_second=float(runtime.cloud_speed_min_blocks_per_second),
      cloud_speed_max_blocks_per_second=float(runtime.cloud_speed_max_blocks_per_second),
      cloud_height_variation_enabled=bool(runtime.cloud_height_variation_enabled),
      cloud_fixed_y=int(runtime.cloud_fixed_y),
      cloud_spawn_y_min=int(runtime.cloud_spawn_y_min),
      cloud_spawn_y_max=int(runtime.cloud_spawn_y_max),
      cloud_preferred_y_min=int(runtime.cloud_preferred_y_min),
      cloud_preferred_y_max=int(runtime.cloud_preferred_y_max),
      cloud_preferred_y_probability_percent=int(runtime.cloud_preferred_y_probability_percent),
      world_wire=bool(runtime.world_wire),
      shadow_enabled=bool(runtime.shadow_enabled),
      shadow_map_quality=normalize_shadow_map_quality(runtime.shadow_map_quality),
      creative_mode=bool(runtime.creative_mode),
      my_world_hotbar_slots=list(runtime.my_world_hotbar_slots),
      my_world_selected_hotbar_index=int(runtime.my_world_selected_hotbar_index),
      my_world_upper_slots=list(runtime.my_world_upper_slots),
      othello_hotbar_slots=list(runtime.othello_hotbar_slots),
      othello_selected_hotbar_index=int(runtime.othello_selected_hotbar_index),
      route_hotbar_slots=list(runtime.route_hotbar_slots),
      route_selected_hotbar_index=int(runtime.route_selected_hotbar_index),
      route_edit_active=bool(runtime.route_edit_active),
      othello_settings=runtime.othello_settings.normalized(),
      reach=float(runtime.reach),
      block_break_repeat_interval_s=float(runtime.block_break_repeat_interval_s),
      block_place_repeat_interval_s=float(runtime.block_place_repeat_interval_s),
      block_interact_repeat_interval_s=float(runtime.block_interact_repeat_interval_s),
      block_break_particle_spawn_rate=float(runtime.block_break_particle_spawn_rate),
      block_break_particle_speed_scale=float(runtime.block_break_particle_speed_scale),
      auto_jump_enabled=bool(runtime.auto_jump_enabled),
      auto_sprint_enabled=bool(runtime.auto_sprint_enabled),
      hide_hud=bool(runtime.hide_hud),
      hide_hand=bool(runtime.hide_hand),
      player_name=str(runtime.player_name),
      resolved_player_name=str(runtime.resolved_player_name),
      crosshair_mode=str(runtime.crosshair_mode),
      crosshair_pixels=tuple(runtime.crosshair_pixels),
      player_skin_kind=str(runtime.player_skin_kind),
      camera_perspective=str(runtime.camera_perspective),
      fullscreen=bool(runtime.fullscreen),
      view_bobbing_enabled=bool(runtime.view_bobbing_enabled),
      camera_shake_enabled=bool(runtime.camera_shake_enabled),
      view_bobbing_strength=float(runtime.view_bobbing_strength),
      camera_shake_strength=float(runtime.camera_shake_strength),
      arm_rotation_limit_min_deg=float(runtime.arm_rotation_limit_min_deg),
      arm_rotation_limit_max_deg=float(runtime.arm_rotation_limit_max_deg),
      arm_swing_duration_s=float(runtime.arm_swing_duration_s),
      animated_textures_enabled=bool(runtime.animated_textures_enabled),
      render_distance_chunks=int(runtime.render_distance_chunks),
      sun_az_deg=float(runtime.sun_az_deg),
      sun_el_deg=float(runtime.sun_el_deg),
      debug_shadow=bool(runtime.debug_shadow),
      vsync_on=bool(runtime.vsync_on),
      hud_visible=bool(runtime.hud_visible),
      window_left=_coerce_optional_int(runtime.window_left),
      window_top=_coerce_optional_int(runtime.window_top),
      window_width=int(runtime.window_width),
      window_height=int(runtime.window_height),
      window_screen_name=str(runtime.window_screen_name),
      keybinds=runtime.keybinds.normalized(),
      audio=runtime.audio.normalized(),
    )
  else:
    out = RuntimePreferences()

  for key, value in overrides.items():
    if value is None or not hasattr(out, key):
      continue
    if key.endswith("_hotbar_slots"):
      setattr(out, key, list(value))
    elif key == "crosshair_pixels":
      setattr(out, key, normalize_crosshair_pixels(value))
    elif key == "othello_settings":
      setattr(out, key, value.normalized())
    elif key == "keybinds":
      if isinstance(value, KeybindSettings):
        setattr(out, key, value.normalized())
      else:
        setattr(out, key, KeybindSettings.from_dict(value))
    elif key == "audio":
      if isinstance(value, AudioPreferences):
        setattr(out, key, value.normalized())
      else:
        setattr(out, key, AudioPreferences.from_dict(value))
    else:
      setattr(out, key, value)

  out.normalize()
  return out
