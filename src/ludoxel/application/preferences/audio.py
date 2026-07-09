# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.scalars.numeric import clampf

AUDIO_CATEGORY_MASTER = "master"
AUDIO_CATEGORY_AMBIENT = "ambient"
AUDIO_CATEGORY_BLOCK = "block"
AUDIO_CATEGORY_PLAYER = "player"

AUDIO_CATEGORY_ORDER: tuple[str, ...] = (AUDIO_CATEGORY_MASTER, AUDIO_CATEGORY_AMBIENT, AUDIO_CATEGORY_BLOCK, AUDIO_CATEGORY_PLAYER)

DEFAULT_AUDIO_VOLUME_RATIO: float = 1.0
AUDIO_VOLUME_MIN_RATIO: float = 0.0
AUDIO_VOLUME_MAX_RATIO: float = 1.0


def _clamp_volume(value: object, *, default: float = DEFAULT_AUDIO_VOLUME_RATIO) -> float:
  try:
    numeric = float(value)
  except Exception:
    numeric = float(default)
  return float(clampf(float(numeric), AUDIO_VOLUME_MIN_RATIO, AUDIO_VOLUME_MAX_RATIO))


@dataclass(frozen=True)
class AudioPreferences:
  master: float = DEFAULT_AUDIO_VOLUME_RATIO
  ambient: float = DEFAULT_AUDIO_VOLUME_RATIO
  block: float = DEFAULT_AUDIO_VOLUME_RATIO
  player: float = DEFAULT_AUDIO_VOLUME_RATIO

  def __post_init__(self) -> None:
    object.__setattr__(self, "master", _clamp_volume(self.master))
    object.__setattr__(self, "ambient", _clamp_volume(self.ambient))
    object.__setattr__(self, "block", _clamp_volume(self.block))
    object.__setattr__(self, "player", _clamp_volume(self.player))

  def normalized(self) -> "AudioPreferences":
    return self

  def volume_for(self, category: str) -> float:
    key = str(category).strip().lower()
    if key == AUDIO_CATEGORY_AMBIENT:
      return float(self.master) * float(self.ambient)
    if key == AUDIO_CATEGORY_BLOCK:
      return float(self.master) * float(self.block)
    if key == AUDIO_CATEGORY_PLAYER:
      return float(self.master) * float(self.player)
    return float(self.master)

  def to_dict(self) -> dict[str, float]:
    return {AUDIO_CATEGORY_MASTER: float(self.master), AUDIO_CATEGORY_AMBIENT: float(self.ambient), AUDIO_CATEGORY_BLOCK: float(self.block), AUDIO_CATEGORY_PLAYER: float(self.player)}

  @staticmethod
  def from_dict(data: object) -> "AudioPreferences":
    if not isinstance(data, dict):
      return AudioPreferences()
    return AudioPreferences(
      master=_clamp_volume(data.get(AUDIO_CATEGORY_MASTER, DEFAULT_AUDIO_VOLUME_RATIO)),
      ambient=_clamp_volume(data.get(AUDIO_CATEGORY_AMBIENT, DEFAULT_AUDIO_VOLUME_RATIO)),
      block=_clamp_volume(data.get(AUDIO_CATEGORY_BLOCK, DEFAULT_AUDIO_VOLUME_RATIO)),
      player=_clamp_volume(data.get(AUDIO_CATEGORY_PLAYER, DEFAULT_AUDIO_VOLUME_RATIO)),
    )
