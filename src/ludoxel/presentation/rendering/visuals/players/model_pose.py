# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass
from functools import lru_cache

import numpy as np

from ludoxel.foundations.mathematics.linear.transform_matrices import compose_matrices, rotate_x_rad_matrix, rotate_y_rad_matrix, rotate_z_rad_matrix, scale_matrix, translate_matrix
from ludoxel.foundations.mathematics.scalars.numeric import clampf, lerpf
from ludoxel.foundations.mathematics.voxels.faces import FACE_POS_Y, FACE_POS_Z
from ludoxel.presentation.rendering.faces.box_instances import cube_rows_from_boxes
from ludoxel.presentation.rendering.faces.row_utils import append_face_instance, empty_textured_face_rows, face_rows_from_buffers, model_matrix_for_local_box, skin_uv_rect
from ludoxel.presentation.rendering.visuals.players.first_person_geometry import THIRD_PERSON_RIGHT_HAND_ANCHOR, build_third_person_item_hand_transform
from ludoxel.presentation.rendering.visuals.players.held_block_geometry import held_block_model_boxes_for_kind
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.presentation.rendering.visuals.players.skin_uv_maps import (
  VISUAL_LEFT_ARM_BASE_UV_PX,
  VISUAL_LEFT_ARM_SLEEVE_UV_PX,
  VISUAL_RIGHT_ARM_BASE_UV_PX,
  VISUAL_RIGHT_ARM_SLEEVE_UV_PX,
  skin_cube_uv_map,
  uv_map_with_rotated_faces,
)
from ludoxel.simulation.blocks.models.common import LocalBox

_PX = 1.0 / 16.0
_SKIN_WIDTH = 64.0
_SKIN_HEIGHT = 64.0

_HEAD_SIZE = (8.0 * _PX, 8.0 * _PX, 8.0 * _PX)
_HEAD_OUTER_SIZE = (9.0 * _PX, 9.0 * _PX, 9.0 * _PX)
_BODY_SIZE = (8.0 * _PX, 12.0 * _PX, 4.0 * _PX)
_BODY_OUTER_SIZE = (8.5 * _PX, 12.5 * _PX, 4.5 * _PX)
_ARM_SIZE_SLIM = (3.0 * _PX, 12.0 * _PX, 4.0 * _PX)
_ARM_OUTER_SIZE_SLIM = (3.5 * _PX, 12.5 * _PX, 4.5 * _PX)
_LEG_SIZE = (4.0 * _PX, 12.0 * _PX, 4.0 * _PX)
_LEG_OUTER_SIZE = (4.5 * _PX, 12.5 * _PX, 4.5 * _PX)

_MODEL_FEET_OFFSET_Y = 24.0 * _PX
_HEAD_GROUP_POS = (0.0, 0.0, 0.0)
_HEAD_CENTER = (0.0, 4.0 * _PX, 0.0)
_BODY_GROUP_POS_STAND = (0.0, -6.0 * _PX, 0.0)
_RIGHT_ARM_GROUP_POS_STAND = (-5.0 * _PX, -2.0 * _PX, 0.0)
_LEFT_ARM_GROUP_POS_STAND = (5.0 * _PX, -2.0 * _PX, 0.0)
_RIGHT_ARM_PIVOT_SLIM = (-0.5 * _PX, -4.5 * _PX, 0.0)
_LEFT_ARM_PIVOT_SLIM = (0.5 * _PX, -4.5 * _PX, 0.0)
_RIGHT_LEG_GROUP_POS_STAND = (-2.0 * _PX, -12.0 * _PX, 0.0)
_LEFT_LEG_GROUP_POS_STAND = (2.0 * _PX, -12.0 * _PX, 0.0)
_LEG_PIVOT = (0.0, -6.0 * _PX, 0.0)

