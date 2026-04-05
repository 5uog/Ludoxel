# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QImage

from ludoxel.features.othello.ui.special_item_art import build_othello_special_item_icon_image

from .core_special_item_art import build_core_special_item_icon_image

_BASE_SIZE = 16


def build_special_item_icon_image(icon_key: str, *, size: int) -> QImage:
    image = build_core_special_item_icon_image(icon_key)
    if image is None:
        image = build_othello_special_item_icon_image(icon_key)
    if image is None:
        image = build_othello_special_item_icon_image("settings")
    icon_size = int(max(_BASE_SIZE, int(size)))
    if int(icon_size) == int(_BASE_SIZE):
        return image
    return image.scaled(int(icon_size), int(icon_size), Qt.AspectRatioMode.IgnoreAspectRatio, Qt.TransformationMode.FastTransformation)
