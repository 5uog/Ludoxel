# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.worlds.config.player_health import PlayerRegenParams


def advance_player_regeneration(*, player: PlayerEntity, params: PlayerRegenParams, dt: float, wait_s: float, took_damage: bool) -> float:
  if bool(took_damage):
    return 0.0
  if not player.alive():
    return 0.0

  new_wait_s = max(0.0, float(wait_s)) + max(0.0, float(dt))
  if not bool(params.enabled):
    return float(new_wait_s)

  cap = min(float(params.cap_hp), float(player.max_health))
  if float(player.health) >= float(cap) - 1e-9:
    return float(new_wait_s)
  if float(new_wait_s) < float(params.start_delay_s):
    return float(new_wait_s)

  rate_hp_per_s = float(params.cap_hp) / max(1e-6, float(params.time_to_cap_s))
  player.health = min(float(cap), float(player.health) + float(rate_hp_per_s) * max(0.0, float(dt)))
  return float(new_wait_s)
