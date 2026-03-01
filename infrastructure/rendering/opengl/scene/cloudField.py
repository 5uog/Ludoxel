# FILE: infrastructure/rendering/opengl/scene/cloudField.py
from __future__ import annotations

import math
from dataclasses import dataclass

from core.math.vec3 import Vec3
from ..glRendererParams import CloudParams

@dataclass(frozen=True)
class CloudBox:
    center: Vec3
    size: Vec3
    alpha_mul: float

@dataclass(frozen=True)
class _RectXZ:
    min_x: int
    max_x: int  # exclusive
    min_z: int
    max_z: int  # exclusive

class CloudField:
    def __init__(self, cfg: CloudParams) -> None:
        self._cfg = cfg

        # The anchor key is expressed in macro-cell coordinates.
        # This choice turns "small camera motion" into a no-op for generation, which is essential for
        # stable frame time. The macro cell size is a tuning knob: larger values reduce rebuild rate at the
        # cost of more boxes per rebuild, while smaller values increase rebuild frequency.
        self._anchor_key: tuple[int, int] | None = None
        self._boxes_cache: list[CloudBox] = []

    def shift(self, t_seconds: float) -> Vec3:
        # The shift is continuous, which prevents stepping artifacts in motion.
        # The speed defaults are intentionally sub-unit per second so that parallax remains subtle and does
        # not compete with gameplay motion cues.
        sx = float(t_seconds) * float(self._cfg.speed_x)
        sz = float(t_seconds) * float(self._cfg.speed_z)
        return Vec3(sx, 0.0, sz)

    def ensure_cache(self, eye: Vec3, shift: Vec3) -> None:
        # Cache generation is done in pattern space, so shift is subtracted to obtain a stable "camera in
        # pattern coordinates". This ensures animation does not invalidate the cache.
        px = float(eye.x) - float(shift.x)
        pz = float(eye.z) - float(shift.z)

        m = int(self._cfg.macro)
        ax = self._floor_div(int(math.floor(px)), m)
        az = self._floor_div(int(math.floor(pz)), m)
        key = (ax, az)

        if self._anchor_key == key:
            return

        self._anchor_key = key
        self._boxes_cache = self._build_cloud_boxes(anchor_mx=ax, anchor_mz=az)

    def visible_boxes(
        self,
        eye: Vec3,
        shift: Vec3,
        forward: Vec3,
        fov_deg: float,
        aspect: float,
        z_far: float,
    ) -> list[CloudBox]:
        self.ensure_cache(eye=eye, shift=shift)

        # The camera basis is reconstructed from forward and a world-up hint.
        # This matches a typical FPS camera and avoids depending on external matrix code for culling.
        up_hint = Vec3(0.0, 1.0, 0.0)
        right = up_hint.cross(forward).normalized()
        up = forward.cross(right).normalized()

        # tan(fov/2) is the standard slope representation of frustum planes.
        # float(aspect) is clamped to avoid division by extremely small values during window resize.
        tan_y = math.tan(math.radians(float(fov_deg)) * 0.5)
        tan_x = tan_y * max(float(aspect), 1e-6)

        out: list[CloudBox] = []
        for b in self._boxes_cache:
            c_world = Vec3(b.center.x + shift.x, b.center.y, b.center.z + shift.z)

            # A sphere bound is chosen because it is rotation-invariant and cheap.
            # The radius is derived from half-extents, which is conservative for axis-aligned boxes.
            hx = b.size.x * 0.5
            hy = b.size.y * 0.5
            hz = b.size.z * 0.5
            r = math.sqrt(hx * hx + hy * hy + hz * hz)

            v = c_world - eye
            z = v.dot(forward)

            if z <= 0.0:
                continue
            if z - r > float(z_far):
                continue

            x = v.dot(right)
            y = v.dot(up)

            if abs(x) > (z * tan_x + r):
                continue
            if abs(y) > (z * tan_y + r):
                continue

            out.append(b)

        return out

    def _build_cloud_boxes(self, anchor_mx: int, anchor_mz: int) -> list[CloudBox]:
        # The view radius is expressed in world units and converted to macro-cell span.
        # The "+1" margin is a stability hack that reduces popping at cache boundaries.
        m = int(self._cfg.macro)
        R = int(self._cfg.view_radius)

        span = int(math.ceil(float(R) / float(m))) + 1

        # thickness is small because the goal is a "hint" rather than dense volume.
        # A value around 3 blocks reads as volumetric without causing excessive occlusion.
        size_y = float(max(1, int(self._cfg.thickness)))

        boxes: list[CloudBox] = []
        for mx in range(anchor_mx - span, anchor_mx + span + 1):
            for mz in range(anchor_mz - span, anchor_mz + span + 1):
                accepted: list[_RectXZ] = []

                # candidates_per_cell bounds CPU work. The default is small because each candidate performs
                # overlap tests, and the pass does not need dense complexity to look plausible.
                for i in range(int(self._cfg.candidates_per_cell)):
                    r_keep = self._hash3(mx, mz, i, int(self._cfg.seed) ^ 0x51ED270B)
                    if r_keep < float(self._cfg.candidate_drop_threshold):
                        continue

                    cx, cz, sx, sz = self._rect_params(mx, mz, i, m)

                    min_x = mx * m + (cx - sx)
                    max_x = mx * m + (cx + sx + 1)
                    min_z = mz * m + (cz - sz)
                    max_z = mz * m + (cz + sz + 1)

                    rect = _RectXZ(min_x=min_x, max_x=max_x, min_z=min_z, max_z=max_z)

                    # overlap_thresh prevents alpha accumulation and "flat sheets" of overdraw.
                    # The ratio is normalized by the smaller area to reject near-duplicates efficiently.
                    if self._overlaps_too_much(rect, accepted, thresh=float(self._cfg.overlap_thresh)):
                        continue

                    accepted.append(rect)
                    if len(accepted) >= int(self._cfg.rects_per_cell):
                        break

                for ridx, rect in enumerate(accepted):
                    size_x = float(rect.max_x - rect.min_x)
                    size_z = float(rect.max_z - rect.min_z)
                    bx = float(rect.min_x) + size_x * 0.5
                    bz = float(rect.min_z) + size_z * 0.5

                    # Lane offsets introduce discrete Y variation to reduce coplanar blending artifacts.
                    # Using exactly three lanes is a deliberate constraint: it is enough to break symmetry
                    # without producing complex depth layering that would demand sorting.
                    lane_r = self._hash3(mx, mz, ridx, int(self._cfg.seed) ^ 0xA24BAEDB)
                    lanes = self._cfg.lane_offsets
                    lane = lanes[0] if lane_r < 0.33 else (lanes[1] if lane_r < 0.66 else lanes[2])

                    y0 = float(int(self._cfg.y) + int(lane))
                    cy = y0 + size_y * 0.5

                    # alpha_mul slightly randomizes density perception.
                    # The range is intentionally narrow so the field remains visually coherent.
                    a = float(self._cfg.alpha_min) + float(self._cfg.alpha_range) * self._hash3(
                        mx, mz, ridx, int(self._cfg.seed) ^ 0xB5297A4D
                    )

                    boxes.append(
                        CloudBox(
                            center=Vec3(bx, cy, bz),
                            size=Vec3(size_x, size_y, size_z),
                            alpha_mul=float(a),
                        )
                    )

        return boxes

    def _rect_params(self, mx: int, mz: int, idx: int, m: int) -> tuple[int, int, int, int]:
        # The derived seed is decorrelated by multiplying idx with a large odd constant (golden-ratio mix).
        # This is a common technique to reduce visible patterns when reusing a single base seed.
        s = int(self._cfg.seed) ^ (idx * 0x9E3779B9)

        r1 = self._hash2(mx, mz, s ^ 0xD1B54A35)
        r2 = self._hash2(mx, mz, s ^ 0x94D049BB)
        r3 = self._hash2(mx, mz, s ^ 0xDEADBEEF)
        r4 = self._hash2(mx, mz, s ^ 0xBADC0FFE)

        # rect_margin keeps rectangles away from macro-cell boundaries to reduce seam visibility.
        # A margin around 5 blocks is large enough to prevent repeated edge clipping in typical FOV.
        margin = int(self._cfg.rect_margin)
        usable = max(1, m - 2 * margin)
        cx = margin + int(r1 * float(usable))
        cz = margin + int(r2 * float(usable))

        # rect_size_min and rect_size_range are tuned for "chunk-scale blobs".
        # Keeping the minimum above a few blocks avoids tiny speckles that read as noise rather than clouds.
        sx = int(self._cfg.rect_size_min) + int(r3 * float(self._cfg.rect_size_range))
        sz = int(self._cfg.rect_size_min) + int(r4 * float(self._cfg.rect_size_range))

        # The clamp below keeps rectangles within the macro cell.
        # The m>=6 guard avoids negative sizes when macro is configured very small for experimentation.
        if m >= 6:
            sx = min(sx, m // 2 - 1)
            sz = min(sz, m // 2 - 1)

        return (cx, cz, sx, sz)

    @staticmethod
    def _overlaps_too_much(r: _RectXZ, prev: list[_RectXZ], thresh: float) -> bool:
        ax0, ax1, az0, az1 = r.min_x, r.max_x, r.min_z, r.max_z
        a_area = max(0, ax1 - ax0) * max(0, az1 - az0)
        if a_area <= 0:
            return True

        for p in prev:
            bx0, bx1, bz0, bz1 = p.min_x, p.max_x, p.min_z, p.max_z
            ix0 = max(ax0, bx0)
            ix1 = min(ax1, bx1)
            iz0 = max(az0, bz0)
            iz1 = min(az1, bz1)
            inter = max(0, ix1 - ix0) * max(0, iz1 - iz0)
            if inter <= 0:
                continue

            b_area = max(0, bx1 - bx0) * max(0, bz1 - bz0)
            denom = float(min(a_area, b_area)) if b_area > 0 else float(a_area)
            if denom > 0 and (float(inter) / denom) > thresh:
                return True

        return False

    @staticmethod
    def _floor_div(a: int, b: int) -> int:
        return a // b

    @staticmethod
    def _hash_u32(n: int) -> int:
        # This avalanche mix is chosen for speed and determinism, not cryptographic strength.
        # The constants are standard "good mixers" used in integer hash literature; they disperse low-bit
        # structure to avoid visible grid-aligned artifacts in procedural placement.
        n &= 0xFFFFFFFF
        n ^= (n >> 16) & 0xFFFFFFFF
        n = (n * 0x7FEB352D) & 0xFFFFFFFF
        n ^= (n >> 15) & 0xFFFFFFFF
        n = (n * 0x846CA68B) & 0xFFFFFFFF
        n ^= (n >> 16) & 0xFFFFFFFF
        return n & 0xFFFFFFFF

    def _hash2(self, x: int, z: int, seed: int) -> float:
        n = (x * 374761393) ^ (z * 668265263) ^ (seed * 1442695041)
        u = self._hash_u32(n)
        return float(u) / 4294967295.0

    def _hash3(self, x: int, z: int, y: int, seed: int) -> float:
        n = (x * 374761393) ^ (z * 668265263) ^ (y * 2246822519) ^ (seed * 3266489917)
        u = self._hash_u32(n)
        return float(u) / 4294967295.0