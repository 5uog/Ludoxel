# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.actors.ai_players.learning.action_mask import AiActionMask, build_action_mask
from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_CATALOG, ACTION_CATEGORIES, ACTION_IDS, SKILL_CATEGORIES, AiAction, actions_in_category, get_action, skill_category_ids
from ludoxel.simulation.actors.ai_players.learning.coordinator import LearningCoordinator
from ludoxel.simulation.actors.ai_players.learning.dataset import (
  DATASET_SCHEMA_VERSION,
  RECORD_KINDS,
  DatasetSink,
  DatasetSummary,
  DemonstrationRecord,
  decode_record_line,
  encode_record_line,
  is_record_kind,
)
from ludoxel.simulation.actors.ai_players.learning.evaluator import EVALUATION_TASKS, EvaluationReport, EvaluationResult, EvaluationTask, describe_tasks, run_evaluation
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_ENCODER_VERSION, FEATURE_KEYS, encode_features, is_feature_key
from ludoxel.simulation.actors.ai_players.learning.observation import OBSERVATION_SCHEMA_VERSION, AiObservation, DirectionProbe, NeighborhoodProbe, build_neighborhood
from ludoxel.simulation.actors.ai_players.learning.policy import (
  POLICY_COMPATIBILITY_TARGET,
  POLICY_SCHEMA_VERSION,
  DeterministicPolicy,
  Policy,
  PolicyDecision,
  builtin_deterministic_policy,
  load_policy,
)
from ludoxel.simulation.actors.ai_players.learning.policy_registry import (
  POLICY_KIND_BUILTIN,
  POLICY_KIND_BUNDLED,
  POLICY_KIND_EXPERIMENTAL,
  POLICY_KIND_LABELS,
  POLICY_KIND_USER,
  PolicyRegistry,
  normalize_policy_kind,
)
from ludoxel.simulation.actors.ai_players.learning.recorder import DemonstrationRecorder
from ludoxel.simulation.actors.ai_players.learning.rewards import RewardTransition, RewardWeights, compute_step_reward
from ludoxel.simulation.actors.ai_players.learning.trainer import TrainingRequest, TrainingResult, TrainingService, train_policy_from_records

__all__ = [
  "ACTION_CATALOG",
  "ACTION_CATEGORIES",
  "ACTION_IDS",
  "DATASET_SCHEMA_VERSION",
  "EVALUATION_TASKS",
  "FEATURE_ENCODER_VERSION",
  "FEATURE_KEYS",
  "OBSERVATION_SCHEMA_VERSION",
  "POLICY_COMPATIBILITY_TARGET",
  "POLICY_KIND_BUILTIN",
  "POLICY_KIND_BUNDLED",
  "POLICY_KIND_EXPERIMENTAL",
  "POLICY_KIND_LABELS",
  "POLICY_KIND_USER",
  "POLICY_SCHEMA_VERSION",
  "RECORD_KINDS",
  "SKILL_CATEGORIES",
  "AiAction",
  "AiActionMask",
  "AiObservation",
  "DatasetSink",
  "DatasetSummary",
  "DemonstrationRecord",
  "DemonstrationRecorder",
  "DeterministicPolicy",
  "DirectionProbe",
  "EvaluationReport",
  "EvaluationResult",
  "EvaluationTask",
  "LearningCoordinator",
  "NeighborhoodProbe",
  "Policy",
  "PolicyDecision",
  "PolicyRegistry",
  "RewardTransition",
  "RewardWeights",
  "TrainingRequest",
  "TrainingResult",
  "TrainingService",
  "actions_in_category",
  "build_action_mask",
  "build_neighborhood",
  "builtin_deterministic_policy",
  "compute_step_reward",
  "decode_record_line",
  "describe_tasks",
  "encode_features",
  "encode_record_line",
  "get_action",
  "is_feature_key",
  "is_record_kind",
  "load_policy",
  "normalize_policy_kind",
  "run_evaluation",
  "skill_category_ids",
  "train_policy_from_records",
]
