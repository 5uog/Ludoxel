# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.foundations.mathematics.scalars.coercion import coerce_bool, coerce_int, mapping_str
from ludoxel.simulation.actors.ai_players.learning.actions import skill_category_ids
from ludoxel.simulation.actors.ai_players.learning.dataset import RECORD_KINDS
from ludoxel.simulation.actors.ai_players.learning.policy_registry import POLICY_KIND_BUILTIN, normalize_policy_kind

AI_LEARNING_SCHEMA_VERSION: int = 1

LEARNING_MODE_OFF: str = "off"
LEARNING_MODE_OBSERVE_ONLY: str = "observe_only"
LEARNING_MODE_USE_LEARNED_POLICY: str = "use_learned_policy"
LEARNING_MODE_TRAIN_FROM_PLAYER_DATA: str = "train_from_player_data"
LEARNING_MODE_TRAIN_IN_SANDBOX: str = "train_in_sandbox"

LEARNING_MODES: tuple[str, ...] = (LEARNING_MODE_OFF, LEARNING_MODE_OBSERVE_ONLY, LEARNING_MODE_USE_LEARNED_POLICY, LEARNING_MODE_TRAIN_FROM_PLAYER_DATA, LEARNING_MODE_TRAIN_IN_SANDBOX)

ACTIVE_LEARNING_MODES: tuple[str, ...] = (LEARNING_MODE_OFF, LEARNING_MODE_OBSERVE_ONLY, LEARNING_MODE_USE_LEARNED_POLICY)

_LEARNING_MODE_SET: frozenset[str] = frozenset(LEARNING_MODES)


def normalize_learning_mode(value: object) -> str:
  raw = str(value).strip().lower()
  if raw in _LEARNING_MODE_SET:
    return raw
  return LEARNING_MODE_OFF


def is_active_learning_mode(mode: object) -> bool:
  return normalize_learning_mode(mode) in ACTIVE_LEARNING_MODES


def _normalize_flag_map(value: object, *, keys: tuple[str, ...], default: bool) -> dict[str, bool]:
  source = value if isinstance(value, dict) else {}
  return {str(key): coerce_bool(source.get(str(key), default), bool(default)) for key in keys}


@dataclass(frozen=True)
class PersistedAiLearningSettings:
  learning_mode: str = LEARNING_MODE_OFF
  capture_flags: dict[str, bool] = field(default_factory=dict)
  skill_flags: dict[str, bool] = field(default_factory=dict)
  selected_policy_kind: str = POLICY_KIND_BUILTIN
  selected_policy_id: str = ""
  dataset_id: str = "default"

  def normalized(self) -> "PersistedAiLearningSettings":
    dataset_id = str(self.dataset_id).strip() or "default"
    return PersistedAiLearningSettings(
      learning_mode=normalize_learning_mode(self.learning_mode),
      capture_flags=_normalize_flag_map(self.capture_flags, keys=RECORD_KINDS, default=False),
      skill_flags=_normalize_flag_map(self.skill_flags, keys=skill_category_ids(), default=True),
      selected_policy_kind=normalize_policy_kind(self.selected_policy_kind),
      selected_policy_id=str(self.selected_policy_id).strip(),
      dataset_id=str(dataset_id),
    )

  def recording_enabled(self) -> bool:
    return normalize_learning_mode(self.learning_mode) == LEARNING_MODE_OBSERVE_ONLY

  def captured_kinds(self) -> tuple[str, ...]:
    if not self.recording_enabled():
      return ()
    normalized = _normalize_flag_map(self.capture_flags, keys=RECORD_KINDS, default=False)
    return tuple(kind for kind in RECORD_KINDS if bool(normalized.get(kind, False)))

  def to_dict(self) -> dict[str, Any]:
    normalized = self.normalized()
    return {
      "learning_mode": str(normalized.learning_mode),
      "observe_only": bool(normalized.recording_enabled()),
      "capture_flags": {str(key): bool(value) for key, value in normalized.capture_flags.items()},
      "skill_flags": {str(key): bool(value) for key, value in normalized.skill_flags.items()},
      "selected_policy_kind": str(normalized.selected_policy_kind),
      "selected_policy_id": str(normalized.selected_policy_id),
      "dataset_id": str(normalized.dataset_id),
    }

  @staticmethod
  def from_dict(data: object) -> "PersistedAiLearningSettings":
    if not isinstance(data, dict):
      return PersistedAiLearningSettings().normalized()
    capture = data.get("capture_flags")
    skills = data.get("skill_flags")
    return PersistedAiLearningSettings(
      learning_mode=mapping_str(data, "learning_mode", LEARNING_MODE_OFF),
      capture_flags=dict(capture) if isinstance(capture, dict) else {},
      skill_flags=dict(skills) if isinstance(skills, dict) else {},
      selected_policy_kind=mapping_str(data, "selected_policy_kind", POLICY_KIND_BUILTIN),
      selected_policy_id=mapping_str(data, "selected_policy_id", "").strip(),
      dataset_id=mapping_str(data, "dataset_id", "default"),
    ).normalized()


@dataclass(frozen=True)
class PersistedAiLearningState:
  settings: PersistedAiLearningSettings = field(default_factory=PersistedAiLearningSettings)
  dataset_summary: dict[str, Any] = field(default_factory=dict)
  last_training_summary: dict[str, Any] = field(default_factory=dict)
  last_evaluation_summary: dict[str, Any] = field(default_factory=dict)
  policy_version: int = 0
  schema_version: int = AI_LEARNING_SCHEMA_VERSION

  @staticmethod
  def default() -> "PersistedAiLearningState":
    return PersistedAiLearningState(settings=PersistedAiLearningSettings().normalized())

  def to_dict(self) -> dict[str, Any]:
    return {
      "schema_version": int(self.schema_version),
      "settings": self.settings.to_dict(),
      "dataset_summary": dict(self.dataset_summary or {}),
      "last_training_summary": dict(self.last_training_summary or {}),
      "last_evaluation_summary": dict(self.last_evaluation_summary or {}),
      "policy_version": int(self.policy_version),
    }

  @staticmethod
  def from_dict(data: object) -> "PersistedAiLearningState":
    if not isinstance(data, dict):
      return PersistedAiLearningState.default()
    dataset_summary = data.get("dataset_summary")
    training_summary = data.get("last_training_summary")
    evaluation_summary = data.get("last_evaluation_summary")
    return PersistedAiLearningState(
      settings=PersistedAiLearningSettings.from_dict(data.get("settings")),
      dataset_summary=dict(dataset_summary) if isinstance(dataset_summary, dict) else {},
      last_training_summary=dict(training_summary) if isinstance(training_summary, dict) else {},
      last_evaluation_summary=dict(evaluation_summary) if isinstance(evaluation_summary, dict) else {},
      policy_version=max(0, coerce_int(data.get("policy_version", 0), 0)),
      schema_version=coerce_int(data.get("schema_version", AI_LEARNING_SCHEMA_VERSION), int(AI_LEARNING_SCHEMA_VERSION)),
    )
