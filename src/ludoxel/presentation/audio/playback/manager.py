# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import random
from pathlib import Path

from PyQt6.QtCore import QObject, QUrl
from PyQt6.QtMultimedia import QSoundEffect

from ludoxel.application.preferences.audio import AUDIO_CATEGORY_AMBIENT, AudioPreferences
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.audio.catalogs.ambient import AMBIENT_SOUND_CATALOG
from ludoxel.presentation.audio.catalogs.material import (
  BLOCK_EVENT_BREAK,
  BLOCK_EVENT_INTERACT_CLOSE,
  BLOCK_EVENT_INTERACT_OPEN,
  BLOCK_EVENT_PLACE,
  BLOCK_SOUND_CATALOG,
  PLAYER_EVENT_STEP,
  PLAYER_SURFACE_SOUND_CATALOG,
)
from ludoxel.presentation.audio.catalogs.player import PLAYER_EVENT_LAND, PLAYER_EVENT_LAND_BIG, PLAYER_EVENT_LAND_SMALL, PLAYER_EVENT_SOUND_CATALOG
from ludoxel.presentation.audio.playback.ambient import ambient_desired_key
from ludoxel.presentation.audio.playback.effects import admit_pool_play, ensure_effect_slots, next_effect_slot
from ludoxel.presentation.audio.playback.listener import block_center, listener_within_cutoff, normalize_world_position, pose_almost_equal
from ludoxel.presentation.audio.playback.sources import PreparedSource, pick_prepared_source, resolve_existing_urls, slot_budget_per_source, source_key_for_url
from ludoxel.presentation.audio.types.events import SELECTION_ROUND_ROBIN, AudioSamplePool
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.sounds.groups import DEFAULT_BLOCK_SOUND_GROUP, iter_sound_group_candidates
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.blocks.states.values import prop_as_bool


