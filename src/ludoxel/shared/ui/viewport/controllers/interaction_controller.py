# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass
import math
from typing import TYPE_CHECKING

import time

from PyQt6.QtCore import QTimer, Qt

from ludoxel.application.runtime.keybinds import ACTION_CLEAR_SELECTED_SLOT, ACTION_CYCLE_CAMERA_PERSPECTIVE, ACTION_TOGGLE_CREATIVE_MODE, ACTION_TOGGLE_DEBUG_HUD, ACTION_TOGGLE_DEBUG_SHADOW, ACTION_TOGGLE_INVENTORY, action_for_key
from ludoxel.shared.blocks.structure.cardinal import cardinal_from_xz
from ludoxel.shared.math.vec3 import Vec3
from ludoxel.shared.math.view_angles import forward_from_yaw_pitch_deg
from ludoxel.shared.math.voxel.voxel_faces import FACE_NEG_X, FACE_NEG_Y, FACE_NEG_Z, FACE_POS_X, FACE_POS_Y, FACE_POS_Z, face_neighbor_offset
from ludoxel.shared.rendering.block_break_particles import spawn_block_break_particles
from ludoxel.shared.systems.block_pick import BlockPick
from ludoxel.shared.systems.interaction_service import INTERACTION_ACTION_INTERACT, INTERACTION_ACTION_PLACE, InteractionOutcome
from ludoxel.shared.world.play_space import PLAY_SPACE_MY_WORLD, PLAY_SPACE_OTHELLO, is_my_world_space, normalize_play_space_id
from ludoxel.shared.ui.common import hotbar_index_from_key
import ludoxel.features.othello.ui.viewport.othello_controller as othello_controller
import ludoxel.shared.ui.viewport.controllers.settings_controller as settings_controller

if TYPE_CHECKING:
    from PyQt6.QtGui import QKeyEvent, QMouseEvent, QWheelEvent

    from ludoxel.shared.ui.viewport.gl_viewport_widget import GLViewportWidget


@dataclass(frozen=True)
class _PlaceRepeatLine:
    start_cell: tuple[int, int, int]
    step: tuple[int, int, int]
    face: int
    plane_normal: tuple[int, int, int]
    plane_point: tuple[float, float, float]
    min_progress: int
    max_progress: int
    support_face_mode: bool = False
    visible_face_chain_mode: bool = False


@dataclass(frozen=True)
class _RightClickResult:
    outcome: InteractionOutcome
    repeat_action: str | None = None
    interact_cell: tuple[int, int, int] | None = None
    place_line: _PlaceRepeatLine | None = None


_PLACE_REPEAT_RETRY_INTERVAL_S = 1.0 / 120.0
_SUPPORT_FACE_ROUTE_HALF_THRESHOLD = 0.50


def bind_overlay_actions(viewport: "GLViewportWidget") -> None:
    viewport._overlay.resume_requested.connect(lambda: resume_from_overlay(viewport))
    viewport._overlay.settings_requested.connect(lambda: open_settings_from_pause(viewport))
    viewport._overlay.play_my_world_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_MY_WORLD, resume=True))
    viewport._overlay.play_othello_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_OTHELLO, resume=True))
    viewport._overlay.change_skin_requested.connect(lambda: settings_controller.change_player_skin(viewport))
    viewport._overlay.reset_skin_requested.connect(lambda: settings_controller.reset_player_skin(viewport))
    viewport._death.respawn_requested.connect(lambda: respawn(viewport))
    viewport._inventory.block_selected.connect(lambda block_id: on_inventory_selected(viewport, str(block_id)))
    viewport._inventory.hotbar_slot_selected.connect(lambda slot_index: settings_controller.select_hotbar_slot(viewport, int(slot_index)))
    viewport._inventory.hotbar_slot_assigned.connect(lambda slot_index, item_id: settings_controller.assign_hotbar_slot(viewport, int(slot_index), str(item_id)))
    viewport._inventory.closed.connect(lambda: on_inventory_closed(viewport))


def respawn(viewport: "GLViewportWidget") -> None:
    viewport._reset_held_mouse_actions()
    viewport._session.respawn()
    viewport._invalidate_selection_target()
    viewport._renderer.clear_selection()
    viewport._set_dead_overlay(False)


def resume_from_overlay(viewport: "GLViewportWidget") -> None:
    viewport._set_paused_overlay(False)
    viewport.arm_resume_refresh()
    settings_controller.sync_cloud_motion_pause(viewport)


def open_pause_menu(viewport: "GLViewportWidget") -> None:
    if viewport._overlays.dead():
        return
    if viewport._overlays.inventory_open():
        viewport._set_inventory_overlay(False)
    if viewport._overlays.othello_settings_open():
        back_from_othello_settings(viewport)
    if viewport._overlays.settings_open():
        back_from_settings(viewport)
    settings_controller.sync_settings_values(viewport)
    settings_controller.sync_player_skin(viewport)
    viewport._overlay.set_current_space(viewport._state.current_space_id)
    viewport._set_paused_overlay(True)
    settings_controller.sync_cloud_motion_pause(viewport)


def switch_play_space(viewport: "GLViewportWidget", space_id: str, *, resume: bool=False) -> None:
    normalized = normalize_play_space_id(space_id)
    if normalized == normalize_play_space_id(viewport._state.current_space_id):
        if resume:
            resume_from_overlay(viewport)
        return

    target_label = "Loading My World..." if normalized == PLAY_SPACE_MY_WORLD else "Loading Play Othello..."
    viewport._reset_held_mouse_actions()
    viewport._clear_block_break_particles()
    othello_controller.clear_state_for_space_switch(viewport)
    viewport._state.current_space_id = normalized
    viewport._state.normalize()
    viewport._session = viewport._sessions.set_active_space(normalized)
    viewport._begin_loading(target_label)
    viewport._overlay.set_current_space(normalized)
    viewport._upload.reset(viewport._renderer, world=viewport._session.world)
    viewport._invalidate_selection_target()
    viewport._renderer.clear_selection()
    settings_controller.sync_hotbar_widgets(viewport)
    settings_controller.sync_first_person_target(viewport)
    othello_controller.sync_hud_text(viewport)
    viewport._sync_gameplay_hud_visibility()

    if resume:
        resume_from_overlay(viewport)

    othello_controller.maybe_request_ai(viewport)
    viewport.update()


def open_settings_from_pause(viewport: "GLViewportWidget") -> None:
    settings_controller.sync_settings_values(viewport)
    viewport._set_settings_overlay(True)
    settings_controller.sync_cloud_motion_pause(viewport)


