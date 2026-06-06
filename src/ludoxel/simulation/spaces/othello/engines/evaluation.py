# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.simulation.spaces.othello.engines.bitboards import CORNERS, FULL_MASK, adjacent_bits, bit_count, legal_moves_bitboard
from ludoxel.simulation.spaces.othello.engines.evaluation_profile import POSITION_WEIGHTS, evaluation_weights
from ludoxel.simulation.spaces.othello.game.state import BOARD_CELL_COUNT

WIN_SCORE = 1_000_000
LOSS_SCORE = -WIN_SCORE
POSITION_SQUARE_MASKS: tuple[int, ...] = tuple(1 << index for index in range(BOARD_CELL_COUNT))


def position_score(player_bits: int, opponent_bits: int) -> int:
  score = 0
  for index, weight in enumerate(POSITION_WEIGHTS):
    mask = POSITION_SQUARE_MASKS[int(index)]
    if int(player_bits) & mask:
      score += int(weight)
    elif int(opponent_bits) & mask:
      score -= int(weight)
  return int(score)


def corner_closeness_penalty(player_bits: int, opponent_bits: int) -> int:
  score = 0
  corners = ((0, (1, 8, 9)), (7, (6, 14, 15)), (56, (48, 49, 57)), (63, (54, 55, 62)))
  for corner, adjacent in corners:
    corner_mask = 1 << int(corner)
    if ((int(player_bits) | int(opponent_bits)) & corner_mask) != 0:
      continue
    for square in adjacent:
      mask = 1 << int(square)
      if int(player_bits) & mask:
        score -= 30
      elif int(opponent_bits) & mask:
        score += 30
  return int(score)


def frontier_score(player_bits: int, opponent_bits: int) -> int:
  empty = (~(int(player_bits) | int(opponent_bits))) & FULL_MASK
  adjacent_to_empty = adjacent_bits(empty)
  player_frontier = bit_count(int(player_bits) & int(adjacent_to_empty))
  opponent_frontier = bit_count(int(opponent_bits) & int(adjacent_to_empty))
  return int((opponent_frontier - player_frontier) * 18)


def mobility_score(player_bits: int, opponent_bits: int) -> int:
  my_moves = bit_count(legal_moves_bitboard(int(player_bits), int(opponent_bits)))
  enemy_moves = bit_count(legal_moves_bitboard(int(opponent_bits), int(player_bits)))
  actual = 0
  if (my_moves + enemy_moves) > 0:
    actual = int(round(180.0 * float(my_moves - enemy_moves) / float(my_moves + enemy_moves)))

  potential_my = bit_count(adjacent_bits(int(opponent_bits)) & (~(int(player_bits) | int(opponent_bits)) & FULL_MASK))
  potential_enemy = bit_count(adjacent_bits(int(player_bits)) & (~(int(player_bits) | int(opponent_bits)) & FULL_MASK))
  potential = 0
  if (potential_my + potential_enemy) > 0:
    potential = int(round(60.0 * float(potential_my - potential_enemy) / float(potential_my + potential_enemy)))
  return int(actual + potential)


def corner_score(player_bits: int, opponent_bits: int) -> int:
  player_corners = 0
  opponent_corners = 0
  for index in CORNERS:
    mask = 1 << int(index)
    if int(player_bits) & mask:
      player_corners += 1
    elif int(opponent_bits) & mask:
      opponent_corners += 1
  return int((player_corners - opponent_corners) * 600)


def parity_score(player_bits: int, opponent_bits: int) -> int:
  empties = BOARD_CELL_COUNT - bit_count(int(player_bits) | int(opponent_bits))
  if empties <= 0:
    return 0
  return 22 if (empties & 1) == 1 else -22


def disc_score(player_bits: int, opponent_bits: int) -> int:
  player_count = bit_count(player_bits)
  opponent_count = bit_count(opponent_bits)
  total = player_count + opponent_count
  if total <= 0:
    return 0
  return int(round(120.0 * float(player_count - opponent_count) / float(total)))


def terminal_score(player_bits: int, opponent_bits: int) -> int:
  delta = bit_count(player_bits) - bit_count(opponent_bits)
  if delta > 0:
    return int(WIN_SCORE + delta * 1024)
  if delta < 0:
    return int(LOSS_SCORE + delta * 1024)
  return 0


def evaluate_position(player_bits: int, opponent_bits: int, *, sacrifice_level: int) -> int:
  empties = BOARD_CELL_COUNT - bit_count(int(player_bits) | int(opponent_bits))
  stage = 1.0 - (float(empties) / float(BOARD_CELL_COUNT))
  disc_stage_weight = 0.30 + stage * 0.90
  disc_weight, mobility_weight, corner_weight, frontier_weight = evaluation_weights(int(sacrifice_level))

  score = 0.0
  score += float(position_score(int(player_bits), int(opponent_bits)))
  score += float(corner_score(int(player_bits), int(opponent_bits))) * float(corner_weight)
  score += float(corner_closeness_penalty(int(player_bits), int(opponent_bits)))
  score += float(mobility_score(int(player_bits), int(opponent_bits))) * float(mobility_weight)
  score += float(frontier_score(int(player_bits), int(opponent_bits))) * float(frontier_weight)
  score += float(parity_score(int(player_bits), int(opponent_bits)))
  score += float(disc_score(int(player_bits), int(opponent_bits))) * float(disc_stage_weight) * float(disc_weight)
  return int(round(score))
