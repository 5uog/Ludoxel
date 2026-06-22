# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import shutil
import tempfile
from pathlib import Path
from typing import Callable, Protocol

import numpy as np
from manim import (
  BLACK,
  BLUE_C,
  BLUE_E,
  DOWN,
  GREEN_C,
  GREEN_E,
  GREY_A,
  GREY_B,
  LEFT,
  RED_C,
  RED_E,
  RIGHT,
  WHITE,
  YELLOW_C,
  Arrow,
  DecimalNumber,
  Dot,
  Line,
  MathTex,
  Scene,
  ValueTracker,
  VGroup,
  always_redraw,
  config,
  linear,
  tempconfig,
)

WORLD_AXES = (np.array([1.0, 0.0, 0.0]), np.array([0.0, 1.0, 0.0]), np.array([0.0, 0.0, 1.0]))
UP_HINT = np.array([0.0, 1.0, 0.0])
CAMERA_POSITION = np.array([0.0, 1.62, -7.20])

NEAR_CLIP_DEPTH = 0.18
PROJECTION_DEPTH_BIAS = 0.48
PROJECTION_SCALE = 3.28

GRID_X_MIN = -14
GRID_X_MAX = 14
GRID_Z_MIN = -7
GRID_Z_MAX = 27
GRID_Y = 0.0
GROUND_GRID_COLOR = GREY_A
GROUND_GRID_WIDTH = 0.82
GROUND_GRID_OPACITY = 0.24

LOOP_BASE_YAW_DEG = 18.0
LOOP_BASE_PITCH_DEG = -6.0
LOOP_BASE_ROLL_DEG = 0.0
VIDEO_LOOP_SECONDS = 20.0

AXIS_COLORS = (RED_C, GREEN_C, BLUE_C)
AXIS_GLOW_COLORS = (RED_E, GREEN_E, BLUE_E)
AXIS_LABELS = (r"{+X}", r"{+Y}", r"{+Z}")
AXIS_SUBSCRIPTS = (r"X", r"Y", r"Z")
AXIS_ZERO_LABEL_OFFSETS = (np.array([0.34, -0.25, 0.0]), np.array([0.34, 0.25, 0.0]), np.array([-0.38, -0.30, 0.0]))

FIGURES_ROOT = Path(__file__).resolve().parents[1]
PHOTO_OUTPUT = FIGURES_ROOT / "photo" / "debug-hud-axis-crosshair-projection.png"
VIDEO_OUTPUT = FIGURES_ROOT / "videos" / "debug-hud-axis-crosshair-camera.mp4"


class CameraScalar(Protocol):
  def get_value(self) -> float: ...


class ComputedCameraScalar:
  def __init__(self, function: Callable[[], float]) -> None:
    self._function = function

  def get_value(self) -> float:
    return float(self._function())


def normalize(value: np.ndarray) -> np.ndarray:
  length = float(np.linalg.norm(value))
  if length <= 1e-12 or not math.isfinite(length):
    return np.array([0.0, 0.0, 0.0])
  return value / length


def forward_from_yaw_pitch_deg(yaw_deg: float, pitch_deg: float) -> np.ndarray:
  yaw = math.radians(float(yaw_deg))
  pitch = math.radians(float(pitch_deg))
  return normalize(np.array([-math.sin(yaw) * math.cos(pitch), -math.sin(pitch), math.cos(yaw) * math.cos(pitch)]))


