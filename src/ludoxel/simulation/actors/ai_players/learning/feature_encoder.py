# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.actors.ai_players.learning.action_mask import _resolve_world_direction
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation, DirectionProbe

FEATURE_ENCODER_VERSION: int = 1

FEATURE_HEALTH_LOW: str = "health:low"
FEATURE_HEALTH_CRITICAL: str = "health:critical"
FEATURE_PLAYER_NEAR: str = "player:near"
FEATURE_PLAYER_MID: str = "player:mid"
FEATURE_PLAYER_FAR: str = "player:far"
FEATURE_PLAYER_VISIBLE: str = "player:visible"
FEATURE_PLAYER_LAST_KNOWN_ONLY: str = "player:last_known_only"
FEATURE_COMBAT_COOLDOWN_READY: str = "combat:cooldown_ready"
FEATURE_COMBAT_COOLDOWN_BLOCKED: str = "combat:cooldown_blocked"
FEATURE_COMBAT_IN_RANGE: str = "combat:in_range"
FEATURE_ROUTE_BLOCKED: str = "route:blocked"
FEATURE_ROUTE_LOST: str = "route:lost"
FEATURE_ROUTE_AVAILABLE: str = "route:available"
FEATURE_HAZARD_VOID_AHEAD: str = "hazard:void_ahead"
FEATURE_HAZARD_DEEP_DROP_AHEAD: str = "hazard:deep_drop_ahead"
FEATURE_TERRAIN_ENCLOSED: str = "terrain:enclosed"
FEATURE_TERRAIN_BRIDGE_NEEDED: str = "terrain:bridge_needed"
FEATURE_TERRAIN_JUMP_NEEDED: str = "terrain:jump_needed"
FEATURE_TERRAIN_FENCE_GATE_CLOSED: str = "terrain:fence_gate_closed"
FEATURE_PLACEMENT_CAN_PLACE_BRIDGE: str = "placement:can_place_bridge"
FEATURE_PLACEMENT_CAN_PLACE_DEFENSE: str = "placement:can_place_defense"
FEATURE_BREAKING_CAN_BREAK_ESCAPE: str = "breaking:can_break_escape"
FEATURE_STUCK_RECENTLY_STUCK: str = "stuck:recently_stuck"

FEATURE_KEYS: tuple[str, ...] = (
  FEATURE_HEALTH_LOW,
  FEATURE_HEALTH_CRITICAL,
  FEATURE_PLAYER_NEAR,
  FEATURE_PLAYER_MID,
  FEATURE_PLAYER_FAR,
  FEATURE_PLAYER_VISIBLE,
  FEATURE_PLAYER_LAST_KNOWN_ONLY,
  FEATURE_COMBAT_COOLDOWN_READY,
  FEATURE_COMBAT_COOLDOWN_BLOCKED,
  FEATURE_COMBAT_IN_RANGE,
  FEATURE_ROUTE_BLOCKED,
  FEATURE_ROUTE_LOST,
  FEATURE_ROUTE_AVAILABLE,
  FEATURE_HAZARD_VOID_AHEAD,
  FEATURE_HAZARD_DEEP_DROP_AHEAD,
  FEATURE_TERRAIN_ENCLOSED,
  FEATURE_TERRAIN_BRIDGE_NEEDED,
  FEATURE_TERRAIN_JUMP_NEEDED,
  FEATURE_TERRAIN_FENCE_GATE_CLOSED,
  FEATURE_PLACEMENT_CAN_PLACE_BRIDGE,
  FEATURE_PLACEMENT_CAN_PLACE_DEFENSE,
  FEATURE_BREAKING_CAN_BREAK_ESCAPE,
  FEATURE_STUCK_RECENTLY_STUCK,
)

_FEATURE_KEY_SET: frozenset[str] = frozenset(FEATURE_KEYS)

_HEALTH_LOW_FRACTION: float = 0.35
_HEALTH_CRITICAL_FRACTION: float = 0.15
_PLAYER_NEAR_BLOCKS: float = 3.0
_PLAYER_MID_BLOCKS: float = 7.0
_DEEP_DROP_BLOCKS: int = 3


def is_feature_key(key: object) -> bool:
  """
  与えた値が既知の feature key であるかを判定する。
  入力は任意 object を許容し、文字列化した値が FEATURE_KEYS に含まれる場合に限り真を返す。trainer と policy は学習・適用時に未知 key を排除するため本述語を共有する。
  """
  return str(key) in _FEATURE_KEY_SET


def _forward_direction_probe(observation: AiObservation) -> DirectionProbe | None:
  """
  AI の現在 yaw に最も近い world 水平方向の方向標本を返す。
  前進入力 (move_f=1, move_s=0) と yaw から world 方向名を解決し、対応する DirectionProbe を返す。方向が縮退する場合は None を返し、前方依存の feature は付与しない。
  """
  name = _resolve_world_direction(move_f=1.0, move_s=0.0, yaw_deg=float(observation.self_yaw_deg))
  if name is None:
    return None
  return observation.directions.get(str(name))


