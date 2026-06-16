# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.action_mask import AiActionMask, build_action_mask
from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_CATALOG, ACTION_IDS, ACTION_SCHEMA_VERSION
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_ENCODER_VERSION, encode_features
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation

POLICY_SCHEMA_VERSION: int = 1
POLICY_COMPATIBILITY_TARGET: str = "ludoxel.ai.v1"

POLICY_ID_BUILTIN: str = "builtin_deterministic"

POLICY_SOURCE_BUILTIN: str = "builtin"
POLICY_SOURCE_BUNDLED: str = "bundled"
POLICY_SOURCE_PLAYER_DATA: str = "player_data"
POLICY_SOURCE_SANDBOX: str = "sandbox"


@dataclass(frozen=True)
class Policy:
  """
  学習成果物として読み込む policy artifact の構造を表す不変記述である。
  本 policy は巨大 neural network ではなく、observation を符号化した feature key を条件とする軽量な効用補正の集合である。deterministic baseline を置き換えるのではなく、その効用に重畳して行動選好を傾ける。schema_version は形式版、compatibility_target は observation/action 契約版で、いずれも一致しなければ使用不能とする。feature_encoder_version と action_catalog_version は学習時の符号化器版と行動目録版であり、現行版と不一致なら使用不能とする(0 又は欠落は feature 条件を持たない legacy bias artifact を表し、互換とみなす)。
  action_weights は feature key から {action_id: 加点} への mapping で、当該 feature が成立する観測で対応行動を選好する学習済み正の重みである。utility_modifiers は feature key 又は action category/skill から加点への mapping、negative_modifiers は action_id から減点への mapping で、死亡・奈落落下・自己トラップ・経路失敗・無効配置・射程外攻撃などに結び付いた行動を抑制する。action_weight_overrides と utility_score_modifiers は同梱 bias artifact 互換の大域補正である。evaluation は評価結果(passed を含む)で、is_usable は schema・compat・version 整合かつ評価通過の場合に限り真を返し、評価未通過 policy の本番使用を禁ずる。
  """

  policy_id: str
  policy_name: str = ""
  policy_version: int = 1
  schema_version: int = POLICY_SCHEMA_VERSION
  compatibility_target: str = POLICY_COMPATIBILITY_TARGET
  feature_encoder_version: int = 0
  action_catalog_version: int = 0
  compatible_ludoxel_version: str = ""
  created_at: str = ""
  source: str = POLICY_SOURCE_BUNDLED
  source_dataset_id: str = ""
  source_dataset_size: int = 0
  skill_categories: tuple[str, ...] = ()
  evaluation: dict[str, Any] = field(default_factory=dict)
  action_weights: dict[str, dict[str, float]] = field(default_factory=dict)
  utility_modifiers: dict[str, float] = field(default_factory=dict)
  negative_modifiers: dict[str, float] = field(default_factory=dict)
  action_weight_overrides: dict[str, float] = field(default_factory=dict)
  utility_score_modifiers: dict[str, float] = field(default_factory=dict)
  metadata: dict[str, Any] = field(default_factory=dict)

  def is_usable(self) -> bool:
    """
    本 policy を本番使用してよいかを判定する。
    schema_version と compatibility_target が現行契約に一致し、feature_encoder_version と action_catalog_version が現行版に一致(又は legacy を表す 0)し、かつ evaluation の passed が真である場合に限り真を返す。これらの何れかを欠く場合は偽を返し、registry は deterministic fallback へ退避する。評価未通過 artifact を真と誤認しないため passed は明示的に真偽値化する。
    """
    if int(self.schema_version) != int(POLICY_SCHEMA_VERSION):
      return False
    if str(self.compatibility_target) != str(POLICY_COMPATIBILITY_TARGET):
      return False
    if int(self.feature_encoder_version) not in (0, int(FEATURE_ENCODER_VERSION)):
      return False
    if int(self.action_catalog_version) not in (0, int(ACTION_SCHEMA_VERSION)):
      return False
    return bool(self.evaluation.get("passed", False))

  def to_dict(self) -> dict[str, Any]:
    """
    policy artifact を JSON 直列化可能な mapping へ変換する。
    返値は schema・identity・version 群、source 系、skill_categories、evaluation、action_weights、utility_modifiers、negative_modifiers、legacy 大域補正、metadata を含み、保存と検証が同一形式を共有する。
    """
    return {
      "schema_version": int(self.schema_version),
      "policy_id": str(self.policy_id),
      "policy_name": str(self.policy_name),
      "policy_version": int(self.policy_version),
      "compatibility_target": str(self.compatibility_target),
      "feature_encoder_version": int(self.feature_encoder_version),
      "action_catalog_version": int(self.action_catalog_version),
      "compatible_ludoxel_version": str(self.compatible_ludoxel_version),
      "created_at": str(self.created_at),
      "source": str(self.source),
      "source_dataset_id": str(self.source_dataset_id),
      "source_dataset_size": int(self.source_dataset_size),
      "skill_categories": [str(value) for value in self.skill_categories],
      "evaluation": dict(self.evaluation or {}),
      "action_weights": {str(feature): {str(action): float(weight) for action, weight in (mapping or {}).items()} for feature, mapping in (self.action_weights or {}).items()},
      "utility_modifiers": {str(key): float(value) for key, value in (self.utility_modifiers or {}).items()},
      "negative_modifiers": {str(key): float(value) for key, value in (self.negative_modifiers or {}).items()},
      "action_weight_overrides": {str(key): float(value) for key, value in (self.action_weight_overrides or {}).items()},
      "utility_score_modifiers": {str(key): float(value) for key, value in (self.utility_score_modifiers or {}).items()},
      "metadata": dict(self.metadata or {}),
    }


