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
from ludoxel.foundations.mathematics.scalars.numeric import clampf, clampi
from ludoxel.simulation.inventories.hotbars.ai_route_defaults import default_ai_route_hotbar_slots
from ludoxel.simulation.inventories.hotbars.defaults import default_hotbar_slots
from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE, cycle_hotbar_index, normalize_hotbar_index, normalize_hotbar_slots, with_hotbar_assignment
from ludoxel.simulation.inventories.special_items.registry import is_special_item_id
from ludoxel.simulation.spaces.othello.game.state import OthelloSettings
from ludoxel.simulation.spaces.othello.inventories.hotbar import default_othello_hotbar_slots
from ludoxel.simulation.worlds.config.render_distance import clamp_render_distance_chunks
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_MY_WORLD, is_othello_space, normalize_play_space_id


def _coerce_optional_int(value: object) -> int | None:
  """
  window geometry で `None` が意味を持つ欄だけに使う部分的な整数変換である。
  変換に失敗した値は 0 に潰さず `None` として残し、保存されていない位置情報と不正な位置情報を同じ欠落状態へ正規化する。
  """
  if value is None:
    return None
  try:
    return int(value)
  except (TypeError, ValueError):
    return None


def _default_hotbar_slots_list() -> list[str]:
  """
  通常の My World 用 hotbar 初期値を、実行中に更新可能な list として具体化する。
  """
  return list(default_hotbar_slots(size=HOTBAR_SIZE))


def _default_othello_hotbar_slots_list() -> list[str]:
  """
  Othello 空間用 hotbar 初期値を、実行時設定が直接差し替えられる list として具体化する。
  """
  return list(default_othello_hotbar_slots(size=HOTBAR_SIZE))


def _default_route_hotbar_slots_list() -> list[str]:
  return list(default_ai_route_hotbar_slots(size=HOTBAR_SIZE))


def _normalize_hotbar_state(slots: object, index: object, *, size: int = HOTBAR_SIZE) -> tuple[list[str], int]:
  """
  hotbar の slot 列と選択 index を同じ分岐上で正規化する。
  slot 数は `size` に合わせ、index は hotbar の有効範囲へ射影されるため、
  壊れた保存値から復元しても選択処理は未定義位置を参照しない。
  """
  normalized_slots = list(normalize_hotbar_slots(slots, size=int(size)))
  normalized_index = normalize_hotbar_index(index, size=int(size))
  return normalized_slots, int(normalized_index)


