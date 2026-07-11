// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

mod dda;
mod frustum;
mod mat4;
mod ray_aabb;
mod view_angles;

use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use pyo3::types::PyBytes;

// ---------------------------------------------------------------------
// geometry / voxels / linear (the original three Cython-candidate ports)
// ---------------------------------------------------------------------

#[allow(clippy::too_many_arguments)]
#[pyfunction]
fn ray_aabb_face(ox: f64, oy: f64, oz: f64, dx: f64, dy: f64, dz: f64, mnx: f64, mny: f64, mnz: f64, mxx: f64, mxy: f64, mxz: f64) -> Option<(f64, f64, f64, f64, i32)> {
  ray_aabb::ray_aabb_face(ox, oy, oz, dx, dy, dz, mnx, mny, mnz, mxx, mxy, mxz)
}

#[allow(clippy::too_many_arguments)]
#[pyfunction]
fn dda_grid_traverse_batch(py: Python<'_>, ox: f64, oy: f64, oz: f64, dx: f64, dy: f64, dz: f64, t_max: f64, cell_size: f64) -> PyResult<Py<PyBytes>> {
  let hits = py
    .detach(move || dda::dda_grid_traverse(ox, oy, oz, dx, dy, dz, t_max, cell_size))
    .map_err(PyValueError::new_err)?;

  let mut buffer: Vec<u8> = Vec::with_capacity(hits.len() * 36);
  for hit in &hits {
    buffer.extend_from_slice(&hit.cell_x.to_le_bytes());
    buffer.extend_from_slice(&hit.cell_y.to_le_bytes());
    buffer.extend_from_slice(&hit.cell_z.to_le_bytes());
    buffer.extend_from_slice(&hit.t.to_le_bytes());
    buffer.extend_from_slice(&hit.enter_face.to_le_bytes());
  }

  Ok(PyBytes::new(py, &buffer).unbind())
}

#[pyfunction]
fn forward_from_yaw_pitch_deg(yaw_deg: f64, pitch_deg: f64) -> (f64, f64, f64) {
  view_angles::forward_from_yaw_pitch_deg(yaw_deg, pitch_deg)
}

#[pyfunction]
fn yaw_pitch_deg_from_forward(x: f64, y: f64, z: f64) -> (f64, f64) {
  view_angles::yaw_pitch_deg_from_forward(x, y, z)
}

#[pyfunction]
fn sun_dir_from_az_el_deg(azimuth_deg: f64, elevation_deg: f64) -> (f64, f64, f64) {
  view_angles::sun_dir_from_az_el_deg(azimuth_deg, elevation_deg)
}

// ---------------------------------------------------------------------
// frustum / chunk clip-volume culling
// ---------------------------------------------------------------------

fn read_i64_le(bytes: &[u8], offset: usize) -> i64 {
  i64::from_le_bytes(bytes[offset..offset + 8].try_into().unwrap())
}

fn read_f32_le(bytes: &[u8], offset: usize) -> f32 {
  f32::from_le_bytes(bytes[offset..offset + 4].try_into().unwrap())
}

fn matrix16_from_bytes(bytes: &[u8]) -> PyResult<[f32; 16]> {
  if bytes.len() != 16 * 4 {
    return Err(PyValueError::new_err("matrix must be 16 little-endian float32 values (64 bytes)"));
  }
  let mut m = [0f32; 16];
  for (i, slot) in m.iter_mut().enumerate() {
    *slot = read_f32_le(bytes, i * 4);
  }
  Ok(m)
}

#[pyfunction]
fn chunks_intersect_clip_volume_batch(py: Python<'_>, keys_xyz: &[u8], matrix: &[u8], count: usize) -> PyResult<Py<PyBytes>> {
  if count > frustum::MAX_CHUNK_COUNT {
    return Err(PyValueError::new_err("chunks_intersect_clip_volume_batch count exceeds the supported chunk budget"));
  }
  if keys_xyz.len() != count * 3 * 8 {
    return Err(PyValueError::new_err("keys_xyz byte length does not match count rows of 3 little-endian int64 values"));
  }
  let m = matrix16_from_bytes(matrix)?;

  let out = py.detach(move || {
    let mut result = vec![0u8; count];
    for idx in 0..count {
      let base = idx * 3 * 8;
      let cx = read_i64_le(keys_xyz, base) as f32;
      let cy = read_i64_le(keys_xyz, base + 8) as f32;
      let cz = read_i64_le(keys_xyz, base + 16) as f32;
      result[idx] = u8::from(frustum::chunk_intersects_clip_volume(cx, cy, cz, &m));
    }
    result
  });

  Ok(PyBytes::new(py, &out).unbind())
}