def _coerce_weight_map(value: object) -> dict[str, float]:
  """
  文字列 key から float への mapping を正規化する。
  入力が dict でない場合は空 mapping を返し、float 化に失敗した entry は除外する。これにより壊れた重み値が効用補正へ混入しない。
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


def _coerce_feature_weights(value: object) -> dict[str, dict[str, float]]:
  """
  feature key から {action_id: 重み} への入れ子 mapping を正規化する。
  入力が dict でない場合は空 mapping を返し、各 feature の値も dict でなければ無視し、float 化に失敗した action entry は除外する。
  """
  if not isinstance(value, dict):
    return {}
  result: dict[str, dict[str, float]] = {}
  for feature, mapping in value.items():
    inner = _coerce_weight_map(mapping)
    if inner:
      result[str(feature)] = inner
  return result


def load_policy(data: object) -> Policy | None:
  """
  mapping から policy artifact を復元する。
  入力が dict でない、又は policy_id が空、又は schema_version が数値化できない場合は読み込み不能として None を返す。evaluation は新形式 "evaluation" を優先し、無ければ同梱 bias artifact 互換の "evaluation_summary" を読む。重み系 mapping は float へ正規化し、不正 entry を除外する。schema・compat・version の不整合は None を返さず復元するが is_usable が偽となることで本番使用を防ぎ、registry が fallback を選べる。
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
  evaluation = data.get("evaluation")
  if not isinstance(evaluation, dict):
    evaluation = data.get("evaluation_summary")
  return Policy(
    policy_id=str(policy_id),
    policy_name=str(data.get("policy_name", policy_id)),
    policy_version=int(policy_version),
    schema_version=int(schema_version),
    compatibility_target=str(data.get("compatibility_target", "")),
    feature_encoder_version=_coerce_int(data.get("feature_encoder_version", 0)),
    action_catalog_version=_coerce_int(data.get("action_catalog_version", 0)),
    compatible_ludoxel_version=str(data.get("compatible_ludoxel_version", "")),
    created_at=str(data.get("created_at", "")),
    source=str(data.get("source", POLICY_SOURCE_BUNDLED)),
    source_dataset_id=str(data.get("source_dataset_id", "")),
    source_dataset_size=_coerce_int(data.get("source_dataset_size", 0)),
    skill_categories=skills,
    evaluation=dict(evaluation) if isinstance(evaluation, dict) else {},
    action_weights=_coerce_feature_weights(data.get("action_weights")),
    utility_modifiers=_coerce_weight_map(data.get("utility_modifiers")),
    negative_modifiers=_coerce_weight_map(data.get("negative_modifiers")),
    action_weight_overrides=_coerce_weight_map(data.get("action_weight_overrides")),
    utility_score_modifiers=_coerce_weight_map(data.get("utility_score_modifiers")),
    metadata=dict(data.get("metadata")) if isinstance(data.get("metadata"), dict) else {},
  )


