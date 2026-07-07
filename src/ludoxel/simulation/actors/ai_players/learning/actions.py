# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

ACTION_SCHEMA_VERSION: int = 1

ACTION_CATEGORY_MOVEMENT: str = "movement"
ACTION_CATEGORY_LOOK: str = "look"
ACTION_CATEGORY_COMBAT: str = "combat"
ACTION_CATEGORY_BLOCK_PLACEMENT: str = "block_placement"
ACTION_CATEGORY_BLOCK_BREAKING: str = "block_breaking"
ACTION_CATEGORY_ROUTE: str = "route"
ACTION_CATEGORY_ESCAPE: str = "escape"
ACTION_CATEGORY_PARKOUR: str = "parkour"
ACTION_CATEGORY_TRAP: str = "trap"
ACTION_CATEGORY_FENCE_GATE: str = "fence_gate"
ACTION_CATEGORY_NO_OP: str = "no_op"

ACTION_CATEGORIES: tuple[str, ...] = (ACTION_CATEGORY_MOVEMENT, ACTION_CATEGORY_LOOK, ACTION_CATEGORY_COMBAT, ACTION_CATEGORY_BLOCK_PLACEMENT, ACTION_CATEGORY_BLOCK_BREAKING, ACTION_CATEGORY_ROUTE, ACTION_CATEGORY_ESCAPE, ACTION_CATEGORY_PARKOUR, ACTION_CATEGORY_TRAP, ACTION_CATEGORY_FENCE_GATE, ACTION_CATEGORY_NO_OP)

SKILL_MOVEMENT: str = "movement"
SKILL_WASD_CONTROL: str = "wasd_control"
SKILL_JUMPING: str = "jumping"
SKILL_PARKOUR: str = "parkour"
SKILL_COMBAT: str = "combat"
SKILL_COMBO: str = "combo"
SKILL_ESCAPE: str = "escape"
SKILL_BLOCK_PLACEMENT: str = "block_placement"
SKILL_BLOCK_BREAKING: str = "block_breaking"
SKILL_BRIDGE_BUILDING: str = "bridge_building"
SKILL_TOWER_BUILDING: str = "tower_building"
SKILL_TRAP_BUILDING: str = "trap_building"
SKILL_FENCE_GATE_HANDLING: str = "fence_gate_handling"
SKILL_ROUTE_FINDING: str = "route_finding"
SKILL_VISUAL_AWARENESS: str = "visual_awareness"
SKILL_SURVIVAL: str = "survival"

SKILL_CATEGORIES: tuple[tuple[str, str], ...] = (
  (SKILL_MOVEMENT, "Movement"),
  (SKILL_WASD_CONTROL, "WASD Control"),
  (SKILL_JUMPING, "Jumping"),
  (SKILL_PARKOUR, "Parkour"),
  (SKILL_COMBAT, "Combat"),
  (SKILL_COMBO, "Combo"),
  (SKILL_ESCAPE, "Escape"),
  (SKILL_BLOCK_PLACEMENT, "Block Placement"),
  (SKILL_BLOCK_BREAKING, "Block Breaking"),
  (SKILL_BRIDGE_BUILDING, "Bridge Building"),
  (SKILL_TOWER_BUILDING, "Tower Building"),
  (SKILL_TRAP_BUILDING, "Trap Building"),
  (SKILL_FENCE_GATE_HANDLING, "Fence Gate Handling"),
  (SKILL_ROUTE_FINDING, "Route Finding"),
  (SKILL_VISUAL_AWARENESS, "Visual Awareness"),
  (SKILL_SURVIVAL, "Survival"),
)

SAFETY_NONE: str = "none"
SAFETY_FOOTING_AHEAD: str = "footing_ahead"
SAFETY_ON_GROUND: str = "on_ground"
SAFETY_PLACEMENT_FEASIBLE: str = "placement_feasible"
SAFETY_BREAK_NOT_SELF_SUPPORT: str = "break_not_self_support"
SAFETY_ATTACK_IN_RANGE: str = "attack_in_range"
SAFETY_FENCE_GATE_OPERABLE: str = "fence_gate_operable"
SAFETY_PARKOUR_ARC_CLEAR: str = "parkour_arc_clear"


