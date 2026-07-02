# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

from ludoxel.simulation.worlds.generation.spec import GENERATION_MODE_FLAT, GENERATION_MODE_NORMAL, GENERATION_MODE_STATIC

_U64_MASK = 0xFFFFFFFFFFFFFFFF

BEDROCK_Y: int = -65
_MIN_CARVED_SURFACE_Y: int = BEDROCK_Y + 4

_BASE_HEIGHT: float = 6.0
_HEIGHT_OCTAVES: tuple[tuple[float, float], ...] = ((16.0, 192.0), (8.0, 96.0), (3.0, 36.0), (1.0, 16.0))

_SALT_HEIGHT_BASE: int = 1
_SALT_RAVINE: int = 101
_SALT_RAVINE_MASK: int = 102
_SALT_RAVINE_DEPTH: int = 103
_SALT_DEEPSLATE: int = 120
_SALT_DIRT_DEPTH: int = 130
_SALT_DIRT_MIX: int = 131
_SALT_DIRT_PATCH: int = 132
_SALT_STONE_A: int = 140
_SALT_STONE_B: int = 141
_SALT_ORE_GATE: int = 150
_SALT_EMERALD: int = 151
_SALT_ORE_COAL: int = 160
_SALT_ORE_COPPER: int = 161
_SALT_ORE_IRON: int = 162
_SALT_ORE_GOLD: int = 163
_SALT_ORE_REDSTONE: int = 164
_SALT_ORE_LAPIS: int = 165
_SALT_ORE_DIAMOND: int = 166

_RAVINE_EDGE: float = 0.075
_RAVINE_MASK_MIN: float = 0.05
_RAVINE_SCALE: float = 110.0
_RAVINE_MASK_SCALE: float = 260.0
_RAVINE_DEPTH_SCALE: float = 90.0

_MATERIAL_AIR = 0
_MATERIAL_BEDROCK = 1
_MATERIAL_GRASS = 2
_MATERIAL_DIRT = 3
_MATERIAL_COARSE_DIRT = 4
_MATERIAL_GRAVEL = 5
_MATERIAL_STONE = 6
_MATERIAL_ANDESITE = 7
_MATERIAL_GRANITE = 8
_MATERIAL_DIORITE = 9
_MATERIAL_TUFF = 10
_MATERIAL_DEEPSLATE = 11
_MATERIAL_COAL_ORE = 12
_MATERIAL_COPPER_ORE = 13
_MATERIAL_IRON_ORE = 14
_MATERIAL_GOLD_ORE = 15
_MATERIAL_REDSTONE_ORE = 16
_MATERIAL_LAPIS_ORE = 17
_MATERIAL_DIAMOND_ORE = 18
_MATERIAL_EMERALD_ORE = 19
_DEEPSLATE_ORE_OFFSET = 8

MODE_STATIC_CODE: int = 0
MODE_NORMAL_CODE: int = 1
MODE_FLAT_CODE: int = 2


def mode_code(mode: str) -> int:
  raw = str(mode)
  if raw == GENERATION_MODE_NORMAL:
    return MODE_NORMAL_CODE
  if raw == GENERATION_MODE_FLAT:
    return MODE_FLAT_CODE
  if raw == GENERATION_MODE_STATIC:
    return MODE_STATIC_CODE
  return MODE_STATIC_CODE


def _mix64(value: int) -> int:
  z = (value + 0x9E3779B97F4A7C15) & _U64_MASK
  z = ((z ^ (z >> 30)) * 0xBF58476D1CE4E5B9) & _U64_MASK
  z = ((z ^ (z >> 27)) * 0x94D049BB133111EB) & _U64_MASK
  return (z ^ (z >> 31)) & _U64_MASK


def hash_u64(seed: int, salt: int, a: int, b: int, c: int = 0) -> int:
  v = int(seed) & _U64_MASK
  v ^= (int(salt) * 0x9E3779B97F4A7C15) & _U64_MASK
  v = _mix64(v ^ ((int(a) & _U64_MASK) * 0xBF58476D1CE4E5B9 & _U64_MASK))
  v = _mix64(v ^ ((int(b) & _U64_MASK) * 0x94D049BB133111EB & _U64_MASK))
  v = _mix64(v ^ ((int(c) & _U64_MASK) * 0xD6E8FEB86659FD93 & _U64_MASK))
  return v


def _lattice_value(seed: int, salt: int, a: int, b: int, c: int = 0) -> float:
  h = hash_u64(seed, salt, a, b, c)
  return float(h >> 11) * (2.0 / 9007199254740992.0) - 1.0


def _smoothstep(t: float) -> float:
  return t * t * (3.0 - 2.0 * t)


