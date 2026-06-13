# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtGui import QImage

from ludoxel.presentation.interface.common.pixel_art import fill_rect, paint_frame, set_pixels

_BASE_SIZE = 18
_ICON_VISUAL_ANCHORS: dict[str, tuple[float, float]] = {"start": (9.5, 9.5), "settings": (9.5, 9.5)}


def othello_special_item_icon_visual_anchor(icon_key: str) -> tuple[float, float] | None:
  """
  Othello special item の17x17 frame が占める authored bounds の中心を、18x18 source frame の連続座標で返す。
  frame の左上座標 `(1, 1)` と幅、高さ17から得る中心 `(9.5, 9.5)` を明示し、透明余白の有無で配置基準が変化しないようにする。
  """
  anchor = _ICON_VISUAL_ANCHORS.get(str(icon_key).strip().lower())
  if anchor is None:
    return None
  return (float(anchor[0]), float(anchor[1]))


def build_othello_special_item_icon_image(icon_key: str) -> QImage | None:
  image = QImage(_BASE_SIZE, _BASE_SIZE, QImage.Format.Format_RGBA8888)
  image.fill(0)

  normalized = str(icon_key).strip().lower()
  if normalized == "start":
    _paint_start_icon(image)
  elif normalized == "settings":
    _paint_settings_icon(image)
  else:
    return None
  return image


def _paint_start_icon(image: QImage) -> None:
  paint_frame(image, fill="#2f2f2f", outline="#111111", x=1, y=1, width=17, height=17)
  fill_rect(image, "#7dd15a", x=4, y=9, width=1, height=2)
  fill_rect(image, "#7dd15a", x=5, y=10, width=1, height=2)
  fill_rect(image, "#7dd15a", x=6, y=11, width=1, height=2)
  fill_rect(image, "#7dd15a", x=7, y=12, width=1, height=2)
  fill_rect(image, "#7dd15a", x=8, y=11, width=1, height=2)
  fill_rect(image, "#7dd15a", x=9, y=10, width=1, height=2)
  fill_rect(image, "#7dd15a", x=10, y=9, width=1, height=2)
  fill_rect(image, "#7dd15a", x=11, y=8, width=1, height=2)
  fill_rect(image, "#7dd15a", x=12, y=6, width=1, height=3)
  fill_rect(image, "#7dd15a", x=13, y=5, width=1, height=2)
  fill_rect(image, "#7dd15a", x=14, y=5, width=1, height=1)
  set_pixels(image, "#79c758", ((13, 7), (14, 6)))
  set_pixels(image, "#aee688", ((5, 9), (6, 10), (7, 11), (8, 10), (9, 9), (10, 8), (11, 7)))


def _paint_settings_icon(image: QImage) -> None:
  paint_frame(image, fill="#2f2f2f", outline="#111111", x=1, y=1, width=17, height=17)
  fill_rect(image, "#d8d8d8", x=4, y=5, width=11, height=1)
  fill_rect(image, "#d8d8d8", x=4, y=9, width=11, height=1)
  fill_rect(image, "#d8d8d8", x=4, y=13, width=11, height=1)
  fill_rect(image, "#8db7ff", x=5, y=4, width=2, height=3)
  fill_rect(image, "#8db7ff", x=12, y=8, width=2, height=3)
  fill_rect(image, "#8db7ff", x=8, y=12, width=2, height=3)
  set_pixels(image, "#9ec1fd", ((6, 4), (13, 8), (9, 12)))
