# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.manager import AiLocalAttackResult, AiRoutePathSnapshot
from ludoxel.simulation.actors.ai_players.state import AiPlayerState, AiSpawnEggSettings
from ludoxel.simulation.actors.player.combat import attack_sprinting
from ludoxel.simulation.actors.player.targets import MELEE_ATTACK_REACH_BLOCKS


def set_ai_players_for_session(session, states: object) -> None:
  normalized_states: list[AiPlayerState] = []
  if isinstance(states, (list, tuple)):
    for state in states:
      if isinstance(state, AiPlayerState):
        normalized_states.append(state.normalized())
  session.ai_players.load_states(tuple(normalized_states))


def ai_states_for_session(session) -> tuple[AiPlayerState, ...]:
  return session.ai_players.actors()


def spawn_ai_player_for_session(session, *, spawn_cell: tuple[int, int, int], settings: AiSpawnEggSettings) -> str | None:
  return session.ai_players.spawn_from_egg(spawn_cell=tuple(int(value) for value in spawn_cell), settings=settings.normalized())


def ai_player_settings_for_session(session, actor_id: str) -> AiSpawnEggSettings | None:
  return session.ai_players.actor_settings(str(actor_id))


def update_ai_player_settings_for_session(session, *, actor_id: str, settings: AiSpawnEggSettings) -> bool:
  return bool(session.ai_players.update_actor_settings(actor_id=str(actor_id), settings=settings.normalized()))


def remove_ai_player_for_session(session, actor_id: str) -> bool:
  return bool(session.ai_players.remove_actor(str(actor_id)))


def cancel_ai_navigation_for_session(session, actor_id: str) -> bool:
  return bool(session.ai_players.cancel_actor_navigation(str(actor_id)))


def pick_ai_player_for_session(session, *, origin: Vec3, direction: Vec3, reach: float = MELEE_ATTACK_REACH_BLOCKS, block_hit=None) -> str | None:
  return session.ai_players.pick_actor(origin=origin, direction=direction, reach=float(reach), block_hit=block_hit)


def attack_ai_player_for_session(session, *, origin: Vec3 | None = None, direction: Vec3 | None = None, reach: float = MELEE_ATTACK_REACH_BLOCKS) -> AiLocalAttackResult:
  attack_origin = session.player.eye_pos() if origin is None else origin
  attack_direction = session.player.view_forward() if direction is None else direction
  world_hit = session.pick_block(reach=float(reach), origin=attack_origin, direction=attack_direction)
  sprinting = attack_sprinting(attacker=session.player, walk_speed=float(session.settings.movement.walk_speed))
  return session.ai_players.player_attack_from_local(attacker=session.player, origin=attack_origin, direction=attack_direction, reach=float(reach), world_hit=world_hit, sprinting=bool(sprinting))


def ai_route_paths_for_session(session) -> tuple[AiRoutePathSnapshot, ...]:
  return session.ai_players.route_paths()


def ai_render_snapshots_for_session(session):
  return session.ai_players.render_snapshots()
