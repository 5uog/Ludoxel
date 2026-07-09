# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from PyQt6.QtCore import QTimer, QUrl
from PyQt6.QtGui import QDesktopServices

import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.application.chat.commands import candidates_for_input, execute_command
from ludoxel.application.chat.runtime import ChatRuntime
from ludoxel.presentation.interface.chat.feed import HUD_FEED_MESSAGE_LIMIT, ChatFeedWidget
from ludoxel.presentation.interface.chat.screen import ChatScreen
from ludoxel.presentation.interface.hud.hotbar_layout import HOTBAR_BOTTOM_MARGIN_PX, HOTBAR_HEALTH_GAP_PX, HOTBAR_SLOT_SIDE_PX

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget


_FEED_LEFT_MARGIN_PX = 12
_FEED_TOP_MARGIN_PX = 12
_FEED_HEALTH_STRIP_PX = 18
_FEED_HOTBAR_GAP_PX = 10
_FEED_WIDTH_FRACTION = 0.42
_FEED_MIN_WIDTH_PX = 360
_SUGGESTION_COMMAND = "command"
_SUGGESTION_MENTION = "mention"


def _hotbar_clearance_px() -> int:
  return int(HOTBAR_BOTTOM_MARGIN_PX) + int(HOTBAR_SLOT_SIDE_PX) + int(HOTBAR_HEALTH_GAP_PX) + int(_FEED_HEALTH_STRIP_PX) + int(_FEED_HOTBAR_GAP_PX)


