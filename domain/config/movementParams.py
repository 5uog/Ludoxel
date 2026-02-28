# FILE: domain/config/movementParams.py
from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class MovementParams:
    tick_hz: float = 20.0

    gravity: float = 32.0
    fall_speed_max: float = 78.4
    jump_v0: float = 8.0

    # Minimum time between successful jumps while jump is held.
    # This delay is primarily applied after landing to avoid "instant re-jump" on step-ups.
    jump_repeat_delay_s: float = 0.12

    walk_speed: float = 5.317
    crouch_mult: float = 0.3

    friction_air_per_tick: float = 0.91
    friction_ground_per_tick: float = 0.91 * 0.6

    accel_ground: float = 35.0
    accel_air: float = 8.0

    crouch_smooth_tau: float = 0.08

DEFAULT_MOVEMENT_PARAMS = MovementParams()