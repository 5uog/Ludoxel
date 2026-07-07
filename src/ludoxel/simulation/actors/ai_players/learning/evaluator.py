# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.action_mask import build_action_mask
from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_CATALOG
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import encode_features, is_feature_key
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation, DirectionProbe
from ludoxel.simulation.actors.ai_players.learning.policy import POLICY_COMPATIBILITY_TARGET, POLICY_SCHEMA_VERSION, DeterministicPolicy, Policy

EVALUATION_SCHEMA_VERSION: int = 1

EVALUATION_STATUS_PASSED: str = "passed"
EVALUATION_STATUS_FAILED: str = "failed"

EVALUATION_STATUSES: tuple[str, ...] = (EVALUATION_STATUS_PASSED, EVALUATION_STATUS_FAILED)

TASK_SCHEMA_VALIDATION: str = "schema_validation"
TASK_COMPATIBILITY_VALIDATION: str = "compatibility_validation"
TASK_ACTION_CATALOG_VALIDATION: str = "action_catalog_validation"
TASK_FEATURE_ENCODER_VALIDATION: str = "feature_encoder_validation"
TASK_MASK_COMPLIANCE: str = "mask_compliance"
TASK_SANDBOX_BEHAVIOR: str = "sandbox_behavior"


@dataclass(frozen=True)
class EvaluationTask:
  task_id: str
  name: str
  description: str

  def to_dict(self) -> dict[str, Any]:
    return {"task_id": str(self.task_id), "name": str(self.name), "description": str(self.description)}


EVALUATION_TASKS: tuple[EvaluationTask, ...] = (
  EvaluationTask(task_id=TASK_SCHEMA_VALIDATION, name="Schema validation", description="The policy schema version matches the engine's policy schema."),
  EvaluationTask(task_id=TASK_COMPATIBILITY_VALIDATION, name="Compatibility validation", description="The policy compatibility target, feature encoder, and action catalog versions match the engine."),
  EvaluationTask(task_id=TASK_ACTION_CATALOG_VALIDATION, name="Action catalog validation", description="Every action referenced by the policy exists in the action catalog."),
  EvaluationTask(task_id=TASK_FEATURE_ENCODER_VALIDATION, name="Feature encoder validation", description="Every feature key referenced by the policy is produced by the feature encoder."),
  EvaluationTask(task_id=TASK_MASK_COMPLIANCE, name="Mask compliance", description="Across sample observations the policy never selects an action forbidden by the action mask."),
  EvaluationTask(task_id=TASK_SANDBOX_BEHAVIOR, name="Sandbox behavior", description="The policy scores at least as well as the deterministic baseline across the headless sandbox tasks."),
)


@dataclass(frozen=True)
class EvaluationResult:
  task_id: str
  status: str
  summary: str = ""
  score: float | None = None
  detail: dict[str, Any] = field(default_factory=dict)

  def passed(self) -> bool:
    return str(self.status) == EVALUATION_STATUS_PASSED

  def to_dict(self) -> dict[str, Any]:
    return {"task_id": str(self.task_id), "status": str(self.status), "summary": str(self.summary), "score": (None if self.score is None else float(self.score)), "detail": dict(self.detail or {})}


@dataclass(frozen=True)
class EvaluationReport:
  policy_id: str = ""
  results: tuple[EvaluationResult, ...] = ()
  passed: bool = False
  score: float = 0.0
  baseline_score: float = 0.0
  policy_score: float = 0.0
  mask_violations: int = 0
  schema_errors: tuple[str, ...] = ()
  compatibility_errors: tuple[str, ...] = ()
  decision_diff: tuple[dict[str, Any], ...] = ()
  created_at: str = ""
  schema_version: int = EVALUATION_SCHEMA_VERSION

  def to_dict(self) -> dict[str, Any]:
    return {
      "schema_version": int(self.schema_version),
      "policy_id": str(self.policy_id),
      "passed": bool(self.passed),
      "score": float(self.score),
      "baseline_score": float(self.baseline_score),
      "policy_score": float(self.policy_score),
      "mask_violations": int(self.mask_violations),
      "schema_errors": [str(value) for value in self.schema_errors],
      "compatibility_errors": [str(value) for value in self.compatibility_errors],
      "decision_diff": [dict(row) for row in self.decision_diff],
      "created_at": str(self.created_at),
      "results": [result.to_dict() for result in self.results],
    }


