# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

DATASET_SCHEMA_VERSION: int = 1

RECORD_PLAYER_MOVEMENT: str = "player_movement"
RECORD_PLAYER_COMBAT: str = "player_combat"
RECORD_PLAYER_BLOCK_PLACEMENT: str = "player_block_placement"
RECORD_PLAYER_BLOCK_BREAKING: str = "player_block_breaking"
RECORD_PLAYER_PARKOUR: str = "player_parkour"
RECORD_PLAYER_TRAP: str = "player_trap"
RECORD_AI_DECISIONS: str = "ai_decisions"
RECORD_AI_FAILURES: str = "ai_failures"
RECORD_AI_DEATHS: str = "ai_deaths"
RECORD_AI_ROUTE_FAILURES: str = "ai_route_failures"
RECORD_AI_ESCAPE_ATTEMPTS: str = "ai_escape_attempts"

RECORD_KINDS: tuple[str, ...] = (
  RECORD_PLAYER_MOVEMENT,
  RECORD_PLAYER_COMBAT,
  RECORD_PLAYER_BLOCK_PLACEMENT,
  RECORD_PLAYER_BLOCK_BREAKING,
  RECORD_PLAYER_PARKOUR,
  RECORD_PLAYER_TRAP,
  RECORD_AI_DECISIONS,
  RECORD_AI_FAILURES,
  RECORD_AI_DEATHS,
  RECORD_AI_ROUTE_FAILURES,
  RECORD_AI_ESCAPE_ATTEMPTS,
)

_RECORD_KIND_SET: frozenset[str] = frozenset(RECORD_KINDS)


def is_record_kind(kind: object) -> bool:
  return str(kind) in _RECORD_KIND_SET


@dataclass(frozen=True)
class DemonstrationRecord:
  kind: str
  tick: int = 0
  actor_id: str = ""
  observation: dict[str, Any] = field(default_factory=dict)
  action: str | None = None
  success: bool | None = None
  reward: float | None = None
  detail: dict[str, Any] = field(default_factory=dict)
  schema_version: int = DATASET_SCHEMA_VERSION

  def to_dict(self) -> dict[str, Any]:
    return {
      "schema_version": int(self.schema_version),
      "kind": str(self.kind),
      "tick": int(self.tick),
      "actor_id": str(self.actor_id),
      "observation": dict(self.observation or {}),
      "action": (None if self.action is None else str(self.action)),
      "success": (None if self.success is None else bool(self.success)),
      "reward": (None if self.reward is None else float(self.reward)),
      "detail": dict(self.detail or {}),
    }

  @staticmethod
  def from_dict(data: object) -> "DemonstrationRecord | None":
    if not isinstance(data, dict):
      return None
    kind = str(data.get("kind", ""))
    if not is_record_kind(kind):
      return None
    observation = data.get("observation")
    detail = data.get("detail")
    raw_action = data.get("action")
    raw_success = data.get("success")
    raw_reward = data.get("reward")
    try:
      tick = int(data.get("tick", 0))
    except (TypeError, ValueError):
      tick = 0
    try:
      schema_version = int(data.get("schema_version", DATASET_SCHEMA_VERSION))
    except (TypeError, ValueError):
      schema_version = int(DATASET_SCHEMA_VERSION)
    return DemonstrationRecord(
      kind=str(kind),
      tick=int(tick),
      actor_id=str(data.get("actor_id", "")),
      observation=dict(observation) if isinstance(observation, dict) else {},
      action=(None if raw_action is None else str(raw_action)),
      success=(None if raw_success is None else bool(raw_success)),
      reward=(None if raw_reward is None else _coerce_optional_float(raw_reward)),
      detail=dict(detail) if isinstance(detail, dict) else {},
      schema_version=int(schema_version),
    )


def _coerce_optional_float(value: object) -> float | None:
  try:
    return float(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    return None


def encode_record_line(record: DemonstrationRecord) -> str:
  return json.dumps(record.to_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def decode_record_line(line: str) -> DemonstrationRecord | None:
  text = str(line).strip()
  if not text:
    return None
  try:
    payload = json.loads(text)
  except json.JSONDecodeError:
    return None
  return DemonstrationRecord.from_dict(payload)


@dataclass(frozen=True)
class DatasetSummary:
  record_count: int = 0
  byte_size: int = 0
  kinds: dict[str, int] = field(default_factory=dict)

  def to_dict(self) -> dict[str, Any]:
    return {"record_count": int(self.record_count), "byte_size": int(self.byte_size), "kinds": {str(key): int(value) for key, value in (self.kinds or {}).items()}}

  @staticmethod
  def from_dict(data: object) -> "DatasetSummary":
    if not isinstance(data, dict):
      return DatasetSummary()
    raw_kinds = data.get("kinds")
    kinds: dict[str, int] = {}
    if isinstance(raw_kinds, dict):
      for key, value in raw_kinds.items():
        try:
          kinds[str(key)] = max(0, int(value))
        except (TypeError, ValueError):
          continue
    try:
      record_count = max(0, int(data.get("record_count", 0)))
    except (TypeError, ValueError):
      record_count = 0
    try:
      byte_size = max(0, int(data.get("byte_size", 0)))
    except (TypeError, ValueError):
      byte_size = 0
    return DatasetSummary(record_count=int(record_count), byte_size=int(byte_size), kinds=kinds)


@runtime_checkable
class DatasetSink(Protocol):
  def write_records(self, rows: Iterable[dict[str, Any]]) -> int: ...
