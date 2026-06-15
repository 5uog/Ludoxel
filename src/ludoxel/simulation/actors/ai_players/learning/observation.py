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
  """
  observation 構築時に AI 周辺の足場・通行性・配置可否を、実際の block model 規則の下で標本化するための probe 契約を表す Protocol である。
  本 Protocol の各述語は、full block を仮定した単純化ではなく、半 block、階段、フェンス、フェンスゲート、壁、及び 0.5 + 0.5 の積み重ねによる隙間と開閉状態を含む実 block 形状規則の結果を返さなければならない。simulation の collision、support、placement、breaking、passability 規則を所有する上位処理が本契約を実装し、observation builder はその結果だけを参照する。これにより learning 層は形状規則を再実装せず、action mask と policy は実規則と整合した観測値の上で判断する。
  座標は world 整数 cell (x, y, z) を単位とし、support_cell は AI の足元 cell(立っている block の cell)を指す。
  """

  def standable(self, cell: tuple[int, int, int]) -> bool:
    """
    指定 support cell の上に AI が立てるか(上面が完全な足場で、頭上が body 高さ分空いているか)を実形状規則で判定する。
    返値は当該 cell が足場として有効である場合に真であり、半 block や階段の上面、フェンス上などの可否は実規則に従う。
    """
    ...

  def headroom_clear(self, cell: tuple[int, int, int]) -> bool:
    """
    指定 support cell の直上 body 区間(支持 y+1 と y+2)が AI の通過に十分空いているかを判定する。
    返値は頭上が衝突なく通過可能な場合に真であり、フェンスゲートの開閉状態を含む実形状規則に従う。
    """
    ...

  def passable(self, cell: tuple[int, int, int]) -> bool:
    """
    指定 cell が AI body の一部として進入可能(衝突を生じない)かを判定する。
    返値は空気、又は通過可能な形状(開いたフェンスゲート等)である場合に真であり、閉じた遮断物では偽となる。
    """
    ...

  def block_state(self, cell: tuple[int, int, int]) -> str | None:
    """
    指定 cell の block state 文字列を返し、block が無い場合は None を返す。
    返値は observation の周辺 block 標本に用い、None は当該 cell が空であることを意味する。
    """
    ...

  def can_place_against(self, anchor_cell: tuple[int, int, int], target_cell: tuple[int, int, int]) -> bool:
    """
    既存 block の anchor_cell に対して target_cell へ支持 block を配置できるかを実 placement 規則で判定する。
    返値は anchor が実在し、target が空で頭上が空いており、配置が collision 上許容される場合に真であり、自己埋没や非配置面への配置は偽となる。
    """
    ...

  def support_drop_depth(self, column_cell: tuple[int, int, int], max_depth: int) -> int:
    """
    指定列 (x, z) について、support y から下方へ最大 max_depth 段までに最初に現れる足場までの落差段数を返す。
    返値は 0 が同段の足場、正値が当該段数だけ下の足場、-1 が max_depth 以内に足場が無い(奈落又は危険な深さ)ことを意味し、edge safety 判定の基礎値となる。
    """
    ...


