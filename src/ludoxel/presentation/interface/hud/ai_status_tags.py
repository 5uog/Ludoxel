# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from PyQt6.QtCore import QSize, Qt
from PyQt6.QtGui import QColor, QPainter
from PyQt6.QtWidgets import QGraphicsOpacityEffect, QLabel, QWidget

from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.simulation.actors.ai_players.state import AI_HEALTH_INDICATOR_ABOVE, AI_HEALTH_INDICATOR_BELOW, normalize_ai_health_indicator

_AI_TAG_SCREEN_MARGIN_PX = 8
_AI_TAG_HEART_GAP_PX = 2

_HEART_MASK: tuple[str, ...] = ("01100110", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000")
_HEART_OUTLINE_COLOR = "#19090a"
_HEART_FILL_COLOR = "#cc2e43"
_HEART_HIGHLIGHT_COLOR = "#ff8e8f"


class _AiHeartStrip(QWidget):
  """
  AI 一体分の体力を pixel heart の単一行として描画する overlay widget を表す。
  描画 pattern、塗り色、半 heart の部分塗りは player Survival HUD の heart 表示(presentation/interface/hud/hotbar_widget.py の _HealthStrip)と同一であり、1 heart = 2 health points、half heart = 1 health point の対応で塗り量を決める。
  heart 数は ceil(max_health / 2) で定まり、max_health = 20 のとき 10 hearts を一行で表示する。max_health が 20 を超える場合も同一行に heart を追加し、行幅は heart 数に比例して伸びる。
  mouse event を透過し、表示位置と可視性は AiStatusTagPool が管理する。
  """

  _SCALE = 2

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self._health = 20.0
    self._max_health = 20.0
    self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)

  def set_health(self, *, health: float, max_health: float) -> None:
    """
    表示対象の現在体力と最大体力を更新し、必要な場合のみ再描画を要求する。
    max_health は heart 数の縮退を避けるため下限 2.0 へ clamp し、health は [0, max_health] へ clamp する。
    """
    next_max = max(2.0, float(max_health))
    next_health = max(0.0, min(float(health), float(next_max)))
    if abs(float(self._health) - float(next_health)) <= 1e-9 and abs(float(self._max_health) - float(next_max)) <= 1e-9:
      return
    self._health = float(next_health)
    self._max_health = float(next_max)
    self.update()

  def _heart_count(self) -> int:
    return max(1, int(math.ceil(float(self._max_health) * 0.5)))

  def sizeHint(self) -> QSize:
    pattern_width = len(_HEART_MASK[0])
    pattern_height = len(_HEART_MASK)
    heart_count = self._heart_count()
    width = heart_count * pattern_width * int(self._SCALE) + (heart_count - 1) * int(_AI_TAG_HEART_GAP_PX)
    return QSize(int(width), int(pattern_height * int(self._SCALE)))

  def paintEvent(self, event) -> None:
    del event
    painter = QPainter(self)
    painter.setRenderHint(QPainter.RenderHint.Antialiasing, False)
    pattern_width = len(_HEART_MASK[0])
    heart_width = pattern_width * int(self._SCALE)
    filled_hearts = float(self._health) * 0.5
    for index in range(self._heart_count()):
      x = int(index) * (int(heart_width) + int(_AI_TAG_HEART_GAP_PX))
      self._paint_pixel_heart(painter, x=int(x), y=0, fill_ratio=clampf(float(filled_hearts) - float(index), 0.0, 1.0))
    painter.end()

  def _paint_pixel_heart(self, painter: QPainter, *, x: int, y: int, fill_ratio: float) -> None:
    """
    一個の pixel heart を外形色で敷いた上に、fill_ratio(0.0〜1.0)に応じた横方向の部分塗りを重ねて描画する。
    fill_ratio = 0.5 が half heart(1 health point)に対応し、塗り境界は scale 済み pixel 単位で切り詰める。
    """
    scale = int(self._SCALE)
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


class _AiTagEntry:
  """
  AI 一体分の nametag QLabel と heart strip、及び各 widget の opacity effect を束ねる内部 record を表す。
  nametag は player の世界内 nametag と同じ "playerNameTag" object name を持ち、theme QSS の同一 style を共有する。
  """

  def __init__(self, parent: QWidget) -> None:
    self.name_label = QLabel(parent)
    self.name_label.setObjectName("playerNameTag")
    self.name_label.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.name_label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self.name_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    self.name_label.setVisible(False)
    self.name_effect = QGraphicsOpacityEffect(self.name_label)
    self.name_effect.setOpacity(1.0)
    self.name_label.setGraphicsEffect(self.name_effect)
    self.hearts = _AiHeartStrip(parent)
    self.hearts.setVisible(False)
    self.hearts_effect = QGraphicsOpacityEffect(self.hearts)
    self.hearts_effect.setOpacity(1.0)
    self.hearts.setGraphicsEffect(self.hearts_effect)

  def hide(self) -> None:
    self.name_label.setVisible(False)
    self.hearts.setVisible(False)

  def dispose(self) -> None:
    self.name_label.deleteLater()
    self.hearts.deleteLater()


