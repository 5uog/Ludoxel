# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import ctypes
import ctypes.util
import sys
from collections.abc import Callable

from PyQt6.QtCore import Qt

_KEY_DOWN = 10
_KEY_UP = 11
_FLAGS_CHANGED = 12
_TAP_DISABLED_BY_TIMEOUT = 0xFFFFFFFE
_TAP_DISABLED_BY_USER_INPUT = 0xFFFFFFFF
_KEYBOARD_EVENT_KEYCODE = 9
_KEYBOARD_EVENT_AUTOREPEAT = 8

_EVENT_MASK = (1 << _KEY_DOWN) | (1 << _KEY_UP) | (1 << _FLAGS_CHANGED)

_FLAG_SHIFT = 0x00020000
_FLAG_CONTROL = 0x00040000
_FLAG_OPTION = 0x00080000
_FLAG_COMMAND = 0x00100000

_KEYCODE_TO_QT_KEY = {
  0: Qt.Key.Key_A,
  1: Qt.Key.Key_S,
  2: Qt.Key.Key_D,
  3: Qt.Key.Key_F,
  5: Qt.Key.Key_G,
  6: Qt.Key.Key_Z,
  7: Qt.Key.Key_X,
  8: Qt.Key.Key_C,
  9: Qt.Key.Key_V,
  11: Qt.Key.Key_B,
  12: Qt.Key.Key_Q,
  13: Qt.Key.Key_W,
  14: Qt.Key.Key_E,
  15: Qt.Key.Key_R,
  16: Qt.Key.Key_Y,
  17: Qt.Key.Key_T,
  18: Qt.Key.Key_1,
  19: Qt.Key.Key_2,
  20: Qt.Key.Key_3,
  21: Qt.Key.Key_4,
  22: Qt.Key.Key_6,
  23: Qt.Key.Key_5,
  24: Qt.Key.Key_Equal,
  25: Qt.Key.Key_9,
  26: Qt.Key.Key_7,
  27: Qt.Key.Key_Minus,
  28: Qt.Key.Key_8,
  29: Qt.Key.Key_0,
  30: Qt.Key.Key_BracketRight,
  31: Qt.Key.Key_O,
  32: Qt.Key.Key_U,
  33: Qt.Key.Key_BracketLeft,
  34: Qt.Key.Key_I,
  35: Qt.Key.Key_P,
  36: Qt.Key.Key_Return,
  37: Qt.Key.Key_L,
  38: Qt.Key.Key_J,
  39: Qt.Key.Key_Apostrophe,
  40: Qt.Key.Key_K,
  41: Qt.Key.Key_Semicolon,
  42: Qt.Key.Key_Backslash,
  43: Qt.Key.Key_Comma,
  44: Qt.Key.Key_Slash,
  45: Qt.Key.Key_N,
  46: Qt.Key.Key_M,
  47: Qt.Key.Key_Period,
  48: Qt.Key.Key_Tab,
  49: Qt.Key.Key_Space,
  50: Qt.Key.Key_QuoteLeft,
  51: Qt.Key.Key_Backspace,
  53: Qt.Key.Key_Escape,
  65: Qt.Key.Key_Period,
  67: Qt.Key.Key_Asterisk,
  69: Qt.Key.Key_Plus,
  71: Qt.Key.Key_Clear,
  75: Qt.Key.Key_Slash,
  76: Qt.Key.Key_Return,
  78: Qt.Key.Key_Minus,
  81: Qt.Key.Key_Equal,
  82: Qt.Key.Key_0,
  83: Qt.Key.Key_1,
  84: Qt.Key.Key_2,
  85: Qt.Key.Key_3,
  86: Qt.Key.Key_4,
  87: Qt.Key.Key_5,
  88: Qt.Key.Key_6,
  89: Qt.Key.Key_7,
  91: Qt.Key.Key_8,
  92: Qt.Key.Key_9,
  96: Qt.Key.Key_F5,
  97: Qt.Key.Key_F6,
  98: Qt.Key.Key_F7,
  99: Qt.Key.Key_F3,
  100: Qt.Key.Key_F8,
  101: Qt.Key.Key_F9,
  103: Qt.Key.Key_F11,
  109: Qt.Key.Key_F10,
  111: Qt.Key.Key_F12,
  118: Qt.Key.Key_F4,
  120: Qt.Key.Key_F2,
  122: Qt.Key.Key_F1,
  123: Qt.Key.Key_Left,
  124: Qt.Key.Key_Right,
  125: Qt.Key.Key_Down,
  126: Qt.Key.Key_Up,
}