def back_from_settings(viewport: "GLViewportWidget") -> None:
    viewport._set_settings_overlay(False)
    settings_controller.sync_cloud_motion_pause(viewport)


def open_othello_settings_from_item(viewport: "GLViewportWidget") -> None:
    othello_controller.sync_settings_values(viewport)
    viewport._set_othello_settings_overlay(True)
    settings_controller.sync_cloud_motion_pause(viewport)


def back_from_othello_settings(viewport: "GLViewportWidget") -> None:
    viewport._set_othello_settings_overlay(False)
    if viewport._state.is_othello_space():
        viewport._othello_analysis_request_signature = None
        QTimer.singleShot(120, lambda: othello_controller.maybe_request_analysis(viewport))
    settings_controller.sync_cloud_motion_pause(viewport)


def on_inventory_selected(viewport: "GLViewportWidget", block_id: str) -> None:
    if not bool(viewport._state.creative_mode) or not settings_controller.inventory_available(viewport):
        return

    active_index = viewport._state.active_hotbar_index()
    viewport._state.set_hotbar_slot(int(active_index), str(block_id))
    settings_controller.sync_hotbar_widgets(viewport)
    settings_controller.sync_first_person_target(viewport)


def on_inventory_closed(viewport: "GLViewportWidget") -> None:
    viewport._set_inventory_overlay(False)
    viewport.arm_resume_refresh()


def handle_key_press(viewport: "GLViewportWidget", e: "QKeyEvent") -> bool:
    bound_action = action_for_key(int(e.key()), viewport._state.keybinds)
    hotbar_idx = hotbar_index_from_key(int(e.key()), viewport._state.keybinds)

    if (hotbar_idx is not None and not viewport._overlays.paused() and not viewport._overlays.dead() and not viewport._overlays.settings_open() and not viewport._overlays.othello_settings_open()):
        if not viewport._overlays.inventory_open():
            settings_controller.select_hotbar_slot(viewport, int(hotbar_idx))
            return True

    if bound_action == ACTION_TOGGLE_DEBUG_SHADOW:
        viewport._state.debug_shadow = not bool(viewport._state.debug_shadow)
        viewport._renderer.set_debug_shadow(bool(viewport._state.debug_shadow))
        return True

    if bound_action == ACTION_TOGGLE_DEBUG_HUD:
        viewport._state.hud_visible = not bool(viewport._state.hud_visible)
        viewport._sync_gameplay_hud_visibility()
        return True

    if bound_action == ACTION_CYCLE_CAMERA_PERSPECTIVE and not viewport._overlays.paused() and not viewport._overlays.dead() and not viewport._overlays.settings_open() and not viewport._overlays.othello_settings_open() and not viewport._overlays.inventory_open():
        settings_controller.cycle_camera_perspective(viewport)
        return True

    if int(e.key()) == int(Qt.Key.Key_Escape):
        if viewport._overlays.dead():
            return True
        if viewport._overlays.inventory_open():
            viewport._set_inventory_overlay(False)
            return True
        if viewport._overlays.othello_settings_open():
            back_from_othello_settings(viewport)
            return True
        if viewport._overlays.settings_open():
            back_from_settings(viewport)
            return True
        if viewport._overlays.paused():
            viewport._set_paused_overlay(False)
            settings_controller.sync_cloud_motion_pause(viewport)
        else:
            open_pause_menu(viewport)
        return True

    if bound_action == ACTION_TOGGLE_CREATIVE_MODE and not viewport._overlays.paused() and not viewport._overlays.dead():
        settings_controller.set_creative_mode(viewport, not viewport._state.creative_mode)
        settings_controller.sync_settings_values(viewport)
        return True

    if bound_action == ACTION_TOGGLE_INVENTORY and not viewport._overlays.paused() and not viewport._overlays.dead():
        if settings_controller.inventory_available(viewport):
            viewport._set_inventory_overlay(not viewport._overlays.inventory_open())
        return True

    if (bound_action == ACTION_CLEAR_SELECTED_SLOT and is_my_world_space(viewport._state.current_space_id) and not viewport._overlays.paused() and not viewport._overlays.inventory_open() and not viewport._overlays.dead() and not viewport._overlays.settings_open() and not viewport._overlays.othello_settings_open()):
        settings_controller.clear_selected_hotbar_slot(viewport)
        return True

    if (not viewport._overlays.paused() and not viewport._overlays.inventory_open() and not viewport._overlays.dead() and not viewport._overlays.othello_settings_open()):
        viewport._inp.on_key_press(e)
    return False


def handle_wheel(viewport: "GLViewportWidget", e: "QWheelEvent") -> bool:
    if (viewport._overlays.paused() or viewport._overlays.inventory_open() or viewport._overlays.dead() or viewport._overlays.settings_open() or viewport._overlays.othello_settings_open()):
        return False

    delta_y = int(e.angleDelta().y())
    if delta_y > 0:
        settings_controller.cycle_hotbar(viewport, -1)
        e.accept()
        return True
    if delta_y < 0:
        settings_controller.cycle_hotbar(viewport, 1)
        e.accept()
        return True
    return False


def handle_mouse_press(viewport: "GLViewportWidget", e: "QMouseEvent") -> bool:
    viewport.setFocus(Qt.FocusReason.MouseFocusReason)

    if (viewport._overlays.paused() or viewport._overlays.inventory_open() or viewport._overlays.dead() or viewport._overlays.settings_open() or viewport._overlays.othello_settings_open()):
        return False

    if not viewport._inp.captured():
        viewport._inp.set_mouse_capture(True)
        return False

    if viewport._state.is_othello_space():
        interaction_eye, _yaw, _pitch, interaction_direction = viewport._interaction_pose()
        if e.button() == Qt.MouseButton.LeftButton:
            othello_controller.handle_left_click(viewport, interaction_eye, interaction_direction)
        elif e.button() == Qt.MouseButton.RightButton:
            othello_controller.handle_right_click(viewport)
        return True

    now_s = time.perf_counter()
    if e.button() == Qt.MouseButton.LeftButton:
        viewport._arm_left_mouse_repeat(now_s=float(now_s))
        _perform_left_click(viewport)
        return True

    if e.button() == Qt.MouseButton.RightButton:
        viewport._arm_right_mouse_repeat(now_s=float(now_s))
        result = _perform_right_click(viewport)
        _apply_initial_right_mouse_repeat(viewport, now_s=float(now_s), result=result)
        return True

    return False


