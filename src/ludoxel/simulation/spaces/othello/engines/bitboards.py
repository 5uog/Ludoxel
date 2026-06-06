# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.spaces.othello.game.state import BOARD_CELL_COUNT, SIDE_BLACK, SIDE_WHITE, coerce_board

FULL_MASK = (1 << BOARD_CELL_COUNT) - 1
FILE_A = 0x0101010101010101
FILE_H = 0x8080808080808080
NOT_FILE_A = FULL_MASK ^ FILE_A
NOT_FILE_H = FULL_MASK ^ FILE_H
CORNERS = (0, 7, 56, 63)
X_SQUARES = (9, 14, 49, 54)
C_SQUARES = (1, 6, 8, 15, 48, 55, 57, 62)


def shift_east(bits: int) -> int:
  return ((int(bits) & NOT_FILE_H) << 1) & FULL_MASK


def shift_west(bits: int) -> int:
  return ((int(bits) & NOT_FILE_A) >> 1) & FULL_MASK


def shift_south(bits: int) -> int:
  return (int(bits) << 8) & FULL_MASK


def shift_north(bits: int) -> int:
  return (int(bits) >> 8) & FULL_MASK


def shift_south_east(bits: int) -> int:
  return ((int(bits) & NOT_FILE_H) << 9) & FULL_MASK


def shift_south_west(bits: int) -> int:
  return ((int(bits) & NOT_FILE_A) << 7) & FULL_MASK


def shift_north_east(bits: int) -> int:
  return ((int(bits) & NOT_FILE_H) >> 7) & FULL_MASK


def shift_north_west(bits: int) -> int:
  return ((int(bits) & NOT_FILE_A) >> 9) & FULL_MASK


SHIFT_FUNCS = (shift_east, shift_west, shift_south, shift_north, shift_south_east, shift_south_west, shift_north_east, shift_north_west)


def bitboards_from_board(board: tuple[int, ...] | list[int]) -> tuple[int, int]:
  black = 0
  white = 0
  for index, value in enumerate(coerce_board(board)):
    mask = 1 << int(index)
    if int(value) == SIDE_BLACK:
      black |= mask
    elif int(value) == SIDE_WHITE:
      white |= mask
  return (int(black), int(white))


def legal_moves_bitboard(player_bits: int, opponent_bits: int) -> int:
  player = int(player_bits)
  opponent = int(opponent_bits)
  empty = (~(player | opponent)) & FULL_MASK
  moves = 0
  for shift in SHIFT_FUNCS:
    frontier = shift(player) & opponent
    captured = frontier
    for _ in range(5):
      frontier = shift(frontier) & opponent
      if frontier == 0:
        break
      captured |= frontier
    moves |= shift(captured) & empty
  return int(moves)


def bitboard_to_moves(bits: int) -> tuple[int, ...]:
  out: list[int] = []
  remaining = int(bits)
  while remaining:
    lsb = remaining & -remaining
    out.append(int(lsb.bit_length() - 1))
    remaining ^= lsb
  return tuple(out)


def capture_line(move_bit: int, player_bits: int, opponent_bits: int, shift) -> int:
  cursor = shift(int(move_bit))
  flips = 0
  while cursor and (cursor & int(opponent_bits)):
    flips |= cursor
    cursor = shift(cursor)
  if cursor & int(player_bits):
    return int(flips)
  return 0


def apply_move_bits(player_bits: int, opponent_bits: int, move_index: int) -> tuple[int, int]:
  move_bit = 1 << int(move_index)
  flips = 0
  for shift in SHIFT_FUNCS:
    flips |= capture_line(move_bit, int(player_bits), int(opponent_bits), shift)
  next_player = int(player_bits) | int(move_bit) | int(flips)
  next_opponent = int(opponent_bits) & ~int(flips)
  return (int(next_player), int(next_opponent))


def bit_count(bits: int) -> int:
  return int(int(bits).bit_count())


def adjacent_bits(bits: int) -> int:
  src = int(bits)
  return int((shift_east(src) | shift_west(src) | shift_south(src) | shift_north(src) | shift_south_east(src) | shift_south_west(src) | shift_north_east(src) | shift_north_west(src)) & FULL_MASK)
