# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from PyQt6.QtCore import QSize, Qt, QUrl
from PyQt6.QtGui import QDesktopServices, QIcon, QPixmap
from PyQt6.QtWidgets import QFrame, QGridLayout, QHBoxLayout, QLabel, QPushButton, QScrollArea, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.documentation.about.content import (
  ABOUT_CREATOR_AGE,
  ABOUT_CREATOR_AGE_LABEL,
  ABOUT_CREATOR_DISPLAY_NAME,
  ABOUT_CREATOR_HANDLE,
  ABOUT_CREATOR_PRONOUNCE_LABEL,
  ABOUT_CREATOR_PRONOUNS,
  ABOUT_CREATOR_ROLE,
  ABOUT_ETYMOLOGY_PARAGRAPHS,
  ABOUT_GITHUB_URL,
  ABOUT_PROFILE_BIO_TEXT,
  ABOUT_PROFILE_TAGS,
)
from ludoxel.presentation.interface.common.status_overlay import status_overlay_title_image_path
from ludoxel.presentation.interface.settings.about.renderer import add_about_section_title, render_about_paragraphs, render_about_text
from ludoxel.presentation.interface.settings.about.widgets import about_card, about_meta_title, about_meta_value, about_tag_flow, about_text, github_image_path, profile_image_path
from ludoxel.presentation.interface.settings.surface import add_page_header

if TYPE_CHECKING:
  from ludoxel.presentation.interface.settings.overlay import SettingsOverlay


class _AboutScrollArea(QScrollArea):
  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("settingsScroll")
    self.setWidgetResizable(False)
    self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
    self.setFrameShape(QFrame.Shape.NoFrame)
    self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
    viewport = self.viewport()
    viewport.setObjectName("settingsViewport")
    viewport.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    viewport.setAutoFillBackground(True)

  def resizeEvent(self, event) -> None:
    super().resizeEvent(event)
    self.ensure_content_geometry()

  def ensure_content_geometry(self) -> None:
    """
    widgetResizable を無効にした scroll area で host 幅を viewport 幅へ固定し、height-for-width から必要高さを決定する。
    """
    host = self.widget()
    if host is None:
      return
    viewport = self.viewport()
    width = int(max(1, viewport.width()))
    if int(host.minimumWidth()) != width or int(host.maximumWidth()) != width:
      host.setFixedWidth(width)

    host_layout = host.layout()
    if host_layout is not None:
      host_layout.activate()
      content_height = int(host_layout.heightForWidth(width)) if bool(host_layout.hasHeightForWidth()) else int(host.sizeHint().height())
    else:
      content_height = int(host.sizeHint().height())

    height = int(max(content_height, int(viewport.height())))
    if int(host.width()) != width or int(host.height()) != height:
      host.resize(width, height)
    host.updateGeometry()


def _make_about_scroll_page(parent: QWidget) -> tuple[_AboutScrollArea, QWidget, QVBoxLayout]:
  scroll = _AboutScrollArea(parent)
  host = QWidget(scroll)
  host.setObjectName("aboutPage")
  host.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
  host.setAutoFillBackground(True)
  host.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)

  layout = QVBoxLayout(host)
  layout.setContentsMargins(8, 8, 8, 8)
  layout.setSpacing(16)
  layout.setAlignment(Qt.AlignmentFlag.AlignTop)

  scroll.setWidget(host)
  scroll.ensure_content_geometry()
  return scroll, host, layout


def _make_github_button(parent: QWidget, github_path: Path | None) -> QPushButton:
  github_button = QPushButton("GitHub Repository", parent)
  github_button.setObjectName("aboutGithubButton")
  github_button.setCursor(Qt.CursorShape.PointingHandCursor)
  github_button.setToolTip(ABOUT_GITHUB_URL)

  if github_path is not None:
    github_icon = QIcon(str(github_path))
    if not github_icon.isNull():
      github_button.setIcon(github_icon)
      github_button.setIconSize(QSize(24, 24))

  github_button.clicked.connect(lambda _checked=False: QDesktopServices.openUrl(QUrl(ABOUT_GITHUB_URL)))
  return github_button


def _add_profile_identity_rows(parent: QWidget, profile_layout: QGridLayout, start_row: int, github_path: Path | None) -> None:
  profile_layout.addWidget(about_meta_title(parent, ABOUT_CREATOR_AGE_LABEL), int(start_row), 0, alignment=Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignTop)
  profile_layout.addWidget(about_meta_value(parent, ABOUT_CREATOR_AGE), int(start_row), 1)

  profile_layout.addWidget(about_meta_title(parent, ABOUT_CREATOR_PRONOUNCE_LABEL), int(start_row) + 1, 0, alignment=Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignTop)
  profile_layout.addWidget(about_meta_value(parent, ABOUT_CREATOR_PRONOUNS), int(start_row) + 1, 1)

  github_row = QHBoxLayout()
  github_row.setContentsMargins(0, 2, 22, 0)
  github_row.setSpacing(0)
  github_row.addWidget(_make_github_button(parent, github_path))
  github_row.addStretch(1)
  profile_layout.addLayout(github_row, int(start_row) + 2, 1)


