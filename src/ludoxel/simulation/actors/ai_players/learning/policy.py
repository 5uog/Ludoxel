# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.action_mask import AiActionMask, build_action_mask
from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_CATALOG, ACTION_IDS, ACTION_SCHEMA_VERSION
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_ENCODER_VERSION, encode_features
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation

POLICY_SCHEMA_VERSION: int = 1
POLICY_COMPATIBILITY_TARGET: str = "ludoxel.ai.v1"

POLICY_ID_BUILTIN: str = "builtin_deterministic"

POLICY_SOURCE_BUILTIN: str = "builtin"
POLICY_SOURCE_BUNDLED: str = "bundled"
POLICY_SOURCE_PLAYER_DATA: str = "player_data"
POLICY_SOURCE_SANDBOX: str = "sandbox"


@dataclass(frozen=True)
class Policy:
  policy_id: str
  policy_name: str = ""
  policy_version: int = 1
  schema_version: int = POLICY_SCHEMA_VERSION
  compatibility_target: str = POLICY_COMPATIBILITY_TARGET
  feature_encoder_version: int = 0
  action_catalog_version: int = 0
  compatible_ludoxel_version: str = ""
  created_at: str = ""
  source: str = POLICY_SOURCE_BUNDLED
  source_dataset_id: str = ""
  source_dataset_size: int = 0
  skill_categories: tuple[str, ...] = ()
  evaluation: dict[str, Any] = field(default_factory=dict)
  action_weights: dict[str, dict[str, float]] = field(default_factory=dict)
  utility_modifiers: dict[str, float] = field(default_factory=dict)
  negative_modifiers: dict[str, float] = field(default_factory=dict)
  action_weight_overrides: dict[str, float] = field(default_factory=dict)
  utility_score_modifiers: dict[str, float] = field(default_factory=dict)
  metadata: dict[str, Any] = field(default_factory=dict)

  def is_usable(self) -> bool:
    if int(self.schema_version) != int(POLICY_SCHEMA_VERSION):
      return False
    if str(self.compatibility_target) != str(POLICY_COMPATIBILITY_TARGET):
      return False
    if int(self.feature_encoder_version) not in (0, int(FEATURE_ENCODER_VERSION)):
      return False
    if int(self.action_catalog_version) not in (0, int(ACTION_SCHEMA_VERSION)):
      return False
    return bool(self.evaluation.get("passed", False))

  def to_dict(self) -> dict[str, Any]:
    return {
      "schema_version": int(self.schema_version),
      "policy_id": str(self.policy_id),
      "policy_name": str(self.policy_name),
      "policy_version": int(self.policy_version),
      "compatibility_target": str(self.compatibility_target),
      "feature_encoder_version": int(self.feature_encoder_version),
      "action_catalog_version": int(self.action_catalog_version),
      "compatible_ludoxel_version": str(self.compatible_ludoxel_version),
      "created_at": str(self.created_at),
      "source": str(self.source),
      "source_dataset_id": str(self.source_dataset_id),
      "source_dataset_size": int(self.source_dataset_size),
      "skill_categories": [str(value) for value in self.skill_categories],
      "evaluation": dict(self.evaluation or {}),
      "action_weights": {str(feature): {str(action): float(weight) for action, weight in (mapping or {}).items()} for feature, mapping in (self.action_weights or {}).items()},
      "utility_modifiers": {str(key): float(value) for key, value in (self.utility_modifiers or {}).items()},
      "negative_modifiers": {str(key): float(value) for key, value in (self.negative_modifiers or {}).items()},
      "action_weight_overrides": {str(key): float(value) for key, value in (self.action_weight_overrides or {}).items()},
      "utility_score_modifiers": {str(key): float(value) for key, value in (self.utility_score_modifiers or {}).items()},
      "metadata": dict(self.metadata or {}),
    }


def _coerce_weight_map(value: object) -> dict[str, float]:
  if not isinstance(value, dict):
    return {}
  result: dict[str, float] = {}
  for key, raw in value.items():
    try:
      result[str(key)] = float(raw)
    except (TypeError, ValueError):
      continue
  return result


