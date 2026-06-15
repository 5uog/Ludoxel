# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

DATASET_SCHEMA_VERSION: int = 1

RECORD_PLAYER_MOVEMENT: str = "player_movement"
RECORD_PLAYER_COMBAT: str = "player_combat"
RECORD_PLAYER_BLOCK_PLACEMENT: str = "player_block_placement"
RECORD_PLAYER_BLOCK_BREAKING: str = "player_block_breaking"
RECORD_PLAYER_PARKOUR: str = "player_parkour"
RECORD_PLAYER_TRAP: str = "player_trap"
RECORD_AI_DECISIONS: str = "ai_decisions"
RECORD_AI_FAILURES: str = "ai_failures"
RECORD_AI_DEATHS: str = "ai_deaths"
RECORD_AI_ROUTE_FAILURES: str = "ai_route_failures"
RECORD_AI_ESCAPE_ATTEMPTS: str = "ai_escape_attempts"

RECORD_KINDS: tuple[str, ...] = (
  RECORD_PLAYER_MOVEMENT,
  RECORD_PLAYER_COMBAT,
  RECORD_PLAYER_BLOCK_PLACEMENT,
  RECORD_PLAYER_BLOCK_BREAKING,
  RECORD_PLAYER_PARKOUR,
  RECORD_PLAYER_TRAP,
  RECORD_AI_DECISIONS,
  RECORD_AI_FAILURES,
  RECORD_AI_DEATHS,
  RECORD_AI_ROUTE_FAILURES,
  RECORD_AI_ESCAPE_ATTEMPTS,
)

_RECORD_KIND_SET: frozenset[str] = frozenset(RECORD_KINDS)


def is_record_kind(kind: object) -> bool:
  """
  与えた値が既知の demonstration 記録種別であるかを判定する。
  入力は任意 object を許容し、文字列化した値が RECORD_KINDS の集合に含まれる場合に限り真を返す。recorder と persistence は未知種別を記録対象から除外するためにこの述語を共有する。
  """
  return str(kind) in _RECORD_KIND_SET


@dataclass(frozen=True)
class DemonstrationRecord:
  """
  学習用 dataset に蓄積する単一の観測・行動記録を表す。
  記録対象は画面画像ではなく、ゲーム状態 observation と行動 action の対であり、player の実演と AI の意思決定・失敗・死亡・route 失敗・脱出試行を同一構造で保持する。kind は RECORD_KINDS の何れかであり、capture flag による取捨選択と種別別集計の key を与える。tick は記録時点の simulation step 番号(非負)、actor_id は AI 記録の対象識別子で player 実演では空文字である。observation は AiObservation.to_dict が生成する JSON 直列化可能 mapping、action は AiAction.action_id 又は None、success は行動が意図した効果を得たかの三値(真・偽・不明としての None)、reward は報酬整形値又は None、detail は kind 固有の補助 mapping である。
  本 dataclass は frozen であり、生成後は不変である。直列化は JSON Lines を前提とし、observation と detail は JSON 直列化可能であることを呼び出し側が保証する。
  """

  kind: str
  tick: int = 0
  actor_id: str = ""
  observation: dict[str, Any] = field(default_factory=dict)
  action: str | None = None
  success: bool | None = None
  reward: float | None = None
  detail: dict[str, Any] = field(default_factory=dict)
  schema_version: int = DATASET_SCHEMA_VERSION

  def to_dict(self) -> dict[str, Any]:
    """
    記録を JSON 直列化可能な mapping へ変換する。
    返値は schema_version、kind、tick、actor_id、observation、action、success、reward、detail を含み、observation と detail は浅い複製として埋め込む。action と success と reward は欠落を None として保持し、復元側は三値を区別できる。
    """
    return {
      "schema_version": int(self.schema_version),
      "kind": str(self.kind),
      "tick": int(self.tick),
      "actor_id": str(self.actor_id),
      "observation": dict(self.observation or {}),
      "action": (None if self.action is None else str(self.action)),
      "success": (None if self.success is None else bool(self.success)),
      "reward": (None if self.reward is None else float(self.reward)),
      "detail": dict(self.detail or {}),
    }

  @staticmethod
  def from_dict(data: object) -> "DemonstrationRecord | None":
    """
    mapping から記録を復元する。
    入力が dict でない、又は kind が既知種別でない場合は復元不能として None を返す。observation と detail が dict でない場合は空 mapping へ退避し、action と success と reward は欠落と None を保持したまま復元する。tick と schema_version は数値化に失敗した場合に既定値へ退避する。
    """
    if not isinstance(data, dict):
      return None
    kind = str(data.get("kind", ""))
    if not is_record_kind(kind):
      return None
    observation = data.get("observation")
    detail = data.get("detail")
    raw_action = data.get("action")
    raw_success = data.get("success")
    raw_reward = data.get("reward")
    try:
      tick = int(data.get("tick", 0))
    except (TypeError, ValueError):
      tick = 0
    try:
      schema_version = int(data.get("schema_version", DATASET_SCHEMA_VERSION))
    except (TypeError, ValueError):
      schema_version = int(DATASET_SCHEMA_VERSION)
    return DemonstrationRecord(
      kind=str(kind),
      tick=int(tick),
      actor_id=str(data.get("actor_id", "")),
      observation=dict(observation) if isinstance(observation, dict) else {},
      action=(None if raw_action is None else str(raw_action)),
      success=(None if raw_success is None else bool(raw_success)),
      reward=(None if raw_reward is None else _coerce_optional_float(raw_reward)),
      detail=dict(detail) if isinstance(detail, dict) else {},
      schema_version=int(schema_version),
    )


