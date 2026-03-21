# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from PyQt6.QtGui import QSurfaceFormat


def build_gl_surface_format(*, vsync_on: bool=False) -> QSurfaceFormat:
    fmt = QSurfaceFormat()
    fmt.setVersion(4, 3)
    fmt.setProfile(QSurfaceFormat.OpenGLContextProfile.CoreProfile)
    fmt.setDepthBufferSize(24)
    fmt.setStencilBufferSize(8)
    fmt.setSamples(0)
    fmt.setSwapBehavior(QSurfaceFormat.SwapBehavior.DoubleBuffer)
    fmt.setSwapInterval(1 if bool(vsync_on) else 0)
    return fmt


def install_default_gl_surface_format(*, vsync_on: bool=False) -> None:
    QSurfaceFormat.setDefaultFormat(build_gl_surface_format(vsync_on=bool(vsync_on)))