def handle_mouse_release(viewport: "GLViewportWidget", e: "QMouseEvent") -> None:
    if e.button() == Qt.MouseButton.LeftButton:
        viewport._left_mouse_held = False
        viewport._left_mouse_repeat_due_s = 0.0
    elif e.button() == Qt.MouseButton.RightButton:
        viewport._right_mouse_held = False
        viewport._disable_right_mouse_repeat()


def _advance_right_mouse_place_repeat(viewport: "GLViewportWidget", *, now_s: float) -> None:
    result = _perform_right_click_place_repeat(viewport)
    if bool(result.outcome.success):
        if result.place_line is None:
            viewport._disable_right_mouse_repeat()
            return
        viewport._right_mouse_repeat_line_start = tuple(int(value) for value in result.place_line.start_cell)
        viewport._right_mouse_repeat_line_step = tuple(int(value) for value in result.place_line.step)
        viewport._right_mouse_repeat_line_face = int(result.place_line.face)
        viewport._right_mouse_repeat_line_plane_normal = tuple(int(value) for value in result.place_line.plane_normal)
        viewport._right_mouse_repeat_line_plane_point = tuple(float(value) for value in result.place_line.plane_point)
        viewport._right_mouse_repeat_line_min_progress = int(result.place_line.min_progress)
        viewport._right_mouse_repeat_line_max_progress = int(result.place_line.max_progress)
        viewport._right_mouse_repeat_support_face_mode = bool(result.place_line.support_face_mode)
        viewport._right_mouse_repeat_visible_face_chain_mode = bool(result.place_line.visible_face_chain_mode)
        if bool(result.place_line.support_face_mode) or bool(result.place_line.visible_face_chain_mode):
            viewport._right_mouse_repeat_due_s = float(now_s)
        else:
            viewport._right_mouse_repeat_due_s = float(now_s) + float(min(float(viewport._state.block_place_repeat_interval_s), float(_PLACE_REPEAT_RETRY_INTERVAL_S)))
        return

    if bool(viewport._right_mouse_repeat_support_face_mode) or bool(viewport._right_mouse_repeat_visible_face_chain_mode):
        viewport._right_mouse_repeat_due_s = float(now_s)
    else:
        viewport._right_mouse_repeat_due_s = float(now_s) + float(min(float(viewport._state.block_place_repeat_interval_s), float(_PLACE_REPEAT_RETRY_INTERVAL_S)))


def handle_held_mouse_buttons_pre_step(viewport: "GLViewportWidget") -> None:
    if (viewport._overlays.paused() or viewport._overlays.inventory_open() or viewport._overlays.dead() or viewport._overlays.settings_open() or viewport._overlays.othello_settings_open() or (not viewport._inp.captured()) or viewport._state.is_othello_space()):
        return

    now_s = time.perf_counter()
    if bool(viewport._right_mouse_held) and bool(viewport._right_mouse_repeat_enabled) and is_my_world_space(viewport._state.current_space_id) and float(now_s) + 1e-9 >= float(viewport._right_mouse_repeat_due_s) and str(viewport._right_mouse_repeat_mode) == INTERACTION_ACTION_PLACE:
        _advance_right_mouse_place_repeat(viewport, now_s=float(now_s))


def handle_held_mouse_buttons(viewport: "GLViewportWidget") -> None:
    if (viewport._overlays.paused() or viewport._overlays.inventory_open() or viewport._overlays.dead() or viewport._overlays.settings_open() or viewport._overlays.othello_settings_open() or (not viewport._inp.captured()) or viewport._state.is_othello_space()):
        return

    now_s = time.perf_counter()

    if bool(viewport._left_mouse_held) and bool(viewport._state.creative_mode) and is_my_world_space(viewport._state.current_space_id) and float(now_s) + 1e-9 >= float(viewport._left_mouse_repeat_due_s):
        _perform_left_click(viewport)
        viewport._left_mouse_repeat_due_s = float(now_s) + float(viewport._state.block_break_repeat_interval_s)

    if bool(viewport._right_mouse_held) and bool(viewport._right_mouse_repeat_enabled) and is_my_world_space(viewport._state.current_space_id) and float(now_s) + 1e-9 >= float(viewport._right_mouse_repeat_due_s):
        if str(viewport._right_mouse_repeat_mode) == INTERACTION_ACTION_INTERACT:
            _perform_right_click_interact_repeat(viewport)
            viewport._right_mouse_repeat_due_s = float(now_s) + float(viewport._state.block_interact_repeat_interval_s)
        elif str(viewport._right_mouse_repeat_mode) == INTERACTION_ACTION_PLACE:
            return
        else:
            viewport._disable_right_mouse_repeat()


def _perform_left_click(viewport: "GLViewportWidget"):
    interaction_eye, _yaw, _pitch, interaction_direction = viewport._interaction_pose()
    break_outcome = None
    if bool(viewport._state.creative_mode) and is_my_world_space(viewport._state.current_space_id):
        break_outcome = viewport._session.break_block(reach=float(viewport._state.reach), origin=interaction_eye, direction=interaction_direction)
    viewport._first_person_motion.trigger_left_swing()
    if break_outcome is not None and bool(break_outcome.success):
        _spawn_break_particles(viewport, block_state=break_outcome.target_block_state, position=break_outcome.target_position)
        viewport._audio.play_interaction(action=break_outcome.action, block_state=break_outcome.target_block_state, position=break_outcome.target_position)
        viewport._invalidate_selection_target()
    return break_outcome


def _current_interaction_hit(viewport: "GLViewportWidget"):
    interaction_eye, _yaw, _pitch, interaction_direction = viewport._interaction_pose()
    hit = viewport._session.pick_block(reach=float(viewport._state.reach), origin=interaction_eye, direction=interaction_direction)
    return (interaction_eye, interaction_direction, hit)


def _finalize_right_click(viewport: "GLViewportWidget", outcome: InteractionOutcome) -> None:
    viewport._first_person_motion.trigger_right_swing(success=bool(outcome.success))
    if bool(outcome.success):
        viewport._audio.play_interaction(action=outcome.action, block_state=outcome.target_block_state, position=outcome.target_position)
        viewport._invalidate_selection_target()


def _face_from_cardinal(facing: str) -> int:
    if str(facing) == "east":
        return int(FACE_POS_X)
    if str(facing) == "west":
        return int(FACE_NEG_X)
    if str(facing) == "south":
        return int(FACE_POS_Z)
    return int(FACE_NEG_Z)


