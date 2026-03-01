# FILE: domain/config/collisionParams.py
from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class CollisionParams:
    eps: float = 1e-4
    ground_probe: float = 0.03

    # step_height expresses the maximum elevation that may be climbed as part of a walking resolution.
    # The value is intentionally aligned with half-block geometry so that slabs and stairs behave as
    # traversable terrain while full-block ledges still require an explicit jump.
    step_height: float = 0.6

    nearby_xz_pad: int = 1
    nearby_y_down_pad: int = 2
    nearby_y_up_pad: int = 1

    # sneak_step controls the discrete backoff used by the crouch edge-walk clamp.
    # It is a world-space distance and is applied iteratively until support is found.
    sneak_step: float = 0.05

DEFAULT_COLLISION_PARAMS = CollisionParams()