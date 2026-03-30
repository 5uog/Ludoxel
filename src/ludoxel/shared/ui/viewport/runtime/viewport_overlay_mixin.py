# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import replace
from typing import TYPE_CHECKING

from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QWidget

from ..controllers import settings_controller

if TYPE_CHECKING:
                                                                from ..gl_viewport_widget import GLViewportWidget


class ViewportOverlayMixin:

    def set_hud(self: "GLViewportWidget", hud) -> None:
        self._hud = hud
        self._hud.setParent(self)
        self._hud.setGeometry(0, 0, max(1, self.width()), max(1, self.height()))
        self._sync_gameplay_hud_visibility()

    def fullscreen_enabled(self: "GLViewportWidget") -> bool:
        return bool(self._state.fullscreen)

    def _invalidate_pause_preview_cache(self: "GLViewportWidget") -> None:
        self._pause_preview_cache_key = None
        self._pause_preview_frame = QImage()

    def _clear_pause_preview_frame(self: "GLViewportWidget") -> None:
        if self._pause_preview_cache_key is None and self._pause_preview_frame.isNull():
            return
        self._invalidate_pause_preview_cache()
        self._overlay.set_player_preview_frame(QImage())

    def _position_detached_overlay_window(self: "GLViewportWidget", overlay: QWidget | None) -> None:
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

    def _position_settings_window(self: "GLViewportWidget") -> None:
        self._position_detached_overlay_window(self._settings)

    def _position_othello_settings_window(self: "GLViewportWidget") -> None:
        self._position_detached_overlay_window(self._othello_settings)

    @staticmethod
    def _pause_preview_key(*, player_state, width: int, height: int, device_pixel_ratio: float) -> tuple[object, ...] | None:
        if player_state is None:
            return None
        return (int(width), int(height), round(float(device_pixel_ratio), 4), round(float(player_state.base_x), 4), round(float(player_state.base_y), 4), round(float(player_state.base_z), 4), round(float(player_state.body_yaw_deg), 4), round(float(player_state.head_yaw_deg), 4), round(float(player_state.head_pitch_deg), 4), round(float(player_state.limb_phase_rad), 4), round(float(player_state.limb_swing_amount), 4), round(float(player_state.crouch_amount), 4), bool(player_state.is_first_person))

    def _build_pause_preview_player_state(self: "GLViewportWidget", player_state) -> object:
        body_yaw_deg, head_yaw_deg, head_pitch_deg = self._overlay.player_preview_angles()
        if player_state is None:
            return None
        return replace(player_state, base_x=0.0, base_y=-0.22, base_z=0.0, body_yaw_deg=float(body_yaw_deg), head_yaw_deg=float(head_yaw_deg), head_pitch_deg=float(head_pitch_deg), is_first_person=False)

    def _update_pause_preview_frame(self: "GLViewportWidget", player_state, *, fb_w: int, fb_h: int, dpr: float) -> None:
        if not bool(self._overlays.paused()) or bool(self.loading_active()):
            self._clear_pause_preview_frame()
            return
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

    def _layout_viewport_overlays(self: "GLViewportWidget", *, width: int, height: int) -> None:
        if self._hud is not None:
            self._hud.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
        self._othello_hud.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
        self._overlay.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
        self._crosshair.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
        self._hotbar.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
        self._inventory.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
        self._death.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))

    def _restore_overlay_stack_after_resize(self: "GLViewportWidget") -> None:
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
        self._sync_gameplay_hud_visibility()

    def _gameplay_hud_active(self: "GLViewportWidget") -> bool:
        return ((not bool(self.loading_active())) and (not bool(self._state.hide_hud)) and (not self._overlays.dead()) and (not self._overlays.paused()) and (not self._overlays.othello_settings_open()) and (not self._overlays.inventory_open()))

    def _debug_hud_active(self: "GLViewportWidget") -> bool:
        return bool(self._state.hud_visible) and bool(self._gameplay_hud_active())

    def _sync_gameplay_hud_visibility(self: "GLViewportWidget") -> None:
        show_gameplay_hud = bool(self._gameplay_hud_active())
        show_othello_hud = bool((not bool(self.loading_active())) and (not bool(self._state.hide_hud)) and (not self._overlays.dead()) and (not self._overlays.paused()) and (not self._overlays.inventory_open()) and (not self._overlays.settings_open()) and self._state.is_othello_space() and (not bool(self._state.hud_visible)))
        show_crosshair = bool(show_gameplay_hud and self._state.is_first_person_view())

        self._crosshair.setVisible(bool(show_crosshair))
        self._hotbar.setVisible(bool(show_gameplay_hud))
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
        if bool(show_othello_hud):
            self._othello_hud.raise_()
        self._audio.set_ambient_active(current_space_id=self._state.current_space_id, enabled=bool(show_gameplay_hud))

    def _set_dead_overlay(self: "GLViewportWidget", on: bool) -> None:
        if bool(on):
            self._reset_held_mouse_actions()
        self._overlays.set_dead(bool(on))
        self._sync_gameplay_hud_visibility()
        settings_controller.sync_cloud_motion_pause(self)

    def _set_paused_overlay(self: "GLViewportWidget", on: bool) -> None:
        if bool(on):
            self._reset_held_mouse_actions()
        self._overlays.set_paused(bool(on))
        self._invalidate_pause_preview_cache()
        if not bool(on):
            self._overlay.set_player_preview_frame(QImage())
        self._sync_gameplay_hud_visibility()
        settings_controller.sync_cloud_motion_pause(self)

    def _set_settings_overlay(self: "GLViewportWidget", on: bool) -> None:
        if bool(on):
            self._reset_held_mouse_actions()
            if bool(self._state.fullscreen):
                self.fullscreen_changed.emit(False)
            self._position_settings_window()
        self._overlays.set_settings_open(bool(on))
        if (not bool(on)) and (not self._overlays.settings_open()) and (not self._overlays.othello_settings_open()):
            self.fullscreen_changed.emit(bool(self._state.fullscreen))
        self._sync_gameplay_hud_visibility()
        settings_controller.sync_cloud_motion_pause(self)

    def _set_othello_settings_overlay(self: "GLViewportWidget", on: bool) -> None:
        if bool(on):
            self._reset_held_mouse_actions()
            if bool(self._state.fullscreen):
                self.fullscreen_changed.emit(False)
            self._position_othello_settings_window()
        self._overlays.set_othello_settings_open(bool(on))
        if (not bool(on)) and (not self._overlays.settings_open()) and (not self._overlays.othello_settings_open()):
            self.fullscreen_changed.emit(bool(self._state.fullscreen))
        self._sync_gameplay_hud_visibility()
        settings_controller.sync_cloud_motion_pause(self)

    def _set_inventory_overlay(self: "GLViewportWidget", on: bool) -> None:
        if bool(on) and not settings_controller.inventory_available(self):
            return
        if bool(on):
            self._reset_held_mouse_actions()
        self._overlays.set_inventory_open(bool(on))
        self._sync_gameplay_hud_visibility()
        settings_controller.sync_cloud_motion_pause(self)
