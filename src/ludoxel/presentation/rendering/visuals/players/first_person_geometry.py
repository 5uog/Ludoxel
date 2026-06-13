# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
from dataclasses import replace
from typing import Literal

import numpy as np

from ludoxel.foundations.mathematics.linear.transform_matrices import compose_matrices, identity_matrix, rotate_x_deg_matrix, rotate_y_deg_matrix, rotate_z_deg_matrix, scale_matrix, translate_matrix
from ludoxel.foundations.mathematics.scalars.numeric import clampf
from ludoxel.foundations.mathematics.voxels.faces import FACE_POS_Z
from ludoxel.presentation.rendering.contracts.lookups import DefLookup, UVLookup
from ludoxel.presentation.rendering.faces.occlusion import is_local_face_occluded
from ludoxel.presentation.rendering.faces.row_utils import append_face_instance, atlas_face_uv, empty_textured_face_rows, face_rows_from_buffers, model_matrix_for_local_box, skin_uv_rect
from ludoxel.presentation.rendering.visuals.players.held_block_geometry import held_block_kind_scale_multiplier, held_block_model_boxes
from ludoxel.presentation.rendering.visuals.players.render_state import FirstPersonRenderState
from ludoxel.presentation.rendering.visuals.players.skin_uv_maps import SLIM_RIGHT_ARM_BASE_UV_PX, SLIM_RIGHT_ARM_SLEEVE_UV_PX
from ludoxel.simulation.blocks.models.common import LocalBox

SafeFrame = tuple[float, float, float, float]
AnchorMode = Literal["nearest_zero", "min_edge", "max_edge"]

_PX = 1.0 / 16.0
FIRST_PERSON_HAND_NEAR = 0.05
_FIRST_PERSON_REFERENCE_FOV_DEG = 80.0
_FIRST_PERSON_REFERENCE_PROJECTION_Y = 1.0 / math.tan(math.radians(_FIRST_PERSON_REFERENCE_FOV_DEG) * 0.5)
FIRST_PERSON_ARM_HAND_ANCHOR = (0.0, -12.0 * _PX, 0.0)
THIRD_PERSON_RIGHT_HAND_ANCHOR = (0.0, -10.5 * _PX, 0.0)

_ITEM_POS_X = 1.22
_ITEM_POS_Y = -0.94
_ITEM_POS_Z = -1.05
_ITEM_SWING_X_POS_SCALE = -0.40
_ITEM_SWING_Y_POS_SCALE = 0.20
_ITEM_SWING_Z_POS_SCALE = -0.20
_ITEM_PRESWING_ROT_Y_DEG = 45.0
_ITEM_SWING_Y_ROT_AMOUNT_DEG = -20.0
_ITEM_SWING_Z_ROT_AMOUNT_DEG = -20.0
_ITEM_SWING_X_ROT_AMOUNT_DEG = -80.0

_ARM_POS_X = 1.44
_ARM_POS_Y = -0.84
_ARM_POS_Z = -1.0
_ARM_SWING_X_POS_SCALE = -0.30
_ARM_SWING_Y_POS_SCALE = 0.40
_ARM_SWING_Z_POS_SCALE = -0.40
_ARM_PRESWING_ROT_Y_DEG = 45.0
_ARM_SWING_Y_ROT_AMOUNT_DEG = -30.0
_ARM_SWING_Z_ROT_AMOUNT_DEG = 12.0
_ARM_PREROTATION_X_OFFSET_PX = -1.0
_ARM_PREROTATION_Y_OFFSET_PX = 3.6
_ARM_PREROTATION_Z_OFFSET_PX = 3.5
_ARM_ROT_Z_DEG = 60.0
_ARM_ROT_X_DEG = 140.0
_ARM_ROT_Y_DEG = -60.0
_ARM_POSTROTATION_X_OFFSET_PX = 5.6
_ARM_FIRSTPERSON_SCALE = 1.18

