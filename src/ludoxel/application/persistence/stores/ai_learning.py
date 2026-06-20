# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
import os
from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ludoxel.application.persistence.schema.ai_learning import PersistedAiLearningState
from ludoxel.application.persistence.stores.json_file import JsonFileStore
from ludoxel.foundations.locations.roots import default_runtime_data_root, runtime_state_root
from ludoxel.simulation.actors.ai_players.learning.dataset import RECORD_KINDS, DatasetSummary, DemonstrationRecord, decode_record_line, encode_record_line

_LEARNING_DIR_NAME: str = "learning"
_DEMONSTRATIONS_DIR_NAME: str = "demonstrations"
_POLICIES_DIR_NAME: str = "policies"
_EVALUATIONS_DIR_NAME: str = "evaluations"
_TRAINING_RUNS_DIR_NAME: str = "training_runs"
_SETTINGS_FILE_NAME: str = "ai_learning.json"
_SAFE_NAME_CHARS: frozenset[str] = frozenset("abcdefghijklmnopqrstuvwxyz0123456789_-")


def _safe_name(identifier: str, *, fallback: str = "default") -> str:
  lowered = str(identifier).strip().lower()
  filtered = "".join(character if character in _SAFE_NAME_CHARS else "_" for character in lowered).strip("_")
  return filtered or str(fallback)


@dataclass
class DemonstrationDatasetWriter:
  path: Path

  def write_records(self, rows: Iterable[dict[str, Any]]) -> int:
    lines: list[str] = []
    for row in rows:
      try:
        lines.append(json.dumps(dict(row), ensure_ascii=False, sort_keys=True, separators=(",", ":")))
      except (TypeError, ValueError):
        continue
    if not lines:
      return 0
    target = Path(self.path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "a", encoding="utf-8", newline="\n") as handle:
      for line in lines:
        handle.write(line)
        handle.write("\n")
      handle.flush()
      os.fsync(handle.fileno())
    return len(lines)


