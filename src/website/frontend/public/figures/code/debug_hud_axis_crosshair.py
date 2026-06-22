# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import math
import shutil
import tempfile
from pathlib import Path

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
  GREY_D,
  LEFT,
  RED_C,
  RED_E,
  RIGHT,
  UP,
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
  tempconfig,
)

WORLD_AXES = (
  np.array([1.0, 0.0, 0.0]),
  np.array([0.0, 1.0, 0.0]),
  np.array([0.0, 0.0, 1.0]),
)
UP_HINT = np.array([0.0, 1.0, 0.0])
CAMERA_POSITION = np.array([0.0, 1.62, -7.20])

AXIS_COLORS = (RED_C, GREEN_C, BLUE_C)
AXIS_GLOW_COLORS = (RED_E, GREEN_E, BLUE_E)
AXIS_LABELS = (r"{+X}", r"{+Y}", r"{+Z}")
AXIS_SUBSCRIPTS = (r"X", r"Y", r"Z")
AXIS_ZERO_LABEL_OFFSETS = (
  np.array([0.34, -0.25, 0.0]),
  np.array([0.34, 0.25, 0.0]),
  np.array([-0.38, -0.30, 0.0]),
)

FIGURES_ROOT = Path(__file__).resolve().parents[1]
PHOTO_OUTPUT = FIGURES_ROOT / "photo" / "debug-hud-axis-crosshair-projection.png"
VIDEO_OUTPUT = FIGURES_ROOT / "videos" / "debug-hud-axis-crosshair-camera.mp4"


def normalize(value: np.ndarray) -> np.ndarray:
  length = float(np.linalg.norm(value))
  if length <= 1e-12 or not math.isfinite(length):
    return np.array([0.0, 0.0, 0.0])
  return value / length


def forward_from_yaw_pitch_deg(yaw_deg: float, pitch_deg: float) -> np.ndarray:
  yaw = math.radians(float(yaw_deg))
  pitch = math.radians(float(pitch_deg))
  return normalize(
    np.array(
      [
        -math.sin(yaw) * math.cos(pitch),
        -math.sin(pitch),
        math.cos(yaw) * math.cos(pitch),
      ]
    )
  )


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
  return (
    axis_projection_values(0, yaw_deg, pitch_deg, roll_deg)[1],
    axis_projection_values(1, yaw_deg, pitch_deg, roll_deg)[1],
    axis_projection_values(2, yaw_deg, pitch_deg, roll_deg)[1],
  )


def point(x: float, y: float) -> np.ndarray:
  return np.array([float(x), float(y), 0.0])


def tex(expression: str, *, size: int = 32, color=WHITE) -> MathTex:
  return MathTex(expression, font_size=size, color=color)


def clean_number(value: float) -> float:
  if abs(value) < 0.005:
    return 0.0
  return float(value)


def world_depth(world: np.ndarray, yaw_deg: float, pitch_deg: float) -> float:
  forward = camera_basis(yaw_deg, pitch_deg)[0]
  relative = world - CAMERA_POSITION
  return float(np.dot(forward, relative))


def world_to_display(world: np.ndarray, yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray) -> np.ndarray | None:
  forward, right, up = camera_basis(yaw_deg, pitch_deg)
  relative = world - CAMERA_POSITION
  depth = float(np.dot(forward, relative))

  if depth <= 0.42 or not math.isfinite(depth):
    return None

  view = np.array(
    [
      float(np.dot(right, relative)),
      float(np.dot(up, relative)),
    ]
  )
  projected = rotate_plane(view / (depth + 0.48), roll_deg)
  return center + point(projected[0] * 3.28, projected[1] * 3.28)


def add_wire_segment(
  group: VGroup,
  start: np.ndarray,
  end: np.ndarray,
  yaw_deg: float,
  pitch_deg: float,
  roll_deg: float,
  center: np.ndarray,
  *,
  color=GREY_A,
  width: float = 1.15,
  opacity: float = 0.34,
) -> None:
  a = world_to_display(start, yaw_deg, pitch_deg, roll_deg, center)
  b = world_to_display(end, yaw_deg, pitch_deg, roll_deg, center)

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


