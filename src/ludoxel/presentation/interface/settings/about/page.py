# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from PyQt6.QtCore import QSize, Qt, QUrl
from PyQt6.QtGui import QDesktopServices, QIcon, QPixmap
from PyQt6.QtWidgets import QFrame, QGridLayout, QHBoxLayout, QLabel, QPushButton, QScrollArea, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.documentation.about.content import (
  ABOUT_ACADEMIC_DIRECTION_TEXT,
  ABOUT_CREATOR_AGE,
  ABOUT_CREATOR_DISPLAY_NAME,
  ABOUT_CREATOR_GENDER,
  ABOUT_CREATOR_HANDLE,
  ABOUT_CREATOR_ROLE,
  ABOUT_ETYMOLOGY_PARAGRAPHS,
  ABOUT_GITHUB_URL,
  ABOUT_PROFILE_BIO_TEXT,
  ABOUT_PROJECT_OVERVIEW_SECTIONS,
  ABOUT_WORK_TEXT,
)
from ludoxel.presentation.interface.common.status_overlay import status_overlay_title_image_path
from ludoxel.presentation.interface.settings.about.renderer import render_about_sections
from ludoxel.presentation.interface.settings.about.widgets import about_meta_row, about_pill, about_text, github_image_path, profile_image_path
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
    widgetResizable を無効にした scroll area において host 幅を viewport 幅へ固定し、height-for-width から必要高さを決定する。
    About card の折返し後高さを採用することで、幅変更後に旧 sizeHint が残していた Project Overview 下部の不要な scroll 余白を除く。
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


def build_about_tab(overlay: "SettingsOverlay", *, parent: QWidget | None = None) -> QWidget:
  """
  軽量な About document と Qt 専用 renderer/widget helper を選択時に結合して settings page を構築する。
  呼び出し側は生成した widget tree を overlay instance 内で再利用し、通常 settings page の初期構築へ About の文書量を載せない。
  """
  page_parent = overlay._stack if parent is None else parent
  scroll, host, layout = _make_about_scroll_page(page_parent)
  add_page_header(layout, host, title="About", subtitle="Project architecture, runtime behavior, resources, verification, and legal boundaries.")

  title_image_path = None if overlay._resource_root is None else status_overlay_title_image_path(overlay._resource_root)
  profile_path = profile_image_path(overlay._resource_root)
  github_path = github_image_path(overlay._resource_root)

  profile_card = QFrame(host)
  profile_card.setObjectName("aboutProfileCard")
  profile_card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  profile_layout = QGridLayout(profile_card)
  profile_layout.setContentsMargins(0, 0, 0, 24)
  profile_layout.setHorizontalSpacing(18)
  profile_layout.setVerticalSpacing(0)
  profile_layout.setColumnMinimumWidth(0, 176)
  profile_layout.setColumnStretch(0, 0)
  profile_layout.setColumnStretch(1, 1)
  profile_layout.setRowMinimumHeight(0, 140)
  profile_layout.setRowStretch(0, 0)
  profile_layout.setRowStretch(1, 0)

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

  pill_row = QHBoxLayout()
  pill_row.setContentsMargins(0, 4, 0, 0)
  pill_row.setSpacing(8)
  pill_row.addWidget(about_pill(profile_card, "Engineering"))
  pill_row.addWidget(about_pill(profile_card, "Law"))
  pill_row.addWidget(about_pill(profile_card, "Voxel Systems"))
  pill_row.addStretch(1)
  profile_text_column.addLayout(pill_row)
  profile_text_column.addWidget(about_text(profile_card, ABOUT_PROFILE_BIO_TEXT, "aboutProfileBio"))

  github_button = QPushButton("GitHub Repository", profile_card)
  github_button.setObjectName("aboutGithubButton")
  github_button.setCursor(Qt.CursorShape.PointingHandCursor)
  github_button.setToolTip(ABOUT_GITHUB_URL)
  if github_path is not None:
    github_icon = QIcon(str(github_path))
    if not github_icon.isNull():
      github_button.setIcon(github_icon)
      github_button.setIconSize(QSize(24, 24))
  github_button.clicked.connect(lambda _checked=False: QDesktopServices.openUrl(QUrl(ABOUT_GITHUB_URL)))

  github_row = QHBoxLayout()
  github_row.setContentsMargins(0, 2, 0, 0)
  github_row.setSpacing(0)
  github_row.addWidget(github_button)
  github_row.addStretch(1)
  profile_text_column.addLayout(github_row)
  profile_layout.addLayout(profile_text_column, 1, 1)
  layout.addWidget(profile_card)

  meta_card = QFrame(host)
  meta_card.setObjectName("aboutCard")
  meta_card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  meta_layout = QGridLayout(meta_card)
  meta_layout.setContentsMargins(18, 18, 18, 18)
  meta_layout.setHorizontalSpacing(18)
  meta_layout.setVerticalSpacing(10)
  meta_layout.setColumnStretch(0, 0)
  meta_layout.setColumnStretch(1, 1)
  about_meta_row(meta_layout, 0, "Name", ABOUT_CREATOR_DISPLAY_NAME, meta_card)
  about_meta_row(meta_layout, 1, "Handle", f"@{ABOUT_CREATOR_HANDLE}", meta_card)
  about_meta_row(meta_layout, 2, "Age", ABOUT_CREATOR_AGE, meta_card)
  about_meta_row(meta_layout, 3, "Gender", ABOUT_CREATOR_GENDER, meta_card)
  about_meta_row(meta_layout, 4, "Work", ABOUT_WORK_TEXT, meta_card)
  about_meta_row(meta_layout, 5, "Academic direction", ABOUT_ACADEMIC_DIRECTION_TEXT, meta_card)
  layout.addWidget(meta_card)

  etymology_card = QFrame(host)
  etymology_card.setObjectName("aboutCard")
  etymology_card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  etymology_layout = QVBoxLayout(etymology_card)
  etymology_layout.setContentsMargins(18, 18, 18, 18)
  etymology_layout.setSpacing(10)
  etymology_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
  etymology_title = QLabel("Etymology", etymology_card)
  etymology_title.setObjectName("sectionTitle")
  etymology_title.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  etymology_layout.addWidget(etymology_title)
  for paragraph in ABOUT_ETYMOLOGY_PARAGRAPHS:
    etymology_layout.addWidget(about_text(etymology_card, paragraph))
  layout.addWidget(etymology_card)

  overview_card = QFrame(host)
  overview_card.setObjectName("aboutCard")
  overview_card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  overview_layout = QVBoxLayout(overview_card)
  overview_layout.setContentsMargins(18, 18, 18, 18)
  overview_layout.setSpacing(10)
  overview_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
  overview_title = QLabel("Project Overview", overview_card)
  overview_title.setObjectName("sectionTitle")
  overview_title.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  overview_layout.addWidget(overview_title)
  render_about_sections(parent=overview_card, layout=overview_layout, sections=ABOUT_PROJECT_OVERVIEW_SECTIONS, text_factory=about_text)
  overview_card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  layout.addWidget(overview_card)

  scroll.ensure_content_geometry()
  return scroll
