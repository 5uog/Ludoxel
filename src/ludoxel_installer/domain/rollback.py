# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass


@dataclass
class RollbackStep:
  description: str
  undo: Callable[[], None]


class RollbackJournal:
  def __init__(self) -> None:
    self._steps: list[RollbackStep] = []

  def record(self, description: str, undo: Callable[[], None]) -> None:
    self._steps.append(RollbackStep(description=str(description), undo=undo))

  def clear(self) -> None:
    self._steps.clear()

  @property
  def recorded_steps(self) -> tuple[str, ...]:
    return tuple(step.description for step in self._steps)

  def rollback(self) -> tuple[str, ...]:
    failures: list[str] = []
    for step in reversed(self._steps):
      try:
        step.undo()
      except Exception as error:
        failures.append(f"{step.description}: {error}")
    self._steps.clear()
    return tuple(failures)