def voxel_wireframe(yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray) -> VGroup:
  group = VGroup()

  near_z = -6.55
  far_z = 28.0
  extent = 16.0

  for x in range(-16, 17):
    start = np.array([float(x), 0.0, near_z])
    end = np.array([float(x), 0.0, far_z])
    opacity = 0.11 if x else 0.43
    width = 0.85 if x else 1.95
    add_wire_segment(group, start, end, yaw_deg, pitch_deg, roll_deg, center, color=GREY_A, width=width, opacity=opacity)

  for z_step in range(-6, 29):
    z = float(z_step)
    start = np.array([-extent, 0.0, z])
    end = np.array([extent, 0.0, z])
    near_boost = max(0.0, 1.0 - abs(z - near_z) / 7.0)
    opacity = 0.10 + near_boost * 0.15 + min(max(z, 0.0), 18.0) * 0.006
    width = 1.25 if z_step % 4 == 0 else 0.88
    add_wire_segment(group, start, end, yaw_deg, pitch_deg, roll_deg, center, color=GREY_A, width=width, opacity=min(opacity, 0.36))

  for y in (1.0, 2.0, 3.0, 4.0):
    for x in (-12.0, -8.0, -4.0, 0.0, 4.0, 8.0, 12.0):
      add_wire_segment(
        group,
        np.array([x, 0.0, 2.0]),
        np.array([x, y, 2.0]),
        yaw_deg,
        pitch_deg,
        roll_deg,
        center,
        color=GREY_B,
        width=0.95,
        opacity=0.14,
      )
      add_wire_segment(
        group,
        np.array([x, 0.0, 10.0]),
        np.array([x, y, 10.0]),
        yaw_deg,
        pitch_deg,
        roll_deg,
        center,
        color=GREY_B,
        width=0.90,
        opacity=0.12,
      )

  foreground_grid = (
    (np.array([-6.0, -0.75, -5.75]), np.array([6.0, -0.75, -5.75]), 0.30),
    (np.array([-7.0, -0.50, -4.75]), np.array([7.0, -0.50, -4.75]), 0.24),
    (np.array([-8.0, -0.25, -3.75]), np.array([8.0, -0.25, -3.75]), 0.20),
    (np.array([-7.5, -0.75, -5.75]), np.array([-7.5, 0.0, 8.0]), 0.16),
    (np.array([7.5, -0.75, -5.75]), np.array([7.5, 0.0, 8.0]), 0.16),
  )

  for start, end, opacity in foreground_grid:
    add_wire_segment(group, start, end, yaw_deg, pitch_deg, roll_deg, center, color=WHITE, width=1.10, opacity=opacity)

  cube_specs = (
    (np.array([-4.20, 0.0, 1.60]), 0.76, 0.58),
    (np.array([-3.44, 0.0, 1.60]), 0.76, 0.54),
    (np.array([-2.68, 0.0, 1.60]), 0.76, 0.50),
    (np.array([2.20, 0.0, 2.35]), 0.76, 0.54),
    (np.array([2.96, 0.0, 2.35]), 0.76, 0.50),
    (np.array([3.72, 0.0, 2.35]), 0.76, 0.46),
    (np.array([-1.05, 0.0, 4.45]), 0.90, 0.44),
    (np.array([-0.15, 0.0, 4.45]), 0.90, 0.42),
    (np.array([-0.15, 0.90, 4.45]), 0.90, 0.38),
    (np.array([-6.20, 0.0, 7.80]), 1.05, 0.34),
    (np.array([5.30, 0.0, 8.60]), 1.05, 0.32),
    (np.array([-2.30, 0.0, 12.20]), 1.15, 0.28),
    (np.array([2.20, 0.0, 14.20]), 1.15, 0.26),
  )

  for origin, size, opacity in cube_specs:
    for start, end in cube_edges(origin, size):
      add_wire_segment(group, start, end, yaw_deg, pitch_deg, roll_deg, center, color=WHITE, width=1.45, opacity=opacity)

  return group


def world_label_5uog(yaw_deg: float, pitch_deg: float, roll_deg: float, center: np.ndarray) -> VGroup:
  world = np.array([0.28, 2.18, 4.80])
  screen = world_to_display(world, yaw_deg, pitch_deg, roll_deg, center)
  depth = world_depth(world, yaw_deg, pitch_deg)

  if screen is None:
    return VGroup()

  label = tex(r"\mathrm{5uog}", size=32, color=YELLOW_C)
  label_scale = max(0.48, min(0.92, 1.22 / (0.18 * max(depth, 0.1) + 0.72)))
  label.scale(label_scale)
  label.move_to(screen)

  anchor_bottom = world_to_display(np.array([0.28, 0.20, 4.80]), yaw_deg, pitch_deg, roll_deg, center)
  if anchor_bottom is None:
    return VGroup(label)

  stem = Line(anchor_bottom, screen + point(0.0, -0.18 * label_scale), color=YELLOW_C, stroke_width=1.4)
  stem.set_opacity(0.38)

  return VGroup(stem, label)


