# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import time
from collections import deque
from dataclasses import dataclass, field

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.voxels.faces import FACE_POS_Y
from ludoxel.simulation.actors.ai_players.avoidance import active_avoid_support_cells, decay_avoid_support_cells, remember_avoid_support_cell
from ludoxel.simulation.actors.ai_players.combat import _combat_control
from ludoxel.simulation.actors.ai_players.idle import idle_control
from ludoxel.simulation.actors.ai_players.naming import ai_display_name_format_error, ai_name_duplicate_key, allocate_default_spawn_ai_name, allocate_suffixed_ai_name, split_ai_display_name
from ludoxel.simulation.actors.ai_players.navigation import (
  _horizontal_transition_distance,
  _navigation_transition_target,
  _parkour_takeoff_point,
  _point_distance_xz,
  _pursuit_control,
  _support_cell_beneath,
  _support_cell_center,
  _support_cell_from_point,
  _turn_only_control,
)
from ludoxel.simulation.actors.ai_players.parkour import _parkour_control, _parkour_navigation_target
from ludoxel.simulation.actors.ai_players.placement import _face_for_horizontal_step, _face_hit_point, _held_item_id_for_settings, _side_step_from_forward
from ludoxel.simulation.actors.ai_players.planner import AiRoutePlanRequest, AiRoutePlanResult
from ludoxel.simulation.actors.ai_players.recovery import fallback_route_target
from ludoxel.simulation.actors.ai_players.route import advance_route_target, route_target_point
from ludoxel.simulation.actors.ai_players.runtime import (
  _AI_ATTACK_COOLDOWN_S,
  _AI_ATTACK_SWING_DURATION_S,
  _AI_BLOCKED_EDGE_COOLDOWN_S,
  _AI_BRIDGE_COMBAT_DISABLE_RANGE,
  _AI_CHASE_RANGE,
  _AI_CLOSE_DEFENSE_RANGE,
  _AI_COMBAT_STRAFE_DISTANCE_MAX,
  _AI_COMBAT_STRAFE_WINDOW_S,
  _AI_COMBAT_W_TAP_S,
  _AI_DIRECT_ROUTE_MAX_SPAN,
  _AI_EDGE_LOOKAHEAD_BLOCKS,
  _AI_EDGE_ROUTE_DROP_DEPTH,
  _AI_EDGE_SAFE_DROP_DEPTH,
  _AI_FLEX_REPLAN_STUCK_INTERVAL_S,
  _AI_INTERACT_COOLDOWN_S,
  _AI_LOCAL_RECOVERY_ALLOW_REGRESSION,
  _AI_LOCAL_RECOVERY_BUDGET_PER_STEP,
  _AI_LOCAL_RECOVERY_CACHE_S,
  _AI_LOCAL_RECOVERY_PARKOUR_SPAN,
  _AI_LOCAL_RECOVERY_PROGRESS_EPS,
  _AI_LOCAL_RECOVERY_SEARCH_RADIUS,
  _AI_LOCAL_RECOVERY_STEP_PENALTY,
  _AI_LOCAL_RECOVERY_TIME_BUDGET_S,
  _AI_LOCAL_RECOVERY_VISIT_LIMIT,
  _AI_MAX_SUPPORT_Y_DELTA,
  _AI_NAV_FAILURE_RETRY_BASE_S,
  _AI_NAV_FAILURE_RETRY_MAX_S,
  _AI_NAV_JUMP_ALIGN_MIN,
  _AI_NAV_JUMP_PROGRESS_MIN,
  _AI_NAV_PARKOUR_SPEED_SCALE,
  _AI_NAV_STEP_PROGRESS_EPS,
  _AI_NAV_STEP_STUCK_TIMEOUT_S,
  _AI_NAV_UNREACHABLE_SKIP_RETRIES,
  _AI_NAV_UNREACHABLE_TARGET_COOLDOWN_S,
  _AI_PARKOUR_SEARCH_CAP,
  _AI_PARKOUR_TAKEOFF_TRIGGER_EPS,
  _AI_PLACE_COOLDOWN_S,
  _AI_PLACEMENT_LOS_EPS,
  _AI_ROUTE_ENGAGE_RANGE,
  _AI_ROUTE_REACHED_EPS,
  _AI_ROUTE_REQUESTS_PER_STEP,
  _AI_ROUTE_STUCK_PROGRESS_EPS,
  _AI_ROUTE_STUCK_TIMEOUT_S,
  _AI_ROUTE_TARGET_SUPPORT_SEARCH_RADIUS,
  _AI_STUCK_GOAL_TIMEOUT_S,
  _AI_STUCK_JUMP_RETRIES,
  _AI_STUCK_RECOVERY_SUPPORT_S,
  AiActorObservation,
  AiLocalAttackResult,
  AiRoutePathSnapshot,
  AiStepReport,
  _AiPlayerRuntime,
)
from ludoxel.simulation.actors.ai_players.spawning import _spawn_position_clear
from ludoxel.simulation.actors.ai_players.state import (
  AI_MODE_IDLE,
  AI_MODE_ROUTE,
  AI_MODE_WANDER,
  AI_PERSONALITY_AGGRESSIVE,
  AI_ROUTE_STYLE_FLEXIBLE,
  AiPlayerState,
  AiSpawnEggSettings,
  normalize_ai_health_indicator,
  normalize_ai_mode,
  normalize_ai_personality,
  normalize_ai_route_style,
  normalize_ai_skin_mode,
)
from ludoxel.simulation.actors.ai_players.stuck import stuck_edge_key
from ludoxel.simulation.actors.ai_players.wander import _wander_interval_s, _wander_seed
from ludoxel.simulation.actors.ai_players.worker import AiRouteWorker
from ludoxel.simulation.actors.player.combat import attack_sprinting
from ludoxel.simulation.actors.player.damage import MELEE_ATTACK_DAMAGE, MELEE_DAMAGE_COOLDOWN_S, apply_melee_damage, apply_void_damage
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.actors.player.kinematics import PlayerStepInput, advance_runtime_player, fall_damage_amount
from ludoxel.simulation.actors.player.targets import MELEE_ATTACK_REACH_BLOCKS, pick_player_target
from ludoxel.simulation.blocks.models.api import has_full_top_support_for_block
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.structures.cardinal import cardinal_from_xz, facing_vec_xz
from ludoxel.simulation.rules.collision.support import world_aabb_intersects
from ludoxel.simulation.rules.collision.system import support_block_beneath
from ludoxel.simulation.rules.interaction.service import InteractionService
from ludoxel.simulation.rules.picking.block import BlockPick
from ludoxel.simulation.worlds.config.session import SessionSettings
from ludoxel.simulation.worlds.state.world import WorldState