_BLOCK_FIRSTPERSON_TRANSLATE_PX = (0.0, 2.5, 0.0)
_BLOCK_FIRSTPERSON_ROTATE_DEG = (5.0, -45.0, 10.0)
_BLOCK_FIRSTPERSON_SCALE = (0.5, 0.5, 0.5)
_BLOCK_THIRDPERSON_TRANSLATE_PX = (0.0, 2.0, 5.0)
_BLOCK_THIRDPERSON_ROTATE_DEG = (75.0, 45.0, 0.0)
_BLOCK_THIRDPERSON_SCALE = (0.3125, 0.3125, 0.3125)

_ARM_SAFE_FRAME: SafeFrame = (-0.98, 1.04, -1.74, 0.98)
_ITEM_SAFE_FRAME: SafeFrame = (-0.98, 1.01, -1.01, 0.98)
_ARM_PROJECTION_SCALE_EXPONENT = 0.55
_ITEM_PROJECTION_SCALE_EXPONENT = 0.45
_ARM_EQUIP_HIDE_DISTANCE = 1.18
_ITEM_EQUIP_HIDE_DISTANCE = 1.12
_RIGHT_EDGE_ANCHOR: AnchorMode = "max_edge"
_BOTTOM_EDGE_ANCHOR: AnchorMode = "min_edge"
_FIRST_PERSON_MIN_SCALE_MULTIPLIER = 0.25
_FIRST_PERSON_SCALE_SEARCH_STEPS = 18
_FIRST_PERSON_FIT_EPSILON = 1e-6

_ARM_BASE_BOX_SLIM = LocalBox(-1.5 * _PX, -12.0 * _PX, -2.0 * _PX, 1.5 * _PX, 0.0, 2.0 * _PX)
_ARM_SLEEVE_BOX_SLIM = LocalBox(-(1.5 + 0.25) * _PX, -(12.0 + 0.25) * _PX, -(2.0 + 0.25) * _PX, (1.5 + 0.25) * _PX, 0.25 * _PX, (2.0 + 0.25) * _PX)
_SPECIAL_ITEM_ICON_BOX = LocalBox(0.0, 0.0, 7.5 * _PX, 16.0 * _PX, 16.0 * _PX, 8.5 * _PX)
_SPECIAL_ITEM_RENDER_SCALE = 1.55
_SPECIAL_ITEM_ROTATE_Z_DEG = 0.0
_SPECIAL_ITEM_UV_RECT = (1.0, 0.0, 0.0, 1.0)


def _arm_swing_terms(first_person: FirstPersonRenderState) -> tuple[float, float, float, float]:
  """
  `p = clamp(swing_progress, 0, 1)` から `sin(pi sqrt(p))`、`sin(pi p^2)`、`sin(pi p)`、`sin(2 pi sqrt(p))` を得る。
  手と腕の位置・回転は同じ attack progress から異なる easing phase を参照するため、ここで四つの成分を揃える。
  """
  swing = clampf(float(first_person.swing_progress), 0.0, 1.0)
  root = math.sin(math.sqrt(swing) * math.pi)
  squared = math.sin(swing * swing * math.pi)
  full = math.sin(swing * math.pi)
  twice = math.sin(math.sqrt(swing) * math.pi * 2.0)
  return (float(root), float(squared), float(full), float(twice))


def _view_bob_transform(first_person: FirstPersonRenderState) -> np.ndarray:
  """
  first-person bob state から `M_bob = T(tx, ty, tz) Rz(roll) Ry(yaw) Rx(pitch)` を生成する。
  保持 item と腕は、それぞれの pose 固有変換へ進む前に同じ camera-space bobbing frame を継承する。
  """
  return compose_matrices(
    translate_matrix(float(first_person.view_bob_x), float(first_person.view_bob_y), float(first_person.view_bob_z)),
    rotate_z_deg_matrix(float(first_person.view_bob_roll_deg)),
    rotate_y_deg_matrix(float(first_person.view_bob_yaw_deg)),
    rotate_x_deg_matrix(float(first_person.view_bob_pitch_deg)),
  )


