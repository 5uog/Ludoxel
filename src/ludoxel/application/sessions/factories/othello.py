# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.application.sessions.context.builders import make_session_manager
from ludoxel.application.sessions.managers.session import SessionManager
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.spaces.othello.game.board import ensure_othello_board_layout
from ludoxel.simulation.worlds.generation.flat import generate_flat_world
from ludoxel.simulation.worlds.state.world import WorldState

OTHELLO_SPAWN: tuple[float, float, float] = (0.0, 1.0, -12.0)
OTHELLO_YAW_DEG: float = 0.0
OTHELLO_PITCH_DEG: float = 0.0


@dataclass(frozen=True)
class OthelloSessionSeed:
  seed: int = 0
  spawn: tuple[float, float, float] = OTHELLO_SPAWN
  yaw_deg: float = OTHELLO_YAW_DEG
  pitch_deg: float = OTHELLO_PITCH_DEG


def _make_world() -> WorldState:
  world = generate_flat_world(half_extent=48, ground_y=0, block_id="minecraft:grass_block")
  ensure_othello_board_layout(world)
  return world


def create_othello_session(*, seed: int = 0, block_registry: BlockRegistry) -> SessionManager:
  spec = OthelloSessionSeed(seed=int(seed))
  return make_session_manager(seed=int(spec.seed), spawn=tuple(spec.spawn), yaw_deg=float(spec.yaw_deg), pitch_deg=float(spec.pitch_deg), world=_make_world(), block_registry=block_registry)
