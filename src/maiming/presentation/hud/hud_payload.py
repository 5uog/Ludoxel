# FILE: src/maiming/presentation/hud/hud_payload.py
from __future__ import annotations

from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class HudPayload:
    text: str