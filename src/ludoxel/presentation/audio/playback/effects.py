# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time
from collections.abc import Callable

from PyQt6.QtMultimedia import QSoundEffect

from ludoxel.presentation.audio.playback.sources import EffectVoiceSlot, PreparedSource
from ludoxel.presentation.audio.types.events import AudioSamplePool


def effect_clock_s() -> float:
  return float(time.perf_counter())


def admit_pool_play(*, pool_key: str, pool: AudioSamplePool, throttle_until_s: dict[str, float]) -> bool:
  if float(pool.cooldown_s) <= 1e-9:
    return True

  now = effect_clock_s()
  until_s = float(throttle_until_s.get(str(pool_key), 0.0))
  if now < until_s:
    return False

  throttle_until_s[str(pool_key)] = now + float(pool.cooldown_s)
  return True


def ensure_effect_slots(*, parent, prepared: PreparedSource, desired_slots: int, configure_effect: Callable[[QSoundEffect], None] | None = None) -> None:
  while len(prepared.slots) < int(desired_slots):
    effect = QSoundEffect(parent)
    effect.setLoopCount(1)
    effect.setSource(prepared.url)
    effect.setVolume(0.0)
    if configure_effect is not None:
      configure_effect(effect)
    prepared.slots.append(EffectVoiceSlot(effect=effect, source_key=str(prepared.source_key)))


def slot_is_idle(slot: EffectVoiceSlot, *, now_s: float | None = None) -> bool:
  now = effect_clock_s() if now_s is None else float(now_s)
  return bool(slot.effect.isLoaded()) and (not bool(slot.effect.isPlaying())) and now >= float(slot.busy_until_s)


def has_idle_voice(prepared: PreparedSource, *, now_s: float | None = None) -> bool:
  now = effect_clock_s() if now_s is None else float(now_s)
  return any(slot_is_idle(slot, now_s=now) for slot in prepared.slots)


def next_effect_slot(
  *, parent, prepared: PreparedSource, desired_slots: int, configure_effect: Callable[[QSoundEffect], None] | None = None, now_s: float | None = None
) -> EffectVoiceSlot | None:
  ensure_effect_slots(parent=parent, prepared=prepared, desired_slots=int(desired_slots), configure_effect=configure_effect)
  if not prepared.slots:
    return None

  now = effect_clock_s() if now_s is None else float(now_s)
  total_slots = len(prepared.slots)
  start_index = int(prepared.cursor % total_slots)

  for offset in range(total_slots):
    idx = int((start_index + offset) % total_slots)
    slot = prepared.slots[idx]
    if slot_is_idle(slot, now_s=now):
      prepared.cursor = int((idx + 1) % total_slots)
      return slot

  return None


def mark_slot_started(slot: EffectVoiceSlot, *, prepared: PreparedSource, now_s: float | None = None) -> None:
  now = effect_clock_s() if now_s is None else float(now_s)
  slot.started_at_s = float(now)
  slot.busy_until_s = float(now + max(0.0, float(prepared.voice_hold_s)))