@dataclass(frozen=True)
class AiAction:
  action_id: str
  category: str
  skill_category: str
  safety_requirement: str = SAFETY_NONE
  expected_duration_tick: int = 1
  parameters: dict[str, Any] = None  # type: ignore[assignment]
  description: str = ""

  def __post_init__(self) -> None:
    if self.parameters is None:
      object.__setattr__(self, "parameters", {})

  def to_dict(self) -> dict[str, Any]:
    return {"action_id": str(self.action_id), "category": str(self.category), "skill_category": str(self.skill_category), "safety_requirement": str(self.safety_requirement), "expected_duration_tick": int(self.expected_duration_tick), "parameters": dict(self.parameters or {}), "description": str(self.description)}


def _action(action_id: str, category: str, skill_category: str, safety: str, duration: int, description: str, **parameters: Any) -> AiAction:
  return AiAction(action_id=str(action_id), category=str(category), skill_category=str(skill_category), safety_requirement=str(safety), expected_duration_tick=max(1, int(duration)), parameters=dict(parameters), description=str(description))


_CATALOG: tuple[AiAction, ...] = (
  _action("move_forward", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Advance forward along the current facing.", move_f=1.0, move_s=0.0),
  _action("move_back", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Step backward away from the current facing.", move_f=-1.0, move_s=0.0),
  _action("move_left", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Strafe to the left of the current facing.", move_f=0.0, move_s=-1.0),
  _action("move_right", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Strafe to the right of the current facing.", move_f=0.0, move_s=1.0),
  _action("move_forward_left", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Advance diagonally forward and left.", move_f=1.0, move_s=-1.0),
  _action("move_forward_right", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Advance diagonally forward and right.", move_f=1.0, move_s=1.0),
  _action("move_back_left", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Retreat diagonally back and left.", move_f=-1.0, move_s=-1.0),
  _action("move_back_right", ACTION_CATEGORY_MOVEMENT, SKILL_WASD_CONTROL, SAFETY_FOOTING_AHEAD, 1, "Retreat diagonally back and right.", move_f=-1.0, move_s=1.0),
  _action("jump", ACTION_CATEGORY_MOVEMENT, SKILL_JUMPING, SAFETY_ON_GROUND, 1, "Trigger a vertical jump from the ground.", jump=True),
  _action("sprint", ACTION_CATEGORY_MOVEMENT, SKILL_MOVEMENT, SAFETY_FOOTING_AHEAD, 1, "Move forward at sprint speed.", move_f=1.0, sprint=True),
  _action("sneak", ACTION_CATEGORY_MOVEMENT, SKILL_MOVEMENT, SAFETY_NONE, 1, "Move at reduced speed with edge caution.", crouch=True),
  _action("stop", ACTION_CATEGORY_MOVEMENT, SKILL_MOVEMENT, SAFETY_NONE, 1, "Cancel translational movement while holding position."),
  _action("turn_left", ACTION_CATEGORY_LOOK, SKILL_VISUAL_AWARENESS, SAFETY_NONE, 1, "Rotate the view to the left.", yaw_delta_deg=-30.0),
  _action("turn_right", ACTION_CATEGORY_LOOK, SKILL_VISUAL_AWARENESS, SAFETY_NONE, 1, "Rotate the view to the right.", yaw_delta_deg=30.0),
  _action("look_at_target", ACTION_CATEGORY_LOOK, SKILL_VISUAL_AWARENESS, SAFETY_NONE, 1, "Aim the view at the current player target."),
  _action("look_at_block_target", ACTION_CATEGORY_LOOK, SKILL_VISUAL_AWARENESS, SAFETY_NONE, 1, "Aim the view at the active block placement or break target."),
  _action("attack", ACTION_CATEGORY_COMBAT, SKILL_COMBAT, SAFETY_ATTACK_IN_RANGE, 1, "Swing a melee attack at the target in reach."),
  _action("backpedal_attack", ACTION_CATEGORY_COMBAT, SKILL_COMBO, SAFETY_ATTACK_IN_RANGE, 2, "Attack while stepping backward to keep spacing.", move_f=-1.0),
  _action("strafe_attack", ACTION_CATEGORY_COMBAT, SKILL_COMBO, SAFETY_ATTACK_IN_RANGE, 2, "Attack while strafing sideways to dodge.", move_s=1.0),
  _action("place_block", ACTION_CATEGORY_BLOCK_PLACEMENT, SKILL_BLOCK_PLACEMENT, SAFETY_PLACEMENT_FEASIBLE, 1, "Place a block against the aimed support face."),
  _action("bridge_step", ACTION_CATEGORY_BLOCK_PLACEMENT, SKILL_BRIDGE_BUILDING, SAFETY_PLACEMENT_FEASIBLE, 2, "Place forward footing then advance one bridge step."),
  _action("tower_step", ACTION_CATEGORY_BLOCK_PLACEMENT, SKILL_TOWER_BUILDING, SAFETY_PLACEMENT_FEASIBLE, 2, "Jump and place a block beneath to gain height.", jump=True),
  _action("defensive_block", ACTION_CATEGORY_BLOCK_PLACEMENT, SKILL_BLOCK_PLACEMENT, SAFETY_PLACEMENT_FEASIBLE, 1, "Place a block to obstruct an approaching attacker."),
  _action("break_block", ACTION_CATEGORY_BLOCK_BREAKING, SKILL_BLOCK_BREAKING, SAFETY_BREAK_NOT_SELF_SUPPORT, 1, "Break the aimed block."),
  _action("escape_break_block", ACTION_CATEGORY_ESCAPE, SKILL_ESCAPE, SAFETY_BREAK_NOT_SELF_SUPPORT, 2, "Break a confining block to open an exit."),
  _action("escape_stack_block", ACTION_CATEGORY_ESCAPE, SKILL_ESCAPE, SAFETY_PLACEMENT_FEASIBLE, 2, "Stack a block to climb out of an enclosure.", jump=True),
  _action("parkour_jump", ACTION_CATEGORY_PARKOUR, SKILL_PARKOUR, SAFETY_PARKOUR_ARC_CLEAR, 2, "Perform a running jump across a gap.", jump=True, sprint=True),
  _action("toggle_fence_gate", ACTION_CATEGORY_FENCE_GATE, SKILL_FENCE_GATE_HANDLING, SAFETY_FENCE_GATE_OPERABLE, 1, "Open or close an adjacent fence gate."),
  _action("trap_prepare_hole", ACTION_CATEGORY_TRAP, SKILL_TRAP_BUILDING, SAFETY_NONE, 2, "Break floor blocks to prepare a pit hazard."),
  _action("trap_block_landing_path", ACTION_CATEGORY_TRAP, SKILL_TRAP_BUILDING, SAFETY_PLACEMENT_FEASIBLE, 2, "Place blocks to steer a target toward a hazard."),
  _action("follow_route", ACTION_CATEGORY_ROUTE, SKILL_ROUTE_FINDING, SAFETY_FOOTING_AHEAD, 1, "Advance along the active planned route segment.", move_f=1.0),
  _action("replan_route", ACTION_CATEGORY_ROUTE, SKILL_ROUTE_FINDING, SAFETY_NONE, 1, "Request a fresh route plan toward the goal."),
  _action("no_op", ACTION_CATEGORY_NO_OP, SKILL_SURVIVAL, SAFETY_NONE, 1, "Take no movement or interaction this step."),
)

ACTION_CATALOG: dict[str, AiAction] = {action.action_id: action for action in _CATALOG}

ACTION_IDS: tuple[str, ...] = tuple(action.action_id for action in _CATALOG)


def get_action(action_id: str) -> AiAction | None:
  return ACTION_CATALOG.get(str(action_id))


def actions_in_category(category: str) -> tuple[AiAction, ...]:
  target = str(category)
  return tuple(action for action in _CATALOG if str(action.category) == target)


def skill_category_ids() -> tuple[str, ...]:
  return tuple(skill_id for skill_id, _label in SKILL_CATEGORIES)
