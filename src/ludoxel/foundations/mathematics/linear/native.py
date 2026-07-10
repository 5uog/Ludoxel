# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import numpy as np

from ludoxel.foundations.mathematics._native import native_module
from ludoxel.foundations.mathematics.linear import mat4 as _mat4_fallback, transform_matrices as _transform_fallback, view_angles as _view_angles_fallback
from ludoxel.foundations.mathematics.linear.vec3 import Vec3

# --- view angles ---


def forward_from_yaw_pitch_deg(yaw_deg: float, pitch_deg: float) -> Vec3:
  if native_module is None:
    return _view_angles_fallback.forward_from_yaw_pitch_deg(yaw_deg, pitch_deg)
  x, y, z = native_module.forward_from_yaw_pitch_deg(float(yaw_deg), float(pitch_deg))
  return Vec3(float(x), float(y), float(z))


def yaw_pitch_deg_from_forward(forward: Vec3) -> tuple[float, float]:
  if native_module is None:
    return _view_angles_fallback.yaw_pitch_deg_from_forward(forward)
  yaw_deg, pitch_deg = native_module.yaw_pitch_deg_from_forward(forward.x, forward.y, forward.z)
  return (float(yaw_deg), float(pitch_deg))


def sun_dir_from_az_el_deg(azimuth_deg: float, elevation_deg: float) -> Vec3:
  if native_module is None:
    return _view_angles_fallback.sun_dir_from_az_el_deg(azimuth_deg, elevation_deg)
  x, y, z = native_module.sun_dir_from_az_el_deg(float(azimuth_deg), float(elevation_deg))
  return Vec3(float(x), float(y), float(z))


# --- mat4 / transform_matrices ---
# Every matrix crossing the native boundary is 16 little-endian float32
# values in row-major order (index = row * 4 + col), unpacked into the same
# (4, 4) float32 numpy layout the pure Python fallback returns.


def _matrix_from_bytes(raw: bytes) -> np.ndarray:
  return np.frombuffer(raw, dtype="<f4").reshape((4, 4)).copy()


def _matrix_to_bytes(matrix: np.ndarray) -> bytes:
  return np.ascontiguousarray(matrix, dtype="<f4").tobytes()


def identity() -> np.ndarray:
  if native_module is None:
    return _mat4_fallback.identity()
  return _matrix_from_bytes(native_module.mat4_identity())


def perspective(fov_y_deg: float, aspect: float, z_near: float, z_far: float) -> np.ndarray:
  if native_module is None:
    return _mat4_fallback.perspective(fov_y_deg, aspect, z_near, z_far)
  return _matrix_from_bytes(native_module.mat4_perspective(float(fov_y_deg), float(aspect), float(z_near), float(z_far)))


def ortho(left: float, right: float, bottom: float, top: float, z_near: float, z_far: float) -> np.ndarray:
  if native_module is None:
    return _mat4_fallback.ortho(left, right, bottom, top, z_near, z_far)
  return _matrix_from_bytes(native_module.mat4_ortho(float(left), float(right), float(bottom), float(top), float(z_near), float(z_far)))


def look_dir(eye: Vec3, forward: Vec3, up_hint: Vec3 = Vec3(0.0, 1.0, 0.0)) -> np.ndarray:
  if native_module is None:
    return _mat4_fallback.look_dir(eye, forward, up_hint)
  return _matrix_from_bytes(native_module.mat4_look_dir(eye.x, eye.y, eye.z, forward.x, forward.y, forward.z, up_hint.x, up_hint.y, up_hint.z))


def mul(a: np.ndarray, b: np.ndarray) -> np.ndarray:
  if native_module is None:
    return _mat4_fallback.mul(a, b)
  return _matrix_from_bytes(native_module.mat4_mul(_matrix_to_bytes(a), _matrix_to_bytes(b)))


def identity_matrix() -> np.ndarray:
  if native_module is None:
    return _transform_fallback.identity_matrix()
  return _matrix_from_bytes(native_module.mat4_identity())


def translate_matrix(x: float, y: float, z: float) -> np.ndarray:
  if native_module is None:
    return _transform_fallback.translate_matrix(x, y, z)
  return _matrix_from_bytes(native_module.mat4_translate(float(x), float(y), float(z)))


def scale_matrix(x: float, y: float, z: float) -> np.ndarray:
  if native_module is None:
    return _transform_fallback.scale_matrix(x, y, z)
  return _matrix_from_bytes(native_module.mat4_scale(float(x), float(y), float(z)))


def rotate_x_rad_matrix(rad: float) -> np.ndarray:
  if native_module is None:
    return _transform_fallback.rotate_x_rad_matrix(rad)
  return _matrix_from_bytes(native_module.mat4_rotate_x_rad(float(rad)))


def rotate_y_rad_matrix(rad: float) -> np.ndarray:
  if native_module is None:
    return _transform_fallback.rotate_y_rad_matrix(rad)
  return _matrix_from_bytes(native_module.mat4_rotate_y_rad(float(rad)))


def rotate_z_rad_matrix(rad: float) -> np.ndarray:
  if native_module is None:
    return _transform_fallback.rotate_z_rad_matrix(rad)
  return _matrix_from_bytes(native_module.mat4_rotate_z_rad(float(rad)))


def rotate_x_deg_matrix(deg: float) -> np.ndarray:
  return rotate_x_rad_matrix(np.radians(float(deg)))


def rotate_y_deg_matrix(deg: float) -> np.ndarray:
  return rotate_y_rad_matrix(np.radians(float(deg)))


def rotate_z_deg_matrix(deg: float) -> np.ndarray:
  return rotate_z_rad_matrix(np.radians(float(deg)))


def compose_matrices(*matrices: np.ndarray) -> np.ndarray:
  if native_module is None:
    return _transform_fallback.compose_matrices(*matrices)
  if len(matrices) == 0:
    return identity_matrix()
  packed = b"".join(_matrix_to_bytes(m) for m in matrices)
  return _matrix_from_bytes(native_module.mat4_compose(packed, len(matrices)))