_CROUCH_BODY_ROT_X = 0.4537860552
_CROUCH_BODY_POS_Y = -8.103677462 * _PX
_CROUCH_BODY_POS_Z = (1.3256181 - 3.4500310377) * _PX
_CROUCH_HEAD_POS_Y = -3.618325234674 * _PX
_CROUCH_ARM_POS_Y = -4.53943318 * _PX
_CROUCH_ARM_POS_Z = (3.618325234674 - 3.4500310377) * _PX
_CROUCH_ARM_ROT_X = 0.410367746202
_CROUCH_ARM_ROT_Z = 0.1
_CROUCH_LEG_POS_Z = -3.4500310377 * _PX
_ARM_SWAY_Z = math.pi * 0.02

# Idle arm sway is a small shoulder-pivot rotation that runs on the visual-only
# animation clock when the player is neither walking nor swinging. The roll term
# carries a constant outward bias so each hand rests slightly away from the body,
# and the two arms receive mirrored roll and pitch signs.
_IDLE_SWAY_ROLL_FREQ = 1.8
_IDLE_SWAY_PITCH_FREQ = 1.34
_IDLE_SWAY_ROLL_AMP = 0.05
_IDLE_SWAY_ROLL_BIAS = 0.05
_IDLE_SWAY_PITCH_AMP = 0.05

# Third-person attack/place swing for the main-hand arm: a forward shoulder pitch
# with a small outward roll so the arm and any held item clear the torso volume
# instead of being pulled across the chest or back.
_THIRD_PERSON_SWING_FORWARD_RAD = 1.45
_THIRD_PERSON_SWING_OUTWARD_RAD = 0.12

# Movement-direction limb shaping. The fore/aft swing amplitude follows the local
# forward speed and is reduced while moving backward; a strafe keeps the same
# forward-facing fore/aft step rather than turning the feet sideways. The legs pivot
# at the hip, so no leg root leaves the body.
_BACKWARD_SWING_SCALE = 0.65
_STRAFE_FOREAFT_SCALE = 0.22
_WORLD_SPECIAL_ITEM_BOX = LocalBox(1.0 * _PX, 1.0 * _PX, 7.5 * _PX, 15.0 * _PX, 15.0 * _PX, 8.5 * _PX)
_WORLD_SPECIAL_ITEM_SCALE = 1.75
_WORLD_SPECIAL_ITEM_UV_RECT = (1.0, 0.0, 0.0, 1.0)


_HEAD_BASE_UV_PX = skin_cube_uv_map(
  pos_x=(0.0, 8.0, 8.0, 16.0), neg_x=(16.0, 8.0, 24.0, 16.0), pos_y=(8.0, 0.0, 16.0, 8.0), neg_y=(16.0, 0.0, 24.0, 8.0), pos_z=(8.0, 8.0, 16.0, 16.0), neg_z=(24.0, 8.0, 32.0, 16.0)
)
_HEAD_HAT_UV_PX = skin_cube_uv_map(
  pos_x=(32.0, 8.0, 40.0, 16.0), neg_x=(48.0, 8.0, 56.0, 16.0), pos_y=(40.0, 0.0, 48.0, 8.0), neg_y=(48.0, 0.0, 56.0, 8.0), pos_z=(40.0, 8.0, 48.0, 16.0), neg_z=(56.0, 8.0, 64.0, 16.0)
)
_BODY_BASE_UV_PX = uv_map_with_rotated_faces(
  skin_cube_uv_map(
    pos_x=(16.0, 20.0, 20.0, 32.0), neg_x=(28.0, 20.0, 32.0, 32.0), pos_y=(20.0, 16.0, 28.0, 20.0), neg_y=(28.0, 16.0, 36.0, 20.0), pos_z=(20.0, 20.0, 28.0, 32.0), neg_z=(32.0, 20.0, 40.0, 32.0)
  ),
  FACE_POS_Y,
)
_BODY_JACKET_UV_PX = uv_map_with_rotated_faces(
  skin_cube_uv_map(
    pos_x=(16.0, 36.0, 20.0, 48.0), neg_x=(28.0, 36.0, 32.0, 48.0), pos_y=(20.0, 32.0, 28.0, 36.0), neg_y=(28.0, 32.0, 36.0, 36.0), pos_z=(20.0, 36.0, 28.0, 48.0), neg_z=(32.0, 36.0, 40.0, 48.0)
  ),
  FACE_POS_Y,
)
_RIGHT_LEG_BASE_UV_PX = skin_cube_uv_map(
  pos_x=(0.0, 20.0, 4.0, 32.0), neg_x=(8.0, 20.0, 12.0, 32.0), pos_y=(4.0, 16.0, 8.0, 20.0), neg_y=(8.0, 16.0, 12.0, 20.0), pos_z=(4.0, 20.0, 8.0, 32.0), neg_z=(12.0, 20.0, 16.0, 32.0)
)
_RIGHT_LEG_PANTS_UV_PX = skin_cube_uv_map(
  pos_x=(0.0, 36.0, 4.0, 48.0), neg_x=(8.0, 36.0, 12.0, 48.0), pos_y=(4.0, 32.0, 8.0, 36.0), neg_y=(8.0, 32.0, 12.0, 36.0), pos_z=(4.0, 36.0, 8.0, 48.0), neg_z=(12.0, 36.0, 16.0, 48.0)
)
_LEFT_LEG_BASE_UV_PX = skin_cube_uv_map(
  pos_x=(16.0, 52.0, 20.0, 64.0), neg_x=(24.0, 52.0, 28.0, 64.0), pos_y=(20.0, 48.0, 24.0, 52.0), neg_y=(24.0, 48.0, 28.0, 52.0), pos_z=(20.0, 52.0, 24.0, 64.0), neg_z=(28.0, 52.0, 32.0, 64.0)
)
_LEFT_LEG_PANTS_UV_PX = skin_cube_uv_map(
  pos_x=(0.0, 52.0, 4.0, 64.0), neg_x=(8.0, 52.0, 12.0, 64.0), pos_y=(4.0, 48.0, 8.0, 52.0), neg_y=(8.0, 48.0, 12.0, 52.0), pos_z=(4.0, 52.0, 8.0, 64.0), neg_z=(12.0, 52.0, 16.0, 64.0)
)