class ChatController:
  def __init__(self, viewport: "RendererViewportWidget") -> None:
    self._v = viewport
    self._runtime = ChatRuntime()
    self._open = False

    self._screen = ChatScreen(viewport, resource_root=viewport._resource_root)
    self._feed = ChatFeedWidget(viewport)
    self._screen.setVisible(False)
    self._feed.setVisible(False)

    self._screen.close_requested.connect(self.close)
    self._screen.submit_requested.connect(self._on_submit)
    self._screen.input_changed.connect(self._on_input_changed)
    self._screen.settings_requested.connect(self._on_settings_requested)
    self._screen.settings_close_requested.connect(self._on_settings_close)
    self._screen.mute_changed.connect(self._on_mute_changed)
    self._screen.link_activated.connect(self._on_link_activated)
    self._screen.sent_history_requested.connect(self._on_sent_history_requested)
    self._screen.input_edited.connect(self._on_input_edited)
    self._screen.candidate_activated.connect(self._on_candidate_activated)
    self._feed.fade_visibility_changed.connect(self.sync_visibility)
    self._sent_history_index: int | None = None
    self._sent_history_draft = ""
    self._sent_history_recalled_text = ""
    self._sent_history_recalled_dirty = False
    self._suggestion_mode = ""

    self._support_timer = QTimer(viewport)
    self._support_timer.setInterval(int(round(float(self._runtime.support_interval_s()) * 1000.0)))
    self._support_timer.timeout.connect(self._on_support_tick)
    self._support_timer.start()

    self._refresh()

  def is_open(self) -> bool:
    return bool(self._open)

  def open(self) -> None:
    viewport = self._v
    if self._open or bool(viewport.loading_active()) or bool(viewport._overlays.any_modal_open()) or bool(getattr(viewport, "_ai_settings_overlay_open", False)):
      return
    self._open = True
    viewport._reset_held_mouse_actions()
    viewport._inp.reset()
    viewport._reset_recent_input_state()
    viewport._inp.set_mouse_capture(False)
    self._screen.set_settings_open(False)
    self._screen.clear_input()
    self._reset_sent_history_navigation()
    self._screen.show_candidates(False)
    self.layout(int(viewport.width()), int(viewport.height()))
    self._refresh()
    self._screen.setVisible(True)
    self._screen.raise_()
    self._screen.focus_input()
    viewport._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(viewport)

  def close(self) -> None:
    if not self._open:
      return
    self._open = False
    viewport = self._v
    self._screen.set_settings_open(False)
    self._screen.setVisible(False)
    viewport._inp.reset()
    viewport._reset_recent_input_state()
    viewport._sync_gameplay_hud_visibility()
    settings_controller.sync_cloud_motion_pause(viewport)
    if (not bool(viewport.loading_active())) and (not bool(viewport._overlays.any_modal_open())) and (not bool(getattr(viewport, "_ai_settings_overlay_open", False))) and bool(getattr(viewport, "_application_active", True)):
      viewport._inp.set_mouse_capture(True)
      viewport.arm_resume_refresh()

  def force_close_if_open(self) -> None:
    if not self._open:
      return
    self._open = False
    self._screen.set_settings_open(False)
    self._screen.setVisible(False)

  def note_death(self, text: str) -> None:
    self._runtime.add_death_log(str(text))
    self._refresh()

  def layout(self, width: int, height: int) -> None:
    self._screen.setGeometry(0, 0, max(1, int(width)), max(1, int(height)))
    feed_width = int(max(int(_FEED_MIN_WIDTH_PX), int(round(float(width) * float(_FEED_WIDTH_FRACTION)))))
    feed_width = int(min(int(feed_width), max(1, int(width) - 2 * int(_FEED_LEFT_MARGIN_PX))))
    feed_height = int(self._feed.preferred_height(int(HUD_FEED_MESSAGE_LIMIT)))
    feed_bottom = int(height) - int(_hotbar_clearance_px())
    feed_top = int(max(int(_FEED_TOP_MARGIN_PX), int(feed_bottom) - int(feed_height)))
    self._feed.setGeometry(int(_FEED_LEFT_MARGIN_PX), int(feed_top), int(feed_width), int(feed_height))

  def sync_visibility(self) -> None:
    viewport = self._v
    mention_targets = self._local_mention_targets()
    self._screen.set_mention_targets(mention_targets)
    self._feed.set_mention_targets(mention_targets)
    self._screen.setVisible(bool(self._open))
    if bool(self._open):
      self._screen.raise_()
    eligible = bool(viewport._gameplay_hud_active()) and (not bool(viewport._debug_hud_active())) and (not bool(self._runtime.mute_all())) and (not bool(self._open))
    messages = self._runtime.recent_display_messages(int(HUD_FEED_MESSAGE_LIMIT))
    self._feed.set_messages(messages)
    self._feed.set_fade_enabled(bool(eligible) and len(messages) > 0)
    visible = bool(eligible) and len(messages) > 0 and self._feed.ready_for_display()
    self._feed.setVisible(bool(visible))
    if bool(visible):
      self._feed.raise_()

  def _refresh(self) -> None:
    mention_targets = self._local_mention_targets()
    self._screen.set_mention_targets(mention_targets)
    self._feed.set_mention_targets(mention_targets)
    self._screen.set_messages(self._runtime.display_messages())
    self.sync_visibility()

  def _on_input_changed(self, text: str) -> None:
    source = str(text)
    self._screen.set_candidate_key_routing_enabled(True)
    mention_span = self._mention_token_span(source, self._screen.cursor_position())
    if mention_span is not None:
      start, _end = mention_span
      cursor = max(0, min(len(source), int(self._screen.cursor_position())))
      prefix = source[int(start) + 1 : int(cursor)]
      self._suggestion_mode = str(_SUGGESTION_MENTION)
      self._screen.set_candidate_enter_activation(True)
      self._screen.set_candidates(self._mention_candidates(prefix))
      self._screen.show_candidates(True)
    elif source.startswith("/"):
      self._suggestion_mode = str(_SUGGESTION_COMMAND)
      self._screen.set_candidate_enter_activation(False)
      self._screen.set_candidates(candidates_for_input(source))
      self._screen.show_candidates(True)
    else:
      self._suggestion_mode = ""
      self._screen.set_candidate_enter_activation(False)
      self._screen.show_candidates(False)

  def _on_input_edited(self) -> None:
    self._sent_history_recalled_dirty = bool(self._sent_history_index is not None)
    self._sent_history_index = None
    self._sent_history_draft = ""
    self._sent_history_recalled_text = ""

  def _on_candidate_activated(self, candidate: str) -> None:
    selected = str(candidate)
    if not selected:
      return
    if self._suggestion_mode == _SUGGESTION_MENTION:
      text = self._screen.input_text()
      cursor = self._screen.cursor_position()
      span = self._mention_token_span(text, cursor)
      if span is None:
        return
      start, end = span
      suffix = "" if int(end) < len(text) and not text[int(end)].isspace() else " "
      next_text = f"{text[: int(start)]}@{selected}{suffix}{text[int(end) :]}"
      self._screen.set_input_text(next_text, cursor_position=int(start) + len(selected) + 1 + len(suffix))
      self._screen.show_candidates(False)
      self._screen.set_candidate_enter_activation(False)
      self._suggestion_mode = ""
      return
    if self._suggestion_mode == _SUGGESTION_COMMAND:
      self._screen.set_input_text(selected)
      self._screen.show_candidates(False)
      self._screen.set_candidate_enter_activation(False)
      self._suggestion_mode = ""

  @staticmethod
  def _mention_token_span(text: str, cursor_position: int) -> tuple[int, int] | None:
    source = str(text)
    cursor = max(0, min(len(source), int(cursor_position)))
    start = cursor
    while start > 0 and not source[int(start) - 1].isspace():
      start -= 1
    end = cursor
    while end < len(source) and not source[int(end)].isspace():
      end += 1
    token = source[int(start) : int(end)]
    if not token.startswith("@"):
      return None
    if int(start) > 0 and not source[int(start) - 1].isspace():
      return None
    if len(token) >= 2 and any(ch in token[1:] for ch in ("/", "\\")):
      return None
    return (int(start), int(end))

  def _local_mention_targets(self) -> tuple[str, ...]:
    name = str(self._v._state.resolved_player_name).strip() or "Player"
    return (name,)

  def _mention_candidates(self, prefix: str) -> tuple[str, ...]:
    entries: list[str] = []
    player_name = str(self._v._state.resolved_player_name).strip() or "Player"
    if player_name:
      entries.append(str(player_name))
    for snapshot in tuple(self._v._session.ai_render_snapshots()):
      if float(getattr(snapshot, "health", 0.0)) <= 1e-6:
        continue
      name = str(getattr(snapshot, "name", "")).strip()
      if name:
        entries.append(str(name))
    counts: dict[str, int] = {}
    for name in entries:
      key = str(name).casefold()
      counts[key] = int(counts.get(key, 0)) + 1
    needle = str(prefix).casefold()
    out: list[str] = []
    seen: set[str] = set()
    for name in entries:
      key = str(name).casefold()
      if int(counts.get(key, 0)) != 1 or key in seen:
        continue
      if needle and not key.startswith(needle):
        continue
      out.append(str(name))
      seen.add(key)
    return tuple(out[:8])

  def _on_submit(self, text: str) -> None:
    body = str(text).strip()
    if not body:
      self._screen.clear_input()
      return
    self._runtime.record_sent_input(body)
    self._reset_sent_history_navigation()
    if body.startswith("/"):
      result = execute_command(body, prefs=self._v._state, sessions=self._v._sessions)
      self._runtime.extend(result.messages)
      self._apply_effects(result.effects)
    else:
      sender = str(self._v._state.resolved_player_name).strip() or "Player"
      self._runtime.add_player_message(sender=sender, body=body)
    self._screen.clear_input()
    self._screen.show_candidates(False)
    self._refresh()

  def _on_sent_history_requested(self, direction: int) -> None:
    items = self._runtime.sent_inputs()
    if not items:
      return
    step = -1 if int(direction) < 0 else 1
    if step < 0:
      if not self._sent_history_recall_clean():
        self._sent_history_draft = self._screen.input_text()
        self._sent_history_index = len(items) - 1
      else:
        self._sent_history_index = max(0, int(self._sent_history_index) - 1)
      self._set_recalled_input_text(items[int(self._sent_history_index)])
      return
    if self._sent_history_index is None:
      return
    if int(self._sent_history_index) < len(items) - 1:
      self._sent_history_index = int(self._sent_history_index) + 1
      self._set_recalled_input_text(items[int(self._sent_history_index)])
      return
    self._reset_sent_history_navigation(restore_draft=True)

  def _sent_history_recall_clean(self) -> bool:
    if self._sent_history_index is None:
      return False
    return (not bool(self._sent_history_recalled_dirty)) and str(self._sent_history_recalled_text) == str(self._screen.input_text())

  def _set_recalled_input_text(self, text: str) -> None:
    value = str(text)
    self._sent_history_recalled_text = str(value)
    self._sent_history_recalled_dirty = False
    self._suggestion_mode = ""
    self._screen.set_candidate_enter_activation(False)
    self._screen.set_candidate_key_routing_enabled(False)
    self._screen.show_candidates(False)
    self._screen.set_input_text(value)

  def _reset_sent_history_navigation(self, *, restore_draft: bool = False) -> None:
    draft = str(self._sent_history_draft)
    self._sent_history_index = None
    self._sent_history_draft = ""
    self._sent_history_recalled_text = ""
    self._sent_history_recalled_dirty = False
    self._screen.set_candidate_key_routing_enabled(True)
    if restore_draft:
      self._screen.set_input_text(draft)
      self._on_input_changed(draft)

  def _apply_effects(self, effects) -> None:
    viewport = self._v
    if bool(effects.game_mode_changed):
      settings_controller.sync_hotbar_widgets(viewport)
      settings_controller.sync_first_person_target(viewport)
      settings_controller.sync_settings_values(viewport)
    if bool(effects.teleported):
      viewport._invalidate_selection_target()
      viewport._renderer.clear_selection()
      if bool(effects.chunk_for_blocks):
        viewport._arm_world_change_sync()
      viewport.arm_resume_refresh()
    viewport.update()

  def _on_settings_requested(self) -> None:
    if self._screen.settings_open():
      self._screen.set_settings_open(False)
    else:
      self._screen.set_settings_open(True, mute=bool(self._runtime.mute_all()))

  def _on_settings_close(self) -> None:
    self._screen.set_settings_open(False)

  def _on_mute_changed(self, value: bool) -> None:
    self._runtime.set_mute_all(bool(value))
    self._refresh()

  def _on_link_activated(self, url: str) -> None:
    QDesktopServices.openUrl(QUrl(str(url)))

  def _on_support_tick(self) -> None:
    self._runtime.add_support_message()
    self._refresh()


