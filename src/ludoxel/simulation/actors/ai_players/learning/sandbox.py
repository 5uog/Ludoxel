# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_SCHEMA_VERSION
from ludoxel.simulation.actors.ai_players.learning.coordinator import LEARNING_RUNTIME_OFF, LEARNING_RUNTIME_USE_LEARNED_POLICY, LearningCoordinator
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_ENCODER_VERSION
from ludoxel.simulation.actors.ai_players.learning.policy import POLICY_COMPATIBILITY_TARGET, POLICY_SCHEMA_VERSION, POLICY_SOURCE_SANDBOX, Policy
from ludoxel.simulation.actors.ai_players.manager import AiPlayerManager
from ludoxel.simulation.actors.ai_players.state import AI_MODE_WANDER, AI_PERSONALITY_AGGRESSIVE, AiPlayerState
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.default import create_default_registry
from ludoxel.simulation.worlds.config.session import SessionSettings
from ludoxel.simulation.worlds.state.world import WorldState

_SANDBOX_DT: float = 0.1
_EPISODE_TICKS: int = 120
_FLOOR_STATE: str = "minecraft:stone"
_FLOOR_RADIUS: int = 10

_REGISTRY = None
_SETTINGS: SessionSettings | None = None


def _registry():
  global _REGISTRY
  if _REGISTRY is None:
    _REGISTRY = create_default_registry()
  return _REGISTRY


def _settings() -> SessionSettings:
  global _SETTINGS
  if _SETTINGS is None:
    _SETTINGS = SessionSettings()
  return _SETTINGS


def _flat_world(*, radius: int = _FLOOR_RADIUS, void_min_z: int | None = None) -> WorldState:
  blocks: dict[tuple[int, int, int], str] = {}
  for x in range(-int(radius), int(radius) + 1):
    for z in range(-int(radius), int(radius) + 1):
      if void_min_z is not None and int(z) >= int(void_min_z):
        continue
      blocks[(int(x), 0, int(z))] = str(_FLOOR_STATE)
  return WorldState(blocks=blocks, revision=1)


def _gap_world(*, radius: int = _FLOOR_RADIUS, gap_lo: int = 1, gap_hi: int = 3) -> WorldState:
  blocks: dict[tuple[int, int, int], str] = {}
  for x in range(-int(radius), int(radius) + 1):
    for z in range(-int(radius), int(radius) + 1):
      if int(gap_lo) <= int(z) <= int(gap_hi):
        continue
      blocks[(int(x), 0, int(z))] = str(_FLOOR_STATE)
  return WorldState(blocks=blocks, revision=1)


@dataclass(frozen=True)
class SandboxScenario:
  task_id: str
  world_factory: Callable[[], WorldState]
  actor_state: AiPlayerState
  target_factory: Callable[[int], PlayerEntity | None]
  score_fn: Callable[[dict[str, Any]], float]
  ticks: int = _EPISODE_TICKS
  dt: float = _SANDBOX_DT
  success_threshold: float = 0.0


def _no_target(_tick: int) -> PlayerEntity | None:
  return None


def _static_target(position: Vec3) -> Callable[[int], PlayerEntity | None]:

  def factory(_tick: int) -> PlayerEntity | None:
    return PlayerEntity(position=Vec3(float(position.x), float(position.y), float(position.z)), velocity=Vec3(0.0, 0.0, 0.0), yaw_deg=0.0, pitch_deg=0.0, on_ground=True, health=20.0, max_health=20.0)

  return factory


def _wander_actor(*, pos: tuple[float, float, float], health: float = 20.0, can_place: bool = False) -> AiPlayerState:
  return AiPlayerState(
    actor_id="sandbox_actor",
    mode=AI_MODE_WANDER,
    personality=AI_PERSONALITY_AGGRESSIVE,
    can_place_blocks=bool(can_place),
    pos_x=float(pos[0]),
    pos_y=float(pos[1]),
    pos_z=float(pos[2]),
    on_ground=True,
    health=float(health),
    max_health=20.0,
  )


