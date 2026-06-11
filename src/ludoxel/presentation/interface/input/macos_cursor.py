# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import ctypes
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
      self._cg = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
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
  """
  CoreGraphics event tap が累積した相対 mouse 移動量を表す。
  `dx` と `dy` は display pixel 単位の符号付き整数であり、visible cursor position には依存しない。
  """

  dx: int
  dy: int


class MacosRelativeMouseCapture:
  """
  gameplay capture 中の cursor と mouse movement を CoreGraphics の相対入力契約へ切り替える。
  capture 開始時に cursor position association を解除し、listen-only mouse event tap の delta を frame 側へ累積する。
  """

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

  def active(self) -> bool:
    """
    CoreGraphics の相対 capture が現在有効である場合に真を返す。
    Qt 側はこの値を用いて position-based delta と warp event の処理を停止する。
    """
    return bool(self._active)

  def begin(self, *, x: int, y: int) -> bool:
    """
    cursor を指定 global position へ一度だけ揃えた後、mouse と cursor position の association を解除する。
    mouse delta は event tap callback で累積し、Qt mouse move event の発生有無には依存させない。
    """
    if sys.platform != "darwin" or not self._ensure_loaded() or not self._ensure_event_tap():
      return False
    if bool(self._active):
      return True
    try:
      self._reset_pending_delta()
      point = _CGPoint(float(x), float(y))
      if int(self._cg.CGWarpMouseCursorPosition(point)) != 0:
        return False
      if int(self._cg.CGAssociateMouseAndMouseCursorPosition(False)) != 0:
        return False
      display_id = int(self._cg.CGMainDisplayID())
      if int(self._cg.CGDisplayHideCursor(display_id)) == 0:
        self._cursor_hidden = True
      self._cg.CGEventTapEnable(self._event_tap, True)
      self._active = True
      return True
    except Exception as exc:
      self._load_error = str(exc).strip() or type(exc).__name__
      self.end()
      return False

  def poll(self) -> MacosRelativeMouseDelta:
    """
    前回 poll 以降に event tap callback が累積した相対 displacement を返し、同時に累積値を消費する。
    capture が無効又は API が利用不能な場合は `(0, 0)` を返し、呼び出し側の input accumulation を変化させない。
    """
    if not bool(self._active):
      return MacosRelativeMouseDelta(dx=0, dy=0)
    with self._lock:
      dx = int(self._pending_dx)
      dy = int(self._pending_dy)
      self._pending_dx = 0
      self._pending_dy = 0
    return MacosRelativeMouseDelta(dx=dx, dy=dy)

  def end(self) -> None:
    """
    mouse と cursor position の association、および native cursor visibility を通常状態へ戻す。
    pause、inventory、focus loss、window 又は application deactivation、明示 release、shutdown の全経路から反復して呼べる。
    """
    cg = self._cg
    if cg is None:
      self._active = False
      self._cursor_hidden = False
      self._reset_pending_delta()
      return
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
    self._active = False
    self._cursor_hidden = False
    self._reset_pending_delta()

  def close(self) -> None:
    """
    shutdown 時に native capture state を解放する。
    外部 file や application preference を変更せず、process-wide cursor state だけを復元する。
    """
    self.end()

  def _reset_pending_delta(self) -> None:
    with self._lock:
      self._pending_dx = 0
      self._pending_dy = 0

  def _handle_event(self, _proxy, event_type: int, event, _refcon):
    """
    CoreGraphics mouse event の delta field を capture 中だけ累積する。
    listen-only tap なので event は消費せず、そのまま system と Qt へ流す。
    """
    if int(event_type) in (_CG_EVENT_TAP_DISABLED_BY_TIMEOUT, _CG_EVENT_TAP_DISABLED_BY_USER_INPUT):
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
      self._pending_dx += int(dx)
      self._pending_dy += int(dy)
    return event

  def _ensure_loaded(self) -> bool:
    """
    macOS system CoreGraphics/CoreFoundation framework を一度だけ読み込み、使用する C function の型契約を固定する。
    読み込み失敗は保持され、以後の capture request は Qt fallback を選べるように偽を返す。
    """
    if bool(self._loaded):
      return self._cg is not None and self._cf is not None
    self._loaded = True
    try:
      self._cg = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
      self._cf = ctypes.CDLL("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation")

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
