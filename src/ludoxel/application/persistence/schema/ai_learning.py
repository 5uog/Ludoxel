# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.foundations.mathematics.scalars.coercion import coerce_bool, coerce_int, mapping_str
from ludoxel.simulation.actors.ai_players.learning.actions import skill_category_ids
from ludoxel.simulation.actors.ai_players.learning.dataset import RECORD_KINDS
from ludoxel.simulation.actors.ai_players.learning.policy_registry import POLICY_KIND_BUILTIN, normalize_policy_kind

AI_LEARNING_SCHEMA_VERSION: int = 1

LEARNING_MODE_OFF: str = "off"
LEARNING_MODE_OBSERVE_ONLY: str = "observe_only"
LEARNING_MODE_USE_LEARNED_POLICY: str = "use_learned_policy"
LEARNING_MODE_TRAIN_FROM_PLAYER_DATA: str = "train_from_player_data"
LEARNING_MODE_TRAIN_IN_SANDBOX: str = "train_in_sandbox"

LEARNING_MODES: tuple[str, ...] = (LEARNING_MODE_OFF, LEARNING_MODE_OBSERVE_ONLY, LEARNING_MODE_USE_LEARNED_POLICY, LEARNING_MODE_TRAIN_FROM_PLAYER_DATA, LEARNING_MODE_TRAIN_IN_SANDBOX)

ACTIVE_LEARNING_MODES: tuple[str, ...] = (LEARNING_MODE_OFF, LEARNING_MODE_OBSERVE_ONLY, LEARNING_MODE_USE_LEARNED_POLICY)

_LEARNING_MODE_SET: frozenset[str] = frozenset(LEARNING_MODES)


def normalize_learning_mode(value: object) -> str:
  """
  Learning Mode を五値の何れかへ正規化する。
  入力は任意 object を許容し、文字列化と前後空白除去と小文字化の後に
  LEARNING_MODES と明示一致した場合だけその値を採用し、欠落値・未知値は off へ退避する。
  off へ寄せるのは、未知値が誤って記録や policy 使用を有効化しない安全側の既定を保つためである。
  Train From Player Data と Train In Sandbox は値として保持できるが、通常 play 中に有効化してよい mode は
  ACTIVE_LEARNING_MODES に限られ、その制約は runtime 側が適用する。
  """
  raw = str(value).strip().lower()
  if raw in _LEARNING_MODE_SET:
    return raw
  return LEARNING_MODE_OFF


def is_active_learning_mode(mode: object) -> bool:
  """
  指定 mode が通常 play 中に有効化してよい mode であるかを返す。
  正規化後の mode が off、observe_only、use_learned_policy の何れかである場合に真を返す。
  train 系 mode は UI 上で選択できても通常 play 中に重い学習を起動しないため、本述語は偽を返す。
  """
  return normalize_learning_mode(mode) in ACTIVE_LEARNING_MODES


def _normalize_flag_map(value: object, *, keys: tuple[str, ...], default: bool) -> dict[str, bool]:
  """
  既知 key 集合に対する真偽 flag mapping を保存値から正規化する。
  返値は keys が定める key だけを持ち、保存値に存在する entry は coerce_bool で復元し、欠落 key は default を用いる。
  保存値に含まれる未知 key は捨て、形式変化や不正値が flag 集合へ混入しないようにする。
  """
  source = value if isinstance(value, dict) else {}
  return {str(key): coerce_bool(source.get(str(key), default), bool(default)) for key in keys}