def camera_basis(yaw_deg: float, pitch_deg: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
  forward = forward_from_yaw_pitch_deg(yaw_deg, pitch_deg)
  right = normalize(np.cross(UP_HINT, forward))
  up = normalize(np.cross(forward, right))
  return forward, right, up


def rotate_plane(value: np.ndarray, roll_deg: float) -> np.ndarray:
  roll = math.radians(float(roll_deg))
  cos_roll = math.cos(roll)
  sin_roll = math.sin(roll)
  x = float(value[0])
  y = float(value[1])
  return np.array([cos_roll * x - sin_roll * y, sin_roll * x + cos_roll * y])


def axis_projection_values(axis_index: int, yaw_deg: float, pitch_deg: float, roll_deg: float) -> tuple[np.ndarray, np.ndarray, np.ndarray, float]:
  forward, right, up = camera_basis(yaw_deg, pitch_deg)
  axis = WORLD_AXES[axis_index]
  p = np.array([float(np.dot(right, axis)), float(np.dot(up, axis))])
  q = rotate_plane(p, roll_deg)
  qt = np.array([float(q[0]), -float(q[1])])
  magnitude = float(math.sqrt(max(0.0, 1.0 - float(np.dot(forward, axis)) ** 2)))
  return p, q, qt, magnitude


def axis_display_offsets(yaw_deg: float, pitch_deg: float, roll_deg: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
  return (axis_projection_values(0, yaw_deg, pitch_deg, roll_deg)[1], axis_projection_values(1, yaw_deg, pitch_deg, roll_deg)[1], axis_projection_values(2, yaw_deg, pitch_deg, roll_deg)[1])


def point(x: float, y: float) -> np.ndarray:
  return np.array([float(x), float(y), 0.0])


def tex(expression: str, *, size: int = 32, color=WHITE) -> MathTex:
  return MathTex(expression, font_size=size, color=color)


def clean_number(value: float) -> float:
  if abs(value) < 0.005:
    return 0.0
  return float(value)


def world_view_components(world: np.ndarray, yaw_deg: float, pitch_deg: float) -> tuple[np.ndarray, float]:
  forward, right, up = camera_basis(yaw_deg, pitch_deg)
  relative = world - CAMERA_POSITION
  view = np.array([float(np.dot(right, relative)), float(np.dot(up, relative))])
  depth = float(np.dot(forward, relative))
  return view, depth


def world_depth(world: np.ndarray, yaw_deg: float, pitch_deg: float) -> float:
  return float(world_view_components(world, yaw_deg, pitch_deg)[1])


def view_to_display(view: np.ndarray, depth: float, roll_deg: float, center: np.ndarray) -> np.ndarray | None:
  if depth <= NEAR_CLIP_DEPTH or not math.isfinite(depth):
    return None
  projected = rotate_plane(view / (depth + PROJECTION_DEPTH_BIAS), roll_deg)
  return center + point(projected[0] * PROJECTION_SCALE, projected[1] * PROJECTION_SCALE)


def world_to_display(world: np.ndarray, yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray) -> np.ndarray | None:
  view, depth = world_view_components(world, yaw_deg, pitch_deg)
  return view_to_display(view, depth, roll_deg, center)


def clip_wire_segment_to_near_plane(start: np.ndarray, end: np.ndarray, yaw_deg: float, pitch_deg: float) -> tuple[np.ndarray, np.ndarray] | None:
  _, start_depth = world_view_components(start, yaw_deg, pitch_deg)
  _, end_depth = world_view_components(end, yaw_deg, pitch_deg)

  if start_depth <= NEAR_CLIP_DEPTH and end_depth <= NEAR_CLIP_DEPTH:
    return None

  clipped_start = np.array(start, dtype=float)
  clipped_end = np.array(end, dtype=float)

  if start_depth <= NEAR_CLIP_DEPTH:
    denominator = float(end_depth - start_depth)
    if abs(denominator) <= 1e-12:
      return None
    t = float((NEAR_CLIP_DEPTH - start_depth) / denominator)
    clipped_start = start + (end - start) * max(0.0, min(1.0, t + 1e-4))

  if end_depth <= NEAR_CLIP_DEPTH:
    denominator = float(start_depth - end_depth)
    if abs(denominator) <= 1e-12:
      return None
    t = float((NEAR_CLIP_DEPTH - end_depth) / denominator)
    clipped_end = end + (start - end) * max(0.0, min(1.0, t + 1e-4))

  if not (np.all(np.isfinite(clipped_start)) and np.all(np.isfinite(clipped_end))):
    return None

  if float(np.linalg.norm(clipped_end - clipped_start)) <= 1e-6:
    return None

  return clipped_start, clipped_end


def add_wire_segment(
  group: VGroup, start: np.ndarray, end: np.ndarray, yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray, *, color=GREY_A, width: float = 1.15, opacity: float = 0.34
) -> None:
  clipped = clip_wire_segment_to_near_plane(start, end, yaw_deg, pitch_deg)
  if clipped is None:
    return

  clipped_start, clipped_end = clipped
  a = world_to_display(clipped_start, yaw_deg, pitch_deg, roll_deg, center)
  b = world_to_display(clipped_end, yaw_deg, pitch_deg, roll_deg, center)

  if a is None or b is None:
    return

  line = Line(a, b, color=color, stroke_width=width)
  line.set_opacity(opacity)
  group.add(line)


def cube_edges(origin: np.ndarray, size: float) -> tuple[tuple[np.ndarray, np.ndarray], ...]:
  x, y, z = origin
  s = float(size)

  vertices = {
    "000": np.array([x, y, z]),
    "100": np.array([x + s, y, z]),
    "010": np.array([x, y + s, z]),
    "110": np.array([x + s, y + s, z]),
    "001": np.array([x, y, z + s]),
    "101": np.array([x + s, y, z + s]),
    "011": np.array([x, y + s, z + s]),
    "111": np.array([x + s, y + s, z + s]),
  }

  keys = (
    ("000", "100"),
    ("010", "110"),
    ("001", "101"),
    ("011", "111"),
    ("000", "010"),
    ("100", "110"),
    ("001", "011"),
    ("101", "111"),
    ("000", "001"),
    ("100", "101"),
    ("010", "011"),
    ("110", "111"),
  )
  return tuple((vertices[a], vertices[b]) for a, b in keys)


def add_ground_grid(yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray, group: VGroup) -> None:
  for z in range(GRID_Z_MIN, GRID_Z_MAX + 1):
    for x in range(GRID_X_MIN, GRID_X_MAX):
      add_wire_segment(
        group,
        np.array([float(x), GRID_Y, float(z)]),
        np.array([float(x + 1), GRID_Y, float(z)]),
        yaw_deg,
        pitch_deg,
        roll_deg,
        center,
        color=GROUND_GRID_COLOR,
        width=GROUND_GRID_WIDTH,
        opacity=GROUND_GRID_OPACITY,
      )

  for x in range(GRID_X_MIN, GRID_X_MAX + 1):
    for z in range(GRID_Z_MIN, GRID_Z_MAX):
      add_wire_segment(
        group,
        np.array([float(x), GRID_Y, float(z)]),
        np.array([float(x), GRID_Y, float(z + 1)]),
        yaw_deg,
        pitch_deg,
        roll_deg,
        center,
        color=GROUND_GRID_COLOR,
        width=GROUND_GRID_WIDTH,
        opacity=GROUND_GRID_OPACITY,
      )


def add_reference_columns(yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray, group: VGroup) -> None:
  for x in (-12.0, -8.0, -4.0, 0.0, 4.0, 8.0, 12.0):
    for z in (-2.0, 6.0, 14.0, 22.0):
      add_wire_segment(group, np.array([x, 0.0, z]), np.array([x, 4.0, z]), yaw_deg, pitch_deg, roll_deg, center, color=GREY_B, width=0.86, opacity=0.12)


def add_block_wireframe(group: VGroup, origin: tuple[int, int, int], yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray, *, opacity: float) -> None:
  for start, end in cube_edges(np.array([float(origin[0]), float(origin[1]), float(origin[2])]), 1.0):
    add_wire_segment(group, start, end, yaw_deg, pitch_deg, roll_deg, center, color=WHITE, width=1.42, opacity=opacity)


def voxel_wireframe(yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray) -> VGroup:
  group = VGroup()
  add_ground_grid(yaw_deg, pitch_deg, roll_deg, center, group)
  add_reference_columns(yaw_deg, pitch_deg, roll_deg, center, group)

  block_specs = (
    ((-4, 0, 2), 0.56),
    ((-3, 0, 2), 0.54),
    ((-2, 0, 2), 0.52),
    ((3, 0, 3), 0.54),
    ((4, 0, 3), 0.52),
    ((5, 0, 3), 0.50),
    ((-1, 0, 5), 0.48),
    ((0, 0, 5), 0.46),
    ((0, 1, 5), 0.42),
    ((-7, 0, 8), 0.36),
    ((6, 0, 9), 0.34),
    ((-3, 0, 12), 0.30),
    ((3, 0, 14), 0.28),
  )

  for origin, opacity in block_specs:
    add_block_wireframe(group, origin, yaw_deg, pitch_deg, roll_deg, center, opacity=opacity)

  return group


def add_projected_polyline(
  group: VGroup, points: tuple[np.ndarray, ...], yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray, *, color=WHITE, width: float = 1.0, opacity: float = 1.0
) -> None:
  for start, end in zip(points, points[1:]):
    add_wire_segment(group, start, end, yaw_deg, pitch_deg, roll_deg, center, color=color, width=width, opacity=opacity)


def sign_plane_point(center_world: np.ndarray, local_x: float, local_y: float) -> np.ndarray:
  return center_world + np.array([float(local_x), float(local_y), 0.0])


def glyph_strokes() -> tuple[tuple[tuple[float, float], tuple[float, float]], ...]:
  join = 0.035
  return (
    ((0.00, 1.00), (0.48 + join, 1.00)),
    ((0.00, 1.00 + join), (0.00, 0.58 - join)),
    ((0.00 - join, 0.58), (0.46 + join, 0.58)),
    ((0.46, 0.58 + join), (0.46, 0.12 - join)),
    ((0.46 + join, 0.12), (0.00, 0.12)),
    ((0.66, 1.00 + join), (0.66, 0.12 - join)),
    ((0.66 - join, 0.12), (1.12 + join, 0.12)),
    ((1.12, 1.00 + join), (1.12, 0.12 - join)),
    ((1.32, 0.12 - join), (1.32, 1.00 + join)),
    ((1.32 - join, 1.00), (1.78 + join, 1.00)),
    ((1.78, 1.00 + join), (1.78, 0.12 - join)),
    ((1.78 + join, 0.12), (1.32 - join, 0.12)),
    ((1.98 - join, 1.00), (2.44 + join, 1.00)),
    ((1.98 - join, 0.12), (2.44 + join, 0.12)),
    ((1.98, 1.00 + join), (1.98, 0.62 - join)),
    ((1.98, 0.50 + join), (1.98, 0.12 - join)),
    ((2.44, 0.50 + join), (2.44, 0.12 - join)),
  )


def projected_segment_length(world_start: np.ndarray, world_end: np.ndarray, yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray) -> float:
  projected_start = world_to_display(world_start, yaw_deg, pitch_deg, roll_deg, center)
  projected_end = world_to_display(world_end, yaw_deg, pitch_deg, roll_deg, center)
  if projected_start is None or projected_end is None:
    return 0.0
  return float(np.linalg.norm(projected_end - projected_start))


def world_label_5uog(yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray) -> VGroup:
  group = VGroup()
  sign_center = np.array([0.25, 5.15, 2.80])
  sign_width = 2.74
  sign_height = 0.98
  text_width = 2.44
  text_height = 0.88
  text_left = -text_width * 0.5
  text_bottom = -text_height * 0.5

  sign_corners = (
    sign_plane_point(sign_center, -sign_width * 0.5, -sign_height * 0.5),
    sign_plane_point(sign_center, sign_width * 0.5, -sign_height * 0.5),
    sign_plane_point(sign_center, sign_width * 0.5, sign_height * 0.5),
    sign_plane_point(sign_center, -sign_width * 0.5, sign_height * 0.5),
    sign_plane_point(sign_center, -sign_width * 0.5, -sign_height * 0.5),
  )

  depth = world_depth(sign_center, yaw_deg, pitch_deg)
  if depth <= NEAR_CLIP_DEPTH:
    return group

  horizontal_span = projected_segment_length(sign_corners[0], sign_corners[1], yaw_deg, pitch_deg, roll_deg, center)
  vertical_span = projected_segment_length(sign_corners[0], sign_corners[3], yaw_deg, pitch_deg, roll_deg, center)
  depth_opacity = max(0.30, min(1.0, 1.35 / (0.11 * max(depth, 0.1) + 0.78)))
  stroke_width = max(0.72, min(2.90, 0.60 + horizontal_span * 0.055 + vertical_span * 0.030))

  add_projected_polyline(group, sign_corners, yaw_deg, pitch_deg, roll_deg, center, color=YELLOW_C, width=max(0.62, stroke_width * 0.42), opacity=0.30 * depth_opacity)

  add_wire_segment(
    group,
    np.array([sign_center[0], 0.12, sign_center[2]]),
    sign_plane_point(sign_center, 0.0, -sign_height * 0.52),
    yaw_deg,
    pitch_deg,
    roll_deg,
    center,
    color=YELLOW_C,
    width=max(0.60, stroke_width * 0.36),
    opacity=0.28 * depth_opacity,
  )

  for start, end in glyph_strokes():
    local_start = (text_left + start[0], text_bottom + start[1])
    local_end = (text_left + end[0], text_bottom + end[1])
    add_wire_segment(
      group,
      sign_plane_point(sign_center, local_start[0], local_start[1]),
      sign_plane_point(sign_center, local_end[0], local_end[1]),
      yaw_deg,
      pitch_deg,
      roll_deg,
      center,
      color=YELLOW_C,
      width=stroke_width * 1.08,
      opacity=depth_opacity,
    )

  return group


def hud_center_mark(center: np.ndarray) -> VGroup:
  horizontal = Line(center + point(-0.13, 0.0), center + point(0.13, 0.0), color=WHITE, stroke_width=3.0)
  vertical = Line(center + point(0.0, -0.13), center + point(0.0, 0.13), color=WHITE, stroke_width=3.0)
  dot = Dot(center, radius=0.026, color=WHITE)

  horizontal.set_opacity(0.82)
  vertical.set_opacity(0.82)
  dot.set_opacity(0.95)

  r_hat = tex(r"\hat r", size=20, color=RED_C)
  u_hat = tex(r"\hat u", size=20, color=GREEN_C)
  f_hat = tex(r"\hat f", size=20, color=BLUE_C)

  r_hat.move_to(center + point(0.40, -0.13))
  u_hat.move_to(center + point(0.18, 0.39))
  f_hat.move_to(center + point(-0.30, -0.29))

  r_hat.set_opacity(0.74)
  u_hat.set_opacity(0.74)
  f_hat.set_opacity(0.74)

  return VGroup(horizontal, vertical, dot, r_hat, u_hat, f_hat)


def axis_vector(axis_index: int, yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray, radius: float) -> VGroup:
  color = AXIS_COLORS[axis_index]
  glow_color = AXIS_GLOW_COLORS[axis_index]
  offset = axis_display_offsets(yaw_deg, pitch_deg, roll_deg)[axis_index]
  magnitude = float(np.linalg.norm(offset))

  if magnitude <= 1e-9 or not math.isfinite(magnitude):
    dot = Dot(center, radius=0.055, color=color)
    dot.set_opacity(0.74)
    return VGroup(dot)

  unit = offset / magnitude
  start = center + point(unit[0] * 0.18, unit[1] * 0.18)
  end = center + point(unit[0] * radius * magnitude, unit[1] * radius * magnitude)

  glow = Line(start, end, color=glow_color, stroke_width=22.0)
  glow.set_opacity(0.24)

  shadow = Line(start + point(0.024, -0.024), end + point(0.024, -0.024), color=BLACK, stroke_width=10.0)
  shadow.set_opacity(0.72)

  vector = Arrow(start, end, buff=0.0, color=color, stroke_width=7.0, max_tip_length_to_length_ratio=0.14)
  tip = Dot(end, radius=0.048, color=color)

  return VGroup(glow, shadow, vector, tip)


def axis_label_position(axis_index: int, yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray, radius: float) -> np.ndarray:
  offset = axis_display_offsets(yaw_deg, pitch_deg, roll_deg)[axis_index]
  magnitude = float(np.linalg.norm(offset))

  if magnitude <= 1e-9 or not math.isfinite(magnitude):
    return center + AXIS_ZERO_LABEL_OFFSETS[axis_index]

  unit = offset / magnitude
  end = center + point(unit[0] * radius * magnitude, unit[1] * radius * magnitude)
  return end + point(unit[0] * 0.30, unit[1] * 0.30)


def axis_label(axis_index: int, yaw: CameraScalar, pitch: CameraScalar, roll: CameraScalar, center: np.ndarray, radius: float) -> MathTex:
  label = tex(AXIS_LABELS[axis_index], size=35, color=AXIS_COLORS[axis_index])
  label.move_to(axis_label_position(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius))
  return label


def axis_labels(yaw: CameraScalar, pitch: CameraScalar, roll: CameraScalar, center: np.ndarray, radius: float) -> VGroup:
  labels = VGroup()

  for index in range(3):
    labels.add(always_redraw(lambda axis_index=index: axis_label(axis_index, yaw, pitch, roll, center, radius)))

  return labels


def axis_crosshair(yaw: CameraScalar, pitch: CameraScalar, roll: CameraScalar, center: np.ndarray) -> VGroup:
  radius = 1.04
  return VGroup(
    hud_center_mark(center),
    always_redraw(lambda: axis_vector(0, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius)),
    always_redraw(lambda: axis_vector(1, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius)),
    always_redraw(lambda: axis_vector(2, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius)),
    axis_labels(yaw, pitch, roll, center, radius),
  )


def make_value(function: Callable[[], float], *, color=WHITE, scale: float = 0.42) -> DecimalNumber:
  value = DecimalNumber(clean_number(function()), num_decimal_places=2, include_sign=True, color=color)
  value.scale(scale)

  def updater(mobject: DecimalNumber) -> None:
    mobject.set_value(clean_number(function()))

  value.add_updater(updater)
  return value


def numeric_pair(prefix: str, first: Callable[[], float], second: Callable[[], float], *, color=WHITE, size: int = 19, scale: float = 0.34) -> VGroup:
  group = VGroup(
    tex(prefix + r"=", size=size, color=color),
    tex(r"(", size=size, color=GREY_A),
    make_value(first, color=color, scale=scale),
    tex(r",", size=size, color=GREY_A),
    make_value(second, color=color, scale=scale),
    tex(r")", size=size, color=GREY_A),
  )
  group.arrange(RIGHT, buff=0.022)
  return group


def numeric_axis_block(axis_index: int, yaw: CameraScalar, pitch: CameraScalar, roll: CameraScalar) -> VGroup:
  color = AXIS_COLORS[axis_index]
  subscript = AXIS_SUBSCRIPTS[axis_index]

  def p_component(component: int) -> Callable[[], float]:
    return lambda: axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[0][component]

  def q_component(component: int) -> Callable[[], float]:
    return lambda: axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[1][component]

  def qt_component(component: int) -> Callable[[], float]:
    return lambda: axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[2][component]

  def magnitude() -> float:
    return axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[3]

  header = tex(AXIS_LABELS[axis_index] + r":", size=20, color=color)
  p_pair = numeric_pair(r"p_{" + subscript + r"}", p_component(0), p_component(1), color=color, size=17, scale=0.30)
  q_pair = numeric_pair(r"q_{" + subscript + r"}", q_component(0), q_component(1), color=color, size=17, scale=0.30)
  pi_pair = numeric_pair(r"\pi_{" + subscript + r"}", qt_component(0), qt_component(1), color=color, size=17, scale=0.30)

  m_value = VGroup(tex(r"m_{" + subscript + r"}=", size=17, color=color), make_value(magnitude, color=color, scale=0.30))
  m_value.arrange(RIGHT, buff=0.022)

  block = VGroup(header, p_pair, q_pair, pi_pair, m_value)
  block.arrange(DOWN, aligned_edge=LEFT, buff=0.045)
  return block


def place_top_left(mobject: VGroup, *, left: float, top: float) -> VGroup:
  mobject.shift(point(left - mobject.get_left()[0], top - mobject.get_top()[1]))
  return mobject


def place_top_right(mobject: VGroup, *, right: float, top: float) -> VGroup:
  mobject.shift(point(right - mobject.get_right()[0], top - mobject.get_top()[1]))
  return mobject


def right_top_axis_values(yaw: CameraScalar, pitch: CameraScalar, roll: CameraScalar) -> VGroup:
  blocks = VGroup(numeric_axis_block(0, yaw, pitch, roll), numeric_axis_block(1, yaw, pitch, roll), numeric_axis_block(2, yaw, pitch, roll))
  blocks.arrange(DOWN, aligned_edge=LEFT, buff=0.13)

  if blocks.width > 2.55:
    blocks.scale_to_fit_width(2.55)
  if blocks.height > 2.98:
    blocks.scale_to_fit_height(2.98)

  return place_top_right(blocks, right=5.70, top=3.03)


def left_top_definitions(yaw: CameraScalar, pitch: CameraScalar, roll: CameraScalar) -> VGroup:
  definitions = VGroup(
    tex(r"\hat f=F(\psi,\theta)", size=28, color=WHITE),
    tex(r"\hat r=\frac{u_0\times\hat f}{\Vert u_0\times\hat f\Vert}", size=28, color=WHITE),
    tex(r"\hat u=\hat f\times\hat r", size=28, color=WHITE),
    tex(r"p_a=(\hat r\cdot a,\ \hat u\cdot a)", size=28, color=WHITE),
    tex(r"q_a=R_\rho p_a", size=28, color=WHITE),
    tex(r"\pi(q_x,q_y)=(q_x,-q_y)", size=28, color=WHITE),
    tex(r"m_a=\Vert p_a\Vert_2=\sqrt{1-(\hat f\cdot a)^2}", size=28, color=WHITE),
  )
  definitions.arrange(DOWN, aligned_edge=LEFT, buff=0.12)

  pose = VGroup(
    tex(r"\psi=", size=22, color=GREY_A),
    make_value(lambda: yaw.get_value(), color=GREY_A, scale=0.36),
    tex(r"^\circ\quad\theta=", size=22, color=GREY_A),
    make_value(lambda: pitch.get_value(), color=GREY_A, scale=0.36),
    tex(r"^\circ\quad\rho=", size=22, color=GREY_A),
    make_value(lambda: roll.get_value(), color=GREY_A, scale=0.36),
    tex(r"^\circ", size=22, color=GREY_A),
  )
  pose.arrange(RIGHT, buff=0.022)

  group = VGroup(definitions, pose)
  group.arrange(DOWN, aligned_edge=LEFT, buff=0.18)

  if group.width > 5.52:
    group.scale_to_fit_width(5.52)
  if group.height > 3.00:
    group.scale_to_fit_height(3.00)

  return place_top_left(group, left=-5.72, top=3.05)


def scene_layout(yaw: CameraScalar, pitch: CameraScalar, roll: CameraScalar) -> VGroup:
  crosshair_center = point(0.0, 0.0)

  wireframe = always_redraw(lambda: voxel_wireframe(yaw.get_value(), pitch.get_value(), roll.get_value(), crosshair_center))
  label_5uog = always_redraw(lambda: world_label_5uog(yaw.get_value(), pitch.get_value(), roll.get_value(), crosshair_center))
  crosshair = axis_crosshair(yaw, pitch, roll, crosshair_center)
  definitions = left_top_definitions(yaw, pitch, roll)
  values = right_top_axis_values(yaw, pitch, roll)

  return VGroup(wireframe, label_5uog, crosshair, definitions, values)


class DebugHudAxisCrosshairProjectionPhoto(Scene):
  def construct(self) -> None:
    self.camera.background_color = BLACK

    yaw = ValueTracker(LOOP_BASE_YAW_DEG)
    pitch = ValueTracker(LOOP_BASE_PITCH_DEG)
    roll = ValueTracker(LOOP_BASE_ROLL_DEG)

    self.add(scene_layout(yaw, pitch, roll))


class DebugHudAxisCrosshairCameraVideo(Scene):
  def construct(self) -> None:
    self.camera.background_color = BLACK

    phase = ValueTracker(0.0)
    yaw = ComputedCameraScalar(lambda: LOOP_BASE_YAW_DEG + 34.0 * math.sin(phase.get_value()) + 14.0 * math.sin(2.0 * phase.get_value()))
    pitch = ComputedCameraScalar(lambda: LOOP_BASE_PITCH_DEG - 11.0 * math.sin(phase.get_value()) + 7.0 * math.sin(3.0 * phase.get_value()))
    roll = ComputedCameraScalar(lambda: LOOP_BASE_ROLL_DEG + 16.0 * math.sin(2.0 * phase.get_value()) - 8.0 * math.sin(phase.get_value()))

    self.add(scene_layout(yaw, pitch, roll))
    self.play(phase.animate.set_value(2.0 * math.pi), run_time=VIDEO_LOOP_SECONDS, rate_func=linear)


def render_photo(temp_dir: Path) -> Path:
  with tempconfig({"media_dir": str(temp_dir), "format": "png", "save_last_frame": True, "write_to_movie": False, "disable_caching": True}):
    scene = DebugHudAxisCrosshairProjectionPhoto()
    scene.render()
    image_path = Path(scene.renderer.file_writer.image_file_path)

  PHOTO_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
  shutil.copy2(image_path, PHOTO_OUTPUT)
  return PHOTO_OUTPUT


def render_video(temp_dir: Path) -> Path:
  with tempconfig({"media_dir": str(temp_dir), "quality": "medium_quality", "write_to_movie": True, "save_last_frame": False, "disable_caching": True}):
    scene = DebugHudAxisCrosshairCameraVideo()
    scene.render()
    movie_path = Path(scene.renderer.file_writer.movie_file_path)

  VIDEO_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
  shutil.copy2(movie_path, VIDEO_OUTPUT)
  return VIDEO_OUTPUT


def render_assets() -> tuple[Path, Path]:
  with tempfile.TemporaryDirectory(prefix="ludoxel_axis_crosshair_manim_") as temp_name:
    temp_dir = Path(temp_name)
    photo_path = render_photo(temp_dir)
    video_path = render_video(temp_dir)

  return photo_path, video_path


if __name__ == "__main__":
  config.frame_width = 12.0
  config.frame_height = 6.75
  config.pixel_width = 1920
  config.pixel_height = 1080

  photo, video = render_assets()
  print(f"wrote {photo}")
  print(f"wrote {video}")
