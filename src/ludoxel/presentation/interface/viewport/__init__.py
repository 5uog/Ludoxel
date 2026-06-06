# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = [
  "OverlayRefs",
  "ViewportFrameSync",
  "ViewportInput",
  "ViewportLifecycleMixin",
  "ViewportOverlayMixin",
  "ViewportOverlays",
  "ViewportRenderLoopMixin",
  "ViewportSelectionState",
  "ViewportStateMixin",
  "WorldUploadTracker",
]


def __getattr__(name: str):
  if str(name) == "WorldUploadTracker":
    from ludoxel.presentation.rendering.contracts.upload_tracker import WorldUploadTracker

    return WorldUploadTracker
  if str(name) == "ViewportInput":
    from ludoxel.presentation.interface.input.game_input import ViewportInput

    return ViewportInput
  if str(name) == "ViewportLifecycleMixin":
    from ludoxel.presentation.interface.viewport.lifecycle.mixin import ViewportLifecycleMixin

    return ViewportLifecycleMixin
  if str(name) == "ViewportStateMixin":
    from ludoxel.presentation.interface.viewport.lifecycle.state import ViewportStateMixin

    return ViewportStateMixin
  if str(name) in {"OverlayRefs", "ViewportOverlays"}:
    from ludoxel.presentation.interface.viewport.overlays.controller import OverlayRefs, ViewportOverlays

    return {"OverlayRefs": OverlayRefs, "ViewportOverlays": ViewportOverlays}[str(name)]
  if str(name) == "ViewportOverlayMixin":
    from ludoxel.presentation.interface.viewport.overlays.state import ViewportOverlayMixin

    return ViewportOverlayMixin
  if str(name) == "ViewportFrameSync":
    from ludoxel.presentation.interface.viewport.render_loop.frame_sync import ViewportFrameSync

    return ViewportFrameSync
  if str(name) == "ViewportRenderLoopMixin":
    from ludoxel.presentation.interface.viewport.render_loop.loop import ViewportRenderLoopMixin

    return ViewportRenderLoopMixin
  if str(name) == "ViewportSelectionState":
    from ludoxel.presentation.interface.viewport.selection.state import ViewportSelectionState

    return ViewportSelectionState
  raise AttributeError(str(name))
