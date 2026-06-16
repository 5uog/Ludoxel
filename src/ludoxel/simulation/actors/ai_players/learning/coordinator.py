# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from collections.abc import Iterable
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.action_mask import AiActionMask
from ludoxel.simulation.actors.ai_players.learning.dataset import RECORD_AI_DECISIONS, DatasetSink
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import encode_features
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation
from ludoxel.simulation.actors.ai_players.learning.policy import DeterministicPolicy, Policy, PolicyDecision
from ludoxel.simulation.actors.ai_players.learning.recorder import DemonstrationRecorder
from ludoxel.simulation.actors.ai_players.learning.rewards import RewardTransition, compute_step_reward

LEARNING_RUNTIME_OFF: str = "off"
LEARNING_RUNTIME_OBSERVE_ONLY: str = "observe_only"
LEARNING_RUNTIME_USE_LEARNED_POLICY: str = "use_learned_policy"

ACTION_SOURCE_PLAYER: str = "player"
ACTION_SOURCE_DETERMINISTIC: str = "deterministic_ai"
ACTION_SOURCE_LEARNED_POLICY: str = "learned_policy"
ACTION_SOURCE_FALLBACK: str = "fallback"


class LearningCoordinator:
  """
  live simulation tick における学習基盤の振る舞いを束ねる調整器である。
  本調整器は simulation 層に属し、保存 file path や user data root を知らない。記録の蓄積は DemonstrationRecorder へ、行動決定は DeterministicPolicy(及び選択 policy)へ委譲し、application 層が mode・capture 種別・選択 policy を configure で注入し、flush 先 DatasetSink を与える。mode が off の間は記録も policy 適用も行わず AI 挙動へ干渉しない。observe_only では deterministic AI の決定を変えずに観測・行動・結果を記録する。use_learned_policy では選択済みかつ評価通過 policy を deterministic 効用へ重畳して行動を選ぶが、最終行動は必ず行動 mask を通すため unsafe action は実行されない。policy が None 又は使用不能なら deterministic fallback する。
  """

  def __init__(self, *, session_id: str = "", recorder: DemonstrationRecorder | None = None, deterministic: DeterministicPolicy | None = None) -> None:
    """
    記録器・決定器・session 識別子を確定して初期化する。
    recorder を省略した場合は無効状態の DemonstrationRecorder を生成し、deterministic を省略した場合は DeterministicPolicy を生成する。session_id は記録 detail に埋め込む論理識別子である。初期 mode は off であり、configure を受けるまで記録も policy 適用も行わない。
    """
    self._session_id = str(session_id)
    self._recorder = recorder if isinstance(recorder, DemonstrationRecorder) else DemonstrationRecorder()
    self._deterministic = deterministic if isinstance(deterministic, DeterministicPolicy) else DeterministicPolicy()
    self._mode = LEARNING_RUNTIME_OFF
    self._policy: Policy | None = None
    self._tick = 0

  def configure(self, *, mode: str, captured_kinds: Iterable[str], policy: Policy | None) -> None:
    """
    実行時の mode、記録対象種別、選択 policy を更新する。
    mode が observe_only の場合のみ recorder を有効化し、その capture 対象を captured_kinds へ更新する。policy は use_learned_policy のときに参照する候補であり、is_usable が偽なら適用時に無視されて deterministic fallback する。設定更新は軽量であり、毎 frame ではなく mode 変更時に呼ぶ前提である。
    """
    self._mode = str(mode)
    self._policy = policy if isinstance(policy, Policy) else None
    self._recorder.configure(enabled=(str(mode) == LEARNING_RUNTIME_OBSERVE_ONLY), captured_kinds=tuple(captured_kinds))

  def active(self) -> bool:
    """
    現在の mode が observation 構築を要するかを返す。
    observe_only(記録のため)又は use_learned_policy(policy 適用のため)で真を返す。off では偽を返し、呼び出し側は observation 構築費用を省略して AI 挙動へ一切干渉しない。
    """
    return self._mode in (LEARNING_RUNTIME_OBSERVE_ONLY, LEARNING_RUNTIME_USE_LEARNED_POLICY)

  def recording(self) -> bool:
    """
    現在 demonstration 記録を行う状態かを返す。
    mode が observe_only の場合に真を返す。記録は deterministic AI の決定を変えずに行うため、AI 挙動へ干渉しない。
    """
    return self._mode == LEARNING_RUNTIME_OBSERVE_ONLY

  def policy_enabled(self) -> bool:
    """
    選択 policy を live 決定へ適用してよい状態かを返す。
    mode が use_learned_policy であり、選択 policy が存在し、かつ is_usable(schema・互換・版整合・評価通過)が真の場合に限り真を返す。これらを欠く場合は偽を返し、deterministic fallback する。
    """
    return self._mode == LEARNING_RUNTIME_USE_LEARNED_POLICY and isinstance(self._policy, Policy) and bool(self._policy.is_usable())

  def decide(self, observation: AiObservation, mask: AiActionMask) -> PolicyDecision:
    """
    観測と行動 mask から行動決定を返す。
    policy_enabled が真なら選択 policy を deterministic 効用へ重畳して決定し、そうでなければ deterministic baseline のみで決定する。いずれの場合も決定は mask の許可集合内に限られ、禁止行動は選ばれない。
    """
    policy = self._policy if self.policy_enabled() else None
    return self._deterministic.decide(observation, mask, policy)

  def begin_tick(self) -> None:
    """
    simulation step の冒頭で tick 計数を進める。
    記録の時系列順序を表す単調増加 tick を更新する。記録を行わない mode でも安価に呼べる。
    """
    self._tick += 1

  def record_decision(
    self,
    *,
    observation: AiObservation,
    mask: AiActionMask,
    action_id: str,
    action_source: str,
    actor_id: str,
    transition: RewardTransition,
    failure_reason: str | None = None,
    route_state: dict[str, Any] | None = None,
    combat_state: dict[str, Any] | None = None,
    placement_state: dict[str, Any] | None = None,
  ) -> bool:
    """
    一 actor の決定と結果を demonstration として記録する。
    記録は recording が真(observe_only)かつ ai_decisions 種別が capture 対象の場合のみ行い、それ以外は何もせず偽を返す。記録には観測、選択行動、行動源、許可/禁止 mask 要約、結果から算出した success と reward、reward 構成、feature key 列、failure_reason、route/combat/placement/health/position 要約を含める。reward は RewardTransition から compute_step_reward で算出する。success は被害を受けず死亡しなかった step を真とする。記録した場合は真を返す。
    """
    if not self._recorder.captures(RECORD_AI_DECISIONS):
      return False
    reward = float(compute_step_reward(transition))
    success = bool(transition.survived and not transition.died and float(transition.damage_taken) <= 1e-6)
    detail: dict[str, Any] = {
      "record_type": "ai_decision",
      "timestamp": float(time.time()),
      "session_id": str(self._session_id),
      "actor_kind": "ai",
      "action_source": str(action_source),
      "feature_keys": list(encode_features(observation)),
      "action_mask_summary": {"allowed": len(mask.allowed), "forbidden": len(mask.forbidden)},
      "reward_terms": {
        "damage_dealt": float(transition.damage_dealt),
        "damage_taken": float(transition.damage_taken),
        "fell": bool(transition.fell),
        "died": bool(transition.died),
        "void_death": bool(transition.void_death),
        "progress_delta": float(transition.progress_delta),
      },
      "failure_reason": (None if failure_reason is None else str(failure_reason)),
      "route_state": dict(route_state or {}),
      "combat_state": dict(combat_state or {}),
      "placement_state": dict(placement_state or {}),
      "health_state": {"health": float(observation.health), "max_health": float(observation.max_health), "low_health": bool(observation.low_health)},
      "position_summary": {"position": [float(value) for value in observation.self_position], "on_ground": bool(observation.on_ground)},
    }
    return self._recorder.record(
      kind=RECORD_AI_DECISIONS, observation=observation, action=str(action_id), success=bool(success), reward=float(reward), tick=int(self._tick), actor_id=str(actor_id), detail=detail
    )

  def record_player_demonstration(self, *, kind: str, observation: AiObservation | dict[str, Any] | None, action_id: str, actor_id: str = "player", detail: dict[str, Any] | None = None) -> bool:
    """
    player の入力に基づく実演を記録する。
    記録は recording が真かつ当該種別が capture 対象の場合のみ行う。player 実演は専門家の正例として success を真で記録し、detail に actor_kind=player、feature_keys、行動源 player、時刻、session を埋める。observation を省略した場合は空観測として記録する。記録した場合は真を返す。
    """
    if not self._recorder.captures(kind):
      return False
    feature_keys: list[str] = []
    if isinstance(observation, AiObservation):
      feature_keys = list(encode_features(observation))
    merged_detail: dict[str, Any] = {
      "record_type": "player_demonstration",
      "timestamp": float(time.time()),
      "session_id": str(self._session_id),
      "actor_kind": "player",
      "action_source": ACTION_SOURCE_PLAYER,
      "feature_keys": feature_keys,
    }
    if isinstance(detail, dict):
      merged_detail.update(detail)
    return self._recorder.record(kind=str(kind), observation=observation, action=str(action_id), success=True, tick=int(self._tick), actor_id=str(actor_id), detail=merged_detail)

  def pending_count(self) -> int:
    """
    flush 待ちの記録件数を返す。
    application 層は flush interval 判定と shutdown 前の未完了記録確認に用いる。
    """
    return self._recorder.pending_count()

  def should_flush(self) -> bool:
    """
    記録器の buffer が自動 flush 推奨閾値に達したかを返す。
    真なら application 層は次の安全な機会に flush することが望ましい。
    """
    return self._recorder.should_flush()

  def flush(self, sink: DatasetSink) -> int:
    """
    buffer 内の記録を sink へ書き出し、件数を返す。
    sink は application 層が所有する user data root への追記器であり、本調整器は path を知らない。書き出しは毎 frame ではなく interval / shutdown で行う前提である。
    """
    return self._recorder.flush(sink)

  def shutdown_flush(self, sink: DatasetSink) -> int:
    """
    終了時に未完了記録を sink へ確実に書き出し、件数を返す。
    flush 未完了の記録を失わないための経路である。
    """
    return self._recorder.shutdown_flush(sink)
