# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import TYPE_CHECKING

from PyQt6.QtWidgets import QHBoxLayout, QListWidget, QPlainTextEdit, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.documentation.legal.model import list_third_party_materials, load_license_text
from ludoxel.presentation.interface.settings.surface import add_page_header

if TYPE_CHECKING:
  from ludoxel.presentation.interface.settings.overlay import SettingsOverlay

_LUDOXEL_LICENSE_ENTRY = "Ludoxel License"
_MISSING_LICENSE_TEXT = "The Ludoxel License Text is not available in this build."
_NO_THIRD_PARTY_TEXT = "No third-party materials are bundled with this build."


def build_legal_tab(overlay: "SettingsOverlay", *, parent: QWidget | None = None) -> QWidget:
  page_parent = overlay._stack if parent is None else parent

  page = QWidget(page_parent)
  page.setObjectName("legalPage")
  page.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

  layout = QVBoxLayout(page)
  layout.setContentsMargins(8, 8, 8, 8)
  layout.setSpacing(12)
  add_page_header(layout, page, title="Legal Information", subtitle="The Ludoxel License Text and third-party attributions bundled with this build.")

  license_text = load_license_text()
  third_party_materials = list_third_party_materials(overlay._resource_root)

  body = QWidget(page)
  body_layout = QHBoxLayout(body)
  body_layout.setContentsMargins(0, 0, 0, 0)
  body_layout.setSpacing(12)

  material_list = QListWidget(body)
  material_list.setObjectName("legalMaterialList")
  material_list.setFixedWidth(200)
  body_layout.addWidget(material_list)

  text_view = QPlainTextEdit(body)
  text_view.setObjectName("legalTextView")
  text_view.setReadOnly(True)
  text_view.setLineWrapMode(QPlainTextEdit.LineWrapMode.WidgetWidth)
  body_layout.addWidget(text_view, stretch=1)

  layout.addWidget(body, stretch=1)

  texts: list[str] = [license_text if license_text is not None else _MISSING_LICENSE_TEXT]
  material_list.addItem(_LUDOXEL_LICENSE_ENTRY)
  for material in third_party_materials:
    material_list.addItem(material.name)
    texts.append(material.license_text)

  if not third_party_materials:
    material_list.addItem("Third-Party Materials")
    texts.append(_NO_THIRD_PARTY_TEXT)

  def _on_selection_changed(row: int) -> None:
    if 0 <= row < len(texts):
      text_view.setPlainText(texts[row])

  material_list.currentRowChanged.connect(_on_selection_changed)
  material_list.setCurrentRow(0)

  return page
