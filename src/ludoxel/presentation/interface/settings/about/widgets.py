# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QFrame, QGridLayout, QLabel, QSizePolicy, QWidget

from ludoxel.presentation.interface.settings.about.content import PROFILE_IMAGE_CANDIDATE_NAMES


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
  return _first_existing_asset(resource_root, "assets/ui/profile", PROFILE_IMAGE_CANDIDATE_NAMES)


def about_card(parent: QWidget, object_name: str = "aboutCard") -> QFrame:
  card = QFrame(parent)
  card.setObjectName(str(object_name))
  return card


def about_text(parent: QWidget, text: str, object_name: str = "subtitle") -> QLabel:
  label = QLabel(str(text), parent)
  label.setObjectName(str(object_name))
  label.setWordWrap(True)
  return label


def about_pill(parent: QWidget, text: str) -> QLabel:
  label = QLabel(str(text), parent)
  label.setObjectName("aboutPill")
  label.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  return label


def about_meta_row(layout: QGridLayout, row: int, title: str, value: str, parent: QWidget) -> None:
  title_label = QLabel(str(title), parent)
  title_label.setObjectName("aboutMetaTitle")
  value_label = QLabel(str(value), parent)
  value_label.setObjectName("aboutMetaValue")
  value_label.setWordWrap(True)
  layout.addWidget(title_label, int(row), 0)
  layout.addWidget(value_label, int(row), 1)


def about_code_block(parent: QWidget, text: str) -> QLabel:
  label = QLabel(str(text).rstrip("\n"), parent)
  label.setObjectName("aboutCodeBlock")
  label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
  label.setWordWrap(True)
  label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  return label
