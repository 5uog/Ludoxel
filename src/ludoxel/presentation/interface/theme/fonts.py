# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtGui import QFont, QFontDatabase
from PyQt6.QtWidgets import QApplication


@dataclass(frozen=True)
class FontInstallResult:
  ok: bool
  family: str
  fallback_families: tuple[str, ...] = ()
  errors: tuple[str, ...] = ()
  font_paths: tuple[Path, ...] = ()


_PRIMARY_FONT_FILES = ("KaiseiOpti-Regular.ttf", "KaiseiOpti-Medium.ttf", "KaiseiOpti-Bold.ttf")
_FALLBACK_FONT_FILES = ("MinecraftBold-nMK1.otf", "MinecraftBoldItalic-1y1e.otf", "MinecraftItalic-R8Mo.otf", "MinecraftRegular-Bmg3.otf")


def install_minecraft_fonts(*, font_dir: Path) -> FontInstallResult:
  d = Path(font_dir)

  primary_candidates = tuple(d / name for name in _PRIMARY_FONT_FILES)
  fallback_candidates = tuple(d / name for name in _FALLBACK_FONT_FILES)

  primary_families: list[str] = []
  fallback_families: list[str] = []
  registered_paths: list[Path] = []
  errors: list[str] = []
  for p in primary_candidates:
    if not p.exists():
      errors.append(f"missing bundled font: {p}")
      continue

    fid = int(QFontDatabase.addApplicationFont(str(p)))
    if fid < 0:
      errors.append(f"failed to register bundled font: {p}")
      continue

    families = tuple(QFontDatabase.applicationFontFamilies(fid))
    if not families:
      errors.append(f"registered bundled font has no family: {p}")
      continue
    registered_paths.append(p)

    for fam in families:
      s = str(fam)
      if s and (s not in primary_families):
        primary_families.append(s)

  for p in fallback_candidates:
    if not p.exists():
      errors.append(f"missing bundled fallback font: {p}")
      continue

    fid = int(QFontDatabase.addApplicationFont(str(p)))
    if fid < 0:
      errors.append(f"failed to register bundled fallback font: {p}")
      continue

    families = tuple(QFontDatabase.applicationFontFamilies(fid))
    if not families:
      errors.append(f"registered bundled fallback font has no family: {p}")
      continue
    registered_paths.append(p)

    for fam in families:
      s = str(fam)
      if s and (s not in fallback_families):
        fallback_families.append(s)

  if errors or not primary_families:
    if not primary_families:
      errors.append(f"no bundled Minecraft font family registered from {d}")
    return FontInstallResult(ok=False, family="", errors=tuple(errors), font_paths=tuple(registered_paths))

  preferred = ""
  for fam in primary_families:
    if "Minecraft" in fam:
      preferred = fam
      break
  if not preferred:
    preferred = primary_families[0]

  ordered_fallback_families = tuple(str(fam) for fam in fallback_families if str(fam) and str(fam) != str(preferred))
  return FontInstallResult(ok=True, family=str(preferred), fallback_families=ordered_fallback_families, font_paths=tuple(registered_paths))


def apply_application_font(*, app: QApplication, family: str, point_size: int = 12, fallback_families: tuple[str, ...] = ()) -> None:
  fam = str(family)
  if not fam:
    return
  font = QFont()
  font.setPointSize(int(max(1, point_size)))
  families = [fam, *(str(candidate) for candidate in tuple(fallback_families) if str(candidate).strip())]
  if hasattr(font, "setFamilies"):
    font.setFamilies(families)
  else:
    font.setFamily(fam)
  app.setFont(font)


def application_font_stylesheet(*, family: str, fallback_families: tuple[str, ...] = ()) -> str:
  families = [str(family), *(str(candidate) for candidate in tuple(fallback_families) if str(candidate).strip())]
  safe_families = tuple(value.replace('"', "") for value in families if value.strip())
  quoted = ", ".join(f'"{value}"' for value in safe_families)
  return "" if not quoted else f"* {{ font-family: {quoted}; }}\n"
