# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from enum import Enum

from ludoxel_installer.domain.installer_state import InstallerMode


class ProgressStage(Enum):
  VERIFYING = "verifying"
  PREPARING = "preparing"
  INSTALLING = "installing"
  REGISTERING = "registering"
  COMPLETE = "complete"
  UNREGISTERING = "unregistering"
  UNINSTALLING = "uninstalling"
  UNINSTALL_COMPLETE = "uninstall_complete"


STAGE_TEXT: dict[ProgressStage, str] = {
  ProgressStage.VERIFYING: "Verifying the installer package...",
  ProgressStage.PREPARING: "Preparing Ludoxel...",
  ProgressStage.INSTALLING: "Installing Ludoxel...",
  ProgressStage.REGISTERING: "Registering Ludoxel...",
  ProgressStage.COMPLETE: "Installation complete.",
  ProgressStage.UNREGISTERING: "Removing Ludoxel from Installed Apps...",
  ProgressStage.UNINSTALLING: "Removing Ludoxel...",
  ProgressStage.UNINSTALL_COMPLETE: "Ludoxel has been uninstalled.",
}

CANCELLABLE_STAGES = frozenset({ProgressStage.VERIFYING, ProgressStage.PREPARING})
TERMINAL_STAGES = frozenset({ProgressStage.COMPLETE, ProgressStage.UNINSTALL_COMPLETE})

INSTALL_STAGE_ORDER: tuple[ProgressStage, ...] = (ProgressStage.VERIFYING, ProgressStage.PREPARING, ProgressStage.INSTALLING, ProgressStage.REGISTERING, ProgressStage.COMPLETE)

UNINSTALL_STAGE_ORDER: tuple[ProgressStage, ...] = (ProgressStage.UNREGISTERING, ProgressStage.UNINSTALLING, ProgressStage.UNINSTALL_COMPLETE)


def initial_stage(mode: InstallerMode) -> ProgressStage:
  return ProgressStage.VERIFYING if mode is InstallerMode.INSTALL else ProgressStage.UNREGISTERING


def terminal_stage(mode: InstallerMode) -> ProgressStage:
  return ProgressStage.COMPLETE if mode is InstallerMode.INSTALL else ProgressStage.UNINSTALL_COMPLETE


def stage_progress_fraction(stage: ProgressStage) -> float:
  for order in (INSTALL_STAGE_ORDER, UNINSTALL_STAGE_ORDER):
    if stage in order:
      return order.index(stage) / (len(order) - 1)
  return 0.0
