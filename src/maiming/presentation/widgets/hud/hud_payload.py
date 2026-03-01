# FILE: src/maiming/presentation/widgets/hud/hud_payload.py
from __future__ import annotations

from dataclasses import dataclass

@dataclass(frozen=True)
class HudPayload:
    top_left: str
    top_right: str
    bottom_left: str
    bottom_right: str