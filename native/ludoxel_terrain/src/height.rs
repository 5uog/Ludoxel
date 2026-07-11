// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

use crate::noise::{smoothstep, value_noise_2d};

pub const BEDROCK_Y: i64 = -65;
const MIN_CARVED_SURFACE_Y: i64 = BEDROCK_Y + 4;

const BASE_HEIGHT: f64 = 6.0;
const HEIGHT_OCTAVES: [(f64, f64); 4] = [(16.0, 192.0), (8.0, 96.0), (3.0, 36.0), (1.0, 16.0)];

const CHANNEL_HEIGHT_BASE: u64 = 1;
const CHANNEL_RAVINE: u64 = 101;
const CHANNEL_RAVINE_MASK: u64 = 102;
const CHANNEL_RAVINE_DEPTH: u64 = 103;

const RAVINE_EDGE: f64 = 0.075;
const RAVINE_MASK_MIN: f64 = 0.05;
const RAVINE_SCALE: f64 = 110.0;
const RAVINE_MASK_SCALE: f64 = 260.0;
const RAVINE_DEPTH_SCALE: f64 = 90.0;

pub const MODE_STATIC: u32 = 0;
pub const MODE_NORMAL: u32 = 1;
pub const MODE_FLAT: u32 = 2;

fn raw_surface_height(seed: i64, x: i64, z: i64) -> f64 {
  let mut total = BASE_HEIGHT;
  let mut channel = CHANNEL_HEIGHT_BASE;
  for (amplitude, wavelength) in HEIGHT_OCTAVES.iter() {
    total += amplitude * value_noise_2d(seed, channel, x as f64, z as f64, *wavelength);
    channel += 1;
  }
  total
}

pub fn ravine_depth(seed: i64, x: i64, z: i64) -> f64 {
  let mask = value_noise_2d(seed, CHANNEL_RAVINE_MASK, x as f64, z as f64, RAVINE_MASK_SCALE);
  if mask <= RAVINE_MASK_MIN {
    return 0.0;
  }
  let ridge = value_noise_2d(seed, CHANNEL_RAVINE, x as f64, z as f64, RAVINE_SCALE);
  let distance = ridge.abs();
  if distance >= RAVINE_EDGE {
    return 0.0;
  }
  let t = 1.0 - distance / RAVINE_EDGE;
  let s = smoothstep(t);
  let mut depth_amp = 14.0 + 7.0 * value_noise_2d(seed, CHANNEL_RAVINE_DEPTH, x as f64, z as f64, RAVINE_DEPTH_SCALE);
  if depth_amp < 4.0 {
    depth_amp = 4.0;
  }
  s * depth_amp
}

pub fn surface_height(seed: i64, _version: u32, mode: u32, flat_ground_y: i32, x: i64, z: i64) -> i64 {
  if mode == MODE_FLAT {
    return flat_ground_y as i64;
  }
  if mode != MODE_NORMAL {
    return BEDROCK_Y - 1;
  }
  let raw = raw_surface_height(seed, x, z);
  let carved = raw - ravine_depth(seed, x, z);
  let mut h = carved.floor() as i64;
  if h < MIN_CARVED_SURFACE_Y {
    h = MIN_CARVED_SURFACE_Y;
  }
  h
}