def _coerce_int(value: object) -> int:
  """
  任意 object を整数へ変換し、変換不能時に 0 を返す。
  policy artifact の version と dataset size の復元で、欠落値と不正値を同じ 0 へ寄せる。
  """
  try:
    return int(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    return 0


@dataclass(frozen=True)
class PolicyDecision:
  """
  policy が一 step に対して下した行動選択結果を表す不変値である。
  action_id は選択行動、utility は効用値、ranked は (action_id, 効用) を効用降順で並べた候補列、source は決定経路(deterministic baseline のみか policy 補正を含むか)である。action_id は必ず行動 mask の許可集合に含まれ、policy 補正によっても禁止行動が選ばれないことを保証する。
  """

  action_id: str
  utility: float
  ranked: tuple[tuple[str, float], ...]
  source: str


class DeterministicPolicy:
  """
  学習に依らず観測値と安全規則のみから行動を選ぶ決定論的 baseline policy を表す。
  本 policy は registry が常に保持する最終 fallback であり、壊れた又は評価未通過の学習 policy が選ばれた場合でも AI を機能させる。効用は観測文脈(player の視認・射程・低体力下の脅威、route の有無と閉塞、周囲の閉塞度、配置可否)から算出し、行動 mask が許可した行動だけを候補とする。低体力時は単純逃走に固定せず、後退攻撃・横移動攻撃・遮蔽配置・距離取り・攻撃継続を効用で比較する。route 閉塞時は再探索を優先し、必要に応じて破壊・配置・積み上げ・橋掛けを候補に含める。周囲が閉塞している場合は隙間・跳躍・配置・破壊・フェンスゲート操作を順に評価する。
  decide は与えた学習 policy(任意)の feature 条件付き重み、negative_modifiers、及び legacy 大域補正を baseline 効用へ重畳し、行動選好を傾けるが、mask による安全境界は変えない。
  """

  def __init__(self, *, low_health_fraction: float = 0.35) -> None:
    """
    低体力とみなす体力割合の閾値を保持して初期化する。
    low_health_fraction は max_health に対する割合であり、health <= max_health * low_health_fraction を低体力とみなす基準として decide の効用算出に用いる。
    """
    self._low_health_fraction = float(low_health_fraction)

  def decide(self, observation: AiObservation, mask: AiActionMask | None = None, policy: Policy | None = None) -> PolicyDecision:
    """
    観測値と行動 mask から実行行動を決定する。
    mask を省略した場合は observation から build_action_mask で生成し、許可行動だけを候補とする。各候補に文脈別 baseline 効用を割り当て、policy が与えられていれば observation を符号化した feature key に基づく action_weights、negative_modifiers、及び legacy 大域補正(action_weight_overrides と utility_score_modifiers、utility_modifiers)を加算する。効用最大の行動を選び、同点は ACTION_IDS の定義順で決定して再現性を保つ。許可行動が皆無という例外的状況では no_op を強制返却する。返値の ranked は効用降順の候補列であり、source は補正の有無を示す。
    """
    effective_mask = mask if isinstance(mask, AiActionMask) else build_action_mask(observation)
    scores = self._baseline_scores(observation, effective_mask)
    source = "deterministic"
    if isinstance(policy, Policy):
      self._apply_policy(scores, observation, policy)
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
    observation.low_health が真ならそれを尊重し、そうでなければ health <= max_health * low_health_fraction を低体力とみなす。max_health が非正の異常値では偽を返し、ゼロ除算と誤分類を避ける。
    """
    if bool(observation.low_health):
      return True
    if float(observation.max_health) <= 0.0:
      return False
    return float(observation.health) <= float(observation.max_health) * float(self._low_health_fraction)

  def _boxed_score(self, observation: AiObservation) -> int:
    """
    周囲 8 方向のうち一歩で歩行遷移できない方向の数を返す。
    standable_step が偽である方向を計数し、値が大きいほど閉塞が強い。囲まれ対処の効用を高める判断に用いる。
    """
    return sum(1 for probe in observation.directions.values() if not bool(probe.standable_step))

  def _baseline_scores(self, observation: AiObservation, mask: AiActionMask) -> dict[str, float]:
    """
    許可行動に対する文脈別 baseline 効用を算出して mapping で返す。
    視認 player への接近時は前進と斜め前進を高く、射程内かつ攻撃可能時は攻撃と後退攻撃・横移動攻撃を高くする。低体力かつ脅威圏内では後退・後退攻撃・横移動攻撃・遮蔽配置・距離取りと攻撃継続を比較可能な効用で並べ、単純逃走への固定を避ける。route 追従時は follow_route を高く、route 閉塞時は replan_route を最優先し破壊・配置・積み上げ・橋掛けを補助候補とする。閉塞が強い場合は跳躍・parkour・積み上げ・破壊・フェンスゲート操作の効用を加える。いずれにも該当しない場合は視線回転と sneak を低効用で残し、停止系は最小限とする。許可されていない行動は候補に含めない。
    """
    allowed = mask.allowed
    scores: dict[str, float] = {action_id: 0.0 for action_id in ACTION_IDS if action_id in allowed}
    if not scores:
      return scores

    def add(action_id: str, value: float) -> None:
      if action_id in scores:
        scores[action_id] += float(value)

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

  def _apply_policy(self, scores: dict[str, float], observation: AiObservation, policy: Policy) -> None:
    """
    学習 policy の feature 条件付き重みと大域補正を baseline 効用へ重畳する。
    observation を encode_features で feature key へ符号化し、成立 feature ごとに action_weights の対応行動へ加点する。negative_modifiers は対象行動へ減点する。legacy 大域補正として action_weight_overrides を action 単位に、utility_score_modifiers と utility_modifiers を行動の category/skill 又は feature 単位に加点する。いずれの補正も許可集合に含まれる行動にのみ適用し、禁止行動を復活させない。これにより policy は効用順位だけを変え、mask による安全境界は変えない。
    """
    features = encode_features(observation)
    for feature in features:
      mapping = policy.action_weights.get(feature)
      if not mapping:
        continue
      for action_id, weight in mapping.items():
        if action_id in scores:
          scores[action_id] += float(weight)
    for action_id, penalty in policy.negative_modifiers.items():
      if action_id in scores:
        scores[action_id] -= float(penalty)
    for action_id, override in policy.action_weight_overrides.items():
      if action_id in scores:
        scores[action_id] += float(override)
    feature_set = set(features)
    if policy.utility_score_modifiers or policy.utility_modifiers:
      for action_id in tuple(scores.keys()):
        action = ACTION_CATALOG.get(action_id)
        if action is None:
          continue
        scores[action_id] += float(policy.utility_score_modifiers.get(action.category, 0.0)) + float(policy.utility_score_modifiers.get(action.skill_category, 0.0))
        scores[action_id] += float(policy.utility_modifiers.get(action.category, 0.0)) + float(policy.utility_modifiers.get(action.skill_category, 0.0))
      for feature in feature_set:
        bonus = float(policy.utility_modifiers.get(feature, 0.0))
        if abs(bonus) <= 1e-12:
          continue
        for action_id in scores:
          scores[action_id] += float(bonus)


def builtin_deterministic_policy() -> Policy:
  """
  registry が同梱学習 policy 不在時に用いる組み込み deterministic policy の artifact 記述を返す。
  本 artifact は補正を持たず評価通過済みとして is_usable を真にする。実際の行動決定は DeterministicPolicy が担い、本 artifact は registry 上で組み込み policy を一意に表す identity として機能する。
  """
  return Policy(
    policy_id=str(POLICY_ID_BUILTIN),
    policy_name="Built-in Deterministic AI",
    policy_version=1,
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    feature_encoder_version=int(FEATURE_ENCODER_VERSION),
    action_catalog_version=int(ACTION_SCHEMA_VERSION),
    created_at="2026-06-15",
    source=POLICY_SOURCE_BUILTIN,
    evaluation={"passed": True, "note": "Built-in deterministic baseline; always available."},
  )
