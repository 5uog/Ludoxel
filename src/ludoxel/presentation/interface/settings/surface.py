# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QProgressBar, QSizePolicy, QVBoxLayout, QWidget


def add_page_header(layout: QVBoxLayout, parent: QWidget, *, title: str, subtitle: str) -> QWidget:
  header = QWidget(parent)
  header.setObjectName("settingsPageHeader")
  header_layout = QVBoxLayout(header)
  header_layout.setContentsMargins(4, 2, 4, 8)
  header_layout.setSpacing(4)
  title_label = QLabel(str(title), header)
  title_label.setObjectName("settingsPageTitle")
  subtitle_label = QLabel(str(subtitle), header)
  subtitle_label.setObjectName("settingsPageSubtitle")
  subtitle_label.setWordWrap(True)
  header_layout.addWidget(title_label)
  header_layout.addWidget(subtitle_label)
  layout.addWidget(header)
  return header


def add_settings_card(layout: QVBoxLayout, parent: QWidget, *, title: str, description: str = "") -> tuple[QFrame, QWidget, QVBoxLayout]:
  card = QFrame(parent)
  card.setObjectName("settingsCard")
  card_layout = QVBoxLayout(card)
  card_layout.setContentsMargins(14, 12, 14, 14)
  card_layout.setSpacing(9)
  title_label = QLabel(str(title), card)
  title_label.setObjectName("settingsCardTitle")
  card_layout.addWidget(title_label)
  if str(description).strip():
    description_label = QLabel(str(description), card)
    description_label.setObjectName("settingsCardDescription")
    description_label.setWordWrap(True)
    card_layout.addWidget(description_label)
  body = QWidget(card)
  body.setObjectName("settingsCardBody")
  body_layout = QVBoxLayout(body)
  body_layout.setContentsMargins(0, 2, 0, 0)
  body_layout.setSpacing(8)
  card_layout.addWidget(body)
  layout.addWidget(card)
  return card, body, body_layout


def add_setting_row(layout: QVBoxLayout, parent: QWidget, *, label: str, description: str, control: QWidget, label_widget: QLabel | None = None) -> QWidget:
  row = QWidget(parent)
  row.setObjectName("settingsRow")
  row_layout = QHBoxLayout(row)
  row_layout.setContentsMargins(12, 8, 12, 8)
  row_layout.setSpacing(16)
  text = QWidget(row)
  text.setObjectName("settingsRowText")
  text_layout = QVBoxLayout(text)
  text_layout.setContentsMargins(0, 0, 0, 0)
  text_layout.setSpacing(2)
  row_label = QLabel(str(label), text) if label_widget is None else label_widget
  row_label.setParent(text)
  row_label.setObjectName("settingsRowLabel")
  text_layout.addWidget(row_label)
  description_widget = QLabel(str(description), text)
  description_widget.setObjectName("settingsRowDescription")
  description_widget.setWordWrap(True)
  description_widget.setVisible(bool(str(description).strip()))
  text_layout.addWidget(description_widget)
  control_host = QWidget(row)
  control_host.setObjectName("settingsRowControl")
  control_layout = QHBoxLayout(control_host)
  control_layout.setContentsMargins(0, 0, 0, 0)
  control_layout.setSpacing(8)
  control_layout.addStretch(1)
  control_layout.addWidget(control)
  row_layout.addWidget(text, stretch=3)
  row_layout.addWidget(control_host, stretch=2)
  layout.addWidget(row)
  return row


def create_settings_loader_page(parent: QWidget, *, text: str) -> tuple[QWidget, QLabel, QProgressBar]:
  page = QWidget(parent)
  page.setObjectName("aboutLoaderPage")
  page.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

  loader_layout = QVBoxLayout(page)
  loader_layout.setContentsMargins(24, 24, 24, 24)
  loader_layout.setSpacing(12)
  loader_layout.addStretch(1)

  loader_card = QFrame(page)
  loader_card.setObjectName("aboutLoaderCard")
  loader_card.setSizePolicy(QSizePolicy.Policy.MinimumExpanding, QSizePolicy.Policy.Fixed)
  loader_card.setMinimumWidth(360)
  loader_card.setMaximumWidth(520)

  loader_card_layout = QVBoxLayout(loader_card)
  loader_card_layout.setContentsMargins(22, 20, 22, 20)
  loader_card_layout.setSpacing(12)

  loader_label = QLabel(str(text), loader_card)
  loader_label.setObjectName("settingsPageSubtitle")
  loader_label.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  loader_label.setWordWrap(True)
  loader_card_layout.addWidget(loader_label)

  loader_progress = QProgressBar(loader_card)
  loader_progress.setObjectName("aboutLoaderProgress")
  loader_progress.setRange(0, 100)
  loader_progress.setValue(0)
  loader_progress.setTextVisible(True)
  loader_progress.setMinimumHeight(22)
  loader_progress.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  loader_card_layout.addWidget(loader_progress)

  loader_layout.addWidget(loader_card, alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  loader_layout.addStretch(1)
  return page, loader_label, loader_progress
