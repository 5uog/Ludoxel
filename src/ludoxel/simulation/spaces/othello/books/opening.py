# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from functools import lru_cache
from importlib.resources import files
from pathlib import Path
from typing import Callable

from ludoxel.simulation.spaces.othello.game.rules import apply_move, create_initial_board, find_legal_moves
from ludoxel.simulation.spaces.othello.game.state import BOARD_CELL_COUNT, SIDE_BLACK, coerce_board, encode_board, normalize_side, other_side

_BOARD_SIZE = 8
_NormalizeOpeningBookRoot = Callable[[str | Path | None], str]
_LoadUserOpeningBookLines = Callable[[str], object]
_SaveUserOpeningBookLines = Callable[[str, tuple[tuple[int, ...], ...]], None]
_LoadCompiledOpeningBookCache = Callable[[str, str], object]
_SaveCompiledOpeningBookCache = Callable[[str, str, dict[str, tuple[int, ...]]], None]
_ClearCompiledOpeningBookCache = Callable[[str], None]
_normalize_opening_book_root_hook: _NormalizeOpeningBookRoot | None = None
_load_user_opening_book_lines_hook: _LoadUserOpeningBookLines | None = None
_save_user_opening_book_lines_hook: _SaveUserOpeningBookLines | None = None
_load_compiled_opening_book_cache_hook: _LoadCompiledOpeningBookCache | None = None
_save_compiled_opening_book_cache_hook: _SaveCompiledOpeningBookCache | None = None
_clear_compiled_opening_book_cache_hook: _ClearCompiledOpeningBookCache | None = None


def configure_opening_book_storage(
  *,
  normalize_root_hook: _NormalizeOpeningBookRoot | None = None,
  load_user_lines_hook: _LoadUserOpeningBookLines | None = None,
  save_user_lines_hook: _SaveUserOpeningBookLines | None = None,
  load_cache_hook: _LoadCompiledOpeningBookCache | None = None,
  save_cache_hook: _SaveCompiledOpeningBookCache | None = None,
  clear_cache_hook: _ClearCompiledOpeningBookCache | None = None,
) -> None:
  global _normalize_opening_book_root_hook
  global _load_user_opening_book_lines_hook
  global _save_user_opening_book_lines_hook
  global _load_compiled_opening_book_cache_hook
  global _save_compiled_opening_book_cache_hook
  global _clear_compiled_opening_book_cache_hook
  _normalize_opening_book_root_hook = normalize_root_hook
  _load_user_opening_book_lines_hook = load_user_lines_hook
  _save_user_opening_book_lines_hook = save_user_lines_hook
  _load_compiled_opening_book_cache_hook = load_cache_hook
  _save_compiled_opening_book_cache_hook = save_cache_hook
  _clear_compiled_opening_book_cache_hook = clear_cache_hook


def _normalize_opening_book_root(project_root: str | Path | None = None) -> str:
  if _normalize_opening_book_root_hook is not None:
    return str(_normalize_opening_book_root_hook(project_root))
  return "" if project_root is None else str(project_root)


def normalize_project_root(project_root: str | Path | None = None) -> str:
  return _normalize_opening_book_root(project_root)


def _project_root_key(project_root: str | Path | None = None) -> str:
  return str(_normalize_opening_book_root(project_root))