@dataclass(frozen=True)
class HeldBlockPose:
  block_id: str
  block_kind: str | None
  parent_transform: np.ndarray


@dataclass(frozen=True)
class PlayerModelPose:
  skin_face_rows: tuple[np.ndarray, ...]
  held_block_pose: HeldBlockPose | None
  special_item_face_rows: tuple[np.ndarray, ...]
  visible_special_item_icon: str | None
  hurt_tint_strength: float
  skin_texture_key: str | None
  shadow_rows: np.ndarray


def _as_rows(matrix: np.ndarray) -> np.ndarray:
  return np.asarray(matrix, dtype=np.float32).reshape(16)


def _append_unit_cube_rows(buffers: list[list[list[float]]], model: np.ndarray, uv_map_pixels: dict[int, tuple[float, float, float, float]]) -> None:
  for face_idx in range(6):
    append_face_instance(buffers, int(face_idx), model, skin_uv_rect(uv_map_pixels[int(face_idx)], width=int(_SKIN_WIDTH), height=int(_SKIN_HEIGHT)))


def _third_person_swing_arm_angles(swing_progress: float) -> tuple[float, float]:
  swing = clampf(float(swing_progress), 0.0, 1.0)
  if swing <= 1e-6:
    return (0.0, 0.0)

  eased = 1.0 - pow(1.0 - swing, 4.0)
  forward = math.sin(float(eased) * math.pi)
  pitch_x = -float(_THIRD_PERSON_SWING_FORWARD_RAD) * float(forward)
  roll_z = float(_THIRD_PERSON_SWING_OUTWARD_RAD) * math.sin(float(swing) * math.pi)
  return (float(pitch_x), float(roll_z))


def _attack_swing_weight(swing_progress: float) -> float:
  swing = clampf(float(swing_progress), 0.0, 1.0)
  if swing <= 1e-6:
    return 0.0
  return float(math.sin(math.sqrt(swing) * math.pi))


