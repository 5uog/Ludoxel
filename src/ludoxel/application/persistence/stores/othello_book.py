# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
from pathlib import Path

from ludoxel.application.persistence.integrity.manifest import update_runtime_integrity_manifest, verify_runtime_file
from ludoxel.foundations.locations.roots import default_project_root, default_runtime_data_root, runtime_cache_root, runtime_state_root
from ludoxel.simulation.spaces.othello.books.opening import (
  OpeningBook,
  OpeningBookSummary,
  compiled_opening_book_cache_payload,
  configure_opening_book_storage,
  decode_opening_book_lines_payload,
  load_opening_book_lines,
  opening_book_lines_payload,
  opening_book_summary as _opening_book_summary,
  save_user_opening_book_lines,
)


def _default_data_root() -> Path:
  return default_runtime_data_root(default_project_root(Path(__file__)))


def normalize_opening_book_root(project_root: str | Path | None = None) -> str:
  if project_root is None or str(project_root or "").strip() == "":
    return str(_default_data_root())
  try:
    return str(Path(project_root).expanduser().resolve())
  except Exception:
    return str(_default_data_root())


def user_opening_book_file_path(project_root: str | Path | None = None) -> Path:
  return runtime_state_root(Path(normalize_opening_book_root(project_root))) / "othello_opening_book.json"


def compiled_opening_book_cache_file_path(project_root: str | Path | None = None) -> Path:
  return runtime_cache_root(Path(normalize_opening_book_root(project_root))) / "othello_opening_book_cache.json"


def _read_json_file(path: Path) -> object:
  if not path.exists():
    return None
  try:
    return json.loads(path.read_text(encoding="utf-8"))
  except Exception:
    return None


def _write_json_file(path: Path, payload: object) -> None:
  path.parent.mkdir(parents=True, exist_ok=True)
  path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")), encoding="utf-8")


def _load_user_opening_book_lines_payload(project_root_key: str) -> object:
  data_root = Path(normalize_opening_book_root(project_root_key))
  if not verify_runtime_file(data_root, "state/othello_opening_book.json"):
    return None
  return _read_json_file(user_opening_book_file_path(data_root))


def _save_user_opening_book_lines(project_root_key: str, lines: tuple[tuple[int, ...], ...]) -> None:
  data_root = Path(normalize_opening_book_root(project_root_key))
  _write_json_file(user_opening_book_file_path(data_root), opening_book_lines_payload(tuple(lines)))
  update_runtime_integrity_manifest(data_root, ("state/othello_opening_book.json",))


def _load_compiled_opening_book_cache(project_root_key: str, _fingerprint: str) -> object:
  return _read_json_file(compiled_opening_book_cache_file_path(project_root_key))


def _save_compiled_opening_book_cache(project_root_key: str, fingerprint: str, moves_by_key: dict[str, tuple[int, ...]]) -> None:
  payload = compiled_opening_book_cache_payload(fingerprint=str(fingerprint), book=OpeningBook(moves_by_key=dict(moves_by_key)))
  _write_json_file(compiled_opening_book_cache_file_path(project_root_key), payload)


def _clear_compiled_opening_book_cache(project_root_key: str) -> None:
  try:
    compiled_opening_book_cache_file_path(project_root_key).unlink()
  except OSError:
    pass


def install_othello_book_storage_hooks() -> None:
  configure_opening_book_storage(
    normalize_root_hook=normalize_opening_book_root,
    load_user_lines_hook=_load_user_opening_book_lines_payload,
    save_user_lines_hook=_save_user_opening_book_lines,
    load_cache_hook=_load_compiled_opening_book_cache,
    save_cache_hook=_save_compiled_opening_book_cache,
    clear_cache_hook=_clear_compiled_opening_book_cache,
  )


def _read_lines_from_path(path: Path) -> tuple[tuple[int, ...], ...]:
  return decode_opening_book_lines_payload(_read_json_file(path))


def _write_lines_to_path(path: Path, lines: tuple[tuple[int, ...], ...]) -> None:
  _write_json_file(path, opening_book_lines_payload(tuple(lines)))


def _merge_lines(*sources: tuple[tuple[int, ...], ...]) -> tuple[tuple[int, ...], ...]:
  merged: list[tuple[int, ...]] = []
  seen: set[tuple[int, ...]] = set()
  for source in sources:
    for line in tuple(source):
      normalized_line = tuple(int(move) for move in tuple(line))
      if normalized_line in seen:
        continue
      seen.add(normalized_line)
      merged.append(normalized_line)
  return tuple(merged)


def opening_book_summary(project_root: str | Path | None = None) -> OpeningBookSummary:
  return _opening_book_summary(project_root)


def import_opening_book_file(import_path: str | Path, *, project_root: str | Path | None = None) -> OpeningBookSummary:
  normalized_path = Path(import_path).expanduser().resolve()
  imported_lines = _read_lines_from_path(normalized_path)
  merged_lines = _merge_lines(load_opening_book_lines(project_root), imported_lines)
  save_user_opening_book_lines(merged_lines, project_root=project_root)
  return opening_book_summary(project_root)


def export_opening_book_file(export_path: str | Path, *, project_root: str | Path | None = None) -> Path:
  normalized_path = Path(export_path).expanduser().resolve()
  _write_lines_to_path(normalized_path, load_opening_book_lines(project_root))
  return normalized_path
