// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

// Deterministic terrain mathematics. Every formula, constant, channel, and
// evaluation order mirrors src/ludoxel/simulation/worlds/generation/
// terrain_math.py; the Python fallback and this implementation must return
// identical values for identical inputs. All floating point math is f64.

pub const BEDROCK_Y: i64 = -65;
const MIN_CARVED_SURFACE_Y: i64 = BEDROCK_Y + 4;

const BASE_HEIGHT: f64 = 6.0;
const HEIGHT_OCTAVES: [(f64, f64); 4] = [(16.0, 192.0), (8.0, 96.0), (3.0, 36.0), (1.0, 16.0)];

const CHANNEL_HEIGHT_BASE: u64 = 1;
const CHANNEL_RAVINE: u64 = 101;
const CHANNEL_RAVINE_MASK: u64 = 102;
const CHANNEL_RAVINE_DEPTH: u64 = 103;
const CHANNEL_DEEPSLATE: u64 = 120;
const CHANNEL_DIRT_DEPTH: u64 = 130;
const CHANNEL_DIRT_MIX: u64 = 131;
const CHANNEL_DIRT_PATCH: u64 = 132;
const CHANNEL_STONE_A: u64 = 140;
const CHANNEL_STONE_B: u64 = 141;
const CHANNEL_ORE_GATE: u64 = 150;
const CHANNEL_EMERALD: u64 = 151;
const CHANNEL_ORE_COAL: u64 = 160;
const CHANNEL_ORE_COPPER: u64 = 161;
const CHANNEL_ORE_IRON: u64 = 162;
const CHANNEL_ORE_GOLD: u64 = 163;
const CHANNEL_ORE_REDSTONE: u64 = 164;
const CHANNEL_ORE_LAPIS: u64 = 165;
const CHANNEL_ORE_DIAMOND: u64 = 166;

const RAVINE_EDGE: f64 = 0.075;
const RAVINE_MASK_MIN: f64 = 0.05;
const RAVINE_SCALE: f64 = 110.0;
const RAVINE_MASK_SCALE: f64 = 260.0;
const RAVINE_DEPTH_SCALE: f64 = 90.0;

const MATERIAL_AIR: u8 = 0;
const MATERIAL_BEDROCK: u8 = 1;
const MATERIAL_GRASS: u8 = 2;
const MATERIAL_DIRT: u8 = 3;
const MATERIAL_COARSE_DIRT: u8 = 4;
const MATERIAL_GRAVEL: u8 = 5;
const MATERIAL_STONE: u8 = 6;
const MATERIAL_ANDESITE: u8 = 7;
const MATERIAL_GRANITE: u8 = 8;
const MATERIAL_DIORITE: u8 = 9;
const MATERIAL_TUFF: u8 = 10;
const MATERIAL_DEEPSLATE: u8 = 11;
const MATERIAL_COAL_ORE: u8 = 12;
const MATERIAL_COPPER_ORE: u8 = 13;
const MATERIAL_IRON_ORE: u8 = 14;
const MATERIAL_GOLD_ORE: u8 = 15;
const MATERIAL_REDSTONE_ORE: u8 = 16;
const MATERIAL_LAPIS_ORE: u8 = 17;
const MATERIAL_DIAMOND_ORE: u8 = 18;
const MATERIAL_EMERALD_ORE: u8 = 19;
const DEEPSLATE_ORE_OFFSET: u8 = 8;

pub const MODE_STATIC: u32 = 0;
pub const MODE_NORMAL: u32 = 1;
pub const MODE_FLAT: u32 = 2;