def _coerce_feature_weights(value: object) -> dict[str, dict[str, float]]:
  if not isinstance(value, dict):
    return {}
  result: dict[str, dict[str, float]] = {}
  for feature, mapping in value.items():
    inner = _coerce_weight_map(mapping)
    if inner:
      result[str(feature)] = inner
  return result


def load_policy(data: object) -> Policy | None:
  if not isinstance(data, dict):
    return None
  policy_id = str(data.get("policy_id", "")).strip()
  if not policy_id:
    return None
  try:
    schema_version = int(data.get("schema_version", 0))
  except (TypeError, ValueError):
    return None
  try:
    policy_version = int(data.get("policy_version", 1))
  except (TypeError, ValueError):
    policy_version = 1
  raw_skills = data.get("skill_categories", ())
  skills = tuple(str(value) for value in raw_skills) if isinstance(raw_skills, (list, tuple)) else ()
  evaluation = data.get("evaluation")
  if not isinstance(evaluation, dict):
    evaluation = data.get("evaluation_summary")
  return Policy(
    policy_id=str(policy_id),
    policy_name=str(data.get("policy_name", policy_id)),
    policy_version=int(policy_version),
    schema_version=int(schema_version),
    compatibility_target=str(data.get("compatibility_target", "")),
    feature_encoder_version=_coerce_int(data.get("feature_encoder_version", 0)),
    action_catalog_version=_coerce_int(data.get("action_catalog_version", 0)),
    compatible_ludoxel_version=str(data.get("compatible_ludoxel_version", "")),
    created_at=str(data.get("created_at", "")),
    source=str(data.get("source", POLICY_SOURCE_BUNDLED)),
    source_dataset_id=str(data.get("source_dataset_id", "")),
    source_dataset_size=_coerce_int(data.get("source_dataset_size", 0)),
    skill_categories=skills,
    evaluation=dict(evaluation) if isinstance(evaluation, dict) else {},
    action_weights=_coerce_feature_weights(data.get("action_weights")),
    utility_modifiers=_coerce_weight_map(data.get("utility_modifiers")),
    negative_modifiers=_coerce_weight_map(data.get("negative_modifiers")),
    action_weight_overrides=_coerce_weight_map(data.get("action_weight_overrides")),
    utility_score_modifiers=_coerce_weight_map(data.get("utility_score_modifiers")),
    metadata=dict(data.get("metadata")) if isinstance(data.get("metadata"), dict) else {},
  )