_MODIFIER_KEYCODES = {
  54: (Qt.Key.Key_Meta, _FLAG_COMMAND),
  55: (Qt.Key.Key_Meta, _FLAG_COMMAND),
  56: (Qt.Key.Key_Shift, _FLAG_SHIFT),
  57: (Qt.Key.Key_CapsLock, 0),
  58: (Qt.Key.Key_Alt, _FLAG_OPTION),
  59: (Qt.Key.Key_Control, _FLAG_CONTROL),
  60: (Qt.Key.Key_Shift, _FLAG_SHIFT),
  61: (Qt.Key.Key_Alt, _FLAG_OPTION),
  62: (Qt.Key.Key_Control, _FLAG_CONTROL),
}


def _load_system_framework(name: str) -> ctypes.CDLL:
  # Resolve the framework at runtime so no literal absolute framework path is
  # baked into the bytecode; PyInstaller's ctypes scanner only follows constant
  # CDLL arguments, so a computed path avoids the "only basenames are supported"
  # warning while macOS keeps loading CoreGraphics/CoreFoundation normally.
  located = ctypes.util.find_library(name)
  if not located:
    located = "/".join(("", "System", "Library", "Frameworks", name + ".framework", name))
  return ctypes.CDLL(located)


class MacosGameplayInputGuard:
  def __init__(self, key_handler: Callable[[int, bool, bool], None] | None) -> None:
    self._key_handler = key_handler
    self._active = False
    self._tap = None
    self._source = None
    self._callback = None
    self._install_attempted = False
    self._install_error = ""

  def set_active(self, active: bool) -> None:
    if sys.platform != "darwin":
      return
    self._active = bool(active)
    if not self._active:
      return
    self._ensure_installed()

  def close(self) -> None:
    self._active = False
    if self._tap is not None:
      try:
        self._cg.CGEventTapEnable(self._tap, False)
      except Exception:
        pass

  def status(self) -> str:
    if sys.platform != "darwin":
      return "unavailable"
    if self._tap is not None:
      return "active" if self._active else "installed"
    return f"unavailable: {self._install_error}" if self._install_error else "unavailable"

  def _ensure_installed(self) -> None:
    if self._tap is not None:
      try:
        self._cg.CGEventTapEnable(self._tap, True)
      except Exception:
        pass
      return
    if self._install_attempted:
      return
    self._install_attempted = True
    try:
      self._install()
    except Exception as exc:
      self._install_error = str(exc).strip() or type(exc).__name__
      print(f"[ludoxel] macOS gameplay input guard unavailable: {self._install_error}", file=sys.stderr, flush=True)

  def _install(self) -> None:
    self._cg = _load_system_framework("CoreGraphics")
    self._cf = _load_system_framework("CoreFoundation")

    self._cg.CGEventTapCreate.restype = ctypes.c_void_p
    self._cg.CGEventTapCreate.argtypes = [ctypes.c_uint32, ctypes.c_uint32, ctypes.c_uint32, ctypes.c_uint64, ctypes.c_void_p, ctypes.c_void_p]
    self._cg.CGEventTapEnable.restype = None
    self._cg.CGEventTapEnable.argtypes = [ctypes.c_void_p, ctypes.c_bool]
    self._cg.CGEventGetIntegerValueField.restype = ctypes.c_longlong
    self._cg.CGEventGetIntegerValueField.argtypes = [ctypes.c_void_p, ctypes.c_int]
    self._cg.CGEventGetFlags.restype = ctypes.c_uint64
    self._cg.CGEventGetFlags.argtypes = [ctypes.c_void_p]

    self._cf.CFMachPortCreateRunLoopSource.restype = ctypes.c_void_p
    self._cf.CFMachPortCreateRunLoopSource.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_long]
    self._cf.CFRunLoopGetMain.restype = ctypes.c_void_p
    self._cf.CFRunLoopAddSource.restype = None
    self._cf.CFRunLoopAddSource.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p]

    callback_type = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32, ctypes.c_void_p, ctypes.c_void_p)
    self._callback = callback_type(self._handle_event)
    self._tap = self._cg.CGEventTapCreate(0, 0, 0, ctypes.c_uint64(_EVENT_MASK), self._callback, None)
    if not self._tap:
      raise RuntimeError("CGEventTapCreate failed; grant Ludoxel Input Monitoring/Accessibility permission")

    self._source = self._cf.CFMachPortCreateRunLoopSource(None, self._tap, 0)
    if not self._source:
      raise RuntimeError("CFMachPortCreateRunLoopSource failed")

    common_modes = ctypes.c_void_p.in_dll(self._cf, "kCFRunLoopCommonModes")
    self._cf.CFRunLoopAddSource(self._cf.CFRunLoopGetMain(), self._source, common_modes)
    self._cg.CGEventTapEnable(self._tap, True)
    print("[ludoxel] macOS gameplay input guard installed", file=sys.stderr, flush=True)

  def _handle_event(self, _proxy, event_type: int, event, _refcon):
    if int(event_type) in (_TAP_DISABLED_BY_TIMEOUT, _TAP_DISABLED_BY_USER_INPUT):
      if self._tap is not None:
        self._cg.CGEventTapEnable(self._tap, True)
      return event

    if not bool(self._active):
      return event
    if int(event_type) not in (_KEY_DOWN, _KEY_UP, _FLAGS_CHANGED):
      return event

    keycode = int(self._cg.CGEventGetIntegerValueField(event, _KEYBOARD_EVENT_KEYCODE))
    qt_key = self._qt_key_for_event(keycode=keycode, event_type=int(event_type), event=event)
    if qt_key is not None and callable(self._key_handler):
      autorepeat = bool(self._cg.CGEventGetIntegerValueField(event, _KEYBOARD_EVENT_AUTOREPEAT)) if int(event_type) == _KEY_DOWN else False
      pressed = self._pressed_for_event(keycode=keycode, event_type=int(event_type), event=event)
      try:
        self._key_handler(int(qt_key), bool(pressed), bool(autorepeat))
      except Exception as exc:
        print(f"[ludoxel] macOS gameplay input guard key dispatch failed: {exc}", file=sys.stderr, flush=True)
    return None

  def _qt_key_for_event(self, *, keycode: int, event_type: int, event) -> int | None:
    if int(event_type) == _FLAGS_CHANGED:
      modifier = _MODIFIER_KEYCODES.get(int(keycode))
      if modifier is None:
        return None
      return int(modifier[0])
    key = _KEYCODE_TO_QT_KEY.get(int(keycode))
    return None if key is None else int(key)

  def _pressed_for_event(self, *, keycode: int, event_type: int, event) -> bool:
    if int(event_type) == _KEY_UP:
      return False
    if int(event_type) != _FLAGS_CHANGED:
      return True
    modifier = _MODIFIER_KEYCODES.get(int(keycode))
    if modifier is None:
      return True
    mask = int(modifier[1])
    if mask == 0:
      return True
    flags = int(self._cg.CGEventGetFlags(event))
    return bool(flags & mask)
