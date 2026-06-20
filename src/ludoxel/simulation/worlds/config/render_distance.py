# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.scalars.numeric import clampi

RENDER_DISTANCE_MIN_CHUNKS = 2
RENDER_DISTANCE_MAX_CHUNKS = 6


def clamp_render_distance_chunks(value: int) -> int:
  return clampi(int(value), int(RENDER_DISTANCE_MIN_CHUNKS), int(RENDER_DISTANCE_MAX_CHUNKS))
