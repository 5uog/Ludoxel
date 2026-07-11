# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics._native import native_module
from ludoxel.foundations.mathematics.geometry import ray_aabb as _fallback
from ludoxel.foundations.mathematics.geometry.aabb import AABB
from ludoxel.foundations.mathematics.geometry.ray import Ray
from ludoxel.foundations.mathematics.geometry.ray_aabb import RayHitFace
from ludoxel.foundations.mathematics.linear.vec3 import Vec3


def ray_aabb_face(ray: Ray, aabb: AABB) -> RayHitFace | None:
  if native_module is None:
    return _fallback.ray_aabb_face(ray, aabb)

  hit = native_module.ray_aabb_face(ray.origin.x, ray.origin.y, ray.origin.z, ray.direction.x, ray.direction.y, ray.direction.z, aabb.mn.x, aabb.mn.y, aabb.mn.z, aabb.mx.x, aabb.mx.y, aabb.mx.z)
  if hit is None:
    return None

  t_enter, px, py, pz, face = hit
  return RayHitFace(t_enter=float(t_enter), point=Vec3(float(px), float(py), float(pz)), face=int(face))
