# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import random
import wave
from dataclasses import dataclass, field
from pathlib import Path

from PyQt6.QtCore import QUrl
from PyQt6.QtMultimedia import QSoundEffect

from ludoxel.presentation.audio.types.events import SELECTION_ROUND_ROBIN, AudioSamplePool

DEFAULT_EFFECT_VOICE_HOLD_S = 0.18
EFFECT_VOICE_HOLD_PAD_S = 0.035


@dataclass
class EffectVoiceSlot:
  effect: QSoundEffect
  source_key: str
  started_at_s: float = 0.0
  busy_until_s: float = 0.0
  requested_volume: float = 0.0


@dataclass
class PreparedSource:
  url: QUrl
  source_key: str
  desired_slots: int = 1
  voice_hold_s: float = DEFAULT_EFFECT_VOICE_HOLD_S
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


def wav_duration_s_for_url(url: QUrl) -> float | None:
  local_path = str(url.toLocalFile()).strip()
  if not local_path:
    return None

  try:
    with wave.open(local_path, "rb") as reader:
      frame_rate = int(reader.getframerate())
      frame_count = int(reader.getnframes())
  except (EOFError, OSError, wave.Error):
    return None

  if frame_rate <= 0 or frame_count <= 0:
    return None

  return float(frame_count) / float(frame_rate)


def effect_voice_hold_s_for_url(url: QUrl) -> float:
  duration_s = wav_duration_s_for_url(url)
  if duration_s is None:
    return float(DEFAULT_EFFECT_VOICE_HOLD_S)

  return max(float(DEFAULT_EFFECT_VOICE_HOLD_S), float(duration_s) + float(EFFECT_VOICE_HOLD_PAD_S))


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
