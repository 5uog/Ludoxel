# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import ctypes
import sys
from dataclasses import dataclass


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
  CoreGraphics が報告した直近の相対 mouse 移動量を表す。
  `dx` と `dy` は display pixel 単位の符号付き整数であり、visible cursor position には依存しない。
  """

  dx: int
  dy: int


class MacosRelativeMouseCapture:
  """
  gameplay capture 中の cursor と mouse movement を CoreGraphics の相対入力契約へ切り替える。
  capture 開始時に cursor position association を解除して system cursor の可視移動を止め、終了時には association と cursor visibility を必ず復元する。
  """

  def __init__(self) -> None:
    self._loaded = False
    self._load_error = ""
    self._cg = None
    self._active = False
    self._cursor_hidden = False

  def active(self) -> bool:
    """
    CoreGraphics の相対 capture が現在有効である場合に真を返す。
    Qt 側はこの値を用いて position-based delta と warp event の処理を停止する。
    """
    return bool(self._active)

  def begin(self, *, x: int, y: int) -> bool:
    """
    cursor を指定 global position へ一度だけ揃えた後、mouse と cursor position の association を解除する。
    CoreGraphics API のいずれかが失敗した場合は通常状態へ戻し、Qt warp fallback を選択できるように偽を返す。
    """
    if sys.platform != "darwin" or not self._ensure_loaded():
      return False
    if bool(self._active):
      return True
    try:
      point = _CGPoint(float(x), float(y))
      if int(self._cg.CGWarpMouseCursorPosition(point)) != 0:
        return False
      if int(self._cg.CGAssociateMouseAndMouseCursorPosition(False)) != 0:
        return False
      display_id = int(self._cg.CGMainDisplayID())
      if int(self._cg.CGDisplayHideCursor(display_id)) == 0:
        self._cursor_hidden = True
      self._discard_pending_delta()
      self._active = True
      return True
    except Exception as exc:
      self._load_error = str(exc).strip() or type(exc).__name__
      self.end()
      return False

  def poll(self) -> MacosRelativeMouseDelta:
    """
    前回の CoreGraphics mouse event が持つ相対 displacement を取得する。
    capture が無効又は API が利用不能な場合は `(0, 0)` を返し、呼び出し側の input accumulation を変化させない。
    """
    if not bool(self._active) or self._cg is None:
      return MacosRelativeMouseDelta(dx=0, dy=0)
    dx = ctypes.c_int32(0)
    dy = ctypes.c_int32(0)
    try:
      self._cg.CGGetLastMouseDelta(ctypes.byref(dx), ctypes.byref(dy))
    except Exception:
      self.end()
      return MacosRelativeMouseDelta(dx=0, dy=0)
    return MacosRelativeMouseDelta(dx=int(dx.value), dy=int(dy.value))

  def end(self) -> None:
    """
    mouse と cursor position の association、および native cursor visibility を通常状態へ戻す。
    pause、inventory、focus loss、window 又は application deactivation、明示 release、shutdown の全経路から反復して呼べる。
    """
    cg = self._cg
    if cg is None:
      self._active = False
      self._cursor_hidden = False
      return
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

  def close(self) -> None:
    """
    shutdown 時に native capture state を解放する。
    外部 file や application preference を変更せず、process-wide cursor state だけを復元する。
    """
    self.end()

  def _discard_pending_delta(self) -> None:
    """
    capture 開始前の mouse event が持つ delta を一度読み捨てる。
    gameplay の最初の frame に capture 前の移動量が混入して視点が跳ぶことを防ぐ。
    """
    dx = ctypes.c_int32(0)
    dy = ctypes.c_int32(0)
    self._cg.CGGetLastMouseDelta(ctypes.byref(dx), ctypes.byref(dy))

  def _ensure_loaded(self) -> bool:
    """
    macOS system CoreGraphics framework を一度だけ読み込み、使用する C function の型契約を固定する。
    読み込み失敗は保持され、以後の capture request は Qt fallback を選べるように偽を返す。
    """
    if bool(self._loaded):
      return self._cg is not None
    self._loaded = True
    try:
      self._cg = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
      self._cg.CGWarpMouseCursorPosition.argtypes = [_CGPoint]
      self._cg.CGWarpMouseCursorPosition.restype = ctypes.c_int32
      self._cg.CGAssociateMouseAndMouseCursorPosition.argtypes = [ctypes.c_bool]
      self._cg.CGAssociateMouseAndMouseCursorPosition.restype = ctypes.c_int32
      self._cg.CGGetLastMouseDelta.argtypes = [ctypes.POINTER(ctypes.c_int32), ctypes.POINTER(ctypes.c_int32)]
      self._cg.CGGetLastMouseDelta.restype = None
      self._cg.CGMainDisplayID.argtypes = []
      self._cg.CGMainDisplayID.restype = ctypes.c_uint32
      self._cg.CGDisplayHideCursor.argtypes = [ctypes.c_uint32]
      self._cg.CGDisplayHideCursor.restype = ctypes.c_int32
      self._cg.CGDisplayShowCursor.argtypes = [ctypes.c_uint32]
      self._cg.CGDisplayShowCursor.restype = ctypes.c_int32
    except Exception as exc:
      self._cg = None
      self._load_error = str(exc).strip() or type(exc).__name__
      return False
    return True


class _CGPoint(ctypes.Structure):
  _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]