def _clamp_scalar(value: float, lo: float, hi: float) -> float:
    return max(float(lo), min(float(hi), float(value)))


def _is_vertical_face(face: int) -> bool:
    return int(face) in (int(FACE_POS_Y), int(FACE_NEG_Y))


def _support_face_hit_point(*, support_cell: tuple[int, int, int], face: int, eye: Vec3, direction: Vec3) -> Vec3:
    eps = 1e-4
    bx, by, bz = (int(support_cell[0]), int(support_cell[1]), int(support_cell[2]))

    if int(face) == int(FACE_POS_X):
        plane_x = float(bx + 1)
        t = None if abs(float(direction.x)) <= 1e-6 else float((plane_x - float(eye.x)) / float(direction.x))
        hit_y = float(eye.y) if t is None or float(t) <= 0.0 else float(eye.y) + float(direction.y) * float(t)
        hit_z = float(eye.z) if t is None or float(t) <= 0.0 else float(eye.z) + float(direction.z) * float(t)
        return Vec3(float(plane_x), _clamp_scalar(float(hit_y), float(by) + eps, float(by + 1) - eps), _clamp_scalar(float(hit_z), float(bz) + eps, float(bz + 1) - eps))

    if int(face) == int(FACE_NEG_X):
        plane_x = float(bx)
        t = None if abs(float(direction.x)) <= 1e-6 else float((plane_x - float(eye.x)) / float(direction.x))
        hit_y = float(eye.y) if t is None or float(t) <= 0.0 else float(eye.y) + float(direction.y) * float(t)
        hit_z = float(eye.z) if t is None or float(t) <= 0.0 else float(eye.z) + float(direction.z) * float(t)
        return Vec3(float(plane_x), _clamp_scalar(float(hit_y), float(by) + eps, float(by + 1) - eps), _clamp_scalar(float(hit_z), float(bz) + eps, float(bz + 1) - eps))

    if int(face) == int(FACE_POS_Z):
        plane_z = float(bz + 1)
        t = None if abs(float(direction.z)) <= 1e-6 else float((plane_z - float(eye.z)) / float(direction.z))
        hit_x = float(eye.x) if t is None or float(t) <= 0.0 else float(eye.x) + float(direction.x) * float(t)
        hit_y = float(eye.y) if t is None or float(t) <= 0.0 else float(eye.y) + float(direction.y) * float(t)
        return Vec3(_clamp_scalar(float(hit_x), float(bx) + eps, float(bx + 1) - eps), _clamp_scalar(float(hit_y), float(by) + eps, float(by + 1) - eps), float(plane_z))

    plane_z = float(bz)
    t = None if abs(float(direction.z)) <= 1e-6 else float((plane_z - float(eye.z)) / float(direction.z))
    hit_x = float(eye.x) if t is None or float(t) <= 0.0 else float(eye.x) + float(direction.x) * float(t)
    hit_y = float(eye.y) if t is None or float(t) <= 0.0 else float(eye.y) + float(direction.y) * float(t)
    return Vec3(_clamp_scalar(float(hit_x), float(bx) + eps, float(bx + 1) - eps), _clamp_scalar(float(hit_y), float(by) + eps, float(by + 1) - eps), float(plane_z))


def _face_plane_intersection_point(*, cell: tuple[int, int, int], face: int, eye: Vec3, direction: Vec3, reach: float) -> Vec3 | None:
    eps = 1e-4
    bx, by, bz = (int(cell[0]), int(cell[1]), int(cell[2]))

    if int(face) == int(FACE_POS_X):
        denom = float(direction.x)
        if abs(float(denom)) <= 1e-6:
            return None
        plane_x = float(bx + 1)
        t = float((plane_x - float(eye.x)) / float(denom))
        if float(t) < 0.0 or float(t) > float(reach):
            return None
        hit_y = float(eye.y) + float(direction.y) * float(t)
        hit_z = float(eye.z) + float(direction.z) * float(t)
        if not (float(by) + eps <= float(hit_y) <= float(by + 1) - eps and float(bz) + eps <= float(hit_z) <= float(bz + 1) - eps):
            return None
        return Vec3(float(plane_x), float(hit_y), float(hit_z))

    if int(face) == int(FACE_NEG_X):
        denom = float(direction.x)
        if abs(float(denom)) <= 1e-6:
            return None
        plane_x = float(bx)
        t = float((plane_x - float(eye.x)) / float(denom))
        if float(t) < 0.0 or float(t) > float(reach):
            return None
        hit_y = float(eye.y) + float(direction.y) * float(t)
        hit_z = float(eye.z) + float(direction.z) * float(t)
        if not (float(by) + eps <= float(hit_y) <= float(by + 1) - eps and float(bz) + eps <= float(hit_z) <= float(bz + 1) - eps):
            return None
        return Vec3(float(plane_x), float(hit_y), float(hit_z))

    if int(face) == int(FACE_POS_Z):
        denom = float(direction.z)
        if abs(float(denom)) <= 1e-6:
            return None
        plane_z = float(bz + 1)
        t = float((plane_z - float(eye.z)) / float(denom))
        if float(t) < 0.0 or float(t) > float(reach):
            return None
        hit_x = float(eye.x) + float(direction.x) * float(t)
        hit_y = float(eye.y) + float(direction.y) * float(t)
        if not (float(bx) + eps <= float(hit_x) <= float(bx + 1) - eps and float(by) + eps <= float(hit_y) <= float(by + 1) - eps):
            return None
        return Vec3(float(hit_x), float(hit_y), float(plane_z))

    denom = float(direction.z)
    if abs(float(denom)) <= 1e-6:
        return None
    plane_z = float(bz)
    t = float((plane_z - float(eye.z)) / float(denom))
    if float(t) < 0.0 or float(t) > float(reach):
        return None
    hit_x = float(eye.x) + float(direction.x) * float(t)
    hit_y = float(eye.y) + float(direction.y) * float(t)
    if not (float(bx) + eps <= float(hit_x) <= float(bx + 1) - eps and float(by) + eps <= float(hit_y) <= float(by + 1) - eps):
        return None
    return Vec3(float(hit_x), float(hit_y), float(plane_z))


