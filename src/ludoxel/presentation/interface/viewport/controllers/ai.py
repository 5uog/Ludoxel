# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import uuid4

from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QFileDialog, QMessageBox

import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.foundations.mathematics.voxels.faces import FACE_POS_Y
from ludoxel.presentation.interface.common.themed_notice_dialog import show_themed_notice
from ludoxel.presentation.interface.hud.route_overlay import RouteOverlayPath
from ludoxel.presentation.interface.overlays.ai_settings import AiSettingsOverlay
from ludoxel.presentation.rendering.visuals.players.ai_player_render_state import compose_ai_player_render_states
from ludoxel.presentation.rendering.visuals.players.skin import delete_custom_ai_skin, load_custom_ai_skin_image, normalize_player_skin_image, write_custom_ai_skin
from ludoxel.simulation.actors.ai_players.state import AI_MODE_IDLE, AI_MODE_ROUTE, AiRoutePoint, AiSpawnEggSettings, normalize_ai_skin_id
from ludoxel.simulation.inventories.hotbars.ai_route_defaults import default_ai_route_hotbar_slots
from ludoxel.simulation.inventories.hotbars.hotbar import HOTBAR_SIZE
from ludoxel.simulation.inventories.special_items.core import AI_ROUTE_CANCEL_ITEM_ID, AI_ROUTE_CONFIRM_ITEM_ID, AI_ROUTE_ERASE_ITEM_ID, AI_SPAWN_EGG_ITEM_ID
from ludoxel.simulation.rules.interaction.service import InteractionOutcome

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget


def _ensure_edit_settings(viewport: "RendererViewportWidget") -> None:
  viewport._ai_edit_settings = viewport._ai_edit_settings.normalized()


def route_edit_active(viewport: "RendererViewportWidget") -> bool:
  return bool(viewport._state.route_edit_active)


def _eraser_selected(viewport: "RendererViewportWidget") -> bool:
  item_id = settings_controller.current_item_id(viewport)
  return str(item_id) == AI_ROUTE_ERASE_ITEM_ID


def _hovered_route_point_index(viewport: "RendererViewportWidget") -> int | None:
  if not bool(route_edit_active(viewport)) or (not bool(_eraser_selected(viewport))):
    return None
  if len(viewport._ai_route_edit_points) <= 0:
    return None

  eye, _yaw_deg, _pitch_deg, direction = viewport._interaction_pose()
  ray_direction = direction.normalized()
  if float(ray_direction.length()) <= 1e-6:
    return None
  world_hit = viewport._session.pick_block(reach=float(viewport._state.reach), origin=eye, direction=ray_direction)
  reach_limit = float(viewport._state.reach) if world_hit is None else min(float(viewport._state.reach), float(world_hit.t) + 0.05)

  best_index: int | None = None
  best_distance = 1e9
  for index, route_point in enumerate(viewport._ai_route_edit_points):
    point = route_point.as_vec3()
    delta = point - eye
    along = float(delta.dot(ray_direction))
    if float(along) < 0.0 or float(along) > float(reach_limit):
      continue
    nearest = eye + ray_direction * float(along)
    radial = float((point - nearest).length())
    if float(radial) > 0.32:
      continue
    if float(along) < float(best_distance):
      best_distance = float(along)
      best_index = int(index)
  return best_index


def route_overlay_paths(viewport: "RendererViewportWidget") -> tuple[RouteOverlayPath, ...]:
  viewport._ai_route_hover_index = _hovered_route_point_index(viewport)
  paths: list[RouteOverlayPath] = []
  for route_path in viewport._session.ai_route_paths():
    points = tuple(point.as_vec3() for point in route_path.points)
    if len(points) >= 2:
      paths.append(RouteOverlayPath(points=points, closed=bool(route_path.closed), draft=False))
  if bool(route_edit_active(viewport)) and len(viewport._ai_route_edit_points) >= 1:
    points = tuple(point.as_vec3() for point in viewport._ai_route_edit_points)
    paths.append(RouteOverlayPath(points=points, closed=bool(viewport._ai_route_edit_closed), draft=True, highlighted_index=viewport._ai_route_hover_index))
  return tuple(paths)


