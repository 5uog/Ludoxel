# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


class InstallerError(Exception):
  def __init__(self, user_message: str, *, detail: str = "") -> None:
    super().__init__(user_message)
    self.user_message = str(user_message)
    self.detail = str(detail)


class PayloadVerificationError(InstallerError):
  pass


class ExtractionError(InstallerError):
  pass


class InstallationError(InstallerError):
  pass


class RegistrationError(InstallerError):
  pass


class UnsupportedPlatformError(InstallerError):
  pass


@dataclass(frozen=True)
class MappedError:
  user_message: str
  detail: str


def map_exception(error: BaseException) -> MappedError:
  if isinstance(error, InstallerError):
    return MappedError(user_message=error.user_message, detail=error.detail or str(error))

  if isinstance(error, PermissionError):
    return MappedError(user_message="Ludoxel Installer could not write to the required location because access was denied.", detail=str(error))

  if isinstance(error, FileNotFoundError):
    return MappedError(user_message="Ludoxel Installer could not find a file it expected to be present.", detail=str(error))

  if isinstance(error, OSError):
    return MappedError(user_message="Ludoxel Installer encountered a system error while writing files.", detail=str(error))

  return MappedError(user_message="Ludoxel Installer encountered an unexpected error.", detail=f"{type(error).__name__}: {error}")
