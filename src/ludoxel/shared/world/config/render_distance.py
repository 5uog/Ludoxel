# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from ...math.scalars import clampi

RENDER_DISTANCE_MIN_CHUNKS = 2
RENDER_DISTANCE_MAX_CHUNKS = 50


def clamp_render_distance_chunks(value: int) -> int:
    """I define R(x) = clamp_Z(x, 2, 50) on chunk-distance integers. This interval is the explicit render-distance admissible set used by persistence, settings, and renderer configuration."""
    return clampi(int(value), int(RENDER_DISTANCE_MIN_CHUNKS), int(RENDER_DISTANCE_MAX_CHUNKS))