def describe_tasks() -> tuple[EvaluationTask, ...]:
  return EVALUATION_TASKS


def _flat_directions() -> dict[str, DirectionProbe]:
  return {name: DirectionProbe(direction=name, standable_step=True, headroom_clear=True, is_void=False, drop_depth=0, can_place_support=True) for name in ("n", "s", "e", "w", "ne", "nw", "se", "sw")}


def _void_directions() -> dict[str, DirectionProbe]:
  return {name: DirectionProbe(direction=name, is_void=True) for name in ("n", "s", "e", "w", "ne", "nw", "se", "sw")}


def _sample_observations() -> tuple[AiObservation, ...]:
  return (
    AiObservation(visible_player=True, attack_in_range=True, attack_cooldown_ready=True, on_ground=True, jump_available=True, distance_to_player=2.0, health=20.0, max_health=20.0, directions=_flat_directions()),
    AiObservation(visible_player=True, attack_in_range=True, attack_cooldown_ready=True, on_ground=True, jump_available=True, distance_to_player=2.0, health=4.0, max_health=20.0, low_health=True, low_health_in_threat=True, directions=_flat_directions()),
    AiObservation(visible_player=True, attack_in_range=False, distance_to_player=8.0, on_ground=True, jump_available=True, health=20.0, max_health=20.0, can_place_blocks=True, available_block_count=999, directions=_flat_directions()),
    AiObservation(route_present=True, route_blocked=True, route_target=(5.0, 1.0, 5.0), on_ground=True, jump_available=True, can_place_blocks=True, available_block_count=999, directions=_flat_directions()),
    AiObservation(on_ground=True, jump_available=True, directions=_void_directions()),
  )


def _validate_schema(policy: Policy) -> tuple[EvaluationResult, list[str]]:
  errors: list[str] = []
  if int(policy.schema_version) != int(POLICY_SCHEMA_VERSION):
    errors.append(f"policy schema_version {int(policy.schema_version)} != engine {int(POLICY_SCHEMA_VERSION)}")
  status = EVALUATION_STATUS_PASSED if not errors else EVALUATION_STATUS_FAILED
  return EvaluationResult(task_id=TASK_SCHEMA_VALIDATION, status=status, summary=("Schema version matches." if not errors else "; ".join(errors))), errors


def _validate_compatibility(policy: Policy) -> tuple[EvaluationResult, list[str]]:
  errors: list[str] = []
  if str(policy.compatibility_target) != str(POLICY_COMPATIBILITY_TARGET):
    errors.append(f"compatibility_target '{policy.compatibility_target}' != '{POLICY_COMPATIBILITY_TARGET}'")
  from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_SCHEMA_VERSION
  from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_ENCODER_VERSION

  if int(policy.feature_encoder_version) not in (0, int(FEATURE_ENCODER_VERSION)):
    errors.append(f"feature_encoder_version {int(policy.feature_encoder_version)} != {int(FEATURE_ENCODER_VERSION)}")
  if int(policy.action_catalog_version) not in (0, int(ACTION_SCHEMA_VERSION)):
    errors.append(f"action_catalog_version {int(policy.action_catalog_version)} != {int(ACTION_SCHEMA_VERSION)}")
  status = EVALUATION_STATUS_PASSED if not errors else EVALUATION_STATUS_FAILED
  return EvaluationResult(task_id=TASK_COMPATIBILITY_VALIDATION, status=status, summary=("Compatible with the engine." if not errors else "; ".join(errors))), errors


def _validate_action_catalog(policy: Policy) -> EvaluationResult:
  unknown: list[str] = []
  for mapping in policy.action_weights.values():
    unknown.extend(action_id for action_id in mapping if action_id not in ACTION_CATALOG)
  unknown.extend(action_id for action_id in policy.negative_modifiers if action_id not in ACTION_CATALOG)
  unknown.extend(action_id for action_id in policy.action_weight_overrides if action_id not in ACTION_CATALOG)
  unknown = sorted(set(unknown))
  status = EVALUATION_STATUS_PASSED if not unknown else EVALUATION_STATUS_FAILED
  summary = "All referenced actions exist." if not unknown else f"Unknown actions: {', '.join(unknown)}"
  return EvaluationResult(task_id=TASK_ACTION_CATALOG_VALIDATION, status=status, summary=summary, detail={"unknown_actions": unknown})