def value_noise_2d(seed: int, salt: int, x: float, z: float, scale: float) -> float:
  fx = float(x) / float(scale)
  fz = float(z) / float(scale)
  x0 = math.floor(fx)
  z0 = math.floor(fz)
  tx = fx - float(x0)
  tz = fz - float(z0)
  sx = _smoothstep(tx)
  sz = _smoothstep(tz)
  xi = int(x0)
  zi = int(z0)
  n00 = _lattice_value(seed, salt, xi, zi)
  n10 = _lattice_value(seed, salt, xi + 1, zi)
  n01 = _lattice_value(seed, salt, xi, zi + 1)
  n11 = _lattice_value(seed, salt, xi + 1, zi + 1)
  nx0 = n00 + (n10 - n00) * sx
  nx1 = n01 + (n11 - n01) * sx
  return nx0 + (nx1 - nx0) * sz


def value_noise_3d(seed: int, salt: int, x: float, y: float, z: float, scale: float) -> float:
  fx = float(x) / float(scale)
  fy = float(y) / float(scale)
  fz = float(z) / float(scale)
  x0 = math.floor(fx)
  y0 = math.floor(fy)
  z0 = math.floor(fz)
  tx = fx - float(x0)
  ty = fy - float(y0)
  tz = fz - float(z0)
  sx = _smoothstep(tx)
  sy = _smoothstep(ty)
  sz = _smoothstep(tz)
  xi = int(x0)
  yi = int(y0)
  zi = int(z0)
  n000 = _lattice_value(seed, salt, xi, zi, yi)
  n100 = _lattice_value(seed, salt, xi + 1, zi, yi)
  n010 = _lattice_value(seed, salt, xi, zi + 1, yi)
  n110 = _lattice_value(seed, salt, xi + 1, zi + 1, yi)
  n001 = _lattice_value(seed, salt, xi, zi, yi + 1)
  n101 = _lattice_value(seed, salt, xi + 1, zi, yi + 1)
  n011 = _lattice_value(seed, salt, xi, zi + 1, yi + 1)
  n111 = _lattice_value(seed, salt, xi + 1, zi + 1, yi + 1)
  nx00 = n000 + (n100 - n000) * sx
  nx10 = n010 + (n110 - n010) * sx
  nx01 = n001 + (n101 - n001) * sx
  nx11 = n011 + (n111 - n011) * sx
  nxy0 = nx00 + (nx10 - nx00) * sz
  nxy1 = nx01 + (nx11 - nx01) * sz
  return nxy0 + (nxy1 - nxy0) * sy


def raw_surface_height(seed: int, x: int, z: int) -> float:
  total = _BASE_HEIGHT
  salt = _SALT_HEIGHT_BASE
  for amplitude, wavelength in _HEIGHT_OCTAVES:
    total += amplitude * value_noise_2d(seed, salt, float(x), float(z), wavelength)
    salt += 1
  return total


def ravine_depth(seed: int, x: int, z: int) -> float:
  mask = value_noise_2d(seed, _SALT_RAVINE_MASK, float(x), float(z), _RAVINE_MASK_SCALE)
  if mask <= _RAVINE_MASK_MIN:
    return 0.0
  ridge = value_noise_2d(seed, _SALT_RAVINE, float(x), float(z), _RAVINE_SCALE)
  distance = abs(ridge)
  if distance >= _RAVINE_EDGE:
    return 0.0
  t = 1.0 - distance / _RAVINE_EDGE
  s = _smoothstep(t)
  depth_amp = 14.0 + 7.0 * value_noise_2d(seed, _SALT_RAVINE_DEPTH, float(x), float(z), _RAVINE_DEPTH_SCALE)
  if depth_amp < 4.0:
    depth_amp = 4.0
  return s * depth_amp


def surface_height(seed: int, version: int, mode: int, flat_ground_y: int, x: int, z: int) -> int:
  _ = int(version)
  m = int(mode)
  if m == MODE_FLAT_CODE:
    return int(flat_ground_y)
  if m != MODE_NORMAL_CODE:
    return int(BEDROCK_Y) - 1
  raw = raw_surface_height(seed, int(x), int(z))
  carved = raw - ravine_depth(seed, int(x), int(z))
  h = int(math.floor(carved))
  if h < _MIN_CARVED_SURFACE_Y:
    h = _MIN_CARVED_SURFACE_Y
  return h


