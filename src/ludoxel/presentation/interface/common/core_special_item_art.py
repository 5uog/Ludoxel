# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtGui import QColor, QImage

_BASE_SIZE = 18
_ICON_VISUAL_ANCHORS: dict[str, tuple[float, float]] = {"ai_spawn_egg": (9.5, 9.5), "route_confirm": (9.5, 9.5), "route_cancel": (9.5, 9.5), "route_erase": (9.5, 9.5)}


def core_special_item_icon_visual_anchor(icon_key: str) -> tuple[float, float] | None:
  """
  core special item の17x17 frame 中心を、18x18 source canvas の連続座標 `(9.5, 9.5)` として返す。
  返値は Othello special item と共通の pixel design contract であり、inventory と hotbar が全 special item を同じ基準へ配置するために使う。
  """
  anchor = _ICON_VISUAL_ANCHORS.get(str(icon_key).strip().lower())
  if anchor is None:
    return None
  return (float(anchor[0]), float(anchor[1]))


def build_core_special_item_icon_image(icon_key: str) -> QImage | None:
  image = QImage(_BASE_SIZE, _BASE_SIZE, QImage.Format.Format_RGBA8888)
  image.fill(0)

  normalized = str(icon_key).strip().lower()
  if normalized == "ai_spawn_egg":
    _paint_ai_spawn_icon(image)
  elif normalized == "route_confirm":
    _paint_confirm_icon(image)
  elif normalized == "route_cancel":
    _paint_cancel_icon(image)
  elif normalized == "route_erase":
    _paint_erase_icon(image)
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


def _paint_frame(image: QImage) -> None:
  """
  Othello special item と同じ `(1, 1)` 起点、幅17、高さ17の背景 frame を描画する。
  frame は symbol 用の1 pixel offset を適用せず、18x18 source canvas 内で右端と下端を含む authored bounds を固定する。
  """
  fill = QColor("#2f2f2f")
  outline = QColor("#111111")
  for y in range(1, 18):
    for x in range(1, 18):
      image.setPixelColor(int(x), int(y), fill)
  for coordinate in range(1, 18):
    image.setPixelColor(int(coordinate), 1, outline)
    image.setPixelColor(int(coordinate), 17, outline)
    image.setPixelColor(1, int(coordinate), outline)
    image.setPixelColor(17, int(coordinate), outline)


def _paint_ai_spawn_icon(image: QImage) -> None:
  _paint_frame(image)
  dark = "#101010"
  light = "#8cf0b0"
  _fill_rect(image, dark, x=3, y=6, w=1, h=9)
  _fill_rect(image, dark, x=4, y=5, w=1, h=1)
  _fill_rect(image, dark, x=5, y=4, w=3, h=1)
  _fill_rect(image, dark, x=8, y=5, w=1, h=1)
  _fill_rect(image, dark, x=9, y=6, w=1, h=9)
  _fill_rect(image, dark, x=4, y=9, w=5, h=1)
  _fill_rect(image, dark, x=11, y=4, w=5, h=1)
  _fill_rect(image, dark, x=13, y=5, w=1, h=9)
  _fill_rect(image, dark, x=11, y=14, w=5, h=1)
  _set_pixels(image, light, ((4, 6), (5, 5), (6, 5), (7, 5), (8, 6), (12, 5), (13, 5), (14, 5)))


def _paint_confirm_icon(image: QImage) -> None:
  _paint_frame(image)
  _set_pixels(
    image,
    "#154d16",
    (
      (3, 9),
      (3, 10),
      (4, 10),
      (4, 11),
      (5, 11),
      (5, 12),
      (6, 12),
      (6, 13),
      (7, 12),
      (7, 13),
      (8, 11),
      (8, 12),
      (9, 10),
      (9, 11),
      (10, 9),
      (10, 10),
      (11, 8),
      (11, 9),
      (12, 7),
      (12, 8),
      (13, 6),
      (13, 7),
      (14, 5),
      (14, 6),
      (15, 4),
      (15, 5),
    ),
  )
  _set_pixels(image, "#6ee171", ((4, 9), (5, 10), (6, 11), (7, 11), (8, 10), (9, 9), (10, 8), (11, 7), (12, 6), (13, 5), (14, 4)))


def _paint_cancel_icon(image: QImage) -> None:
  _paint_frame(image)
  dark = "#601010"
  light = "#ff6f6f"
  dark_pixels: list[tuple[int, int]] = []
  light_pixels: list[tuple[int, int]] = []
  for coordinate in range(3, 16):
    opposite = 18 - int(coordinate)
    dark_pixels.extend(((coordinate, coordinate), (coordinate, opposite), (coordinate, min(15, coordinate + 1)), (coordinate, max(3, opposite - 1))))
  for coordinate in range(5, 14):
    opposite = 18 - int(coordinate)
    light_pixels.extend(((coordinate, coordinate), (coordinate, opposite)))
  _set_pixels(image, dark, tuple(dark_pixels))
  _set_pixels(image, light, tuple(light_pixels))


def _paint_erase_icon(image: QImage) -> None:
  _paint_frame(image)
  _fill_rect(image, "#cfcfcf", x=5, y=4, w=8, h=2)
  _fill_rect(image, "#cfcfcf", x=4, y=6, w=10, h=4)
  _fill_rect(image, "#d99aa4", x=4, y=10, w=6, h=5)
  _fill_rect(image, "#f6e29f", x=10, y=10, w=5, h=5)
  _set_pixels(
    image,
    "#5a5a5a",
    (
      (5, 4),
      (6, 4),
      (7, 4),
      (8, 4),
      (9, 4),
      (10, 4),
      (11, 4),
      (12, 4),
      (4, 6),
      (13, 6),
      (4, 7),
      (13, 7),
      (4, 8),
      (13, 8),
      (4, 9),
      (13, 9),
      (4, 10),
      (14, 10),
      (4, 11),
      (14, 11),
      (4, 12),
      (14, 12),
      (4, 13),
      (14, 13),
      (4, 14),
      (14, 14),
    ),
  )
