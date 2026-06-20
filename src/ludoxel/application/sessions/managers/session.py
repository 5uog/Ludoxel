# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.application.sessions.managers.ai_players import (
  ai_player_name_error_for_session,
  ai_player_settings_for_session,
  ai_render_snapshots_for_session,
  ai_route_paths_for_session,
  ai_states_for_session,
  attack_ai_player_for_session,
  cancel_ai_navigation_for_session,
  pick_ai_player_for_session,
  remove_ai_player_for_session,
  set_ai_players_for_session,
  spawn_ai_player_for_session,
  update_ai_player_settings_for_session,
)
from ludoxel.application.sessions.managers.interactions import (
  break_block_for_session,
  interact_block_at_hit_for_session,
  pick_block_for_session,
  place_block_for_session,
  place_block_from_hit_for_session,
)
from ludoxel.application.sessions.managers.snapshots import make_camera_snapshot_for_session, make_render_snapshot_for_session
from ludoxel.application.sessions.managers.stepping import SessionStepResult, step_session
from ludoxel.application.sessions.pipelines.render_snapshot import AiPlayerRenderSnapshotDTO, CameraDTO, RenderSnapshotDTO
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.learning.coordinator import LearningCoordinator
from ludoxel.simulation.actors.ai_players.learning.dataset import RECORD_PLAYER_BLOCK_BREAKING, RECORD_PLAYER_BLOCK_PLACEMENT, RECORD_PLAYER_COMBAT, DatasetSink
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_COMBAT_COOLDOWN_READY, FEATURE_HEALTH_CRITICAL, FEATURE_HEALTH_LOW
from ludoxel.simulation.actors.ai_players.learning.policy import Policy
from ludoxel.simulation.actors.ai_players.manager import AiPlayerManager
from ludoxel.simulation.actors.ai_players.runtime import AiLocalAttackResult, AiRoutePathSnapshot
from ludoxel.simulation.actors.ai_players.state import AiPlayerState, AiSpawnEggSettings
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.actors.player.kinematics import PlayerMotionState
from ludoxel.simulation.actors.player.targets import MELEE_ATTACK_REACH_BLOCKS
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.rules.collision.system import SupportBlockContact, support_block_beneath
from ludoxel.simulation.rules.gravity.system import GravitySystem
from ludoxel.simulation.rules.interaction.service import InteractionService
from ludoxel.simulation.worlds.config.session import SessionSettings
from ludoxel.simulation.worlds.state.world import WorldState

_FLIGHT_TOGGLE_WINDOW_S = 0.25


