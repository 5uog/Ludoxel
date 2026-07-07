# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

REWARD_SCHEMA_VERSION: int = 1


@dataclass(frozen=True)
class RewardWeights:
  survival: float = 0.01
  progress: float = 0.20
  damage_dealt: float = 0.50
  damage_taken: float = -0.60
  fall: float = -0.40
  death: float = -5.0
  void_death: float = -8.0

  def to_dict(self) -> dict[str, Any]:
    return {"survival": float(self.survival), "progress": float(self.progress), "damage_dealt": float(self.damage_dealt), "damage_taken": float(self.damage_taken), "fall": float(self.fall), "death": float(self.death), "void_death": float(self.void_death)}


@dataclass(frozen=True)
class RewardTransition:
  survived: bool = True
  progress_delta: float = 0.0
  damage_dealt: float = 0.0
  damage_taken: float = 0.0
  fell: bool = False
  died: bool = False
  void_death: bool = False


def compute_step_reward(transition: RewardTransition, weights: RewardWeights | None = None) -> float:
  effective = weights if isinstance(weights, RewardWeights) else RewardWeights()
  reward = 0.0
  if bool(transition.survived) and not bool(transition.died):
    reward += float(effective.survival)
  reward += float(effective.progress) * float(transition.progress_delta)
  reward += float(effective.damage_dealt) * max(0.0, float(transition.damage_dealt))
  reward += float(effective.damage_taken) * max(0.0, float(transition.damage_taken))
  if bool(transition.fell):
    reward += float(effective.fall)
  if bool(transition.died):
    reward += float(effective.death)
    if bool(transition.void_death):
      reward += float(effective.void_death) - float(effective.death)
  return float(reward)
