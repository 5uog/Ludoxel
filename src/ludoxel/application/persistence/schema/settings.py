# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.application.preferences.audio import AudioPreferences
from ludoxel.application.preferences.camera import CAMERA_PERSPECTIVE_FIRST_PERSON, normalize_camera_perspective
from ludoxel.application.preferences.clouds import normalize_cloud_height_settings, normalize_cloud_speed_range
from ludoxel.application.preferences.crosshair import CROSSHAIR_MODE_DEFAULT, EMPTY_CROSSHAIR_PIXELS, normalize_crosshair_mode, normalize_crosshair_pixels
from ludoxel.application.preferences.keybinds import KeybindSettings
from ludoxel.application.preferences.player_name import normalize_player_name
from ludoxel.application.preferences.player_skin import PLAYER_SKIN_KIND_ALEX, normalize_player_skin_kind
from ludoxel.application.preferences.runtime import RuntimePreferences
from ludoxel.application.preferences.shadow import SHADOW_MAP_QUALITY_DEFAULT, normalize_shadow_map_quality
from ludoxel.foundations.mathematics.scalars.coercion import coerce_int, mapping_bool, mapping_float, mapping_int, mapping_str
from ludoxel.simulation.worlds.config.movement import DEFAULT_MOVEMENT_PARAMS
from ludoxel.simulation.worlds.config.player_health import PLAYER_REGEN_DEFAULT_CAP_HP, PLAYER_REGEN_DEFAULT_ENABLED, PLAYER_REGEN_DEFAULT_START_DELAY_S, PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S
from ludoxel.simulation.worlds.config.render_distance import clamp_render_distance_chunks


