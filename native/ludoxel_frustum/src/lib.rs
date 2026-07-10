// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use pyo3::types::PyBytes;

const CHUNK_SIZE: f32 = 16.0;
const MAX_CHUNK_COUNT: usize = 16_777_216;

fn read_i64_le(bytes: &[u8], offset: usize) -> i64 {
  i64::from_le_bytes(bytes[offset..offset + 8].try_into().unwrap())
}

fn read_f32_le(bytes: &[u8], offset: usize) -> f32 {
  f32::from_le_bytes(bytes[offset..offset + 4].try_into().unwrap())
}

#[pyfunction]
fn chunks_intersect_clip_volume_batch(py: Python<'_>, keys_xyz: &[u8], matrix: &[u8], count: usize) -> PyResult<Py<PyBytes>> {
  if count > MAX_CHUNK_COUNT {
    return Err(PyValueError::new_err("chunks_intersect_clip_volume_batch count exceeds the supported chunk budget"));
  }
  if keys_xyz.len() != count * 3 * 8 {
    return Err(PyValueError::new_err("keys_xyz byte length does not match count rows of 3 little-endian int64 values"));
  }
  if matrix.len() != 16 * 4 {
    return Err(PyValueError::new_err("matrix must be 16 little-endian float32 values (64 bytes)"));
  }

  let mut m = [0f32; 16];
  for (i, slot) in m.iter_mut().enumerate() {
    *slot = read_f32_le(matrix, i * 4);
  }

  let out = py.detach(move || {
    let mut result = vec![0u8; count];
    for idx in 0..count {
      let base = idx * 3 * 8;
      let cx = read_i64_le(keys_xyz, base) as f32;
      let cy = read_i64_le(keys_xyz, base + 8) as f32;
      let cz = read_i64_le(keys_xyz, base + 16) as f32;

      let x0 = cx * CHUNK_SIZE;
      let y0 = cy * CHUNK_SIZE;
      let z0 = cz * CHUNK_SIZE;
      let x1 = x0 + CHUNK_SIZE;
      let y1 = y0 + CHUNK_SIZE;
      let z1 = z0 + CHUNK_SIZE;

      let corners: [(f32, f32, f32); 8] = [(x0, y0, z0), (x1, y0, z0), (x0, y1, z0), (x1, y1, z0), (x0, y0, z1), (x1, y0, z1), (x0, y1, z1), (x1, y1, z1)];

      let mut all_left = true;
      let mut all_right = true;
      let mut all_bottom = true;
      let mut all_top = true;
      let mut all_near = true;
      let mut all_far = true;

      for (px, py_, pz) in corners.iter() {
        let cx_clip = m[0] * px + m[1] * py_ + m[2] * pz + m[3];
        let cy_clip = m[4] * px + m[5] * py_ + m[6] * pz + m[7];
        let cz_clip = m[8] * px + m[9] * py_ + m[10] * pz + m[11];
        let cw_clip = m[12] * px + m[13] * py_ + m[14] * pz + m[15];

        all_left &= cx_clip < -cw_clip;
        all_right &= cx_clip > cw_clip;
        all_bottom &= cy_clip < -cw_clip;
        all_top &= cy_clip > cw_clip;
        all_near &= cz_clip < -cw_clip;
        all_far &= cz_clip > cw_clip;
      }

      let outside = all_left || all_right || all_bottom || all_top || all_near || all_far;
      result[idx] = u8::from(!outside);
    }
    result
  });

  Ok(PyBytes::new(py, &out).unbind())
}

#[pyfunction]
fn native_build_info() -> &'static str {
  concat!("rust:", env!("CARGO_PKG_VERSION"))
}

#[pymodule]
fn _frustum_native(m: &Bound<'_, PyModule>) -> PyResult<()> {
  m.add_function(wrap_pyfunction!(chunks_intersect_clip_volume_batch, m)?)?;
  m.add_function(wrap_pyfunction!(native_build_info, m)?)?;
  Ok(())
}
