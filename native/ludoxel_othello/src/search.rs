// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

use std::collections::HashMap;
use std::time::Instant;

use crate::bitboard::{apply_move_bits, bit_count, bitboard_to_moves, legal_moves_bitboard, BOARD_CELL_COUNT, CORNERS};
use crate::evaluation::{classic_evaluate, classic_terminal_score, evaluate_position, normalize_sacrifice_level, terminal_score, LOSS_SCORE, POSITION_WEIGHTS};

const X_SQUARES: &[u32] = &[9, 14, 49, 54];
const C_SQUARES: &[u32] = &[1, 6, 8, 15, 48, 55, 57, 62];

const OTHELLO_AI_HASH_LEVEL_MIN: i64 = 0;
const OTHELLO_AI_HASH_LEVEL_MAX: i64 = 6;
const EXACT_SOLVE_EMPTY_SQUARE_THRESHOLD: i64 = 14;
const TRANSPOSITION_SOFT_LIMIT_DISABLED: usize = 0;
const TRANSPOSITION_SOFT_LIMIT_BASE_SHIFT: i64 = 11;
const TRANSPOSITION_SOFT_LIMIT_MAX_SHIFT: i64 = 21;
const TRANSPOSITION_SOFT_LIMIT_HASH_LEVEL_SHIFT_FACTOR: i64 = 2;
const CORNER_MOVE_ORDERING_BONUS: i64 = 50_000;
const X_SQUARE_MOVE_ORDERING_PENALTY: i64 = -9_000;
const C_SQUARE_MOVE_ORDERING_PENALTY: i64 = -4_500;
const POSITION_WEIGHT_ORDERING_FACTOR: i64 = 32;
const REPLY_MOVE_ORDERING_PENALTY: i64 = 96;
const TRANSPOSITION_MOVE_ORDERING_BONUS: i64 = 100_000;

const BOUND_EXACT: i8 = 0;
const BOUND_LOWER: i8 = 1;
const BOUND_UPPER: i8 = -1;

pub struct SearchTimeout;

fn normalize_hash_level(value: i64) -> i64 {
  value.clamp(OTHELLO_AI_HASH_LEVEL_MIN, OTHELLO_AI_HASH_LEVEL_MAX)
}

fn classic_ordered_moves(legal: u64, maximizing: bool) -> Vec<u32> {
  let mut moves = bitboard_to_moves(legal);
  if maximizing {
    moves.sort_by_key(|&m| -POSITION_WEIGHTS[m as usize]);
  } else {
    moves.sort_by_key(|&m| POSITION_WEIGHTS[m as usize]);
  }
  moves
}

fn classic_check_deadline(deadline: Option<Instant>) -> Result<(), SearchTimeout> {
  if let Some(limit) = deadline {
    if Instant::now() >= limit {
      return Err(SearchTimeout);
    }
  }
  Ok(())
}

#[allow(clippy::too_many_arguments)]
fn classic_alpha_beta(
  root: u64,
  other: u64,
  root_to_move: bool,
  depth: i64,
  mut alpha: f64,
  mut beta: f64,
  deadline: Option<Instant>,
  pass_count: i64,
  sacrifice_level: i64,
) -> Result<f64, SearchTimeout> {
  classic_check_deadline(deadline)?;

  let (mover, waiter) = if root_to_move { (root, other) } else { (other, root) };
  let my_legal = legal_moves_bitboard(mover, waiter);
  let enemy_legal = legal_moves_bitboard(waiter, mover);

  if depth <= 0 {
    return Ok(classic_evaluate(root, other, sacrifice_level));
  }

  if my_legal == 0 && enemy_legal == 0 {
    return Ok(classic_terminal_score(root, other));
  }

  if my_legal == 0 {
    if pass_count >= 1 {
      return Ok(classic_terminal_score(root, other));
    }
    return classic_alpha_beta(root, other, !root_to_move, depth - 1, alpha, beta, deadline, pass_count + 1, sacrifice_level);
  }

  let maximizing = root_to_move;
  let mut best = if maximizing { f64::NEG_INFINITY } else { f64::INFINITY };

  for move_index in classic_ordered_moves(my_legal, maximizing) {
    classic_check_deadline(deadline)?;
    let (next_mover, next_waiter) = apply_move_bits(mover, waiter, move_index);
    let (next_root, next_other) = if root_to_move { (next_mover, next_waiter) } else { (next_waiter, next_mover) };
    let child = classic_alpha_beta(next_root, next_other, !root_to_move, depth - 1, alpha, beta, deadline, 0, sacrifice_level)?;
    if maximizing {
      best = best.max(child);
      alpha = alpha.max(best);
      if alpha >= beta {
        break;
      }
    } else {
      best = best.min(child);
      beta = beta.min(best);
      if beta <= alpha {
        break;
      }
    }
  }
  Ok(best)
}

pub fn classic_root_scores(player: u64, opponent: u64, depth: i64, sacrifice_level: i64, deadline: Option<Instant>) -> Result<Vec<(u32, f64)>, SearchTimeout> {
  let legal = legal_moves_bitboard(player, opponent);
  let mut out: Vec<(u32, f64)> = Vec::with_capacity(legal.count_ones() as usize);
  for move_index in classic_ordered_moves(legal, true) {
    classic_check_deadline(deadline)?;
    let (next_root, next_other) = apply_move_bits(player, opponent, move_index);
    let score = classic_alpha_beta(next_root, next_other, false, depth - 1, f64::NEG_INFINITY, f64::INFINITY, deadline, 0, sacrifice_level)?;
    out.push((move_index, score));
  }
  Ok(out)
}

fn ordering_bonus(move_index: u32) -> i64 {
  if CORNERS.contains(&move_index) {
    return CORNER_MOVE_ORDERING_BONUS;
  }
  if X_SQUARES.contains(&move_index) {
    return X_SQUARE_MOVE_ORDERING_PENALTY;
  }
  if C_SQUARES.contains(&move_index) {
    return C_SQUARE_MOVE_ORDERING_PENALTY;
  }
  POSITION_WEIGHTS[move_index as usize] * POSITION_WEIGHT_ORDERING_FACTOR
}

fn ordered_moves(player: u64, opponent: u64, legal_moves: &[u32], tt_move: Option<u32>) -> Vec<u32> {
  let mut keyed: Vec<(i64, u32)> = legal_moves
    .iter()
    .map(|&move_index| {
      let (next_player, next_opponent) = apply_move_bits(player, opponent, move_index);
      let reply_count = bit_count(legal_moves_bitboard(next_opponent, next_player));
      let mut score = ordering_bonus(move_index) - reply_count * REPLY_MOVE_ORDERING_PENALTY;
      if tt_move == Some(move_index) {
        score += TRANSPOSITION_MOVE_ORDERING_BONUS;
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
      TRANSPOSITION_SOFT_LIMIT_DISABLED
    } else {
      1usize << std::cmp::min(TRANSPOSITION_SOFT_LIMIT_MAX_SHIFT, TRANSPOSITION_SOFT_LIMIT_BASE_SHIFT + normalized_hash_level * TRANSPOSITION_SOFT_LIMIT_HASH_LEVEL_SHIFT_FACTOR) as usize
    };
    SearchState {
      hash_level: normalized_hash_level,
      sacrifice_level: normalize_sacrifice_level(sacrifice_level),
      exact_threshold: EXACT_SOLVE_EMPTY_SQUARE_THRESHOLD,
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
