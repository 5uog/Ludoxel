# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

try:
  from ludoxel.foundations.mathematics import _mathematics_native as native_module  # type: ignore[attr-defined]
except ImportError:
  native_module = None


def native_mathematics_available() -> bool:
  return native_module is not None


def native_mathematics_module_file() -> str | None:
  if native_module is None:
    return None
  return str(getattr(native_module, "__file__", "")) or None


def native_mathematics_status() -> str:
  if native_module is None:
    return "fallback:python"
  return f"native:rust:{native_mathematics_module_file()}"
