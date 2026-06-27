# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import replace
from typing import TYPE_CHECKING

from PyQt6.QtGui import QImage

import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.application.persistence.schedulers.state import save_state
from ludoxel.application.preferences.player_skin import PLAYER_SKIN_KIND_ALEX
from ludoxel.application.preferences.runtime import RuntimePreferences
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import forward_from_yaw_pitch_deg
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.presentation.rendering.visuals.cameras.third_person import resolve_camera
from ludoxel.presentation.rendering.visuals.players.skin import AI_BUNDLED_ALEX_SKIN_KEY, load_bundled_ai_alex_skin_image, load_custom_ai_skin_image, load_player_skin_image
from ludoxel.presentation.rendering.visuals.worlds.block_break_particles import advance_block_break_particles, render_samples_from_block_break_particles
from ludoxel.simulation.actors.ai_players.state import AI_SKIN_MODE_CUSTOM, normalize_ai_skin_id, normalize_ai_skin_mode

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget

_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG = 89.5


class ViewportStateMixin:
  def _for_each_session(self: "RendererViewportWidget", fn) -> None:
    for session in self._sessions.all_sessions():
      fn(session)

  def record_host_window_geometry(self: "RendererViewportWidget", *, left: int | None, top: int | None, width: int, height: int, screen_name: str) -> None:
    self._state.window_left = None if left is None else int(left)
    self._state.window_top = None if top is None else int(top)
    self._state.window_width = int(width)
    self._state.window_height = int(height)
    self._state.window_screen_name = str(screen_name or "")
    self._state.normalize()

  def _push_player_skin_to_renderer(self: "RendererViewportWidget", *, context_current: bool = False) -> None:
    if self._player_skin_image.isNull():
      return
    if bool(context_current):
      self._renderer.set_player_skin_image(self._player_skin_image)
      return
    initialized = bool(getattr(self, "_renderer_initialized", False) or getattr(self, "_gl_initialized", False))
    if not bool(initialized):
      return
    self._renderer.set_player_skin_image(self._player_skin_image)
    self.update()

  def _sync_player_skin_design(self: "RendererViewportWidget", *, push_to_renderer: bool = False, context_current: bool = False) -> None:
    try:
      image = load_player_skin_image(self._data_root, kind=self._state.player_skin_kind, resource_root=self._resource_root)
    except Exception:
      self._state.player_skin_kind = PLAYER_SKIN_KIND_ALEX
      self._state.normalize()
      image = load_player_skin_image(self._data_root, kind=self._state.player_skin_kind, resource_root=self._resource_root)

    self._player_skin_image = QImage(image)
    self._overlay.set_player_skin(self._player_skin_image, slim_arm=True)
    self._invalidate_pause_preview_cache()
    if bool(push_to_renderer):
      self._push_player_skin_to_renderer(context_current=bool(context_current))

  def _push_ai_skins_to_renderer(self: "RendererViewportWidget", *, context_current: bool = False) -> None:
    if bool(context_current):
      self._renderer.set_ai_skin_images(dict(self._ai_skin_images))
      return
    initialized = bool(getattr(self, "_renderer_initialized", False) or getattr(self, "_gl_initialized", False))
    if not bool(initialized):
      return
    self._renderer.set_ai_skin_images(dict(self._ai_skin_images))
    self.update()

  def _sync_ai_skin_designs(self: "RendererViewportWidget", *, push_to_renderer: bool = False, context_current: bool = False) -> None:
    images: dict[str, QImage] = {}
    try:
      images[AI_BUNDLED_ALEX_SKIN_KEY] = load_bundled_ai_alex_skin_image(self._resource_root)
    except Exception:
      images.pop(AI_BUNDLED_ALEX_SKIN_KEY, None)
    for session in self._sessions.all_sessions():
      for state in session.ai_states():
        if normalize_ai_skin_mode(state.skin_mode) != AI_SKIN_MODE_CUSTOM:
          continue
        skin_id = normalize_ai_skin_id(state.skin_id)
        if not skin_id or skin_id in images:
          continue
        image = load_custom_ai_skin_image(self._data_root, skin_id)
        if image is not None:
          images[skin_id] = QImage(image)
    self._ai_skin_images = images
    if bool(push_to_renderer):
      self._push_ai_skins_to_renderer(context_current=bool(context_current))

  def capture_framebuffer_image(self: "RendererViewportWidget") -> QImage:
    grab = getattr(self, "grabFramebuffer", None)
    if callable(grab):
      try:
        return QImage(grab())
      except Exception:
        pass
    try:
      return QImage(self.grab().toImage())
    except Exception:
      return QImage()

  def _capture_active_world_thumbnail_bytes(self: "RendererViewportWidget") -> bytes | None:
    if self._state.is_othello_space() or self._overlays.menu_open():
      return None
    if not str(getattr(self, "_loaded_my_world_id", "") or ""):
      return None
    try:
      from ludoxel.presentation.interface.menu.thumbnail import encode_thumbnail_png

      png_bytes = encode_thumbnail_png(self.capture_framebuffer_image())
      return bytes(png_bytes) if png_bytes else None
    except Exception:
      return None

  def save_state(self: "RendererViewportWidget") -> None:
    # The renderer sun read, the Othello animation settle, and the framebuffer
    # thumbnail grab are auxiliary. They must never block the critical world and
    # settings save, so each is isolated and the persistence call always runs.
    try:
      settings_controller.sync_state_from_renderer_sun(self)
    except Exception:
      pass
    try:
      settled_othello_state = self._othello_match.settle_animations()
    except Exception:
      settled_othello_state = None
    thumbnail_bytes = self._capture_active_world_thumbnail_bytes()
    save_state(
      project_root=self._project_root,
      data_root=self._data_root,
      sessions=self._sessions,
      renderer=self._renderer,
      runtime=self._state,
      othello_game_state=settled_othello_state,
      my_world_thumbnail_bytes=thumbnail_bytes,
    )

  def loading_status_text(self: "RendererViewportWidget") -> str:
    return self._frame_sync.loading.status_text()

  def loading_active(self: "RendererViewportWidget") -> bool:
    return bool(self._frame_sync.loading.active)

  def _set_loading_status(self: "RendererViewportWidget", text: str) -> None:
    if not self._frame_sync.loading.set_status(text):
      return
    self.loading_status_changed.emit(self._frame_sync.loading.status_text())

  def _begin_loading(self: "RendererViewportWidget", text: str) -> None:
    became_active = self._frame_sync.loading.begin()
    self._reset_held_mouse_actions()
    self._clear_block_break_particles()
    self._set_loading_status(text)
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)
    if bool(became_active):
      self.loading_state_changed.emit(True)
    self.update()

  def _finish_loading(self: "RendererViewportWidget") -> None:
    if not self._frame_sync.loading.finish():
      return
    if bool(getattr(self, "_startup_menu_pending", False)):
      self._startup_menu_pending = False
      import ludoxel.presentation.interface.viewport.controllers.menu as menu_controller

      menu_controller.open_startup_menu(self)
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)
    if (not bool(self._overlays.any_modal_open())) and bool(getattr(self, "_application_active", True)):
      self._inp.set_mouse_capture(True)
    self._inp.ensure_mouse_capture_applied()
    self.loading_state_changed.emit(False)
    self._sync_runtime_activity()
    self.loading_finished.emit()

  def arm_resume_refresh(self: "RendererViewportWidget") -> None:
    self._frame_sync.arm_resume_refresh()
    self._last_selection_pick_ms = 0.0
    self.update()

  def _invalidate_selection_target(self: "RendererViewportWidget") -> None:
    self._selection_state.invalidate()
    self._frame_sync.selection.invalidate(force_duration_s=0.12)

  def _make_render_snapshot(self: "RendererViewportWidget"):
    snapshot = self._session.make_snapshot(
      enable_view_bobbing=bool(self._state.view_bobbing_enabled),
      enable_camera_shake=bool(self._state.camera_shake_enabled),
      view_bobbing_strength=float(self._state.view_bobbing_strength),
      camera_shake_strength=float(self._state.camera_shake_strength),
      is_first_person_view=bool(self._state.is_first_person_view()),
    )
    if not self._block_break_particles:
      return snapshot
    return replace(snapshot, block_break_particles=render_samples_from_block_break_particles(self._block_break_particles))

  def _reset_held_mouse_actions(self: "RendererViewportWidget") -> None:
    self._left_mouse_held = False
    self._right_mouse_held = False
    dispatched_buttons = getattr(self, "_dispatched_mouse_buttons", None)
    if dispatched_buttons is not None:
      dispatched_buttons.clear()
    self._left_mouse_repeat_due_s = 0.0
    self._disable_right_mouse_repeat()

  def _reset_recent_input_state(self: "RendererViewportWidget") -> None:
    self._recent_move_f = 0.0
    self._recent_move_s = 0.0
    self._recent_jump_held = False
    self._recent_jump_pressed = False
    self._recent_crouch_held = False
    self._recent_vertical_motion_sign = 0

  def _transient_modal_active(self: "RendererViewportWidget") -> bool:
    return bool(int(getattr(self, "_transient_modal_depth", 0)) > 0)

  def _begin_transient_modal(self: "RendererViewportWidget") -> None:
    self._transient_modal_depth = int(getattr(self, "_transient_modal_depth", 0)) + 1
    self._reset_held_mouse_actions()
    self._inp.reset()
    self._reset_recent_input_state()
    self._inp.set_mouse_capture(False)
    self._runner.start()
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _end_transient_modal(self: "RendererViewportWidget") -> None:
    depth = int(getattr(self, "_transient_modal_depth", 0))
    if int(depth) <= 0:
      return
    self._transient_modal_depth = int(depth) - 1
    self._reset_held_mouse_actions()
    self._inp.reset()
    self._reset_recent_input_state()
    if bool(self._transient_modal_active()):
      settings_controller.sync_cloud_motion_pause(self)
      return
    self._runner.start()
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)
    if (
      (not bool(self.loading_active()))
      and (not bool(self._overlays.any_modal_open()))
      and (not bool(getattr(self, "_ai_settings_overlay_open", False)))
      and bool(getattr(self, "_application_active", True))
    ):
      self._inp.set_mouse_capture(True)
      self.arm_resume_refresh()

  def _arm_left_mouse_repeat(self: "RendererViewportWidget", *, now_s: float) -> None:
    self._left_mouse_held = True
    self._left_mouse_repeat_due_s = float(now_s) + float(self._state.block_break_repeat_interval_s)

  def _arm_right_mouse_repeat(self: "RendererViewportWidget") -> None:
    self._right_mouse_held = True
    self._disable_right_mouse_repeat()

  def _enable_right_mouse_interact_repeat(self: "RendererViewportWidget", *, now_s: float, target_cell: tuple[int, int, int]) -> None:
    self._right_mouse_repeat_enabled = True
    self._right_mouse_repeat_mode = "interact"
    self._right_mouse_repeat_target_cell = (int(target_cell[0]), int(target_cell[1]), int(target_cell[2]))
    self._right_mouse_repeat_line_start = None
    self._right_mouse_repeat_line_step = None
    self._right_mouse_repeat_line_face = None
    self._right_mouse_repeat_line_plane_normal = None
    self._right_mouse_repeat_line_plane_point = None
    self._right_mouse_repeat_line_min_progress = 0
    self._right_mouse_repeat_line_max_progress = 0
    self._right_mouse_repeat_line_start_cell_materialized = True
    self._right_mouse_repeat_line_pending_support_cell = None
    self._right_mouse_repeat_line_pending_support_face = None
    self._right_mouse_repeat_line_pending_support_hit_point = None
    self._right_mouse_repeat_support_face_mode = False
    self._right_mouse_repeat_visible_face_chain_mode = False
    self._right_mouse_repeat_place_state = None
    self._right_mouse_repeat_place_block_id = None
    self._right_mouse_repeat_due_s = float(now_s) + float(self._state.block_interact_repeat_interval_s)

  def _enable_right_mouse_place_repeat(
    self: "RendererViewportWidget",
    *,
    now_s: float,
    start_cell: tuple[int, int, int],
    step: tuple[int, int, int],
    face: int,
    plane_normal: tuple[int, int, int],
    plane_point: tuple[float, float, float],
    min_progress: int,
    max_progress: int,
    support_face_mode: bool,
    visible_face_chain_mode: bool,
    start_cell_materialized: bool,
    pending_support_cell: tuple[int, int, int] | None,
    pending_support_face: int | None,
    pending_support_hit_point: tuple[float, float, float] | None,
    place_state: str | None,
    block_id: str | None,
  ) -> None:
    self._right_mouse_repeat_enabled = True
    self._right_mouse_repeat_mode = "place"
    self._right_mouse_repeat_target_cell = None
    self._right_mouse_repeat_line_start = (int(start_cell[0]), int(start_cell[1]), int(start_cell[2]))
    self._right_mouse_repeat_line_step = (int(step[0]), int(step[1]), int(step[2]))
    self._right_mouse_repeat_line_face = int(face)
    self._right_mouse_repeat_line_plane_normal = (int(plane_normal[0]), int(plane_normal[1]), int(plane_normal[2]))
    self._right_mouse_repeat_line_plane_point = (float(plane_point[0]), float(plane_point[1]), float(plane_point[2]))
    self._right_mouse_repeat_line_min_progress = int(min_progress)
    self._right_mouse_repeat_line_max_progress = int(max_progress)
    self._right_mouse_repeat_line_start_cell_materialized = bool(start_cell_materialized)
    self._right_mouse_repeat_line_pending_support_cell = None if pending_support_cell is None else (int(pending_support_cell[0]), int(pending_support_cell[1]), int(pending_support_cell[2]))
    self._right_mouse_repeat_line_pending_support_face = None if pending_support_face is None else int(pending_support_face)
    self._right_mouse_repeat_line_pending_support_hit_point = (
      None if pending_support_hit_point is None else (float(pending_support_hit_point[0]), float(pending_support_hit_point[1]), float(pending_support_hit_point[2]))
    )
    self._right_mouse_repeat_support_face_mode = bool(support_face_mode)
    self._right_mouse_repeat_visible_face_chain_mode = bool(visible_face_chain_mode)
    self._right_mouse_repeat_place_state = None if place_state is None else str(place_state)
    self._right_mouse_repeat_place_block_id = None if block_id is None else str(block_id)
    self._right_mouse_repeat_origin_player_y = float(self._session.player.position.y)
    self._right_mouse_repeat_vertical_lock_sign = 0
    self._right_mouse_repeat_due_s = float(now_s) + float(RuntimePreferences.DEFAULT_BLOCK_PLACE_REPEAT_INITIAL_DELAY_S)

  def _disable_right_mouse_repeat(self: "RendererViewportWidget") -> None:
    self._right_mouse_repeat_due_s = 0.0
    self._right_mouse_repeat_enabled = False
    self._right_mouse_repeat_mode = None
    self._right_mouse_repeat_target_cell = None
    self._right_mouse_repeat_line_start = None
    self._right_mouse_repeat_line_step = None
    self._right_mouse_repeat_line_face = None
    self._right_mouse_repeat_line_plane_normal = None
    self._right_mouse_repeat_line_plane_point = None
    self._right_mouse_repeat_line_min_progress = 0
    self._right_mouse_repeat_line_max_progress = 0
    self._right_mouse_repeat_line_start_cell_materialized = True
    self._right_mouse_repeat_line_pending_support_cell = None
    self._right_mouse_repeat_line_pending_support_face = None
    self._right_mouse_repeat_line_pending_support_hit_point = None
    self._right_mouse_repeat_support_face_mode = False
    self._right_mouse_repeat_visible_face_chain_mode = False
    self._right_mouse_repeat_place_state = None
    self._right_mouse_repeat_place_block_id = None
    self._right_mouse_repeat_origin_player_y = 0.0
    self._right_mouse_repeat_vertical_lock_sign = 0

  def _clear_block_break_particles(self: "RendererViewportWidget") -> None:
    self._block_break_particles = ()

  def _append_block_break_particles(self: "RendererViewportWidget", particles) -> None:
    if not particles:
      return
    self._block_break_particles = tuple(self._block_break_particles) + tuple(particles)

  def _update_block_break_particles(self: "RendererViewportWidget", dt: float) -> None:
    if not self._block_break_particles:
      return
    self._block_break_particles = advance_block_break_particles(tuple(self._block_break_particles), float(dt))

  def _effective_camera_from_snapshot(self: "RendererViewportWidget", snapshot) -> tuple[Vec3, float, float, float, Vec3]:
    cam = snapshot.camera
    anchor_eye = Vec3(float(cam.eye_x) + float(cam.shake_tx), float(cam.eye_y) + float(cam.shake_ty), float(cam.eye_z) + float(cam.shake_tz))
    yaw_deg = float(cam.yaw_deg) + float(cam.shake_yaw_deg)
    pitch_deg = clampf(float(cam.pitch_deg) + float(cam.shake_pitch_deg), -float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG), float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG))
    roll_deg = float(cam.shake_roll_deg)
    eye, resolved_yaw_deg, resolved_pitch_deg, direction = resolve_camera(
      world=self._session.world, block_registry=self._session.block_registry, anchor_eye=anchor_eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), perspective=str(self._state.camera_perspective)
    )
    return (eye, float(resolved_yaw_deg), float(resolved_pitch_deg), float(roll_deg), direction)

  def _interaction_pose_from_snapshot(self: "RendererViewportWidget", snapshot) -> tuple[Vec3, float, float, Vec3]:
    cam = snapshot.camera
    eye = Vec3(float(cam.eye_x) + float(cam.shake_tx), float(cam.eye_y) + float(cam.shake_ty), float(cam.eye_z) + float(cam.shake_tz))
    yaw_deg = float(cam.yaw_deg) + float(cam.shake_yaw_deg)
    pitch_deg = clampf(float(cam.pitch_deg) + float(cam.shake_pitch_deg), -float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG), float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG))
    direction = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
    return (eye, float(yaw_deg), float(pitch_deg), direction)

  def _interaction_pose(self: "RendererViewportWidget") -> tuple[Vec3, float, float, Vec3]:
    cam = self._session.make_camera_snapshot(enable_camera_shake=bool(self._state.camera_shake_enabled), camera_shake_strength=float(self._state.camera_shake_strength))
    eye = Vec3(float(cam.eye_x) + float(cam.shake_tx), float(cam.eye_y) + float(cam.shake_ty), float(cam.eye_z) + float(cam.shake_tz))
    yaw_deg = float(cam.yaw_deg) + float(cam.shake_yaw_deg)
    pitch_deg = clampf(float(cam.pitch_deg) + float(cam.shake_pitch_deg), -float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG), float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG))
    direction = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
    return (eye, float(yaw_deg), float(pitch_deg), direction)

  def _arm_world_change_sync(self: "RendererViewportWidget") -> None:
    self._frame_sync.arm_world_change_sync()

  def _upload_due(self: "RendererViewportWidget", *, eye: Vec3) -> bool:
    session_token = int(id(self._session))
    world_revision = int(self._session.world.revision)
    render_distance = int(self._state.render_distance_chunks)
    if self._frame_sync.upload.world_revision_changed(world_revision=int(world_revision)):
      self._arm_world_change_sync()
    return self._frame_sync.upload.due(
      has_ready_results=self._upload.has_ready_results(),
      visible_chunks_ready=self._upload.visible_chunks_ready(world=self._session.world, eye=eye, render_distance_chunks=int(render_distance)),
      world_revision=int(world_revision),
      session_token=int(session_token),
      render_distance_chunks=int(render_distance),
      eye=eye,
    )

  def _mark_upload(self: "RendererViewportWidget", *, eye: Vec3) -> None:
    self._frame_sync.upload.mark(eye=eye, world_revision=int(self._session.world.revision), render_distance_chunks=int(self._state.render_distance_chunks), session_token=int(id(self._session)))

  def _selection_due(self: "RendererViewportWidget", *, eye: Vec3, yaw_deg: float, pitch_deg: float) -> bool:
    current_space_id = str(self._state.current_space_id)
    current_world_revision = int(self._session.world.revision)
    if self._frame_sync.selection.world_revision_changed(world_revision=int(current_world_revision)):
      self._arm_world_change_sync()
    return self._frame_sync.selection.due(
      eye=eye,
      yaw_deg=float(yaw_deg),
      pitch_deg=float(pitch_deg),
      current_space_id=str(current_space_id),
      current_world_revision=int(current_world_revision),
      target_present=(self._selection_state.target() is not None),
      is_othello_space=bool(self._state.is_othello_space()),
    )

  def _mark_selection(self: "RendererViewportWidget", *, eye: Vec3, yaw_deg: float, pitch_deg: float) -> None:
    self._frame_sync.selection.mark(
      eye=eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), current_space_id=str(self._state.current_space_id), current_world_revision=int(self._session.world.revision)
    )
