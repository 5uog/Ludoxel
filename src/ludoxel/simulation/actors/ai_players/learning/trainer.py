# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_CATALOG, ACTION_SCHEMA_VERSION
from ludoxel.simulation.actors.ai_players.learning.dataset import DemonstrationRecord
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_ENCODER_VERSION, is_feature_key
from ludoxel.simulation.actors.ai_players.learning.policy import POLICY_COMPATIBILITY_TARGET, POLICY_SCHEMA_VERSION, POLICY_SOURCE_PLAYER_DATA, Policy

TRAINING_SCHEMA_VERSION: int = 1

TRAINING_MODE_FROM_PLAYER_DATA: str = "train_from_player_data"
TRAINING_MODE_IN_SANDBOX: str = "train_in_sandbox"

TRAINING_STATUS_COMPLETED: str = "completed"
TRAINING_STATUS_FAILED: str = "failed"

TRAINING_STATUSES: tuple[str, ...] = (TRAINING_STATUS_COMPLETED, TRAINING_STATUS_FAILED)

ACTOR_KIND_PLAYER: str = "player"
ACTOR_KIND_AI: str = "ai"

PENALIZED_FAILURE_REASONS: frozenset[str] = frozenset({"death", "void_fall", "self_trap", "failed_route", "invalid_placement", "out_of_range_attack"})

_WEIGHT_SCALE: float = 0.6
_MIN_WEIGHT: float = 0.05
_MAX_WEIGHT: float = 1.5
_NEG_SCALE: float = 0.5
_MAX_NEG: float = 2.0
_PLAYER_EVIDENCE_WEIGHT: float = 1.0
_AI_SUCCESS_WEIGHT: float = 1.0
_AI_FAILURE_WEIGHT: float = 1.0


def _clamp(value: float, low: float, high: float) -> float:
  return float(min(float(high), max(float(low), float(value))))


@dataclass(frozen=True)
class TrainingRequest:
  mode: str
  dataset_id: str = "default"
  target_policy_id: str = ""
  target_policy_name: str = ""
  policy_version: int = 1
  skill_categories: tuple[str, ...] = ()
  parameters: dict[str, Any] = field(default_factory=dict)
  schema_version: int = TRAINING_SCHEMA_VERSION

  def to_dict(self) -> dict[str, Any]:
    return {
      "schema_version": int(self.schema_version),
      "mode": str(self.mode),
      "dataset_id": str(self.dataset_id),
      "target_policy_id": str(self.target_policy_id),
      "target_policy_name": str(self.target_policy_name),
      "policy_version": int(self.policy_version),
      "skill_categories": [str(value) for value in self.skill_categories],
      "parameters": dict(self.parameters or {}),
    }


@dataclass(frozen=True)
class TrainingResult:
  status: str
  message: str = ""
  policy_id: str = ""
  policy: Policy | None = None
  summary: dict[str, Any] = field(default_factory=dict)

  def to_dict(self) -> dict[str, Any]:
    return {"status": str(self.status), "message": str(self.message), "policy_id": str(self.policy_id), "summary": dict(self.summary or {})}


def _record_features(record: DemonstrationRecord) -> tuple[str, ...]:
  raw = record.detail.get("feature_keys") if isinstance(record.detail, dict) else None
  if not isinstance(raw, (list, tuple)):
    return ()
  return tuple(str(value) for value in raw if is_feature_key(value))


def _record_actor_kind(record: DemonstrationRecord) -> str:
  raw = record.detail.get("actor_kind") if isinstance(record.detail, dict) else None
  if str(raw) in (ACTOR_KIND_PLAYER, ACTOR_KIND_AI):
    return str(raw)
  return ACTOR_KIND_PLAYER if str(record.kind).startswith("player_") else ACTOR_KIND_AI


