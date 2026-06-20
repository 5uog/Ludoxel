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
  def __init__(self, *, session_id: str = "", recorder: DemonstrationRecorder | None = None, deterministic: DeterministicPolicy | None = None) -> None:
    self._session_id = str(session_id)
    self._recorder = recorder if isinstance(recorder, DemonstrationRecorder) else DemonstrationRecorder()
    self._deterministic = deterministic if isinstance(deterministic, DeterministicPolicy) else DeterministicPolicy()
    self._mode = LEARNING_RUNTIME_OFF
    self._policy: Policy | None = None
    self._tick = 0

  def configure(self, *, mode: str, captured_kinds: Iterable[str], policy: Policy | None) -> None:
    self._mode = str(mode)
    self._policy = policy if isinstance(policy, Policy) else None
    self._recorder.configure(enabled=(str(mode) == LEARNING_RUNTIME_OBSERVE_ONLY), captured_kinds=tuple(captured_kinds))

  def active(self) -> bool:
    return self._mode in (LEARNING_RUNTIME_OBSERVE_ONLY, LEARNING_RUNTIME_USE_LEARNED_POLICY)

  def recording(self) -> bool:
    return self._mode == LEARNING_RUNTIME_OBSERVE_ONLY

  def policy_enabled(self) -> bool:
    return self._mode == LEARNING_RUNTIME_USE_LEARNED_POLICY and isinstance(self._policy, Policy) and bool(self._policy.is_usable())

  def decide(self, observation: AiObservation, mask: AiActionMask) -> PolicyDecision:
    policy = self._policy if self.policy_enabled() else None
    return self._deterministic.decide(observation, mask, policy)

  def selected_policy_id(self) -> str:
    return str(self._policy.policy_id) if isinstance(self._policy, Policy) else ""

  def debug_rankings(self, observation: AiObservation, mask: AiActionMask) -> tuple[tuple[tuple[str, float], ...], tuple[tuple[str, float], ...], str, bool]:
    deterministic = self._deterministic.decide(observation, mask, None)
    policy = self._policy if self.policy_enabled() else None
    learned = self._deterministic.decide(observation, mask, policy)
    return (deterministic.ranked, learned.ranked, self.selected_policy_id(), bool(self.policy_enabled()))

  def begin_tick(self) -> None:
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
    return self._recorder.pending_count()

  def should_flush(self) -> bool:
    return self._recorder.should_flush()

  def flush(self, sink: DatasetSink) -> int:
    return self._recorder.flush(sink)

  def shutdown_flush(self, sink: DatasetSink) -> int:
    return self._recorder.shutdown_flush(sink)
