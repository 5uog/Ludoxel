# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

__all__ = ["FixedStepRunner", "apply_persisted_state_if_present", "save_state"]


def __getattr__(name: str):
    if str(name) == "FixedStepRunner":
        from .fixed_step_runner import FixedStepRunner

        return FixedStepRunner
    if str(name) == "apply_persisted_state_if_present":
        from .state_persistence import apply_persisted_state_if_present

        return apply_persisted_state_if_present
    if str(name) == "save_state":
        from .state_persistence import save_state

        return save_state
    raise AttributeError(str(name))
