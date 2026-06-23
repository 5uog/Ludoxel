# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from random import Random

from PyQt6.QtCore import QRect, Qt, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QFontMetrics, QPainter
from PyQt6.QtWidgets import QWidget

from ludoxel.application.chat.messages import ChatMessage
from ludoxel.foundations.text.format_codes import FormattedSegment, parse_formatted_text
from ludoxel.foundations.text.obfuscation import obfuscated_char_for

_HORIZONTAL_PADDING_PX = 10
_VERTICAL_PADDING_PX = 8
_LINE_LEADING_PX = 3
_OBFUSCATION_INTERVAL_MS = 70


@dataclass(slots=True)
class _Glyph:
  ch: str
  advance: int
  fg: QColor
  bg: QColor | None
  font_index: int
  underline: bool
  strikethrough: bool
  obfuscated: bool
  link_url: str | None


@dataclass(slots=True)
class _StyledChar:
  ch: str
  segment: FormattedSegment
  link_url: str | None = None


@dataclass(slots=True)
class _Layout:
  lines: list[list[_Glyph]] = field(default_factory=list)
  line_height: int = 0
  ascent: int = 0


def _font_index(segment: FormattedSegment) -> int:
  return (1 if segment.bold else 0) | (2 if segment.italic else 0)


def _styled_chars(message: ChatMessage) -> list[_StyledChar]:
  segments = parse_formatted_text(message.text)
  chars: list[_StyledChar] = []
  for segment in segments:
    for ch in segment.text:
      chars.append(_StyledChar(ch=ch, segment=segment))
  if message.links:
    plain = "".join(item.ch for item in chars)
    for link in message.links:
      label = str(link.label)
      if not label:
        continue
      start = plain.find(label)
      if start < 0:
        continue
      for index in range(start, start + len(label)):
        chars[index].link_url = str(link.url)
  return chars


