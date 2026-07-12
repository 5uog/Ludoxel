# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

STYLE_SHEET_FILES: tuple[str, ...] = ("base.qss", "license.qss", "progress.qss", "third_party.qss")


def load_installer_stylesheet(styles_dir: Path) -> str:
  base = Path(styles_dir)
  fragments: list[str] = []
  for name in STYLE_SHEET_FILES:
    path = base / name
    if not path.is_file():
      continue
    fragments.append(path.read_text(encoding="utf-8"))
  return "\n".join(fragments)