@dataclass
class AiLearningStore:
  project_root: Path
  data_root: Path | None = None

  def _data_root(self) -> Path:
    if self.data_root is not None:
      return Path(self.data_root)
    return default_runtime_data_root(Path(self.project_root))

  def _learning_root(self) -> Path:
    return runtime_state_root(self._data_root()) / _LEARNING_DIR_NAME

  def _settings_path(self) -> Path:
    return runtime_state_root(self._data_root()) / _SETTINGS_FILE_NAME

  def dataset_path(self, dataset_id: str) -> Path:
    return self._learning_root() / _DEMONSTRATIONS_DIR_NAME / f"{_safe_name(dataset_id)}.jsonl"

  def _legacy_dataset_path(self, dataset_id: str) -> Path:
    return self._learning_root() / f"{_safe_name(dataset_id)}.jsonl"

  def _read_dataset_path(self, dataset_id: str) -> Path:
    new_path = self.dataset_path(dataset_id)
    if new_path.is_file():
      return new_path
    legacy_path = self._legacy_dataset_path(dataset_id)
    if legacy_path.is_file():
      return legacy_path
    return new_path

  def load_state(self) -> PersistedAiLearningState:
    raw = JsonFileStore(path=self._settings_path()).read()
    if raw is None:
      return PersistedAiLearningState.default()
    return PersistedAiLearningState.from_dict(raw)

  def save_state(self, state: PersistedAiLearningState) -> None:
    JsonFileStore(path=self._settings_path()).write(state.to_dict())

  def dataset_writer(self, dataset_id: str) -> DemonstrationDatasetWriter:
    return DemonstrationDatasetWriter(path=self.dataset_path(dataset_id))

  def iter_demonstration_records(self, dataset_id: str) -> tuple[list[DemonstrationRecord], int]:
    path = self._read_dataset_path(dataset_id)
    if not path.is_file():
      return ([], 0)
    records: list[DemonstrationRecord] = []
    corrupt = 0
    try:
      with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
          if not str(line).strip():
            continue
          record = decode_record_line(line)
          if record is None:
            corrupt += 1
            continue
          records.append(record)
    except OSError:
      return (records, corrupt)
    return (records, int(corrupt))

  def dataset_summary(self, dataset_id: str) -> DatasetSummary:
    path = self._read_dataset_path(dataset_id)
    if not path.is_file():
      return DatasetSummary()
    try:
      byte_size = int(path.stat().st_size)
    except OSError:
      byte_size = 0
    kinds: dict[str, int] = {kind: 0 for kind in RECORD_KINDS}
    record_count = 0
    try:
      with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
          record = decode_record_line(line)
          if record is None:
            continue
          record_count += 1
          kinds[str(record.kind)] = int(kinds.get(str(record.kind), 0)) + 1
    except OSError:
      return DatasetSummary(record_count=0, byte_size=int(byte_size), kinds={})
    populated = {kind: int(count) for kind, count in kinds.items() if int(count) > 0}
    return DatasetSummary(record_count=int(record_count), byte_size=int(byte_size), kinds=populated)

  def clear_dataset(self, dataset_id: str) -> bool:
    removed = False
    for path in (self.dataset_path(dataset_id), self._legacy_dataset_path(dataset_id)):
      if path.is_file():
        try:
          path.unlink()
          removed = True
        except OSError:
          continue
    return bool(removed)

  def export_dataset(self, dataset_id: str, destination: Path) -> int:
    source = self._read_dataset_path(dataset_id)
    if not source.is_file():
      return 0
    target = Path(destination)
    target.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    with open(source, "r", encoding="utf-8") as reader, open(target, "w", encoding="utf-8", newline="\n") as writer:
      for line in reader:
        record = decode_record_line(line)
        if record is None:
          continue
        writer.write(encode_record_line(record))
        writer.write("\n")
        written += 1
    return int(written)

  def import_dataset(self, dataset_id: str, source: Path) -> int:
    origin = Path(source)
    if not origin.is_file():
      return 0
    rows: list[dict[str, Any]] = []
    with open(origin, "r", encoding="utf-8") as reader:
      for line in reader:
        record = decode_record_line(line)
        if record is None:
          continue
        rows.append(record.to_dict())
    if not rows:
      return 0
    return int(self.dataset_writer(dataset_id).write_records(rows))

  def policy_path(self, policy_id: str) -> Path:
    return self._learning_root() / _POLICIES_DIR_NAME / f"{_safe_name(policy_id)}.json"

  def save_policy(self, policy: dict[str, Any]) -> Path:
    policy_id = str(policy.get("policy_id", "")).strip() or "policy"
    path = self._learning_root() / _POLICIES_DIR_NAME / f"{_safe_name(policy_id)}.json"
    JsonFileStore(path=path).write(dict(policy))
    return path

  def load_policy_dict(self, policy_id: str) -> dict[str, Any] | None:
    return JsonFileStore(path=self.policy_path(policy_id)).read()

  def list_user_policy_ids(self) -> tuple[str, ...]:
    directory = self._learning_root() / _POLICIES_DIR_NAME
    if not directory.is_dir():
      return ()
    ids: list[str] = []
    for path in sorted(directory.glob("*.json")):
      data = JsonFileStore(path=path).read()
      if isinstance(data, dict) and str(data.get("policy_id", "")).strip():
        ids.append(str(data.get("policy_id")).strip())
    return tuple(ids)

  def delete_user_policy(self, policy_id: str) -> bool:
    path = self.policy_path(policy_id)
    if not path.is_file():
      return False
    try:
      path.unlink()
    except OSError:
      return False
    return True

  def save_evaluation(self, policy_id: str, report: dict[str, Any]) -> Path:
    path = self._learning_root() / _EVALUATIONS_DIR_NAME / f"{_safe_name(policy_id)}.json"
    JsonFileStore(path=path).write(dict(report))
    return path

  def load_evaluation(self, policy_id: str) -> dict[str, Any] | None:
    path = self._learning_root() / _EVALUATIONS_DIR_NAME / f"{_safe_name(policy_id)}.json"
    return JsonFileStore(path=path).read()

  def save_training_run(self, run_id: str, run: dict[str, Any]) -> Path:
    path = self._learning_root() / _TRAINING_RUNS_DIR_NAME / f"{_safe_name(run_id)}.json"
    JsonFileStore(path=path).write(dict(run))
    return path

  def list_training_run_ids(self) -> tuple[str, ...]:
    directory = self._learning_root() / _TRAINING_RUNS_DIR_NAME
    if not directory.is_dir():
      return ()
    return tuple(sorted(path.stem for path in directory.glob("*.json")))
