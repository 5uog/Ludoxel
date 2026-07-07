# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass

from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.player.entity import PlayerEntity
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.rules.collision.system import can_auto_jump_one_block, integrate_with_collisions, support_block_beneath
from ludoxel.simulation.rules.movement.system import MoveInput, step_bedrock, step_flying, wish_dir_from_input
from ludoxel.simulation.worlds.config.session import SessionSettings
from ludoxel.simulation.worlds.state.world import WorldState

PLAYER_WALK_PHASE_RATE_AT_WALK_SPEED = 8.0
PLAYER_WALK_MAX_SWING_SCALE = 1.35
PLAYER_FOOTSTEP_MIN_SPEED = 0.15
FALL_DAMAGE_SAFE_DISTANCE_BLOCKS = 3.0

PLAYER_BODY_YAW_FOLLOW_TAU_S = 0.24
PLAYER_HEAD_BODY_YAW_MAX_DEG = 58.0
PLAYER_HEAD_VISUAL_LAG_TAU_S = 0.09
PLAYER_HEAD_VISUAL_YAW_LAG_MAX_DEG = 12.0
PLAYER_HEAD_VISUAL_PITCH_LAG_MAX_DEG = 6.0

PLAYER_STRAFE_BODY_TURN_MAX_DEG = 18.0
PLAYER_STRAFE_BODY_TURN_TAU_S = 0.40
PLAYER_STRAFE_INPUT_EPS = 0.3


@dataclass
class PlayerMotionState:
  walk_phase_rad: float = 0.0
  walk_phase_total_rad: float = 0.0
  airborne_start_y: float | None = None
  visual_time_s: float = 0.0
  body_visual_yaw_deg: float | None = None
  head_visual_yaw_deg: float | None = None
  head_visual_pitch_deg: float | None = None
  strafe_turn_deg: float = 0.0


@dataclass(frozen=True)
class PlayerStepInput:
  move_f: float
  move_s: float
  jump_held: bool
  jump_pressed: bool
  sprint: bool
  crouch: bool
  yaw_delta_deg: float
  pitch_delta_deg: float
  auto_jump_enabled: bool


@dataclass(frozen=True)
class RuntimePlayerStepResult:
  jump_started: bool
  landed: bool
  footstep_triggered: bool
  support_block_state: str | None
  support_position: tuple[int, int, int] | None
  fall_distance_blocks: float | None


def fall_damage_amount(*, fall_distance_blocks: float | None) -> float:
  if fall_distance_blocks is None:
    return 0.0
  distance = max(0.0, float(fall_distance_blocks))
  if distance <= float(FALL_DAMAGE_SAFE_DISTANCE_BLOCKS):
    return 0.0
  return float(math.ceil(float(distance) - float(FALL_DAMAGE_SAFE_DISTANCE_BLOCKS)))


def _update_crouch_eye(player: PlayerEntity, *, dt: float, crouch: bool) -> None:
  target = float(player.crouch_eye_drop) if bool(crouch) else 0.0
  current = float(player.crouch_eye_offset)
  alpha = 1.0 - math.exp(-18.0 * max(0.0, float(dt)))
  next_value = current + (target - current) * alpha
  next_value = max(0.0, min(float(player.crouch_eye_drop), float(next_value)))
  player.crouch_eye_offset = float(next_value)


def _update_step_eye(player: PlayerEntity, *, dt: float) -> None:
  current = float(player.step_eye_offset)
  if abs(current) <= 1e-6:
    player.step_eye_offset = 0.0
    return
  alpha = 1.0 - math.exp(-18.0 * max(0.0, float(dt)))
  next_value = current + (0.0 - current) * alpha
  if abs(next_value) <= 1e-6:
    next_value = 0.0
  player.step_eye_offset = float(next_value)


def _ease_angle_toward(current: float | None, target: float, *, tau: float, dt: float, max_lag_deg: float) -> float:
  if current is None:
    return float(math.remainder(float(target), 360.0))
  diff = float(math.remainder(float(target) - float(current), 360.0))
  alpha = 1.0 - math.exp(-float(dt) / float(tau)) if float(tau) > 1e-6 else 1.0
  next_value = float(current) + float(diff) * float(alpha)
  remaining = float(math.remainder(float(target) - float(next_value), 360.0))
  if remaining > float(max_lag_deg):
    next_value = float(target) - float(max_lag_deg)
  elif remaining < -float(max_lag_deg):
    next_value = float(target) + float(max_lag_deg)
  return float(math.remainder(float(next_value), 360.0))


