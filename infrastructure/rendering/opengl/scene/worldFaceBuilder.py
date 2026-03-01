# FILE: infrastructure/rendering/opengl/scene/worldFaceBuilder.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Iterable

from core.math.vec3 import Vec3
from core.grid.dda import dda_grid_traverse
from .instanceTypes import BlockInstanceGPU

# UVLookup resolves a UV rectangle for a given block id and face index.
# The face index matches MeshBuffer.create_quad_instanced() ordering and must remain consistent across the pipeline.
UVLookup = Callable[[str, int], tuple[float, float, float, float]]

@dataclass(frozen=True)
class FaceBakeParams:
    # sample_spread sets the offset distance on the face plane for the micro-sampling pattern.
    # 0.24 is a sub-voxel offset that remains inside the face while being large enough to detect edge occlusion.
    sample_spread: float = 0.24

    # t_max bounds traversal length; it must exceed view distance but remain finite for predictable cost.
    t_max: float = 220.0

    # eps_out and eps_sun avoid self-intersection and "starting inside geometry" artifacts in voxel DDA.
    # Values around 1e-3 are large enough relative to float32 epsilon at unit scale while remaining invisible.
    eps_out: float = 1e-3
    eps_sun: float = 1e-3

    # dark_mul maps full occlusion to minimum brightness.
    # A non-zero floor preserves readability and reduces banding in LDR shading.
    dark_mul: float = 0.20

def build_world_faces(
    blocks: Iterable[tuple[int, int, int, str]],
    uv_lookup: UVLookup,
    sun_dir: Vec3,
    shadow_dark_mul: float,
    enable_occlusion: bool = True,
    params: FaceBakeParams | None = None,
) -> list[list[BlockInstanceGPU]]:
    p = params or FaceBakeParams(dark_mul=float(shadow_dark_mul))

    b_list = list(blocks)
    coords = {(int(x), int(y), int(z)) for (x, y, z, _bid) in b_list}

    sdir = sun_dir.normalized()

    faces: list[list[BlockInstanceGPU]] = [[], [], [], [], [], []]

    for (x, y, z, bid) in b_list:
        x = int(x)
        y = int(y)
        z = int(z)

        # Instances translate by block center to match MeshBuffer's unit cube and quad conventions.
        base_x = float(x) + 0.5
        base_y = float(y) + 0.5
        base_z = float(z) + 0.5

        if (x + 1, y, z) not in coords:
            u0, v0, u1, v1 = uv_lookup(str(bid), 0)
            sh = _face_shadow_mul(0, x, y, z, coords, sdir, p) if enable_occlusion else 1.0
            faces[0].append(BlockInstanceGPU(base_x, base_y, base_z, u0, v0, u1, v1, float(sh)))

        if (x - 1, y, z) not in coords:
            u0, v0, u1, v1 = uv_lookup(str(bid), 1)
            sh = _face_shadow_mul(1, x, y, z, coords, sdir, p) if enable_occlusion else 1.0
            faces[1].append(BlockInstanceGPU(base_x, base_y, base_z, u0, v0, u1, v1, float(sh)))

        if (x, y + 1, z) not in coords:
            u0, v0, u1, v1 = uv_lookup(str(bid), 2)
            sh = _face_shadow_mul(2, x, y, z, coords, sdir, p) if enable_occlusion else 1.0
            faces[2].append(BlockInstanceGPU(base_x, base_y, base_z, u0, v0, u1, v1, float(sh)))

        if (x, y - 1, z) not in coords:
            u0, v0, u1, v1 = uv_lookup(str(bid), 3)
            sh = _face_shadow_mul(3, x, y, z, coords, sdir, p) if enable_occlusion else 1.0
            faces[3].append(BlockInstanceGPU(base_x, base_y, base_z, u0, v0, u1, v1, float(sh)))

        if (x, y, z + 1) not in coords:
            u0, v0, u1, v1 = uv_lookup(str(bid), 4)
            sh = _face_shadow_mul(4, x, y, z, coords, sdir, p) if enable_occlusion else 1.0
            faces[4].append(BlockInstanceGPU(base_x, base_y, base_z, u0, v0, u1, v1, float(sh)))

        if (x, y, z - 1) not in coords:
            u0, v0, u1, v1 = uv_lookup(str(bid), 5)
            sh = _face_shadow_mul(5, x, y, z, coords, sdir, p) if enable_occlusion else 1.0
            faces[5].append(BlockInstanceGPU(base_x, base_y, base_z, u0, v0, u1, v1, float(sh)))

    return faces

