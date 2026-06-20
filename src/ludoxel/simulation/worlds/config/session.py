# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field, replace
from typing import ClassVar

from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.worlds.config.collision import DEFAULT_COLLISION_PARAMS, CollisionParams
from ludoxel.simulation.worlds.config.movement import DEFAULT_MOVEMENT_PARAMS, MovementParams


@dataclass
class SessionSettings:
  seed: int = 0
  fov_deg: float = 80.0
  mouse_sens_deg_per_px: float = 0.09

  spawn_x: float = 0.0
  spawn_y: float = 1.0
  spawn_z: float = 0.0

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
    self.fov_deg = float(clampf(float(fov), float(self.FOV_MIN), float(self.FOV_MAX)))

  def set_mouse_sens(self, sens: float) -> None:
    self.mouse_sens_deg_per_px = float(clampf(float(sens), float(self.SENS_MIN), float(self.SENS_MAX)))

  def set_gravity(self, gravity: float) -> None:
    self.movement = replace(self.movement, gravity=float(clampf(float(gravity), float(self.GRAVITY_MIN), float(self.GRAVITY_MAX))))

  def set_walk_speed(self, walk_speed: float) -> None:
    self.movement = replace(self.movement, walk_speed=float(clampf(float(walk_speed), float(self.WALK_SPEED_MIN), float(self.WALK_SPEED_MAX))))

  def set_sprint_speed(self, sprint_speed: float) -> None:
    self.movement = replace(self.movement, sprint_speed=float(clampf(float(sprint_speed), float(self.SPRINT_SPEED_MIN), float(self.SPRINT_SPEED_MAX))))

  def set_jump_v0(self, jump_v0: float) -> None:
    self.movement = replace(self.movement, jump_v0=float(clampf(float(jump_v0), float(self.JUMP_V0_MIN), float(self.JUMP_V0_MAX))))

  def set_auto_jump_cooldown_s(self, cooldown_s: float) -> None:
    self.movement = replace(self.movement, auto_jump_cooldown_s=float(clampf(float(cooldown_s), float(self.AUTO_JUMP_COOLDOWN_MIN), float(self.AUTO_JUMP_COOLDOWN_MAX))))

  def set_fly_speed(self, fly_speed: float) -> None:
    self.movement = replace(self.movement, fly_speed=float(clampf(float(fly_speed), float(self.FLY_SPEED_MIN), float(self.FLY_SPEED_MAX))))

  def set_fly_ascend_speed(self, fly_ascend_speed: float) -> None:
    self.movement = replace(self.movement, fly_ascend_speed=float(clampf(float(fly_ascend_speed), float(self.FLY_ASCEND_SPEED_MIN), float(self.FLY_ASCEND_SPEED_MAX))))

  def set_fly_descend_speed(self, fly_descend_speed: float) -> None:
    self.movement = replace(self.movement, fly_descend_speed=float(clampf(float(fly_descend_speed), float(self.FLY_DESCEND_SPEED_MIN), float(self.FLY_DESCEND_SPEED_MAX))))

  def reset_advanced_movement_defaults(self) -> None:
    self.movement = replace(
      self.movement,
      gravity=float(DEFAULT_MOVEMENT_PARAMS.gravity),
      walk_speed=float(DEFAULT_MOVEMENT_PARAMS.walk_speed),
      sprint_speed=float(DEFAULT_MOVEMENT_PARAMS.sprint_speed),
      jump_v0=float(DEFAULT_MOVEMENT_PARAMS.jump_v0),
      auto_jump_cooldown_s=float(DEFAULT_MOVEMENT_PARAMS.auto_jump_cooldown_s),
      fly_speed=float(DEFAULT_MOVEMENT_PARAMS.fly_speed),
      fly_ascend_speed=float(DEFAULT_MOVEMENT_PARAMS.fly_ascend_speed),
      fly_descend_speed=float(DEFAULT_MOVEMENT_PARAMS.fly_descend_speed),
    )