def _validate_feature_encoder(policy: Policy) -> EvaluationResult:
  unknown = sorted({str(feature) for feature in policy.action_weights if not is_feature_key(feature)})
  status = EVALUATION_STATUS_PASSED if not unknown else EVALUATION_STATUS_FAILED
  summary = "All feature keys are valid." if not unknown else f"Unknown feature keys: {', '.join(unknown)}"
  return EvaluationResult(task_id=TASK_FEATURE_ENCODER_VALIDATION, status=status, summary=summary, detail={"unknown_features": unknown})


def _check_mask_compliance(policy: Policy) -> tuple[EvaluationResult, int]:
  deterministic = DeterministicPolicy()
  violations = 0
  for observation in _sample_observations():
    mask = build_action_mask(observation)
    decision = deterministic.decide(observation, mask, policy)
    if not mask.is_allowed(decision.action_id):
      violations += 1
  status = EVALUATION_STATUS_PASSED if int(violations) == 0 else EVALUATION_STATUS_FAILED
  summary = "No mask violations across sample observations." if violations == 0 else f"{int(violations)} mask violation(s) detected."
  return EvaluationResult(task_id=TASK_MASK_COMPLIANCE, status=status, summary=summary, detail={"violations": int(violations)}), int(violations)


def _decision_diff(policy: Policy) -> tuple[dict[str, Any], ...]:
  deterministic = DeterministicPolicy()
  rows: list[dict[str, Any]] = []
  for observation in _sample_observations():
    mask = build_action_mask(observation)
    baseline_action = deterministic.decide(observation, mask, None).action_id
    learned_action = deterministic.decide(observation, mask, policy).action_id
    rows.append({"features": list(encode_features(observation)), "baseline_action": str(baseline_action), "learned_action": str(learned_action), "changed": bool(baseline_action != learned_action)})
  return tuple(rows)


def run_evaluation(policy: Policy | None = None) -> EvaluationReport:
  from ludoxel.simulation.actors.ai_players.learning.policy import builtin_deterministic_policy

  effective_policy = policy if isinstance(policy, Policy) else builtin_deterministic_policy()
  results: list[EvaluationResult] = []

  schema_result, schema_errors = _validate_schema(effective_policy)
  compatibility_result, compatibility_errors = _validate_compatibility(effective_policy)
  catalog_result = _validate_action_catalog(effective_policy)
  feature_result = _validate_feature_encoder(effective_policy)
  mask_result, mask_violations = _check_mask_compliance(effective_policy)
  results.extend([schema_result, compatibility_result, catalog_result, feature_result, mask_result])

  from ludoxel.simulation.actors.ai_players.learning.sandbox import _aggregate_score, default_scenarios

  scenarios = default_scenarios()
  baseline_score, _baseline_results = _aggregate_score(scenarios, None)
  policy_score, sandbox_results = _aggregate_score(scenarios, effective_policy if bool(effective_policy.is_usable() or effective_policy.action_weights) else None)
  sandbox_passed = bool(float(policy_score) >= float(baseline_score) - 1e-6)
  results.append(
    EvaluationResult(
      task_id=TASK_SANDBOX_BEHAVIOR,
      status=(EVALUATION_STATUS_PASSED if bool(sandbox_passed) else EVALUATION_STATUS_FAILED),
      summary=f"Policy score {policy_score:.3f} vs baseline {baseline_score:.3f}.",
      score=float(policy_score),
      detail={"baseline_score": float(baseline_score), "policy_score": float(policy_score), "tasks": list(sandbox_results)},
    )
  )

  passed = all(result.passed() for result in results)
  return EvaluationReport(
    policy_id=str(effective_policy.policy_id),
    results=tuple(results),
    passed=bool(passed),
    score=float(policy_score),
    baseline_score=float(baseline_score),
    policy_score=float(policy_score),
    mask_violations=int(mask_violations),
    schema_errors=tuple(schema_errors),
    compatibility_errors=tuple(compatibility_errors),
    decision_diff=_decision_diff(effective_policy),
    created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
  )
