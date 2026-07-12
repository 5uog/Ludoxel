# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import platform
import sys
from dataclasses import dataclass

WINDOWS = "windows"
MACOS = "macos"
UNSUPPORTED = "unsupported"

_SUPPORTED_PLATFORMS = (WINDOWS, MACOS)


@dataclass(frozen=True)
class PlatformInfo:
  platform_id: str
  architecture: str

  @property
  def is_supported(self) -> bool:
    return self.platform_id in _SUPPORTED_PLATFORMS


def _normalize_architecture(raw_machine: str) -> str:
  machine = str(raw_machine).strip().lower()
  if machine in {"amd64", "x86_64", "x64"}:
    return "x86_64"
  if machine in {"arm64", "aarch64"}:
    return "arm64"
  return machine or "unknown"


def detect_platform() -> PlatformInfo:
  if sys.platform.startswith("win"):
    platform_id = WINDOWS
  elif sys.platform == "darwin":
    platform_id = MACOS
  else:
    platform_id = UNSUPPORTED

  return PlatformInfo(platform_id=platform_id, architecture=_normalize_architecture(platform.machine()))


def expected_payload_format(platform_id: str) -> str:
  if platform_id == WINDOWS:
    return "windows-onefile-exe"
  if platform_id == MACOS:
    return "macos-app-bundle-tar"
  raise ValueError(f"unsupported platform: {platform_id}")
