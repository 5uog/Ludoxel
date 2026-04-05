# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from PyQt6.QtCore import QPointF, Qt
from PyQt6.QtGui import QColor, QPainter, QPen
from PyQt6.QtWidgets import QWidget

from ...math import mat4
from ...math.transform_matrices import rotate_z_deg_matrix
from ...math.vec3 import Vec3
from ...math.view_angles import forward_from_yaw_pitch_deg


@dataclass(frozen=True)
class RouteOverlayPath:
    points: tuple[Vec3, ...]
    closed: bool = False
    draft: bool = False
    highlighted_index: int | None = None


class RouteOverlayWidget(QWidget):

    def __init__(self, parent: QWidget | None=None) -> None:
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

    def _project(self, point: Vec3) -> QPointF | None:
        if int(self.width()) <= 1 or int(self.height()) <= 1:
            return None
        forward = forward_from_yaw_pitch_deg(float(self._yaw_deg), float(self._pitch_deg))
        view = mat4.look_dir(self._eye, forward)
        if abs(float(self._roll_deg)) > 1e-6:
            view = mat4.mul(rotate_z_deg_matrix(float(self._roll_deg)), view)
        proj = mat4.perspective(float(self._fov_deg), float(self.width()) / max(float(self.height()), 1.0), 0.01, float(self._z_far))
        clip = mat4.mul(proj, view) @ np.asarray([float(point.x), float(point.y), float(point.z), 1.0], dtype=np.float32)
        if float(clip[3]) <= 1e-6:
            return None
        ndc_x = float(clip[0]) / float(clip[3])
        ndc_y = float(clip[1]) / float(clip[3])
        ndc_z = float(clip[2]) / float(clip[3])
        if float(ndc_x) < -1.2 or float(ndc_x) > 1.2 or float(ndc_y) < -1.2 or float(ndc_y) > 1.2 or float(ndc_z) < -1.2 or float(ndc_z) > 1.2:
            return None
        screen_x = (float(ndc_x) * 0.5 + 0.5) * float(self.width())
        screen_y = (1.0 - (float(ndc_y) * 0.5 + 0.5)) * float(self.height())
        return QPointF(float(screen_x), float(screen_y))

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
            color = QColor("#7df279") if bool(path.draft) else QColor("#67d7ff")
            pen = QPen(color, 3.0 if bool(path.draft) else 2.0, Qt.PenStyle.DashLine if bool(path.draft) else Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap, Qt.PenJoinStyle.RoundJoin)
            painter.setPen(pen)
            painter.setBrush(color)

            for index in range(len(projected) - 1):
                p0 = projected[index]
                p1 = projected[index + 1]
                if p0 is None or p1 is None:
                    continue
                painter.drawLine(p0, p1)

            if bool(path.closed):
                p0 = projected[-1]
                p1 = projected[0]
                if p0 is not None and p1 is not None:
                    painter.drawLine(p0, p1)

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
