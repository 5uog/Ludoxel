# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = ["HudPayload", "HudController", "PlayerMetricsSnapshot", "PlayerMetricsTracker"]


def __getattr__(name: str):
  if str(name) == "HudPayload":
    from .hud_payload import HudPayload

    return HudPayload
  if str(name) == "HudController":
    from .hud_controller import HudController

    return HudController
  if str(name) == "PlayerMetricsSnapshot":
    from ludoxel.shared.ui.hud.hud_player_metrics import PlayerMetricsSnapshot

    return PlayerMetricsSnapshot
  if str(name) == "PlayerMetricsTracker":
    from ludoxel.shared.ui.hud.hud_player_metrics import PlayerMetricsTracker

    return PlayerMetricsTracker
  raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
