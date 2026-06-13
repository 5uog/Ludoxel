# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import html
from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QFrame, QGridLayout, QLabel, QSizePolicy, QWidget

from ludoxel.presentation.documentation.about.content import GITHUB_IMAGE_CANDIDATE_NAMES, PROFILE_IMAGE_CANDIDATE_NAMES
from ludoxel.presentation.documentation.about.model import AboutRun


class _AboutWrappingLabel(QLabel):
  def hasHeightForWidth(self) -> bool:
    return True

  def resizeEvent(self, event) -> None:
    super().resizeEvent(event)
    self.updateGeometry()


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
  label.setWordWrap(True)
  return _set_about_label_policy(label)


def about_pill(parent: QWidget, text: str) -> QLabel:
  label = QLabel(str(text), parent)
  label.setObjectName("aboutPill")
  label.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  return label


def about_meta_row(layout: QGridLayout, row: int, title: str, value: str, parent: QWidget) -> None:
  title_label = QLabel(str(title), parent)
  title_label.setObjectName("aboutMetaTitle")
  title_label.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Minimum)
  value_label = _AboutWrappingLabel(str(value), parent)
  value_label.setObjectName("aboutMetaValue")
  value_label.setWordWrap(True)
  value_label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  layout.addWidget(title_label, int(row), 0, alignment=Qt.AlignmentFlag.AlignTop)
  layout.addWidget(value_label, int(row), 1)


def about_code_block(parent: QWidget, text: str) -> QLabel:
  label = _AboutWrappingLabel(str(text).rstrip("\n"), parent)
  label.setObjectName("aboutCodeBlock")
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
  label.setWordWrap(True)
  label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return label


def about_code_value(parent: QWidget, text: str) -> QLabel:
  """
  一行の独立 code value を code block と対応する visual design で描画する。
  selectable text と minimum height を保持し、paragraph の inline code とは別 widget として扱う。
  """
  label = QLabel(str(text).rstrip("\n"), parent)
  label.setObjectName("aboutCodeValue")
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
  label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return label


def about_inline_paragraph(parent: QWidget, runs: tuple[AboutRun, ...]) -> QLabel:
  """
  構造化済み text/code run を入力順に HTML escape し、一つの paragraph label として描画する。
  code span だけに code block 対応色、背景、padding を適用し、通常文の空白と句読点を変更しない。
  """
  fragments: list[str] = []
  has_code = False
  for run in tuple(runs):
    escaped = html.escape(str(run.text), quote=True)
    if str(run.kind).strip().lower() == "code":
      has_code = True
      fragments.append(f'<span style="font-family: monospace; color: #f3f3f3; background-color: #111111; border: 1px solid #050505; padding: 1px 4px;">{escaped}</span>')
    else:
      fragments.append(escaped)
  label = _AboutWrappingLabel("".join(fragments), parent)
  label.setObjectName("aboutInlineCode" if bool(has_code) else "subtitle")
  label.setTextFormat(Qt.TextFormat.RichText)
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse | Qt.TextInteractionFlag.LinksAccessibleByMouse)
  label.setWordWrap(True)
  label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return label
