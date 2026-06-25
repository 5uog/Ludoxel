# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import colorsys
import hashlib
from dataclasses import dataclass

import numpy as np
from PyQt6.QtCore import QPointF, Qt
from PyQt6.QtGui import QColor, QPainter, QPen
from PyQt6.QtWidgets import QWidget

import ludoxel.foundations.mathematics.linear.mat4 as mat4
from ludoxel.foundations.mathematics.linear.transform_matrices import rotate_z_deg_matrix
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.linear.view_angles import forward_from_yaw_pitch_deg

_VIEW_CLIP_MARGIN = 1.2
_VIEW_CLIP_EPSILON = 1e-6
_COMPLETED_ROUTE_COLOR_SATURATION = 0.58
_COMPLETED_ROUTE_COLOR_VALUE = 1.0
_COMPLETED_ROUTE_FALLBACK_COLOR = "#67d7ff"
_DRAFT_ROUTE_COLOR = "#7df279"


def completed_route_color_hex(actor_id: str) -> str:
  identity = str(actor_id).strip() or "ai-route"
  digest = hashlib.blake2s(identity.encode("utf-8"), digest_size=2).digest()
  hue = (int.from_bytes(digest, "big") % 360) / 360.0
  red, green, blue = colorsys.hsv_to_rgb(float(hue), float(_COMPLETED_ROUTE_COLOR_SATURATION), float(_COMPLETED_ROUTE_COLOR_VALUE))
  return f"#{int(round(float(red) * 255.0)):02x}{int(round(float(green) * 255.0)):02x}{int(round(float(blue) * 255.0)):02x}"


@dataclass(frozen=True)
class RouteOverlayPath:
  points: tuple[Vec3, ...]
  closed: bool = False
  draft: bool = False
  highlighted_index: int | None = None
  actor_id: str = ""
  color_hex: str = ""


