# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import time
from dataclasses import dataclass, replace
from typing import TYPE_CHECKING

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QGuiApplication

import ludoxel.presentation.interface.othello.viewport as othello_controller
import ludoxel.presentation.interface.viewport.controllers.ai as ai_controller
import ludoxel.presentation.interface.viewport.controllers.overlay_navigation as overlay_controller
import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.application.preferences.keybinds import (
  ACTION_CLEAR_SELECTED_SLOT,
  ACTION_CYCLE_CAMERA_PERSPECTIVE,
  ACTION_TOGGLE_CREATIVE_MODE,
  ACTION_TOGGLE_DEBUG_HUD,
  ACTION_TOGGLE_DEBUG_SHADOW,
  ACTION_TOGGLE_GAMEPLAY_HUD,
  ACTION_TOGGLE_INVENTORY,
  action_for_key,
)
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import forward_from_yaw_pitch_deg
from ludoxel.foundations.mathematics.voxels.faces import FACE_NEG_X, FACE_NEG_Y, FACE_NEG_Z, FACE_POS_X, FACE_POS_Y, FACE_POS_Z, face_neighbor_offset
from ludoxel.presentation.audio import PLAYER_EVENT_ATTACK_STRONG, PLAYER_EVENT_ATTACK_WEAK, PLAYER_EVENT_DAMAGE_HIT
from ludoxel.presentation.interface.common.hotbar_support import hotbar_index_from_key
from ludoxel.presentation.interface.viewport.controllers.effects import spawn_break_effect
from ludoxel.simulation.blocks.models.api import has_full_top_support_for_block
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.blocks.states.values import slab_type_value
from ludoxel.simulation.blocks.states.view import def_from_state
from ludoxel.simulation.blocks.structures.cardinal import cardinal_from_xz
from ludoxel.simulation.blocks.structures.structural_rules import is_fence, is_fence_gate, is_slab, is_stairs, is_wall
from ludoxel.simulation.rules.interaction.outcomes import INTERACTION_ACTION_INTERACT, INTERACTION_ACTION_PLACE, InteractionOutcome
from ludoxel.simulation.rules.picking.block import BlockPick
from ludoxel.simulation.worlds.state.play_space import is_my_world_space

if TYPE_CHECKING:
  from PyQt6.QtGui import QKeyEvent, QMouseEvent, QWheelEvent

  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget


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
  start_cell_materialized: bool = True
  pending_support_cell: tuple[int, int, int] | None = None
  pending_support_face: int | None = None
  pending_support_hit_point: tuple[float, float, float] | None = None


@dataclass(frozen=True)
class _RightClickResult:
  outcome: InteractionOutcome
  repeat_action: str | None = None
  interact_cell: tuple[int, int, int] | None = None
  place_line: _PlaceRepeatLine | None = None


_PLACE_REPEAT_RETRY_INTERVAL_S = 1.0 / 120.0
_SUPPORT_FACE_ROUTE_HALF_THRESHOLD = 0.50
_SUPPORT_FACE_CORNER_AXIS_BIAS_EPS = 0.03
_INITIAL_VERTICAL_ANCHOR_RADIUS = 0.85
_VERTICAL_REPEAT_LOCK_DISPLACEMENT = 0.05
_GRAVITY_AFFECTED_TAG = "gravity_affected"


def _ai_settings_open(viewport: "RendererViewportWidget") -> bool:
  return bool(getattr(viewport, "_ai_settings_overlay_open", False))


def _overlay_blocks_gameplay_keybinds(viewport: "RendererViewportWidget") -> bool:
  return bool(
    viewport._overlays.paused()
    or viewport._overlays.inventory_open()
    or viewport._overlays.dead()
    or viewport._overlays.settings_open()
    or viewport._overlays.othello_settings_open()
    or _ai_settings_open(viewport)
  )


def _overlay_blocks_inventory_toggle_keybind(viewport: "RendererViewportWidget") -> bool:
  return bool(viewport._overlays.paused() or viewport._overlays.dead() or viewport._overlays.settings_open() or viewport._overlays.othello_settings_open() or _ai_settings_open(viewport))


def _is_gameplay_keybind(bound_action: str | None, hotbar_idx: int | None) -> bool:
  return bool(hotbar_idx is not None or (bound_action is not None and str(bound_action) != ACTION_TOGGLE_INVENTORY))


def handle_key_press(viewport: "RendererViewportWidget", e: "QKeyEvent") -> bool:
  bound_action = action_for_key(int(e.key()), viewport._state.keybinds)
  hotbar_idx = hotbar_index_from_key(int(e.key()), viewport._state.keybinds)

  if int(e.key()) == int(Qt.Key.Key_Escape):
    if viewport._overlays.dead():
      return True
    ai_dialog = getattr(viewport, "_ai_settings_dialog", None)
    if ai_dialog is not None and _ai_settings_open(viewport):
      ai_dialog.reject()
      return True
    if viewport._overlays.inventory_open():
      viewport._set_inventory_overlay(False)
      return True
    if viewport._overlays.othello_settings_open():
      overlay_controller.back_from_othello_settings(viewport)
      return True
    if viewport._overlays.settings_open():
      overlay_controller.back_from_settings(viewport)
      return True
    if viewport._overlays.paused():
      viewport._set_paused_overlay(False)
      settings_controller.sync_cloud_motion_pause(viewport)
    else:
      overlay_controller.open_pause_menu(viewport)
    return True

  if _overlay_blocks_gameplay_keybinds(viewport):
    if _is_gameplay_keybind(bound_action, hotbar_idx):
      return True
    if bound_action == ACTION_TOGGLE_INVENTORY and _overlay_blocks_inventory_toggle_keybind(viewport):
      return True

  if hotbar_idx is not None:
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

  if bound_action == ACTION_TOGGLE_GAMEPLAY_HUD:
    settings_controller.set_hide_hud(viewport, not bool(viewport._state.hide_hud))
    settings_controller.sync_settings_values(viewport)
    return True

  if bound_action == ACTION_CYCLE_CAMERA_PERSPECTIVE:
    settings_controller.cycle_camera_perspective(viewport)
    return True

  if bound_action == ACTION_TOGGLE_CREATIVE_MODE:
    settings_controller.set_creative_mode(viewport, not viewport._state.creative_mode)
    settings_controller.sync_settings_values(viewport)
    return True

  if bound_action == ACTION_TOGGLE_INVENTORY:
    if settings_controller.inventory_available(viewport):
      viewport._set_inventory_overlay(not viewport._overlays.inventory_open())
    return True

  if bound_action == ACTION_CLEAR_SELECTED_SLOT and is_my_world_space(viewport._state.current_space_id):
    settings_controller.clear_selected_hotbar_slot(viewport)
    return True

  if not _overlay_blocks_gameplay_keybinds(viewport):
    viewport._inp.on_key_press(e)
  return False


