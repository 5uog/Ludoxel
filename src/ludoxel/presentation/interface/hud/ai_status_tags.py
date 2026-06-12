# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from PyQt6.QtCore import QSize, Qt
from PyQt6.QtGui import QColor, QPainter, QPixmap
from PyQt6.QtWidgets import QGraphicsOpacityEffect, QLabel, QWidget

from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.ai_players.state import AI_HEALTH_INDICATOR_ABOVE, AI_HEALTH_INDICATOR_BELOW, normalize_ai_health_indicator

_AI_TAG_SCREEN_MARGIN_PX = 8
_AI_TAG_COMPONENT_GAP_PX = 2
_AI_TAG_HEART_GAP_PX = 2
_HEART_PIXEL_SCALE = 2

_HEART_MASK: tuple[str, ...] = ("01100110", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000")
_HEART_OUTLINE_COLOR = "#19090a"
_HEART_FILL_COLOR = "#cc2e43"
_HEART_HIGHLIGHT_COLOR = "#ff8e8f"


def _heart_count(max_health: float) -> int:
  return max(1, int(math.ceil(max(2.0, float(max_health)) * 0.5)))


def _heart_strip_size(max_health: float) -> QSize:
  pattern_width = len(_HEART_MASK[0])
  pattern_height = len(_HEART_MASK)
  count = _heart_count(float(max_health))
  width = count * pattern_width * int(_HEART_PIXEL_SCALE) + (count - 1) * int(_AI_TAG_HEART_GAP_PX)
  return QSize(int(width), int(pattern_height * int(_HEART_PIXEL_SCALE)))


def _paint_pixel_heart(painter: QPainter, *, x: int, y: int, fill_ratio: float) -> None:
  """
  一個の pixel heart を外形色で敷いた上に、fill_ratio に応じた横方向の部分塗りを重ねて描画する。
  ここでは常に基準解像度で描画し、距離による縮尺は完成した tag block 全体へ後段で適用する。
  """
  scale = int(_HEART_PIXEL_SCALE)
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
  heart_width = len(_HEART_MASK[0]) * int(_HEART_PIXEL_SCALE)
  for index in range(_heart_count(float(next_max))):
    heart_x = int(x) + int(index) * (int(heart_width) + int(_AI_TAG_HEART_GAP_PX))
    _paint_pixel_heart(painter, x=int(heart_x), y=int(y), fill_ratio=clampf(float(filled_hearts) - float(index), 0.0, 1.0))


class _AiStatusTagWidget(QWidget):
  """
  AI 一体分の nametag と health indicator を一枚の基準解像度 pixmap へ合成して表示する。
  距離スケールは完成した pixmap の表示 geometry と描画先矩形へ適用するため、文字だけでなく背景、padding、heart、間隔を含む block 全体が同じ比率で縮小される。
  """

  def __init__(self, parent: QWidget) -> None:
    super().__init__(parent)
    self._source_label = QLabel()
    self._source_label.setObjectName("playerNameTag")
    self._source_label.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self._source_label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self._source_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    self._base_pixmap = QPixmap(1, 1)
    self._base_pixmap.fill(Qt.GlobalColor.transparent)
    self._name_bottom_px = 1
    self._content_key: tuple[object, ...] | None = None
    self._display_scale = 1.0
    self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
    self.setVisible(False)
    self._opacity_effect = QGraphicsOpacityEffect(self)
    self._opacity_effect.setOpacity(1.0)
    self.setGraphicsEffect(self._opacity_effect)

  def set_content(self, *, name: str, health: float, max_health: float, indicator: str) -> bool:
    text = str(name).strip()
    mode = normalize_ai_health_indicator(indicator)
    next_max = max(2.0, float(max_health))
    next_health = float(clampf(float(health), 0.0, float(next_max)))
    content_key = (text, round(float(next_health), 6), round(float(next_max), 6), str(mode))
    if content_key != self._content_key:
      self._content_key = content_key
      self._rebuild_base_pixmap(name=text, health=float(next_health), max_health=float(next_max), indicator=str(mode))
    return bool(text) or mode in (AI_HEALTH_INDICATOR_ABOVE, AI_HEALTH_INDICATOR_BELOW)

  def _render_name_pixmap(self, text: str) -> QPixmap | None:
    if not text:
      return None
    self._source_label.setText(str(text))
    self._source_label.ensurePolished()
    self._source_label.adjustSize()
    size = self._source_label.size()
    pixmap = QPixmap(max(1, int(size.width())), max(1, int(size.height())))
    pixmap.fill(Qt.GlobalColor.transparent)
    self._source_label.render(pixmap)
    return pixmap

  def _rebuild_base_pixmap(self, *, name: str, health: float, max_health: float, indicator: str) -> None:
    name_pixmap = self._render_name_pixmap(str(name))
    hearts_visible = indicator in (AI_HEALTH_INDICATOR_ABOVE, AI_HEALTH_INDICATOR_BELOW)
    hearts_size = _heart_strip_size(float(max_health)) if hearts_visible else QSize(0, 0)
    name_w = 0 if name_pixmap is None else int(name_pixmap.width())
    name_h = 0 if name_pixmap is None else int(name_pixmap.height())
    hearts_w = int(hearts_size.width())
    hearts_h = int(hearts_size.height())
    gap = int(_AI_TAG_COMPONENT_GAP_PX) if name_h > 0 and hearts_h > 0 else 0
    base_w = max(1, int(max(name_w, hearts_w)))
    base_h = max(1, int(name_h + hearts_h + gap))

    name_y = 0
    hearts_y = 0
    if hearts_visible and indicator == AI_HEALTH_INDICATOR_ABOVE:
      hearts_y = 0
      name_y = int(hearts_h + gap)
    elif hearts_visible:
      name_y = 0
      hearts_y = int(name_h + gap)

    pixmap = QPixmap(int(base_w), int(base_h))
    pixmap.fill(Qt.GlobalColor.transparent)
    painter = QPainter(pixmap)
    if name_pixmap is not None:
      name_x = int(round((float(base_w) - float(name_w)) * 0.5))
      painter.drawPixmap(int(name_x), int(name_y), name_pixmap)
    if hearts_visible:
      hearts_x = int(round((float(base_w) - float(hearts_w)) * 0.5))
      _paint_heart_strip(painter, x=int(hearts_x), y=int(hearts_y), health=float(health), max_health=float(max_health))
    painter.end()

    self._base_pixmap = pixmap
    self._name_bottom_px = int(name_y + name_h) if name_h > 0 else int(base_h)
    self.update()

  def place(self, *, center_x: float, anchor_bottom_y: float, scale: float, opacity: float, viewport_w: int, viewport_h: int) -> None:
    self._display_scale = max(0.05, float(scale))
    display_w = max(1, int(round(float(self._base_pixmap.width()) * float(self._display_scale))))
    display_h = max(1, int(round(float(self._base_pixmap.height()) * float(self._display_scale))))
    name_bottom = float(self._name_bottom_px) * float(self._display_scale)
    margin = int(_AI_TAG_SCREEN_MARGIN_PX)
    x = int(round(float(center_x) - float(display_w) * 0.5))
    y = int(round(float(anchor_bottom_y) - float(name_bottom)))
    x = max(margin, min(max(margin, int(viewport_w) - int(display_w) - margin), int(x)))
    y = max(margin, min(max(margin, int(viewport_h) - int(display_h) - margin), int(y)))
    self._opacity_effect.setOpacity(float(clampf(float(opacity), 0.0, 1.0)))
    self.setGeometry(int(x), int(y), int(display_w), int(display_h))
    self.setVisible(True)
    self.raise_()
    self.update()

  def paintEvent(self, event) -> None:
    del event
    painter = QPainter(self)
    painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform, True)
    painter.drawPixmap(self.rect(), self._base_pixmap)
    painter.end()

  def dispose(self) -> None:
    self._source_label.deleteLater()
    self.deleteLater()


