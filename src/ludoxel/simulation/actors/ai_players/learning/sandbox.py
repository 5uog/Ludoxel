# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_SCHEMA_VERSION
from ludoxel.simulation.actors.ai_players.learning.coordinator import LEARNING_RUNTIME_OFF, LEARNING_RUNTIME_USE_LEARNED_POLICY, LearningCoordinator
from ludoxel.simulation.actors.ai_players.learning.feature_encoder import FEATURE_ENCODER_VERSION
from ludoxel.simulation.actors.ai_players.learning.policy import POLICY_COMPATIBILITY_TARGET, POLICY_SCHEMA_VERSION, POLICY_SOURCE_SANDBOX, Policy
from ludoxel.simulation.actors.ai_players.manager import AiPlayerManager
from ludoxel.simulation.actors.ai_players.state import AI_MODE_WANDER, AI_PERSONALITY_AGGRESSIVE, AiPlayerState
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.default import create_default_registry
from ludoxel.simulation.worlds.config.session import SessionSettings
from ludoxel.simulation.worlds.state.world import WorldState

_SANDBOX_DT: float = 0.1
_EPISODE_TICKS: int = 120
_FLOOR_STATE: str = "minecraft:stone"
_FLOOR_RADIUS: int = 10

_REGISTRY = None
_SETTINGS: SessionSettings | None = None


def _registry():
  """
  sandbox 全 episode で共有する block registry を遅延生成して返す。
  registry は読み取り専用契約として複数 episode で再利用でき、episode ごとの再構築費用を避ける。
  """
  global _REGISTRY
  if _REGISTRY is None:
    _REGISTRY = create_default_registry()
  return _REGISTRY


def _settings() -> SessionSettings:
  """
  sandbox 全 episode で共有する session settings を遅延生成して返す。
  movement と collision の既定値を持つ SessionSettings を一度だけ構築し、headless simulation の物理と衝突判定に用いる。
  """
  global _SETTINGS
  if _SETTINGS is None:
    _SETTINGS = SessionSettings()
  return _SETTINGS


def _flat_world(*, radius: int = _FLOOR_RADIUS, void_min_z: int | None = None) -> WorldState:
  """
  半径 radius の平坦な石床を持つ headless world を構築して返す。
  y=0 平面の (x, z) ∈ [-radius, radius] へ床 block を敷き、
  void_min_z を与えた場合は z >= void_min_z の床 cell を除いて奈落縁を作る。
  返値は AiPlayerManager の物理・衝突・足場判定が参照する WorldState である。
  """
  blocks: dict[tuple[int, int, int], str] = {}
  for x in range(-int(radius), int(radius) + 1):
    for z in range(-int(radius), int(radius) + 1):
      if void_min_z is not None and int(z) >= int(void_min_z):
        continue
      blocks[(int(x), 0, int(z))] = str(_FLOOR_STATE)
  return WorldState(blocks=blocks, revision=1)


def _gap_world(*, radius: int = _FLOOR_RADIUS, gap_lo: int = 1, gap_hi: int = 3) -> WorldState:
  """
  z 方向に bridgeable な gap を持つ headless world を構築して返す。
  y=0 平面の床のうち gap_lo <= z <= gap_hi の範囲だけ床 cell を抜き、
  その先(z > gap_hi)に再び床が続く構成とする。
  配置許可を持つ AI は橋を架けて gap を越えられ、配置不能な AI は越えられない。
  bridge を要する task の検証に用いる。
  """
  blocks: dict[tuple[int, int, int], str] = {}
  for x in range(-int(radius), int(radius) + 1):
    for z in range(-int(radius), int(radius) + 1):
      if int(gap_lo) <= int(z) <= int(gap_hi):
        continue
      blocks[(int(x), 0, int(z))] = str(_FLOOR_STATE)
  return WorldState(blocks=blocks, revision=1)


