# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import multiprocessing
import sys

from ludoxel_installer.app import run

if __name__ == "__main__":
  multiprocessing.freeze_support()
  sys.exit(run())
