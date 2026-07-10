// SPDX-FileCopyrightText: 2026 Kento Konishi
// SPDX-License-Identifier: LicenseRef-All-Rights-Reserved

// Chunk-vs-clip-volume culling, ported from the Python fallback in
// src/ludoxel/foundations/mathematics/frustums/clip.py. Corner order and the
// row-major 4x4 clip-matrix layout match that fallback exactly:
// corners = [(x0,y0,z0),(x1,y0,z0),(x0,y1,z0),(x1,y1,z0),
//            (x0,y0,z1),(x1,y0,z1),(x0,y1,z1),(x1,y1,z1)]
pub const CHUNK_SIZE: f32 = 16.0;
pub const MAX_CHUNK_COUNT: usize = 16_777_216;

fn corners_for(cx: f32, cy: f32, cz: f32) -> [(f32, f32, f32); 8] {
  let x0 = cx * CHUNK_SIZE;
  let y0 = cy * CHUNK_SIZE;
  let z0 = cz * CHUNK_SIZE;
  let x1 = x0 + CHUNK_SIZE;
  let y1 = y0 + CHUNK_SIZE;
  let z1 = z0 + CHUNK_SIZE;
  [(x0, y0, z0), (x1, y0, z0), (x0, y1, z0), (x1, y1, z0), (x0, y0, z1), (x1, y0, z1), (x0, y1, z1), (x1, y1, z1)]
}

pub fn chunk_intersects_clip_volume(cx: f32, cy: f32, cz: f32, m: &[f32; 16]) -> bool {
  let corners = corners_for(cx, cy, cz);

  let mut all_left = true;
  let mut all_right = true;
  let mut all_bottom = true;
  let mut all_top = true;
  let mut all_near = true;
  let mut all_far = true;

  for (px, py, pz) in corners.iter() {
    let cx_clip = m[0] * px + m[1] * py + m[2] * pz + m[3];
    let cy_clip = m[4] * px + m[5] * py + m[6] * pz + m[7];
    let cz_clip = m[8] * px + m[9] * py + m[10] * pz + m[11];
    let cw_clip = m[12] * px + m[13] * py + m[14] * pz + m[15];

    all_left &= cx_clip < -cw_clip;
    all_right &= cx_clip > cw_clip;
    all_bottom &= cy_clip < -cw_clip;
    all_top &= cy_clip > cw_clip;
    all_near &= cz_clip < -cw_clip;
    all_far &= cz_clip > cw_clip;
  }

  !(all_left || all_right || all_bottom || all_top || all_near || all_far)
}