def build_main_hand_common_transform(first_person: FirstPersonRenderState) -> np.ndarray:
  """
  swing translation、基準手位置、pre-swing 及び swing dependent rotation を順に合成し、main hand の camera-space backbone を生成する。
  held block と特殊 item quad はこの共通 transform を出発点にする。
  """
  root, squared, full, twice = _arm_swing_terms(first_person)
  return compose_matrices(
    translate_matrix(float(_ITEM_SWING_X_POS_SCALE) * float(root), float(_ITEM_SWING_Y_POS_SCALE) * float(twice), float(_ITEM_SWING_Z_POS_SCALE) * float(full)),
    translate_matrix(float(_ITEM_POS_X), float(_ITEM_POS_Y), float(_ITEM_POS_Z)),
    rotate_y_deg_matrix(float(_ITEM_PRESWING_ROT_Y_DEG)),
    rotate_y_deg_matrix(float(_ITEM_SWING_Y_ROT_AMOUNT_DEG) * float(squared)),
    rotate_z_deg_matrix(float(_ITEM_SWING_Z_ROT_AMOUNT_DEG) * float(root)),
    rotate_x_deg_matrix(float(_ITEM_SWING_X_ROT_AMOUNT_DEG) * float(root)),
  )


def build_first_person_item_camera_transform(first_person: FirstPersonRenderState, *, render_scale_multiplier: float = 1.0) -> np.ndarray:
  """
  held block を camera space に置くため、`M_item = M_bob M_hand T_item R_item S_item T(-1/2,-1/2,-1/2)` を構成する。
  scale は block kind ごとの補正を含み、block family が変わっても pivot convention は同一に保たれる。
  """
  uniform_scale = float(render_scale_multiplier)
  return compose_matrices(
    _view_bob_transform(first_person),
    build_main_hand_common_transform(first_person),
    translate_matrix(float(_BLOCK_FIRSTPERSON_TRANSLATE_PX[0]) * _PX, float(_BLOCK_FIRSTPERSON_TRANSLATE_PX[1]) * _PX, float(_BLOCK_FIRSTPERSON_TRANSLATE_PX[2]) * _PX),
    rotate_x_deg_matrix(float(_BLOCK_FIRSTPERSON_ROTATE_DEG[0])),
    rotate_y_deg_matrix(float(_BLOCK_FIRSTPERSON_ROTATE_DEG[1])),
    rotate_z_deg_matrix(float(_BLOCK_FIRSTPERSON_ROTATE_DEG[2])),
    scale_matrix(float(_BLOCK_FIRSTPERSON_SCALE[0]) * uniform_scale, float(_BLOCK_FIRSTPERSON_SCALE[1]) * uniform_scale, float(_BLOCK_FIRSTPERSON_SCALE[2]) * uniform_scale),
    translate_matrix(-0.5, -0.5, -0.5),
  )


def build_third_person_item_hand_transform() -> np.ndarray:
  """
  third-person player の手に held block を接続する固定 attachment transform を返す。
  orientation、scale、pivot basis を body pose から分離し、全 block kind が同じ基準で手元へ結合される。
  """
  return compose_matrices(
    translate_matrix(float(_BLOCK_THIRDPERSON_TRANSLATE_PX[0]) * _PX, float(_BLOCK_THIRDPERSON_TRANSLATE_PX[1]) * _PX, float(_BLOCK_THIRDPERSON_TRANSLATE_PX[2]) * _PX),
    rotate_x_deg_matrix(float(_BLOCK_THIRDPERSON_ROTATE_DEG[0])),
    rotate_y_deg_matrix(float(_BLOCK_THIRDPERSON_ROTATE_DEG[1])),
    rotate_z_deg_matrix(float(_BLOCK_THIRDPERSON_ROTATE_DEG[2])),
    scale_matrix(float(_BLOCK_THIRDPERSON_SCALE[0]), float(_BLOCK_THIRDPERSON_SCALE[1]), float(_BLOCK_THIRDPERSON_SCALE[2])),
    translate_matrix(-0.5, -0.5, -0.5),
  )


