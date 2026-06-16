# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from dataclasses import replace
from pathlib import Path
from typing import Any, Protocol, runtime_checkable

from ludoxel.application.persistence.schema.ai_learning import PersistedAiLearningSettings, PersistedAiLearningState, normalize_learning_mode
from ludoxel.application.persistence.stores.ai_learning import AiLearningStore
from ludoxel.simulation.actors.ai_players.learning.dataset import DatasetSummary
from ludoxel.simulation.actors.ai_players.learning.evaluator import EvaluationReport, run_evaluation
from ludoxel.simulation.actors.ai_players.learning.policy import Policy, builtin_deterministic_policy, load_policy
from ludoxel.simulation.actors.ai_players.learning.policy_registry import POLICY_KIND_BUILTIN, POLICY_KIND_BUNDLED, POLICY_KIND_USER, PolicyRegistry, normalize_policy_kind
from ludoxel.simulation.actors.ai_players.learning.trainer import TrainingService

USER_PLAYER_POLICY_ID: str = "user_player_policy"
USER_SANDBOX_POLICY_ID: str = "user_sandbox_policy"


@runtime_checkable
class AiLearningTabController(Protocol):
  """
  AI Settings の Learning タブが学習設定と学習操作を読み書きするための seam を表す Protocol である。
  タブ widget は本契約だけに依存し、保存先 file、user data root、policy registry、trainer、sandbox、評価 entry の実体を知らない。これにより presentation の view は application persistence と simulation の学習・評価 orchestration から分離され、test では軽量な代替実装を注入できる。各 setter は変更を即時に永続化し、学習・評価操作は結果 mapping を返す。重い処理(訓練・sandbox・評価)は呼び出し側 view が background thread で実行することを想定する。
  """

  def state(self) -> PersistedAiLearningState: ...

  def set_learning_mode(self, mode: str) -> PersistedAiLearningState: ...

  def set_capture_flag(self, kind: str, enabled: bool) -> PersistedAiLearningState: ...

  def set_skill_flag(self, skill: str, enabled: bool) -> PersistedAiLearningState: ...

  def set_policy(self, kind: str, policy_id: str) -> PersistedAiLearningState: ...

  def bundled_policy_options(self) -> tuple[tuple[str, str], ...]: ...

  def user_policy_options(self) -> tuple[tuple[str, str], ...]: ...

  def dataset_summary(self) -> DatasetSummary: ...

  def run_minimal_evaluation(self) -> EvaluationReport: ...

  def train_from_player_data(self) -> dict[str, Any]: ...

  def train_in_sandbox(self) -> dict[str, Any]: ...

  def export_dataset(self, destination: str) -> int: ...

  def import_dataset(self, source: str) -> int: ...

  def clear_dataset(self) -> bool: ...

  def reset_learned_policy(self) -> PersistedAiLearningState: ...

  def restore_bundled_policy(self) -> PersistedAiLearningState: ...

  def policy_save_path(self) -> str: ...

  def evaluation_save_path(self) -> str: ...