def _stone_material(seed: int, x: int, y: int, z: int, deepslate: bool) -> int:
  if deepslate:
    return _MATERIAL_DEEPSLATE
  v1 = value_noise_3d(seed, _SALT_STONE_A, float(x), float(y), float(z), 34.0)
  if v1 > 0.52:
    return _MATERIAL_ANDESITE
  if v1 < -0.52:
    return _MATERIAL_GRANITE
  v2 = value_noise_3d(seed, _SALT_STONE_B, float(x), float(y), float(z), 23.0)
  if v2 > 0.55:
    return _MATERIAL_DIORITE
  if v2 < -0.55:
    return _MATERIAL_TUFF
  return _MATERIAL_STONE


def _ore_material(seed: int, x: int, y: int, z: int, deepslate: bool) -> int:
  gate = hash_u64(seed, _SALT_ORE_GATE, x, z, y) % 1000
  ore = 0
  if gate < 350:
    if y <= -40 and value_noise_3d(seed, _SALT_ORE_DIAMOND, float(x), float(y), float(z), 10.0) > 0.78:
      ore = _MATERIAL_DIAMOND_ORE
    elif -64 <= y <= -8 and value_noise_3d(seed, _SALT_ORE_GOLD, float(x), float(y), float(z), 12.0) > 0.72:
      ore = _MATERIAL_GOLD_ORE
    elif -64 <= y <= -16 and value_noise_3d(seed, _SALT_ORE_REDSTONE, float(x), float(y), float(z), 12.0) > 0.72:
      ore = _MATERIAL_REDSTONE_ORE
    elif -64 <= y <= -16 and value_noise_3d(seed, _SALT_ORE_LAPIS, float(x), float(y), float(z), 12.0) > 0.74:
      ore = _MATERIAL_LAPIS_ORE
    elif y <= 20 and value_noise_3d(seed, _SALT_ORE_IRON, float(x), float(y), float(z), 14.0) > 0.66:
      ore = _MATERIAL_IRON_ORE
    elif y >= -16 and value_noise_3d(seed, _SALT_ORE_COPPER, float(x), float(y), float(z), 14.0) > 0.66:
      ore = _MATERIAL_COPPER_ORE
    elif value_noise_3d(seed, _SALT_ORE_COAL, float(x), float(y), float(z), 16.0) > 0.62:
      ore = _MATERIAL_COAL_ORE
  if ore == 0 and y >= 0 and hash_u64(seed, _SALT_EMERALD, x, z, y) % 4000 == 0:
    ore = _MATERIAL_EMERALD_ORE
  if ore == 0:
    return 0
  if deepslate:
    return ore + _DEEPSLATE_ORE_OFFSET
  return ore


def material_code(seed: int, version: int, mode: int, flat_ground_y: int, x: int, y: int, z: int, column_height: int | None = None) -> int:
  _ = int(version)
  m = int(mode)
  if m == MODE_STATIC_CODE:
    return _MATERIAL_AIR
  if m == MODE_FLAT_CODE:
    return _MATERIAL_GRASS if int(y) == int(flat_ground_y) else _MATERIAL_AIR
  if int(y) < BEDROCK_Y:
    return _MATERIAL_AIR
  if int(y) == BEDROCK_Y:
    return _MATERIAL_BEDROCK
  h = int(column_height) if column_height is not None else surface_height(seed, version, m, flat_ground_y, int(x), int(z))
  if int(y) > int(h):
    return _MATERIAL_AIR
  in_ravine = ravine_depth(seed, int(x), int(z)) > 0.5
  deepslate_boundary = -28.0 + 5.0 * value_noise_2d(seed, _SALT_DEEPSLATE, float(x), float(z), 60.0)
  deepslate = float(y) < deepslate_boundary
  depth = int(h) - int(y)
  if depth == 0:
    if in_ravine:
      return _MATERIAL_DEEPSLATE if deepslate else _MATERIAL_STONE
    return _MATERIAL_GRASS
  if not in_ravine:
    dirt_depth = 2 + int(hash_u64(seed, _SALT_DIRT_DEPTH, x, z, 0) % 2)
    if depth <= dirt_depth:
      patch = value_noise_2d(seed, _SALT_DIRT_PATCH, float(x), float(z), 24.0)
      roll = int(hash_u64(seed, _SALT_DIRT_MIX, x, z, y) % 100)
      if patch > 0.45:
        return _MATERIAL_GRAVEL if roll < 60 else _MATERIAL_DIRT
      if patch < -0.45:
        return _MATERIAL_COARSE_DIRT if roll < 60 else _MATERIAL_DIRT
      if roll < 70:
        return _MATERIAL_DIRT
      if roll < 85:
        return _MATERIAL_COARSE_DIRT
      return _MATERIAL_GRAVEL
  if depth >= 4:
    ore = _ore_material(seed, int(x), int(y), int(z), deepslate)
    if ore != 0:
      return ore
  return _stone_material(seed, int(x), int(y), int(z), deepslate)
