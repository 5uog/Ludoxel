# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import time

from ludoxel.simulation.spaces.othello.engines.bitboards import apply_move_bits, bit_count, bitboard_to_moves, legal_moves_bitboard
from ludoxel.simulation.spaces.othello.engines.evaluation import LOSS_SCORE, evaluate_position, terminal_score
from ludoxel.simulation.spaces.othello.engines.ordering import ordered_moves
from ludoxel.simulation.spaces.othello.engines.transposition import BOUND_EXACT, BOUND_LOWER, BOUND_UPPER, TranspositionEntry, store_exact_transposition, store_transposition
from ludoxel.simulation.spaces.othello.game.state import BOARD_CELL_COUNT


def check_deadline(deadline_s: float | None) -> None:
  if deadline_s is not None and time.perf_counter() >= float(deadline_s):
    raise TimeoutError


def solve_exact(cache, player_bits: int, opponent_bits: int, alpha: int, beta: int, deadline_s: float | None, pass_count: int) -> int:
  check_deadline(deadline_s)

  legal_bb = legal_moves_bitboard(int(player_bits), int(opponent_bits))
  if legal_bb == 0:
    opponent_legal_bb = legal_moves_bitboard(int(opponent_bits), int(player_bits))
    if opponent_legal_bb == 0:
      return terminal_score(int(player_bits), int(opponent_bits))
    return -solve_exact(cache, int(opponent_bits), int(player_bits), -int(beta), -int(alpha), deadline_s, int(pass_count) + 1)

  key = (int(player_bits), int(opponent_bits), int(pass_count))
  cached = cache.exact_transposition.get(key) if int(cache.hash_level) > 1 else None
  if cached is not None:
    return int(cached)

  best = LOSS_SCORE
  for move_index in ordered_moves(int(player_bits), int(opponent_bits), bitboard_to_moves(legal_bb), None):
    next_player, next_opponent = apply_move_bits(int(player_bits), int(opponent_bits), int(move_index))
    score = -solve_exact(cache, int(next_opponent), int(next_player), -int(beta), -int(alpha), deadline_s, 0)
    if score > int(best):
      best = int(score)
    if int(best) > int(alpha):
      alpha = int(best)
    if int(alpha) >= int(beta):
      break

  store_exact_transposition(cache, key, int(best))
  return int(best)


def negamax(cache, player_bits: int, opponent_bits: int, depth: int, alpha: int, beta: int, deadline_s: float | None, pass_count: int) -> int:
  check_deadline(deadline_s)

  legal_bb = legal_moves_bitboard(int(player_bits), int(opponent_bits))
  empties = BOARD_CELL_COUNT - bit_count(int(player_bits) | int(opponent_bits))

  if legal_bb == 0:
    opponent_legal_bb = legal_moves_bitboard(int(opponent_bits), int(player_bits))
    if opponent_legal_bb == 0:
      return terminal_score(int(player_bits), int(opponent_bits))
    return -negamax(cache, int(opponent_bits), int(player_bits), int(depth), -int(beta), -int(alpha), deadline_s, int(pass_count) + 1)

  if empties <= int(cache.exact_threshold):
    return solve_exact(cache, int(player_bits), int(opponent_bits), int(alpha), int(beta), deadline_s, int(pass_count))

  if int(depth) <= 0:
    return evaluate_position(int(player_bits), int(opponent_bits), sacrifice_level=int(cache.sacrifice_level))

  original_alpha = int(alpha)
  key = (int(player_bits), int(opponent_bits))
  tt_entry = cache.transposition.get(key) if int(cache.hash_level) > 0 else None
  if tt_entry is not None and int(tt_entry.depth) >= int(depth):
    if int(tt_entry.bound) == BOUND_EXACT:
      return int(tt_entry.score)
    if int(tt_entry.bound) == BOUND_LOWER:
      alpha = max(int(alpha), int(tt_entry.score))
    elif int(tt_entry.bound) == BOUND_UPPER:
      beta = min(int(beta), int(tt_entry.score))
    if int(alpha) >= int(beta):
      return int(tt_entry.score)

  best_score = LOSS_SCORE
  best_move: int | None = None
  for move_index in ordered_moves(int(player_bits), int(opponent_bits), bitboard_to_moves(legal_bb), None if tt_entry is None else tt_entry.best_move):
    next_player, next_opponent = apply_move_bits(int(player_bits), int(opponent_bits), int(move_index))
    score = -negamax(cache, int(next_opponent), int(next_player), int(depth) - 1, -int(beta), -int(alpha), deadline_s, 0)
    if score > int(best_score):
      best_score = int(score)
      best_move = int(move_index)
    if int(best_score) > int(alpha):
      alpha = int(best_score)
    if int(alpha) >= int(beta):
      break

  bound = BOUND_EXACT
  if int(best_score) <= int(original_alpha):
    bound = BOUND_UPPER
  elif int(best_score) >= int(beta):
    bound = BOUND_LOWER

  store_transposition(cache, key, TranspositionEntry(depth=int(depth), score=int(best_score), bound=int(bound), best_move=best_move))
  return int(best_score)
