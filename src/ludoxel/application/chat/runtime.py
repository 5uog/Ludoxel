# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import Iterable

from ludoxel.application.chat.history import ChatHistory, SentInputHistory
from ludoxel.application.chat.messages import ChatMessage, make_death_log_message, make_player_message
from ludoxel.application.chat.settings import ChatRuntimeSettings
from ludoxel.application.chat.support import SUPPORT_INTERVAL_S, make_support_message


class ChatRuntime:
  def __init__(self) -> None:
    self._history = ChatHistory()
    self._sent_inputs = SentInputHistory()
    self._settings = ChatRuntimeSettings()

  def support_interval_s(self) -> float:
    return float(SUPPORT_INTERVAL_S)

  def mute_all(self) -> bool:
    return bool(self._settings.mute_all())

  def set_mute_all(self, value: bool) -> None:
    self._settings.set_mute_all(bool(value))

  def append(self, message: ChatMessage) -> None:
    self._history.append(message)

  def record_sent_input(self, text: str) -> None:
    self._sent_inputs.append(str(text))

  def sent_inputs(self) -> tuple[str, ...]:
    return self._sent_inputs.items()

  def extend(self, messages: Iterable[ChatMessage]) -> None:
    for message in messages:
      self._history.append(message)

  def add_player_message(self, *, sender: str, body: str) -> ChatMessage:
    message = make_player_message(sender=str(sender), body=str(body))
    self._history.append(message)
    return message

  def add_death_log(self, text: str) -> ChatMessage:
    message = make_death_log_message(str(text))
    self._history.append(message)
    return message

  def add_support_message(self) -> ChatMessage:
    message = make_support_message()
    self._history.append(message)
    return message

  def display_messages(self) -> tuple[ChatMessage, ...]:
    if self.mute_all():
      return ()
    return self._history.display_messages()

  def recent_display_messages(self, count: int) -> tuple[ChatMessage, ...]:
    if self.mute_all():
      return ()
    return self._history.recent_display_messages(int(count))