def _update_player_visual_animation(player: PlayerEntity, *, motion: PlayerMotionState, dt: float) -> None:
  step = max(0.0, float(dt))
  motion.visual_time_s = float(motion.visual_time_s) + float(step)
  motion.body_visual_yaw_deg = _ease_angle_toward(motion.body_visual_yaw_deg, float(player.yaw_deg), tau=float(PLAYER_BODY_YAW_FOLLOW_TAU_S), dt=float(step), max_lag_deg=float(PLAYER_HEAD_BODY_YAW_MAX_DEG))
  motion.head_visual_yaw_deg = _ease_angle_toward(motion.head_visual_yaw_deg, float(player.yaw_deg), tau=float(PLAYER_HEAD_VISUAL_LAG_TAU_S), dt=float(step), max_lag_deg=float(PLAYER_HEAD_VISUAL_YAW_LAG_MAX_DEG))
  motion.head_visual_pitch_deg = _ease_angle_toward(motion.head_visual_pitch_deg, float(player.pitch_deg), tau=float(PLAYER_HEAD_VISUAL_LAG_TAU_S), dt=float(step), max_lag_deg=float(PLAYER_HEAD_VISUAL_PITCH_LAG_MAX_DEG))


def _update_player_strafe_body_turn(*, motion: PlayerMotionState, control: PlayerStepInput, dt: float) -> None:
  step = max(0.0, float(dt))
  forward = clampf(float(control.move_f), -1.0, 1.0)
  strafe = clampf(float(control.move_s), -1.0, 1.0)

  target = 0.0
  if abs(float(strafe)) > float(PLAYER_STRAFE_INPUT_EPS) and abs(float(forward)) <= float(PLAYER_STRAFE_INPUT_EPS):
    target = -float(strafe) * float(PLAYER_STRAFE_BODY_TURN_MAX_DEG)

  if step <= 1e-6:
    return
  tau = max(1e-6, float(PLAYER_STRAFE_BODY_TURN_TAU_S))
  alpha = 1.0 - math.exp(-float(step) / float(tau))
  motion.strafe_turn_deg = float(motion.strafe_turn_deg) + (float(target) - float(motion.strafe_turn_deg)) * float(alpha)
  if abs(float(motion.strafe_turn_deg)) <= 1e-4 and abs(float(target)) <= 1e-4:
    motion.strafe_turn_deg = 0.0


def _update_player_walk_phase(player: PlayerEntity, *, motion: PlayerMotionState, dt: float, walk_speed: float) -> bool:
  speed = math.hypot(float(player.velocity.x), float(player.velocity.z))
  if speed <= 1e-6:
    return False

  base = max(1e-6, float(walk_speed))
  rate = float(PLAYER_WALK_PHASE_RATE_AT_WALK_SPEED) * (float(speed) / float(base))
  previous_total = float(motion.walk_phase_total_rad)
  motion.walk_phase_total_rad = float(previous_total + rate * float(dt))
  motion.walk_phase_rad = float(motion.walk_phase_total_rad % (2.0 * math.pi))

  if bool(player.flying) or (not bool(player.on_ground)) or speed < float(PLAYER_FOOTSTEP_MIN_SPEED):
    return False
  return int(math.floor(previous_total / math.pi)) != int(math.floor(float(motion.walk_phase_total_rad) / math.pi))


def _support_contact(player: PlayerEntity, *, world: WorldState, block_registry: BlockRegistry, settings: SessionSettings) -> tuple[str | None, tuple[int, int, int] | None]:
  contact = support_block_beneath(player, world, block_registry=block_registry, params=settings.collision)
  if contact is None:
    return (None, None)
  return (str(contact.block_state), tuple(int(value) for value in contact.cell))


