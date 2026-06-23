# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from ludoxel.application.chat.commands.model import CommandEffects, CommandError, CommandResult, GameModeCommand, TeleportCommand, TeleportFacingPosition
from ludoxel.application.chat.commands.parser import parse_command
from ludoxel.application.chat.commands.targets import is_local_player_target, resolve_entity_anchor
from ludoxel.application.chat.messages import make_command_error_message, make_command_feedback_message
from ludoxel.application.sessions.game_mode import apply_game_mode
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.player.teleport import look_angles_toward

if TYPE_CHECKING:
  from ludoxel.application.preferences.runtime import RuntimePreferences
  from ludoxel.application.sessions.context.play_space import PlaySpaceContext


def _format_coordinate(value: float) -> str:
  numeric = float(value)
  if numeric == int(numeric):
    return str(int(numeric))
  return f"{numeric:.2f}".rstrip("0").rstrip(".")


def _entity_anchors(session) -> list[tuple[str, tuple[float, float, float]]]:
  anchors: list[tuple[str, tuple[float, float, float]]] = []
  for snapshot in session.ai_render_snapshots():
    anchors.append((str(snapshot.name), (float(snapshot.position_x), float(snapshot.position_y) + float(snapshot.height), float(snapshot.position_z))))
  return anchors


def _execute_teleport(command: TeleportCommand, *, prefs: "RuntimePreferences", sessions: "PlaySpaceContext") -> CommandResult:
  session = sessions.active_session()
  player = session.player

  yaw_deg: float | None = None
  pitch_deg: float | None = None
  if command.facing is not None:
    eye_after = Vec3(float(command.x), float(command.y) + float(player.eye_height), float(command.z))
    if isinstance(command.facing, TeleportFacingPosition):
      target = Vec3(float(command.facing.x), float(command.facing.y), float(command.facing.z))
    else:
      local_anchor = (float(player.position.x), float(player.position.y) + float(player.eye_height), float(player.position.z))
      resolved = resolve_entity_anchor(command.facing.token, entities=_entity_anchors(session), local_name=str(prefs.resolved_player_name), local_anchor=local_anchor)
      if resolved is None:
        return CommandResult(messages=(make_command_error_message(f"§cUnknown facing target: {command.facing.token}"),))
      target = Vec3(float(resolved[0]), float(resolved[1]), float(resolved[2]))
    angles = look_angles_toward(eye_after, target)
    if angles is None:
      return CommandResult(messages=(make_command_error_message("§cUnable to face the requested target."),))
    yaw_deg, pitch_deg = angles

  session.teleport(x=float(command.x), y=float(command.y), z=float(command.z), yaw_deg=yaw_deg, pitch_deg=pitch_deg)
  feedback = make_command_feedback_message(f"§aTeleported to §f{_format_coordinate(command.x)} {_format_coordinate(command.y)} {_format_coordinate(command.z)}§a.")
  return CommandResult(messages=(feedback,), effects=CommandEffects(teleported=True, chunk_for_blocks=bool(command.chunk_for_blocks)))


def _execute_gamemode(command: GameModeCommand, *, prefs: "RuntimePreferences", sessions: "PlaySpaceContext") -> CommandResult:
  if not is_local_player_target(command.target_token, local_name=str(prefs.resolved_player_name)):
    return CommandResult(messages=(make_command_error_message(f"§cUnknown or unsupported target: {command.target_token}"),))
  apply_game_mode(prefs, sessions.all_sessions(), creative=bool(command.creative))
  label = "Creative" if bool(command.creative) else "Survival"
  feedback = make_command_feedback_message(f"§aGame mode set to {label}.")
  return CommandResult(messages=(feedback,), effects=CommandEffects(game_mode_changed=True))


def execute_command(text: str, *, prefs: "RuntimePreferences", sessions: "PlaySpaceContext") -> CommandResult:
  parsed = parse_command(text)
  if isinstance(parsed, CommandError):
    return CommandResult(messages=(make_command_error_message(f"§c{parsed.message}"),))
  if isinstance(parsed, GameModeCommand):
    return _execute_gamemode(parsed, prefs=prefs, sessions=sessions)
  return _execute_teleport(parsed, prefs=prefs, sessions=sessions)