def build_first_person_arm_camera_transform(first_person: FirstPersonRenderState, *, render_scale_multiplier: float = 1.0) -> np.ndarray:
  """
  first-person arm の camera transform を、bob、swing offset、arm anchor、pre-swing yaw、
  swing rotation、pre/post rotation offset、固定 arm rotation、uniform scale の順で合成する。
  slim-arm の authored pose はこの単一行列積で renderer へ渡される。
  """
  root, squared, full, twice = _arm_swing_terms(first_person)
  arm_scale = float(_ARM_FIRSTPERSON_SCALE) * float(render_scale_multiplier)
  arm_rot_x_deg = clampf(float(_ARM_ROT_X_DEG), float(first_person.arm_rotation_limit_min_deg), float(first_person.arm_rotation_limit_max_deg))
  return compose_matrices(
    _view_bob_transform(first_person),
    translate_matrix(float(_ARM_SWING_X_POS_SCALE) * float(root), float(_ARM_SWING_Y_POS_SCALE) * float(twice), float(_ARM_SWING_Z_POS_SCALE) * float(full)),
    translate_matrix(float(_ARM_POS_X), float(_ARM_POS_Y), float(_ARM_POS_Z)),
    rotate_y_deg_matrix(float(_ARM_PRESWING_ROT_Y_DEG)),
    rotate_y_deg_matrix(float(_ARM_SWING_Y_ROT_AMOUNT_DEG) * float(root)),
    rotate_z_deg_matrix(float(_ARM_SWING_Z_ROT_AMOUNT_DEG) * float(squared)),
    translate_matrix(float(_ARM_PREROTATION_X_OFFSET_PX) * _PX, float(_ARM_PREROTATION_Y_OFFSET_PX) * _PX, float(_ARM_PREROTATION_Z_OFFSET_PX) * _PX),
    rotate_z_deg_matrix(float(_ARM_ROT_Z_DEG)),
    rotate_x_deg_matrix(float(arm_rot_x_deg)),
    rotate_y_deg_matrix(float(_ARM_ROT_Y_DEG)),
    translate_matrix(float(_ARM_POSTROTATION_X_OFFSET_PX) * _PX, 0.0, 0.0),
    scale_matrix(arm_scale, arm_scale, arm_scale),
  )


def _box_corner_rows(box: LocalBox) -> np.ndarray:
  """
  box の最小・最大座標の直積から、shape `(8, 4)` の同次座標行列を生成する。
  各 row は `(x, y, z, 1)` を表し、convex cuboid の camera-space fitting は内部点を列挙せず extreme corner だけを witness とする。
  """
  return np.asarray([[float(x), float(y), float(z), 1.0] for x in (box.mn_x, box.mx_x) for y in (box.mn_y, box.mx_y) for z in (box.mn_z, box.mx_z)], dtype=np.float32)


def _camera_space_points(parent_transform: np.ndarray, boxes: tuple[LocalBox, ...] | list[LocalBox]) -> np.ndarray:
  """
  すべての local box corner を指定 transform で camera space へ写し、一つの点群へ積み上げる。
  clip-safe fitting は cuboid 内部ではなく変換後の extremal corner にだけ依存する。
  """
  points = []
  transform = np.asarray(parent_transform, dtype=np.float32)
  for box in boxes:
    local_points = _box_corner_rows(box)
    points.append((transform @ local_points.T).T)
  if not points:
    return np.zeros((0, 4), dtype=np.float32)
  return np.ascontiguousarray(np.vstack(points), dtype=np.float32)


def _axis_translation_interval(points: np.ndarray, *, axis_index: int, projection_scale: float, ndc_min: float, ndc_max: float) -> tuple[float, float]:
  """
  screen axis ごとに、各点が指定された NDC 区間内へ入るための translation interval を交差して求める。
  投影係数と負の z 距離を用いるため、first-person fitting は一次元の実行可能区間問題として解ける。
  """
  lower = -math.inf
  upper = math.inf
  proj = max(float(projection_scale), _FIRST_PERSON_FIT_EPSILON)
  for point in points:
    depth = max(-float(point[2]), _FIRST_PERSON_FIT_EPSILON)
    current_ndc = proj * float(point[axis_index]) / depth
    lower = max(lower, ((float(ndc_min) - current_ndc) * depth) / proj)
    upper = min(upper, ((float(ndc_max) - current_ndc) * depth) / proj)
  return (float(lower), float(upper))


