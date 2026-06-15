# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import replace
from pathlib import Path
from typing import Any, Protocol, runtime_checkable

from ludoxel.application.persistence.schema.ai_learning import PersistedAiLearningSettings, PersistedAiLearningState, normalize_learning_mode
from ludoxel.application.persistence.stores.ai_learning import AiLearningStore
from ludoxel.simulation.actors.ai_players.learning.dataset import DatasetSummary
from ludoxel.simulation.actors.ai_players.learning.evaluator import EvaluationReport, run_evaluation
from ludoxel.simulation.actors.ai_players.learning.policy_registry import POLICY_KIND_BUILTIN, POLICY_KIND_BUNDLED, PolicyRegistry, normalize_policy_kind


@runtime_checkable
class AiLearningTabController(Protocol):
  """
  AI Settings の Learning タブが学習設定と dataset 操作を読み書きするための seam を表す Protocol である。
  タブ widget は本契約だけに依存し、保存先 file、user data root、policy registry、評価 entry の実体を知らない。これにより presentation の view は application persistence と simulation 評価の orchestration から分離され、test では軽量な代替実装を注入できる。各 setter は変更を即時に永続化する責務を持ち、view は戻り値の最新状態で表示を更新する。
  """

  def state(self) -> PersistedAiLearningState: ...

  def set_learning_mode(self, mode: str) -> PersistedAiLearningState: ...

  def set_capture_flag(self, kind: str, enabled: bool) -> PersistedAiLearningState: ...

  def set_skill_flag(self, skill: str, enabled: bool) -> PersistedAiLearningState: ...

  def set_policy(self, kind: str, policy_id: str) -> PersistedAiLearningState: ...

  def bundled_policy_options(self) -> tuple[tuple[str, str], ...]: ...

  def dataset_summary(self) -> DatasetSummary: ...

  def run_minimal_evaluation(self) -> EvaluationReport: ...

  def export_dataset(self, destination: str) -> int: ...

  def import_dataset(self, source: str) -> int: ...

  def clear_dataset(self) -> bool: ...

  def reset_learned_policy(self) -> PersistedAiLearningState: ...

  def restore_bundled_policy(self) -> PersistedAiLearningState: ...


