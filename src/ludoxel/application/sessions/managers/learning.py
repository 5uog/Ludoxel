# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from ludoxel.application.persistence.schema.ai_learning import LEARNING_MODE_OFF, LEARNING_MODE_USE_LEARNED_POLICY, is_active_learning_mode
from ludoxel.application.persistence.stores.ai_learning import AiLearningStore
from ludoxel.simulation.actors.ai_players.learning.policy import Policy, load_policy
from ludoxel.simulation.actors.ai_players.learning.policy_registry import PolicyRegistry

_DEFAULT_FLUSH_INTERVAL_S: float = 2.0


@dataclass
class AiLearningRuntime:
  project_root: Path
  data_root: Path | None = None
  flush_interval_s: float = _DEFAULT_FLUSH_INTERVAL_S
  _store: AiLearningStore = field(init=False, repr=False)
  _registry: PolicyRegistry = field(init=False, repr=False)
  _since_flush_s: float = field(default=0.0, init=False, repr=False)
  _dataset_id: str = field(default="default", init=False, repr=False)

  def __post_init__(self) -> None:
    self._store = AiLearningStore(project_root=Path(self.project_root), data_root=(None if self.data_root is None else Path(self.data_root)))
    self._registry = PolicyRegistry(user_policy_loader=self._load_user_policy)

  def store(self) -> AiLearningStore:
    return self._store

  def _load_user_policy(self, policy_id: str) -> Policy | None:
    data = self._store.load_policy_dict(str(policy_id))
    return load_policy(data) if isinstance(data, dict) else None

  def configure_session(self, session) -> None:
    state = self._store.load_state()
    settings = state.settings
    self._dataset_id = str(settings.dataset_id)
    mode = str(settings.learning_mode) if bool(is_active_learning_mode(settings.learning_mode)) else str(LEARNING_MODE_OFF)
    policy: Policy | None = None
    if mode == str(LEARNING_MODE_USE_LEARNED_POLICY):
      policy = self._registry.resolve(kind=str(settings.selected_policy_kind), policy_id=str(settings.selected_policy_id))
    session.configure_learning(mode=str(mode), captured_kinds=tuple(settings.captured_kinds()), policy=policy)

  def tick(self, session, dt: float) -> int:
    self._since_flush_s += max(0.0, float(dt))
    if float(self._since_flush_s) < float(self.flush_interval_s):
      return 0
    self._since_flush_s = 0.0
    if int(session.learning_pending()) <= 0:
      return 0
    return int(session.flush_learning(self._store.dataset_writer(self._dataset_id)))

  def flush(self, session) -> int:
    if int(session.learning_pending()) <= 0:
      return 0
    return int(session.flush_learning(self._store.dataset_writer(self._dataset_id)))
