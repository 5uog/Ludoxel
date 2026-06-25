# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import QEasingCurve, QPropertyAnimation, Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QFont, QFontMetrics
from PyQt6.QtWidgets import QFrame, QGraphicsOpacityEffect, QVBoxLayout, QWidget

from ludoxel.application.chat.messages import ChatMessage
from ludoxel.presentation.interface.chat.text_view import ChatTextView

HUD_FEED_MESSAGE_LIMIT: int = 10
_FEED_PADDING_PX = 6
_FEED_IDLE_FADE_DELAY_MS = 30_000
_FEED_FADE_DURATION_MS = 3_000


class ChatFeedWidget(QFrame):
  fade_visibility_changed = pyqtSignal()

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("chatFeedRoot")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
    self._messages: tuple[ChatMessage, ...] = ()
    self._fade_enabled = False
    self._faded_out = False
    self._opacity = QGraphicsOpacityEffect(self)
    self._opacity.setOpacity(1.0)
    self.setGraphicsEffect(self._opacity)
    self._fade_delay = QTimer(self)
    self._fade_delay.setSingleShot(True)
    self._fade_delay.setInterval(int(_FEED_IDLE_FADE_DELAY_MS))
    self._fade_delay.timeout.connect(self._start_fade)
    self._fade = QPropertyAnimation(self._opacity, b"opacity", self)
    self._fade.setDuration(int(_FEED_FADE_DURATION_MS))
    self._fade.setStartValue(1.0)
    self._fade.setEndValue(0.0)
    self._fade.setEasingCurve(QEasingCurve.Type.InOutQuad)
    self._fade.finished.connect(self._finish_fade)

    layout = QVBoxLayout(self)
    layout.setContentsMargins(int(_FEED_PADDING_PX), int(_FEED_PADDING_PX), int(_FEED_PADDING_PX), int(_FEED_PADDING_PX))
    layout.setSpacing(0)

    self._text = ChatTextView(self, object_name="chatFeedText", interactive=False, bottom_anchored=True)
    layout.addWidget(self._text)

  def set_messages(self, messages: tuple[ChatMessage, ...]) -> None:
    normalized = tuple(messages)
    if normalized != self._messages:
      self._messages = normalized
      self._text.set_messages(normalized)
      self._reset_fade()

  def set_mention_targets(self, names: tuple[str, ...]) -> None:
    self._text.set_mention_targets(tuple(names))

  def set_fade_enabled(self, enabled: bool) -> None:
    requested = bool(enabled)
    if requested == self._fade_enabled:
      return
    self._fade_enabled = requested
    if self._fade_enabled and self._messages:
      self._reset_fade()
      return
    self._fade_delay.stop()
    self._fade.stop()
    self._faded_out = False
    self._opacity.setOpacity(1.0)
    self.fade_visibility_changed.emit()

  def ready_for_display(self) -> bool:
    return not bool(self._faded_out)

  def _reset_fade(self) -> None:
    self._fade_delay.stop()
    self._fade.stop()
    was_faded = bool(self._faded_out)
    self._faded_out = False
    self._opacity.setOpacity(1.0)
    if self._fade_enabled and self._messages:
      self._fade_delay.start()
    if was_faded:
      self.fade_visibility_changed.emit()

  def _start_fade(self) -> None:
    if not self._fade_enabled or not self._messages:
      return
    self._fade.start()

  def _finish_fade(self) -> None:
    if not self._fade_enabled or not self._messages:
      return
    self._faded_out = True
    self.fade_visibility_changed.emit()

  def preferred_height(self, rows: int = HUD_FEED_MESSAGE_LIMIT) -> int:
    metrics = QFontMetrics(QFont(self._text.font()))
    line_height = int(metrics.height()) + 3
    return int(max(1, int(rows)) * line_height) + 4 * int(_FEED_PADDING_PX)
