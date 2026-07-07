# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import random
from pathlib import Path

from PyQt6.QtCore import QObject, QTimer, QUrl
from PyQt6.QtMultimedia import QMediaDevices, QSoundEffect

from ludoxel.application.preferences.audio import AUDIO_CATEGORY_AMBIENT, AudioPreferences
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.presentation.audio.catalogs.ambient import AMBIENT_SOUND_CATALOG
from ludoxel.presentation.audio.catalogs.material import BLOCK_EVENT_BREAK, BLOCK_EVENT_INTERACT_CLOSE, BLOCK_EVENT_INTERACT_OPEN, BLOCK_EVENT_PLACE, BLOCK_SOUND_CATALOG, PLAYER_EVENT_STEP, PLAYER_SURFACE_SOUND_CATALOG
from ludoxel.presentation.audio.catalogs.player import PLAYER_EVENT_ATTACK_STRONG, PLAYER_EVENT_ATTACK_WEAK, PLAYER_EVENT_LAND, PLAYER_EVENT_LAND_BIG, PLAYER_EVENT_LAND_SMALL, PLAYER_EVENT_SOUND_CATALOG
from ludoxel.presentation.audio.playback.ambient import ambient_desired_key
from ludoxel.presentation.audio.playback.effects import admit_pool_play, effect_clock_s, ensure_effect_slots, has_idle_voice, mark_slot_started, next_effect_slot, steal_oldest_effect_slot
from ludoxel.presentation.audio.playback.listener import block_center, listener_within_cutoff, pose_almost_equal, spatial_distance_gain
from ludoxel.presentation.audio.playback.mixer import PcmOneShotMixer
from ludoxel.presentation.audio.playback.sources import PreparedSource, effect_voice_hold_s_for_url, pick_prepared_source, resolve_existing_urls, slot_budget_per_source, source_key_for_url
from ludoxel.presentation.audio.types.events import SELECTION_ROUND_ROBIN, AudioSamplePool
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.sounds.groups import DEFAULT_BLOCK_SOUND_GROUP, iter_sound_group_candidates
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.blocks.states.values import prop_as_bool