@dataclass(frozen=True)
class SandboxScenario:
  """
  headless sandbox における単一 task の構成を表す不変記述である。
  task_id は識別子、world_factory は episode ごとの WorldState 生成、actor_state は初期 AI 状態、
  target_factory は tick から対象 player を返す関数(対象不在なら None を返す)、ticks は最大 step 数、dt は step 時間である。
  score_fn は episode 終了状態(生存・距離・被害)から実数 score を算出し、success_threshold 以上で成功とみなす。
  すべての判定は AiPlayerManager.step の実物理・実規則の結果から導く。
  """

  task_id: str
  world_factory: Callable[[], WorldState]
  actor_state: AiPlayerState
  target_factory: Callable[[int], PlayerEntity | None]
  score_fn: Callable[[dict[str, Any]], float]
  ticks: int = _EPISODE_TICKS
  dt: float = _SANDBOX_DT
  success_threshold: float = 0.0


def _no_target(_tick: int) -> PlayerEntity | None:
  """
  対象 player が存在しない scenario のための target factory である。
  常に None を返し、survive 系 task のように脅威を伴わない episode を表す。
  """
  return None


def _static_target(position: Vec3) -> Callable[[int], PlayerEntity | None]:
  """
  固定位置に静止する対象 player を返す target factory を生成する。
  位置 position に体力満タンで静止する PlayerEntity を毎 tick 返し、接近・退避・距離保持の評価に用いる。
  """

  def factory(_tick: int) -> PlayerEntity | None:
    return PlayerEntity(position=Vec3(float(position.x), float(position.y), float(position.z)), velocity=Vec3(0.0, 0.0, 0.0), yaw_deg=0.0, pitch_deg=0.0, on_ground=True, health=20.0, max_health=20.0)

  return factory


def _wander_actor(*, pos: tuple[float, float, float], health: float = 20.0, can_place: bool = False) -> AiPlayerState:
  """
  指定位置・体力の Free Roam / PVP(wander)・aggressive な AI 初期状態を生成する。
  sandbox task の被験 actor として用い、health を下げることで低体力 task を、
  can_place を真にすることで bridge / tower / defensive 配置を伴う task を構成できる。
  """
  return AiPlayerState(
    actor_id="sandbox_actor",
    mode=AI_MODE_WANDER,
    personality=AI_PERSONALITY_AGGRESSIVE,
    can_place_blocks=bool(can_place),
    pos_x=float(pos[0]),
    pos_y=float(pos[1]),
    pos_z=float(pos[2]),
    on_ground=True,
    health=float(health),
    max_health=20.0,
  )


def _run_episode(scenario: SandboxScenario, policy: Policy | None) -> dict[str, Any]:
  """
  単一 scenario を policy(任意)の下で headless に実行し、episode 結果指標を返す。
  policy を与えた場合は LearningCoordinator を use_learned_policy で構成し、
  AiPlayerManager.step に渡して live と同一の決定経路(deterministic 効用 + policy 補正 + action mask + edge safety)で実行する。
  policy が None の場合は coordinator を off にして deterministic baseline を実行する。
  actor が死亡して manager から除去された場合は episode を打ち切る。
  返値は生存 tick 数、生存可否、対象への初期/最終距離、累積被害、最終位置を含む。
  """
  world = scenario.world_factory()
  manager = AiPlayerManager(world=world, block_registry=_registry(), settings=_settings(), warm_route_worker=False)
  manager.load_states([scenario.actor_state])
  coordinator = LearningCoordinator()
  coordinator.configure(mode=(LEARNING_RUNTIME_USE_LEARNED_POLICY if isinstance(policy, Policy) else LEARNING_RUNTIME_OFF), captured_kinds=(), policy=policy)
  initial_state = manager.actors()[0]
  initial_target = scenario.target_factory(0)
  initial_distance = None
  if initial_target is not None:
    initial_distance = float(((initial_target.position) - Vec3(float(initial_state.pos_x), float(initial_state.pos_y), float(initial_state.pos_z))).length())
  survived_ticks = 0
  final_distance = initial_distance
  last_pos = (float(initial_state.pos_x), float(initial_state.pos_y), float(initial_state.pos_z))
  alive = True
  for tick in range(int(scenario.ticks)):
    actors = manager.actors()
    if not actors:
      alive = False
      break
    target = scenario.target_factory(int(tick))
    manager.step(dt=float(scenario.dt), target_player=target, allow_pvp=True, learning=coordinator)
    actors_after = manager.actors()
    if not actors_after:
      alive = False
      break
    survived_ticks += 1
    actor = actors_after[0]
    last_pos = (float(actor.pos_x), float(actor.pos_y), float(actor.pos_z))
    if target is not None:
      final_distance = float((target.position - Vec3(float(actor.pos_x), float(actor.pos_y), float(actor.pos_z))).length())
  manager.shutdown()
  return {
    "task_id": str(scenario.task_id),
    "alive": bool(alive),
    "survived_ticks": int(survived_ticks),
    "total_ticks": int(scenario.ticks),
    "initial_distance": initial_distance,
    "final_distance": final_distance,
    "final_position": [float(value) for value in last_pos],
  }


