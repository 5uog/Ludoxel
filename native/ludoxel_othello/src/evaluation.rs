// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

use crate::bitboard::{adjacent_bits, bit_count, legal_moves_bitboard, BOARD_CELL_COUNT, CORNERS};

pub const WIN_SCORE: i64 = 1_000_000;
pub const LOSS_SCORE: i64 = -WIN_SCORE;

#[rustfmt::skip]
pub const POSITION_WEIGHTS: [i64; 64] = [
  120, -20, 20, 5, 5, 20, -20, 120,
  -20, -40, -5, -5, -5, -5, -40, -20,
  20, -5, 15, 3, 3, 15, -5, 20,
  5, -5, 3, 3, 3, 3, -5, 5,
  5, -5, 3, 3, 3, 3, -5, 5,
  20, -5, 15, 3, 3, 15, -5, 20,
  -20, -40, -5, -5, -5, -5, -40, -20,
  120, -20, 20, 5, 5, 20, -20, 120,
];

#[inline]
fn round_like_python(value: f64) -> i64 {
  value.round_ties_even() as i64
}

pub fn normalize_sacrifice_level(value: i64) -> i64 {
  value.clamp(0, 4)
}

fn evaluation_weights(sacrifice_level: i64) -> (f64, f64, f64, f64) {
  let normalized = (normalize_sacrifice_level(sacrifice_level) as f64) / 4.0;
  let disc_weight = 1.50 - 1.05 * normalized;
  let mobility_weight = 0.85 + 0.35 * normalized;
  let corner_weight = 0.95 + 0.15 * normalized;
  let frontier_weight = 0.90 + 0.40 * normalized;
  (disc_weight, mobility_weight, corner_weight, frontier_weight)
}

fn position_score(player: u64, opponent: u64) -> i64 {
  let mut score = 0i64;
  for (index, weight) in POSITION_WEIGHTS.iter().enumerate() {
    let mask = 1u64 << index;
    if (player & mask) != 0 {
      score += weight;
    } else if (opponent & mask) != 0 {
      score -= weight;
    }
  }
  score
}

fn corner_closeness_penalty(player: u64, opponent: u64) -> i64 {
  let corners: [(u32, [u32; 3]); 4] = [(0, [1, 8, 9]), (7, [6, 14, 15]), (56, [48, 49, 57]), (63, [54, 55, 62])];
  let mut score = 0i64;
  for (corner, adjacent) in corners.iter() {
    let corner_mask = 1u64 << corner;
    if ((player | opponent) & corner_mask) != 0 {
      continue;
    }
    for square in adjacent.iter() {
      let mask = 1u64 << square;
      if (player & mask) != 0 {
        score -= 30;
      } else if (opponent & mask) != 0 {
        score += 30;
      }
    }
  }
  score
}

fn frontier_score(player: u64, opponent: u64) -> i64 {
  let empty = !(player | opponent);
  let adjacent_to_empty = adjacent_bits(empty);
  let player_frontier = bit_count(player & adjacent_to_empty);
  let opponent_frontier = bit_count(opponent & adjacent_to_empty);
  (opponent_frontier - player_frontier) * 18
}

fn mobility_score(player: u64, opponent: u64) -> i64 {
  let my_moves = bit_count(legal_moves_bitboard(player, opponent));
  let enemy_moves = bit_count(legal_moves_bitboard(opponent, player));
  let mut actual = 0i64;
  if (my_moves + enemy_moves) > 0 {
    actual = round_like_python(180.0 * ((my_moves - enemy_moves) as f64) / ((my_moves + enemy_moves) as f64));
  }

  let empty = !(player | opponent);
  let potential_my = bit_count(adjacent_bits(opponent) & empty);
  let potential_enemy = bit_count(adjacent_bits(player) & empty);
  let mut potential = 0i64;
  if (potential_my + potential_enemy) > 0 {
    potential = round_like_python(60.0 * ((potential_my - potential_enemy) as f64) / ((potential_my + potential_enemy) as f64));
  }
  actual + potential
}

fn corner_score(player: u64, opponent: u64) -> i64 {
  let mut player_corners = 0i64;
  let mut opponent_corners = 0i64;
  for index in CORNERS.iter() {
    let mask = 1u64 << index;
    if (player & mask) != 0 {
      player_corners += 1;
    } else if (opponent & mask) != 0 {
      opponent_corners += 1;
    }
  }
  (player_corners - opponent_corners) * 600
}

