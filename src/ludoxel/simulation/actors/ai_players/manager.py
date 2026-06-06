# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from collections import deque
from dataclasses import dataclass, field

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.voxels.faces import FACE_POS_Y
from ludoxel.simulation.actors.ai_players.avoidance import active_avoid_support_cells, decay_avoid_support_cells, remember_avoid_support_cell
from ludoxel.simulation.actors.ai_players.combat import _combat_control
from ludoxel.simulation.actors.ai_players.idle import idle_control
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
  _AI_FLEX_PATH_RADIUS,
  _AI_FLEX_REPLAN_STUCK_INTERVAL_S,
  _AI_INTERACT_COOLDOWN_S,
  _AI_LOCAL_RECOVERY_ALLOW_REGRESSION,
  _AI_LOCAL_RECOVERY_PROGRESS_EPS,
  _AI_LOCAL_RECOVERY_SEARCH_RADIUS,
  _AI_LOCAL_RECOVERY_STEP_PENALTY,
  _AI_LOCAL_RECOVERY_VISIT_LIMIT,
  _AI_MAX_SUPPORT_Y_DELTA,
  _AI_NAV_FAILURE_RETRY_BASE_S,
  _AI_NAV_FAILURE_RETRY_MAX_S,
  _AI_NAV_JUMP_ALIGN_MIN,
  _AI_NAV_JUMP_PROGRESS_MIN,
  _AI_NAV_PARKOUR_SPEED_SCALE,
  _AI_NAV_STEP_PROGRESS_EPS,
  _AI_NAV_STEP_STUCK_TIMEOUT_S,
  _AI_PARKOUR_SEARCH_CAP,
  _AI_PARKOUR_TAKEOFF_TRIGGER_EPS,
  _AI_PLACE_COOLDOWN_S,
  _AI_ROUTE_ENGAGE_RANGE,
  _AI_ROUTE_REACHED_EPS,
  _AI_ROUTE_REQUESTS_PER_STEP,
  _AI_ROUTE_SNAPSHOT_Y_PAD,
  _AI_ROUTE_STUCK_PROGRESS_EPS,
  _AI_ROUTE_STUCK_TIMEOUT_S,
  _AI_ROUTE_TARGET_SUPPORT_SEARCH_RADIUS,
  _AI_STUCK_GOAL_TIMEOUT_S,
  _AI_STUCK_JUMP_RETRIES,
  _AI_STUCK_RECOVERY_SUPPORT_S,
  AiLocalAttackResult,
  AiPlayerRenderSnapshot,
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
  normalize_ai_mode,
  normalize_ai_personality,
  normalize_ai_route_style,
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
from ludoxel.simulation.rules.collision.system import _any_intersection, support_block_beneath
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
  _route_snapshot_cache_revision: int = field(default=-1, init=False, repr=False)
  _route_snapshot_cache: dict[tuple[int, int, int, int, int, int], tuple[tuple[int, int, int, str], ...]] = field(default_factory=dict, init=False, repr=False)
  _route_requests_this_step: int = field(default=0, init=False, repr=False)

  def __post_init__(self) -> None:
    self._route_worker.warmup()

  def shutdown(self) -> None:
    self._route_worker.shutdown()

  def clear(self) -> None:
    for actor_id in tuple(self._actors.keys()):
      self._route_worker.cancel_actor(str(actor_id))
    self._actors.clear()
    self._next_actor_index = 1
    self._route_snapshot_cache_revision = -1
    self._route_snapshot_cache.clear()

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
    actor.combat_w_tap_s = 0.0
    actor.combat_strafe_timer_s = 0.0
    actor.combat_strafe_sign = 1
    actor.void_damage_timer_s = 0.0
    return actor

  def load_states(self, states: object) -> None:
    self.clear()
    if not isinstance(states, (list, tuple)):
      return
    max_index = 0
    for raw_state in states:
      if not isinstance(raw_state, AiPlayerState):
        continue
      actor = self._state_to_runtime(raw_state)
      self._actors[str(actor.actor_id)] = actor
      try:
        suffix = int(str(actor.actor_id).rsplit("_", 1)[1])
      except (IndexError, ValueError):
        suffix = 0
      max_index = max(int(max_index), int(suffix))
    self._next_actor_index = max(1, int(max_index) + 1)

  def spawn_from_egg(self, *, spawn_cell: tuple[int, int, int], settings: AiSpawnEggSettings) -> str | None:
    normalized_settings = settings.normalized()
    spawn_pos = Vec3(float(spawn_cell[0]) + 0.5, float(spawn_cell[1]), float(spawn_cell[2]) + 0.5)
    actor_id = self._allocate_actor_id()
    state = AiPlayerState(
      actor_id=str(actor_id),
      mode=str(normalized_settings.mode),
      personality=str(normalized_settings.personality),
      can_place_blocks=bool(normalized_settings.can_place_blocks),
      held_item_id=_held_item_id_for_settings(can_place_blocks=bool(normalized_settings.can_place_blocks)),
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
    actor.mode = normalize_ai_mode(normalized.mode)
    actor.personality = normalize_ai_personality(normalized.personality)
    actor.can_place_blocks = bool(normalized.can_place_blocks)
    actor.held_item_id = _held_item_id_for_settings(can_place_blocks=bool(actor.can_place_blocks), held_item_id=actor.held_item_id)
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

  def _route_control(self, actor: _AiPlayerRuntime, *, dt: float, target_player: PlayerEntity | None, allow_pvp: bool) -> PlayerStepInput:
    combat_target = self._route_combat_target(actor, target_player=target_player, allow_pvp=bool(allow_pvp))
    flexible_route = normalize_ai_route_style(actor.route_style) == AI_ROUTE_STYLE_FLEXIBLE
    if combat_target is not None:
      if bool(actor.nav_plan_pending):
        self._cancel_pending_nav_plan(actor)
      default_jump_pressed = bool(actor.player.on_ground) and (float(combat_target.y) > float(actor.player.position.y) + 0.55 or float((combat_target - actor.player.position).length()) <= 3.4)
      return _combat_control(actor=actor, target=combat_target, dt=float(dt), jump_pressed=bool(default_jump_pressed))
    target = route_target_point(actor)
    if target is None:
      return idle_control()
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
    return _pursuit_control(player=actor.player, target=movement_target, dt=float(dt), sprint=bool(sprint), auto_jump_enabled=True, jump_pressed=bool(jump_pressed), crouch=False)

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

  def pick_actor(self, *, origin: Vec3, direction: Vec3, reach: float, block_hit: BlockPick | None) -> str | None:
    target_hit = pick_player_target(
      origin=origin, direction=direction, reach=float(reach), block_hit=block_hit, candidates=tuple((str(actor.actor_id), actor.player) for actor in self._actors.values())
    )
    if target_hit is None:
      return None
    return str(target_hit.actor_id)

  def _player_clear_at(self, actor: _AiPlayerRuntime, *, position: Vec3) -> bool:
    probe_aabb = actor.player.aabb_at(Vec3(float(position.x), float(position.y), float(position.z)))
    return not bool(_any_intersection(self.world, probe_aabb, self.settings.collision, block_registry=self.block_registry))

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

  def _route_search_radius(self, actor: _AiPlayerRuntime, *, start_support: tuple[int, int, int]) -> int:
    cells = [tuple(int(value) for value in start_support)]
    for route_point in actor.route_points:
      cells.append(_support_cell_from_point(route_point.as_vec3()))
    min_x = min(int(cell[0]) for cell in cells)
    max_x = max(int(cell[0]) for cell in cells)
    min_z = min(int(cell[2]) for cell in cells)
    max_z = max(int(cell[2]) for cell in cells)
    span = max(int(max_x) - int(min_x), int(max_z) - int(min_z))
    stuck_bonus = int(min(10.0, math.floor(float(actor.route_stuck_s) / float(_AI_ROUTE_STUCK_TIMEOUT_S)) * 3.0))
    return max(int(_AI_FLEX_PATH_RADIUS), min(32, int(math.ceil(float(span) * 0.5)) + 6 + int(stuck_bonus)))

  def _capture_nav_world_window(self, *, min_x: int, max_x: int, min_y: int, max_y: int, min_z: int, max_z: int) -> tuple[tuple[int, int, int, str], ...]:
    if int(self._route_snapshot_cache_revision) != int(self.world.revision):
      self._route_snapshot_cache_revision = int(self.world.revision)
      self._route_snapshot_cache.clear()
    cache_key = (int(min_x), int(max_x), int(min_y), int(max_y), int(min_z), int(max_z))
    cached = self._route_snapshot_cache.get(cache_key)
    if cached is not None:
      return cached
    blocks = self.world.snapshot_block_window(min_x=int(min_x), max_x=int(max_x), min_y=int(min_y), max_y=int(max_y), min_z=int(min_z), max_z=int(max_z))
    self._route_snapshot_cache[cache_key] = blocks
    while len(self._route_snapshot_cache) > 8:
      self._route_snapshot_cache.pop(next(iter(self._route_snapshot_cache)), None)
    return blocks

  def _build_route_plan_request(self, actor: _AiPlayerRuntime, *, start_support: tuple[int, int, int]) -> AiRoutePlanRequest | None:
    if len(actor.route_points) <= 0:
      return None
    search_radius = int(self._route_search_radius(actor, start_support=tuple(int(value) for value in start_support)))
    route_cells = [_support_cell_from_point(route_point.as_vec3()) for route_point in actor.route_points]
    xs = [int(start_support[0]), *(int(cell[0]) for cell in route_cells)]
    ys = [int(start_support[1]), *(int(cell[1]) for cell in route_cells)]
    zs = [int(start_support[2]), *(int(cell[2]) for cell in route_cells)]
    min_x = min(xs) - int(search_radius) - 1
    max_x = max(xs) + int(search_radius) + 1
    min_y = min(ys) - 2
    max_y = max(ys) + int(_AI_ROUTE_SNAPSHOT_Y_PAD)
    min_z = min(zs) - int(search_radius) - 1
    max_z = max(zs) + int(search_radius) + 1
    world_blocks = self._capture_nav_world_window(min_x=int(min_x), max_x=int(max_x), min_y=int(min_y), max_y=int(max_y), min_z=int(min_z), max_z=int(max_z))
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
      search_radius=int(search_radius),
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
      if bool(self._can_place_support_block(actor, anchor_cell=current, target_cell=place_candidate)):
        candidates.append(place_candidate)
        seen.add(place_candidate)
    max_jump_span = int(self._max_parkour_jump_span())
    max_jump_reach = float(self._parkour_jump_reach_blocks()) + 0.25
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

  def _local_recovery_target(self, actor: _AiPlayerRuntime, *, current_support: tuple[int, int, int], desired_target: Vec3) -> Vec3 | None:
    current = tuple(int(value) for value in current_support)
    current_center = _support_cell_center(current)
    current_score = float(_point_distance_xz(current_center, desired_target))
    prefer_descent = float(desired_target.y) + 0.25 < float(current_center.y)
    blocked_edges = set(actor.nav_blocked_edges.keys())
    avoid_cells = set(active_avoid_support_cells(actor))
    desired_target_support = self._nearest_standable_support_cell(actor, _support_cell_from_point(desired_target))
    queue: deque[tuple[tuple[int, int, int], int]] = deque([(current, 0)])
    visited: set[tuple[int, int, int]] = {current}
    best_cell: tuple[int, int, int] | None = None
    best_score = float(current_score)
    fallback_cell: tuple[int, int, int] | None = None
    fallback_score = 1e9
    while queue and len(visited) <= int(_AI_LOCAL_RECOVERY_VISIT_LIMIT):
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

  def _can_place_support_block(self, actor: _AiPlayerRuntime, *, anchor_cell: tuple[int, int, int], target_cell: tuple[int, int, int]) -> bool:
    if actor.held_item_id is None or (not bool(actor.can_place_blocks)):
      return False
    if float(actor.place_cooldown_s) > 1e-6:
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

  def _direct_route_clear(self, actor: _AiPlayerRuntime, *, from_cell: tuple[int, int, int], to_cell: tuple[int, int, int]) -> bool:
    src = tuple(int(value) for value in from_cell)
    dst = tuple(int(value) for value in to_cell)
    if int(src[1]) != int(dst[1]):
      return False
    steps = max(abs(int(dst[0]) - int(src[0])), abs(int(dst[2]) - int(src[2])))
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
    if int(actor.nav_world_revision) != int(self.world.revision):
      actor.nav_world_revision = int(self.world.revision)
      actor.nav_blocked_edges.clear()
      actor.nav_avoid_support_cells.clear()
      self._reset_nav_failure(actor)
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
    target_support = self._nearest_standable_support_cell(actor, _support_cell_from_point(desired_target))
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
        local_recovery_target = self._local_recovery_target(actor, current_support=tuple(int(value) for value in current_support), desired_target=desired_target)
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
      step_distance = float(_point_distance_xz(actor.player.position, _support_cell_center(tuple(int(value) for value in cached_next_cell))))
      if actor.nav_step_progress_cell != tuple(int(value) for value in cached_next_cell):
        actor.nav_step_progress_cell = tuple(int(value) for value in cached_next_cell)
        actor.nav_step_best_distance = float(step_distance)
        actor.nav_step_stuck_s = 0.0
      elif bool(actor.player.on_ground):
        if float(step_distance) + float(_AI_NAV_STEP_PROGRESS_EPS) < float(actor.nav_step_best_distance):
          actor.nav_step_best_distance = float(step_distance)
          actor.nav_step_stuck_s = 0.0
        elif float(step_distance) > float(_AI_ROUTE_REACHED_EPS) + 0.05:
          actor.nav_step_stuck_s += max(0.0, float(dt))
      placement_invalid = bool(
        cached_place_target is not None and (cached_place_anchor is None or (not bool(self._can_place_support_block(actor, anchor_cell=cached_place_anchor, target_cell=cached_place_target))))
      )
      next_step_invalid = bool(cached_next_cell is not None and cached_next_cell != cached_place_target and (not bool(self._standable_support_cell(actor, cached_next_cell))))
      source_support_invalid = bool(actor.nav_from_support_cell is not None and tuple(int(value) for value in actor.nav_from_support_cell) != tuple(int(value) for value in current_support))
      stuck_now = bool(float(actor.nav_step_stuck_s) >= float(_AI_NAV_STEP_STUCK_TIMEOUT_S) or float(actor.route_stuck_s) >= float(_AI_STUCK_GOAL_TIMEOUT_S))
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
        self._local_recovery_target(actor, current_support=tuple(int(value) for value in current_support), desired_target=desired_target) if bool(should_attempt_local_recovery) else None
      )
      return fallback_route_target(tuple(int(value) for value in current_support), local_recovery_target)
    if float(actor.nav_replan_cooldown_s) > 1e-6:
      local_recovery_target = (
        self._local_recovery_target(actor, current_support=tuple(int(value) for value in current_support), desired_target=desired_target) if bool(should_attempt_local_recovery) else None
      )
      return fallback_route_target(tuple(int(value) for value in current_support), local_recovery_target)
    actor.nav_goal_support_cell = None if normalized_target_support is None else tuple(int(value) for value in normalized_target_support)
    self._request_route_plan(actor, start_support=tuple(int(value) for value in current_support))
    local_recovery_target = (
      self._local_recovery_target(actor, current_support=tuple(int(value) for value in current_support), desired_target=desired_target) if bool(should_attempt_local_recovery) else None
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

  def _place_adjacent_block(self, actor: _AiPlayerRuntime, *, anchor_cell: tuple[int, int, int], step_x: int, step_z: int) -> bool:
    if actor.held_item_id is None:
      return False
    if self._state_at(int(anchor_cell[0]), int(anchor_cell[1]), int(anchor_cell[2])) is None:
      return False
    place_cell = (int(anchor_cell[0]) + int(step_x), int(anchor_cell[1]), int(anchor_cell[2]) + int(step_z))
    if self._state_at(int(place_cell[0]), int(place_cell[1]), int(place_cell[2])) is not None:
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
        return _combat_control(actor=actor, target=target, dt=float(dt), jump_pressed=bool(jump_pressed))
    self._update_wander_state(actor, dt=float(dt))
    heading_rad = math.radians(float(actor.wander_heading_deg))
    target = Vec3(float(actor.player.position.x) - math.sin(float(heading_rad)) * 3.0, float(actor.player.position.y) + 1.0, float(actor.player.position.z) + math.cos(float(heading_rad)) * 3.0)
    control = _pursuit_control(player=actor.player, target=target, dt=float(dt), sprint=bool(actor.wander_sprint), auto_jump_enabled=True, jump_pressed=False, crouch=False)
    return PlayerStepInput(
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
    return AiStepReport(player_damage_taken=float(damage_taken), player_death_reason=death_reason)

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
    actor.attack_cooldown_s = max(float(actor.attack_cooldown_s), float(MELEE_DAMAGE_COOLDOWN_S) * 0.5)
    if bool(actor.nav_plan_pending):
      self._cancel_pending_nav_plan(actor)
    return AiLocalAttackResult(success=True, target_position=self._damage_sound_position(actor.player))

  def step(self, *, dt: float, target_player: PlayerEntity | None, allow_pvp: bool, paused_actor_ids: tuple[str, ...] = ()) -> AiStepReport:
    self._drain_completed_route_plans()
    self._route_requests_this_step = 0
    total_player_damage = 0.0
    player_death_reason: str | None = None
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
        damage_sound_positions.append(self._damage_sound_position(actor.player))
      if mode != AI_MODE_IDLE:
        self._maybe_interact_or_place(actor, target_player=target_player)
        attack_report = self._maybe_attack_player(actor, target_player=target_player, allow_pvp=bool(allow_pvp))
        total_player_damage += float(attack_report.player_damage_taken)
        if attack_report.player_death_reason is not None:
          player_death_reason = str(attack_report.player_death_reason)
      if not actor.player.alive():
        removed_actor_ids.append(str(actor.actor_id))
    for actor_id in removed_actor_ids:
      actor = self._actors.pop(str(actor_id), None)
      if actor is not None:
        self._cancel_pending_nav_plan(actor)
    return AiStepReport(player_damage_taken=float(total_player_damage), player_death_reason=player_death_reason, damage_sound_positions=tuple(damage_sound_positions))

  def render_snapshots(self) -> tuple[AiPlayerRenderSnapshot, ...]:
    return tuple(
      AiPlayerRenderSnapshot(
        player=actor.player,
        motion=actor.motion,
        held_item_id=None if actor.held_item_id is None else str(actor.held_item_id),
        attack_swing_progress=float(actor.attack_swing_progress),
        attack_prev_swing_progress=float(actor.attack_prev_swing_progress),
      )
      for actor in self._actors.values()
    )