def _support_face_place_hit(viewport: "GLViewportWidget", *, eye: Vec3, direction: Vec3) -> BlockPick | None:
    contact = viewport._session.support_block_contact()
    if contact is None:
        return None

    horizontal_direction = Vec3(float(direction.x), 0.0, float(direction.z))
    if horizontal_direction.length() <= 1e-6:
        horizontal_direction = forward_from_yaw_pitch_deg(float(viewport._session.player.yaw_deg), 0.0)

    support_cell = tuple(int(value) for value in contact.cell)
    facing = cardinal_from_xz(float(horizontal_direction.x), float(horizontal_direction.z), default="south")
    face = _face_from_cardinal(str(facing))
    ox, oy, oz = face_neighbor_offset(int(face))
    place_cell = (int(support_cell[0] + ox), int(support_cell[1] + oy), int(support_cell[2] + oz))
    if viewport._session.world.blocks.get(place_cell) is not None:
        return None

    hit_point = _support_face_hit_point(support_cell=tuple(int(value) for value in support_cell), face=int(face), eye=eye, direction=direction)
    return BlockPick(hit=tuple(int(value) for value in support_cell), place=tuple(int(value) for value in place_cell), t=0.0, face=int(face), hit_point=hit_point)


def _support_face_surface_matches_hit(*, world_hit: BlockPick, support_hit: BlockPick) -> bool:
    if tuple(int(value) for value in world_hit.hit) != tuple(int(value) for value in support_hit.hit):
        return False
    if int(world_hit.face) == int(support_hit.face):
        return True

    local_x = float(world_hit.hit_point.x) - math.floor(float(world_hit.hit_point.x))
    local_z = float(world_hit.hit_point.z) - math.floor(float(world_hit.hit_point.z))
    threshold = float(_SUPPORT_FACE_ROUTE_HALF_THRESHOLD)
    if int(support_hit.face) == int(FACE_POS_X):
        return float(local_x) >= float(threshold)
    if int(support_hit.face) == int(FACE_NEG_X):
        return float(local_x) <= (1.0 - float(threshold))
    if int(support_hit.face) == int(FACE_POS_Z):
        return float(local_z) >= float(threshold)
    if int(support_hit.face) == int(FACE_NEG_Z):
        return float(local_z) <= (1.0 - float(threshold))
    return False


def _should_prefer_support_face_hit(viewport: "GLViewportWidget", *, world_hit: BlockPick | None, support_hit: BlockPick | None, direction: Vec3) -> bool:
    if support_hit is None:
        return False
    if world_hit is None:
        return True

    player = viewport._session.player
    support_contact = viewport._session.support_block_contact()
    if support_contact is not None and _support_face_surface_matches_hit(world_hit=world_hit, support_hit=support_hit):
        return True
    if support_contact is not None and tuple(int(value) for value in world_hit.hit) == tuple(int(value) for value in support_contact.cell):
        if int(world_hit.face) == int(FACE_POS_Y) and float(direction.y) <= -0.80:
            return True

    if not bool(player.on_ground):
        return False
    if not bool(viewport._inp.crouch_held()):
        return False

    if world_hit.place is None:
        return True

    support_place = tuple(int(value) for value in support_hit.place) if support_hit.place is not None else None
    world_place = tuple(int(value) for value in world_hit.place)
    if support_place is None:
        return False
    if int(world_place[1]) != int(support_place[1]):
        return True
    if _is_vertical_face(int(world_hit.face)):
        return True
    if tuple(int(value) for value in world_hit.hit) == tuple(int(value) for value in support_hit.hit) and tuple(int(value) for value in world_place) != tuple(int(value) for value in support_place):
        return True
    return False


def _select_place_hit(viewport: "GLViewportWidget", *, eye: Vec3, direction: Vec3, world_hit: BlockPick | None) -> tuple[BlockPick | None, bool]:
    support_hit = _support_face_place_hit(viewport, eye=eye, direction=direction)
    if _should_prefer_support_face_hit(viewport, world_hit=world_hit, support_hit=support_hit, direction=direction):
        return (support_hit, True)
    if world_hit is not None:
        return (world_hit, False)
    if support_hit is not None:
        return (support_hit, True)
    return (None, False)


def _repeat_vertical_motion_sign(viewport: "GLViewportWidget") -> int:
    player = viewport._session.player
    if bool(viewport._inp.crouch_held()) and bool(player.on_ground) and float(player.crouch_eye_offset) >= 0.05:
        return -1
    if (not bool(player.on_ground)) and float(player.velocity.y) >= -0.08:
        return 1
    if float(player.velocity.y) > 0.08:
        return 1
    return 0


def _project_repeat_step(viewport: "GLViewportWidget", *, face: int, direction: Vec3, hit_point: Vec3 | None=None) -> tuple[int, int, int] | None:
    nx, ny, nz = face_neighbor_offset(int(face))
    tangent_x = float(direction.x) - float(nx) * float(direction.dot(Vec3(float(nx), float(ny), float(nz))))
    tangent_y = float(direction.y) - float(ny) * float(direction.dot(Vec3(float(nx), float(ny), float(nz))))
    tangent_z = float(direction.z) - float(nz) * float(direction.dot(Vec3(float(nx), float(ny), float(nz))))

    candidates: list[tuple[float, tuple[int, int, int], str]] = []
    if nx == 0:
        candidates.append((abs(float(tangent_x)), (1 if tangent_x >= 0.0 else -1, 0, 0), "x"))
    if ny == 0:
        candidates.append((abs(float(tangent_y)), (0, 1 if tangent_y >= 0.0 else -1, 0), "y"))
    if nz == 0:
        candidates.append((abs(float(tangent_z)), (0, 0, 1 if tangent_z >= 0.0 else -1), "z"))

    if not candidates:
        return None

    if int(ny) == 0:
        horizontal_candidates = [item for item in candidates if str(item[2]) != "y"]
        vertical_candidates = [item for item in candidates if str(item[2]) == "y"]
        best_horizontal = max(horizontal_candidates, key=lambda item: float(item[0])) if horizontal_candidates else None
        best_vertical = max(vertical_candidates, key=lambda item: float(item[0])) if vertical_candidates else None
        vertical_motion_sign = int(_repeat_vertical_motion_sign(viewport))

        if best_horizontal is not None:
            if best_vertical is None:
                mag, step, _axis = best_horizontal
            else:
                local_y = 0.5 if hit_point is None else (float(hit_point.y) - math.floor(float(hit_point.y)))
                vertical_intent = (int(vertical_motion_sign) != 0) and (int(best_vertical[1][1]) == int(vertical_motion_sign)) and (float(best_vertical[0]) > float(best_horizontal[0]) * 1.10) and ((float(best_vertical[1][1]) < 0 and float(local_y) <= 0.40) or (float(best_vertical[1][1]) > 0 and float(local_y) >= 0.60))
                mag, step, _axis = best_vertical if bool(vertical_intent) else best_horizontal
        else:
            mag, step, _axis = max(candidates, key=lambda item: float(item[0]))
    else:
        mag, step, _axis = max(candidates, key=lambda item: float(item[0]))

    if float(mag) <= 1e-6:
        return None
    return tuple(int(value) for value in step)


