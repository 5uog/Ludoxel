# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = ["BackendRendererParams", "Renderer", "create_backend_renderer", "default_backend_renderer_params"]


def __getattr__(name: str):
  if str(name) == "Renderer":
    from ludoxel.presentation.rendering.contracts.backend import Renderer

    return Renderer
  if str(name) in {"BackendRendererParams", "default_backend_renderer_params"}:
    from ludoxel.presentation.rendering.contracts.config import BackendRendererParams, default_backend_renderer_params

    return {"BackendRendererParams": BackendRendererParams, "default_backend_renderer_params": default_backend_renderer_params}[str(name)]
  if str(name) == "create_backend_renderer":
    from ludoxel.presentation.rendering.contracts.factory import create_backend_renderer

    return create_backend_renderer
  raise AttributeError(str(name))
