# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.structures.connectivity import collect_structural_neighbor_updates
from ludoxel.simulation.rules.interaction.breaking import break_block_for_service
from ludoxel.simulation.rules.interaction.outcomes import InteractionOutcome
from ludoxel.simulation.rules.interaction.placing import apply_place_state_for_service, has_selected_placeable_block_for_service, place_block_for_service, place_from_hit_for_service
from ludoxel.simulation.rules.interaction.toggles import interact_block_at_hit_for_service, player_intersects_state_for_service, toggle_fence_gate_if_hit_for_service
from ludoxel.simulation.rules.picking.block import BlockPick, pick_block
from ludoxel.simulation.rules.placement.policy import PlacementPolicy
from ludoxel.simulation.worlds.state.world import WorldState


@dataclass
class InteractionService:
  world: WorldState
  player: PlayerEntity
  block_registry: BlockRegistry
  placement_policy: PlacementPolicy = field(init=False, repr=False)

  def __post_init__(self) -> None:
    self.placement_policy = PlacementPolicy(block_registry=self.block_registry)

  @classmethod
  def create(cls, *, world: WorldState, player: PlayerEntity, block_registry: BlockRegistry) -> "InteractionService":
    return cls(world=world, player=player, block_registry=block_registry)

  def pick_block(self, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None) -> BlockPick | None:
    return self._pick_target(reach=float(reach), origin=origin, direction=direction)

  def _pick_target(self, reach: float, *, origin: Vec3 | None = None, direction: Vec3 | None = None) -> BlockPick | None:
    eye = self.player.eye_pos() if origin is None else origin
    direction = self.player.view_forward() if direction is None else direction
    return pick_block(self.world, origin=eye, direction=direction, reach=float(reach), block_registry=self.block_registry)

  def _commit_world_edit(self, *, updates: dict[tuple[int, int, int], str] | None = None, removals: tuple[tuple[int, int, int], ...] = ()) -> None:
    normalized_updates = {(int(k[0]), int(k[1]), int(k[2])): str(v) for k, v in (updates or {}).items()}
    normalized_removals = tuple((int(k[0]), int(k[1]), int(k[2])) for k in removals)
    touched = set(normalized_updates.keys()) | set(normalized_removals)
    if not touched:
      return

    structural_updates = collect_structural_neighbor_updates(self.world, touched, block_registry=self.block_registry, overlay_updates=normalized_updates, overlay_removals=normalized_removals)
    final_updates = dict(normalized_updates)
    final_updates.update(structural_updates)
    self.world.set_blocks_bulk(updates=final_updates, removals=normalized_removals)

  def break_block(self, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None) -> InteractionOutcome:
    return break_block_for_service(self, reach=float(reach), origin=origin, direction=direction)

  def _player_intersects_state(self, *, cell: tuple[int, int, int], state_str: str) -> bool:
    return player_intersects_state_for_service(self, cell=cell, state_str=str(state_str))

  def _toggle_fence_gate_if_hit(self, hit_cell: tuple[int, int, int]) -> InteractionOutcome:
    return toggle_fence_gate_if_hit_for_service(self, hit_cell)

  def interact_block_at_hit(self, hit_cell: tuple[int, int, int]) -> InteractionOutcome:
    return interact_block_at_hit_for_service(self, hit_cell)

  def _apply_place_state(self, *, cell: tuple[int, int, int], place_state: str) -> InteractionOutcome:
    return apply_place_state_for_service(self, cell=cell, place_state=str(place_state))

  def _has_selected_placeable_block(self, block_id: str) -> bool:
    return has_selected_placeable_block_for_service(self, str(block_id))

  def _place_from_hit(self, *, hit: BlockPick, block_id: str | None, forced_place_state: str | None = None, inherit_state: str | None = None) -> InteractionOutcome:
    return place_from_hit_for_service(self, hit=hit, block_id=block_id, forced_place_state=forced_place_state, inherit_state=inherit_state)

  def place_block_from_hit(self, hit: BlockPick, block_id: str | None, *, forced_place_state: str | None = None, inherit_state: str | None = None) -> InteractionOutcome:
    return self._place_from_hit(hit=hit, block_id=block_id, forced_place_state=forced_place_state, inherit_state=inherit_state)

  def place_block(self, block_id: str | None, reach: float = 5.0, *, crouching: bool = False, origin: Vec3 | None = None, direction: Vec3 | None = None) -> InteractionOutcome:
    return place_block_for_service(self, block_id=block_id, reach=float(reach), crouching=bool(crouching), origin=origin, direction=direction)