#[inline]
fn mix64(value: u64) -> u64 {
  let mut z = value.wrapping_add(0x9E3779B97F4A7C15);
  z = (z ^ (z >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
  z = (z ^ (z >> 27)).wrapping_mul(0x94D049BB133111EB);
  z ^ (z >> 31)
}

#[inline]
fn hash_u64(seed: i64, channel: u64, a: i64, b: i64, c: i64) -> u64 {
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
fn smoothstep(t: f64) -> f64 {
  t * t * (3.0 - 2.0 * t)
}

fn value_noise_2d(seed: i64, channel: u64, x: f64, z: f64, scale: f64) -> f64 {
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

fn value_noise_3d(seed: i64, channel: u64, x: f64, y: f64, z: f64, scale: f64) -> f64 {
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

fn raw_surface_height(seed: i64, x: i64, z: i64) -> f64 {
  let mut total = BASE_HEIGHT;
  let mut channel = CHANNEL_HEIGHT_BASE;
  for (amplitude, wavelength) in HEIGHT_OCTAVES.iter() {
    total += amplitude * value_noise_2d(seed, channel, x as f64, z as f64, *wavelength);
    channel += 1;
  }
  total
}

fn ravine_depth(seed: i64, x: i64, z: i64) -> f64 {
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

fn stone_material(seed: i64, x: i64, y: i64, z: i64, deepslate: bool) -> u8 {
  if deepslate {
    return MATERIAL_DEEPSLATE;
  }
  let v1 = value_noise_3d(seed, CHANNEL_STONE_A, x as f64, y as f64, z as f64, 34.0);
  if v1 > 0.52 {
    return MATERIAL_ANDESITE;
  }
  if v1 < -0.52 {
    return MATERIAL_GRANITE;
  }
  let v2 = value_noise_3d(seed, CHANNEL_STONE_B, x as f64, y as f64, z as f64, 23.0);
  if v2 > 0.55 {
    return MATERIAL_DIORITE;
  }
  if v2 < -0.55 {
    return MATERIAL_TUFF;
  }
  MATERIAL_STONE
}

fn ore_material(seed: i64, x: i64, y: i64, z: i64, deepslate: bool) -> u8 {
  let gate = hash_u64(seed, CHANNEL_ORE_GATE, x, z, y) % 1000;
  let mut ore: u8 = 0;
  if gate < 350 {
    if y <= -40 && value_noise_3d(seed, CHANNEL_ORE_DIAMOND, x as f64, y as f64, z as f64, 10.0) > 0.78 {
      ore = MATERIAL_DIAMOND_ORE;
    } else if (-64..=-8).contains(&y) && value_noise_3d(seed, CHANNEL_ORE_GOLD, x as f64, y as f64, z as f64, 12.0) > 0.72 {
      ore = MATERIAL_GOLD_ORE;
    } else if (-64..=-16).contains(&y) && value_noise_3d(seed, CHANNEL_ORE_REDSTONE, x as f64, y as f64, z as f64, 12.0) > 0.72 {
      ore = MATERIAL_REDSTONE_ORE;
    } else if (-64..=-16).contains(&y) && value_noise_3d(seed, CHANNEL_ORE_LAPIS, x as f64, y as f64, z as f64, 12.0) > 0.74 {
      ore = MATERIAL_LAPIS_ORE;
    } else if y <= 20 && value_noise_3d(seed, CHANNEL_ORE_IRON, x as f64, y as f64, z as f64, 14.0) > 0.66 {
      ore = MATERIAL_IRON_ORE;
    } else if y >= -16 && value_noise_3d(seed, CHANNEL_ORE_COPPER, x as f64, y as f64, z as f64, 14.0) > 0.66 {
      ore = MATERIAL_COPPER_ORE;
    } else if value_noise_3d(seed, CHANNEL_ORE_COAL, x as f64, y as f64, z as f64, 16.0) > 0.62 {
      ore = MATERIAL_COAL_ORE;
    }
  }
  if ore == 0 && y >= 0 && hash_u64(seed, CHANNEL_EMERALD, x, z, y) % 4000 == 0 {
    ore = MATERIAL_EMERALD_ORE;
  }
  if ore == 0 {
    return 0;
  }
  if deepslate {
    return ore + DEEPSLATE_ORE_OFFSET;
  }
  ore
}

pub fn material_code(seed: i64, _version: u32, mode: u32, flat_ground_y: i32, x: i64, y: i64, z: i64, column_height: i64) -> u8 {
  if mode == MODE_STATIC {
    return MATERIAL_AIR;
  }
  if mode == MODE_FLAT {
    if y == flat_ground_y as i64 {
      return MATERIAL_GRASS;
    }
    return MATERIAL_AIR;
  }
  if y < BEDROCK_Y {
    return MATERIAL_AIR;
  }
  if y == BEDROCK_Y {
    return MATERIAL_BEDROCK;
  }
  let h = column_height;
  if y > h {
    return MATERIAL_AIR;
  }
  let in_ravine = ravine_depth(seed, x, z) > 0.5;
  let deepslate_boundary = -28.0 + 5.0 * value_noise_2d(seed, CHANNEL_DEEPSLATE, x as f64, z as f64, 60.0);
  let deepslate = (y as f64) < deepslate_boundary;
  let depth = h - y;
  if depth == 0 {
    if in_ravine {
      return if deepslate { MATERIAL_DEEPSLATE } else { MATERIAL_STONE };
    }
    return MATERIAL_GRASS;
  }
  if !in_ravine {
    let dirt_depth = 2 + (hash_u64(seed, CHANNEL_DIRT_DEPTH, x, z, 0) % 2) as i64;
    if depth <= dirt_depth {
      let patch = value_noise_2d(seed, CHANNEL_DIRT_PATCH, x as f64, z as f64, 24.0);
      let roll = (hash_u64(seed, CHANNEL_DIRT_MIX, x, z, y) % 100) as i64;
      if patch > 0.45 {
        return if roll < 60 { MATERIAL_GRAVEL } else { MATERIAL_DIRT };
      }
      if patch < -0.45 {
        return if roll < 60 { MATERIAL_COARSE_DIRT } else { MATERIAL_DIRT };
      }
      if roll < 70 {
        return MATERIAL_DIRT;
      }
      if roll < 85 {
        return MATERIAL_COARSE_DIRT;
      }
      return MATERIAL_GRAVEL;
    }
  }
  if depth >= 4 {
    let ore = ore_material(seed, x, y, z, deepslate);
    if ore != 0 {
      return ore;
    }
  }
  stone_material(seed, x, y, z, deepslate)
}
