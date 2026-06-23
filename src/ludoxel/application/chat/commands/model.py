# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.application.chat.messages import ChatMessage

GAME_MODE_SURVIVAL: str = "survival"
GAME_MODE_CREATIVE: str = "creative"


@dataclass(frozen=True, slots=True)
class TeleportFacingPosition:
  x: float
  y: float
  z: float


@dataclass(frozen=True, slots=True)
class TeleportFacingEntity:
  token: str


@dataclass(frozen=True, slots=True)
class TeleportCommand:
  x: float
  y: float
  z: float
  chunk_for_blocks: bool = False
  facing: TeleportFacingPosition | TeleportFacingEntity | None = None


@dataclass(frozen=True, slots=True)
class GameModeCommand:
  creative: bool
  target_token: str | None = None


@dataclass(frozen=True, slots=True)
class CommandError:
  message: str


ParsedCommand = TeleportCommand | GameModeCommand | CommandError


@dataclass(frozen=True, slots=True)
class CommandEffects:
  game_mode_changed: bool = False
  teleported: bool = False
  chunk_for_blocks: bool = False


@dataclass(frozen=True, slots=True)
class CommandResult:
  messages: tuple[ChatMessage, ...] = field(default_factory=tuple)
  effects: CommandEffects = field(default_factory=CommandEffects)