class AiLearningController:
  """
  AiLearningStore と simulation 学習基盤を束ねて Learning タブへ供給する具象 controller である。
  本 controller は presentation 層に属し、application の AiLearningStore へ設定の保存・dataset の集計・削除・書き出し・取り込みを委譲し、simulation の PolicyRegistry と評価 entry を参照する。Learning Mode、capture flag、skill flag、policy 選択の各変更は in-memory 状態へ反映したうえで即座に store へ保存し、view が最新状態で再描画できるよう保存後の状態を返す。dataset の書き出し・取り込み・削除は user data root 上の JSON Lines file を対象とし、player 生 data を repository へ書き込まない。最小評価は run_evaluation の dry-run を呼び、結果要約を last evaluation として保存する。重い学習は本段階では実行せず、Train 系 mode は設定として保持できるが本 controller から学習 process を起動しない。
  """

  def __init__(self, *, project_root: Path, data_root: Path | None = None) -> None:
    """
    user data root を解決する store を構築し、保存済み学習状態を読み込んで初期化する。
    project_root は data_root 未指定時の runtime data root 解決に用い、data_root を明示した場合はその directory を基準とする。読み込んだ状態は in-memory に保持し、以降の変更はこの状態に反映してから保存する。PolicyRegistry は同梱 policy 一覧の提示に用いるため一度だけ構築する。
    """
    self._store = AiLearningStore(project_root=Path(project_root), data_root=(None if data_root is None else Path(data_root)))
    self._state = self._store.load_state()
    self._registry = PolicyRegistry()

  def state(self) -> PersistedAiLearningState:
    """
    現在保持している学習状態を返す。
    view はこの状態で control の初期値と表示を構成する。返値は in-memory の最新状態であり、setter 呼び出し後は更新済みの状態を反映する。
    """
    return self._state

  def _save(self, settings: PersistedAiLearningSettings | None = None, **state_fields: Any) -> PersistedAiLearningState:
    """
    settings 又は state field の変更を in-memory 状態へ反映し、store へ保存して最新状態を返す。
    settings を与えた場合は正規化して置換し、state_fields は PersistedAiLearningState の他 field(dataset_summary、last_training_summary、last_evaluation_summary、policy_version)を上書きする。保存は JsonFileStore による原子的書き込みであり、設定変更のたびに即時永続化する。
    """
    next_settings = self._state.settings if settings is None else settings.normalized()
    self._state = replace(self._state, settings=next_settings, **state_fields)
    self._store.save_state(self._state)
    return self._state

  def set_learning_mode(self, mode: str) -> PersistedAiLearningState:
    """
    Learning Mode を正規化して保存する。
    未知値は off へ退避する正規化を経るため、不正な mode が記録や policy 使用を誤って有効化しない。返値は更新後の状態である。
    """
    next_settings = replace(self._state.settings, learning_mode=normalize_learning_mode(mode))
    return self._save(next_settings)

  def set_capture_flag(self, kind: str, enabled: bool) -> PersistedAiLearningState:
    """
    指定 demonstration 記録種別の取得有無を保存する。
    現在の capture_flags を複製して当該 key を更新し、normalized により未知 key を排除して保存する。返値は更新後の状態である。
    """
    flags = dict(self._state.settings.capture_flags)
    flags[str(kind)] = bool(enabled)
    return self._save(replace(self._state.settings, capture_flags=flags))

  def set_skill_flag(self, skill: str, enabled: bool) -> PersistedAiLearningState:
    """
    指定技能カテゴリの学習・評価対象有無を保存する。
    現在の skill_flags を複製して当該 key を更新し、normalized により未知 key を排除して保存する。返値は更新後の状態である。
    """
    flags = dict(self._state.settings.skill_flags)
    flags[str(skill)] = bool(enabled)
    return self._save(replace(self._state.settings, skill_flags=flags))

  def set_policy(self, kind: str, policy_id: str) -> PersistedAiLearningState:
    """
    本番使用 policy の種別と識別子を保存する。
    種別は policy 四値へ正規化し、識別子は前後空白を除去する。返値は更新後の状態であり、実際にどの policy が解決されるかは runtime が PolicyRegistry を介して決定する。
    """
    next_settings = replace(self._state.settings, selected_policy_kind=normalize_policy_kind(kind), selected_policy_id=str(policy_id).strip())
    return self._save(next_settings)

  def bundled_policy_options(self) -> tuple[tuple[str, str], ...]:
    """
    選択可能な同梱 policy の (識別子, 表示名) 組を識別子昇順で返す。
    view の policy 選択肢提示に用いる。registry が同梱 policy を読み込めない環境では空 tuple を返す。
    """
    return tuple((policy.policy_id, policy.policy_name) for policy in self._registry.bundled_policies())

  def dataset_summary(self) -> DatasetSummary:
    """
    現在 dataset の規模要約を走査して返す。
    要約は記録件数、byte 長、種別別件数を含み、view の dataset size 表示に用いる。本 method は要求時にのみ走査し、毎 frame では呼ばない前提である。
    """
    return self._store.dataset_summary(self._state.settings.dataset_id)

  def run_minimal_evaluation(self) -> EvaluationReport:
    """
    最小評価(dry-run)を実行し、結果要約を保存して返す。
    本段階では sandbox 実行本体を持たないため、各課題は not_run を返し総合判定は不合格となる。結果要約は last_evaluation_summary として保存し、view は合否未確定として表示できる。
    """
    report = run_evaluation()
    self._save(last_evaluation_summary=report.to_dict())
    return report

  def export_dataset(self, destination: str) -> int:
    """
    現在 dataset の有効記録を外部 file へ書き出し、件数を返す。
    書き出し後に dataset 要約を最新化して保存する。返値は書き出した有効記録数である。
    """
    written = self._store.export_dataset(self._state.settings.dataset_id, Path(destination))
    self._save(dataset_summary=self._store.dataset_summary(self._state.settings.dataset_id).to_dict())
    return int(written)

  def import_dataset(self, source: str) -> int:
    """
    外部 file の有効記録を現在 dataset へ追記し、件数を返す。
    取り込み後に dataset 要約を最新化して保存する。不正な行は取り込まないため dataset の健全性を保つ。返値は追記した件数である。
    """
    imported = self._store.import_dataset(self._state.settings.dataset_id, Path(source))
    self._save(dataset_summary=self._store.dataset_summary(self._state.settings.dataset_id).to_dict())
    return int(imported)

  def clear_dataset(self) -> bool:
    """
    現在 dataset の蓄積記録を削除し、削除の成否を返す。
    削除後に dataset 要約を空へ更新して保存する。設定状態や policy には影響しない。
    """
    cleared = self._store.clear_dataset(self._state.settings.dataset_id)
    self._save(dataset_summary=DatasetSummary().to_dict())
    return bool(cleared)

  def reset_learned_policy(self) -> PersistedAiLearningState:
    """
    本番使用 policy を組み込み deterministic baseline へ戻し、学習由来の状態を初期化する。
    selected_policy_kind を組み込みへ、selected_policy_id を空へ戻し、policy_version を 0、last_training_summary を空へ更新して保存する。dataset 記録には影響しない。返値は更新後の状態である。
    """
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_BUILTIN, selected_policy_id="")
    self._state = replace(self._state, settings=next_settings.normalized(), policy_version=0, last_training_summary={})
    self._store.save_state(self._state)
    return self._state

  def restore_bundled_policy(self) -> PersistedAiLearningState:
    """
    本番使用 policy を同梱学習 policy へ切り替える。
    selected_policy_kind を同梱へ、selected_policy_id を空(任意の使用可能な同梱 policy を runtime が選ぶ)へ更新して保存する。同梱 policy が読み込めない場合でも runtime は組み込み deterministic へ退避するため、設定変更自体は安全である。返値は更新後の状態である。
    """
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_BUNDLED, selected_policy_id="")
    return self._save(next_settings)
