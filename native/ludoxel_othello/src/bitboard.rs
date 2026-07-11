// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

pub const BOARD_CELL_COUNT: i64 = 64;

const FILE_A: u64 = 0x0101010101010101;
const FILE_H: u64 = 0x8080808080808080;
const NOT_FILE_A: u64 = !FILE_A;
const NOT_FILE_H: u64 = !FILE_H;

pub const CORNERS: [u32; 4] = [0, 7, 56, 63];

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

const SHIFT_FUNCS: [fn(u64) -> u64; 8] = [shift_east, shift_west, shift_south, shift_north, shift_south_east, shift_south_west, shift_north_east, shift_north_west];

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

pub fn adjacent_bits(bits: u64) -> u64 {
  shift_east(bits) | shift_west(bits) | shift_south(bits) | shift_north(bits) | shift_south_east(bits) | shift_south_west(bits) | shift_north_east(bits) | shift_north_west(bits)
}

#[inline]
pub fn bit_count(bits: u64) -> i64 {
  bits.count_ones() as i64
}

pub fn bitboard_to_moves(bits: u64) -> Vec<u32> {
  let mut out = Vec::with_capacity(bits.count_ones() as usize);
  let mut remaining = bits;
  while remaining != 0 {
    let index = remaining.trailing_zeros();
    out.push(index);
    remaining &= remaining - 1;
  }
  out
}
