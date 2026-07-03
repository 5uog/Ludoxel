# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import threading
from typing import Any, Dict, Iterable, Iterator, Tuple

import numpy as np

from ludoxel.foundations.mathematics.chunks.grid import CHUNK_SIZE, ChunkKey, chunk_key, neighbor_chunk_keys_for_cell
from ludoxel.simulation.worlds.generation import native as terrain_native
from ludoxel.simulation.worlds.generation.materials import TERRAIN_MATERIALS
from ludoxel.simulation.worlds.generation.spec import WorldGenerationSpec
from ludoxel.simulation.worlds.generation.terrain_math import BEDROCK_Y, MODE_FLAT_CODE, material_code, mode_code, surface_height

BlockKey = Tuple[int, int, int]
ColumnKey = Tuple[int, int]

_CONTENT_GENERATION_LOCK = threading.Lock()
_content_generation_counter = 0

_HEIGHT_CACHE_LIMIT = 262144
_STATE_CACHE_LIMIT = 131072
_SUB_SURFACE_BUFFER = 3

_NO_BASE_HEIGHT = BEDROCK_Y - 1


def _next_content_generation() -> int:
  global _content_generation_counter
  with _CONTENT_GENERATION_LOCK:
    _content_generation_counter += 1
    return int(_content_generation_counter)


class _WorldBlocksView:
  __slots__ = ("_world",)

  def __init__(self, world: "WorldState") -> None:
    self._world = world

  def get(self, key: BlockKey, default: str | None = None) -> str | None:
    state = self._world.state_at(int(key[0]), int(key[1]), int(key[2]))
    return default if state is None else state

  def __contains__(self, key: object) -> bool:
    if not isinstance(key, tuple) or len(key) != 3:
      return False
    return self._world.state_at(int(key[0]), int(key[1]), int(key[2])) is not None

  def __getitem__(self, key: BlockKey) -> str:
    state = self._world.state_at(int(key[0]), int(key[1]), int(key[2]))
    if state is None:
      raise KeyError(key)
    return state

  def keys(self) -> tuple[BlockKey, ...]:
    return self._world.placed_keys()

  def items(self) -> tuple[tuple[BlockKey, str], ...]:
    return self._world.placed_items()

  def __iter__(self) -> Iterator[BlockKey]:
    return iter(self._world.placed_keys())

  def __len__(self) -> int:
    return self._world.placed_count()

  def __bool__(self) -> bool:
    return self._world.placed_count() > 0


