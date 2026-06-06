# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = ["WgpuRendererBackend"]


def __getattr__(name: str):
  if str(name) == "WgpuRendererBackend":
    from ludoxel.presentation.rendering.backends.wgpu.runtime.backend import WgpuRendererBackend

    return WgpuRendererBackend
  raise AttributeError(str(name))
