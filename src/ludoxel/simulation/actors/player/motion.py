# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PlayerModelSnapshotDTO:
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
  first_person_tx: float = 0.0
  first_person_ty: float = 0.0
  first_person_tz: float = 0.0
  first_person_yaw_deg: float = 0.0
  first_person_pitch_deg: float = 0.0
  first_person_roll_deg: float = 0.0
  is_first_person: bool = True
