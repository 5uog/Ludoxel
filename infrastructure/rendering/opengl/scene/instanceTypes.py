# FILE: infrastructure/rendering/opengl/scene/instanceTypes.py
from __future__ import annotations

from dataclasses import dataclass

@dataclass(frozen=True)
class BlockInstanceGPU:
    x: float
    y: float
    z: float
    u0: float
    v0: float
    u1: float
    v1: float
    shade: float = 1.0