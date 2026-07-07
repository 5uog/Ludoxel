# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.sessions.context.builders import make_session_manager
from ludoxel.application.sessions.managers.session import SessionManager
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.spaces.my_world.session import MyWorldSessionSeed, make_my_world_state
from ludoxel.simulation.worlds.generation.spec import WorldGenerationSpec


def create_my_world_session(*, generation: WorldGenerationSpec | None = None, block_registry: BlockRegistry) -> SessionManager:
  spec = (generation if isinstance(generation, WorldGenerationSpec) else WorldGenerationSpec()).normalized()
  session_seed = MyWorldSessionSeed(generation=spec)
  return make_session_manager(seed=int(session_seed.seed), spawn=tuple(session_seed.spawn), yaw_deg=float(session_seed.yaw_deg), pitch_deg=float(session_seed.pitch_deg), world=make_my_world_state(spec), block_registry=block_registry)
