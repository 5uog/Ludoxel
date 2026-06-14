# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.sessions.pipelines.render_snapshot import AiPlayerRenderSnapshotDTO
from ludoxel.presentation.rendering.visuals.players.first_person_motion import FirstPersonMotionSample
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.presentation.rendering.visuals.players.render_state_composer import compose_player_render_state_from_parts
from ludoxel.simulation.actors.ai_players.state import AI_SKIN_MODE_CUSTOM, normalize_ai_skin_id, normalize_ai_skin_mode
from ludoxel.simulation.blocks.registries.block import BlockRegistry


def compose_ai_player_render_states(snapshots: tuple[AiPlayerRenderSnapshotDTO, ...], *, block_registry: BlockRegistry) -> tuple[PlayerRenderState, ...]:
  states: list[PlayerRenderState] = []
  for snapshot in snapshots:
    skin_id = normalize_ai_skin_id(snapshot.skin_id)
    skin_texture_key = skin_id if normalize_ai_skin_mode(snapshot.skin_mode) == AI_SKIN_MODE_CUSTOM and skin_id else None
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
    states.append(
      compose_player_render_state_from_parts(
        player_model=snapshot.player_model, motion=motion, block_registry=block_registry, arm_rotation_limit_min_deg=-180.0, arm_rotation_limit_max_deg=180.0, skin_texture_key=skin_texture_key
      )
    )
  return tuple(states)