def encode_features(observation: AiObservation) -> tuple[str, ...]:
  """
  observation を、policy が条件付けに用いる安定した feature key の列へ変換する。
  本符号化は学習と適用の双方で同一でなければならず、FEATURE_ENCODER_VERSION で版を識別する。体力は max_health に対する割合で low(35%以下)と critical(15%以下)を、player は最後に観測した距離で near(3 以下)・mid(7 以下)・far、及び現在視認(visible)か最後の既知位置のみ(last_known_only)かを付与する。combat は cooldown の可否と射程内、route は閉塞・喪失・利用可能、hazard は前方標本に基づく奈落と深い落差、terrain は周囲閉塞・橋掛け必要・跳躍必要・閉じたフェンスゲート、placement は橋と防御の配置可否、breaking は脱出のための破壊可否、stuck は直近の行き詰まりを付与する。前方依存 feature は yaw 最寄り方向の標本から導く。返値は重複の無い feature key の tuple であり、未知 key を含まない。
  """
  features: list[str] = []
  max_health = max(1e-6, float(observation.max_health))
  health_fraction = float(observation.health) / float(max_health)
  if float(observation.health) <= float(max_health) * float(_HEALTH_CRITICAL_FRACTION) or bool(observation.low_health) and float(health_fraction) <= float(_HEALTH_CRITICAL_FRACTION):
    features.append(FEATURE_HEALTH_CRITICAL)
  if float(observation.health) <= float(max_health) * float(_HEALTH_LOW_FRACTION) or bool(observation.low_health):
    features.append(FEATURE_HEALTH_LOW)

  distance = observation.distance_to_player
  if distance is not None:
    if float(distance) <= float(_PLAYER_NEAR_BLOCKS):
      features.append(FEATURE_PLAYER_NEAR)
    elif float(distance) <= float(_PLAYER_MID_BLOCKS):
      features.append(FEATURE_PLAYER_MID)
    else:
      features.append(FEATURE_PLAYER_FAR)
  if bool(observation.visible_player):
    features.append(FEATURE_PLAYER_VISIBLE)
  elif observation.player_last_known_position is not None:
    features.append(FEATURE_PLAYER_LAST_KNOWN_ONLY)

  if bool(observation.attack_cooldown_ready):
    features.append(FEATURE_COMBAT_COOLDOWN_READY)
  else:
    features.append(FEATURE_COMBAT_COOLDOWN_BLOCKED)
  if bool(observation.attack_in_range):
    features.append(FEATURE_COMBAT_IN_RANGE)

  if bool(observation.route_present):
    if bool(observation.route_blocked):
      features.append(FEATURE_ROUTE_BLOCKED)
    else:
      features.append(FEATURE_ROUTE_AVAILABLE)
  elif observation.route_target is not None:
    features.append(FEATURE_ROUTE_LOST)

  forward = _forward_direction_probe(observation)
  if forward is not None:
    if bool(forward.is_void):
      features.append(FEATURE_HAZARD_VOID_AHEAD)
    elif int(forward.drop_depth) >= int(_DEEP_DROP_BLOCKS):
      features.append(FEATURE_HAZARD_DEEP_DROP_AHEAD)
    if (not bool(forward.standable_step)) and bool(forward.can_place_support):
      features.append(FEATURE_TERRAIN_BRIDGE_NEEDED)
    if bool(forward.blocked_by_wall) and not bool(forward.standable_step):
      features.append(FEATURE_TERRAIN_JUMP_NEEDED)

  enclosed = sum(1 for probe in observation.directions.values() if not bool(probe.standable_step)) >= 6
  if bool(enclosed):
    features.append(FEATURE_TERRAIN_ENCLOSED)
  if bool(observation.fence_gate_operable):
    features.append(FEATURE_TERRAIN_FENCE_GATE_CLOSED)

  can_place = bool(observation.can_place_blocks) and int(observation.available_block_count) > 0
  if bool(can_place) and any(bool(probe.can_place_support) for probe in observation.directions.values()):
    features.append(FEATURE_PLACEMENT_CAN_PLACE_BRIDGE)
  if bool(can_place) and bool(observation.visible_player):
    features.append(FEATURE_PLACEMENT_CAN_PLACE_DEFENSE)
  if len(observation.visible_target_blocks) > 0:
    features.append(FEATURE_BREAKING_CAN_BREAK_ESCAPE)

  if str(observation.last_damage_source) == "stuck" or str(observation.last_action) == "replan_route" and bool(observation.route_blocked):
    features.append(FEATURE_STUCK_RECENTLY_STUCK)

  seen: set[str] = set()
  ordered: list[str] = []
  for feature in features:
    if feature in _FEATURE_KEY_SET and feature not in seen:
      seen.add(feature)
      ordered.append(feature)
  return tuple(ordered)