class AiStatusTagPool:
  """
  viewport 上へ投影される AI nametag と health indicator の composite widget を actor_id 単位で管理する pool を表す。
  呼び出し側は frame ごとに begin_frame()、可視 actor ごとに show_tag()、最後に end_frame() を呼ぶ。
  """

  def __init__(self, parent: QWidget) -> None:
    self._parent = parent
    self._entries: dict[str, _AiStatusTagWidget] = {}
    self._seen_ids: set[str] = set()

  def begin_frame(self) -> None:
    self._seen_ids = set()

  def show_tag(self, *, actor_id: str, name: str, health: float, max_health: float, indicator: str, center_x: float, anchor_bottom_y: float, opacity: float, scale: float = 1.0) -> None:
    """
    一体の AI tag を配置する。scale は camera から AI までの距離に基づく透視縮尺であり、合成済み block 全体へ適用される。
    """
    key = str(actor_id)
    self._seen_ids.add(key)
    entry = self._entries.get(key)
    if entry is None:
      entry = _AiStatusTagWidget(self._parent)
      self._entries[key] = entry
    if not entry.set_content(name=str(name), health=float(health), max_health=float(max_health), indicator=str(indicator)):
      entry.setVisible(False)
      return
    entry.place(
      center_x=float(center_x),
      anchor_bottom_y=float(anchor_bottom_y),
      scale=float(scale),
      opacity=float(opacity),
      viewport_w=max(1, int(self._parent.width())),
      viewport_h=max(1, int(self._parent.height())),
    )

  def end_frame(self) -> None:
    stale_ids = [actor_id for actor_id in self._entries.keys() if actor_id not in self._seen_ids]
    for actor_id in stale_ids:
      entry = self._entries.pop(str(actor_id), None)
      if entry is not None:
        entry.setVisible(False)
        entry.dispose()

  def hide_all(self) -> None:
    for entry in self._entries.values():
      entry.setVisible(False)