@dataclass(frozen=True)
class PersistedSettings:
  fov_deg: float = 80.0
  mouse_sens_deg_per_px: float = 0.09

  invert_x: bool = False
  invert_y: bool = False

  outline_selection: bool = True

  cloud_wireframe: bool = False
  world_wireframe: bool = False
  shadow_enabled: bool = True
  shadow_map_quality: int = SHADOW_MAP_QUALITY_DEFAULT

  sun_az_deg: float = 45.0
  sun_el_deg: float = 60.0

  cloud_enabled: bool = True
  cloud_density: int = 1
  cloud_seed: int = 1337
  cloud_flow_direction: str = "west_to_east"
  cloud_speed_variation_enabled: bool = True
  cloud_speed_min_blocks_per_second: float = float(RuntimePreferences.DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND)
  cloud_speed_max_blocks_per_second: float = float(RuntimePreferences.DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND)
  cloud_height_variation_enabled: bool = True
  cloud_fixed_y: int = int(RuntimePreferences.DEFAULT_CLOUD_FIXED_Y)
  cloud_spawn_y_min: int = int(RuntimePreferences.DEFAULT_CLOUD_SPAWN_Y_MIN)
  cloud_spawn_y_max: int = int(RuntimePreferences.DEFAULT_CLOUD_SPAWN_Y_MAX)
  cloud_preferred_y_min: int = int(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_MIN)
  cloud_preferred_y_max: int = int(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_MAX)
  cloud_preferred_y_probability_percent: int = int(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT)

  creative_mode: bool = False
  block_break_repeat_interval_s: float = float(RuntimePreferences.DEFAULT_BLOCK_BREAK_REPEAT_INTERVAL_S)
  block_place_repeat_interval_s: float = float(RuntimePreferences.DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S)
  block_interact_repeat_interval_s: float = float(RuntimePreferences.DEFAULT_BLOCK_INTERACT_REPEAT_INTERVAL_S)
  block_break_particle_spawn_rate: float = float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPAWN_RATE)
  block_break_particle_speed_scale: float = float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPEED_SCALE)
  auto_jump_enabled: bool = False
  auto_sprint_enabled: bool = False
  hide_hud: bool = False
  hide_hand: bool = False
  player_name: str = ""
  crosshair_mode: str = CROSSHAIR_MODE_DEFAULT
  crosshair_pixels: tuple[str, ...] = field(default_factory=lambda: EMPTY_CROSSHAIR_PIXELS)
  player_skin_kind: str = PLAYER_SKIN_KIND_ALEX
  camera_perspective: str = CAMERA_PERSPECTIVE_FIRST_PERSON
  fullscreen: bool = False
  view_bobbing_enabled: bool = True
  camera_shake_enabled: bool = True
  view_bobbing_strength: float = 0.35
  camera_shake_strength: float = 0.20
  arm_rotation_limit_min_deg: float = float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MIN_DEG)
  arm_rotation_limit_max_deg: float = float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MAX_DEG)
  arm_swing_duration_s: float = float(RuntimePreferences.DEFAULT_ARM_SWING_DURATION_S)
  animated_textures_enabled: bool = True

  gravity: float = float(DEFAULT_MOVEMENT_PARAMS.gravity)
  walk_speed: float = float(DEFAULT_MOVEMENT_PARAMS.walk_speed)
  sprint_speed: float = float(DEFAULT_MOVEMENT_PARAMS.sprint_speed)
  jump_v0: float = float(DEFAULT_MOVEMENT_PARAMS.jump_v0)
  auto_jump_cooldown_s: float = float(DEFAULT_MOVEMENT_PARAMS.auto_jump_cooldown_s)
  fly_speed: float = float(DEFAULT_MOVEMENT_PARAMS.fly_speed)
  fly_ascend_speed: float = float(DEFAULT_MOVEMENT_PARAMS.fly_ascend_speed)
  fly_descend_speed: float = float(DEFAULT_MOVEMENT_PARAMS.fly_descend_speed)

  player_regen_enabled: bool = bool(PLAYER_REGEN_DEFAULT_ENABLED)
  player_regen_start_delay_s: float = float(PLAYER_REGEN_DEFAULT_START_DELAY_S)
  player_regen_cap_hp: float = float(PLAYER_REGEN_DEFAULT_CAP_HP)
  player_regen_time_to_cap_s: float = float(PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S)

  render_distance_chunks: int = 6
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

  def __post_init__(self) -> None:
    speed_min, speed_max = normalize_cloud_speed_range(self.cloud_speed_min_blocks_per_second, self.cloud_speed_max_blocks_per_second)
    fixed_y, spawn_y_min, spawn_y_max, preferred_y_min, preferred_y_max, probability = normalize_cloud_height_settings(
      self.cloud_fixed_y, self.cloud_spawn_y_min, self.cloud_spawn_y_max, self.cloud_preferred_y_min, self.cloud_preferred_y_max, self.cloud_preferred_y_probability_percent
    )
    object.__setattr__(self, "cloud_speed_variation_enabled", bool(self.cloud_speed_variation_enabled))
    object.__setattr__(self, "cloud_speed_min_blocks_per_second", float(speed_min))
    object.__setattr__(self, "cloud_speed_max_blocks_per_second", float(speed_max))
    object.__setattr__(self, "cloud_height_variation_enabled", bool(self.cloud_height_variation_enabled))
    object.__setattr__(self, "cloud_fixed_y", int(fixed_y))
    object.__setattr__(self, "cloud_spawn_y_min", int(spawn_y_min))
    object.__setattr__(self, "cloud_spawn_y_max", int(spawn_y_max))
    object.__setattr__(self, "cloud_preferred_y_min", int(preferred_y_min))
    object.__setattr__(self, "cloud_preferred_y_max", int(preferred_y_max))
    object.__setattr__(self, "cloud_preferred_y_probability_percent", int(probability))
    object.__setattr__(self, "shadow_map_quality", normalize_shadow_map_quality(self.shadow_map_quality))

  def to_dict(self) -> dict[str, Any]:
    return {
      "fov_deg": float(self.fov_deg),
      "mouse_sens_deg_per_px": float(self.mouse_sens_deg_per_px),
      "invert_x": bool(self.invert_x),
      "invert_y": bool(self.invert_y),
      "outline_selection": bool(self.outline_selection),
      "cloud_wireframe": bool(self.cloud_wireframe),
      "world_wireframe": bool(self.world_wireframe),
      "shadow_enabled": bool(self.shadow_enabled),
      "shadow_map_quality": int(self.shadow_map_quality),
      "sun_az_deg": float(self.sun_az_deg),
      "sun_el_deg": float(self.sun_el_deg),
      "cloud_enabled": bool(self.cloud_enabled),
      "cloud_density": int(self.cloud_density),
      "cloud_seed": int(self.cloud_seed),
      "cloud_flow_direction": str(self.cloud_flow_direction),
      "cloud_speed_variation_enabled": bool(self.cloud_speed_variation_enabled),
      "cloud_speed_min_blocks_per_second": float(self.cloud_speed_min_blocks_per_second),
      "cloud_speed_max_blocks_per_second": float(self.cloud_speed_max_blocks_per_second),
      "cloud_height_variation_enabled": bool(self.cloud_height_variation_enabled),
      "cloud_fixed_y": int(self.cloud_fixed_y),
      "cloud_spawn_y_min": int(self.cloud_spawn_y_min),
      "cloud_spawn_y_max": int(self.cloud_spawn_y_max),
      "cloud_preferred_y_min": int(self.cloud_preferred_y_min),
      "cloud_preferred_y_max": int(self.cloud_preferred_y_max),
      "cloud_preferred_y_probability_percent": int(self.cloud_preferred_y_probability_percent),
      "creative_mode": bool(self.creative_mode),
      "block_break_repeat_interval_s": float(self.block_break_repeat_interval_s),
      "block_place_repeat_interval_s": float(self.block_place_repeat_interval_s),
      "block_interact_repeat_interval_s": float(self.block_interact_repeat_interval_s),
      "block_break_particle_spawn_rate": float(self.block_break_particle_spawn_rate),
      "block_break_particle_speed_scale": float(self.block_break_particle_speed_scale),
      "auto_jump_enabled": bool(self.auto_jump_enabled),
      "auto_sprint_enabled": bool(self.auto_sprint_enabled),
      "hide_hud": bool(self.hide_hud),
      "hide_hand": bool(self.hide_hand),
      "player_name": normalize_player_name(self.player_name),
      "crosshair_mode": normalize_crosshair_mode(self.crosshair_mode),
      "crosshair_pixels": list(normalize_crosshair_pixels(self.crosshair_pixels)),
      "player_skin_kind": normalize_player_skin_kind(self.player_skin_kind),
      "camera_perspective": normalize_camera_perspective(self.camera_perspective),
      "fullscreen": bool(self.fullscreen),
      "view_bobbing_enabled": bool(self.view_bobbing_enabled),
      "camera_shake_enabled": bool(self.camera_shake_enabled),
      "view_bobbing_strength": float(self.view_bobbing_strength),
      "camera_shake_strength": float(self.camera_shake_strength),
      "arm_rotation_limit_min_deg": float(self.arm_rotation_limit_min_deg),
      "arm_rotation_limit_max_deg": float(self.arm_rotation_limit_max_deg),
      "arm_swing_duration_s": float(self.arm_swing_duration_s),
      "animated_textures_enabled": bool(self.animated_textures_enabled),
      "gravity": float(self.gravity),
      "walk_speed": float(self.walk_speed),
      "sprint_speed": float(self.sprint_speed),
      "jump_v0": float(self.jump_v0),
      "auto_jump_cooldown_s": float(self.auto_jump_cooldown_s),
      "fly_speed": float(self.fly_speed),
      "fly_ascend_speed": float(self.fly_ascend_speed),
      "fly_descend_speed": float(self.fly_descend_speed),
      "player_regen_enabled": bool(self.player_regen_enabled),
      "player_regen_start_delay_s": float(self.player_regen_start_delay_s),
      "player_regen_cap_hp": float(self.player_regen_cap_hp),
      "player_regen_time_to_cap_s": float(self.player_regen_time_to_cap_s),
      "render_distance_chunks": int(self.render_distance_chunks),
      "debug_shadow": bool(self.debug_shadow),
      "vsync_on": bool(self.vsync_on),
      "hud_visible": bool(self.hud_visible),
      "window_left": self.window_left,
      "window_top": self.window_top,
      "window_width": int(self.window_width),
      "window_height": int(self.window_height),
      "window_screen_name": str(self.window_screen_name),
      "keybinds": self.keybinds.normalized().to_dict(),
      "audio": self.audio.normalized().to_dict(),
    }

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PersistedSettings":
    rd = clamp_render_distance_chunks(mapping_int(d, "render_distance_chunks", 6))

    return PersistedSettings(
      fov_deg=mapping_float(d, "fov_deg", 80.0),
      mouse_sens_deg_per_px=mapping_float(d, "mouse_sens_deg_per_px", 0.09),
      invert_x=mapping_bool(d, "invert_x", False),
      invert_y=mapping_bool(d, "invert_y", False),
      outline_selection=mapping_bool(d, "outline_selection", True),
      cloud_wireframe=mapping_bool(d, "cloud_wireframe", mapping_bool(d, "cloud_wire", False)),
      world_wireframe=mapping_bool(d, "world_wireframe", mapping_bool(d, "world_wire", False)),
      shadow_enabled=mapping_bool(d, "shadow_enabled", True),
      shadow_map_quality=normalize_shadow_map_quality(d.get("shadow_map_quality", SHADOW_MAP_QUALITY_DEFAULT)),
      sun_az_deg=mapping_float(d, "sun_az_deg", 45.0),
      sun_el_deg=mapping_float(d, "sun_el_deg", 60.0),
      cloud_enabled=mapping_bool(d, "cloud_enabled", True),
      cloud_density=mapping_int(d, "cloud_density", 1),
      cloud_seed=mapping_int(d, "cloud_seed", 1337),
      cloud_flow_direction=mapping_str(d, "cloud_flow_direction", "west_to_east"),
      cloud_speed_variation_enabled=mapping_bool(d, "cloud_speed_variation_enabled", True),
      cloud_speed_min_blocks_per_second=mapping_float(d, "cloud_speed_min_blocks_per_second", float(RuntimePreferences.DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND)),
      cloud_speed_max_blocks_per_second=mapping_float(d, "cloud_speed_max_blocks_per_second", float(RuntimePreferences.DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND)),
      cloud_height_variation_enabled=mapping_bool(d, "cloud_height_variation_enabled", True),
      cloud_fixed_y=mapping_int(d, "cloud_fixed_y", int(RuntimePreferences.DEFAULT_CLOUD_FIXED_Y)),
      cloud_spawn_y_min=mapping_int(d, "cloud_spawn_y_min", int(RuntimePreferences.DEFAULT_CLOUD_SPAWN_Y_MIN)),
      cloud_spawn_y_max=mapping_int(d, "cloud_spawn_y_max", int(RuntimePreferences.DEFAULT_CLOUD_SPAWN_Y_MAX)),
      cloud_preferred_y_min=mapping_int(d, "cloud_preferred_y_min", int(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_MIN)),
      cloud_preferred_y_max=mapping_int(d, "cloud_preferred_y_max", int(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_MAX)),
      cloud_preferred_y_probability_percent=mapping_int(d, "cloud_preferred_y_probability_percent", int(RuntimePreferences.DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT)),
      creative_mode=mapping_bool(d, "creative_mode", mapping_bool(d, "build_mode", False)),
      block_break_repeat_interval_s=mapping_float(d, "block_break_repeat_interval_s", float(RuntimePreferences.DEFAULT_BLOCK_BREAK_REPEAT_INTERVAL_S)),
      block_place_repeat_interval_s=mapping_float(d, "block_place_repeat_interval_s", float(RuntimePreferences.DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S)),
      block_interact_repeat_interval_s=mapping_float(d, "block_interact_repeat_interval_s", float(RuntimePreferences.DEFAULT_BLOCK_INTERACT_REPEAT_INTERVAL_S)),
      block_break_particle_spawn_rate=mapping_float(d, "block_break_particle_spawn_rate", float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPAWN_RATE)),
      block_break_particle_speed_scale=mapping_float(d, "block_break_particle_speed_scale", float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPEED_SCALE)),
      auto_jump_enabled=mapping_bool(d, "auto_jump_enabled", False),
      auto_sprint_enabled=mapping_bool(d, "auto_sprint_enabled", False),
      hide_hud=mapping_bool(d, "hide_hud", False),
      hide_hand=mapping_bool(d, "hide_hand", False),
      player_name=normalize_player_name(mapping_str(d, "player_name", "")),
      crosshair_mode=normalize_crosshair_mode(mapping_str(d, "crosshair_mode", CROSSHAIR_MODE_DEFAULT)),
      crosshair_pixels=normalize_crosshair_pixels(d.get("crosshair_pixels", EMPTY_CROSSHAIR_PIXELS)),
      player_skin_kind=normalize_player_skin_kind(mapping_str(d, "player_skin_kind", PLAYER_SKIN_KIND_ALEX)),
      camera_perspective=normalize_camera_perspective(mapping_str(d, "camera_perspective", CAMERA_PERSPECTIVE_FIRST_PERSON)),
      fullscreen=mapping_bool(d, "fullscreen", False),
      view_bobbing_enabled=mapping_bool(d, "view_bobbing_enabled", True),
      camera_shake_enabled=mapping_bool(d, "camera_shake_enabled", True),
      view_bobbing_strength=mapping_float(d, "view_bobbing_strength", 0.35),
      camera_shake_strength=mapping_float(d, "camera_shake_strength", 0.20),
      arm_rotation_limit_min_deg=mapping_float(d, "arm_rotation_limit_min_deg", float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MIN_DEG)),
      arm_rotation_limit_max_deg=mapping_float(d, "arm_rotation_limit_max_deg", float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MAX_DEG)),
      arm_swing_duration_s=mapping_float(d, "arm_swing_duration_s", float(RuntimePreferences.DEFAULT_ARM_SWING_DURATION_S)),
      animated_textures_enabled=mapping_bool(d, "animated_textures_enabled", True),
      gravity=mapping_float(d, "gravity", float(DEFAULT_MOVEMENT_PARAMS.gravity)),
      walk_speed=mapping_float(d, "walk_speed", float(DEFAULT_MOVEMENT_PARAMS.walk_speed)),
      sprint_speed=mapping_float(d, "sprint_speed", float(DEFAULT_MOVEMENT_PARAMS.sprint_speed)),
      jump_v0=mapping_float(d, "jump_v0", float(DEFAULT_MOVEMENT_PARAMS.jump_v0)),
      auto_jump_cooldown_s=mapping_float(d, "auto_jump_cooldown_s", float(DEFAULT_MOVEMENT_PARAMS.auto_jump_cooldown_s)),
      fly_speed=mapping_float(d, "fly_speed", float(DEFAULT_MOVEMENT_PARAMS.fly_speed)),
      fly_ascend_speed=mapping_float(d, "fly_ascend_speed", float(DEFAULT_MOVEMENT_PARAMS.fly_ascend_speed)),
      fly_descend_speed=mapping_float(d, "fly_descend_speed", float(DEFAULT_MOVEMENT_PARAMS.fly_descend_speed)),
      player_regen_enabled=mapping_bool(d, "player_regen_enabled", bool(PLAYER_REGEN_DEFAULT_ENABLED)),
      player_regen_start_delay_s=mapping_float(d, "player_regen_start_delay_s", float(PLAYER_REGEN_DEFAULT_START_DELAY_S)),
      player_regen_cap_hp=mapping_float(d, "player_regen_cap_hp", float(PLAYER_REGEN_DEFAULT_CAP_HP)),
      player_regen_time_to_cap_s=mapping_float(d, "player_regen_time_to_cap_s", float(PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S)),
      render_distance_chunks=int(rd),
      debug_shadow=mapping_bool(d, "debug_shadow", False),
      vsync_on=mapping_bool(d, "vsync_on", False),
      hud_visible=mapping_bool(d, "hud_visible", False),
      window_left=(None if d.get("window_left") is None else coerce_int(d.get("window_left"), 0)),
      window_top=(None if d.get("window_top") is None else coerce_int(d.get("window_top"), 0)),
      window_width=max(320, coerce_int(d.get("window_width", 1280), 1280)),
      window_height=max(240, coerce_int(d.get("window_height", 720), 720)),
      window_screen_name=mapping_str(d, "window_screen_name", ""),
      keybinds=KeybindSettings.from_dict(d.get("keybinds", {})),
      audio=AudioPreferences.from_dict(d.get("audio", {})),
    )
