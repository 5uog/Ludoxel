# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import replace
from typing import TYPE_CHECKING

from PyQt6.QtGui import QImage

from .....application.runtime.state.runtime_preferences import RuntimePreferences
from .....application.runtime.tasks.state_persistence import save_state
from ....math.scalars import clampf
from ....math.vec3 import Vec3
from ....math.view_angles import forward_from_yaw_pitch_deg
from ....rendering.block_break_particles import advance_block_break_particles, render_samples_from_block_break_particles
from ....rendering.player_skin import PLAYER_SKIN_KIND_ALEX, load_player_skin_image
from ....rendering.third_person_camera import resolve_camera
from ..controllers import settings_controller

if TYPE_CHECKING:
                                                                from ..gl_viewport_widget import GLViewportWidget

_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG = 89.5


class ViewportStateMixin:

    def _for_each_session(self: "GLViewportWidget", fn) -> None:
        for session in self._sessions.all_sessions():
            fn(session)

    def record_host_window_geometry(self: "GLViewportWidget", *, left: int | None, top: int | None, width: int, height: int, screen_name: str) -> None:
        self._state.window_left = None if left is None else int(left)
        self._state.window_top = None if top is None else int(top)
        self._state.window_width = int(width)
        self._state.window_height = int(height)
        self._state.window_screen_name = str(screen_name or "")
        self._state.normalize()

    def _push_player_skin_to_renderer(self: "GLViewportWidget", *, context_current: bool=False) -> None:
        if self._player_skin_image.isNull() or self.context() is None:
            return
        if bool(context_current):
            self._renderer.set_player_skin_image(self._player_skin_image)
            return
        if not bool(self._gl_initialized):
            return
        self.makeCurrent()
        try:
            self._renderer.set_player_skin_image(self._player_skin_image)
        finally:
            self.doneCurrent()
        self.update()

    def _sync_player_skin_design(self: "GLViewportWidget", *, push_to_renderer: bool=False, context_current: bool=False) -> None:
        try:
            image = load_player_skin_image(self._project_root, kind=self._state.player_skin_kind, resource_root=self._resource_root)
        except Exception:
            self._state.player_skin_kind = PLAYER_SKIN_KIND_ALEX
            self._state.normalize()
            image = load_player_skin_image(self._project_root, kind=self._state.player_skin_kind, resource_root=self._resource_root)

        self._player_skin_image = QImage(image)
        self._overlay.set_player_skin(self._player_skin_image, slim_arm=True)
        self._invalidate_pause_preview_cache()
        if bool(push_to_renderer):
            self._push_player_skin_to_renderer(context_current=bool(context_current))

    def save_state(self: "GLViewportWidget") -> None:
        settings_controller.sync_state_from_renderer_sun(self)
        settled_othello_state = self._othello_match.settle_animations()
        save_state(project_root=self._project_root, sessions=self._sessions, renderer=self._renderer, runtime=self._state, othello_game_state=settled_othello_state)

    def loading_status_text(self: "GLViewportWidget") -> str:
        return self._frame_sync.loading.status_text()

    def loading_active(self: "GLViewportWidget") -> bool:
        return bool(self._frame_sync.loading.active)

    def _set_loading_status(self: "GLViewportWidget", text: str) -> None:
        if not self._frame_sync.loading.set_status(text):
            return
        self.loading_status_changed.emit(self._frame_sync.loading.status_text())

    def _begin_loading(self: "GLViewportWidget", text: str) -> None:
        became_active = self._frame_sync.loading.begin()
        self._reset_held_mouse_actions()
        self._clear_block_break_particles()
        self._set_loading_status(text)
        self._sync_gameplay_hud_visibility()
        settings_controller.sync_cloud_motion_pause(self)
        if bool(became_active):
            self.loading_state_changed.emit(True)
        self.update()

    def _finish_loading(self: "GLViewportWidget") -> None:
        if not self._frame_sync.loading.finish():
            return
        self._sync_gameplay_hud_visibility()
        settings_controller.sync_cloud_motion_pause(self)
        self._inp.ensure_mouse_capture_applied()
        self.loading_state_changed.emit(False)
        self.loading_finished.emit()

    def arm_resume_refresh(self: "GLViewportWidget") -> None:
        self._frame_sync.arm_resume_refresh()
        self._last_selection_pick_ms = 0.0
        self.update()

    def _invalidate_selection_target(self: "GLViewportWidget") -> None:
        self._selection_state.invalidate()
        self._frame_sync.selection.invalidate(force_duration_s=0.12)

    def _make_render_snapshot(self: "GLViewportWidget"):
        snapshot = self._session.make_snapshot(enable_view_bobbing=bool(self._state.view_bobbing_enabled), enable_camera_shake=bool(self._state.camera_shake_enabled), view_bobbing_strength=float(self._state.view_bobbing_strength), camera_shake_strength=float(self._state.camera_shake_strength), is_first_person_view=bool(self._state.is_first_person_view()))
        if not self._block_break_particles:
            return snapshot
        return replace(snapshot, block_break_particles=render_samples_from_block_break_particles(self._block_break_particles))

    def _reset_held_mouse_actions(self: "GLViewportWidget") -> None:
        self._left_mouse_held = False
        self._right_mouse_held = False
        self._left_mouse_repeat_due_s = 0.0
        self._disable_right_mouse_repeat()

    def _arm_left_mouse_repeat(self: "GLViewportWidget", *, now_s: float) -> None:
        self._left_mouse_held = True
        self._left_mouse_repeat_due_s = float(now_s) + float(self._state.block_break_repeat_interval_s)

    def _arm_right_mouse_repeat(self: "GLViewportWidget") -> None:
        self._right_mouse_held = True
        self._disable_right_mouse_repeat()

    def _enable_right_mouse_interact_repeat(self: "GLViewportWidget", *, now_s: float, target_cell: tuple[int, int, int]) -> None:
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
        self._right_mouse_repeat_due_s = float(now_s) + float(self._state.block_interact_repeat_interval_s)

    def _enable_right_mouse_place_repeat(self: "GLViewportWidget", *, now_s: float, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, plane_normal: tuple[int, int, int], plane_point: tuple[float, float, float], min_progress: int, max_progress: int, support_face_mode: bool, visible_face_chain_mode: bool, start_cell_materialized: bool, pending_support_cell: tuple[int, int, int] | None, pending_support_face: int | None, pending_support_hit_point: tuple[float, float, float] | None) -> None:
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
        self._right_mouse_repeat_line_pending_support_hit_point = None if pending_support_hit_point is None else (float(pending_support_hit_point[0]), float(pending_support_hit_point[1]), float(pending_support_hit_point[2]))
        self._right_mouse_repeat_support_face_mode = bool(support_face_mode)
        self._right_mouse_repeat_visible_face_chain_mode = bool(visible_face_chain_mode)
        self._right_mouse_repeat_origin_player_y = float(self._session.player.position.y)
        self._right_mouse_repeat_vertical_lock_sign = 0
        self._right_mouse_repeat_due_s = float(now_s) + float(RuntimePreferences.DEFAULT_BLOCK_PLACE_REPEAT_INITIAL_DELAY_S)

    def _disable_right_mouse_repeat(self: "GLViewportWidget") -> None:
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
        self._right_mouse_repeat_origin_player_y = 0.0
        self._right_mouse_repeat_vertical_lock_sign = 0

    def _clear_block_break_particles(self: "GLViewportWidget") -> None:
        self._block_break_particles = ()

    def _append_block_break_particles(self: "GLViewportWidget", particles) -> None:
        if not particles:
            return
        self._block_break_particles = tuple(self._block_break_particles) + tuple(particles)

    def _update_block_break_particles(self: "GLViewportWidget", dt: float) -> None:
        if not self._block_break_particles:
            return
        self._block_break_particles = advance_block_break_particles(tuple(self._block_break_particles), float(dt))

    def _effective_camera_from_snapshot(self: "GLViewportWidget", snapshot) -> tuple[Vec3, float, float, float, Vec3]:
        cam = snapshot.camera
        anchor_eye = Vec3(float(cam.eye_x) + float(cam.shake_tx), float(cam.eye_y) + float(cam.shake_ty), float(cam.eye_z) + float(cam.shake_tz))
        yaw_deg = float(cam.yaw_deg) + float(cam.shake_yaw_deg)
        pitch_deg = clampf(float(cam.pitch_deg) + float(cam.shake_pitch_deg), -float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG), float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG))
        roll_deg = float(cam.shake_roll_deg)
        eye, resolved_yaw_deg, resolved_pitch_deg, direction = resolve_camera(world=self._session.world, block_registry=self._session.block_registry, anchor_eye=anchor_eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), perspective=str(self._state.camera_perspective))
        return (eye, float(resolved_yaw_deg), float(resolved_pitch_deg), float(roll_deg), direction)

    def _interaction_pose_from_snapshot(self: "GLViewportWidget", snapshot) -> tuple[Vec3, float, float, Vec3]:
        cam = snapshot.camera
        eye = Vec3(float(cam.eye_x) + float(cam.shake_tx), float(cam.eye_y) + float(cam.shake_ty), float(cam.eye_z) + float(cam.shake_tz))
        yaw_deg = float(cam.yaw_deg) + float(cam.shake_yaw_deg)
        pitch_deg = clampf(float(cam.pitch_deg) + float(cam.shake_pitch_deg), -float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG), float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG))
        direction = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
        return (eye, float(yaw_deg), float(pitch_deg), direction)

    def _interaction_pose(self: "GLViewportWidget") -> tuple[Vec3, float, float, Vec3]:
        cam = self._session.make_camera_snapshot(enable_camera_shake=bool(self._state.camera_shake_enabled), camera_shake_strength=float(self._state.camera_shake_strength))
        eye = Vec3(float(cam.eye_x) + float(cam.shake_tx), float(cam.eye_y) + float(cam.shake_ty), float(cam.eye_z) + float(cam.shake_tz))
        yaw_deg = float(cam.yaw_deg) + float(cam.shake_yaw_deg)
        pitch_deg = clampf(float(cam.pitch_deg) + float(cam.shake_pitch_deg), -float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG), float(_EFFECTIVE_CAMERA_PITCH_LIMIT_DEG))
        direction = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
        return (eye, float(yaw_deg), float(pitch_deg), direction)

    def _arm_world_change_sync(self: "GLViewportWidget") -> None:
        self._frame_sync.arm_world_change_sync()

    def _upload_due(self: "GLViewportWidget", *, eye: Vec3) -> bool:
        session_token = int(id(self._session))
        world_revision = int(self._session.world.revision)
        render_distance = int(self._state.render_distance_chunks)
        if self._frame_sync.upload.world_revision_changed(world_revision=int(world_revision)):
            self._arm_world_change_sync()
        return self._frame_sync.upload.due(has_ready_results=self._upload.has_ready_results(), visible_chunks_ready=self._upload.visible_chunks_ready(world=self._session.world, eye=eye, render_distance_chunks=int(render_distance)), world_revision=int(world_revision), session_token=int(session_token), render_distance_chunks=int(render_distance), eye=eye)

    def _mark_upload(self: "GLViewportWidget", *, eye: Vec3) -> None:
        self._frame_sync.upload.mark(eye=eye, world_revision=int(self._session.world.revision), render_distance_chunks=int(self._state.render_distance_chunks), session_token=int(id(self._session)))

    def _selection_due(self: "GLViewportWidget", *, eye: Vec3, yaw_deg: float, pitch_deg: float) -> bool:
        current_space_id = str(self._state.current_space_id)
        current_world_revision = int(self._session.world.revision)
        if self._frame_sync.selection.world_revision_changed(world_revision=int(current_world_revision)):
            self._arm_world_change_sync()
        return self._frame_sync.selection.due(eye=eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), current_space_id=str(current_space_id), current_world_revision=int(current_world_revision), target_present=(self._selection_state.target() is not None), is_othello_space=bool(self._state.is_othello_space()))

    def _mark_selection(self: "GLViewportWidget", *, eye: Vec3, yaw_deg: float, pitch_deg: float) -> None:
        self._frame_sync.selection.mark(eye=eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), current_space_id=str(self._state.current_space_id), current_world_revision=int(self._session.world.revision))