def _fit_intervals(parent_transform: np.ndarray, boxes: tuple[LocalBox, ...] | list[LocalBox], projection: np.ndarray, safe_frame: SafeFrame) -> tuple[tuple[float, float], tuple[float, float]]:
  """
  変換済み box corner と projection、NDC 保護 frame から x 軸・y 軸の実行可能 translation interval を返す。
  後続の anchoring policy は、この interval の内側から具体的な移動量を選ぶ。
  """
  projection_matrix = np.asarray(projection, dtype=np.float32)
  min_x, max_x, min_y, max_y = (float(safe_frame[0]), float(safe_frame[1]), float(safe_frame[2]), float(safe_frame[3]))
  points = _camera_space_points(parent_transform, boxes)
  x_interval = _axis_translation_interval(points, axis_index=0, projection_scale=float(projection_matrix[0, 0]), ndc_min=min_x, ndc_max=max_x)
  y_interval = _axis_translation_interval(points, axis_index=1, projection_scale=float(projection_matrix[1, 1]), ndc_min=min_y, ndc_max=max_y)
  return (x_interval, y_interval)


def _interval_is_feasible(interval: tuple[float, float]) -> bool:
  """
  区間 `(l, u)` が `l <= u` を満たすかを判定する。
  fitting pass が返す一次元 translation interval の許容性はこの条件で決まる。
  """
  return float(interval[0]) <= float(interval[1])


def _projection_uniform_scale_multiplier(projection: np.ndarray, *, exponent: float) -> float:
  """
  現在の projection y-scale と基準 projection y-scale の比から、`m = (P_ref_y / P_cur_y)^e` を計算する。
  FOV の変化に伴う first-person item の見かけの大きさの揺れを、完全固定せず緩和するための倍率である。
  """
  exp = float(exponent)
  if abs(exp) <= _FIRST_PERSON_FIT_EPSILON:
    return 1.0
  projection_matrix = np.asarray(projection, dtype=np.float32)
  current_projection_y = max(float(projection_matrix[1, 1]), _FIRST_PERSON_FIT_EPSILON)
  return float(pow(float(_FIRST_PERSON_REFERENCE_PROJECTION_Y) / current_projection_y, exp))


def _anchored_value_in_interval(value: float, interval: tuple[float, float], anchor_mode: AnchorMode) -> float:
  """
  anchor mode に応じて実行可能区間内の代表値を選ぶ。
  `min_edge` は下端、`max_edge` は上端、`nearest_zero` は 0 に最も近い許容値を返し、画面端への寄せ方を明示する。
  """
  low, high = float(interval[0]), float(interval[1])
  if str(anchor_mode) == "min_edge":
    return low
  if str(anchor_mode) == "max_edge":
    return high
  if float(value) < low:
    return low
  if float(value) > high:
    return high
  return float(value)


def _clamp_value_to_interval(value: float, interval: tuple[float, float]) -> float:
  """
  参照 transform から得た候補値を区間 `[l, u]` へ射影する。
  active transform 自身の許容 interval を最後に反映するため、返値は常に `l <= value <= u` を満たす。
  """
  low, high = float(interval[0]), float(interval[1])
  if float(value) < low:
    return low
  if float(value) > high:
    return high
  return float(value)


def _neutral_swing_state(first_person: FirstPersonRenderState) -> FirstPersonRenderState:
  """
  render state の swing progress だけを 0 に置き換え、他の値を保持した基準状態を生成する。
  一時的な swing に左右されない anchoring reference を得るために使う。
  """
  return replace(first_person, swing_progress=0.0, prev_swing_progress=0.0)


