# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtGui import QColor, QImage

_BASE_SIZE = 18


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


def _set_pixels(image: QImage, color: str, pixels: tuple[tuple[int, int], ...]) -> None:
  qcolor = QColor(str(color))
  for x, y in pixels:
    if 0 <= int(x) < int(_BASE_SIZE) and 0 <= int(y) < int(_BASE_SIZE):
      image.setPixelColor(int(x), int(y), qcolor)


def _fill_rect(image: QImage, color: str, *, x: int, y: int, w: int, h: int) -> None:
  pixels = tuple((px, py) for px in range(int(x), int(x) + int(w)) for py in range(int(y), int(y) + int(h)))
  _set_pixels(image, color, pixels)


def _paint_frame(image: QImage, *, fill: str, outline: str, x: int, y: int, w: int, h: int) -> None:
  _fill_rect(image, fill, x=int(x), y=int(y), w=int(w), h=int(h))
  outline_pixels = tuple(
    [(px, int(y)) for px in range(int(x), int(x) + int(w))]
    + [(px, int(y) + int(h) - 1) for px in range(int(x), int(x) + int(w))]
    + [(int(x), py) for py in range(int(y), int(y) + int(h))]
    + [(int(x) + int(w) - 1, py) for py in range(int(y), int(y) + int(h))]
  )
  _set_pixels(image, outline, outline_pixels)


def _paint_start_icon(image: QImage) -> None:
  _paint_frame(image, fill="#2f2f2f", outline="#111111", x=1, y=1, w=17, h=17)
  _fill_rect(image, "#7dd15a", x=4, y=9, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=5, y=10, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=6, y=11, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=7, y=12, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=8, y=11, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=9, y=10, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=10, y=9, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=11, y=8, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=12, y=6, w=1, h=3)
  _fill_rect(image, "#7dd15a", x=13, y=5, w=1, h=2)
  _fill_rect(image, "#7dd15a", x=14, y=5, w=1, h=1)
  _set_pixels(image, "#79c758", ((13, 7), (14, 6)))
  _set_pixels(image, "#aee688", ((5, 9), (6, 10), (7, 11), (8, 10), (9, 9), (10, 8), (11, 7)))


def _paint_settings_icon(image: QImage) -> None:
  _paint_frame(image, fill="#2f2f2f", outline="#111111", x=1, y=1, w=17, h=17)
  _fill_rect(image, "#d8d8d8", x=4, y=5, w=11, h=1)
  _fill_rect(image, "#d8d8d8", x=4, y=9, w=11, h=1)
  _fill_rect(image, "#d8d8d8", x=4, y=13, w=11, h=1)
  _fill_rect(image, "#8db7ff", x=5, y=4, w=2, h=3)
  _fill_rect(image, "#8db7ff", x=12, y=8, w=2, h=3)
  _fill_rect(image, "#8db7ff", x=8, y=12, w=2, h=3)
  _set_pixels(image, "#9ec1fd", ((6, 4), (13, 8), (9, 12)))
