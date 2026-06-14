# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field

from ludoxel.application.preferences.clouds import (
  DEFAULT_CLOUD_FIXED_Y,
  DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED,
  DEFAULT_CLOUD_PREFERRED_Y_MAX,
  DEFAULT_CLOUD_PREFERRED_Y_MIN,
  DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT,
  DEFAULT_CLOUD_SPAWN_Y_MAX,
  DEFAULT_CLOUD_SPAWN_Y_MIN,
  DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND,
  DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND,
  DEFAULT_CLOUD_SPEED_VARIATION_ENABLED,
)
from ludoxel.foundations.mathematics.chunks.grid import CHUNK_SIZE
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.simulation.worlds.config.render_distance import clamp_render_distance_chunks

RENDER_DISTANCE_FADE_START_FRACTION: float = 0.85
CLOUD_RENDER_DISTANCE_MULTIPLIER: float = 1.5
CLOUD_MIN_VISIBLE_RADIUS_BLOCKS: float = 128.0


def render_distance_radius_blocks(render_distance_chunks: int) -> float:
  """
  chunk 単位の render distance を、camera 中心の水平 (XZ 平面) 可視半径へ block 単位で変換する。
  入力は `clamp_render_distance_chunks` で許容区間へ射影した整数 chunk 数であり、返値は `render_distance_chunks * CHUNK_SIZE` の非負実数である。
  この半径は world geometry の fog fade 終端と shadow coverage の基準として、全描画対象が同一の距離基準を共有するために用いる。
  """
  return float(int(clamp_render_distance_chunks(int(render_distance_chunks))) * int(CHUNK_SIZE))


def render_distance_fog_range(render_distance_chunks: int, z_far: float) -> tuple[float, float]:
  """
  world geometry に適用する距離 fog の開始距離と終了距離を、camera からの 3D 距離 (block 単位) の組として返す。
  終了距離は render distance 半径と camera far plane `z_far` の小さい方であり、far plane による硬い clip より手前で完全に fog 色へ収束させる。
  開始距離は終了距離に `RENDER_DISTANCE_FADE_START_FRACTION` を乗じた値であり、返値は常に `start <= end` を満たす。
  この範囲は world block、falling block、break particle、player/AI model、Othello piece が共有し、shader 及び CPU 側ではこの組を camera と対象の 3D 距離 `length(world_pos - camera_world_pos)` と比較するため、横移動だけでなく camera の上昇・下降にも fade が反応する。
  """
  end = min(float(render_distance_radius_blocks(int(render_distance_chunks))), float(z_far))
  start = float(end) * float(RENDER_DISTANCE_FADE_START_FRACTION)
  return (float(start), float(end))


def cloud_fog_range(render_distance_chunks: int, z_far: float) -> tuple[float, float]:
  """
  雲専用の距離 fog 範囲を、camera と雲の水平 (XZ 平面) 距離 (block 単位) の組として返す。
  雲は world block ではなく sky layer として扱うため、終了距離は render distance 半径に `CLOUD_RENDER_DISTANCE_MULTIPLIER` を乗じた値と最低可視半径 `CLOUD_MIN_VISIBLE_RADIUS_BLOCKS` の大きい方を採り、それを camera far plane `z_far` で頭打ちにする。最低可視半径により、render distance が狭い場合でも空が極端に空白にならない。
  開始距離は終了距離に `RENDER_DISTANCE_FADE_START_FRACTION` を乗じた値であり、返値は常に `start <= end` を満たす。
  雲は geometry 用の 3D 距離規則を用いず、水平距離のみで fade するため、y=250 付近の高い雲でも camera との高度差だけで消えることはない。
  """
  end = min(max(float(render_distance_radius_blocks(int(render_distance_chunks))) * float(CLOUD_RENDER_DISTANCE_MULTIPLIER), float(CLOUD_MIN_VISIBLE_RADIUS_BLOCKS)), float(z_far))
  start = float(end) * float(RENDER_DISTANCE_FADE_START_FRACTION)
  return (float(start), float(end))


@dataclass(frozen=True)
class GeometryDistanceFog:
  """
  world geometry を camera からの 3D 距離で fog 色へ収束させるための frame 単位の距離 fade 入力を表す。
  `cam_x`、`cam_y`、`cam_z` は camera eye の world 座標、`start` と `end` は fade 開始・終了距離 (block 単位、`start <= end`)、`color` は不透明 geometry を寄せる fog 色である。
  fade は `length(world_pos - vec3(cam_x, cam_y, cam_z))` の 3D 距離で判定するため、camera の横移動だけでなく上昇・下降にも反応する。`end <= start` の場合 shader 及び CPU 側は fade を無効として扱う。
  world block、falling block、break particle、player/AI model、Othello piece に渡し、雲には渡さない。
  """

  cam_x: float
  cam_y: float
  cam_z: float
  start: float
  end: float
  color: Vec3 = Vec3(0.55, 0.72, 0.98)

  @staticmethod
  def disabled() -> "GeometryDistanceFog":
    """
    fade を発生させない無効 geometry fog を返す。`end <= start` を満たすため、この値を受け取った shader は距離 fade を適用しない。
    first-person hand、held block、special item のように render distance fade の対象外とする描画へ渡す。
    """
    return GeometryDistanceFog(cam_x=0.0, cam_y=0.0, cam_z=0.0, start=0.0, end=-1.0, color=Vec3(0.0, 0.0, 0.0))


