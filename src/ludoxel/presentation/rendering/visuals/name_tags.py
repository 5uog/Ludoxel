# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass, field
from random import Random

import numpy as np
from PyQt6.QtCore import QRect, QSize, Qt
from PyQt6.QtGui import QColor, QFont, QFontMetrics, QGuiApplication, QImage, QPainter

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.foundations.text.format_codes import SECTION_SIGN, parse_formatted_text
from ludoxel.foundations.text.obfuscation import obfuscated_char_for
from ludoxel.foundations.text.palette import is_color_code
from ludoxel.presentation.rendering.faces.bucket_layout import FACE_COUNT
from ludoxel.presentation.rendering.faces.row_utils import UVRect, append_face_instance, face_rows_from_buffers
from ludoxel.simulation.actors.ai_players.state import AI_HEALTH_INDICATOR_ABOVE, AI_HEALTH_INDICATOR_BELOW, AI_HEALTH_INDICATOR_OFF, normalize_ai_health_indicator

NAME_TAG_DEFAULT_COLOR_CODE: str = "7"
NAME_TAG_DEFAULT_FORMAT_PREFIX: str = f"{SECTION_SIGN}{NAME_TAG_DEFAULT_COLOR_CODE}"
NAME_TAG_BACKGROUND_OPACITY: float = 0.30
NAME_TAG_BOX_HEIGHT_PX: int = 20
NAME_TAG_HORIZONTAL_PADDING_PX: int = 6
NAME_TAG_VERTICAL_PADDING_PX: int = 2
NAME_TAG_FONT_POINT_SIZE: int = 10
NAME_TAG_BOX_WORLD_HEIGHT_BLOCKS: float = 0.22
NAME_TAG_ANCHOR_OFFSET_BLOCKS: float = 0.24
NAME_TAG_CROUCH_ANCHOR_OFFSET_BLOCKS: float = 0.12
NAME_TAG_THIRD_PERSON_TARGET_DISTANCE_BLOCKS: float = 4.0
NAME_TAG_FACE_INDEX: int = 4
NAME_TAG_COMPONENT_GAP_PX: int = 2
NAME_TAG_HEART_GAP_PX: int = 2
NAME_TAG_HEART_PIXEL_SCALE: int = 2
NAME_TAG_MIN_TEXTURE_SIDE_PX: int = 1
NAME_TAG_UV_RECT: UVRect = (0.0, 0.0, 1.0, 1.0)
_NAME_TAG_AXIS_EPSILON: float = 1e-6
_NAME_TAG_WORLD_DEPTH_SCALE: float = 1.0

