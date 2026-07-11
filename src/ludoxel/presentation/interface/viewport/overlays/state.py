# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import replace
from typing import TYPE_CHECKING

from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QWidget

import ludoxel.presentation.interface.chat.controller as chat_controller
import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget


class ViewportOverlayMixin:
  def set_hud(self: "RendererViewportWidget", hud) -> None:
    self._hud = hud
    self._hud.setParent(self)
    self._hud.setGeometry(0, 0, max(1, self.width()), max(1, self.height()))
    self._sync_gameplay_hud_visibility()

  def fullscreen_enabled(self: "RendererViewportWidget") -> bool:
    return bool(self._state.fullscreen)

  def menu_active(self: "RendererViewportWidget") -> bool:
    return bool(self._overlays.menu_open())

  def _invalidate_pause_preview_cache(self: "RendererViewportWidget") -> None:
    self._pause_preview_cache_key = None
    self._pause_preview_frame = QImage()

  def _invalidate_inventory_preview_cache(self: "RendererViewportWidget") -> None:
    self._inventory_preview_cache_key = None
    self._inventory_preview_frame = QImage()

  def _clear_pause_preview_frame(self: "RendererViewportWidget") -> None:
    if self._pause_preview_cache_key is None and self._pause_preview_frame.isNull():
      return
    self._invalidate_pause_preview_cache()
    self._overlay.set_player_preview_frame(QImage())
    self._overlay.set_player_preview_name_tag("", visible=False)

  def _position_detached_overlay_window(self: "RendererViewportWidget", overlay: QWidget | None) -> None:
    if overlay is None:
      return
    if hasattr(overlay, "prepare_to_show"):
      overlay.prepare_to_show()
    host = self.window()
    overlay.adjustSize()
    size = overlay.size()
    if host is None:
      return
    frame = host.frameGeometry()
    x = int(frame.x() + max(0, (frame.width() - size.width()) // 2))
    y = int(frame.y() + max(0, (frame.height() - size.height()) // 2))
    overlay.move(int(x), int(y))

  def _position_settings_window(self: "RendererViewportWidget") -> None:
    self._settings.setGeometry(0, 0, max(1, int(self.width())), max(1, int(self.height())))

  def _position_othello_settings_window(self: "RendererViewportWidget") -> None:
    self._othello_settings.setGeometry(0, 0, max(1, int(self.width())), max(1, int(self.height())))

  @staticmethod
  def _pause_preview_key(*, player_state, width: int, height: int, device_pixel_ratio: float) -> tuple[object, ...] | None:
    if player_state is None:
      return None
    return (
      int(width),
      int(height),
      round(float(device_pixel_ratio), 4),
      round(float(player_state.base_x), 4),
      round(float(player_state.base_y), 4),
      round(float(player_state.base_z), 4),
      round(float(player_state.body_yaw_deg), 4),
      round(float(player_state.head_yaw_deg), 4),
      round(float(player_state.head_pitch_deg), 4),
      round(float(player_state.limb_phase_rad), 4),
      round(float(player_state.limb_swing_amount), 4),
      round(float(player_state.crouch_amount), 4),
      round(float(player_state.hurt_tint_strength), 4),
      bool(player_state.is_first_person),
      None if player_state.skin_texture_key is None else str(player_state.skin_texture_key),
      None if player_state.first_person is None else player_state.first_person.visible_block_id,
      None if player_state.first_person is None else player_state.first_person.visible_block_kind,
      None if player_state.first_person is None else player_state.first_person.visible_special_item_icon,
    )

  def _build_pause_preview_player_state(self: "RendererViewportWidget", player_state) -> object:
    body_yaw_deg, head_yaw_deg, head_pitch_deg = self._overlay.player_preview_angles()
    if player_state is None:
      return None
    return replace(player_state, base_x=0.0, base_y=-0.22, base_z=0.0, body_yaw_deg=float(body_yaw_deg), head_yaw_deg=float(head_yaw_deg), head_pitch_deg=float(head_pitch_deg), is_first_person=False)

  def _update_pause_preview_frame(self: "RendererViewportWidget", player_state, *, fb_w: int, fb_h: int, dpr: float) -> None:
    if not bool(self._overlays.paused()) or bool(self.loading_active()):
      self._clear_pause_preview_frame()
      return
    self._sync_player_name_overlays()
    preview_widget = self._overlay._skin_preview
    if int(preview_widget.width()) <= 1 or int(preview_widget.height()) <= 1:
      self._clear_pause_preview_frame()
      return
    w = max(1, int(round(float(preview_widget.width()) * max(1.0, float(dpr)))))
    h = max(1, int(round(float(preview_widget.height()) * max(1.0, float(dpr)))))
    preview_state = self._build_pause_preview_player_state(player_state)
    preview_key = self._pause_preview_key(player_state=preview_state, width=int(w), height=int(h), device_pixel_ratio=float(dpr))
    if preview_key is not None and self._pause_preview_cache_key == preview_key and not self._pause_preview_frame.isNull():
      self._overlay.set_player_preview_frame(self._pause_preview_frame)
      return
    frame = self._renderer.render_player_preview_frame(w=int(w), h=int(h), player_state=preview_state, restore_framebuffer=int(self.defaultFramebufferObject()), restore_viewport=(0, 0, int(fb_w), int(fb_h)), device_pixel_ratio=float(max(1.0, float(dpr))))
    self._pause_preview_cache_key = preview_key
    self._pause_preview_frame = QImage(frame)
    self._overlay.set_player_preview_frame(frame)

  def _build_inventory_preview_player_state(self: "RendererViewportWidget", player_state) -> object:
    if player_state is None:
      return None
    body_yaw_deg, head_yaw_deg, head_pitch_deg = self._inventory.preview_widget().preview_angles()
    return replace(player_state, base_x=0.0, base_y=-0.22, base_z=0.0, body_yaw_deg=float(body_yaw_deg), head_yaw_deg=float(head_yaw_deg), head_pitch_deg=float(head_pitch_deg), is_first_person=False)

  def _clear_inventory_preview_frame(self: "RendererViewportWidget") -> None:
    if self._inventory_preview_cache_key is None and self._inventory_preview_frame.isNull():
      return
    self._invalidate_inventory_preview_cache()
    self._inventory.set_player_preview_frame(QImage())

  def _update_inventory_preview_frame(self: "RendererViewportWidget", player_state, *, fb_w: int, fb_h: int, dpr: float) -> None:
    if not bool(self._overlays.inventory_open()) or bool(self.loading_active()):
      self._clear_inventory_preview_frame()
      return
    preview_widget = self._inventory.preview_widget()
    if int(preview_widget.width()) <= 1 or int(preview_widget.height()) <= 1:
      self._clear_inventory_preview_frame()
      return
    w = max(1, int(round(float(preview_widget.width()) * max(1.0, float(dpr)))))
    h = max(1, int(round(float(preview_widget.height()) * max(1.0, float(dpr)))))
    preview_state = self._build_inventory_preview_player_state(player_state)
    preview_key = self._pause_preview_key(player_state=preview_state, width=int(w), height=int(h), device_pixel_ratio=float(dpr))
    if preview_key is not None and self._inventory_preview_cache_key == preview_key and not self._inventory_preview_frame.isNull():
      self._inventory.set_player_preview_frame(self._inventory_preview_frame)
      return
    frame = self._renderer.render_player_preview_frame(w=int(w), h=int(h), player_state=preview_state, restore_framebuffer=int(self.defaultFramebufferObject()), restore_viewport=(0, 0, int(fb_w), int(fb_h)), device_pixel_ratio=float(max(1.0, float(dpr))))
    self._inventory_preview_cache_key = preview_key
    self._inventory_preview_frame = QImage(frame)
    self._inventory.set_player_preview_frame(frame)

  def _update_ai_preview_frame(self: "RendererViewportWidget", *, fb_w: int, fb_h: int, dpr: float) -> None:
    preview = getattr(self, "_ai_preview", None)
    if preview is None:
      return
    actor_id = self._ai_edit_actor_id
    if actor_id is None:
      return
    widget = preview.preview_widget()
    if int(widget.width()) <= 1 or int(widget.height()) <= 1:
      return
    try:
      from ludoxel.presentation.rendering.visuals.players.ai_player_render_state import compose_ai_player_render_states

      snapshots = tuple(snapshot for snapshot in self._session.ai_render_snapshots() if str(getattr(snapshot, "actor_id", "")) == str(actor_id))
      if not snapshots:
        widget.set_frame_image(QImage())
        return
      states = compose_ai_player_render_states(snapshots, block_registry=self._session.block_registry)
      if not states:
        widget.set_frame_image(QImage())
        return
      body_yaw_deg, head_yaw_deg, head_pitch_deg = widget.preview_angles()
      preview_state = replace(states[0], base_x=0.0, base_y=-0.22, base_z=0.0, body_yaw_deg=float(body_yaw_deg), head_yaw_deg=float(head_yaw_deg), head_pitch_deg=float(head_pitch_deg), is_first_person=False)
      w = max(1, int(round(float(widget.width()) * max(1.0, float(dpr)))))
      h = max(1, int(round(float(widget.height()) * max(1.0, float(dpr)))))
      frame = self._renderer.render_player_preview_frame(w=int(w), h=int(h), player_state=preview_state, restore_framebuffer=int(self.defaultFramebufferObject()), restore_viewport=(0, 0, int(fb_w), int(fb_h)), device_pixel_ratio=float(max(1.0, float(dpr))))
      widget.set_frame_image(frame)
    except Exception:
      try:
        widget.set_frame_image(QImage())
      except Exception:
        pass

  def _layout_viewport_overlays(self: "RendererViewportWidget", *, width: int, height: int) -> None:
    if self._hud is not None:
      self._hud.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._othello_hud.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._overlay.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._settings.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._othello_settings.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    ai_settings = getattr(self, "_ai_settings_dialog", None)
    if ai_settings is not None and not bool(getattr(ai_settings, "_as_window", True)):
      ai_settings.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._crosshair.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._hotbar.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._route_overlay.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._inventory.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    self._death.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    menu = getattr(self, "_menu", None)
    if menu is not None:
      menu.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    chat_controller.layout_chat(self, int(width), int(height))
    self._sync_player_name_overlays()

  def _restore_overlay_stack_after_resize(self: "RendererViewportWidget") -> None:
    if self._overlays.menu_open():
      menu = getattr(self, "_menu", None)
      if menu is not None:
        menu.raise_()
    if self._overlays.dead():
      self._death.raise_()
    elif self._overlays.othello_settings_open():
      if self._othello_settings.isVisible():
        self._position_othello_settings_window()
        self._othello_settings.raise_()
    elif self._overlays.settings_open():
      if self._settings.isVisible():
        self._position_settings_window()
        self._settings.raise_()
    elif self._overlays.paused():
      self._overlay.raise_()
    elif self._overlays.inventory_open():
      self._inventory.raise_()
    self._route_overlay.raise_()
    self._sync_gameplay_hud_visibility()

  def _gameplay_hud_active(self: "RendererViewportWidget") -> bool:
    return (
      (not bool(self.loading_active()))
      and (not bool(self._state.hide_hud))
      and (not self._overlays.dead())
      and (not self._overlays.paused())
      and (not self._overlays.menu_open())
      and (not self._overlays.settings_open())
      and (not self._overlays.othello_settings_open())
      and (not bool(getattr(self, "_ai_settings_overlay_open", False)))
      and (not self._overlays.inventory_open())
      and (not bool(chat_controller.is_chat_open(self)))
    )

  def _debug_hud_active(self: "RendererViewportWidget") -> bool:
    return bool(self._state.hud_visible) and bool(self._gameplay_hud_active())

  def _gameplay_suspended(self: "RendererViewportWidget") -> bool:
    # This is the single suspension contract shared by the fixed-step simulation gate
    # (render_loop/loop.py's _tick_sim/_on_step) and gameplay audio: Pause, normal Settings, Othello
    # Settings, the AI Settings dialog, and any themed_notice_dialog transient modal all stop world
    # stepping the same way, so they must stop gameplay audio the same way too, instead of ambient
    # tracking a narrower, separately-maintained condition than the sim gate does.
    return bool(
      self.loading_active() or self._overlays.dead() or self._overlays.paused() or self._overlays.menu_open() or self._overlays.settings_open() or self._overlays.othello_settings_open() or bool(getattr(self, "_ai_settings_overlay_open", False)) or bool(getattr(self, "_transient_modal_active", lambda: False)())
    )

  def _sync_gameplay_hud_visibility(self: "RendererViewportWidget") -> None:
    show_gameplay_hud = bool(self._gameplay_hud_active())
    show_othello_hud = bool(
      (not bool(self.loading_active()))
      and (not bool(self._state.hide_hud))
      and (not self._overlays.dead())
      and (not self._overlays.paused())
      and (not self._overlays.menu_open())
      and (not self._overlays.inventory_open())
      and (not self._overlays.settings_open())
      and (not bool(chat_controller.is_chat_open(self)))
      and self._state.is_othello_space()
      and (not bool(self._state.hud_visible))
    )
    show_crosshair = bool(show_gameplay_hud and self._state.is_first_person_view())
    route_overlay_content_visible = bool(self._state.route_edit_active) or bool(self._debug_hud_active() and len(self._session.ai_route_paths()) > 0)
    show_route_overlay = bool(
      (not bool(self.loading_active()))
      and (not bool(self._state.hide_hud))
      and (not self._overlays.dead())
      and (not self._overlays.paused())
      and (not self._overlays.menu_open())
      and (not self._overlays.inventory_open())
      and (not self._overlays.settings_open())
      and (not self._overlays.othello_settings_open())
      and (not bool(getattr(self, "_ai_settings_overlay_open", False)))
      and (not bool(chat_controller.is_chat_open(self)))
      and ((not self._state.is_othello_space()) and bool(route_overlay_content_visible))
    )

    self._crosshair.setVisible(bool(show_crosshair))
    self._crosshair.set_axis_crosshair_enabled(bool(self._debug_hud_active()))
    self._hotbar.setVisible(bool(show_gameplay_hud))
    self._route_overlay.setVisible(bool(show_route_overlay))
    self._othello_hud.setVisible(bool(show_othello_hud))

    if self._hud is not None:
      self._hud.setVisible(bool(self._debug_hud_active()))
      if bool(self._debug_hud_active()):
        self._hud.raise_()

    if bool(show_gameplay_hud):
      self._hotbar.raise_()
      if bool(show_crosshair):
        self._crosshair.raise_()
      if self._hud is not None and bool(self._debug_hud_active()):
        self._hud.raise_()
    if bool(show_route_overlay):
      self._route_overlay.raise_()
    if bool(show_othello_hud):
      self._othello_hud.raise_()
    self._audio.set_gameplay_audio_suspended(current_space_id=self._state.current_space_id, suspended=bool(self._gameplay_suspended()))
    self._sync_player_name_overlays()
    self._raise_open_settings_surface()
    chat_controller.sync_visibility(self)

  def _update_axis_crosshair_camera(self: "RendererViewportWidget", *, yaw_deg: float, pitch_deg: float, roll_deg: float) -> None:
    self._crosshair.set_axis_camera(yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), roll_deg=float(roll_deg))

  def _raise_open_settings_surface(self: "RendererViewportWidget") -> None:
    if self._overlays.othello_settings_open() and self._othello_settings.isVisible():
      self._othello_settings.raise_()
      return
    if self._overlays.settings_open() and self._settings.isVisible():
      self._settings.raise_()
      return
    ai_dialog = getattr(self, "_ai_settings_dialog", None)
    if ai_dialog is not None and bool(getattr(self, "_ai_settings_overlay_open", False)) and ai_dialog.isVisible():
      ai_dialog.raise_()

  def _set_dead_overlay(self: "RendererViewportWidget", on: bool) -> None:
    if bool(on):
      self._reset_held_mouse_actions()
      chat_controller.force_close_if_open(self)
    self._overlays.set_dead(bool(on))
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _set_paused_overlay(self: "RendererViewportWidget", on: bool) -> None:
    if bool(on):
      self._reset_held_mouse_actions()
      chat_controller.force_close_if_open(self)
    self._overlays.set_paused(bool(on))
    self._invalidate_pause_preview_cache()
    if not bool(on):
      self._overlay.set_player_preview_frame(QImage())
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _set_menu_overlay(self: "RendererViewportWidget", on: bool) -> None:
    if bool(on):
      self._reset_held_mouse_actions()
      chat_controller.force_close_if_open(self)
      menu = getattr(self, "_menu", None)
      if menu is not None:
        menu.setGeometry(0, 0, max(1, int(self.width())), max(1, int(self.height())))
    self._overlays.set_menu_open(bool(on))
    self._invalidate_menu_preview_cache()
    if not bool(on):
      menu = getattr(self, "_menu", None)
      if menu is not None:
        menu.set_player_preview_frame(QImage())
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _invalidate_menu_preview_cache(self: "RendererViewportWidget") -> None:
    self._menu_preview_cache_key = None
    self._menu_preview_frame = QImage()

  def _clear_menu_preview_frame(self: "RendererViewportWidget") -> None:
    if getattr(self, "_menu_preview_cache_key", None) is None and getattr(self, "_menu_preview_frame", QImage()).isNull():
      return
    self._invalidate_menu_preview_cache()
    menu = getattr(self, "_menu", None)
    if menu is not None:
      menu.set_player_preview_frame(QImage())
      menu.set_player_preview_name_tag("", visible=False)

  def _build_menu_preview_player_state(self: "RendererViewportWidget", player_state) -> object:
    menu = getattr(self, "_menu", None)
    if player_state is None or menu is None:
      return None
    body_yaw_deg, head_yaw_deg, head_pitch_deg = menu.player_preview_angles()
    return replace(player_state, base_x=0.0, base_y=-0.22, base_z=0.0, body_yaw_deg=float(body_yaw_deg), head_yaw_deg=float(head_yaw_deg), head_pitch_deg=float(head_pitch_deg), is_first_person=False)

  def _update_menu_preview_frame(self: "RendererViewportWidget", player_state, *, fb_w: int, fb_h: int, dpr: float) -> None:
    menu = getattr(self, "_menu", None)
    if menu is None or not bool(menu.menu_preview_visible()) or bool(self.loading_active()):
      self._clear_menu_preview_frame()
      return
    preview_widget = menu.player_preview_widget()
    if int(preview_widget.width()) <= 1 or int(preview_widget.height()) <= 1:
      self._clear_menu_preview_frame()
      return
    text = str(self._state.resolved_player_name).strip()
    menu.set_player_preview_name_tag(text, visible=bool(text), opacity=1.0)
    w = max(1, int(round(float(preview_widget.width()) * max(1.0, float(dpr)))))
    h = max(1, int(round(float(preview_widget.height()) * max(1.0, float(dpr)))))
    preview_state = self._build_menu_preview_player_state(player_state)
    preview_key = self._pause_preview_key(player_state=preview_state, width=int(w), height=int(h), device_pixel_ratio=float(dpr))
    if preview_key is not None and getattr(self, "_menu_preview_cache_key", None) == preview_key and not getattr(self, "_menu_preview_frame", QImage()).isNull():
      menu.set_player_preview_frame(self._menu_preview_frame)
      return
    frame = self._renderer.render_player_preview_frame(w=int(w), h=int(h), player_state=preview_state, restore_framebuffer=int(self.defaultFramebufferObject()), restore_viewport=(0, 0, int(fb_w), int(fb_h)), device_pixel_ratio=float(max(1.0, float(dpr))))
    self._menu_preview_cache_key = preview_key
    self._menu_preview_frame = QImage(frame)
    menu.set_player_preview_frame(frame)

  def _set_settings_overlay(self: "RendererViewportWidget", on: bool) -> None:
    if bool(on):
      self._reset_held_mouse_actions()
      self._position_settings_window()
    self._overlays.set_settings_open(bool(on))
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _set_othello_settings_overlay(self: "RendererViewportWidget", on: bool) -> None:
    if bool(on):
      self._reset_held_mouse_actions()
      self._position_othello_settings_window()
    self._overlays.set_othello_settings_open(bool(on))
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _set_inventory_overlay(self: "RendererViewportWidget", on: bool) -> None:
    if bool(on) and not settings_controller.inventory_available(self):
      return
    if bool(on):
      self._reset_held_mouse_actions()
      settings_controller.sync_hotbar_widgets(self)
    self._overlays.set_inventory_open(bool(on))
    if not bool(on):
      self._clear_inventory_preview_frame()
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _sync_player_name_overlays(self: "RendererViewportWidget") -> None:
    text = str(self._state.resolved_player_name).strip()
    preview_visible = bool(self._overlays.paused()) and (not bool(self.loading_active())) and (not bool(self._state.hide_hud)) and bool(text)
    self._overlay.set_player_preview_name_tag(text, visible=bool(preview_visible), opacity=1.0)
