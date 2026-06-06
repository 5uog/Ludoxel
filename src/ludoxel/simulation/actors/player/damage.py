# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.entity import PlayerEntity

MELEE_ATTACK_DAMAGE = 1.0
MELEE_DAMAGE_COOLDOWN_S = 0.50
MELEE_HURT_FLASH_S = 0.50
MELEE_HURT_TILT_S = 0.18
MELEE_JUMP_RESET_WINDOW_S = 0.18
_VANILLA_TICKS_PER_SECOND = 20.0
VOID_DAMAGE_START_Y = -64.0
VOID_DAMAGE_INTERVAL_S = 0.50
VOID_DAMAGE_AMOUNT = 4.0
MELEE_KNOCKBACK_HORIZONTAL_SPEED = 0.40 * _VANILLA_TICKS_PER_SECOND
MELEE_KNOCKBACK_VERTICAL_SPEED = 0.40 * _VANILLA_TICKS_PER_SECOND
MELEE_SPRINT_BONUS_HORIZONTAL_SPEED = 0.50 * _VANILLA_TICKS_PER_SECOND
MELEE_ATTACKER_SPRINT_SPEED_KEEP = 0.60


def apply_void_damage(*, player: PlayerEntity, dt: float, timer_s: float) -> tuple[float, float]:
  if (not bool(player.alive())) or float(player.position.y) >= float(VOID_DAMAGE_START_Y):
    return (0.0, 0.0)
  remaining = max(0.0, float(timer_s)) + max(0.0, float(dt))
  damage_taken = 0.0
  while float(remaining) + 1e-9 >= float(VOID_DAMAGE_INTERVAL_S) and bool(player.alive()):
    remaining -= float(VOID_DAMAGE_INTERVAL_S)
    damage_taken += float(player.apply_damage(float(VOID_DAMAGE_AMOUNT), bypass_cooldown=True))
  return (float(damage_taken), max(0.0, float(remaining)))


def apply_melee_knockback(*, attacker: PlayerEntity, target: PlayerEntity, attack_direction: Vec3, sprinting: bool) -> None:
  horizontal = Vec3(float(target.position.x) - float(attacker.position.x), 0.0, float(target.position.z) - float(attacker.position.z))
  if float(horizontal.length()) <= 1e-6:
    horizontal = Vec3(float(attack_direction.x), 0.0, float(attack_direction.z))
  horizontal = horizontal.normalized()
  if float(horizontal.length()) <= 1e-6:
    horizontal = Vec3(0.0, 0.0, 1.0)

  knockback_speed = float(MELEE_KNOCKBACK_HORIZONTAL_SPEED) + (float(MELEE_SPRINT_BONUS_HORIZONTAL_SPEED) if bool(sprinting) else 0.0)
  vx = float(target.velocity.x) * 0.5 + float(horizontal.x) * float(knockback_speed)
  vz = float(target.velocity.z) * 0.5 + float(horizontal.z) * float(knockback_speed)
  vy = float(target.velocity.y)
  if bool(target.on_ground):
    vy = min(float(MELEE_KNOCKBACK_VERTICAL_SPEED), max(0.0, float(target.velocity.y) * 0.5) + float(MELEE_KNOCKBACK_VERTICAL_SPEED))
  target.velocity = Vec3(float(vx), float(vy), float(vz))
  target.on_ground = False

  if bool(sprinting):
    attacker.velocity = Vec3(float(attacker.velocity.x) * float(MELEE_ATTACKER_SPRINT_SPEED_KEEP), float(attacker.velocity.y), float(attacker.velocity.z) * float(MELEE_ATTACKER_SPRINT_SPEED_KEEP))


def apply_melee_damage(*, attacker: PlayerEntity, target: PlayerEntity, attack_direction: Vec3, sprinting: bool, damage: float = MELEE_ATTACK_DAMAGE) -> float:
  damage_taken = target.apply_damage(
    float(damage),
    cooldown_s=float(MELEE_DAMAGE_COOLDOWN_S),
    source_position=attacker.eye_pos(),
    flash_s=float(MELEE_HURT_FLASH_S),
    tilt_s=float(MELEE_HURT_TILT_S),
    jump_reset_window_s=float(MELEE_JUMP_RESET_WINDOW_S),
  )
  if float(damage_taken) <= 1e-6:
    return 0.0
  apply_melee_knockback(attacker=attacker, target=target, attack_direction=attack_direction, sprinting=bool(sprinting))
  return float(damage_taken)
