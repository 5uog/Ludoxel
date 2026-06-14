# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.sessions.pipelines.render_snapshot import PlayerModelSnapshotDTO, RenderSnapshotDTO
from ludoxel.presentation.rendering.visuals.players.first_person_motion import FirstPersonMotionSample
from ludoxel.presentation.rendering.visuals.players.render_state import FirstPersonRenderState, PlayerRenderState
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.inventories.special_items.registry import get_special_item_descriptor


def compose_player_render_state(
  *, snapshot: RenderSnapshotDTO, motion: FirstPersonMotionSample, block_registry: BlockRegistry, arm_rotation_limit_min_deg: float, arm_rotation_limit_max_deg: float
) -> PlayerRenderState:
  """
  render snapshot 内の player model 情報と first-person motion sample を、player-render state の構成関数へ渡す外側 adapter である。
  DTO field selection を各 renderer call site へ重複させない。
  """
  return compose_player_render_state_from_parts(
    player_model=snapshot.player_model,
    motion=motion,
    block_registry=block_registry,
    arm_rotation_limit_min_deg=float(arm_rotation_limit_min_deg),
    arm_rotation_limit_max_deg=float(arm_rotation_limit_max_deg),
  )


def compose_player_render_state_from_parts(
  *,
  player_model: PlayerModelSnapshotDTO,
  motion: FirstPersonMotionSample,
  block_registry: BlockRegistry,
  arm_rotation_limit_min_deg: float,
  arm_rotation_limit_max_deg: float,
  skin_texture_key: str | None = None,
) -> PlayerRenderState:
  """
  権威的な player-model snapshot と sampled first-person motion state を合成し、
  registry と special-item lookup を加えて不変 render-state record を生成する。
  pose builder はこの record だけから body、hand、item の描画入力を再構成する。
  """
  visible_def = None if motion.visible_item_id is None else block_registry.get(str(motion.visible_item_id))
  special_descriptor = None if motion.visible_item_id is None else get_special_item_descriptor(motion.visible_item_id)
  first_person = FirstPersonRenderState(
    visible_item_id=motion.visible_item_id,
    target_item_id=motion.target_item_id,
    visible_block_id=None if visible_def is None else str(motion.visible_item_id),
    visible_block_kind=None if visible_def is None else str(visible_def.kind),
    visible_special_item_icon=None if special_descriptor is None else str(special_descriptor.icon_key),
    equip_progress=float(motion.equip_progress),
    prev_equip_progress=float(motion.prev_equip_progress),
    swing_progress=float(motion.swing_progress),
    prev_swing_progress=float(motion.prev_swing_progress),
    show_arm=bool(motion.show_arm),
    show_view_model=bool(motion.show_view_model),
    slim_arm=bool(motion.slim_arm),
    view_bob_x=float(player_model.first_person_tx),
    view_bob_y=float(player_model.first_person_ty),
    view_bob_z=float(player_model.first_person_tz),
    view_bob_yaw_deg=float(player_model.first_person_yaw_deg),
    view_bob_pitch_deg=float(player_model.first_person_pitch_deg),
    view_bob_roll_deg=float(player_model.first_person_roll_deg),
    arm_rotation_limit_min_deg=float(arm_rotation_limit_min_deg),
    arm_rotation_limit_max_deg=float(arm_rotation_limit_max_deg),
  )
  return PlayerRenderState(
    base_x=float(player_model.base_x),
    base_y=float(player_model.base_y),
    base_z=float(player_model.base_z),
    body_yaw_deg=float(player_model.body_yaw_deg),
    head_yaw_deg=float(player_model.head_yaw_deg),
    head_pitch_deg=float(player_model.head_pitch_deg),
    limb_phase_rad=float(player_model.limb_phase_rad),
    limb_swing_amount=float(player_model.limb_swing_amount),
    crouch_amount=float(player_model.crouch_amount),
    hurt_tint_strength=float(player_model.hurt_tint_strength),
    is_first_person=bool(player_model.is_first_person),
    skin_texture_key=None if skin_texture_key is None else str(skin_texture_key),
    first_person=first_person,
  )