class AudioManager(QObject):
  def __init__(self, *, resource_root: Path, block_registry: BlockRegistry, parent: QObject | None = None) -> None:
    super().__init__(parent)
    self._resource_root = Path(resource_root)
    self._block_registry = block_registry
    self._preferences = AudioPreferences()

    self._ambient_effect: QSoundEffect | None = None
    self._ambient_key: str | None = None
    self._ambient_source_key: str = ""
    self._ambient_enabled: bool = False
    self._ambient_space_id: str = ""
    self._ambient_pending_play: bool = False
    self._ambient_transitioning: bool = False

    self._pool_specs: dict[str, AudioSamplePool] = self._collect_named_pools()
    self._resolved_urls: dict[str, tuple[QUrl, ...]] = {}
    self._prepared_sources: dict[str, list[PreparedSource]] = {}
    self._round_robin_index: dict[str, int] = {}
    self._random = random.Random(91357)

    self._listener_pose: tuple[float, float, float, float, float, float] | None = None
    self._sound_group_cache: dict[str, str] = {}
    self._pool_throttle_until_s: dict[str, float] = {}
    self._effects_primed: bool = False

    self._listener_linear_epsilon = 0.05
    self._listener_angular_epsilon_deg = 1.0

    self._small_landing_threshold_blocks = 6.0
    self._big_landing_threshold_blocks = 12.0

    self._build_source_cache()
    self.prime_effects()

  def shutdown(self) -> None:
    if self._ambient_effect is not None:
      self._ambient_transitioning = True
      self._ambient_effect.stop()
      self._ambient_effect.deleteLater()
      self._ambient_effect = None
      self._ambient_transitioning = False
      self._ambient_pending_play = False

    for prepared_group in tuple(self._prepared_sources.values()):
      for prepared in tuple(prepared_group):
        for slot in tuple(prepared.slots):
          slot.effect.stop()
          slot.effect.deleteLater()

    self._prepared_sources.clear()
    self._ambient_key = None
    self._ambient_source_key = ""
    self._listener_pose = None
    self._pool_throttle_until_s.clear()
    self._effects_primed = False

  def set_preferences(self, preferences: AudioPreferences) -> None:
    self._preferences = preferences.normalized()

    if self._ambient_effect is not None:
      self._ambient_effect.setVolume(float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT)))

    for pool_key, prepared_group in self._prepared_sources.items():
      pool = self._pool_specs.get(str(pool_key))
      if pool is None:
        continue

      base_volume = float(self._preferences.volume_for(pool.category))
      for prepared in tuple(prepared_group):
        for slot in tuple(prepared.slots):
          slot.effect.setVolume(base_volume)

    self._sync_ambient_sound()

  def prime_effects(self) -> None:
    if self._effects_primed:
      return

    for pool_key, pool in self._pool_specs.items():
      if str(pool.category) == AUDIO_CATEGORY_AMBIENT:
        continue

      prepared_sources = self._ensure_prepared_sources(str(pool_key), pool)
      if not prepared_sources:
        continue

      base_volume = float(self._preferences.volume_for(pool.category))
      for prepared in tuple(prepared_sources):
        self._ensure_effect_slots(prepared, desired_slots=int(prepared.desired_slots), base_volume=float(base_volume))

    self._effects_primed = True

  def cache_listener_pose(self, *, eye: Vec3, yaw_deg: float, pitch_deg: float, roll_deg: float = 0.0) -> None:
    new_pose = (float(eye.x), float(eye.y), float(eye.z), float(yaw_deg), float(pitch_deg), float(roll_deg))
    if self._listener_pose is not None and self._pose_almost_equal(self._listener_pose, new_pose):
      return
    self._listener_pose = new_pose

  def update_listener(self, *, eye: Vec3, yaw_deg: float, pitch_deg: float, roll_deg: float = 0.0) -> None:
    self.cache_listener_pose(eye=eye, yaw_deg=float(yaw_deg), pitch_deg=float(pitch_deg), roll_deg=float(roll_deg))

  def set_ambient_active(self, *, current_space_id: str, enabled: bool) -> None:
    self._ambient_space_id = str(current_space_id)
    self._ambient_enabled = bool(enabled)
    self._sync_ambient_sound()

  def play_interaction(self, *, action: str | None, block_state: str | None, position: tuple[int, int, int] | None) -> None:
    if action is None or block_state is None or position is None:
      return

    sound_group = self.sound_group_for_block_state(str(block_state))

    if action == "interact":
      _base_id, props = parse_state(str(block_state))
      is_open = prop_as_bool(props, "open", False)
      action = BLOCK_EVENT_INTERACT_OPEN if bool(is_open) else BLOCK_EVENT_INTERACT_CLOSE

    if action in {BLOCK_EVENT_INTERACT_OPEN, BLOCK_EVENT_INTERACT_CLOSE}:
      self.play_block_action(action=str(action), sound_group=sound_group, position=tuple(position))
      return

    if action in {BLOCK_EVENT_PLACE, BLOCK_EVENT_BREAK}:
      self.play_block_action(action=str(action), sound_group=sound_group, position=tuple(position))

  def play_block_action(self, *, action: str, sound_group: str, position: tuple[int, int, int]) -> None:
    world_position = self._block_center(tuple(position))

    for candidate_group in iter_sound_group_candidates(str(sound_group)):
      group_catalog = BLOCK_SOUND_CATALOG.get(str(candidate_group))
      pool = None if group_catalog is None else group_catalog.get(str(action))
      if pool is None:
        continue
      if self._play_pool(pool_key=f"block:{candidate_group}:{action}", pool=pool, position=world_position):
        return

  def play_surface_event(self, *, event_name: str, support_block_state: str | None, position: tuple[int, int, int] | None, fall_distance_blocks: float | None = None) -> None:
    if support_block_state is None or position is None:
      return

    sound_group = self.sound_group_for_block_state(str(support_block_state))
    world_position = self._block_center(tuple(position))

    if str(event_name) == PLAYER_EVENT_LAND:
      self._play_landing_event(sound_group=sound_group, position=world_position, fall_distance_blocks=fall_distance_blocks)
      return

    if str(event_name) != PLAYER_EVENT_STEP:
      return

    self._play_surface_step(sound_group=sound_group, position=world_position)

  def play_othello_event(self, *, event_name: str, position: tuple[float, float, float]) -> None:
    self.play_player_event(event_name=str(event_name), position=tuple(position))

  def play_player_event(self, *, event_name: str, position: tuple[float, float, float] | Vec3 | None = None) -> None:
    pool = PLAYER_EVENT_SOUND_CATALOG.get(str(event_name))
    if pool is None:
      return
    self._play_pool(pool_key=f"player_event:{event_name}", pool=pool, position=self._normalize_world_position(position))

  def sound_group_for_block_state(self, block_state_or_id: str) -> str:
    base_id, _props = parse_state(str(block_state_or_id))
    cache_key = str(base_id).strip()
    cached = self._sound_group_cache.get(cache_key)
    if cached is not None:
      return cached

    definition = self._block_registry.get(str(base_id))
    sound_group = DEFAULT_BLOCK_SOUND_GROUP if definition is None else str(definition.sound_group_name()).strip()
    normalized = sound_group if sound_group else DEFAULT_BLOCK_SOUND_GROUP
    self._sound_group_cache[cache_key] = normalized
    return normalized

  def _collect_named_pools(self) -> dict[str, AudioSamplePool]:
    entries: dict[str, AudioSamplePool] = {}

    for sound_group, group_catalog in BLOCK_SOUND_CATALOG.items():
      for event_name, pool in group_catalog.items():
        entries[f"block:{sound_group}:{event_name}"] = pool

    for sound_group, group_catalog in PLAYER_SURFACE_SOUND_CATALOG.items():
      for event_name, pool in group_catalog.items():
        entries[f"player:{sound_group}:{event_name}"] = pool

    for event_name, pool in PLAYER_EVENT_SOUND_CATALOG.items():
      entries[f"player_event:{event_name}"] = pool

    for ambient_key, pool in AMBIENT_SOUND_CATALOG.items():
      entries[f"ambient:{ambient_key}"] = pool

    return entries

  def _landing_event_name(self, fall_distance_blocks: float | None) -> str | None:
    distance = 0.0 if fall_distance_blocks is None else max(0.0, float(fall_distance_blocks))

    if distance >= float(self._big_landing_threshold_blocks):
      return PLAYER_EVENT_LAND_BIG

    if distance >= float(self._small_landing_threshold_blocks):
      return PLAYER_EVENT_LAND_SMALL

    return None

  def _play_landing_event(self, *, sound_group: str, position: Vec3, fall_distance_blocks: float | None) -> None:
    event_name = self._landing_event_name(fall_distance_blocks)

    if event_name is None:
      self._play_surface_step(sound_group=str(sound_group), position=position)
      return

    pool = PLAYER_EVENT_SOUND_CATALOG.get(str(event_name))
    if pool is None:
      return

    self._play_pool(pool_key=f"player_event:{event_name}", pool=pool, position=position)

  def _play_surface_step(self, *, sound_group: str, position: Vec3) -> None:
    for candidate_group in iter_sound_group_candidates(str(sound_group)):
      group_catalog = PLAYER_SURFACE_SOUND_CATALOG.get(str(candidate_group))
      pool = None if group_catalog is None else group_catalog.get(PLAYER_EVENT_STEP)
      if pool is None:
        continue
      if self._play_pool(pool_key=f"player:{candidate_group}:{PLAYER_EVENT_STEP}", pool=pool, position=position):
        return

  def _pose_almost_equal(self, left: tuple[float, float, float, float, float, float], right: tuple[float, float, float, float, float, float]) -> bool:
    return pose_almost_equal(left, right, linear_epsilon=float(self._listener_linear_epsilon), angular_epsilon_deg=float(self._listener_angular_epsilon_deg))

  def _block_center(self, position: tuple[int, int, int]) -> Vec3:
    return block_center(position)

  def _normalize_world_position(self, position: tuple[float, float, float] | Vec3 | None) -> Vec3:
    return normalize_world_position(position, listener_pose=self._listener_pose)

  def _build_source_cache(self) -> None:
    for pool_key, pool in self._pool_specs.items():
      self._resolved_urls[str(pool_key)] = self._resolve_existing_urls(pool)

  def _resolve_existing_urls(self, pool: AudioSamplePool) -> tuple[QUrl, ...]:
    return resolve_existing_urls(resource_root=self._resource_root, pool=pool)

  @staticmethod
  def _source_key_for_url(url: QUrl) -> str:
    return source_key_for_url(url)

  def _ensure_prepared_sources(self, pool_key: str, pool: AudioSamplePool) -> list[PreparedSource]:
    cached = self._prepared_sources.get(str(pool_key))
    if cached is not None:
      return cached

    urls = self._resolved_urls.get(str(pool_key))
    if urls is None:
      urls = self._resolve_existing_urls(pool)
      self._resolved_urls[str(pool_key)] = urls

    desired_slots = self._slot_budget_per_source(pool, source_count=len(urls))
    prepared = [PreparedSource(url=url, source_key=self._source_key_for_url(url), desired_slots=int(desired_slots)) for url in tuple(urls)]
    self._prepared_sources[str(pool_key)] = prepared
    return prepared

  def _pick_prepared_source(self, pool_key: str, pool: AudioSamplePool, prepared_sources: list[PreparedSource]) -> PreparedSource | None:
    return pick_prepared_source(pool_key=str(pool_key), pool=pool, prepared_sources=prepared_sources, round_robin_index=self._round_robin_index, random_source=self._random)

  def _admit_pool_play(self, *, pool_key: str, pool: AudioSamplePool) -> bool:
    return admit_pool_play(pool_key=str(pool_key), pool=pool, throttle_until_s=self._pool_throttle_until_s)

  def _listener_within_cutoff(self, *, position: Vec3, cutoff: float) -> bool:
    return listener_within_cutoff(position=position, cutoff=float(cutoff), listener_pose=self._listener_pose)

  @staticmethod
  def _slot_budget_per_source(pool: AudioSamplePool, *, source_count: int) -> int:
    return slot_budget_per_source(pool, source_count=int(source_count))

  def _ensure_effect_slots(self, prepared: PreparedSource, *, desired_slots: int, base_volume: float) -> None:
    ensure_effect_slots(parent=self, prepared=prepared, desired_slots=int(desired_slots), base_volume=float(base_volume))

  def _next_effect_slot(self, prepared: PreparedSource, *, desired_slots: int, base_volume: float):
    return next_effect_slot(parent=self, prepared=prepared, desired_slots=int(desired_slots), base_volume=float(base_volume))

  def _play_pool(self, *, pool_key: str, pool: AudioSamplePool, position: Vec3) -> bool:
    base_volume = float(self._preferences.volume_for(pool.category))
    if base_volume <= 1e-6:
      return False

    if not self._admit_pool_play(pool_key=str(pool_key), pool=pool):
      return False

    if bool(pool.spatial) and float(pool.distance_cutoff) > 1e-6:
      if not self._listener_within_cutoff(position=position, cutoff=float(pool.distance_cutoff)):
        return False

    prepared_sources = self._ensure_prepared_sources(str(pool_key), pool)
    if not prepared_sources:
      return False

    prepared = self._pick_prepared_source(str(pool_key), pool, prepared_sources)
    if prepared is None:
      return False

    desired_slots = self._slot_budget_per_source(pool, source_count=len(prepared_sources))
    slot = self._next_effect_slot(prepared, desired_slots=int(desired_slots), base_volume=float(base_volume))
    if slot is None:
      return False

    if slot.effect.isPlaying():
      slot.effect.stop()
    slot.effect.setVolume(float(base_volume))
    slot.effect.play()
    return True

  def _ensure_ambient_effect(self) -> QSoundEffect:
    if self._ambient_effect is not None:
      return self._ambient_effect

    effect = QSoundEffect(self)
    effect.setLoopCount(1)
    effect.setVolume(float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT)))
    effect.playingChanged.connect(self._on_ambient_playing_changed)
    effect.statusChanged.connect(self._on_ambient_status_changed)

    self._ambient_effect = effect
    return effect

  def _ambient_desired_key(self) -> str | None:
    return ambient_desired_key(enabled=bool(self._ambient_enabled), current_space_id=str(self._ambient_space_id))

  def _sync_ambient_sound(self) -> None:
    desired_key = self._ambient_desired_key()
    volume = float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT))

    if desired_key is None or volume <= 1e-6:
      self._stop_ambient_effect()
      self._ambient_key = None
      self._ambient_source_key = ""
      self._ambient_pending_play = False
      return

    effect = self._ensure_ambient_effect()
    effect.setVolume(volume)

    if self._ambient_key != str(desired_key):
      self._ambient_key = str(desired_key)
      self._ambient_source_key = ""
      self._start_next_ambient_source()
      return

    if not effect.isPlaying() and not self._ambient_pending_play:
      self._start_next_ambient_source()

  def _stop_ambient_effect(self) -> None:
    if self._ambient_effect is None:
      return

    self._ambient_transitioning = True
    self._ambient_effect.stop()
    self._ambient_transitioning = False

  def _pick_existing_url(self, pool_key: str, pool: AudioSamplePool) -> QUrl | None:
    urls = self._resolved_urls.get(str(pool_key))
    if urls is None:
      urls = self._resolve_existing_urls(pool)
      self._resolved_urls[str(pool_key)] = urls

    if not urls:
      return None

    if str(pool.selection_mode) == SELECTION_ROUND_ROBIN:
      cursor = int(self._round_robin_index.get(str(pool_key), -1)) + 1
      idx = int(cursor % len(urls))
      self._round_robin_index[str(pool_key)] = idx
      return urls[idx]

    return urls[int(self._random.randrange(len(urls)))]

  def _start_next_ambient_source(self) -> None:
    if self._ambient_key is None:
      return

    pool = AMBIENT_SOUND_CATALOG.get(str(self._ambient_key))
    if pool is None:
      return

    url = self._pick_existing_url(f"ambient:{self._ambient_key}", pool)
    if url is None:
      self._stop_ambient_effect()
      self._ambient_source_key = ""
      self._ambient_pending_play = False
      return

    effect = self._ensure_ambient_effect()
    source_key = self._source_key_for_url(url)

    self._ambient_transitioning = True
    effect.stop()
    if self._ambient_source_key != source_key:
      effect.setSource(url)
      self._ambient_source_key = source_key
    self._ambient_transitioning = False

    self._ambient_pending_play = True
    self._play_ambient_effect_when_ready()

  def _play_ambient_effect_when_ready(self) -> None:
    if self._ambient_key is None or self._ambient_effect is None:
      self._ambient_pending_play = False
      return

    volume = float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT))
    if volume <= 1e-6:
      self._ambient_pending_play = False
      self._stop_ambient_effect()
      return

    if not self._ambient_effect.isLoaded():
      self._ambient_pending_play = True
      return

    self._ambient_effect.setVolume(volume)
    self._ambient_pending_play = False
    self._ambient_effect.play()

  def _on_ambient_status_changed(self) -> None:
    if self._ambient_pending_play:
      self._play_ambient_effect_when_ready()

  def _on_ambient_playing_changed(self) -> None:
    if self._ambient_effect is None:
      return

    if self._ambient_transitioning or self._ambient_pending_play:
      return

    if self._ambient_key is not None and not self._ambient_effect.isPlaying():
      self._start_next_ambient_source()
