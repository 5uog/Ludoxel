# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from dataclasses import replace
from pathlib import Path
from typing import Any, Protocol, runtime_checkable

from ludoxel.application.persistence.schema.ai_learning import PersistedAiLearningSettings, PersistedAiLearningState, normalize_learning_mode
from ludoxel.application.persistence.stores.ai_learning import AiLearningStore
from ludoxel.simulation.actors.ai_players.learning.dataset import DatasetSummary
from ludoxel.simulation.actors.ai_players.learning.evaluator import EvaluationReport, run_evaluation
from ludoxel.simulation.actors.ai_players.learning.policy import Policy, builtin_deterministic_policy, load_policy
from ludoxel.simulation.actors.ai_players.learning.policy_registry import POLICY_KIND_BUILTIN, POLICY_KIND_BUNDLED, POLICY_KIND_USER, PolicyRegistry, normalize_policy_kind
from ludoxel.simulation.actors.ai_players.learning.trainer import TrainingService

USER_PLAYER_POLICY_ID: str = "user_player_policy"
USER_SANDBOX_POLICY_ID: str = "user_sandbox_policy"


@runtime_checkable
class AiLearningTabController(Protocol):
  def state(self) -> PersistedAiLearningState: ...

  def set_learning_mode(self, mode: str) -> PersistedAiLearningState: ...

  def set_capture_flag(self, kind: str, enabled: bool) -> PersistedAiLearningState: ...

  def set_skill_flag(self, skill: str, enabled: bool) -> PersistedAiLearningState: ...

  def set_policy(self, kind: str, policy_id: str) -> PersistedAiLearningState: ...

  def bundled_policy_options(self) -> tuple[tuple[str, str], ...]: ...

  def user_policy_options(self) -> tuple[tuple[str, str], ...]: ...

  def dataset_summary(self) -> DatasetSummary: ...

  def run_minimal_evaluation(self) -> EvaluationReport: ...

  def train_from_player_data(self) -> dict[str, Any]: ...

  def train_in_sandbox(self) -> dict[str, Any]: ...

  def export_dataset(self, destination: str) -> int: ...

  def import_dataset(self, source: str) -> int: ...

  def clear_dataset(self) -> bool: ...

  def reset_learned_policy(self) -> PersistedAiLearningState: ...

  def restore_bundled_policy(self) -> PersistedAiLearningState: ...

  def policy_save_path(self) -> str: ...

  def evaluation_save_path(self) -> str: ...


