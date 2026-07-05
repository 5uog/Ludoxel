// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

// PyO3 binding for the deterministic terrain engine. The compiled module is
// imported as ludoxel.simulation.worlds.generation._terrain_native and must
// keep the exact contract of the pure Python fallback in
// src/ludoxel/simulation/worlds/generation/fallback.py:
//   surface_heights   -> little-endian i32 bytes, C order, shape (nx, nz)
//   terrain_materials -> u8 bytes, C order, shape (nx, ny, nz)

// The engine is split by responsibility: `noise` owns the hashing and
// value-noise primitives, `height` owns surface height, ravine carving, and
// the generation-mode selectors, and `material` owns per-cell material and ore
// selection. This module is only the PyO3 binding surface and holds no terrain
// mathematics.
mod height;
mod material;
mod noise;

use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use pyo3::types::PyBytes;

const MAX_HEIGHT_CELLS: usize = 16_777_216;
const MAX_MATERIAL_CELLS: usize = 134_217_728;

#[pyfunction]
fn surface_heights(py: Python<'_>, seed: i64, version: u32, mode: u32, flat_ground_y: i32, x0: i64, z0: i64, nx: usize, nz: usize) -> PyResult<Py<PyBytes>> {
  let cells = nx.checked_mul(nz).ok_or_else(|| PyValueError::new_err("surface_heights extent overflows"))?;
  if cells > MAX_HEIGHT_CELLS {
    return Err(PyValueError::new_err("surface_heights extent exceeds the supported cell budget"));
  }
  let buffer = py.detach(move || {
    let mut out: Vec<u8> = Vec::with_capacity(cells * 4);
    for ix in 0..nx {
      let wx = x0 + ix as i64;
      for iz in 0..nz {
        let h = height::surface_height(seed, version, mode, flat_ground_y, wx, z0 + iz as i64);
        out.extend_from_slice(&(h as i32).to_le_bytes());
      }
    }
    out
  });
  Ok(PyBytes::new(py, &buffer).unbind())
}

#[pyfunction]
#[allow(clippy::too_many_arguments)]
fn terrain_materials(py: Python<'_>, seed: i64, version: u32, mode: u32, flat_ground_y: i32, x0: i64, y0: i64, z0: i64, nx: usize, ny: usize, nz: usize) -> PyResult<Py<PyBytes>> {
  let cells = nx
    .checked_mul(ny)
    .and_then(|v| v.checked_mul(nz))
    .ok_or_else(|| PyValueError::new_err("terrain_materials extent overflows"))?;
  if cells > MAX_MATERIAL_CELLS {
    return Err(PyValueError::new_err("terrain_materials extent exceeds the supported cell budget"));
  }
  let buffer = py.detach(move || {
    let mut out: Vec<u8> = vec![0u8; cells];
    let mut index = 0usize;
    let mut column_heights: Vec<i64> = vec![0i64; nz];
    for ix in 0..nx {
      let wx = x0 + ix as i64;
      for (iz, slot) in column_heights.iter_mut().enumerate() {
        *slot = height::surface_height(seed, version, mode, flat_ground_y, wx, z0 + iz as i64);
      }
      for iy in 0..ny {
        let wy = y0 + iy as i64;
        for iz in 0..nz {
          let wz = z0 + iz as i64;
          out[index] = material::material_code(seed, version, mode, flat_ground_y, wx, wy, wz, column_heights[iz]);
          index += 1;
        }
      }
    }
    out
  });
  Ok(PyBytes::new(py, &buffer).unbind())
}

#[pyfunction]
fn native_build_info() -> &'static str {
  concat!("rust:", env!("CARGO_PKG_VERSION"))
}

#[pymodule]
fn _terrain_native(m: &Bound<'_, PyModule>) -> PyResult<()> {
  m.add_function(wrap_pyfunction!(surface_heights, m)?)?;
  m.add_function(wrap_pyfunction!(terrain_materials, m)?)?;
  m.add_function(wrap_pyfunction!(native_build_info, m)?)?;
  Ok(())
}
