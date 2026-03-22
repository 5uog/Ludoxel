# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass

from ....shared.math.scalars import clampf

AUDIO_CATEGORY_MASTER = "master"
AUDIO_CATEGORY_AMBIENT = "ambient"
AUDIO_CATEGORY_BLOCK = "block"
AUDIO_CATEGORY_PLAYER = "player"

AUDIO_CATEGORY_ORDER: tuple[str, ...] = (AUDIO_CATEGORY_MASTER, AUDIO_CATEGORY_AMBIENT, AUDIO_CATEGORY_BLOCK, AUDIO_CATEGORY_PLAYER)


def _clamp_volume(value: object, *, default: float=1.0) -> float:
    """I define V(x) = clamp_R(float(x), 0, 1) with total fallback to `default`. This normalization preserves the closed gain interval required by the mixer."""
    try:
        numeric = float(value)
    except Exception:
        numeric = float(default)
    return float(clampf(float(numeric), 0.0, 1.0))


@dataclass(frozen=True)
class AudioPreferences:
    """I model the mixer state as A = (master, ambient, block, player) with each component constrained to [0,1]. I store these gains independently so that effective category gain can be evaluated compositionally."""
    master: float = 1.0
    ambient: float = 1.0
    block: float = 1.0
    player: float = 1.0

    def __post_init__(self) -> None:
        """I project every stored gain through V at construction time. This makes the dataclass itself its normalized representation."""
        object.__setattr__(self, "master", _clamp_volume(self.master))
        object.__setattr__(self, "ambient", _clamp_volume(self.ambient))
        object.__setattr__(self, "block", _clamp_volume(self.block))
        object.__setattr__(self, "player", _clamp_volume(self.player))

    def normalized(self) -> "AudioPreferences":
        """I return self because the constructor already enforces the normalization invariant A in [0,1]^4."""
        return self

    def volume_for(self, category: str) -> float:
        """I define gain(category) = master * category_gain for non-master categories and = master otherwise. This factorization preserves a global mute-like scaling channel without duplicating category state."""
        key = str(category).strip().lower()
        if key == AUDIO_CATEGORY_AMBIENT:
            return float(self.master) * float(self.ambient)
        if key == AUDIO_CATEGORY_BLOCK:
            return float(self.master) * float(self.block)
        if key == AUDIO_CATEGORY_PLAYER:
            return float(self.master) * float(self.player)
        return float(self.master)

    def to_dict(self) -> dict[str, float]:
        """I serialize the normalized mixer vector into a flat mapping keyed by category identifiers."""
        return {AUDIO_CATEGORY_MASTER: float(self.master), AUDIO_CATEGORY_AMBIENT: float(self.ambient), AUDIO_CATEGORY_BLOCK: float(self.block), AUDIO_CATEGORY_PLAYER: float(self.player)}

    @staticmethod
    def from_dict(data: object) -> "AudioPreferences":
        """I define total deserialization from an arbitrary mapping into the normalized mixer domain."""
        if not isinstance(data, dict):
            return AudioPreferences()
        return AudioPreferences(master=_clamp_volume(data.get(AUDIO_CATEGORY_MASTER, 1.0)), ambient=_clamp_volume(data.get(AUDIO_CATEGORY_AMBIENT, 1.0)), block=_clamp_volume(data.get(AUDIO_CATEGORY_BLOCK, 1.0)), player=_clamp_volume(data.get(AUDIO_CATEGORY_PLAYER, 1.0)))
