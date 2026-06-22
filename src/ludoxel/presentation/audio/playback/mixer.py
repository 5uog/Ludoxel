# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import random
import sys
import wave
from array import array
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtCore import QObject, QTimer, QUrl
from PyQt6.QtMultimedia import QAudioFormat, QAudioSink, QMediaDevices

from ludoxel.presentation.audio.types.events import SELECTION_ROUND_ROBIN

_PCM_SAMPLE_RATE = 44100
_PCM_CHANNELS = 2
_PCM_SAMPLE_BYTES = 2
_PCM_FRAME_BYTES = _PCM_CHANNELS * _PCM_SAMPLE_BYTES
_PCM_PUMP_FRAMES = 1024
_MAX_MIX_VOICES = 32


@dataclass(frozen=True)
class _PcmSample:
  source_key: str
  frames: array
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

    frames = min(_PCM_PUMP_FRAMES, frame_capacity)
    data = self._mix_frames(frames)
    if not data:
      return
    self._io_device.write(data)

  def _mix_frames(self, frame_count: int) -> bytes:
    left_right: list[int] = [0] * (int(frame_count) * _PCM_CHANNELS)
    survivors: list[_ActivePcmVoice] = []

    for voice in self._active:
      sample = voice.sample
      start = int(voice.frame_index)
      remaining = max(0, int(sample.frame_count) - start)
      frames_to_mix = min(int(frame_count), int(remaining))
      if frames_to_mix <= 0:
        continue

      sample_offset = start * _PCM_CHANNELS
      gain = float(voice.volume)
      for frame in range(frames_to_mix):
        dst = frame * _PCM_CHANNELS
        src = sample_offset + dst
        left_right[dst] += int(float(sample.frames[src]) * gain)
        left_right[dst + 1] += int(float(sample.frames[src + 1]) * gain)

      voice.frame_index = int(start + frames_to_mix)
      if voice.frame_index < int(sample.frame_count):
        survivors.append(voice)

    self._active = survivors
    mixed = array("h", (_clamp_int16(value) for value in left_right))
    if sys.byteorder != "little":
      mixed.byteswap()
    return mixed.tobytes()


def _clamp_int16(value: int) -> int:
  return max(-32768, min(32767, int(value)))


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

  return _PcmSample(source_key=str(source_key), frames=stereo, frame_count=len(stereo) // _PCM_CHANNELS)


def _decode_pcm_to_stereo_int16(raw: bytes, *, channels: int, sample_width: int) -> array | None:
  if sample_width == 1:
    mono_or_multi = [int((byte - 128) << 8) for byte in raw]
  elif sample_width == 2:
    mono_or_multi_array = array("h")
    mono_or_multi_array.frombytes(raw)
    if sys.byteorder != "little":
      mono_or_multi_array.byteswap()
    mono_or_multi = [int(value) for value in mono_or_multi_array]
  else:
    return None

  if channels == 1:
    stereo = array("h")
    for value in mono_or_multi:
      clipped = _clamp_int16(value)
      stereo.append(clipped)
      stereo.append(clipped)
    return stereo

  if channels == 2:
    return array("h", (_clamp_int16(value) for value in mono_or_multi))

  stereo = array("h")
  for idx in range(0, len(mono_or_multi), int(channels)):
    frame = mono_or_multi[idx : idx + int(channels)]
    if len(frame) < int(channels):
      break
    left = frame[0]
    right = frame[1] if len(frame) > 1 else frame[0]
    stereo.append(_clamp_int16(left))
    stereo.append(_clamp_int16(right))
  return stereo


def _resample_stereo_int16(samples: array, *, source_rate: int, target_rate: int) -> array:
  if int(source_rate) == int(target_rate) or not samples:
    return samples

  source_frames = len(samples) // _PCM_CHANNELS
  target_frames = max(1, int(round(float(source_frames) * float(target_rate) / float(source_rate))))
  out = array("h")
  for frame in range(target_frames):
    pos = float(frame) * float(source_rate) / float(target_rate)
    left_idx = int(pos)
    right_idx = min(source_frames - 1, left_idx + 1)
    frac = float(pos - float(left_idx))
    base_left = left_idx * _PCM_CHANNELS
    base_right = right_idx * _PCM_CHANNELS
    left = int(round(float(samples[base_left]) * (1.0 - frac) + float(samples[base_right]) * frac))
    right = int(round(float(samples[base_left + 1]) * (1.0 - frac) + float(samples[base_right + 1]) * frac))
    out.append(_clamp_int16(left))
    out.append(_clamp_int16(right))
  return out