def _face_frame(face_idx: int, x: int, y: int, z: int) -> tuple[Vec3, Vec3, Vec3, Vec3]:
    # The frame provides a face center, outward normal, and two orthogonal tangents on the face plane.
    cx = float(x) + 0.5
    cy = float(y) + 0.5
    cz = float(z) + 0.5

    if face_idx == 0:
        c = Vec3(float(x) + 1.0, cy, cz)
        n = Vec3(1.0, 0.0, 0.0)
        t1 = Vec3(0.0, 1.0, 0.0)
        t2 = Vec3(0.0, 0.0, 1.0)
        return c, n, t1, t2

    if face_idx == 1:
        c = Vec3(float(x) + 0.0, cy, cz)
        n = Vec3(-1.0, 0.0, 0.0)
        t1 = Vec3(0.0, 1.0, 0.0)
        t2 = Vec3(0.0, 0.0, 1.0)
        return c, n, t1, t2

    if face_idx == 2:
        c = Vec3(cx, float(y) + 1.0, cz)
        n = Vec3(0.0, 1.0, 0.0)
        t1 = Vec3(1.0, 0.0, 0.0)
        t2 = Vec3(0.0, 0.0, 1.0)
        return c, n, t1, t2

    if face_idx == 3:
        c = Vec3(cx, float(y) + 0.0, cz)
        n = Vec3(0.0, -1.0, 0.0)
        t1 = Vec3(1.0, 0.0, 0.0)
        t2 = Vec3(0.0, 0.0, 1.0)
        return c, n, t1, t2

    if face_idx == 4:
        c = Vec3(cx, cy, float(z) + 1.0)
        n = Vec3(0.0, 0.0, 1.0)
        t1 = Vec3(1.0, 0.0, 0.0)
        t2 = Vec3(0.0, 1.0, 0.0)
        return c, n, t1, t2

    c = Vec3(cx, cy, float(z) + 0.0)
    n = Vec3(0.0, 0.0, -1.0)
    t1 = Vec3(1.0, 0.0, 0.0)
    t2 = Vec3(0.0, 1.0, 0.0)
    return c, n, t1, t2

def _ray_hits_block(
    origin: Vec3,
    direction: Vec3,
    blocks: set[tuple[int, int, int]],
    self_block: tuple[int, int, int],
    t_max: float,
) -> bool:
    # DDA traversal is used because it matches the discrete structure of voxel occupancy.
    # It yields robust "first hit" behavior without requiring floating AABB slab intersection per block.
    for hit in dda_grid_traverse(origin=origin, direction=direction, t_max=float(t_max), cell_size=1.0):
        k = (int(hit.cell_x), int(hit.cell_y), int(hit.cell_z))
        if k == self_block:
            continue
        if k in blocks:
            return True
    return False

def _face_shadow_mul(
    face_idx: int,
    x: int,
    y: int,
    z: int,
    blocks: set[tuple[int, int, int]],
    sun_dir: Vec3,
    params: FaceBakeParams,
) -> float:
    c, n, t1, t2 = _face_frame(face_idx, x, y, z)

    ndl = n.dot(sun_dir)
    if ndl <= 1e-6:
        # 1e-6 is used as a float32-safe threshold to avoid noise at nearly grazing angles.
        return 1.0

    self_block = (int(x), int(y), int(z))

    s = float(params.sample_spread)
    samples = [
        (0.0, 0.0),
        (-s, -s),
        (-s, s),
        (s, -s),
        (s, s),
    ]

    occ = 0.0
    for a, b in samples:
        p = c + (t1 * float(a)) + (t2 * float(b))
        o = p + (n * float(params.eps_out)) + (sun_dir * float(params.eps_sun))
        if _ray_hits_block(origin=o, direction=sun_dir, blocks=blocks, self_block=self_block, t_max=float(params.t_max)):
            occ += 1.0

    occ /= float(len(samples))

    dark_mul = float(max(0.0, min(1.0, float(params.dark_mul))))
    return 1.0 - occ * (1.0 - dark_mul)