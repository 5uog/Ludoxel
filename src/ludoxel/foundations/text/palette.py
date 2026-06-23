# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

FORMAT_DEFAULT_FOREGROUND: str = "#FFFFFF"
FORMAT_DEFAULT_BACKGROUND: str | None = None


@dataclass(frozen=True, slots=True)
class FormatColor:
  foreground: str
  background: str


FORMAT_COLOR_TABLE: dict[str, FormatColor] = {
  "0": FormatColor(foreground="#000000", background="#000000"),
  "1": FormatColor(foreground="#0000AA", background="#00002A"),
  "2": FormatColor(foreground="#00AA00", background="#002A00"),
  "3": FormatColor(foreground="#00AAAA", background="#002A2A"),
  "4": FormatColor(foreground="#AA0000", background="#2A0000"),
  "5": FormatColor(foreground="#AA00AA", background="#2A002A"),
  "6": FormatColor(foreground="#FFAA00", background="#2A2A00"),
  "7": FormatColor(foreground="#AAAAAA", background="#2A2A2A"),
  "8": FormatColor(foreground="#555555", background="#151515"),
  "9": FormatColor(foreground="#5555FF", background="#15153F"),
  "a": FormatColor(foreground="#55FF55", background="#153F15"),
  "b": FormatColor(foreground="#55FFFF", background="#153F3F"),
  "c": FormatColor(foreground="#FF5555", background="#3F1515"),
  "d": FormatColor(foreground="#FF55FF", background="#3F153F"),
  "e": FormatColor(foreground="#FFFF55", background="#3F3F15"),
  "f": FormatColor(foreground="#FFFFFF", background="#3F3F3F"),
  "w": FormatColor(foreground="#8BB3FF", background="#232D40"),
  "g": FormatColor(foreground="#DDD605", background="#373501"),
  "h": FormatColor(foreground="#E3D4D1", background="#383534"),
  "i": FormatColor(foreground="#CECACA", background="#333232"),
  "j": FormatColor(foreground="#443A3B", background="#110E0E"),
  "p": FormatColor(foreground="#DEB12D", background="#372C0B"),
  "q": FormatColor(foreground="#47A036", background="#04280D"),
  "s": FormatColor(foreground="#2CBAA8", background="#0B2E2A"),
  "t": FormatColor(foreground="#21497B", background="#08121E"),
  "u": FormatColor(foreground="#9A5CC6", background="#261731"),
  "v": FormatColor(foreground="#EB7114", background="#3B1D05"),
}


def color_for_code(code: str) -> FormatColor | None:
  return FORMAT_COLOR_TABLE.get(str(code).lower())


def is_color_code(code: str) -> bool:
  return str(code).lower() in FORMAT_COLOR_TABLE
