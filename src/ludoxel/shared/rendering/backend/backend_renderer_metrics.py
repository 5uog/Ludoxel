# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class BackendPassFrameMetrics:
  cpu_ms: float = 0.0
  draw_calls: int = 0
  instances: int = 0
  rendered: bool = False


@dataclass(frozen=True)
class BackendRendererFrameMetrics:
  world: BackendPassFrameMetrics = field(default_factory=BackendPassFrameMetrics)
  shadow: BackendPassFrameMetrics = field(default_factory=BackendPassFrameMetrics)