def handle_wheel(viewport: "RendererViewportWidget", e: "QWheelEvent") -> bool:
  if (
    viewport._overlays.paused()
    or viewport._overlays.inventory_open()
    or viewport._overlays.dead()
    or viewport._overlays.settings_open()
    or viewport._overlays.othello_settings_open()
    or _ai_settings_open(viewport)
  ):
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


def handle_mouse_press(viewport: "RendererViewportWidget", e: "QMouseEvent") -> bool:
  viewport.setFocus(Qt.FocusReason.MouseFocusReason)

  if (
    viewport._overlays.paused()
    or viewport._overlays.inventory_open()
    or viewport._overlays.dead()
    or viewport._overlays.settings_open()
    or viewport._overlays.othello_settings_open()
    or _ai_settings_open(viewport)
  ):
    return False

  if not viewport._inp.captured():
    viewport._inp.set_mouse_capture(True)
    return False

  if e.button() == Qt.MouseButton.LeftButton and bool(ai_controller.handle_route_left_click(viewport)):
    return True

  if viewport._state.is_othello_space():
    interaction_eye, _yaw, _pitch, interaction_direction = viewport._interaction_pose()
    if e.button() == Qt.MouseButton.LeftButton:
      othello_controller.handle_left_click(viewport, interaction_eye, interaction_direction)
    elif e.button() == Qt.MouseButton.RightButton:
      othello_controller.handle_right_click(viewport)
    return True

  now_s = time.perf_counter()
  if e.button() == Qt.MouseButton.LeftButton:
    outcome = _perform_left_click(viewport)
    if outcome is not None and bool(outcome.success):
      viewport._arm_left_mouse_repeat(now_s=float(now_s))
    else:
      viewport._left_mouse_held = True
      viewport._left_mouse_repeat_due_s = 0.0
    return True

  if e.button() == Qt.MouseButton.RightButton:
    viewport._arm_right_mouse_repeat()
    result = _perform_right_click(viewport)
    _apply_initial_right_mouse_repeat(viewport, now_s=float(now_s), result=result)
    return True

  return False


def handle_mouse_release(viewport: "RendererViewportWidget", e: "QMouseEvent") -> None:
  if e.button() == Qt.MouseButton.LeftButton:
    viewport._left_mouse_held = False
    viewport._left_mouse_repeat_due_s = 0.0
  elif e.button() == Qt.MouseButton.RightButton:
    viewport._right_mouse_held = False
    viewport._disable_right_mouse_repeat()


def _advance_right_mouse_place_repeat(viewport: "RendererViewportWidget", *, now_s: float) -> None:
  result = _perform_right_click_place_repeat(viewport)
  if result.place_line is not None:
    viewport._right_mouse_repeat_line_start = tuple(int(value) for value in result.place_line.start_cell)
    viewport._right_mouse_repeat_line_step = tuple(int(value) for value in result.place_line.step)
    viewport._right_mouse_repeat_line_face = int(result.place_line.face)
    viewport._right_mouse_repeat_line_plane_normal = tuple(int(value) for value in result.place_line.plane_normal)
    viewport._right_mouse_repeat_line_plane_point = tuple(float(value) for value in result.place_line.plane_point)
    viewport._right_mouse_repeat_line_min_progress = int(result.place_line.min_progress)
    viewport._right_mouse_repeat_line_max_progress = int(result.place_line.max_progress)
    viewport._right_mouse_repeat_line_start_cell_materialized = bool(result.place_line.start_cell_materialized)
    viewport._right_mouse_repeat_line_pending_support_cell = None if result.place_line.pending_support_cell is None else tuple(int(value) for value in result.place_line.pending_support_cell)
    viewport._right_mouse_repeat_line_pending_support_face = None if result.place_line.pending_support_face is None else int(result.place_line.pending_support_face)
    viewport._right_mouse_repeat_line_pending_support_hit_point = (
      None if result.place_line.pending_support_hit_point is None else tuple(float(value) for value in result.place_line.pending_support_hit_point)
    )
    viewport._right_mouse_repeat_support_face_mode = bool(result.place_line.support_face_mode)
    viewport._right_mouse_repeat_visible_face_chain_mode = bool(result.place_line.visible_face_chain_mode)
    if int(result.place_line.step[1]) > 0:
      viewport._right_mouse_repeat_vertical_lock_sign = 1
    elif int(result.place_line.step[1]) < 0:
      viewport._right_mouse_repeat_vertical_lock_sign = -1
  if bool(result.outcome.success):
    if result.place_line is None:
      viewport._disable_right_mouse_repeat()
      return
    if bool(viewport._right_mouse_repeat_support_face_mode) or bool(viewport._right_mouse_repeat_visible_face_chain_mode):
      viewport._right_mouse_repeat_due_s = float(now_s)
    else:
      viewport._right_mouse_repeat_due_s = float(now_s) + float(min(float(viewport._state.block_place_repeat_interval_s), float(_PLACE_REPEAT_RETRY_INTERVAL_S)))
    return

  if bool(viewport._right_mouse_repeat_support_face_mode) or bool(viewport._right_mouse_repeat_visible_face_chain_mode):
    viewport._right_mouse_repeat_due_s = float(now_s)
  else:
    viewport._right_mouse_repeat_due_s = float(now_s) + float(min(float(viewport._state.block_place_repeat_interval_s), float(_PLACE_REPEAT_RETRY_INTERVAL_S)))


def _physical_right_mouse_button_held() -> bool:
  app = QGuiApplication.instance()
  if app is None:
    return True
  buttons = app.mouseButtons()
  return bool(buttons & Qt.MouseButton.RightButton)


def _update_right_mouse_place_vertical_lock(viewport: "RendererViewportWidget") -> None:
  if not bool(viewport._right_mouse_repeat_enabled) or str(viewport._right_mouse_repeat_mode) != INTERACTION_ACTION_PLACE:
    return
  if int(getattr(viewport, "_right_mouse_repeat_vertical_lock_sign", 0)) != 0:
    return
  displacement_y = float(viewport._session.player.position.y) - float(getattr(viewport, "_right_mouse_repeat_origin_player_y", 0.0))
  if float(displacement_y) >= float(_VERTICAL_REPEAT_LOCK_DISPLACEMENT):
    viewport._right_mouse_repeat_vertical_lock_sign = 1
  elif float(displacement_y) <= -float(_VERTICAL_REPEAT_LOCK_DISPLACEMENT):
    viewport._right_mouse_repeat_vertical_lock_sign = -1


