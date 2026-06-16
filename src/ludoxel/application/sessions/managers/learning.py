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
  """
  保存済み AI Learning 設定を live session の学習調整器へ接続し、demonstration の遅延 flush を管理する application 層 runtime である。
  本 runtime は user data root を所有する AiLearningStore と、user 学習 policy を user data root から解決する PolicyRegistry を保持する。session 開始時と Learning tab での設定変更後に configure_session を呼ぶことで、Learning Mode・記録対象種別・選択 policy を session の LearningCoordinator へ反映する。Use Learned Policy では選択 policy を registry 経由で解決し、評価未通過・破損・互換不一致の policy は registry が組み込み deterministic へ退避させるため、live AI は安全な決定へ fallback する。
  記録の永続化は tick の flush interval(既定 2 秒)に基づく遅延書き込みで行い、毎 frame の同期 I/O を避けて frame loop を止めない。shutdown 前には flush で未完了記録を user data root へ確実に書き出す。
  project_root は data_root 未指定時の runtime data root 解決に用いる。
  """

  project_root: Path
  data_root: Path | None = None
  flush_interval_s: float = _DEFAULT_FLUSH_INTERVAL_S
  _store: AiLearningStore = field(init=False, repr=False)
  _registry: PolicyRegistry = field(init=False, repr=False)
  _since_flush_s: float = field(default=0.0, init=False, repr=False)
  _dataset_id: str = field(default="default", init=False, repr=False)

  def __post_init__(self) -> None:
    """
    user data root を解決する store と、user policy を解決する registry を構築する。
    registry は user 学習 policy の読み込みに本 runtime の loader を用い、組み込み deterministic を最終 fallback として保持する。
    """
    self._store = AiLearningStore(project_root=Path(self.project_root), data_root=(None if self.data_root is None else Path(self.data_root)))
    self._registry = PolicyRegistry(user_policy_loader=self._load_user_policy)

  def store(self) -> AiLearningStore:
    """
    本 runtime が用いる学習 store を返す。
    UI 側が同一 user data root の設定・dataset・policy を参照する際に共有する。
    """
    return self._store

  def _load_user_policy(self, policy_id: str) -> Policy | None:
    """
    user data root の policies directory から指定 id の policy artifact を読み込み、復元する。
    保存 mapping が無い又は復元不能の場合は None を返し、registry は組み込み deterministic へ退避する。
    """
    data = self._store.load_policy_dict(str(policy_id))
    return load_policy(data) if isinstance(data, dict) else None

  def configure_session(self, session) -> None:
    """
    保存済み学習設定を読み、session の学習調整器を構成する。
    通常 play で有効化してよい mode は off / observe_only / use_learned_policy に限り、train 系 mode が保存されていても live では off として扱う。Use Learned Policy では選択 policy を registry で解決して渡し、評価未通過・破損 policy は registry の fallback により組み込み deterministic となる。記録対象種別と dataset 識別子も設定から取得し、後続 flush の宛先に用いる。
    """
    state = self._store.load_state()
    settings = state.settings
    self._dataset_id = str(settings.dataset_id)
    mode = str(settings.learning_mode) if bool(is_active_learning_mode(settings.learning_mode)) else str(LEARNING_MODE_OFF)
    policy: Policy | None = None
    if mode == str(LEARNING_MODE_USE_LEARNED_POLICY):
      policy = self._registry.resolve(kind=str(settings.selected_policy_kind), policy_id=str(settings.selected_policy_id))
    session.configure_learning(mode=str(mode), captured_kinds=tuple(settings.captured_kinds()), policy=policy)

  def tick(self, session, dt: float) -> int:
    """
    flush interval を進め、interval 到達時に未完了記録を user data root へ書き出す。
    経過時間が flush_interval_s 未満の間は何もせず 0 を返す。interval 到達時に flush 待ち記録があれば dataset へ追記し、書き出し件数を返す。毎 frame の同期 I/O を避けるため、本 method は frame loop から呼んでも interval 間隔でしか書き込みを行わない。
    """
    self._since_flush_s += max(0.0, float(dt))
    if float(self._since_flush_s) < float(self.flush_interval_s):
      return 0
    self._since_flush_s = 0.0
    if int(session.learning_pending()) <= 0:
      return 0
    return int(session.flush_learning(self._store.dataset_writer(self._dataset_id)))

  def flush(self, session) -> int:
    """
    未完了記録を即時に user data root へ書き出し、書き出し件数を返す。
    flush 待ち記録が無ければ 0 を返す。shutdown 前や明示的な保存契機で呼び、記録の損失を防ぐ。
    """
    if int(session.learning_pending()) <= 0:
      return 0
    return int(session.flush_learning(self._store.dataset_writer(self._dataset_id)))