@lru_cache(maxsize=64)
def _build_player_model_pose_cached(state: PlayerRenderState | None) -> PlayerModelPose:
  empty_shadow = np.zeros((0, 16), dtype=np.float32)
  empty_faces = empty_textured_face_rows()
  if state is None:
    return PlayerModelPose(
      skin_face_rows=empty_faces, held_block_pose=None, special_item_face_rows=empty_faces, visible_special_item_icon=None, hurt_tint_strength=0.0, skin_texture_key=None, shadow_rows=empty_shadow
    )

  crouch = clampf(float(state.crouch_amount), 0.0, 1.0)
  body_yaw = math.radians(float(state.body_yaw_deg))
  head_yaw = math.radians(float(state.head_yaw_deg))
  head_pitch = math.radians(float(state.head_pitch_deg))
  phase = float(state.limb_phase_rad)
  swing = max(0.0, float(state.limb_swing_amount))
  walk_l = math.sin(float(phase))
  walk_r = math.sin(float(phase) + math.pi)
  walk_fraction = float(clampf(float(swing) / 0.5 if float(swing) > 1e-9 else 0.0, 0.0, 1.0))
  arm_sway = float(walk_fraction) * float(_ARM_SWAY_Z)

  # Direction-aware locomotion. Fore/aft swing scales with the local forward speed and is
  # damped when moving backward; the strafe adds a smaller fore/aft step that keeps the same
  # forward-facing foot animation. The combined fore/aft amplitude is capped at the
  # total-speed swing so a diagonal never swings more than a straight forward stride at the
  # same speed. Body yaw offsets are resolved before the render state reaches this builder;
  # this file keeps the legs on the forward-facing fore/aft step and does not derive body
  # yaw from local velocity.
  forward_ratio = float(state.limb_forward_ratio)
  strafe_ratio = float(state.limb_strafe_ratio)
  backward_scale = 1.0 if float(forward_ratio) >= -1e-6 else float(_BACKWARD_SWING_SCALE)
  fore_aft_amp = 0.5 * abs(float(forward_ratio)) * float(backward_scale)
  strafe_step = abs(float(clampf(float(strafe_ratio), -1.0, 1.0)))
  pitch_amp = float(clampf(float(fore_aft_amp) + float(strafe_step) * float(_STRAFE_FOREAFT_SCALE), 0.0, float(swing)))

  first_person = state.first_person
  swing_pitch = 0.0
  swing_roll = 0.0
  attack_weight = 0.0
  if first_person is not None:
    swing_pitch, swing_roll = _third_person_swing_arm_angles(float(first_person.swing_progress))
    attack_weight = _attack_swing_weight(float(first_person.swing_progress))

  idle_weight = (1.0 - float(walk_fraction)) * (1.0 - float(attack_weight))
  idle_time = float(state.idle_anim_time_s)
  idle_roll = (math.cos(float(idle_time) * float(_IDLE_SWAY_ROLL_FREQ)) * float(_IDLE_SWAY_ROLL_AMP) + float(_IDLE_SWAY_ROLL_BIAS)) * float(idle_weight)
  idle_pitch = math.sin(float(idle_time) * float(_IDLE_SWAY_PITCH_FREQ)) * float(_IDLE_SWAY_PITCH_AMP) * float(idle_weight)

  arm_rotation_limit_min_rad = math.radians(float(-180.0 if first_person is None else first_person.arm_rotation_limit_min_deg))
  arm_rotation_limit_max_rad = math.radians(float(180.0 if first_person is None else first_person.arm_rotation_limit_max_deg))

  # Visual left arm (off-hand, model -X side): outward sway rolls the fingertip toward -X.
  right_arm_rot_x = float(pitch_amp) * float(walk_l) + float(_CROUCH_ARM_ROT_X) * float(crouch) - float(idle_pitch)
  right_arm_rot_z = -(float(arm_sway) + float(_CROUCH_ARM_ROT_Z) * float(crouch)) - float(idle_roll)
  # Legs pivot at the hip and keep the forward-facing fore/aft step only.
  right_leg_rot_x = float(pitch_amp) * float(walk_r)
  left_leg_rot_x = float(pitch_amp) * float(walk_l)

  # Visual right arm (main hand, model +X side): outward sway rolls the fingertip toward +X,
  # and the attack/place swing pitches the arm forward from the shoulder.
  main_hand_walk_damping = 1.0 - 0.85 * float(attack_weight)
  main_hand_sway_damping = 1.0 - 0.70 * float(attack_weight)
  left_arm_rot_x = (float(pitch_amp) * float(walk_r) * float(main_hand_walk_damping)) + float(_CROUCH_ARM_ROT_X) * float(crouch) + float(swing_pitch) + float(idle_pitch)
  left_arm_rot_z = (float(arm_sway) * float(main_hand_sway_damping)) + float(_CROUCH_ARM_ROT_Z) * float(crouch) + float(swing_roll) + float(idle_roll)
  if float(attack_weight) > 1e-6:
    left_arm_rot_x = min(float(left_arm_rot_x), float(swing_pitch) + 0.08 * (1.0 - float(attack_weight)))
  attack_y = 0.0
  right_arm_rot_x = clampf(float(right_arm_rot_x), float(arm_rotation_limit_min_rad), float(arm_rotation_limit_max_rad))
  left_arm_rot_x = clampf(float(left_arm_rot_x), float(arm_rotation_limit_min_rad), float(arm_rotation_limit_max_rad))

  root = compose_matrices(
    translate_matrix(float(state.base_x), float(state.base_y), float(state.base_z)),
    rotate_y_rad_matrix(float(body_yaw)),
    translate_matrix(0.0, float(_MODEL_FEET_OFFSET_Y), 0.0),
  )
  head_group_y = lerpf(float(_HEAD_GROUP_POS[1]), float(_CROUCH_HEAD_POS_Y), float(crouch))
  body_group_y = lerpf(float(_BODY_GROUP_POS_STAND[1]), float(_CROUCH_BODY_POS_Y), float(crouch))
  body_group_z = lerpf(0.0, float(_CROUCH_BODY_POS_Z), float(crouch))
  arm_group_y = lerpf(float(_RIGHT_ARM_GROUP_POS_STAND[1]), float(_CROUCH_ARM_POS_Y), float(crouch))
  arm_group_z = lerpf(0.0, float(_CROUCH_ARM_POS_Z), float(crouch))
  leg_group_z = lerpf(0.0, float(_CROUCH_LEG_POS_Z), float(crouch))

  head_parent = compose_matrices(
    root,
    translate_matrix(0.0, float(head_group_y), 0.0),
    rotate_y_rad_matrix(float(head_yaw)),
    rotate_x_rad_matrix(float(head_pitch)),
    translate_matrix(float(_HEAD_CENTER[0]), float(_HEAD_CENTER[1]), float(_HEAD_CENTER[2])),
  )
  body_parent = compose_matrices(root, translate_matrix(0.0, float(body_group_y), float(body_group_z)), rotate_x_rad_matrix(float(_CROUCH_BODY_ROT_X) * float(crouch)))
  right_arm_parent = compose_matrices(
    root, translate_matrix(float(_RIGHT_ARM_GROUP_POS_STAND[0]), float(arm_group_y), float(arm_group_z)), rotate_z_rad_matrix(float(right_arm_rot_z)), rotate_x_rad_matrix(float(right_arm_rot_x))
  )
  left_arm_parent = compose_matrices(
    root,
    translate_matrix(float(_LEFT_ARM_GROUP_POS_STAND[0]), float(arm_group_y), float(arm_group_z)),
    rotate_z_rad_matrix(float(left_arm_rot_z)),
    rotate_y_rad_matrix(float(attack_y)),
    rotate_x_rad_matrix(float(left_arm_rot_x)),
  )
  right_leg_parent = compose_matrices(
    root,
    translate_matrix(float(_RIGHT_LEG_GROUP_POS_STAND[0]), float(_RIGHT_LEG_GROUP_POS_STAND[1]), float(leg_group_z)),
    rotate_x_rad_matrix(float(right_leg_rot_x)),
    translate_matrix(float(_LEG_PIVOT[0]), float(_LEG_PIVOT[1]), float(_LEG_PIVOT[2])),
  )
  left_leg_parent = compose_matrices(
    root,
    translate_matrix(float(_LEFT_LEG_GROUP_POS_STAND[0]), float(_LEFT_LEG_GROUP_POS_STAND[1]), float(leg_group_z)),
    rotate_x_rad_matrix(float(left_leg_rot_x)),
    translate_matrix(float(_LEG_PIVOT[0]), float(_LEG_PIVOT[1]), float(_LEG_PIVOT[2])),
  )

  head = compose_matrices(head_parent, scale_matrix(float(_HEAD_SIZE[0]), float(_HEAD_SIZE[1]), float(_HEAD_SIZE[2])))
  hat = compose_matrices(head_parent, scale_matrix(float(_HEAD_OUTER_SIZE[0]), float(_HEAD_OUTER_SIZE[1]), float(_HEAD_OUTER_SIZE[2])))
  body = compose_matrices(body_parent, scale_matrix(float(_BODY_SIZE[0]), float(_BODY_SIZE[1]), float(_BODY_SIZE[2])))
  jacket = compose_matrices(body_parent, scale_matrix(float(_BODY_OUTER_SIZE[0]), float(_BODY_OUTER_SIZE[1]), float(_BODY_OUTER_SIZE[2])))
  right_arm = compose_matrices(
    right_arm_parent,
    translate_matrix(float(_RIGHT_ARM_PIVOT_SLIM[0]), float(_RIGHT_ARM_PIVOT_SLIM[1]), float(_RIGHT_ARM_PIVOT_SLIM[2])),
    scale_matrix(float(_ARM_SIZE_SLIM[0]), float(_ARM_SIZE_SLIM[1]), float(_ARM_SIZE_SLIM[2])),
  )
  right_sleeve = compose_matrices(
    right_arm_parent,
    translate_matrix(float(_RIGHT_ARM_PIVOT_SLIM[0]), float(_RIGHT_ARM_PIVOT_SLIM[1]), float(_RIGHT_ARM_PIVOT_SLIM[2])),
    scale_matrix(float(_ARM_OUTER_SIZE_SLIM[0]), float(_ARM_OUTER_SIZE_SLIM[1]), float(_ARM_OUTER_SIZE_SLIM[2])),
  )
  left_arm = compose_matrices(
    left_arm_parent,
    translate_matrix(float(_LEFT_ARM_PIVOT_SLIM[0]), float(_LEFT_ARM_PIVOT_SLIM[1]), float(_LEFT_ARM_PIVOT_SLIM[2])),
    scale_matrix(float(_ARM_SIZE_SLIM[0]), float(_ARM_SIZE_SLIM[1]), float(_ARM_SIZE_SLIM[2])),
  )
  left_sleeve = compose_matrices(
    left_arm_parent,
    translate_matrix(float(_LEFT_ARM_PIVOT_SLIM[0]), float(_LEFT_ARM_PIVOT_SLIM[1]), float(_LEFT_ARM_PIVOT_SLIM[2])),
    scale_matrix(float(_ARM_OUTER_SIZE_SLIM[0]), float(_ARM_OUTER_SIZE_SLIM[1]), float(_ARM_OUTER_SIZE_SLIM[2])),
  )
  right_leg = compose_matrices(right_leg_parent, scale_matrix(float(_LEG_SIZE[0]), float(_LEG_SIZE[1]), float(_LEG_SIZE[2])))
  right_pants = compose_matrices(right_leg_parent, scale_matrix(float(_LEG_OUTER_SIZE[0]), float(_LEG_OUTER_SIZE[1]), float(_LEG_OUTER_SIZE[2])))
  left_leg = compose_matrices(left_leg_parent, scale_matrix(float(_LEG_SIZE[0]), float(_LEG_SIZE[1]), float(_LEG_SIZE[2])))
  left_pants = compose_matrices(left_leg_parent, scale_matrix(float(_LEG_OUTER_SIZE[0]), float(_LEG_OUTER_SIZE[1]), float(_LEG_OUTER_SIZE[2])))

  shadow_rows_list = [_as_rows(head), _as_rows(body), _as_rows(right_arm), _as_rows(left_arm), _as_rows(right_leg), _as_rows(left_leg)]

  held_block_pose: HeldBlockPose | None = None
  special_item_face_rows = empty_faces
  visible_special_item_icon: str | None = None
  if first_person is not None:
    hand_anchor = compose_matrices(left_arm_parent, translate_matrix(float(THIRD_PERSON_RIGHT_HAND_ANCHOR[0]), float(THIRD_PERSON_RIGHT_HAND_ANCHOR[1]), float(THIRD_PERSON_RIGHT_HAND_ANCHOR[2])))
    if first_person.visible_block_id is not None and first_person.visible_block_kind is not None:
      held_parent = compose_matrices(hand_anchor, build_third_person_item_hand_transform())
      block_boxes = [textured_box.box for textured_box in held_block_model_boxes_for_kind(first_person.visible_block_kind)]
      block_shadow_rows = cube_rows_from_boxes(block_boxes, held_parent)
      if block_shadow_rows.size > 0:
        shadow_rows_list.extend([row for row in block_shadow_rows])
      if not bool(state.is_first_person):
        held_block_pose = HeldBlockPose(block_id=str(first_person.visible_block_id), block_kind=str(first_person.visible_block_kind), parent_transform=np.asarray(held_parent, dtype=np.float32))
    elif first_person.visible_special_item_icon is not None:
      special_parent = compose_matrices(hand_anchor, build_third_person_item_hand_transform(), scale_matrix(float(_WORLD_SPECIAL_ITEM_SCALE), float(_WORLD_SPECIAL_ITEM_SCALE), 1.0))
      special_shadow_rows = cube_rows_from_boxes((_WORLD_SPECIAL_ITEM_BOX,), special_parent)
      if special_shadow_rows.size > 0:
        shadow_rows_list.extend([row for row in special_shadow_rows])
      if not bool(state.is_first_person):
        buffers: list[list[list[float]]] = [[] for _ in range(6)]
        special_model = model_matrix_for_local_box(special_parent, _WORLD_SPECIAL_ITEM_BOX)
        append_face_instance(buffers, int(FACE_POS_Z), special_model, _WORLD_SPECIAL_ITEM_UV_RECT)
        special_item_face_rows = face_rows_from_buffers(buffers)
        visible_special_item_icon = str(first_person.visible_special_item_icon)

  shadow_rows = np.ascontiguousarray(np.vstack(shadow_rows_list), dtype=np.float32)

  if bool(state.is_first_person):
    return PlayerModelPose(
      skin_face_rows=empty_faces,
      held_block_pose=None,
      special_item_face_rows=empty_faces,
      visible_special_item_icon=None,
      hurt_tint_strength=float(state.hurt_tint_strength),
      skin_texture_key=None if state.skin_texture_key is None else str(state.skin_texture_key),
      shadow_rows=shadow_rows,
    )

  skin_buffers: list[list[list[float]]] = [[] for _ in range(6)]
  for model, uv_map in (
    (head, _HEAD_BASE_UV_PX),
    (hat, _HEAD_HAT_UV_PX),
    (body, _BODY_BASE_UV_PX),
    (jacket, _BODY_JACKET_UV_PX),
    (right_arm, VISUAL_LEFT_ARM_BASE_UV_PX),
    (right_sleeve, VISUAL_LEFT_ARM_SLEEVE_UV_PX),
    (left_arm, VISUAL_RIGHT_ARM_BASE_UV_PX),
    (left_sleeve, VISUAL_RIGHT_ARM_SLEEVE_UV_PX),
    (right_leg, _RIGHT_LEG_BASE_UV_PX),
    (right_pants, _RIGHT_LEG_PANTS_UV_PX),
    (left_leg, _LEFT_LEG_BASE_UV_PX),
    (left_pants, _LEFT_LEG_PANTS_UV_PX),
  ):
    _append_unit_cube_rows(skin_buffers, model, uv_map)

  return PlayerModelPose(
    skin_face_rows=face_rows_from_buffers(skin_buffers),
    held_block_pose=held_block_pose,
    special_item_face_rows=special_item_face_rows,
    visible_special_item_icon=visible_special_item_icon,
    hurt_tint_strength=float(state.hurt_tint_strength),
    skin_texture_key=None if state.skin_texture_key is None else str(state.skin_texture_key),
    shadow_rows=shadow_rows,
  )


def build_player_model_pose(state: PlayerRenderState | None) -> PlayerModelPose:
  return _build_player_model_pose_cached(state)
