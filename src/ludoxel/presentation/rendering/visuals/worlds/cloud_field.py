# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from ludoxel.application.preferences.cloud_flow import DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION, normalize_backend_cloud_flow_direction
from ludoxel.application.preferences.clouds import normalize_cloud_height_settings, normalize_cloud_speed_range
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.contracts.config import BackendCloudParams

CLOUD_FACE_COUNT = 6
CLOUD_INSTANCE_ROW_WIDTH = 11
_CLOUD_SPEED_BUCKET_COUNT = 12
_TURBULENCE_AMP_MIN_BLOCKS = 0.3
_TURBULENCE_AMP_MAX_BLOCKS = 1.0
_TURBULENCE_FREQ_MIN_RAD_S = 0.05
_TURBULENCE_FREQ_MAX_RAD_S = 0.20

_FACE_NEIGHBOUR: dict[int, tuple[int, int] | None] = {0: (1, 0), 1: (-1, 0), 2: None, 3: None, 4: (0, 1), 5: (0, -1)}


@dataclass(frozen=True)
class CloudBox:
  center: Vec3
  size: Vec3
  alpha_mul: float
  speed_multiplier: float


@dataclass(frozen=True)
class _Cell:
  i: int
  j: int
  min_x: int
  max_x: int
  min_z: int
  max_z: int

  def center_x(self) -> float:
    return float(self.min_x + self.max_x) * 0.5

  def center_z(self) -> float:
    return float(self.min_z + self.max_z) * 0.5

  def width(self) -> float:
    return float(self.max_x - self.min_x)

  def depth(self) -> float:
    return float(self.max_z - self.min_z)


@dataclass(frozen=True)
class CloudShape:
  bounds: CloudBox
  cells: tuple[_Cell, ...]
  y0: float
  thickness: float
  alpha_mul: float
  speed_multiplier: float
  turbulence_amp: float
  turbulence_freq: float
  turbulence_phase: float


def _rows_from_boxes(boxes: list[tuple[CloudShape, CloudBox]]) -> np.ndarray:
  rows: list[list[float]] = []
  for shape, box in boxes:
    rows.append([float(box.center.x), float(box.center.y), float(box.center.z), float(box.size.x), float(box.size.y), float(box.size.z), float(box.alpha_mul), float(box.speed_multiplier), float(shape.turbulence_amp), float(shape.turbulence_freq), float(shape.turbulence_phase)])
  if not rows:
    return np.zeros((0, CLOUD_INSTANCE_ROW_WIDTH), dtype=np.float32)
  return np.ascontiguousarray(rows, dtype=np.float32)


def cloud_face_rows(shapes: list[CloudShape], face_index: int) -> np.ndarray:
  face = int(face_index)
  neighbour = _FACE_NEIGHBOUR.get(face)
  out: list[tuple[CloudShape, CloudBox]] = []
  for shape in shapes:
    occupied = {(cell.i, cell.j) for cell in shape.cells}
    cy = float(shape.y0) + float(shape.thickness) * 0.5
    for cell in shape.cells:
      if neighbour is not None and (int(cell.i) + int(neighbour[0]), int(cell.j) + int(neighbour[1])) in occupied:
        continue
      box = CloudBox(center=Vec3(cell.center_x(), cy, cell.center_z()), size=Vec3(cell.width(), float(shape.thickness), cell.depth()), alpha_mul=float(shape.alpha_mul), speed_multiplier=float(shape.speed_multiplier))
      out.append((shape, box))
  return _rows_from_boxes(out)