def handle_held_mouse_buttons_pre_step(viewport: "RendererViewportWidget") -> None:
  if (
    viewport._overlays.paused()
    or viewport._overlays.inventory_open()
    or viewport._overlays.dead()
    or viewport._overlays.settings_open()
    or viewport._overlays.othello_settings_open()
    or _ai_settings_open(viewport)
    or (not viewport._inp.captured())
    or viewport._state.is_othello_space()
  ):
    return

  if bool(viewport._right_mouse_held) and (not bool(_physical_right_mouse_button_held())):
    viewport._right_mouse_held = False
    viewport._disable_right_mouse_repeat()
    return

  _update_right_mouse_place_vertical_lock(viewport)

  now_s = time.perf_counter()
  if (
    bool(viewport._right_mouse_held)
    and bool(viewport._right_mouse_repeat_enabled)
    and is_my_world_space(viewport._state.current_space_id)
    and float(now_s) + 1e-9 >= float(viewport._right_mouse_repeat_due_s)
    and str(viewport._right_mouse_repeat_mode) == INTERACTION_ACTION_PLACE
  ):
    _advance_right_mouse_place_repeat(viewport, now_s=float(now_s))


def handle_held_mouse_buttons(viewport: "RendererViewportWidget") -> None:
  if (
    viewport._overlays.paused()
    or viewport._overlays.inventory_open()
    or viewport._overlays.dead()
    or viewport._overlays.settings_open()
    or viewport._overlays.othello_settings_open()
    or _ai_settings_open(viewport)
    or (not viewport._inp.captured())
    or viewport._state.is_othello_space()
  ):
    return

  now_s = time.perf_counter()

  if (
    bool(viewport._left_mouse_held)
    and bool(viewport._state.creative_mode)
    and is_my_world_space(viewport._state.current_space_id)
    and float(viewport._left_mouse_repeat_due_s) > 0.0
    and float(now_s) + 1e-9 >= float(viewport._left_mouse_repeat_due_s)
  ):
    outcome = _perform_left_click(viewport)
    if outcome is not None and bool(outcome.success):
      viewport._left_mouse_repeat_due_s = float(now_s) + float(viewport._state.block_break_repeat_interval_s)
    else:
      viewport._left_mouse_repeat_due_s = 0.0

  if (
    bool(viewport._right_mouse_held)
    and bool(viewport._right_mouse_repeat_enabled)
    and is_my_world_space(viewport._state.current_space_id)
    and float(now_s) + 1e-9 >= float(viewport._right_mouse_repeat_due_s)
  ):
    if str(viewport._right_mouse_repeat_mode) == INTERACTION_ACTION_INTERACT:
      _perform_right_click_interact_repeat(viewport)
      viewport._right_mouse_repeat_due_s = float(now_s) + float(viewport._state.block_interact_repeat_interval_s)
    elif str(viewport._right_mouse_repeat_mode) == INTERACTION_ACTION_PLACE:
      return
    else:
      viewport._disable_right_mouse_repeat()


def _perform_left_click(viewport: "RendererViewportWidget"):
  interaction_eye, _yaw, _pitch, interaction_direction = viewport._interaction_pose()
  break_outcome = None
  attack_result = None
  attack_success = False
  if is_my_world_space(viewport._state.current_space_id):
    attack_result = viewport._session.attack_ai_player(origin=interaction_eye, direction=interaction_direction)
    attack_success = bool(attack_result.success)
  if bool(viewport._state.creative_mode) and is_my_world_space(viewport._state.current_space_id):
    if not bool(attack_success):
      break_outcome = viewport._session.break_block(reach=float(viewport._state.reach), origin=interaction_eye, direction=interaction_direction)
  viewport._first_person_motion.trigger_left_swing()
  if break_outcome is not None and bool(break_outcome.success):
    spawn_break_effect(viewport, block_state=break_outcome.target_block_state, position=break_outcome.target_position)
    viewport._audio.play_interaction(action=break_outcome.action, block_state=break_outcome.target_block_state, position=break_outcome.target_position)
    viewport._invalidate_selection_target()
  if bool(attack_success):
    viewport._audio.play_player_event(event_name=PLAYER_EVENT_ATTACK_STRONG)
    if attack_result is not None and attack_result.target_position is not None:
      viewport._audio.play_player_event(event_name=PLAYER_EVENT_DAMAGE_HIT, position=tuple(attack_result.target_position))
    return InteractionOutcome(success=True)
  if break_outcome is None or (not bool(break_outcome.success)):
    viewport._audio.play_player_event(event_name=PLAYER_EVENT_ATTACK_WEAK)
  return break_outcome


def _current_interaction_hit(viewport: "RendererViewportWidget"):
  interaction_eye, _yaw, _pitch, interaction_direction = viewport._interaction_pose()
  hit = viewport._session.pick_block(reach=float(viewport._state.reach), origin=interaction_eye, direction=interaction_direction)
  return (interaction_eye, interaction_direction, hit)


def _finalize_right_click(viewport: "RendererViewportWidget", outcome: InteractionOutcome) -> None:
  viewport._first_person_motion.trigger_right_swing(success=bool(outcome.success))
  if bool(outcome.success):
    viewport._arm_world_change_sync()
    viewport._invalidate_selection_target()
    viewport._audio.play_interaction(action=outcome.action, block_state=outcome.target_block_state, position=outcome.target_position)


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


def _support_face_from_direction(viewport: "RendererViewportWidget", *, direction: Vec3) -> int:
  horizontal_direction = Vec3(float(direction.x), 0.0, float(direction.z))
  if horizontal_direction.length() <= 1e-6:
    horizontal_direction = forward_from_yaw_pitch_deg(float(viewport._session.player.yaw_deg), 0.0)
  facing = cardinal_from_xz(float(horizontal_direction.x), float(horizontal_direction.z), default="south")
  return int(_face_from_cardinal(str(facing)))


def _support_face_from_top_surface_hit_point(*, support_cell: tuple[int, int, int], hit_point: Vec3) -> int | None:
  local_x = _clamp_scalar(float(hit_point.x) - float(support_cell[0]), 0.0, 1.0)
  local_z = _clamp_scalar(float(hit_point.z) - float(support_cell[2]), 0.0, 1.0)
  x_bias = abs(float(local_x) - 0.5)
  z_bias = abs(float(local_z) - 0.5)
  if abs(float(x_bias) - float(z_bias)) < float(_SUPPORT_FACE_CORNER_AXIS_BIAS_EPS):
    return None
  if float(x_bias) > float(z_bias):
    return int(FACE_POS_X) if float(local_x) >= 0.5 else int(FACE_NEG_X)
  return int(FACE_POS_Z) if float(local_z) >= 0.5 else int(FACE_NEG_Z)


def _support_face_from_world_hit(*, support_cell: tuple[int, int, int], world_hit: BlockPick | None) -> int | None:
  if world_hit is None:
    return None
  if tuple(int(value) for value in world_hit.hit) != tuple(int(value) for value in support_cell):
    return None
  if not bool(_is_vertical_face(int(world_hit.face))):
    return int(world_hit.face)
  return _support_face_from_top_surface_hit_point(support_cell=tuple(int(value) for value in support_cell), hit_point=world_hit.hit_point)