def _run_episode(scenario: SandboxScenario, policy: Policy | None) -> dict[str, Any]:
  world = scenario.world_factory()
  manager = AiPlayerManager(world=world, block_registry=_registry(), settings=_settings(), warm_route_worker=False)
  manager.load_states([scenario.actor_state])
  coordinator = LearningCoordinator()
  coordinator.configure(mode=(LEARNING_RUNTIME_USE_LEARNED_POLICY if isinstance(policy, Policy) else LEARNING_RUNTIME_OFF), captured_kinds=(), policy=policy)
  initial_state = manager.actors()[0]
  initial_target = scenario.target_factory(0)
  initial_distance = None
  if initial_target is not None:
    initial_distance = float(((initial_target.position) - Vec3(float(initial_state.pos_x), float(initial_state.pos_y), float(initial_state.pos_z))).length())
  survived_ticks = 0
  final_distance = initial_distance
  last_pos = (float(initial_state.pos_x), float(initial_state.pos_y), float(initial_state.pos_z))
  alive = True
  for tick in range(int(scenario.ticks)):
    actors = manager.actors()
    if not actors:
      alive = False
      break
    target = scenario.target_factory(int(tick))
    manager.step(dt=float(scenario.dt), target_player=target, allow_pvp=True, learning=coordinator)
    actors_after = manager.actors()
    if not actors_after:
      alive = False
      break
    survived_ticks += 1
    actor = actors_after[0]
    last_pos = (float(actor.pos_x), float(actor.pos_y), float(actor.pos_z))
    if target is not None:
      final_distance = float((target.position - Vec3(float(actor.pos_x), float(actor.pos_y), float(actor.pos_z))).length())
  manager.shutdown()
  return {
    "task_id": str(scenario.task_id),
    "alive": bool(alive),
    "survived_ticks": int(survived_ticks),
    "total_ticks": int(scenario.ticks),
    "initial_distance": initial_distance,
    "final_distance": final_distance,
    "final_position": [float(value) for value in last_pos],
  }


def _survival_score(metrics: dict[str, Any]) -> float:
  total = max(1, int(metrics.get("total_ticks", 1)))
  ratio = float(int(metrics.get("survived_ticks", 0))) / float(total)
  return float(ratio) + (0.5 if bool(metrics.get("alive", False)) else 0.0)


def _retreat_score(metrics: dict[str, Any]) -> float:
  base = _survival_score(metrics)
  initial = metrics.get("initial_distance")
  final = metrics.get("final_distance")
  if initial is None or final is None:
    return float(base)
  return float(base) + float(max(-2.0, min(4.0, float(final) - float(initial))))


def _approach_score(metrics: dict[str, Any]) -> float:
  base = _survival_score(metrics)
  initial = metrics.get("initial_distance")
  final = metrics.get("final_distance")
  if initial is None or final is None:
    return float(base)
  return float(base) + float(max(-2.0, min(4.0, float(initial) - float(final))))


def default_scenarios() -> tuple[SandboxScenario, ...]:
  return (
    SandboxScenario(
      task_id="survive_flat", world_factory=lambda: _flat_world(), actor_state=_wander_actor(pos=(0.5, 1.0, 0.5)), target_factory=_no_target, score_fn=_survival_score, success_threshold=0.9
    ),
    SandboxScenario(
      task_id="avoid_void",
      world_factory=lambda: _flat_world(void_min_z=3),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5)),
      target_factory=_static_target(Vec3(0.5, 1.0, 8.0)),
      score_fn=_survival_score,
      success_threshold=0.9,
    ),
    SandboxScenario(
      task_id="retreat_at_low_health",
      world_factory=lambda: _flat_world(),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5), health=4.0),
      target_factory=_static_target(Vec3(0.5, 1.0, 2.5)),
      score_fn=_retreat_score,
      success_threshold=0.5,
    ),
    SandboxScenario(
      task_id="reach_target",
      world_factory=lambda: _flat_world(),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5)),
      target_factory=_static_target(Vec3(0.5, 1.0, 7.5)),
      score_fn=_approach_score,
      success_threshold=0.2,
    ),
    SandboxScenario(
      task_id="bridge_gap",
      world_factory=lambda: _gap_world(gap_lo=1, gap_hi=3),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5), can_place=True),
      target_factory=_static_target(Vec3(0.5, 1.0, 7.5)),
      score_fn=_approach_score,
      success_threshold=0.2,
    ),
  )


def _merge_weights(base: dict[str, dict[str, float]], delta: dict[str, dict[str, float]]) -> dict[str, dict[str, float]]:
  merged: dict[str, dict[str, float]] = {feature: dict(mapping) for feature, mapping in base.items()}
  for feature, mapping in delta.items():
    target = merged.setdefault(str(feature), {})
    for action_id, weight in mapping.items():
      target[str(action_id)] = float(target.get(str(action_id), 0.0)) + float(weight)
  return merged


def _candidate_perturbations() -> tuple[dict[str, dict[str, float]], ...]:
  return (
    {"combat:in_range": {"strafe_attack": 0.6}},
    {"combat:in_range": {"backpedal_attack": 0.6}},
    {"combat:in_range": {"attack": 0.5}},
    {"health:low": {"move_back": 0.7, "defensive_block": 0.4}},
    {"health:critical": {"move_back": 0.9}},
    {"hazard:void_ahead": {"stop": 0.8}},
    {"player:far": {"sprint": 0.5, "move_forward": 0.4}},
    {"player:mid": {"move_forward": 0.4}},
  )