def _survival_score(metrics: dict[str, Any]) -> float:
  """
  survive / avoid_void task の score を算出する。
  生存 tick 数を総 tick 数で正規化した生存率に、最後まで生存した場合の追加報酬を加える。
  奈落落下や死亡は survived_ticks の減少として反映される。
  """
  total = max(1, int(metrics.get("total_ticks", 1)))
  ratio = float(int(metrics.get("survived_ticks", 0))) / float(total)
  return float(ratio) + (0.5 if bool(metrics.get("alive", False)) else 0.0)


def _retreat_score(metrics: dict[str, Any]) -> float:
  """
  retreat_at_low_health task の score を算出する。
  対象への距離が初期より増えた量を正の報酬とし、生存に追加報酬を与える。
  距離情報が無い場合は生存率のみで評価する。
  後退して距離を稼ぐ policy ほど高得点となる。
  """
  base = _survival_score(metrics)
  initial = metrics.get("initial_distance")
  final = metrics.get("final_distance")
  if initial is None or final is None:
    return float(base)
  return float(base) + float(max(-2.0, min(4.0, float(final) - float(initial))))


def _approach_score(metrics: dict[str, Any]) -> float:
  """
  reach_target task の score を算出する。
  対象への距離が初期より縮んだ量を正の報酬とし、生存に追加報酬を与える。
  接近して距離を詰める policy ほど高得点となる。
  retreat task と対になり、常時後退する偏った policy を抑制する。
  """
  base = _survival_score(metrics)
  initial = metrics.get("initial_distance")
  final = metrics.get("final_distance")
  if initial is None or final is None:
    return float(base)
  return float(base) + float(max(-2.0, min(4.0, float(initial) - float(final))))


def default_scenarios() -> tuple[SandboxScenario, ...]:
  """
  sandbox training / evaluation で用いる既定 scenario 群を返す。
  含まれる task は、平坦床での生存(survive_flat)、奈落縁での落下回避(avoid_void)、
  低体力時の距離確保(retreat_at_low_health)、遠方対象への接近(reach_target)である。
  いずれも AiPlayerManager.step の実物理・実規則・action mask・edge safety を通して実行され、full block 仮定に依らない。
  これらは互いに異なる望ましい挙動を要求するため、aggregate score の最適化は単一方向へ偏った policy を選ばない。
  """
  return (
    SandboxScenario(
      task_id="survive_flat", world_factory=lambda: _flat_world(), actor_state=_wander_actor(pos=(0.5, 1.0, 0.5)), target_factory=_no_target, score_fn=_survival_score, success_threshold=0.9
    ),
    SandboxScenario(
      task_id="avoid_void",
      world_factory=lambda: _flat_world(void_min_z=3),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5)),
      target_factory=_static_target(Vec3(0.5, 1.0, 8.0)),
      score_fn=_survival_score,
      success_threshold=0.9,
    ),
    SandboxScenario(
      task_id="retreat_at_low_health",
      world_factory=lambda: _flat_world(),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5), health=4.0),
      target_factory=_static_target(Vec3(0.5, 1.0, 2.5)),
      score_fn=_retreat_score,
      success_threshold=0.5,
    ),
    SandboxScenario(
      task_id="reach_target",
      world_factory=lambda: _flat_world(),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5)),
      target_factory=_static_target(Vec3(0.5, 1.0, 7.5)),
      score_fn=_approach_score,
      success_threshold=0.2,
    ),
    SandboxScenario(
      task_id="bridge_gap",
      world_factory=lambda: _gap_world(gap_lo=1, gap_hi=3),
      actor_state=_wander_actor(pos=(0.5, 1.0, 0.5), can_place=True),
      target_factory=_static_target(Vec3(0.5, 1.0, 7.5)),
      score_fn=_approach_score,
      success_threshold=0.2,
    ),
  )


