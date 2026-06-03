# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = ["FixedStepRunner", "apply_persisted_state_if_present", "save_state"]


def __getattr__(name: str):
  if str(name) == "FixedStepRunner":
    from ludoxel.application.runtime.tasks.tasks_fixed_step_runner import FixedStepRunner

    return FixedStepRunner
  if str(name) == "apply_persisted_state_if_present":
    from ludoxel.application.runtime.tasks.tasks_state_persistence import apply_persisted_state_if_present

    return apply_persisted_state_if_present
  if str(name) == "save_state":
    from ludoxel.application.runtime.tasks.tasks_state_persistence import save_state

    return save_state
  raise AttributeError(str(name))
