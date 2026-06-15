# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.action_mask import AiActionMask, build_action_mask
from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_CATALOG, ACTION_IDS
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation

POLICY_SCHEMA_VERSION: int = 1
POLICY_COMPATIBILITY_TARGET: str = "ludoxel.ai.v1"

POLICY_ID_BUILTIN: str = "builtin_deterministic"


@dataclass(frozen=True)
class Policy:
  """
  学習成果物として読み込む policy artifact の構造を表す不変記述である。
  本段階の policy は巨大な neural network ではなく、deterministic baseline の行動効用を補正する軽量な重み集合として解釈する。schema_version は形式版で、POLICY_SCHEMA_VERSION と一致しない artifact は使用不能とする。policy_id は安定識別子、policy_name は表示名、policy_version は内容版である。skill_categories は当該 policy が補正対象とする技能 id の列、compatibility_target は observation と action の契約版識別子で POLICY_COMPATIBILITY_TARGET と一致しなければならない。created_at は生成時刻の文字列、evaluation_summary は評価通過状態を含む mapping である。action_weight_overrides は action_id から効用への加算補正、utility_score_modifiers は category 又は skill id から効用への加算補正であり、deterministic baseline の効用に重畳して行動選好を傾ける。
  is_usable は schema と compatibility の一致、及び評価通過(evaluation_summary の passed)を満たす場合に真を返し、壊れた又は評価未通過の artifact を本番使用させない。
  """

  policy_id: str
  policy_name: str = ""
  policy_version: int = 1
  schema_version: int = POLICY_SCHEMA_VERSION
  compatibility_target: str = POLICY_COMPATIBILITY_TARGET
  created_at: str = ""
  skill_categories: tuple[str, ...] = ()
  evaluation_summary: dict[str, Any] = field(default_factory=dict)
  action_weight_overrides: dict[str, float] = field(default_factory=dict)
  utility_score_modifiers: dict[str, float] = field(default_factory=dict)

  def is_usable(self) -> bool:
    """
    本 policy を本番使用してよいかを判定する。
    schema_version が POLICY_SCHEMA_VERSION と一致し、compatibility_target が POLICY_COMPATIBILITY_TARGET と一致し、evaluation_summary の passed が真である場合に限り真を返す。これらの何れかを欠く場合は偽を返し、registry は deterministic fallback へ退避する。評価未通過 artifact を真と誤認しないため、passed の判定は明示的な真偽値化で行う。
    """
    if int(self.schema_version) != int(POLICY_SCHEMA_VERSION):
      return False
    if str(self.compatibility_target) != str(POLICY_COMPATIBILITY_TARGET):
      return False
    return bool(self.evaluation_summary.get("passed", False))

  def to_dict(self) -> dict[str, Any]:
    """
    policy artifact を JSON 直列化可能な mapping へ変換する。
    返値は schema_version、policy_id、policy_name、policy_version、compatibility_target、created_at、skill_categories、evaluation_summary、action_weight_overrides、utility_score_modifiers を含み、保存と検証が同一形式を共有する。
    """
    return {
      "schema_version": int(self.schema_version),
      "policy_id": str(self.policy_id),
      "policy_name": str(self.policy_name),
      "policy_version": int(self.policy_version),
      "compatibility_target": str(self.compatibility_target),
      "created_at": str(self.created_at),
      "skill_categories": [str(value) for value in self.skill_categories],
      "evaluation_summary": dict(self.evaluation_summary or {}),
      "action_weight_overrides": {str(key): float(value) for key, value in (self.action_weight_overrides or {}).items()},
      "utility_score_modifiers": {str(key): float(value) for key, value in (self.utility_score_modifiers or {}).items()},
    }