def _support_face_place_hit(viewport: "RendererViewportWidget", *, eye: Vec3, direction: Vec3, world_hit: BlockPick | None = None) -> BlockPick | None:
  contact = viewport._session.support_block_contact()
  if contact is None:
    return None

  support_cell = tuple(int(value) for value in contact.cell)
  face = _support_face_from_world_hit(support_cell=tuple(int(value) for value in support_cell), world_hit=world_hit)
  if face is None:
    face = _support_face_from_direction(viewport, direction=direction)
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


def _should_prefer_support_face_hit(viewport: "RendererViewportWidget", *, world_hit: BlockPick | None, support_hit: BlockPick | None, direction: Vec3) -> bool:
  if support_hit is None:
    return False
  if world_hit is None:
    return True

  player = viewport._session.player
  support_contact = viewport._session.support_block_contact()
  if support_contact is not None and _support_face_surface_matches_hit(world_hit=world_hit, support_hit=support_hit):
    if (not _is_vertical_face(int(world_hit.face))) or bool(viewport._inp.crouch_held()):
      return True
  if support_contact is not None and tuple(int(value) for value in world_hit.hit) == tuple(int(value) for value in support_contact.cell):
    if int(world_hit.face) == int(FACE_POS_Y) and float(direction.y) <= -0.80 and bool(viewport._inp.crouch_held()):
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


def _select_place_hit(viewport: "RendererViewportWidget", *, eye: Vec3, direction: Vec3, world_hit: BlockPick | None) -> tuple[BlockPick | None, bool]:
  support_hit = _support_face_place_hit(viewport, eye=eye, direction=direction, world_hit=world_hit)
  if _should_prefer_support_face_hit(viewport, world_hit=world_hit, support_hit=support_hit, direction=direction):
    return (support_hit, True)
  if world_hit is not None:
    return (world_hit, False)
  if support_hit is not None:
    return (support_hit, True)
  return (None, False)


def _repeat_vertical_motion_sign(viewport: "RendererViewportWidget") -> int:
  player = viewport._session.player
  locked_sign = int(getattr(viewport, "_right_mouse_repeat_vertical_lock_sign", 0))
  if int(locked_sign) > 0:
    return 1
  if int(locked_sign) < 0:
    return -1
  jump_held = bool(getattr(viewport, "_recent_jump_held", False))
  crouch_held = bool(getattr(viewport, "_recent_crouch_held", False))
  if bool(jump_held) and (not bool(crouch_held)):
    return 1
  if bool(crouch_held) and (not bool(jump_held)):
    return -1
  if bool(getattr(viewport, "_recent_jump_pressed", False)):
    return 1
  recent_motion_sign = int(getattr(viewport, "_recent_vertical_motion_sign", 0))
  if int(recent_motion_sign) > 0:
    return 1
  if int(recent_motion_sign) < 0:
    return -1
  if (not bool(player.on_ground)) and float(player.velocity.y) >= 0.05:
    return 1
  if (not bool(player.on_ground)) and float(player.velocity.y) <= -0.05:
    return -1
  return 0


def _repeat_has_horizontal_intent(viewport: "RendererViewportWidget", *, step: tuple[int, int, int]) -> bool:
  move_f = float(getattr(viewport, "_recent_move_f", 0.0))
  move_s = float(getattr(viewport, "_recent_move_s", 0.0))
  if abs(float(move_f)) <= 1e-6 and abs(float(move_s)) <= 1e-6:
    return False
  yaw_forward = forward_from_yaw_pitch_deg(float(viewport._session.player.yaw_deg), 0.0)
  wish_x = float(yaw_forward.x) * float(move_f) + float(yaw_forward.z) * float(move_s)
  wish_z = float(yaw_forward.z) * float(move_f) + float(-yaw_forward.x) * float(move_s)
  axis_projection = float(wish_x) * float(step[0]) + float(wish_z) * float(step[2])
  return abs(float(axis_projection)) > 1e-6


def _project_repeat_step(viewport: "RendererViewportWidget", *, face: int, direction: Vec3, hit_point: Vec3 | None = None) -> tuple[int, int, int] | None:
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
        vertical_intent = (
          (int(vertical_motion_sign) != 0)
          and (int(best_vertical[1][1]) == int(vertical_motion_sign))
          and (float(best_vertical[0]) > float(best_horizontal[0]) * 1.10)
          and ((float(best_vertical[1][1]) < 0 and float(local_y) <= 0.40) or (float(best_vertical[1][1]) > 0 and float(local_y) >= 0.60))
        )
        mag, step, _axis = best_vertical if bool(vertical_intent) else best_horizontal
    else:
      mag, step, _axis = max(candidates, key=lambda item: float(item[0]))
  else:
    mag, step, _axis = max(candidates, key=lambda item: float(item[0]))

  if float(mag) <= 1e-6:
    return None
  return tuple(int(value) for value in step)


def _vertical_repeat_chain_step(viewport: "RendererViewportWidget", *, face: int) -> tuple[int, int, int] | None:
  face_step = face_neighbor_offset(int(face))
  motion_sign = int(_repeat_vertical_motion_sign(viewport))
  if int(motion_sign) == 0:
    return None
  if int(face_step[1]) != 0:
    if int(motion_sign) != int(face_step[1]):
      return None
    return (0, int(motion_sign), 0)

  return (0, int(motion_sign), 0)


def _place_repeat_line_from_hit(viewport: "RendererViewportWidget", hit, *, direction: Vec3) -> _PlaceRepeatLine | None:
  if hit is None or hit.place is None:
    return None

  placed_cell = tuple(int(value) for value in hit.place)

  face_step = face_neighbor_offset(int(hit.face))
  face_chain_mode = (not _is_vertical_face(int(hit.face))) and int(face_step[1]) == 0
  if bool(face_chain_mode):
    return _PlaceRepeatLine(
      start_cell=placed_cell,
      step=(int(face_step[0]), int(face_step[1]), int(face_step[2])),
      face=int(hit.face),
      plane_normal=(int(face_step[0]), int(face_step[1]), int(face_step[2])),
      plane_point=(float(hit.hit_point.x), float(hit.hit_point.y), float(hit.hit_point.z)),
      min_progress=0,
      max_progress=0,
      support_face_mode=False,
      visible_face_chain_mode=True,
    )

  step = _project_repeat_step(viewport, face=int(hit.face), direction=direction, hit_point=hit.hit_point)
  if step is None and _is_vertical_face(int(hit.face)):
    fallback_direction = forward_from_yaw_pitch_deg(float(viewport._session.player.yaw_deg), 0.0)
    fallback_face = _face_from_cardinal(cardinal_from_xz(float(fallback_direction.x), float(fallback_direction.z), default="south"))
    fallback_step = face_neighbor_offset(int(fallback_face))
    if int(fallback_step[1]) == 0:
      step = tuple(int(value) for value in fallback_step)
  plane_normal = face_neighbor_offset(int(hit.face))
  if step is None or plane_normal == (0, 0, 0):
    return None

  return _PlaceRepeatLine(
    start_cell=placed_cell,
    step=tuple(int(value) for value in step),
    face=int(hit.face),
    plane_normal=(int(plane_normal[0]), int(plane_normal[1]), int(plane_normal[2])),
    plane_point=(float(hit.hit_point.x), float(hit.hit_point.y), float(hit.hit_point.z)),
    min_progress=0,
    max_progress=0,
    support_face_mode=False,
    visible_face_chain_mode=False,
  )