class WorldState:
  def __init__(self, blocks: Dict[BlockKey, str] | None = None, revision: int = 0, *, generation: WorldGenerationSpec | None = None, broken_cells: Iterable[BlockKey] = ()) -> None:
    self._lock = threading.RLock()
    self._generation = (generation if isinstance(generation, WorldGenerationSpec) else WorldGenerationSpec.static_spec()).normalized()
    self._placed: Dict[BlockKey, str] = {}
    for k, v in (blocks or {}).items():
      self._placed[(int(k[0]), int(k[1]), int(k[2]))] = str(v)
    self._broken: set[BlockKey] = set()
    if not self._generation.is_static():
      for k in broken_cells:
        self._broken.add((int(k[0]), int(k[1]), int(k[2])))
    self.revision = int(max(0, int(revision)))
    self.blocks = _WorldBlocksView(self)

    self._dirty_chunks: set[ChunkKey] = set()
    self._chunk_index: Dict[ChunkKey, set[BlockKey]] = {}
    self._column_index: Dict[ColumnKey, set[int]] = {}
    self._broken_chunk_keys: set[ChunkKey] = set()
    self._chunk_mesh_rev: Dict[ChunkKey, int] = {}
    self._gravity_dirty_columns: Dict[ColumnKey, int] = {}
    self._content_generation = 0

    self._height_cache: Dict[ColumnKey, int] = {}
    self._base_state_cache: Dict[BlockKey, str | None] = {}
    self._chunk_band_cache: Dict[ColumnKey, tuple[int, int] | None] = {}
    self._refresh_generation_fields()

    with self._lock:
      self._content_generation = _next_content_generation()
      self._rebuild_indexes_locked()
      self._reset_mesh_tracking_locked()
      self._reset_gravity_tracking_locked()

  # --- generation ----------------------------------------------------------

  def _refresh_generation_fields(self) -> None:
    spec = self._generation
    self._mode_code = mode_code(spec.mode)
    self._seed = int(spec.seed)
    self._gen_version = int(spec.version)
    self._flat_y = int(spec.flat_ground_y)
    self._is_static = bool(spec.is_static())

  def generation_spec(self) -> WorldGenerationSpec:
    with self._lock:
      return self._generation

  @property
  def content_generation(self) -> int:
    with self._lock:
      return int(self._content_generation)

  # --- indexes over placed blocks ------------------------------------------

  def _rebuild_indexes_locked(self) -> None:
    self._chunk_index.clear()
    self._column_index.clear()
    self._broken_chunk_keys.clear()
    for k in self._placed.keys():
      self._index_add(k)
    for k in self._broken:
      self._broken_chunk_keys.add(chunk_key(int(k[0]), int(k[1]), int(k[2])))

  def _reset_mesh_tracking_locked(self) -> None:
    self._chunk_mesh_rev.clear()
    for ck in self._chunk_index.keys():
      self._chunk_mesh_rev[ck] = 1
    for ck in self._broken_chunk_keys:
      if ck not in self._chunk_mesh_rev:
        self._chunk_mesh_rev[ck] = 1
    self._dirty_chunks = set(self._chunk_mesh_rev.keys())

  def _reset_gravity_tracking_locked(self) -> None:
    self._gravity_dirty_columns.clear()
    for (x, z), ys in self._column_index.items():
      if not ys:
        continue
      self._gravity_dirty_columns[(int(x), int(z))] = int(min(int(y) for y in ys))

  def _index_add(self, k: BlockKey) -> None:
    ck = chunk_key(int(k[0]), int(k[1]), int(k[2]))
    chunk_members = self._chunk_index.get(ck)
    if chunk_members is None:
      chunk_members = set()
      self._chunk_index[ck] = chunk_members
    chunk_members.add((int(k[0]), int(k[1]), int(k[2])))

    column_key = (int(k[0]), int(k[2]))
    column_members = self._column_index.get(column_key)
    if column_members is None:
      column_members = set()
      self._column_index[column_key] = column_members
    column_members.add(int(k[1]))

    if ck not in self._chunk_mesh_rev:
      self._chunk_mesh_rev[ck] = 1

  def _index_remove(self, k: BlockKey) -> None:
    ck = chunk_key(int(k[0]), int(k[1]), int(k[2]))
    chunk_members = self._chunk_index.get(ck)
    if chunk_members is not None:
      chunk_members.discard((int(k[0]), int(k[1]), int(k[2])))
      if not chunk_members:
        self._chunk_index.pop(ck, None)

    column_key = (int(k[0]), int(k[2]))
    column_members = self._column_index.get(column_key)
    if column_members is not None:
      column_members.discard(int(k[1]))
      if not column_members:
        self._column_index.pop(column_key, None)

  # --- base terrain resolution ---------------------------------------------

  def base_height(self, x: int, z: int) -> int:
    if self._is_static:
      return int(_NO_BASE_HEIGHT)
    key = (int(x), int(z))
    with self._lock:
      cached = self._height_cache.get(key)
      if cached is not None:
        return int(cached)
      h = surface_height(self._seed, self._gen_version, self._mode_code, self._flat_y, int(x), int(z))
      if len(self._height_cache) >= _HEIGHT_CACHE_LIMIT:
        self._height_cache.clear()
      self._height_cache[key] = int(h)
      return int(h)

  def base_state_at(self, x: int, y: int, z: int) -> str | None:
    if self._is_static:
      return None
    k = (int(x), int(y), int(z))
    with self._lock:
      if k in self._base_state_cache:
        return self._base_state_cache[k]
    h = self.base_height(int(x), int(z))
    code = material_code(self._seed, self._gen_version, self._mode_code, self._flat_y, int(x), int(y), int(z), column_height=int(h))
    state = TERRAIN_MATERIALS[int(code)] if int(code) > 0 else None
    with self._lock:
      if len(self._base_state_cache) >= _STATE_CACHE_LIMIT:
        self._base_state_cache.clear()
      self._base_state_cache[k] = state
    return state

  def state_at(self, x: int, y: int, z: int) -> str | None:
    k = (int(x), int(y), int(z))
    with self._lock:
      placed = self._placed.get(k)
      if placed is not None:
        return placed
      if k in self._broken:
        return None
    return self.base_state_at(int(x), int(y), int(z))

  # --- finite views ----------------------------------------------------------

  def placed_keys(self) -> tuple[BlockKey, ...]:
    with self._lock:
      return tuple(self._placed.keys())

  def placed_items(self) -> tuple[tuple[BlockKey, str], ...]:
    with self._lock:
      return tuple(self._placed.items())

  def placed_count(self) -> int:
    with self._lock:
      return len(self._placed)

  def placed_snapshot(self) -> Dict[BlockKey, str]:
    with self._lock:
      return dict(self._placed)

  def broken_snapshot(self) -> tuple[BlockKey, ...]:
    with self._lock:
      return tuple(sorted(self._broken))

  def snapshot_blocks(self) -> Dict[BlockKey, str]:
    return self.placed_snapshot()

  def iter_blocks(self) -> Iterable[tuple[int, int, int, str]]:
    with self._lock:
      items = list(self._placed.items())
    for (x, y, z), bid in items:
      yield int(x), int(y), int(z), str(bid)

  def existing_chunk_keys(self) -> set[ChunkKey]:
    with self._lock:
      return set(self._chunk_index.keys()) | set(self._broken_chunk_keys)

  # --- chunk / gravity tracking ---------------------------------------------

  def _effective_chunk_mesh_rev(self, ck: ChunkKey) -> int:
    key = (int(ck[0]), int(ck[1]), int(ck[2]))
    with self._lock:
      stored = self._chunk_mesh_rev.get(key)
    if stored is not None:
      return int(stored)
    return 1 if self.chunk_has_content(key) else 0

  def chunk_mesh_revision(self, ck: ChunkKey) -> int:
    return int(self._effective_chunk_mesh_rev(ck))

  def consume_dirty_chunks(self) -> set[ChunkKey]:
    with self._lock:
      out = set(self._dirty_chunks)
      self._dirty_chunks.clear()
      return out

  def consume_dirty_chunks_with_rev(self) -> Dict[ChunkKey, int]:
    with self._lock:
      out: Dict[ChunkKey, int] = {}
      for ck in self._dirty_chunks:
        out[ck] = int(self._chunk_mesh_rev.get(ck, 0))
      self._dirty_chunks.clear()
      return out

  def consume_pending_gravity_columns(self) -> Dict[ColumnKey, int]:
    with self._lock:
      out = dict(self._gravity_dirty_columns)
      self._gravity_dirty_columns.clear()
      return out

  def _mark_chunks_dirty(self, keys: Iterable[ChunkKey]) -> None:
    for ck0 in keys:
      ck = (int(ck0[0]), int(ck0[1]), int(ck0[2]))
      # Pristine generation-backed chunks are resident under the implicit
      # revision 1 that chunk_mesh_revision derives from chunk_has_content;
      # the first edit must therefore advance past that implicit revision,
      # never restart at 1, or resident meshes would treat the edit as
      # already uploaded.
      cur = int(self._effective_chunk_mesh_rev(ck))
      self._chunk_mesh_rev[ck] = int(cur + 1)
      self._dirty_chunks.add(ck)

  def _mark_gravity_dirty_cell(self, x: int, y: int, z: int) -> None:
    column_key = (int(x), int(z))
    current = self._gravity_dirty_columns.get(column_key)
    if current is None:
      self._gravity_dirty_columns[column_key] = int(y)
      return
    self._gravity_dirty_columns[column_key] = min(int(current), int(y))

  def _mark_gravity_dirty_cells(self, cells: Iterable[BlockKey]) -> None:
    for x, y, z in cells:
      self._mark_gravity_dirty_cell(int(x), int(y), int(z))

  # --- column queries --------------------------------------------------------

  def snapshot_column(self, x: int, z: int) -> Dict[int, str]:
    cx = int(x)
    cz = int(z)
    out: Dict[int, str] = {}
    with self._lock:
      placed_ys = tuple(self._column_index.get((cx, cz), ()))
      broken_ys = tuple(int(k[1]) for k in self._broken if int(k[0]) == cx and int(k[2]) == cz)
    for y in placed_ys:
      state = self.state_at(cx, int(y), cz)
      if state is not None:
        out[int(y)] = state
    if not self._is_static:
      h = self.base_height(cx, cz)
      if int(h) >= BEDROCK_Y:
        lo = int(h) - int(_SUB_SURFACE_BUFFER) - 1
        if broken_ys:
          lo = min(lo, min(broken_ys) - 2)
        lo = max(int(lo), int(BEDROCK_Y))
        for y in range(int(lo), int(h) + 1):
          if int(y) in out:
            continue
          state = self.state_at(cx, int(y), cz)
          if state is not None:
            out[int(y)] = state
    return out

  def column_y_values(self, x: int, z: int) -> tuple[int, ...]:
    return tuple(sorted(self.snapshot_column(int(x), int(z)).keys()))

  def snapshot_block_window(self, *, min_x: int, max_x: int, min_y: int, max_y: int, min_z: int, max_z: int) -> tuple[tuple[int, int, int, str], ...]:
    x0 = int(min(min_x, max_x))
    x1 = int(max(min_x, max_x))
    y0 = int(min(min_y, max_y))
    y1 = int(max(min_y, max_y))
    z0 = int(min(min_z, max_z))
    z1 = int(max(min_z, max_z))

    out: list[tuple[int, int, int, str]] = []
    for x in range(x0, x1 + 1):
      for z in range(z0, z1 + 1):
        column = self.snapshot_column(int(x), int(z))
        for y, state in column.items():
          if int(y) < y0 or int(y) > y1:
            continue
          out.append((int(x), int(y), int(z), str(state)))
    return tuple(out)

  # --- mutation ---------------------------------------------------------------

  def set_block(self, x: int, y: int, z: int, block_id: str) -> None:
    self.set_blocks_bulk(updates={(int(x), int(y), int(z)): str(block_id)})

  def remove_block(self, x: int, y: int, z: int) -> None:
    self.set_blocks_bulk(removals=((int(x), int(y), int(z)),))

  def set_blocks_bulk(self, *, updates: Dict[BlockKey, str] | None = None, removals: Iterable[BlockKey] = ()) -> None:
    upd_in = updates or {}

    norm_updates: Dict[BlockKey, str] = {}
    for k0, v0 in upd_in.items():
      kk = (int(k0[0]), int(k0[1]), int(k0[2]))
      norm_updates[kk] = str(v0)

    norm_removals: set[BlockKey] = set()
    for k0 in removals:
      kk = (int(k0[0]), int(k0[1]), int(k0[2]))
      if kk in norm_updates:
        continue
      norm_removals.add(kk)

    if not norm_updates and not norm_removals:
      return

    dirty_keys: set[ChunkKey] = set()
    gravity_cells: set[BlockKey] = set()
    changed = False

    with self._lock:
      for k in norm_removals:
        placed = self._placed.get(k)
        if placed is not None:
          del self._placed[k]
          self._index_remove(k)
        else:
          if k in self._broken:
            continue
          if self.base_state_at(int(k[0]), int(k[1]), int(k[2])) is None:
            continue
          self._broken.add(k)
          self._broken_chunk_keys.add(chunk_key(int(k[0]), int(k[1]), int(k[2])))
        dirty_keys.update(neighbor_chunk_keys_for_cell(int(k[0]), int(k[1]), int(k[2])))
        gravity_cells.add((int(k[0]), int(k[1]), int(k[2])))
        gravity_cells.add((int(k[0]), int(k[1]) + 1, int(k[2])))
        changed = True

      for k, v in norm_updates.items():
        prev = self._placed.get(k)
        if prev is None and k not in self._broken:
          prev = self.base_state_at(int(k[0]), int(k[1]), int(k[2]))
        if prev == str(v):
          continue

        existed = k in self._placed
        self._placed[k] = str(v)
        if not existed:
          self._index_add(k)

        dirty_keys.update(neighbor_chunk_keys_for_cell(int(k[0]), int(k[1]), int(k[2])))
        gravity_cells.add((int(k[0]), int(k[1]), int(k[2])))
        gravity_cells.add((int(k[0]), int(k[1]) + 1, int(k[2])))
        changed = True

      if not changed:
        return

      self.revision += 1
      self._mark_chunks_dirty(dirty_keys)
      self._mark_gravity_dirty_cells(gravity_cells)

  # --- content replacement -----------------------------------------------------

  def replace_content(self, *, generation: WorldGenerationSpec, placed: Dict[BlockKey, str], broken: Iterable[BlockKey], revision: int) -> None:
    with self._lock:
      self._generation = generation.normalized()
      self._refresh_generation_fields()
      self._placed = {(int(k[0]), int(k[1]), int(k[2])): str(v) for k, v in placed.items()}
      self._broken = set() if self._is_static else {(int(k[0]), int(k[1]), int(k[2])) for k in broken}
      self.revision = int(max(0, int(revision)))
      self._height_cache.clear()
      self._base_state_cache.clear()
      self._chunk_band_cache.clear()
      self._content_generation = _next_content_generation()
      self._rebuild_indexes_locked()
      self._reset_mesh_tracking_locked()
      self._reset_gravity_tracking_locked()

  def replace_all(self, *, blocks: Dict[BlockKey, str], revision: int) -> None:
    self.replace_content(generation=WorldGenerationSpec.static_spec(), placed=dict(blocks), broken=(), revision=int(revision))

  # --- render materialization ----------------------------------------------------

  def _chunk_column_band(self, cx: int, cz: int) -> tuple[int, int] | None:
    if self._is_static:
      return None
    key = (int(cx), int(cz))
    with self._lock:
      if key in self._chunk_band_cache:
        return self._chunk_band_cache[key]
    if self._mode_code == MODE_FLAT_CODE:
      # Flat generation places exactly one solid layer at flat_ground_y and
      # air everywhere else, so the surface envelope collapses to that layer.
      band = (int(self._flat_y), int(self._flat_y))
      with self._lock:
        self._chunk_band_cache[key] = band
      return band
    x0 = int(cx) * CHUNK_SIZE
    z0 = int(cz) * CHUNK_SIZE
    heights = terrain_native.surface_heights(self._seed, self._gen_version, self._mode_code, self._flat_y, x0 - 1, z0 - 1, CHUNK_SIZE + 2, CHUNK_SIZE + 2)
    core = heights[1 : CHUNK_SIZE + 1, 1 : CHUNK_SIZE + 1]
    hi = int(core.max())
    if hi < BEDROCK_Y:
      band: tuple[int, int] | None = None
    else:
      neighbor_min = np.minimum.reduce(
        (heights[0:CHUNK_SIZE, 1 : CHUNK_SIZE + 1], heights[2 : CHUNK_SIZE + 2, 1 : CHUNK_SIZE + 1], heights[1 : CHUNK_SIZE + 1, 0:CHUNK_SIZE], heights[1 : CHUNK_SIZE + 1, 2 : CHUNK_SIZE + 2])
      )
      column_lo = np.minimum(core - int(_SUB_SURFACE_BUFFER), neighbor_min + 1)
      lo = int(max(int(column_lo.min()), int(BEDROCK_Y)))
      band = (int(lo), int(hi))
    with self._lock:
      self._chunk_band_cache[key] = band
    return band

  def _content_floor_y(self) -> int:
    # Lowest generated solid cell of any column: the flat layer for flat
    # generation, the bedrock layer for normal generation.
    if self._mode_code == MODE_FLAT_CODE:
      return int(self._flat_y)
    return int(BEDROCK_Y)

  def chunk_has_content(self, ck: ChunkKey) -> bool:
    key = (int(ck[0]), int(ck[1]), int(ck[2]))
    with self._lock:
      if key in self._chunk_index or key in self._broken_chunk_keys:
        return True
    band = self._chunk_column_band(int(key[0]), int(key[2]))
    if band is None:
      return False
    # Generated solid cells span from the content floor up to the highest
    # surface of the column band, so any chunk inside that span holds
    # content: interior chunks mesh to zero faces until an edit or a
    # neighboring edit exposes them, and the bedrock layer meshes its
    # permanently exposed underside exactly like the surface skin.
    y_lo = int(key[1]) * CHUNK_SIZE
    y_hi = y_lo + CHUNK_SIZE - 1
    return int(y_hi) >= int(self._content_floor_y()) and int(y_lo) <= int(band[1])

  def visible_content_chunk_keys(self, center: ChunkKey, radius: int) -> set[ChunkKey]:
    ccx, ccy, ccz = (int(center[0]), int(center[1]), int(center[2]))
    r = int(max(0, radius))
    out: set[ChunkKey] = set()

    # Surface-envelope and floor-envelope chunks for every column inside the
    # horizontal radius. The whole vertical extent of each column band stays
    # a candidate: the band is a bounded envelope around the generated
    # surface, and clamping it against the player's chunk Y made the terrain
    # drop out of the candidate set as soon as the eye crossed a CHUNK_SIZE
    # boundary away from the band. The floor row carries the content floor
    # (bedrock for normal generation, the flat layer for flat generation),
    # whose underside is the world's permanently exposed bottom skin.
    floor_cy = int(self._content_floor_y()) // int(CHUNK_SIZE)
    for cx in range(ccx - r, ccx + r + 1):
      for cz in range(ccz - r, ccz + r + 1):
        band = self._chunk_column_band(int(cx), int(cz))
        if band is None:
          continue
        cy_lo = int(math.floor(float(band[0]) / float(CHUNK_SIZE)))
        cy_hi = int(math.floor(float(band[1]) / float(CHUNK_SIZE)))
        for cy in range(cy_lo, cy_hi + 1):
          out.add((int(cx), int(cy), int(cz)))
        out.add((int(cx), int(floor_cy), int(cz)))

    # Chunks the player occupies or can reach into next; empty ones resolve
    # to mesh revision 0 and are skipped by the upload scheduler.
    for dx in (-1, 0, 1):
      for dy in (-1, 0, 1):
        for dz in (-1, 0, 1):
          out.add((int(ccx + dx), int(ccy + dy), int(ccz + dz)))

    # Every chunk with tracked mesh state: chunks holding placed blocks,
    # chunks holding broken cells, and chunks whose mesh revision advanced
    # because a neighboring cell edit dirtied them. Without the revision
    # keys, a chunk dirtied only through a neighbor edit (for example the
    # chunk below a shaft floor) never re-entered the candidate set until
    # it was edited directly. The filter is horizontal only, matching the
    # column envelopes: a shaft dug from the surface to bedrock stays
    # visible over its whole height while the player stands at either end.
    with self._lock:
      tracked = set(self._chunk_index.keys()) | set(self._broken_chunk_keys) | set(self._chunk_mesh_rev.keys())
    for ck in tracked:
      if abs(int(ck[0]) - ccx) <= r and abs(int(ck[2]) - ccz) <= r:
        out.add((int(ck[0]), int(ck[1]), int(ck[2])))
    return out

  def _snapshot_for_chunk_build_static(self, target: ChunkKey) -> tuple[list[tuple[int, int, int, str]], Dict[BlockKey, str]]:
    cx, cy, cz = (int(target[0]), int(target[1]), int(target[2]))
    neigh: list[ChunkKey] = []
    for dx in (-1, 0, 1):
      for dy in (-1, 0, 1):
        for dz in (-1, 0, 1):
          neigh.append((cx + dx, cy + dy, cz + dz))

    with self._lock:
      state_at: Dict[BlockKey, str] = {}
      for ck in neigh:
        keys = self._chunk_index.get(ck)
        if not keys:
          continue
        for k in keys:
          s = self._placed.get(k)
          if s is None:
            continue
          state_at[(int(k[0]), int(k[1]), int(k[2]))] = str(s)

      blocks_local: list[tuple[int, int, int, str]] = []
      keys_t = self._chunk_index.get((cx, cy, cz))
      if keys_t:
        for k in keys_t:
          s = state_at.get(k)
          if s is None:
            continue
          blocks_local.append((int(k[0]), int(k[1]), int(k[2]), str(s)))

    return blocks_local, state_at

  def snapshot_for_chunk_build(self, target: ChunkKey) -> tuple[list[tuple[int, int, int, str]], Dict[BlockKey, str]]:
    if self._is_static:
      return self._snapshot_for_chunk_build_static(target)

    cx, cy, cz = (int(target[0]), int(target[1]), int(target[2]))
    x0 = cx * CHUNK_SIZE - 1
    y0 = cy * CHUNK_SIZE - 1
    z0 = cz * CHUNK_SIZE - 1
    n = CHUNK_SIZE + 2

    materials = terrain_native.terrain_materials(self._seed, self._gen_version, self._mode_code, self._flat_y, x0, y0, z0, n, n, n)
    solid = materials != 0

    with self._lock:
      placed_box: Dict[BlockKey, str] = {}
      for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
          for dz in (-1, 0, 1):
            keys = self._chunk_index.get((cx + dx, cy + dy, cz + dz))
            if not keys:
              continue
            for k in keys:
              if x0 <= int(k[0]) < x0 + n and y0 <= int(k[1]) < y0 + n and z0 <= int(k[2]) < z0 + n:
                placed_box[k] = str(self._placed[k])
      broken_box = {k for k in self._broken if x0 <= int(k[0]) < x0 + n and y0 <= int(k[1]) < y0 + n and z0 <= int(k[2]) < z0 + n}

    for k in broken_box:
      solid[int(k[0]) - x0, int(k[1]) - y0, int(k[2]) - z0] = False
    for k in placed_box.keys():
      solid[int(k[0]) - x0, int(k[1]) - y0, int(k[2]) - z0] = True

    state_at: Dict[BlockKey, str] = {}
    solid_indices = np.argwhere(solid)
    for ix, iy, iz in solid_indices:
      k = (int(x0 + ix), int(y0 + iy), int(z0 + iz))
      placed = placed_box.get(k)
      if placed is not None:
        state_at[k] = placed
        continue
      code = int(materials[int(ix), int(iy), int(iz)])
      if code > 0:
        state_at[k] = TERRAIN_MATERIALS[code]

    core = solid[1 : n - 1, 1 : n - 1, 1 : n - 1]
    open_any = (
      (~solid[0 : n - 2, 1 : n - 1, 1 : n - 1])
      | (~solid[2:n, 1 : n - 1, 1 : n - 1])
      | (~solid[1 : n - 1, 0 : n - 2, 1 : n - 1])
      | (~solid[1 : n - 1, 2:n, 1 : n - 1])
      | (~solid[1 : n - 1, 1 : n - 1, 0 : n - 2])
      | (~solid[1 : n - 1, 1 : n - 1, 2:n])
    )
    exposed = np.argwhere(core & open_any)

    blocks_local: list[tuple[int, int, int, str]] = []
    for ix, iy, iz in exposed:
      k = (int(x0 + 1 + ix), int(y0 + 1 + iy), int(z0 + 1 + iz))
      state = state_at.get(k)
      if state is not None:
        blocks_local.append((int(k[0]), int(k[1]), int(k[2]), str(state)))

    return blocks_local, state_at

  # --- persistence -----------------------------------------------------------

  def to_persisted_dict(self) -> dict[str, Any]:
    with self._lock:
      placed_items: list[list[Any]] = []
      for (x, y, z), s in self._placed.items():
        placed_items.append([int(x), int(y), int(z), str(s)])
      broken_items: list[list[int]] = []
      for x, y, z in sorted(self._broken):
        broken_items.append([int(x), int(y), int(z)])
      return {"version": 2, "generation": self._generation.to_dict(), "revision": int(self.revision), "placed": placed_items, "broken": broken_items}

  @staticmethod
  def from_persisted_dict(d: dict[str, Any]) -> "WorldState":
    raw = d if isinstance(d, dict) else {}
    rev = raw.get("revision", 0)
    try:
      revision = int(rev)
    except Exception:
      revision = 0

    raw_generation = raw.get("generation")
    if isinstance(raw_generation, dict):
      generation = WorldGenerationSpec.from_dict(raw_generation)
      placed_raw = raw.get("placed", [])
      broken_raw = raw.get("broken", [])
    else:
      # Legacy `.ldxworld` payload: a materialized block set without a
      # generation spec loads as a static world that keeps every block.
      generation = WorldGenerationSpec.static_spec()
      placed_raw = raw.get("blocks", [])
      broken_raw = []

    placed: Dict[BlockKey, str] = {}
    if isinstance(placed_raw, list):
      for it in placed_raw:
        if not isinstance(it, list) or len(it) != 4:
          continue
        try:
          placed[(int(it[0]), int(it[1]), int(it[2]))] = str(it[3])
        except Exception:
          continue

    broken: list[BlockKey] = []
    if isinstance(broken_raw, list):
      for it in broken_raw:
        if not isinstance(it, list) or len(it) != 3:
          continue
        try:
          broken.append((int(it[0]), int(it[1]), int(it[2])))
        except Exception:
          continue

    return WorldState(blocks=placed, revision=int(max(0, revision)), generation=generation, broken_cells=tuple(broken))