fn parity_score(player: u64, opponent: u64) -> i64 {
  let empties = BOARD_CELL_COUNT - bit_count(player | opponent);
  if empties <= 0 {
    return 0;
  }
  if (empties & 1) == 1 {
    22
  } else {
    -22
  }
}

fn disc_score(player: u64, opponent: u64) -> i64 {
  let player_count = bit_count(player);
  let opponent_count = bit_count(opponent);
  let total = player_count + opponent_count;
  if total <= 0 {
    return 0;
  }
  round_like_python(120.0 * ((player_count - opponent_count) as f64) / (total as f64))
}

pub fn terminal_score(player: u64, opponent: u64) -> i64 {
  let delta = bit_count(player) - bit_count(opponent);
  if delta > 0 {
    return WIN_SCORE + delta * 1024;
  }
  if delta < 0 {
    return LOSS_SCORE + delta * 1024;
  }
  0
}

pub fn evaluate_position(player: u64, opponent: u64, sacrifice_level: i64) -> i64 {
  let empties = BOARD_CELL_COUNT - bit_count(player | opponent);
  let stage = 1.0 - ((empties as f64) / (BOARD_CELL_COUNT as f64));
  let disc_stage_weight = 0.30 + stage * 0.90;
  let (disc_weight, mobility_weight, corner_weight, frontier_weight) = evaluation_weights(sacrifice_level);

  let mut score = 0.0f64;
  score += position_score(player, opponent) as f64;
  score += (corner_score(player, opponent) as f64) * corner_weight;
  score += corner_closeness_penalty(player, opponent) as f64;
  score += (mobility_score(player, opponent) as f64) * mobility_weight;
  score += (frontier_score(player, opponent) as f64) * frontier_weight;
  score += parity_score(player, opponent) as f64;
  score += (disc_score(player, opponent) as f64) * disc_stage_weight * disc_weight;
  round_like_python(score)
}

fn classic_frontier_count(side_bits: u64, occupied: u64) -> i64 {
  let empty = !occupied;
  bit_count(side_bits & adjacent_bits(empty))
}

pub fn classic_evaluate(root: u64, other: u64, sacrifice_level: i64) -> f64 {
  let positional = position_score(root, other) as f64;

  let my_moves = bit_count(legal_moves_bitboard(root, other));
  let enemy_moves = bit_count(legal_moves_bitboard(other, root));
  let mut mobility = 0.0f64;
  if (my_moves + enemy_moves) > 0 {
    mobility = 100.0 * ((my_moves - enemy_moves) as f64) / ((my_moves + enemy_moves) as f64);
  }

  let mut my_corners = 0i64;
  let mut enemy_corners = 0i64;
  for index in CORNERS.iter() {
    let mask = 1u64 << index;
    if (root & mask) != 0 {
      my_corners += 1;
    } else if (other & mask) != 0 {
      enemy_corners += 1;
    }
  }
  let corner_score = 25.0 * ((my_corners - enemy_corners) as f64);

  let my_count = bit_count(root);
  let enemy_count = bit_count(other);
  let mut disc_diff = 0.0f64;
  if (my_count + enemy_count) > 0 {
    disc_diff = 20.0 * ((my_count - enemy_count) as f64) / ((my_count + enemy_count) as f64);
  }

  let (disc_weight, mobility_weight, corner_weight, frontier_weight) = evaluation_weights(sacrifice_level);
  let occupied = root | other;
  let frontier_penalty = -5.0 * ((classic_frontier_count(root, occupied) - classic_frontier_count(other, occupied)) as f64);

  positional + mobility * mobility_weight + corner_score * corner_weight + disc_diff * disc_weight + frontier_penalty * frontier_weight
}

pub fn classic_terminal_score(root: u64, other: u64) -> f64 {
  let my_count = bit_count(root);
  let enemy_count = bit_count(other);
  if my_count > enemy_count {
    return 100000.0 + ((my_count - enemy_count) as f64);
  }
  if enemy_count > my_count {
    return -100000.0 - ((enemy_count - my_count) as f64);
  }
  0.0
}