@dataclass(frozen=True)
class CloudDistanceFog:
  """
  雲を camera との水平 (XZ 平面) 距離のみで透明度 fade させるための frame 単位の距離 fade 入力を表す。
  `cam_x` と `cam_z` は camera eye の world 座標 XZ 成分、`start` と `end` は fade 開始・終了距離 (block 単位、`start <= end`)、`color` は将来 fog 色を要する拡張のために保持する基準色である。
  雲は sky layer として扱うため、camera との Y 差は fade に使わない。これにより y=250 付近の高い雲でも、水平距離が近ければ camera の高度に関わらず維持される。`end <= start` の場合 shader は fade を無効として扱う。
  geometry 用の 3D 距離規則とは別の contract であり、両者を取り違えないために型として分離する。
  """

  cam_x: float
  cam_z: float
  start: float
  end: float
  color: Vec3 = Vec3(0.55, 0.72, 0.98)

  @staticmethod
  def disabled() -> "CloudDistanceFog":
    """
    fade を発生させない無効 cloud fog を返す。`end <= start` を満たすため、この値を受け取った shader は水平距離 fade を適用しない。
    """
    return CloudDistanceFog(cam_x=0.0, cam_z=0.0, start=0.0, end=-1.0, color=Vec3(0.0, 0.0, 0.0))


@dataclass(frozen=True)
class BackendCameraParams:
  z_near: float = 0.05
  z_far: float = 200.0


@dataclass(frozen=True)
class BackendShadowParams:
  enabled: bool = True
  stabilize: bool = True
  size: int = 2048
  dark_mul: float = 0.20
  cull_front: bool = False
  bias_min: float = 0.00005
  bias_slope: float = 0.00050
  poly_offset_factor: float = 0.50
  poly_offset_units: float = 0.75


@dataclass(frozen=True)
class BackendSunParams:
  azimuth_deg: float = 45.0
  elevation_deg: float = 60.0
  distance: float = 150.0
  half_angle_deg: float = 2.6
  light_distance: float = 60.0
  ortho_radius: float = 30.0
  ortho_near: float = 0.1
  ortho_far: float = 140.0


@dataclass(frozen=True)
class BackendCloudParams:
  y: int = DEFAULT_CLOUD_FIXED_Y
  thickness: int = 3
  macro: int = 32
  rects_per_cell: int = 1
  candidates_per_cell: int = 5
  view_radius: int = 150
  speed_x: float = 0.70
  speed_z: float = 0.10
  speed_variation_enabled: bool = DEFAULT_CLOUD_SPEED_VARIATION_ENABLED
  speed_min_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND
  speed_max_blocks_per_second: float = DEFAULT_CLOUD_SPEED_MAX_BLOCKS_PER_SECOND
  height_variation_enabled: bool = DEFAULT_CLOUD_HEIGHT_VARIATION_ENABLED
  spawn_y_min: int = DEFAULT_CLOUD_SPAWN_Y_MIN
  spawn_y_max: int = DEFAULT_CLOUD_SPAWN_Y_MAX
  preferred_y_min: int = DEFAULT_CLOUD_PREFERRED_Y_MIN
  preferred_y_max: int = DEFAULT_CLOUD_PREFERRED_Y_MAX
  preferred_y_probability_percent: int = DEFAULT_CLOUD_PREFERRED_Y_PROBABILITY_PERCENT
  color: Vec3 = Vec3(1.0, 1.0, 1.0)
  alpha: float = 0.90
  seed: int = 1337
  candidate_drop_threshold: float = 0.20
  overlap_thresh: float = 0.35
  rect_margin: int = 5
  rect_size_min: int = 7
  rect_size_range: int = 8
  alpha_min: float = 0.88
  alpha_range: float = 0.12


@dataclass(frozen=True)
class BackendSkyParams:
  clear_color: Vec3 = Vec3(0.55, 0.72, 0.98)


@dataclass(frozen=True)
class BackendRendererParams:
  camera: BackendCameraParams = field(default_factory=BackendCameraParams)
  shadow: BackendShadowParams = field(default_factory=BackendShadowParams)
  sun: BackendSunParams = field(default_factory=BackendSunParams)
  clouds: BackendCloudParams = field(default_factory=BackendCloudParams)
  sky: BackendSkyParams = field(default_factory=BackendSkyParams)


def default_backend_renderer_params() -> BackendRendererParams:
  return BackendRendererParams()
