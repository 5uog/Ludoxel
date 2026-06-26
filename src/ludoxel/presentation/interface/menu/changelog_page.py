# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import html
import re
from pathlib import Path

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QScrollArea, QVBoxLayout, QWidget

from ludoxel.presentation.interface.common.screen_title_bar import ScreenTitleBar
from ludoxel.presentation.interface.menu.changelog_data import ChangelogEntry, load_changelog_entries

_INLINE_CODE_PATTERN = re.compile(r"`([^`]+)`")


def _rich_inline_text(text: str) -> str:
  escaped = html.escape(str(text))
  return _INLINE_CODE_PATTERN.sub(lambda match: f"<code>{match.group(1)}</code>", escaped)


class ChangelogPage(QWidget):
  back_requested = pyqtSignal()

  def __init__(self, *, resource_root: Path, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._resource_root = Path(resource_root)
    self.setObjectName("changelogPage")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)

    self._title_bar = ScreenTitleBar("Changelog", parent=self)
    self._title_bar.back_requested.connect(self.back_requested.emit)
    root.addWidget(self._title_bar)

    self._scroll = QScrollArea(self)
    self._scroll.setObjectName("changelogScroll")
    self._scroll.setFrameShape(QFrame.Shape.NoFrame)
    self._scroll.setWidgetResizable(True)
    self._scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
    self._scroll.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
    self._content = QWidget(self._scroll)
    self._content.setObjectName("changelogContent")
    self._content_layout = QVBoxLayout(self._content)
    self._content_layout.setContentsMargins(36, 28, 36, 36)
    self._content_layout.setSpacing(20)
    self._scroll.setWidget(self._content)
    root.addWidget(self._scroll, stretch=1)

    self._loaded = False

  def ensure_loaded(self) -> None:
    if self._loaded:
      return
    self._loaded = True
    entries = load_changelog_entries(self._resource_root)
    if not entries:
      empty = QLabel("No changelog is available.", self._content)
      empty.setObjectName("changelogEmpty")
      empty.setAlignment(Qt.AlignmentFlag.AlignCenter)
      self._content_layout.addWidget(empty)
      self._content_layout.addStretch(1)
      return
    for entry in entries:
      self._content_layout.addWidget(self._build_entry(entry))
    self._content_layout.addStretch(1)

  def focus_scroll(self) -> None:
    self._scroll.setFocus(Qt.FocusReason.OtherFocusReason)
    self._scroll.verticalScrollBar().setValue(0)

  def _build_entry(self, entry: ChangelogEntry) -> QWidget:
    card = QFrame(self._content)
    card.setObjectName("changelogEntry")
    card.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    layout = QVBoxLayout(card)
    layout.setContentsMargins(20, 16, 20, 18)
    layout.setSpacing(10)

    header = QHBoxLayout()
    header.setContentsMargins(0, 0, 0, 0)
    header.setSpacing(8)
    date_label = QLabel(str(entry.date), card)
    date_label.setObjectName("changelogDate")
    header.addWidget(date_label)
    header.addStretch(1)
    for tag in entry.tags:
      tag_label = QLabel(str(tag), card)
      tag_label.setObjectName("changelogTag")
      tag_label.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
      header.addWidget(tag_label)
    layout.addLayout(header)

    for section in entry.sections:
      section_title = QLabel(str(section.title), card)
      section_title.setObjectName("changelogSectionTitle")
      section_title.setWordWrap(True)
      layout.addWidget(section_title)
      for item in section.items:
        item_label = QLabel(card)
        item_label.setObjectName("changelogItem")
        item_label.setTextFormat(Qt.TextFormat.RichText)
        item_label.setText(f"<span>•&nbsp;&nbsp;{_rich_inline_text(item)}</span>")
        item_label.setWordWrap(True)
        layout.addWidget(item_label)
    return card


__all__ = ["ChangelogPage"]
