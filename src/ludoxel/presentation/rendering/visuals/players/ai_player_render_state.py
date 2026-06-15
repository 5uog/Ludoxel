# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.sessions.pipelines.render_snapshot import AiPlayerRenderSnapshotDTO
from ludoxel.presentation.rendering.visuals.players.first_person_motion import FirstPersonMotionSample
from ludoxel.presentation.rendering.visuals.players.render_state import PlayerRenderState
from ludoxel.presentation.rendering.visuals.players.render_state_composer import compose_player_render_state_from_parts
from ludoxel.presentation.rendering.visuals.players.skin import AI_BUNDLED_ALEX_SKIN_KEY
from ludoxel.simulation.actors.ai_players.state import AI_SKIN_MODE_ALEX, AI_SKIN_MODE_CUSTOM, normalize_ai_skin_id, normalize_ai_skin_mode
from ludoxel.simulation.blocks.registries.block import BlockRegistry


def _resolve_ai_skin_texture_key(skin_mode: str, skin_id: str) -> str | None:
  """
  AI actor の skin_mode と skin_id を、renderer が登録済み skin texture を選択するための参照 key へ写像する。
  custom mode かつ有効な skin_id を持つ場合は当該 skin_id を、Alex mode の場合は同梱 Alex skin texture の固定 key を返し、player mode 又は無効な custom は None を返して player skin texture を共有させる。
  返値の key は renderer の AI skin texture 辞書の key と一致し、画像の読み込みや GPU upload は行わない。
  """
  mode = normalize_ai_skin_mode(skin_mode)
  if mode == AI_SKIN_MODE_CUSTOM:
    resolved_skin_id = normalize_ai_skin_id(skin_id)
    return resolved_skin_id if resolved_skin_id else None
  if mode == AI_SKIN_MODE_ALEX:
    return AI_BUNDLED_ALEX_SKIN_KEY
  return None


def compose_ai_player_render_states(snapshots: tuple[AiPlayerRenderSnapshotDTO, ...], *, block_registry: BlockRegistry) -> tuple[PlayerRenderState, ...]:
  """
  AI actor 分の render snapshot 列から third-person player render state 列を毎フレーム合成する。
  各 snapshot の skin_mode と skin_id から skin texture 選択子を解決し、custom mode かつ有効な skin_id を持つ actor には当該 skin_id を、Alex mode の actor には同梱 Alex skin texture の key を skin_texture_key として与え、player mode の actor は None として player skin を共有させる。
  この関数は skin 参照 key の解決のみを行い、画像の読み込みや GPU texture の生成・破棄は行わない。skin texture の reload と renderer への push は skin が実際に変化した時にだけ別経路で実行されるため、skin mode の切替は frame ごとの key 選択だけで反映される。
  """
  states: list[PlayerRenderState] = []
  for snapshot in snapshots:
    skin_texture_key = _resolve_ai_skin_texture_key(str(snapshot.skin_mode), str(snapshot.skin_id))
    held_item_id = None if snapshot.held_item_id is None else str(snapshot.held_item_id)
    motion = FirstPersonMotionSample(
      visible_item_id=held_item_id,
      target_item_id=held_item_id,
      equip_progress=1.0,
      prev_equip_progress=1.0,
      swing_progress=float(snapshot.attack_swing_progress),
      prev_swing_progress=float(snapshot.attack_prev_swing_progress),
      show_arm=bool(held_item_id is None),
      show_view_model=False,
      slim_arm=True,
    )
    states.append(
      compose_player_render_state_from_parts(
        player_model=snapshot.player_model, motion=motion, block_registry=block_registry, arm_rotation_limit_min_deg=-180.0, arm_rotation_limit_max_deg=180.0, skin_texture_key=skin_texture_key
      )
    )
  return tuple(states)
