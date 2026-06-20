# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QImage

from ludoxel.presentation.interface.common.core_special_item_art import build_core_special_item_icon_image, core_special_item_icon_visual_anchor
from ludoxel.presentation.interface.othello.art import build_othello_special_item_icon_image, othello_special_item_icon_visual_anchor

_BASE_SIZE = 18


def build_special_item_icon_layout(icon_key: str, *, size: int) -> tuple[QImage, tuple[float, float]]:
  normalized = str(icon_key).strip().lower()
  image = build_core_special_item_icon_image(normalized)
  anchor = core_special_item_icon_visual_anchor(normalized)
  if image is None:
    image = build_othello_special_item_icon_image(normalized)
    anchor = othello_special_item_icon_visual_anchor(normalized)
  if image is None:
    image = build_othello_special_item_icon_image("settings")
    anchor = othello_special_item_icon_visual_anchor("settings")
  if image is None or anchor is None:
    raise RuntimeError("Special item fallback art is unavailable")

  source_width = max(1, int(image.width()))
  source_height = max(1, int(image.height()))
  icon_size = int(max(_BASE_SIZE, int(size)))
  if int(icon_size) != int(source_width) or int(icon_size) != int(source_height):
    image = image.scaled(int(icon_size), int(icon_size), Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation)
  scaled_anchor = (float(anchor[0]) * float(icon_size) / float(source_width), float(anchor[1]) * float(icon_size) / float(source_height))
  return (image, scaled_anchor)


def build_special_item_icon_image(icon_key: str, *, size: int) -> QImage:
  image, _anchor = build_special_item_icon_layout(str(icon_key), size=int(size))
  return image