def _merge_weights(base: dict[str, dict[str, float]], delta: dict[str, dict[str, float]]) -> dict[str, dict[str, float]]:
  """
  feature 条件付き action 重み mapping へ候補補正 delta を加算した新 mapping を返す。
  base を複製し、delta の各 (feature, action) を加算する。
  元 mapping は変更しない純粋関数であり、hill-climb の試行で base を破壊しない。
  """
  merged: dict[str, dict[str, float]] = {feature: dict(mapping) for feature, mapping in base.items()}
  for feature, mapping in delta.items():
    target = merged.setdefault(str(feature), {})
    for action_id, weight in mapping.items():
      target[str(action_id)] = float(target.get(str(action_id), 0.0)) + float(weight)
  return merged


def _candidate_perturbations() -> tuple[dict[str, dict[str, float]], ...]:
  """
  hill-climb が試行する候補補正の集合を返す。
  各候補は特定 feature における特定 action の選好を強める feature 条件付き重みであり、
  戦闘間合い、低体力、奈落前方、遠距離などの状況に対応する。
  候補は action mask を迂回しないため、不成立状況では効果を持たず、成立状況でのみ挙動を傾ける。
  """
  return (
    {"combat:in_range": {"strafe_attack": 0.6}},
    {"combat:in_range": {"backpedal_attack": 0.6}},
    {"combat:in_range": {"attack": 0.5}},
    {"health:low": {"move_back": 0.7, "defensive_block": 0.4}},
    {"health:critical": {"move_back": 0.9}},
    {"hazard:void_ahead": {"stop": 0.8}},
    {"player:far": {"sprint": 0.5, "move_forward": 0.4}},
    {"player:mid": {"move_forward": 0.4}},
  )


def _aggregate_score(scenarios: tuple[SandboxScenario, ...], policy: Policy | None) -> tuple[float, list[dict[str, Any]]]:
  """
  全 scenario を policy の下で実行し、score 合計と task 別結果を返す。
  各 scenario を _run_episode で実行し、score_fn で score を求めて合算する。
  返値は (score 合計, task 別 metrics と score の list) であり、hill-climb の比較と評価 report の双方に用いる。
  """
  total = 0.0
  results: list[dict[str, Any]] = []
  for scenario in scenarios:
    metrics = _run_episode(scenario, policy)
    score = float(scenario.score_fn(metrics))
    total += float(score)
    entry = dict(metrics)
    entry["score"] = float(score)
    entry["success"] = bool(float(score) >= float(scenario.success_threshold))
    results.append(entry)
  return float(total), results


def _candidate_policy(weights: dict[str, dict[str, float]]) -> Policy:
  """
  hill-climb 試行用に、与えた feature 条件付き重みだけを持つ使用可能 policy を構築する。
  schema・互換・版整合を満たし、evaluation を passed として is_usable を真にすることで、
  _run_episode が use_learned_policy 経路で当該重みを適用できるようにする。
  本 policy は試行専用であり、保存はしない。
  """
  return Policy(
    policy_id="sandbox_candidate",
    policy_name="Sandbox Candidate",
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    feature_encoder_version=int(FEATURE_ENCODER_VERSION),
    action_catalog_version=int(ACTION_SCHEMA_VERSION),
    source=POLICY_SOURCE_SANDBOX,
    evaluation={"passed": True},
    action_weights=weights,
  )


@dataclass(frozen=True)
class SandboxTrainingResult:
  """
  sandbox training run の結果を表す不変値である。
  status は completed か failed、message は英文説明、
  policy は生成・更新された Policy 又は None、baseline_score は deterministic baseline の aggregate score、
  policy_score は学習後 policy の aggregate score、accepted は採択した候補補正の説明列、
  task_results は最終 policy の task 別結果、created_at は生成情報を保持する summary である。
  policy_score >= baseline_score の場合に policy の evaluation を passed とし、即時使用可能とする。
  """

  status: str
  message: str = ""
  policy: Policy | None = None
  baseline_score: float = 0.0
  policy_score: float = 0.0
  accepted: tuple[str, ...] = ()
  task_results: tuple[dict[str, Any], ...] = ()
  summary: dict[str, Any] = field(default_factory=dict)