@dataclass(frozen=True)
class DirectionProbe:
  """
  AI 足元 cell を基準とした特定水平方向への一歩遷移の安全標本を表す。
  standable_step は ±1 段以内の隣接足場へ歩行遷移できるか、headroom_clear は遷移先頭上が空いているか、blocked_by_wall は body 高さに遮断があり前進が止まるか、drop_depth は同方向の落差段数(0 は平坦、正値は下り段数、-1 は奈落)、is_void は max_depth 以内に足場が無いか、can_place_support はその方向へ支持 block を配置して足場を作れるかを表す。本標本はすべて NeighborhoodProbe の実形状規則から導出され、action mask は full block 仮定ではなくこの標本を用いて移動・配置の安全性を判断する。
  """

  direction: str
  standable_step: bool = False
  headroom_clear: bool = False
  blocked_by_wall: bool = False
  drop_depth: int = _VOID_DROP_DEPTH
  is_void: bool = True
  can_place_support: bool = False

  def to_dict(self) -> dict[str, Any]:
    """
    方向標本を JSON 直列化可能な mapping へ変換する。
    返値は direction、standable_step、headroom_clear、blocked_by_wall、drop_depth、is_void、can_place_support を含み、dataset 記録と policy 入力の双方が同一形式で参照できる。
    """
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
  """
  AI が判断に用いてよい観測値だけを保持する domain observation を表す。
  本 observation は world 全体の真値を透視的に与えるものではなく、AI が実際に知り得る情報のみを保持する。player については visible_player が真の時だけ player_visible_position、player_velocity、player_health を有効値とし、視認できない場合は player_last_known_position と distance_to_player(最後に観測した位置に基づく)だけを保持する。これにより policy は player 状態を常時透視で利用できない。
  自己状態は self_position、self_velocity、self_yaw_deg、self_pitch_deg、health、max_health、on_ground、jump_available、support_cell、self_footing_present を保持する。危険性は fall_risk と void_risk(いずれも 0 以上 1 以下)で表し、nearby_hazards は穴・縁などの危険 cell、visible_target_blocks は配置・破壊の対象候補 cell を保持する。directions は DIRECTION_NAMES を key とする 8 方向の DirectionProbe であり、移動安全の基礎標本となる。combat 関連は attack_in_range、attack_cooldown_ready、attack_cooldown_remaining_s、配置関連は can_place_blocks、selected_block_id、available_block_count、fence_gate_operable を保持する。route 関連は route_present、route_blocked、route_target を保持する。low_health は体力が閾値以下か、low_health_in_threat は加えて player の攻撃圏内に留まっているかを表す。last_action、last_action_success、last_damage_source、last_death_reason は直近の行動結果と被害・死亡要因を保持する。
  本 dataclass は frozen かつ JSON 直列化可能であり、schema_version により形式版を識別する。directions は構築時に DIRECTION_NAMES 全てを含むよう正規化される。
  """

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
    """
    directions が DIRECTION_NAMES の全方向を含むよう正規化し、欠落方向には奈落既定の DirectionProbe を補う。
    frozen dataclass であるため object.__setattr__ を介して正規化済み mapping を確定し、action mask と policy が常に 8 方向の標本を前提にできるようにする。既存の標本は方向名をそのまま保持する。
    """
    normalized: dict[str, DirectionProbe] = {}
    source = self.directions or {}
    for name in DIRECTION_NAMES:
      probe = source.get(name)
      normalized[name] = probe if isinstance(probe, DirectionProbe) else DirectionProbe(direction=name)
    object.__setattr__(self, "directions", normalized)

  def to_dict(self) -> dict[str, Any]:
    """
    observation を JSON 直列化可能な mapping へ変換する。
    座標 tuple は list として埋め込み、None は欠落値として保持する。directions は方向名から方向標本 mapping への入れ子 mapping として直列化する。返値は demonstration 記録、policy 入力、評価 log が共有する安定形式である。
    """
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
  """
  単一水平方向 (dx, dz) について DirectionProbe を構築する。
  まず ±1 段の隣接足場への歩行遷移可否を standable と headroom_clear で確かめ、body 高さの遮断(壁)を passable で判定する。歩行遷移が無い場合は support_drop_depth により落差段数を求め、max_drop 以内に足場が無ければ is_void を真とする。配置可否は anchor を現在足元、target を同段前方 cell として can_place_against で判定する。全述語は実形状規則に従うため、半 block・階段・フェンス・フェンスゲートを含む地形でも full block 仮定に陥らない。
  """
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
  """
  足元 cell を基準に DIRECTION_OFFSETS の 8 方向すべての DirectionProbe を構築して mapping で返す。
  max_drop は安全とみなす最大落差段数であり、Free Roam と PVP の落下無被害段数 3 を既定とする。各方向標本は実形状規則を所有する probe を介して導出されるため、返値は action mask と policy が full block 仮定なしに移動安全を判断する基礎となる。
  """
  base = tuple(int(value) for value in support_cell)
  return {name: _probe_direction(probe, support_cell=base, dx=int(dx), dz=int(dz), name=str(name), max_drop=int(max_drop)) for name, dx, dz in DIRECTION_OFFSETS}