def _aggregate_score(scenarios: tuple[SandboxScenario, ...], policy: Policy | None) -> tuple[float, list[dict[str, Any]]]:
  total = 0.0
  results: list[dict[str, Any]] = []
  for scenario in scenarios:
    metrics = _run_episode(scenario, policy)
    score = float(scenario.score_fn(metrics))
    total += float(score)
    entry = dict(metrics)
    entry["score"] = float(score)
    entry["success"] = bool(float(score) >= float(scenario.success_threshold))
    results.append(entry)
  return float(total), results


def _candidate_policy(weights: dict[str, dict[str, float]]) -> Policy:
  return Policy(
    policy_id="sandbox_candidate",
    policy_name="Sandbox Candidate",
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    feature_encoder_version=int(FEATURE_ENCODER_VERSION),
    action_catalog_version=int(ACTION_SCHEMA_VERSION),
    source=POLICY_SOURCE_SANDBOX,
    evaluation={"passed": True},
    action_weights=weights,
  )


@dataclass(frozen=True)
class SandboxTrainingResult:
  status: str
  message: str = ""
  policy: Policy | None = None
  baseline_score: float = 0.0
  policy_score: float = 0.0
  accepted: tuple[str, ...] = ()
  task_results: tuple[dict[str, Any], ...] = ()
  summary: dict[str, Any] = field(default_factory=dict)


def train_in_sandbox(*, policy_id: str, policy_name: str = "", base_policy: Policy | None = None, policy_version: int = 1, iterations: int = 1) -> SandboxTrainingResult:
  scenarios = default_scenarios()
  baseline_score, _baseline_results = _aggregate_score(scenarios, None)
  weights: dict[str, dict[str, float]] = {}
  if isinstance(base_policy, Policy) and base_policy.action_weights:
    weights = {feature: dict(mapping) for feature, mapping in base_policy.action_weights.items()}
  best_score, _best_results = _aggregate_score(scenarios, _candidate_policy(weights) if weights else None)
  accepted: list[str] = []
  candidates = _candidate_perturbations()
  for _iteration in range(max(1, int(iterations))):
    improved = False
    for delta in candidates:
      trial_weights = _merge_weights(weights, delta)
      trial_score, _trial_results = _aggregate_score(scenarios, _candidate_policy(trial_weights))
      if float(trial_score) > float(best_score) + 1e-6:
        weights = trial_weights
        best_score = float(trial_score)
        accepted.append("+".join(f"{feature}:{action}" for feature, mapping in delta.items() for action in mapping))
        improved = True
    if not improved:
      break

  policy_score, task_results = _aggregate_score(scenarios, _candidate_policy(weights) if weights else None)
  passed = bool(float(policy_score) >= float(baseline_score) - 1e-6) and bool(weights)
  skill_categories = tuple(sorted({str(action) for mapping in weights.values() for action in mapping}))
  if not weights:
    return SandboxTrainingResult(
      status="failed",
      message="Sandbox training did not find any improving modifier over the deterministic baseline.",
      policy=None,
      baseline_score=float(baseline_score),
      policy_score=float(policy_score),
      accepted=(),
      task_results=tuple(task_results),
      summary={"baseline_score": float(baseline_score), "policy_score": float(policy_score)},
    )
  policy = Policy(
    policy_id=str(policy_id),
    policy_name=str(policy_name or policy_id),
    policy_version=int(policy_version),
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    feature_encoder_version=int(FEATURE_ENCODER_VERSION),
    action_catalog_version=int(ACTION_SCHEMA_VERSION),
    source=POLICY_SOURCE_SANDBOX,
    skill_categories=skill_categories,
    evaluation={"passed": bool(passed), "baseline_score": float(baseline_score), "policy_score": float(policy_score), "source": "sandbox"},
    action_weights=weights,
    metadata={"accepted_modifiers": list(accepted), "iterations": int(iterations)},
  )
  return SandboxTrainingResult(
    status="completed",
    message=f"Sandbox training accepted {len(accepted)} modifier(s); policy score {policy_score:.3f} vs baseline {baseline_score:.3f}.",
    policy=policy,
    baseline_score=float(baseline_score),
    policy_score=float(policy_score),
    accepted=tuple(accepted),
    task_results=tuple(task_results),
    summary={"baseline_score": float(baseline_score), "policy_score": float(policy_score), "accepted": list(accepted)},
  )
