// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

// Othello bitboard engine. Every constant, formula, rounding rule, move
// ordering key, transposition policy, and evaluation term mirrors the pure
// Python implementation under
// src/ludoxel/simulation/spaces/othello/engines/ (bitboards.py,
// evaluation.py, evaluation_profile.py, ordering.py, search.py,
// transposition.py); the Python modules and this crate must return
// identical values for identical inputs when the transposition tables hold
// the same entries. Python `round` rounds ties to even, so every rounded
// term uses `round_ties_even`.

use std::collections::HashMap;
use std::time::Instant;

pub const BOARD_CELL_COUNT: i64 = 64;
const FILE_A: u64 = 0x0101010101010101;
const FILE_H: u64 = 0x8080808080808080;
const NOT_FILE_A: u64 = !FILE_A;
const NOT_FILE_H: u64 = !FILE_H;
const CORNERS: [u32; 4] = [0, 7, 56, 63];
const X_SQUARES: [u32; 4] = [9, 14, 49, 54];
const C_SQUARES: [u32; 8] = [1, 6, 8, 15, 48, 55, 57, 62];

pub const WIN_SCORE: i64 = 1_000_000;
pub const LOSS_SCORE: i64 = -WIN_SCORE;

const BOUND_EXACT: i8 = 0;
const BOUND_LOWER: i8 = 1;
const BOUND_UPPER: i8 = -1;

#[rustfmt::skip]
const POSITION_WEIGHTS: [i64; 64] = [
  120, -20, 20, 5, 5, 20, -20, 120,
  -20, -40, -5, -5, -5, -5, -40, -20,
  20, -5, 15, 3, 3, 15, -5, 20,
  5, -5, 3, 3, 3, 3, -5, 5,
  5, -5, 3, 3, 3, 3, -5, 5,
  20, -5, 15, 3, 3, 15, -5, 20,
  -20, -40, -5, -5, -5, -5, -40, -20,
  120, -20, 20, 5, 5, 20, -20, 120,
];

pub struct SearchTimeout;

#[inline]
fn shift_east(bits: u64) -> u64 {
  (bits & NOT_FILE_H) << 1
}

#[inline]
fn shift_west(bits: u64) -> u64 {
  (bits & NOT_FILE_A) >> 1
}

#[inline]
fn shift_south(bits: u64) -> u64 {
  bits << 8
}

#[inline]
fn shift_north(bits: u64) -> u64 {
  bits >> 8
}

#[inline]
fn shift_south_east(bits: u64) -> u64 {
  (bits & NOT_FILE_H) << 9
}

#[inline]
fn shift_south_west(bits: u64) -> u64 {
  (bits & NOT_FILE_A) << 7
}

#[inline]
fn shift_north_east(bits: u64) -> u64 {
  (bits & NOT_FILE_H) >> 7
}

#[inline]
fn shift_north_west(bits: u64) -> u64 {
  (bits & NOT_FILE_A) >> 9
}

const SHIFT_FUNCS: [fn(u64) -> u64; 8] = [
  shift_east,
  shift_west,
  shift_south,
  shift_north,
  shift_south_east,
  shift_south_west,
  shift_north_east,
  shift_north_west,
];

pub fn legal_moves_bitboard(player: u64, opponent: u64) -> u64 {
  let empty = !(player | opponent);
  let mut moves = 0u64;
  for shift in SHIFT_FUNCS.iter() {
    let mut frontier = shift(player) & opponent;
    let mut captured = frontier;
    for _ in 0..5 {
      frontier = shift(frontier) & opponent;
      if frontier == 0 {
        break;
      }
      captured |= frontier;
    }
    moves |= shift(captured) & empty;
  }
  moves
}

fn capture_line(move_bit: u64, player: u64, opponent: u64, shift: fn(u64) -> u64) -> u64 {
  let mut cursor = shift(move_bit);
  let mut flips = 0u64;
  while cursor != 0 && (cursor & opponent) != 0 {
    flips |= cursor;
    cursor = shift(cursor);
  }
  if (cursor & player) != 0 {
    return flips;
  }
  0
}

pub fn apply_move_bits(player: u64, opponent: u64, move_index: u32) -> (u64, u64) {
  let move_bit = 1u64 << move_index;
  let mut flips = 0u64;
  for shift in SHIFT_FUNCS.iter() {
    flips |= capture_line(move_bit, player, opponent, *shift);
  }
  (player | move_bit | flips, opponent & !flips)
}

