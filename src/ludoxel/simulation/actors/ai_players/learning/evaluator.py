# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

EVALUATION_SCHEMA_VERSION: int = 1

EVALUATION_STATUS_PASSED: str = "passed"
EVALUATION_STATUS_FAILED: str = "failed"
EVALUATION_STATUS_NOT_RUN: str = "not_run"
EVALUATION_STATUS_UNSUPPORTED: str = "unsupported"

EVALUATION_STATUSES: tuple[str, ...] = (EVALUATION_STATUS_PASSED, EVALUATION_STATUS_FAILED, EVALUATION_STATUS_NOT_RUN, EVALUATION_STATUS_UNSUPPORTED)

TASK_SURVIVAL_30S: str = "survival_30s"
TASK_BRIDGE_TO_GOAL: str = "bridge_to_goal"
TASK_ESCAPE_ENCLOSURE: str = "escape_enclosure"
TASK_LOW_HEALTH_RETREAT: str = "low_health_retreat"
TASK_ROUTE_REPLAN: str = "route_replan"
TASK_FENCE_GATE_HANDLING: str = "fence_gate_handling"


@dataclass(frozen=True)
class EvaluationTask:
  """
  評価 sandbox における単一の評価課題の定義を表す不変記述である。
  task_id は安定識別子、name は表示名、success_condition と failure_condition は合否判定の条件を述べた英文、timeout_s は課題打ち切りまでの秒数である。本段階では sandbox 実行本体を実装せず、本定義は課題目録と result schema の骨格を与える。実行が実装された際、各課題はこの条件と timeout に従い合否と result summary を生成する。
  """

  task_id: str
  name: str
  success_condition: str
  failure_condition: str
  timeout_s: float

  def to_dict(self) -> dict[str, Any]:
    """
    課題定義を JSON 直列化可能な mapping へ変換する。
    返値は task_id、name、success_condition、failure_condition、timeout_s を含み、UI の課題説明表示と評価 result の照合に用いる。
    """
    return {
      "task_id": str(self.task_id),
      "name": str(self.name),
      "success_condition": str(self.success_condition),
      "failure_condition": str(self.failure_condition),
      "timeout_s": float(self.timeout_s),
    }


EVALUATION_TASKS: tuple[EvaluationTask, ...] = (
  EvaluationTask(
    task_id=TASK_SURVIVAL_30S,
    name="Survive 30 seconds",
    success_condition="The AI remains alive for the full duration without falling into the void.",
    failure_condition="The AI dies or falls into the void before the duration elapses.",
    timeout_s=30.0,
  ),
  EvaluationTask(
    task_id=TASK_BRIDGE_TO_GOAL,
    name="Bridge to goal",
    success_condition="The AI bridges a gap with placed blocks and reaches the goal footing.",
    failure_condition="The AI fails to reach the goal or falls while bridging before the timeout.",
    timeout_s=45.0,
  ),
  EvaluationTask(
    task_id=TASK_ESCAPE_ENCLOSURE,
    name="Escape an enclosure",
    success_condition="The AI breaks or stacks out of a fully boxed position and stands outside it.",
    failure_condition="The AI remains enclosed when the timeout elapses.",
    timeout_s=30.0,
  ),
  EvaluationTask(
    task_id=TASK_LOW_HEALTH_RETREAT,
    name="Retreat at low health",
    success_condition="At low health the AI increases distance or shields while avoiding death.",
    failure_condition="The AI dies while threatened at low health before the timeout.",
    timeout_s=20.0,
  ),
  EvaluationTask(
    task_id=TASK_ROUTE_REPLAN,
    name="Replan a blocked route",
    success_condition="After the route is obstructed the AI replans and reaches the next route point.",
    failure_condition="The AI keeps walking into the obstruction or never reaches the next point.",
    timeout_s=40.0,
  ),
  EvaluationTask(
    task_id=TASK_FENCE_GATE_HANDLING,
    name="Handle a fence gate",
    success_condition="The AI treats a fence gate as passable when open and as an obstacle when closed.",
    failure_condition="The AI is blocked by an openable gate or walks through a closed gate.",
    timeout_s=25.0,
  ),
)

_TASK_INDEX: dict[str, EvaluationTask] = {task.task_id: task for task in EVALUATION_TASKS}


