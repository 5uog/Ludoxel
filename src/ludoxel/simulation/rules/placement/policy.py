# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import format_state, parse_state
from ludoxel.simulation.blocks.states.values import slab_type_value
from ludoxel.simulation.blocks.structures.axis_orientation import AXIS_STATE_KEY, axis_from_hit_face, is_axis_orientable
from ludoxel.simulation.blocks.structures.cardinal import cardinal_from_xz
from ludoxel.simulation.blocks.structures.connectivity import make_fence_gate_state, make_wall_state
from ludoxel.simulation.blocks.structures.structural_rules import is_fence_gate, is_slab, is_stairs, is_wall
from ludoxel.simulation.rules.placement.support import choose_half_type, placement_intersects_player, resolve_same_slab_merge_state
from ludoxel.simulation.worlds.state.world import WorldState


@dataclass(frozen=True)
class PlacementPolicy:
  block_registry: BlockRegistry

  def _player_cardinal(self, player: PlayerEntity) -> str:
    f = player.view_forward()
    return cardinal_from_xz(float(f.x), float(f.z), default="south")

  @staticmethod
  def _choose_half_type(hit_face: int, hit_point: Vec3) -> str:
    return choose_half_type(int(hit_face), hit_point)

  def _try_merge_same_slab(self, *, existing_state: str, block_id: str, desired_type: str) -> str | None:
    return resolve_same_slab_merge_state(block_registry=self.block_registry, existing_state=str(existing_state), block_id=str(block_id), desired_type=str(desired_type))

  def resolve_slab_merge_state(self, *, existing_state: str, block_id: str, hit_face: int, hit_point: Vec3) -> str | None:
    desired_type = self._choose_half_type(int(hit_face), hit_point)
    return self._try_merge_same_slab(existing_state=str(existing_state), block_id=str(block_id), desired_type=str(desired_type))

  def resolve_slab_merge_state_from_hit(self, *, existing_state: str, block_id: str, hit_face: int) -> str | None:
    face = int(hit_face)

    if face == 2:
      desired_type = "top"
    elif face == 3:
      desired_type = "bottom"
    else:
      return None

    return self._try_merge_same_slab(existing_state=str(existing_state), block_id=str(block_id), desired_type=str(desired_type))

  def resolve_place_state(self, *, player: PlayerEntity, block_id: str, hit_face: int, hit_point: Vec3, inherit_state: str | None = None) -> str | None:
    base_sel = str(block_id)
    defn = self.block_registry.get(base_sel)
    if defn is None:
      return None

    inherit_base: str | None = None
    inherit_props: dict[str, str] = {}
    if inherit_state is not None:
      inherit_base, inherit_props = parse_state(str(inherit_state))

    props: dict[str, str] = {}

    if is_slab(defn):
      inherited_type: str | None = None
      if str(inherit_base) == base_sel:
        candidate = slab_type_value(inherit_props)
        if candidate in ("bottom", "top"):
          inherited_type = candidate
      props["type"] = inherited_type if inherited_type is not None else self._choose_half_type(int(hit_face), hit_point)
      return format_state(base_sel, props)

    if is_stairs(defn):
      if str(inherit_base) == base_sel:
        inherited_facing = str(inherit_props.get("facing", "")).strip()
        inherited_half = str(inherit_props.get("half", "")).strip()
        props["facing"] = inherited_facing if inherited_facing in ("north", "east", "south", "west") else self._player_cardinal(player)
        props["half"] = inherited_half if inherited_half in ("bottom", "top") else self._choose_half_type(int(hit_face), hit_point)
      else:
        props["facing"] = self._player_cardinal(player)
        props["half"] = self._choose_half_type(int(hit_face), hit_point)
      return format_state(base_sel, props)

    if is_fence_gate(defn):
      return make_fence_gate_state(base_sel, self._player_cardinal(player), open_state=False)

    if is_wall(defn):
      return make_wall_state(base_sel, waterlogged=False)

    if is_axis_orientable(defn):
      inherited_axis: str | None = None
      if str(inherit_base) == base_sel:
        candidate = str(inherit_props.get(AXIS_STATE_KEY, "")).strip().lower()
        if candidate in ("x", "y", "z"):
          inherited_axis = candidate
      props[AXIS_STATE_KEY] = inherited_axis if inherited_axis is not None else axis_from_hit_face(int(hit_face))
      return format_state(base_sel, props)

    return format_state(base_sel, props)

  def placement_intersects_player(self, *, player: PlayerEntity, world: WorldState, px: int, py: int, pz: int, place_state: str) -> bool:
    return placement_intersects_player(block_registry=self.block_registry, player=player, world=world, px=int(px), py=int(py), pz=int(pz), place_state=str(place_state))