def hud_center_mark(center: np.ndarray) -> VGroup:
  horizontal = Line(center + point(-0.13, 0.0), center + point(0.13, 0.0), color=WHITE, stroke_width=3.0)
  vertical = Line(center + point(0.0, -0.13), center + point(0.0, 0.13), color=WHITE, stroke_width=3.0)
  dot = Dot(center, radius=0.026, color=WHITE)

  horizontal.set_opacity(0.82)
  vertical.set_opacity(0.82)
  dot.set_opacity(0.95)

  r_hat = tex(r"\hat r", size=20, color=GREY_A)
  u_hat = tex(r"\hat u", size=20, color=GREY_A)
  f_hat = tex(r"\hat f", size=20, color=GREY_A)

  r_hat.move_to(center + point(0.40, -0.13))
  u_hat.move_to(center + point(0.18, 0.39))
  f_hat.move_to(center + point(-0.30, -0.29))

  r_hat.set_opacity(0.58)
  u_hat.set_opacity(0.58)
  f_hat.set_opacity(0.52)

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


def axis_labels(yaw: ValueTracker, pitch: ValueTracker, roll: ValueTracker, center: np.ndarray, radius: float) -> VGroup:
  labels = VGroup()

  for index, expression, color in zip(range(3), AXIS_LABELS, AXIS_COLORS):
    label = tex(expression, size=35, color=color)
    label.move_to(axis_label_position(index, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius))

    def updater(mobject: MathTex, axis_index: int = index) -> None:
      mobject.move_to(axis_label_position(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius))

    label.add_updater(updater)
    labels.add(label)

  return labels


def axis_crosshair(yaw: ValueTracker, pitch: ValueTracker, roll: ValueTracker, center: np.ndarray) -> VGroup:
  radius = 1.04
  return VGroup(
    hud_center_mark(center),
    always_redraw(lambda: axis_vector(0, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius)),
    always_redraw(lambda: axis_vector(1, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius)),
    always_redraw(lambda: axis_vector(2, yaw.get_value(), pitch.get_value(), roll.get_value(), center, radius)),
    axis_labels(yaw, pitch, roll, center, radius),
  )


def make_value(function, *, color=WHITE, scale: float = 0.42) -> DecimalNumber:
  value = DecimalNumber(clean_number(function()), num_decimal_places=2, include_sign=True, color=color)
  value.scale(scale)

  def updater(mobject: DecimalNumber) -> None:
    mobject.set_value(clean_number(function()))

  value.add_updater(updater)
  return value


def numeric_pair(prefix: str, first, second, *, color=WHITE) -> VGroup:
  group = VGroup(
    tex(prefix + r"=", size=19, color=color),
    tex(r"(", size=19, color=GREY_A),
    make_value(first, color=color, scale=0.34),
    tex(r",", size=19, color=GREY_A),
    make_value(second, color=color, scale=0.34),
    tex(r")", size=19, color=GREY_A),
  )
  group.arrange(RIGHT, buff=0.022)
  return group


def numeric_axis_row(axis_index: int, yaw: ValueTracker, pitch: ValueTracker, roll: ValueTracker) -> VGroup:
  color = AXIS_COLORS[axis_index]
  subscript = AXIS_SUBSCRIPTS[axis_index]

  def p_component(component: int):
    return lambda: axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[0][component]

  def q_component(component: int):
    return lambda: axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[1][component]

  def qt_component(component: int):
    return lambda: axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[2][component]

  def magnitude():
    return axis_projection_values(axis_index, yaw.get_value(), pitch.get_value(), roll.get_value())[3]

  axis = tex(AXIS_LABELS[axis_index] + r":", size=20, color=color)
  p_pair = numeric_pair(r"p_{" + subscript + r"}", p_component(0), p_component(1), color=color)
  q_pair = numeric_pair(r"q_{" + subscript + r"}", q_component(0), q_component(1), color=color)
  pi_pair = numeric_pair(r"\pi_{" + subscript + r"}", qt_component(0), qt_component(1), color=color)

  m_value = VGroup(
    tex(r"m_{" + subscript + r"}=", size=19, color=color),
    make_value(magnitude, color=color, scale=0.34),
  )
  m_value.arrange(RIGHT, buff=0.022)

  row = VGroup(axis, p_pair, q_pair, pi_pair, m_value)
  row.arrange(RIGHT, buff=0.066)
  return row


def place_bottom_left(mobject: VGroup, *, left: float, bottom: float) -> VGroup:
  mobject.shift(point(left - mobject.get_left()[0], bottom - mobject.get_bottom()[1]))
  return mobject


def place_top_right(mobject: VGroup, *, right: float, top: float) -> VGroup:
  mobject.shift(point(right - mobject.get_right()[0], top - mobject.get_top()[1]))
  return mobject


