# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.text.palette import FORMAT_DEFAULT_BACKGROUND, FORMAT_DEFAULT_FOREGROUND, color_for_code, is_color_code

SECTION_SIGN: str = "§"

FLAG_OBFUSCATED: str = "k"
FLAG_BOLD: str = "l"
FLAG_STRIKETHROUGH: str = "m"
FLAG_UNDERLINE: str = "n"
FLAG_ITALIC: str = "o"
FLAG_RESET: str = "r"

_FLAG_CODES: frozenset[str] = frozenset({FLAG_OBFUSCATED, FLAG_BOLD, FLAG_STRIKETHROUGH, FLAG_UNDERLINE, FLAG_ITALIC, FLAG_RESET})


@dataclass(frozen=True, slots=True)
class FormattedSegment:
  text: str
  foreground: str
  background: str | None
  bold: bool
  italic: bool
  underline: bool
  strikethrough: bool
  obfuscated: bool


@dataclass(slots=True)
class _FormatState:
  foreground: str = FORMAT_DEFAULT_FOREGROUND
  background: str | None = FORMAT_DEFAULT_BACKGROUND
  bold: bool = False
  italic: bool = False
  underline: bool = False
  strikethrough: bool = False
  obfuscated: bool = False

  def reset_flags(self) -> None:
    self.bold = False
    self.italic = False
    self.underline = False
    self.strikethrough = False
    self.obfuscated = False

  def emit(self, text: str) -> FormattedSegment:
    return FormattedSegment(text=str(text), foreground=str(self.foreground), background=None if self.background is None else str(self.background), bold=bool(self.bold), italic=bool(self.italic), underline=bool(self.underline), strikethrough=bool(self.strikethrough), obfuscated=bool(self.obfuscated))


def _apply_code(state: _FormatState, code: str) -> None:
  lowered = str(code).lower()
  if is_color_code(lowered):
    color = color_for_code(lowered)
    if color is not None:
      state.foreground = str(color.foreground)
      state.background = str(color.background)
    return
  if lowered == FLAG_RESET:
    state.reset_flags()
    return
  if lowered == FLAG_OBFUSCATED:
    state.obfuscated = True
  elif lowered == FLAG_BOLD:
    state.bold = True
  elif lowered == FLAG_STRIKETHROUGH:
    state.strikethrough = True
  elif lowered == FLAG_UNDERLINE:
    state.underline = True
  elif lowered == FLAG_ITALIC:
    state.italic = True


def _is_format_code(code: str) -> bool:
  return is_color_code(code) or str(code).lower() in _FLAG_CODES


def parse_formatted_text(text: str) -> tuple[FormattedSegment, ...]:
  source = str(text)
  state = _FormatState()
  segments: list[FormattedSegment] = []
  buffer: list[str] = []

  index = 0
  length = len(source)
  while index < length:
    char = source[index]
    if char == SECTION_SIGN and index + 1 < length and _is_format_code(source[index + 1]):
      if buffer:
        segments.append(state.emit("".join(buffer)))
        buffer = []
      _apply_code(state, source[index + 1])
      index += 2
      continue
    buffer.append(char)
    index += 1

  if buffer:
    segments.append(state.emit("".join(buffer)))
  return tuple(segments)


def strip_formatting(text: str) -> str:
  return "".join(segment.text for segment in parse_formatted_text(text))
