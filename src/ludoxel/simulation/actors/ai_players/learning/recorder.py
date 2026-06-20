# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.dataset import DatasetSink, DemonstrationRecord, is_record_kind
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation

_DEFAULT_FLUSH_THRESHOLD: int = 64
_MAX_BUFFER: int = 4096


class DemonstrationRecorder:
  def __init__(self, *, enabled: bool = False, captured_kinds: Iterable[str] | None = None, flush_threshold: int = _DEFAULT_FLUSH_THRESHOLD) -> None:
    self._enabled = bool(enabled)
    self._captured_kinds: set[str] = set(kind for kind in (captured_kinds or ()) if is_record_kind(kind))
    self._flush_threshold = max(1, int(flush_threshold))
    self._buffer: list[DemonstrationRecord] = []

  @property
  def enabled(self) -> bool:
    return bool(self._enabled)

  def configure(self, *, enabled: bool, captured_kinds: Iterable[str]) -> None:
    self._enabled = bool(enabled)
    self._captured_kinds = set(kind for kind in (captured_kinds or ()) if is_record_kind(kind))

  def captures(self, kind: str) -> bool:
    return bool(self._enabled) and str(kind) in self._captured_kinds

  def record(
    self,
    *,
    kind: str,
    observation: AiObservation | dict[str, Any] | None = None,
    action: str | None = None,
    success: bool | None = None,
    reward: float | None = None,
    tick: int = 0,
    actor_id: str = "",
    detail: dict[str, Any] | None = None,
  ) -> bool:
    if not self.captures(kind):
      return False
    observation_dict: dict[str, Any]
    if isinstance(observation, AiObservation):
      observation_dict = observation.to_dict()
    elif isinstance(observation, dict):
      observation_dict = dict(observation)
    else:
      observation_dict = {}
    entry = DemonstrationRecord(
      kind=str(kind),
      tick=int(tick),
      actor_id=str(actor_id),
      observation=observation_dict,
      action=(None if action is None else str(action)),
      success=(None if success is None else bool(success)),
      reward=(None if reward is None else float(reward)),
      detail=dict(detail or {}),
    )
    if len(self._buffer) >= int(_MAX_BUFFER):
      del self._buffer[0]
    self._buffer.append(entry)
    return True

  def pending_count(self) -> int:
    return len(self._buffer)

  def should_flush(self) -> bool:
    return len(self._buffer) >= int(self._flush_threshold)

  def flush(self, sink: DatasetSink) -> int:
    if not self._buffer:
      return 0
    rows = tuple(record.to_dict() for record in self._buffer)
    written = int(sink.write_records(rows))
    self._buffer.clear()
    return written

  def shutdown_flush(self, sink: DatasetSink) -> int:
    return self.flush(sink)

  def discard(self) -> int:
    count = len(self._buffer)
    self._buffer.clear()
    return int(count)
