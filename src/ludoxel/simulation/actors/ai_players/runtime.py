# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.planner import AiRoutePlanStep
from ludoxel.simulation.actors.ai_players.state import (
  AI_HEALTH_INDICATOR_OFF,
  AI_REGEN_DEFAULT_AMOUNT_HP,
  AI_REGEN_DEFAULT_CAP_HP,
  AI_REGEN_DEFAULT_ENABLED,
  AI_REGEN_DEFAULT_INTERVAL_S,
  AI_REGEN_DEFAULT_START_DELAY_S,
  AI_ROUTE_STYLE_STRICT,
  AiPlayerState,
  AiRoutePoint,
)
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.actors.player.kinematics import PlayerMotionState
from ludoxel.simulation.rules.interaction.service import InteractionService

_AI_ATTACK_COOLDOWN_S = 0.45
_AI_ROUTE_REACHED_EPS = 0.45
_AI_CHASE_RANGE = 10.0
_AI_ROUTE_ENGAGE_RANGE = 7.5
_AI_ROUTE_RETURN_RANGE = 11.0
_AI_TURN_RATE_DEG_PER_S = 300.0
_AI_WANDER_DECISION_MIN_S = 0.90
_AI_WANDER_DECISION_MAX_S = 2.40
_AI_PLACE_COOLDOWN_S = 0.30
_AI_INTERACT_COOLDOWN_S = 0.45
_AI_CLOSE_DEFENSE_RANGE = 2.6
_AI_FLEX_PATH_RADIUS = 18
_AI_MAX_SUPPORT_Y_DELTA = 1
_AI_PARKOUR_SEARCH_CAP = 8
_AI_FLEX_REPLAN_INTERVAL_S = 0.55
_AI_FLEX_REPLAN_STUCK_INTERVAL_S = 0.18
_AI_ROUTE_STUCK_PROGRESS_EPS = 0.08
_AI_ROUTE_STUCK_TIMEOUT_S = 0.70
_AI_NAV_JUMP_ALIGN_MIN = 0.45
_AI_NAV_JUMP_PROGRESS_MIN = 0.10
_AI_NAV_LONG_JUMP_PROGRESS_MIN = 0.24
_AI_NAV_PARKOUR_SPEED_SCALE = 0.82
_AI_NAV_STEP_PROGRESS_EPS = 0.05
_AI_NAV_STEP_STUCK_TIMEOUT_S = 0.45
_AI_NAV_TARGET_SLOW_RADIUS = 0.55
_AI_STUCK_RECOVERY_SUPPORT_S = 0.38
_AI_STUCK_JUMP_RETRIES = 2
_AI_STUCK_AVOID_CELL_S = 2.40
_AI_BLOCKED_EDGE_COOLDOWN_S = 2.20
_AI_STUCK_GOAL_TIMEOUT_S = 0.95
_AI_PARKOUR_TAKEOFF_EDGE_OFFSET = 0.44
_AI_PARKOUR_TAKEOFF_TRIGGER_EPS = 0.03
_AI_COMBAT_W_TAP_S = 0.12
_AI_COMBAT_STRAFE_MAG = 0.18
_AI_COMBAT_STRAFE_WINDOW_S = 0.18
_AI_COMBAT_STRAFE_DISTANCE_MIN = 1.45
_AI_COMBAT_STRAFE_DISTANCE_MAX = 2.75
_AI_BRIDGE_COMBAT_DISABLE_RANGE = 4.5
_AI_ROUTE_SNAPSHOT_Y_PAD = 6
_AI_ATTACK_SWING_DURATION_S = 6.0 / 20.0
_AI_ROUTE_REQUESTS_PER_STEP = 1
_AI_NAV_FAILURE_RETRY_BASE_S = 0.40
_AI_NAV_FAILURE_RETRY_MAX_S = 1.60
_AI_LOCAL_RECOVERY_PROGRESS_EPS = 0.18
_AI_LOCAL_RECOVERY_SEARCH_RADIUS = 4
_AI_LOCAL_RECOVERY_VISIT_LIMIT = 72
_AI_LOCAL_RECOVERY_STEP_PENALTY = 0.18
_AI_LOCAL_RECOVERY_ALLOW_REGRESSION = 1.10
_AI_ROUTE_TARGET_SUPPORT_SEARCH_RADIUS = 6
_AI_LOCAL_RECOVERY_CACHE_S = 0.30
_AI_LOCAL_RECOVERY_BUDGET_PER_STEP = 1
_AI_LOCAL_RECOVERY_TIME_BUDGET_S = 0.0015
_AI_LOCAL_RECOVERY_PARKOUR_SPAN = 3
_AI_DIRECT_ROUTE_MAX_SPAN = 24
_AI_NAV_UNREACHABLE_SKIP_RETRIES = 3
_AI_NAV_UNREACHABLE_TARGET_COOLDOWN_S = 8.0
_AI_EDGE_LOOKAHEAD_BLOCKS = 0.85
_AI_EDGE_SAFE_DROP_DEPTH = 3
_AI_EDGE_ROUTE_DROP_DEPTH = 8
_AI_PLACEMENT_LOS_EPS = 0.05


