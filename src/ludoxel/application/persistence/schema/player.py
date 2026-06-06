# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ludoxel.foundations.mathematics.scalars.coercion import coerce_bool, coerce_float


def coerce_xyz_triplet(raw: object, *, default: tuple[float, float, float]) -> tuple[float, float, float]:
  if not isinstance(raw, (list, tuple)) or len(raw) != 3:
    raw = default
  return (coerce_float(raw[0], default[0]), coerce_float(raw[1], default[1]), coerce_float(raw[2], default[2]))


@dataclass(frozen=True)
class PersistedPlayer:
  pos_x: float = 0.0
  pos_y: float = 1.0
  pos_z: float = -10.0

  vel_x: float = 0.0
  vel_y: float = 0.0
  vel_z: float = 0.0

  yaw_deg: float = 0.0
  pitch_deg: float = 0.0

  on_ground: bool = False
  flying: bool = False
  auto_jump_cooldown_s: float = 0.0
  crouch_eye_offset: float = 0.0
  health: float = 20.0
  max_health: float = 20.0

  def to_dict(self) -> dict[str, Any]:
    return {
      "pos": [float(self.pos_x), float(self.pos_y), float(self.pos_z)],
      "vel": [float(self.vel_x), float(self.vel_y), float(self.vel_z)],
      "yaw_deg": float(self.yaw_deg),
      "pitch_deg": float(self.pitch_deg),
      "on_ground": bool(self.on_ground),
      "flying": bool(self.flying),
      "auto_jump_cooldown_s": float(self.auto_jump_cooldown_s),
      "crouch_eye_offset": float(self.crouch_eye_offset),
      "health": float(self.health),
      "max_health": float(self.max_health),
    }

  @staticmethod
  def from_dict(d: dict[str, Any]) -> "PersistedPlayer":
    pos_x, pos_y, pos_z = coerce_xyz_triplet(d.get("pos"), default=(0.0, 1.0, -10.0))
    vel_x, vel_y, vel_z = coerce_xyz_triplet(d.get("vel"), default=(0.0, 0.0, 0.0))

    cooldown_raw = d.get("auto_jump_cooldown_s", d.get("jump_cooldown_s", 0.0))

    return PersistedPlayer(
      pos_x=pos_x,
      pos_y=pos_y,
      pos_z=pos_z,
      vel_x=vel_x,
      vel_y=vel_y,
      vel_z=vel_z,
      yaw_deg=coerce_float(d.get("yaw_deg", 0.0), 0.0),
      pitch_deg=coerce_float(d.get("pitch_deg", 0.0), 0.0),
      on_ground=coerce_bool(d.get("on_ground", False), False),
      flying=coerce_bool(d.get("flying", False), False),
      auto_jump_cooldown_s=coerce_float(cooldown_raw, 0.0),
      crouch_eye_offset=coerce_float(d.get("crouch_eye_offset", 0.0), 0.0),
      health=coerce_float(d.get("health", 20.0), 20.0),
      max_health=max(1.0, coerce_float(d.get("max_health", 20.0), 20.0)),
    )
