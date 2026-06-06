# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.actors.ai_players.runtime import _AI_WANDER_DECISION_MAX_S, _AI_WANDER_DECISION_MIN_S


def _wander_seed(actor_id: str) -> int:
  acc = 0
  for ch in str(actor_id):
    acc = (acc * 131 + ord(ch)) & 0x7FFFFFFF
  return int(acc)


def _wander_interval_s(actor_id: str, phase: int) -> float:
  seed = (_wander_seed(actor_id) + int(phase) * 1103515245 + 12345) & 0x7FFFFFFF
  ratio = float(seed % 1000) / 999.0
  return float(_AI_WANDER_DECISION_MIN_S + (_AI_WANDER_DECISION_MAX_S - _AI_WANDER_DECISION_MIN_S) * ratio)
