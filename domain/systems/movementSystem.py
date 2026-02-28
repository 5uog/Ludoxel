# FILE: domain/systems/movementSystem.py
from __future__ import annotations
from dataclasses import dataclass
import math

from core.math.vec3 import Vec3, clampf
from domain.entities.playerEntity import PlayerEntity
from domain.config.movementParams import MovementParams, DEFAULT_MOVEMENT_PARAMS

@dataclass(frozen=True)
class MoveInput:
    forward: float   # -1..+1
    strafe: float    # -1..+1
    jump_pressed: bool
    crouch: bool
    yaw_delta_deg: float
    pitch_delta_deg: float

def _tick_dt(params: MovementParams) -> float:
    return 1.0 / max(float(params.tick_hz), 1e-6)

def _tick_pow(base_per_tick: float, dt: float, params: MovementParams) -> float:
    td = _tick_dt(params)
    return float(base_per_tick) ** (float(dt) / td)

def _smooth_alpha(dt: float, tau: float) -> float:
    if tau <= 1e-6:
        return 1.0
    return 1.0 - math.exp(-dt / tau)

def step_minecraft(player: PlayerEntity, inp: MoveInput, dt: float, params: MovementParams = DEFAULT_MOVEMENT_PARAMS) -> None:
    player.yaw_deg += inp.yaw_delta_deg
    player.pitch_deg += inp.pitch_delta_deg
    player.clamp_pitch()

    if player.jump_cooldown_s > 0.0:
        player.jump_cooldown_s = max(0.0, float(player.jump_cooldown_s) - float(dt))

    target = player.crouch_eye_drop if inp.crouch else 0.0
    a = _smooth_alpha(dt, float(params.crouch_smooth_tau))
    player.crouch_eye_offset = player.crouch_eye_offset + (target - player.crouch_eye_offset) * a

    yaw = math.radians(player.yaw_deg)
    fwd = Vec3(-math.sin(yaw), 0.0, math.cos(yaw))
    rgt = Vec3(math.cos(yaw), 0.0, math.sin(yaw))

    wish = (fwd * clampf(inp.forward, -1.0, 1.0)) + (rgt * clampf(inp.strafe, -1.0, 1.0))
    if wish.length() > 1e-6:
        wish = wish.normalized()
    else:
        wish = Vec3(0.0, 0.0, 0.0)

    max_speed = float(params.walk_speed) * (float(params.crouch_mult) if inp.crouch else 1.0)

    vx, vy, vz = player.velocity.x, player.velocity.y, player.velocity.z

    fr = float(params.friction_ground_per_tick) if player.on_ground else float(params.friction_air_per_tick)
    m = _tick_pow(fr, dt, params)
    vx *= m
    vz *= m

    acc = float(params.accel_ground) if player.on_ground else float(params.accel_air)
    vx += wish.x * acc * dt * max_speed
    vz += wish.z * acc * dt * max_speed

    hs = math.sqrt(vx * vx + vz * vz)
    if hs > max_speed and hs > 1e-9:
        s = max_speed / hs
        vx *= s
        vz *= s

    if player.on_ground:
        if vy < 0.0:
            vy = 0.0
        if inp.jump_pressed and player.jump_cooldown_s <= 0.0:
            vy = float(params.jump_v0)
            player.on_ground = False
    else:
        vy -= float(params.gravity) * dt
        if vy < -float(params.fall_speed_max):
            vy = -float(params.fall_speed_max)

    player.velocity = Vec3(vx, vy, vz)