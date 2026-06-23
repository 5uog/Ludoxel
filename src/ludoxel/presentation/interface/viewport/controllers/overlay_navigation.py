# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from PyQt6.QtCore import QTimer

import ludoxel.presentation.interface.othello.viewport as othello_controller
import ludoxel.presentation.interface.viewport.controllers.ai as ai_controller
import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_MY_WORLD, PLAY_SPACE_OTHELLO, normalize_play_space_id

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget


def bind_overlay_actions(viewport: "RendererViewportWidget") -> None:
  viewport._overlay.resume_requested.connect(lambda: resume_from_overlay(viewport))
  viewport._overlay.settings_requested.connect(lambda: open_settings_from_pause(viewport))
  viewport._overlay.play_my_world_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_MY_WORLD, resume=True))
  viewport._overlay.play_othello_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_OTHELLO, resume=True))
  viewport._overlay.save_quit_requested.connect(lambda: save_and_quit(viewport))
  viewport._overlay.change_skin_requested.connect(lambda: settings_controller.change_player_skin(viewport))
  viewport._overlay.reset_skin_requested.connect(lambda: settings_controller.reset_player_skin(viewport))
  viewport._death.respawn_requested.connect(lambda: respawn(viewport))
  viewport._inventory.storage_changed.connect(lambda payload: settings_controller.apply_inventory_storage(viewport, hotbar=payload["hotbar"], upper=payload["upper"]))
  viewport._inventory.closed.connect(lambda: on_inventory_closed(viewport))


def respawn(viewport: "RendererViewportWidget") -> None:
  viewport._reset_held_mouse_actions()
  ai_controller.cancel_route_edit(viewport)
  viewport._session.respawn()
  viewport._invalidate_selection_target()
  viewport._renderer.clear_selection()
  viewport._set_dead_overlay(False)
  settings_controller.sync_hotbar_widgets(viewport)


def resume_from_overlay(viewport: "RendererViewportWidget") -> None:
  viewport._set_paused_overlay(False)
  viewport.arm_resume_refresh()
  settings_controller.sync_cloud_motion_pause(viewport)


def open_pause_menu(viewport: "RendererViewportWidget") -> None:
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


def switch_play_space(viewport: "RendererViewportWidget", space_id: str, *, resume: bool = False) -> None:
  normalized = normalize_play_space_id(space_id)
  if normalized == normalize_play_space_id(viewport._state.current_space_id):
    if resume:
      resume_from_overlay(viewport)
    return

  target_label = "Loading My World..." if normalized == PLAY_SPACE_MY_WORLD else "Loading Play Othello..."
  viewport._reset_held_mouse_actions()
  ai_controller.cancel_route_edit(viewport)
  viewport._clear_block_break_particles()
  othello_controller.clear_state_for_space_switch(viewport)
  viewport._state.current_space_id = normalized
  viewport._state.normalize()
  viewport._session = viewport._sessions.set_active_space(normalized)
  _learning_runtime = getattr(viewport, "_learning_runtime", None)
  if _learning_runtime is not None:
    _learning_runtime.flush(viewport._session)
    _learning_runtime.configure_session(viewport._session)
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


def open_settings_from_pause(viewport: "RendererViewportWidget") -> None:
  settings_controller.sync_settings_values(viewport)
  viewport._set_settings_overlay(True)
  settings_controller.sync_cloud_motion_pause(viewport)


def open_settings_preview(viewport: "RendererViewportWidget") -> None:
  from ludoxel.presentation.interface.settings.overlay import SettingsOverlay

  if getattr(viewport, "_settings_preview", None) is not None:
    return

  host = viewport.window() if viewport.window() is not None else viewport
  preview = SettingsOverlay(host, resource_root=viewport._resource_root, as_window=True, include_preview_button=False)
  preview.setWindowTitle("Settings Preview")
  viewport._settings_preview = preview
  settings_controller.bind_settings_overlay_value_signals(viewport, preview)
  preview.back_requested.connect(lambda: close_settings_preview(viewport))

  viewport._settings.setVisible(False)
  settings_controller.sync_settings_values(viewport)
  settings_controller.sync_crosshair_widgets(viewport)
  viewport._position_detached_overlay_window(preview)
  preview.show()
  preview.raise_()
  preview.activateWindow()
  preview.setFocus()
  settings_controller.sync_cloud_motion_pause(viewport)


def close_settings_preview(viewport: "RendererViewportWidget") -> None:
  preview = getattr(viewport, "_settings_preview", None)
  if preview is None:
    return
  viewport._settings_preview = None
  try:
    preview.blockSignals(True)
  except Exception:
    pass
  preview.hide()
  preview.deleteLater()
  if viewport._overlays.settings_open():
    viewport._settings.setVisible(True)
    viewport._position_settings_window()
    viewport._settings.raise_()
    viewport._settings.setFocus()
  settings_controller.sync_settings_values(viewport)
  settings_controller.sync_crosshair_widgets(viewport)
  settings_controller.sync_cloud_motion_pause(viewport)


def back_from_settings(viewport: "RendererViewportWidget") -> None:
  close_settings_preview(viewport)
  viewport._set_settings_overlay(False)
  settings_controller.sync_cloud_motion_pause(viewport)


def open_othello_settings_from_item(viewport: "RendererViewportWidget") -> None:
  othello_controller.sync_settings_values(viewport)
  viewport._set_othello_settings_overlay(True)
  settings_controller.sync_cloud_motion_pause(viewport)


def back_from_othello_settings(viewport: "RendererViewportWidget") -> None:
  viewport._set_othello_settings_overlay(False)
  if viewport._state.is_othello_space():
    viewport._othello_analysis_request_signature = None
    QTimer.singleShot(120, lambda: othello_controller.maybe_request_analysis(viewport))
  settings_controller.sync_cloud_motion_pause(viewport)


def on_inventory_closed(viewport: "RendererViewportWidget") -> None:
  viewport._set_inventory_overlay(False)
  viewport.arm_resume_refresh()


def save_and_quit(viewport: "RendererViewportWidget") -> None:
  viewport._reset_held_mouse_actions()
  try:
    viewport.save_state()
  except Exception:
    pass
  host = viewport.window()
  if host is not None:
    host.close()
