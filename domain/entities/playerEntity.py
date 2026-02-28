# FILE: domain/entities/playerEntity.py
from __future__ import annotations

from dataclasses import dataclass

from core.math.vec3 import Vec3, clampf
from core.geometry.aabb import AABB
from core.math.viewAngles import forward_from_yaw_pitch_deg

@dataclass
class PlayerEntity:
    position: Vec3  # feet-center
    velocity: Vec3
    yaw_deg: float
    pitch_deg: float

    on_ground: bool = False

    # Jump gating to avoid "instant re-jump" right after landings while holding jump.
    jump_cooldown_s: float = 0.0

    width: float = 0.6
    height: float = 1.8

    eye_height: float = 1.62
    crouch_eye_drop: float = 0.25
    crouch_eye_offset: float = 0.0  # smoothed [0..0.25]

    def eye_pos(self) -> Vec3:
        return Vec3(self.position.x, self.position.y + (self.eye_height - self.crouch_eye_offset), self.position.z)

    def view_forward(self) -> Vec3:
        # Yaw convention: yaw increases to the left.
        return forward_from_yaw_pitch_deg(self.yaw_deg, self.pitch_deg)

    def clamp_pitch(self) -> None:
        self.pitch_deg = clampf(self.pitch_deg, -89.5, 89.5)

    def aabb_at(self, pos: Vec3) -> AABB:
        hw = self.width * 0.5
        mn = Vec3(pos.x - hw, pos.y, pos.z - hw)
        mx = Vec3(pos.x + hw, pos.y + self.height, pos.z + hw)
        return AABB(mn=mn, mx=mx)