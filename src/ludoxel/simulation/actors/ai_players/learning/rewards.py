# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

REWARD_SCHEMA_VERSION: int = 1


@dataclass(frozen=True)
class RewardWeights:
  """
  demonstration 評価と将来の学習で用いる報酬整形の重みを表す不変設定である。
  各重みは一 step あたりの報酬寄与の係数であり、survival は被害なく生存し続けたことへの正の寄与、damage_taken は受けた health point 量に乗じる負の寄与、damage_dealt は与えた health point 量に乗じる正の寄与、progress は目標(player 又は route 目標)への接近距離に乗じる正の寄与、fall は落下被害量に乗じる負の寄与、void_death と death は奈落死・死亡という終端事象への一括負の寄与である。すべて係数であり、符号と桁の意味は compute_step_reward が固定する。
  既定値は survival を小さな正、被害・死亡を相対的に大きな負とし、無謀な接近より生存を優先する基準を与える。学習を伴わない本段階では評価 sandbox の result summary 算出と policy 比較の基準としてのみ用いる。
  """

  survival: float = 0.01
  progress: float = 0.20
  damage_dealt: float = 0.50
  damage_taken: float = -0.60
  fall: float = -0.40
  death: float = -5.0
  void_death: float = -8.0

  def to_dict(self) -> dict[str, Any]:
    """
    重み設定を JSON 直列化可能な mapping へ変換する。
    返値は survival、progress、damage_dealt、damage_taken、fall、death、void_death を float として保持し、評価 result と policy artifact の比較に用いる。
    """
    return {
      "survival": float(self.survival),
      "progress": float(self.progress),
      "damage_dealt": float(self.damage_dealt),
      "damage_taken": float(self.damage_taken),
      "fall": float(self.fall),
      "death": float(self.death),
      "void_death": float(self.void_death),
    }


@dataclass(frozen=True)
class RewardTransition:
  """
  報酬算出に用いる一 step の遷移要約を表す。
  survived は当該 step を生存して終えたか、progress_delta は目標への接近を正、後退を負とする距離変化(block 単位)、damage_dealt と damage_taken は当該 step に与えた・受けた health point 量(非負)、fell は落下被害が発生したか、died は死亡したか、void_death は死因が奈落であったかを表す。これらは simulation の AI step 報告と observation 差分から導出され、画面情報ではなく domain 状態のみに基づく。
  """

  survived: bool = True
  progress_delta: float = 0.0
  damage_dealt: float = 0.0
  damage_taken: float = 0.0
  fell: bool = False
  died: bool = False
  void_death: bool = False


def compute_step_reward(transition: RewardTransition, weights: RewardWeights | None = None) -> float:
  """
  一 step の遷移要約から整形済み報酬値を算出する。
  報酬は r = survival*[survived] + progress*progress_delta + damage_dealt*damage_dealt + damage_taken*damage_taken + fall*[fell]*damage_taken_component + death 終端寄与 として合成する。具体的には、生存 step に survival を加算し、progress_delta に progress を乗じ、与被害量にそれぞれ damage_dealt と damage_taken を乗じ、落下被害があれば fall を一括加算する。died が真なら death を加算し、さらに void_death が真なら奈落死の追加負寄与として void_death と death の差分を加算することで、通常死より奈落死を強く忌避する。weights を省略した場合は RewardWeights 既定を用いる。返値は有限 float である。
  """
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
