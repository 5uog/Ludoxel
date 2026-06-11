# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import sys
import time
from dataclasses import dataclass
from typing import Callable

from PyQt6.QtCore import QPoint, Qt
from PyQt6.QtGui import QCursor, QGuiApplication, QKeyEvent, QMouseEvent
from PyQt6.QtWidgets import QWidget

from ludoxel.presentation.interface.input.qt import InputFrame, QtInputAdapter

if sys.platform == "darwin":
  from ludoxel.presentation.interface.input.macos_cursor import MacosCursorWarp, MacosRelativeMouseCapture
  from ludoxel.presentation.interface.input.macos_guard import MacosGameplayInputGuard
else:
  MacosCursorWarp = None
  MacosRelativeMouseCapture = None
  MacosGameplayInputGuard = None


@dataclass
class MouseDelta:
  dx: float
  dy: float


class ViewportInput:
  def __init__(self, *, widget: QWidget, adapter: QtInputAdapter, native_key_handler: Callable[[int, bool, bool], None] | None = None) -> None:
    self._w = widget
    self._a = adapter
    self._captured: bool = False
    self._capture_sync_pending: bool = False
    self._capture_sync_stable_polls: int = 0
    self._ignore_mouse_move_until_s: float = 0.0
    self._ignore_mouse_move_events: int = 0
    self._macos_cursor_warp = MacosCursorWarp() if MacosCursorWarp is not None else None
    self._macos_relative_mouse = MacosRelativeMouseCapture() if MacosRelativeMouseCapture is not None else None
    self._macos_input_guard = MacosGameplayInputGuard(native_key_handler) if MacosGameplayInputGuard is not None and callable(native_key_handler) else None

  def reset(self) -> None:
    self._a.reset()

  def captured(self) -> bool:
    return bool(self._captured)

  def capture_sync_pending(self) -> bool:
    return bool(self._captured) and bool(self._capture_sync_pending)

  def crouch_held(self) -> bool:
    return bool(self._a.crouch_held())

  def _center_global(self) -> QPoint:
    c = QPoint(self._w.width() // 2, self._w.height() // 2)
    return self._w.mapToGlobal(c)

  def _warp_cursor_to_center(self) -> None:
    self._ignore_mouse_move_until_s = max(float(self._ignore_mouse_move_until_s), float(time.perf_counter()) + 0.025)
    self._ignore_mouse_move_events = max(int(self._ignore_mouse_move_events), 2)
    center = self._center_global()
    warped = False
    if self._macos_cursor_warp is not None:
      result = self._macos_cursor_warp.warp(x=int(center.x()), y=int(center.y()))
      warped = bool(result.succeeded)
    if not bool(warped):
      QCursor.setPos(center)

  @staticmethod
  def _sync_override_cursor(*, hidden: bool) -> None:
    app = QGuiApplication.instance()
    if app is None:
      return
    override = app.overrideCursor()
    blank = QCursor(Qt.CursorShape.BlankCursor)
    if bool(hidden):
      if override is None:
        app.setOverrideCursor(blank)
        return
      if override.shape() != Qt.CursorShape.BlankCursor:
        app.changeOverrideCursor(blank)
      return
    if override is not None and override.shape() == Qt.CursorShape.BlankCursor:
      app.restoreOverrideCursor()

  def set_mouse_capture(self, on: bool) -> None:
    on = bool(on)
    if bool(on) and bool(self._captured):
      self.ensure_mouse_capture_applied()
      return
    if on == self._captured:
      return
    self._captured = on

    if self._captured:
      self._w.activateWindow()
      host_window = self._w.window()
      if host_window is not None:
        host_window.activateWindow()
      self._w.setFocus(Qt.FocusReason.MouseFocusReason)
      self._sync_override_cursor(hidden=True)
      self._w.setCursor(Qt.CursorShape.BlankCursor)
      if host_window is not None:
        host_window.setCursor(Qt.CursorShape.BlankCursor)
      self._w.grabMouse()
      self._w.grabKeyboard()
      if self._macos_input_guard is not None:
        self._macos_input_guard.set_active(True)
      self._a.clear_mouse_delta()
      center = self._center_global()
      native_relative = bool(self._macos_relative_mouse is not None and self._macos_relative_mouse.begin(x=int(center.x()), y=int(center.y())))
      if not bool(native_relative):
        self._warp_cursor_to_center()
      self._capture_sync_pending = not bool(native_relative)
      self._capture_sync_stable_polls = 0
    else:
      if self._macos_relative_mouse is not None:
        self._macos_relative_mouse.end()
      if self._macos_input_guard is not None:
        self._macos_input_guard.set_active(False)
      self._w.releaseKeyboard()
      self._w.releaseMouse()
      self._sync_override_cursor(hidden=False)
      self._w.unsetCursor()
      host_window = self._w.window()
      if host_window is not None:
        host_window.unsetCursor()
      self._capture_sync_pending = False
      self._capture_sync_stable_polls = 0

  def ensure_mouse_capture_applied(self) -> None:
    if not bool(self._captured):
      return
    self._w.activateWindow()
    host_window = self._w.window()
    if host_window is not None:
      host_window.activateWindow()
    self._w.setFocus(Qt.FocusReason.MouseFocusReason)
    self._sync_override_cursor(hidden=True)
    self._w.setCursor(Qt.CursorShape.BlankCursor)
    if host_window is not None:
      host_window.setCursor(Qt.CursorShape.BlankCursor)
    if sys.platform == "darwin":
      self._w.grabMouse()
      self._w.grabKeyboard()
      if self._macos_input_guard is not None:
        self._macos_input_guard.set_active(True)

  def poll_relative_mouse_delta(self) -> None:
    if not bool(self._captured):
      return
    self.ensure_mouse_capture_applied()
    if self._macos_relative_mouse is not None and self._macos_relative_mouse.active():
      delta = self._macos_relative_mouse.poll()
      if int(delta.dx) != 0 or int(delta.dy) != 0:
        self._a.add_mouse_delta(float(delta.dx), float(delta.dy))
      return
    if self.capture_sync_pending():
      center = self._center_global()
      cur = QCursor.pos()
      dx = float(cur.x() - center.x())
      dy = float(cur.y() - center.y())
      self._a.clear_mouse_delta()
      self._warp_cursor_to_center()
      if abs(float(dx)) <= 1.0 and abs(float(dy)) <= 1.0:
        self._capture_sync_stable_polls = int(self._capture_sync_stable_polls) + 1
      else:
        self._capture_sync_stable_polls = 0
      if int(self._capture_sync_stable_polls) >= 2:
        self._capture_sync_pending = False
        self._capture_sync_stable_polls = 0
      return

    center = self._center_global()
    cur = QCursor.pos()
    dx = float(cur.x() - center.x())
    dy = float(cur.y() - center.y())

    if dx == 0.0 and dy == 0.0:
      return

    self._a.add_mouse_delta(dx, dy)
    self._warp_cursor_to_center()

  def on_captured_mouse_move(self, e: QMouseEvent) -> None:
    if not bool(self._captured):
      return
    if self._macos_relative_mouse is not None and self._macos_relative_mouse.active():
      return
    if self.capture_sync_pending():
      return
    if int(self._ignore_mouse_move_events) > 0:
      self._ignore_mouse_move_events = max(0, int(self._ignore_mouse_move_events) - 1)
      return
    if float(time.perf_counter()) < float(self._ignore_mouse_move_until_s):
      return
    if not hasattr(e, "position"):
      return
    pos = e.position()
    center_x = float(self._w.width()) * 0.5
    center_y = float(self._w.height()) * 0.5
    dx = float(pos.x()) - float(center_x)
    dy = float(pos.y()) - float(center_y)
    if abs(float(dx)) <= 1.0 and abs(float(dy)) <= 1.0:
      return
    self._capture_sync_pending = False
    self._capture_sync_stable_polls = 0
    self._a.add_mouse_delta(float(dx), float(dy))
    self._warp_cursor_to_center()

  def on_key_press(self, e: QKeyEvent) -> None:
    self._a.on_key_press(e)

  def on_key_release(self, e: QKeyEvent) -> None:
    self._a.on_key_release(e)

  def shutdown(self) -> None:
    self.set_mouse_capture(False)
    if self._macos_relative_mouse is not None:
      self._macos_relative_mouse.close()
    if self._macos_input_guard is not None:
      self._macos_input_guard.close()

  def consume(self, *, invert_x: bool, invert_y: bool) -> tuple[InputFrame, MouseDelta]:
    fr = self._a.consume()
    mdx = float(fr.mdx)
    mdy = float(fr.mdy)

    if bool(invert_x):
      mdx = -mdx
    if bool(invert_y):
      mdy = -mdy

    return fr, MouseDelta(dx=float(mdx), dy=float(mdy))