def _sync_ai_visuals(viewport: "RendererViewportWidget") -> None:
  viewport._sync_gameplay_hud_visibility()
  viewport._route_overlay.update()
  viewport.update()


def _spawn_ai_at_hit(viewport: "RendererViewportWidget", *, hit) -> bool:
  if hit is None or hit.place is None:
    return False
  actor_id = viewport._session.spawn_ai_player(spawn_cell=tuple(int(value) for value in hit.place), settings=AiSpawnEggSettings(mode=AI_MODE_IDLE).normalized())
  if actor_id is None:
    return False
  _sync_ai_visuals(viewport)
  return True


def _import_ai_skin(viewport: "RendererViewportWidget", current_skin_id: str) -> str | None:
  """
  file dialog で選択された PNG を 64x64 atlas として検証し、actor 固有 import skin file として保存して新しい skin_id を返す。
  import と replace のいずれの場合も新規 UUID hex を採番して別 file として保存するため、apply 経路は skin_id の変化として skin resource 更新を確実に検出でき、置換前の旧 skin_id は呼び出し側 apply 経路の orphan 削除で処理される。選択 cancel では None を返し、decode 失敗、寸法不一致、保存失敗では警告を表示して None を返す。
  current_skin_id は将来の差分判定のための参考値であり、この関数自身は renderer への push を行わない。push は呼び出し側 apply 経路が skin_id の変化を検出した時に一度だけ実行する。
  """
  del current_skin_id
  selected_path, _selected_filter = QFileDialog.getOpenFileName(viewport, "Select AI Skin", "", "PNG Files (*.png)")
  if not str(selected_path).strip():
    return None
  try:
    image = normalize_player_skin_image(QImage(str(selected_path)))
    skin_id = uuid4().hex
    write_custom_ai_skin(viewport._data_root, skin_id, image)
  except Exception as exc:
    QMessageBox.warning(viewport, "Invalid AI Skin", str(exc))
    return None
  return str(skin_id)


def _ai_skin_is_available(viewport: "RendererViewportWidget", skin_id: str) -> bool:
  """
  指定 skin_id の actor 固有 import skin file が存在し、integrity 検証と 64x64 検査を満たして読み込める場合に真を返す。
  dialog 側の skin status 表示が、参照切れ又は改竄により fallback へ落ちる状態を区別するために用いる。
  """
  return load_custom_ai_skin_image(viewport._data_root, skin_id) is not None


def _skin_id_is_referenced(viewport: "RendererViewportWidget", skin_id: str) -> bool:
  """
  指定 skin_id を import skin として参照する生存 AI が、いずれかの play-space に一体でも存在する場合に真を返す。
  skin 差し替え、skin 削除、AI 削除の際に共有されていない import skin file だけを安全に削除するための参照計数として用いる。無効 id は常に偽を返す。
  """
  normalized_id = normalize_ai_skin_id(skin_id)
  if not normalized_id:
    return False
  return any(normalize_ai_skin_id(state.skin_id) == normalized_id for session in viewport._sessions.all_sessions() for state in session.ai_states())


def _delete_unreferenced_ai_skin(viewport: "RendererViewportWidget", skin_id: str) -> None:
  """
  指定 skin_id の import skin file を、どの生存 AI からも参照されていない場合に限り削除する。
  skin 差し替え時の旧 skin_id、skin 削除時の旧 skin_id、AI 削除時の旧 skin_id の解放に用い、まだ参照する AI が居る場合は削除しない。
  """
  normalized_id = normalize_ai_skin_id(skin_id)
  if not normalized_id or _skin_id_is_referenced(viewport, normalized_id):
    return
  delete_custom_ai_skin(viewport._data_root, normalized_id)