def _place_repeat_line_for_result(viewport: "GLViewportWidget", hit, outcome: InteractionOutcome, *, direction: Vec3) -> _PlaceRepeatLine | None:
    if not bool(outcome.success) or str(outcome.action) != INTERACTION_ACTION_PLACE or hit is None or hit.place is None or outcome.target_position is None:
        return None

    placed_cell = tuple(int(value) for value in hit.place)
    target_position = tuple(int(value) for value in outcome.target_position)
    if placed_cell != target_position:
        return None

    face_step = face_neighbor_offset(int(hit.face))
    face_chain_mode = (not _is_vertical_face(int(hit.face))) and int(face_step[1]) == 0
    if bool(face_chain_mode):
        return _PlaceRepeatLine(start_cell=placed_cell, step=(int(face_step[0]), int(face_step[1]), int(face_step[2])), face=int(hit.face), plane_normal=(int(face_step[0]), int(face_step[1]), int(face_step[2])), plane_point=(float(hit.hit_point.x), float(hit.hit_point.y), float(hit.hit_point.z)), min_progress=0, max_progress=0, support_face_mode=False, visible_face_chain_mode=True)

    step = _project_repeat_step(viewport, face=int(hit.face), direction=direction, hit_point=hit.hit_point)
    plane_normal = face_neighbor_offset(int(hit.face))
    if step is None or plane_normal == (0, 0, 0):
        return None

    return _PlaceRepeatLine(start_cell=placed_cell, step=tuple(int(value) for value in step), face=int(hit.face), plane_normal=(int(plane_normal[0]), int(plane_normal[1]), int(plane_normal[2])), plane_point=(float(hit.hit_point.x), float(hit.hit_point.y), float(hit.hit_point.z)), min_progress=0, max_progress=0, support_face_mode=False, visible_face_chain_mode=False)


def _support_face_repeat_line_for_result(hit, outcome: InteractionOutcome) -> _PlaceRepeatLine | None:
    if not bool(outcome.success) or str(outcome.action) != INTERACTION_ACTION_PLACE or hit is None or hit.place is None or outcome.target_position is None:
        return None

    placed_cell = tuple(int(value) for value in hit.place)
    target_position = tuple(int(value) for value in outcome.target_position)
    if placed_cell != target_position:
        return None

    step = face_neighbor_offset(int(hit.face))
    if step == (0, 0, 0) or int(step[1]) != 0:
        return None

    plane_normal = (0, 0, 1) if int(step[0]) != 0 else (1, 0, 0)
    return _PlaceRepeatLine(start_cell=placed_cell, step=(int(step[0]), int(step[1]), int(step[2])), face=int(hit.face), plane_normal=(int(plane_normal[0]), int(plane_normal[1]), int(plane_normal[2])), plane_point=(float(placed_cell[0]) + 0.5, float(placed_cell[1]) + 0.5, float(placed_cell[2]) + 0.5), min_progress=0, max_progress=0, support_face_mode=True, visible_face_chain_mode=False)


def _apply_initial_right_mouse_repeat(viewport: "GLViewportWidget", *, now_s: float, result: _RightClickResult) -> None:
    if not bool(result.outcome.success):
        viewport._disable_right_mouse_repeat()
        return

    if str(result.repeat_action) == INTERACTION_ACTION_INTERACT and result.interact_cell is not None:
        viewport._enable_right_mouse_interact_repeat(now_s=float(now_s), target_cell=result.interact_cell)
        return

    if str(result.repeat_action) == INTERACTION_ACTION_PLACE and result.place_line is not None:
        viewport._enable_right_mouse_place_repeat(now_s=float(now_s), start_cell=result.place_line.start_cell, step=result.place_line.step, face=int(result.place_line.face), plane_normal=result.place_line.plane_normal, plane_point=result.place_line.plane_point, min_progress=int(result.place_line.min_progress), max_progress=int(result.place_line.max_progress), support_face_mode=bool(result.place_line.support_face_mode), visible_face_chain_mode=bool(result.place_line.visible_face_chain_mode))
        return

    viewport._disable_right_mouse_repeat()


def _perform_right_click(viewport: "GLViewportWidget") -> _RightClickResult:
    interaction_eye, interaction_direction, hit = _current_interaction_hit(viewport)
    outcome = InteractionOutcome(success=False)
    repeat_action: str | None = None
    interact_cell: tuple[int, int, int] | None = None
    place_line: _PlaceRepeatLine | None = None
    place_hit: BlockPick | None = None
    support_face_place = False

    if hit is not None:
        if not bool(viewport._inp.crouch_held()):
            interact_cell = tuple(int(value) for value in hit.hit)
            outcome = viewport._session.interact_block_at_hit(interact_cell)
            if bool(outcome.success):
                repeat_action = INTERACTION_ACTION_INTERACT

    if bool(viewport._inp.captured()):
        place_hit, support_face_place = _select_place_hit(viewport, eye=interaction_eye, direction=interaction_direction, world_hit=hit)

    if (not bool(outcome.success)) and place_hit is not None:
        outcome = viewport._session.place_block_from_hit(place_hit, settings_controller.current_block_id(viewport))
        if bool(support_face_place):
            place_line = _support_face_repeat_line_for_result(place_hit, outcome)
        else:
            place_line = _place_repeat_line_for_result(viewport, place_hit, outcome, direction=interaction_direction)
        if place_line is not None:
            repeat_action = INTERACTION_ACTION_PLACE

    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=repeat_action, interact_cell=interact_cell, place_line=place_line)


def _perform_right_click_interact_repeat(viewport: "GLViewportWidget") -> InteractionOutcome:
    target_cell = viewport._right_mouse_repeat_target_cell
    if target_cell is None:
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return outcome

    _interaction_eye, _interaction_direction, hit = _current_interaction_hit(viewport)
    if hit is None or tuple(int(value) for value in hit.hit) != tuple(int(value) for value in target_cell):
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return outcome

    outcome = viewport._session.interact_block_at_hit(tuple(int(value) for value in hit.hit))
    _finalize_right_click(viewport, outcome)
    return outcome


