# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

CHAT_KIND_PLAYER_TEXT: str = "player_text"
CHAT_KIND_RECEIVED_TEXT: str = "received_text"
CHAT_KIND_AI_TEXT: str = "ai_text"
CHAT_KIND_DEATH_LOG: str = "death_log"
CHAT_KIND_SUPPORT: str = "support"
CHAT_KIND_COMMAND_FEEDBACK: str = "command_feedback"
CHAT_KIND_COMMAND_ERROR: str = "command_error"
CHAT_KIND_COMMAND_CANDIDATE: str = "command_candidate"

NAMED_MESSAGE_KINDS: frozenset[str] = frozenset({CHAT_KIND_PLAYER_TEXT, CHAT_KIND_RECEIVED_TEXT, CHAT_KIND_AI_TEXT})


@dataclass(frozen=True, slots=True)
class ChatLink:
  label: str
  url: str


@dataclass(frozen=True, slots=True)
class ChatMessage:
  kind: str
  text: str
  sender: str = ""
  links: tuple[ChatLink, ...] = field(default_factory=tuple)


def named_message_text(sender: str, body: str) -> str:
  return f"§7{str(sender)} §l>> §r§f{str(body)}"


def make_named_message(*, kind: str, sender: str, body: str) -> ChatMessage:
  return ChatMessage(kind=str(kind), text=named_message_text(sender=str(sender), body=str(body)), sender=str(sender))


def make_player_message(*, sender: str, body: str) -> ChatMessage:
  return make_named_message(kind=CHAT_KIND_PLAYER_TEXT, sender=str(sender), body=str(body))


def make_death_log_message(text: str) -> ChatMessage:
  return ChatMessage(kind=CHAT_KIND_DEATH_LOG, text=str(text))


def make_command_feedback_message(text: str) -> ChatMessage:
  return ChatMessage(kind=CHAT_KIND_COMMAND_FEEDBACK, text=str(text))


def make_command_error_message(text: str) -> ChatMessage:
  return ChatMessage(kind=CHAT_KIND_COMMAND_ERROR, text=str(text))
