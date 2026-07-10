// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

// Camera/sun direction trigonometry, ported from the Python fallback in
// src/ludoxel/foundations/mathematics/linear/view_angles.py.

fn normalize3(x: f64, y: f64, z: f64) -> (f64, f64, f64) {
  let n = (x * x + y * y + z * z).sqrt();
  if n <= 1e-12 {
    return (0.0, 0.0, 0.0);
  }
  let inv = 1.0 / n;
  (x * inv, y * inv, z * inv)
}

pub fn forward_from_yaw_pitch_deg(yaw_deg: f64, pitch_deg: f64) -> (f64, f64, f64) {
  let yaw = yaw_deg.to_radians();
  let pitch = pitch_deg.to_radians();

  let cy = yaw.cos();
  let sy = yaw.sin();
  let cp = pitch.cos();
  let sp = pitch.sin();

  normalize3(-sy * cp, -sp, cy * cp)
}

pub fn yaw_pitch_deg_from_forward(x: f64, y: f64, z: f64) -> (f64, f64) {
  let (nx, ny, nz) = normalize3(x, y, z);
  let clamped_y = ny.clamp(-1.0, 1.0);
  let pitch_rad = -clamped_y.asin();
  let yaw_rad = (-nx).atan2(nz);
  (yaw_rad.to_degrees(), pitch_rad.to_degrees())
}

pub fn sun_dir_from_az_el_deg(azimuth_deg: f64, elevation_deg: f64) -> (f64, f64, f64) {
  let az = azimuth_deg.to_radians();
  let el = elevation_deg.to_radians();

  let x = el.cos() * az.sin();
  let y = el.sin();
  let z = el.cos() * az.cos();

  normalize3(x, y, z)
}