class ChatTextView(QWidget):
  link_activated = pyqtSignal(str)

  def __init__(self, parent: QWidget | None = None, *, object_name: str, interactive: bool = False, bottom_anchored: bool = False) -> None:
    super().__init__(parent)
    self.setObjectName(str(object_name))
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self._interactive = bool(interactive)
    self._bottom_anchored = bool(bottom_anchored)
    if not self._interactive:
      self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    else:
      self.setMouseTracking(True)
    self._messages: tuple[ChatMessage, ...] = ()
    self._rng = Random()
    self._layout: _Layout | None = None
    self._layout_width: int = -1
    self._link_rects: list[tuple[QRect, str]] = []
    self._has_obfuscation = False

    from PyQt6.QtCore import QTimer

    self._obfuscation_timer = QTimer(self)
    self._obfuscation_timer.setInterval(int(_OBFUSCATION_INTERVAL_MS))
    self._obfuscation_timer.timeout.connect(self.update)

  def set_messages(self, messages: tuple[ChatMessage, ...]) -> None:
    self._messages = tuple(messages)
    self._layout = None
    self._layout_width = -1
    self.updateGeometry()
    self.update()

  def _fonts(self) -> list[QFont]:
    base = QFont(self.font())
    fonts: list[QFont] = []
    for index in range(4):
      font = QFont(base)
      font.setBold(bool(index & 1))
      font.setItalic(bool(index & 2))
      fonts.append(font)
    return fonts

  def _build_layout(self, width: int) -> _Layout:
    fonts = self._fonts()
    metrics = [QFontMetrics(font) for font in fonts]
    base_metrics = QFontMetrics(QFont(self.font()))
    line_height = int(base_metrics.height()) + int(_LINE_LEADING_PX)
    ascent = int(base_metrics.ascent())
    available = max(1, int(width) - 2 * int(_HORIZONTAL_PADDING_PX))

    has_obfuscation = False
    lines: list[list[_Glyph]] = []
    for message in self._messages:
      styled = _styled_chars(message)
      current: list[_Glyph] = []
      current_width = 0
      last_space_index = -1
      for item in styled:
        segment = item.segment
        font_index = _font_index(segment)
        advance = int(metrics[font_index].horizontalAdvance(item.ch))
        glyph = _Glyph(
          ch=item.ch,
          advance=int(advance),
          fg=QColor(segment.foreground),
          bg=None if segment.background is None else QColor(segment.background),
          font_index=int(font_index),
          underline=bool(segment.underline) or (item.link_url is not None),
          strikethrough=bool(segment.strikethrough),
          obfuscated=bool(segment.obfuscated),
          link_url=item.link_url,
        )
        if bool(segment.obfuscated):
          has_obfuscation = True
        if current and current_width + advance > available:
          if 0 <= last_space_index < len(current) - 1:
            head = current[: last_space_index + 1]
            tail = current[last_space_index + 1 :]
            lines.append(head)
            current = tail
            current_width = sum(int(piece.advance) for piece in current)
          else:
            lines.append(current)
            current = []
            current_width = 0
          last_space_index = -1
        current.append(glyph)
        current_width += advance
        if item.ch == " ":
          last_space_index = len(current) - 1
      lines.append(current)

    self._has_obfuscation = bool(has_obfuscation)
    return _Layout(lines=lines, line_height=int(line_height), ascent=int(ascent))

  def _ensure_layout(self) -> _Layout:
    width = int(self.width())
    if self._layout is None or int(self._layout_width) != int(width):
      self._layout = self._build_layout(width)
      self._layout_width = int(width)
      self._sync_obfuscation_timer()
    return self._layout

  def _sync_obfuscation_timer(self) -> None:
    should_run = bool(self._has_obfuscation) and bool(self.isVisible())
    if should_run and not self._obfuscation_timer.isActive():
      self._obfuscation_timer.start()
    elif (not should_run) and self._obfuscation_timer.isActive():
      self._obfuscation_timer.stop()

  def content_height(self) -> int:
    layout = self._ensure_layout()
    return int(len(layout.lines) * layout.line_height) + 2 * int(_VERTICAL_PADDING_PX)

  def sizeHint(self):
    from PyQt6.QtCore import QSize

    return QSize(max(1, int(self.width())), 1)

  def minimumSizeHint(self):
    from PyQt6.QtCore import QSize

    return QSize(1, 1)

  def showEvent(self, e) -> None:
    super().showEvent(e)
    self._sync_obfuscation_timer()

  def hideEvent(self, e) -> None:
    super().hideEvent(e)
    self._obfuscation_timer.stop()

  def resizeEvent(self, e) -> None:
    super().resizeEvent(e)
    self._layout = None
    self._layout_width = -1
    self.updateGeometry()

  def paintEvent(self, e) -> None:
    del e
    layout = self._ensure_layout()
    self._link_rects = []
    if not layout.lines:
      return

    painter = QPainter(self)
    painter.setRenderHint(QPainter.RenderHint.TextAntialiasing, True)
    fonts = self._fonts()

    total_height = int(len(layout.lines) * layout.line_height)
    if self._bottom_anchored:
      visible_count = max(0, int((int(self.height()) - 2 * int(_VERTICAL_PADDING_PX)) // max(1, layout.line_height)))
      lines = layout.lines[-visible_count:] if visible_count > 0 else []
      start_y = int(self.height()) - int(_VERTICAL_PADDING_PX) - int(len(lines) * layout.line_height)
    else:
      lines = layout.lines
      start_y = int(_VERTICAL_PADDING_PX)
      del total_height

    y = int(start_y)
    for line in lines:
      x = int(_HORIZONTAL_PADDING_PX)
      baseline = int(y) + int(layout.ascent)
      for glyph in line:
        advance = int(glyph.advance)
        if glyph.bg is not None:
          painter.fillRect(QRect(int(x), int(y), int(advance), int(layout.line_height)), glyph.bg)
        draw_char = glyph.ch
        if glyph.obfuscated and not glyph.ch.isspace():
          draw_char = obfuscated_char_for(glyph.ch, self._rng)
        font = fonts[int(glyph.font_index)]
        font.setUnderline(bool(glyph.underline))
        font.setStrikeOut(bool(glyph.strikethrough))
        painter.setFont(font)
        painter.setPen(glyph.fg)
        if draw_char.strip():
          painter.drawText(int(x), int(baseline), draw_char)
        if glyph.link_url is not None and self._interactive:
          self._link_rects.append((QRect(int(x), int(y), int(advance), int(layout.line_height)), str(glyph.link_url)))
        x += advance
      y += int(layout.line_height)
    painter.end()

  def _link_at(self, pos) -> str | None:
    for rect, url in self._link_rects:
      if rect.contains(pos):
        return str(url)
    return None

  def mouseMoveEvent(self, e) -> None:
    if self._interactive:
      url = self._link_at(e.position().toPoint())
      self.setCursor(Qt.CursorShape.PointingHandCursor if url is not None else Qt.CursorShape.ArrowCursor)
    super().mouseMoveEvent(e)

  def mousePressEvent(self, e) -> None:
    if self._interactive and e.button() == Qt.MouseButton.LeftButton:
      url = self._link_at(e.position().toPoint())
      if url is not None:
        self.link_activated.emit(str(url))
        e.accept()
        return
    super().mousePressEvent(e)
