# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.sessions.pipelines.player_model import build_player_model_snapshot
from ludoxel.application.sessions.pipelines.render_snapshot import AiPlayerRenderSnapshotDTO
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.actors.ai_players.runtime import AiLocalAttackResult, AiRoutePathSnapshot
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


def ai_player_name_error_for_session(session, *, actor_id: str | None, name: object) -> str | None:
  """
  AI Settings overlay が保存前 validation に用いる名前検査を session 境界経由で提供する。
  形式規則と生存 AI 間の重複規則は AiPlayerManager.ai_name_error() が判定し、
  actor_id には rename 対象の actor を渡すことで自己名との衝突を除外する。
  有効な名前では None、無効な名前では UI 表示可能な英文 error message を返す。
  """
  return session.ai_players.ai_name_error(actor_id=(None if actor_id is None else str(actor_id)), name=name)


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


def ai_render_snapshots_for_session(session) -> tuple[AiPlayerRenderSnapshotDTO, ...]:
  snapshots: list[AiPlayerRenderSnapshotDTO] = []
  for observation in session.ai_players.actor_observations():
    player = observation.player
    snapshots.append(
      AiPlayerRenderSnapshotDTO(
        player_model=build_player_model_snapshot(player=player, motion=observation.motion, walk_speed=float(session.settings.movement.walk_speed), is_first_person_view=False),
        held_item_id=None if observation.held_item_id is None else str(observation.held_item_id),
        attack_swing_progress=float(observation.attack_swing_progress),
        attack_prev_swing_progress=float(observation.attack_prev_swing_progress),
        actor_id=str(observation.actor_id),
        name=str(observation.name),
        health=float(observation.health),
        max_health=float(observation.max_health),
        health_indicator=str(observation.health_indicator),
        skin_mode=str(observation.skin_mode),
        skin_id=str(observation.skin_id),
        position_x=float(player.position.x),
        position_y=float(player.position.y),
        position_z=float(player.position.z),
        height=float(player.height),
      )
    )
  return tuple(snapshots)
