// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

#[inline]
fn mix64(value: u64) -> u64 {
  let mut z = value.wrapping_add(0x9E3779B97F4A7C15);
  z = (z ^ (z >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
  z = (z ^ (z >> 27)).wrapping_mul(0x94D049BB133111EB);
  z ^ (z >> 31)
}

#[inline]
pub fn hash_u64(seed: i64, channel: u64, a: i64, b: i64, c: i64) -> u64 {
  let mut v = seed as u64;
  v ^= channel.wrapping_mul(0x9E3779B97F4A7C15);
  v = mix64(v ^ (a as u64).wrapping_mul(0xBF58476D1CE4E5B9));
  v = mix64(v ^ (b as u64).wrapping_mul(0x94D049BB133111EB));
  v = mix64(v ^ (c as u64).wrapping_mul(0xD6E8FEB86659FD93));
  v
}

#[inline]
fn lattice_value(seed: i64, channel: u64, a: i64, b: i64, c: i64) -> f64 {
  let h = hash_u64(seed, channel, a, b, c);
  ((h >> 11) as f64) * (2.0 / 9007199254740992.0) - 1.0
}

#[inline]
pub fn smoothstep(t: f64) -> f64 {
  t * t * (3.0 - 2.0 * t)
}

pub fn value_noise_2d(seed: i64, channel: u64, x: f64, z: f64, scale: f64) -> f64 {
  let fx = x / scale;
  let fz = z / scale;
  let x0 = fx.floor();
  let z0 = fz.floor();
  let tx = fx - x0;
  let tz = fz - z0;
  let sx = smoothstep(tx);
  let sz = smoothstep(tz);
  let xi = x0 as i64;
  let zi = z0 as i64;
  let n00 = lattice_value(seed, channel, xi, zi, 0);
  let n10 = lattice_value(seed, channel, xi + 1, zi, 0);
  let n01 = lattice_value(seed, channel, xi, zi + 1, 0);
  let n11 = lattice_value(seed, channel, xi + 1, zi + 1, 0);
  let nx0 = n00 + (n10 - n00) * sx;
  let nx1 = n01 + (n11 - n01) * sx;
  nx0 + (nx1 - nx0) * sz
}

pub fn value_noise_3d(seed: i64, channel: u64, x: f64, y: f64, z: f64, scale: f64) -> f64 {
  let fx = x / scale;
  let fy = y / scale;
  let fz = z / scale;
  let x0 = fx.floor();
  let y0 = fy.floor();
  let z0 = fz.floor();
  let tx = fx - x0;
  let ty = fy - y0;
  let tz = fz - z0;
  let sx = smoothstep(tx);
  let sy = smoothstep(ty);
  let sz = smoothstep(tz);
  let xi = x0 as i64;
  let yi = y0 as i64;
  let zi = z0 as i64;
  let n000 = lattice_value(seed, channel, xi, zi, yi);
  let n100 = lattice_value(seed, channel, xi + 1, zi, yi);
  let n010 = lattice_value(seed, channel, xi, zi + 1, yi);
  let n110 = lattice_value(seed, channel, xi + 1, zi + 1, yi);
  let n001 = lattice_value(seed, channel, xi, zi, yi + 1);
  let n101 = lattice_value(seed, channel, xi + 1, zi, yi + 1);
  let n011 = lattice_value(seed, channel, xi, zi + 1, yi + 1);
  let n111 = lattice_value(seed, channel, xi + 1, zi + 1, yi + 1);
  let nx00 = n000 + (n100 - n000) * sx;
  let nx10 = n010 + (n110 - n010) * sx;
  let nx01 = n001 + (n101 - n001) * sx;
  let nx11 = n011 + (n111 - n011) * sx;
  let nxy0 = nx00 + (nx10 - nx00) * sz;
  let nxy1 = nx01 + (nx11 - nx01) * sz;
  nxy0 + (nxy1 - nxy0) * sy
}