def _ray_hits_repeat_plane(*, eye: Vec3, direction: Vec3, plane_normal: tuple[int, int, int], plane_point: tuple[float, float, float], reach: float) -> tuple[Vec3, float] | None:
    normal = Vec3(float(plane_normal[0]), float(plane_normal[1]), float(plane_normal[2]))
    denom = float(direction.dot(normal))
    if abs(float(denom)) <= 1e-6:
        return None

    plane_anchor = Vec3(float(plane_point[0]), float(plane_point[1]), float(plane_point[2]))
    t = float((plane_anchor - eye).dot(normal) / denom)
    if t < 0.0 or t > float(reach):
        return None

    hit_point = eye + direction * float(t)
    return (hit_point, float(t))


def _repeat_line_progress_coordinate(*, start_cell: tuple[int, int, int], step: tuple[int, int, int], hit_point: Vec3) -> float | None:
    if int(step[0]) != 0:
        return (float(hit_point.x) - (float(start_cell[0]) + 0.5)) * float(step[0])
    if int(step[1]) != 0:
        return (float(hit_point.y) - (float(start_cell[1]) + 0.5)) * float(step[1])
    if int(step[2]) != 0:
        return (float(hit_point.z) - (float(start_cell[2]) + 0.5)) * float(step[2])
    return None


def _repeat_line_progress(*, start_cell: tuple[int, int, int], step: tuple[int, int, int], cell: tuple[int, int, int]) -> int | None:
    dx = int(cell[0]) - int(start_cell[0])
    dy = int(cell[1]) - int(start_cell[1])
    dz = int(cell[2]) - int(start_cell[2])
    sx, sy, sz = (int(step[0]), int(step[1]), int(step[2]))

    if sx != 0:
        if dy != 0 or dz != 0:
            return None
        return int(dx * sx)
    if sy != 0:
        if dx != 0 or dz != 0:
            return None
        return int(dy * sy)
    if sz != 0:
        if dx != 0 or dy != 0:
            return None
        return int(dz * sz)
    return None


def _repeat_line_cell(*, start_cell: tuple[int, int, int], step: tuple[int, int, int], progress: int) -> tuple[int, int, int]:
    return (int(start_cell[0] + step[0] * progress), int(start_cell[1] + step[1] * progress), int(start_cell[2] + step[2] * progress))


def _support_face_repeat_candidate_hit(*, hit: BlockPick | None, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, min_progress: int, max_progress: int) -> tuple[BlockPick, int, int] | None:
    if hit is None or hit.place is None:
        return None
    if int(hit.face) != int(face):
        return None

    support_progress = _repeat_line_progress(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), cell=tuple(int(value) for value in hit.hit))
    target_progress = _repeat_line_progress(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), cell=tuple(int(value) for value in hit.place))
    if support_progress is None or target_progress is None:
        return None
    if int(target_progress) == int(support_progress) + 1 and int(support_progress) == int(max_progress):
        return (hit, int(support_progress), int(target_progress))
    if int(target_progress) == int(support_progress) - 1 and int(support_progress) == int(min_progress):
        return (hit, int(support_progress), int(target_progress))
    return None


def _visible_face_chain_candidate_hit(*, hit: BlockPick | None, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, min_progress: int, max_progress: int) -> tuple[BlockPick, int, int] | None:
    if hit is None or hit.place is None:
        return None
    if int(hit.face) != int(face):
        return None
    return _support_face_repeat_candidate_hit(hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress))


def _direct_visible_support_face_candidate(viewport: "GLViewportWidget", *, hit: BlockPick | None, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, min_progress: int, max_progress: int) -> tuple[BlockPick, int, int] | None:
    if hit is None or hit.place is None or _is_vertical_face(int(hit.face)):
        return None
    if int(hit.face) != int(face):
        return None

    contact = viewport._session.support_block_contact()
    if contact is not None and tuple(int(value) for value in hit.hit) == tuple(int(value) for value in contact.cell):
        return None

    return _support_face_repeat_candidate_hit(hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress))


def _projected_frontier_support_face_candidate(viewport: "GLViewportWidget", *, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, min_progress: int, max_progress: int, eye: Vec3, direction: Vec3, hit: BlockPick | None) -> tuple[BlockPick, int, int] | None:
    intent_direction = Vec3(float(direction.x), float(direction.y), float(direction.z))
    if math.hypot(float(direction.x), float(direction.z)) <= 0.25:
        horizontal_fallback = forward_from_yaw_pitch_deg(float(viewport._session.player.yaw_deg), 0.0)
        intent_direction = Vec3(float(horizontal_fallback.x), 0.0, float(horizontal_fallback.z))

    axis_intent = (float(intent_direction.x) * float(step[0])) + (float(intent_direction.y) * float(step[1])) + (float(intent_direction.z) * float(step[2]))
    if float(axis_intent) <= 0.15:
        return None

    frontier_progress = int(max_progress)
    target_progress = int(max_progress) + 1
    frontier_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(frontier_progress))
    target_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(target_progress))
    if viewport._session.world.blocks.get(tuple(int(value) for value in target_cell)) is not None:
        return None
    if hit is None or tuple(int(value) for value in hit.hit) != tuple(int(value) for value in frontier_cell):
        return None

    player = viewport._session.player
    if bool(player.on_ground):
        support_contact = viewport._session.support_block_contact()
        if support_contact is None or tuple(int(value) for value in support_contact.cell) != tuple(int(value) for value in frontier_cell):
            return None

    hit_point = _face_plane_intersection_point(cell=tuple(int(value) for value in frontier_cell), face=int(face), eye=eye, direction=direction, reach=float(viewport._state.reach))
    if hit_point is None and math.hypot(float(direction.x), float(direction.z)) <= 0.25:
        fallback_direction = forward_from_yaw_pitch_deg(float(viewport._session.player.yaw_deg), 0.0)
        hit_point = _support_face_hit_point(support_cell=tuple(int(value) for value in frontier_cell), face=int(face), eye=eye, direction=fallback_direction)
    if hit_point is None:
        return None

    return (BlockPick(hit=tuple(int(value) for value in frontier_cell), place=tuple(int(value) for value in target_cell), t=0.0, face=int(face), hit_point=hit_point), int(frontier_progress), int(target_progress))


