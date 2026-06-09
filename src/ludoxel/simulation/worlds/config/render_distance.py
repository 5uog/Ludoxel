# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.scalars.numeric import clampi

RENDER_DISTANCE_MIN_CHUNKS = 2
RENDER_DISTANCE_MAX_CHUNKS = 50


def clamp_render_distance_chunks(value: int) -> int:
  """
  chunk 単位の render distance を整数閉区間 `[2, 50]` へ射影する。
  persistence、settings、renderer configuration はこの範囲を共有し、
  過小又は過大な距離が描画負荷や可視範囲の意味を壊さないようにする。
  """
  return clampi(int(value), int(RENDER_DISTANCE_MIN_CHUNKS), int(RENDER_DISTANCE_MAX_CHUNKS))