@dataclass(frozen=True)
class EvaluationResult:
  """
  単一評価課題に対する判定結果を表す不変値である。
  task_id は対象課題、status は EVALUATION_STATUSES の何れか、summary は人間可読の英文要約、score は任意の数値指標(未算出時 None)、detail は補助 mapping である。status は passed と failed のほか、実行されなかった not_run、当該構成で非対応の unsupported を区別し、未実装課題を成功扱いしない不変条件を保持する。
  """

  task_id: str
  status: str
  summary: str = ""
  score: float | None = None
  detail: dict[str, Any] = field(default_factory=dict)

  def passed(self) -> bool:
    """
    本結果が合格を表すかを返す。
    status が passed の場合のみ真を返し、not_run と unsupported と failed はすべて偽を返す。評価未通過 policy を本番使用させない判定はこの述語に依存する。
    """
    return str(self.status) == EVALUATION_STATUS_PASSED

  def to_dict(self) -> dict[str, Any]:
    """
    結果を JSON 直列化可能な mapping へ変換する。
    返値は task_id、status、summary、score、detail を含み、score の未算出は None として保持する。persistence の last evaluation summary と UI の合否表示が同一形式を共有する。
    """
    return {"task_id": str(self.task_id), "status": str(self.status), "summary": str(self.summary), "score": (None if self.score is None else float(self.score)), "detail": dict(self.detail or {})}


@dataclass(frozen=True)
class EvaluationReport:
  """
  一連の評価課題に対する結果集合と総合判定を表す不変値である。
  schema_version は形式版、results は課題別結果の列、passed は全対象課題が合格した場合に真となる総合合否である。not_run 又は unsupported を含む報告は passed を真にしないため、未実行・非対応の課題を含む policy を合格と誤認しない。
  """

  results: tuple[EvaluationResult, ...] = ()
  passed: bool = False
  schema_version: int = EVALUATION_SCHEMA_VERSION

  def to_dict(self) -> dict[str, Any]:
    """
    報告を JSON 直列化可能な mapping へ変換する。
    返値は schema_version、passed、results(各結果 mapping の列)を含み、persistence の last evaluation summary 保存に用いる。
    """
    return {"schema_version": int(self.schema_version), "passed": bool(self.passed), "results": [result.to_dict() for result in self.results]}


def describe_tasks() -> tuple[EvaluationTask, ...]:
  """
  定義済み評価課題の目録を定義順で返す。
  UI の課題説明と選択提示はこの目録を用いる。返値は EVALUATION_TASKS への参照であり、課題集合は実行時に変化しない。
  """
  return EVALUATION_TASKS


def get_task(task_id: str) -> EvaluationTask | None:
  """
  task_id から課題定義を取得し、未知 id では None を返す。
  返値は共有 frozen 定義への参照であり、評価実行や result 照合での課題特定に用いる。
  """
  return _TASK_INDEX.get(str(task_id))


def run_evaluation(task_ids: tuple[str, ...] | None = None) -> EvaluationReport:
  """
  指定課題(省略時は全課題)に対する評価を実行し、報告を返す。
  本段階では sandbox 実行本体を実装していないため、各対象課題は status を not_run、未知 task_id は unsupported とする lightweight な dry-run として結果を生成する。未実装課題を成功扱いしない不変条件に従い passed は偽となり、UI の最小評価呼び出しは合否未確定として安全に表示できる。task_ids に既知 id が含まれない場合も例外を送出せず、unsupported 結果だけを含む報告を返す。
  """
  selected = tuple(str(value) for value in task_ids) if task_ids is not None else tuple(task.task_id for task in EVALUATION_TASKS)
  results: list[EvaluationResult] = []
  for task_id in selected:
    task = get_task(task_id)
    if task is None:
      results.append(EvaluationResult(task_id=str(task_id), status=EVALUATION_STATUS_UNSUPPORTED, summary="Unknown evaluation task; no sandbox is defined for this id."))
      continue
    results.append(
      EvaluationResult(
        task_id=str(task.task_id),
        status=EVALUATION_STATUS_NOT_RUN,
        summary="Sandbox evaluation is not executed in this build; the task schema and entry point are available for future runs.",
        detail={"timeout_s": float(task.timeout_s)},
      )
    )
  passed = bool(results) and all(result.passed() for result in results)
  return EvaluationReport(results=tuple(results), passed=bool(passed))