def _place_repeat_line_for_result(viewport: "RendererViewportWidget", hit, outcome: InteractionOutcome, *, direction: Vec3) -> _PlaceRepeatLine | None:
  if not bool(outcome.success) or str(outcome.action) != INTERACTION_ACTION_PLACE or hit is None or hit.place is None or outcome.target_position is None:
    return None

  placed_cell = tuple(int(value) for value in hit.place)
  target_position = tuple(int(value) for value in outcome.target_position)
  if placed_cell != target_position:
    return None
  if not bool(_outcome_establishes_repeat_frontier(viewport, outcome=outcome, target_cell=placed_cell)):
    return None
  return _place_repeat_line_from_hit(viewport, hit, direction=direction)


def _support_face_repeat_line_from_hit(hit) -> _PlaceRepeatLine | None:
  if hit is None or hit.place is None:
    return None

  placed_cell = tuple(int(value) for value in hit.place)
  step = face_neighbor_offset(int(hit.face))
  if step == (0, 0, 0) or int(step[1]) != 0:
    return None

  plane_normal = (0, 0, 1) if int(step[0]) != 0 else (1, 0, 0)
  return _PlaceRepeatLine(
    start_cell=placed_cell,
    step=(int(step[0]), int(step[1]), int(step[2])),
    face=int(hit.face),
    plane_normal=(int(plane_normal[0]), int(plane_normal[1]), int(plane_normal[2])),
    plane_point=(float(placed_cell[0]) + 0.5, float(placed_cell[1]) + 0.5, float(placed_cell[2]) + 0.5),
    min_progress=0,
    max_progress=0,
    support_face_mode=True,
    visible_face_chain_mode=False,
  )


def _support_face_repeat_line_for_result(viewport: "RendererViewportWidget", hit, outcome: InteractionOutcome) -> _PlaceRepeatLine | None:
  if not bool(outcome.success) or str(outcome.action) != INTERACTION_ACTION_PLACE or hit is None or hit.place is None or outcome.target_position is None:
    return None

  placed_cell = tuple(int(value) for value in hit.place)
  target_position = tuple(int(value) for value in outcome.target_position)
  if placed_cell != target_position:
    return None
  if not bool(_outcome_establishes_repeat_frontier(viewport, outcome=outcome, target_cell=placed_cell)):
    return None
  return _support_face_repeat_line_from_hit(hit)


def _deferred_place_repeat_line(line: _PlaceRepeatLine | None, *, hit: BlockPick) -> _PlaceRepeatLine | None:
  if line is None:
    return None
  return replace(
    line,
    start_cell_materialized=False,
    pending_support_cell=tuple(int(value) for value in hit.hit),
    pending_support_face=int(hit.face),
    pending_support_hit_point=(float(hit.hit_point.x), float(hit.hit_point.y), float(hit.hit_point.z)),
  )


def _should_arm_deferred_place_repeat(viewport: "RendererViewportWidget", *, hit: BlockPick | None) -> bool:
  if hit is None or hit.place is None:
    return False

  place_cell = tuple(int(value) for value in hit.place)
  if viewport._session.world.blocks.get(place_cell) is not None:
    return False

  block_id = settings_controller.current_block_id(viewport)
  place_state = viewport._session.interaction.placement_policy.resolve_place_state(
    player=viewport._session.player, block_id="" if block_id is None else str(block_id), hit_face=int(hit.face), hit_point=hit.hit_point
  )
  if place_state is None:
    return False

  return bool(
    viewport._session.interaction.placement_policy.placement_intersects_player(
      player=viewport._session.player, world=viewport._session.world, px=int(place_cell[0]), py=int(place_cell[1]), pz=int(place_cell[2]), place_state=str(place_state)
    )
  )


def _state_is_gravity_affected(viewport: "RendererViewportWidget", *, state_str: str | None) -> bool:
  defn = def_from_state(state_str, viewport._session.block_registry)
  if defn is None:
    return False
  return bool(defn.is_family("block") and defn.has_tag(_GRAVITY_AFFECTED_TAG))


def _support_establishes_gravity_frontier(viewport: "RendererViewportWidget", *, cell: tuple[int, int, int], state_str: str) -> bool:
  def get_state(x: int, y: int, z: int) -> str | None:
    return viewport._session.world.blocks.get((int(x), int(y), int(z)))

  if bool(has_full_top_support_for_block(str(state_str), get_state, viewport._session.block_registry.get, int(cell[0]), int(cell[1]), int(cell[2]))):
    return True

  defn = def_from_state(state_str, viewport._session.block_registry)
  if defn is None:
    return False

  _base, props = parse_state(str(state_str))
  if is_slab(defn):
    return slab_type_value(props) != "bottom"
  if is_stairs(defn) or is_fence(defn) or is_fence_gate(defn) or is_wall(defn):
    return True
  return False


def _cell_establishes_repeat_frontier(viewport: "RendererViewportWidget", *, cell: tuple[int, int, int], state_str: str | None) -> bool:
  if state_str is None:
    return False
  if not bool(_state_is_gravity_affected(viewport, state_str=str(state_str))):
    return True

  below_cell = (int(cell[0]), int(cell[1]) - 1, int(cell[2]))
  below_state = viewport._session.world.blocks.get(below_cell)
  if below_state is None:
    return False

  if not bool(_support_establishes_gravity_frontier(viewport, cell=below_cell, state_str=str(below_state))):
    return False

  if bool(_state_is_gravity_affected(viewport, state_str=str(below_state))):
    return bool(_cell_establishes_repeat_frontier(viewport, cell=below_cell, state_str=str(below_state)))
  return True


def _outcome_establishes_repeat_frontier(viewport: "RendererViewportWidget", *, outcome: InteractionOutcome, target_cell: tuple[int, int, int]) -> bool:
  if not bool(outcome.success) or str(outcome.action) != INTERACTION_ACTION_PLACE or outcome.target_position is None:
    return False
  if tuple(int(value) for value in outcome.target_position) != tuple(int(value) for value in target_cell):
    return False

  state_str = viewport._session.world.blocks.get(tuple(int(value) for value in target_cell))
  return bool(_cell_establishes_repeat_frontier(viewport, cell=tuple(int(value) for value in target_cell), state_str=state_str))


def _place_line_after_attempt(
  viewport: "RendererViewportWidget", *, line: _PlaceRepeatLine, target_progress: int, target_cell: tuple[int, int, int], outcome: InteractionOutcome
) -> _PlaceRepeatLine | None:
  if not bool(_outcome_establishes_repeat_frontier(viewport, outcome=outcome, target_cell=tuple(int(value) for value in target_cell))):
    if bool(outcome.success) and str(outcome.action) == INTERACTION_ACTION_PLACE:
      return None
    return line

  return replace(
    line,
    min_progress=int(min(int(line.min_progress), int(target_progress))),
    max_progress=int(max(int(line.max_progress), int(target_progress))),
    start_cell_materialized=True,
    pending_support_cell=None,
    pending_support_face=None,
    pending_support_hit_point=None,
  )