class RouteOverlayWidget(QWidget):
  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
    self._paths: tuple[RouteOverlayPath, ...] = ()
    self._eye = Vec3(0.0, 0.0, 0.0)
    self._yaw_deg = 0.0
    self._pitch_deg = 0.0
    self._roll_deg = 0.0
    self._fov_deg = 80.0
    self._z_far = 512.0

  def set_paths(self, *, eye: Vec3, yaw_deg: float, pitch_deg: float, roll_deg: float, fov_deg: float, z_far: float, paths: tuple[RouteOverlayPath, ...]) -> None:
    self._eye = eye
    self._yaw_deg = float(yaw_deg)
    self._pitch_deg = float(pitch_deg)
    self._roll_deg = float(roll_deg)
    self._fov_deg = float(fov_deg)
    self._z_far = float(z_far)
    self._paths = tuple(paths)
    self.update()

  def clear_paths(self) -> None:
    self._paths = ()
    self.update()

  def _view_projection_matrix(self) -> np.ndarray | None:
    if int(self.width()) <= 1 or int(self.height()) <= 1:
      return None
    forward = forward_from_yaw_pitch_deg(float(self._yaw_deg), float(self._pitch_deg))
    view = mat4.look_dir(self._eye, forward)
    if abs(float(self._roll_deg)) > 1e-6:
      view = mat4.mul(rotate_z_deg_matrix(float(self._roll_deg)), view)
    proj = mat4.perspective(float(self._fov_deg), float(self.width()) / max(float(self.height()), 1.0), 0.01, float(self._z_far))
    return mat4.mul(proj, view)

  @staticmethod
  def _clip_point(view_proj: np.ndarray, point: Vec3) -> np.ndarray:
    return np.asarray(view_proj, dtype=np.float32) @ np.asarray([float(point.x), float(point.y), float(point.z), 1.0], dtype=np.float32)

  @staticmethod
  def _inside_clip_margin(clip: np.ndarray) -> bool:
    w = float(clip[3])
    if w <= _VIEW_CLIP_EPSILON:
      return False
    margin_w = float(_VIEW_CLIP_MARGIN) * w
    return bool(-margin_w <= float(clip[0]) <= margin_w and -margin_w <= float(clip[1]) <= margin_w and -margin_w <= float(clip[2]) <= margin_w)

  def _clip_to_screen(self, clip: np.ndarray) -> QPointF | None:
    if float(clip[3]) <= _VIEW_CLIP_EPSILON:
      return None
    ndc_x = float(clip[0]) / float(clip[3])
    ndc_y = float(clip[1]) / float(clip[3])
    screen_x = (float(ndc_x) * 0.5 + 0.5) * float(self.width())
    screen_y = (1.0 - (float(ndc_y) * 0.5 + 0.5)) * float(self.height())
    return QPointF(float(screen_x), float(screen_y))

  def _project(self, point: Vec3) -> QPointF | None:
    view_proj = self._view_projection_matrix()
    if view_proj is None:
      return None
    clip = self._clip_point(view_proj, point)
    if not self._inside_clip_margin(clip):
      return None
    return self._clip_to_screen(clip)

  @staticmethod
  def _clip_segment_to_view(p0: np.ndarray, p1: np.ndarray) -> tuple[np.ndarray, np.ndarray] | None:
    start = np.asarray(p0, dtype=np.float64)
    end = np.asarray(p1, dtype=np.float64)
    delta = end - start
    margin = float(_VIEW_CLIP_MARGIN)
    tests = (
      (float(_VIEW_CLIP_EPSILON - start[3]), float(_VIEW_CLIP_EPSILON - end[3])),
      (float(start[0] - margin * start[3]), float(end[0] - margin * end[3])),
      (float(-start[0] - margin * start[3]), float(-end[0] - margin * end[3])),
      (float(start[1] - margin * start[3]), float(end[1] - margin * end[3])),
      (float(-start[1] - margin * start[3]), float(-end[1] - margin * end[3])),
      (float(start[2] - margin * start[3]), float(end[2] - margin * end[3])),
      (float(-start[2] - margin * start[3]), float(-end[2] - margin * end[3])),
    )
    t0 = 0.0
    t1 = 1.0
    for q0, q1 in tests:
      if q0 <= 0.0 and q1 <= 0.0:
        continue
      if q0 > 0.0 and q1 > 0.0:
        return None
      denom = float(q0 - q1)
      if abs(denom) <= 1e-12:
        return None
      t = float(q0) / denom
      if q0 > 0.0:
        t0 = max(float(t0), float(t))
      else:
        t1 = min(float(t1), float(t))
      if t0 > t1:
        return None
    return (start + delta * float(t0), start + delta * float(t1))

  def _project_segment(self, p0: Vec3, p1: Vec3) -> tuple[QPointF, QPointF] | None:
    view_proj = self._view_projection_matrix()
    if view_proj is None:
      return None
    clipped = self._clip_segment_to_view(self._clip_point(view_proj, p0), self._clip_point(view_proj, p1))
    if clipped is None:
      return None
    s0 = self._clip_to_screen(clipped[0])
    s1 = self._clip_to_screen(clipped[1])
    if s0 is None or s1 is None:
      return None
    return (s0, s1)

  def paintEvent(self, event) -> None:
    del event
    if not self._paths:
      return
    painter = QPainter(self)
    painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)

    for path in self._paths:
      if len(path.points) < 2:
        continue
      projected = tuple(self._project(point) for point in path.points)
      color = QColor(_DRAFT_ROUTE_COLOR) if bool(path.draft) else QColor(str(path.color_hex) or completed_route_color_hex(str(path.actor_id)))
      if not color.isValid():
        color = QColor(_COMPLETED_ROUTE_FALLBACK_COLOR)
      pen = QPen(color, 3.0 if bool(path.draft) else 2.0, Qt.PenStyle.DashLine if bool(path.draft) else Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap, Qt.PenJoinStyle.RoundJoin)
      painter.setPen(pen)
      painter.setBrush(color)

      for index in range(len(projected) - 1):
        segment = self._project_segment(path.points[index], path.points[index + 1])
        if segment is None:
          continue
        painter.drawLine(segment[0], segment[1])

      if bool(path.closed):
        segment = self._project_segment(path.points[-1], path.points[0])
        if segment is not None:
          painter.drawLine(segment[0], segment[1])

      for index, point in enumerate(projected):
        if point is None:
          continue
        radius = 3.5 if bool(path.draft) else 2.5
        if path.highlighted_index is not None and int(index) == int(path.highlighted_index):
          radius += 2.0
          painter.setBrush(QColor("#f7df86"))
        else:
          painter.setBrush(color)
        painter.drawEllipse(point, float(radius), float(radius))

    painter.end()
