# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import ctypes
import ctypes.util
import sys
from dataclasses import dataclass
from threading import Lock

_CG_HID_EVENT_TAP = 0
_CG_HEAD_INSERT_EVENT_TAP = 0
_CG_EVENT_TAP_OPTION_LISTEN_ONLY = 1

_CG_EVENT_MOUSE_MOVED = 5
_CG_EVENT_LEFT_MOUSE_DRAGGED = 6
_CG_EVENT_RIGHT_MOUSE_DRAGGED = 7
_CG_EVENT_OTHER_MOUSE_DRAGGED = 27
_CG_EVENT_TAP_DISABLED_BY_TIMEOUT = 0xFFFFFFFE
_CG_EVENT_TAP_DISABLED_BY_USER_INPUT = 0xFFFFFFFF

_CG_MOUSE_EVENT_DELTA_X = 4
_CG_MOUSE_EVENT_DELTA_Y = 5

_RELATIVE_MOUSE_EVENTS = (_CG_EVENT_MOUSE_MOVED, _CG_EVENT_LEFT_MOUSE_DRAGGED, _CG_EVENT_RIGHT_MOUSE_DRAGGED, _CG_EVENT_OTHER_MOUSE_DRAGGED)

_CGEventTapCallback = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32, ctypes.c_void_p, ctypes.c_void_p)


def _load_system_framework(name: str) -> ctypes.CDLL:
  located = ctypes.util.find_library(name)
  if not located:
    located = "/".join(("", "System", "Library", "Frameworks", name + ".framework", name))
  return ctypes.CDLL(located)


@dataclass(frozen=True)
class MacosCursorWarpResult:
  succeeded: bool
  error: str = ""


class MacosCursorWarp:
  def __init__(self) -> None:
    self._loaded = False
    self._load_error = ""
    self._cg = None

  def available(self) -> bool:
    return bool(sys.platform == "darwin" and self._load_error == "")

  def warp(self, *, x: int, y: int) -> MacosCursorWarpResult:
    if sys.platform != "darwin":
      return MacosCursorWarpResult(succeeded=False, error="not macOS")
    if not self._ensure_loaded():
      return MacosCursorWarpResult(succeeded=False, error=self._load_error or "CoreGraphics unavailable")
    try:
      point = _CGPoint(float(x), float(y))
      result = int(self._cg.CGWarpMouseCursorPosition(point))
      if result != 0:
        return MacosCursorWarpResult(succeeded=False, error=f"CGWarpMouseCursorPosition returned {result}")
      self._cg.CGAssociateMouseAndMouseCursorPosition(True)
    except Exception as exc:
      self._load_error = str(exc).strip() or type(exc).__name__
      return MacosCursorWarpResult(succeeded=False, error=self._load_error)
    return MacosCursorWarpResult(succeeded=True)

  def _ensure_loaded(self) -> bool:
    if bool(self._loaded):
      return self._cg is not None
    self._loaded = True
    try:
      self._cg = _load_system_framework("CoreGraphics")
      self._cg.CGWarpMouseCursorPosition.argtypes = [_CGPoint]
      self._cg.CGWarpMouseCursorPosition.restype = ctypes.c_int32
      self._cg.CGAssociateMouseAndMouseCursorPosition.argtypes = [ctypes.c_bool]
      self._cg.CGAssociateMouseAndMouseCursorPosition.restype = ctypes.c_int32
    except Exception as exc:
      self._cg = None
      self._load_error = str(exc).strip() or type(exc).__name__
      return False
    return True


@dataclass(frozen=True)
class MacosRelativeMouseDelta:
  dx: int
  dy: int


