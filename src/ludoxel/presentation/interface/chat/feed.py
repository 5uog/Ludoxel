# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont, QFontMetrics
from PyQt6.QtWidgets import QFrame, QVBoxLayout, QWidget

from ludoxel.application.chat.messages import ChatMessage
from ludoxel.presentation.interface.chat.text_view import ChatTextView

HUD_FEED_MESSAGE_LIMIT: int = 10
_FEED_PADDING_PX = 6


class ChatFeedWidget(QFrame):
  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("chatFeedRoot")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self.setFocusPolicy(Qt.FocusPolicy.NoFocus)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(int(_FEED_PADDING_PX), int(_FEED_PADDING_PX), int(_FEED_PADDING_PX), int(_FEED_PADDING_PX))
    layout.setSpacing(0)

    self._text = ChatTextView(self, object_name="chatFeedText", interactive=False, bottom_anchored=True)
    layout.addWidget(self._text)

  def set_messages(self, messages: tuple[ChatMessage, ...]) -> None:
    self._text.set_messages(tuple(messages))

  def preferred_height(self, rows: int = HUD_FEED_MESSAGE_LIMIT) -> int:
    metrics = QFontMetrics(QFont(self._text.font()))
    line_height = int(metrics.height()) + 3
    return int(max(1, int(rows)) * line_height) + 4 * int(_FEED_PADDING_PX)
