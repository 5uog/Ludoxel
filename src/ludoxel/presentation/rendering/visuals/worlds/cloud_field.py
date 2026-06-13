# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import dataclass

from ludoxel.application.preferences.cloud_flow import DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION, normalize_backend_cloud_flow_direction
from ludoxel.application.preferences.clouds import normalize_cloud_height_settings, normalize_cloud_speed_range
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.rendering.contracts.config import BackendCloudParams

_CLOUD_SPEED_LANE_COUNT = 5


@dataclass(frozen=True)
class CloudBox:
  center: Vec3
  size: Vec3
  alpha_mul: float
  speed_multiplier: float


@dataclass(frozen=True)
class _RectXZ:
  min_x: int
  max_x: int
  min_z: int
  max_z: int


class CloudField:
  def __init__(self, cfg: BackendCloudParams) -> None:
    self._cfg = cfg

    self._enabled_density: int = int(max(0, int(cfg.rects_per_cell)))
    self._seed: int = int(cfg.seed)
    self._speed_variation_enabled: bool = bool(cfg.speed_variation_enabled)
    self._speed_min_blocks_per_second, self._speed_max_blocks_per_second = normalize_cloud_speed_range(cfg.speed_min_blocks_per_second, cfg.speed_max_blocks_per_second)
    self._height_variation_enabled: bool = bool(cfg.height_variation_enabled)
    (self._fixed_y, self._spawn_y_min, self._spawn_y_max, self._preferred_y_min, self._preferred_y_max, self._preferred_y_probability_percent) = normalize_cloud_height_settings(
      cfg.y, cfg.spawn_y_min, cfg.spawn_y_max, cfg.preferred_y_min, cfg.preferred_y_max, cfg.preferred_y_probability_percent
    )

    self._flow_direction: str = normalize_backend_cloud_flow_direction(DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION)
    self._flow_epoch_s: float = 0.0
    self._flow_base_shift: Vec3 = Vec3(0.0, 0.0, 0.0)

    self._anchor_key: tuple[tuple[int, int], ...] | None = None
    self._boxes_cache: list[CloudBox] = []

  def _invalidate_cache(self) -> None:
    self._anchor_key = None
    self._boxes_cache = []

  def set_density(self, density: int) -> None:
    d = int(max(0, density))
    if d == int(self._enabled_density):
      return
    self._enabled_density = d
    self._invalidate_cache()

  def set_seed(self, seed: int) -> None:
    s = int(seed)
    if s == int(self._seed):
      return
    self._seed = s
    self._invalidate_cache()

  def set_speed_variation(self, enabled: bool, min_speed: float, max_speed: float) -> bool:
    """
    雲ごとの速度 lane を有効化し、絶対速度の最小値と最大値を block/second 単位で更新する。
    速度倍率は生成済み instance payload に含まれるため、設定値が変化した場合だけ cache を破棄する。
    """
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
    """
    雲の固定高度又は重み付き生成高度を更新し、seed 固定の box 配置 cache へ反映する。
    優先区間は全体生成範囲へ clamp 済みで保持するため、逆転値や範囲外値を生成処理へ渡さない。
    """
    fixed, spawn_min, spawn_max, preferred_min, preferred_max, probability = normalize_cloud_height_settings(
      fixed_y, spawn_y_min, spawn_y_max, preferred_y_min, preferred_y_max, preferred_y_probability_percent
    )
    signature = (bool(enabled), int(fixed), int(spawn_min), int(spawn_max), int(preferred_min), int(preferred_max), int(probability))
    current = (
      bool(self._height_variation_enabled),
      int(self._fixed_y),
      int(self._spawn_y_min),
      int(self._spawn_y_max),
      int(self._preferred_y_min),
      int(self._preferred_y_max),
      int(self._preferred_y_probability_percent),
    )
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

  def shift(self, t_seconds: float) -> Vec3:
    ts = float(max(0.0, t_seconds))
    dt = float(max(0.0, ts - float(self._flow_epoch_s)))

    vx, vz = self._flow_velocity(self._flow_direction)
    return Vec3(float(self._flow_base_shift.x) + vx * dt, 0.0, float(self._flow_base_shift.z) + vz * dt)

  def _speed_multipliers(self) -> tuple[float, ...]:
    """
    absolute cloud speed を既存 flow speed に対する有限個の倍率 lane へ変換する。
    variation 無効時は倍率 1 の単一 lane を返すため、従来の global shift と同じ移動量になる。
    """
    if not bool(self._speed_variation_enabled):
      return (1.0,)

    base_speed = float(self._flow_speed())
    if float(base_speed) <= 1e-9:
      return (1.0,)

    speed_min = float(self._speed_min_blocks_per_second)
    speed_max = float(self._speed_max_blocks_per_second)
    if math.isclose(float(speed_min), float(speed_max), rel_tol=0.0, abs_tol=1e-9):
      return (float(speed_min) / float(base_speed),)

    last_lane = int(_CLOUD_SPEED_LANE_COUNT - 1)
    return tuple((float(speed_min) + (float(speed_max) - float(speed_min)) * (float(lane_index) / float(last_lane))) / float(base_speed) for lane_index in range(int(_CLOUD_SPEED_LANE_COUNT)))

  def ensure_cache(self, eye: Vec3, shift: Vec3) -> None:
    if int(self._enabled_density) <= 0:
      self._invalidate_cache()
      return

    m = int(self._cfg.macro)
    speed_multipliers = self._speed_multipliers()
    anchors = tuple(
      (self._floor_div(int(math.floor(float(eye.x) - float(shift.x) * float(speed_multiplier))), m), self._floor_div(int(math.floor(float(eye.z) - float(shift.z) * float(speed_multiplier))), m))
      for speed_multiplier in speed_multipliers
    )

    if self._anchor_key == anchors:
      return

    self._anchor_key = anchors
    self._boxes_cache = self._build_cloud_boxes(anchors=anchors, speed_multipliers=speed_multipliers)

  def visible_boxes(self, eye: Vec3, shift: Vec3, forward: Vec3, fov_deg: float, aspect: float, z_far: float) -> list[CloudBox]:
    self.ensure_cache(eye=eye, shift=shift)

    if not self._boxes_cache:
      return []

    up_hint = Vec3(0.0, 1.0, 0.0)
    right = up_hint.cross(forward).normalized()
    up = forward.cross(right).normalized()

    tan_y = math.tan(math.radians(float(fov_deg)) * 0.5)
    tan_x = tan_y * max(float(aspect), 1e-6)

    out: list[CloudBox] = []
    for b in self._boxes_cache:
      c_world = Vec3(b.center.x + shift.x * float(b.speed_multiplier), b.center.y, b.center.z + shift.z * float(b.speed_multiplier))

      hx = b.size.x * 0.5
      hy = b.size.y * 0.5
      hz = b.size.z * 0.5
      r = math.sqrt(hx * hx + hy * hy + hz * hz)

      v = c_world - eye
      z = v.dot(forward)

      if z <= 0.0:
        continue
      if z - r > float(z_far):
        continue

      x = v.dot(right)
      y = v.dot(up)

      if abs(x) > (z * tan_x + r):
        continue
      if abs(y) > (z * tan_y + r):
        continue

      out.append(b)

    return out

  def _build_cloud_boxes(self, *, anchors: tuple[tuple[int, int], ...], speed_multipliers: tuple[float, ...]) -> list[CloudBox]:
    m = int(self._cfg.macro)
    r = int(self._cfg.view_radius)

    span = int(math.ceil(float(r) / float(m))) + 1

    size_y = float(max(1, int(self._cfg.thickness)))

    rects_per_cell = int(max(0, int(self._enabled_density)))
    if rects_per_cell <= 0:
      return []

    candidates_per_cell = int(max(rects_per_cell, int(self._cfg.candidates_per_cell)))

    boxes: list[CloudBox] = []
    for speed_lane, ((anchor_mx, anchor_mz), speed_multiplier) in enumerate(zip(anchors, speed_multipliers, strict=True)):
      for mx in range(anchor_mx - span, anchor_mx + span + 1):
        for mz in range(anchor_mz - span, anchor_mz + span + 1):
          accepted: list[_RectXZ] = []

          for i in range(candidates_per_cell):
            r_keep = self._hash3(mx, mz, i, int(self._seed) ^ 0x51ED270B)
            if r_keep < float(self._cfg.candidate_drop_threshold):
              continue

            cx, cz, sx, sz = self._rect_params(mx, mz, i, m)

            min_x = mx * m + (cx - sx)
            max_x = mx * m + (cx + sx + 1)
            min_z = mz * m + (cz - sz)
            max_z = mz * m + (cz + sz + 1)

            rect = _RectXZ(min_x=min_x, max_x=max_x, min_z=min_z, max_z=max_z)

            if self._overlaps_too_much(rect, accepted, thresh=float(self._cfg.overlap_thresh)):
              continue

            accepted.append(rect)
            if len(accepted) >= rects_per_cell:
              break

          for ridx, rect in enumerate(accepted):
            assigned_lane = self._speed_lane(mx, mz, ridx, lane_count=len(speed_multipliers))
            if int(assigned_lane) != int(speed_lane):
              continue

            size_x = float(rect.max_x - rect.min_x)
            size_z = float(rect.max_z - rect.min_z)
            bx = float(rect.min_x) + size_x * 0.5
            bz = float(rect.min_z) + size_z * 0.5

            y0 = float(self._cloud_y(mx, mz, ridx))
            cy = y0 + size_y * 0.5

            a = float(self._cfg.alpha_min) + float(self._cfg.alpha_range) * self._hash3(mx, mz, ridx, int(self._seed) ^ 0xB5297A4D)

            boxes.append(CloudBox(center=Vec3(bx, cy, bz), size=Vec3(size_x, size_y, size_z), alpha_mul=float(a), speed_multiplier=float(speed_multiplier)))

    return boxes

  def _speed_lane(self, mx: int, mz: int, rect_index: int, *, lane_count: int) -> int:
    count = max(1, int(lane_count))
    if count <= 1:
      return 0
    lane_random = self._hash3(mx, mz, rect_index, int(self._seed) ^ 0xA24BAEDB)
    return min(int(count - 1), int(float(lane_random) * float(count)))

  def _cloud_y(self, mx: int, mz: int, rect_index: int) -> int:
    if not bool(self._height_variation_enabled):
      return int(self._fixed_y)

    preferred_roll = self._hash3(mx, mz, rect_index, int(self._seed) ^ 0xC2B2AE35)
    preferred_probability = float(self._preferred_y_probability_percent) / 100.0
    if float(preferred_roll) < float(preferred_probability):
      y_min = int(self._preferred_y_min)
      y_max = int(self._preferred_y_max)
      sample = self._hash3(mx, mz, rect_index, int(self._seed) ^ 0x27D4EB2F)
    else:
      y_min = int(self._spawn_y_min)
      y_max = int(self._spawn_y_max)
      sample = self._hash3(mx, mz, rect_index, int(self._seed) ^ 0x165667B1)
    return int(y_min + min(int(y_max - y_min), int(float(sample) * float(y_max - y_min + 1))))

  def _rect_params(self, mx: int, mz: int, idx: int, m: int) -> tuple[int, int, int, int]:
    s = int(self._seed) ^ (idx * 0x9E3779B9)

    r1 = self._hash2(mx, mz, s ^ 0xD1B54A35)
    r2 = self._hash2(mx, mz, s ^ 0x94D049BB)
    r3 = self._hash2(mx, mz, s ^ 0xDEADBEEF)
    r4 = self._hash2(mx, mz, s ^ 0xBADC0FFE)

    margin = int(self._cfg.rect_margin)
    usable = max(1, m - 2 * margin)
    cx = margin + int(r1 * float(usable))
    cz = margin + int(r2 * float(usable))

    sx = int(self._cfg.rect_size_min) + int(r3 * float(self._cfg.rect_size_range))
    sz = int(self._cfg.rect_size_min) + int(r4 * float(self._cfg.rect_size_range))

    if m >= 6:
      sx = min(sx, m // 2 - 1)
      sz = min(sz, m // 2 - 1)

    return (cx, cz, sx, sz)

  @staticmethod
  def _overlaps_too_much(r: _RectXZ, prev: list[_RectXZ], thresh: float) -> bool:
    ax0, ax1, az0, az1 = r.min_x, r.max_x, r.min_z, r.max_z
    a_area = max(0, ax1 - ax0) * max(0, az1 - az0)
    if a_area <= 0:
      return True

    for p in prev:
      bx0, bx1, bz0, bz1 = p.min_x, p.max_x, p.min_z, p.max_z
      ix0 = max(ax0, bx0)
      ix1 = min(ax1, bx1)
      iz0 = max(az0, bz0)
      iz1 = min(az1, bz1)
      inter = max(0, ix1 - ix0) * max(0, iz1 - iz0)
      if inter <= 0:
        continue

      b_area = max(0, bx1 - bx0) * max(0, bz1 - bz0)
      denom = float(min(a_area, b_area)) if b_area > 0 else float(a_area)
      if denom > 0 and (float(inter) / denom) > thresh:
        return True

    return False

  @staticmethod
  def _floor_div(a: int, b: int) -> int:
    return a // b

  @staticmethod
  def _hash_u32(n: int) -> int:
    n &= 0xFFFFFFFF
    n ^= (n >> 16) & 0xFFFFFFFF
    n = (n * 0x7FEB352D) & 0xFFFFFFFF
    n ^= (n >> 15) & 0xFFFFFFFF
    n = (n * 0x846CA68B) & 0xFFFFFFFF
    n ^= (n >> 16) & 0xFFFFFFFF
    return n & 0xFFFFFFFF

  def _hash2(self, x: int, z: int, seed: int) -> float:
    n = (x * 374761393) ^ (z * 668265263) ^ (seed * 1442695041)
    u = self._hash_u32(n)
    return float(u) / 4294967295.0

  def _hash3(self, x: int, z: int, y: int, seed: int) -> float:
    n = (x * 374761393) ^ (z * 668265263) ^ (y * 2246822519) ^ (seed * 3266489917)
    u = self._hash_u32(n)
    return float(u) / 4294967295.0