def _equip_hide_transform(first_person: FirstPersonRenderState, *, hide_distance: float) -> np.ndarray:
  """
  `h = 1 - equip_progress`、`e = h^2(3 - 2h)` により smoothstep 型の下降量を作り、`T(0, -hide_distance e, 0)` を返す。
  装備切替時の腕と item を速度不連続なしに上下させる。
  """
  hidden = 1.0 - clampf(float(first_person.equip_progress), 0.0, 1.0)
  eased = float(hidden * hidden * (3.0 - 2.0 * hidden))
  if eased <= _FIRST_PERSON_FIT_EPSILON:
    return identity_matrix()
  return translate_matrix(0.0, -float(hide_distance) * eased, 0.0)


def _fitted_first_person_parent_transform(
  *,
  boxes: tuple[LocalBox, ...] | list[LocalBox],
  projection: np.ndarray,
  safe_frame: SafeFrame,
  transform_builder,
  projection_scale_exponent: float,
  x_anchor_mode: AnchorMode,
  y_anchor_mode: AnchorMode,
  reference_transform_builder=None,
) -> np.ndarray:
  """
  projection-aware scale 補正、実行可能 interval の探索、safe frame 内の anchoring を統合し、first-person mesh の親 transform を決定する。
  返値は保護された clip rectangle 内に収まり、同じ入力から同じ edge bias を再現する。
  """
  projection_scale_multiplier = _projection_uniform_scale_multiplier(projection, exponent=float(projection_scale_exponent))
  best_scale = 1.0
  transform = np.asarray(transform_builder(projection_scale_multiplier), dtype=np.float32)
  x_interval, y_interval = _fit_intervals(transform, boxes, projection, safe_frame)
  if not (_interval_is_feasible(x_interval) and _interval_is_feasible(y_interval)):
    low = float(_FIRST_PERSON_MIN_SCALE_MULTIPLIER)
    best_scale = low
    low_transform = np.asarray(transform_builder(projection_scale_multiplier * low), dtype=np.float32)
    low_x_interval, low_y_interval = _fit_intervals(low_transform, boxes, projection, safe_frame)
    while low > _FIRST_PERSON_FIT_EPSILON and not (_interval_is_feasible(low_x_interval) and _interval_is_feasible(low_y_interval)):
      low *= 0.5
      best_scale = low
      low_transform = np.asarray(transform_builder(projection_scale_multiplier * low), dtype=np.float32)
      low_x_interval, low_y_interval = _fit_intervals(low_transform, boxes, projection, safe_frame)
    if _interval_is_feasible(low_x_interval) and _interval_is_feasible(low_y_interval):
      lo = low
      hi = 1.0
      best_scale = low
      for _ in range(_FIRST_PERSON_SCALE_SEARCH_STEPS):
        mid = 0.5 * (lo + hi)
        mid_transform = np.asarray(transform_builder(projection_scale_multiplier * mid), dtype=np.float32)
        mid_x_interval, mid_y_interval = _fit_intervals(mid_transform, boxes, projection, safe_frame)
        if _interval_is_feasible(mid_x_interval) and _interval_is_feasible(mid_y_interval):
          best_scale = mid
          lo = mid
        else:
          hi = mid
    transform = np.asarray(transform_builder(projection_scale_multiplier * best_scale), dtype=np.float32)
    x_interval, y_interval = _fit_intervals(transform, boxes, projection, safe_frame)

  target_tx = 0.0
  target_ty = 0.0
  if reference_transform_builder is not None:
    reference_transform = np.asarray(reference_transform_builder(projection_scale_multiplier * best_scale), dtype=np.float32)
    reference_x_interval, reference_y_interval = _fit_intervals(reference_transform, boxes, projection, safe_frame)
    if _interval_is_feasible(reference_x_interval):
      target_tx = _anchored_value_in_interval(0.0, reference_x_interval, x_anchor_mode)
    if _interval_is_feasible(reference_y_interval):
      target_ty = _anchored_value_in_interval(0.0, reference_y_interval, y_anchor_mode)

  tx = _clamp_value_to_interval(target_tx, x_interval) if _interval_is_feasible(x_interval) else 0.0
  ty = _clamp_value_to_interval(target_ty, y_interval) if _interval_is_feasible(y_interval) else 0.0
  return compose_matrices(translate_matrix(float(tx), float(ty), 0.0), transform)


