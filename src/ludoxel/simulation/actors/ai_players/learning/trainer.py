# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

TRAINING_SCHEMA_VERSION: int = 1

TRAINING_MODE_FROM_PLAYER_DATA: str = "train_from_player_data"
TRAINING_MODE_IN_SANDBOX: str = "train_in_sandbox"

TRAINING_STATUS_UNSUPPORTED: str = "unsupported"
TRAINING_STATUS_NOT_RUN: str = "not_run"
TRAINING_STATUS_COMPLETED: str = "completed"

TRAINING_STATUSES: tuple[str, ...] = (TRAINING_STATUS_UNSUPPORTED, TRAINING_STATUS_NOT_RUN, TRAINING_STATUS_COMPLETED)


@dataclass(frozen=True)
class TrainingRequest:
  """
  将来の学習実行に渡す要求を表す不変記述である。
  mode は学習種別(player 実演からの学習、又は sandbox 内学習)、skill_categories は対象技能 id の列、dataset_id は学習に用いる dataset の識別子、target_policy_id は生成・更新する policy の識別子、parameters は将来の学習設定を保持する補助 mapping である。本段階では本要求を受理しても重い学習は実行されず、要求は将来の実装が解釈する形式を先取りして固定する。
  """

  mode: str
  skill_categories: tuple[str, ...] = ()
  dataset_id: str = ""
  target_policy_id: str = ""
  parameters: dict[str, Any] = field(default_factory=dict)
  schema_version: int = TRAINING_SCHEMA_VERSION

  def to_dict(self) -> dict[str, Any]:
    """
    学習要求を JSON 直列化可能な mapping へ変換する。
    返値は schema_version、mode、skill_categories、dataset_id、target_policy_id、parameters を含み、将来の学習 service と UI が同一形式で要求を授受できる。
    """
    return {
      "schema_version": int(self.schema_version),
      "mode": str(self.mode),
      "skill_categories": [str(value) for value in self.skill_categories],
      "dataset_id": str(self.dataset_id),
      "target_policy_id": str(self.target_policy_id),
      "parameters": dict(self.parameters or {}),
    }


@dataclass(frozen=True)
class TrainingResult:
  """
  学習要求に対する結果を表す不変値である。
  status は TRAINING_STATUSES の何れか、message は人間可読の英文説明、policy_id は生成・更新された policy の識別子(未生成時は空)、summary は補助 mapping である。本段階では重い学習を行わないため status は unsupported を返し、未実行を completed と誤認しない。
  """

  status: str
  message: str = ""
  policy_id: str = ""
  summary: dict[str, Any] = field(default_factory=dict)

  def to_dict(self) -> dict[str, Any]:
    """
    結果を JSON 直列化可能な mapping へ変換する。
    返値は status、message、policy_id、summary を含み、persistence の last training summary 保存と UI 表示が同一形式を共有する。
    """
    return {"status": str(self.status), "message": str(self.message), "policy_id": str(self.policy_id), "summary": dict(self.summary or {})}


class TrainingService:
  """
  学習要求を受理する軽量 service であり、本段階では重い学習も background process も起動しない。
  通常 gameplay の妨げと UI thread の占有を避けるため、start は要求を検証して即座に unsupported 結果を返すだけの O(1) 操作である。本 service は将来 sandbox 又は player 実演からの学習を実装する際の entry を固定し、その際も長時間処理は別 process / worker で行い、UI thread 上では実行しない設計を前提とする。
  """

  def supported_modes(self) -> tuple[str, str]:
    """
    本 service が要求形式として受理する学習種別を返す。
    返値は player 実演からの学習と sandbox 内学習であり、UI はこの集合を選択肢提示に用いる。受理は形式上の受付を意味し、本段階では実行を伴わない。
    """
    return (TRAINING_MODE_FROM_PLAYER_DATA, TRAINING_MODE_IN_SANDBOX)

  def start(self, request: TrainingRequest) -> TrainingResult:
    """
    学習要求を受理し、本段階では実行せず unsupported 結果を返す。
    重い学習・長時間 I/O・UI thread 占有を一切伴わない軽量応答であり、未実装を completed と偽らない。返値の message は本 build で学習が実行されない旨を明示し、UI はこれを disabled state 又は通知として表示できる。要求の mode が受理対象外でも例外を送出せず unsupported を返す。
    """
    return TrainingResult(
      status=TRAINING_STATUS_UNSUPPORTED,
      message="Training is not executed in this build. The request schema and entry point are reserved for a future out-of-process trainer.",
      policy_id=str(request.target_policy_id),
      summary={"mode": str(request.mode), "dataset_id": str(request.dataset_id)},
    )
