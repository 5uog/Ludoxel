# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.worlds.generation.spec import WorldGenerationSpec
from ludoxel.simulation.worlds.generation.terrain_math import BEDROCK_Y, mode_code, ravine_depth, surface_height

_STATIC_SPAWN: tuple[float, float, float] = (0.0, 1.0, -10.0)
_FLAT_SPAWN_X: float = 0.0
_FLAT_SPAWN_Z: float = -10.0
_SPAWN_SEARCH_RADIUS: int = 48
_SPAWN_MIN_SURFACE_Y: int = BEDROCK_Y + 8


def _column_is_safe(seed: int, version: int, mode: int, flat_y: int, x: int, z: int) -> bool:
  if ravine_depth(int(seed), int(x), int(z)) > 0.0:
    return False
  h = surface_height(int(seed), int(version), int(mode), int(flat_y), int(x), int(z))
  if int(h) < int(_SPAWN_MIN_SURFACE_Y):
    return False
  for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    nh = surface_height(int(seed), int(version), int(mode), int(flat_y), int(x) + int(dx), int(z) + int(dz))
    if abs(int(nh) - int(h)) > 1:
      return False
    if ravine_depth(int(seed), int(x) + int(dx), int(z) + int(dz)) > 0.0:
      return False
  return True


def spawn_for_generation(spec: WorldGenerationSpec) -> tuple[float, float, float]:
  normalized = spec.normalized()
  if normalized.is_static():
    return _STATIC_SPAWN
  mode = mode_code(normalized.mode)
  if normalized.is_flat():
    return (float(_FLAT_SPAWN_X), float(int(normalized.flat_ground_y) + 1), float(_FLAT_SPAWN_Z))

  seed = int(normalized.seed)
  version = int(normalized.version)
  flat_y = int(normalized.flat_ground_y)
  for radius in range(0, int(_SPAWN_SEARCH_RADIUS) + 1):
    if radius == 0:
      candidates: tuple[tuple[int, int], ...] = ((0, 0),)
    else:
      ring: list[tuple[int, int]] = []
      for dx in range(-radius, radius + 1):
        for dz in range(-radius, radius + 1):
          if max(abs(int(dx)), abs(int(dz))) == int(radius):
            ring.append((int(dx), int(dz)))
      candidates = tuple(sorted(ring))
    for x, z in candidates:
      if _column_is_safe(seed, version, mode, flat_y, int(x), int(z)):
        h = surface_height(seed, version, mode, flat_y, int(x), int(z))
        return (float(int(x)) + 0.5, float(int(h) + 1), float(int(z)) + 0.5)

  h = surface_height(seed, version, mode, flat_y, 0, 0)
  return (0.5, float(int(h) + 1), 0.5)