def _open_actor_dialog(viewport: "RendererViewportWidget", *, actor_id: str, initial_settings: AiSpawnEggSettings | None = None) -> bool:
  settings = None if initial_settings is None else initial_settings.normalized()
  if settings is None:
    settings = viewport._session.ai_player_settings(str(actor_id))
    if settings is None:
      return False
  viewport._ai_edit_actor_id = str(actor_id)
  viewport._ai_edit_settings = settings.normalized()
  _ensure_edit_settings(viewport)

  was_captured = bool(viewport._inp.captured())
  viewport._reset_held_mouse_actions()
  viewport._inp.reset()
  viewport._recent_move_f = 0.0
  viewport._recent_move_s = 0.0
  viewport._recent_jump_held = False
  viewport._recent_jump_pressed = False
  viewport._recent_crouch_held = False
  viewport._ai_settings_overlay_open = True
  viewport._inp.set_mouse_capture(False)
  settings_controller.sync_cloud_motion_pause(viewport)

  def apply_settings(candidate: AiSpawnEggSettings) -> bool:
    """
    AI Settings dialog の有効な変更を session 境界へ即時反映し、変更種別に応じた最小限の presentation 側更新だけを行う。
    session 側 update が失敗した場合は偽を返して反映しない。反映成功時は、直前に反映済みの settings との比較で skin_mode 又は skin_id が実際に変化した場合に限り、孤立した旧 import skin file の解放と AI skin resource の再解決・renderer push を一度だけ行う。name、health indicator、regen、behavior、route の変更では skin resource の reload も renderer push も行わない。navigation cache の破棄は simulation 側 update_actor_settings が nav 影響変更に限定して処理するため、ここでは追加の navigation 操作を行わない。
    """
    normalized = candidate.normalized()
    previous = viewport._ai_edit_settings
    updated = viewport._session.update_ai_player_settings(actor_id=str(actor_id), settings=normalized)
    if not bool(updated):
      return False
    previous_skin_id = normalize_ai_skin_id(previous.skin_id)
    next_skin_id = normalize_ai_skin_id(normalized.skin_id)
    skin_changed = bool(str(normalized.skin_mode) != str(previous.skin_mode) or next_skin_id != previous_skin_id)
    viewport._ai_edit_settings = normalized
    if bool(skin_changed):
      if previous_skin_id and previous_skin_id != next_skin_id:
        _delete_unreferenced_ai_skin(viewport, previous_skin_id)
      settings_controller.sync_ai_skins(viewport, push_to_renderer=True)
    return True

  dialog = AiSettingsOverlay(
    parent=viewport,
    settings=viewport._ai_edit_settings,
    name_validator=lambda candidate, _actor_id=str(actor_id): viewport._session.ai_player_name_error(actor_id=str(_actor_id), name=str(candidate)),
    settings_updater=apply_settings,
    skin_importer=lambda current_skin_id: _import_ai_skin(viewport, str(current_skin_id)),
    skin_available=lambda skin_id: _ai_skin_is_available(viewport, str(skin_id)),
    as_window=False,
  )
  viewport._ai_settings_dialog = dialog
  dialog.preview_requested.connect(lambda: open_ai_settings_preview(viewport))
  dialog.finished.connect(
    lambda _result, captured_dialog=dialog, captured_actor=str(actor_id), captured_was_captured=bool(was_captured): _on_actor_dialog_finished(
      viewport, actor_id=captured_actor, was_captured=captured_was_captured, dialog=captured_dialog
    )
  )
  dialog.setGeometry(0, 0, max(1, int(viewport.width())), max(1, int(viewport.height())))
  dialog.setVisible(True)
  dialog.raise_()
  dialog.setFocus()
  viewport._sync_gameplay_hud_visibility()
  viewport.update()
  return True


