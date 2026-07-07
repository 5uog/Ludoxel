# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.sessions.pipelines.render_snapshot import PlayerModelSnapshotDTO, RenderSnapshotDTO
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.presentation.rendering.visuals.players.first_person_motion import FirstPersonMotionSample
from ludoxel.presentation.rendering.visuals.players.render_state import FirstPersonRenderState, PlayerRenderState
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.inventories.special_items.registry import get_special_item_descriptor


def compose_player_render_state(*, snapshot: RenderSnapshotDTO, motion: FirstPersonMotionSample, block_registry: BlockRegistry, arm_rotation_limit_min_deg: float, arm_rotation_limit_max_deg: float) -> PlayerRenderState:
  return compose_player_render_state_from_parts(player_model=snapshot.player_model, motion=motion, block_registry=block_registry, arm_rotation_limit_min_deg=float(arm_rotation_limit_min_deg), arm_rotation_limit_max_deg=float(arm_rotation_limit_max_deg))


def compose_player_render_state_from_parts(*, player_model: PlayerModelSnapshotDTO, motion: FirstPersonMotionSample, block_registry: BlockRegistry, arm_rotation_limit_min_deg: float, arm_rotation_limit_max_deg: float, skin_texture_key: str | None = None) -> PlayerRenderState:
  visible_def = None if motion.visible_item_id is None else block_registry.get(str(motion.visible_item_id))
  special_descriptor = None if motion.visible_item_id is None else get_special_item_descriptor(motion.visible_item_id)
  swing_active = clampf(float(motion.swing_progress) * 5.0, 0.0, 1.0)
  equip_settled = clampf(float(motion.equip_progress), 0.0, 1.0)
  walk_fraction = clampf(float(player_model.limb_swing_amount) / 0.5, 0.0, 1.0)
  idle_sway_weight = clampf((1.0 - float(swing_active)) * float(equip_settled) * (1.0 - float(walk_fraction)), 0.0, 1.0)
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
    idle_time_s=float(motion.idle_time_s),
    idle_sway_weight=float(idle_sway_weight),
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
    limb_forward_ratio=float(player_model.limb_forward_ratio),
    limb_strafe_ratio=float(player_model.limb_strafe_ratio),
    idle_anim_time_s=float(player_model.idle_anim_time_s),
    hurt_tint_strength=float(player_model.hurt_tint_strength),
    is_first_person=bool(player_model.is_first_person),
    skin_texture_key=None if skin_texture_key is None else str(skin_texture_key),
    first_person=first_person,
  )