def _retry_pending_place_repeat_start(viewport: "RendererViewportWidget", *, line: _PlaceRepeatLine) -> _RightClickResult:
  support_cell = line.pending_support_cell
  support_face = line.pending_support_face
  support_hit_point = line.pending_support_hit_point
  if support_cell is None or support_face is None or support_hit_point is None:
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  synthetic_hit = BlockPick(
    hit=tuple(int(value) for value in support_cell),
    place=tuple(int(value) for value in line.start_cell),
    t=0.0,
    face=int(support_face),
    hit_point=Vec3(float(support_hit_point[0]), float(support_hit_point[1]), float(support_hit_point[2])),
  )
  outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
  place_line = _place_line_after_attempt(viewport, line=line, target_progress=0, target_cell=tuple(int(value) for value in line.start_cell), outcome=outcome)
  if place_line is not None and bool(outcome.success):
    vertical_line = _initial_vertical_transition_repeat_line(viewport, line=place_line, hit=synthetic_hit)
    if vertical_line is not None:
      place_line = vertical_line
  _finalize_right_click(viewport, outcome)
  return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)


def _apply_initial_right_mouse_repeat(viewport: "RendererViewportWidget", *, now_s: float, result: _RightClickResult) -> None:
  if str(result.repeat_action) == INTERACTION_ACTION_INTERACT and result.interact_cell is not None:
    if not bool(result.outcome.success):
      viewport._disable_right_mouse_repeat()
      return
    viewport._enable_right_mouse_interact_repeat(now_s=float(now_s), target_cell=result.interact_cell)
    return

  if str(result.repeat_action) == INTERACTION_ACTION_PLACE and result.place_line is not None:
    viewport._enable_right_mouse_place_repeat(
      now_s=float(now_s),
      start_cell=result.place_line.start_cell,
      step=result.place_line.step,
      face=int(result.place_line.face),
      plane_normal=result.place_line.plane_normal,
      plane_point=result.place_line.plane_point,
      min_progress=int(result.place_line.min_progress),
      max_progress=int(result.place_line.max_progress),
      support_face_mode=bool(result.place_line.support_face_mode),
      visible_face_chain_mode=bool(result.place_line.visible_face_chain_mode),
      start_cell_materialized=bool(result.place_line.start_cell_materialized),
      pending_support_cell=result.place_line.pending_support_cell,
      pending_support_face=result.place_line.pending_support_face,
      pending_support_hit_point=result.place_line.pending_support_hit_point,
    )
    return

  if not bool(result.outcome.success):
    viewport._disable_right_mouse_repeat()
    return

  viewport._disable_right_mouse_repeat()


def _perform_right_click(viewport: "RendererViewportWidget") -> _RightClickResult:
  interaction_eye, interaction_direction, hit = _current_interaction_hit(viewport)
  special_outcome = ai_controller.handle_special_right_click(viewport, origin=interaction_eye, direction=interaction_direction, hit=hit)
  if special_outcome is not None:
    _finalize_right_click(viewport, special_outcome)
    return _RightClickResult(outcome=special_outcome)
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
      place_line = _support_face_repeat_line_for_result(viewport, place_hit, outcome)
    else:
      place_line = _place_repeat_line_for_result(viewport, place_hit, outcome, direction=interaction_direction)
    if place_line is None and (not bool(outcome.success)) and bool(_should_arm_deferred_place_repeat(viewport, hit=place_hit)):
      if bool(support_face_place):
        place_line = _deferred_place_repeat_line(_support_face_repeat_line_from_hit(place_hit), hit=place_hit)
      else:
        place_line = _deferred_place_repeat_line(_place_repeat_line_from_hit(viewport, place_hit, direction=interaction_direction), hit=place_hit)
    if place_line is not None:
      repeat_action = INTERACTION_ACTION_PLACE

  _finalize_right_click(viewport, outcome)
  return _RightClickResult(outcome=outcome, repeat_action=repeat_action, interact_cell=interact_cell, place_line=place_line)


def _perform_right_click_interact_repeat(viewport: "RendererViewportWidget") -> InteractionOutcome:
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


def _support_face_repeat_candidate_hit(
  *, hit: BlockPick | None, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, min_progress: int, max_progress: int
) -> tuple[BlockPick, int, int] | None:
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


def _initial_vertical_transition_repeat_line(viewport: "RendererViewportWidget", *, line: _PlaceRepeatLine, hit: BlockPick | None) -> _PlaceRepeatLine | None:
  start_cell = tuple(int(value) for value in line.start_cell)
  step = tuple(int(value) for value in line.step)
  face = int(line.face)
  plane_normal = tuple(int(value) for value in line.plane_normal)
  plane_point = tuple(float(value) for value in line.plane_point)
  min_progress = int(line.min_progress)
  max_progress = int(line.max_progress)
  if int(min_progress) != 0 or int(max_progress) != 0:
    return None
  if int(step[1]) != 0:
    return None
  if bool(_repeat_has_horizontal_intent(viewport, step=tuple(int(value) for value in step))):
    return None
  vertical_step = _vertical_repeat_chain_step(viewport, face=int(face))
  if vertical_step is None:
    return None
  face_step = face_neighbor_offset(int(face))
  if int(face_step[1]) != 0:
    anchor_support_cell = (int(start_cell[0] - face_step[0]), int(start_cell[1] - face_step[1]), int(start_cell[2] - face_step[2]))
  else:
    anchor_support_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=-1)
  anchor_cells = {tuple(int(value) for value in start_cell), tuple(int(value) for value in anchor_support_cell)}
  anchor_preserved = False
  player = viewport._session.player
  anchor_radius = float(_INITIAL_VERTICAL_ANCHOR_RADIUS)
  if int(step[0]) != 0:
    anchor_z = float(start_cell[2]) + 0.5
    min_x = min(float(start_cell[0]) + 0.5, float(anchor_support_cell[0]) + 0.5) - float(anchor_radius)
    max_x = max(float(start_cell[0]) + 0.5, float(anchor_support_cell[0]) + 0.5) + float(anchor_radius)
    if abs(float(player.position.z) - float(anchor_z)) <= float(anchor_radius) and float(min_x) <= float(player.position.x) <= float(max_x):
      anchor_preserved = True
  elif int(step[2]) != 0:
    anchor_x = float(start_cell[0]) + 0.5
    min_z = min(float(start_cell[2]) + 0.5, float(anchor_support_cell[2]) + 0.5) - float(anchor_radius)
    max_z = max(float(start_cell[2]) + 0.5, float(anchor_support_cell[2]) + 0.5) + float(anchor_radius)
    if abs(float(player.position.x) - float(anchor_x)) <= float(anchor_radius) and float(min_z) <= float(player.position.z) <= float(max_z):
      anchor_preserved = True
  support_contact = viewport._session.support_block_contact()
  if support_contact is not None and tuple(int(value) for value in support_contact.cell) in anchor_cells:
    anchor_preserved = True
  if (not bool(anchor_preserved)) and hit is not None:
    if tuple(int(value) for value in hit.hit) in anchor_cells:
      anchor_preserved = True
    elif hit.place is not None and tuple(int(value) for value in hit.place) in anchor_cells:
      anchor_preserved = True
  if not bool(anchor_preserved):
    return None
  return replace(
    line,
    step=tuple(int(value) for value in vertical_step),
    face=int(face),
    plane_normal=tuple(int(value) for value in plane_normal),
    plane_point=tuple(float(value) for value in plane_point),
    min_progress=int(min_progress),
    max_progress=int(max_progress),
    support_face_mode=False,
    visible_face_chain_mode=False,
  )