_EFFECT_HEADROOM_REFERENCE_VOICES = 2
_EFFECT_HEADROOM_MIN_GAIN = 0.50


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
    self._media_devices = QMediaDevices(self)
    self._player_attack_mixer = PcmOneShotMixer(media_devices=self._media_devices, parent=self)
    self._audio_output_refresh_pending: bool = False

    self._listener_linear_epsilon = 0.05
    self._listener_angular_epsilon_deg = 1.0

    self._small_landing_threshold_blocks = 6.0
    self._big_landing_threshold_blocks = 12.0

    self._connect_audio_device_change_signals()
    self._build_source_cache()
    self.prime_effects()

  def shutdown(self) -> None:
    self._player_attack_mixer.shutdown()

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
    self._audio_output_refresh_pending = False

  def set_preferences(self, preferences: AudioPreferences) -> None:
    self._preferences = preferences.normalized()

    if self._ambient_effect is not None:
      self._ambient_effect.setVolume(float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT)))

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

      for prepared in tuple(prepared_sources):
        self._ensure_effect_slots(prepared, desired_slots=int(prepared.desired_slots))

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

  def play_interaction(self, *, action: str | None, block_state: str | None, position: tuple[int, int, int] | None = None) -> None:
    del position
    resolved = self._resolve_block_action(action=action, block_state=block_state)
    if resolved is None:
      return

    action_name, sound_group = resolved
    self.play_block_action(action=str(action_name), sound_group=str(sound_group))

  def play_remote_interaction(self, *, action: str | None, block_state: str | None, position: tuple[int, int, int] | None) -> None:
    if position is None:
      return

    resolved = self._resolve_block_action(action=action, block_state=block_state)
    if resolved is None:
      return

    action_name, sound_group = resolved
    self.play_remote_block_action(action=str(action_name), sound_group=str(sound_group), position=tuple(position))

  def play_block_action(self, *, action: str, sound_group: str, position: tuple[int, int, int] | None = None) -> None:
    del position
    self._play_block_action_local(action=str(action), sound_group=str(sound_group))

  def play_remote_block_action(self, *, action: str, sound_group: str, position: tuple[int, int, int]) -> None:
    world_position = self._block_center(tuple(position))
    self._play_block_action_remote(action=str(action), sound_group=str(sound_group), position=world_position)

  def play_surface_event(self, *, event_name: str, support_block_state: str | None, position: tuple[int, int, int] | None = None, fall_distance_blocks: float | None = None) -> None:
    del position
    if support_block_state is None:
      return

    sound_group = self.sound_group_for_block_state(str(support_block_state))

    if str(event_name) == PLAYER_EVENT_LAND:
      self._play_landing_event(sound_group=sound_group, fall_distance_blocks=fall_distance_blocks)
      return

    if str(event_name) != PLAYER_EVENT_STEP:
      return

    self._play_surface_step(sound_group=sound_group)

  def play_othello_event(self, *, event_name: str, position: tuple[float, float, float] | None = None) -> None:
    del position
    self.play_player_event(event_name=str(event_name))

  def play_player_event(self, *, event_name: str, position: tuple[float, float, float] | Vec3 | None = None) -> None:
    del position
    normalized_event = str(event_name)
    if normalized_event in {PLAYER_EVENT_ATTACK_WEAK, PLAYER_EVENT_ATTACK_STRONG}:
      self._play_player_attack_event(event_name=normalized_event)
      return

    pool = PLAYER_EVENT_SOUND_CATALOG.get(normalized_event)
    if pool is None:
      return
    self._play_local_pool(pool_key=f"player_event:{normalized_event}", pool=pool)

  def play_remote_player_event(self, *, event_name: str, position: tuple[float, float, float] | Vec3 | None) -> None:
    normalized_event = str(event_name)
    if normalized_event in {PLAYER_EVENT_ATTACK_WEAK, PLAYER_EVENT_ATTACK_STRONG}:
      return

    world_position = self._coerce_world_position(position)
    if world_position is None:
      return

    pool = PLAYER_EVENT_SOUND_CATALOG.get(normalized_event)
    if pool is None:
      return
    self._play_remote_pool(pool_key=f"player_event:{normalized_event}", pool=pool, position=world_position)

  def _play_player_attack_event(self, *, event_name: str) -> None:
    pool = PLAYER_EVENT_SOUND_CATALOG.get(str(event_name))
    if pool is None:
      return

    base_volume = float(self._preferences.volume_for(pool.category))
    if base_volume <= 1e-6:
      return

    pool_key = f"player_event:{event_name}"
    if not self._admit_pool_play(pool_key=str(pool_key), pool=pool):
      return

    urls = self._resolved_urls.get(str(pool_key))
    if urls is None:
      urls = self._resolve_existing_urls(pool)
      self._resolved_urls[str(pool_key)] = urls

    self._player_attack_mixer.play(urls=tuple(urls), pool_key=str(pool_key), selection_mode=str(pool.selection_mode), volume=float(base_volume), max_voices=int(pool.max_polyphony), random_source=self._random)

  def _resolve_block_action(self, *, action: str | None, block_state: str | None) -> tuple[str, str] | None:
    if action is None or block_state is None:
      return None

    resolved_action = str(action)
    sound_group = self.sound_group_for_block_state(str(block_state))

    if resolved_action == "interact":
      _base_id, props = parse_state(str(block_state))
      is_open = prop_as_bool(props, "open", False)
      resolved_action = BLOCK_EVENT_INTERACT_OPEN if bool(is_open) else BLOCK_EVENT_INTERACT_CLOSE

    if resolved_action in {BLOCK_EVENT_INTERACT_OPEN, BLOCK_EVENT_INTERACT_CLOSE, BLOCK_EVENT_PLACE, BLOCK_EVENT_BREAK}:
      return (str(resolved_action), str(sound_group))

    return None

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

  def _connect_audio_device_change_signals(self) -> None:
    self._media_devices.audioOutputsChanged.connect(self._schedule_audio_output_refresh)

  def _schedule_audio_output_refresh(self, *_args: object) -> None:
    if self._audio_output_refresh_pending:
      return

    self._audio_output_refresh_pending = True
    QTimer.singleShot(0, self._refresh_audio_output_bindings)

  def _refresh_audio_output_bindings(self) -> None:
    self._audio_output_refresh_pending = False

    self._player_attack_mixer.retarget_default_audio_output()

    for prepared_group in tuple(self._prepared_sources.values()):
      for prepared in tuple(prepared_group):
        for slot in tuple(prepared.slots):
          self._retarget_effect_to_default_audio_output(slot.effect)

    if self._ambient_effect is None:
      return

    should_resume = self._ambient_key is not None and float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT)) > 1e-6
    self._ambient_transitioning = True
    self._ambient_effect.stop()
    self._retarget_effect_to_default_audio_output(self._ambient_effect)
    self._ambient_transitioning = False

    if should_resume:
      self._ambient_pending_play = True
      self._play_ambient_effect_when_ready()

  def _retarget_effect_to_default_audio_output(self, effect: QSoundEffect) -> None:
    device = self._default_audio_output_device()
    if device is None:
      return

    effect.stop()
    effect.setAudioDevice(device)

  def _default_audio_output_device(self):
    device = self._media_devices.defaultAudioOutput()
    is_null = getattr(device, "isNull", None)
    if callable(is_null) and bool(is_null()):
      return None
    return device

  def _configure_effect_for_audio_output(self, effect: QSoundEffect) -> None:
    self._retarget_effect_to_default_audio_output(effect)
    if bool(effect.property("_ludoxel_audio_output_watch")):
      return
    effect.statusChanged.connect(lambda *_args, watched_effect=effect: self._on_effect_status_changed(watched_effect))
    effect.setProperty("_ludoxel_audio_output_watch", True)

  def _on_effect_status_changed(self, effect: QSoundEffect) -> None:
    if effect.status() == QSoundEffect.Status.Error:
      self._schedule_audio_output_refresh()

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

  def _play_landing_event(self, *, sound_group: str, fall_distance_blocks: float | None) -> None:
    event_name = self._landing_event_name(fall_distance_blocks)

    if event_name is None:
      self._play_surface_step(sound_group=str(sound_group))
      return

    pool = PLAYER_EVENT_SOUND_CATALOG.get(str(event_name))
    if pool is None:
      return

    self._play_local_pool(pool_key=f"player_event:{event_name}", pool=pool)

  def _play_surface_step(self, *, sound_group: str) -> None:
    for candidate_group in iter_sound_group_candidates(str(sound_group)):
      group_catalog = PLAYER_SURFACE_SOUND_CATALOG.get(str(candidate_group))
      pool = None if group_catalog is None else group_catalog.get(PLAYER_EVENT_STEP)
      if pool is None:
        continue
      if self._play_local_pool(pool_key=f"player:{candidate_group}:{PLAYER_EVENT_STEP}", pool=pool):
        return

  def _play_block_action_local(self, *, action: str, sound_group: str) -> None:
    for candidate_group in iter_sound_group_candidates(str(sound_group)):
      group_catalog = BLOCK_SOUND_CATALOG.get(str(candidate_group))
      pool = None if group_catalog is None else group_catalog.get(str(action))
      if pool is None:
        continue
      self._play_local_pool(pool_key=f"block:{candidate_group}:{action}", pool=pool)
      return

  def _play_block_action_remote(self, *, action: str, sound_group: str, position: Vec3) -> None:
    for candidate_group in iter_sound_group_candidates(str(sound_group)):
      group_catalog = BLOCK_SOUND_CATALOG.get(str(candidate_group))
      pool = None if group_catalog is None else group_catalog.get(str(action))
      if pool is None:
        continue
      self._play_remote_pool(pool_key=f"block:{candidate_group}:{action}", pool=pool, position=position)
      return

  def _pose_almost_equal(self, left: tuple[float, float, float, float, float, float], right: tuple[float, float, float, float, float, float]) -> bool:
    return pose_almost_equal(left, right, linear_epsilon=float(self._listener_linear_epsilon), angular_epsilon_deg=float(self._listener_angular_epsilon_deg))

  def _block_center(self, position: tuple[int, int, int]) -> Vec3:
    return block_center(position)

  @staticmethod
  def _coerce_world_position(position: tuple[float, float, float] | Vec3 | None) -> Vec3 | None:
    if position is None:
      return None
    if isinstance(position, Vec3):
      return Vec3(float(position.x), float(position.y), float(position.z))
    return Vec3(float(position[0]), float(position[1]), float(position[2]))

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
    prepared = [PreparedSource(url=url, source_key=self._source_key_for_url(url), desired_slots=int(desired_slots), voice_hold_s=effect_voice_hold_s_for_url(url)) for url in tuple(urls)]
    self._prepared_sources[str(pool_key)] = prepared
    return prepared

  def _pick_prepared_source(self, pool_key: str, pool: AudioSamplePool, prepared_sources: list[PreparedSource]) -> PreparedSource | None:
    return pick_prepared_source(pool_key=str(pool_key), pool=pool, prepared_sources=prepared_sources, round_robin_index=self._round_robin_index, random_source=self._random)

  def _admit_pool_play(self, *, pool_key: str, pool: AudioSamplePool) -> bool:
    return admit_pool_play(pool_key=str(pool_key), pool=pool, throttle_until_s=self._pool_throttle_until_s)

  def _listener_within_cutoff(self, *, position: Vec3, cutoff: float) -> bool:
    return listener_within_cutoff(position=position, cutoff=float(cutoff), listener_pose=self._listener_pose)

  def _spatial_distance_gain(self, *, position: Vec3, cutoff: float) -> float:
    return spatial_distance_gain(position=position, cutoff=float(cutoff), listener_pose=self._listener_pose)

  @staticmethod
  def _slot_budget_per_source(pool: AudioSamplePool, *, source_count: int) -> int:
    return slot_budget_per_source(pool, source_count=int(source_count))

  def _ensure_effect_slots(self, prepared: PreparedSource, *, desired_slots: int) -> None:
    ensure_effect_slots(parent=self, prepared=prepared, desired_slots=int(desired_slots), configure_effect=self._configure_effect_for_audio_output)

  def _next_effect_slot(self, prepared: PreparedSource, *, desired_slots: int, now_s: float | None = None):
    return next_effect_slot(parent=self, prepared=prepared, desired_slots=int(desired_slots), configure_effect=self._configure_effect_for_audio_output, now_s=now_s)

  @staticmethod
  def _active_effect_voice_count(prepared_sources: tuple[PreparedSource, ...], *, now_s: float) -> int:
    active = 0
    for prepared in tuple(prepared_sources):
      for slot in tuple(prepared.slots):
        if bool(slot.effect.isPlaying()) or float(now_s) < float(slot.busy_until_s):
          active += 1
    return int(active)

  @staticmethod
  def _apply_active_voice_headroom(volume: float, *, active_voice_count: int) -> float:
    request_volume = max(0.0, min(1.0, float(volume)))
    voices_after_start = int(active_voice_count) + 1
    if voices_after_start <= int(_EFFECT_HEADROOM_REFERENCE_VOICES):
      return float(request_volume)

    ratio = float(_EFFECT_HEADROOM_REFERENCE_VOICES) / float(max(1, voices_after_start))
    headroom = max(float(_EFFECT_HEADROOM_MIN_GAIN), float(ratio**0.5))
    return float(request_volume) * float(headroom)

  def _play_local_pool(self, *, pool_key: str, pool: AudioSamplePool) -> bool:
    request_volume = float(self._preferences.volume_for(pool.category))
    return self._play_effect_pool(pool_key=str(pool_key), pool=pool, request_volume=float(request_volume))

  def _play_remote_pool(self, *, pool_key: str, pool: AudioSamplePool, position: Vec3) -> bool:
    if self._listener_pose is None:
      return False

    request_volume = float(self._preferences.volume_for(pool.category))
    if request_volume <= 1e-6:
      return False

    if bool(pool.spatial) and float(pool.distance_cutoff) > 1e-6:
      if not self._listener_within_cutoff(position=position, cutoff=float(pool.distance_cutoff)):
        return False
      distance_gain = self._spatial_distance_gain(position=position, cutoff=float(pool.distance_cutoff))
      if float(distance_gain) <= 1e-6:
        return False
      request_volume = float(request_volume) * float(distance_gain)

    return self._play_effect_pool(pool_key=str(pool_key), pool=pool, request_volume=float(request_volume))

  def _play_effect_pool(self, *, pool_key: str, pool: AudioSamplePool, request_volume: float) -> bool:
    if float(request_volume) <= 1e-6:
      return False

    if not self._admit_pool_play(pool_key=str(pool_key), pool=pool):
      return False

    prepared_sources = self._ensure_prepared_sources(str(pool_key), pool)
    if not prepared_sources:
      return False

    desired_slots = self._slot_budget_per_source(pool, source_count=len(prepared_sources))
    for prepared in tuple(prepared_sources):
      self._ensure_effect_slots(prepared, desired_slots=int(desired_slots))

    now_s = effect_clock_s()
    idle_sources = [prepared for prepared in prepared_sources if has_idle_voice(prepared, now_s=now_s)]
    if idle_sources:
      prepared = self._pick_prepared_source(str(pool_key), pool, idle_sources)
      if prepared is None:
        return False
      slot = self._next_effect_slot(prepared, desired_slots=int(desired_slots), now_s=now_s)
    else:
      # Every voice of every source is busy.
      # Admitted events must still be heard, so the oldest voice of the selected source is reclaimed instead of dropping the event.
      prepared = self._pick_prepared_source(str(pool_key), pool, prepared_sources)
      if prepared is None:
        return False
      slot = steal_oldest_effect_slot(prepared)
    if slot is None:
      return False

    active_voice_count = self._active_effect_voice_count(tuple(prepared_sources), now_s=now_s)
    final_volume = self._apply_active_voice_headroom(float(request_volume), active_voice_count=int(active_voice_count))
    slot.effect.setVolume(float(final_volume))
    slot.effect.play()
    mark_slot_started(slot, prepared=prepared, now_s=now_s)
    return True

  def _ensure_ambient_effect(self) -> QSoundEffect:
    if self._ambient_effect is not None:
      return self._ambient_effect

    effect = QSoundEffect(self)
    effect.setLoopCount(1)
    effect.setVolume(float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT)))
    self._configure_effect_for_audio_output(effect)
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
    if self._ambient_effect is not None and self._ambient_effect.status() == QSoundEffect.Status.Error:
      self._schedule_audio_output_refresh()
      return

    if self._ambient_pending_play:
      self._play_ambient_effect_when_ready()

  def _on_ambient_playing_changed(self) -> None:
    if self._ambient_effect is None:
      return

    if self._ambient_transitioning or self._ambient_pending_play:
      return

    if self._ambient_key is not None and not self._ambient_effect.isPlaying():
      self._start_next_ambient_source()
