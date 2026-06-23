# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.simulation.actors.ai_players.learning.dataset import RECORD_PLAYER_MOVEMENT
from ludoxel.simulation.actors.ai_players.runtime import AiDeathLogEvent
from ludoxel.simulation.actors.player.damage import apply_void_damage
from ludoxel.simulation.actors.player.kinematics import PlayerStepInput, advance_runtime_player, fall_damage_amount
from ludoxel.simulation.rules.gravity.system import GravityBrokenBlock

_MOVE_EPS: float = 0.3


def _player_movement_action(*, move_f: float, move_s: float, jump_pressed: bool, sprint: bool, crouch: bool) -> str | None:
  if bool(jump_pressed):
    return "jump"
  forward = bool(float(move_f) > _MOVE_EPS)
  backward = bool(float(move_f) < -_MOVE_EPS)
  left = bool(float(move_s) < -_MOVE_EPS)
  right = bool(float(move_s) > _MOVE_EPS)
  if not (forward or backward or left or right):
    return "sneak" if bool(crouch) else None
  if forward and left:
    return "move_forward_left"
  if forward and right:
    return "move_forward_right"
  if backward and left:
    return "move_back_left"
  if backward and right:
    return "move_back_right"
  if forward:
    return "sprint" if bool(sprint) else "move_forward"
  if backward:
    return "move_back"
  if left:
    return "move_left"
  return "move_right"


@dataclass(frozen=True)
class SessionStepResult:
  jump_started: bool
  landed: bool
  footstep_triggered: bool
  support_block_state: str | None
  support_position: tuple[int, int, int] | None
  fall_distance_blocks: float | None
  damage_taken: float = 0.0
  death_reason: str | None = None
  death_killer_name: str | None = None
  gravity_broken_blocks: tuple[GravityBrokenBlock, ...] = ()
  play_damage_sound: bool = False
  play_landing_sound: bool = False
  ai_damage_sound_positions: tuple[tuple[float, float, float], ...] = ()
  ai_death_logs: tuple[AiDeathLogEvent, ...] = ()


def step_session(
  session,
  *,
  dt: float,
  move_f: float,
  move_s: float,
  jump_held: bool,
  jump_pressed: bool,
  sprint: bool,
  crouch: bool,
  mdx: float,
  mdy: float,
  creative_mode: bool,
  auto_jump_enabled: bool,
  paused_ai_actor_ids: tuple[str, ...] = (),
) -> SessionStepResult:
  session._sim_time_s += float(dt)
  gravity_result = session.gravity.step(session.world, float(dt), player=session.player)
  yaw_delta = (-float(mdx)) * float(session.settings.mouse_sens_deg_per_px)
  pitch_delta = float(mdy) * float(session.settings.mouse_sens_deg_per_px)

  session._update_creative_flight_toggle(creative_mode=bool(creative_mode), jump_pressed=bool(jump_pressed))

  step_result = advance_runtime_player(
    player=session.player,
    world=session.world,
    block_registry=session.block_registry,
    settings=session.settings,
    motion=session._player_motion,
    dt=float(dt),
    control=PlayerStepInput(
      move_f=float(move_f),
      move_s=float(move_s),
      jump_held=bool(jump_held),
      jump_pressed=bool(jump_pressed),
      sprint=bool(sprint),
      crouch=bool(crouch),
      yaw_delta_deg=float(yaw_delta),
      pitch_delta_deg=float(pitch_delta),
      auto_jump_enabled=bool(auto_jump_enabled),
    ),
  )

  fall_damage = 0.0
  void_damage = 0.0
  if not bool(creative_mode):
    fall_damage = session.player.apply_damage(fall_damage_amount(fall_distance_blocks=step_result.fall_distance_blocks), bypass_cooldown=True)
    void_damage, session._void_damage_timer_s = apply_void_damage(player=session.player, dt=float(dt), timer_s=float(session._void_damage_timer_s))
  else:
    session._void_damage_timer_s = 0.0
  ai_report = session.ai_players.step(
    dt=float(dt), target_player=session.player, allow_pvp=(not bool(creative_mode)), paused_actor_ids=tuple(str(actor_id) for actor_id in paused_ai_actor_ids), learning=session.learning
  )
  if session.learning.recording():
    movement_action = _player_movement_action(move_f=float(move_f), move_s=float(move_s), jump_pressed=bool(jump_pressed), sprint=bool(sprint), crouch=bool(crouch))
    if movement_action is not None:
      session._record_player_action(kind=RECORD_PLAYER_MOVEMENT, action_id=str(movement_action))
  fall_damage_applied = bool(float(fall_damage) > 1e-6)
  damage_taken = float(fall_damage) + float(void_damage) + float(ai_report.player_damage_taken)
  play_damage_sound = bool(fall_damage_applied or float(void_damage) > 1e-6 or float(ai_report.player_damage_taken) > 1e-6)
  play_landing_sound = bool(step_result.landed) and (not fall_damage_applied)

  death_reason: str | None = None
  if not session.player.alive():
    if float(void_damage) > 1e-6:
      death_reason = "void"
    elif float(fall_damage) > 1e-6:
      death_reason = "fall"
    elif ai_report.player_death_reason is not None:
      death_reason = str(ai_report.player_death_reason)
    else:
      death_reason = "damage"
  session._death_reason = death_reason

  return SessionStepResult(
    jump_started=bool(step_result.jump_started),
    landed=bool(step_result.landed),
    footstep_triggered=bool(step_result.footstep_triggered),
    support_block_state=step_result.support_block_state,
    support_position=step_result.support_position,
    fall_distance_blocks=step_result.fall_distance_blocks,
    damage_taken=float(damage_taken),
    death_reason=death_reason,
    death_killer_name=None if death_reason != "pvp" or ai_report.player_killer_name is None else str(ai_report.player_killer_name),
    gravity_broken_blocks=tuple(gravity_result.broken_blocks),
    play_damage_sound=bool(play_damage_sound),
    play_landing_sound=bool(play_landing_sound),
    ai_damage_sound_positions=tuple(ai_report.damage_sound_positions),
    ai_death_logs=tuple(ai_report.ai_death_logs),
  )
