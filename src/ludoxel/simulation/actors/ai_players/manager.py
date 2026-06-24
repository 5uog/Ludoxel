# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import os
import time
from collections import deque
from dataclasses import dataclass, field

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.voxels.faces import FACE_POS_Y
from ludoxel.simulation.actors.ai_players.avoidance import active_avoid_support_cells, decay_avoid_support_cells, remember_avoid_support_cell
from ludoxel.simulation.actors.ai_players.combat import _combat_control
from ludoxel.simulation.actors.ai_players.idle import idle_control
from ludoxel.simulation.actors.ai_players.learning.action_mask import AiActionMask, build_action_mask
from ludoxel.simulation.actors.ai_players.learning.coordinator import ACTION_SOURCE_DETERMINISTIC, ACTION_SOURCE_LEARNED_POLICY, LearningCoordinator
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import encode_features
from ludoxel.simulation.actors.ai_players.learning.observation import DIRECTION_OFFSETS, AiObservation, build_neighborhood
from ludoxel.simulation.actors.ai_players.learning.rewards import RewardTransition
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
  _AI_PLACEMENT_FACING_MIN_DOT,
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
  AiBlockSoundEvent,
  AiDeathLogEvent,
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
from ludoxel.simulation.rules.interaction.outcomes import InteractionOutcome
from ludoxel.simulation.rules.interaction.service import InteractionService
from ludoxel.simulation.rules.picking.block import BlockPick
from ludoxel.simulation.worlds.config.session import SessionSettings
from ludoxel.simulation.worlds.state.world import WorldState


def _ai_decision_debug_enabled() -> bool:
  return str(os.environ.get("LUDOXEL_AI_DEBUG", "")).strip().lower() in ("1", "true", "yes", "on")


class _ManagerNeighborhoodProbe:
  def __init__(self, manager: "AiPlayerManager", actor: _AiPlayerRuntime, *, max_drop: int) -> None:
    self._manager = manager
    self._actor = actor
    self._max_drop = int(max_drop)

  def standable(self, cell: tuple[int, int, int]) -> bool:
    return bool(self._manager._standable_support_cell(self._actor, tuple(int(value) for value in cell)))

  def headroom_clear(self, cell: tuple[int, int, int]) -> bool:
    return bool(self._manager._nav_headroom_clear(tuple(int(value) for value in cell)))

  def passable(self, cell: tuple[int, int, int]) -> bool:
    return bool(self._manager._nav_cell_empty(tuple(int(value) for value in cell)))

  def block_state(self, cell: tuple[int, int, int]) -> str | None:
    return self._manager._state_at(int(cell[0]), int(cell[1]), int(cell[2]))

  def can_place_against(self, anchor_cell: tuple[int, int, int], target_cell: tuple[int, int, int]) -> bool:
    return bool(
      self._manager._can_place_support_block(self._actor, anchor_cell=tuple(int(value) for value in anchor_cell), target_cell=tuple(int(value) for value in target_cell), ignore_cooldown=True)
    )

  def support_drop_depth(self, column_cell: tuple[int, int, int], max_depth: int) -> int:
    x, y, z = (int(column_cell[0]), int(column_cell[1]), int(column_cell[2]))
    for depth in range(0, int(max_depth) + 1):
      if bool(self._manager._cell_has_full_top_support((int(x), int(y) - int(depth), int(z)))):
        return int(depth)
    return -1


