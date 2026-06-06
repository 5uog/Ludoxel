# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = ["HudPayload", "HudController", "PlayerMetricsSnapshot", "PlayerMetricsTracker"]


def __getattr__(name: str):
  if str(name) == "HudPayload":
    from ludoxel.presentation.interface.hud.payload import HudPayload

    return HudPayload
  if str(name) == "HudController":
    from ludoxel.presentation.interface.hud.controller import HudController

    return HudController
  if str(name) == "PlayerMetricsSnapshot":
    from ludoxel.presentation.interface.hud.metrics import PlayerMetricsSnapshot

    return PlayerMetricsSnapshot
  if str(name) == "PlayerMetricsTracker":
    from ludoxel.presentation.interface.hud.metrics import PlayerMetricsTracker

    return PlayerMetricsTracker
  raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
