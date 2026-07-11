# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import random
import wave
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PyQt6.QtCore import QObject, QTimer, QUrl
from PyQt6.QtMultimedia import QAudioFormat, QAudioSink, QMediaDevices

from ludoxel.presentation.audio.types.events import SELECTION_ROUND_ROBIN

_PCM_SAMPLE_RATE = 44100
_PCM_CHANNELS = 2
_PCM_SAMPLE_BYTES = 2
_PCM_FRAME_BYTES = _PCM_CHANNELS * _PCM_SAMPLE_BYTES
# The pump runs on the GUI thread, so the sink buffer must absorb render stalls longer than one timer tick: 4096 frames hold ~93 ms at 44.1 kHz,
# and each pump refills every free frame up to that same bound.
_PCM_SINK_BUFFER_FRAMES = 4096
_PCM_PUMP_MAX_FRAMES = 4096
_MAX_MIX_VOICES = 32


@dataclass(frozen=True)
class _PcmSample:
  source_key: str
  frames: np.ndarray
  frame_count: int


@dataclass
class _ActivePcmVoice:
  sample: _PcmSample
  frame_index: int
  volume: float


class PcmOneShotMixer(QObject):
  def __init__(self, *, media_devices: QMediaDevices, parent: QObject | None = None) -> None:
    super().__init__(parent)
    self._media_devices = media_devices
    self._samples: dict[str, _PcmSample] = {}
    self._active: list[_ActivePcmVoice] = []
    self._round_robin_index: dict[str, int] = {}
    self._audio_sink: QAudioSink | None = None
    self._audio_device = None
    self._io_device = None
    self._timer = QTimer(self)
    self._timer.setInterval(5)
    self._timer.timeout.connect(self._pump)

  def shutdown(self) -> None:
    self._timer.stop()
    self._active.clear()
    self._io_device = None
    if self._audio_sink is not None:
      self._audio_sink.stop()
      self._audio_sink.deleteLater()
      self._audio_sink = None
    self._audio_device = None

  def stop_active_voices(self) -> None:
    self._active.clear()

  def retarget_default_audio_output(self) -> None:
    was_active = bool(self._active)
    self._io_device = None
    if self._audio_sink is not None:
      self._audio_sink.stop()
      self._audio_sink.deleteLater()
      self._audio_sink = None
    self._audio_device = None
    if was_active:
      self._ensure_sink()
      self._start_timer()

  def play(self, *, urls: tuple[QUrl, ...], pool_key: str, selection_mode: str, volume: float, max_voices: int, random_source: random.Random) -> bool:
    if float(volume) <= 1e-6:
      return False

    samples = [sample for sample in (self._sample_for_url(url) for url in tuple(urls)) if sample is not None]
    if not samples:
      return False

    voice_limit = max(1, min(_MAX_MIX_VOICES, int(max_voices)))
    if len(self._active) >= voice_limit:
      self._active = self._active[-max(0, voice_limit - 1) :]

    sample = self._pick_sample(pool_key=str(pool_key), selection_mode=str(selection_mode), samples=samples, random_source=random_source)
    if sample is None:
      return False

    self._active.append(_ActivePcmVoice(sample=sample, frame_index=0, volume=max(0.0, min(1.0, float(volume)))))
    if not self._ensure_sink():
      self._active.pop()
      return False

    self._start_timer()
    self._pump()
    return True

  def _start_timer(self) -> None:
    if not self._timer.isActive():
      self._timer.start()

  def _pick_sample(self, *, pool_key: str, selection_mode: str, samples: list[_PcmSample], random_source: random.Random) -> _PcmSample | None:
    if not samples:
      return None
    if str(selection_mode) == SELECTION_ROUND_ROBIN:
      cursor = int(self._round_robin_index.get(str(pool_key), -1)) + 1
      idx = int(cursor % len(samples))
      self._round_robin_index[str(pool_key)] = idx
      return samples[idx]
    return samples[int(random_source.randrange(len(samples)))]

  def _ensure_sink(self) -> bool:
    if self._audio_sink is not None and self._io_device is not None:
      return True

    audio_format = QAudioFormat()
    audio_format.setSampleRate(_PCM_SAMPLE_RATE)
    audio_format.setChannelCount(_PCM_CHANNELS)
    audio_format.setSampleFormat(QAudioFormat.SampleFormat.Int16)

    device = self._media_devices.defaultAudioOutput()
    is_null = getattr(device, "isNull", None)
    if callable(is_null) and bool(is_null()):
      self._audio_sink = QAudioSink(audio_format, self)
    else:
      self._audio_device = device
      self._audio_sink = QAudioSink(device, audio_format, self)

    self._audio_sink.setBufferSize(int(_PCM_SINK_BUFFER_FRAMES * _PCM_FRAME_BYTES))
    self._io_device = self._audio_sink.start()
    return self._io_device is not None

  def _sample_for_url(self, url: QUrl) -> _PcmSample | None:
    source_key = str(url.toString())
    cached = self._samples.get(source_key)
    if cached is not None:
      return cached

    local_path = Path(str(url.toLocalFile()))
    sample = _load_wav_as_stereo_44100_int16(local_path, source_key=source_key)
    if sample is None:
      return None
    self._samples[source_key] = sample
    return sample

  def _pump(self) -> None:
    if self._audio_sink is None or self._io_device is None:
      if not self._active:
        self._timer.stop()
      return

    if not self._active:
      self._timer.stop()
      return

    bytes_free = int(self._audio_sink.bytesFree())
    frame_capacity = max(0, bytes_free // _PCM_FRAME_BYTES)
    if frame_capacity <= 0:
      return

    frames = min(_PCM_PUMP_MAX_FRAMES, frame_capacity)
    data = self._mix_frames(frames)
    if not data:
      return
    self._io_device.write(data)

  def _mix_frames(self, frame_count: int) -> bytes:
    mix = np.zeros((int(frame_count), _PCM_CHANNELS), dtype=np.int32)
    survivors: list[_ActivePcmVoice] = []

    for voice in self._active:
      sample = voice.sample
      start = int(voice.frame_index)
      remaining = max(0, int(sample.frame_count) - start)
      frames_to_mix = min(int(frame_count), int(remaining))
      if frames_to_mix <= 0:
        continue

      chunk = sample.frames[start : start + frames_to_mix].astype(np.float64)
      mix[:frames_to_mix] += (chunk * float(voice.volume)).astype(np.int32)

      voice.frame_index = int(start + frames_to_mix)
      if voice.frame_index < int(sample.frame_count):
        survivors.append(voice)

    self._active = survivors
    return np.clip(mix, -32768, 32767).astype("<i2").tobytes()


def _load_wav_as_stereo_44100_int16(path: Path, *, source_key: str) -> _PcmSample | None:
  try:
    with wave.open(str(path), "rb") as reader:
      channels = int(reader.getnchannels())
      sample_width = int(reader.getsampwidth())
      sample_rate = int(reader.getframerate())
      frame_count = int(reader.getnframes())
      raw = reader.readframes(frame_count)
  except (EOFError, OSError, wave.Error):
    return None

  if channels <= 0 or frame_count <= 0 or sample_rate <= 0:
    return None

  stereo = _decode_pcm_to_stereo_int16(raw, channels=channels, sample_width=sample_width)
  if stereo is None:
    return None

  if sample_rate != _PCM_SAMPLE_RATE:
    stereo = _resample_stereo_int16(stereo, source_rate=sample_rate, target_rate=_PCM_SAMPLE_RATE)

  return _PcmSample(source_key=str(source_key), frames=stereo, frame_count=int(stereo.shape[0]))


def _decode_pcm_to_stereo_int16(raw: bytes, *, channels: int, sample_width: int) -> np.ndarray | None:
  if sample_width == 1:
    flat = (np.frombuffer(raw, dtype=np.uint8).astype(np.int16) - 128) << 8
  elif sample_width == 2:
    flat = np.frombuffer(raw, dtype="<i2").astype(np.int16)
  else:
    return None

  usable_frames = int(flat.shape[0]) // int(channels)
  if usable_frames <= 0:
    return None
  frames = flat[: usable_frames * int(channels)].reshape((usable_frames, int(channels)))

  if channels == 1:
    return np.repeat(frames, 2, axis=1)
  # For two or more channels, the mix consumes the first two channels as the stereo pair.
  return np.ascontiguousarray(frames[:, :2])


def _resample_stereo_int16(samples: np.ndarray, *, source_rate: int, target_rate: int) -> np.ndarray:
  source_frames = int(samples.shape[0])
  if int(source_rate) == int(target_rate) or source_frames <= 0:
    return samples

  target_frames = max(1, int(round(float(source_frames) * float(target_rate) / float(source_rate))))
  positions = np.arange(target_frames, dtype=np.float64) * (float(source_rate) / float(target_rate))
  source_positions = np.arange(source_frames, dtype=np.float64)
  left = np.interp(positions, source_positions, samples[:, 0].astype(np.float64))
  right = np.interp(positions, source_positions, samples[:, 1].astype(np.float64))
  stacked = np.rint(np.stack((left, right), axis=1))
  return np.clip(stacked, -32768, 32767).astype(np.int16)