// ---------------------------------------------------------------------
// mat4 / transform_matrices
// ---------------------------------------------------------------------

#[pyfunction]
fn mat4_identity(py: Python<'_>) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::identity())).unbind()
}

#[pyfunction]
fn mat4_perspective(py: Python<'_>, fov_y_deg: f32, aspect: f32, z_near: f32, z_far: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::perspective(fov_y_deg, aspect, z_near, z_far))).unbind()
}

#[allow(clippy::too_many_arguments)]
#[pyfunction]
fn mat4_ortho(py: Python<'_>, left: f32, right: f32, bottom: f32, top: f32, z_near: f32, z_far: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::ortho(left, right, bottom, top, z_near, z_far))).unbind()
}

#[allow(clippy::too_many_arguments)]
#[pyfunction]
fn mat4_look_dir(py: Python<'_>, ex: f32, ey: f32, ez: f32, fx: f32, fy: f32, fz: f32, upx: f32, upy: f32, upz: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::look_dir(ex, ey, ez, fx, fy, fz, upx, upy, upz))).unbind()
}

#[pyfunction]
fn mat4_mul(py: Python<'_>, a: &[u8], b: &[u8]) -> PyResult<Py<PyBytes>> {
  if a.len() != 64 || b.len() != 64 {
    return Err(PyValueError::new_err("mat4_mul operands must each be 64 little-endian float32 bytes"));
  }
  let result = mat4::mul(&mat4::from_bytes(a), &mat4::from_bytes(b));
  Ok(PyBytes::new(py, &mat4::to_bytes(&result)).unbind())
}

#[pyfunction]
fn mat4_translate(py: Python<'_>, x: f32, y: f32, z: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::translate(x, y, z))).unbind()
}

#[pyfunction]
fn mat4_scale(py: Python<'_>, x: f32, y: f32, z: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::scale(x, y, z))).unbind()
}

#[pyfunction]
fn mat4_rotate_x_rad(py: Python<'_>, rad: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::rotate_x_rad(rad))).unbind()
}

#[pyfunction]
fn mat4_rotate_y_rad(py: Python<'_>, rad: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::rotate_y_rad(rad))).unbind()
}

#[pyfunction]
fn mat4_rotate_z_rad(py: Python<'_>, rad: f32) -> Py<PyBytes> {
  PyBytes::new(py, &mat4::to_bytes(&mat4::rotate_z_rad(rad))).unbind()
}

#[pyfunction]
fn mat4_compose(py: Python<'_>, matrices: &[u8], count: usize) -> PyResult<Py<PyBytes>> {
  if matrices.len() != count * 64 {
    return Err(PyValueError::new_err("mat4_compose byte length does not match count rows of 64 bytes"));
  }
  let parsed: Vec<mat4::Mat4> = (0..count).map(|i| mat4::from_bytes(&matrices[i * 64..i * 64 + 64])).collect();
  let result = mat4::compose(&parsed);
  Ok(PyBytes::new(py, &mat4::to_bytes(&result)).unbind())
}

// ---------------------------------------------------------------------

#[pyfunction]
fn native_build_info() -> &'static str {
  concat!("rust:", env!("CARGO_PKG_VERSION"))
}

#[pymodule]
fn _mathematics_native(m: &Bound<'_, PyModule>) -> PyResult<()> {
  m.add_function(wrap_pyfunction!(ray_aabb_face, m)?)?;
  m.add_function(wrap_pyfunction!(dda_grid_traverse_batch, m)?)?;
  m.add_function(wrap_pyfunction!(forward_from_yaw_pitch_deg, m)?)?;
  m.add_function(wrap_pyfunction!(yaw_pitch_deg_from_forward, m)?)?;
  m.add_function(wrap_pyfunction!(sun_dir_from_az_el_deg, m)?)?;
  m.add_function(wrap_pyfunction!(chunks_intersect_clip_volume_batch, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_identity, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_perspective, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_ortho, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_look_dir, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_mul, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_translate, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_scale, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_rotate_x_rad, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_rotate_y_rad, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_rotate_z_rad, m)?)?;
  m.add_function(wrap_pyfunction!(mat4_compose, m)?)?;
  m.add_function(wrap_pyfunction!(native_build_info, m)?)?;
  Ok(())
}