def advance_runtime_player(*, player: PlayerEntity, world: WorldState, block_registry: BlockRegistry, settings: SessionSettings, motion: PlayerMotionState, dt: float, control: PlayerStepInput) -> RuntimePlayerStepResult:
  player.advance_hurt_state(float(dt))

  prev_on_ground = bool(player.on_ground)
  prev_vy = float(player.velocity.y)
  prev_pos_y = float(player.position.y)

  player.yaw_deg += float(control.yaw_delta_deg)
  player.pitch_deg += float(control.pitch_delta_deg)
  player.clamp_pitch()

  _update_player_visual_animation(player, motion=motion, dt=float(dt))
  _update_player_strafe_body_turn(motion=motion, control=control, dt=float(dt))

  if not bool(control.jump_held):
    player.hold_jump_queued = False

  if bool(player.flying):
    move_input = MoveInput(forward=clampf(control.move_f, -1.0, 1.0), strafe=clampf(control.move_s, -1.0, 1.0), sprint=bool(control.sprint), crouch=bool(control.crouch), jump_pulse=False, jump_held=bool(control.jump_held), yaw_delta_deg=0.0, pitch_delta_deg=0.0)
    step_flying(player, move_input, float(dt), params=settings.movement)
    integrate_with_collisions(player, world, float(dt), block_registry=block_registry, params=settings.collision, crouch=False, jump_pressed=False, flying=True)

    player.hold_jump_queued = False
    player.auto_jump_pending = False
    motion.airborne_start_y = None

    _update_crouch_eye(player, dt=float(dt), crouch=False)
    _update_step_eye(player, dt=float(dt))
    _update_player_walk_phase(player, motion=motion, dt=float(dt), walk_speed=float(settings.movement.walk_speed))
    support_state, support_position = _support_contact(player, world=world, block_registry=block_registry, settings=settings)
    return RuntimePlayerStepResult(jump_started=False, landed=False, footstep_triggered=False, support_block_state=support_state, support_position=support_position, fall_distance_blocks=None)

  jump_pulse = False
  if bool(player.on_ground) and bool(control.jump_pressed):
    jump_pulse = True
  elif bool(player.on_ground) and bool(player.hold_jump_queued) and bool(control.jump_held):
    jump_pulse = True
    player.hold_jump_queued = False
  elif bool(control.auto_jump_enabled) and (not bool(control.jump_held)) and bool(player.on_ground):
    cooldown = float(player.auto_jump_cooldown_s)
    if cooldown > 0.0:
      player.auto_jump_cooldown_s = max(0.0, cooldown - float(dt))
    else:
      forward = clampf(control.move_f, -1.0, 1.0)
      strafe = clampf(control.move_s, -1.0, 1.0)
      if abs(float(forward)) + abs(float(strafe)) > 1e-6:
        wish = wish_dir_from_input(player, forward, strafe)
        probe = float(settings.movement.auto_jump_probe)
        dx = float(wish.x) * probe
        dz = float(wish.z) * probe
        if can_auto_jump_one_block(player, world, dx=dx, dz=dz, block_registry=block_registry, params=settings.collision):
          jump_pulse = True
          player.auto_jump_pending = True
          player.auto_jump_start_y = float(player.position.y)

  move_input = MoveInput(forward=clampf(control.move_f, -1.0, 1.0), strafe=clampf(control.move_s, -1.0, 1.0), sprint=bool(control.sprint), crouch=bool(control.crouch), jump_pulse=bool(jump_pulse), jump_held=bool(control.jump_held), yaw_delta_deg=0.0, pitch_delta_deg=0.0)
  step_bedrock(player, move_input, float(dt), params=settings.movement)
  report = integrate_with_collisions(player, world, float(dt), block_registry=block_registry, params=settings.collision, crouch=bool(control.crouch), jump_pressed=bool(jump_pulse), flying=False)

  if not bool(report.supported_after):
    if motion.airborne_start_y is None:
      motion.airborne_start_y = float(prev_pos_y)

  landed_now = (not prev_on_ground) and bool(report.supported_after) and (float(prev_vy) <= 0.0)
  fall_distance_blocks: float | None = None
  if bool(landed_now):
    start_y = float(prev_pos_y) if motion.airborne_start_y is None else float(motion.airborne_start_y)
    fall_distance_blocks = max(0.0, float(start_y) - float(player.position.y))

  if bool(landed_now) and bool(control.jump_held):
    player.hold_jump_queued = True

  if bool(landed_now) and bool(player.auto_jump_pending):
    delta_y = float(player.position.y) - float(player.auto_jump_start_y)
    if delta_y >= float(settings.movement.auto_jump_success_dy):
      player.auto_jump_cooldown_s = float(settings.movement.auto_jump_cooldown_s)
    player.auto_jump_pending = False

  delta_y_correction = float(report.y_correction_dy)
  step_height = float(settings.collision.step_height)
  if abs(delta_y_correction) > 1e-6 and abs(delta_y_correction) <= (step_height + 1e-3) and bool(report.supported_before) and bool(report.supported_after) and (not bool(jump_pulse)) and abs(float(prev_vy)) <= 1e-6 and abs(float(player.velocity.y)) <= 1e-6:
    player.step_eye_offset = float(player.step_eye_offset) - float(delta_y_correction)

  if bool(report.supported_after):
    motion.airborne_start_y = None

  _update_crouch_eye(player, dt=float(dt), crouch=bool(control.crouch))
  _update_step_eye(player, dt=float(dt))
  footstep_triggered = _update_player_walk_phase(player, motion=motion, dt=float(dt), walk_speed=float(settings.movement.walk_speed))
  support_state, support_position = _support_contact(player, world=world, block_registry=block_registry, settings=settings)
  return RuntimePlayerStepResult(jump_started=bool(jump_pulse), landed=bool(landed_now), footstep_triggered=bool(footstep_triggered), support_block_state=support_state, support_position=support_position, fall_distance_blocks=fall_distance_blocks)
