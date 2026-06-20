# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

OBSERVATION_SCHEMA_VERSION: int = 1

DIRECTION_OFFSETS: tuple[tuple[str, int, int], ...] = (("n", 0, -1), ("s", 0, 1), ("e", 1, 0), ("w", -1, 0), ("ne", 1, -1), ("nw", -1, -1), ("se", 1, 1), ("sw", -1, 1))

DIRECTION_NAMES: tuple[str, ...] = tuple(name for name, _dx, _dz in DIRECTION_OFFSETS)

_VOID_DROP_DEPTH: int = -1


@runtime_checkable
class NeighborhoodProbe(Protocol):
  def standable(self, cell: tuple[int, int, int]) -> bool: ...

  def headroom_clear(self, cell: tuple[int, int, int]) -> bool: ...

  def passable(self, cell: tuple[int, int, int]) -> bool: ...

  def block_state(self, cell: tuple[int, int, int]) -> str | None: ...

  def can_place_against(self, anchor_cell: tuple[int, int, int], target_cell: tuple[int, int, int]) -> bool: ...

  def support_drop_depth(self, column_cell: tuple[int, int, int], max_depth: int) -> int: ...


@dataclass(frozen=True)
class DirectionProbe:
  direction: str
  standable_step: bool = False
  headroom_clear: bool = False
  blocked_by_wall: bool = False
  drop_depth: int = _VOID_DROP_DEPTH
  is_void: bool = True
  can_place_support: bool = False

  def to_dict(self) -> dict[str, Any]:
    return {
      "direction": str(self.direction),
      "standable_step": bool(self.standable_step),
      "headroom_clear": bool(self.headroom_clear),
      "blocked_by_wall": bool(self.blocked_by_wall),
      "drop_depth": int(self.drop_depth),
      "is_void": bool(self.is_void),
      "can_place_support": bool(self.can_place_support),
    }