class AiLearningController:
  """
  AiLearningStore と simulation 学習基盤を束ねて Learning タブへ供給する具象 controller である。
  本 controller は presentation 層に属し、application の AiLearningStore へ設定・dataset・policy・評価・学習履歴の永続化を委譲し、simulation の trainer、sandbox、evaluator、PolicyRegistry を駆動する。設定変更は即時保存する。Train From Player Data は user data root の JSONL を読んで feature 条件付き policy を生成し、自動評価を経て user policy として保存する。Train In Sandbox は headless sandbox で reinforcement-style に policy を改善して保存する。Run Evaluation は選択 policy を実評価し、結果を保存して policy の使用可否(評価通過)を確定する。生成 policy は評価を通るまで is_usable が偽であり、live で使用されない。重い処理は同期実行されるため、view は background thread で呼ぶ。
  """

  def __init__(self, *, project_root: Path, data_root: Path | None = None) -> None:
    """
    user data root を解決する store を構築し、保存済み学習状態を読み込んで初期化する。
    PolicyRegistry は user policy を user data root から解決する loader を伴って構築し、同梱 policy 一覧と選択 policy 解決に用いる。読み込んだ状態は in-memory に保持し、以降の変更はこの状態へ反映してから保存する。
    """
    self._store = AiLearningStore(project_root=Path(project_root), data_root=(None if data_root is None else Path(data_root)))
    self._state = self._store.load_state()
    self._registry = PolicyRegistry(user_policy_loader=self._load_user_policy)
    self._last_policy_path: str = ""
    self._last_evaluation_path: str = ""

  def state(self) -> PersistedAiLearningState:
    """
    現在保持している学習状態を返す。
    view はこの状態で control の初期値と表示を構成する。返値は in-memory の最新状態であり、操作後は更新済みの状態を反映する。
    """
    return self._state

  def _load_user_policy(self, policy_id: str) -> Policy | None:
    """
    user data root の policies directory から指定 id の policy artifact を読み込み、復元する。
    保存 mapping が無い又は復元不能の場合は None を返す。registry はこれを介して user policy を解決し、得られない場合は組み込み deterministic へ退避する。
    """
    data = self._store.load_policy_dict(str(policy_id))
    return load_policy(data) if isinstance(data, dict) else None

  def _save(self, settings: PersistedAiLearningSettings | None = None, **state_fields: Any) -> PersistedAiLearningState:
    """
    settings 又は state field の変更を in-memory 状態へ反映し、store へ保存して最新状態を返す。
    settings を与えた場合は正規化して置換し、state_fields は dataset_summary、last_training_summary、last_evaluation_summary、policy_version を上書きする。保存は原子的書き込みで行う。
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
    return self._save(replace(self._state.settings, learning_mode=normalize_learning_mode(mode)))

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
    種別は policy 四値へ正規化し、識別子は前後空白を除去する。返値は更新後の状態であり、実際の解決と評価通過判定は runtime と registry が行う。
    """
    return self._save(replace(self._state.settings, selected_policy_kind=normalize_policy_kind(kind), selected_policy_id=str(policy_id).strip()))

  def bundled_policy_options(self) -> tuple[tuple[str, str], ...]:
    """
    選択可能な同梱 policy の (識別子, 表示名) 組を識別子昇順で返す。
    registry が同梱 policy を読み込めない環境では空 tuple を返す。
    """
    return tuple((policy.policy_id, policy.policy_name) for policy in self._registry.bundled_policies())

  def user_policy_options(self) -> tuple[tuple[str, str], ...]:
    """
    保存済み user 学習 policy の (識別子, 表示名) 組を返す。
    user data root の policies directory を走査し、読み込めた policy の id と表示名を返す。view の user policy 選択肢提示に用いる。
    """
    options: list[tuple[str, str]] = []
    for policy_id in self._store.list_user_policy_ids():
      policy = self._load_user_policy(policy_id)
      options.append((str(policy_id), str(policy.policy_name) if policy is not None else str(policy_id)))
    return tuple(options)

  def dataset_summary(self) -> DatasetSummary:
    """
    現在 dataset の規模要約を走査して返す。
    記録件数、byte 長、種別別件数を含み、view の dataset size 表示に用いる。要求時にのみ走査する。
    """
    return self._store.dataset_summary(self._state.settings.dataset_id)

  def _raw_selected_policy(self) -> Policy | None:
    """
    設定で選択中の policy を、評価通過の有無に依らず生のまま解決して返す。
    user 種別は policies directory から、bundled 種別は同梱 artifact から、builtin 種別は組み込み deterministic から取り出す。評価対象を fallback 前の実体として得るため、registry.resolve(評価未通過を fallback する)とは別に解決する。得られない場合は None を返す。
    """
    settings = self._state.settings
    kind = str(settings.selected_policy_kind)
    if kind == POLICY_KIND_USER:
      return self._load_user_policy(settings.selected_policy_id)
    if kind == POLICY_KIND_BUNDLED:
      requested = str(settings.selected_policy_id).strip()
      for policy in self._registry.bundled_policies():
        if not requested or str(policy.policy_id) == requested:
          return policy
      return None
    if kind == POLICY_KIND_BUILTIN:
      return builtin_deterministic_policy()
    return None

  def run_minimal_evaluation(self) -> EvaluationReport:
    """
    選択 policy を実評価し、結果を保存して返す。
    選択 policy(user / bundled / builtin)を生のまま解決し、run_evaluation で schema・互換・行動目録・feature 符号化器・mask 準拠・sandbox 行動を実検査する。結果は evaluations directory へ保存する。選択 policy が user policy の場合は、評価結果を policy artifact の evaluation へ埋め込んで再保存し、評価通過なら以後 live 使用可能、不通過なら使用不可とする。状態の last_evaluation_summary と policy_version を更新する。本評価は dry-run ではなく実検査である。
    """
    policy = self._raw_selected_policy()
    report = run_evaluation(policy)
    policy_id = str(report.policy_id) or "builtin_deterministic"
    self._last_evaluation_path = str(self._store.save_evaluation(policy_id, report.to_dict()))
    if policy is not None and str(self._state.settings.selected_policy_kind) == POLICY_KIND_USER:
      artifact = policy.to_dict()
      artifact["evaluation"] = report.to_dict()
      self._last_policy_path = str(self._store.save_policy(artifact))
    self._save(last_evaluation_summary=report.to_dict(), policy_version=int(policy.policy_version) if policy is not None else int(self._state.policy_version))
    return report

  def train_from_player_data(self) -> dict[str, Any]:
    """
    user data root の demonstration dataset を読み、feature 条件付き policy を学習して保存する。
    dataset を復号し(破損行は skip して報告)、TrainingService で学習する。dataset が空、又は有効な選好が得られない場合は failed を返す(policy は生成しない)。成功時は生成 policy を自動評価し、評価結果を policy へ埋め込んで policies directory へ保存し、評価結果と training run を保存する。選択 policy を当該 user policy へ切り替え、状態の summary 群と policy_version を更新する。生成 policy は評価を通った場合のみ live 使用可能となる。返値は status、message、policy_id、評価通過可否、保存 path を含む mapping である。
    """
    dataset_id = str(self._state.settings.dataset_id)
    records, corrupt = self._store.iter_demonstration_records(dataset_id)
    summary = self._store.dataset_summary(dataset_id)
    next_version = int(self._state.policy_version) + 1
    result = TrainingService().train_from_player_data(
      records,
      policy_id=USER_PLAYER_POLICY_ID,
      policy_name="User Learned Policy",
      dataset_id=dataset_id,
      dataset_size=int(summary.record_count),
      policy_version=int(next_version),
      corrupt_lines=int(corrupt),
    )
    run_id = f"train_player_{int(time.time())}"
    if result.policy is None:
      self._store.save_training_run(run_id, {**result.to_dict(), "mode": "train_from_player_data"})
      self._save(last_training_summary=result.to_dict())
      return {"status": str(result.status), "message": str(result.message), "policy_id": "", "passed": False, "policy_path": "", "evaluation_path": ""}
    report = run_evaluation(result.policy)
    artifact = result.policy.to_dict()
    artifact["evaluation"] = report.to_dict()
    policy_path = str(self._store.save_policy(artifact))
    evaluation_path = str(self._store.save_evaluation(result.policy.policy_id, report.to_dict()))
    self._store.save_training_run(run_id, {**result.to_dict(), "mode": "train_from_player_data", "evaluation": report.to_dict()})
    self._last_policy_path = str(policy_path)
    self._last_evaluation_path = str(evaluation_path)
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_USER, selected_policy_id=str(result.policy.policy_id))
    self._save(next_settings, last_training_summary=result.to_dict(), last_evaluation_summary=report.to_dict(), policy_version=int(result.policy.policy_version))
    return {
      "status": str(result.status),
      "message": str(result.message),
      "policy_id": str(result.policy.policy_id),
      "passed": bool(report.passed),
      "policy_path": str(policy_path),
      "evaluation_path": str(evaluation_path),
    }

  def train_in_sandbox(self) -> dict[str, Any]:
    """
    headless sandbox で reinforcement-style に policy を学習・改善して保存する。
    選択中の policy を起点に sandbox training を実行し、deterministic baseline 以上の score を出した改善 policy を生成する。改善が得られない場合は failed を返す。成功時は生成 policy(sandbox 評価結果を内包)を保存し、評価結果と training run を保存して、選択 policy を当該 user policy へ切り替える。状態の summary 群と policy_version を更新する。返値は status、message、policy_id、評価通過可否、保存 path を含む mapping である。重い neural network や外部 ML framework を用いず Ludoxel の実規則のみで完結する。
    """
    from ludoxel.simulation.actors.ai_players.learning.sandbox import train_in_sandbox as sandbox_train

    base = self._raw_selected_policy()
    next_version = int(self._state.policy_version) + 1
    result = sandbox_train(policy_id=USER_SANDBOX_POLICY_ID, policy_name="Sandbox Learned Policy", base_policy=base, policy_version=int(next_version), iterations=1)
    run_id = f"train_sandbox_{int(time.time())}"
    if result.policy is None:
      self._store.save_training_run(run_id, {"status": str(result.status), "message": str(result.message), "mode": "train_in_sandbox", "summary": dict(result.summary)})
      self._save(last_training_summary={"status": str(result.status), "message": str(result.message)})
      return {"status": str(result.status), "message": str(result.message), "policy_id": "", "passed": False, "policy_path": "", "evaluation_path": ""}
    evaluation = dict(result.policy.evaluation)
    policy_path = str(self._store.save_policy(result.policy.to_dict()))
    evaluation_path = str(self._store.save_evaluation(result.policy.policy_id, evaluation))
    self._store.save_training_run(
      run_id, {"status": str(result.status), "message": str(result.message), "mode": "train_in_sandbox", "summary": dict(result.summary), "task_results": list(result.task_results)}
    )
    self._last_policy_path = str(policy_path)
    self._last_evaluation_path = str(evaluation_path)
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_USER, selected_policy_id=str(result.policy.policy_id))
    training_summary = {"status": str(result.status), "message": str(result.message), "policy_score": float(result.policy_score), "baseline_score": float(result.baseline_score)}
    self._save(next_settings, last_training_summary=training_summary, last_evaluation_summary=evaluation, policy_version=int(result.policy.policy_version))
    return {
      "status": str(result.status),
      "message": str(result.message),
      "policy_id": str(result.policy.policy_id),
      "passed": bool(evaluation.get("passed", False)),
      "policy_path": str(policy_path),
      "evaluation_path": str(evaluation_path),
    }

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
    selected_policy_kind を組み込みへ、selected_policy_id を空へ戻し、policy_version を 0、last_training_summary を空へ更新して保存する。dataset 記録と保存済み user policy file には影響しない。返値は更新後の状態である。
    """
    next_settings = replace(self._state.settings, selected_policy_kind=POLICY_KIND_BUILTIN, selected_policy_id="")
    self._state = replace(self._state, settings=next_settings.normalized(), policy_version=0, last_training_summary={})
    self._store.save_state(self._state)
    return self._state

  def restore_bundled_policy(self) -> PersistedAiLearningState:
    """
    本番使用 policy を同梱学習 policy へ切り替える。
    selected_policy_kind を同梱へ、selected_policy_id を空へ更新して保存する。同梱 policy が読み込めない場合でも runtime は組み込み deterministic へ退避するため、設定変更自体は安全である。返値は更新後の状態である。
    """
    return self._save(replace(self._state.settings, selected_policy_kind=POLICY_KIND_BUNDLED, selected_policy_id=""))

  def policy_save_path(self) -> str:
    """
    直近に保存した policy artifact の絶対 path を返す。
    まだ保存していない場合は policies directory の選択 policy 想定 path を返し、view の保存先表示に用いる。
    """
    if self._last_policy_path:
      return str(self._last_policy_path)
    policy_id = str(self._state.settings.selected_policy_id) or "policy"
    return str(self._store.policy_path(policy_id))

  def evaluation_save_path(self) -> str:
    """
    直近に保存した評価結果の絶対 path を返す。
    まだ保存していない場合は空文字を返し、view の保存先表示に用いる。
    """
    return str(self._last_evaluation_path)
