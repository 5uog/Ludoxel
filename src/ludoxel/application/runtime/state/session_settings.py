# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass, field, replace
from typing import ClassVar

from ....shared.math.scalars import clampf
from ....shared.world.config.collision_params import DEFAULT_COLLISION_PARAMS, CollisionParams
from ....shared.world.config.movement_params import DEFAULT_MOVEMENT_PARAMS, MovementParams


@dataclass
class SessionSettings:
    """I model the session-local player and camera parameter vector as S = (seed, fov, sensitivity, spawn, movement, collision). I keep each scalar inside an explicit admissible interval so that simulation and UI code can treat this object as a normalized control surface."""
    seed: int = 0
    fov_deg: float = 80.0
    mouse_sens_deg_per_px: float = 0.09

    spawn_x: float = 0.0
    spawn_y: float = 1.0
    spawn_z: float = -10.0

    movement: MovementParams = field(default_factory=lambda: DEFAULT_MOVEMENT_PARAMS)
    collision: CollisionParams = field(default_factory=lambda: DEFAULT_COLLISION_PARAMS)

    FOV_MIN: ClassVar[float] = 50.0
    FOV_MAX: ClassVar[float] = 110.0
    SENS_MIN: ClassVar[float] = 0.01
    SENS_MAX: ClassVar[float] = 0.30

    GRAVITY_MIN: ClassVar[float] = 1.0
    GRAVITY_MAX: ClassVar[float] = 64.0

    WALK_SPEED_MIN: ClassVar[float] = 0.10
    WALK_SPEED_MAX: ClassVar[float] = 12.0

    SPRINT_SPEED_MIN: ClassVar[float] = 0.10
    SPRINT_SPEED_MAX: ClassVar[float] = 16.0

    JUMP_V0_MIN: ClassVar[float] = 0.10
    JUMP_V0_MAX: ClassVar[float] = 20.0

    AUTO_JUMP_COOLDOWN_MIN: ClassVar[float] = 0.0
    AUTO_JUMP_COOLDOWN_MAX: ClassVar[float] = 2.0

    FLY_SPEED_MIN: ClassVar[float] = 0.10
    FLY_SPEED_MAX: ClassVar[float] = 32.0

    FLY_ASCEND_SPEED_MIN: ClassVar[float] = 0.10
    FLY_ASCEND_SPEED_MAX: ClassVar[float] = 32.0

    FLY_DESCEND_SPEED_MIN: ClassVar[float] = 0.10
    FLY_DESCEND_SPEED_MAX: ClassVar[float] = 32.0

    def set_fov(self, fov: float) -> None:
        """I assign fov := clamp_R(fov, FOV_MIN, FOV_MAX). This preserves the finite optical interval used by the projection pipeline."""
        self.fov_deg = float(clampf(float(fov), float(self.FOV_MIN), float(self.FOV_MAX)))

    def set_mouse_sens(self, sens: float) -> None:
        """I assign sensitivity := clamp_R(sens, SENS_MIN, SENS_MAX). This bounds per-pixel yaw and pitch gain inside the calibrated control interval."""
        self.mouse_sens_deg_per_px = float(clampf(float(sens), float(self.SENS_MIN), float(self.SENS_MAX)))

    def set_gravity(self, gravity: float) -> None:
        """I assign g := clamp_R(g, GRAVITY_MIN, GRAVITY_MAX) inside the movement parameter record."""
        value = float(clampf(float(gravity), float(self.GRAVITY_MIN), float(self.GRAVITY_MAX)))
        self.movement = replace(self.movement, gravity=value)

    def set_walk_speed(self, walk_speed: float) -> None:
        """I assign v_walk := clamp_R(v_walk, WALK_SPEED_MIN, WALK_SPEED_MAX) inside the movement parameter record."""
        value = float(clampf(float(walk_speed), float(self.WALK_SPEED_MIN), float(self.WALK_SPEED_MAX)))
        self.movement = replace(self.movement, walk_speed=value)

    def set_sprint_speed(self, sprint_speed: float) -> None:
        """I assign v_sprint := clamp_R(v_sprint, SPRINT_SPEED_MIN, SPRINT_SPEED_MAX) inside the movement parameter record."""
        value = float(clampf(float(sprint_speed), float(self.SPRINT_SPEED_MIN), float(self.SPRINT_SPEED_MAX)))
        self.movement = replace(self.movement, sprint_speed=value)

    def set_jump_v0(self, jump_v0: float) -> None:
        """I assign v0 := clamp_R(v0, JUMP_V0_MIN, JUMP_V0_MAX) for the jump launch parameter."""
        value = float(clampf(float(jump_v0), float(self.JUMP_V0_MIN), float(self.JUMP_V0_MAX)))
        self.movement = replace(self.movement, jump_v0=value)

    def set_auto_jump_cooldown_s(self, cooldown_s: float) -> None:
        """I assign c := clamp_R(c, AUTO_JUMP_COOLDOWN_MIN, AUTO_JUMP_COOLDOWN_MAX) for the automatic jump cooldown."""
        value = float(clampf(float(cooldown_s), float(self.AUTO_JUMP_COOLDOWN_MIN), float(self.AUTO_JUMP_COOLDOWN_MAX)))
        self.movement = replace(self.movement, auto_jump_cooldown_s=value)

    def set_fly_speed(self, fly_speed: float) -> None:
        """I assign v_fly := clamp_R(v_fly, FLY_SPEED_MIN, FLY_SPEED_MAX) for planar flight motion."""
        value = float(clampf(float(fly_speed), float(self.FLY_SPEED_MIN), float(self.FLY_SPEED_MAX)))
        self.movement = replace(self.movement, fly_speed=value)

    def set_fly_ascend_speed(self, fly_ascend_speed: float) -> None:
        """I assign v_up := clamp_R(v_up, FLY_ASCEND_SPEED_MIN, FLY_ASCEND_SPEED_MAX) for upward flight motion."""
        value = float(clampf(float(fly_ascend_speed), float(self.FLY_ASCEND_SPEED_MIN), float(self.FLY_ASCEND_SPEED_MAX)))
        self.movement = replace(self.movement, fly_ascend_speed=value)

    def set_fly_descend_speed(self, fly_descend_speed: float) -> None:
        """I assign v_down := clamp_R(v_down, FLY_DESCEND_SPEED_MIN, FLY_DESCEND_SPEED_MAX) for downward flight motion."""
        value = float(clampf(float(fly_descend_speed), float(self.FLY_DESCEND_SPEED_MIN), float(self.FLY_DESCEND_SPEED_MAX)))
        self.movement = replace(self.movement, fly_descend_speed=value)

    def reset_advanced_movement_defaults(self) -> None:
        """I set the advanced movement subvector back to the calibrated default point M_0. This is an exact replacement, not an incremental correction."""
        self.movement = replace(self.movement, gravity=float(DEFAULT_MOVEMENT_PARAMS.gravity), walk_speed=float(DEFAULT_MOVEMENT_PARAMS.walk_speed), sprint_speed=float(DEFAULT_MOVEMENT_PARAMS.sprint_speed), jump_v0=float(DEFAULT_MOVEMENT_PARAMS.jump_v0), auto_jump_cooldown_s=float(DEFAULT_MOVEMENT_PARAMS.auto_jump_cooldown_s), fly_speed=float(DEFAULT_MOVEMENT_PARAMS.fly_speed), fly_ascend_speed=float(DEFAULT_MOVEMENT_PARAMS.fly_ascend_speed), fly_descend_speed=float(DEFAULT_MOVEMENT_PARAMS.fly_descend_speed))
