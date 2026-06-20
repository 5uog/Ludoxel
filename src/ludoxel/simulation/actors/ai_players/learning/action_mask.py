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
  allowed: frozenset[str] = field(default_factory=frozenset)
  forbidden: dict[str, str] = field(default_factory=dict)

  def is_allowed(self, action_id: str) -> bool:
    return str(action_id) in self.allowed

  def to_dict(self) -> dict[str, Any]:
    return {"allowed": sorted(str(action_id) for action_id in self.allowed), "forbidden": {str(key): str(value) for key, value in self.forbidden.items()}}


def _direction_for_action(action: AiAction, observation: AiObservation) -> DirectionProbe | None:
  move_f = float(action.parameters.get("move_f", 0.0) or 0.0)
  move_s = float(action.parameters.get("move_s", 0.0) or 0.0)
  name = _resolve_world_direction(move_f=move_f, move_s=move_s, yaw_deg=float(observation.self_yaw_deg))
  if name is None:
    return None
  return observation.directions.get(str(name))


def _placement_feasible(observation: AiObservation) -> bool:
  if not bool(observation.can_place_blocks) or int(observation.available_block_count) <= 0:
    return False
  return any(bool(probe.can_place_support) for probe in observation.directions.values())


def _break_target_is_only_self_support(observation: AiObservation) -> bool:
  support = observation.support_cell
  if support is None:
    return False
  targets = tuple(tuple(int(value) for value in cell) for cell in observation.visible_target_blocks)
  if len(targets) != 1:
    return False
  return tuple(int(value) for value in support) == targets[0]


def build_action_mask(observation: AiObservation) -> AiActionMask:
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