def _coerce_int(value: object) -> int:
  try:
    return int(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    return 0


@dataclass(frozen=True)
class PolicyDecision:
  action_id: str
  utility: float
  ranked: tuple[tuple[str, float], ...]
  source: str


class DeterministicPolicy:
  def __init__(self, *, low_health_fraction: float = 0.35) -> None:
    self._low_health_fraction = float(low_health_fraction)

  def decide(self, observation: AiObservation, mask: AiActionMask | None = None, policy: Policy | None = None) -> PolicyDecision:
    effective_mask = mask if isinstance(mask, AiActionMask) else build_action_mask(observation)
    scores = self._baseline_scores(observation, effective_mask)
    source = "deterministic"
    if isinstance(policy, Policy):
      self._apply_policy(scores, observation, policy)
      source = "deterministic+policy"
    if not scores:
      return PolicyDecision(action_id="no_op", utility=0.0, ranked=(("no_op", 0.0),), source=str(source))
    order_index = {action_id: index for index, action_id in enumerate(ACTION_IDS)}
    ranked = tuple(sorted(scores.items(), key=lambda item: (-float(item[1]), int(order_index.get(item[0], 1_000_000)))))
    best_action, best_score = ranked[0]
    return PolicyDecision(action_id=str(best_action), utility=float(best_score), ranked=ranked, source=str(source))

  def _is_low_health(self, observation: AiObservation) -> bool:
    if bool(observation.low_health):
      return True
    if float(observation.max_health) <= 0.0:
      return False
    return float(observation.health) <= float(observation.max_health) * float(self._low_health_fraction)

  def _boxed_score(self, observation: AiObservation) -> int:
    return sum(1 for probe in observation.directions.values() if not bool(probe.standable_step))

  def _baseline_scores(self, observation: AiObservation, mask: AiActionMask) -> dict[str, float]:
    allowed = mask.allowed
    scores: dict[str, float] = {action_id: 0.0 for action_id in ACTION_IDS if action_id in allowed}
    if not scores:
      return scores

    def add(action_id: str, value: float) -> None:
      if action_id in scores:
        scores[action_id] += float(value)

    add("look_at_target", 0.30)
    add("turn_left", 0.05)
    add("turn_right", 0.05)
    add("no_op", 0.02)
    add("stop", 0.02)
    add("sneak", 0.04)

    visible = bool(observation.visible_player)
    low_health = self._is_low_health(observation)
    boxed = self._boxed_score(observation)

    if visible and bool(observation.attack_in_range) and bool(observation.attack_cooldown_ready):
      add("attack", 1.40)
      add("strafe_attack", 1.05)
      add("backpedal_attack", 0.95)
      add("look_at_target", 0.60)
    elif visible:
      add("look_at_target", 0.80)
      add("move_forward", 1.20)
      add("sprint", 0.95)
      add("move_forward_left", 0.70)
      add("move_forward_right", 0.70)
      add("parkour_jump", 0.30)

    if low_health and (bool(observation.low_health_in_threat) or visible):
      add("backpedal_attack", 1.15)
      add("strafe_attack", 1.10)
      add("move_back", 1.00)
      add("move_back_left", 0.85)
      add("move_back_right", 0.85)
      add("defensive_block", 1.20)
      add("escape_break_block", 0.70)
      add("escape_stack_block", 0.70)
      add("attack", 0.55)

    if bool(observation.route_present):
      if bool(observation.route_blocked):
        add("replan_route", 1.50)
        add("bridge_step", 1.00)
        add("escape_break_block", 0.90)
        add("escape_stack_block", 0.85)
        add("tower_step", 0.70)
        add("break_block", 0.60)
      else:
        add("follow_route", 1.30)
        add("look_at_block_target", 0.20)

    if int(boxed) >= 6:
      add("jump", 0.80)
      add("parkour_jump", 0.85)
      add("escape_stack_block", 1.00)
      add("escape_break_block", 0.95)
      add("toggle_fence_gate", 0.90)
      add("tower_step", 0.75)
      add("defensive_block", 0.40)

    if bool(observation.fence_gate_operable):
      add("toggle_fence_gate", 0.55)

    return scores

  def _apply_policy(self, scores: dict[str, float], observation: AiObservation, policy: Policy) -> None:
    features = encode_features(observation)
    for feature in features:
      mapping = policy.action_weights.get(feature)
      if not mapping:
        continue
      for action_id, weight in mapping.items():
        if action_id in scores:
          scores[action_id] += float(weight)
    for action_id, penalty in policy.negative_modifiers.items():
      if action_id in scores:
        scores[action_id] -= float(penalty)
    for action_id, override in policy.action_weight_overrides.items():
      if action_id in scores:
        scores[action_id] += float(override)
    feature_set = set(features)
    if policy.utility_score_modifiers or policy.utility_modifiers:
      for action_id in tuple(scores.keys()):
        action = ACTION_CATALOG.get(action_id)
        if action is None:
          continue
        scores[action_id] += float(policy.utility_score_modifiers.get(action.category, 0.0)) + float(policy.utility_score_modifiers.get(action.skill_category, 0.0))
        scores[action_id] += float(policy.utility_modifiers.get(action.category, 0.0)) + float(policy.utility_modifiers.get(action.skill_category, 0.0))
      for feature in feature_set:
        bonus = float(policy.utility_modifiers.get(feature, 0.0))
        if abs(bonus) <= 1e-12:
          continue
        for action_id in scores:
          scores[action_id] += float(bonus)


def builtin_deterministic_policy() -> Policy:
  return Policy(
    policy_id=str(POLICY_ID_BUILTIN),
    policy_name="Built-in Deterministic AI",
    policy_version=1,
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    feature_encoder_version=int(FEATURE_ENCODER_VERSION),
    action_catalog_version=int(ACTION_SCHEMA_VERSION),
    created_at="2026-06-15",
    source=POLICY_SOURCE_BUILTIN,
    evaluation={"passed": True, "note": "Built-in deterministic baseline; always available."},
  )