def build_first_person_held_block_face_rows(first_person: FirstPersonRenderState | None, *, projection: np.ndarray, uv_lookup: UVLookup, def_lookup: DefLookup) -> tuple[np.ndarray, ...]:
  """
  現在の first-person transform に基づいて held block の instanced face payload を六 face bucket として構築する。
  equip hide、projection fitting、face occlusion、atlas UV 解決を同じ順序で適用し、各 row は `vec(M_box, U_face)` となる。
  """
  if first_person is None or first_person.visible_block_id is None:
    return empty_textured_face_rows()

  boxes = list(held_block_model_boxes(first_person.visible_block_id, def_lookup))
  if not boxes:
    return empty_textured_face_rows()

  block_def = def_lookup(str(first_person.visible_block_id))
  kind = "" if block_def is None else str(block_def.kind_name())
  kind_scale = held_block_kind_scale_multiplier(kind)
  base_parent_transform = _fitted_first_person_parent_transform(
    boxes=[textured_box.box for textured_box in boxes],
    projection=projection,
    safe_frame=_ITEM_SAFE_FRAME,
    transform_builder=(lambda scale_multiplier: build_first_person_item_camera_transform(first_person, render_scale_multiplier=float(scale_multiplier) * float(kind_scale))),
    projection_scale_exponent=float(_ITEM_PROJECTION_SCALE_EXPONENT),
    x_anchor_mode=_RIGHT_EDGE_ANCHOR,
    y_anchor_mode=_BOTTOM_EDGE_ANCHOR,
    reference_transform_builder=(
      lambda scale_multiplier: build_first_person_item_camera_transform(_neutral_swing_state(first_person), render_scale_multiplier=float(scale_multiplier) * float(kind_scale))
    ),
  )
  parent_transform = compose_matrices(_equip_hide_transform(first_person, hide_distance=float(_ITEM_EQUIP_HIDE_DISTANCE)), base_parent_transform)

  buffers: list[list[list[float]]] = [[] for _ in range(6)]
  local_boxes = [textured_box.box for textured_box in boxes]
  for textured_box in boxes:
    for face_idx in range(6):
      if is_local_face_occluded(box=textured_box.box, face_idx=int(face_idx), boxes=local_boxes):
        continue
      texture_uv = uv_lookup(str(first_person.visible_block_id), int(face_idx))
      uv_rect = atlas_face_uv(texture_uv, int(face_idx), textured_box.box, kind=kind, face_uv_pixels=textured_box.face_uv_pixels)
      model = model_matrix_for_local_box(parent_transform, textured_box.box)
      append_face_instance(buffers, int(face_idx), model, uv_rect)

  return face_rows_from_buffers(buffers)


def build_first_person_arm_face_rows(first_person: FirstPersonRenderState | None, *, projection: np.ndarray, skin_width: int, skin_height: int) -> tuple[np.ndarray, ...]:
  """
  first-person の slim arm と sleeve を、現在の swing state と skin 画像寸法から instanced face payload へ変換する。
  arm は保護 projection frame 内に fitting され、各 cuboid face は対応する skin rectangle を参照する。
  """
  if first_person is None or (not bool(first_person.show_arm)):
    return empty_textured_face_rows()

  arm_boxes = (_ARM_BASE_BOX_SLIM, _ARM_SLEEVE_BOX_SLIM)
  base_parent_transform = _fitted_first_person_parent_transform(
    boxes=arm_boxes,
    projection=projection,
    safe_frame=_ARM_SAFE_FRAME,
    transform_builder=(lambda scale_multiplier: build_first_person_arm_camera_transform(first_person, render_scale_multiplier=float(scale_multiplier))),
    projection_scale_exponent=float(_ARM_PROJECTION_SCALE_EXPONENT),
    x_anchor_mode=_RIGHT_EDGE_ANCHOR,
    y_anchor_mode=_BOTTOM_EDGE_ANCHOR,
    reference_transform_builder=(lambda scale_multiplier: build_first_person_arm_camera_transform(_neutral_swing_state(first_person), render_scale_multiplier=float(scale_multiplier))),
  )
  parent_transform = compose_matrices(_equip_hide_transform(first_person, hide_distance=float(_ARM_EQUIP_HIDE_DISTANCE)), base_parent_transform)
  buffers: list[list[list[float]]] = [[] for _ in range(6)]

  for box, uv_map in ((arm_boxes[0], SLIM_RIGHT_ARM_BASE_UV_PX), (arm_boxes[1], SLIM_RIGHT_ARM_SLEEVE_UV_PX)):
    model = model_matrix_for_local_box(parent_transform, box)
    for face_idx in range(6):
      uv_rect = skin_uv_rect(uv_map[int(face_idx)], width=int(skin_width), height=int(skin_height))
      append_face_instance(buffers, int(face_idx), model, uv_rect)

  return face_rows_from_buffers(buffers)


