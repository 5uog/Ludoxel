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
  """Register application-side storage hooks without making the Othello domain import application persistence."""
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
  """I define N_P(x) as the application-provided opening-book root key. The simulation layer treats this as an opaque cache key and never resolves runtime data paths."""
  return _normalize_opening_book_root(project_root)


def _project_root_key(project_root: str | Path | None = None) -> str:
  """I define K_P(x) = str(N_P(x)). I use this opaque string key as the cache index for per-root opening-book state."""
  return str(_normalize_opening_book_root(project_root))


def _index_to_row_col(index: int) -> tuple[int, int]:
  """I define psi(i) = (floor(i/8), i mod 8) for 0 <= i < 64. This is the canonical affine coordinate chart that I use for symmetry transforms on board indices."""
  idx = int(index)
  return (idx // _BOARD_SIZE, idx % _BOARD_SIZE)


def _row_col_to_index(row: int, col: int) -> int:
  """I define psi^{-1}(r,c) = 8*r + c. Together with psi, this map lets me express dihedral board symmetries through coordinate transforms instead of per-case index tables written by hand."""
  return int(row) * _BOARD_SIZE + int(col)


def _transform_row_col(transform_id: int, row: int, col: int) -> tuple[int, int]:
  """I define T_k(r,c) for k in {0,...,7} as the eight elements of the square-board dihedral action that I actually use for canonicalization. These transforms generate the rotations and reflections needed to identify symmetry-equivalent opening-book positions."""
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
  """I precompute F_k(i) = psi^{-1}(T_k(psi(i))) and its inverse I_k for every symmetry id k. This converts repeated canonicalization from coordinate arithmetic into O(1) table lookup per square."""
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
  """I define F_k(i) as the transformed board index under symmetry k. I reject indices outside [0,63] because canonicalization over an invalid square would be mathematically undefined and would corrupt the book key space."""
  idx = int(index)
  if idx < 0 or idx >= BOARD_CELL_COUNT:
    raise ValueError(f"Square index out of range: {index}")
  return int(_FORWARD_TABLES[int(transform_id) & 7][idx])


def inverse_transform_index(index: int, transform_id: int) -> int:
  """I define I_k(i) as the inverse transformed index under symmetry k. This map satisfies I_k(F_k(i)) = i on the admissible board domain and is required to map canonical book moves back into the caller's coordinate frame."""
  idx = int(index)
  if idx < 0 or idx >= BOARD_CELL_COUNT:
    raise ValueError(f"Square index out of range: {index}")
  return int(_INVERSE_TABLES[int(transform_id) & 7][idx])


def transform_board(board: tuple[int, ...] | list[int], transform_id: int) -> tuple[int, ...]:
  """I define B_k(c)_F_k(i) = c_i for every board cell i. This is the induced action of symmetry k on the full board state, and I use it when computing canonical symmetry representatives."""
  source = coerce_board(board)
  transformed = [0] * BOARD_CELL_COUNT
  forward = _FORWARD_TABLES[int(transform_id) & 7]
  for index, value in enumerate(source):
    transformed[int(forward[index])] = int(value)
  return tuple(transformed)


def canonical_position_key(board: tuple[int, ...] | list[int], side: int) -> tuple[str, int]:
  """I define K(board, side) = min_k(str(side) + ':' + encode(B_k(board))) under lexicographic order, together with the minimizing symmetry id k. This canonical representative collapses all dihedral board symmetries into one cache and opening-book key."""
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
  """I model the opening book as a finite map M : canonical_position_key -> tuple(canonical_move_indices). I store moves in the canonical frame so that symmetry collapse occurs once at load time rather than at every query site."""

  moves_by_key: dict[str, tuple[int, ...]]

  def moves_for(self, board: tuple[int, ...] | list[int], side: int) -> tuple[int, ...]:
    """I define Q(board, side) = I_k(M[K(board,side)]) where k is the minimizing symmetry of the queried position. This returns legal move candidates in the caller's native frame while preserving canonical storage internally."""
    key, transform_id = canonical_position_key(board, side)
    canonical_moves = self.moves_by_key.get(str(key))
    if not canonical_moves:
      return ()
    return tuple(int(inverse_transform_index(move, transform_id)) for move in canonical_moves)


@dataclass(frozen=True)
class OpeningBookSummary:
  """I model a compact cardinality report as Sigma = (bundled_lines, user_lines, total_lines). I use this record in settings UI and commit-level diagnostics because those surfaces require counts, not the full line corpus."""

  bundled_lines: int = 0
  user_lines: int = 0
  total_lines: int = 0


def _bundled_opening_book_resource():
  return files("ludoxel.simulation.spaces.othello.resources").joinpath("opening_book.json")


def _normalize_line(raw_line: object) -> tuple[int, ...]:
  """I define N_l(line) as the total validator for one opening line, with codomain tuple([0,63]^n). I reject the entire line if any move lies outside the board index domain because partial repair would silently alter the intended move sequence."""
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
  """I define N_L(lines) as sequence normalization plus duplicate elimination with order preservation. This makes serialized line corpora stable under repeated write cycles and idempotent under import merges."""
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
  """I define R_payload(raw) as the schema-tolerant normalization map from decoded JSON into the canonical opening-line corpus. This separates transport decoding from structural validation so that packaged resources and filesystem-backed user files follow the same normalization law."""
  if isinstance(raw, list):
    return _normalize_lines(raw)
  if isinstance(raw, dict):
    return _normalize_lines(raw.get("lines", []))
  return ()


def decode_opening_book_lines_payload(raw: object) -> tuple[tuple[int, ...], ...]:
  """Decode a transport payload into the normalized opening-line corpus."""
  return _read_lines_from_payload(raw)


def opening_book_lines_payload(lines: tuple[tuple[int, ...], ...]) -> dict[str, object]:
  """Encode normalized opening lines into the stable application-state payload."""
  return {"version": 1, "lines": [list(line) for line in _normalize_lines(lines)]}


def _merge_lines(*sources: tuple[tuple[int, ...], ...]) -> tuple[tuple[int, ...], ...]:
  """I define U(L_1,...,L_n) as stable set union with first-occurrence preservation. This lets me compose bundled and user books without losing deterministic ordering semantics in exported files."""
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
  """I define H(lines) as a SHA-256 digest over the normalized opening-line corpus. I use this digest as the cache-validity witness for the compiled opening-book artifact so that any mutation of bundled or user lines invalidates the compiled map exactly when the semantic corpus changes."""
  digest = hashlib.sha256()
  for line in tuple(lines):
    digest.update(b"[")
    for move_index in tuple(line):
      digest.update(str(int(move_index)).encode("ascii"))
      digest.update(b",")
    digest.update(b"]")
  return str(digest.hexdigest())


def decode_compiled_opening_book_cache_payload(raw: object, *, fingerprint: str) -> OpeningBook | None:
  """I define C_read(path, h) as total cache decode for the compiled opening-book artifact under fingerprint h. I accept the cache iff the stored digest matches h and every move bucket normalizes onto legal board indices; otherwise I reject it and force deterministic recompilation."""
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
  """I define C_write(path, h, B) as deterministic serialization of the compiled position-indexed opening book under fingerprint h. I keep the cache transport in JSON so that the artifact remains debuggable and platform-neutral while still eliminating repeated recomputation."""
  return {"version": 1, "fingerprint": str(fingerprint), "moves_by_key": {str(key): [int(move) for move in tuple(moves)] for key, moves in book.moves_by_key.items()}}


def _build_line_tree(lines: tuple[tuple[int, ...], ...]) -> dict[int, dict]:
  """I define T(lines) as the prefix trie induced by the normalized opening-line corpus. I use this structure to evaluate each distinct board prefix exactly once instead of replaying the same prefix independently for every line that shares it."""
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
  """I define R_tree(M, T, board, side) as trie-driven projection of all admissible child moves of one reachable board state into the canonical map M. I compile every distinct prefix once, and I therefore eliminate the redundant repeated replay cost that arises when many lines share long common openings."""
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
  """I define L_b as the normalized bundled line corpus. I expose this wrapper so that callers do not touch the cache implementation directly."""
  return _load_bundled_opening_book_lines_cached()


@lru_cache(maxsize=1)
def _load_bundled_opening_book_lines_cached() -> tuple[tuple[int, ...], ...]:
  """I memoize L_b because packaged data is immutable within one process lifetime. This reduces redundant JSON parsing on repeated AI and UI queries."""
  try:
    raw = json.loads(_bundled_opening_book_resource().read_text(encoding="utf-8"))
  except Exception:
    return ()
  return _read_lines_from_payload(raw)


def load_user_opening_book_lines(project_root: str | Path | None = None) -> tuple[tuple[int, ...], ...]:
  """I define L_u(root) as the normalized user-extension corpus stored under the project workspace. I keep the project root explicit because multiple workspaces may coexist within one Python process."""
  return _load_user_opening_book_lines_cached(_project_root_key(project_root))


@lru_cache(maxsize=8)
def _load_user_opening_book_lines_cached(project_root_key: str) -> tuple[tuple[int, ...], ...]:
  """I memoize L_u(root) by normalized root key. This keeps repeated analysis cheap while still permitting explicit cache invalidation after import, export, or learning writes."""
  if _load_user_opening_book_lines_hook is None:
    return ()
  return _read_lines_from_payload(_load_user_opening_book_lines_hook(str(project_root_key)))


def load_opening_book_lines(project_root: str | Path | None = None) -> tuple[tuple[int, ...], ...]:
  """I define L(root) = U(L_b, L_u(root)). This is the complete opening-line corpus visible to search, export, and learning initialization."""
  return _merge_lines(load_bundled_opening_book_lines(), load_user_opening_book_lines(project_root))


def opening_book_summary(project_root: str | Path | None = None) -> OpeningBookSummary:
  """I define Sigma(root) = (|L_b|, |L_u(root)|, |L(root)|). I use these exact cardinalities in the Othello settings UI so that book growth is observable without loading the full search map into presentation code."""
  bundled_lines = load_bundled_opening_book_lines()
  user_lines = load_user_opening_book_lines(project_root)
  merged_lines = _merge_lines(bundled_lines, user_lines)
  return OpeningBookSummary(bundled_lines=len(bundled_lines), user_lines=len(user_lines), total_lines=len(merged_lines))


def save_user_opening_book_lines(lines: tuple[tuple[int, ...], ...] | list[tuple[int, ...]] | list[list[int]], project_root: str | Path | None = None) -> tuple[tuple[int, ...], ...]:
  """I define S_u(root, lines) as storage of the user-only delta U(lines) \\ L_b through the application-provided persistence hook."""
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
  """I define S(root, lines) as the public write entry point for the effective book corpus. Internally I delegate to S_u because only the user delta is mutable."""
  return save_user_opening_book_lines(lines, project_root=project_root)


def clear_opening_book_cache(_project_root: str | Path | None = None) -> None:
  """I invalidate the in-memory projections derived from the opening-book corpora, and I additionally discard the on-disk compiled cache for the supplied project root when that root is explicit. I preserve global in-memory invalidation because cache keys are process-wide, while the filesystem cache remains workspace-scoped."""
  _load_user_opening_book_lines_cached.cache_clear()
  _load_opening_book_cached.cache_clear()
  if _project_root is None:
    return
  if _clear_compiled_opening_book_cache_hook is not None:
    _clear_compiled_opening_book_cache_hook(_project_root_key(_project_root))


def _load_opening_book_from_lines(lines: tuple[tuple[int, ...], ...]) -> OpeningBook:
  """I define M(lines) by replaying every legal line prefix into the canonical move map. This compilation step converts prefix lists into a position-indexed opening book that the engine can query in O(1) expected time per position."""
  mapping: dict[str, set[int]] = {}
  line_tree = _build_line_tree(tuple(lines))
  _record_line_tree(mapping, line_tree, board=create_initial_board(), side_to_move=SIDE_BLACK)
  frozen = {str(key): tuple(sorted(int(move) for move in moves)) for key, moves in mapping.items() if moves}
  return OpeningBook(moves_by_key=frozen)


def load_opening_book(project_root: str | Path | None = None) -> OpeningBook:
  """I define B(root) = M(L(root)). This is the effective search-time opening book visible to the engine for one workspace."""
  return _load_opening_book_cached(_project_root_key(project_root))


@lru_cache(maxsize=8)
def _load_opening_book_cached(project_root_key: str) -> OpeningBook:
  """I memoize B(root) by normalized project-root key because opening-book compilation is deterministic and potentially reused by repeated search requests. I clear this cache explicitly after every mutation of user book state."""
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