def _visible_face_chain_candidate_hit(
  *, hit: BlockPick | None, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, min_progress: int, max_progress: int
) -> tuple[BlockPick, int, int] | None:
  if hit is None or hit.place is None:
    return None
  if int(hit.face) != int(face):
    return None
  return _support_face_repeat_candidate_hit(
    hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress)
  )


def _direct_visible_support_face_candidate(
  viewport: "RendererViewportWidget", *, hit: BlockPick | None, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, min_progress: int, max_progress: int
) -> tuple[BlockPick, int, int] | None:
  if hit is None or hit.place is None or _is_vertical_face(int(hit.face)):
    return None
  if int(hit.face) != int(face):
    return None

  contact = viewport._session.support_block_contact()
  if contact is not None and tuple(int(value) for value in hit.hit) == tuple(int(value) for value in contact.cell):
    return None

  return _support_face_repeat_candidate_hit(
    hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress)
  )


def _projected_frontier_support_face_candidate(
  viewport: "RendererViewportWidget", *, start_cell: tuple[int, int, int], step: tuple[int, int, int], face: int, max_progress: int, eye: Vec3, direction: Vec3, hit: BlockPick | None
) -> tuple[BlockPick, int, int] | None:
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

  return (
    BlockPick(hit=tuple(int(value) for value in frontier_cell), place=tuple(int(value) for value in target_cell), t=0.0, face=int(face), hit_point=hit_point),
    int(frontier_progress),
    int(target_progress),
  )


def _perform_generic_place_repeat(viewport: "RendererViewportWidget", *, line: _PlaceRepeatLine, interaction_eye: Vec3, interaction_direction: Vec3, hit: BlockPick | None) -> _RightClickResult:
  start_cell = tuple(int(value) for value in line.start_cell)
  step = tuple(int(value) for value in line.step)
  face = int(line.face)
  plane_normal = tuple(int(value) for value in line.plane_normal)
  plane_point = tuple(float(value) for value in line.plane_point)
  min_progress = int(line.min_progress)
  max_progress = int(line.max_progress)
  if int(step[1]) != 0:
    hold_origin_y = float(getattr(viewport, "_right_mouse_repeat_origin_player_y", float(viewport._session.player.position.y)))
    feet_offset = (float(viewport._session.player.position.y) - float(hold_origin_y)) * float(step[1])
    target_progress: int | None = None
    if float(feet_offset) > (float(max_progress) + 0.5 + 1e-4):
      target_progress = int(max_progress) + 1

    if target_progress is None:
      outcome = InteractionOutcome(success=False)
      _finalize_right_click(viewport, outcome)
      return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

    target_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(target_progress))
    support_progress = int(target_progress) - 1 if int(target_progress) > 0 else int(target_progress) + 1
    support_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(support_progress))
    support_face = int(FACE_POS_Y) if int(target_cell[1]) > int(support_cell[1]) else int(FACE_NEG_Y)
    support_hit_point_y = float(support_cell[1] + 1) if int(support_face) == int(FACE_POS_Y) else float(support_cell[1])
    synthetic_hit = BlockPick(
      hit=tuple(int(value) for value in support_cell),
      place=tuple(int(value) for value in target_cell),
      t=0.0,
      face=int(support_face),
      hit_point=Vec3(float(support_cell[0]) + 0.5, float(support_hit_point_y), float(support_cell[2]) + 0.5),
    )
    outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
    place_line = _place_line_after_attempt(viewport, line=line, target_progress=int(target_progress), target_cell=tuple(int(value) for value in target_cell), outcome=outcome)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)

  if not bool(_repeat_has_horizontal_intent(viewport, step=tuple(int(value) for value in step))):
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  plane_hit = _ray_hits_repeat_plane(
    eye=interaction_eye,
    direction=interaction_direction,
    plane_normal=tuple(int(value) for value in plane_normal),
    plane_point=tuple(float(value) for value in plane_point),
    reach=float(viewport._state.reach),
  )
  if plane_hit is None:
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  hit_point, plane_t = plane_hit
  projected_progress_f = _repeat_line_progress_coordinate(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), hit_point=hit_point)
  if projected_progress_f is None:
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)
  if hit is not None and float(hit.t) + 1e-4 < float(plane_t):
    hit_progress = _repeat_line_progress(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), cell=tuple(int(value) for value in hit.hit))
    if hit_progress is None:
      outcome = InteractionOutcome(success=False)
      _finalize_right_click(viewport, outcome)
      return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  target_progress: int | None = None
  if float(projected_progress_f) > (float(max_progress) + 0.5 + 1e-4):
    target_progress = int(max_progress) + 1
  elif float(projected_progress_f) < (float(min_progress) - 0.5 - 1e-4):
    target_progress = int(min_progress) - 1

  if target_progress is None:
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  target_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(target_progress))
  support_progress = int(target_progress) - 1 if int(target_progress) > 0 else int(target_progress) + 1
  support_cell = _repeat_line_cell(start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), progress=int(support_progress))

  synthetic_hit = BlockPick(
    hit=tuple(int(value) for value in support_cell), place=tuple(int(value) for value in target_cell), t=0.0, face=int(face), hit_point=Vec3(float(hit_point.x), float(hit_point.y), float(hit_point.z))
  )
  outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
  place_line = _place_line_after_attempt(viewport, line=line, target_progress=int(target_progress), target_cell=tuple(int(value) for value in target_cell), outcome=outcome)
  _finalize_right_click(viewport, outcome)
  return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)