@dataclass
class AiPlayerManager:
  world: WorldState
  block_registry: BlockRegistry
  settings: SessionSettings
  warm_route_worker: bool = True

  _actors: dict[str, _AiPlayerRuntime] = field(default_factory=dict, init=False, repr=False)
  _next_actor_index: int = field(default=1, init=False, repr=False)
  _route_worker: AiRouteWorker = field(default_factory=AiRouteWorker, init=False, repr=False)
  _route_plan_generation: int = field(default=0, init=False, repr=False)
  _full_snapshot_revision: int = field(default=-1, init=False, repr=False)
  _full_snapshot_blocks: tuple[tuple[int, int, int, str], ...] = field(default=(), init=False, repr=False)
  _route_requests_this_step: int = field(default=0, init=False, repr=False)
  _recovery_searches_this_step: int = field(default=0, init=False, repr=False)
  _block_sound_events: list[AiBlockSoundEvent] = field(default_factory=list, init=False, repr=False)

  def __post_init__(self) -> None:
    if bool(self.warm_route_worker):
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
    resolved_name = str(actor.name)
    if requested_name and requested_name != str(actor.name):
      if self.ai_name_error(actor_id=str(actor.actor_id), name=requested_name) is not None:
        return False
      resolved_name = str(requested_name)

    next_mode = normalize_ai_mode(normalized.mode)
    next_can_place_blocks = bool(normalized.can_place_blocks)
    next_route_points = tuple(normalized.route_points)
    next_route_closed = bool(normalized.route_closed)
    next_route_run = bool(normalized.route_run)
    next_route_style = normalize_ai_route_style(normalized.route_style)
    nav_affecting_changed = bool(
      next_mode != str(actor.mode)
      or next_can_place_blocks != bool(actor.can_place_blocks)
      or next_route_points != tuple(actor.route_points)
      or next_route_closed != bool(actor.route_closed)
      or next_route_run != bool(actor.route_run)
      or next_route_style != str(actor.route_style)
    )

    next_regen_enabled = bool(normalized.auto_regen_enabled)
    next_regen_start_delay_s = float(normalized.regen_start_delay_s)
    next_regen_interval_s = float(normalized.regen_interval_s)
    next_regen_amount_hp = float(normalized.regen_amount_hp)
    next_regen_cap_hp = float(normalized.regen_cap_hp)
    regen_changed = bool(
      next_regen_enabled != bool(actor.auto_regen_enabled)
      or next_regen_start_delay_s != float(actor.regen_start_delay_s)
      or next_regen_interval_s != float(actor.regen_interval_s)
      or next_regen_amount_hp != float(actor.regen_amount_hp)
      or next_regen_cap_hp != float(actor.regen_cap_hp)
    )

    actor.name = str(resolved_name)
    actor.mode = next_mode
    actor.personality = normalize_ai_personality(normalized.personality)
    if next_can_place_blocks != bool(actor.can_place_blocks):
      actor.can_place_blocks = next_can_place_blocks
      actor.held_item_id = _held_item_id_for_settings(can_place_blocks=bool(actor.can_place_blocks), held_item_id=actor.held_item_id)
    actor.health_indicator = normalize_ai_health_indicator(normalized.health_indicator)
    actor.skin_mode = normalize_ai_skin_mode(normalized.skin_mode)
    actor.skin_id = str(normalized.skin_id)
    actor.auto_regen_enabled = next_regen_enabled
    actor.regen_start_delay_s = next_regen_start_delay_s
    actor.regen_interval_s = next_regen_interval_s
    actor.regen_amount_hp = next_regen_amount_hp
    actor.regen_cap_hp = next_regen_cap_hp
    if bool(regen_changed):
      actor.regen_tick_s = 0.0
    actor.route_points = next_route_points
    actor.route_closed = next_route_closed
    actor.route_run = next_route_run
    actor.route_style = next_route_style
    if len(actor.route_points) <= 0:
      actor.route_target_index = 0
    else:
      actor.route_target_index = int(actor.route_target_index) % len(actor.route_points)
    if bool(nav_affecting_changed):
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

  def _record_block_sound(self, outcome: InteractionOutcome) -> None:
    if not bool(outcome.success):
      return
    if outcome.action is None or outcome.target_block_state is None or outcome.target_position is None:
      return
    self._block_sound_events.append(
      AiBlockSoundEvent(action=str(outcome.action), block_state=str(outcome.target_block_state), position=tuple(int(value) for value in outcome.target_position))
    )

  @staticmethod
  def _death_log_event(actor: _AiPlayerRuntime, *, reason: str, killer_name: str | None = None) -> AiDeathLogEvent:
    actor_name = str(actor.name).strip() or "AI"
    return AiDeathLogEvent(actor_id=str(actor.actor_id), actor_name=str(actor_name), reason=str(reason), killer_name=None if killer_name is None else str(killer_name))

  @staticmethod
  def _note_ai_damage(actor: _AiPlayerRuntime) -> None:
    actor.regen_wait_s = 0.0
    actor.regen_tick_s = 0.0

  def _advance_ai_regeneration(self, actor: _AiPlayerRuntime, *, dt: float) -> None:
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
    cell = tuple(int(value) for value in _support_cell_from_point(desired_target))
    key = (cell, int(self.world.revision))
    if actor.target_support_cache_key == key:
      return actor.target_support_cache_value
    result = self._nearest_standable_support_cell(actor, cell)
    actor.target_support_cache_key = key
    actor.target_support_cache_value = None if result is None else tuple(int(value) for value in result)
    return actor.target_support_cache_value

  def _revalidate_plan_after_world_change(self, actor: _AiPlayerRuntime) -> None:
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
    target = _face_hit_point(tuple(int(value) for value in anchor_cell), int(face))
    eye = actor.player.eye_pos()
    delta = target - eye
    distance = float(delta.length())
    if float(distance) <= 1e-6:
      return True
    if not self._placement_facing_ok(actor, delta=delta):
      return False
    direction = delta.normalized()
    hit = actor.interaction.pick_block(reach=float(distance) + 0.5, origin=eye, direction=direction)
    if hit is None:
      return True
    if tuple(int(value) for value in hit.hit) == tuple(int(value) for value in anchor_cell):
      return True
    return float(hit.t) >= float(distance) - float(_AI_PLACEMENT_LOS_EPS)

  def _placement_facing_ok(self, actor: _AiPlayerRuntime, *, delta: Vec3) -> bool:
    view_forward = actor.player.view_forward()
    view_xz = Vec3(float(view_forward.x), 0.0, float(view_forward.z))
    target_xz = Vec3(float(delta.x), 0.0, float(delta.z))
    view_len = float(view_xz.length())
    target_len = float(target_xz.length())
    if view_len <= 1e-6 or target_len <= 1e-6:
      return True
    facing_dot = float(view_xz.dot(target_xz)) / (float(view_len) * float(target_len))
    return bool(float(facing_dot) >= float(_AI_PLACEMENT_FACING_MIN_DOT))

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
    self._record_block_sound(outcome)
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
    self._record_block_sound(outcome)
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
        max_health = max(1.0, float(actor.player.max_health))
        low_health = bool(float(actor.player.health) <= float(max_health) * 0.35)
        if bool(low_health) and float(chase_distance) <= float(_AI_COMBAT_STRAFE_DISTANCE_MAX) + 1.5:
          strafe_sign = 1.0 if int(actor.combat_strafe_sign) >= 0 else -1.0
          retreat_control = PlayerStepInput(
            move_f=-1.0,
            move_s=float(strafe_sign) * 0.5,
            jump_held=False,
            jump_pressed=False,
            sprint=False,
            crouch=False,
            yaw_delta_deg=float(chase_control.yaw_delta_deg),
            pitch_delta_deg=float(chase_control.pitch_delta_deg),
            auto_jump_enabled=True,
          )
          guarded_retreat, retreat_blocked = self._apply_edge_safety(actor, retreat_control, max_drop=int(_AI_EDGE_SAFE_DROP_DEPTH))
          if not bool(retreat_blocked):
            return guarded_retreat
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
        self._record_block_sound(outcome)
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
      origin=origin, direction=direction, reach=float(reach), block_hit=world_hit, candidates=tuple((str(actor.actor_id), actor.player) for actor in self._actors.values() if actor.player.alive())
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
    target_position = self._damage_sound_position(actor.player)
    death_log = self._death_log_event(actor, reason="pvp") if not actor.player.alive() else None
    actor.attack_cooldown_s = max(float(actor.attack_cooldown_s), float(MELEE_DAMAGE_COOLDOWN_S) * 0.5)
    if death_log is not None:
      removed_actor = self._actors.pop(str(actor.actor_id), None)
      if removed_actor is not None and bool(removed_actor.nav_plan_pending):
        self._cancel_pending_nav_plan(removed_actor)
    elif bool(actor.nav_plan_pending):
      self._cancel_pending_nav_plan(actor)
    return AiLocalAttackResult(success=True, target_position=target_position, target_death_log=death_log)

  def _fence_gate_operable(self, support_cell: tuple[int, int, int]) -> bool:
    x, y, z = (int(support_cell[0]), int(support_cell[1]), int(support_cell[2]))
    for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
      state = self._state_at(int(x) + int(dx), int(y) + 1, int(z) + int(dz))
      if state is not None and "fence_gate" in str(state):
        return True
    return False

  def _build_observation(self, actor: _AiPlayerRuntime, *, target_player: PlayerEntity | None, allow_pvp: bool) -> AiObservation:
    support = self._current_support_cell(actor)
    if support is None:
      support = _support_cell_beneath(actor.player)
    support = tuple(int(value) for value in support)
    probe = _ManagerNeighborhoodProbe(self, actor, max_drop=int(_AI_EDGE_SAFE_DROP_DEPTH))
    directions = build_neighborhood(probe, support_cell=support, max_drop=int(_AI_EDGE_SAFE_DROP_DEPTH))
    player_pos = actor.player.position
    visible = False
    visible_pos: tuple[float, float, float] | None = None
    player_velocity: tuple[float, float, float] | None = None
    player_health: float | None = None
    distance: float | None = None
    if target_player is not None and bool(allow_pvp) and target_player.alive():
      target_eye = Vec3(float(target_player.position.x), float(target_player.position.y) + 1.0, float(target_player.position.z))
      if bool(self._can_see_point(actor, target_eye)):
        visible = True
        visible_pos = (float(target_player.position.x), float(target_player.position.y), float(target_player.position.z))
        player_velocity = (float(target_player.velocity.x), float(target_player.velocity.y), float(target_player.velocity.z))
        player_health = float(target_player.health)
        distance = float((target_player.position - player_pos).length())
    attack_in_range = bool(visible and distance is not None and float(distance) <= float(MELEE_ATTACK_REACH_BLOCKS))
    can_place = bool(actor.can_place_blocks and actor.held_item_id is not None)
    mode = normalize_ai_mode(actor.mode)
    route_present = bool(mode == AI_MODE_ROUTE and len(actor.route_points) > 0)
    route_blocked = bool(route_present and actor.nav_path_failed)
    route_target_tuple: tuple[float, float, float] | None = None
    if bool(route_present):
      route_point = route_target_point(actor)
      if route_point is not None:
        route_target_tuple = (float(route_point.x), float(route_point.y), float(route_point.z))
    max_health = max(1.0, float(actor.player.max_health))
    low_health = bool(float(actor.player.health) <= float(max_health) * 0.35)
    low_health_in_threat = bool(low_health and attack_in_range)
    hazards = tuple((int(support[0]) + int(dx), int(support[1]), int(support[2]) + int(dz)) for name, dx, dz in DIRECTION_OFFSETS if bool(directions[name].is_void))
    void_present = any(bool(directions[name].is_void) for name in directions)
    forward_vec = actor.player.view_forward()
    facing = cardinal_from_xz(float(forward_vec.x), float(forward_vec.z), default="south")
    facing_step_x, facing_step_z = facing_vec_xz(str(facing))
    forward_body_cell = (int(support[0]) + int(facing_step_x), int(support[1]) + 1, int(support[2]) + int(facing_step_z))
    forward_targets = (forward_body_cell,) if self._state_at(int(forward_body_cell[0]), int(forward_body_cell[1]), int(forward_body_cell[2])) is not None else ()
    last_damage_source = "stuck" if (mode == AI_MODE_ROUTE and float(actor.route_stuck_s) >= float(_AI_ROUTE_STUCK_TIMEOUT_S)) else None
    return AiObservation(
      actor_id=str(actor.actor_id),
      self_position=(float(player_pos.x), float(player_pos.y), float(player_pos.z)),
      self_velocity=(float(actor.player.velocity.x), float(actor.player.velocity.y), float(actor.player.velocity.z)),
      self_yaw_deg=float(actor.player.yaw_deg),
      self_pitch_deg=float(actor.player.pitch_deg),
      health=float(actor.player.health),
      max_health=float(max_health),
      on_ground=bool(actor.player.on_ground),
      jump_available=bool(actor.player.on_ground),
      support_cell=support,
      self_footing_present=bool(self._cell_has_full_top_support(support)),
      fall_risk=0.0,
      void_risk=1.0 if bool(void_present) else 0.0,
      visible_player=bool(visible),
      player_visible_position=visible_pos,
      player_last_known_position=visible_pos,
      player_velocity=player_velocity,
      player_health=player_health,
      distance_to_player=distance,
      attack_in_range=bool(attack_in_range),
      attack_cooldown_ready=bool(float(actor.attack_cooldown_s) <= 1e-6),
      attack_cooldown_remaining_s=float(max(0.0, float(actor.attack_cooldown_s))),
      can_place_blocks=bool(can_place),
      selected_block_id=(None if actor.held_item_id is None else str(actor.held_item_id)),
      available_block_count=(999 if bool(can_place) else 0),
      fence_gate_operable=bool(self._fence_gate_operable(support)),
      nearby_hazards=hazards,
      visible_target_blocks=forward_targets,
      directions=directions,
      route_present=bool(route_present),
      route_blocked=bool(route_blocked),
      route_target=route_target_tuple,
      low_health=bool(low_health),
      low_health_in_threat=bool(low_health_in_threat),
      last_action=(None if actor.learn_last_action is None else str(actor.learn_last_action)),
      last_action_success=None,
      last_damage_source=last_damage_source,
      last_death_reason=None,
    )

  @staticmethod
  def _control_to_action_id(control: PlayerStepInput) -> str:
    move_f = float(control.move_f)
    move_s = float(control.move_s)
    if abs(move_f) < 0.3 and abs(move_s) < 0.3:
      return "jump" if bool(control.jump_pressed) else "no_op"
    forward = bool(move_f > 0.3)
    backward = bool(move_f < -0.3)
    left = bool(move_s < -0.3)
    right = bool(move_s > 0.3)
    if forward and left:
      return "move_forward_left"
    if forward and right:
      return "move_forward_right"
    if backward and left:
      return "move_back_left"
    if backward and right:
      return "move_back_right"
    if forward:
      return "sprint" if bool(control.sprint) else "move_forward"
    if backward:
      return "move_back"
    if left:
      return "move_left"
    if right:
      return "move_right"
    return "no_op"

  def _apply_learned_action(self, actor: _AiPlayerRuntime, control: PlayerStepInput, action_id: str) -> PlayerStepInput:
    aid = str(action_id)
    strafe_sign = 1.0 if int(actor.combat_strafe_sign) >= 0 else -1.0
    move_f = float(control.move_f)
    move_s = float(control.move_s)
    sprint = bool(control.sprint)
    jump_pressed = bool(control.jump_pressed)
    jump_held = bool(control.jump_held)
    if aid == "move_forward":
      move_f = 1.0
      move_s = 0.0
    elif aid == "sprint":
      move_f = 1.0
      move_s = 0.0
      sprint = True
    elif aid == "move_forward_left":
      move_f = 1.0
      move_s = -1.0
    elif aid == "move_forward_right":
      move_f = 1.0
      move_s = 1.0
    elif aid in ("move_back", "backpedal_attack"):
      move_f = -1.0
      move_s = 0.0
      sprint = False
    elif aid == "move_back_left":
      move_f = -1.0
      move_s = -1.0
      sprint = False
    elif aid == "move_back_right":
      move_f = -1.0
      move_s = 1.0
      sprint = False
    elif aid == "strafe_attack":
      move_s = float(strafe_sign) * 0.8
      move_f = min(float(move_f), 0.4)
    elif aid == "move_left":
      move_f = 0.0
      move_s = -1.0
      sprint = False
    elif aid == "move_right":
      move_f = 0.0
      move_s = 1.0
      sprint = False
    elif aid == "parkour_jump":
      move_f = 1.0
      sprint = True
      jump_pressed = True
      jump_held = True
    elif aid == "jump":
      jump_pressed = True
      jump_held = True
    elif aid in ("tower_step", "escape_stack_block"):
      move_f = 0.0
      move_s = 0.0
      sprint = False
      jump_pressed = True
      jump_held = True
    elif aid in ("stop", "no_op"):
      move_f = 0.0
      move_s = 0.0
      sprint = False
    else:
      return control
    adjusted = PlayerStepInput(
      move_f=float(move_f),
      move_s=float(move_s),
      jump_held=bool(jump_held),
      jump_pressed=bool(jump_pressed),
      sprint=bool(sprint),
      crouch=bool(control.crouch),
      yaw_delta_deg=float(control.yaw_delta_deg),
      pitch_delta_deg=float(control.pitch_delta_deg),
      auto_jump_enabled=bool(control.auto_jump_enabled),
    )
    guarded_control, _blocked = self._apply_edge_safety(actor, adjusted, max_drop=int(_AI_EDGE_SAFE_DROP_DEPTH))
    return guarded_control

  def _policy_place_forward(self, actor: _AiPlayerRuntime) -> bool:
    if actor.held_item_id is None or float(actor.place_cooldown_s) > 1e-6:
      return False
    support_cell = self._current_support_cell(actor)
    if support_cell is None:
      return False
    forward = actor.player.view_forward()
    facing = cardinal_from_xz(float(forward.x), float(forward.z), default="south")
    step_x, step_z = facing_vec_xz(str(facing))
    return bool(self._place_adjacent_block(actor, anchor_cell=tuple(int(value) for value in support_cell), step_x=int(step_x), step_z=int(step_z)))

  def _policy_break_forward(self, actor: _AiPlayerRuntime) -> bool:
    if float(actor.interact_cooldown_s) > 1e-6:
      return False
    forward = actor.player.view_forward()
    eye = actor.player.eye_pos()
    outcome = actor.interaction.break_block(reach=3.0, origin=eye, direction=forward)
    if not bool(getattr(outcome, "success", False)):
      return False
    self._record_block_sound(outcome)
    actor.interact_cooldown_s = float(_AI_INTERACT_COOLDOWN_S)
    return True

  def _policy_toggle_fence_gate(self, actor: _AiPlayerRuntime) -> bool:
    if float(actor.interact_cooldown_s) > 1e-6:
      return False
    forward = actor.player.view_forward()
    eye = actor.player.eye_pos()
    hit = actor.interaction.pick_block(reach=2.2, origin=eye, direction=forward)
    if hit is None:
      return False
    outcome = actor.interaction.interact_block_at_hit(tuple(int(value) for value in hit.hit))
    if not bool(getattr(outcome, "success", False)):
      return False
    self._record_block_sound(outcome)
    actor.interact_cooldown_s = float(_AI_INTERACT_COOLDOWN_S)
    return True

  def _execute_policy_action(self, actor: _AiPlayerRuntime, action_id: str, *, support_before: tuple[int, int, int] | None) -> bool:
    aid = str(action_id)
    if aid in ("bridge_step", "place_block", "defensive_block"):
      return bool(self._policy_place_forward(actor))
    if aid in ("tower_step", "escape_stack_block"):
      if support_before is not None and (not bool(actor.player.on_ground)):
        return bool(self._place_block_on_support(actor, support_cell=tuple(int(value) for value in support_before)))
      return False
    if aid in ("break_block", "escape_break_block"):
      return bool(self._policy_break_forward(actor))
    if aid == "toggle_fence_gate":
      return bool(self._policy_toggle_fence_gate(actor))
    if aid == "replan_route" and normalize_ai_mode(actor.mode) == AI_MODE_ROUTE:
      if bool(actor.nav_plan_pending):
        self._cancel_pending_nav_plan(actor)
      self._clear_nav_plan(actor)
      actor.nav_replan_cooldown_s = 0.0
      return True
    return False

  def _log_ai_decision(
    self,
    *,
    actor: _AiPlayerRuntime,
    mode: str,
    observation: AiObservation,
    mask: AiActionMask,
    deterministic_ranked: tuple[tuple[str, float], ...],
    learned_ranked: tuple[tuple[str, float], ...],
    selected_action: str,
    source: str,
    policy_id: str,
    policy_usable: bool,
    control: PlayerStepInput,
    world_action: bool,
  ) -> None:
    features = ",".join(encode_features(observation))
    forbidden = ",".join(sorted(mask.forbidden.keys()))
    det_top = ",".join(f"{action}:{score:.2f}" for action, score in deterministic_ranked[:5])
    learned_top = ",".join(f"{action}:{score:.2f}" for action, score in learned_ranked[:5])
    control_summary = f"f={float(control.move_f):.2f},s={float(control.move_s):.2f},jump={bool(control.jump_pressed)},sprint={bool(control.sprint)}"
    print(
      f"[AI-DECISION] actor={actor.actor_id} mode={mode} policy={policy_id or 'none'} usable={bool(policy_usable)} "
      f"features=[{features}] allowed={len(mask.allowed)} blocked=[{forbidden}] "
      f"det_top5=[{det_top}] learned_top5=[{learned_top}] selected={selected_action} source={source} "
      f"control=({control_summary}) world_action={bool(world_action)}",
      flush=True,
    )

  def step(self, *, dt: float, target_player: PlayerEntity | None, allow_pvp: bool, paused_actor_ids: tuple[str, ...] = (), learning: LearningCoordinator | None = None) -> AiStepReport:
    self._drain_completed_route_plans()
    self._route_requests_this_step = 0
    self._recovery_searches_this_step = 0
    self._block_sound_events = []
    if learning is not None:
      learning.begin_tick()
    total_player_damage = 0.0
    player_death_reason: str | None = None
    player_killer_name: str | None = None
    damage_sound_positions: list[tuple[float, float, float]] = []
    ai_death_logs: list[AiDeathLogEvent] = []
    removed_actor_ids: list[str] = []
    paused_ids = {str(actor_id) for actor_id in paused_actor_ids}
    for actor in self._actors.values():
      if not actor.player.alive():
        removed_actor_ids.append(str(actor.actor_id))
        continue
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
      learn_observation: AiObservation | None = None
      learn_mask = None
      learn_action_id: str | None = None
      learn_action_source = ACTION_SOURCE_DETERMINISTIC
      learn_support_before: tuple[int, int, int] | None = None
      learn_world_action = False
      if learning is not None and bool(learning.active()):
        learn_observation = self._build_observation(actor, target_player=target_player, allow_pvp=bool(allow_pvp))
        learn_mask = build_action_mask(learn_observation)
        learn_support_before = learn_observation.support_cell
        if mode == AI_MODE_WANDER and bool(learning.policy_enabled()):
          decision = learning.decide(learn_observation, learn_mask)
          learn_action_id = str(decision.action_id)
          learn_action_source = ACTION_SOURCE_LEARNED_POLICY
          control = self._apply_learned_action(actor, control, str(decision.action_id))
        else:
          learn_action_id = self._control_to_action_id(control)
          learn_action_source = ACTION_SOURCE_DETERMINISTIC
        actor.learn_last_action = str(learn_action_id)
      step_result = advance_runtime_player(player=actor.player, world=self.world, block_registry=self.block_registry, settings=self.settings, motion=actor.motion, dt=float(dt), control=control)
      self._update_stuck_recovery_state(actor, dt=float(dt), jump_started=bool(step_result.jump_started))
      fall_damage = actor.player.apply_damage(fall_damage_amount(fall_distance_blocks=step_result.fall_distance_blocks), bypass_cooldown=True)
      void_damage, actor.void_damage_timer_s = apply_void_damage(player=actor.player, dt=float(dt), timer_s=float(actor.void_damage_timer_s))
      if float(fall_damage) > 1e-6 or float(void_damage) > 1e-6:
        self._note_ai_damage(actor)
        damage_sound_positions.append(self._damage_sound_position(actor.player))
      actor_died_this_step = not bool(actor.player.alive())
      if bool(actor_died_this_step):
        if float(void_damage) > 1e-6:
          ai_death_logs.append(self._death_log_event(actor, reason="void"))
        elif float(fall_damage) > 1e-6:
          ai_death_logs.append(self._death_log_event(actor, reason="fall"))
        else:
          ai_death_logs.append(self._death_log_event(actor, reason="damage"))
      else:
        self._advance_ai_regeneration(actor, dt=float(dt))
      actor_damage_dealt = 0.0
      if (not bool(actor_died_this_step)) and mode != AI_MODE_IDLE:
        if learn_action_id is not None and learn_action_source == ACTION_SOURCE_LEARNED_POLICY:
          learn_world_action = self._execute_policy_action(actor, learn_action_id, support_before=learn_support_before)
        self._maybe_interact_or_place(actor, target_player=target_player)
        attack_report = self._maybe_attack_player(actor, target_player=target_player, allow_pvp=bool(allow_pvp))
        actor_damage_dealt = float(attack_report.player_damage_taken)
        total_player_damage += float(attack_report.player_damage_taken)
        if attack_report.player_death_reason is not None:
          player_death_reason = str(attack_report.player_death_reason)
          player_killer_name = None if attack_report.player_killer_name is None else str(attack_report.player_killer_name)
      if learning is not None and learn_observation is not None and learn_action_id is not None and bool(learning.recording()):
        alive_after = bool(actor.player.alive())
        died = not bool(alive_after)
        void_death = bool(died and float(void_damage) > 1e-6)
        if bool(void_death):
          failure_reason: str | None = "void_fall"
        elif bool(died):
          failure_reason = "death"
        elif mode == AI_MODE_ROUTE and bool(actor.nav_path_failed):
          failure_reason = "failed_route"
        else:
          failure_reason = None
        transition = RewardTransition(
          survived=bool(alive_after),
          progress_delta=0.0,
          damage_dealt=float(actor_damage_dealt),
          damage_taken=float(fall_damage) + float(void_damage),
          fell=bool(float(fall_damage) > 1e-6),
          died=bool(died),
          void_death=bool(void_death),
        )
        learning.record_decision(
          observation=learn_observation,
          mask=learn_mask,
          action_id=str(learn_action_id),
          action_source=str(learn_action_source),
          actor_id=str(actor.actor_id),
          transition=transition,
          failure_reason=failure_reason,
          route_state={"mode": str(mode), "route_present": bool(learn_observation.route_present), "route_blocked": bool(learn_observation.route_blocked)},
          combat_state={"visible_player": bool(learn_observation.visible_player), "attack_in_range": bool(learn_observation.attack_in_range)},
          placement_state={"can_place": bool(learn_observation.can_place_blocks)},
        )
      if learning is not None and learn_observation is not None and learn_mask is not None and learn_action_id is not None and bool(_ai_decision_debug_enabled()):
        deterministic_ranked, learned_ranked, debug_policy_id, debug_policy_usable = learning.debug_rankings(learn_observation, learn_mask)
        self._log_ai_decision(
          actor=actor,
          mode=str(mode),
          observation=learn_observation,
          mask=learn_mask,
          deterministic_ranked=deterministic_ranked,
          learned_ranked=learned_ranked,
          selected_action=str(learn_action_id),
          source=str(learn_action_source),
          policy_id=str(debug_policy_id),
          policy_usable=bool(debug_policy_usable),
          control=control,
          world_action=bool(learn_world_action),
        )
      if not actor.player.alive():
        removed_actor_ids.append(str(actor.actor_id))
    for actor_id in removed_actor_ids:
      actor = self._actors.pop(str(actor_id), None)
      if actor is not None:
        self._cancel_pending_nav_plan(actor)
    return AiStepReport(
      player_damage_taken=float(total_player_damage),
      player_death_reason=player_death_reason,
      player_killer_name=player_killer_name,
      damage_sound_positions=tuple(damage_sound_positions),
      ai_death_logs=tuple(ai_death_logs),
      block_sound_events=tuple(self._block_sound_events),
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
