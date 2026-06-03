# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import multiprocessing

from ludoxel.application.boot import run_app

if __name__ == "__main__":
  multiprocessing.freeze_support()
  run_app()
