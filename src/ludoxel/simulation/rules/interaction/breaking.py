# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.rules.interaction.outcomes import INTERACTION_ACTION_BREAK, InteractionOutcome


def break_block_for_service(service, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None) -> InteractionOutcome:
  hit = service._pick_target(reach=float(reach), origin=origin, direction=direction)
  if hit is None:
    return InteractionOutcome(success=False)

  hx, hy, hz = hit.hit
  previous_state = service.world.blocks.get((int(hx), int(hy), int(hz)))
  if previous_state is None:
    return InteractionOutcome(success=False)

  service._commit_world_edit(removals=((int(hx), int(hy), int(hz)),))
  return InteractionOutcome(success=True, action=INTERACTION_ACTION_BREAK, target_block_state=str(previous_state), target_position=(int(hx), int(hy), int(hz)))