def train_policy_from_records(records: Iterable[DemonstrationRecord], *, policy_id: str, policy_name: str = "", dataset_id: str = "default", dataset_size: int = 0, policy_version: int = 1, source: str = POLICY_SOURCE_PLAYER_DATA, corrupt_lines: int = 0) -> TrainingResult:
  feature_action_pos: dict[tuple[str, str], float] = {}
  feature_action_neg: dict[tuple[str, str], float] = {}
  negative_action: dict[str, float] = {}
  action_total: dict[str, int] = {}
  used_records = 0
  invalid_action = 0
  featureless = 0
  player_records = 0
  ai_records = 0
  failure_reason_counts: dict[str, int] = {}

  for record in records:
    if not isinstance(record, DemonstrationRecord):
      continue
    action_id = None if record.action is None else str(record.action)
    if action_id is None or action_id not in ACTION_CATALOG:
      invalid_action += 1
      continue
    features = _record_features(record)
    if not features:
      featureless += 1
    actor_kind = _record_actor_kind(record)
    reward = 0.0 if record.reward is None else float(record.reward)
    failure_reason = record.detail.get("failure_reason") if isinstance(record.detail, dict) else None
    if failure_reason:
      failure_reason_counts[str(failure_reason)] = int(failure_reason_counts.get(str(failure_reason), 0)) + 1
      if str(failure_reason) in PENALIZED_FAILURE_REASONS:
        negative_action[action_id] = float(negative_action.get(action_id, 0.0)) + 1.0

    if actor_kind == ACTOR_KIND_PLAYER:
      player_records += 1
      weight = float(_PLAYER_EVIDENCE_WEIGHT) + max(0.0, float(reward))
      for feature in features:
        feature_action_pos[(feature, action_id)] = float(feature_action_pos.get((feature, action_id), 0.0)) + float(weight)
    else:
      ai_records += 1
      if record.success is True:
        weight = float(_AI_SUCCESS_WEIGHT) + max(0.0, float(reward))
        for feature in features:
          feature_action_pos[(feature, action_id)] = float(feature_action_pos.get((feature, action_id), 0.0)) + float(weight)
      elif record.success is False:
        weight = float(_AI_FAILURE_WEIGHT) + max(0.0, -float(reward))
        for feature in features:
          feature_action_neg[(feature, action_id)] = float(feature_action_neg.get((feature, action_id), 0.0)) + float(weight)
        negative_action[action_id] = float(negative_action.get(action_id, 0.0)) + 0.5
    action_total[action_id] = int(action_total.get(action_id, 0)) + 1
    used_records += 1

  if int(used_records) <= 0:
    return TrainingResult(
      status=TRAINING_STATUS_FAILED,
      message="No usable demonstration records were found. Record data in Observe Only mode before training.",
      policy_id=str(policy_id),
      policy=None,
      summary={"dataset_id": str(dataset_id), "dataset_size": int(dataset_size), "used_records": 0, "invalid_action": int(invalid_action), "corrupt_lines": int(corrupt_lines)},
    )

  action_weights: dict[str, dict[str, float]] = {}
  for (feature, action_id), pos in feature_action_pos.items():
    neg = float(feature_action_neg.get((feature, action_id), 0.0))
    total = float(pos) + float(neg)
    if total <= 0.0:
      continue
    net = (float(pos) - float(neg)) / float(total)
    weight = _clamp(float(net) * float(_WEIGHT_SCALE), -float(_MAX_WEIGHT), float(_MAX_WEIGHT))
    if float(weight) < float(_MIN_WEIGHT):
      continue
    action_weights.setdefault(str(feature), {})[str(action_id)] = float(weight)

  negative_modifiers: dict[str, float] = {}
  for action_id, count in negative_action.items():
    penalty = _clamp(float(count) * float(_NEG_SCALE) / max(1.0, float(action_total.get(action_id, 1))), 0.0, float(_MAX_NEG))
    if float(penalty) >= float(_MIN_WEIGHT):
      negative_modifiers[str(action_id)] = float(penalty)

  if not action_weights and not negative_modifiers:
    return TrainingResult(
      status=TRAINING_STATUS_FAILED,
      message="Demonstrations did not yield any feature-conditioned preference. Record more varied play before training.",
      policy_id=str(policy_id),
      policy=None,
      summary={"dataset_id": str(dataset_id), "dataset_size": int(dataset_size), "used_records": int(used_records), "featureless": int(featureless), "corrupt_lines": int(corrupt_lines)},
    )

  skill_categories = tuple(sorted({str(ACTION_CATALOG[action_id].skill_category) for mapping in action_weights.values() for action_id in mapping}))
  policy = Policy(
    policy_id=str(policy_id),
    policy_name=str(policy_name or policy_id),
    policy_version=int(policy_version),
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    feature_encoder_version=int(FEATURE_ENCODER_VERSION),
    action_catalog_version=int(ACTION_SCHEMA_VERSION),
    source=str(source),
    source_dataset_id=str(dataset_id),
    source_dataset_size=int(dataset_size),
    skill_categories=skill_categories,
    evaluation={},
    action_weights=action_weights,
    negative_modifiers=negative_modifiers,
    metadata={"used_records": int(used_records), "player_records": int(player_records), "ai_records": int(ai_records), "featureless": int(featureless), "failure_reasons": dict(failure_reason_counts)},
  )
  summary = {
    "dataset_id": str(dataset_id),
    "dataset_size": int(dataset_size),
    "used_records": int(used_records),
    "player_records": int(player_records),
    "ai_records": int(ai_records),
    "invalid_action": int(invalid_action),
    "featureless": int(featureless),
    "corrupt_lines": int(corrupt_lines),
    "feature_count": len(action_weights),
    "weighted_actions": len({action_id for mapping in action_weights.values() for action_id in mapping}),
    "negative_modifiers": len(negative_modifiers),
  }
  return TrainingResult(status=TRAINING_STATUS_COMPLETED, message=f"Trained policy from {int(used_records)} records.", policy_id=str(policy_id), policy=policy, summary=summary)


@dataclass(frozen=True)
class TrainingService:
  def train_from_player_data(self, records: Iterable[DemonstrationRecord], *, policy_id: str, policy_name: str = "", dataset_id: str = "default", dataset_size: int = 0, policy_version: int = 1, corrupt_lines: int = 0) -> TrainingResult:
    return train_policy_from_records(records, policy_id=str(policy_id), policy_name=str(policy_name), dataset_id=str(dataset_id), dataset_size=int(dataset_size), policy_version=int(policy_version), source=POLICY_SOURCE_PLAYER_DATA, corrupt_lines=int(corrupt_lines))