def _on_actor_dialog_finished(viewport: "RendererViewportWidget", *, actor_id: str, was_captured: bool, dialog) -> None:
  """
  本体画面へ非 modal で埋め込んだ AI Settings overlay が閉じられた時に、modal exec 時代の `finally` 経路が担っていた後処理を実行する。
  まず付随する AI Settings Preview dialog を閉じ、overlay が記録した delete 要求と route 編集要求、及び route 編集へ引き継ぐ設定値を、dialog 破棄前に読み出す。次に AI overlay 開放 flag を下ろして入力状態を初期化し、delete 要求があれば actor と孤立 import skin の解放を行い、route 編集要求があれば world 上の route 編集へ遷移する。最後に route 編集中でなければ編集対象 actor 参照を解除し、開始時に mouse capture されていてかつ他の modal overlay が無く loading 中でもなければ gameplay の mouse capture を復帰する。
  """
  close_ai_settings_preview(viewport)
  try:
    delete_requested = bool(dialog.delete_requested())
  except RuntimeError:
    delete_requested = False
  try:
    route_requested = bool(dialog.route_edit_requested())
  except RuntimeError:
    route_requested = False
  route_settings = None
  if bool(route_requested):
    try:
      route_settings = dialog.settings()
    except RuntimeError:
      route_settings = None
  if viewport._ai_settings_dialog is dialog:
    viewport._ai_settings_dialog = None
  dialog.deleteLater()

  viewport._ai_settings_overlay_open = False
  viewport._inp.reset()

  if bool(delete_requested):
    removed_skin_id = normalize_ai_skin_id(viewport._ai_edit_settings.skin_id)
    removed = viewport._session.remove_ai_player(str(actor_id))
    if bool(removed):
      if removed_skin_id and not _skin_id_is_referenced(viewport, removed_skin_id):
        delete_custom_ai_skin(viewport._data_root, removed_skin_id)
        settings_controller.sync_ai_skins(viewport, push_to_renderer=True)
      _sync_ai_visuals(viewport)
  elif bool(route_requested):
    begin_route_edit(viewport, actor_id=str(actor_id), settings=route_settings)

  if not bool(route_edit_active(viewport)):
    viewport._ai_edit_actor_id = None
  settings_controller.sync_cloud_motion_pause(viewport)
  if bool(was_captured) and not viewport._overlays.any_modal_open() and not bool(viewport.loading_active()):
    viewport._inp.set_mouse_capture(True)
    viewport.arm_resume_refresh()
  viewport._sync_gameplay_hud_visibility()
  viewport.update()


def open_ai_settings_preview(viewport: "RendererViewportWidget") -> None:
  """
  本体画面へ埋め込んだ AI Settings overlay の Preview button から、対象 AI を中央に据えた Debug 用 preview dialog を明示的に開く。
  preview dialog は埋め込み overlay とは別の detached dialog として生成し、編集対象 actor が無い場合や既に開いている場合は生成しない。dialog の view_changed は次 frame の preview 再描画を要求するために viewport の再描画へ接続し、closed は preview lifecycle を終了させる close_ai_settings_preview へ接続する。preview frame の生成自体は paint 経路の `_update_ai_preview_frame` が担うため、ここでは dialog の生成と表示のみを行う。
  """
  if getattr(viewport, "_ai_preview", None) is not None:
    return
  if viewport._ai_edit_actor_id is None:
    return

  from ludoxel.presentation.interface.overlays.ai_preview import AiPreviewDialog

  host = viewport.window() if viewport.window() is not None else viewport
  dialog = AiPreviewDialog(host, title="AI Preview")
  viewport._ai_preview = dialog
  dialog.view_changed.connect(viewport.update)
  dialog.closed.connect(lambda: close_ai_settings_preview(viewport))
  viewport._position_detached_overlay_window(dialog)
  dialog.show()
  dialog.raise_()
  dialog.activateWindow()
  viewport.update()


def close_ai_settings_preview(viewport: "RendererViewportWidget") -> None:
  """
  AI Settings Preview dialog を閉じ、preview frame の供給を止める。
  二重呼び出しに備えて先に参照を切ってから dialog を破棄するため、これ以降の paint では `_update_ai_preview_frame` が preview を検出せず offscreen render を発行しない。
  """
  dialog = getattr(viewport, "_ai_preview", None)
  if dialog is None:
    return
  viewport._ai_preview = None
  try:
    dialog.blockSignals(True)
  except Exception:
    pass
  dialog.hide()
  dialog.deleteLater()
  viewport.update()