@dataclass(frozen=True)
class PersistedAiLearningSettings:
  """
  AI 学習基盤の編集可能設定一式の保存表現を表す。
  learning_mode は Learning Mode の五値、capture_flags は demonstration 記録種別(RECORD_KINDS)ごとの取得有無、
  skill_flags は技能カテゴリごとの学習・評価対象有無、selected_policy_kind と selected_policy_id は
  本番使用する policy の種別と識別子、dataset_id は記録の蓄積先を区別する論理識別子である。
  capture_flags は既定で全種別偽(記録しない)、skill_flags は既定で全技能真とし、
  observe only 有効化と policy 使用の有無は learning_mode から導出する。
  本 dataclass は frozen かつ JSON 直列化可能であり、未知 key の混入を normalized 経由で排除する。
  """

  learning_mode: str = LEARNING_MODE_OFF
  capture_flags: dict[str, bool] = field(default_factory=dict)
  skill_flags: dict[str, bool] = field(default_factory=dict)
  selected_policy_kind: str = POLICY_KIND_BUILTIN
  selected_policy_id: str = ""
  dataset_id: str = "default"

  def normalized(self) -> "PersistedAiLearningSettings":
    """
    各 field を既知の値域と key 集合へ正規化した複製を返す。
    learning_mode は五値へ、selected_policy_kind は policy 種別四値へ正規化し、
    capture_flags は RECORD_KINDS に対し既定偽、skill_flags は技能 id 集合に対し既定真で正規化する。
    dataset_id は前後空白を除去し、空の場合は "default" を用いる。
    これにより UI と persistence と runtime が同一の値域と key 集合を共有する。
    """
    dataset_id = str(self.dataset_id).strip() or "default"
    return PersistedAiLearningSettings(
      learning_mode=normalize_learning_mode(self.learning_mode),
      capture_flags=_normalize_flag_map(self.capture_flags, keys=RECORD_KINDS, default=False),
      skill_flags=_normalize_flag_map(self.skill_flags, keys=skill_category_ids(), default=True),
      selected_policy_kind=normalize_policy_kind(self.selected_policy_kind),
      selected_policy_id=str(self.selected_policy_id).strip(),
      dataset_id=str(dataset_id),
    )

  def recording_enabled(self) -> bool:
    """
    現在の設定が demonstration 記録を行う状態であるかを返す。
    Learning Mode が observe_only の場合に真を返す。
    off では記録せず、use_learned_policy と train 系は本基盤では記録の主目的とせず偽を返す。
    記録の種別別取捨は capture_flags が別途決定する。
    """
    return normalize_learning_mode(self.learning_mode) == LEARNING_MODE_OBSERVE_ONLY

  def captured_kinds(self) -> tuple[str, ...]:
    """
    記録対象として有効な種別の列を RECORD_KINDS の定義順で返す。
    記録が無効(recording_enabled が偽)な場合は空 tuple を返し、
    有効な場合は capture_flags が真の種別だけを返す。recorder の設定はこの列を用いる。
    """
    if not self.recording_enabled():
      return ()
    normalized = _normalize_flag_map(self.capture_flags, keys=RECORD_KINDS, default=False)
    return tuple(kind for kind in RECORD_KINDS if bool(normalized.get(kind, False)))

  def to_dict(self) -> dict[str, Any]:
    """
    設定を JSON 直列化可能な mapping へ変換する。
    返値は learning_mode、capture_flags、skill_flags、selected_policy_kind、
    selected_policy_id、dataset_id、及び導出値 observe_only を含む。
    observe_only は recording_enabled に等しい導出値であり、
    保存側の可読性のために併記するが、復元時の真値源は learning_mode である。
    """
    normalized = self.normalized()
    return {
      "learning_mode": str(normalized.learning_mode),
      "observe_only": bool(normalized.recording_enabled()),
      "capture_flags": {str(key): bool(value) for key, value in normalized.capture_flags.items()},
      "skill_flags": {str(key): bool(value) for key, value in normalized.skill_flags.items()},
      "selected_policy_kind": str(normalized.selected_policy_kind),
      "selected_policy_id": str(normalized.selected_policy_id),
      "dataset_id": str(normalized.dataset_id),
    }

  @staticmethod
  def from_dict(data: object) -> "PersistedAiLearningSettings":
    """
    mapping から設定を復元する。
    入力が dict でない場合は既定設定を返す。learning_mode、selected_policy_kind、selected_policy_id、
    dataset_id は文字列射影で読み取り、capture_flags と skill_flags は dict 以外を空 mapping として扱う。
    復元値は normalized を通して値域と key 集合へ収め、observe_only などの導出 key は無視する。
    """
    if not isinstance(data, dict):
      return PersistedAiLearningSettings().normalized()
    capture = data.get("capture_flags")
    skills = data.get("skill_flags")
    return PersistedAiLearningSettings(
      learning_mode=mapping_str(data, "learning_mode", LEARNING_MODE_OFF),
      capture_flags=dict(capture) if isinstance(capture, dict) else {},
      skill_flags=dict(skills) if isinstance(skills, dict) else {},
      selected_policy_kind=mapping_str(data, "selected_policy_kind", POLICY_KIND_BUILTIN),
      selected_policy_id=mapping_str(data, "selected_policy_id", "").strip(),
      dataset_id=mapping_str(data, "dataset_id", "default"),
    ).normalized()


