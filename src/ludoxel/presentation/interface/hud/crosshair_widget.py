# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from PyQt6.QtCore import QPointF, Qt
from PyQt6.QtGui import QColor, QPainter, QPen
from PyQt6.QtWidgets import QWidget

from ludoxel.application.preferences.crosshair import CROSSHAIR_MODE_DEFAULT, EMPTY_CROSSHAIR_PIXELS
from ludoxel.presentation.interface.hud.crosshair_art import render_crosshair_image
from ludoxel.presentation.interface.hud.crosshair_axis import axis_screen_offsets

_GAME_CROSSHAIR_SCALE = 2

_AXIS_ARM_LENGTH = 13.0
_AXIS_CENTER_GAP = 3.0
_AXIS_LINE_WIDTH = 2.0
_AXIS_MIN_VISIBLE_LENGTH = 1.0
_AXIS_COLOR_X = (235, 70, 60, 240)
_AXIS_COLOR_Y = (70, 205, 85, 240)
_AXIS_COLOR_Z = (80, 130, 245, 240)
_AXIS_COLORS = (_AXIS_COLOR_X, _AXIS_COLOR_Y, _AXIS_COLOR_Z)


class CrosshairWidget(QWidget):
  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self.setAttribute(Qt.WidgetAttribute.WA_NoSystemBackground, True)
    self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
    self._mode = CROSSHAIR_MODE_DEFAULT
    self._custom_pixels: tuple[str, ...] = EMPTY_CROSSHAIR_PIXELS
    self._image = render_crosshair_image(self._mode, self._custom_pixels, scale=int(_GAME_CROSSHAIR_SCALE))
    self._axis_enabled = False
    self._axis_yaw_deg = 0.0
    self._axis_pitch_deg = 0.0
    self._axis_roll_deg = 0.0

  def set_pattern(self, *, mode: object, custom_pixels: object) -> None:
    self._mode = str(mode or "")
    self._custom_pixels = tuple(str(row) for row in custom_pixels) if isinstance(custom_pixels, (list, tuple)) else EMPTY_CROSSHAIR_PIXELS
    self._image = render_crosshair_image(self._mode, self._custom_pixels, scale=int(_GAME_CROSSHAIR_SCALE))
    self.update()

  def set_axis_crosshair_enabled(self, enabled: bool) -> None:
    flag = bool(enabled)
    if flag == bool(self._axis_enabled):
      return
    self._axis_enabled = flag
    self.update()

  def set_axis_camera(self, *, yaw_deg: float, pitch_deg: float, roll_deg: float) -> None:
    yaw = float(yaw_deg)
    pitch = float(pitch_deg)
    roll = float(roll_deg)
    if yaw == float(self._axis_yaw_deg) and pitch == float(self._axis_pitch_deg) and roll == float(self._axis_roll_deg):
      return
    self._axis_yaw_deg = yaw
    self._axis_pitch_deg = pitch
    self._axis_roll_deg = roll
    if bool(self._axis_enabled):
      self.update()

  def paintEvent(self, _e) -> None:
    w = self.width()
    h = self.height()
    if w <= 1 or h <= 1:
      return

    if bool(self._axis_enabled):
      p = QPainter(self)
      self._paint_axis_crosshair(p)
      p.end()
      return

    if self._image.isNull():
      return

    p = QPainter(self)
    p.setRenderHint(QPainter.RenderHint.Antialiasing, False)
    left = (int(w) - int(self._image.width())) // 2
    top = (int(h) - int(self._image.height())) // 2
    p.drawImage(int(left), int(top), self._image)
    p.end()

  def _paint_axis_crosshair(self, p: QPainter) -> None:
    center_x = float(self.width()) * 0.5
    center_y = float(self.height()) * 0.5
    offsets = axis_screen_offsets(yaw_deg=float(self._axis_yaw_deg), pitch_deg=float(self._axis_pitch_deg), roll_deg=float(self._axis_roll_deg))
    p.setRenderHint(QPainter.RenderHint.Antialiasing, True)
    for offset, rgba in zip(offsets, _AXIS_COLORS):
      if offset is None:
        continue
      ox, oy = offset
      magnitude = math.hypot(float(ox), float(oy))
      if not math.isfinite(float(magnitude)) or float(magnitude) <= 1e-6:
        continue
      arm_length = float(magnitude) * float(_AXIS_ARM_LENGTH)
      if float(arm_length) - float(_AXIS_CENTER_GAP) < float(_AXIS_MIN_VISIBLE_LENGTH):
        continue
      unit_x = float(ox) / float(magnitude)
      unit_y = float(oy) / float(magnitude)
      start_x = float(center_x) + float(unit_x) * float(_AXIS_CENTER_GAP)
      start_y = float(center_y) + float(unit_y) * float(_AXIS_CENTER_GAP)
      end_x = float(center_x) + float(unit_x) * float(arm_length)
      end_y = float(center_y) + float(unit_y) * float(arm_length)
      pen = QPen(QColor(int(rgba[0]), int(rgba[1]), int(rgba[2]), int(rgba[3])))
      pen.setWidthF(float(_AXIS_LINE_WIDTH))
      pen.setCapStyle(Qt.PenCapStyle.RoundCap)
      p.setPen(pen)
      p.drawLine(QPointF(float(start_x), float(start_y)), QPointF(float(end_x), float(end_y)))
