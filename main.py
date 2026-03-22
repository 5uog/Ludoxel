# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from pathlib import Path

import sys

_ROOT = Path(__file__).resolve().parent
_SRC = _ROOT / "src"

if _SRC.exists():
    sys.path.insert(0, str(_SRC))

from ludoxel.application.boot import run_app  # noqa: E402

if __name__ == "__main__":
    run_app()
