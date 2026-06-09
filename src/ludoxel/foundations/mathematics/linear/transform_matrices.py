# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math

import numpy as np


def identity_matrix() -> np.ndarray:
  """
  `np.float32` の shape `(4, 4)` を持つ単位変換行列を返す。
  model-space から world-space への個別変換を組み立てる関数群は、この行列を基準に translation、scale、rotation 成分を上書きする。
  """
  return np.identity(4, dtype=np.float32)


def translate_matrix(x: float, y: float, z: float) -> np.ndarray:
  """
  三次元平行移動を shape `(4, 4)` の homogeneous transform として表す。
  返値 dtype は `np.float32` であり、移動量 `(x, y, z)` は列 3 の上三成分に格納される。
  """
  matrix = identity_matrix()
  matrix[0, 3] = float(x)
  matrix[1, 3] = float(y)
  matrix[2, 3] = float(z)
  return matrix


def scale_matrix(x: float, y: float, z: float) -> np.ndarray:
  """
  各軸の独立 scale を shape `(4, 4)` の homogeneous transform として表す。
  `x`、`y`、`z` は対角成分 `m[0,0]`、`m[1,1]`、`m[2,2]` に入り、block や player visual の model matrix 生成で形状寸法を固定する。
  """
  matrix = identity_matrix()
  matrix[0, 0] = float(x)
  matrix[1, 1] = float(y)
  matrix[2, 2] = float(z)
  return matrix


def rotate_x_rad_matrix(rad: float) -> np.ndarray:
  """
  x 軸まわりの回転角 `rad` を radian 単位で受け取り、shape `(4, 4)` の回転行列を返す。
  y-z 平面の成分に `cos(rad)` と `sin(rad)` を配置し、右手系の column vector 変換として後続の model matrix 合成に使われる。
  """
  matrix = identity_matrix()
  c = math.cos(float(rad))
  s = math.sin(float(rad))
  matrix[1, 1] = float(c)
  matrix[1, 2] = float(-s)
  matrix[2, 1] = float(s)
  matrix[2, 2] = float(c)
  return matrix


def rotate_y_rad_matrix(rad: float) -> np.ndarray:
  """
  y 軸まわりの回転角 `rad` を radian 単位で受け取り、shape `(4, 4)` の回転行列を返す。
  x-z 平面の成分に `cos(rad)` と `sin(rad)` を配置し、yaw や item pose の水平方向回転を同じ積順で表す。
  """
  matrix = identity_matrix()
  c = math.cos(float(rad))
  s = math.sin(float(rad))
  matrix[0, 0] = float(c)
  matrix[0, 2] = float(-s)
  matrix[2, 0] = float(s)
  matrix[2, 2] = float(c)
  return matrix


def rotate_z_rad_matrix(rad: float) -> np.ndarray:
  """
  z 軸まわりの回転角 `rad` を radian 単位で受け取り、shape `(4, 4)` の回転行列を返す。
  x-y 平面の成分に `cos(rad)` と `sin(rad)` を配置し、HUD から独立した三次元 model pose の基礎回転として用いる。
  """
  matrix = identity_matrix()
  c = math.cos(float(rad))
  s = math.sin(float(rad))
  matrix[0, 0] = float(c)
  matrix[0, 1] = float(-s)
  matrix[1, 0] = float(s)
  matrix[1, 1] = float(c)
  return matrix


def rotate_x_deg_matrix(deg: float) -> np.ndarray:
  """
  degree 単位の x 軸回転角を radian へ変換して回転行列を生成する。
  角度単位の変換をこの wrapper に閉じ込め、visual pose の呼び出し側は degree 表現のまま x 軸回転を指定できる。
  """
  return rotate_x_rad_matrix(math.radians(float(deg)))


def rotate_y_deg_matrix(deg: float) -> np.ndarray:
  """
  degree 単位の y 軸回転角を radian へ変換して回転行列を生成する。
  player yaw や third-person visual など degree で保持される角度を、matrix 生成時に一貫して radian へ射影する。
  """
  return rotate_y_rad_matrix(math.radians(float(deg)))


def rotate_z_deg_matrix(deg: float) -> np.ndarray:
  """
  degree 単位の z 軸回転角を radian へ変換し、shape `(4, 4)` の回転行列を生成する。
  visual animation が保持する degree 値は、この関数を経て renderer へ渡す行列形式へ射影される。
  """
  return rotate_z_rad_matrix(math.radians(float(deg)))


def compose_matrices(*matrices: np.ndarray) -> np.ndarray:
  """
  複数の shape `(4, 4)` の行列を、与えられた順序で左から順に合成する。
  初期値は単位行列であり、各 step は `out = out @ matrix` として `np.float32` に戻されるため、
  呼び出し側は translation、rotation、scale の記述順を model matrix の積順として扱う。
  """
  out = identity_matrix()
  for matrix in matrices:
    out = (out @ np.asarray(matrix, dtype=np.float32)).astype(np.float32)
  return out
