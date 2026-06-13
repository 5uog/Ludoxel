# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import re
from collections.abc import Iterable
from pathlib import Path

from PyQt6.QtCore import QPoint, QRect, QSize, Qt
from PyQt6.QtWidgets import QFrame, QLabel, QLayout, QLayoutItem, QSizePolicy, QWidget

from ludoxel.presentation.documentation.about.content import GITHUB_IMAGE_CANDIDATE_NAMES, PROFILE_IMAGE_CANDIDATE_NAMES
from ludoxel.presentation.documentation.about.model import AboutRun


class _AboutWrappingLabel(QLabel):
  def hasHeightForWidth(self) -> bool:
    return True

  def resizeEvent(self, event) -> None:
    super().resizeEvent(event)
    self.updateGeometry()


class _AboutFlowLayout(QLayout):
  def __init__(self, parent: QWidget | None = None, *, margin: int = 0, spacing: int = 8) -> None:
    super().__init__(parent)
    self._items: list[QLayoutItem] = []
    self.setContentsMargins(int(margin), int(margin), int(margin), int(margin))
    self.setSpacing(int(spacing))

  def __del__(self) -> None:
    while self.count():
      self.takeAt(0)

  def addItem(self, item: QLayoutItem) -> None:
    self._items.append(item)

  def count(self) -> int:
    return len(self._items)

  def itemAt(self, index: int) -> QLayoutItem | None:
    if 0 <= int(index) < len(self._items):
      return self._items[int(index)]
    return None

  def takeAt(self, index: int) -> QLayoutItem | None:
    if 0 <= int(index) < len(self._items):
      return self._items.pop(int(index))
    return None

  def expandingDirections(self) -> Qt.Orientation:
    return Qt.Orientation(0)

  def hasHeightForWidth(self) -> bool:
    return True

  def heightForWidth(self, width: int) -> int:
    return self._do_layout(QRect(0, 0, int(width), 0), test_only=True)

  def setGeometry(self, rect: QRect) -> None:
    super().setGeometry(rect)
    self._do_layout(rect, test_only=False)

  def sizeHint(self) -> QSize:
    return self.minimumSize()

  def minimumSize(self) -> QSize:
    size = QSize()
    for item in self._items:
      size = size.expandedTo(item.minimumSize())
    margins = self.contentsMargins()
    size += QSize(margins.left() + margins.right(), margins.top() + margins.bottom())
    return size

  def _do_layout(self, rect: QRect, *, test_only: bool) -> int:
    margins = self.contentsMargins()
    effective_rect = rect.adjusted(margins.left(), margins.top(), -margins.right(), -margins.bottom())
    x = int(effective_rect.x())
    y = int(effective_rect.y())
    line_height = 0
    spacing = int(max(0, self.spacing()))

    for item in self._items:
      item_size = item.sizeHint()
      item_width = int(item_size.width())
      item_height = int(item_size.height())
      next_x = x + item_width + spacing
      if next_x - spacing > effective_rect.right() and line_height > 0:
        x = int(effective_rect.x())
        y += line_height + spacing
        next_x = x + item_width + spacing
        line_height = 0

      if not test_only:
        item.setGeometry(QRect(QPoint(x, y), item_size))

      x = next_x
      line_height = max(line_height, item_height)

    return y + line_height - int(rect.y()) + margins.bottom()


def _set_about_label_policy(label: QLabel) -> QLabel:
  label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return label


def _first_existing_asset(resource_root: Path | None, relative_dir: str, candidate_names: tuple[str, ...]) -> Path | None:
  if resource_root is None:
    return None
  base = Path(resource_root) / relative_dir
  for name in tuple(candidate_names):
    candidate = base / str(name)
    if candidate.is_file():
      return candidate.resolve()
  return None


def profile_image_path(resource_root: Path | None) -> Path | None:
  return _first_existing_asset(resource_root, "assets/ui/about", PROFILE_IMAGE_CANDIDATE_NAMES)


def github_image_path(resource_root: Path | None) -> Path | None:
  return _first_existing_asset(resource_root, "assets/ui/about", GITHUB_IMAGE_CANDIDATE_NAMES)


def about_card(parent: QWidget, object_name: str = "aboutCard") -> QFrame:
  card = QFrame(parent)
  card.setObjectName(str(object_name))
  card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return card


def about_text(parent: QWidget, text: str, object_name: str = "subtitle") -> QLabel:
  label = _AboutWrappingLabel(str(text), parent)
  label.setObjectName(str(object_name))
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse | Qt.TextInteractionFlag.LinksAccessibleByMouse)
  label.setWordWrap(True)
  return _set_about_label_policy(label)


def about_pill(parent: QWidget, text: str) -> QLabel:
  label = QLabel(str(text), parent)
  label.setObjectName("aboutPill")
  label.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  label.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Minimum)
  return label


def about_tag_flow(parent: QWidget, tags: Iterable[str]) -> QWidget:
  host = QWidget(parent)
  host.setObjectName("aboutTagFlow")
  host.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)

  layout = _AboutFlowLayout(host, margin=0, spacing=8)
  for tag in tuple(tags):
    text = str(tag).strip()
    if text:
      layout.addWidget(about_pill(host, text))
  return host


def about_meta_title(parent: QWidget, title: str) -> QLabel:
  label = QLabel(str(title), parent)
  label.setObjectName("aboutMetaTitle")
  label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignTop)
  label.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Minimum)
  return label


def about_meta_value(parent: QWidget, value: str) -> QLabel:
  label = _AboutWrappingLabel(str(value), parent)
  label.setObjectName("aboutMetaValue")
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse | Qt.TextInteractionFlag.LinksAccessibleByMouse)
  label.setWordWrap(True)
  label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return label


def about_code_block(parent: QWidget, text: str) -> QLabel:
  label = _AboutWrappingLabel(str(text).rstrip("\n"), parent)
  label.setObjectName("aboutCodeBlock")
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
  label.setTextFormat(Qt.TextFormat.PlainText)
  label.setWordWrap(True)
  label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return label


def _inline_text_tokens(text: str) -> tuple[str, ...]:
  tokens = tuple(re.findall(r"\S+\s*", str(text)))
  if tokens:
    return tokens
  return (str(text),) if str(text) else ()


def _inline_label(parent: QWidget, text: str, object_name: str) -> QLabel:
  label = QLabel(str(text), parent)
  label.setObjectName(str(object_name))
  label.setTextFormat(Qt.TextFormat.PlainText)
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse | Qt.TextInteractionFlag.LinksAccessibleByMouse)
  label.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Minimum)
  return label


def about_inline_paragraph(parent: QWidget, runs: tuple[AboutRun, ...], object_name: str = "subtitle") -> QWidget:
  host = QWidget(parent)
  host.setObjectName("aboutInlineParagraph")
  host.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)

  layout = _AboutFlowLayout(host, margin=0, spacing=0)
  for run in tuple(runs):
    if str(run.kind).strip().lower() == "code":
      layout.addWidget(_inline_label(host, run.text, "aboutInlineCode"))
      continue

    for token in _inline_text_tokens(str(run.text)):
      layout.addWidget(_inline_label(host, token, object_name))

  return host
