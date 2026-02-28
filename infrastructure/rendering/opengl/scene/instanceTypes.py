# FILE: infrastructure/rendering/opengl/scene/instanceTypes.py
from __future__ import annotations

"""
instanceTypes defines GPU-facing instance payload shapes. The responsibility of this file is to make the
CPU→GPU contract explicit and typed, preventing "silent layout drift" where a shader expects one layout
but Python code uploads another. In real-time rendering, those mismatches often fail nondeterministically
across drivers, so a single source of truth is an engineering necessity.

BlockInstanceGPU matches the per-instance data consumed by the world shader and configured in MeshBuffer:
translation, UV rectangle inside the atlas, and a scalar shade multiplier. float is used because the GL
pipeline consumes float attributes and the numeric range for voxel coordinates and UVs is well within
float32 precision.
"""

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