def bind_chat(viewport: "RendererViewportWidget") -> None:
  viewport._chat = ChatController(viewport)


def _ai_death_actor_name(event) -> str:
  return str(getattr(event, "actor_name", "")).strip() or "AI"


def _ai_death_reason(event) -> str:
  return str(getattr(event, "reason", "")).strip().casefold()


def ai_death_message(event, *, killer_name: str | None = None) -> str:
  actor_name = _ai_death_actor_name(event)
  reason = _ai_death_reason(event)
  if reason == "fall":
    return f"{actor_name} died from falling."
  if reason == "void":
    return f"{actor_name} fell into the void."
  if reason == "pvp":
    resolved_killer = str(killer_name if killer_name is not None else getattr(event, "killer_name", "")).strip()
    if resolved_killer:
      return f"{actor_name} was killed by {resolved_killer}."
  return f"{actor_name} died."


def note_ai_death(viewport, event, *, killer_name: str | None = None) -> None:
  note_death(viewport, ai_death_message(event, killer_name=killer_name))


def _controller(viewport) -> ChatController | None:
  return getattr(viewport, "_chat", None)


def is_chat_open(viewport) -> bool:
  controller = _controller(viewport)
  return bool(controller.is_open()) if controller is not None else False


def open_chat(viewport) -> None:
  controller = _controller(viewport)
  if controller is not None:
    controller.open()


def close_chat(viewport) -> None:
  controller = _controller(viewport)
  if controller is not None:
    controller.close()


def force_close_if_open(viewport) -> None:
  controller = _controller(viewport)
  if controller is not None:
    controller.force_close_if_open()


def note_death(viewport, text: str) -> None:
  controller = _controller(viewport)
  if controller is not None:
    controller.note_death(str(text))


def layout_chat(viewport, width: int, height: int) -> None:
  controller = _controller(viewport)
  if controller is not None:
    controller.layout(int(width), int(height))


def sync_visibility(viewport) -> None:
  controller = _controller(viewport)
  if controller is not None:
    controller.sync_visibility()