def build_first_person_special_item_face_rows(first_person: FirstPersonRenderState | None, *, projection: np.ndarray) -> tuple[np.ndarray, ...]:
  """
  拡大表示される特殊 item icon を、z 軸正方向 face に対応する単一 textured quad として生成する。
  他の face bucket は空にしつつ、held block と同じ projection fitting と equip hide を通して screen-space motion を揃える。
  """
  if first_person is None or first_person.visible_special_item_icon is None:
    return empty_textured_face_rows()

  boxes = (_SPECIAL_ITEM_ICON_BOX,)
  base_parent_transform = _fitted_first_person_parent_transform(
    boxes=boxes,
    projection=projection,
    safe_frame=_ITEM_SAFE_FRAME,
    transform_builder=(lambda scale_multiplier: build_first_person_item_camera_transform(first_person, render_scale_multiplier=float(scale_multiplier) * float(_SPECIAL_ITEM_RENDER_SCALE))),
    projection_scale_exponent=float(_ITEM_PROJECTION_SCALE_EXPONENT),
    x_anchor_mode=_RIGHT_EDGE_ANCHOR,
    y_anchor_mode=_BOTTOM_EDGE_ANCHOR,
    reference_transform_builder=(
      lambda scale_multiplier: build_first_person_item_camera_transform(_neutral_swing_state(first_person), render_scale_multiplier=float(scale_multiplier) * float(_SPECIAL_ITEM_RENDER_SCALE))
    ),
  )
  parent_transform = compose_matrices(
    _equip_hide_transform(first_person, hide_distance=float(_ITEM_EQUIP_HIDE_DISTANCE)),
    base_parent_transform,
    translate_matrix(8.0 * _PX, 8.0 * _PX, 8.0 * _PX),
    rotate_z_deg_matrix(float(_SPECIAL_ITEM_ROTATE_Z_DEG)),
    translate_matrix(-8.0 * _PX, -8.0 * _PX, -8.0 * _PX),
  )
  model = model_matrix_for_local_box(parent_transform, _SPECIAL_ITEM_ICON_BOX)
  buffers: list[list[list[float]]] = [[] for _ in range(6)]
  append_face_instance(buffers, int(FACE_POS_Z), model, _SPECIAL_ITEM_UV_RECT)
  return face_rows_from_buffers(buffers)


def rotation_only(matrix: np.ndarray) -> np.ndarray:
  """
  affine matrix の 3x3 線形部分を列ごとに正規化し、translation を 0 にした orientation matrix を返す。
  下流が scale や位置を継承せず向きだけを必要とする場合に用いる。
  """
  out = identity_matrix()
  linear = np.asarray(matrix, dtype=np.float32)[:3, :3].copy()
  for column in range(3):
    length = float(np.linalg.norm(linear[:, column]))
    if length > 1e-6:
      linear[:, column] /= length
  out[:3, :3] = linear
  return out


def rotation_scale_only(matrix: np.ndarray) -> np.ndarray:
  """
  affine matrix の 3x3 線形部分を保持し、translation だけを 0 にした matrix を返す。
  scale を含む orientation を維持しながら位置情報を落とす必要がある renderer 経路で用いる。
  """
  out = identity_matrix()
  out[:3, :3] = np.asarray(matrix, dtype=np.float32)[:3, :3]
  return out