def cloud_volume_rows(shapes: list[CloudShape]) -> np.ndarray:
  rows: list[list[float]] = []
  for shape in shapes:
    if not shape.cells:
      continue
    cell_size = int(shape.cells[0].max_x - shape.cells[0].min_x)
    if cell_size <= 0:
      continue
    min_x = min(c.min_x for c in shape.cells)
    max_x = max(c.max_x for c in shape.cells)
    min_z = min(c.min_z for c in shape.cells)
    max_z = max(c.max_z for c in shape.cells)
    grid_w = int(round(float(max_x - min_x) / float(cell_size)))
    grid_d = int(round(float(max_z - min_z) / float(cell_size)))
    if grid_w <= 0 or grid_d <= 0 or grid_w * grid_d > 24:
      continue
    bitmask = 0
    for cell in shape.cells:
      il = int(round(float(cell.min_x - min_x) / float(cell_size)))
      jl = int(round(float(cell.min_z - min_z) / float(cell_size)))
      if 0 <= il < grid_w and 0 <= jl < grid_d:
        bitmask |= 1 << (jl * grid_w + il)

    thickness = float(shape.thickness)
    center_x = float(min_x + max_x) * 0.5
    center_z = float(min_z + max_z) * 0.5
    center_y = float(shape.y0) + thickness * 0.5
    seed = float((int(round(shape.turbulence_phase * 1000.0)) ^ int(round(center_x)) ^ (int(round(center_z)) << 1)) % 4093)
    rows.append([float(center_x), float(center_y), float(center_z), float(max_x - min_x), float(thickness * 1.9), float(max_z - min_z), float(shape.alpha_mul), float(shape.speed_multiplier), float(seed), float(bitmask), float(int(grid_w) + int(grid_d) * 8)])
  if not rows:
    return np.zeros((0, CLOUD_INSTANCE_ROW_WIDTH), dtype=np.float32)
  return np.ascontiguousarray(rows, dtype=np.float32)


def _hash_u32(n: int) -> int:
  n &= 0xFFFFFFFF
  n ^= (n >> 16) & 0xFFFFFFFF
  n = (n * 0x7FEB352D) & 0xFFFFFFFF
  n ^= (n >> 15) & 0xFFFFFFFF
  n = (n * 0x846CA68B) & 0xFFFFFFFF
  n ^= (n >> 16) & 0xFFFFFFFF
  return n & 0xFFFFFFFF