def _add_text_card(parent: QWidget, outer_layout: QVBoxLayout, *, title: str | None, text: str | None = None, paragraphs: tuple[str, ...] = (), object_name: str = "subtitle") -> None:
  card = about_card(parent)
  card_layout = QVBoxLayout(card)
  card_layout.setContentsMargins(18, 18, 18, 18)
  card_layout.setSpacing(10)
  card_layout.setAlignment(Qt.AlignmentFlag.AlignTop)

  if title is not None:
    add_about_section_title(card, card_layout, title)
  if text is not None:
    render_about_text(parent=card, layout=card_layout, text=text, text_factory=about_text, object_name=object_name)
  if paragraphs:
    render_about_paragraphs(parent=card, layout=card_layout, paragraphs=paragraphs, text_factory=about_text, object_name=object_name)
  outer_layout.addWidget(card)


def build_about_tab(overlay: "SettingsOverlay", *, parent: QWidget | None = None) -> QWidget:
  """
  About content を creator profile、bio、etymology として構築する。
  Name と handle は profile header に既に存在するため meta row として重複表示しない。
  Tags は ABOUT_PROFILE_TAGS から描画し、Age / Pronounce より上に配置する。
  Age / Pronounce は aboutMetaTitle / aboutMetaValue の既存 design を維持し、GitHub button はその下に置く。
  旧 Project Overview、Work、Academic Direction は復活させない。
  """
  page_parent = overlay._stack if parent is None else parent
  scroll, host, layout = _make_about_scroll_page(page_parent)
  add_page_header(layout, host, title="About", subtitle="Creator profile, bio, and etymology.")

  title_image_path = None if overlay._resource_root is None else status_overlay_title_image_path(overlay._resource_root)
  profile_path = profile_image_path(overlay._resource_root)
  github_path = github_image_path(overlay._resource_root)

  profile_card = about_card(host, "aboutProfileCard")
  profile_layout = QGridLayout(profile_card)
  profile_layout.setContentsMargins(0, 0, 0, 24)
  profile_layout.setHorizontalSpacing(24)
  profile_layout.setVerticalSpacing(10)
  profile_layout.setColumnMinimumWidth(0, 190)
  profile_layout.setColumnStretch(0, 0)
  profile_layout.setColumnStretch(1, 1)
  profile_layout.setRowMinimumHeight(0, 140)
  profile_layout.setRowStretch(0, 0)
  profile_layout.setRowStretch(1, 0)
  profile_layout.setRowStretch(2, 0)
  profile_layout.setRowStretch(3, 0)
  profile_layout.setRowStretch(4, 0)

  cover = QFrame(profile_card)
  cover.setObjectName("aboutProfileCover")
  cover.setFixedHeight(140)
  cover.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  cover_layout = QVBoxLayout(cover)
  cover_layout.setContentsMargins(22, 18, 22, 18)
  cover_layout.setSpacing(0)

  mark_label = QLabel("Ludoxel", cover)
  mark_label.setObjectName("aboutProfileMark")
  mark_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
  mark_label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  if title_image_path is not None:
    mark_pixmap = QPixmap(str(title_image_path))
    if not mark_pixmap.isNull():
      mark_label.setText("")
      mark_label.setPixmap(mark_pixmap.scaled(300, 96, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))
  cover_layout.addWidget(mark_label, alignment=Qt.AlignmentFlag.AlignRight)
  profile_layout.addWidget(cover, 0, 0, 1, 2)

  avatar_layer = QWidget(profile_card)
  avatar_layer.setObjectName("aboutAvatarLayer")
  avatar_layer.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Minimum)
  avatar_layer_layout = QVBoxLayout(avatar_layer)
  avatar_layer_layout.setContentsMargins(22, 112, 22, 0)
  avatar_layer_layout.setSpacing(0)

  avatar = QLabel("KK", profile_card)
  avatar.setObjectName("aboutAvatar")
  avatar.setFixedSize(132, 132)
  avatar.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  if profile_path is not None:
    avatar_pixmap = QPixmap(str(profile_path))
    if not avatar_pixmap.isNull():
      avatar.setText("")
      avatar.setPixmap(avatar_pixmap.scaled(132, 132, Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation))
  avatar_layer_layout.addWidget(avatar, alignment=Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft)
  profile_layout.addWidget(avatar_layer, 0, 0, 2, 1)

  profile_text_column = QVBoxLayout()
  profile_text_column.setContentsMargins(0, 22, 22, 0)
  profile_text_column.setSpacing(8)
  profile_text_column.setAlignment(Qt.AlignmentFlag.AlignTop)

  display_name = QLabel(ABOUT_CREATOR_DISPLAY_NAME, profile_card)
  display_name.setObjectName("aboutProfileName")
  display_name.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  profile_text_column.addWidget(display_name)

  handle = QLabel(f"@{ABOUT_CREATOR_HANDLE}", profile_card)
  handle.setObjectName("aboutProfileHandle")
  handle.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  profile_text_column.addWidget(handle)

  role = QLabel(ABOUT_CREATOR_ROLE, profile_card)
  role.setObjectName("aboutProfileRole")
  role.setWordWrap(True)
  role.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  profile_text_column.addWidget(role)

  profile_text_column.addWidget(about_tag_flow(profile_card, ABOUT_PROFILE_TAGS))

  profile_layout.addLayout(profile_text_column, 1, 1)
  _add_profile_identity_rows(profile_card, profile_layout, 2, github_path)
  layout.addWidget(profile_card)

  _add_text_card(host, layout, title=None, text=ABOUT_PROFILE_BIO_TEXT, object_name="aboutProfileBio")
  _add_text_card(host, layout, title="Etymology", paragraphs=ABOUT_ETYMOLOGY_PARAGRAPHS)

  scroll.ensure_content_geometry()
  return scroll