def _perform_visible_face_place_repeat(viewport: "GLViewportWidget", *, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, plane_normal: tuple[int, int, int], plane_point: tuple[float, float, float], min_progress: int, max_progress: int, hit: BlockPick | None) -> _RightClickResult:
    candidate = _visible_face_chain_candidate_hit(hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress))
    if candidate is None:
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=_PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), support_face_mode=False, visible_face_chain_mode=True))

    candidate_hit, _frontier_progress, target_progress = candidate
    synthetic_hit = BlockPick(hit=tuple(int(value) for value in candidate_hit.hit), place=tuple(int(value) for value in candidate_hit.place), t=0.0, face=int(candidate_hit.face), hit_point=Vec3(float(candidate_hit.hit_point.x), float(candidate_hit.hit_point.y), float(candidate_hit.hit_point.z)))
    outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
    next_min_progress = int(min(min_progress, target_progress))
    next_max_progress = int(max(max_progress, target_progress))
    place_line = _PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(next_min_progress), max_progress=int(next_max_progress), support_face_mode=False, visible_face_chain_mode=True)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)


def _perform_support_face_place_repeat(viewport: "GLViewportWidget", *, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, plane_normal: tuple[int, int, int], plane_point: tuple[float, float, float], min_progress: int, max_progress: int, interaction_eye: Vec3, interaction_direction: Vec3, hit: BlockPick | None) -> _RightClickResult:
    candidate = _direct_visible_support_face_candidate(viewport, hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress))
    support_face_hit = _support_face_place_hit(viewport, eye=interaction_eye, direction=interaction_direction)
    if candidate is None:
        candidate = _projected_frontier_support_face_candidate(viewport, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress), eye=interaction_eye, direction=interaction_direction, hit=hit)
    if candidate is None:
        candidate = _support_face_repeat_candidate_hit(hit=support_face_hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress))
    if candidate is None:
        candidate = _support_face_repeat_candidate_hit(hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress))
    if candidate is None:
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=_PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), support_face_mode=True))

    candidate_hit, frontier_progress, target_progress = candidate
    synthetic_hit = BlockPick(hit=tuple(int(value) for value in candidate_hit.hit), place=tuple(int(value) for value in candidate_hit.place), t=0.0, face=int(candidate_hit.face), hit_point=Vec3(float(candidate_hit.hit_point.x), float(candidate_hit.hit_point.y), float(candidate_hit.hit_point.z)))
    outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
    next_min_progress = int(min(min_progress, target_progress))
    next_max_progress = int(max(max_progress, target_progress))
    place_line = _PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(next_min_progress), max_progress=int(next_max_progress), support_face_mode=True)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)


def _perform_right_click_place_repeat(viewport: "GLViewportWidget") -> _RightClickResult:
    start_cell = viewport._right_mouse_repeat_line_start
    step = viewport._right_mouse_repeat_line_step
    face = viewport._right_mouse_repeat_line_face
    plane_normal = viewport._right_mouse_repeat_line_plane_normal
    plane_point = viewport._right_mouse_repeat_line_plane_point
    min_progress = int(viewport._right_mouse_repeat_line_min_progress)
    max_progress = int(viewport._right_mouse_repeat_line_max_progress)
    support_face_mode = bool(viewport._right_mouse_repeat_support_face_mode)
    visible_face_chain_mode = bool(viewport._right_mouse_repeat_visible_face_chain_mode)
    if start_cell is None or step is None or face is None or plane_normal is None or plane_point is None:
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE)

    interaction_eye, interaction_direction, hit = _current_interaction_hit(viewport)
    if bool(visible_face_chain_mode):
        return _perform_visible_face_place_repeat(viewport, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), hit=hit)
    if bool(support_face_mode):
        return _perform_support_face_place_repeat(viewport, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), interaction_eye=interaction_eye, interaction_direction=interaction_direction, hit=hit)

    plane_hit = _ray_hits_repeat_plane(eye=interaction_eye, direction=interaction_direction, plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), reach=float(viewport._state.reach))
    if plane_hit is None:
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=_PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), support_face_mode=False, visible_face_chain_mode=False))

    hit_point, plane_t = plane_hit
    projected_progress_f = _repeat_line_progress_coordinate(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), hit_point=hit_point)
    if projected_progress_f is None:
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=_PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), support_face_mode=False, visible_face_chain_mode=False))
    if hit is not None and float(hit.t) + 1e-4 < float(plane_t):
        hit_progress = _repeat_line_progress(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), cell=tuple(int(value) for value in hit.hit))
        if hit_progress is None:
            outcome = InteractionOutcome(success=False)
            _finalize_right_click(viewport, outcome)
            return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=_PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), support_face_mode=False, visible_face_chain_mode=False))

    target_progress: int | None = None
    if float(projected_progress_f) > (float(max_progress) + 0.5 + 1e-4):
        target_progress = int(max_progress) + 1
    elif float(projected_progress_f) < (float(min_progress) - 0.5 - 1e-4):
        target_progress = int(min_progress) - 1

    if target_progress is None:
        outcome = InteractionOutcome(success=False)
        _finalize_right_click(viewport, outcome)
        return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=_PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(min_progress), max_progress=int(max_progress), support_face_mode=False, visible_face_chain_mode=False))

    target_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(target_progress))
    support_progress = int(target_progress) - 1 if int(target_progress) > 0 else int(target_progress) + 1
    support_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(support_progress))

    synthetic_hit = BlockPick(hit=tuple(int(value) for value in support_cell), place=tuple(int(value) for value in target_cell), t=0.0, face=int(face), hit_point=Vec3(float(hit_point.x), float(hit_point.y), float(hit_point.z)))
    outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
    next_min_progress = int(min(min_progress, target_progress))
    next_max_progress = int(max(max_progress, target_progress))
    place_line = _PlaceRepeatLine(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), plane_normal=tuple(int(value) for value in plane_normal), plane_point=tuple(float(value) for value in plane_point), min_progress=int(next_min_progress), max_progress=int(next_max_progress), support_face_mode=False, visible_face_chain_mode=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)


def _spawn_break_particles(viewport: "GLViewportWidget", *, block_state: str | None, position: tuple[int, int, int] | None) -> None:
    if block_state is None or position is None:
        return
    tools = viewport._renderer.world_build_tools()
    if tools is None:
        return
    uv_lookup, def_lookup = tools
    particles = spawn_block_break_particles(state_str=str(block_state), cell=(int(position[0]), int(position[1]), int(position[2])), uv_lookup=uv_lookup, def_lookup=def_lookup, spawn_rate=float(viewport._state.block_break_particle_spawn_rate), speed_scale=float(viewport._state.block_break_particle_speed_scale))
    viewport._append_block_break_particles(particles)
