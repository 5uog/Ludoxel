# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

GENERATION_MODE_NORMAL: str = "normal"
GENERATION_MODE_FLAT: str = "flat"
GENERATION_MODE_STATIC: str = "static"
GENERATION_MODES: tuple[str, ...] = (GENERATION_MODE_NORMAL, GENERATION_MODE_FLAT, GENERATION_MODE_STATIC)

GENERATION_VERSION_CURRENT: int = 1

# Seeds are persisted as JSON integers and cross the native boundary as i64.
SEED_MIN: int = -(2**63)
SEED_MAX: int = 2**63 - 1
DEFAULT_SEED: int = 1

DEFAULT_FLAT_GROUND_Y: int = 0


def normalize_generation_mode(value: object, *, default: str = GENERATION_MODE_NORMAL) -> str:
  raw = str(value).strip().lower()
  if raw in GENERATION_MODES:
    return raw
  fallback = str(default).strip().lower()
  return fallback if fallback in GENERATION_MODES else GENERATION_MODE_NORMAL


def coerce_seed(value: object, *, default: int = DEFAULT_SEED) -> int:
  try:
    seed = int(value)  # type: ignore[arg-type]
  except (TypeError, ValueError):
    return int(default)
  if seed < SEED_MIN or seed > SEED_MAX:
    return int(default)
  return int(seed)


def seed_text_error(text: object) -> str | None:
  raw = str(text).strip()
  if not raw:
    return None
  try:
    seed = int(raw, 10)
  except ValueError:
    return "Seed must be an integer."
  if seed < SEED_MIN or seed > SEED_MAX:
    return "Seed is out of the supported 64-bit range."
  return None


def seed_from_text(text: object, *, default: int = DEFAULT_SEED) -> int:
  raw = str(text).strip()
  if not raw:
    return int(default)
  try:
    seed = int(raw, 10)
  except ValueError:
    return int(default)
  if seed < SEED_MIN or seed > SEED_MAX:
    return int(default)
  return int(seed)


@dataclass(frozen=True)
class WorldGenerationSpec:
  mode: str = GENERATION_MODE_NORMAL
  version: int = GENERATION_VERSION_CURRENT
  seed: int = DEFAULT_SEED
  flat_ground_y: int = DEFAULT_FLAT_GROUND_Y

  def normalized(self) -> "WorldGenerationSpec":
    return WorldGenerationSpec(mode=normalize_generation_mode(self.mode), version=int(max(1, int(self.version))), seed=coerce_seed(self.seed, default=DEFAULT_SEED), flat_ground_y=int(self.flat_ground_y))

  def is_static(self) -> bool:
    return normalize_generation_mode(self.mode) == GENERATION_MODE_STATIC

  def is_flat(self) -> bool:
    return normalize_generation_mode(self.mode) == GENERATION_MODE_FLAT

  def is_normal(self) -> bool:
    return normalize_generation_mode(self.mode) == GENERATION_MODE_NORMAL

  def to_dict(self) -> dict[str, Any]:
    normalized = self.normalized()
    return {"mode": str(normalized.mode), "version": int(normalized.version), "seed": int(normalized.seed), "flat_ground_y": int(normalized.flat_ground_y)}

  @staticmethod
  def from_dict(data: dict[str, Any]) -> "WorldGenerationSpec":
    raw = data if isinstance(data, dict) else {}
    return WorldGenerationSpec(
      mode=normalize_generation_mode(raw.get("mode", GENERATION_MODE_NORMAL)),
      version=int(max(1, coerce_seed(raw.get("version", GENERATION_VERSION_CURRENT), default=GENERATION_VERSION_CURRENT))),
      seed=coerce_seed(raw.get("seed", DEFAULT_SEED), default=DEFAULT_SEED),
      flat_ground_y=int(coerce_seed(raw.get("flat_ground_y", DEFAULT_FLAT_GROUND_Y), default=DEFAULT_FLAT_GROUND_Y)),
    ).normalized()

  @staticmethod
  def static_spec() -> "WorldGenerationSpec":
    return WorldGenerationSpec(mode=GENERATION_MODE_STATIC, version=GENERATION_VERSION_CURRENT, seed=DEFAULT_SEED, flat_ground_y=DEFAULT_FLAT_GROUND_Y)
