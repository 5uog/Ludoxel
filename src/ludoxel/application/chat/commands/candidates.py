# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

TELEPORT_CANDIDATES: tuple[str, ...] = (
  "/teleport <destination: x y z> [chunkForBlocks: Boolean]",
  "/teleport <destination: x y z> facing <lookAtEntity: target> [chunkForBlocks: Boolean]",
  "/teleport <destination: x y z> facing <lookAtPosition: x y z> [chunkForBlocks: Boolean]",
)

GAMEMODE_CANDIDATES: tuple[str, ...] = ("/gamemode <gameMode: GameMode> [player: target]", "/gamemode <gameMode: int> [player: target]")


def candidates_for_input(text: str) -> tuple[str, ...]:
  source = str(text)
  if not source.startswith("/"):
    return ()
  body = source[1:]
  word = body.split(" ", 1)[0].lower() if body else ""
  if word == "":
    return TELEPORT_CANDIDATES + GAMEMODE_CANDIDATES
  if "teleport".startswith(word):
    return TELEPORT_CANDIDATES
  if "gamemode".startswith(word):
    return GAMEMODE_CANDIDATES
  return ()
