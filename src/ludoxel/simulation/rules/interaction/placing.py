# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.rules.interaction.outcomes import INTERACTION_ACTION_PLACE, InteractionOutcome
from ludoxel.simulation.rules.picking.block import BlockPick


def apply_place_state_for_service(service, *, cell: tuple[int, int, int], place_state: str) -> InteractionOutcome:
  px, py, pz = (int(cell[0]), int(cell[1]), int(cell[2]))

  if service.placement_policy.placement_intersects_player(player=service.player, world=service.world, px=int(px), py=int(py), pz=int(pz), place_state=str(place_state)):
    return InteractionOutcome(success=False)

  service._commit_world_edit(updates={(int(px), int(py), int(pz)): str(place_state)})
  return InteractionOutcome(success=True, action=INTERACTION_ACTION_PLACE, target_block_state=str(place_state), target_position=(int(px), int(py), int(pz)))


def has_selected_placeable_block_for_service(service, block_id: str) -> bool:
  bid = str(block_id).strip()
  if not bid:
    return False
  return service.block_registry.get(str(bid)) is not None


def place_from_hit_for_service(service, *, hit: BlockPick, block_id: str | None) -> InteractionOutcome:
  bid = "" if block_id is None else str(block_id).strip()
  if not has_selected_placeable_block_for_service(service, str(bid)):
    return InteractionOutcome(success=False)

  hx, hy, hz = hit.hit
  hit_cell = (int(hx), int(hy), int(hz))
  hit_state = service.world.blocks.get(hit_cell)

  if hit_state is not None:
    merge_hit_state = service.placement_policy.resolve_slab_merge_state_from_hit(existing_state=str(hit_state), block_id=str(bid), hit_face=int(hit.face))
    if merge_hit_state is not None:
      return apply_place_state_for_service(service, cell=hit_cell, place_state=str(merge_hit_state))

  if hit_state is None:
    return InteractionOutcome(success=False)

  if hit.place is None:
    return InteractionOutcome(success=False)

  px, py, pz = hit.place
  place_cell = (int(px), int(py), int(pz))
  existing_place_state = service.world.blocks.get(place_cell)

  if existing_place_state is not None:
    merge_place_state = service.placement_policy.resolve_slab_merge_state(existing_state=str(existing_place_state), block_id=str(bid), hit_face=int(hit.face), hit_point=hit.hit_point)
    if merge_place_state is None:
      return InteractionOutcome(success=False)

    return apply_place_state_for_service(service, cell=place_cell, place_state=str(merge_place_state))

  place_state = service.placement_policy.resolve_place_state(player=service.player, block_id=str(bid), hit_face=int(hit.face), hit_point=hit.hit_point)
  if place_state is None:
    return InteractionOutcome(success=False)

  return apply_place_state_for_service(service, cell=place_cell, place_state=str(place_state))


def place_block_for_service(service, block_id: str | None, reach: float = 5.0, *, crouching: bool = False, origin: Vec3 | None = None, direction: Vec3 | None = None) -> InteractionOutcome:
  hit = service.pick_block(reach=float(reach), origin=origin, direction=direction)
  if hit is None:
    return InteractionOutcome(success=False)

  if bool(crouching):
    return place_from_hit_for_service(service, hit=hit, block_id=block_id)

  interact_outcome = service.interact_block_at_hit(hit.hit)
  if bool(interact_outcome.success):
    return interact_outcome

  return place_from_hit_for_service(service, hit=hit, block_id=block_id)