class MacosRelativeMouseCapture:
  def __init__(self) -> None:
    self._loaded = False
    self._load_error = ""
    self._cg = None
    self._cf = None
    self._active = False
    self._cursor_hidden = False
    self._event_tap = None
    self._run_loop_source = None
    self._callback = None
    self._lock = Lock()
    self._pending_dx = 0
    self._pending_dy = 0
    self._discard_next_motion_event = False

  def active(self) -> bool:
    return bool(self._active)

  def begin(self, *, x: int, y: int) -> bool:
    if sys.platform != "darwin" or not self._ensure_loaded() or not self._ensure_event_tap():
      return False
    if bool(self._active):
      return True
    try:
      self.clear_pending_delta()
      point = _CGPoint(float(x), float(y))
      if int(self._cg.CGWarpMouseCursorPosition(point)) != 0:
        return False
      if int(self._cg.CGAssociateMouseAndMouseCursorPosition(False)) != 0:
        return False
      display_id = int(self._cg.CGMainDisplayID())
      if int(self._cg.CGDisplayHideCursor(display_id)) == 0:
        self._cursor_hidden = True
      self._active = True
      self._cg.CGEventTapEnable(self._event_tap, True)
      return True
    except Exception as exc:
      self._load_error = str(exc).strip() or type(exc).__name__
      self.end()
      return False

  def poll(self) -> MacosRelativeMouseDelta:
    if not bool(self._active):
      return MacosRelativeMouseDelta(dx=0, dy=0)
    with self._lock:
      dx = int(self._pending_dx)
      dy = int(self._pending_dy)
      self._pending_dx = 0
      self._pending_dy = 0
    return MacosRelativeMouseDelta(dx=dx, dy=dy)

  def end(self) -> None:
    cg = self._cg
    if cg is None:
      self._active = False
      self._cursor_hidden = False
      self.clear_pending_delta()
      return
    self._active = False
    try:
      if self._event_tap is not None:
        cg.CGEventTapEnable(self._event_tap, False)
    except Exception:
      pass
    try:
      cg.CGAssociateMouseAndMouseCursorPosition(True)
    except Exception:
      pass
    if bool(self._cursor_hidden):
      try:
        cg.CGDisplayShowCursor(int(cg.CGMainDisplayID()))
      except Exception:
        pass
    self._cursor_hidden = False
    self.clear_pending_delta()

  def close(self) -> None:
    self.end()

  def clear_pending_delta(self) -> None:
    with self._lock:
      self._pending_dx = 0
      self._pending_dy = 0
      self._discard_next_motion_event = False

  def _prepare_event_tap_resync(self) -> None:
    with self._lock:
      self._pending_dx = 0
      self._pending_dy = 0
      self._discard_next_motion_event = True

  def _handle_event(self, _proxy, event_type: int, event, _refcon):
    if int(event_type) in (_CG_EVENT_TAP_DISABLED_BY_TIMEOUT, _CG_EVENT_TAP_DISABLED_BY_USER_INPUT):
      if not bool(self._active):
        return event
      self._prepare_event_tap_resync()
      try:
        if self._event_tap is not None:
          self._cg.CGEventTapEnable(self._event_tap, True)
      except Exception:
        pass
      return event
    if not bool(self._active) or int(event_type) not in _RELATIVE_MOUSE_EVENTS:
      return event
    try:
      dx = int(self._cg.CGEventGetIntegerValueField(event, _CG_MOUSE_EVENT_DELTA_X))
      dy = int(self._cg.CGEventGetIntegerValueField(event, _CG_MOUSE_EVENT_DELTA_Y))
    except Exception:
      return event
    if dx == 0 and dy == 0:
      return event
    with self._lock:
      if bool(self._discard_next_motion_event):
        self._discard_next_motion_event = False
        return event
      self._pending_dx += int(dx)
      self._pending_dy += int(dy)
    return event

  def _ensure_loaded(self) -> bool:
    if bool(self._loaded):
      return self._cg is not None and self._cf is not None
    self._loaded = True
    try:
      self._cg = _load_system_framework("CoreGraphics")
      self._cf = _load_system_framework("CoreFoundation")

      self._cg.CGWarpMouseCursorPosition.argtypes = [_CGPoint]
      self._cg.CGWarpMouseCursorPosition.restype = ctypes.c_int32
      self._cg.CGAssociateMouseAndMouseCursorPosition.argtypes = [ctypes.c_bool]
      self._cg.CGAssociateMouseAndMouseCursorPosition.restype = ctypes.c_int32
      self._cg.CGMainDisplayID.argtypes = []
      self._cg.CGMainDisplayID.restype = ctypes.c_uint32
      self._cg.CGDisplayHideCursor.argtypes = [ctypes.c_uint32]
      self._cg.CGDisplayHideCursor.restype = ctypes.c_int32
      self._cg.CGDisplayShowCursor.argtypes = [ctypes.c_uint32]
      self._cg.CGDisplayShowCursor.restype = ctypes.c_int32

      self._cg.CGEventTapCreate.argtypes = [ctypes.c_uint32, ctypes.c_uint32, ctypes.c_uint32, ctypes.c_uint64, _CGEventTapCallback, ctypes.c_void_p]
      self._cg.CGEventTapCreate.restype = ctypes.c_void_p
      self._cg.CGEventTapEnable.argtypes = [ctypes.c_void_p, ctypes.c_bool]
      self._cg.CGEventTapEnable.restype = None
      self._cg.CGEventGetIntegerValueField.argtypes = [ctypes.c_void_p, ctypes.c_int32]
      self._cg.CGEventGetIntegerValueField.restype = ctypes.c_longlong

      self._cf.CFMachPortCreateRunLoopSource.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int32]
      self._cf.CFMachPortCreateRunLoopSource.restype = ctypes.c_void_p
      self._cf.CFRunLoopGetCurrent.argtypes = []
      self._cf.CFRunLoopGetCurrent.restype = ctypes.c_void_p
      self._cf.CFRunLoopAddSource.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p]
      self._cf.CFRunLoopAddSource.restype = None
    except Exception as exc:
      self._cg = None
      self._cf = None
      self._load_error = str(exc).strip() or type(exc).__name__
      return False
    return True

  def _ensure_event_tap(self) -> bool:
    if self._event_tap is not None:
      return True
    if self._cg is None or self._cf is None:
      return False
    try:
      mask = 0
      for event_type in _RELATIVE_MOUSE_EVENTS:
        mask |= 1 << int(event_type)
      self._callback = _CGEventTapCallback(self._handle_event)
      self._event_tap = self._cg.CGEventTapCreate(_CG_HID_EVENT_TAP, _CG_HEAD_INSERT_EVENT_TAP, _CG_EVENT_TAP_OPTION_LISTEN_ONLY, ctypes.c_uint64(mask), self._callback, None)
      if self._event_tap is None or int(self._event_tap) == 0:
        self._event_tap = None
        self._callback = None
        self._load_error = "CGEventTapCreate returned null"
        return False
      self._run_loop_source = self._cf.CFMachPortCreateRunLoopSource(None, self._event_tap, 0)
      if self._run_loop_source is None or int(self._run_loop_source) == 0:
        self._run_loop_source = None
        self._event_tap = None
        self._callback = None
        self._load_error = "CFMachPortCreateRunLoopSource returned null"
        return False
      run_loop = self._cf.CFRunLoopGetCurrent()
      common_modes = ctypes.c_void_p.in_dll(self._cf, "kCFRunLoopCommonModes")
      self._cf.CFRunLoopAddSource(run_loop, self._run_loop_source, common_modes)
      self._cg.CGEventTapEnable(self._event_tap, False)
    except Exception as exc:
      self._event_tap = None
      self._run_loop_source = None
      self._callback = None
      self._load_error = str(exc).strip() or type(exc).__name__
      return False
    return True


class _CGPoint(ctypes.Structure):
  _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]
