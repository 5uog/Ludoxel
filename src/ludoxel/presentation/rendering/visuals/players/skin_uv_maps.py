# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.voxels.faces import FACE_NEG_X, FACE_NEG_Y, FACE_NEG_Z, FACE_POS_X, FACE_POS_Y, FACE_POS_Z


def skin_cube_uv_map(
  *,
  pos_x: tuple[float, float, float, float],
  neg_x: tuple[float, float, float, float],
  pos_y: tuple[float, float, float, float],
  neg_y: tuple[float, float, float, float],
  pos_z: tuple[float, float, float, float],
  neg_z: tuple[float, float, float, float],
) -> dict[int, tuple[float, float, float, float]]:
  """
  x 軸正方向、x 軸負方向、y 軸正方向、y 軸負方向、z 軸正方向、z 軸負方向の face key を、skin-space pixel rectangle へ写す辞書として生成する。
  arm と sleeve の atlas 指定を明示し、face index の重複管理を避ける。
  """
  return {FACE_POS_X: pos_x, FACE_NEG_X: neg_x, FACE_POS_Y: pos_y, FACE_NEG_Y: neg_y, FACE_POS_Z: pos_z, FACE_NEG_Z: neg_z}


def rotate_uv_rect_180(px_rect: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
  """
  UV rectangle `(u0, v0, u1, v1)` を 180 度回転相当の `(u1, v1, u0, v0)` へ写す。
  mesh convention と raw texture layout の向きが異なる face に適用する involution である。
  """
  return (float(px_rect[2]), float(px_rect[3]), float(px_rect[0]), float(px_rect[1]))


def uv_map_with_rotated_faces(uv_map: dict[int, tuple[float, float, float, float]], *faces: int) -> dict[int, tuple[float, float, float, float]]:
  """
  指定 face にだけ `rotate_uv_rect_180` を適用し、その他の face は元の UV rectangle を保持する。
  atlas data を canonical に保ちながら、renderer の winding と face-local tangent convention に合わせる。
  """
  out = {int(face_idx): tuple(rect) for face_idx, rect in uv_map.items()}
  for face_idx in faces:
    out[int(face_idx)] = rotate_uv_rect_180(out[int(face_idx)])
  return out


RIGHT_ARM_BASE_UV_PX = skin_cube_uv_map(
  pos_x=(40.0, 20.0, 44.0, 32.0), neg_x=(47.0, 20.0, 51.0, 32.0), pos_y=(44.0, 16.0, 47.0, 20.0), neg_y=(47.0, 16.0, 50.0, 20.0), pos_z=(44.0, 20.0, 47.0, 32.0), neg_z=(51.0, 20.0, 54.0, 32.0)
)
RIGHT_ARM_SLEEVE_UV_PX = skin_cube_uv_map(
  pos_x=(40.0, 36.0, 44.0, 48.0), neg_x=(47.0, 36.0, 51.0, 48.0), pos_y=(44.0, 32.0, 47.0, 36.0), neg_y=(47.0, 32.0, 50.0, 36.0), pos_z=(44.0, 36.0, 47.0, 48.0), neg_z=(51.0, 36.0, 54.0, 48.0)
)
LEFT_ARM_BASE_UV_PX = skin_cube_uv_map(
  pos_x=(32.0, 52.0, 36.0, 64.0), neg_x=(39.0, 52.0, 43.0, 64.0), pos_y=(36.0, 48.0, 39.0, 52.0), neg_y=(39.0, 48.0, 42.0, 52.0), pos_z=(36.0, 52.0, 39.0, 64.0), neg_z=(43.0, 52.0, 46.0, 64.0)
)
LEFT_ARM_SLEEVE_UV_PX = skin_cube_uv_map(
  pos_x=(48.0, 52.0, 52.0, 64.0), neg_x=(55.0, 52.0, 59.0, 64.0), pos_y=(52.0, 48.0, 55.0, 52.0), neg_y=(55.0, 48.0, 58.0, 52.0), pos_z=(52.0, 52.0, 55.0, 64.0), neg_z=(59.0, 52.0, 62.0, 64.0)
)

SLIM_RIGHT_ARM_BASE_UV_PX = RIGHT_ARM_BASE_UV_PX
SLIM_RIGHT_ARM_SLEEVE_UV_PX = RIGHT_ARM_SLEEVE_UV_PX

VISUAL_RIGHT_ARM_BASE_UV_PX = uv_map_with_rotated_faces(RIGHT_ARM_BASE_UV_PX, FACE_POS_Y, FACE_NEG_Y)
VISUAL_RIGHT_ARM_SLEEVE_UV_PX = uv_map_with_rotated_faces(RIGHT_ARM_SLEEVE_UV_PX, FACE_POS_Y, FACE_NEG_Y)
VISUAL_LEFT_ARM_BASE_UV_PX = uv_map_with_rotated_faces(LEFT_ARM_BASE_UV_PX, FACE_POS_Y, FACE_NEG_Y)
VISUAL_LEFT_ARM_SLEEVE_UV_PX = uv_map_with_rotated_faces(LEFT_ARM_SLEEVE_UV_PX, FACE_POS_Y, FACE_NEG_Y)