fn adjacent_bits(bits: u64) -> u64 {
  shift_east(bits)
    | shift_west(bits)
    | shift_south(bits)
    | shift_north(bits)
    | shift_south_east(bits)
    | shift_south_west(bits)
    | shift_north_east(bits)
    | shift_north_west(bits)
}

#[inline]
fn bit_count(bits: u64) -> i64 {
  bits.count_ones() as i64
}

#[inline]
fn round_like_python(value: f64) -> i64 {
  value.round_ties_even() as i64
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

fn normalize_sacrifice_level(value: i64) -> i64 {
  value.clamp(0, 4)
}

fn normalize_hash_level(value: i64) -> i64 {
  value.clamp(0, 6)
}

fn evaluation_weights(sacrifice_level: i64) -> (f64, f64, f64, f64) {
  let normalized = (normalize_sacrifice_level(sacrifice_level) as f64) / 4.0;
  let disc_weight = 1.50 - 1.05 * normalized;
  let mobility_weight = 0.85 + 0.35 * normalized;
  let corner_weight = 0.95 + 0.15 * normalized;
  let frontier_weight = 0.90 + 0.40 * normalized;
  (disc_weight, mobility_weight, corner_weight, frontier_weight)
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

fn ordering_bonus(move_index: u32) -> i64 {
  if CORNERS.contains(&move_index) {
    return 50_000;
  }
  if X_SQUARES.contains(&move_index) {
    return -9_000;
  }
  if C_SQUARES.contains(&move_index) {
    return -4_500;
  }
  POSITION_WEIGHTS[move_index as usize] * 32
}

fn bitboard_to_moves(bits: u64) -> Vec<u32> {
  let mut out = Vec::with_capacity(bits.count_ones() as usize);
  let mut remaining = bits;
  while remaining != 0 {
    let index = remaining.trailing_zeros();
    out.push(index);
    remaining &= remaining - 1;
  }
  out
}

fn ordered_moves(player: u64, opponent: u64, legal_moves: &[u32], tt_move: Option<u32>) -> Vec<u32> {
  let mut keyed: Vec<(i64, u32)> = legal_moves
    .iter()
    .map(|&move_index| {
      let (next_player, next_opponent) = apply_move_bits(player, opponent, move_index);
      let reply_count = bit_count(legal_moves_bitboard(next_opponent, next_player));
      let mut score = ordering_bonus(move_index) - reply_count * 96;
      if tt_move == Some(move_index) {
        score += 100_000;
      }
      (score, move_index)
    })
    .collect();
  keyed.sort_by_key(|&(score, move_index)| (-score, move_index));
  keyed.into_iter().map(|(_, move_index)| move_index).collect()
}

#[derive(Clone, Copy)]
struct TtEntry {
  depth: i64,
  score: i64,
  bound: i8,
  best_move: Option<u32>,
}

pub struct SearchState {
  hash_level: i64,
  sacrifice_level: i64,
  exact_threshold: i64,
  transposition_soft_limit: usize,
  transposition: HashMap<(u64, u64), TtEntry>,
  exact_transposition: HashMap<(u64, u64, i64), i64>,
}

impl SearchState {
  pub fn new(hash_level: i64, sacrifice_level: i64) -> Self {
    let normalized_hash_level = normalize_hash_level(hash_level);
    let soft_limit = if normalized_hash_level <= 0 {
      0usize
    } else {
      1usize << std::cmp::min(21, 11 + normalized_hash_level * 2) as usize
    };
    SearchState {
      hash_level: normalized_hash_level,
      sacrifice_level: normalize_sacrifice_level(sacrifice_level),
      exact_threshold: 14,
      transposition_soft_limit: soft_limit,
      transposition: HashMap::new(),
      exact_transposition: HashMap::new(),
    }
  }

  pub fn clear(&mut self) {
    self.transposition.clear();
    self.exact_transposition.clear();
  }

  pub fn root_best_move(&self, player: u64, opponent: u64) -> Option<u32> {
    if self.hash_level <= 0 {
      return None;
    }
    self.transposition.get(&(player, opponent)).and_then(|entry| entry.best_move)
  }

  fn store_transposition(&mut self, key: (u64, u64), entry: TtEntry) {
    if self.hash_level <= 0 || self.transposition_soft_limit == 0 {
      return;
    }
    if self.transposition.len() >= self.transposition_soft_limit {
      self.transposition.clear();
    }
    self.transposition.insert(key, entry);
  }

  fn store_exact_transposition(&mut self, key: (u64, u64, i64), score: i64) {
    if self.hash_level <= 1 || self.transposition_soft_limit == 0 {
      return;
    }
    if self.exact_transposition.len() >= self.transposition_soft_limit {
      self.exact_transposition.clear();
    }
    self.exact_transposition.insert(key, score);
  }

  fn check_deadline(deadline: Option<Instant>) -> Result<(), SearchTimeout> {
    if let Some(limit) = deadline {
      if Instant::now() >= limit {
        return Err(SearchTimeout);
      }
    }
    Ok(())
  }

  pub fn solve_exact(&mut self, player: u64, opponent: u64, mut alpha: i64, beta: i64, deadline: Option<Instant>, pass_count: i64) -> Result<i64, SearchTimeout> {
    Self::check_deadline(deadline)?;

    let legal_bb = legal_moves_bitboard(player, opponent);
    if legal_bb == 0 {
      let opponent_legal_bb = legal_moves_bitboard(opponent, player);
      if opponent_legal_bb == 0 {
        return Ok(terminal_score(player, opponent));
      }
      return Ok(-self.solve_exact(opponent, player, -beta, -alpha, deadline, pass_count + 1)?);
    }

    let key = (player, opponent, pass_count);
    if self.hash_level > 1 {
      if let Some(&cached) = self.exact_transposition.get(&key) {
        return Ok(cached);
      }
    }

    let mut best = LOSS_SCORE;
    for move_index in ordered_moves(player, opponent, &bitboard_to_moves(legal_bb), None) {
      let (next_player, next_opponent) = apply_move_bits(player, opponent, move_index);
      let score = -self.solve_exact(next_opponent, next_player, -beta, -alpha, deadline, 0)?;
      if score > best {
        best = score;
      }
      if best > alpha {
        alpha = best;
      }
      if alpha >= beta {
        break;
      }
    }

    self.store_exact_transposition(key, best);
    Ok(best)
  }

  pub fn negamax(&mut self, player: u64, opponent: u64, depth: i64, mut alpha: i64, mut beta: i64, deadline: Option<Instant>, pass_count: i64) -> Result<i64, SearchTimeout> {
    Self::check_deadline(deadline)?;

    let legal_bb = legal_moves_bitboard(player, opponent);
    let empties = BOARD_CELL_COUNT - bit_count(player | opponent);

    if legal_bb == 0 {
      let opponent_legal_bb = legal_moves_bitboard(opponent, player);
      if opponent_legal_bb == 0 {
        return Ok(terminal_score(player, opponent));
      }
      return Ok(-self.negamax(opponent, player, depth, -beta, -alpha, deadline, pass_count + 1)?);
    }

    if empties <= self.exact_threshold {
      return self.solve_exact(player, opponent, alpha, beta, deadline, pass_count);
    }

    if depth <= 0 {
      return Ok(evaluate_position(player, opponent, self.sacrifice_level));
    }

    let original_alpha = alpha;
    let key = (player, opponent);
    let tt_entry = if self.hash_level > 0 { self.transposition.get(&key).copied() } else { None };
    if let Some(entry) = tt_entry {
      if entry.depth >= depth {
        if entry.bound == BOUND_EXACT {
          return Ok(entry.score);
        }
        if entry.bound == BOUND_LOWER {
          alpha = std::cmp::max(alpha, entry.score);
        } else if entry.bound == BOUND_UPPER {
          beta = std::cmp::min(beta, entry.score);
        }
        if alpha >= beta {
          return Ok(entry.score);
        }
      }
    }

    let mut best_score = LOSS_SCORE;
    let mut best_move: Option<u32> = None;
    let tt_move = tt_entry.and_then(|entry| entry.best_move);
    for move_index in ordered_moves(player, opponent, &bitboard_to_moves(legal_bb), tt_move) {
      let (next_player, next_opponent) = apply_move_bits(player, opponent, move_index);
      let score = -self.negamax(next_opponent, next_player, depth - 1, -beta, -alpha, deadline, 0)?;
      if score > best_score {
        best_score = score;
        best_move = Some(move_index);
      }
      if best_score > alpha {
        alpha = best_score;
      }
      if alpha >= beta {
        break;
      }
    }

    let bound = if best_score <= original_alpha {
      BOUND_UPPER
    } else if best_score >= beta {
      BOUND_LOWER
    } else {
      BOUND_EXACT
    };

    self.store_transposition(key, TtEntry { depth, score: best_score, bound, best_move });
    Ok(best_score)
  }
}
