# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from pathlib import Path

from PyQt6.QtCore import QUrl
from PyQt6.QtMultimedia import QSoundEffect

from ludoxel.presentation.audio.types.events import SELECTION_ROUND_ROBIN, AudioSamplePool


@dataclass
class EffectVoiceSlot:
  effect: QSoundEffect
  source_key: str


@dataclass
class PreparedSource:
  url: QUrl
  source_key: str
  desired_slots: int = 1
  slots: list[EffectVoiceSlot] = field(default_factory=list)
  cursor: int = 0


def source_key_for_url(url: QUrl) -> str:
  return str(url.toString())


def resolve_existing_urls(*, resource_root: Path, pool: AudioSamplePool) -> tuple[QUrl, ...]:
  urls: list[QUrl] = []
  for relative_path in tuple(pool.relative_paths):
    candidate = Path(resource_root) / Path(relative_path)
    if candidate.is_file():
      urls.append(QUrl.fromLocalFile(str(candidate)))
  return tuple(urls)


def slot_budget_per_source(pool: AudioSamplePool, *, source_count: int) -> int:
  total_sources = max(1, int(source_count))
  total_polyphony = max(1, int(pool.max_polyphony))
  return max(1, int(math.ceil(float(total_polyphony) / float(total_sources))))


def pick_prepared_source(*, pool_key: str, pool: AudioSamplePool, prepared_sources: list[PreparedSource], round_robin_index: dict[str, int], random_source: random.Random) -> PreparedSource | None:
  if not prepared_sources:
    return None

  if str(pool.selection_mode) == SELECTION_ROUND_ROBIN:
    cursor = int(round_robin_index.get(str(pool_key), -1)) + 1
    idx = int(cursor % len(prepared_sources))
    round_robin_index[str(pool_key)] = idx
    return prepared_sources[idx]

  return prepared_sources[int(random_source.randrange(len(prepared_sources)))]