@dataclass
class RuntimePreferences:
  """
  描画、音声、雲、hotbar、skin、play space、Othello 既定値を横断して保持する可変 runtime 設定である。
  application persistence、Qt controls、renderer state、active session が共有する境界値であるため、
  保存値や UI 入力を受けた後は必ず正規化された状態で扱う。
  """

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
  creative_mode: bool = False
  creative_hotbar_slots: list[str] = field(default_factory=_default_hotbar_slots_list)
  creative_selected_hotbar_index: int = 0
  survival_hotbar_slots: list[str] = field(default_factory=_default_hotbar_slots_list)
  survival_selected_hotbar_index: int = 0
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
    """
    runtime 設定の全成分を、それぞれの許容領域へ射影する。
    真偽値、有限範囲の実数、hotbar 分岐、play-space 識別子、Othello 設定、
    keybind、audio を同時に整えることで、persistence と renderer が同一の正規形を受け取る。
    """
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

    self.creative_hotbar_slots, self.creative_selected_hotbar_index = _normalize_hotbar_state(self.creative_hotbar_slots, self.creative_selected_hotbar_index, size=HOTBAR_SIZE)
    self.survival_hotbar_slots, self.survival_selected_hotbar_index = _normalize_hotbar_state(self.survival_hotbar_slots, self.survival_selected_hotbar_index, size=HOTBAR_SIZE)
    self.othello_hotbar_slots, self.othello_selected_hotbar_index = _normalize_hotbar_state(self.othello_hotbar_slots, self.othello_selected_hotbar_index, size=HOTBAR_SIZE)
    self.route_hotbar_slots, self.route_selected_hotbar_index = _normalize_hotbar_state(self.route_hotbar_slots, self.route_selected_hotbar_index, size=HOTBAR_SIZE)

    self.othello_settings = self.othello_settings.normalized()
    self.keybinds = self.keybinds.normalized()
    self.audio = self.audio.normalized()

  def clone(self) -> "RuntimePreferences":
    """
    現在の runtime 設定を正規化済みの構造的コピーとして返す。
    呼び出し側は返値を変更しても元の runtime 状態を破壊しない。
    """
    return coerce_runtime_preferences(runtime=self)

  def is_othello_space(self) -> bool:
    """
    現在の play-space 識別子が Othello 空間を指すかを、`normalize_play_space_id` と同じ識別子体系で判定する。
    """
    return is_othello_space(self.current_space_id)

  def is_first_person_view(self) -> bool:
    """
    現在の camera perspective が first-person view を指すかを、application.preferences.camera の正規化規則に従って判定する。
    """
    return is_first_person_camera_perspective(self.camera_perspective)

  def view_model_visible(self) -> bool:
    """
    first-person view かつ hand 表示が抑止されていない場合だけ view-model を描画対象にする。
    renderer はこの述語により、腕、保持ブロック、特殊 item の生成を一括で制御する。
    """
    return bool(self.is_first_person_view()) and (not bool(self.hide_hand))

  def cycle_camera_perspective(self, step: int = 1) -> None:
    """
    camera perspective を定義済みの有限順序上で循環させる。
    UI 操作と keybind 操作はこの関数を通るため、保存識別子は常に正規化対象の集合内に保たれる。
    """
    self.camera_perspective = cycle_camera_perspective(self.camera_perspective, step=int(step))

  def _active_hotbar_state_attrs(self) -> tuple[str, str]:
    """
    active hotbar 分岐を play-space、route edit、creative mode の順に決定する。
    呼び出し側は slot 名を直接選ばず、この射影を通じて対象分岐を得る。
    """
    if self.is_othello_space():
      return ("othello_hotbar_slots", "othello_selected_hotbar_index")
    if bool(self.route_edit_active):
      return ("route_hotbar_slots", "route_selected_hotbar_index")
    if bool(self.creative_mode):
      return ("creative_hotbar_slots", "creative_selected_hotbar_index")
    return ("survival_hotbar_slots", "survival_selected_hotbar_index")

  def _active_hotbar_slots(self) -> list[str]:
    """
    現在選択されている hotbar 分岐の可変 slot 列を返す。
    返値は内部 list であり、後続の割当処理はこの branch 選択に依存する。
    """
    slots_attr, _index_attr = self._active_hotbar_state_attrs()
    return getattr(self, slots_attr)

  def _active_hotbar_index(self) -> int:
    """
    現在選択されている hotbar 分岐の選択 index を返す。
    index は normalize 後の値として扱われる。
    """
    _slots_attr, index_attr = self._active_hotbar_state_attrs()
    return int(getattr(self, index_attr))

  def active_hotbar_index(self) -> int:
    """
    外部から参照するための active hotbar index を返す。
    分岐選択の詳細を UI や session 側へ漏らさないための公開射影である。
    """
    return int(self._active_hotbar_index())

  def hotbar_snapshot(self) -> tuple[str, ...]:
    """
    active hotbar の現在値を tuple として複製する。
    renderer や HUD はこの snapshot を読むだけで、runtime の可変 list を直接保持しない。
    """
    return tuple(str(value).strip() for value in self._active_hotbar_slots())

  def current_item_id(self) -> str | None:
    """
    active hotbar の選択 slot に格納された item 識別子を返す。
    空文字列は item が存在しない状態として `None` に正規化される。
    """
    slots = self._active_hotbar_slots()
    index = self._active_hotbar_index()
    value = str(slots[index]).strip()
    return value if value else None

  def current_block_id(self) -> str | None:
    """
    現在の item 識別子から special item を除外し、通常 block として配置又は表示できる識別子だけを返す。
    """
    item_id = self.current_item_id()
    if item_id is None or is_special_item_id(item_id):
      return None
    return item_id

  def current_special_item_id(self) -> str | None:
    """
    現在の item 識別子が special item registry に属する場合だけ返す。
    通常 block の識別子はこの経路では `None` となる。
    """
    item_id = self.current_item_id()
    if item_id is None or not is_special_item_id(item_id):
      return None
    return item_id

  def set_hotbar_slot(self, index: int, item_id: str | None) -> None:
    """
    現在の active hotbar 分岐へ item 識別子を割り当てる。
    割当前に runtime 全体を正規化するため、creative、survival、Othello、route のいずれを対象にしても slot 数と index の整合性が保たれる。
    """
    self.normalize()
    slots_attr, _index_attr = self._active_hotbar_state_attrs()
    active_slots = getattr(self, slots_attr)
    setattr(self, slots_attr, list(with_hotbar_assignment(active_slots, index, item_id, size=HOTBAR_SIZE)))

  def select_hotbar_index(self, index: int) -> None:
    """
    active hotbar の選択 index を有効範囲内へ射影して更新する。
    分岐の決定は現在の runtime 状態に従う。
    """
    self.normalize()
    _slots_attr, index_attr = self._active_hotbar_state_attrs()
    setattr(self, index_attr, normalize_hotbar_index(index, size=HOTBAR_SIZE))

  def cycle_hotbar(self, delta_steps: int) -> None:
    """
    active hotbar 分岐の index に循環移動を適用する。
    `delta_steps` は hotbar サイズを法とする移動量として解釈される。
    """
    self.normalize()
    _slots_attr, index_attr = self._active_hotbar_state_attrs()
    current_index = int(getattr(self, index_attr))
    setattr(self, index_attr, cycle_hotbar_index(current_index, delta_steps, size=HOTBAR_SIZE))

  def clear_selected_hotbar_slot(self) -> None:
    """
    現在選択されている active hotbar slot を空にする。
    分岐選択と index 正規化は通常の hotbar 更新処理と同じ経路を通る。
    """
    self.normalize()
    self.set_hotbar_slot(self._active_hotbar_index(), None)


def coerce_runtime_preferences(*, runtime: RuntimePreferences | None = None, **overrides) -> RuntimePreferences:
  """
  runtime 設定を複製し、指定された override だけを上書きした正規化済みインスタンスを返す。
  persistence、settings UI、session application はこの関数を通じて、部分更新が全体の許容領域を破らないことに依存する。
  """
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
      creative_mode=bool(runtime.creative_mode),
      creative_hotbar_slots=list(runtime.creative_hotbar_slots),
      creative_selected_hotbar_index=int(runtime.creative_selected_hotbar_index),
      survival_hotbar_slots=list(runtime.survival_hotbar_slots),
      survival_selected_hotbar_index=int(runtime.survival_selected_hotbar_index),
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