@dataclass(frozen=True)
class AiObservation:
  actor_id: str = ""
  schema_version: int = OBSERVATION_SCHEMA_VERSION
  self_position: tuple[float, float, float] = (0.0, 0.0, 0.0)
  self_velocity: tuple[float, float, float] = (0.0, 0.0, 0.0)
  self_yaw_deg: float = 0.0
  self_pitch_deg: float = 0.0
  health: float = 20.0
  max_health: float = 20.0
  on_ground: bool = False
  jump_available: bool = False
  support_cell: tuple[int, int, int] | None = None
  self_footing_present: bool = False
  fall_risk: float = 0.0
  void_risk: float = 0.0
  visible_player: bool = False
  player_visible_position: tuple[float, float, float] | None = None
  player_last_known_position: tuple[float, float, float] | None = None
  player_velocity: tuple[float, float, float] | None = None
  player_health: float | None = None
  distance_to_player: float | None = None
  attack_in_range: bool = False
  attack_cooldown_ready: bool = False
  attack_cooldown_remaining_s: float = 0.0
  can_place_blocks: bool = False
  selected_block_id: str | None = None
  available_block_count: int = 0
  fence_gate_operable: bool = False
  nearby_hazards: tuple[tuple[int, int, int], ...] = ()
  visible_target_blocks: tuple[tuple[int, int, int], ...] = ()
  directions: dict[str, DirectionProbe] = field(default_factory=dict)
  route_present: bool = False
  route_blocked: bool = False
  route_target: tuple[float, float, float] | None = None
  low_health: bool = False
  low_health_in_threat: bool = False
  last_action: str | None = None
  last_action_success: bool | None = None
  last_damage_source: str | None = None
  last_death_reason: str | None = None

  def __post_init__(self) -> None:
    normalized: dict[str, DirectionProbe] = {}
    source = self.directions or {}
    for name in DIRECTION_NAMES:
      probe = source.get(name)
      normalized[name] = probe if isinstance(probe, DirectionProbe) else DirectionProbe(direction=name)
    object.__setattr__(self, "directions", normalized)

  def to_dict(self) -> dict[str, Any]:
    return {
      "schema_version": int(self.schema_version),
      "actor_id": str(self.actor_id),
      "self_position": [float(value) for value in self.self_position],
      "self_velocity": [float(value) for value in self.self_velocity],
      "self_yaw_deg": float(self.self_yaw_deg),
      "self_pitch_deg": float(self.self_pitch_deg),
      "health": float(self.health),
      "max_health": float(self.max_health),
      "on_ground": bool(self.on_ground),
      "jump_available": bool(self.jump_available),
      "support_cell": (None if self.support_cell is None else [int(value) for value in self.support_cell]),
      "self_footing_present": bool(self.self_footing_present),
      "fall_risk": float(self.fall_risk),
      "void_risk": float(self.void_risk),
      "visible_player": bool(self.visible_player),
      "player_visible_position": (None if self.player_visible_position is None else [float(value) for value in self.player_visible_position]),
      "player_last_known_position": (None if self.player_last_known_position is None else [float(value) for value in self.player_last_known_position]),
      "player_velocity": (None if self.player_velocity is None else [float(value) for value in self.player_velocity]),
      "player_health": (None if self.player_health is None else float(self.player_health)),
      "distance_to_player": (None if self.distance_to_player is None else float(self.distance_to_player)),
      "attack_in_range": bool(self.attack_in_range),
      "attack_cooldown_ready": bool(self.attack_cooldown_ready),
      "attack_cooldown_remaining_s": float(self.attack_cooldown_remaining_s),
      "can_place_blocks": bool(self.can_place_blocks),
      "selected_block_id": (None if self.selected_block_id is None else str(self.selected_block_id)),
      "available_block_count": int(self.available_block_count),
      "fence_gate_operable": bool(self.fence_gate_operable),
      "nearby_hazards": [[int(value) for value in cell] for cell in self.nearby_hazards],
      "visible_target_blocks": [[int(value) for value in cell] for cell in self.visible_target_blocks],
      "directions": {name: probe.to_dict() for name, probe in self.directions.items()},
      "route_present": bool(self.route_present),
      "route_blocked": bool(self.route_blocked),
      "route_target": (None if self.route_target is None else [float(value) for value in self.route_target]),
      "low_health": bool(self.low_health),
      "low_health_in_threat": bool(self.low_health_in_threat),
      "last_action": (None if self.last_action is None else str(self.last_action)),
      "last_action_success": (None if self.last_action_success is None else bool(self.last_action_success)),
      "last_damage_source": (None if self.last_damage_source is None else str(self.last_damage_source)),
      "last_death_reason": (None if self.last_death_reason is None else str(self.last_death_reason)),
    }


def _probe_direction(probe: NeighborhoodProbe, *, support_cell: tuple[int, int, int], dx: int, dz: int, name: str, max_drop: int) -> DirectionProbe:
  base_x, base_y, base_z = (int(support_cell[0]), int(support_cell[1]), int(support_cell[2]))
  forward_cell = (int(base_x) + int(dx), int(base_y), int(base_z) + int(dz))
  body_blocked = not bool(probe.passable((int(forward_cell[0]), int(forward_cell[1]) + 1, int(forward_cell[2]))))
  standable_step = False
  headroom_clear = False
  for dy in (0, 1, -1):
    candidate = (int(base_x) + int(dx), int(base_y) + int(dy), int(base_z) + int(dz))
    if bool(probe.standable(candidate)) and bool(probe.headroom_clear(candidate)):
      standable_step = True
      headroom_clear = True
      break
  drop_depth = int(probe.support_drop_depth(forward_cell, int(max_drop)))
  is_void = bool(int(drop_depth) < 0) and (not bool(standable_step))
  can_place_support = bool(probe.can_place_against(support_cell, forward_cell))
  return DirectionProbe(
    direction=str(name),
    standable_step=bool(standable_step),
    headroom_clear=bool(headroom_clear),
    blocked_by_wall=bool(body_blocked),
    drop_depth=int(drop_depth),
    is_void=bool(is_void),
    can_place_support=bool(can_place_support),
  )


def build_neighborhood(probe: NeighborhoodProbe, *, support_cell: tuple[int, int, int], max_drop: int = 3) -> dict[str, DirectionProbe]:
  base = tuple(int(value) for value in support_cell)
  return {name: _probe_direction(probe, support_cell=base, dx=int(dx), dz=int(dz), name=str(name), max_drop=int(max_drop)) for name, dx, dz in DIRECTION_OFFSETS}
