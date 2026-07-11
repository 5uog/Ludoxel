// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

// Single ray-vs-AABB slab test with face-of-entry/exit resolution. Face
// indices follow the Ludoxel voxel-face contract in
// src/ludoxel/foundations/mathematics/voxels/faces.py:
//   0 = +X, 1 = -X, 2 = +Y, 3 = -Y, 4 = +Z, 5 = -Z
const FACE_POS_X: i32 = 0;
const FACE_NEG_X: i32 = 1;
const FACE_POS_Y: i32 = 2;
const FACE_NEG_Y: i32 = 3;
const FACE_POS_Z: i32 = 4;
const FACE_NEG_Z: i32 = 5;

fn enter_face_for_axis(axis: usize, inv_dir: f64) -> i32 {
  match axis {
    0 => {
      if inv_dir >= 0.0 {
        FACE_NEG_X
      } else {
        FACE_POS_X
      }
    }
    1 => {
      if inv_dir >= 0.0 {
        FACE_NEG_Y
      } else {
        FACE_POS_Y
      }
    }
    _ => {
      if inv_dir >= 0.0 {
        FACE_NEG_Z
      } else {
        FACE_POS_Z
      }
    }
  }
}

fn exit_face_for_axis(axis: usize, inv_dir: f64) -> i32 {
  match axis {
    0 => {
      if inv_dir >= 0.0 {
        FACE_POS_X
      } else {
        FACE_NEG_X
      }
    }
    1 => {
      if inv_dir >= 0.0 {
        FACE_POS_Y
      } else {
        FACE_NEG_Y
      }
    }
    _ => {
      if inv_dir >= 0.0 {
        FACE_POS_Z
      } else {
        FACE_NEG_Z
      }
    }
  }
}

/// Returns (t_enter, point.x, point.y, point.z, face) or None, matching the
/// contract of the Python fallback `ray_aabb_face` in
/// src/ludoxel/foundations/mathematics/geometry/ray_aabb.py.
#[allow(clippy::too_many_arguments)]
pub fn ray_aabb_face(ox: f64, oy: f64, oz: f64, dx: f64, dy: f64, dz: f64, mnx: f64, mny: f64, mnz: f64, mxx: f64, mxy: f64, mxz: f64) -> Option<(f64, f64, f64, f64, i32)> {
  let o = [ox, oy, oz];
  let d = [dx, dy, dz];
  let mn = [mnx, mny, mnz];
  let mx = [mxx, mxy, mxz];

  let mut tmin = -1e30f64;
  let mut tmax = 1e30f64;
  let mut enter_face: i32 = -1;
  let mut exit_face: i32 = -1;

  for axis in 0..3usize {
    let o_comp = o[axis];
    let d_comp = d[axis];
    let mn_comp = mn[axis];
    let mx_comp = mx[axis];

    if d_comp.abs() < 1e-12 {
      if o_comp < mn_comp || o_comp > mx_comp {
        return None;
      }
      continue;
    }

    let inv = 1.0 / d_comp;
    let mut t1 = (mn_comp - o_comp) * inv;
    let mut t2 = (mx_comp - o_comp) * inv;

    if t1 > t2 {
      std::mem::swap(&mut t1, &mut t2);
    }

    if t1 > tmin {
      tmin = t1;
      enter_face = enter_face_for_axis(axis, inv);
    }

    if t2 < tmax {
      tmax = t2;
      exit_face = exit_face_for_axis(axis, inv);
    }

    if tmin > tmax {
      return None;
    }
  }

  if tmax < 0.0 {
    return None;
  }

  let (t_enter, face) = if tmin >= 0.0 { (tmin, enter_face) } else { (tmax, exit_face) };

  let px = o[0] + d[0] * t_enter;
  let py = o[1] + d[1] * t_enter;
  let pz = o[2] + d[2] * t_enter;

  Some((t_enter, px, py, pz, face))
}