def _index_to_row_col(index: int) -> tuple[int, int]:
  idx = int(index)
  return (idx // _BOARD_SIZE, idx % _BOARD_SIZE)


def _row_col_to_index(row: int, col: int) -> int:
  return int(row) * _BOARD_SIZE + int(col)


def _transform_row_col(transform_id: int, row: int, col: int) -> tuple[int, int]:
  tid = int(transform_id) & 7
  r = int(row)
  c = int(col)
  if tid == 0:
    return (r, c)
  if tid == 1:
    return (c, _BOARD_SIZE - 1 - r)
  if tid == 2:
    return (_BOARD_SIZE - 1 - r, _BOARD_SIZE - 1 - c)
  if tid == 3:
    return (_BOARD_SIZE - 1 - c, r)
  if tid == 4:
    return (r, _BOARD_SIZE - 1 - c)
  if tid == 5:
    return (_BOARD_SIZE - 1 - c, _BOARD_SIZE - 1 - r)
  if tid == 6:
    return (_BOARD_SIZE - 1 - r, c)
  return (c, r)


def _build_transform_tables() -> tuple[tuple[tuple[int, ...], ...], tuple[tuple[int, ...], ...]]:
  forward_tables: list[tuple[int, ...]] = []
  inverse_tables: list[tuple[int, ...]] = []

  for transform_id in range(8):
    forward = [0] * BOARD_CELL_COUNT
    inverse = [0] * BOARD_CELL_COUNT
    for index in range(BOARD_CELL_COUNT):
      row, col = _index_to_row_col(index)
      next_row, next_col = _transform_row_col(transform_id, row, col)
      next_index = _row_col_to_index(next_row, next_col)
      forward[index] = int(next_index)
      inverse[next_index] = int(index)
    forward_tables.append(tuple(forward))
    inverse_tables.append(tuple(inverse))

  return (tuple(forward_tables), tuple(inverse_tables))


_FORWARD_TABLES, _INVERSE_TABLES = _build_transform_tables()


def transform_index(index: int, transform_id: int) -> int:
  idx = int(index)
  if idx < 0 or idx >= BOARD_CELL_COUNT:
    raise ValueError(f"Square index out of range: {index}")
  return int(_FORWARD_TABLES[int(transform_id) & 7][idx])


def inverse_transform_index(index: int, transform_id: int) -> int:
  idx = int(index)
  if idx < 0 or idx >= BOARD_CELL_COUNT:
    raise ValueError(f"Square index out of range: {index}")
  return int(_INVERSE_TABLES[int(transform_id) & 7][idx])


def transform_board(board: tuple[int, ...] | list[int], transform_id: int) -> tuple[int, ...]:
  source = coerce_board(board)
  transformed = [0] * BOARD_CELL_COUNT
  forward = _FORWARD_TABLES[int(transform_id) & 7]
  for index, value in enumerate(source):
    transformed[int(forward[index])] = int(value)
  return tuple(transformed)


def canonical_position_key(board: tuple[int, ...] | list[int], side: int) -> tuple[str, int]:
  source = coerce_board(board)
  normalized_side = normalize_side(side, default=SIDE_BLACK)

  best_key = ""
  best_transform = 0
  first = True

  for transform_id in range(8):
    transformed = transform_board(source, int(transform_id))
    key = f"{int(normalized_side)}:{encode_board(transformed)}"
    if first or key < best_key:
      best_key = str(key)
      best_transform = int(transform_id)
      first = False

  return (str(best_key), int(best_transform))


@dataclass(frozen=True)
class OpeningBook:
  moves_by_key: dict[str, tuple[int, ...]]

  def moves_for(self, board: tuple[int, ...] | list[int], side: int) -> tuple[int, ...]:
    key, transform_id = canonical_position_key(board, side)
    canonical_moves = self.moves_by_key.get(str(key))
    if not canonical_moves:
      return ()
    return tuple(int(inverse_transform_index(move, transform_id)) for move in canonical_moves)


@dataclass(frozen=True)
class OpeningBookSummary:
  bundled_lines: int = 0
  user_lines: int = 0
  total_lines: int = 0


def _bundled_opening_book_resource():
  return files("ludoxel.simulation.spaces.othello.resources").joinpath("opening_book.json")


def _normalize_line(raw_line: object) -> tuple[int, ...]:
  if not isinstance(raw_line, (list, tuple)):
    return ()
  out: list[int] = []
  for value in raw_line:
    try:
      index = int(value)
    except Exception:
      return ()
    if index < 0 or index >= BOARD_CELL_COUNT:
      return ()
    out.append(int(index))
  return tuple(out)


def _normalize_lines(raw_lines: object) -> tuple[tuple[int, ...], ...]:
  if not isinstance(raw_lines, (list, tuple)):
    return ()
  normalized: list[tuple[int, ...]] = []
  seen: set[tuple[int, ...]] = set()
  for raw_line in raw_lines:
    line = _normalize_line(raw_line)
    if not line or line in seen:
      continue
    seen.add(line)
    normalized.append(line)
  return tuple(normalized)


def _read_lines_from_payload(raw: object) -> tuple[tuple[int, ...], ...]:
  if isinstance(raw, list):
    return _normalize_lines(raw)
  if isinstance(raw, dict):
    return _normalize_lines(raw.get("lines", []))
  return ()


def decode_opening_book_lines_payload(raw: object) -> tuple[tuple[int, ...], ...]:
  return _read_lines_from_payload(raw)


def opening_book_lines_payload(lines: tuple[tuple[int, ...], ...]) -> dict[str, object]:
  return {"version": 1, "lines": [list(line) for line in _normalize_lines(lines)]}


def _merge_lines(*sources: tuple[tuple[int, ...], ...]) -> tuple[tuple[int, ...], ...]:
  merged: list[tuple[int, ...]] = []
  seen: set[tuple[int, ...]] = set()
  for source in sources:
    for line in tuple(source):
      if line in seen:
        continue
      seen.add(line)
      merged.append(tuple(line))
  return tuple(merged)


def _opening_book_lines_fingerprint(lines: tuple[tuple[int, ...], ...]) -> str:
  digest = hashlib.sha256()
  for line in tuple(lines):
    digest.update(b"[")
    for move_index in tuple(line):
      digest.update(str(int(move_index)).encode("ascii"))
      digest.update(b",")
    digest.update(b"]")
  return str(digest.hexdigest())


def decode_compiled_opening_book_cache_payload(raw: object, *, fingerprint: str) -> OpeningBook | None:
  if not isinstance(raw, dict):
    return None
  if str(raw.get("fingerprint", "")) != str(fingerprint):
    return None
  raw_map = raw.get("moves_by_key", {})
  if not isinstance(raw_map, dict):
    return None
  normalized_map: dict[str, tuple[int, ...]] = {}
  for key, raw_moves in raw_map.items():
    if not isinstance(key, str) or not isinstance(raw_moves, list):
      return None
    normalized_moves: list[int] = []
    for value in raw_moves:
      try:
        move_index = int(value)
      except Exception:
        return None
      if move_index < 0 or move_index >= BOARD_CELL_COUNT:
        return None
      normalized_moves.append(int(move_index))
    normalized_map[str(key)] = tuple(normalized_moves)
  return OpeningBook(moves_by_key=normalized_map)


def compiled_opening_book_cache_payload(*, fingerprint: str, book: OpeningBook) -> dict[str, object]:
  return {"version": 1, "fingerprint": str(fingerprint), "moves_by_key": {str(key): [int(move) for move in tuple(moves)] for key, moves in book.moves_by_key.items()}}


def _build_line_tree(lines: tuple[tuple[int, ...], ...]) -> dict[int, dict]:
  root: dict[int, dict] = {}
  for line in tuple(lines):
    if not line:
      continue
    node = root
    for move_index in tuple(line):
      move = int(move_index)
      child = node.get(move)
      if child is None:
        child = {}
        node[move] = child
      node = child
  return root


def _record_line_tree(mapping: dict[str, set[int]], tree: dict[int, dict], *, board: tuple[int, ...], side_to_move: int) -> None:
  if not tree:
    return

  legal_moves = tuple(int(index) for index in find_legal_moves(board, side_to_move))
  if not legal_moves:
    return

  legal_moves_set = set(legal_moves)
  key, transform_id = canonical_position_key(board, side_to_move)
  bucket = mapping.setdefault(str(key), set())
  valid_children: list[tuple[int, dict]] = []

  for move_index, child in tree.items():
    move = int(move_index)
    if move not in legal_moves_set:
      continue
    bucket.add(int(transform_index(move, int(transform_id))))
    valid_children.append((move, child))

  for move_index, child in valid_children:
    next_board, _flipped = apply_move(board, side=side_to_move, index=int(move_index))
    next_side = other_side(side_to_move)
    next_legal_moves = tuple(int(index) for index in find_legal_moves(next_board, next_side))
    if not next_legal_moves:
      other = other_side(next_side)
      other_legal_moves = tuple(int(index) for index in find_legal_moves(next_board, other))
      if not other_legal_moves:
        continue
      next_side = other
    _record_line_tree(mapping, child, board=next_board, side_to_move=int(next_side))


def load_bundled_opening_book_lines() -> tuple[tuple[int, ...], ...]:
  return _load_bundled_opening_book_lines_cached()


@lru_cache(maxsize=1)
def _load_bundled_opening_book_lines_cached() -> tuple[tuple[int, ...], ...]:
  try:
    raw = json.loads(_bundled_opening_book_resource().read_text(encoding="utf-8"))
  except Exception:
    return ()
  return _read_lines_from_payload(raw)


def load_user_opening_book_lines(project_root: str | Path | None = None) -> tuple[tuple[int, ...], ...]:
  return _load_user_opening_book_lines_cached(_project_root_key(project_root))


@lru_cache(maxsize=8)
def _load_user_opening_book_lines_cached(project_root_key: str) -> tuple[tuple[int, ...], ...]:
  if _load_user_opening_book_lines_hook is None:
    return ()
  return _read_lines_from_payload(_load_user_opening_book_lines_hook(str(project_root_key)))


def load_opening_book_lines(project_root: str | Path | None = None) -> tuple[tuple[int, ...], ...]:
  return _merge_lines(load_bundled_opening_book_lines(), load_user_opening_book_lines(project_root))


def opening_book_summary(project_root: str | Path | None = None) -> OpeningBookSummary:
  bundled_lines = load_bundled_opening_book_lines()
  user_lines = load_user_opening_book_lines(project_root)
  merged_lines = _merge_lines(bundled_lines, user_lines)
  return OpeningBookSummary(bundled_lines=len(bundled_lines), user_lines=len(user_lines), total_lines=len(merged_lines))


def save_user_opening_book_lines(lines: tuple[tuple[int, ...], ...] | list[tuple[int, ...]] | list[list[int]], project_root: str | Path | None = None) -> tuple[tuple[int, ...], ...]:
  merged_lines = _normalize_lines(list(lines))
  bundled_lines = load_bundled_opening_book_lines()
  bundled_set = set(bundled_lines)
  user_only_lines = tuple(line for line in merged_lines if line not in bundled_set)
  project_root_key = _project_root_key(project_root)
  if _save_user_opening_book_lines_hook is not None:
    _save_user_opening_book_lines_hook(str(project_root_key), user_only_lines)
  clear_opening_book_cache(project_root)
  return _merge_lines(bundled_lines, user_only_lines)


def save_opening_book_lines(lines: tuple[tuple[int, ...], ...] | list[tuple[int, ...]] | list[list[int]], project_root: str | Path | None = None) -> tuple[tuple[int, ...], ...]:
  return save_user_opening_book_lines(lines, project_root=project_root)


def clear_opening_book_cache(_project_root: str | Path | None = None) -> None:
  _load_user_opening_book_lines_cached.cache_clear()
  _load_opening_book_cached.cache_clear()
  if _project_root is None:
    return
  if _clear_compiled_opening_book_cache_hook is not None:
    _clear_compiled_opening_book_cache_hook(_project_root_key(_project_root))


def _load_opening_book_from_lines(lines: tuple[tuple[int, ...], ...]) -> OpeningBook:
  mapping: dict[str, set[int]] = {}
  line_tree = _build_line_tree(tuple(lines))
  _record_line_tree(mapping, line_tree, board=create_initial_board(), side_to_move=SIDE_BLACK)
  frozen = {str(key): tuple(sorted(int(move) for move in moves)) for key, moves in mapping.items() if moves}
  return OpeningBook(moves_by_key=frozen)


def load_opening_book(project_root: str | Path | None = None) -> OpeningBook:
  return _load_opening_book_cached(_project_root_key(project_root))


@lru_cache(maxsize=8)
def _load_opening_book_cached(project_root_key: str) -> OpeningBook:
  lines = load_opening_book_lines(project_root_key)
  fingerprint = _opening_book_lines_fingerprint(lines)
  cached = None
  if _load_compiled_opening_book_cache_hook is not None:
    cached = decode_compiled_opening_book_cache_payload(_load_compiled_opening_book_cache_hook(str(project_root_key), str(fingerprint)), fingerprint=str(fingerprint))
  if cached is not None:
    return cached
  compiled = _load_opening_book_from_lines(lines)
  if _save_compiled_opening_book_cache_hook is not None:
    _save_compiled_opening_book_cache_hook(str(project_root_key), str(fingerprint), dict(compiled.moves_by_key))
  return compiled
