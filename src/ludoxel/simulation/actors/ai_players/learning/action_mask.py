# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.actions import ACTION_CATALOG, ACTION_IDS, AiAction
from ludoxel.simulation.actors.ai_players.learning.observation import DIRECTION_OFFSETS, AiObservation, DirectionProbe

_TRANSLATION_EPS: float = 1e-6


def _resolve_world_direction(*, move_f: float, move_s: float, yaw_deg: float) -> str | None:
  """
  facing 相対の移動入力 (move_f, move_s) と現在 yaw から、進行する world 水平方向を 8 方向名へ写像する。
  forward = (-sin(yaw), cos(yaw))、right = (cos(yaw), sin(yaw)) として合成方向 dir = forward*move_f + right*move_s を求め、DIRECTION_OFFSETS の各単位方向との内積が最大となる方向名を返す。move 入力が実質 0 で合成方向が縮退する場合は None を返し、呼び出し側はその行動を方向依存の安全判定から除外する。yaw_deg は度であり内部で弧度へ変換する。
  """
  if abs(float(move_f)) <= _TRANSLATION_EPS and abs(float(move_s)) <= _TRANSLATION_EPS:
    return None
  yaw_rad = math.radians(float(yaw_deg))
  forward_x = -math.sin(yaw_rad)
  forward_z = math.cos(yaw_rad)
  right_x = math.cos(yaw_rad)
  right_z = math.sin(yaw_rad)
  dir_x = float(forward_x) * float(move_f) + float(right_x) * float(move_s)
  dir_z = float(forward_z) * float(move_f) + float(right_z) * float(move_s)
  length = math.hypot(float(dir_x), float(dir_z))
  if float(length) <= _TRANSLATION_EPS:
    return None
  unit_x = float(dir_x) / float(length)
  unit_z = float(dir_z) / float(length)
  best_name: str | None = None
  best_dot = -1e9
  for name, offset_x, offset_z in DIRECTION_OFFSETS:
    offset_length = math.hypot(float(offset_x), float(offset_z))
    if float(offset_length) <= _TRANSLATION_EPS:
      continue
    dot = (float(unit_x) * float(offset_x) + float(unit_z) * float(offset_z)) / float(offset_length)
    if float(dot) > float(best_dot):
      best_dot = float(dot)
      best_name = str(name)
  return best_name


@dataclass(frozen=True)
class AiActionMask:
  """
  特定 observation の下で実行を許可する行動と禁止する行動を表す不変判定結果である。
  allowed は実行可能な action_id の凍結集合であり、forbidden は禁止された action_id から英文の禁止理由への mapping である。policy と上位 runtime は allowed に含まれない行動を選択してはならず、これにより学習済み policy 又は将来 policy が安全規則(奈落歩行、足場破壊、配置不能箇所への配置、射程外攻撃、cooldown 中攻撃、開閉不能なフェンスゲート操作、route 不在時の移動継続、低体力時の危険圏滞留)を迂回することを防ぐ。
  本判定は observation が保持する実形状規則由来の標本(方向標本、足場、配置可否、cooldown、route 状態、危険圏)に基づくため、full block 仮定ではなく半 block・階段・フェンス・フェンスゲート・壁・隙間・開閉状態を反映する。
  """

  allowed: frozenset[str] = field(default_factory=frozenset)
  forbidden: dict[str, str] = field(default_factory=dict)

  def is_allowed(self, action_id: str) -> bool:
    """
    指定 action_id が現在許可されているかを返す。
    未知 id と禁止された id はいずれも偽を返し、policy は本述語が真の行動だけを選択する。
    """
    return str(action_id) in self.allowed

  def to_dict(self) -> dict[str, Any]:
    """
    判定結果を JSON 直列化可能な mapping へ変換する。
    返値は allowed を昇順整列した list、forbidden を action_id から理由への mapping として保持し、評価 log と demonstration 記録が同一形式で参照できる。
    """
    return {"allowed": sorted(str(action_id) for action_id in self.allowed), "forbidden": {str(key): str(value) for key, value in self.forbidden.items()}}


def _direction_for_action(action: AiAction, observation: AiObservation) -> DirectionProbe | None:
  """
  移動を伴う行動について、その移動方向に対応する observation の方向標本を返す。
  action.parameters の move_f と move_s を facing 相対入力とみなし、observation の yaw から world 方向名を解決して対応標本を取り出す。移動入力を持たない行動、又は方向が縮退する行動では None を返し、方向依存の安全判定を行わないことを示す。
  """
  move_f = float(action.parameters.get("move_f", 0.0) or 0.0)
  move_s = float(action.parameters.get("move_s", 0.0) or 0.0)
  name = _resolve_world_direction(move_f=move_f, move_s=move_s, yaw_deg=float(observation.self_yaw_deg))
  if name is None:
    return None
  return observation.directions.get(str(name))


def _placement_feasible(observation: AiObservation) -> bool:
  """
  いずれかの隣接方向へ支持 block を配置して足場を作れるかを返す。
  配置許可、在庫数、及び実 placement 規則由来の can_place_support を総合し、配置で意味のある足場を作れる方向が一つでもある場合に真を返す。配置系行動の許可判定の共通前提として用いる。
  """
  if not bool(observation.can_place_blocks) or int(observation.available_block_count) <= 0:
    return False
  return any(bool(probe.can_place_support) for probe in observation.directions.values())