class AiStatusTagPool:
  """
  viewport 上へ投影される AI nametag と health indicator の widget 集合を actor_id 単位で管理する pool を表す。
  呼び出し側(render loop の overlay 更新)は frame ごとに begin_frame() を呼び、可視 actor ごとに show_tag() で screen 座標と表示内容を与え、end_frame() で未更新 entry の非表示化と消滅 actor の widget 破棄を行う。
  pool は simulation 状態を保持せず、与えられた snapshot 値の表示だけを担う。widget の親は viewport widget であり、配置座標は viewport local pixel で与えられる。
  """

  def __init__(self, parent: QWidget) -> None:
    self._parent = parent
    self._entries: dict[str, _AiTagEntry] = {}
    self._seen_ids: set[str] = set()

  def begin_frame(self) -> None:
    self._seen_ids = set()

  def show_tag(self, *, actor_id: str, name: str, health: float, max_health: float, indicator: str, center_x: float, anchor_bottom_y: float, opacity: float) -> None:
    """
    一体の AI について nametag と heart indicator を配置して表示する。
    anchor_bottom_y は nametag 下端が一致すべき viewport local y 座標であり、indicator が "above" の場合は nametag 上端の直上、"below" の場合は nametag 下端の直下に heart strip を重ならない間隔で置く。
    indicator が "off" の場合は heart strip を表示しない。両 widget は viewport 内へ margin 付きで clamp され、opacity は [0, 1] へ clamp した値を共通適用する。
    """
    key = str(actor_id)
    self._seen_ids.add(key)
    entry = self._entries.get(key)
    if entry is None:
      entry = _AiTagEntry(self._parent)
      self._entries[key] = entry

    text = str(name).strip()
    mode = normalize_ai_health_indicator(indicator)
    clamped_opacity = float(clampf(float(opacity), 0.0, 1.0))
    viewport_w = max(1, int(self._parent.width()))
    viewport_h = max(1, int(self._parent.height()))
    margin = int(_AI_TAG_SCREEN_MARGIN_PX)

    name_visible = bool(text)
    label_w = 0
    label_h = 0
    name_x = 0
    name_y = 0
    if name_visible:
      entry.name_label.setText(text)
      entry.name_label.adjustSize()
      label_w = int(max(1, entry.name_label.width()))
      label_h = int(max(1, entry.name_label.height()))
      name_x = int(round(float(center_x) - float(label_w) * 0.5))
      name_y = int(round(float(anchor_bottom_y) - float(label_h)))
      name_x = max(margin, min(max(margin, viewport_w - label_w - margin), int(name_x)))
      name_y = max(margin, min(max(margin, viewport_h - label_h - margin), int(name_y)))
      entry.name_effect.setOpacity(clamped_opacity)
      entry.name_label.setGeometry(int(name_x), int(name_y), int(label_w), int(label_h))
      entry.name_label.setVisible(True)
      entry.name_label.raise_()
    else:
      entry.name_label.setVisible(False)

    hearts_visible = mode in (AI_HEALTH_INDICATOR_ABOVE, AI_HEALTH_INDICATOR_BELOW)
    if hearts_visible:
      entry.hearts.set_health(health=float(health), max_health=float(max_health))
      hearts_size = entry.hearts.sizeHint()
      hearts_w = int(max(1, hearts_size.width()))
      hearts_h = int(max(1, hearts_size.height()))
      hearts_x = int(round(float(center_x) - float(hearts_w) * 0.5))
      if name_visible:
        if mode == AI_HEALTH_INDICATOR_ABOVE:
          hearts_y = int(name_y) - int(hearts_h) - 2
        else:
          hearts_y = int(name_y) + int(label_h) + 2
      else:
        hearts_y = int(round(float(anchor_bottom_y) - float(hearts_h)))
      hearts_x = max(margin, min(max(margin, viewport_w - hearts_w - margin), int(hearts_x)))
      hearts_y = max(margin, min(max(margin, viewport_h - hearts_h - margin), int(hearts_y)))
      entry.hearts_effect.setOpacity(clamped_opacity)
      entry.hearts.setGeometry(int(hearts_x), int(hearts_y), int(hearts_w), int(hearts_h))
      entry.hearts.setVisible(True)
      entry.hearts.raise_()
    else:
      entry.hearts.setVisible(False)

  def end_frame(self) -> None:
    """
    直近 frame の show_tag() で更新されなかった entry を非表示にし、actor が消滅したままの widget を pool から破棄する。
    非表示と破棄を同時に行うため、despawn 済み AI の nametag と heart strip が画面へ残留しない。
    """
    stale_ids = [actor_id for actor_id in self._entries.keys() if actor_id not in self._seen_ids]
    for actor_id in stale_ids:
      entry = self._entries.pop(str(actor_id), None)
      if entry is not None:
        entry.hide()
        entry.dispose()

  def hide_all(self) -> None:
    """
    すべての entry を即時に非表示へ切り替える。
    HUD 非表示、loading、pause、settings、inventory、death などの overlay 状態では render loop の更新が止まるため、可視性同期側からこの method で残留表示を防ぐ。
    """
    for entry in self._entries.values():
      entry.hide()