@dataclass
class AiPlayerManager:
  world: WorldState
  block_registry: BlockRegistry
  settings: SessionSettings

  _actors: dict[str, _AiPlayerRuntime] = field(default_factory=dict, init=False, repr=False)
  _next_actor_index: int = field(default=1, init=False, repr=False)
  _route_worker: AiRouteWorker = field(default_factory=AiRouteWorker, init=False, repr=False)
  _route_plan_generation: int = field(default=0, init=False, repr=False)
  _full_snapshot_revision: int = field(default=-1, init=False, repr=False)
  _full_snapshot_blocks: tuple[tuple[int, int, int, str], ...] = field(default=(), init=False, repr=False)
  _route_requests_this_step: int = field(default=0, init=False, repr=False)
  _recovery_searches_this_step: int = field(default=0, init=False, repr=False)

  def __post_init__(self) -> None:
    self._route_worker.warmup()

  def shutdown(self) -> None:
    self._route_worker.shutdown()

  def clear(self) -> None:
    for actor_id in tuple(self._actors.keys()):
      self._route_worker.cancel_actor(str(actor_id))
    self._actors.clear()
    self._next_actor_index = 1
    self._full_snapshot_revision = -1
    self._full_snapshot_blocks = ()

  def actors(self) -> tuple[AiPlayerState, ...]:
    return tuple(actor.to_state() for actor in self._actors.values())

  def route_paths(self) -> tuple[AiRoutePathSnapshot, ...]:
    paths: list[AiRoutePathSnapshot] = []
    for actor in self._actors.values():
      if normalize_ai_mode(actor.mode) != AI_MODE_ROUTE or len(actor.route_points) < 2:
        continue
      paths.append(AiRoutePathSnapshot(actor_id=str(actor.actor_id), points=tuple(actor.route_points), closed=bool(actor.route_closed)))
    return tuple(paths)

  def _allocate_actor_id(self) -> str:
    actor_id = f"ai_player_{int(self._next_actor_index)}"
    self._next_actor_index += 1
    return str(actor_id)

  def _build_player(self, *, state: AiPlayerState) -> PlayerEntity:
    player = PlayerEntity(
      position=Vec3(float(state.pos_x), float(state.pos_y), float(state.pos_z)),
      velocity=Vec3(float(state.vel_x), float(state.vel_y), float(state.vel_z)),
      yaw_deg=float(state.yaw_deg),
      pitch_deg=float(state.pitch_deg),
      health=float(state.health),
      max_health=float(state.max_health),
      on_ground=bool(state.on_ground),
      flying=bool(state.flying),
    )
    player.clamp_pitch()
    player.clamp_health()
    player.auto_jump_start_y = float(player.position.y)
    return player

  def _state_to_runtime(self, state: AiPlayerState) -> _AiPlayerRuntime:
    normalized = state.normalized()
    actor_id = str(normalized.actor_id) if str(normalized.actor_id) else self._allocate_actor_id()
    player = self._build_player(state=normalized)
    interaction = InteractionService.create(world=self.world, player=player, block_registry=self.block_registry)
    actor = _AiPlayerRuntime(
      actor_id=str(actor_id),
      player=player,
      interaction=interaction,
      mode=normalize_ai_mode(normalized.mode),
      personality=normalize_ai_personality(normalized.personality),
      can_place_blocks=bool(normalized.can_place_blocks),
      held_item_id=_held_item_id_for_settings(can_place_blocks=bool(normalized.can_place_blocks), held_item_id=normalized.held_item_id),
      name=str(normalized.name),
      health_indicator=str(normalized.health_indicator),
      skin_mode=str(normalized.skin_mode),
      skin_id=str(normalized.skin_id),
      auto_regen_enabled=bool(normalized.auto_regen_enabled),
      regen_start_delay_s=float(normalized.regen_start_delay_s),
      regen_interval_s=float(normalized.regen_interval_s),
      regen_amount_hp=float(normalized.regen_amount_hp),
      regen_cap_hp=float(normalized.regen_cap_hp),
      route_points=tuple(normalized.route_points),
      route_closed=bool(normalized.route_closed),
      route_run=bool(normalized.route_run),
      route_style=normalize_ai_route_style(normalized.route_style),
      route_target_index=int(normalized.route_target_index),
    )
    actor.wander_heading_deg = float(player.yaw_deg)
    actor.wander_forward = 0.0
    actor.decision_timer_s = 0.0
    actor.bridge_side_sign = 1
    actor.route_stuck_s = 0.0
    actor.route_last_goal_distance = 1e9
    actor.route_last_progress_position = Vec3(float(player.position.x), float(player.position.y), float(player.position.z))
    actor.stuck_support_cell = None
    actor.stuck_support_time_s = 0.0
    actor.stuck_jump_retries = 0
    actor.nav_ground_support_cell = None
    actor.nav_next_support_cell = None
    actor.nav_from_support_cell = None
    actor.nav_place_anchor_cell = None
    actor.nav_place_target_cell = None
    actor.nav_goal_support_cell = None
    actor.nav_plan_steps = ()
    actor.nav_plan_index = 0
    actor.nav_plan_generation = 0
    actor.nav_plan_pending = False
    actor.nav_plan_pending_generation = 0
    actor.nav_plan_start_support_cell = None
    actor.nav_plan_failed_world_revision = -1
    actor.nav_plan_failed_target_index = -1
    actor.nav_avoid_support_cells.clear()
    actor.nav_blocked_edges.clear()
    actor.nav_world_revision = int(self.world.revision)
    actor.nav_replan_cooldown_s = 0.0
    actor.nav_path_failed = False
    actor.nav_jump_required = False
    actor.nav_jump_span = 1
    actor.nav_step_progress_cell = None
    actor.nav_step_best_distance = 1e9
    actor.nav_step_stuck_s = 0.0
    actor.nav_unreachable_targets.clear()
    actor.local_recovery_cache_target = None
    actor.local_recovery_cache_key = None
    actor.local_recovery_cache_age_s = 1e9
    actor.combat_w_tap_s = 0.0
    actor.combat_strafe_timer_s = 0.0
    actor.combat_strafe_sign = 1
    actor.void_damage_timer_s = 0.0
    actor.regen_wait_s = 0.0
    actor.regen_tick_s = 0.0
    return actor

  def _live_name_keys(self, *, exclude_actor_id: str | None = None) -> set[str]:
    """
    名前重複判定の対象となる生存 AI の正規化済み名前 key 集合を返す。
    対象は現在 manager に登録され、かつ health が正の actor に限られ、dead、despawn 済み、registry から除去済みの AI は名前を占有しない。
    exclude_actor_id を与えた場合はその actor 自身を除外し、rename 時の自己衝突を防ぐ。
    """
    excluded = None if exclude_actor_id is None else str(exclude_actor_id)
    keys: set[str] = set()
    for actor in self._actors.values():
      if excluded is not None and str(actor.actor_id) == excluded:
        continue
      if not actor.player.alive():
        continue
      name = str(actor.name).strip()
      if not name:
        continue
      keys.add(ai_name_duplicate_key(name))
    return keys

  def ai_name_error(self, *, actor_id: str | None, name: object) -> str | None:
    """
    AI の表示名候補を形式規則と生存 AI 間の重複規則で検査し、不正な場合に UI 表示用の英文 error message を返す。
    形式規則は naming module が判定し、重複規則は actor_id を除いた生存 actor 集合との case-insensitive 比較で判定する。
    重複時は同一本体名の空き suffix 候補を提示し、`#0001` から `#9999` がすべて使用済みの場合は numbered variant 枯渇を fallback error として報告する。
    有効な名前の場合は None を返す。
    """
    candidate = str(name).strip()
    format_error = ai_display_name_format_error(candidate)
    if format_error is not None:
      return str(format_error)
    taken = self._live_name_keys(exclude_actor_id=actor_id)
    if ai_name_duplicate_key(candidate) not in taken:
      return None
    parsed = split_ai_display_name(candidate)
    body = candidate if parsed is None else str(parsed[0])
    suggestion = allocate_suffixed_ai_name(str(body), taken)
    if suggestion is None:
      return f"All numbered variants of '{body}' up to #9999 are in use by live AI."
    return f"A live AI already uses this name. Try '{suggestion}'."

  def _resolve_loaded_name(self, *, candidate: str, taken_keys: set[str]) -> str | None:
    """
    保存 data から復元した名前を、形式規則と既復元 actor との重複規則の下で確定する。
    形式が有効かつ未使用ならそのまま採用し、重複している場合は同じ本体名の空き suffix 候補へ振り替える。
    名前が空、形式不正、又は振替先が枯渇している場合は spawn 既定の `AI#NNNN` 形式を割り当て、それも枯渇している場合は None を返す。
    """
    text = str(candidate).strip()
    if text and ai_display_name_format_error(text) is None:
      key = ai_name_duplicate_key(text)
      if key not in taken_keys:
        return str(text)
      parsed = split_ai_display_name(text)
      if parsed is not None:
        reallocated = allocate_suffixed_ai_name(str(parsed[0]), taken_keys)
        if reallocated is not None:
          return str(reallocated)
    return allocate_default_spawn_ai_name(taken_keys)

  def load_states(self, states: object) -> None:
    self.clear()
    if not isinstance(states, (list, tuple)):
      return
    max_index = 0
    taken_keys: set[str] = set()
    for raw_state in states:
      if not isinstance(raw_state, AiPlayerState):
        continue
      actor = self._state_to_runtime(raw_state)
      resolved_name = self._resolve_loaded_name(candidate=str(actor.name), taken_keys=taken_keys)
      if resolved_name is not None:
        actor.name = str(resolved_name)
        if actor.player.alive():
          taken_keys.add(ai_name_duplicate_key(actor.name))
      self._actors[str(actor.actor_id)] = actor
      try:
        suffix = int(str(actor.actor_id).rsplit("_", 1)[1])
      except (IndexError, ValueError):
        suffix = 0
      max_index = max(int(max_index), int(suffix))
    self._next_actor_index = max(1, int(max_index) + 1)

  def spawn_from_egg(self, *, spawn_cell: tuple[int, int, int], settings: AiSpawnEggSettings) -> str | None:
    normalized_settings = settings.normalized()
    spawn_name = str(normalized_settings.name).strip()
    if not spawn_name or self.ai_name_error(actor_id=None, name=spawn_name) is not None:
      allocated = allocate_default_spawn_ai_name(self._live_name_keys())
      if allocated is None:
        return None
      spawn_name = str(allocated)
    spawn_pos = Vec3(float(spawn_cell[0]) + 0.5, float(spawn_cell[1]), float(spawn_cell[2]) + 0.5)
    actor_id = self._allocate_actor_id()
    state = AiPlayerState(
      actor_id=str(actor_id),
      mode=str(normalized_settings.mode),
      personality=str(normalized_settings.personality),
      can_place_blocks=bool(normalized_settings.can_place_blocks),
      held_item_id=_held_item_id_for_settings(can_place_blocks=bool(normalized_settings.can_place_blocks)),
      name=str(spawn_name),
      health_indicator=str(normalized_settings.health_indicator),
      skin_mode=str(normalized_settings.skin_mode),
      skin_id=str(normalized_settings.skin_id),
      auto_regen_enabled=bool(normalized_settings.auto_regen_enabled),
      regen_start_delay_s=float(normalized_settings.regen_start_delay_s),
      regen_interval_s=float(normalized_settings.regen_interval_s),
      regen_amount_hp=float(normalized_settings.regen_amount_hp),
      regen_cap_hp=float(normalized_settings.regen_cap_hp),
      pos_x=float(spawn_pos.x),
      pos_y=float(spawn_pos.y),
      pos_z=float(spawn_pos.z),
      yaw_deg=0.0,
      pitch_deg=0.0,
      route_points=tuple(normalized_settings.route_points),
      route_closed=bool(normalized_settings.route_closed),
      route_run=bool(normalized_settings.route_run),
      route_style=str(normalized_settings.route_style),
      route_target_index=0,
    )
    actor = self._state_to_runtime(state)
    if not _spawn_position_clear(player=actor.player, world=self.world, block_registry=self.block_registry):
      return None
    self._actors[str(actor.actor_id)] = actor
    return str(actor.actor_id)

  def actor_state(self, actor_id: str) -> AiPlayerState | None:
    actor = self._actors.get(str(actor_id))
    if actor is None:
      return None
    return actor.to_state()

  def actor_settings(self, actor_id: str) -> AiSpawnEggSettings | None:
    actor = self._actors.get(str(actor_id))
    if actor is None:
      return None
    return AiSpawnEggSettings(
      mode=str(actor.mode),
      personality=str(actor.personality),
      can_place_blocks=bool(actor.can_place_blocks),
      name=str(actor.name),
      health_indicator=str(actor.health_indicator),
      skin_mode=str(actor.skin_mode),
      skin_id=str(actor.skin_id),
      auto_regen_enabled=bool(actor.auto_regen_enabled),
      regen_start_delay_s=float(actor.regen_start_delay_s),
      regen_interval_s=float(actor.regen_interval_s),
      regen_amount_hp=float(actor.regen_amount_hp),
      regen_cap_hp=float(actor.regen_cap_hp),
      route_points=tuple(actor.route_points),
      route_closed=bool(actor.route_closed),
      route_run=bool(actor.route_run),
      route_style=str(actor.route_style),
    ).normalized()

  def update_actor_settings(self, *, actor_id: str, settings: AiSpawnEggSettings) -> bool:
    actor = self._actors.get(str(actor_id))
    if actor is None:
      return False
    normalized = settings.normalized()
    if normalize_ai_mode(normalized.mode) == AI_MODE_ROUTE and len(normalized.route_points) < 2:
      return False
    requested_name = str(normalized.name).strip()
    if requested_name and requested_name != str(actor.name):
      if self.ai_name_error(actor_id=str(actor.actor_id), name=requested_name) is not None:
        return False
      actor.name = str(requested_name)
    actor.mode = normalize_ai_mode(normalized.mode)
    actor.personality = normalize_ai_personality(normalized.personality)
    actor.can_place_blocks = bool(normalized.can_place_blocks)
    actor.held_item_id = _held_item_id_for_settings(can_place_blocks=bool(actor.can_place_blocks), held_item_id=actor.held_item_id)
    actor.health_indicator = normalize_ai_health_indicator(normalized.health_indicator)
    actor.skin_mode = normalize_ai_skin_mode(normalized.skin_mode)
    actor.skin_id = str(normalized.skin_id)
    actor.auto_regen_enabled = bool(normalized.auto_regen_enabled)
    actor.regen_start_delay_s = float(normalized.regen_start_delay_s)
    actor.regen_interval_s = float(normalized.regen_interval_s)
    actor.regen_amount_hp = float(normalized.regen_amount_hp)
    actor.regen_cap_hp = float(normalized.regen_cap_hp)
    actor.regen_tick_s = 0.0
    actor.route_points = tuple(normalized.route_points)
    actor.route_closed = bool(normalized.route_closed)
    actor.route_run = bool(normalized.route_run)
    actor.route_style = normalize_ai_route_style(normalized.route_style)
    if len(actor.route_points) <= 0:
      actor.route_target_index = 0
    else:
      actor.route_target_index = int(actor.route_target_index) % len(actor.route_points)
    self._cancel_pending_nav_plan(actor)
    self._clear_nav_plan(actor)
    self._reset_nav_failure(actor)
    actor.nav_world_revision = int(self.world.revision)
    actor.nav_replan_cooldown_s = 0.0
    actor.nav_avoid_support_cells.clear()
    actor.nav_unreachable_targets.clear()
    actor.local_recovery_cache_target = None
    actor.local_recovery_cache_key = None
    actor.local_recovery_cache_age_s = 1e9
    return True

  def remove_actor(self, actor_id: str) -> bool:
    actor = self._actors.pop(str(actor_id), None)
    if actor is None:
      return False
    self._cancel_pending_nav_plan(actor)
    return True

  def cancel_actor_navigation(self, actor_id: str) -> bool:
    actor = self._actors.get(str(actor_id))
    if actor is None:
      return False
    self._cancel_pending_nav_plan(actor)
    self._clear_nav_plan(actor)
    actor.nav_replan_cooldown_s = 0.0
    return True

  def _skip_unreachable_route_targets(self, actor: _AiPlayerRuntime) -> bool:
    """
    flexible route の現在 target index が到達不能 blacklist に含まれる間、次の route point へ前進させる。
    blacklist は nav_unreachable_targets が保持する index -> 残余 cooldown 秒の対応であり、route 点数分だけ前進を試みても全点が blacklist 済みの場合は偽を返す。
    偽を返した場合、呼び出し側はその step の追従を停止(旋回のみ)し、cooldown の減衰によって blacklist が解ける時点まで同一 target への無制限な再探索を行わない。
    """
    point_count = len(actor.route_points)
    if point_count <= 0 or not actor.nav_unreachable_targets:
      return True
    for _attempt in range(int(point_count)):
      index_key = int(actor.route_target_index) % int(point_count)
      if float(actor.nav_unreachable_targets.get(int(index_key), 0.0)) <= 1e-6:
        return True
      advance_route_target(actor)
    return False

  def _route_control(self, actor: _AiPlayerRuntime, *, dt: float, target_player: PlayerEntity | None, allow_pvp: bool) -> PlayerStepInput:
    combat_target = self._route_combat_target(actor, target_player=target_player, allow_pvp=bool(allow_pvp))
    flexible_route = normalize_ai_route_style(actor.route_style) == AI_ROUTE_STYLE_FLEXIBLE
    if combat_target is not None:
      if bool(actor.nav_plan_pending):
        self._cancel_pending_nav_plan(actor)
      default_jump_pressed = bool(actor.player.on_ground) and (float(combat_target.y) > float(actor.player.position.y) + 0.55 or float((combat_target - actor.player.position).length()) <= 3.4)
      combat_control = _combat_control(actor=actor, target=combat_target, dt=float(dt), jump_pressed=bool(default_jump_pressed))
      guarded_control, _blocked = self._apply_edge_safety(actor, combat_control, max_drop=int(_AI_EDGE_SAFE_DROP_DEPTH))
      return guarded_control
    target = route_target_point(actor)
    if target is None:
      return idle_control()
    if bool(flexible_route) and (not self._skip_unreachable_route_targets(actor)):
      return _turn_only_control(player=actor.player, target=target, dt=float(dt))
    updated_after_skip = route_target_point(actor)
    if updated_after_skip is not None:
      target = updated_after_skip
    player_pos = actor.player.position
    if _point_distance_xz(player_pos, target) <= float(_AI_ROUTE_REACHED_EPS):
      advance_route_target(actor)
      target = route_target_point(actor)
      if target is None:
        return idle_control()
    movement_target = self._movement_target_for_route_style(actor, desired_target=target, dt=float(dt))
    updated_target = route_target_point(actor)
    if updated_target is not None:
      target = updated_target
    current_support = self._current_support_cell(actor) if bool(flexible_route) else None
    next_support = None if actor.nav_next_support_cell is None else tuple(int(value) for value in actor.nav_next_support_cell)
    if bool(flexible_route) and bool(actor.nav_path_failed):
      current_center = None if current_support is None else _support_cell_center(tuple(int(value) for value in current_support))
      if current_center is not None and float(_point_distance_xz(movement_target, current_center)) <= 1e-6:
        return _turn_only_control(player=actor.player, target=target, dt=float(dt))
    default_jump_pressed = bool(actor.player.on_ground) and float(target.y) > float(actor.player.position.y) + 0.55
    jump_pressed = self._navigation_jump_pressed(actor, fallback_target=target, default_jump_pressed=bool(default_jump_pressed)) if bool(flexible_route) else bool(default_jump_pressed)
    transition_height = 0
    transition_span = 1
    if current_support is not None and next_support is not None:
      transition_height = int(next_support[1]) - int(current_support[1])
      transition_span = max(abs(int(next_support[0]) - int(current_support[0])), abs(int(next_support[2]) - int(current_support[2])))
    sprint = bool(actor.route_run) or bool(flexible_route and (int(transition_span) > 1 or bool(actor.nav_jump_required and int(actor.nav_jump_span) > 1)))
    if bool(flexible_route and current_support is not None and next_support is not None and (int(transition_span) > 1 or int(transition_height) != 0)):
      parkour_target = _parkour_navigation_target(actor, current_support=current_support)
      auto_jump_enabled = bool(int(transition_height) > 0 and int(transition_span) <= 1)
      if bool(jump_pressed) and int(transition_span) > 1:
        movement_target = _support_cell_center(next_support)
      elif parkour_target is not None:
        movement_target = parkour_target
      return _parkour_control(
        player=actor.player, target=movement_target, dt=float(dt), sprint=bool(sprint), auto_jump_enabled=bool(auto_jump_enabled), jump_pressed=bool(jump_pressed), crouch=False, commit_forward=True
      )
    pursuit_control = _pursuit_control(player=actor.player, target=movement_target, dt=float(dt), sprint=bool(sprint), auto_jump_enabled=True, jump_pressed=bool(jump_pressed), crouch=False)
    guarded_control, _blocked = self._apply_edge_safety(actor, pursuit_control, max_drop=int(_AI_EDGE_ROUTE_DROP_DEPTH))
    return guarded_control

  def _update_wander_state(self, actor: _AiPlayerRuntime, *, dt: float) -> None:
    actor.decision_timer_s = max(0.0, float(actor.decision_timer_s) - max(0.0, float(dt)))
    if float(actor.decision_timer_s) > 1e-6:
      return
    phase = int(abs(actor.route_target_index) + len(actor.route_points) + int(actor.player.position.x * 17.0) + int(actor.player.position.z * 31.0))
    interval = _wander_interval_s(actor.actor_id, phase)
    actor.decision_timer_s = float(interval)
    seed = (_wander_seed(actor.actor_id) + phase * 977) & 0x7FFFFFFF
    actor.wander_heading_deg = float(seed % 360)
    actor.wander_forward = 1.0 if (seed % 4) != 0 else 0.0
    actor.wander_sprint = bool(seed % 5 == 0)

  def _state_at(self, x: int, y: int, z: int) -> str | None:
    return self.world.blocks.get((int(x), int(y), int(z)))

  def _cell_has_full_top_support(self, cell: tuple[int, int, int]) -> bool:
    state_str = self._state_at(int(cell[0]), int(cell[1]), int(cell[2]))
    if state_str is None:
      return False
    return bool(has_full_top_support_for_block(str(state_str), self._state_at, self.block_registry.get, int(cell[0]), int(cell[1]), int(cell[2])))

  def _intended_move_direction_xz(self, actor: _AiPlayerRuntime, control: PlayerStepInput) -> Vec3 | None:
    """
    制御入力 control が表す水平移動方向を world 座標系の単位 vector として返す。
    yaw は同一 step 内で適用される yaw_delta_deg を加算した後の値を用い、forward = (-sin(yaw), 0, cos(yaw))、right = (cos(yaw), 0, sin(yaw)) に対し dir = forward*move_f + right*move_s で合成する。
    移動入力が実質 0、又は合成 vector の長さが 0 に縮退する場合は None を返し、呼び出し側はその step の前進安全判定を省略する。
    """
    move_f = float(control.move_f)
    move_s = float(control.move_s)
    if abs(move_f) <= 1e-6 and abs(move_s) <= 1e-6:
      return None
    yaw_rad = math.radians(float(actor.player.yaw_deg) + float(control.yaw_delta_deg))
    forward = Vec3(-math.sin(yaw_rad), 0.0, math.cos(yaw_rad))
    right = Vec3(math.cos(yaw_rad), 0.0, math.sin(yaw_rad))
    direction = Vec3(float(forward.x) * move_f + float(right.x) * move_s, 0.0, float(forward.z) * move_f + float(right.z) * move_s)
    if float(direction.length()) <= 1e-6:
      return None
    return direction.normalized()

  def _forward_step_safe(self, actor: _AiPlayerRuntime, *, direction: Vec3, max_drop: int) -> bool:
    """
    現在の支持 block から direction 方向へ一歩前進した場合に、安全に着地できる足場が存在するかを判定する。
    前進予定位置は eye ではなく足元位置 + direction * lookahead で求め、その列の支持 cell が現在支持 cell と同一なら同一 cell 内移動として安全とみなす。
    前方の body 高さ(支持 y + 1)に block がある場合は collision が前進を止めるため落下危険なしとして安全を返す。
    前方列を支持 y から max_drop 段下まで走査し、full top support を持つ cell が見つかれば安全(意図的 drop を含む)、見つからなければ奈落又は深すぎる落下として不安全を返す。
    max_drop は Free Roam / PVP では落下 damage が発生しない 3、route 追従では明確な経路上の理由がある drop として 8 を用いる。
    """
    support = self._current_support_cell(actor)
    if support is None:
      return True
    probe = Vec3(
      float(actor.player.position.x) + float(direction.x) * float(_AI_EDGE_LOOKAHEAD_BLOCKS),
      float(actor.player.position.y),
      float(actor.player.position.z) + float(direction.z) * float(_AI_EDGE_LOOKAHEAD_BLOCKS),
    )
    ahead_x = int(math.floor(float(probe.x)))
    ahead_z = int(math.floor(float(probe.z)))
    if ahead_x == int(support[0]) and ahead_z == int(support[2]):
      return True
    support_y = int(support[1])
    if self._state_at(int(ahead_x), int(support_y) + 1, int(ahead_z)) is not None:
      return True
    for dy in range(0, -max(0, int(max_drop)) - 1, -1):
      if self._cell_has_full_top_support((int(ahead_x), int(support_y) + int(dy), int(ahead_z))):
        return True
    return False

  @staticmethod
  def _halted_control(control: PlayerStepInput) -> PlayerStepInput:
    """
    前進安全判定で不安全とされた step の制御入力から移動成分と jump 成分を除去し、視線回転だけを残した制御入力を返す。
    yaw_delta_deg と pitch_delta_deg を保持するため、停止中の AI は対象方向への旋回を継続でき、bridge placement 又は迂回判断の前提となる向きを失わない。
    """
    return PlayerStepInput(
      move_f=0.0,
      move_s=0.0,
      jump_held=False,
      jump_pressed=False,
      sprint=False,
      crouch=bool(control.crouch),
      yaw_delta_deg=float(control.yaw_delta_deg),
      pitch_delta_deg=float(control.pitch_delta_deg),
      auto_jump_enabled=False,
    )

  def _apply_edge_safety(self, actor: _AiPlayerRuntime, control: PlayerStepInput, *, max_drop: int) -> tuple[PlayerStepInput, bool]:
    """
    地上歩行中の制御入力に対して ledge / void 安全判定を適用し、(適用後 control, 停止したか) の組を返す。
    飛行中、空中(on_ground が偽)、又は jump 入力を伴う step は判定対象外としてそのまま通す。jump を伴う遷移の安全性は flexible route の planner 側 arc 検査が担う。
    前進方向に max_drop 段以内の着地足場が無い場合は移動を停止した control を返し、bridge placement(許可時)又は呼び出し側の方向転換に判断を委ねる。
    この判定により、AI が自発的に奈落へ前進し続ける挙動を Free Roam、PVP 追跡、route 追従の歩行経路で禁止する。
    """
    if bool(actor.player.flying) or (not bool(actor.player.on_ground)):
      return (control, False)
    if bool(control.jump_pressed):
      return (control, False)
    direction = self._intended_move_direction_xz(actor, control)
    if direction is None:
      return (control, False)
    if self._forward_step_safe(actor, direction=direction, max_drop=int(max_drop)):
      return (control, False)
    return (self._halted_control(control), True)

  def pick_actor(self, *, origin: Vec3, direction: Vec3, reach: float, block_hit: BlockPick | None) -> str | None:
    target_hit = pick_player_target(
      origin=origin, direction=direction, reach=float(reach), block_hit=block_hit, candidates=tuple((str(actor.actor_id), actor.player) for actor in self._actors.values())
    )
    if target_hit is None:
      return None
    return str(target_hit.actor_id)

  def _player_clear_at(self, actor: _AiPlayerRuntime, *, position: Vec3) -> bool:
    probe_aabb = actor.player.aabb_at(Vec3(float(position.x), float(position.y), float(position.z)))
    return not bool(world_aabb_intersects(self.world, probe_aabb, self.settings.collision, block_registry=self.block_registry))

  def _support_contact_cell(self, actor: _AiPlayerRuntime) -> tuple[int, int, int] | None:
    contact = support_block_beneath(actor.player, self.world, block_registry=self.block_registry, params=self.settings.collision)
    if contact is not None:
      return tuple(int(value) for value in contact.cell)
    return None

  def _current_support_cell(self, actor: _AiPlayerRuntime) -> tuple[int, int, int] | None:
    contact_cell = self._support_contact_cell(actor)
    if contact_cell is not None:
      actor.nav_ground_support_cell = tuple(int(value) for value in contact_cell)
      return tuple(int(value) for value in contact_cell)
    if bool(actor.player.on_ground):
      fallback = self._nearest_standable_support_cell(actor, _support_cell_beneath(actor.player))
      if fallback is not None:
        actor.nav_ground_support_cell = tuple(int(value) for value in fallback)
        return tuple(int(value) for value in fallback)
    if actor.nav_ground_support_cell is None:
      return None
    return tuple(int(value) for value in actor.nav_ground_support_cell)

  @staticmethod
  def _clear_nav_plan(actor: _AiPlayerRuntime) -> None:
    actor.nav_plan_steps = ()
    actor.nav_plan_index = 0
    actor.nav_plan_start_support_cell = None
    actor.nav_next_support_cell = None
    actor.nav_from_support_cell = None
    actor.nav_place_anchor_cell = None
    actor.nav_place_target_cell = None
    actor.nav_goal_support_cell = None
    actor.nav_replan_cooldown_s = 0.0
    actor.nav_path_failed = False
    actor.nav_jump_required = False
    actor.nav_jump_span = 1
    actor.nav_step_progress_cell = None
    actor.nav_step_best_distance = 1e9
    actor.nav_step_stuck_s = 0.0

  def _cancel_pending_nav_plan(self, actor: _AiPlayerRuntime) -> None:
    self._route_worker.cancel_actor(str(actor.actor_id))
    actor.nav_plan_pending = False
    actor.nav_plan_pending_generation = 0

  @staticmethod
  def _damage_sound_position(player: PlayerEntity) -> tuple[float, float, float]:
    return (float(player.position.x), float(player.position.y) + float(player.eye_height) * 0.5, float(player.position.z))

  @staticmethod
  def _note_ai_damage(actor: _AiPlayerRuntime) -> None:
    """
    AI が damage を受けた事実を自動回復状態へ反映する。
    regen_wait_s(最終被弾からの経過秒)と regen_tick_s(次回回復までの蓄積秒)を共に 0 へ戻し、回復待機 timer を被弾の度に reset する契約を一箇所へ固定する。
    呼び出し箇所は fall damage、void damage、local player からの melee damage であり、damage 量が正の場合に限り呼び出す。
    """
    actor.regen_wait_s = 0.0
    actor.regen_tick_s = 0.0

  def _advance_ai_regeneration(self, actor: _AiPlayerRuntime, *, dt: float) -> None:
    """
    AI の自動回復を simulation step 内で進行させる。
    dead actor は対象外であり、despawn 済み actor は manager の registry に存在しないため呼び出されない。
    regen_wait_s は生存中常に加算され、auto_regen_enabled が偽、現在体力が有効上限以上、又は regen_wait_s が regen_start_delay_s 未満の間は regen_tick_s を 0 へ保つ。
    有効上限は min(regen_cap_hp, max_health) であり、条件成立中は regen_interval_s ごとに regen_amount_hp を上限まで加算する。
    既定値は enabled=false、delay=4.0 秒、interval=4.0 秒、amount=1.0 health point、cap=max_health 相当であり、無効のままなら従来どおり一切回復しない。
    """
    if not actor.player.alive():
      actor.regen_tick_s = 0.0
      return
    actor.regen_wait_s = float(actor.regen_wait_s) + max(0.0, float(dt))
    if not bool(actor.auto_regen_enabled):
      actor.regen_tick_s = 0.0
      return
    cap = min(float(actor.regen_cap_hp), float(actor.player.max_health))
    if float(actor.player.health) >= float(cap) - 1e-9:
      actor.regen_tick_s = 0.0
      return
    if float(actor.regen_wait_s) < float(actor.regen_start_delay_s):
      actor.regen_tick_s = 0.0
      return
    interval = max(1e-6, float(actor.regen_interval_s))
    actor.regen_tick_s = float(actor.regen_tick_s) + max(0.0, float(dt))
    while float(actor.regen_tick_s) + 1e-9 >= float(interval) and float(actor.player.health) < float(cap) - 1e-9:
      actor.regen_tick_s = float(actor.regen_tick_s) - float(interval)
      actor.player.health = min(float(cap), float(actor.player.health) + max(0.0, float(actor.regen_amount_hp)))
    if float(actor.player.health) >= float(cap) - 1e-9:
      actor.regen_tick_s = 0.0

  @staticmethod
  def _trigger_attack_swing(actor: _AiPlayerRuntime) -> None:
    actor.attack_swing_progress = 0.0
    actor.attack_prev_swing_progress = 0.0
    actor.attack_swing_active = True

  @staticmethod
  def _advance_attack_swing(actor: _AiPlayerRuntime, *, dt: float) -> None:
    actor.attack_prev_swing_progress = float(actor.attack_swing_progress)
    if not bool(actor.attack_swing_active):
      actor.attack_swing_progress = 0.0
      return
    duration = max(1e-6, float(_AI_ATTACK_SWING_DURATION_S))
    actor.attack_swing_progress = min(1.0, float(actor.attack_swing_progress) + max(0.0, float(dt)) / float(duration))
    if float(actor.attack_swing_progress) >= 1.0:
      actor.attack_swing_progress = 0.0
      actor.attack_swing_active = False

  def _mark_nav_failure(self, actor: _AiPlayerRuntime, *, target_index: int, world_revision: int) -> None:
    self._clear_nav_plan(actor)
    actor.nav_path_failed = True
    actor.nav_plan_failed_world_revision = int(world_revision)
    actor.nav_plan_failed_target_index = int(target_index)
    actor.nav_failure_retry_count = min(6, int(actor.nav_failure_retry_count) + 1)
    actor.nav_failure_retry_s = min(float(_AI_NAV_FAILURE_RETRY_MAX_S), float(_AI_NAV_FAILURE_RETRY_BASE_S) * float(1.45 ** max(0, int(actor.nav_failure_retry_count) - 1)))
    failure_support = self._current_support_cell(actor)
    actor.nav_failed_support_cell = None if failure_support is None else tuple(int(value) for value in failure_support)
    point_count = len(actor.route_points)
    if int(actor.nav_failure_retry_count) >= int(_AI_NAV_UNREACHABLE_SKIP_RETRIES) and int(point_count) > 1:
      index_key = int(target_index) % int(point_count)
      actor.nav_unreachable_targets[int(index_key)] = float(_AI_NAV_UNREACHABLE_TARGET_COOLDOWN_S)
      advance_route_target(actor)
      self._reset_nav_failure(actor)
      actor.nav_replan_cooldown_s = 0.0

  def _reset_nav_failure(self, actor: _AiPlayerRuntime) -> None:
    actor.nav_path_failed = False
    actor.nav_plan_failed_world_revision = -1
    actor.nav_plan_failed_target_index = -1
    actor.nav_failure_retry_s = 0.0
    actor.nav_failure_retry_count = 0
    actor.nav_failed_support_cell = None

  def _clear_active_nav_step(self, actor: _AiPlayerRuntime) -> None:
    actor.nav_next_support_cell = None
    actor.nav_from_support_cell = None
    actor.nav_place_anchor_cell = None
    actor.nav_place_target_cell = None
    actor.nav_jump_required = False
    actor.nav_jump_span = 1
    actor.nav_step_progress_cell = None
    actor.nav_step_best_distance = 1e9
    actor.nav_step_stuck_s = 0.0

  def _sync_cached_nav_step(self, actor: _AiPlayerRuntime, *, current_support: tuple[int, int, int]) -> bool:
    if len(actor.nav_plan_steps) <= 0:
      self._clear_active_nav_step(actor)
      return False
    current = tuple(int(value) for value in current_support)
    if int(actor.nav_plan_index) < 0:
      actor.nav_plan_index = 0
    if int(actor.nav_plan_index) >= len(actor.nav_plan_steps):
      actor.nav_plan_index = len(actor.nav_plan_steps) - 1
    if tuple(int(value) for value in actor.nav_plan_steps[int(actor.nav_plan_index)].support_cell) != current:
      matched_index = None
      for index, step in enumerate(actor.nav_plan_steps):
        if tuple(int(value) for value in step.support_cell) == current:
          matched_index = int(index)
          break
      if matched_index is None:
        self._clear_nav_plan(actor)
        return False
      actor.nav_plan_index = int(matched_index)
    while int(actor.nav_plan_index) + 1 < len(actor.nav_plan_steps) and tuple(int(value) for value in actor.nav_plan_steps[int(actor.nav_plan_index) + 1].support_cell) == current:
      actor.nav_plan_index += 1
    if int(actor.nav_plan_index) + 1 >= len(actor.nav_plan_steps):
      self._clear_active_nav_step(actor)
      actor.nav_goal_support_cell = tuple(int(value) for value in actor.nav_plan_steps[-1].support_cell)
      return False
    next_step = actor.nav_plan_steps[int(actor.nav_plan_index) + 1]
    actor.nav_next_support_cell = tuple(int(value) for value in next_step.support_cell)
    actor.nav_from_support_cell = current
    actor.nav_place_anchor_cell = None if next_step.placement_anchor is None else tuple(int(value) for value in next_step.placement_anchor)
    actor.nav_place_target_cell = tuple(int(value) for value in next_step.support_cell) if next_step.placement_anchor is not None else None
    actor.nav_jump_required = bool(next_step.jump_required)
    actor.nav_jump_span = max(1, int(next_step.jump_span))
    if actor.nav_step_progress_cell != tuple(int(value) for value in next_step.support_cell):
      actor.nav_step_progress_cell = tuple(int(value) for value in next_step.support_cell)
      actor.nav_step_best_distance = float(_point_distance_xz(actor.player.position, _support_cell_center(tuple(int(value) for value in next_step.support_cell))))
      actor.nav_step_stuck_s = 0.0
    return True

  def _full_world_snapshot(self) -> tuple[tuple[int, int, int, str], ...]:
    """
    route planner へ渡す world 全体の block snapshot を world revision 単位で cache して返す。
    snapshot は world.blocks の一括列挙(block 数に比例する一回の走査)で構築し、同一 revision の間は同じ tuple を再利用するため、
    複数 actor の plan 要求や actor の移動によって main thread 上の snapshot 構築が繰り返されない。
    以前の bounds 指定 window snapshot は探索領域を狭め、かつ bounds が変わる度に列挙し直していたため、これを map 全体 snapshot へ置き換えている。
    """
    if int(self._full_snapshot_revision) != int(self.world.revision):
      self._full_snapshot_revision = int(self.world.revision)
      self._full_snapshot_blocks = tuple((int(x), int(y), int(z), str(state_str)) for x, y, z, state_str in self.world.iter_blocks())
    return self._full_snapshot_blocks

  def _build_route_plan_request(self, actor: _AiPlayerRuntime, *, start_support: tuple[int, int, int]) -> AiRoutePlanRequest | None:
    if len(actor.route_points) <= 0:
      return None
    world_blocks = self._full_world_snapshot()
    self._route_plan_generation += 1
    blocked_edges = tuple((tuple(int(value) for value in edge[0]), tuple(int(value) for value in edge[1])) for edge, ttl in actor.nav_blocked_edges.items() if float(ttl) > 1e-6)
    avoid_supports = tuple(tuple(int(value) for value in cell) for cell, ttl in actor.nav_avoid_support_cells.items() if float(ttl) > 1e-6)
    return AiRoutePlanRequest(
      generation=int(self._route_plan_generation),
      actor_id=str(actor.actor_id),
      world_revision=int(self.world.revision),
      world_blocks=tuple(world_blocks),
      settings=self.settings,
      start_support=tuple(int(value) for value in start_support),
      route_points=tuple(actor.route_points),
      route_target_index=int(actor.route_target_index),
      can_place_blocks=bool(actor.can_place_blocks),
      blocked_edges=tuple(blocked_edges),
      avoid_support_cells=tuple(avoid_supports),
      search_radius=0,
    )

  def _request_route_plan(self, actor: _AiPlayerRuntime, *, start_support: tuple[int, int, int]) -> bool:
    if int(self._route_requests_this_step) >= int(_AI_ROUTE_REQUESTS_PER_STEP):
      return False
    request = self._build_route_plan_request(actor, start_support=tuple(int(value) for value in start_support))
    if request is None:
      return False
    actor.nav_plan_pending = True
    actor.nav_plan_pending_generation = int(request.generation)
    actor.nav_plan_start_support_cell = tuple(int(value) for value in start_support)
    self._route_worker.request_plan(request)
    self._route_requests_this_step += 1
    return True

  def _apply_route_plan_result(self, actor: _AiPlayerRuntime, result: AiRoutePlanResult) -> None:
    if int(result.generation) != int(actor.nav_plan_pending_generation):
      return
    current_support = self._current_support_cell(actor)
    actor.nav_plan_pending = False
    actor.nav_plan_pending_generation = 0
    actor.nav_plan_start_support_cell = None
    if int(result.world_revision) != int(self.world.revision):
      self._clear_nav_plan(actor)
      actor.nav_replan_cooldown_s = 0.0
      return
    if not bool(result.success) or len(result.path) < 2:
      self._mark_nav_failure(actor, target_index=int(result.route_target_index), world_revision=int(self.world.revision))
      return
    if current_support is not None and tuple(int(value) for value in current_support) != tuple(int(value) for value in result.start_support):
      self._clear_nav_plan(actor)
      actor.nav_replan_cooldown_s = 0.0
      return
    actor.route_target_index = int(result.route_target_index)
    actor.nav_plan_steps = tuple(result.path)
    actor.nav_plan_index = 0
    actor.nav_goal_support_cell = tuple(int(value) for value in result.path[-1].support_cell)
    actor.nav_world_revision = int(result.world_revision)
    self._reset_nav_failure(actor)
    actor.nav_replan_cooldown_s = 0.0
    if current_support is not None:
      self._sync_cached_nav_step(actor, current_support=tuple(int(value) for value in current_support))
    else:
      self._clear_active_nav_step(actor)

  def _drain_completed_route_plans(self) -> None:
    for result in self._route_worker.poll_ready():
      actor = self._actors.get(str(result.actor_id))
      if actor is None:
        continue
      self._apply_route_plan_result(actor, result)

  def _nav_cell_empty(self, cell: tuple[int, int, int]) -> bool:
    return self._state_at(int(cell[0]), int(cell[1]), int(cell[2])) is None

  def _nav_headroom_clear(self, support_cell: tuple[int, int, int]) -> bool:
    x, y, z = (int(support_cell[0]), int(support_cell[1]), int(support_cell[2]))
    return bool(self._nav_cell_empty((int(x), int(y) + 1, int(z))) and self._nav_cell_empty((int(x), int(y) + 2, int(z))))

  def _standable_support_cell(self, actor: _AiPlayerRuntime, support_cell: tuple[int, int, int]) -> bool:
    del actor
    if not bool(self._cell_has_full_top_support(tuple(int(value) for value in support_cell))):
      return False
    return bool(self._nav_headroom_clear(tuple(int(value) for value in support_cell)))

  def _transition_clear_between_support_cells(self, actor: _AiPlayerRuntime, *, from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> bool:
    src = tuple(int(value) for value in from_cell)
    dst = tuple(int(value) for value in to_cell)
    dx = int(dst[0]) - int(src[0])
    dz = int(dst[2]) - int(src[2])
    horizontal_span = max(abs(int(dx)), abs(int(dz)))
    if int(horizontal_span) != 1 or (int(dx) == 0 and int(dz) == 0):
      return False
    if abs(int(dst[1]) - int(src[1])) > int(_AI_MAX_SUPPORT_Y_DELTA):
      return False
    if (not bool(self._nav_headroom_clear(src))) or (not bool(self._nav_headroom_clear(dst))):
      return False
    start = _support_cell_center(src)
    end = _support_cell_center(dst)
    probe_y = float(max(float(start.y), float(end.y)))
    sample_count = 6 if (int(dx) != 0 and int(dz) != 0) else 4
    for sample_index in range(1, int(sample_count)):
      ratio = float(sample_index) / float(sample_count)
      probe = Vec3(float(start.x) + (float(end.x) - float(start.x)) * float(ratio), float(probe_y), float(start.z) + (float(end.z) - float(start.z)) * float(ratio))
      if not bool(self._player_clear_at(actor, position=probe)):
        return False
    return True

  def _parkour_jump_reach_blocks(self) -> float:
    movement = self.settings.movement
    gravity = max(1e-6, float(movement.gravity))
    jump_v0 = max(0.0, float(movement.jump_v0))
    launch_speed = max(float(movement.walk_speed), float(movement.sprint_speed)) + max(0.0, float(movement.sprint_jump_boost))
    flight_time = (2.0 * float(jump_v0)) / float(gravity)
    return max(0.0, float(launch_speed) * float(flight_time))

  def _max_parkour_jump_span(self) -> int:
    reach_blocks = self._parkour_jump_reach_blocks()
    return max(2, min(int(_AI_PARKOUR_SEARCH_CAP), int(math.floor(float(reach_blocks) + 0.25))))

  def _jump_arc_clear(self, actor: _AiPlayerRuntime, *, from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> bool:
    start = _support_cell_center(tuple(int(value) for value in from_cell))
    end = _support_cell_center(tuple(int(value) for value in to_cell))
    delta = end - start
    horizontal_distance = float(_horizontal_transition_distance(tuple(int(value) for value in from_cell), tuple(int(value) for value in to_cell)))
    if float(horizontal_distance) <= 1.05:
      return False
    apex = 0.95 + max(0.0, float(horizontal_distance - 2.0)) * 0.22 + max(0.0, float(int(to_cell[1]) - int(from_cell[1]))) * 0.30
    sample_count = max(3, int(max(5.0, math.ceil(float(horizontal_distance) * 2.0))))
    for sample_index in range(1, int(sample_count) + 1):
      ratio = float(sample_index) / float(sample_count)
      base = start + delta * float(ratio)
      arc_y = float(4.0 * ratio * (1.0 - ratio) * apex)
      probe = Vec3(float(base.x), float(base.y) + float(arc_y), float(base.z))
      if not bool(self._player_clear_at(actor, position=probe)):
        return False
    return True

  def _drop_transition_clear(self, actor: _AiPlayerRuntime, *, from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> bool:
    src = tuple(int(value) for value in from_cell)
    dst = tuple(int(value) for value in to_cell)
    dx = int(dst[0]) - int(src[0])
    dz = int(dst[2]) - int(src[2])
    horizontal_span = max(abs(int(dx)), abs(int(dz)))
    if int(horizontal_span) != 1 or (int(dx) == 0 and int(dz) == 0):
      return False
    drop = int(src[1]) - int(dst[1])
    if int(drop) <= 0 or int(drop) > 3:
      return False
    if (not bool(self._nav_headroom_clear(src))) or (not bool(self._standable_support_cell(actor, dst))):
      return False
    start = _support_cell_center(src)
    end = _support_cell_center(dst)
    sample_count = max(4, int(drop) * 2 + 2)
    for sample_index in range(1, int(sample_count) + 1):
      ratio = float(sample_index) / float(sample_count)
      lift = 0.24 * (1.0 - float(ratio))
      probe = Vec3(
        float(start.x) + (float(end.x) - float(start.x)) * float(ratio),
        float(start.y) + (float(end.y) - float(start.y)) * float(ratio) + float(lift),
        float(start.z) + (float(end.z) - float(start.z)) * float(ratio),
      )
      if not bool(self._player_clear_at(actor, position=probe)):
        return False
    return True

  def _local_recovery_neighbors(
    self,
    actor: _AiPlayerRuntime,
    *,
    support_cell: tuple[int, int, int],
    blocked_edges: set[tuple[tuple[int, int, int], tuple[int, int, int]]],
    avoid_cells: set[tuple[int, int, int]],
    desired_target_cell: tuple[int, int, int] | None,
  ) -> tuple[tuple[int, int, int], ...]:
    current = tuple(int(value) for value in support_cell)
    x, y, z = current
    candidates: list[tuple[int, int, int]] = []
    seen: set[tuple[int, int, int]] = set()
    target_vec_x = 0 if desired_target_cell is None else int(desired_target_cell[0]) - int(x)
    target_vec_z = 0 if desired_target_cell is None else int(desired_target_cell[2]) - int(z)
    for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
      for dy in (0, -1, -2, 1):
        candidate = (int(x) + int(dx), int(y) + int(dy), int(z) + int(dz))
        if candidate == current or candidate in avoid_cells or candidate in seen:
          continue
        if (current, candidate) in blocked_edges:
          continue
        if not bool(self._standable_support_cell(actor, candidate)):
          continue
        reachable = bool(self._transition_clear_between_support_cells(actor, from_cell=current, to_cell=candidate))
        if (not bool(reachable)) and int(dy) < 0:
          reachable = bool(self._drop_transition_clear(actor, from_cell=current, to_cell=candidate))
        if not bool(reachable):
          continue
        candidates.append(candidate)
        seen.add(candidate)
      if int(abs(int(dx)) + abs(int(dz))) != 1:
        continue
      place_candidate = (int(x) + int(dx), int(y), int(z) + int(dz))
      if place_candidate in avoid_cells or place_candidate in seen:
        continue
      if bool(self._can_place_support_block(actor, anchor_cell=current, target_cell=place_candidate, ignore_cooldown=True)):
        candidates.append(place_candidate)
        seen.add(place_candidate)
    max_jump_span = min(int(_AI_LOCAL_RECOVERY_PARKOUR_SPAN), int(self._max_parkour_jump_span()))
    max_jump_reach = min(float(max_jump_span) + 0.45, float(self._parkour_jump_reach_blocks()) + 0.25)
    allow_parkour = True
    if desired_target_cell is not None:
      target_vertical_delta = abs(int(desired_target_cell[1]) - int(y))
      target_horizontal_distance = float(_horizontal_transition_distance(current, desired_target_cell))
      allow_parkour = bool(int(target_vertical_delta) <= 3 and float(target_horizontal_distance) <= float(max_jump_reach) + 0.35)
    if bool(allow_parkour):
      for delta_x in range(-int(max_jump_span), int(max_jump_span) + 1):
        for delta_z in range(-int(max_jump_span), int(max_jump_span) + 1):
          horizontal_span = max(abs(int(delta_x)), abs(int(delta_z)))
          if int(horizontal_span) <= 1:
            continue
          if desired_target_cell is not None and (int(delta_x) * int(target_vec_x) + int(delta_z) * int(target_vec_z)) <= 0:
            continue
          if float(math.hypot(float(delta_x), float(delta_z))) > float(max_jump_reach):
            continue
          for landing_dy in (0, -1, 1, -2, -3):
            candidate = (int(x) + int(delta_x), int(y) + int(landing_dy), int(z) + int(delta_z))
            if candidate == current or candidate in avoid_cells or candidate in seen:
              continue
            if (current, candidate) in blocked_edges:
              continue
            if not bool(self._standable_support_cell(actor, candidate)):
              continue
            if not bool(self._jump_arc_clear(actor, from_cell=current, to_cell=candidate)):
              continue
            candidates.append(candidate)
            seen.add(candidate)
            break
    return tuple(candidates)

  def _local_recovery_target(self, actor: _AiPlayerRuntime, *, current_support: tuple[int, int, int], desired_target: Vec3, desired_target_support: tuple[int, int, int] | None = None) -> Vec3 | None:
    """
    行き詰まり中の actor が短距離で目標へ近づける支持 cell を幅優先探索で求め、その cell 中心を返す。
    探索は visit 数上限に加えて経過時間 deadline(_AI_LOCAL_RECOVERY_TIME_BUDGET_S)で打ち切り、escape 用 parkour 候補の span も縮小されているため、
    複数 actor が同時に行き詰まっても 1 回の探索が simulation step の時間を専有しない。
    desired_target_support は呼び出し側(_cached_local_recovery_target)が cache 済みの目標支持 cell を渡すための引数であり、None の場合のみ近傍探索で補完する。
    改善候補が無い場合は None を返し、呼び出し側は現在支持 cell の中心へ留まる。
    """
    current = tuple(int(value) for value in current_support)
    current_center = _support_cell_center(current)
    current_score = float(_point_distance_xz(current_center, desired_target))
    prefer_descent = float(desired_target.y) + 0.25 < float(current_center.y)
    blocked_edges = set(actor.nav_blocked_edges.keys())
    avoid_cells = set(active_avoid_support_cells(actor))
    if desired_target_support is None:
      desired_target_support = self._nearest_standable_support_cell(actor, _support_cell_from_point(desired_target))
    deadline = float(time.perf_counter()) + float(_AI_LOCAL_RECOVERY_TIME_BUDGET_S)
    queue: deque[tuple[tuple[int, int, int], int]] = deque([(current, 0)])
    visited: set[tuple[int, int, int]] = {current}
    best_cell: tuple[int, int, int] | None = None
    best_score = float(current_score)
    fallback_cell: tuple[int, int, int] | None = None
    fallback_score = 1e9
    while queue and len(visited) <= int(_AI_LOCAL_RECOVERY_VISIT_LIMIT):
      if float(time.perf_counter()) >= float(deadline):
        break
      cell, depth = queue.popleft()
      if int(depth) >= int(_AI_LOCAL_RECOVERY_SEARCH_RADIUS):
        continue
      for candidate in self._local_recovery_neighbors(
        actor, support_cell=tuple(int(value) for value in cell), blocked_edges=blocked_edges, avoid_cells=avoid_cells, desired_target_cell=desired_target_support
      ):
        normalized = tuple(int(value) for value in candidate)
        if normalized in visited:
          continue
        visited.add(normalized)
        next_depth = int(depth) + 1
        queue.append((normalized, int(next_depth)))
        candidate_center = _support_cell_center(normalized)
        score = float(_point_distance_xz(candidate_center, desired_target)) + float(next_depth) * float(_AI_LOCAL_RECOVERY_STEP_PENALTY)
        if bool(prefer_descent) and int(normalized[1]) < int(current[1]):
          score -= 0.24 * float(int(current[1]) - int(normalized[1]))
        if float(score) + float(_AI_LOCAL_RECOVERY_PROGRESS_EPS) < float(best_score):
          best_score = float(score)
          best_cell = normalized
        elif fallback_cell is None or float(score) < float(fallback_score):
          fallback_score = float(score)
          fallback_cell = normalized
    if best_cell is not None:
      return _support_cell_center(best_cell)
    if fallback_cell is None:
      return None
    if float(fallback_score) > float(current_score) + float(_AI_LOCAL_RECOVERY_ALLOW_REGRESSION):
      return None
    return _support_cell_center(fallback_cell)

  def _cached_local_recovery_target(self, actor: _AiPlayerRuntime, *, current_support: tuple[int, int, int], desired_target: Vec3, target_support: tuple[int, int, int] | None) -> Vec3 | None:
    """
    _local_recovery_target() の BFS 探索結果を短時間 cache し、探索回数を step 単位の予算内へ制限した上で局所回復目標を返す。
    cache key は (現在支持 cell, 目標支持 cell) の組であり、key が一致し cache 経過時間が _AI_LOCAL_RECOVERY_CACHE_S 未満の間は前回結果を再利用する。
    cache が失効していても、同一 simulation step 内の探索実行回数が _AI_LOCAL_RECOVERY_BUDGET_PER_STEP に達している場合は stale な前回結果(無ければ None)を返し、新たな探索を行わない。
    この制御は、複数 actor が同時に行き詰まった場合でも局所探索が描画 frame 時間を圧迫しないことを目的とし、探索品質は cache 失効ごとの再計算で維持する。
    """
    key = (tuple(int(value) for value in current_support), None if target_support is None else tuple(int(value) for value in target_support))
    if actor.local_recovery_cache_key == key and float(actor.local_recovery_cache_age_s) < float(_AI_LOCAL_RECOVERY_CACHE_S):
      return actor.local_recovery_cache_target
    if int(self._recovery_searches_this_step) >= int(_AI_LOCAL_RECOVERY_BUDGET_PER_STEP):
      if actor.local_recovery_cache_key == key:
        return actor.local_recovery_cache_target
      return None
    self._recovery_searches_this_step += 1
    result = self._local_recovery_target(
      actor,
      current_support=tuple(int(value) for value in current_support),
      desired_target=desired_target,
      desired_target_support=None if target_support is None else tuple(int(value) for value in target_support),
    )
    actor.local_recovery_cache_key = key
    actor.local_recovery_cache_target = result
    actor.local_recovery_cache_age_s = 0.0
    return result

  def _can_place_support_block(self, actor: _AiPlayerRuntime, *, anchor_cell: tuple[int, int, int], target_cell: tuple[int, int, int], ignore_cooldown: bool = False) -> bool:
    """
    anchor cell の側面へ支持 block を一個設置できる状態かを判定する。
    判定条件は placement 許可、手持ち block の存在、anchor cell の実在、target cell の空き、target 上の headroom であり、
    ignore_cooldown が偽の場合はこれに加えて place cooldown の経過を要求する。
    ignore_cooldown は「設置は予定どおり可能だが cooldown 待ちである」状態を、設置不能(経路無効)と区別するために使う。
    plan step の有効性検査と局所回復の候補列挙は ignore_cooldown=True で呼び、実際の設置実行経路は既定の cooldown 検査を維持する。
    """
    if actor.held_item_id is None or (not bool(actor.can_place_blocks)):
      return False
    if (not bool(ignore_cooldown)) and float(actor.place_cooldown_s) > 1e-6:
      return False
    if self._state_at(int(anchor_cell[0]), int(anchor_cell[1]), int(anchor_cell[2])) is None:
      return False
    if self._state_at(int(target_cell[0]), int(target_cell[1]), int(target_cell[2])) is not None:
      return False
    return bool(self._nav_headroom_clear(tuple(int(value) for value in target_cell)))

  def _nearest_standable_support_cell(self, actor: _AiPlayerRuntime, preferred_cell: tuple[int, int, int]) -> tuple[int, int, int] | None:
    base = tuple(int(value) for value in preferred_cell)
    if bool(self._standable_support_cell(actor, base)):
      return base
    for radius in range(1, int(_AI_ROUTE_TARGET_SUPPORT_SEARCH_RADIUS) + 1):
      for dx in range(-int(radius), int(radius) + 1):
        for dz in range(-int(radius), int(radius) + 1):
          for dy in range(-3, int(_AI_MAX_SUPPORT_Y_DELTA) + 1):
            candidate = (int(base[0]) + int(dx), int(base[1]) + int(dy), int(base[2]) + int(dz))
            if bool(self._standable_support_cell(actor, candidate)):
              return candidate
    return None

  def _route_target_support(self, actor: _AiPlayerRuntime, *, desired_target: Vec3) -> tuple[int, int, int] | None:
    """
    route 目標点に対応する到達可能な支持 cell を、(目標 cell, world revision) を key とする actor 単位 cache 付きで返す。
    _nearest_standable_support_cell() は目標近傍に支持 cell が無い場合に半径 6 の全候補を走査するため、
    cache が無いと同一目標へ向かう間この走査が simulation step ごとに繰り返され、frame 時間を消費していた。
    world が変化するか目標 cell が変わった時のみ再計算し、それ以外は前回結果(None を含む)を返す。
    """
    cell = tuple(int(value) for value in _support_cell_from_point(desired_target))
    key = (cell, int(self.world.revision))
    if actor.target_support_cache_key == key:
      return actor.target_support_cache_value
    result = self._nearest_standable_support_cell(actor, cell)
    actor.target_support_cache_key = key
    actor.target_support_cache_value = None if result is None else tuple(int(value) for value in result)
    return actor.target_support_cache_value

  def _revalidate_plan_after_world_change(self, actor: _AiPlayerRuntime) -> None:
    """
    world revision の変化後に、cache 済み plan の残り step が現在の world でも成立するかを検査し、不成立なら即時再計画へ移行させる。
    検査対象は現在 index 以降の step であり、placement を伴わない step は standable 性、placement step は target cell が「既に block で埋まり standable」か「空のまま headroom が確保されている」かを確認する。
    block の設置・破壊・フェンスゲートの開閉は state 変化として standable 性又は headroom を変えるため、この検査が経路閉塞を検出する。
    不成立を検出した場合は blocked edge を記録せずに plan と pending 要求を破棄し、replan cooldown を 0 として次の step で全 map snapshot による再計画を要求させる。
    """
    if len(actor.nav_plan_steps) <= 0:
      return
    start_index = max(0, int(actor.nav_plan_index))
    for step in actor.nav_plan_steps[start_index:]:
      cell = tuple(int(value) for value in step.support_cell)
      if step.placement_anchor is None:
        if bool(self._standable_support_cell(actor, cell)):
          continue
      else:
        if self._state_at(int(cell[0]), int(cell[1]), int(cell[2])) is not None:
          if bool(self._standable_support_cell(actor, cell)):
            continue
        elif bool(self._nav_headroom_clear(cell)):
          continue
      if bool(actor.nav_plan_pending):
        self._cancel_pending_nav_plan(actor)
      self._clear_nav_plan(actor)
      self._reset_nav_failure(actor)
      actor.nav_replan_cooldown_s = 0.0
      return

  def _direct_route_clear(self, actor: _AiPlayerRuntime, *, from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> bool:
    src = tuple(int(value) for value in from_cell)
    dst = tuple(int(value) for value in to_cell)
    if int(src[1]) != int(dst[1]):
      return False
    steps = max(abs(int(dst[0]) - int(src[0])), abs(int(dst[2]) - int(src[2])))
    if int(steps) > int(_AI_DIRECT_ROUTE_MAX_SPAN):
      return False
    if int(steps) <= 0:
      return True
    previous = src
    for index in range(1, int(steps) + 1):
      ratio = float(index) / float(steps)
      cell = (int(round(float(src[0]) + float(int(dst[0]) - int(src[0])) * ratio)), int(src[1]), int(round(float(src[2]) + float(int(dst[2]) - int(src[2])) * ratio)))
      if cell == previous:
        continue
      if not bool(self._standable_support_cell(actor, cell)):
        return False
      if not bool(self._transition_clear_between_support_cells(actor, from_cell=previous, to_cell=cell)):
        return False
      previous = cell
    return True

  def _navigation_jump_pressed(self, actor: _AiPlayerRuntime, *, fallback_target: Vec3, default_jump_pressed: bool) -> bool:
    if not bool(actor.player.on_ground):
      return False
    next_cell = None if actor.nav_next_support_cell is None else tuple(int(value) for value in actor.nav_next_support_cell)
    if next_cell is None:
      return bool(default_jump_pressed)
    current_support = self._current_support_cell(actor)
    if current_support is None:
      current_support = None if actor.nav_from_support_cell is None else tuple(int(value) for value in actor.nav_from_support_cell)
    if current_support is None:
      return bool(default_jump_pressed)
    span = max(abs(int(next_cell[0]) - int(current_support[0])), abs(int(next_cell[2]) - int(current_support[2])))
    if int(span) <= 1 and int(next_cell[1]) <= int(current_support[1]) + 1:
      return False
    jump_required = bool(actor.nav_jump_required or int(next_cell[1]) > int(current_support[1]) or int(span) > 1)
    if not bool(jump_required):
      return bool(default_jump_pressed)
    target = _support_cell_center(next_cell)
    forward = actor.player.view_forward()
    forward_xz = Vec3(float(forward.x), 0.0, float(forward.z)).normalized()
    to_target = Vec3(float(target.x) - float(actor.player.position.x), 0.0, float(target.z) - float(actor.player.position.z)).normalized()
    if float(forward_xz.length()) <= 1e-6 or float(to_target.length()) <= 1e-6:
      return bool(default_jump_pressed)
    if float(forward_xz.dot(to_target)) < float(_AI_NAV_JUMP_ALIGN_MIN):
      return False
    if int(max(1, int(actor.nav_jump_span))) > 1:
      takeoff = _parkour_takeoff_point(tuple(int(value) for value in current_support), tuple(int(value) for value in next_cell))
      remaining_to_takeoff = float((Vec3(float(takeoff.x), 0.0, float(takeoff.z)) - Vec3(float(actor.player.position.x), 0.0, float(actor.player.position.z))).dot(to_target))
      if float(remaining_to_takeoff) > float(_AI_PARKOUR_TAKEOFF_TRIGGER_EPS):
        return False
      horizontal_speed = float(math.hypot(float(actor.player.velocity.x), float(actor.player.velocity.z)))
      required_speed = float(self.settings.movement.sprint_speed) * float(_AI_NAV_PARKOUR_SPEED_SCALE)
      if float(horizontal_speed) + 1e-6 < float(required_speed):
        return False
      return True
    source_center = _support_cell_center(tuple(int(value) for value in current_support))
    progress = float((Vec3(float(actor.player.position.x), 0.0, float(actor.player.position.z)) - Vec3(float(source_center.x), 0.0, float(source_center.z))).dot(to_target))
    if float(progress) < float(_AI_NAV_JUMP_PROGRESS_MIN):
      return False
    return True

  def _can_see_point(self, actor: _AiPlayerRuntime, target: Vec3) -> bool:
    delta = target - actor.player.eye_pos()
    distance = float(delta.length())
    if float(distance) <= 1e-6:
      return True
    direction = delta.normalized()
    world_hit = actor.interaction.pick_block(reach=float(distance), origin=actor.player.eye_pos(), direction=direction)
    return world_hit is None or float(world_hit.t) >= float(distance) - 0.05

  def _movement_target_for_route_style(self, actor: _AiPlayerRuntime, *, desired_target: Vec3, dt: float) -> Vec3:
    if normalize_ai_route_style(actor.route_style) != AI_ROUTE_STYLE_FLEXIBLE:
      if bool(actor.nav_plan_pending):
        self._cancel_pending_nav_plan(actor)
      self._clear_nav_plan(actor)
      self._reset_nav_failure(actor)
      return desired_target
    actor.nav_replan_cooldown_s = max(0.0, float(actor.nav_replan_cooldown_s) - max(0.0, float(dt)))
    actor.nav_failure_retry_s = max(0.0, float(actor.nav_failure_retry_s) - max(0.0, float(dt)))
    actor.local_recovery_cache_age_s = float(actor.local_recovery_cache_age_s) + max(0.0, float(dt))
    expired_unreachable = [index for index, ttl in actor.nav_unreachable_targets.items() if float(ttl) - max(0.0, float(dt)) <= 1e-6]
    for index in tuple(expired_unreachable):
      actor.nav_unreachable_targets.pop(int(index), None)
    for index in tuple(actor.nav_unreachable_targets.keys()):
      actor.nav_unreachable_targets[int(index)] = max(0.0, float(actor.nav_unreachable_targets[int(index)]) - max(0.0, float(dt)))
    if int(actor.nav_world_revision) != int(self.world.revision):
      actor.nav_world_revision = int(self.world.revision)
      actor.nav_blocked_edges.clear()
      actor.nav_avoid_support_cells.clear()
      actor.nav_unreachable_targets.clear()
      actor.local_recovery_cache_target = None
      actor.local_recovery_cache_key = None
      actor.local_recovery_cache_age_s = 1e9
      self._reset_nav_failure(actor)
      self._revalidate_plan_after_world_change(actor)
    expired_edges = [edge for edge, ttl in actor.nav_blocked_edges.items() if float(ttl) - max(0.0, float(dt)) <= 1e-6]
    for edge in tuple(expired_edges):
      actor.nav_blocked_edges.pop(edge, None)
    for edge in tuple(actor.nav_blocked_edges.keys()):
      actor.nav_blocked_edges[edge] = max(0.0, float(actor.nav_blocked_edges[edge]) - max(0.0, float(dt)))
    decay_avoid_support_cells(actor, dt=float(dt))
    contact_support = self._support_contact_cell(actor)
    if contact_support is None and (not bool(actor.player.on_ground)):
      if actor.nav_next_support_cell is not None:
        return _support_cell_center(tuple(int(value) for value in actor.nav_next_support_cell))
      return desired_target
    start_support = self._current_support_cell(actor)
    if start_support is None:
      if actor.nav_next_support_cell is not None:
        return _support_cell_center(tuple(int(value) for value in actor.nav_next_support_cell))
      return desired_target
    current_support = tuple(int(value) for value in start_support)
    target_support = self._route_target_support(actor, desired_target=desired_target)
    goal_distance = float(_point_distance_xz(actor.player.position, desired_target))
    progress_delta = float(actor.route_last_goal_distance) - float(goal_distance)
    if float(progress_delta) <= float(_AI_ROUTE_STUCK_PROGRESS_EPS):
      actor.route_stuck_s += max(0.0, float(dt))
    else:
      actor.route_stuck_s = 0.0
    actor.route_last_goal_distance = float(goal_distance)
    actor.route_last_progress_position = Vec3(float(actor.player.position.x), float(actor.player.position.y), float(actor.player.position.z))
    if bool(actor.nav_path_failed) and int(actor.nav_plan_failed_world_revision) == int(self.world.revision) and int(actor.nav_plan_failed_target_index) == int(actor.route_target_index):
      failed_support = None if actor.nav_failed_support_cell is None else tuple(int(value) for value in actor.nav_failed_support_cell)
      if failed_support is not None and failed_support != tuple(int(value) for value in current_support):
        self._reset_nav_failure(actor)
      elif float(actor.nav_failure_retry_s) <= 1e-6:
        self._reset_nav_failure(actor)
      else:
        local_recovery_target = self._cached_local_recovery_target(
          actor,
          current_support=tuple(int(value) for value in current_support),
          desired_target=desired_target,
          target_support=None if target_support is None else tuple(int(value) for value in target_support),
        )
        return fallback_route_target(tuple(int(value) for value in current_support), local_recovery_target)
    normalized_target_support = None if target_support is None else tuple(int(value) for value in target_support)
    goal_changed = bool(actor.nav_goal_support_cell != normalized_target_support and (actor.nav_goal_support_cell is not None or normalized_target_support is not None))
    if bool(goal_changed):
      if bool(actor.nav_plan_pending):
        self._cancel_pending_nav_plan(actor)
      self._clear_nav_plan(actor)
      self._reset_nav_failure(actor)
    cached_step_active = bool(self._sync_cached_nav_step(actor, current_support=tuple(int(value) for value in current_support)))
    cached_next_cell = None if actor.nav_next_support_cell is None else tuple(int(value) for value in actor.nav_next_support_cell)
    cached_place_anchor = None if actor.nav_place_anchor_cell is None else tuple(int(value) for value in actor.nav_place_anchor_cell)
    cached_place_target = None if actor.nav_place_target_cell is None else tuple(int(value) for value in actor.nav_place_target_cell)
    if bool(cached_step_active) and cached_next_cell is not None:
      placement_invalid = bool(
        cached_place_target is not None
        and (cached_place_anchor is None or (not bool(self._can_place_support_block(actor, anchor_cell=cached_place_anchor, target_cell=cached_place_target, ignore_cooldown=True))))
      )
      waiting_for_placement = bool(cached_place_target is not None and (not bool(placement_invalid)) and float(actor.place_cooldown_s) > 1e-6)
      if bool(waiting_for_placement):
        actor.route_stuck_s = 0.0
        actor.nav_step_stuck_s = 0.0
      step_distance = float(_point_distance_xz(actor.player.position, _support_cell_center(tuple(int(value) for value in cached_next_cell))))
      if actor.nav_step_progress_cell != tuple(int(value) for value in cached_next_cell):
        actor.nav_step_progress_cell = tuple(int(value) for value in cached_next_cell)
        actor.nav_step_best_distance = float(step_distance)
        actor.nav_step_stuck_s = 0.0
      elif bool(actor.player.on_ground) and (not bool(waiting_for_placement)):
        if float(step_distance) + float(_AI_NAV_STEP_PROGRESS_EPS) < float(actor.nav_step_best_distance):
          actor.nav_step_best_distance = float(step_distance)
          actor.nav_step_stuck_s = 0.0
        elif float(step_distance) > float(_AI_ROUTE_REACHED_EPS) + 0.05:
          actor.nav_step_stuck_s += max(0.0, float(dt))
      next_step_invalid = bool(cached_next_cell is not None and cached_next_cell != cached_place_target and (not bool(self._standable_support_cell(actor, cached_next_cell))))
      source_support_invalid = bool(actor.nav_from_support_cell is not None and tuple(int(value) for value in actor.nav_from_support_cell) != tuple(int(value) for value in current_support))
      stuck_now = bool((not bool(waiting_for_placement)) and (float(actor.nav_step_stuck_s) >= float(_AI_NAV_STEP_STUCK_TIMEOUT_S) or float(actor.route_stuck_s) >= float(_AI_STUCK_GOAL_TIMEOUT_S)))
      if bool(placement_invalid or next_step_invalid or source_support_invalid or stuck_now):
        actor.nav_blocked_edges[(tuple(int(value) for value in current_support), tuple(int(value) for value in cached_next_cell))] = float(_AI_BLOCKED_EDGE_COOLDOWN_S)
        remember_avoid_support_cell(actor, tuple(int(value) for value in cached_next_cell))
        self._clear_nav_plan(actor)
        actor.nav_replan_cooldown_s = float(_AI_FLEX_REPLAN_STUCK_INTERVAL_S)
      else:
        self._reset_nav_failure(actor)
        return _navigation_transition_target(tuple(int(value) for value in current_support), tuple(int(value) for value in cached_next_cell))
    else:
      self._clear_active_nav_step(actor)
    if (
      target_support is not None
      and (not bool(actor.nav_plan_pending))
      and float(actor.nav_replan_cooldown_s) <= 1e-6
      and bool(self._direct_route_clear(actor, from_cell=start_support, to_cell=target_support))
    ):
      actor.nav_next_support_cell = None
      actor.nav_from_support_cell = None
      actor.nav_place_anchor_cell = None
      actor.nav_place_target_cell = None
      actor.nav_plan_steps = ()
      actor.nav_plan_index = 0
      actor.nav_plan_start_support_cell = None
      actor.nav_goal_support_cell = tuple(int(value) for value in target_support)
      self._reset_nav_failure(actor)
      actor.nav_jump_required = False
      actor.nav_jump_span = 1
      actor.nav_step_progress_cell = None
      actor.nav_step_best_distance = 1e9
      actor.nav_step_stuck_s = 0.0
      actor.stuck_support_cell = tuple(int(value) for value in current_support)
      actor.stuck_support_time_s = 0.0
      actor.stuck_jump_retries = 0
      return desired_target
    should_attempt_local_recovery = bool(len(active_avoid_support_cells(actor)) > 0 or float(actor.route_stuck_s) > 1e-6 or bool(actor.nav_path_failed))
    if bool(actor.nav_plan_pending):
      local_recovery_target = (
        self._cached_local_recovery_target(actor, current_support=tuple(int(value) for value in current_support), desired_target=desired_target, target_support=normalized_target_support)
        if bool(should_attempt_local_recovery)
        else None
      )
      return fallback_route_target(tuple(int(value) for value in current_support), local_recovery_target)
    if float(actor.nav_replan_cooldown_s) > 1e-6:
      local_recovery_target = (
        self._cached_local_recovery_target(actor, current_support=tuple(int(value) for value in current_support), desired_target=desired_target, target_support=normalized_target_support)
        if bool(should_attempt_local_recovery)
        else None
      )
      return fallback_route_target(tuple(int(value) for value in current_support), local_recovery_target)
    actor.nav_goal_support_cell = None if normalized_target_support is None else tuple(int(value) for value in normalized_target_support)
    self._request_route_plan(actor, start_support=tuple(int(value) for value in current_support))
    local_recovery_target = (
      self._cached_local_recovery_target(actor, current_support=tuple(int(value) for value in current_support), desired_target=desired_target, target_support=normalized_target_support)
      if bool(should_attempt_local_recovery)
      else None
    )
    return fallback_route_target(tuple(int(value) for value in current_support), local_recovery_target)

  def _update_stuck_recovery_state(self, actor: _AiPlayerRuntime, *, dt: float, jump_started: bool) -> None:
    if normalize_ai_route_style(actor.route_style) != AI_ROUTE_STYLE_FLEXIBLE or normalize_ai_mode(actor.mode) != AI_MODE_ROUTE or (not bool(actor.player.on_ground)):
      actor.stuck_support_cell = None
      actor.stuck_support_time_s = 0.0
      actor.stuck_jump_retries = 0
      return
    current_support = self._current_support_cell(actor)
    if current_support is None:
      actor.stuck_support_cell = None
      actor.stuck_support_time_s = 0.0
      actor.stuck_jump_retries = 0
      return
    if actor.stuck_support_cell is not None and tuple(int(value) for value in actor.stuck_support_cell) == tuple(int(value) for value in current_support):
      actor.stuck_support_time_s += max(0.0, float(dt))
    else:
      actor.stuck_support_cell = tuple(int(value) for value in current_support)
      actor.stuck_support_time_s = 0.0
      actor.stuck_jump_retries = 0
    next_cell = None if actor.nav_next_support_cell is None else tuple(int(value) for value in actor.nav_next_support_cell)
    if bool(jump_started) and next_cell is not None:
      span = max(abs(int(next_cell[0]) - int(current_support[0])), abs(int(next_cell[2]) - int(current_support[2])))
      if int(next_cell[1]) > int(current_support[1]) or int(span) > 1:
        actor.stuck_jump_retries += 1
    if actor.nav_next_support_cell is None:
      return
    if actor.nav_place_target_cell is not None and actor.nav_place_anchor_cell is not None:
      anchor_cell = tuple(int(value) for value in actor.nav_place_anchor_cell)
      target_cell = tuple(int(value) for value in actor.nav_place_target_cell)
      if bool(self._can_place_support_block(actor, anchor_cell=anchor_cell, target_cell=target_cell, ignore_cooldown=True)):
        actor.stuck_support_time_s = 0.0
        actor.stuck_jump_retries = 0
        return
    same_spot_stuck = bool(float(actor.stuck_support_time_s) >= float(_AI_STUCK_RECOVERY_SUPPORT_S) and int(actor.stuck_jump_retries) >= int(_AI_STUCK_JUMP_RETRIES))
    no_progress_stuck = bool(float(actor.route_stuck_s) >= float(_AI_STUCK_GOAL_TIMEOUT_S))
    if (not bool(same_spot_stuck)) and (not bool(no_progress_stuck)):
      return
    current_edge = stuck_edge_key(current_support, actor.nav_next_support_cell)
    actor.nav_blocked_edges[current_edge] = float(_AI_BLOCKED_EDGE_COOLDOWN_S)
    remember_avoid_support_cell(actor, tuple(int(value) for value in actor.nav_next_support_cell))
    actor.nav_replan_cooldown_s = float(_AI_FLEX_REPLAN_STUCK_INTERVAL_S)
    actor.route_stuck_s = max(float(actor.route_stuck_s), float(_AI_ROUTE_STUCK_TIMEOUT_S))
    actor.nav_next_support_cell = None
    actor.nav_from_support_cell = None
    actor.nav_place_anchor_cell = None
    actor.nav_place_target_cell = None
    actor.nav_path_failed = False
    actor.nav_jump_required = False
    actor.nav_jump_span = 1
    actor.stuck_jump_retries = 0

  def _route_combat_target(self, actor: _AiPlayerRuntime, *, target_player: PlayerEntity | None, allow_pvp: bool) -> Vec3 | None:
    if target_player is None or (not bool(allow_pvp)) or (not target_player.alive()):
      return None
    if normalize_ai_personality(actor.personality) != AI_PERSONALITY_AGGRESSIVE:
      return None
    player_delta = target_player.position - actor.player.position
    if float(player_delta.length()) > float(_AI_ROUTE_ENGAGE_RANGE):
      return None
    target = Vec3(float(target_player.position.x), float(target_player.position.y) + 1.0, float(target_player.position.z))
    if not bool(self._can_see_point(actor, target)):
      return None
    return target

  def _placement_ray_clear(self, actor: _AiPlayerRuntime, *, anchor_cell: tuple[int, int, int], face: int) -> bool:
    """
    AI の eye position から placement の anchor face 上の照準点までの視線 ray が、空気以外の block に遮られていないかを判定する。
    照準点は _face_hit_point() が返す face 中央であり、ray は picking 実装(block model の pick 形状を含む DDA)で評価する。
    ray が何にも当たらない場合と、最初の hit が anchor cell 自身又は照準点距離以遠の場合は可視として真を返す。
    途中に別の block model 又は collision 形状が存在する場合は偽を返し、呼び出し側は placement を中止する。これにより視界の先が block で覆われた状態での貫通設置を禁止する。
    """
    target = _face_hit_point(tuple(int(value) for value in anchor_cell), int(face))
    eye = actor.player.eye_pos()
    delta = target - eye
    distance = float(delta.length())
    if float(distance) <= 1e-6:
      return True
    direction = delta.normalized()
    hit = actor.interaction.pick_block(reach=float(distance) + 0.5, origin=eye, direction=direction)
    if hit is None:
      return True
    if tuple(int(value) for value in hit.hit) == tuple(int(value) for value in anchor_cell):
      return True
    return float(hit.t) >= float(distance) - float(_AI_PLACEMENT_LOS_EPS)

  def _place_adjacent_block(self, actor: _AiPlayerRuntime, *, anchor_cell: tuple[int, int, int], step_x: int, step_z: int) -> bool:
    if actor.held_item_id is None:
      return False
    if self._state_at(int(anchor_cell[0]), int(anchor_cell[1]), int(anchor_cell[2])) is None:
      return False
    place_cell = (int(anchor_cell[0]) + int(step_x), int(anchor_cell[1]), int(anchor_cell[2]) + int(step_z))
    if self._state_at(int(place_cell[0]), int(place_cell[1]), int(place_cell[2])) is not None:
      return False
    if not self._placement_ray_clear(actor, anchor_cell=tuple(int(value) for value in anchor_cell), face=int(_face_for_horizontal_step(int(step_x), int(step_z)))):
      return False
    hit = BlockPick(
      hit=tuple(int(value) for value in anchor_cell),
      place=tuple(int(value) for value in place_cell),
      t=0.0,
      face=int(_face_for_horizontal_step(int(step_x), int(step_z))),
      hit_point=_face_hit_point(tuple(int(value) for value in anchor_cell), int(_face_for_horizontal_step(int(step_x), int(step_z)))),
    )
    outcome = actor.interaction.place_block_from_hit(hit, str(actor.held_item_id))
    if not bool(outcome.success):
      return False
    actor.place_cooldown_s = float(_AI_PLACE_COOLDOWN_S)
    return True

  def _place_block_on_support(self, actor: _AiPlayerRuntime, *, support_cell: tuple[int, int, int]) -> bool:
    if actor.held_item_id is None or (not bool(self._cell_has_full_top_support(tuple(int(value) for value in support_cell)))):
      return False
    place_cell = (int(support_cell[0]), int(support_cell[1]) + 1, int(support_cell[2]))
    if self._state_at(int(place_cell[0]), int(place_cell[1]), int(place_cell[2])) is not None:
      return False
    if not self._placement_ray_clear(actor, anchor_cell=tuple(int(value) for value in support_cell), face=int(FACE_POS_Y)):
      return False
    hit = BlockPick(
      hit=tuple(int(value) for value in support_cell),
      place=tuple(int(value) for value in place_cell),
      t=0.0,
      face=int(FACE_POS_Y),
      hit_point=_face_hit_point(tuple(int(value) for value in support_cell), int(FACE_POS_Y)),
    )
    outcome = actor.interaction.place_block_from_hit(hit, str(actor.held_item_id))
    if not bool(outcome.success):
      return False
    actor.place_cooldown_s = float(_AI_PLACE_COOLDOWN_S)
    return True

  def _maybe_place_bridge(self, actor: _AiPlayerRuntime, *, target_player: PlayerEntity | None) -> bool:
    if actor.held_item_id is None or (not bool(actor.player.on_ground)):
      return False
    if target_player is not None and float((target_player.position - actor.player.position).length()) <= float(_AI_BRIDGE_COMBAT_DISABLE_RANGE):
      return False
    support_cell = self._current_support_cell(actor)
    if support_cell is None:
      return False
    if not bool(self._cell_has_full_top_support(tuple(int(value) for value in support_cell))):
      return False
    forward = actor.player.view_forward()
    facing = cardinal_from_xz(float(forward.x), float(forward.z), default="south")
    step_x_f, step_z_f = facing_vec_xz(str(facing))
    step_x = int(step_x_f)
    step_z = int(step_z_f)
    frontier_cell = (int(support_cell[0]) + int(step_x), int(support_cell[1]), int(support_cell[2]) + int(step_z))
    gap_ahead = not bool(self._cell_has_full_top_support(tuple(int(value) for value in frontier_cell)))
    if bool(gap_ahead) and self._place_adjacent_block(actor, anchor_cell=tuple(int(value) for value in support_cell), step_x=int(step_x), step_z=int(step_z)):
      return True
    if target_player is None or (not bool(actor.wander_sprint)):
      return False
    if float((target_player.position - actor.player.position).length()) < 5.0:
      return False
    if not bool(self._cell_has_full_top_support(tuple(int(value) for value in frontier_cell))):
      return False
    side_x, side_z = _side_step_from_forward(int(step_x), int(step_z), side_sign=int(actor.bridge_side_sign))
    if self._place_adjacent_block(actor, anchor_cell=tuple(int(value) for value in frontier_cell), step_x=int(side_x), step_z=int(side_z)):
      actor.bridge_side_sign *= -1
      return True
    return False

  def _maybe_place_kb_reduction_block(self, actor: _AiPlayerRuntime) -> bool:
    if actor.held_item_id is None or (not bool(actor.can_place_blocks)) or float(actor.player.jump_reset_window_s) <= 1e-6:
      return False
    support_cell = self._current_support_cell(actor)
    if support_cell is None:
      return False
    if not bool(self._cell_has_full_top_support(tuple(int(value) for value in support_cell))):
      return False
    velocity_x = float(actor.player.velocity.x)
    velocity_z = float(actor.player.velocity.z)
    if max(abs(float(velocity_x)), abs(float(velocity_z))) <= 1.0:
      return False
    if abs(float(velocity_x)) >= abs(float(velocity_z)):
      primary = (1 if float(velocity_x) > 0.0 else -1, 0)
      secondary = (0, 1 if float(velocity_z) > 0.0 else -1) if abs(float(velocity_z)) > 1e-6 else None
    else:
      primary = (0, 1 if float(velocity_z) > 0.0 else -1)
      secondary = (1 if float(velocity_x) > 0.0 else -1, 0) if abs(float(velocity_x)) > 1e-6 else None
    candidates = [primary]
    if secondary is not None:
      candidates.append(secondary)
    for step_x, step_z in candidates:
      target_cell = (int(support_cell[0]) + int(step_x), int(support_cell[1]), int(support_cell[2]) + int(step_z))
      if bool(self._cell_has_full_top_support(tuple(int(value) for value in target_cell))):
        continue
      if bool(self._place_adjacent_block(actor, anchor_cell=tuple(int(value) for value in support_cell), step_x=int(step_x), step_z=int(step_z))):
        return True
    return False

  def _maybe_place_defensive_block(self, actor: _AiPlayerRuntime, *, target_player: PlayerEntity | None) -> bool:
    if actor.held_item_id is None or target_player is None:
      return False
    if bool(self._maybe_place_kb_reduction_block(actor)):
      return True
    if float(actor.player.jump_reset_window_s) <= 1e-6:
      return False
    if float((target_player.position - actor.player.position).length()) > float(_AI_CLOSE_DEFENSE_RANGE):
      return False
    forward = actor.player.view_forward()
    facing = cardinal_from_xz(float(forward.x), float(forward.z), default="south")
    step_x_f, step_z_f = facing_vec_xz(str(facing))
    support_cell = self._current_support_cell(actor)
    if support_cell is None:
      return False
    wall_support_cell = (int(support_cell[0]) + int(step_x_f), int(support_cell[1]), int(support_cell[2]) + int(step_z_f))
    return bool(self._place_block_on_support(actor, support_cell=tuple(int(value) for value in wall_support_cell)))

  def _wander_control(self, actor: _AiPlayerRuntime, *, dt: float, target_player: PlayerEntity | None, allow_pvp: bool) -> PlayerStepInput:
    if target_player is not None and bool(allow_pvp) and normalize_ai_personality(actor.personality) == AI_PERSONALITY_AGGRESSIVE:
      player_delta = target_player.position - actor.player.position
      chase_distance = float(player_delta.length())
      if chase_distance <= float(_AI_CHASE_RANGE):
        target = Vec3(float(target_player.position.x), float(target_player.position.y) + 1.0, float(target_player.position.z))
        jump_pressed = bool(actor.player.on_ground) and (
          float(target_player.position.y) > float(actor.player.position.y) + 0.55 or (float(actor.player.jump_reset_window_s) > 1e-6 and float(chase_distance) <= 3.4)
        )
        chase_control = _combat_control(actor=actor, target=target, dt=float(dt), jump_pressed=bool(jump_pressed))
        guarded_control, _blocked = self._apply_edge_safety(actor, chase_control, max_drop=int(_AI_EDGE_SAFE_DROP_DEPTH))
        return guarded_control
    self._update_wander_state(actor, dt=float(dt))
    heading_rad = math.radians(float(actor.wander_heading_deg))
    target = Vec3(float(actor.player.position.x) - math.sin(float(heading_rad)) * 3.0, float(actor.player.position.y) + 1.0, float(actor.player.position.z) + math.cos(float(heading_rad)) * 3.0)
    control = _pursuit_control(player=actor.player, target=target, dt=float(dt), sprint=bool(actor.wander_sprint), auto_jump_enabled=True, jump_pressed=False, crouch=False)
    wander_control = PlayerStepInput(
      move_f=float(control.move_f) * float(actor.wander_forward),
      move_s=float(control.move_s) * float(actor.wander_forward),
      jump_held=bool(control.jump_held),
      jump_pressed=bool(control.jump_pressed),
      sprint=bool(control.sprint),
      crouch=bool(control.crouch),
      yaw_delta_deg=float(control.yaw_delta_deg),
      pitch_delta_deg=float(control.pitch_delta_deg),
      auto_jump_enabled=bool(control.auto_jump_enabled),
    )
    guarded_control, blocked = self._apply_edge_safety(actor, wander_control, max_drop=int(_AI_EDGE_SAFE_DROP_DEPTH))
    if bool(blocked):
      bridging_capable = bool(actor.can_place_blocks and actor.held_item_id is not None and actor.player.on_ground)
      if not bool(bridging_capable):
        turn_seed = (_wander_seed(actor.actor_id) + int(actor.player.position.x * 13.0) + int(actor.player.position.z * 7.0)) & 0x7FFFFFFF
        actor.wander_heading_deg = float((float(actor.wander_heading_deg) + 120.0 + float(turn_seed % 120)) % 360.0)
        actor.decision_timer_s = max(float(actor.decision_timer_s), 0.35)
        actor.wander_forward = 1.0
      else:
        actor.decision_timer_s = max(float(actor.decision_timer_s), 0.30)
    return guarded_control

  def _maybe_interact_or_place(self, actor: _AiPlayerRuntime, *, target_player: PlayerEntity | None) -> None:
    actor.interact_cooldown_s = max(0.0, float(actor.interact_cooldown_s))
    actor.place_cooldown_s = max(0.0, float(actor.place_cooldown_s))
    if actor.nav_place_anchor_cell is not None and actor.nav_place_target_cell is not None:
      anchor_cell = tuple(int(value) for value in actor.nav_place_anchor_cell)
      target_cell = tuple(int(value) for value in actor.nav_place_target_cell)
      step_x = int(target_cell[0]) - int(anchor_cell[0])
      step_z = int(target_cell[2]) - int(anchor_cell[2])
      if abs(int(step_x)) + abs(int(step_z)) == 1 and bool(self._can_place_support_block(actor, anchor_cell=anchor_cell, target_cell=target_cell)):
        if bool(self._place_adjacent_block(actor, anchor_cell=anchor_cell, step_x=int(step_x), step_z=int(step_z))):
          actor.nav_place_anchor_cell = None
          actor.nav_place_target_cell = None
          return
    forward = actor.player.view_forward()
    eye = actor.player.eye_pos()
    hit = actor.interaction.pick_block(reach=2.2, origin=eye, direction=forward)
    if hit is not None and float(actor.interact_cooldown_s) <= 1e-6:
      outcome = actor.interaction.interact_block_at_hit(tuple(int(value) for value in hit.hit))
      if bool(outcome.success):
        actor.interact_cooldown_s = float(_AI_INTERACT_COOLDOWN_S)
        return
    if actor.held_item_id is None or float(actor.place_cooldown_s) > 1e-6:
      return
    if bool(self._maybe_place_bridge(actor, target_player=target_player)):
      return
    if bool(self._maybe_place_defensive_block(actor, target_player=target_player)):
      return

  def _maybe_attack_player(self, actor: _AiPlayerRuntime, *, target_player: PlayerEntity | None, allow_pvp: bool) -> AiStepReport:
    if target_player is None or (not bool(allow_pvp)) or (not target_player.alive()):
      return AiStepReport()
    if normalize_ai_mode(actor.mode) == AI_MODE_IDLE:
      return AiStepReport()
    if normalize_ai_personality(actor.personality) != AI_PERSONALITY_AGGRESSIVE:
      return AiStepReport()
    if float(actor.attack_cooldown_s) > 1e-6:
      return AiStepReport()
    forward = actor.player.view_forward()
    eye = actor.player.eye_pos()
    world_hit = actor.interaction.pick_block(reach=float(MELEE_ATTACK_REACH_BLOCKS), origin=eye, direction=forward)
    target_hit = pick_player_target(origin=eye, direction=forward, reach=float(MELEE_ATTACK_REACH_BLOCKS), block_hit=world_hit, candidates=(("player", target_player),))
    if target_hit is None:
      return AiStepReport()
    sprinting = attack_sprinting(attacker=actor.player, walk_speed=float(self.settings.movement.walk_speed))
    damage_taken = apply_melee_damage(attacker=actor.player, target=target_player, attack_direction=forward, sprinting=bool(sprinting), damage=float(MELEE_ATTACK_DAMAGE))
    if damage_taken <= 1e-6:
      return AiStepReport()
    self._trigger_attack_swing(actor)
    actor.attack_cooldown_s = float(_AI_ATTACK_COOLDOWN_S)
    actor.combat_w_tap_s = float(_AI_COMBAT_W_TAP_S)
    actor.combat_strafe_timer_s = float(_AI_COMBAT_STRAFE_WINDOW_S if float((target_player.position - actor.player.position).length()) <= float(_AI_COMBAT_STRAFE_DISTANCE_MAX) else 0.0)
    actor.combat_strafe_sign = -1 if float(actor.player.hurt_tilt_sign) < 0.0 else 1
    death_reason = "pvp" if not target_player.alive() else None
    killer_name = str(actor.name) if death_reason is not None else None
    return AiStepReport(player_damage_taken=float(damage_taken), player_death_reason=death_reason, player_killer_name=killer_name)

  def player_attack_from_local(self, *, attacker: PlayerEntity, origin: Vec3, direction: Vec3, reach: float, world_hit: BlockPick | None, sprinting: bool) -> AiLocalAttackResult:
    target_hit = pick_player_target(
      origin=origin, direction=direction, reach=float(reach), block_hit=world_hit, candidates=tuple((str(actor.actor_id), actor.player) for actor in self._actors.values())
    )
    if target_hit is None:
      return AiLocalAttackResult()
    actor = self._actors.get(str(target_hit.actor_id))
    if actor is None:
      return AiLocalAttackResult()
    damage_taken = apply_melee_damage(attacker=attacker, target=actor.player, attack_direction=direction, sprinting=bool(sprinting), damage=float(MELEE_ATTACK_DAMAGE))
    if float(damage_taken) <= 1e-6:
      return AiLocalAttackResult()
    self._note_ai_damage(actor)
    actor.attack_cooldown_s = max(float(actor.attack_cooldown_s), float(MELEE_DAMAGE_COOLDOWN_S) * 0.5)
    if bool(actor.nav_plan_pending):
      self._cancel_pending_nav_plan(actor)
    return AiLocalAttackResult(success=True, target_position=self._damage_sound_position(actor.player))

  def step(self, *, dt: float, target_player: PlayerEntity | None, allow_pvp: bool, paused_actor_ids: tuple[str, ...] = ()) -> AiStepReport:
    self._drain_completed_route_plans()
    self._route_requests_this_step = 0
    self._recovery_searches_this_step = 0
    total_player_damage = 0.0
    player_death_reason: str | None = None
    player_killer_name: str | None = None
    damage_sound_positions: list[tuple[float, float, float]] = []
    removed_actor_ids: list[str] = []
    paused_ids = {str(actor_id) for actor_id in paused_actor_ids}
    for actor in self._actors.values():
      if str(actor.actor_id) in paused_ids:
        actor.player.velocity = Vec3(0.0, 0.0, 0.0)
        actor.motion.walk_phase_rad = 0.0
        actor.motion.walk_phase_total_rad = 0.0
        actor.motion.airborne_start_y = None
        continue
      self._advance_attack_swing(actor, dt=float(dt))
      actor.attack_cooldown_s = max(0.0, float(actor.attack_cooldown_s) - max(0.0, float(dt)))
      actor.place_cooldown_s = max(0.0, float(actor.place_cooldown_s) - max(0.0, float(dt)))
      actor.interact_cooldown_s = max(0.0, float(actor.interact_cooldown_s) - max(0.0, float(dt)))
      actor.combat_w_tap_s = max(0.0, float(actor.combat_w_tap_s) - max(0.0, float(dt)))
      actor.combat_strafe_timer_s = max(0.0, float(actor.combat_strafe_timer_s) - max(0.0, float(dt)))
      mode = normalize_ai_mode(actor.mode)
      if mode == AI_MODE_ROUTE:
        control = self._route_control(actor, dt=float(dt), target_player=target_player, allow_pvp=bool(allow_pvp))
      elif mode == AI_MODE_WANDER:
        control = self._wander_control(actor, dt=float(dt), target_player=target_player, allow_pvp=bool(allow_pvp))
      else:
        control = idle_control()
      step_result = advance_runtime_player(player=actor.player, world=self.world, block_registry=self.block_registry, settings=self.settings, motion=actor.motion, dt=float(dt), control=control)
      self._update_stuck_recovery_state(actor, dt=float(dt), jump_started=bool(step_result.jump_started))
      fall_damage = actor.player.apply_damage(fall_damage_amount(fall_distance_blocks=step_result.fall_distance_blocks), bypass_cooldown=True)
      void_damage, actor.void_damage_timer_s = apply_void_damage(player=actor.player, dt=float(dt), timer_s=float(actor.void_damage_timer_s))
      if float(fall_damage) > 1e-6 or float(void_damage) > 1e-6:
        self._note_ai_damage(actor)
        damage_sound_positions.append(self._damage_sound_position(actor.player))
      self._advance_ai_regeneration(actor, dt=float(dt))
      if mode != AI_MODE_IDLE:
        self._maybe_interact_or_place(actor, target_player=target_player)
        attack_report = self._maybe_attack_player(actor, target_player=target_player, allow_pvp=bool(allow_pvp))
        total_player_damage += float(attack_report.player_damage_taken)
        if attack_report.player_death_reason is not None:
          player_death_reason = str(attack_report.player_death_reason)
          player_killer_name = None if attack_report.player_killer_name is None else str(attack_report.player_killer_name)
      if not actor.player.alive():
        removed_actor_ids.append(str(actor.actor_id))
    for actor_id in removed_actor_ids:
      actor = self._actors.pop(str(actor_id), None)
      if actor is not None:
        self._cancel_pending_nav_plan(actor)
    return AiStepReport(
      player_damage_taken=float(total_player_damage), player_death_reason=player_death_reason, player_killer_name=player_killer_name, damage_sound_positions=tuple(damage_sound_positions)
    )

  def actor_observations(self) -> tuple[AiActorObservation, ...]:
    return tuple(
      AiActorObservation(
        player=actor.player,
        motion=actor.motion,
        held_item_id=None if actor.held_item_id is None else str(actor.held_item_id),
        attack_swing_progress=float(actor.attack_swing_progress),
        attack_prev_swing_progress=float(actor.attack_prev_swing_progress),
        actor_id=str(actor.actor_id),
        name=str(actor.name),
        health=float(actor.player.health),
        max_health=float(actor.player.max_health),
        health_indicator=str(actor.health_indicator),
        skin_mode=str(actor.skin_mode),
        skin_id=str(actor.skin_id),
      )
      for actor in self._actors.values()
    )