def load_policy(data: object) -> Policy | None:
  """
  mapping から policy artifact を復元する。
  入力が dict でない、policy_id が空、又は schema_version が数値化できない場合は読み込み不能として None を返す。action_weight_overrides と utility_score_modifiers の値は float へ正規化し、数値化に失敗した entry は除外する。schema_version と compatibility の不一致は None を返さず、復元はするが is_usable が偽となることで本番使用を防ぐ。これにより壊れた artifact でも例外を送出せず、registry が fallback を選べる。
  """
  if not isinstance(data, dict):
    return None
  policy_id = str(data.get("policy_id", "")).strip()
  if not policy_id:
    return None
  try:
    schema_version = int(data.get("schema_version", 0))
  except (TypeError, ValueError):
    return None
  try:
    policy_version = int(data.get("policy_version", 1))
  except (TypeError, ValueError):
    policy_version = 1
  raw_skills = data.get("skill_categories", ())
  skills = tuple(str(value) for value in raw_skills) if isinstance(raw_skills, (list, tuple)) else ()
  evaluation_summary = data.get("evaluation_summary")
  return Policy(
    policy_id=str(policy_id),
    policy_name=str(data.get("policy_name", policy_id)),
    policy_version=int(policy_version),
    schema_version=int(schema_version),
    compatibility_target=str(data.get("compatibility_target", "")),
    created_at=str(data.get("created_at", "")),
    skill_categories=skills,
    evaluation_summary=dict(evaluation_summary) if isinstance(evaluation_summary, dict) else {},
    action_weight_overrides=_coerce_weight_map(data.get("action_weight_overrides")),
    utility_score_modifiers=_coerce_weight_map(data.get("utility_score_modifiers")),
  )


def _coerce_weight_map(value: object) -> dict[str, float]:
  """
  policy artifact の重み mapping を文字列 key から float への mapping へ正規化する。
  入力が dict でない場合は空 mapping を返し、float 化に失敗した entry は除外する。これにより壊れた重み値が deterministic 効用補正へ混入しない。
  """
  if not isinstance(value, dict):
    return {}
  result: dict[str, float] = {}
  for key, raw in value.items():
    try:
      result[str(key)] = float(raw)
    except (TypeError, ValueError):
      continue
  return result


@dataclass(frozen=True)
class PolicyDecision:
  """
  policy が一 step に対して下した行動選択結果を表す不変値である。
  action_id は選択行動、utility は選択行動の効用値、ranked は (action_id, 効用) を効用降順で並べた候補列、source は決定経路の説明(deterministic baseline のみか policy 補正を含むか)である。action_id は必ず行動 mask の許可集合に含まれ、policy 補正によっても禁止行動が選ばれないことを保証する。
  """

  action_id: str
  utility: float
  ranked: tuple[tuple[str, float], ...]
  source: str


