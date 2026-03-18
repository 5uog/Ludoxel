# Copyright 2026 Kento Konishi (https://github.com/5uog)
# SPDX-License-Identifier: Apache-2.0

# FILE: src/ludoxel/application/context/my_world/session_factory.py
from __future__ import annotations

from dataclasses import dataclass

from ....domain.blocks.block_registry import BlockRegistry
from ....domain.world.world_gen import generate_test_map
from ....domain.world.world_state import WorldState
from ...managers.session_manager import SessionManager
from ..session_factory_support import make_player_entity, make_session_settings

MY_WORLD_SPAWN: tuple[float, float, float] = (0.0, 1.0, -10.0)
MY_WORLD_YAW_DEG: float = 0.0
MY_WORLD_PITCH_DEG: float = 0.0


@dataclass(frozen=True)
class MyWorldSessionSeed:
    seed: int = 0
    spawn: tuple[float, float, float] = MY_WORLD_SPAWN
    yaw_deg: float = MY_WORLD_YAW_DEG
    pitch_deg: float = MY_WORLD_PITCH_DEG


def _make_world(seed: int) -> WorldState:
    return generate_test_map(seed=int(seed))


def create_my_world_session(*, seed: int = 0, block_registry: BlockRegistry) -> SessionManager:
    session_seed = MyWorldSessionSeed(seed=int(seed))
    return SessionManager(
        settings=make_session_settings(
            seed=int(session_seed.seed),
            spawn=tuple(session_seed.spawn),
        ),
        world=_make_world(seed=int(session_seed.seed)),
        player=make_player_entity(
            spawn=tuple(session_seed.spawn),
            yaw_deg=float(session_seed.yaw_deg),
            pitch_deg=float(session_seed.pitch_deg),
        ),
        block_registry=block_registry,
    )
