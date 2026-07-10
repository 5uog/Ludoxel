// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

// 4x4 row-major matrix construction and composition, ported from the Python
// fallbacks in src/ludoxel/foundations/mathematics/linear/mat4.py and
// linear/transform_matrices.py. All matrices are [f32; 16] in row-major
// order (index = row * 4 + col), matching `m[row, col]` in the numpy
// fallback and the byte layout the frustum clip test already expects.

pub type Mat4 = [f32; 16];

pub fn identity() -> Mat4 {
  let mut m = [0f32; 16];
  m[0] = 1.0;
  m[5] = 1.0;
  m[10] = 1.0;
  m[15] = 1.0;
  m
}

pub fn perspective(fov_y_deg: f32, aspect: f32, z_near: f32, z_far: f32) -> Mat4 {
  let f = 1.0 / (fov_y_deg.to_radians() * 0.5).tan();
  let mut m = [0f32; 16];
  m[0] = f / aspect.max(1e-9);
  m[5] = f;
  m[10] = (z_far + z_near) / (z_near - z_far);
  m[11] = (2.0 * z_far * z_near) / (z_near - z_far);
  m[14] = -1.0;
  m
}

pub fn ortho(left: f32, right: f32, bottom: f32, top: f32, z_near: f32, z_far: f32) -> Mat4 {
  let mut m = [0f32; 16];
  let rl = (right - left).max(1e-9);
  let tb = (top - bottom).max(1e-9);
  let fn_ = (z_far - z_near).max(1e-9);

  m[0] = 2.0 / rl;
  m[5] = 2.0 / tb;
  m[10] = -2.0 / fn_;
  m[15] = 1.0;

  m[3] = -(right + left) / rl;
  m[7] = -(top + bottom) / tb;
  m[11] = -(z_far + z_near) / fn_;
  m
}

fn normalize3(x: f32, y: f32, z: f32) -> (f32, f32, f32) {
  let n = (x * x + y * y + z * z).sqrt();
  if n <= 1e-12 {
    return (0.0, 0.0, 0.0);
  }
  let inv = 1.0 / n;
  (x * inv, y * inv, z * inv)
}

fn cross(ax: f32, ay: f32, az: f32, bx: f32, by: f32, bz: f32) -> (f32, f32, f32) {
  (ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx)
}

fn dot3(ax: f32, ay: f32, az: f32, bx: f32, by: f32, bz: f32) -> f32 {
  ax * bx + ay * by + az * bz
}

#[allow(clippy::too_many_arguments)]
pub fn look_dir(ex: f32, ey: f32, ez: f32, fx: f32, fy: f32, fz: f32, upx: f32, upy: f32, upz: f32) -> Mat4 {
  let (fx, fy, fz) = normalize3(fx, fy, fz);
  let (rx0, ry0, rz0) = cross(upx, upy, upz, fx, fy, fz);
  let (rx, ry, rz) = normalize3(rx0, ry0, rz0);
  let (ux0, uy0, uz0) = cross(fx, fy, fz, rx, ry, rz);
  let (ux, uy, uz) = normalize3(ux0, uy0, uz0);

  let mut m = identity();
  m[0] = rx;
  m[1] = ry;
  m[2] = rz;
  m[4] = ux;
  m[5] = uy;
  m[6] = uz;
  m[8] = -fx;
  m[9] = -fy;
  m[10] = -fz;

  m[3] = -dot3(rx, ry, rz, ex, ey, ez);
  m[7] = -dot3(ux, uy, uz, ex, ey, ez);
  m[11] = dot3(fx, fy, fz, ex, ey, ez);
  m
}

pub fn mul(a: &Mat4, b: &Mat4) -> Mat4 {
  let mut out = [0f32; 16];
  for row in 0..4 {
    for col in 0..4 {
      let mut acc = 0f32;
      for k in 0..4 {
        acc += a[row * 4 + k] * b[k * 4 + col];
      }
      out[row * 4 + col] = acc;
    }
  }
  out
}

pub fn translate(x: f32, y: f32, z: f32) -> Mat4 {
  let mut m = identity();
  m[3] = x;
  m[7] = y;
  m[11] = z;
  m
}

pub fn scale(x: f32, y: f32, z: f32) -> Mat4 {
  let mut m = identity();
  m[0] = x;
  m[5] = y;
  m[10] = z;
  m
}

pub fn rotate_x_rad(rad: f32) -> Mat4 {
  let mut m = identity();
  let (s, c) = rad.sin_cos();
  m[5] = c;
  m[6] = -s;
  m[9] = s;
  m[10] = c;
  m
}

pub fn rotate_y_rad(rad: f32) -> Mat4 {
  let mut m = identity();
  let (s, c) = rad.sin_cos();
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  m
}

pub fn rotate_z_rad(rad: f32) -> Mat4 {
  let mut m = identity();
  let (s, c) = rad.sin_cos();
  m[0] = c;
  m[1] = -s;
  m[4] = s;
  m[5] = c;
  m
}

pub fn compose(matrices: &[Mat4]) -> Mat4 {
  let mut out = identity();
  for m in matrices {
    out = mul(&out, m);
  }
  out
}

pub fn to_bytes(m: &Mat4) -> Vec<u8> {
  let mut out = Vec::with_capacity(64);
  for value in m.iter() {
    out.extend_from_slice(&value.to_le_bytes());
  }
  out
}

pub fn from_bytes(bytes: &[u8]) -> Mat4 {
  let mut m = [0f32; 16];
  for (i, slot) in m.iter_mut().enumerate() {
    *slot = f32::from_le_bytes(bytes[i * 4..i * 4 + 4].try_into().unwrap());
  }
  m
}
