# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.blocks.models.api import collision_aabbs_for_block
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.blocks.states.values import prop_as_bool
from ludoxel.simulation.blocks.structures.cardinal import facing_vec_xz, normalize_cardinal, opposite_cardinal
from ludoxel.simulation.blocks.structures.connectivity import canonical_fence_gate_state, make_fence_gate_state
from ludoxel.simulation.blocks.structures.structural_rules import is_fence_gate
from ludoxel.simulation.rules.interaction.outcomes import INTERACTION_ACTION_INTERACT, InteractionOutcome


def player_intersects_state_for_service(service, *, cell: tuple[int, int, int], state_str: str) -> bool:
  px, py, pz = (int(cell[0]), int(cell[1]), int(cell[2]))
  player_aabb = service.player.aabb_at(service.player.position)

  def get_state(x: int, y: int, z: int) -> str | None:
    key = (int(x), int(y), int(z))
    if key == (int(px), int(py), int(pz)):
      return str(state_str)
    return service.world.blocks.get(key)

  for box in collision_aabbs_for_block(str(state_str), get_state, service.block_registry.get, int(px), int(py), int(pz)):
    if player_aabb.intersects(box):
      return True
  return False


def toggle_fence_gate_if_hit_for_service(service, hit_cell: tuple[int, int, int]) -> InteractionOutcome:
  k = (int(hit_cell[0]), int(hit_cell[1]), int(hit_cell[2]))
  st = service.world.blocks.get(k)
  if st is None:
    return InteractionOutcome(success=False)

  base, props = parse_state(st)
  d = service.block_registry.get(str(base))
  if d is None or (not is_fence_gate(d)):
    return InteractionOutcome(success=False)

  is_open = prop_as_bool(props, "open", False)
  facing = normalize_cardinal(str(props.get("facing", "south")), default="south")
  powered = prop_as_bool(props, "powered", False)
  waterlogged = prop_as_bool(props, "waterlogged", False)
  in_wall = prop_as_bool(props, "in_wall", False)

  next_open = not bool(is_open)
  next_facing = str(facing)

  if bool(next_open):
    px = float(service.player.position.x)
    pz = float(service.player.position.z)
    cx = float(k[0]) + 0.5
    cz = float(k[2]) + 0.5
    dx = px - cx
    dz = pz - cz

    fx, fz = facing_vec_xz(str(facing))
    dot = float(dx) * float(fx) + float(dz) * float(fz)

    if dot > 1e-9:
      next_facing = opposite_cardinal(str(facing))

  nxt = canonical_fence_gate_state(service.world, int(k[0]), int(k[1]), int(k[2]), block_registry=service.block_registry, facing_override=str(next_facing), open_override=bool(next_open))

  if nxt is None:
    nxt = make_fence_gate_state(str(base), str(next_facing), open_state=bool(next_open), powered=bool(powered), in_wall=bool(in_wall), waterlogged=bool(waterlogged))

  service._commit_world_edit(updates={k: str(nxt)})

  if bool(next_open):
    if service.player.fence_gate_overlap_exemption == k:
      service.player.fence_gate_overlap_exemption = None
  elif player_intersects_state_for_service(service, cell=k, state_str=str(nxt)):
    service.player.fence_gate_overlap_exemption = k
  elif service.player.fence_gate_overlap_exemption == k:
    service.player.fence_gate_overlap_exemption = None

  return InteractionOutcome(success=True, action=INTERACTION_ACTION_INTERACT, target_block_state=str(nxt), target_position=(int(k[0]), int(k[1]), int(k[2])))


def interact_block_at_hit_for_service(service, hit_cell: tuple[int, int, int]) -> InteractionOutcome:
  return toggle_fence_gate_if_hit_for_service(service, hit_cell)
