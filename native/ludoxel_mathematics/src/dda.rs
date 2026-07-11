// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

pub const MAX_TRAVERSAL_CELLS: usize = 262_144;

pub struct DdaHit {
  pub cell_x: i64,
  pub cell_y: i64,
  pub cell_z: i64,
  pub t: f64,
  pub enter_face: i32,
}

fn int_bound(s: f64, ds: f64) -> f64 {
  if ds > 0.0 {
    let frac = s - s.floor();
    (1.0 - frac) / ds
  } else {
    let frac = s - s.floor();
    frac / (-ds)
  }
}

pub fn dda_grid_traverse(ox: f64, oy: f64, oz: f64, dx: f64, dy: f64, dz: f64, t_max: f64, cell_size: f64) -> Result<Vec<DdaHit>, &'static str> {
  let mut hits = Vec::new();

  if dx.abs() < 1e-12 && dy.abs() < 1e-12 && dz.abs() < 1e-12 {
    return Ok(hits);
  }

  let mut x = (ox / cell_size).floor() as i64;
  let mut y = (oy / cell_size).floor() as i64;
  let mut z = (oz / cell_size).floor() as i64;

  let step_x: i64 = if dx > 0.0 { 1 } else { -1 };
  let step_y: i64 = if dy > 0.0 { 1 } else { -1 };
  let step_z: i64 = if dz > 0.0 { 1 } else { -1 };

  let mut tmx = if dx.abs() > 1e-12 { int_bound(ox / cell_size, dx) } else { 1e30 };
  let mut tmy = if dy.abs() > 1e-12 { int_bound(oy / cell_size, dy) } else { 1e30 };
  let mut tmz = if dz.abs() > 1e-12 { int_bound(oz / cell_size, dz) } else { 1e30 };

  let tdx = if dx.abs() > 1e-12 { cell_size / dx.abs() } else { 1e30 };
  let tdy = if dy.abs() > 1e-12 { cell_size / dy.abs() } else { 1e30 };
  let tdz = if dz.abs() > 1e-12 { cell_size / dz.abs() } else { 1e30 };

  let mut t = 0.0f64;
  let mut enter_face: i32 = -1;

  while t <= t_max {
    if hits.len() >= MAX_TRAVERSAL_CELLS {
      return Err("dda_grid_traverse exceeds the supported cell budget");
    }

    hits.push(DdaHit { cell_x: x, cell_y: y, cell_z: z, t, enter_face });

    if tmx < tmy && tmx < tmz {
      x += step_x;
      t = tmx;
      tmx += tdx;
      enter_face = if step_x > 0 { 1 } else { 0 };
    } else if tmy < tmz {
      y += step_y;
      t = tmy;
      tmy += tdy;
      enter_face = if step_y > 0 { 3 } else { 2 };
    } else {
      z += step_z;
      t = tmz;
      tmz += tdz;
      enter_face = if step_z > 0 { 5 } else { 4 };
    }
  }

  Ok(hits)
}
