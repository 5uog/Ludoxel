# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections import deque

from ludoxel.application.chat.messages import CHAT_KIND_COMMAND_CANDIDATE, ChatMessage

CHAT_HISTORY_CAP: int = 100


class ChatHistory:
  def __init__(self, *, cap: int = CHAT_HISTORY_CAP) -> None:
    self._cap = max(1, int(cap))
    self._messages: deque[ChatMessage] = deque(maxlen=self._cap)

  def append(self, message: ChatMessage) -> None:
    self._messages.append(message)

  def clear(self) -> None:
    self._messages.clear()

  def messages(self) -> tuple[ChatMessage, ...]:
    return tuple(self._messages)

  def display_messages(self) -> tuple[ChatMessage, ...]:
    return tuple(message for message in self._messages if str(message.kind) != CHAT_KIND_COMMAND_CANDIDATE)

  def recent_display_messages(self, count: int) -> tuple[ChatMessage, ...]:
    limit = max(0, int(count))
    display = self.display_messages()
    if limit <= 0:
      return ()
    return display[-limit:]


class SentInputHistory:
  def __init__(self, *, cap: int = CHAT_HISTORY_CAP) -> None:
    self._items: deque[str] = deque(maxlen=max(1, int(cap)))

  def append(self, text: str) -> None:
    value = str(text)
    if value:
      self._items.append(value)

  def items(self) -> tuple[str, ...]:
    return tuple(self._items)