def train_in_sandbox(*, policy_id: str, policy_name: str = "", base_policy: Policy | None = None, policy_version: int = 1, iterations: int = 1) -> SandboxTrainingResult:
  """
  headless sandbox で reinforcement-style の hill-climb 学習を実行し、policy artifact を生成・更新する。
  まず deterministic baseline の aggregate score を測る。
  次に base_policy(あれば)の feature 重みを起点に、候補補正を順に試し、aggregate score が改善する補正のみを採択して累積する。
  iterations 回まで候補集合を反復し、改善が停止したら終了する。
  最終 policy の score が deterministic baseline 以上であれば evaluation を passed とし即時使用可能にし、
  下回る場合は passed を偽として live 使用不可のまま保存対象とする。
  返値は baseline と policy の score、採択補正、task 別結果を含む。
  巨大 neural network・外部 ML framework を用いず、Ludoxel の実 simulation 規則のみで完結する。
  """
  scenarios = default_scenarios()
  baseline_score, _baseline_results = _aggregate_score(scenarios, None)
  weights: dict[str, dict[str, float]] = {}
  if isinstance(base_policy, Policy) and base_policy.action_weights:
    weights = {feature: dict(mapping) for feature, mapping in base_policy.action_weights.items()}
  best_score, _best_results = _aggregate_score(scenarios, _candidate_policy(weights) if weights else None)
  accepted: list[str] = []
  candidates = _candidate_perturbations()
  for _iteration in range(max(1, int(iterations))):
    improved = False
    for delta in candidates:
      trial_weights = _merge_weights(weights, delta)
      trial_score, _trial_results = _aggregate_score(scenarios, _candidate_policy(trial_weights))
      if float(trial_score) > float(best_score) + 1e-6:
        weights = trial_weights
        best_score = float(trial_score)
        accepted.append("+".join(f"{feature}:{action}" for feature, mapping in delta.items() for action in mapping))
        improved = True
    if not improved:
      break

  policy_score, task_results = _aggregate_score(scenarios, _candidate_policy(weights) if weights else None)
  passed = bool(float(policy_score) >= float(baseline_score) - 1e-6) and bool(weights)
  skill_categories = tuple(sorted({str(action) for mapping in weights.values() for action in mapping}))
  if not weights:
    return SandboxTrainingResult(
      status="failed",
      message="Sandbox training did not find any improving modifier over the deterministic baseline.",
      policy=None,
      baseline_score=float(baseline_score),
      policy_score=float(policy_score),
      accepted=(),
      task_results=tuple(task_results),
      summary={"baseline_score": float(baseline_score), "policy_score": float(policy_score)},
    )
  policy = Policy(
    policy_id=str(policy_id),
    policy_name=str(policy_name or policy_id),
    policy_version=int(policy_version),
    schema_version=int(POLICY_SCHEMA_VERSION),
    compatibility_target=str(POLICY_COMPATIBILITY_TARGET),
    feature_encoder_version=int(FEATURE_ENCODER_VERSION),
    action_catalog_version=int(ACTION_SCHEMA_VERSION),
    source=POLICY_SOURCE_SANDBOX,
    skill_categories=skill_categories,
    evaluation={"passed": bool(passed), "baseline_score": float(baseline_score), "policy_score": float(policy_score), "source": "sandbox"},
    action_weights=weights,
    metadata={"accepted_modifiers": list(accepted), "iterations": int(iterations)},
  )
  return SandboxTrainingResult(
    status="completed",
    message=f"Sandbox training accepted {len(accepted)} modifier(s); policy score {policy_score:.3f} vs baseline {baseline_score:.3f}.",
    policy=policy,
    baseline_score=float(baseline_score),
    policy_score=float(policy_score),
    accepted=tuple(accepted),
    task_results=tuple(task_results),
    summary={"baseline_score": float(baseline_score), "policy_score": float(policy_score), "accepted": list(accepted)},
  )