class CloudField:
  def __init__(self, cfg: BackendCloudParams) -> None:
    self._cfg = cfg

    self._enabled_density: int = int(max(0, int(cfg.rects_per_cell)))
    self._cell_size: int = int(max(4, int(cfg.cell_size)))
    self._seed: int = int(cfg.seed)
    self._speed_variation_enabled: bool = bool(cfg.speed_variation_enabled)
    self._speed_min_blocks_per_second, self._speed_max_blocks_per_second = normalize_cloud_speed_range(cfg.speed_min_blocks_per_second, cfg.speed_max_blocks_per_second)
    self._height_variation_enabled: bool = bool(cfg.height_variation_enabled)
    (self._fixed_y, self._spawn_y_min, self._spawn_y_max, self._preferred_y_min, self._preferred_y_max, self._preferred_y_probability_percent) = normalize_cloud_height_settings(cfg.y, cfg.spawn_y_min, cfg.spawn_y_max, cfg.preferred_y_min, cfg.preferred_y_max, cfg.preferred_y_probability_percent)

    self._flow_direction: str = normalize_backend_cloud_flow_direction(DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION)
    self._flow_epoch_s: float = 0.0
    self._flow_base_shift: Vec3 = Vec3(0.0, 0.0, 0.0)

    self._view_radius: float = float(max(0, int(cfg.view_radius)))

    self._bucket_cache: dict[int, tuple[tuple[int, int], list[CloudShape]]] = {}

  def _invalidate_cache(self) -> None:
    self._bucket_cache = {}

  def set_density(self, density: int) -> None:
    d = int(max(0, density))
    if d == int(self._enabled_density):
      return
    self._enabled_density = d
    self._invalidate_cache()

  def set_cell_size(self, cell_size: int) -> bool:
    c = int(max(4, int(cell_size)))
    if c == int(self._cell_size):
      return False
    self._cell_size = c
    self._invalidate_cache()
    return True

  def set_seed(self, seed: int) -> None:
    s = int(seed)
    if s == int(self._seed):
      return
    self._seed = s
    self._invalidate_cache()

  def set_speed_variation(self, enabled: bool, min_speed: float, max_speed: float) -> bool:
    speed_min, speed_max = normalize_cloud_speed_range(min_speed, max_speed)
    signature = (bool(enabled), float(speed_min), float(speed_max))
    current = (bool(self._speed_variation_enabled), float(self._speed_min_blocks_per_second), float(self._speed_max_blocks_per_second))
    if signature == current:
      return False
    self._speed_variation_enabled = bool(enabled)
    self._speed_min_blocks_per_second = float(speed_min)
    self._speed_max_blocks_per_second = float(speed_max)
    self._invalidate_cache()
    return True

  def set_height_variation(self, enabled: bool, fixed_y: int, spawn_y_min: int, spawn_y_max: int, preferred_y_min: int, preferred_y_max: int, preferred_y_probability_percent: int) -> bool:
    fixed, spawn_min, spawn_max, preferred_min, preferred_max, probability = normalize_cloud_height_settings(fixed_y, spawn_y_min, spawn_y_max, preferred_y_min, preferred_y_max, preferred_y_probability_percent)
    signature = (bool(enabled), int(fixed), int(spawn_min), int(spawn_max), int(preferred_min), int(preferred_max), int(probability))
    current = (bool(self._height_variation_enabled), int(self._fixed_y), int(self._spawn_y_min), int(self._spawn_y_max), int(self._preferred_y_min), int(self._preferred_y_max), int(self._preferred_y_probability_percent))
    if signature == current:
      return False
    self._height_variation_enabled = bool(enabled)
    self._fixed_y = int(fixed)
    self._spawn_y_min = int(spawn_min)
    self._spawn_y_max = int(spawn_max)
    self._preferred_y_min = int(preferred_min)
    self._preferred_y_max = int(preferred_max)
    self._preferred_y_probability_percent = int(probability)
    self._invalidate_cache()
    return True

  def set_flow_direction(self, direction: str, *, t_seconds: float = 0.0) -> None:
    nxt = normalize_backend_cloud_flow_direction(str(direction))
    ts = float(max(0.0, t_seconds))

    cur = self.shift(ts)

    self._flow_direction = str(nxt)
    self._flow_epoch_s = float(ts)
    self._flow_base_shift = Vec3(float(cur.x), 0.0, float(cur.z))
    self._invalidate_cache()

  def _flow_speed(self) -> float:
    sx = abs(float(self._cfg.speed_x))
    sz = abs(float(self._cfg.speed_z))
    sp = math.hypot(sx, sz)
    if sp > 1e-9:
      return float(sp)
    return float(max(sx, sz, 0.0))

  def _flow_velocity(self, direction: str) -> tuple[float, float]:
    sp = float(self._flow_speed())
    d = normalize_backend_cloud_flow_direction(str(direction))

    if d == "east_to_west":
      return (-sp, 0.0)
    if d == "west_to_east":
      return (sp, 0.0)
    if d == "south_to_north":
      return (0.0, -sp)
    return (0.0, sp)

  def cell_size(self) -> int:
    return int(self._cell_size)

  def flow_dir_xz(self) -> tuple[float, float]:
    vx, vz = self._flow_velocity(self._flow_direction)
    length = math.hypot(float(vx), float(vz))
    if length <= 1e-9:
      return (1.0, 0.0)
    return (float(vx) / float(length), float(vz) / float(length))

  def _flow_along_x(self) -> bool:
    vx, _vz = self._flow_velocity(self._flow_direction)
    return abs(float(vx)) > 0.0

  def shift(self, t_seconds: float) -> Vec3:
    ts = float(max(0.0, t_seconds))
    dt = float(max(0.0, ts - float(self._flow_epoch_s)))

    vx, vz = self._flow_velocity(self._flow_direction)
    return Vec3(float(self._flow_base_shift.x) + vx * dt, 0.0, float(self._flow_base_shift.z) + vz * dt)

  def _speed_bucket_multipliers(self) -> tuple[float, ...]:
    if not bool(self._speed_variation_enabled):
      return (1.0,)

    base_speed = float(self._flow_speed())
    if float(base_speed) <= 1e-9:
      return (1.0,)

    speed_min = float(self._speed_min_blocks_per_second)
    speed_max = float(self._speed_max_blocks_per_second)
    if math.isclose(float(speed_min), float(speed_max), rel_tol=0.0, abs_tol=1e-9):
      return (float(speed_min) / float(base_speed),)

    last = int(_CLOUD_SPEED_BUCKET_COUNT - 1)
    return tuple((float(speed_min) + (float(speed_max) - float(speed_min)) * (float(index) / float(last))) / float(base_speed) for index in range(int(_CLOUD_SPEED_BUCKET_COUNT)))

  def _row_bucket(self, row_coord: int, *, bucket_count: int) -> int:
    count = max(1, int(bucket_count))
    if count <= 1:
      return 0
    bucket_random = self._hash2(int(row_coord), 0x517CC1B7, int(self._seed) ^ 0xA24BAEDB)
    return min(int(count - 1), int(float(bucket_random) * float(count)))

  def _effective_macro(self) -> int:
    density = int(min(4, max(1, int(self._enabled_density))))
    gap_cells = {1: 10, 2: 6, 3: 3, 4: 1}.get(int(density), 3)
    grid_max = 4
    return int(max(int(self._cell_size) * (int(grid_max) + int(gap_cells)), int(self._cell_size) * 5))

  def _effective_drop_threshold(self) -> float:
    density = int(min(4, max(1, int(self._enabled_density))))
    return float(max(0.15, 0.70 - 0.14 * float(density - 1)))

  def ensure_cache(self, eye: Vec3, shift: Vec3) -> None:
    if int(self._enabled_density) <= 0:
      self._invalidate_cache()
      return

    m = int(self._effective_macro())
    multipliers = self._speed_bucket_multipliers()
    if len(self._bucket_cache) > len(multipliers):
      self._bucket_cache = {}

    for bucket_index, multiplier in enumerate(multipliers):
      anchor = (self._floor_div(int(math.floor(float(eye.x) - float(shift.x) * float(multiplier))), m), self._floor_div(int(math.floor(float(eye.z) - float(shift.z) * float(multiplier))), m))
      cached = self._bucket_cache.get(int(bucket_index))
      if cached is not None and cached[0] == anchor:
        continue
      self._bucket_cache[int(bucket_index)] = (anchor, self._build_bucket_shapes(bucket_index=int(bucket_index), anchor=anchor, speed_multiplier=float(multiplier), bucket_count=len(multipliers)))

  def set_view_radius(self, radius: float) -> None:
    r = float(max(0.0, radius))
    if abs(r - float(self._view_radius)) < 1.0:
      return
    self._view_radius = r
    self._invalidate_cache()

  def visible_shapes(self, eye: Vec3, shift: Vec3, forward: Vec3, fov_deg: float, aspect: float, z_far: float) -> list[CloudShape]:
    self.set_view_radius(float(z_far))
    self.ensure_cache(eye=eye, shift=shift)

    if not self._bucket_cache:
      return []

    up_hint = Vec3(0.0, 1.0, 0.0)
    right = up_hint.cross(forward).normalized()
    up = forward.cross(right).normalized()

    tan_y = math.tan(math.radians(float(fov_deg)) * 0.5)
    tan_x = tan_y * max(float(aspect), 1e-6)

    out: list[CloudShape] = []
    for _anchor, shapes in self._bucket_cache.values():
      for shape in shapes:
        b = shape.bounds
        c_world = Vec3(b.center.x + shift.x * float(b.speed_multiplier), b.center.y, b.center.z + shift.z * float(b.speed_multiplier))

        pad = float(shape.turbulence_amp)
        hx = b.size.x * 0.5 + pad
        hy = b.size.y * 0.5
        hz = b.size.z * 0.5 + pad

        v = c_world - eye
        z = v.dot(forward)
        extent_z = abs(float(forward.x)) * float(hx) + abs(float(forward.y)) * float(hy) + abs(float(forward.z)) * float(hz)

        if z + extent_z <= 0.0:
          continue
        if z - extent_z > float(z_far):
          continue

        x = v.dot(right)
        y = v.dot(up)
        extent_x = abs(float(right.x)) * float(hx) + abs(float(right.y)) * float(hy) + abs(float(right.z)) * float(hz)
        extent_y = abs(float(up.x)) * float(hx) + abs(float(up.y)) * float(hy) + abs(float(up.z)) * float(hz)
        farthest_visible_z = max(float(z + extent_z), 0.0)

        if abs(float(x)) - extent_x > farthest_visible_z * tan_x:
          continue
        if abs(float(y)) - extent_y > farthest_visible_z * tan_y:
          continue

        out.append(shape)

    return out

  def _build_bucket_shapes(self, *, bucket_index: int, anchor: tuple[int, int], speed_multiplier: float, bucket_count: int) -> list[CloudShape]:
    m = int(self._effective_macro())
    r = int(round(float(self._view_radius)))

    span = int(math.ceil(float(max(1, r)) / float(m))) + 1

    rects_per_cell = int(max(0, int(self._enabled_density)))
    if rects_per_cell <= 0:
      return []

    flow_along_x = bool(self._flow_along_x())
    anchor_mx, anchor_mz = (int(anchor[0]), int(anchor[1]))

    shapes: list[CloudShape] = []
    for mx in range(anchor_mx - span, anchor_mx + span + 1):
      for mz in range(anchor_mz - span, anchor_mz + span + 1):
        row_coord = int(mz) if flow_along_x else int(mx)
        if self._row_bucket(int(row_coord), bucket_count=int(bucket_count)) != int(bucket_index):
          continue

        if self._hash3(mx, mz, 0, int(self._seed) ^ 0x51ED270B) < float(self._effective_drop_threshold()):
          continue

        shape = self._shape_for_cell(mx=mx, mz=mz, m=m, speed_multiplier=float(speed_multiplier))
        if shape is not None:
          shapes.append(shape)

    return shapes

  def _cloud_y(self, mx: int, mz: int) -> float:
    if not bool(self._height_variation_enabled):
      return float(self._fixed_y)

    preferred_roll = self._hash3(mx, mz, 1, int(self._seed) ^ 0xC2B2AE35)
    preferred_probability = float(self._preferred_y_probability_percent) / 100.0
    if float(preferred_roll) < float(preferred_probability):
      y_min = int(self._preferred_y_min)
      y_max = int(self._preferred_y_max)
      sample = self._hash3(mx, mz, 2, int(self._seed) ^ 0x27D4EB2F)
    else:
      y_min = int(self._spawn_y_min)
      y_max = int(self._spawn_y_max)
      sample = self._hash3(mx, mz, 3, int(self._seed) ^ 0x165667B1)
    return float(y_min) + float(sample) * float(max(0, y_max - y_min))

  def _shape_for_cell(self, *, mx: int, mz: int, m: int, speed_multiplier: float) -> CloudShape | None:
    cell_size = int(max(4, int(self._cell_size)))
    margin = int(self._cfg.rect_margin)

    def rand(salt: int) -> float:
      return self._hash3(mx, mz, 7, int(self._seed) ^ int(salt))

    max_cells = max(2, int((m - 2 * margin) // cell_size))
    core_limit = max(2, min(3, int(max_cells) - 1))
    grid_w = min(int(core_limit), 2 + int(rand(0xD1B54A35) * 2.0))
    grid_d = min(int(core_limit), 2 + int(rand(0x94D049BB) * 2.0))

    occupancy = self._cluster_occupancy(mx, mz, grid_w, grid_d)
    if len(occupancy) < 3:
      return None

    grid_i = max(i for i, _j in occupancy) + 1
    grid_j = max(j for _i, j in occupancy) + 1
    footprint_w = int(grid_i) * cell_size
    footprint_d = int(grid_j) * cell_size
    free_x = max(0, (m - 2 * margin) - footprint_w)
    free_z = max(0, (m - 2 * margin) - footprint_d)
    origin_x = mx * m + margin + int(rand(0xDEADBEEF) * float(free_x))
    origin_z = mz * m + margin + int(rand(0xBADC0FFE) * float(free_z))

    cells: list[_Cell] = []
    for i, j in sorted(occupancy):
      cells.append(_Cell(i=int(i), j=int(j), min_x=int(origin_x + i * cell_size), max_x=int(origin_x + (i + 1) * cell_size), min_z=int(origin_z + j * cell_size), max_z=int(origin_z + (j + 1) * cell_size)))

    thickness = float(max(1, int(self._cfg.thickness))) * (0.85 + 0.45 * rand(0x8DA6B343))
    y0 = self._cloud_y(mx, mz)
    alpha = float(self._cfg.alpha_min) + float(self._cfg.alpha_range) * rand(0xB5297A4D)

    min_x = min(c.min_x for c in cells)
    max_x = max(c.max_x for c in cells)
    min_z = min(c.min_z for c in cells)
    max_z = max(c.max_z for c in cells)
    bounds = CloudBox(center=Vec3(float(min_x + max_x) * 0.5, y0 + thickness * 0.5, float(min_z + max_z) * 0.5), size=Vec3(float(max_x - min_x), float(thickness), float(max_z - min_z)), alpha_mul=float(alpha), speed_multiplier=float(speed_multiplier))

    turbulence_amp = float(_TURBULENCE_AMP_MIN_BLOCKS) + (float(_TURBULENCE_AMP_MAX_BLOCKS) - float(_TURBULENCE_AMP_MIN_BLOCKS)) * rand(0x38B4DA56)
    turbulence_freq = float(_TURBULENCE_FREQ_MIN_RAD_S) + (float(_TURBULENCE_FREQ_MAX_RAD_S) - float(_TURBULENCE_FREQ_MIN_RAD_S)) * rand(0x9E3779B9)
    turbulence_phase = 2.0 * math.pi * rand(0xB2F0E1CC)

    return CloudShape(bounds=bounds, cells=tuple(cells), y0=float(y0), thickness=float(thickness), alpha_mul=float(alpha), speed_multiplier=float(speed_multiplier), turbulence_amp=float(turbulence_amp), turbulence_freq=float(turbulence_freq), turbulence_phase=float(turbulence_phase))

  def _cluster_occupancy(self, mx: int, mz: int, grid_w: int, grid_d: int) -> set[tuple[int, int]]:
    def rand(salt: int) -> float:
      return self._hash3(mx, mz, int(salt), int(self._seed) ^ 0x27D4EB2F)

    core_w = max(2, int(grid_w) - int(rand(0x11) > 0.5))
    core_d = max(2, int(grid_d) - int(rand(0x12) > 0.5))
    occupancy: set[tuple[int, int]] = {(i, j) for i in range(core_w) for j in range(core_d)}

    modified = False

    corners = [(0, 0), (core_w - 1, 0), (0, core_d - 1), (core_w - 1, core_d - 1)]
    notch_count = int(rand(0x21) * 3.0)
    for notch_index in range(int(notch_count)):
      corner = corners[int(rand(0x22 + notch_index * 7) * 4.0) % 4]
      if corner in occupancy and len(occupancy) > 3:
        occupancy.discard(corner)
        modified = True

    bump_count = 1 + int(rand(0x31) * 2.0)
    for bump_index in range(int(bump_count)):
      side = int(rand(0x32 + bump_index * 5) * 4.0) % 4
      if side == 0:  # +x column
        j = int(rand(0x33 + bump_index) * float(core_d))
        occupancy.add((core_w, min(core_d - 1, j)))
      elif side == 1:  # -x column
        j = int(rand(0x34 + bump_index) * float(core_d))
        cell = (-1, min(core_d - 1, j))
        occupancy.add(cell)
      elif side == 2:  # +z row
        i = int(rand(0x35 + bump_index) * float(core_w))
        occupancy.add((min(core_w - 1, i), core_d))
      else:  # -z row
        i = int(rand(0x36 + bump_index) * float(core_w))
        occupancy.add((min(core_w - 1, i), -1))
      modified = True

    if not modified and len(occupancy) > 3:
      occupancy.discard((0, 0))

    occupancy = self._largest_connected_component(occupancy)

    if not occupancy:
      return occupancy
    min_i = min(i for i, _j in occupancy)
    min_j = min(j for _i, j in occupancy)
    return {(i - min_i, j - min_j) for (i, j) in occupancy}

  @staticmethod
  def _largest_connected_component(occupancy: set[tuple[int, int]]) -> set[tuple[int, int]]:
    remaining = set(occupancy)
    best: set[tuple[int, int]] = set()
    while remaining:
      seed = next(iter(remaining))
      component: set[tuple[int, int]] = set()
      stack = [seed]
      while stack:
        cell = stack.pop()
        if cell in component or cell not in remaining:
          continue
        component.add(cell)
        i, j = cell
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
          neighbour = (i + di, j + dj)
          if neighbour in remaining and neighbour not in component:
            stack.append(neighbour)
      remaining -= component
      if len(component) > len(best):
        best = component
    return best

  @staticmethod
  def _floor_div(a: int, b: int) -> int:
    return a // b

  @staticmethod
  def _hash_u32(n: int) -> int:
    return _hash_u32(n)

  def _hash2(self, x: int, z: int, seed: int) -> float:
    n = (x * 374761393) ^ (z * 668265263) ^ (seed * 1442695041)
    return float(_hash_u32(n)) / 4294967295.0

  def _hash3(self, x: int, z: int, y: int, seed: int) -> float:
    n = (x * 374761393) ^ (z * 668265263) ^ (y * 2246822519) ^ (seed * 3266489917)
    return float(_hash_u32(n)) / 4294967295.0
