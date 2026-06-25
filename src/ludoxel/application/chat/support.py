# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.application.chat.messages import CHAT_KIND_SUPPORT, ChatLink, ChatMessage

SUPPORT_INTERVAL_S: float = 600.0
SUPPORT_MESSAGE_TEXT: str = "§6[§e!§6] §7Support the creator: 5uog"
SUPPORT_LINK_LABEL: str = "5uog"
SUPPORT_LINK_URL: str = "https://github.com/5uog/"


def make_support_message() -> ChatMessage:
  return ChatMessage(kind=CHAT_KIND_SUPPORT, text=SUPPORT_MESSAGE_TEXT, links=(ChatLink(label=SUPPORT_LINK_LABEL, url=SUPPORT_LINK_URL),))
