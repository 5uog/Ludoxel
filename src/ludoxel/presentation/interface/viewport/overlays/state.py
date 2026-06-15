# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from dataclasses import replace
from typing import TYPE_CHECKING

import numpy as np
from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QWidget

import ludoxel.foundations.mathematics.linear.mat4 as mat4
import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.foundations.mathematics.linear.transform_matrices import rotate_z_deg_matrix
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import forward_from_yaw_pitch_deg
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.presentation.interface.hud.ai_status_tags import AiStatusTagPool
from ludoxel.presentation.rendering.contracts.config import render_distance_fog_range

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget

_PLAYER_NAME_VERTICAL_OFFSET = 0.24
_PLAYER_NAME_CROUCH_OFFSET = 0.12
_PLAYER_NAME_OCCLUDED_OPACITY = 0.45
_PLAYER_NAME_CROUCH_OPACITY = 0.45
_PLAYER_NAME_SCREEN_MARGIN_PX = 8
_AI_TAG_MAX_DISTANCE = 64.0
_AI_TAG_REFERENCE_DISTANCE = 6.0
_AI_TAG_MIN_SCALE = 0.25
_AI_TAG_MAX_SCALE = 1.25
_AI_TAG_OCCLUSION_CACHE_S = 0.12


class ViewportOverlayMixin:
  def set_hud(self: "RendererViewportWidget", hud) -> None:
    self._hud = hud
    self._hud.setParent(self)
    self._hud.setGeometry(0, 0, max(1, self.width()), max(1, self.height()))
    self._sync_gameplay_hud_visibility()

  def fullscreen_enabled(self: "RendererViewportWidget") -> bool:
    return bool(self._state.fullscreen)

  def _invalidate_pause_preview_cache(self: "RendererViewportWidget") -> None:
    self._pause_preview_cache_key = None
    self._pause_preview_frame = QImage()

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
    """
    本体画面へ埋め込んだ Settings overlay を viewport 全体へ広げて配置する。
    Settings overlay は detached window ではなく viewport の子 widget として表示されるため、`_layout_viewport_overlays` と同じく原点から viewport の幅・高さへ一致させる。overlay の root layout は余白なしで panel を全面へ伸張し、root 背景も不透明であるため、配置後は不透明な設定画面が viewport 全体を覆い、背後のゲーム描画は見えない。
    """
    self._settings.setGeometry(0, 0, max(1, int(self.width())), max(1, int(self.height())))

  def _position_othello_settings_window(self: "RendererViewportWidget") -> None:
    """
    本体画面へ埋め込んだ Othello Settings overlay を viewport 全体へ広げて配置する。
    Settings overlay と同様に viewport の子 widget として原点から viewport の幅・高さへ一致させ、余白なしで panel を全面へ伸張する不透明な設定画面として viewport 全体を覆う。
    """
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
    frame = self._renderer.render_player_preview_frame(
      w=int(w),
      h=int(h),
      player_state=preview_state,
      restore_framebuffer=int(self.defaultFramebufferObject()),
      restore_viewport=(0, 0, int(fb_w), int(fb_h)),
      device_pixel_ratio=float(max(1.0, float(dpr))),
    )
    self._pause_preview_cache_key = preview_key
    self._pause_preview_frame = QImage(frame)
    self._overlay.set_player_preview_frame(frame)

  def _update_ai_preview_frame(self: "RendererViewportWidget", *, fb_w: int, fb_h: int, dpr: float) -> None:
    """
    AI Settings Preview dialog が開いている間、編集対象 AI を中央に据えた preview frame を renderer の offscreen player preview 経路で 1 frame 生成し、dialog の preview widget へ供給する。
    対象 actor は `_ai_edit_actor_id` で特定し、その render snapshot から third-person render state を合成して skin texture 選択子を継承させたうえで、原点中央・正面向き・third-person の preview pose へ写し替える。回転角は dialog の preview widget から取得した body yaw、head yaw、head pitch を用いる。
    preview が閉じている、対象 actor が存在しない、preview widget が縮退している場合は何もしないか frame を空にする。renderer 呼び出しが例外を送出した場合でも main render path を巻き込まないよう退避し、preview frame を空へ戻して dialog 側の描画を抑止する。
    """
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
      preview_state = replace(
        states[0], base_x=0.0, base_y=-0.22, base_z=0.0, body_yaw_deg=float(body_yaw_deg), head_yaw_deg=float(head_yaw_deg), head_pitch_deg=float(head_pitch_deg), is_first_person=False
      )
      w = max(1, int(round(float(widget.width()) * max(1.0, float(dpr)))))
      h = max(1, int(round(float(widget.height()) * max(1.0, float(dpr)))))
      frame = self._renderer.render_player_preview_frame(
        w=int(w),
        h=int(h),
        player_state=preview_state,
        restore_framebuffer=int(self.defaultFramebufferObject()),
        restore_viewport=(0, 0, int(fb_w), int(fb_h)),
        device_pixel_ratio=float(max(1.0, float(dpr))),
      )
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
    self._sync_player_name_overlays()

  def _restore_overlay_stack_after_resize(self: "RendererViewportWidget") -> None:
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
      and (not self._overlays.settings_open())
      and (not self._overlays.othello_settings_open())
      and (not bool(getattr(self, "_ai_settings_overlay_open", False)))
      and (not self._overlays.inventory_open())
    )

  def _debug_hud_active(self: "RendererViewportWidget") -> bool:
    return bool(self._state.hud_visible) and bool(self._gameplay_hud_active())

  def _ambient_audio_active(self: "RendererViewportWidget") -> bool:
    """
    ambient audio を gameplay simulation の可聴状態へ同期し、F1 の HUD 表示選択を音源 lifecycle から分離する。
    loading、death、pause、Othello settings、inventory では停止する一方、HUD のみを非表示にした gameplay 中は同じ再生位置と音源選択を維持する。
    """
    return bool(
      (not bool(self.loading_active())) and (not self._overlays.dead()) and (not self._overlays.paused()) and (not self._overlays.othello_settings_open()) and (not self._overlays.inventory_open())
    )

  def _sync_gameplay_hud_visibility(self: "RendererViewportWidget") -> None:
    show_gameplay_hud = bool(self._gameplay_hud_active())
    show_othello_hud = bool(
      (not bool(self.loading_active()))
      and (not bool(self._state.hide_hud))
      and (not self._overlays.dead())
      and (not self._overlays.paused())
      and (not self._overlays.inventory_open())
      and (not self._overlays.settings_open())
      and self._state.is_othello_space()
      and (not bool(self._state.hud_visible))
    )
    show_crosshair = bool(show_gameplay_hud and self._state.is_first_person_view())
    show_route_overlay = bool(
      (not bool(self.loading_active()))
      and (not self._overlays.dead())
      and (not self._overlays.paused())
      and (not self._overlays.inventory_open())
      and (not self._overlays.settings_open())
      and (not self._overlays.othello_settings_open())
      and (not bool(getattr(self, "_ai_settings_overlay_open", False)))
      and ((not self._state.is_othello_space()) and (bool(self._state.route_edit_active) or len(self._session.ai_route_paths()) > 0))
    )

    self._crosshair.setVisible(bool(show_crosshair))
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
    self._audio.set_ambient_active(current_space_id=self._state.current_space_id, enabled=bool(self._ambient_audio_active()))
    self._sync_player_name_overlays()
    self._raise_open_settings_surface()

  def _raise_open_settings_surface(self: "RendererViewportWidget") -> None:
    """
    本体画面へ埋め込んだ Settings、AI Settings、Othello Settings overlay のいずれかが開いている場合、その overlay を viewport の子 widget 群の最前面へ上げる。
    Pause、inventory、death と異なり、これらの設定 overlay は HUD やゲーム描画より常に上に来なければならないため、HUD の表示・最前面化を行う `_sync_gameplay_hud_visibility` の末尾で改めて最前面へ上げ、crosshair、F3 HUD、hotbar、route overlay が設定 overlay より前へ出ないことを保証する。設定 overlay が閉じている場合は何もしない。
    """
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
    self._overlays.set_dead(bool(on))
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _set_paused_overlay(self: "RendererViewportWidget", on: bool) -> None:
    if bool(on):
      self._reset_held_mouse_actions()
    self._overlays.set_paused(bool(on))
    self._invalidate_pause_preview_cache()
    if not bool(on):
      self._overlay.set_player_preview_frame(QImage())
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _set_settings_overlay(self: "RendererViewportWidget", on: bool) -> None:
    """
    本体画面へ埋め込んだ Settings overlay の表示・非表示を切り替える。
    overlay は viewport の子 widget であるため、detached window 時代に必要だった全画面解除の往復は行わず、表示時に viewport 全面へ配置してから overlay state machine へ委譲する。全画面のまま埋め込み Settings を重ねて表示できる。
    """
    if bool(on):
      self._reset_held_mouse_actions()
      self._position_settings_window()
    self._overlays.set_settings_open(bool(on))
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _set_othello_settings_overlay(self: "RendererViewportWidget", on: bool) -> None:
    """
    本体画面へ埋め込んだ Othello Settings overlay の表示・非表示を切り替える。
    Settings overlay と同様に viewport の子 widget として全面へ配置するため、全画面解除の往復は行わずに overlay state machine へ委譲する。
    """
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
    self._overlays.set_inventory_open(bool(on))
    self._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(self)

  def _hide_world_player_name_tag(self: "RendererViewportWidget") -> None:
    self._player_name_tag.setVisible(False)

  def _set_world_player_name_tag(self: "RendererViewportWidget", *, text: str, center_x: float, bottom_y: float, opacity: float) -> None:
    body = str(text).strip()
    if not body:
      self._hide_world_player_name_tag()
      return
    self._player_name_tag.setText(body)
    self._player_name_tag.adjustSize()
    label_w = int(max(1, self._player_name_tag.width()))
    label_h = int(max(1, self._player_name_tag.height()))
    margin = int(max(0, _PLAYER_NAME_SCREEN_MARGIN_PX))
    x = int(round(float(center_x) - float(label_w) * 0.5))
    y = int(round(float(bottom_y) - float(label_h)))
    x = max(int(margin), min(max(int(margin), int(self.width()) - label_w - int(margin)), int(x)))
    y = max(int(margin), min(max(int(margin), int(self.height()) - label_h - int(margin)), int(y)))
    self._player_name_tag_effect.setOpacity(float(clampf(float(opacity), 0.0, 1.0)))
    self._player_name_tag.setGeometry(int(x), int(y), int(label_w), int(label_h))
    self._player_name_tag.setVisible(True)
    self._player_name_tag.raise_()

  def _world_player_name_visible(self: "RendererViewportWidget") -> bool:
    return bool(
      (not bool(self.loading_active()))
      and (not bool(self._state.hide_hud))
      and (not self._overlays.dead())
      and (not self._overlays.paused())
      and (not self._overlays.settings_open())
      and (not self._overlays.othello_settings_open())
      and (not self._overlays.inventory_open())
      and (not bool(self._state.is_first_person_view()))
    )

  def _sync_player_name_overlays(self: "RendererViewportWidget") -> None:
    text = str(self._state.resolved_player_name).strip()
    preview_visible = bool(self._overlays.paused()) and (not bool(self.loading_active())) and (not bool(self._state.hide_hud)) and bool(text)
    self._overlay.set_player_preview_name_tag(text, visible=bool(preview_visible), opacity=1.0)
    if not bool(self._world_player_name_visible()) or not bool(text):
      self._hide_world_player_name_tag()
    if not bool(self._ai_status_tags_visible()):
      self._hide_ai_status_tags()

  def _ai_status_tag_pool(self: "RendererViewportWidget") -> AiStatusTagPool:
    """
    AI nametag と health indicator の widget pool を遅延生成して返す。
    viewport widget の生成順へ依存しないよう初回参照時に viewport を親として構築し、以後は同一 instance を再利用する。
    """
    pool = getattr(self, "_ai_status_tags", None)
    if pool is None:
      pool = AiStatusTagPool(self)
      self._ai_status_tags = pool
    return pool

  def _hide_ai_status_tags(self: "RendererViewportWidget") -> None:
    pool = getattr(self, "_ai_status_tags", None)
    if pool is not None:
      pool.hide_all()

  def _ai_status_tags_visible(self: "RendererViewportWidget") -> bool:
    """
    AI nametag と health indicator を描画してよい viewport 状態かを判定する。
    判定条件は world player nametag と同一の HUD/overlay 抑制(loading、HUD 非表示、death、pause、settings、Othello settings、inventory)に従うが、AI tag は他者表示であるため first-person 視点でも表示する。
    """
    return bool(
      (not bool(self.loading_active()))
      and (not bool(self._state.hide_hud))
      and (not self._overlays.dead())
      and (not self._overlays.paused())
      and (not self._overlays.settings_open())
      and (not self._overlays.othello_settings_open())
      and (not self._overlays.inventory_open())
    )

  def _player_name_anchor_world_pos(self: "RendererViewportWidget", *, snapshot) -> Vec3:
    player = self._session.player
    crouch_amount = clampf(float(snapshot.player_model.crouch_amount), 0.0, 1.0)
    y = float(snapshot.player_model.base_y) + float(player.height) + float(_PLAYER_NAME_VERTICAL_OFFSET) - float(_PLAYER_NAME_CROUCH_OFFSET) * float(crouch_amount)
    return Vec3(float(snapshot.player_model.base_x), float(y), float(snapshot.player_model.base_z))

  def _player_name_occluded(self: "RendererViewportWidget", *, eye: Vec3, target: Vec3, distance: float) -> bool:
    if float(distance) <= 1e-4:
      return False
    direction = (target - eye).normalized()
    hit = self._session.pick_block(reach=float(distance) + 0.05, origin=eye, direction=direction)
    if hit is None:
      return False
    return bool(float(hit.t) + 1e-4 < float(distance) - 0.02)

  def _update_world_player_name_tag(self: "RendererViewportWidget", *, snapshot, eye: Vec3, yaw_deg: float, pitch_deg: float, roll_deg: float) -> None:
    text = str(self._state.resolved_player_name).strip()
    if not bool(text) or not bool(self._world_player_name_visible()) or int(self.width()) <= 1 or int(self.height()) <= 1:
      self._hide_world_player_name_tag()
      return

    anchor = self._player_name_anchor_world_pos(snapshot=snapshot)
    to_anchor = anchor - eye
    distance = float(to_anchor.length())
    if float(distance) <= 1e-4:
      self._hide_world_player_name_tag()
      return

    forward = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
    view = mat4.look_dir(eye, forward)
    if abs(float(roll_deg)) > 1e-6:
      view = mat4.mul(rotate_z_deg_matrix(float(roll_deg)), view)
    proj = mat4.perspective(float(snapshot.camera.fov_deg), float(self.width()) / max(float(self.height()), 1.0), 0.01, float(self._renderer._cfg.camera.z_far))
    clip = mat4.mul(proj, view) @ np.asarray([float(anchor.x), float(anchor.y), float(anchor.z), 1.0], dtype=np.float32)
    if float(clip[3]) <= 1e-6:
      self._hide_world_player_name_tag()
      return

    ndc_x = float(clip[0]) / float(clip[3])
    ndc_y = float(clip[1]) / float(clip[3])
    ndc_z = float(clip[2]) / float(clip[3])
    if float(ndc_x) < -1.1 or float(ndc_x) > 1.1 or float(ndc_y) < -1.1 or float(ndc_y) > 1.1 or float(ndc_z) < -1.1 or float(ndc_z) > 1.1:
      self._hide_world_player_name_tag()
      return

    center_x = (float(ndc_x) * 0.5 + 0.5) * float(self.width())
    bottom_y = (1.0 - (float(ndc_y) * 0.5 + 0.5)) * float(self.height())

    opacity = 1.0
    if bool(getattr(self, "_recent_crouch_held", False)):
      opacity *= float(_PLAYER_NAME_CROUCH_OPACITY)
    if self._player_name_occluded(eye=eye, target=anchor, distance=float(distance)):
      opacity *= float(_PLAYER_NAME_OCCLUDED_OPACITY)

    self._set_world_player_name_tag(text=text, center_x=float(center_x), bottom_y=float(bottom_y), opacity=float(opacity))

  def _ai_tag_occluded(self: "RendererViewportWidget", *, actor_id: str, eye: Vec3, anchor: Vec3, distance: float) -> bool:
    """
    AI nametag の遮蔽判定結果を actor 単位の短時間 cache 付きで返す。
    遮蔽判定本体は world player nametag と同じ picking ray であり、AI が遠距離にいるほど ray の DDA 走査が長くなるため、
    actor ごとに直近結果を _AI_TAG_OCCLUSION_CACHE_S 秒間再利用して frame ごとの ray 本数を抑える。
    cache は monotonic 時刻で失効管理し、表示状態には遮蔽時の減光のみが影響するため短い遅延は視覚上問題にならない。
    """
    cache = getattr(self, "_ai_tag_occlusion_cache", None)
    if cache is None:
      cache = {}
      self._ai_tag_occlusion_cache = cache
    now = float(time.monotonic())
    cached = cache.get(str(actor_id))
    if cached is not None and float(now) - float(cached[0]) < float(_AI_TAG_OCCLUSION_CACHE_S):
      return bool(cached[1])
    occluded = bool(self._player_name_occluded(eye=eye, target=anchor, distance=float(distance)))
    cache[str(actor_id)] = (float(now), bool(occluded))
    if len(cache) > 64:
      cache.clear()
    return bool(occluded)

  def _update_ai_status_tags(self: "RendererViewportWidget", *, snapshot, eye: Vec3, yaw_deg: float, pitch_deg: float, roll_deg: float) -> None:
    """
    現在 frame の camera から見える AI actor の nametag と health indicator を screen 空間へ投影して更新する。
    投影は world player nametag と同じ view、roll、perspective、NDC 範囲判定、画面遮蔽による減光を用いるが、AI tag は first-person 視点でも表示する。
    anchor は各 AI の足元位置に身長と nametag offset を加えた頭上点であり、camera の後方、NDC 範囲外、_AI_TAG_MAX_DISTANCE 超、viewport 縮退時は表示しない。
    表示寸法は camera から AI までの world 距離に対する _AI_TAG_REFERENCE_DISTANCE / distance を [_AI_TAG_MIN_SCALE, _AI_TAG_MAX_SCALE] へ clamp して縮尺する。
    縮尺は nametag と health indicator を合成した block 全体へ適用されるため、遠い AI ほど背景、padding、文字、heart、間隔が一体で小さく描画される。
    snapshot 値は session の ai_render_snapshots() が返す読み取り専用 DTO であり、この更新処理は simulation 状態を変更しない。
    """
    if not bool(self._ai_status_tags_visible()) or int(self.width()) <= 1 or int(self.height()) <= 1:
      self._hide_ai_status_tags()
      return
    ai_snapshots = tuple(self._session.ai_render_snapshots())
    pool = self._ai_status_tag_pool()
    pool.begin_frame()
    if len(ai_snapshots) > 0:
      forward = forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
      view = mat4.look_dir(eye, forward)
      if abs(float(roll_deg)) > 1e-6:
        view = mat4.mul(rotate_z_deg_matrix(float(roll_deg)), view)
      proj = mat4.perspective(float(snapshot.camera.fov_deg), float(self.width()) / max(float(self.height()), 1.0), 0.01, float(self._renderer._cfg.camera.z_far))
      view_proj = mat4.mul(proj, view)
      fog_start, fog_end = render_distance_fog_range(int(self._state.render_distance_chunks), float(self._renderer._cfg.camera.z_far))
      for ai_snapshot in ai_snapshots:
        anchor = Vec3(float(ai_snapshot.position_x), float(ai_snapshot.position_y) + float(ai_snapshot.height) + float(_PLAYER_NAME_VERTICAL_OFFSET), float(ai_snapshot.position_z))
        to_anchor = anchor - eye
        distance = float(to_anchor.length())
        if float(distance) <= 1e-4 or float(distance) > float(_AI_TAG_MAX_DISTANCE):
          continue
        if float(fog_end) > float(fog_start) and float(distance) >= float(fog_end):
          continue
        clip = view_proj @ np.asarray([float(anchor.x), float(anchor.y), float(anchor.z), 1.0], dtype=np.float32)
        if float(clip[3]) <= 1e-6:
          continue
        ndc_x = float(clip[0]) / float(clip[3])
        ndc_y = float(clip[1]) / float(clip[3])
        ndc_z = float(clip[2]) / float(clip[3])
        if float(ndc_x) < -1.1 or float(ndc_x) > 1.1 or float(ndc_y) < -1.1 or float(ndc_y) > 1.1 or float(ndc_z) < -1.1 or float(ndc_z) > 1.1:
          continue
        center_x = (float(ndc_x) * 0.5 + 0.5) * float(self.width())
        bottom_y = (1.0 - (float(ndc_y) * 0.5 + 0.5)) * float(self.height())
        tag_scale = float(clampf(float(_AI_TAG_REFERENCE_DISTANCE) / max(float(distance), 1e-3), float(_AI_TAG_MIN_SCALE), float(_AI_TAG_MAX_SCALE)))
        opacity = 1.0
        if float(fog_end) > float(fog_start):
          fog_factor = float(clampf((float(distance) - float(fog_start)) / max(float(fog_end) - float(fog_start), 1e-3), 0.0, 1.0))
          opacity *= float(1.0 - fog_factor)
        if self._ai_tag_occluded(actor_id=str(ai_snapshot.actor_id), eye=eye, anchor=anchor, distance=float(distance)):
          opacity *= float(_PLAYER_NAME_OCCLUDED_OPACITY)
        if float(opacity) <= 1e-3:
          continue
        pool.show_tag(
          actor_id=str(ai_snapshot.actor_id),
          name=str(ai_snapshot.name),
          health=float(ai_snapshot.health),
          max_health=float(ai_snapshot.max_health),
          indicator=str(ai_snapshot.health_indicator),
          center_x=float(center_x),
          anchor_bottom_y=float(bottom_y),
          opacity=float(opacity),
          scale=float(tag_scale),
        )
    pool.end_frame()
