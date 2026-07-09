# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.spaces.othello.engines.bitboards import C_SQUARES, CORNERS, X_SQUARES, apply_move_bits, bit_count, legal_moves_bitboard
from ludoxel.simulation.spaces.othello.engines.evaluation_profile import POSITION_WEIGHTS

CORNER_MOVE_ORDERING_BONUS: int = 50_000
X_SQUARE_MOVE_ORDERING_PENALTY: int = -9_000
C_SQUARE_MOVE_ORDERING_PENALTY: int = -4_500
POSITION_WEIGHT_ORDERING_FACTOR: int = 32
REPLY_MOVE_ORDERING_PENALTY: int = 96
TRANSPOSITION_MOVE_ORDERING_BONUS: int = 100_000


def ordering_bonus(move_index: int) -> int:
  move = int(move_index)
  if move in CORNERS:
    return CORNER_MOVE_ORDERING_BONUS
  if move in X_SQUARES:
    return X_SQUARE_MOVE_ORDERING_PENALTY
  if move in C_SQUARES:
    return C_SQUARE_MOVE_ORDERING_PENALTY
  return int(POSITION_WEIGHTS[move] * POSITION_WEIGHT_ORDERING_FACTOR)


def ordered_moves(player_bits: int, opponent_bits: int, legal_moves: tuple[int, ...], tt_move: int | None) -> tuple[int, ...]:

  def sort_key(move_index: int) -> tuple[int, int]:
    next_player, next_opponent = apply_move_bits(int(player_bits), int(opponent_bits), int(move_index))
    reply_count = bit_count(legal_moves_bitboard(int(next_opponent), int(next_player)))
    score = ordering_bonus(int(move_index)) - (reply_count * REPLY_MOVE_ORDERING_PENALTY)
    if tt_move is not None and int(move_index) == int(tt_move):
      score += TRANSPOSITION_MOVE_ORDERING_BONUS
    return (-int(score), int(move_index))

  return tuple(sorted((int(move) for move in legal_moves), key=sort_key))
