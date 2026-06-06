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


class _CGPoint(ctypes.Structure):
  _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]
