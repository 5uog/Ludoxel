# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.scalars.numeric import clamp01f, lerpf
from ludoxel.foundations.mathematics.voxels.faces import FACE_NEG_X, FACE_NEG_Y, FACE_POS_X, FACE_POS_Y, FACE_POS_Z
from ludoxel.presentation.rendering.contracts.lookups import UVRect
from ludoxel.simulation.blocks.models.common import LocalBox


def atlas_uv_rect(atlas: UVRect, u0: float, v0: float, u1: float, v1: float) -> UVRect:
  """
  親 atlas rectangle の内部で、局所 rectangle `(u0, v0, u1, v1)` を affine interpolation により UV 空間へ写す。
  face-local UV 算出の最小単位である。
  """
  atlas_u0, atlas_v0, atlas_u1, atlas_v1 = atlas
  return (lerpf(atlas_u0, atlas_u1, clamp01f(u0)), lerpf(atlas_v0, atlas_v1, clamp01f(v0)), lerpf(atlas_u0, atlas_u1, clamp01f(u1)), lerpf(atlas_v0, atlas_v1, clamp01f(v1)))


def sub_uv_rect(atlas: UVRect, face_idx: int, box: LocalBox) -> UVRect:
  """
  指定 face 上で local box の extents が占める幾何的 sub-rectangle を UV rectangle として求める。
  face texture が cuboid geometry だけで決まる block family の既定写像である。
  """
  if int(face_idx) == FACE_POS_X:
    u0, u1 = float(box.mn_z), float(box.mx_z)
    v0, v1 = float(box.mn_y), float(box.mx_y)
  elif int(face_idx) == FACE_NEG_X:
    u0, u1 = float(box.mx_z), float(box.mn_z)
    v0, v1 = float(box.mn_y), float(box.mx_y)
  elif int(face_idx) == FACE_POS_Y:
    u0, u1 = float(box.mn_x), float(box.mx_x)
    v0, v1 = float(box.mn_z), float(box.mx_z)
  elif int(face_idx) == FACE_NEG_Y:
    u0, u1 = float(box.mn_x), float(box.mx_x)
    v0, v1 = float(box.mx_z), float(box.mn_z)
  elif int(face_idx) == FACE_POS_Z:
    u0, u1 = float(box.mx_x), float(box.mn_x)
    v0, v1 = float(box.mn_y), float(box.mx_y)
  else:
    u0, u1 = float(box.mn_x), float(box.mx_x)
    v0, v1 = float(box.mn_y), float(box.mx_y)
  return atlas_uv_rect(atlas, u0, v0, u1, v1)


def fence_gate_uv_rect(atlas: UVRect, face_idx: int, box: LocalBox) -> UVRect:
  """
  fence gate cuboid に固有の face-local UV を選択する。
  細い柱や横木では full cube と同じ左右反転規則を適用すると atlas 方向が崩れるため、この関数が gate 専用の向きを保持する。
  """
  if int(face_idx) in (FACE_POS_X, FACE_NEG_X):
    u0, u1 = float(box.mn_z), float(box.mx_z)
    v0, v1 = float(box.mn_y), float(box.mx_y)
  elif int(face_idx) in (FACE_POS_Y, FACE_NEG_Y):
    u0, u1 = float(box.mn_x), float(box.mx_x)
    v0, v1 = float(box.mn_z), float(box.mx_z)
  else:
    u0, u1 = float(box.mn_x), float(box.mx_x)
    v0, v1 = float(box.mn_y), float(box.mx_y)
  return atlas_uv_rect(atlas, u0, v0, u1, v1)