def _break_target_is_only_self_support(observation: AiObservation) -> bool:
  """
  破壊対象候補が自身の足場 cell ただ一つに限られるかを返す。
  visible_target_blocks が自身の support_cell のみを含む場合に真を返し、破壊により自らの足場を失う行動を禁止するための前提とする。対象候補が空、又は足場以外の対象を含む場合は偽を返す。
  """
  support = observation.support_cell
  if support is None:
    return False
  targets = tuple(tuple(int(value) for value in cell) for cell in observation.visible_target_blocks)
  if len(targets) != 1:
    return False
  return tuple(int(value) for value in support) == targets[0]


def build_action_mask(observation: AiObservation) -> AiActionMask:
  """
  observation から実行可能な行動集合と禁止理由を構築する。
  禁止規則は次を含む。移動行動は進行方向標本が奈落(is_void)を示す場合に禁止する。jump、tower_step、parkour_jump、escape_stack_block の跳躍系は接地していない(jump_available が偽)場合に禁止する。attack、backpedal_attack、strafe_attack は射程外(attack_in_range が偽)又は cooldown 中(attack_cooldown_ready が偽)で禁止する。place_block、bridge_step、defensive_block、trap_block_landing_path は配置許可・在庫・配置可能方向のいずれかを欠く場合に禁止する。tower_step と escape_stack_block は配置許可・在庫・接地のいずれかを欠く場合に禁止する。break_block、escape_break_block、trap_prepare_hole は破壊対象候補が無い場合、又は対象が自身の足場のみで足場破壊となる場合に禁止する。toggle_fence_gate は操作可能なフェンスゲートが隣接しない場合に禁止する。follow_route は route 不在又は route 閉塞時に禁止し、移動の盲目的継続を防ぐ。replan_route は route 不在時に禁止する。no_op と stop は低体力かつ攻撃圏内滞留(low_health_in_threat)時に禁止し、危険圏での無為な滞留を防ぐ。
  視線回転(turn_left、turn_right、look_at_target、look_at_block_target)と sneak は常に許可し、許可集合が空にならないことを保証する。返値の forbidden は禁止された行動にのみ理由を割り当て、allowed はそれ以外の全 catalog 行動を含む。
  """
  forbidden: dict[str, str] = {}
  jump_available = bool(observation.jump_available) and bool(observation.on_ground)
  placement_feasible = _placement_feasible(observation)
  break_target_self_only = _break_target_is_only_self_support(observation)
  has_break_target = len(observation.visible_target_blocks) > 0
  attack_ready = bool(observation.attack_in_range) and bool(observation.attack_cooldown_ready)

  for action_id in ACTION_IDS:
    action = ACTION_CATALOG[action_id]
    reason: str | None = None

    direction_probe = _direction_for_action(action, observation)
    if direction_probe is not None and bool(direction_probe.is_void):
      reason = "Moving this way steps into a deadly drop or the void."

    if reason is None and action_id in ("jump", "tower_step", "parkour_jump", "escape_stack_block") and not bool(jump_available):
      reason = "A grounded launch is required and the AI is not on the ground."

    if reason is None and action_id in ("attack", "backpedal_attack", "strafe_attack") and not bool(attack_ready):
      reason = "The target is out of melee reach or the attack is still on cooldown."

    if reason is None and action_id in ("place_block", "bridge_step", "defensive_block", "trap_block_landing_path") and not bool(placement_feasible):
      reason = "No reachable face allows a valid block placement here."

    if reason is None and action_id in ("tower_step", "escape_stack_block"):
      if not bool(observation.can_place_blocks) or int(observation.available_block_count) <= 0:
        reason = "Block placement is disabled or no blocks are available."
      elif not bool(observation.on_ground):
        reason = "Stacking upward requires standing on the ground first."

    if reason is None and action_id in ("break_block", "escape_break_block", "trap_prepare_hole"):
      if not bool(has_break_target):
        reason = "No breakable block is currently targeted."
      elif bool(break_target_self_only):
        reason = "Breaking this block would remove the AI's own footing."

    if reason is None and action_id == "toggle_fence_gate" and not bool(observation.fence_gate_operable):
      reason = "No operable fence gate is adjacent."

    if reason is None and action_id == "follow_route":
      if not bool(observation.route_present):
        reason = "There is no active route to follow."
      elif bool(observation.route_blocked):
        reason = "The route is blocked; replan or clear the obstruction instead of advancing."

    if reason is None and action_id == "replan_route" and not bool(observation.route_present):
      reason = "There is no route goal to replan toward."

    if reason is None and action_id in ("no_op", "stop") and bool(observation.low_health_in_threat):
      reason = "Holding still inside the attacker's reach at low health is unsafe."

    if reason is not None:
      forbidden[str(action_id)] = str(reason)

  allowed = frozenset(action_id for action_id in ACTION_IDS if action_id not in forbidden)
  return AiActionMask(allowed=allowed, forbidden=forbidden)