class AiLearningController:
  def __init__(self, *, project_root: Path, data_root: Path | None = None) -> None:
    self._store = AiLearningStore(project_root=Path(project_root), data_root=(None if data_root is None else Path(data_root)))
    self._state = self._store.load_state()
    self._registry = PolicyRegistry(user_policy_loader=self._load_user_policy)
    self._last_policy_path: str = ""
    self._last_evaluation_path: str = ""

  def state(self) -> PersistedAiLearningState:
    return self._state

  def _load_user_policy(self, policy_id: str) -> Policy | None:
    data = self._store.load_policy_dict(str(policy_id))
    return load_policy(data) if isinstance(data, dict) else None

  def _save(self, settings: PersistedAiLearningSettings | None = None, **state_fields: Any) -> PersistedAiLearningState:
    next_settings = self._state.settings if settings is None else settings.normalized()
    self._state = replace(self._state, settings=next_settings, **state_fields)
    self._store.save_state(self._state)
    return self._state

  def set_learning_mode(self, mode: str) -> PersistedAiLearningState:
    return self._save(replace(self._state.settings, learning_mode=normalize_learning_mode(mode)))

  def set_capture_flag(self, kind: str, enabled: bool) -> PersistedAiLearningState:
    flags = dict(self._state.settings.capture_flags)
    flags[str(kind)] = bool(enabled)
    return self._save(replace(self._state.settings, capture_flags=flags))

  def set_skill_flag(self, skill: str, enabled: bool) -> PersistedAiLearningState:
    flags = dict(self._state.settings.skill_flags)
    flags[str(skill)] = bool(enabled)
    return self._save(replace(self._state.settings, skill_flags=flags))

  def set_policy(self, kind: str, policy_id: str) -> PersistedAiLearningState:
    return self._save(replace(self._state.settings, selected_policy_kind=normalize_policy_kind(kind), selected_policy_id=str(policy_id).strip()))

  def bundled_policy_options(self) -> tuple[tuple[str, str], ...]:
    return tuple((policy.policy_id, policy.policy_name) for policy in self._registry.bundled_policies())

  def user_policy_options(self) -> tuple[tuple[str, str], ...]:
    options: list[tuple[str, str]] = []
    for policy_id in self._store.list_user_policy_ids():
      policy = self._load_user_policy(policy_id)
      options.append((str(policy_id), str(policy.policy_name) if policy is not None else str(policy_id)))
    return tuple(options)

  def dataset_summary(self) -> DatasetSummary:
    return self._store.dataset_summary(self._state.settings.dataset_id)

  def _raw_selected_policy(self) -> Policy | None:
    settings = self._state.settings
    kind = str(settings.selected_policy_kind)
    if kind == POLICY_KIND_USER:
      return self._load_user_policy(settings.selected_policy_id)
    if kind == POLICY_KIND_BUNDLED:
      requested = str(settings.selected_policy_id).strip()
      for policy in self._registry.bundled_policies():
        if not requested or str(policy.policy_id) == requested:
          return policy
      return None
    if kind == POLICY_KIND_BUILTIN:
      return builtin_deterministic_policy()
    return None

  def run_minimal_evaluation(self) -> EvaluationReport:
    policy = self._raw_selected_policy()
    report = run_evaluation(policy)
    policy_id = str(report.policy_id) or "builtin_deterministic"
    self._last_evaluation_path = str(self._store.save_evaluation(policy_id, report.to_dict()))
    if policy is not None and str(self._state.settings.selected_policy_kind) == POLICY_KIND_USER:
      artifact = policy.to_dict()
      artifact["evaluation"] = report.to_dict()
      self._last_policy_path = str(self._store.save_policy(artifact))
    self._save(last_evaluation_summary=report.to_dict(), policy_version=int(policy.policy_version) if policy is not None else int(self._state.policy_version))
    return report

  def train_from_player_data(self) -> dict[str, Any]:
    dataset_id = str(self._state.settings.dataset_id)
    records, corrupt = self._store.iter_demonstration_records(dataset_id)
    summary = self._store.dataset_summary(dataset_id)
    next_version = int(self._state.policy_version) + 1
    result = TrainingService().train_from_player_data(records, policy_id=USER_PLAYER_POLICY_ID, policy_name="User Learned Policy", dataset_id=dataset_id, dataset_size=int(summary.record_count), policy_version=int(next_version), corrupt_lines=int(corrupt))
    run_id = f"train_player_{int(time.time())}"
    if result.policy is None:
      self._store.save_training_run(run_id, {**result.to_dict(), "mode": "train_from_player_data"})
      self._save(last_training_summary=result.to_dict())
      return {"status": str(result.status), "message": str(result.message), "policy_id": "", "passed": False, "policy_path": "", "evaluation_path": ""}
    report = run_evaluation(result.policy)
    artifact = result.policy.to_dict()
    artifact["evaluation"] = report.to_dict()
    policy_path = str(self._store.save_policy(artifact))
    evaluation_path = str(self._store.save_evaluation(result.policy.policy_id, report.to_dict()))
    self._store.save_training_run(run_id, {**result.to_dict(), "mode": "train_from_player_data", "evaluation": report.to_dict()})
    self._last_policy_path = str(policy_path)
    self._last_evaluation_path = str(evaluation_path)
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_USER, selected_policy_id=str(result.policy.policy_id))
    self._save(next_settings, last_training_summary=result.to_dict(), last_evaluation_summary=report.to_dict(), policy_version=int(result.policy.policy_version))
    return {"status": str(result.status), "message": str(result.message), "policy_id": str(result.policy.policy_id), "passed": bool(report.passed), "policy_path": str(policy_path), "evaluation_path": str(evaluation_path)}

  def train_in_sandbox(self) -> dict[str, Any]:
    from ludoxel.simulation.actors.ai_players.learning.sandbox import train_in_sandbox as sandbox_train

    base = self._raw_selected_policy()
    next_version = int(self._state.policy_version) + 1
    result = sandbox_train(policy_id=USER_SANDBOX_POLICY_ID, policy_name="Sandbox Learned Policy", base_policy=base, policy_version=int(next_version), iterations=1)
    run_id = f"train_sandbox_{int(time.time())}"
    if result.policy is None:
      self._store.save_training_run(run_id, {"status": str(result.status), "message": str(result.message), "mode": "train_in_sandbox", "summary": dict(result.summary)})
      self._save(last_training_summary={"status": str(result.status), "message": str(result.message)})
      return {"status": str(result.status), "message": str(result.message), "policy_id": "", "passed": False, "policy_path": "", "evaluation_path": ""}
    evaluation = dict(result.policy.evaluation)
    policy_path = str(self._store.save_policy(result.policy.to_dict()))
    evaluation_path = str(self._store.save_evaluation(result.policy.policy_id, evaluation))
    self._store.save_training_run(run_id, {"status": str(result.status), "message": str(result.message), "mode": "train_in_sandbox", "summary": dict(result.summary), "task_results": list(result.task_results)})
    self._last_policy_path = str(policy_path)
    self._last_evaluation_path = str(evaluation_path)
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_USER, selected_policy_id=str(result.policy.policy_id))
    training_summary = {"status": str(result.status), "message": str(result.message), "policy_score": float(result.policy_score), "baseline_score": float(result.baseline_score)}
    self._save(next_settings, last_training_summary=training_summary, last_evaluation_summary=evaluation, policy_version=int(result.policy.policy_version))
    return {"status": str(result.status), "message": str(result.message), "policy_id": str(result.policy.policy_id), "passed": bool(evaluation.get("passed", False)), "policy_path": str(policy_path), "evaluation_path": str(evaluation_path)}

  def export_dataset(self, destination: str) -> int:
    written = self._store.export_dataset(self._state.settings.dataset_id, Path(destination))
    self._save(dataset_summary=self._store.dataset_summary(self._state.settings.dataset_id).to_dict())
    return int(written)

  def import_dataset(self, source: str) -> int:
    imported = self._store.import_dataset(self._state.settings.dataset_id, Path(source))
    self._save(dataset_summary=self._store.dataset_summary(self._state.settings.dataset_id).to_dict())
    return int(imported)

  def clear_dataset(self) -> bool:
    cleared = self._store.clear_dataset(self._state.settings.dataset_id)
    self._save(dataset_summary=DatasetSummary().to_dict())
    return bool(cleared)

  def reset_learned_policy(self) -> PersistedAiLearningState:
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_BUILTIN, selected_policy_id="")
    self._state = replace(self._state, settings=next_settings.normalized(), policy_version=0, last_training_summary={})
    self._store.save_state(self._state)
    return self._state

  def restore_bundled_policy(self) -> PersistedAiLearningState:
    return self._save(replace(self._state.settings, selected_policy_kind=POLICY_KIND_BUNDLED, selected_policy_id=""))

  def policy_save_path(self) -> str:
    if self._last_policy_path:
      return str(self._last_policy_path)
    policy_id = str(self._state.settings.selected_policy_id) or "policy"
    return str(self._store.policy_path(policy_id))

  def evaluation_save_path(self) -> str:
    return str(self._last_evaluation_path)
