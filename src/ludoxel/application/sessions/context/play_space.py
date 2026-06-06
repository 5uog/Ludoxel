# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.application.sessions.factories.my_world import create_my_world_session
from ludoxel.application.sessions.factories.othello import create_othello_session
from ludoxel.application.sessions.managers.session import SessionManager
from ludoxel.simulation.blocks.registries.default import create_default_registry
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_IDS, PLAY_SPACE_MY_WORLD, PLAY_SPACE_OTHELLO, normalize_play_space_id


@dataclass
class PlaySpaceContext:
  my_world: SessionManager
  othello: SessionManager
  active_space_id: str = PLAY_SPACE_MY_WORLD

  @staticmethod
  def create_default(seed: int = 0) -> "PlaySpaceContext":
    registry = create_default_registry()

    my_world = create_my_world_session(seed=int(seed), block_registry=registry)
    othello = create_othello_session(seed=int(seed), block_registry=registry)

    return PlaySpaceContext(my_world=my_world, othello=othello, active_space_id=PLAY_SPACE_MY_WORLD)

  def all_sessions(self) -> tuple[SessionManager, ...]:
    return (self.my_world, self.othello)

  def session_for(self, space_id: object) -> SessionManager:
    normalized = normalize_play_space_id(space_id)
    if normalized == PLAY_SPACE_OTHELLO:
      return self.othello
    return self.my_world

  def active_session(self) -> SessionManager:
    return self.session_for(self.active_space_id)

  def set_active_space(self, space_id: object) -> SessionManager:
    normalized = normalize_play_space_id(space_id)
    self.active_space_id = normalized
    return self.session_for(normalized)

  def known_space_ids(self) -> tuple[str, ...]:
    return PLAY_SPACE_IDS

  def shutdown(self) -> None:
    for session in self.all_sessions():
      session.shutdown()
