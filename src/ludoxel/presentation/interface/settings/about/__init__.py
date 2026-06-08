# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.presentation.interface.settings.about.content import (
  ABOUT_ACADEMIC_DIRECTION_TEXT,
  ABOUT_CREATOR_AGE,
  ABOUT_CREATOR_DISPLAY_NAME,
  ABOUT_CREATOR_GENDER,
  ABOUT_CREATOR_HANDLE,
  ABOUT_CREATOR_ROLE,
  ABOUT_ETYMOLOGY_PARAGRAPHS,
  ABOUT_PROFILE_BIO_TEXT,
  ABOUT_PROJECT_OVERVIEW_SECTIONS,
  ABOUT_WORK_TEXT,
  PROFILE_IMAGE_CANDIDATE_NAMES,
  AboutBlock,
  AboutSection,
)
from ludoxel.presentation.interface.settings.about.renderer import render_about_sections
from ludoxel.presentation.interface.settings.about.widgets import about_card, about_code_block, about_meta_row, about_pill, about_text, profile_image_path

__all__ = [
  "ABOUT_ACADEMIC_DIRECTION_TEXT",
  "ABOUT_CREATOR_AGE",
  "ABOUT_CREATOR_DISPLAY_NAME",
  "ABOUT_CREATOR_GENDER",
  "ABOUT_CREATOR_HANDLE",
  "ABOUT_CREATOR_ROLE",
  "ABOUT_ETYMOLOGY_PARAGRAPHS",
  "ABOUT_PROFILE_BIO_TEXT",
  "ABOUT_PROJECT_OVERVIEW_SECTIONS",
  "ABOUT_WORK_TEXT",
  "PROFILE_IMAGE_CANDIDATE_NAMES",
  "AboutBlock",
  "AboutSection",
  "about_card",
  "about_code_block",
  "about_meta_row",
  "about_pill",
  "about_text",
  "profile_image_path",
  "render_about_sections",
]