class DeterministicPolicy:
  """
  学習に依らず観測値と安全規則のみから行動を選ぶ決定論的 baseline policy を表す。
  本 policy は registry が常に保持する最終 fallback であり、壊れた又は評価未通過の学習 policy が選ばれた場合でも AI を機能させる。効用は観測文脈(player の視認・射程・低体力下の脅威、route の有無と閉塞、周囲の閉塞度、配置可否)から算出し、行動 mask が許可した行動だけを候補とする。低体力時は単純逃走に固定せず、後退攻撃・横移動攻撃・遮蔽配置・距離取り・攻撃継続を効用で比較する。route 閉塞時は再探索を優先し、必要に応じて破壊・配置・積み上げ・橋掛けを候補に含める。周囲が閉塞している場合は隙間・跳躍・配置・破壊・フェンスゲート操作を順に評価する。
  decide は与えた学習 policy(任意)の action_weight_overrides と utility_score_modifiers を baseline 効用へ加算し、行動選好を傾けるが、mask による安全境界は変えない。
  """

  def __init__(self, *, low_health_fraction: float = 0.35) -> None:
    """
    低体力とみなす体力割合の閾値を保持して初期化する。
    low_health_fraction は max_health に対する割合であり、health <= max_health * low_health_fraction を低体力とみなす基準として decide の効用算出に用いる。値域の妥当性は呼び出し側が保証する。
    """
    self._low_health_fraction = float(low_health_fraction)

  def decide(self, observation: AiObservation, mask: AiActionMask | None = None, policy: Policy | None = None) -> PolicyDecision:
    """
    観測値と行動 mask から実行行動を決定する。
    mask を省略した場合は observation から build_action_mask で生成し、許可行動だけを候補とする。各候補に文脈別効用を割り当て、policy が与えられていれば action_weight_overrides を action_id 単位で、utility_score_modifiers を行動の category 又は skill_category 単位で加算する。効用最大の行動を選び、同点は ACTION_IDS の定義順で決定して再現性を保つ。許可行動が皆無という例外的状況では no_op を強制返却する。返値の ranked は効用降順の候補列であり、source は補正の有無を示す。
    """
    effective_mask = mask if isinstance(mask, AiActionMask) else build_action_mask(observation)
    scores = self._baseline_scores(observation, effective_mask)
    source = "deterministic"
    if isinstance(policy, Policy):
      self._apply_policy_modifiers(scores, policy)
      source = "deterministic+policy"
    if not scores:
      return PolicyDecision(action_id="no_op", utility=0.0, ranked=(("no_op", 0.0),), source=str(source))
    order_index = {action_id: index for index, action_id in enumerate(ACTION_IDS)}
    ranked = tuple(sorted(scores.items(), key=lambda item: (-float(item[1]), int(order_index.get(item[0], 1_000_000)))))
    best_action, best_score = ranked[0]
    return PolicyDecision(action_id=str(best_action), utility=float(best_score), ranked=ranked, source=str(source))

  def _is_low_health(self, observation: AiObservation) -> bool:
    """
    観測上の体力が低体力閾値以下であるかを返す。
    health <= max_health * low_health_fraction を低体力とみなす。max_health が非正の異常値では低体力ではないと判定し、ゼロ除算と誤分類を避ける。observation.low_health が既に真の場合もそれを尊重する。
    """
    if bool(observation.low_health):
      return True
    if float(observation.max_health) <= 0.0:
      return False
    return float(observation.health) <= float(observation.max_health) * float(self._low_health_fraction)

  def _boxed_score(self, observation: AiObservation) -> int:
    """
    周囲 8 方向のうち一歩で歩行遷移できない方向の数を返す。
    standable_step が偽である方向を計数し、値が大きいほど閉塞が強いことを表す。この計数は囲まれ対処(跳躍・配置・破壊・フェンスゲート・積み上げ)の効用を高める判断に用いる。
    """
    return sum(1 for probe in observation.directions.values() if not bool(probe.standable_step))

  def _baseline_scores(self, observation: AiObservation, mask: AiActionMask) -> dict[str, float]:
    """
    許可行動に対する文脈別 baseline 効用を算出して mapping で返す。
    視認 player への接近時は前進と斜め前進を高く、射程内かつ攻撃可能時は攻撃と後退攻撃・横移動攻撃を高くする。低体力かつ脅威圏内では後退・後退攻撃・横移動攻撃・遮蔽配置・距離取りと攻撃継続を比較可能な効用で並べ、単純逃走への固定を避ける。route 追従時は follow_route を高く、route 閉塞時は replan_route を最優先し破壊・配置・積み上げ・橋掛けを補助候補とする。閉塞が強い場合は跳躍・parkour・積み上げ・破壊・フェンスゲート操作の効用を加える。いずれの文脈にも該当しない場合は視線回転と sneak を低効用で残し、停止系は最低限の効用とする。許可されていない行動は候補に含めない。
    """
    allowed = mask.allowed
    scores: dict[str, float] = {action_id: 0.0 for action_id in ACTION_IDS if action_id in allowed}
    if not scores:
      return scores

    def add(action_id: str, value: float) -> None:
      if action_id in scores:
        scores[action_id] += float(value)

    # 常時の弱い基準値: 視線で状況を把握し、無為な停止は最小限に評価する。
    add("look_at_target", 0.30)
    add("turn_left", 0.05)
    add("turn_right", 0.05)
    add("no_op", 0.02)
    add("stop", 0.02)
    add("sneak", 0.04)

    visible = bool(observation.visible_player)
    low_health = self._is_low_health(observation)
    boxed = self._boxed_score(observation)

    if visible and bool(observation.attack_in_range) and bool(observation.attack_cooldown_ready):
      add("attack", 1.40)
      add("strafe_attack", 1.05)
      add("backpedal_attack", 0.95)
      add("look_at_target", 0.60)
    elif visible:
      add("look_at_target", 0.80)
      add("move_forward", 1.20)
      add("sprint", 0.95)
      add("move_forward_left", 0.70)
      add("move_forward_right", 0.70)
      add("parkour_jump", 0.30)

    if low_health and (bool(observation.low_health_in_threat) or visible):
      add("backpedal_attack", 1.15)
      add("strafe_attack", 1.10)
      add("move_back", 1.00)
      add("move_back_left", 0.85)
      add("move_back_right", 0.85)
      add("defensive_block", 1.20)
      add("escape_break_block", 0.70)
      add("escape_stack_block", 0.70)
      add("attack", 0.55)

    if bool(observation.route_present):
      if bool(observation.route_blocked):
        add("replan_route", 1.50)
        add("bridge_step", 1.00)
        add("escape_break_block", 0.90)
        add("escape_stack_block", 0.85)
        add("tower_step", 0.70)
        add("break_block", 0.60)
      else:
        add("follow_route", 1.30)
        add("look_at_block_target", 0.20)

    if int(boxed) >= 6:
      add("jump", 0.80)
      add("parkour_jump", 0.85)
      add("escape_stack_block", 1.00)
      add("escape_break_block", 0.95)
      add("toggle_fence_gate", 0.90)
      add("tower_step", 0.75)
      add("defensive_block", 0.40)

    if bool(observation.fence_gate_operable):
      add("toggle_fence_gate", 0.55)

    return scores

  def _apply_policy_modifiers(self, scores: dict[str, float], policy: Policy) -> None:
    """
    学習 policy の補正重みを baseline 効用へ加算する。
    action_weight_overrides は対象 action_id が候補に含まれる場合のみ加算し、許可されていない行動を復活させない。utility_score_modifiers は各候補行動の category 又は skill_category と key が一致する場合に加算し、行動群単位の選好を傾ける。補正は効用順位だけを変え、mask による安全境界は変えない。
    """
    for action_id, override in policy.action_weight_overrides.items():
      if action_id in scores:
        scores[action_id] += float(override)
    if not policy.utility_score_modifiers:
      return
    for action_id in tuple(scores.keys()):
      action = ACTION_CATALOG.get(action_id)
      if action is None:
        continue
      category_bonus = float(policy.utility_score_modifiers.get(action.category, 0.0))
      skill_bonus = float(policy.utility_score_modifiers.get(action.skill_category, 0.0))
      scores[action_id] += float(category_bonus) + float(skill_bonus)


def builtin_deterministic_policy() -> Policy:
  """
  registry が同梱学習 policy 不在時に用いる組み込み deterministic policy の artifact 記述を返す。
  本 artifact は補正を持たず(action_weight_overrides と utility_score_modifiers が空)、評価通過済みとして is_usable を真にする。実際の行動決定は DeterministicPolicy が担い、本 artifact は registry 上で組み込み policy を一意に表す identity として機能する。
  """
  return Policy(
    policy_id=str(POLICY_ID_BUILTIN),
    policy_name="Built-in Deterministic AI",
    policy_version=1,
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    created_at="2026-06-15",
    skill_categories=(),
    evaluation_summary={"passed": True, "note": "Built-in deterministic baseline; always available."},
    action_weight_overrides={},
    utility_score_modifiers={},
  )