def begin_route_edit(viewport: "RendererViewportWidget", *, actor_id: str, settings: AiSpawnEggSettings | None = None) -> None:
  resolved_settings = None if settings is None else settings.normalized()
  if resolved_settings is None:
    resolved_settings = viewport._session.ai_player_settings(str(actor_id))
  if resolved_settings is None:
    return
  viewport._session.cancel_ai_navigation(str(actor_id))
  viewport._ai_edit_actor_id = str(actor_id)
  viewport._ai_route_edit_actor_id = str(actor_id)
  viewport._ai_edit_settings = resolved_settings.normalized()
  _ensure_edit_settings(viewport)
  viewport._state.route_hotbar_slots = list(default_ai_route_hotbar_slots(size=HOTBAR_SIZE))
  viewport._state.route_selected_hotbar_index = 0
  viewport._state.route_edit_active = True
  viewport._state.normalize()
  viewport._ai_route_edit_points = list(viewport._ai_edit_settings.route_points)
  viewport._ai_route_edit_closed = bool(viewport._ai_edit_settings.route_closed)
  viewport._ai_route_hover_index = None
  settings_controller.sync_hotbar_widgets(viewport)
  settings_controller.sync_first_person_target(viewport)
  _sync_ai_visuals(viewport)


def _finish_route_edit(viewport: "RendererViewportWidget", *, commit: bool, reopen_dialog: bool) -> None:
  actor_id = None if viewport._ai_route_edit_actor_id is None else str(viewport._ai_route_edit_actor_id)
  reopen_settings = viewport._ai_edit_settings.normalized()
  if bool(commit):
    if len(viewport._ai_route_edit_points) < 2:
      show_themed_notice(parent=viewport, title="AI Route", message="At least two route points are required.", nav_label="AI Route")
      return
    _ensure_edit_settings(viewport)
    viewport._ai_edit_settings = AiSpawnEggSettings(
      mode=AI_MODE_ROUTE,
      personality=viewport._ai_edit_settings.personality,
      can_place_blocks=bool(viewport._ai_edit_settings.can_place_blocks),
      name=str(viewport._ai_edit_settings.name),
      health_indicator=str(viewport._ai_edit_settings.health_indicator),
      skin_mode=str(viewport._ai_edit_settings.skin_mode),
      skin_id=str(viewport._ai_edit_settings.skin_id),
      auto_regen_enabled=bool(viewport._ai_edit_settings.auto_regen_enabled),
      regen_start_delay_s=float(viewport._ai_edit_settings.regen_start_delay_s),
      regen_interval_s=float(viewport._ai_edit_settings.regen_interval_s),
      regen_amount_hp=float(viewport._ai_edit_settings.regen_amount_hp),
      regen_cap_hp=float(viewport._ai_edit_settings.regen_cap_hp),
      route_points=tuple(viewport._ai_route_edit_points),
      route_closed=bool(viewport._ai_route_edit_closed),
      route_run=bool(viewport._ai_edit_settings.route_run),
      route_style=str(viewport._ai_edit_settings.route_style),
    ).normalized()
    reopen_settings = viewport._ai_edit_settings.normalized()
    if actor_id is None or (not bool(viewport._session.update_ai_player_settings(actor_id=str(actor_id), settings=viewport._ai_edit_settings))):
      show_themed_notice(parent=viewport, title="AI Route", message="The selected AI is no longer available.", nav_label="AI Route")
      commit = False
      reopen_dialog = False
  viewport._state.route_edit_active = False
  viewport._state.normalize()
  viewport._ai_route_edit_points = []
  viewport._ai_route_edit_closed = False
  viewport._ai_route_hover_index = None
  viewport._ai_route_edit_actor_id = None
  settings_controller.sync_hotbar_widgets(viewport)
  settings_controller.sync_first_person_target(viewport)
  _sync_ai_visuals(viewport)
  if bool(reopen_dialog) and actor_id is not None:
    current_settings = viewport._session.ai_player_settings(str(actor_id))
    if current_settings is not None:
      reopen_settings = current_settings.normalized()
    _open_actor_dialog(viewport, actor_id=str(actor_id), initial_settings=reopen_settings)
  else:
    viewport._ai_edit_actor_id = None


def cancel_route_edit(viewport: "RendererViewportWidget", *, reopen_dialog: bool = False) -> None:
  if not bool(route_edit_active(viewport)):
    return
  _finish_route_edit(viewport, commit=False, reopen_dialog=bool(reopen_dialog))