_HEART_MASK: tuple[str, ...] = ("01100110", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000")
_HEART_OUTLINE_COLOR = "#19090a"
_HEART_FILL_COLOR = "#cc2e43"
_HEART_HIGHLIGHT_COLOR = "#ff8e8f"


@dataclass(frozen=True)
class NameTagRenderState:
  tag_id: str
  text: str
  anchor: Vec3
  target: Vec3
  fallback_forward: Vec3 = field(default_factory=lambda: Vec3(0.0, 0.0, 1.0))
  health: float | None = None
  max_health: float | None = None
  health_indicator: str = AI_HEALTH_INDICATOR_OFF


@dataclass(frozen=True)
class NameTagTextureSpec:
  content_key: tuple[object, ...]
  image: QImage
  width_px: int
  height_px: int
  name_box_height_px: int
  name_box_bottom_px: int

  def anchor_bottom_ratio(self) -> float:
    return float(max(0, int(self.height_px) - int(self.name_box_bottom_px))) / max(1.0, float(self.height_px))


def name_tag_content_key(tag: NameTagRenderState) -> tuple[object, ...]:
  indicator = normalize_ai_health_indicator(tag.health_indicator)
  max_health = None if tag.max_health is None else round(float(max(2.0, float(tag.max_health))), 6)
  health = None if tag.health is None or max_health is None else round(float(clampf(float(tag.health), 0.0, float(max_health))), 6)
  return (str(tag.text).strip(), health, max_health, str(indicator))


def name_tag_has_explicit_color_code(text: str) -> bool:
  source = str(text)
  for index, char in enumerate(source[:-1]):
    if char == SECTION_SIGN and is_color_code(source[int(index) + 1]):
      return True
  return False


def formatted_name_tag_text(text: str) -> str:
  body = str(text).strip()
  if not body:
    return ""
  if name_tag_has_explicit_color_code(body):
    return body
  return f"{NAME_TAG_DEFAULT_FORMAT_PREFIX}{body}"


def render_name_tag_texture(tag: NameTagRenderState) -> NameTagTextureSpec | None:
  text = str(tag.text).strip()
  if not text:
    return None

  content_key = name_tag_content_key(tag)
  mode = normalize_ai_health_indicator(tag.health_indicator)
  hearts_visible = bool(mode in (AI_HEALTH_INDICATOR_ABOVE, AI_HEALTH_INDICATOR_BELOW) and tag.health is not None and tag.max_health is not None)
  hearts_size = _heart_strip_size(float(tag.max_health)) if bool(hearts_visible) else QSize(0, 0)
  text_runs = tuple(parse_formatted_text(formatted_name_tag_text(text)))
  base_font = _base_name_tag_font()
  text_width = sum(_run_width(segment, base_font=base_font) for segment in text_runs)
  box_width = int(max(1, int(math.ceil(float(text_width))) + 2 * int(NAME_TAG_HORIZONTAL_PADDING_PX)))
  box_height = int(max(int(NAME_TAG_BOX_HEIGHT_PX), _runs_height(text_runs, base_font=base_font) + 2 * int(NAME_TAG_VERTICAL_PADDING_PX)))
  hearts_w = int(hearts_size.width())
  hearts_h = int(hearts_size.height())
  gap = int(NAME_TAG_COMPONENT_GAP_PX) if bool(hearts_visible) and int(hearts_h) > 0 else 0
  image_w = int(max(int(NAME_TAG_MIN_TEXTURE_SIDE_PX), int(box_width), int(hearts_w)))
  image_h = int(max(int(NAME_TAG_MIN_TEXTURE_SIDE_PX), int(box_height) + int(hearts_h) + int(gap)))

  box_y = 0
  hearts_y = 0
  if bool(hearts_visible) and mode == AI_HEALTH_INDICATOR_ABOVE:
    hearts_y = 0
    box_y = int(hearts_h + gap)
  elif bool(hearts_visible):
    box_y = 0
    hearts_y = int(box_height + gap)

  image = QImage(int(image_w), int(image_h), QImage.Format.Format_RGBA8888)
  image.fill(Qt.GlobalColor.transparent)
  painter = QPainter(image)
  painter.setRenderHint(QPainter.RenderHint.TextAntialiasing, True)

  box_x = int(round((float(image_w) - float(box_width)) * 0.5))
  painter.fillRect(QRect(int(box_x), int(box_y), int(box_width), int(box_height)), QColor(0, 0, 0, int(round(255.0 * float(NAME_TAG_BACKGROUND_OPACITY)))))
  _paint_text_runs(painter, runs=text_runs, base_font=base_font, box_x=int(box_x), box_y=int(box_y), box_width=int(box_width), box_height=int(box_height), seed=str(content_key))

  if bool(hearts_visible):
    hearts_x = int(round((float(image_w) - float(hearts_w)) * 0.5))
    _paint_heart_strip(painter, x=int(hearts_x), y=int(hearts_y), health=float(tag.health), max_health=float(tag.max_health))
  painter.end()

  return NameTagTextureSpec(content_key=content_key, image=image, width_px=int(image_w), height_px=int(image_h), name_box_height_px=int(box_height), name_box_bottom_px=int(box_y + box_height))


def build_name_tag_face_rows(tag: NameTagRenderState, spec: NameTagTextureSpec) -> tuple[np.ndarray, ...]:
  buffers: list[list[list[float]]] = [[] for _ in range(FACE_COUNT)]
  append_face_instance(buffers, int(NAME_TAG_FACE_INDEX), name_tag_model_matrix(tag, spec), NAME_TAG_UV_RECT)
  return face_rows_from_buffers(buffers)


def name_tag_model_matrix(tag: NameTagRenderState, spec: NameTagTextureSpec) -> np.ndarray:
  anchor = tag.anchor
  front = _horizontal_direction(tag.target - tag.anchor)
  if front.length() <= float(_NAME_TAG_AXIS_EPSILON):
    front = _horizontal_direction(tag.fallback_forward)
  if front.length() <= float(_NAME_TAG_AXIS_EPSILON):
    front = Vec3(0.0, 0.0, 1.0)
  up = Vec3(0.0, 1.0, 0.0)
  right = up.cross(front).normalized()
  if right.length() <= float(_NAME_TAG_AXIS_EPSILON):
    right = Vec3(1.0, 0.0, 0.0)

  scale = float(NAME_TAG_BOX_WORLD_HEIGHT_BLOCKS) / max(1.0, float(spec.name_box_height_px))
  world_w = float(spec.width_px) * float(scale)
  world_h = float(spec.height_px) * float(scale)
  axis_x = right * float(world_w)
  axis_y = up * float(world_h)
  axis_z = front * float(_NAME_TAG_WORLD_DEPTH_SCALE)
  local_anchor_y = -0.5 + float(spec.anchor_bottom_ratio())
  translation = anchor - axis_y * float(local_anchor_y) - axis_z * 0.5

  return np.asarray(((float(axis_x.x), float(axis_y.x), float(axis_z.x), float(translation.x)), (float(axis_x.y), float(axis_y.y), float(axis_z.y), float(translation.y)), (float(axis_x.z), float(axis_y.z), float(axis_z.z), float(translation.z)), (0.0, 0.0, 0.0, 1.0)), dtype=np.float32)


def _horizontal_direction(value: Vec3) -> Vec3:
  return Vec3(float(value.x), 0.0, float(value.z)).normalized()


def _base_name_tag_font() -> QFont:
  app = QGuiApplication.instance()
  font = QFont(app.font() if app is not None else QFont())
  font.setPointSize(int(NAME_TAG_FONT_POINT_SIZE))
  return font


def _font_for_run(base_font: QFont, segment) -> QFont:
  font = QFont(base_font)
  font.setBold(bool(segment.bold))
  font.setItalic(bool(segment.italic))
  font.setUnderline(bool(segment.underline))
  font.setStrikeOut(bool(segment.strikethrough))
  return font


def _run_draw_text(segment, *, seed: str) -> str:
  source = str(segment.text)
  if not bool(segment.obfuscated):
    return source
  rng = Random(f"{seed}:{source}")
  return "".join(obfuscated_char_for(ch, rng) if not ch.isspace() else ch for ch in source)


def _run_width(segment, *, base_font: QFont) -> int:
  font = _font_for_run(base_font, segment)
  metrics = QFontMetrics(font)
  return int(metrics.horizontalAdvance(str(segment.text)))


def _runs_height(runs, *, base_font: QFont) -> int:
  if not runs:
    return int(QFontMetrics(base_font).height())
  return max(int(QFontMetrics(_font_for_run(base_font, segment)).height()) for segment in runs)


def _paint_text_runs(painter: QPainter, *, runs, base_font: QFont, box_x: int, box_y: int, box_width: int, box_height: int, seed: str) -> None:
  total_width = sum(_run_width(segment, base_font=base_font) for segment in runs)
  run_height = _runs_height(runs, base_font=base_font)
  x = int(box_x) + int(round((float(box_width) - float(total_width)) * 0.5))
  y = int(box_y) + int(round((float(box_height) - float(run_height)) * 0.5))
  for segment in runs:
    font = _font_for_run(base_font, segment)
    metrics = QFontMetrics(font)
    draw_text = _run_draw_text(segment, seed=str(seed))
    painter.setFont(font)
    painter.setPen(QColor(str(segment.foreground)))
    if draw_text:
      painter.drawText(int(x), int(y + metrics.ascent()), draw_text)
    x += int(metrics.horizontalAdvance(str(segment.text)))


def _heart_count(max_health: float) -> int:
  return max(1, int(math.ceil(max(2.0, float(max_health)) * 0.5)))


def _heart_strip_size(max_health: float) -> QSize:
  pattern_width = len(_HEART_MASK[0])
  pattern_height = len(_HEART_MASK)
  count = _heart_count(float(max_health))
  width = count * pattern_width * int(NAME_TAG_HEART_PIXEL_SCALE) + (count - 1) * int(NAME_TAG_HEART_GAP_PX)
  return QSize(int(width), int(pattern_height * int(NAME_TAG_HEART_PIXEL_SCALE)))


def _paint_pixel_heart(painter: QPainter, *, x: int, y: int, fill_ratio: float) -> None:
  scale = int(NAME_TAG_HEART_PIXEL_SCALE)
  fill_limit_x = int(round(float(x) + float(len(_HEART_MASK[0]) * scale) * float(fill_ratio)))
  for row_index, row in enumerate(_HEART_MASK):
    for col_index, value in enumerate(row):
      if value != "1":
        continue
      px = int(x) + int(col_index) * scale
      py = int(y) + int(row_index) * scale
      painter.fillRect(px, py, scale, scale, QColor(_HEART_OUTLINE_COLOR))
      if int(px + scale) <= int(fill_limit_x):
        painter.fillRect(px, py, scale, scale, QColor(_HEART_FILL_COLOR))
      elif int(px) < int(fill_limit_x):
        painter.fillRect(px, py, int(fill_limit_x) - int(px), scale, QColor(_HEART_FILL_COLOR))
      if row_index <= 1 and int(px + scale) <= int(fill_limit_x):
        painter.fillRect(px, py, scale, 1, QColor(_HEART_HIGHLIGHT_COLOR))


def _paint_heart_strip(painter: QPainter, *, x: int, y: int, health: float, max_health: float) -> None:
  next_max = max(2.0, float(max_health))
  filled_hearts = float(clampf(float(health), 0.0, float(next_max))) * 0.5
  heart_width = len(_HEART_MASK[0]) * int(NAME_TAG_HEART_PIXEL_SCALE)
  for index in range(_heart_count(float(next_max))):
    heart_x = int(x) + int(index) * (int(heart_width) + int(NAME_TAG_HEART_GAP_PX))
    _paint_pixel_heart(painter, x=int(heart_x), y=int(y), fill_ratio=clampf(float(filled_hearts) - float(index), 0.0, 1.0))
