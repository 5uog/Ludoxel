# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtGui import QColor, QImage


def set_pixels(image: QImage, color: str, pixels: tuple[tuple[int, int], ...]) -> None:
  qcolor = QColor(str(color))
  width = int(image.width())
  height = int(image.height())
  for x, y in pixels:
    if 0 <= int(x) < width and 0 <= int(y) < height:
      image.setPixelColor(int(x), int(y), qcolor)


def fill_rect(image: QImage, color: str, *, x: int, y: int, width: int, height: int) -> None:
  pixels = tuple((px, py) for px in range(int(x), int(x) + int(width)) for py in range(int(y), int(y) + int(height)))
  set_pixels(image, color, pixels)


def paint_frame(image: QImage, *, fill: str, outline: str, x: int, y: int, width: int, height: int) -> None:
  fill_rect(image, fill, x=int(x), y=int(y), width=int(width), height=int(height))
  outline_pixels = tuple([(px, int(y)) for px in range(int(x), int(x) + int(width))] + [(px, int(y) + int(height) - 1) for px in range(int(x), int(x) + int(width))] + [(int(x), py) for py in range(int(y), int(y) + int(height))] + [(int(x) + int(width) - 1, py) for py in range(int(y), int(y) + int(height))])
  set_pixels(image, outline, outline_pixels)
