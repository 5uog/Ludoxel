# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.presentation.rendering.visuals.players.first_person_motion import FirstPersonMotionSample
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.presentation.rendering.visuals.players.render_state_composer import compose_player_render_state_from_parts
from ludoxel.simulation.actors.ai_players.runtime import AiPlayerRenderSnapshot
from ludoxel.simulation.actors.player.kinematics import build_player_model_snapshot
from ludoxel.simulation.blocks.registries.block import BlockRegistry


def compose_ai_player_render_states(snapshots: tuple[AiPlayerRenderSnapshot, ...], *, block_registry: BlockRegistry, walk_speed: float) -> tuple[PlayerRenderState, ...]:
  states: list[PlayerRenderState] = []
  for snapshot in snapshots:
    player_model = build_player_model_snapshot(player=snapshot.player, motion=snapshot.motion, walk_speed=float(walk_speed), is_first_person_view=False)
    held_item_id = None if snapshot.held_item_id is None else str(snapshot.held_item_id)
    motion = FirstPersonMotionSample(
      visible_item_id=held_item_id,
      target_item_id=held_item_id,
      equip_progress=1.0,
      prev_equip_progress=1.0,
      swing_progress=float(snapshot.attack_swing_progress),
      prev_swing_progress=float(snapshot.attack_prev_swing_progress),
      show_arm=bool(held_item_id is None),
      show_view_model=False,
      slim_arm=True,
    )
    states.append(compose_player_render_state_from_parts(player_model=player_model, motion=motion, block_registry=block_registry, arm_rotation_limit_min_deg=-180.0, arm_rotation_limit_max_deg=180.0))
  return tuple(states)
