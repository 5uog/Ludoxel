# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

import numpy as np

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


def identity() -> np.ndarray:
  """
  `np.float32` の 4×4 単位行列を生成する。
  matrix は row-major の NumPy 配列として保持され、
  Ludoxel の view、projection、model 変換は column vector に左から作用する行列積として扱われる。
  """
  return np.identity(4, dtype=np.float32)


def perspective(fov_y_deg: float, aspect: float, z_near: float, z_far: float) -> np.ndarray:
  """
  垂直視野角、aspect、near、far から OpenGL 型の perspective projection matrix を生成する。
  返値 shape は `(4, 4)`、dtype は `np.float32` であり、
  clip 変換は `z_near` と `z_far` を用いて `m[2,2]=(far+near)/(near-far)`、`m[3,2]=-1` を設定する。
  """
  f = 1.0 / math.tan(math.radians(fov_y_deg) * 0.5)
  m = np.zeros((4, 4), dtype=np.float32)
  m[0, 0] = f / max(float(aspect), 1e-9)
  m[1, 1] = f
  m[2, 2] = (z_far + z_near) / (z_near - z_far)
  m[2, 3] = (2.0 * z_far * z_near) / (z_near - z_far)
  m[3, 2] = -1.0
  return m


def ortho(left: float, right: float, bottom: float, top: float, z_near: float, z_far: float) -> np.ndarray:
  """
  左右、上下、near、far の直方体 view volume を clip 空間へ写す orthographic projection matrix を生成する。
  各幅は最低 `1e-9` に下限処理され、返値は shape `(4, 4)`、dtype `np.float32` の行列として shadow map などの正射影経路へ渡される。
  """
  m = np.zeros((4, 4), dtype=np.float32)
  rl = max(right - left, 1e-9)
  tb = max(top - bottom, 1e-9)
  fn = max(z_far - z_near, 1e-9)

  m[0, 0] = 2.0 / rl
  m[1, 1] = 2.0 / tb
  m[2, 2] = -2.0 / fn
  m[3, 3] = 1.0

  m[0, 3] = -(right + left) / rl
  m[1, 3] = -(top + bottom) / tb
  m[2, 3] = -(z_far + z_near) / fn
  return m


def look_dir(eye: Vec3, forward: Vec3, up_hint: Vec3 = Vec3(0.0, 1.0, 0.0)) -> np.ndarray:
  """
  視点位置、forward 方向、上向き候補から view matrix を構成する。
  `forward` を正規化し、`right = up_hint × forward`、`up = forward × right` により直交基底を作り、
  行列の上三行に基底と `eye` に対する内積を格納する。
  """
  f = forward.normalized()
  r = up_hint.cross(f).normalized()
  u = f.cross(r).normalized()

  m = identity()
  (m[0, 0], m[0, 1], m[0, 2]) = r.x, r.y, r.z
  (m[1, 0], m[1, 1], m[1, 2]) = u.x, u.y, u.z
  (m[2, 0], m[2, 1], m[2, 2]) = -f.x, -f.y, -f.z

  m[0, 3] = -r.dot(eye)
  m[1, 3] = -u.dot(eye)
  m[2, 3] = f.dot(eye)
  return m


def mul(a: np.ndarray, b: np.ndarray) -> np.ndarray:
  """
  二つの 4×4 変換行列を NumPy の行列積 `a @ b` で合成し、`np.float32` に戻す。
  呼び出し側は返値の dtype と積順が維持されることに依存して、projection、view、model の合成結果を renderer へ渡す。
  """
  return (a @ b).astype(np.float32)
