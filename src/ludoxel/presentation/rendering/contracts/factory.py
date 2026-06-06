# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import os

from ludoxel.presentation.rendering.contracts.api import BackendRendererApi


def _normalized_backend_name(value: str | None) -> str:
  name = str(value or "").strip().lower()
  if name in {"", "auto"}:
    return "wgpu"
  if name in {"wgpu", "webgpu", "metal", "d3d12", "dx12", "direct3d12", "vulkan"}:
    return "wgpu"
  return name


def create_backend_renderer(*, cfg, state, canvas=None, preferred_backend: str | None = None) -> BackendRendererApi:
  backend_name = _normalized_backend_name(preferred_backend or os.environ.get("LUDOXEL_RENDER_BACKEND"))

  if backend_name != "wgpu":
    raise ValueError(f"Unsupported renderer backend: {backend_name}")
  if canvas is None:
    raise ValueError("wgpu renderer backend requires a Qt render canvas")

  from ludoxel.presentation.rendering.backends.wgpu.runtime.backend import WgpuRendererBackend

  return WgpuRendererBackend(cfg=cfg, state=state, canvas=canvas)
