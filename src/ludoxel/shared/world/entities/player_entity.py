# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass
import math

from ...math.scalars import clampf
from ...math.vec3 import Vec3
from ...math.geometry.aabb import AABB
from ...math.view_angles import forward_from_yaw_pitch_deg


@dataclass
class PlayerEntity:
    position: Vec3
    velocity: Vec3
    yaw_deg: float
    pitch_deg: float

    health: float = 20.0
    max_health: float = 20.0
    hurt_cooldown_s: float = 0.0
    hurt_flash_s: float = 0.0
    hurt_flash_duration_s: float = 0.0
    hurt_tilt_s: float = 0.0
    hurt_tilt_duration_s: float = 0.0
    hurt_tilt_sign: float = 1.0
    jump_reset_window_s: float = 0.0

    on_ground: bool = False
    flying: bool = False

    width: float = 0.6
    height: float = 1.8

    eye_height: float = 1.62
    crouch_eye_drop: float = 0.25
    crouch_eye_offset: float = 0.0

    step_eye_offset: float = 0.0

    hold_jump_queued: bool = False

    auto_jump_pending: bool = False
    auto_jump_start_y: float = 0.0
    auto_jump_cooldown_s: float = 0.0
    fence_gate_overlap_exemption: tuple[int, int, int] | None = None
    gravity_block_overlap_exemptions: tuple[tuple[int, int, int], ...] = ()

    def eye_pos(self) -> Vec3:
        return Vec3(self.position.x, self.position.y + (self.eye_height - self.crouch_eye_offset) + self.step_eye_offset, self.position.z)

    def view_forward(self) -> Vec3:
        return forward_from_yaw_pitch_deg(self.yaw_deg, self.pitch_deg)

    def clamp_pitch(self) -> None:
        self.pitch_deg = clampf(self.pitch_deg, -89.5, 89.5)

    def aabb_at(self, pos: Vec3) -> AABB:
        hw = float(self.width) * 0.5
        mn = Vec3(pos.x - hw, pos.y, pos.z - hw)
        mx = Vec3(pos.x + hw, pos.y + float(self.height), pos.z + hw)
        return AABB(mn=mn, mx=mx)

    def alive(self) -> bool:
        return float(self.health) > 1e-6

    def clamp_health(self) -> None:
        self.max_health = max(1.0, float(self.max_health))
        self.health = clampf(float(self.health), 0.0, float(self.max_health))
        self.hurt_cooldown_s = max(0.0, float(self.hurt_cooldown_s))
        self.hurt_flash_s = max(0.0, float(self.hurt_flash_s))
        self.hurt_flash_duration_s = max(0.0, float(self.hurt_flash_duration_s))
        self.hurt_tilt_s = max(0.0, float(self.hurt_tilt_s))
        self.hurt_tilt_duration_s = max(0.0, float(self.hurt_tilt_duration_s))
        self.jump_reset_window_s = max(0.0, float(self.jump_reset_window_s))

    def heal_to_full(self) -> None:
        self.clamp_health()
        self.health = float(self.max_health)
        self.hurt_cooldown_s = 0.0
        self.hurt_flash_s = 0.0
        self.hurt_flash_duration_s = 0.0
        self.hurt_tilt_s = 0.0
        self.hurt_tilt_duration_s = 0.0
        self.jump_reset_window_s = 0.0

    def hurt_flash_strength(self) -> float:
        if float(self.hurt_flash_s) <= 1e-6 or float(self.hurt_flash_duration_s) <= 1e-6:
            return 0.0
        progress = clampf(float(self.hurt_flash_s) / float(self.hurt_flash_duration_s), 0.0, 1.0)
        return float(math.sin(progress * (math.pi * 0.5)))

    def hurt_camera_strength(self) -> float:
        if float(self.hurt_tilt_s) <= 1e-6 or float(self.hurt_tilt_duration_s) <= 1e-6:
            return 0.0
        progress = clampf(float(self.hurt_tilt_s) / float(self.hurt_tilt_duration_s), 0.0, 1.0)
        return float(math.sin(progress * (math.pi * 0.5)))

    def advance_hurt_state(self, dt: float) -> None:
        decay = max(0.0, float(dt))
        self.hurt_cooldown_s = max(0.0, float(self.hurt_cooldown_s) - decay)
        self.hurt_flash_s = max(0.0, float(self.hurt_flash_s) - decay)
        self.hurt_tilt_s = max(0.0, float(self.hurt_tilt_s) - decay)
        self.jump_reset_window_s = max(0.0, float(self.jump_reset_window_s) - decay)

    def trigger_hurt_feedback(self, *, source_position: Vec3 | None=None, flash_s: float=0.5, tilt_s: float=0.18, jump_reset_window_s: float=0.0) -> None:
        flash_duration = max(0.0, float(flash_s))
        tilt_duration = max(0.0, float(tilt_s))
        if float(flash_duration) > 0.0:
            self.hurt_flash_s = max(float(self.hurt_flash_s), float(flash_duration))
            self.hurt_flash_duration_s = max(float(self.hurt_flash_duration_s), float(flash_duration))
        if float(tilt_duration) > 0.0:
            self.hurt_tilt_s = max(float(self.hurt_tilt_s), float(tilt_duration))
            self.hurt_tilt_duration_s = max(float(self.hurt_tilt_duration_s), float(tilt_duration))
        self.jump_reset_window_s = max(float(self.jump_reset_window_s), max(0.0, float(jump_reset_window_s)))
        if source_position is None:
            self.hurt_tilt_sign = -1.0 if float(self.hurt_tilt_sign) >= 0.0 else 1.0
            return
        dx = float(source_position.x) - float(self.position.x)
        dz = float(source_position.z) - float(self.position.z)
        if abs(dx) <= 1e-6 and abs(dz) <= 1e-6:
            self.hurt_tilt_sign = -1.0 if float(self.hurt_tilt_sign) >= 0.0 else 1.0
            return
        forward = self.view_forward()
        forward_xz = Vec3(float(forward.x), 0.0, float(forward.z)).normalized()
        source_xz = Vec3(float(dx), 0.0, float(dz)).normalized()
        cross = float(forward_xz.x) * float(source_xz.z) - float(forward_xz.z) * float(source_xz.x)
        if abs(float(cross)) <= 1e-6:
            self.hurt_tilt_sign = -1.0 if float(self.hurt_tilt_sign) >= 0.0 else 1.0
        else:
            self.hurt_tilt_sign = -1.0 if float(cross) < 0.0 else 1.0

    def apply_damage(self, amount: float, *, cooldown_s: float=0.0, bypass_cooldown: bool=False, source_position: Vec3 | None=None, flash_s: float=0.5, tilt_s: float=0.18, jump_reset_window_s: float=0.0) -> float:
        self.clamp_health()
        if (not bool(bypass_cooldown)) and float(self.hurt_cooldown_s) > 1e-6:
            return 0.0
        damage = max(0.0, float(amount))
        if damage <= 1e-6 or (not self.alive()):
            return 0.0
        self.health = max(0.0, float(self.health) - float(damage))
        self.hurt_cooldown_s = max(0.0, float(cooldown_s))
        self.trigger_hurt_feedback(source_position=source_position, flash_s=float(flash_s), tilt_s=float(tilt_s), jump_reset_window_s=float(jump_reset_window_s))
        return float(damage)
