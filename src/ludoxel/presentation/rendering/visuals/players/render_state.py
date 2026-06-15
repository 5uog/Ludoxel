# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FirstPersonRenderState:
  """
  first-person の腕、held block、special item renderer が消費する不変 parameter record である。
  visible/target identifier と時間的 animation channel を一体で保持し、
  frame 内の view-model transform を一つの sample から再構成できるようにする。
  """

  visible_item_id: str | None
  target_item_id: str | None
  visible_block_id: str | None
  visible_block_kind: str | None
  visible_special_item_icon: str | None
  equip_progress: float
  prev_equip_progress: float
  swing_progress: float
  prev_swing_progress: float
  show_arm: bool
  show_view_model: bool
  slim_arm: bool
  view_bob_x: float = 0.0
  view_bob_y: float = 0.0
  view_bob_z: float = 0.0
  view_bob_yaw_deg: float = 0.0
  view_bob_pitch_deg: float = 0.0
  view_bob_roll_deg: float = 0.0
  arm_rotation_limit_min_deg: float = -180.0
  arm_rotation_limit_max_deg: float = 180.0


@dataclass(frozen=True)
class PlayerRenderState:
  """
  third-person player model synthesis の cache key となる不変入力 record である。
  base pose、locomotion phase、crouch、perspective flag、first-person extension から、可視 body と shadow pose が決定される。
  skin_texture_key は描画時に用いる skin texture を選択するための解決済み参照であり、None は player skin texture を、文字列は当該 key で renderer に登録済みの actor 固有 skin texture を指す。この field は pose cache key の一部であるため、同一 pose でも異なる skin を要求する actor が別 cache entry として扱われる。
  """

  base_x: float
  base_y: float
  base_z: float
  body_yaw_deg: float
  head_yaw_deg: float
  head_pitch_deg: float
  limb_phase_rad: float
  limb_swing_amount: float
  crouch_amount: float
  hurt_tint_strength: float = 0.0
  is_first_person: bool = True
  skin_texture_key: str | None = None
  first_person: FirstPersonRenderState | None = None
