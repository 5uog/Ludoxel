# FILE: src/maiming/application/ports/renderer_port.py
from __future__ import annotations

from typing import Protocol

from maiming.application.session.render_snapshot import CameraDTO, RenderSnapshotDTO

__all__ = ["CameraDTO", "RenderSnapshotDTO", "RendererPort"]

class RendererPort(Protocol):
    def submit_snapshot(self, snapshot: RenderSnapshotDTO) -> None:
        ...