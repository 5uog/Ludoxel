// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

mod bitboard;
mod evaluation;
mod search;

use std::time::{Duration, Instant};

use pyo3::exceptions::PyTimeoutError;
use pyo3::prelude::*;

fn deadline_from_budget(budget_s: Option<f64>) -> Option<Instant> {
  budget_s.map(|seconds| Instant::now() + Duration::from_secs_f64(seconds.max(0.0)))
}

fn timeout_error() -> PyErr {
  PyTimeoutError::new_err("othello native search deadline exceeded")
}

#[pyfunction]
fn legal_moves_bitboard(player_bits: u64, opponent_bits: u64) -> u64 {
  bitboard::legal_moves_bitboard(player_bits, opponent_bits)
}

#[pyfunction]
fn apply_move_bits(player_bits: u64, opponent_bits: u64, move_index: u32) -> (u64, u64) {
  bitboard::apply_move_bits(player_bits, opponent_bits, move_index)
}

#[pyfunction]
fn evaluate_position(player_bits: u64, opponent_bits: u64, sacrifice_level: i64) -> i64 {
  evaluation::evaluate_position(player_bits, opponent_bits, sacrifice_level)
}

#[pyfunction]
fn terminal_score(player_bits: u64, opponent_bits: u64) -> i64 {
  evaluation::terminal_score(player_bits, opponent_bits)
}

#[pyfunction]
#[pyo3(signature = (player_bits, opponent_bits, depth, sacrifice_level, budget_s=None))]
fn classic_root_scores(py: Python<'_>, player_bits: u64, opponent_bits: u64, depth: i64, sacrifice_level: i64, budget_s: Option<f64>) -> PyResult<Vec<(u32, f64)>> {
  let deadline = deadline_from_budget(budget_s);
  py.detach(move || search::classic_root_scores(player_bits, opponent_bits, depth, sacrifice_level, deadline)).map_err(|_| timeout_error())
}

#[pyclass]
struct InsaneSearch {
  state: search::SearchState,
}

#[pymethods]
impl InsaneSearch {
  #[new]
  fn new(hash_level: i64, sacrifice_level: i64) -> Self {
    InsaneSearch { state: search::SearchState::new(hash_level, sacrifice_level) }
  }

  fn clear(&mut self) {
    self.state.clear();
  }

  fn root_best_move(&self, player_bits: u64, opponent_bits: u64) -> Option<u32> {
    self.state.root_best_move(player_bits, opponent_bits)
  }

  #[pyo3(signature = (player_bits, opponent_bits, depth, alpha, beta, budget_s=None, pass_count=0))]
  #[allow(clippy::too_many_arguments)]
  fn negamax(&mut self, py: Python<'_>, player_bits: u64, opponent_bits: u64, depth: i64, alpha: i64, beta: i64, budget_s: Option<f64>, pass_count: i64) -> PyResult<i64> {
    let deadline = deadline_from_budget(budget_s);
    let state = &mut self.state;
    py.detach(move || state.negamax(player_bits, opponent_bits, depth, alpha, beta, deadline, pass_count)).map_err(|_| timeout_error())
  }

  #[pyo3(signature = (player_bits, opponent_bits, alpha, beta, budget_s=None, pass_count=0))]
  fn solve_exact(&mut self, py: Python<'_>, player_bits: u64, opponent_bits: u64, alpha: i64, beta: i64, budget_s: Option<f64>, pass_count: i64) -> PyResult<i64> {
    let deadline = deadline_from_budget(budget_s);
    let state = &mut self.state;
    py.detach(move || state.solve_exact(player_bits, opponent_bits, alpha, beta, deadline, pass_count)).map_err(|_| timeout_error())
  }
}

#[pyfunction]
fn native_build_info() -> &'static str {
  concat!("rust:", env!("CARGO_PKG_VERSION"))
}

#[pymodule]
fn _othello_native(m: &Bound<'_, PyModule>) -> PyResult<()> {
  m.add_class::<InsaneSearch>()?;
  m.add_function(wrap_pyfunction!(legal_moves_bitboard, m)?)?;
  m.add_function(wrap_pyfunction!(apply_move_bits, m)?)?;
  m.add_function(wrap_pyfunction!(evaluate_position, m)?)?;
  m.add_function(wrap_pyfunction!(terminal_score, m)?)?;
  m.add_function(wrap_pyfunction!(classic_root_scores, m)?)?;
  m.add_function(wrap_pyfunction!(native_build_info, m)?)?;
  Ok(())
}