def left_bottom_axis_values(yaw: ValueTracker, pitch: ValueTracker, roll: ValueTracker) -> VGroup:
  rows = VGroup(
    numeric_axis_row(0, yaw, pitch, roll),
    numeric_axis_row(1, yaw, pitch, roll),
    numeric_axis_row(2, yaw, pitch, roll),
  )
  rows.arrange(DOWN, aligned_edge=LEFT, buff=0.10)

  if rows.width > 5.65:
    rows.scale_to_fit_width(5.65)

  return place_bottom_left(rows, left=-5.86, bottom=-3.12)


def right_top_definitions(yaw: ValueTracker, pitch: ValueTracker, roll: ValueTracker) -> VGroup:
  definitions = VGroup(
    tex(r"\hat f=F(\psi,\theta)", size=23, color=WHITE),
    tex(r"\hat r=\frac{u_0\times\hat f}{\Vert u_0\times\hat f\Vert}", size=23, color=WHITE),
    tex(r"\hat u=\hat f\times\hat r", size=23, color=WHITE),
    tex(r"p_a=(\hat r\cdot a,\ \hat u\cdot a)", size=23, color=WHITE),
    tex(r"q_a=R_\rho p_a", size=23, color=WHITE),
    tex(r"\pi(q_x,q_y)=(q_x,-q_y)", size=23, color=WHITE),
    tex(r"m_a=\Vert p_a\Vert_2=\sqrt{1-(\hat f\cdot a)^2}", size=23, color=WHITE),
  )
  definitions.arrange(DOWN, aligned_edge=LEFT, buff=0.105)

  pose = VGroup(
    tex(r"\psi=", size=20, color=GREY_A),
    make_value(lambda: yaw.get_value(), color=GREY_A, scale=0.34),
    tex(r"^\circ\quad\theta=", size=20, color=GREY_A),
    make_value(lambda: pitch.get_value(), color=GREY_A, scale=0.34),
    tex(r"^\circ\quad\rho=", size=20, color=GREY_A),
    make_value(lambda: roll.get_value(), color=GREY_A, scale=0.34),
    tex(r"^\circ", size=20, color=GREY_A),
  )
  pose.arrange(RIGHT, buff=0.022)

  group = VGroup(definitions, pose)
  group.arrange(DOWN, aligned_edge=LEFT, buff=0.18)

  if group.width > 4.45:
    group.scale_to_fit_width(4.45)
  if group.height > 2.18:
    group.scale_to_fit_height(2.18)

  return place_top_right(group, right=5.70, top=3.03)


def scene_layout(yaw: ValueTracker, pitch: ValueTracker, roll: ValueTracker) -> VGroup:
  crosshair_center = point(0.0, 0.0)

  wireframe = always_redraw(lambda: voxel_wireframe(yaw.get_value(), pitch.get_value(), roll.get_value(), crosshair_center))
  label_5uog = always_redraw(lambda: world_label_5uog(yaw.get_value(), pitch.get_value(), roll.get_value(), crosshair_center))
  crosshair = axis_crosshair(yaw, pitch, roll, crosshair_center)
  definitions = right_top_definitions(yaw, pitch, roll)
  values = left_bottom_axis_values(yaw, pitch, roll)

  return VGroup(wireframe, label_5uog, crosshair, definitions, values)


class DebugHudAxisCrosshairProjectionPhoto(Scene):
  def construct(self) -> None:
    self.camera.background_color = BLACK

    yaw = ValueTracker(0.0)
    pitch = ValueTracker(0.0)
    roll = ValueTracker(0.0)

    self.add(scene_layout(yaw, pitch, roll))


class DebugHudAxisCrosshairCameraVideo(Scene):
  def construct(self) -> None:
    self.camera.background_color = BLACK

    yaw = ValueTracker(0.0)
    pitch = ValueTracker(0.0)
    roll = ValueTracker(0.0)

    self.add(scene_layout(yaw, pitch, roll))
    self.wait(0.80)

    self.play(yaw.animate.set_value(18.0), run_time=2.10)
    self.play(yaw.animate.set_value(38.0), pitch.animate.set_value(-10.0), run_time=2.30)
    self.play(roll.animate.set_value(14.0), run_time=1.90)
    self.play(yaw.animate.set_value(-28.0), pitch.animate.set_value(8.0), roll.animate.set_value(-14.0), run_time=2.70)
    self.play(yaw.animate.set_value(54.0), pitch.animate.set_value(-18.0), roll.animate.set_value(22.0), run_time=2.60)
    self.play(yaw.animate.set_value(0.0), pitch.animate.set_value(0.0), roll.animate.set_value(0.0), run_time=2.40)
    self.wait(1.20)


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
