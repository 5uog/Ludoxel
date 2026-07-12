# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtGui import QFont, QFontDatabase
from PyQt6.QtWidgets import QApplication

_KAISEI_OPTI_FONT_FILES = ("KaiseiOpti-Regular.ttf", "KaiseiOpti-Medium.ttf", "KaiseiOpti-Bold.ttf")


@dataclass(frozen=True)
class FontInstallResult:
  ok: bool
  family: str
  errors: tuple[str, ...] = ()


def install_kaisei_opti(*, font_dir: Path) -> FontInstallResult:
  families: list[str] = []
  errors: list[str] = []

  for file_name in _KAISEI_OPTI_FONT_FILES:
    path = Path(font_dir) / file_name
    if not path.is_file():
      errors.append(f"missing bundled font: {path}")
      continue

    font_id = int(QFontDatabase.addApplicationFont(str(path)))
    if font_id < 0:
      errors.append(f"failed to register bundled font: {path}")
      continue

    for family in QFontDatabase.applicationFontFamilies(font_id):
      if str(family) and str(family) not in families:
        families.append(str(family))

  if not families:
    errors.append(f"no Kaisei Opti font family registered from {font_dir}")
    return FontInstallResult(ok=False, family="", errors=tuple(errors))

  return FontInstallResult(ok=True, family=families[0], errors=tuple(errors))


def apply_application_font(*, app: QApplication, family: str, point_size: int = 10) -> None:
  if not family:
    return
  font = QFont()
  font.setFamilies([family, "Segoe UI", "Helvetica Neue", "Arial"])
  font.setPointSize(int(max(1, point_size)))
  app.setFont(font)