def _perform_visible_face_place_repeat(viewport: "RendererViewportWidget", *, line: _PlaceRepeatLine, interaction_eye: Vec3, interaction_direction: Vec3, hit: BlockPick | None) -> _RightClickResult:
  start_cell = tuple(int(value) for value in line.start_cell)
  step = tuple(int(value) for value in line.step)
  face = int(line.face)
  min_progress = int(line.min_progress)
  max_progress = int(line.max_progress)
  vertical_line = _initial_vertical_transition_repeat_line(viewport, line=line, hit=hit)
  if vertical_line is not None:
    return _perform_generic_place_repeat(viewport, line=vertical_line, interaction_eye=interaction_eye, interaction_direction=interaction_direction, hit=hit)
  if not bool(_repeat_has_horizontal_intent(viewport, step=tuple(int(value) for value in step))):
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  candidate = _visible_face_chain_candidate_hit(
    hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress)
  )
  if candidate is None:
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  candidate_hit, _frontier_progress, target_progress = candidate
  synthetic_hit = BlockPick(
    hit=tuple(int(value) for value in candidate_hit.hit),
    place=tuple(int(value) for value in candidate_hit.place),
    t=0.0,
    face=int(candidate_hit.face),
    hit_point=Vec3(float(candidate_hit.hit_point.x), float(candidate_hit.hit_point.y), float(candidate_hit.hit_point.z)),
  )
  outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
  place_line = _place_line_after_attempt(viewport, line=line, target_progress=int(target_progress), target_cell=tuple(int(value) for value in candidate_hit.place), outcome=outcome)
  _finalize_right_click(viewport, outcome)
  return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)


def _perform_support_face_place_repeat(viewport: "RendererViewportWidget", *, line: _PlaceRepeatLine, interaction_eye: Vec3, interaction_direction: Vec3, hit: BlockPick | None) -> _RightClickResult:
  start_cell = tuple(int(value) for value in line.start_cell)
  step = tuple(int(value) for value in line.step)
  face = int(line.face)
  min_progress = int(line.min_progress)
  max_progress = int(line.max_progress)
  vertical_line = _initial_vertical_transition_repeat_line(viewport, line=line, hit=hit)
  if vertical_line is not None:
    return _perform_generic_place_repeat(viewport, line=vertical_line, interaction_eye=interaction_eye, interaction_direction=interaction_direction, hit=hit)
  if not bool(_repeat_has_horizontal_intent(viewport, step=tuple(int(value) for value in step))):
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  candidate = _direct_visible_support_face_candidate(
    viewport, hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress)
  )
  support_face_hit = _support_face_place_hit(viewport, eye=interaction_eye, direction=interaction_direction, world_hit=hit)
  if candidate is None:
    candidate = _projected_frontier_support_face_candidate(
      viewport,
      start_cell=tuple(int(value) for value in start_cell),
      step=tuple(int(value) for value in step),
      face=int(face),
      max_progress=int(max_progress),
      eye=interaction_eye,
      direction=interaction_direction,
      hit=hit,
    )
  if candidate is None:
    candidate = _support_face_repeat_candidate_hit(
      hit=support_face_hit,
      start_cell=tuple(int(value) for value in start_cell),
      step=tuple(int(value) for value in step),
      face=int(face),
      min_progress=int(min_progress),
      max_progress=int(max_progress),
    )
  if candidate is None:
    candidate = _support_face_repeat_candidate_hit(
      hit=hit, start_cell=tuple(int(value) for value in start_cell), step=tuple(int(value) for value in step), face=int(face), min_progress=int(min_progress), max_progress=int(max_progress)
    )
  if candidate is None:
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=line)

  candidate_hit, _frontier_progress, target_progress = candidate
  synthetic_hit = BlockPick(
    hit=tuple(int(value) for value in candidate_hit.hit),
    place=tuple(int(value) for value in candidate_hit.place),
    t=0.0,
    face=int(candidate_hit.face),
    hit_point=Vec3(float(candidate_hit.hit_point.x), float(candidate_hit.hit_point.y), float(candidate_hit.hit_point.z)),
  )
  outcome = viewport._session.place_block_from_hit(synthetic_hit, settings_controller.current_block_id(viewport))
  place_line = _place_line_after_attempt(viewport, line=line, target_progress=int(target_progress), target_cell=tuple(int(value) for value in candidate_hit.place), outcome=outcome)
  _finalize_right_click(viewport, outcome)
  return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE, place_line=place_line)


def _perform_right_click_place_repeat(viewport: "RendererViewportWidget") -> _RightClickResult:
  start_cell = viewport._right_mouse_repeat_line_start
  step = viewport._right_mouse_repeat_line_step
  face = viewport._right_mouse_repeat_line_face
  plane_normal = viewport._right_mouse_repeat_line_plane_normal
  plane_point = viewport._right_mouse_repeat_line_plane_point
  if start_cell is None or step is None or face is None or plane_normal is None or plane_point is None:
    outcome = InteractionOutcome(success=False)
    _finalize_right_click(viewport, outcome)
    return _RightClickResult(outcome=outcome, repeat_action=INTERACTION_ACTION_PLACE)

  line = _PlaceRepeatLine(
    start_cell=tuple(int(value) for value in start_cell),
    step=tuple(int(value) for value in step),
    face=int(face),
    plane_normal=tuple(int(value) for value in plane_normal),
    plane_point=tuple(float(value) for value in plane_point),
    min_progress=int(viewport._right_mouse_repeat_line_min_progress),
    max_progress=int(viewport._right_mouse_repeat_line_max_progress),
    support_face_mode=bool(viewport._right_mouse_repeat_support_face_mode),
    visible_face_chain_mode=bool(viewport._right_mouse_repeat_visible_face_chain_mode),
    start_cell_materialized=bool(viewport._right_mouse_repeat_line_start_cell_materialized),
    pending_support_cell=None if viewport._right_mouse_repeat_line_pending_support_cell is None else tuple(int(value) for value in viewport._right_mouse_repeat_line_pending_support_cell),
    pending_support_face=None if viewport._right_mouse_repeat_line_pending_support_face is None else int(viewport._right_mouse_repeat_line_pending_support_face),
    pending_support_hit_point=None
    if viewport._right_mouse_repeat_line_pending_support_hit_point is None
    else tuple(float(value) for value in viewport._right_mouse_repeat_line_pending_support_hit_point),
  )

  if not bool(line.start_cell_materialized):
    return _retry_pending_place_repeat_start(viewport, line=line)

  interaction_eye, interaction_direction, hit = _current_interaction_hit(viewport)
  if bool(line.visible_face_chain_mode):
    return _perform_visible_face_place_repeat(viewport, line=line, interaction_eye=interaction_eye, interaction_direction=interaction_direction, hit=hit)
  if bool(line.support_face_mode):
    return _perform_support_face_place_repeat(viewport, line=line, interaction_eye=interaction_eye, interaction_direction=interaction_direction, hit=hit)
  vertical_line = _initial_vertical_transition_repeat_line(viewport, line=line, hit=hit)
  if vertical_line is not None:
    return _perform_generic_place_repeat(viewport, line=vertical_line, interaction_eye=interaction_eye, interaction_direction=interaction_direction, hit=hit)
  return _perform_generic_place_repeat(viewport, line=line, interaction_eye=interaction_eye, interaction_direction=interaction_direction, hit=hit)