@dataclass(frozen=True)
class PersistedAiLearningState:
  """
  AI 学習基盤の保存状態一式を表す。
  settings は編集可能設定、dataset_summary は蓄積済み記録の規模要約(DatasetSummary.to_dict 形式)、
  last_training_summary は直近の学習結果要約、last_evaluation_summary は直近の評価結果要約、
  policy_version は本番使用 policy の内容版である。
  要約類は形式の自由度を保つため mapping として保持し、本 dataclass はそれらを直列化・復元する責務だけを持つ。
  本 dataclass は frozen であり、AppState aggregate とは独立した専用 store が所有する。
  """

  settings: PersistedAiLearningSettings = field(default_factory=PersistedAiLearningSettings)
  dataset_summary: dict[str, Any] = field(default_factory=dict)
  last_training_summary: dict[str, Any] = field(default_factory=dict)
  last_evaluation_summary: dict[str, Any] = field(default_factory=dict)
  policy_version: int = 0
  schema_version: int = AI_LEARNING_SCHEMA_VERSION

  @staticmethod
  def default() -> "PersistedAiLearningState":
    """
    新規環境向けの既定学習状態を返す。
    既定では Learning Mode が off、記録種別が全偽、技能が全真、
    policy は組み込み deterministic、各要約は空 mapping、policy_version は 0 である。
    off 既定により、設定 file が存在しない環境では記録も学習 policy 使用も発生しない。
    """
    return PersistedAiLearningState(settings=PersistedAiLearningSettings().normalized())

  def to_dict(self) -> dict[str, Any]:
    """
    保存状態を JSON 直列化可能な mapping へ変換する。
    返値は schema_version、settings、dataset_summary、
    last_training_summary、last_evaluation_summary、policy_version を含む。
    要約類は浅い複製として埋め込み、復元と保存が同一形式を共有する。
    """
    return {
      "schema_version": int(self.schema_version),
      "settings": self.settings.to_dict(),
      "dataset_summary": dict(self.dataset_summary or {}),
      "last_training_summary": dict(self.last_training_summary or {}),
      "last_evaluation_summary": dict(self.last_evaluation_summary or {}),
      "policy_version": int(self.policy_version),
    }

  @staticmethod
  def from_dict(data: object) -> "PersistedAiLearningState":
    """
    mapping から保存状態を復元する。
    入力が dict でない場合は既定状態を返す。
    settings は PersistedAiLearningSettings.from_dict で復元し、
    要約類は dict 以外を空 mapping として扱い、policy_version は数値化に失敗した場合 0 へ退避する。
    schema_version は数値化できない場合に現行版へ退避する。
    """
    if not isinstance(data, dict):
      return PersistedAiLearningState.default()
    dataset_summary = data.get("dataset_summary")
    training_summary = data.get("last_training_summary")
    evaluation_summary = data.get("last_evaluation_summary")
    return PersistedAiLearningState(
      settings=PersistedAiLearningSettings.from_dict(data.get("settings")),
      dataset_summary=dict(dataset_summary) if isinstance(dataset_summary, dict) else {},
      last_training_summary=dict(training_summary) if isinstance(training_summary, dict) else {},
      last_evaluation_summary=dict(evaluation_summary) if isinstance(evaluation_summary, dict) else {},
      policy_version=max(0, coerce_int(data.get("policy_version", 0), 0)),
      schema_version=coerce_int(data.get("schema_version", AI_LEARNING_SCHEMA_VERSION), int(AI_LEARNING_SCHEMA_VERSION)),
    )
