# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ChangelogSection:
  title: str
  items: tuple[str, ...]


@dataclass(frozen=True)
class ChangelogEntry:
  date: str
  tags: tuple[str, ...]
  sections: tuple[ChangelogSection, ...]


def changelog_resource_path(resource_root: Path) -> Path:
  return Path(resource_root) / "assets" / "ui" / "menu" / "changelog.json"


def _section_from_dict(raw: object) -> ChangelogSection | None:
  if not isinstance(raw, dict):
    return None
  items = raw.get("items", [])
  parsed_items = tuple(str(item) for item in items if isinstance(item, str)) if isinstance(items, list) else ()
  return ChangelogSection(title=str(raw.get("title", "")).strip(), items=parsed_items)


def _entry_from_dict(raw: object) -> ChangelogEntry | None:
  if not isinstance(raw, dict):
    return None
  tags = raw.get("tags", [])
  parsed_tags = tuple(str(tag) for tag in tags if isinstance(tag, str)) if isinstance(tags, list) else ()
  raw_sections = raw.get("sections", [])
  sections = tuple(section for section in (_section_from_dict(item) for item in raw_sections) if section is not None) if isinstance(raw_sections, list) else ()
  return ChangelogEntry(date=str(raw.get("date", "")).strip(), tags=parsed_tags, sections=sections)


def load_changelog_entries(resource_root: Path) -> tuple[ChangelogEntry, ...]:
  path = changelog_resource_path(resource_root)
  if not path.is_file():
    return ()
  try:
    raw = json.loads(path.read_text(encoding="utf-8"))
  except (OSError, json.JSONDecodeError):
    return ()
  if isinstance(raw, dict):
    raw = raw.get("entries", [])
  if not isinstance(raw, list):
    return ()
  return tuple(entry for entry in (_entry_from_dict(item) for item in raw) if entry is not None)
