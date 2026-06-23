# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.application.chat.commands.model import CommandError, GameModeCommand, ParsedCommand, TeleportCommand, TeleportFacingEntity, TeleportFacingPosition


def _parse_finite_float(token: str) -> float | None:
  try:
    value = float(token)
  except (TypeError, ValueError):
    return None
  if not math.isfinite(value):
    return None
  return value


def _parse_boolean(token: str) -> bool | None:
  lowered = str(token).strip().lower()
  if lowered in ("true", "1"):
    return True
  if lowered in ("false", "0"):
    return False
  return None


def _parse_teleport(args: list[str]) -> ParsedCommand:
  if len(args) < 3:
    return CommandError("Usage: /teleport <x> <y> <z> [facing <target|x y z>] [chunkForBlocks].")

  x = _parse_finite_float(args[0])
  y = _parse_finite_float(args[1])
  z = _parse_finite_float(args[2])
  if x is None or y is None or z is None:
    return CommandError("Teleport coordinates must be finite numbers.")

  rest = args[3:]
  facing: TeleportFacingPosition | TeleportFacingEntity | None = None
  chunk_for_blocks = False

  if not rest:
    return TeleportCommand(x=x, y=y, z=z, chunk_for_blocks=False, facing=None)

  if rest[0].lower() == "facing":
    facing_args = rest[1:]
    if not facing_args:
      return CommandError("Provide a target or x y z position after facing.")
    first_value = _parse_finite_float(facing_args[0])
    if first_value is not None:
      if len(facing_args) < 3:
        return CommandError("Facing a position requires three coordinates.")
      fy = _parse_finite_float(facing_args[1])
      fz = _parse_finite_float(facing_args[2])
      if fy is None or fz is None:
        return CommandError("Facing coordinates must be finite numbers.")
      facing = TeleportFacingPosition(x=first_value, y=fy, z=fz)
      trailing = facing_args[3:]
    else:
      facing = TeleportFacingEntity(token=str(facing_args[0]))
      trailing = facing_args[1:]
  else:
    facing = None
    trailing = rest

  if len(trailing) == 1:
    parsed = _parse_boolean(trailing[0])
    if parsed is None:
      return CommandError("chunkForBlocks must be true or false.")
    chunk_for_blocks = parsed
  elif len(trailing) > 1:
    return CommandError("Too many arguments for /teleport.")

  return TeleportCommand(x=x, y=y, z=z, chunk_for_blocks=chunk_for_blocks, facing=facing)


def _parse_gamemode(args: list[str]) -> ParsedCommand:
  if len(args) < 1:
    return CommandError("Usage: /gamemode <survival|creative> [player].")

  mode = str(args[0]).lower()
  if mode in ("survival", "s", "0"):
    creative = False
  elif mode in ("creative", "c", "1"):
    creative = True
  else:
    return CommandError(f"Invalid game mode: {args[0]}")

  target_token: str | None = None
  if len(args) == 2:
    target_token = str(args[1])
  elif len(args) > 2:
    return CommandError("Too many arguments for /gamemode.")

  return GameModeCommand(creative=creative, target_token=target_token)


def parse_command(text: str) -> ParsedCommand:
  tokens = str(text).split()
  if not tokens:
    return CommandError("Empty command.")
  head = tokens[0].lower()
  if head in ("/teleport", "/tp"):
    return _parse_teleport(tokens[1:])
  if head == "/gamemode":
    return _parse_gamemode(tokens[1:])
  return CommandError(f"Unknown command: {tokens[0]}")