@dataclass(frozen=True)
class AiRoutePathSnapshot:
  actor_id: str
  points: tuple[AiRoutePoint, ...]
  closed: bool


@dataclass(frozen=True)
class AiStepReport:
  player_damage_taken: float = 0.0
  player_death_reason: str | None = None
  player_killer_name: str | None = None
  damage_sound_positions: tuple[tuple[float, float, float], ...] = ()


@dataclass(frozen=True)
class AiLocalAttackResult:
  success: bool = False
  target_position: tuple[float, float, float] | None = None


@dataclass(frozen=True)
class AiActorObservation:
  """
  application session が AI actor の現在状態を読み取るための domain observation を表す。
  player と motion は simulation 内の mutable object への参照であるため presentation へ直接渡さず、application pipeline が同一 call 内で不変な renderer-facing DTO へ変換する。
  health_indicator は `"off"`、`"above"`、`"below"` の三値へ正規化済みである。
  """

  player: PlayerEntity
  motion: PlayerMotionState
  held_item_id: str | None
  attack_swing_progress: float
  attack_prev_swing_progress: float
  actor_id: str = ""
  name: str = ""
  health: float = 20.0
  max_health: float = 20.0
  health_indicator: str = AI_HEALTH_INDICATOR_OFF


@dataclass
class _AiPlayerRuntime:
  actor_id: str
  player: PlayerEntity
  interaction: InteractionService
  mode: str
  personality: str
  can_place_blocks: bool
  held_item_id: str | None
  name: str = ""
  health_indicator: str = AI_HEALTH_INDICATOR_OFF
  auto_regen_enabled: bool = AI_REGEN_DEFAULT_ENABLED
  regen_start_delay_s: float = AI_REGEN_DEFAULT_START_DELAY_S
  regen_interval_s: float = AI_REGEN_DEFAULT_INTERVAL_S
  regen_amount_hp: float = AI_REGEN_DEFAULT_AMOUNT_HP
  regen_cap_hp: float = AI_REGEN_DEFAULT_CAP_HP
  regen_wait_s: float = 0.0
  regen_tick_s: float = 0.0
  route_points: tuple[AiRoutePoint, ...] = ()
  route_closed: bool = False
  route_run: bool = False
  route_style: str = AI_ROUTE_STYLE_STRICT
  route_target_index: int = 0
  motion: PlayerMotionState = field(default_factory=PlayerMotionState)
  attack_cooldown_s: float = 0.0
  place_cooldown_s: float = 0.0
  interact_cooldown_s: float = 0.0
  decision_timer_s: float = 0.0
  wander_heading_deg: float = 0.0
  wander_forward: float = 0.0
  wander_sprint: bool = False
  bridge_side_sign: int = 1
  route_stuck_s: float = 0.0
  route_last_goal_distance: float = 1e9
  route_last_progress_position: Vec3 = field(default_factory=lambda: Vec3(0.0, 0.0, 0.0))
  stuck_support_cell: tuple[int, int, int] | None = None
  stuck_support_time_s: float = 0.0
  stuck_jump_retries: int = 0
  nav_ground_support_cell: tuple[int, int, int] | None = None
  nav_next_support_cell: tuple[int, int, int] | None = None
  nav_from_support_cell: tuple[int, int, int] | None = None
  nav_place_anchor_cell: tuple[int, int, int] | None = None
  nav_place_target_cell: tuple[int, int, int] | None = None
  nav_goal_support_cell: tuple[int, int, int] | None = None
  nav_plan_steps: tuple[AiRoutePlanStep, ...] = ()
  nav_plan_index: int = 0
  nav_plan_generation: int = 0
  nav_plan_pending: bool = False
  nav_plan_pending_generation: int = 0
  nav_plan_start_support_cell: tuple[int, int, int] | None = None
  nav_plan_failed_world_revision: int = -1
  nav_plan_failed_target_index: int = -1
  nav_avoid_support_cells: dict[tuple[int, int, int], float] = field(default_factory=dict)
  nav_blocked_edges: dict[tuple[tuple[int, int, int], tuple[int, int, int]], float] = field(default_factory=dict)
  nav_world_revision: int = -1
  nav_replan_cooldown_s: float = 0.0
  nav_path_failed: bool = False
  nav_failure_retry_s: float = 0.0
  nav_failure_retry_count: int = 0
  nav_failed_support_cell: tuple[int, int, int] | None = None
  nav_jump_required: bool = False
  nav_jump_span: int = 1
  nav_step_progress_cell: tuple[int, int, int] | None = None
  nav_step_best_distance: float = 1e9
  nav_step_stuck_s: float = 0.0
  nav_unreachable_targets: dict[int, float] = field(default_factory=dict)
  local_recovery_cache_target: Vec3 | None = None
  local_recovery_cache_key: tuple[tuple[int, int, int], tuple[int, int, int] | None] | None = None
  local_recovery_cache_age_s: float = 1e9
  target_support_cache_key: tuple[tuple[int, int, int], int] | None = None
  target_support_cache_value: tuple[int, int, int] | None = None
  combat_w_tap_s: float = 0.0
  combat_strafe_timer_s: float = 0.0
  combat_strafe_sign: int = 1
  void_damage_timer_s: float = 0.0
  attack_swing_progress: float = 0.0
  attack_prev_swing_progress: float = 0.0
  attack_swing_active: bool = False

  def to_state(self) -> AiPlayerState:
    return AiPlayerState(
      actor_id=str(self.actor_id),
      mode=str(self.mode),
      personality=str(self.personality),
      can_place_blocks=bool(self.can_place_blocks),
      held_item_id=None if self.held_item_id is None else str(self.held_item_id),
      name=str(self.name),
      health_indicator=str(self.health_indicator),
      auto_regen_enabled=bool(self.auto_regen_enabled),
      regen_start_delay_s=float(self.regen_start_delay_s),
      regen_interval_s=float(self.regen_interval_s),
      regen_amount_hp=float(self.regen_amount_hp),
      regen_cap_hp=float(self.regen_cap_hp),
      pos_x=float(self.player.position.x),
      pos_y=float(self.player.position.y),
      pos_z=float(self.player.position.z),
      vel_x=float(self.player.velocity.x),
      vel_y=float(self.player.velocity.y),
      vel_z=float(self.player.velocity.z),
      yaw_deg=float(self.player.yaw_deg),
      pitch_deg=float(self.player.pitch_deg),
      health=float(self.player.health),
      max_health=float(self.player.max_health),
      on_ground=bool(self.player.on_ground),
      flying=bool(self.player.flying),
      route_points=tuple(self.route_points),
      route_closed=bool(self.route_closed),
      route_run=bool(self.route_run),
      route_style=str(self.route_style),
      route_target_index=int(self.route_target_index),
    ).normalized()
