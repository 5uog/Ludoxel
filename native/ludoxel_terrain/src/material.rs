// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

use crate::height::{ravine_depth, BEDROCK_Y, MODE_FLAT, MODE_STATIC};
use crate::noise::{hash_u64, value_noise_2d, value_noise_3d};

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