@dataclass
class SessionManager:
  settings: SessionSettings
  world: WorldState
  player: PlayerEntity
  block_registry: BlockRegistry

  interaction: InteractionService = field(init=False, repr=False)
  gravity: GravitySystem = field(init=False, repr=False)
  ai_players: AiPlayerManager = field(init=False, repr=False)
  learning: LearningCoordinator = field(default_factory=LearningCoordinator, init=False, repr=False)
  _sim_time_s: float = field(default=0.0, init=False, repr=False)
  _last_jump_press_s: float | None = field(default=None, init=False, repr=False)
  _player_motion: PlayerMotionState = field(default_factory=PlayerMotionState, init=False, repr=False)
  _death_reason: str | None = field(default=None, init=False, repr=False)
  _void_damage_timer_s: float = field(default=0.0, init=False, repr=False)

  def __post_init__(self) -> None:
    self.player.clamp_health()
    self.interaction = InteractionService.create(world=self.world, player=self.player, block_registry=self.block_registry)
    self.gravity = GravitySystem(block_registry=self.block_registry)
    self.ai_players = AiPlayerManager(world=self.world, block_registry=self.block_registry, settings=self.settings)

  def shutdown(self) -> None:
    self.ai_players.shutdown()

  def configure_learning(self, *, mode: str, captured_kinds: tuple[str, ...], policy: Policy | None) -> None:
    self.learning.configure(mode=str(mode), captured_kinds=tuple(captured_kinds), policy=policy)

  def flush_learning(self, sink: DatasetSink) -> int:
    return self.learning.flush(sink)

  def learning_pending(self) -> int:
    return self.learning.pending_count()

  def _player_observation_dict(self) -> dict:
    return {
      "self_position": [float(self.player.position.x), float(self.player.position.y), float(self.player.position.z)],
      "on_ground": bool(self.player.on_ground),
      "health": float(self.player.health),
      "max_health": float(self.player.max_health),
    }

  def _player_feature_keys(self) -> list[str]:
    max_health = max(1.0, float(self.player.max_health))
    health = float(self.player.health)
    features: list[str] = [str(FEATURE_COMBAT_COOLDOWN_READY)]
    if float(health) <= float(max_health) * 0.15:
      features.append(str(FEATURE_HEALTH_CRITICAL))
    if float(health) <= float(max_health) * 0.35:
      features.append(str(FEATURE_HEALTH_LOW))
    return features

  def _record_player_action(self, *, kind: str, action_id: str) -> None:
    self.learning.record_player_demonstration(
      kind=str(kind), observation=self._player_observation_dict(), action_id=str(action_id), actor_id="player", detail={"feature_keys": self._player_feature_keys()}
    )

  def respawn(self) -> None:
    player = self.player
    player.position = Vec3(float(self.settings.spawn_x), float(self.settings.spawn_y), float(self.settings.spawn_z))
    player.velocity = Vec3(0.0, 0.0, 0.0)
    player.yaw_deg = 0.0
    player.pitch_deg = 0.0
    player.on_ground = False
    player.flying = False
    player.crouch_eye_offset = 0.0
    player.step_eye_offset = 0.0
    player.hold_jump_queued = False
    player.auto_jump_pending = False
    player.auto_jump_start_y = float(player.position.y)
    player.auto_jump_cooldown_s = 0.0
    player.fence_gate_overlap_exemption = None
    player.gravity_block_overlap_exemptions = ()
    player.heal_to_full()
    self._last_jump_press_s = None
    self._player_motion = PlayerMotionState()
    self._death_reason = None
    self._void_damage_timer_s = 0.0

  def _update_creative_flight_toggle(self, *, creative_mode: bool, jump_pressed: bool) -> None:
    if not bool(creative_mode):
      self.player.flying = False
      self._last_jump_press_s = None
      return

    if not bool(jump_pressed):
      return

    now = float(self._sim_time_s)
    last = self._last_jump_press_s
    self._last_jump_press_s = float(now)
    if last is None:
      return
    if (float(now) - float(last)) > float(_FLIGHT_TOGGLE_WINDOW_S):
      return

    self.player.flying = not bool(self.player.flying)
    self._last_jump_press_s = None
    if bool(self.player.flying):
      self.player.velocity = Vec3(float(self.player.velocity.x), 0.0, float(self.player.velocity.z))
      self.player.on_ground = False
      self.player.hold_jump_queued = False
      self.player.auto_jump_pending = False
      self.player.auto_jump_cooldown_s = 0.0
      return
    self.player.velocity = Vec3(float(self.player.velocity.x), min(0.0, float(self.player.velocity.y)), float(self.player.velocity.z))

  def support_block_contact(self) -> SupportBlockContact | None:
    return support_block_beneath(self.player, self.world, block_registry=self.block_registry, params=self.settings.collision)

  def snapshot_world_blocks_for_persistence(self) -> dict[tuple[int, int, int], str]:
    return self.gravity.snapshot_blocks_for_persistence(self.world)

  def current_death_reason(self) -> str | None:
    if self.player.alive():
      return None
    return self._death_reason

  def set_ai_players(self, states: object) -> None:
    set_ai_players_for_session(self, states)

  def ai_states(self) -> tuple[AiPlayerState, ...]:
    return ai_states_for_session(self)

  def spawn_ai_player(self, *, spawn_cell: tuple[int, int, int], settings: AiSpawnEggSettings) -> str | None:
    return spawn_ai_player_for_session(self, spawn_cell=spawn_cell, settings=settings)

  def ai_player_settings(self, actor_id: str) -> AiSpawnEggSettings | None:
    return ai_player_settings_for_session(self, actor_id)

  def update_ai_player_settings(self, *, actor_id: str, settings: AiSpawnEggSettings) -> bool:
    return update_ai_player_settings_for_session(self, actor_id=actor_id, settings=settings)

  def ai_player_name_error(self, *, actor_id: str | None, name: object) -> str | None:
    return ai_player_name_error_for_session(self, actor_id=actor_id, name=name)

  def remove_ai_player(self, actor_id: str) -> bool:
    return remove_ai_player_for_session(self, actor_id)

  def cancel_ai_navigation(self, actor_id: str) -> bool:
    return cancel_ai_navigation_for_session(self, actor_id)

  def pick_ai_player(self, *, origin: Vec3, direction: Vec3, reach: float = MELEE_ATTACK_REACH_BLOCKS, block_hit=None) -> str | None:
    return pick_ai_player_for_session(self, origin=origin, direction=direction, reach=float(reach), block_hit=block_hit)

  def attack_ai_player(self, *, origin: Vec3 | None = None, direction: Vec3 | None = None, reach: float = MELEE_ATTACK_REACH_BLOCKS) -> AiLocalAttackResult:
    result = attack_ai_player_for_session(self, origin=origin, direction=direction, reach=float(reach))
    if bool(getattr(result, "success", False)):
      self._record_player_action(kind=RECORD_PLAYER_COMBAT, action_id="attack")
    return result

  def ai_route_paths(self) -> tuple[AiRoutePathSnapshot, ...]:
    return ai_route_paths_for_session(self)

  def ai_render_snapshots(self) -> tuple[AiPlayerRenderSnapshotDTO, ...]:
    return ai_render_snapshots_for_session(self)

  def make_camera_snapshot(self, *, enable_camera_shake: bool = True, camera_shake_strength: float = 0.20) -> CameraDTO:
    return make_camera_snapshot_for_session(self, enable_camera_shake=bool(enable_camera_shake), camera_shake_strength=float(camera_shake_strength))

  def step(
    self,
    dt: float,
    move_f: float,
    move_s: float,
    jump_held: bool,
    jump_pressed: bool,
    sprint: bool,
    crouch: bool,
    mdx: float,
    mdy: float,
    creative_mode: bool,
    auto_jump_enabled: bool,
    paused_ai_actor_ids: tuple[str, ...] = (),
  ) -> SessionStepResult:
    return step_session(
      self,
      dt=float(dt),
      move_f=float(move_f),
      move_s=float(move_s),
      jump_held=bool(jump_held),
      jump_pressed=bool(jump_pressed),
      sprint=bool(sprint),
      crouch=bool(crouch),
      mdx=float(mdx),
      mdy=float(mdy),
      creative_mode=bool(creative_mode),
      auto_jump_enabled=bool(auto_jump_enabled),
      paused_ai_actor_ids=tuple(str(actor_id) for actor_id in paused_ai_actor_ids),
    )

  def make_snapshot(
    self, *, enable_view_bobbing: bool = True, enable_camera_shake: bool = True, view_bobbing_strength: float = 0.35, camera_shake_strength: float = 0.20, is_first_person_view: bool = True
  ) -> RenderSnapshotDTO:
    return make_render_snapshot_for_session(
      self,
      enable_view_bobbing=bool(enable_view_bobbing),
      enable_camera_shake=bool(enable_camera_shake),
      view_bobbing_strength=float(view_bobbing_strength),
      camera_shake_strength=float(camera_shake_strength),
      is_first_person_view=bool(is_first_person_view),
    )

  def break_block(self, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None):
    outcome = break_block_for_session(self, reach=float(reach), origin=origin, direction=direction)
    if bool(getattr(outcome, "success", False)):
      self._record_player_action(kind=RECORD_PLAYER_BLOCK_BREAKING, action_id="break_block")
    return outcome

  def pick_block(self, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None):
    return pick_block_for_session(self, reach=float(reach), origin=origin, direction=direction)

  def interact_block_at_hit(self, hit_cell: tuple[int, int, int]):
    return interact_block_at_hit_for_session(self, hit_cell)

  def place_block_from_hit(self, hit, block_id: str | None):
    return place_block_from_hit_for_session(self, hit, block_id)

  def place_block(self, block_id: str | None, reach: float = 5.0, *, crouching: bool = False, origin: Vec3 | None = None, direction: Vec3 | None = None):
    outcome = place_block_for_session(self, block_id=block_id, reach=float(reach), crouching=bool(crouching), origin=origin, direction=direction)
    if bool(getattr(outcome, "success", False)):
      self._record_player_action(kind=RECORD_PLAYER_BLOCK_PLACEMENT, action_id="place_block")
    return outcome