def _coerce_optional_float(value: object) -> float | None:
  """
  reward 復元のため任意 object を float へ変換し、変換不能時に None を返す。
  None は報酬未付与を意味し、数値化に失敗した不正値も同じく None へ退避することで、欠落と不正値を学習側で同一に扱える。
  """
  try:
    return float(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    return None


def encode_record_line(record: DemonstrationRecord) -> str:
  """
  記録を JSON Lines の一行として直列化する。
  返値は改行を含まない単一 JSON object 文字列であり、ensure_ascii を偽として日本語等を保持し、key を昇順整列して差分安定性を確保する。呼び出し側は行末改行の付与を担う。
  """
  return json.dumps(record.to_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def decode_record_line(line: str) -> DemonstrationRecord | None:
  """
  JSON Lines の一行から記録を復元する。
  空行と空白のみの行は記録なしとして None を返し、JSON として解釈できない行も None を返す。これにより、途中で切れた書き込みや空行を含む dataset を走査しても例外を送出せず、健全な行だけを取り出せる。
  """
  text = str(line).strip()
  if not text:
    return None
  try:
    payload = json.loads(text)
  except json.JSONDecodeError:
    return None
  return DemonstrationRecord.from_dict(payload)


@dataclass(frozen=True)
class DatasetSummary:
  """
  蓄積済み demonstration dataset の規模を要約する不変値を表す。
  record_count は有効記録の総数、byte_size は dataset 実体のバイト長、kinds は種別ごとの記録数 mapping である。UI の dataset size 表示と persistence の last summary 保存はこの要約を共有し、肥大化の把握と削除操作の判断材料に用いる。
  """

  record_count: int = 0
  byte_size: int = 0
  kinds: dict[str, int] = field(default_factory=dict)

  def to_dict(self) -> dict[str, Any]:
    """
    要約を JSON 直列化可能な mapping へ変換する。
    返値は record_count、byte_size、kinds を含み、kinds は種別文字列から非負整数への mapping を浅く複製して埋め込む。
    """
    return {"record_count": int(self.record_count), "byte_size": int(self.byte_size), "kinds": {str(key): int(value) for key, value in (self.kinds or {}).items()}}

  @staticmethod
  def from_dict(data: object) -> "DatasetSummary":
    """
    mapping から要約を復元する。
    入力が dict でない場合は空要約を返す。record_count と byte_size は数値化に失敗した場合 0 へ退避し、kinds は dict 以外を空 mapping として扱い、各値を非負整数へ正規化する。
    """
    if not isinstance(data, dict):
      return DatasetSummary()
    raw_kinds = data.get("kinds")
    kinds: dict[str, int] = {}
    if isinstance(raw_kinds, dict):
      for key, value in raw_kinds.items():
        try:
          kinds[str(key)] = max(0, int(value))
        except (TypeError, ValueError):
          continue
    try:
      record_count = max(0, int(data.get("record_count", 0)))
    except (TypeError, ValueError):
      record_count = 0
    try:
      byte_size = max(0, int(data.get("byte_size", 0)))
    except (TypeError, ValueError):
      byte_size = 0
    return DatasetSummary(record_count=int(record_count), byte_size=int(byte_size), kinds=kinds)


@runtime_checkable
class DatasetSink(Protocol):
  """
  demonstration 記録を永続化先へ書き出す sink の契約を表す Protocol である。
  simulation 層の recorder は記録の蓄積と直列化までを所有し、保存 file path、追記方式、user data root の解決は application 層が実装するこの契約に委譲する。これにより simulation は保存経路を知らずに記録を flush でき、層境界(simulation は保存 path を持たない)を保つ。
  write_records は JSON 直列化可能な mapping の反復可能列を受け取り、実際に書き出した記録数を返す。実装は追記が望ましく、失敗時の挙動は実装が定義する。
  """

  def write_records(self, rows: Iterable[dict[str, Any]]) -> int:
    """
    与えた記録 mapping 列を永続化先へ書き出し、書き出した件数を返す。
    rows の各要素は DemonstrationRecord.to_dict 形式の mapping を想定する。返値は実際に永続化した件数であり、recorder は flush 結果の集計に用いる。
    """
    ...