def _route_point_from_top_face_hit(hit) -> AiRoutePoint | None:
  if hit is None or int(hit.face) != int(FACE_POS_Y):
    return None
  cell_x, _cell_y, cell_z = (int(hit.hit[0]), int(hit.hit[1]), int(hit.hit[2]))
  return AiRoutePoint(
    x=clampf(float(hit.hit_point.x), float(cell_x) + 0.15, float(cell_x) + 0.85), y=float(hit.hit_point.y), z=clampf(float(hit.hit_point.z), float(cell_z) + 0.15, float(cell_z) + 0.85)
  )


def handle_route_left_click(viewport: "RendererViewportWidget") -> bool:
  if not bool(route_edit_active(viewport)):
    return False

  viewport._first_person_motion.trigger_left_swing()
  if bool(_eraser_selected(viewport)):
    hover_index = _hovered_route_point_index(viewport)
    viewport._ai_route_hover_index = hover_index
    if hover_index is None:
      return True
    viewport._ai_route_edit_points.pop(int(hover_index))
    if len(viewport._ai_route_edit_points) < 3:
      viewport._ai_route_edit_closed = False
    viewport._route_overlay.update()
    return True

  interaction_eye, _yaw_deg, _pitch_deg, interaction_direction = viewport._interaction_pose()
  hit = viewport._session.pick_block(reach=float(viewport._state.reach), origin=interaction_eye, direction=interaction_direction)
  point = _route_point_from_top_face_hit(hit)
  if point is None:
    return True
  if len(viewport._ai_route_edit_points) >= 3:
    first = viewport._ai_route_edit_points[0]
    dx = float(point.x) - float(first.x)
    dz = float(point.z) - float(first.z)
    if (dx * dx + dz * dz) <= (0.90 * 0.90):
      viewport._ai_route_edit_closed = True
      viewport._route_overlay.update()
      return True
  viewport._ai_route_edit_closed = False
  viewport._ai_route_edit_points.append(point)
  viewport._route_overlay.update()
  return True


def _confirm_or_cancel_route_item(viewport: "RendererViewportWidget", item_id: str) -> InteractionOutcome:
  reopen_dialog = viewport._ai_route_edit_actor_id is not None
  if str(item_id) == AI_ROUTE_CONFIRM_ITEM_ID:
    _finish_route_edit(viewport, commit=True, reopen_dialog=bool(reopen_dialog))
    return InteractionOutcome(success=not bool(route_edit_active(viewport)))
  if str(item_id) == AI_ROUTE_CANCEL_ITEM_ID:
    _finish_route_edit(viewport, commit=False, reopen_dialog=bool(reopen_dialog))
    return InteractionOutcome(success=True)
  return InteractionOutcome(success=False)


def handle_special_right_click(viewport: "RendererViewportWidget", *, origin: Vec3, direction: Vec3, hit) -> InteractionOutcome | None:
  item_id = settings_controller.current_item_id(viewport)
  if bool(route_edit_active(viewport)):
    if str(item_id) in (AI_ROUTE_CONFIRM_ITEM_ID, AI_ROUTE_CANCEL_ITEM_ID):
      return _confirm_or_cancel_route_item(viewport, str(item_id))
    return InteractionOutcome(success=False)
  if str(item_id) == AI_SPAWN_EGG_ITEM_ID and hit is not None and hit.place is not None:
    return InteractionOutcome(success=bool(_spawn_ai_at_hit(viewport, hit=hit)))
  actor_id = viewport._session.pick_ai_player(origin=origin, direction=direction, reach=float(viewport._state.reach), block_hit=hit)
  if actor_id is not None:
    if not bool(viewport._state.creative_mode):
      return InteractionOutcome(success=False)
    return InteractionOutcome(success=bool(_open_actor_dialog(viewport, actor_id=str(actor_id))))
  return None


def extra_player_render_states(viewport: "RendererViewportWidget", *, snapshot) -> tuple:
  del snapshot
  return compose_ai_player_render_states(tuple(viewport._session.ai_render_snapshots()), block_registry=viewport._session.block_registry)
