# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import QCheckBox, QComboBox, QFrame, QGridLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.application.preferences.camera import CAMERA_PERSPECTIVE_LABELS, CAMERA_PERSPECTIVE_ORDER
from ludoxel.application.preferences.keybinds import CONTROL_SECTION_GAMEPLAY, CONTROL_SECTION_MOVEMENT, HOTBAR_ACTIONS
from ludoxel.application.preferences.runtime import RuntimePreferences
from ludoxel.presentation.interface.common.status_overlay import status_overlay_title_image_path
from ludoxel.presentation.interface.settings.cloud_flow import CLOUD_FLOW_OPTIONS
from ludoxel.presentation.interface.settings.widgets.crosshair import CrosshairPixelEditor, CrosshairPreviewWidget
from ludoxel.presentation.interface.settings.widgets.scalar import AdvancedScalarControl
from ludoxel.simulation.worlds.config.movement import DEFAULT_MOVEMENT_PARAMS

if TYPE_CHECKING:
  from ludoxel.presentation.interface.settings.overlay import SettingsOverlay

_PROFILE_IMAGE_CANDIDATE_NAMES = ("profile.png", "profile.jpg", "profile.jpeg", "profile.webp", "profile.bmp")
_CREATOR_DISPLAY_NAME = "Kento Konishi"
_CREATOR_HANDLE = "5uog"
_CREATOR_ROLE = "Keio University student / Ludoxel creator"
_CREATOR_AGE = "20"
_CREATOR_GENDER = "he/him"


_ABOUT_PROFILE_BIO_TEXT: str = (
  "My academic work is directed toward future legal practice, with particular concern for victim protection, fact finding, procedural access, information management, and "
  "institutional reform. Law forms the center of that study, while information security and user-experience practice support the examination of how protective systems can be "
  "made safer, clearer, and more practically reachable. Ludoxel is developed separately as a personal desktop software project. It shares a related discipline with that "
  "academic direction because complex institutional and technical systems both require structures that can be inspected, tested, explained, and held accountable through "
  "explicit architecture, rendering behavior, persistence, input design, packaging, licensing, and repository governance."
)

_ABOUT_WORK_TEXT: str = (
  "I work on Ludoxel as a PyQt6 desktop application with persistent voxel-world state, first-person and third-person interaction, collision, picking, block-state rendering, "
  "falling-block behavior, AI-player behavior and settings, a separate Othello play space, OpenGL and wgpu renderer paths, native hot-path acceleration, runtime persistence, "
  "desktop packaging, bundled resources, licensing, and repository governance."
)

_ABOUT_ACADEMIC_DIRECTION_TEXT: str = (
  "My academic direction centers on legal practice, victim protection, fact finding, procedural access, information management, and institutional reform. Software-system "
  "design, verification, persistence, interface construction, and governance are relevant to that direction because protective systems must remain inspectable, explainable, "
  "testable, and accountable when they handle human claims, evidence, access routes, stored information, and institutional decisions."
)

_ABOUT_PROJECT_OVERVIEW_PARAGRAPHS: tuple[str, ...] = (
  (
    "Ludoxel is a PyQt6 desktop application for controlled experimentation on a restricted voxel-world model, a first-person and third-person camera pipeline, and "
    "platform-specific voxel renderers. The present codebase contains a persistent My World sandbox, a separate Othello play space, survival-only player health with fall "
    "damage, melee damage feedback, knockback, lethal-damage death handling, state-dependent block-shape logic for selected structural block families, gravity-affected falling "
    "blocks for `sand`, `red_sand`, and `gravel`, AI-player spawning through a dedicated creative-inventory `AI` special item, and a narrowly selected native-acceleration path "
    "for arithmetic-intensive kernels."
  ),
  (
    "Ludoxel is an engineering workbench for rendering, collision, picking, input, persistence, deterministic numerical inspection, and desktop packaging. Minecraft-derived "
    "semantics appear only as local design targets for implemented subsystems. The project does not claim rule-complete reproduction of Minecraft Bedrock Edition or Minecraft "
    "Java Edition and does not assert complete equivalence for movement, combat, world generation, inventory logic, redstone, networking, or content coverage."
  ),
  (
    "The desktop shell exposes two persistent application modes: `My World` and `Play Othello (Reversi)`. The pause menu switches between those spaces and `Save & Quit` "
    "persists the current world, player state, mode-local session data, and runtime preferences before closing. Each space keeps its own player transform and session-specific "
    "state, and the shell reuses the same loading and resource-resolution paths when transferring between spaces."
  ),
  (
    "`My World` is the persistent sandbox space. It supports placement, breaking, rendering, picking, collision, imported skin state, camera perspective, HUD visibility, "
    "explicit player name persistence, and survival health with a `20`-point health pool. Fall damage follows Minecraft-like thresholds, falling below `y = -64` applies "
    "repeated void damage on a fixed half-second cadence, and lethal damage enters the ordinary death-and-respawn flow."
  ),
  (
    "The implemented block catalog includes full cubes, slabs, stairs, fences, fence gates, and walls. Those families use explicit block-state logic for render boxes, "
    "collision volumes, pick volumes, and structural connectivity. `sand`, `red_sand`, and `gravel` leave the static world as transient falling bodies, descend on a "
    "Minecraft-like falling-block tick, render continuously between ticks, settle on supported lower structural blocks, and break with the same terrain-fragment particle path "
    "when the implemented landing rule destroys them."
  ),
  (
    "The player collision and block-edit paths include depenetration for pre-existing overlaps, special restoration for saved overlaps inside closed fence gates, and preserved "
    "overlap handling when landed gravity blocks settle onto the player. Runtime restoration reconstructs those exemptions before the first post-load collision step so restart "
    "behavior remains consistent with the saved state instead of forcing the camera or player body into a new support condition."
  ),
  (
    "The block interaction path includes continuous creative breaking and continuous right-click placement or interaction. The persisted cadences are `0.30 s` for break "
    "repetition, approximately `0.008 s` for placement continuation, and `0.20 s` for interaction repetition. Held placement is constrained to a maintained continuation line, "
    "classifies visible side-face starts, support-face starts, grounded crouch-bridging starts, top-face and bottom-face starts, and deferred starts where the target cell is "
    "temporarily occupied by the player body. The maintained frontier advances only when the attempted target cell actually remains a valid world block after placement, which "
    "prevents skipped cells, unsupported falling-block loops, and route mutation from an obsolete start cell."
  ),
  (
    "AI-player behavior is implemented inside the current sandbox. The creative inventory exposes a searchable `AI` special item. Right-clicking a valid placement cell spawns "
    "a standby AI instance, and right-clicking that actor opens a per-instance settings window with `Standby`, `Route Patrol`, and `Free Roam / PVP` modes, `Aggressive` and "
    "`Peaceful` personalities, a block-placement permission switch, route editing, route deletion, and actor deletion. Spawned AI players persist independently with transform, "
    "health, behavior mode, placement permission, route style, and route state."
  ),
  (
    "Route AI uses strict and flexible routing styles. The flexible planner snapshots a bounded world window around the patrol region, offloads support-cell route planning to "
    "a background worker, accepts complete routes that reach the authored patrol point, reuses returned support-cell paths while valid, retries failed targets, applies local "
    "recovery when fresh routing is unavailable, and freezes when no complete route exists to the present authored point. During melee pursuit it suspends route planning and "
    "falls back to direct combat pursuit so path search does not consume gameplay-thread time during active combat."
  ),
  (
    "Free-roam and route AI share the local player's collision, jump, placement, interaction, and kinematic stepping paths. AI actors can receive and deal melee knockback, "
    "flash red when damaged, swing the visible attack arm during successful melee strikes, and use jump-reset, knockback-reduction placement, and bridge-placement heuristics "
    "when placement is enabled. Aggressive AI attacks only when the player is inside the implemented eye-line and melee reach, while peaceful AI does not attack."
  ),
  (
    "Camera perspective is persistent runtime state. The default `F5` cycle follows `First Person -> Third Person Back -> Third Person Front -> First Person`, the action is "
    "remappable, and the video settings page can select the perspective directly. Third-person placement is collision-constrained against block collision volumes, uses "
    "near-plane and clearance parameters that keep nearby faces visible, suppresses the gameplay crosshair outside first person, and projects the resolved player name above "
    "the third-person model when gameplay HUD rendering is enabled."
  ),
  (
    "The settings surfaces expose persistent video, control, player, crosshair, cloud, break-particle, arm-swing, movement, player-name, fullscreen, and Othello settings "
    "through detached application-modal windows. The `About` page belongs to that settings shell and uses the existing title-mark search path when no separate creator portrait "
    "asset is present. Opening a detached settings window while fullscreen is enabled temporarily returns the host window to normal state and reapplies the stored fullscreen "
    "preference after the detached dialog closes."
  ),
  (
    "`Play Othello (Reversi)` is a separate persistent play space inside the same application shell. It disables ordinary voxel placement, block breaking, and the block "
    "inventory overlay. Its hotbar is reserved for control items, its settings window configures AI strength, time control, animation mode, player order, sacrifice level, "
    "worker count, hash level, and opening-book learning limits, and its board interaction path handles legal disc placement, algebraic hover reports, match clocks, Othello "
    "HUD output, board rendering, and pause behavior."
  ),
  (
    "The Othello subsystem includes `Weak`, `Medium`, `Strong`, `Insane`, and `Insane+` difficulty paths, time controls from per-move limits through side clocks, simultaneous "
    "and ripple disc-animation choices, threshold-controlled opening-book learning, cancellable learning progress, persisted user book lines under "
    "`state/othello_opening_book.json`, compiled opening-book cache under `cache/othello_opening_book_cache.json`, opening-book import and export, and symmetry-aware storage "
    "through canonicalized board transforms."
  ),
  (
    "The canonical source-tree startup route is `python -m ludoxel`. The package entry path is `src/ludoxel/__main__.py`, after which control passes into "
    "`ludoxel.application.bootstrap`. The visible application title is **Ludoxel**, while the import namespace remains `ludoxel`. At startup the shell enforces a single "
    "visible desktop instance, loads persisted identity and window state, presents the player-name dialog when no explicit name is stored, displays a loading surface before "
    "the main window becomes usable, and suspends simulation input until renderer initialization and initial residency have converged."
  ),
  (
    "The source layout is divided by responsibility. `foundations` owns identity, repository and runtime root resolution, diagnostics, and math kernels. `simulation` owns "
    "world state, block catalogs and models, movement, collision and interaction rules, player and AI-player state, inventories, Othello rules, engines, books, and bundled "
    "book resources. `application` owns bootstrap, UI-independent preferences, persistence stores and integrity checking, session factories, session managers, runtime-state "
    "pipelines, render snapshot DTOs, and fixed-step runners. `presentation` owns Qt windows, input, HUD, overlays, settings surfaces, theme resources, renderer contracts, "
    "OpenGL and wgpu backends, shader resources, visual builders, and audio playback."
  ),
  (
    "The Windows source and bundle path retains the PyOpenGL renderer and its OpenGL 4.3 contract. The macOS source and `.app` path uses wgpu-native through the Qt "
    "`rendercanvas` surface so the application reaches Metal without depending on Apple's OpenGL 4.1 implementation. The macOS path keeps keyboard interception and mouse "
    "confinement separate, uses a native CoreGraphics event tap for the keyboard guard, recenters the system cursor for mouse-look capture, and records "
    "`NSInputMonitoringUsageDescription` in the `.app` bundle."
  ),
  (
    "Native acceleration is deliberately narrow. Only `ludoxel.foundations.mathematics.geometry.ray_aabb`, `ludoxel.foundations.mathematics.voxels.dda`, and "
    "`ludoxel.foundations.mathematics.linear.view_angles` are compiled in place. Those modules are dominated by scalar arithmetic, geometric branching, and dense numerical "
    "work. Scene orchestration, block orchestration, session management, persistence, UI state, and renderer scheduling remain Python responsibilities because those layers are "
    "governed by object ownership, callback dispatch, dictionaries, and heterogeneous application state rather than one dense arithmetic kernel."
  ),
  (
    "Runtime-writable data is separated from immutable package resources. Repository-level `configs/` is previous-format input and is not the normal save location for current "
    "runtime writes. The app-managed data root separates durable `state/` files from rebuildable `cache/` files. Player settings, window state, world edits, custom player "
    "skin, and the Othello user opening-book extension are state. The compiled Othello opening-book map is cache. Main state files use an HMAC-SHA256 manifest to detect simple "
    "external edits or accidental corruption; this is tamper detection, not complete tamper prevention against a local user who can rewrite both data files and the local "
    "integrity key."
  ),
  (
    "The legal boundary is explicit. Ludoxel Original Materials follow the Ludoxel Independent License identified as `LicenseRef-All-Rights-Reserved`, and the repository is "
    "not open source. Third-party materials, provenance-sensitive local assets, runtime user data, and application output are distinct from those Original Materials. Desktop "
    "builds must include `LICENSE`, `NOTICE`, and `third-party/`, and package startup registers bundled fonts rather than relying on a platform system-font fallback."
  ),
)


def _first_existing_asset(resource_root: Path | None, relative_dir: str, candidate_names: tuple[str, ...]) -> Path | None:
  if resource_root is None:
    return None
  base = Path(resource_root) / relative_dir
  for name in tuple(candidate_names):
    candidate = base / str(name)
    if candidate.is_file():
      return candidate.resolve()
  return None


def _profile_image_path(resource_root: Path | None) -> Path | None:
  return _first_existing_asset(resource_root, "assets/ui/profile", _PROFILE_IMAGE_CANDIDATE_NAMES)


def _about_text(parent: QWidget, text: str, object_name: str = "subtitle") -> QLabel:
  label = QLabel(str(text), parent)
  label.setObjectName(str(object_name))
  label.setWordWrap(True)
  return label


def _about_pill(parent: QWidget, text: str) -> QLabel:
  label = QLabel(str(text), parent)
  label.setObjectName("aboutPill")
  label.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  return label


def _about_meta_row(layout: QGridLayout, row: int, title: str, value: str, parent: QWidget) -> None:
  title_label = QLabel(str(title), parent)
  title_label.setObjectName("aboutMetaTitle")
  value_label = QLabel(str(value), parent)
  value_label.setObjectName("aboutMetaValue")
  value_label.setWordWrap(True)
  layout.addWidget(title_label, int(row), 0)
  layout.addWidget(value_label, int(row), 1)


def build_video_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  layout.addWidget(overlay._section(host, "Display"))
  overlay._tg_fullscreen = overlay._add_toggle(layout, host, "Fullscreen", overlay.fullscreen_changed.emit)
  overlay._tg_hide_hud = overlay._add_toggle(layout, host, "Hide HUD", overlay.hide_hud_changed.emit)
  overlay._tg_hide_hand = overlay._add_toggle(layout, host, "Hide Hand", overlay.hide_hand_changed.emit)
  overlay._tg_view_bobbing = overlay._add_toggle(layout, host, "View Bobbing", overlay._on_view_bobbing_toggled)

  bob_row = QVBoxLayout()
  overlay._lbl_view_bobbing_strength = QLabel("View Bobbing strength: 35%", host)
  overlay._lbl_view_bobbing_strength.setObjectName("valueLabel")
  overlay._sld_view_bobbing_strength = overlay._new_slider(host, int(overlay._params.bob_strength_percent_min), int(overlay._params.bob_strength_percent_max))
  overlay._sld_view_bobbing_strength.valueChanged.connect(overlay._on_view_bobbing_strength)
  bob_row.addWidget(overlay._lbl_view_bobbing_strength)
  bob_row.addWidget(overlay._sld_view_bobbing_strength)
  layout.addLayout(bob_row)

  overlay._tg_camera_shake = overlay._add_toggle(layout, host, "Camera Shake", overlay._on_camera_shake_toggled)
  shake_row = QVBoxLayout()
  overlay._lbl_camera_shake_strength = QLabel("Camera Shake strength: 20%", host)
  overlay._lbl_camera_shake_strength.setObjectName("valueLabel")
  overlay._sld_camera_shake_strength = overlay._new_slider(host, int(overlay._params.shake_strength_percent_min), int(overlay._params.shake_strength_percent_max))
  overlay._sld_camera_shake_strength.valueChanged.connect(overlay._on_camera_shake_strength)
  shake_row.addWidget(overlay._lbl_camera_shake_strength)
  shake_row.addWidget(overlay._sld_camera_shake_strength)
  layout.addLayout(shake_row)

  fov_row = QVBoxLayout()
  overlay._lbl_fov = QLabel("FOV: 80", host)
  overlay._lbl_fov.setObjectName("valueLabel")
  overlay._sld_fov = overlay._new_slider(host, int(overlay._params.fov_min), int(overlay._params.fov_max))
  overlay._sld_fov.valueChanged.connect(overlay._on_fov)
  fov_row.addWidget(overlay._lbl_fov)
  fov_row.addWidget(overlay._sld_fov)
  layout.addLayout(fov_row)

  camera_row = QHBoxLayout()
  overlay._lbl_camera_perspective = QLabel("Camera perspective", host)
  overlay._lbl_camera_perspective.setObjectName("valueLabel")
  camera_row.addWidget(overlay._lbl_camera_perspective)
  overlay._cmb_camera_perspective = QComboBox(host)
  for value in CAMERA_PERSPECTIVE_ORDER:
    overlay._cmb_camera_perspective.addItem(str(CAMERA_PERSPECTIVE_LABELS[str(value)]), userData=str(value))
  overlay._cmb_camera_perspective.currentIndexChanged.connect(overlay._on_camera_perspective)
  camera_row.addWidget(overlay._cmb_camera_perspective)
  camera_row.addStretch(1)
  layout.addLayout(camera_row)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Player Model"))

  overlay._ctl_arm_rotation_limit_min = AdvancedScalarControl(
    title="Arm rotation minimum",
    min_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MIN_DEG),
    max_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MAX_DEG),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MIN_DEG),
    parent=host,
  )
  overlay._ctl_arm_rotation_limit_min.value_changed.connect(overlay.arm_rotation_limit_min_changed.emit)
  layout.addWidget(overlay._ctl_arm_rotation_limit_min)

  overlay._ctl_arm_rotation_limit_max = AdvancedScalarControl(
    title="Arm rotation maximum",
    min_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MIN_DEG),
    max_value=float(RuntimePreferences.ARM_ROTATION_LIMIT_ALLOWED_MAX_DEG),
    slider_scale=1.0,
    decimals=0,
    default_value=float(RuntimePreferences.DEFAULT_ARM_ROTATION_LIMIT_MAX_DEG),
    parent=host,
  )
  overlay._ctl_arm_rotation_limit_max.value_changed.connect(overlay.arm_rotation_limit_max_changed.emit)
  layout.addWidget(overlay._ctl_arm_rotation_limit_max)

  overlay._ctl_arm_swing_duration = AdvancedScalarControl(
    title="Arm swing duration",
    min_value=float(RuntimePreferences.ARM_SWING_DURATION_MIN_S),
    max_value=float(RuntimePreferences.ARM_SWING_DURATION_MAX_S),
    slider_scale=100.0,
    decimals=2,
    default_value=float(RuntimePreferences.DEFAULT_ARM_SWING_DURATION_S),
    parent=host,
  )
  overlay._ctl_arm_swing_duration.value_changed.connect(overlay.arm_swing_duration_changed.emit)
  layout.addWidget(overlay._ctl_arm_swing_duration)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Crosshair"))

  overlay._lbl_crosshair_help = QLabel(
    "Draw a custom 16x16 crosshair with the left mouse button, erase with the right mouse button, or use Clear Board to restore the default Minecraft-style crosshair and reset the editor board.", host
  )
  overlay._lbl_crosshair_help.setObjectName("valueLabel")
  overlay._lbl_crosshair_help.setWordWrap(True)
  layout.addWidget(overlay._lbl_crosshair_help)

  crosshair_preview_row = QHBoxLayout()
  overlay._crosshair_preview = CrosshairPreviewWidget(host)
  crosshair_preview_row.addWidget(overlay._crosshair_preview, stretch=0)

  crosshair_buttons = QVBoxLayout()
  overlay._btn_crosshair_clear = QPushButton("Clear Board", host)
  overlay._btn_crosshair_clear.setObjectName("menuBtn")
  overlay._btn_crosshair_clear.clicked.connect(overlay.crosshair_clear_requested.emit)
  crosshair_buttons.addWidget(overlay._btn_crosshair_clear)
  crosshair_buttons.addStretch(1)
  crosshair_preview_row.addLayout(crosshair_buttons, stretch=0)
  crosshair_preview_row.addStretch(1)
  layout.addLayout(crosshair_preview_row)

  overlay._crosshair_editor = CrosshairPixelEditor(host)
  overlay._crosshair_editor.pixels_changed.connect(overlay.crosshair_pixels_changed.emit)
  layout.addWidget(overlay._crosshair_editor)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "World"))

  rd_row = QVBoxLayout()
  overlay._lbl_rd = QLabel("Render distance: 6 chunks", host)
  overlay._lbl_rd.setObjectName("valueLabel")
  overlay._sld_rd = overlay._new_slider(host, int(overlay._params.render_dist_min), int(overlay._params.render_dist_max))
  overlay._sld_rd.valueChanged.connect(overlay._on_rd)
  rd_row.addWidget(overlay._lbl_rd)
  rd_row.addWidget(overlay._sld_rd)
  layout.addLayout(rd_row)

  overlay._tg_animated_textures = overlay._add_toggle(layout, host, "Animated Textures", overlay.animated_textures_changed.emit)
  overlay._tg_outline_sel = overlay._add_toggle(layout, host, "Outline selection", overlay.outline_selection_changed.emit)
  overlay._tg_world_wire = overlay._add_toggle(layout, host, "World wireframe", overlay.world_wireframe_changed.emit)
  overlay._tg_shadow_enabled = overlay._add_toggle(layout, host, "Shadow map", overlay.shadow_enabled_changed.emit)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Particles"))

  overlay._ctl_block_break_particle_spawn_rate = AdvancedScalarControl(
    title="Break particle spawn rate",
    min_value=float(overlay._params.block_break_particle_spawn_rate_milli_min) / float(overlay._params.block_break_particle_spawn_rate_scale),
    max_value=float(overlay._params.block_break_particle_spawn_rate_milli_max) / float(overlay._params.block_break_particle_spawn_rate_scale),
    slider_scale=float(overlay._params.block_break_particle_spawn_rate_scale),
    decimals=int(overlay._params.block_break_particle_spawn_rate_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPAWN_RATE),
    parent=host,
  )
  overlay._ctl_block_break_particle_spawn_rate.value_changed.connect(overlay.block_break_particle_spawn_rate_changed.emit)
  layout.addWidget(overlay._ctl_block_break_particle_spawn_rate)

  overlay._ctl_block_break_particle_speed_scale = AdvancedScalarControl(
    title="Break particle speed",
    min_value=float(overlay._params.block_break_particle_speed_milli_min) / float(overlay._params.block_break_particle_speed_scale),
    max_value=float(overlay._params.block_break_particle_speed_milli_max) / float(overlay._params.block_break_particle_speed_scale),
    slider_scale=float(overlay._params.block_break_particle_speed_scale),
    decimals=int(overlay._params.block_break_particle_speed_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_BREAK_PARTICLE_SPEED_SCALE),
    parent=host,
  )
  overlay._ctl_block_break_particle_speed_scale.value_changed.connect(overlay.block_break_particle_speed_scale_changed.emit)
  layout.addWidget(overlay._ctl_block_break_particle_speed_scale)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Clouds"))

  overlay._tg_clouds_enabled = overlay._add_toggle(layout, host, "Show clouds", overlay._on_clouds_toggled)
  overlay._tg_cloud_wire = overlay._add_toggle(layout, host, "Cloud wireframe", overlay.cloud_wireframe_changed.emit)

  cloud_flow_row = QHBoxLayout()
  overlay._lbl_cloud_flow = QLabel("Cloud flow direction", host)
  overlay._lbl_cloud_flow.setObjectName("valueLabel")
  cloud_flow_row.addWidget(overlay._lbl_cloud_flow)
  overlay._cmb_cloud_flow = QComboBox(host)
  for value, label in CLOUD_FLOW_OPTIONS:
    overlay._cmb_cloud_flow.addItem(str(label), userData=str(value))
  overlay._cmb_cloud_flow.currentIndexChanged.connect(overlay._on_cloud_flow_direction)
  cloud_flow_row.addWidget(overlay._cmb_cloud_flow)
  cloud_flow_row.addStretch(1)
  layout.addLayout(cloud_flow_row)

  cloud_density_row = QVBoxLayout()
  overlay._lbl_cloud_density = QLabel("Cloud density: 1", host)
  overlay._lbl_cloud_density.setObjectName("valueLabel")
  overlay._sld_cloud_density = overlay._new_slider(host, 0, 4)
  overlay._sld_cloud_density.valueChanged.connect(overlay._on_cloud_density)
  cloud_density_row.addWidget(overlay._lbl_cloud_density)
  cloud_density_row.addWidget(overlay._sld_cloud_density)
  layout.addLayout(cloud_density_row)

  cloud_seed_row = QVBoxLayout()
  overlay._lbl_cloud_seed = QLabel("Cloud seed: 1337", host)
  overlay._lbl_cloud_seed.setObjectName("valueLabel")
  overlay._sld_cloud_seed = overlay._new_slider(host, 0, 9999)
  overlay._sld_cloud_seed.valueChanged.connect(overlay._on_cloud_seed)
  cloud_seed_row.addWidget(overlay._lbl_cloud_seed)
  cloud_seed_row.addWidget(overlay._sld_cloud_seed)
  layout.addLayout(cloud_seed_row)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Sun"))

  sun_az_row = QVBoxLayout()
  overlay._lbl_sun_az = QLabel("Sun azimuth: 45 deg", host)
  overlay._lbl_sun_az.setObjectName("valueLabel")
  overlay._sld_sun_az = overlay._new_slider(host, int(overlay._params.sun_az_min), int(overlay._params.sun_az_max))
  overlay._sld_sun_az.valueChanged.connect(overlay._on_sun_az)
  sun_az_row.addWidget(overlay._lbl_sun_az)
  sun_az_row.addWidget(overlay._sld_sun_az)
  layout.addLayout(sun_az_row)

  sun_el_row = QVBoxLayout()
  overlay._lbl_sun_el = QLabel("Sun elevation: 60 deg", host)
  overlay._lbl_sun_el.setObjectName("valueLabel")
  overlay._sld_sun_el = overlay._new_slider(host, int(overlay._params.sun_el_min), int(overlay._params.sun_el_max))
  overlay._sld_sun_el.valueChanged.connect(overlay._on_sun_el)
  sun_el_row.addWidget(overlay._lbl_sun_el)
  sun_el_row.addWidget(overlay._sld_sun_el)
  layout.addLayout(sun_el_row)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_controls_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  layout.addWidget(overlay._section(host, "Mouse"))

  sens_row = QVBoxLayout()
  overlay._lbl_sens = QLabel("Mouse sensitivity: 0.090 deg/px", host)
  overlay._lbl_sens.setObjectName("valueLabel")
  overlay._sld_sens = overlay._new_slider(host, int(overlay._params.sens_milli_min), int(overlay._params.sens_milli_max))
  overlay._sld_sens.valueChanged.connect(overlay._on_sens)
  sens_row.addWidget(overlay._lbl_sens)
  sens_row.addWidget(overlay._sld_sens)
  layout.addLayout(sens_row)

  invert_row = QHBoxLayout()
  overlay._cb_inv_x = QCheckBox("Invert X", host)
  overlay._cb_inv_y = QCheckBox("Invert Y", host)
  overlay._cb_inv_x.toggled.connect(overlay.invert_x_changed.emit)
  overlay._cb_inv_y.toggled.connect(overlay.invert_y_changed.emit)
  invert_row.addWidget(overlay._cb_inv_x)
  invert_row.addWidget(overlay._cb_inv_y)
  invert_row.addStretch(1)
  layout.addLayout(invert_row)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Movement Keys"))
  for action in CONTROL_SECTION_MOVEMENT:
    overlay._add_keybind_row(layout, host, str(action))

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Gameplay Keys"))
  for action in CONTROL_SECTION_GAMEPLAY:
    overlay._add_keybind_row(layout, host, str(action))

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Hotbar Keys"))
  for action in HOTBAR_ACTIONS:
    overlay._add_keybind_row(layout, host, str(action))

  row_reset = QHBoxLayout()
  row_reset.addStretch(1)
  btn_reset_bindings = QPushButton("Reset Keybinds", host)
  btn_reset_bindings.setObjectName("menuBtn")
  btn_reset_bindings.clicked.connect(overlay.keybind_reset_requested.emit)
  row_reset.addWidget(btn_reset_bindings)
  layout.addLayout(row_reset)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_audio_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  layout.addWidget(overlay._section(host, "Mixer"))

  overlay._lbl_master_volume = QLabel("Master volume: 100%", host)
  overlay._lbl_master_volume.setObjectName("valueLabel")
  overlay._sld_master_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_master_volume.valueChanged.connect(overlay._on_master_volume)
  layout.addWidget(overlay._lbl_master_volume)
  layout.addWidget(overlay._sld_master_volume)

  overlay._lbl_ambient_volume = QLabel("Ambient volume: 100%", host)
  overlay._lbl_ambient_volume.setObjectName("valueLabel")
  overlay._sld_ambient_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_ambient_volume.valueChanged.connect(overlay._on_ambient_volume)
  layout.addWidget(overlay._lbl_ambient_volume)
  layout.addWidget(overlay._sld_ambient_volume)

  overlay._lbl_block_volume = QLabel("Block volume: 100%", host)
  overlay._lbl_block_volume.setObjectName("valueLabel")
  overlay._sld_block_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_block_volume.valueChanged.connect(overlay._on_block_volume)
  layout.addWidget(overlay._lbl_block_volume)
  layout.addWidget(overlay._sld_block_volume)

  overlay._lbl_player_volume = QLabel("Player volume: 100%", host)
  overlay._lbl_player_volume.setObjectName("valueLabel")
  overlay._sld_player_volume = overlay._new_slider(host, 0, 100)
  overlay._sld_player_volume.valueChanged.connect(overlay._on_player_volume)
  layout.addWidget(overlay._lbl_player_volume)
  layout.addWidget(overlay._sld_player_volume)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_game_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page()
  layout.addWidget(overlay._section(host, "Game Mode"))

  overlay._btn_mode_toggle = QPushButton(host)
  overlay._btn_mode_toggle.setObjectName("modeToggle")
  overlay._btn_mode_toggle.setCheckable(True)
  overlay._btn_mode_toggle.clicked.connect(overlay._on_mode_toggle_clicked)
  layout.addWidget(overlay._btn_mode_toggle)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Player Options"))

  overlay._tg_auto_jump = overlay._add_toggle(layout, host, "Auto-Jump", overlay.auto_jump_changed.emit)
  overlay._tg_auto_sprint = overlay._add_toggle(layout, host, "Auto-Sprint", overlay.auto_sprint_changed.emit)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Player Identity"))

  overlay._name_edit = QLineEdit(host)
  overlay._name_edit.setPlaceholderText("Leave blank for a random name each launch")
  overlay._name_edit.editingFinished.connect(overlay._on_player_name_edited)
  layout.addWidget(overlay._name_edit)

  overlay._player_name_hint = QLabel("", host)
  overlay._player_name_hint.setObjectName("subtitle")
  overlay._player_name_hint.setWordWrap(True)
  layout.addWidget(overlay._player_name_hint)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Interaction Parameters"))

  overlay._ctl_block_break_repeat_interval = AdvancedScalarControl(
    title="Break repeat interval",
    min_value=float(overlay._params.block_break_repeat_interval_milli_min) / float(overlay._params.block_break_repeat_interval_scale),
    max_value=float(overlay._params.block_break_repeat_interval_milli_max) / float(overlay._params.block_break_repeat_interval_scale),
    slider_scale=float(overlay._params.block_break_repeat_interval_scale),
    decimals=int(overlay._params.block_break_repeat_interval_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_BREAK_REPEAT_INTERVAL_S),
    parent=host,
  )
  overlay._ctl_block_break_repeat_interval.value_changed.connect(overlay.block_break_repeat_interval_changed.emit)
  layout.addWidget(overlay._ctl_block_break_repeat_interval)

  overlay._ctl_block_place_repeat_interval = AdvancedScalarControl(
    title="Place repeat interval",
    min_value=float(overlay._params.block_place_repeat_interval_milli_min) / float(overlay._params.block_place_repeat_interval_scale),
    max_value=float(overlay._params.block_place_repeat_interval_milli_max) / float(overlay._params.block_place_repeat_interval_scale),
    slider_scale=float(overlay._params.block_place_repeat_interval_scale),
    decimals=int(overlay._params.block_place_repeat_interval_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_PLACE_REPEAT_INTERVAL_S),
    parent=host,
  )
  overlay._ctl_block_place_repeat_interval.value_changed.connect(overlay.block_place_repeat_interval_changed.emit)
  layout.addWidget(overlay._ctl_block_place_repeat_interval)

  overlay._ctl_block_interact_repeat_interval = AdvancedScalarControl(
    title="Interact repeat interval",
    min_value=float(overlay._params.block_interact_repeat_interval_milli_min) / float(overlay._params.block_interact_repeat_interval_scale),
    max_value=float(overlay._params.block_interact_repeat_interval_milli_max) / float(overlay._params.block_interact_repeat_interval_scale),
    slider_scale=float(overlay._params.block_interact_repeat_interval_scale),
    decimals=int(overlay._params.block_interact_repeat_interval_decimals),
    default_value=float(RuntimePreferences.DEFAULT_BLOCK_INTERACT_REPEAT_INTERVAL_S),
    parent=host,
  )
  overlay._ctl_block_interact_repeat_interval.value_changed.connect(overlay.block_interact_repeat_interval_changed.emit)
  layout.addWidget(overlay._ctl_block_interact_repeat_interval)

  layout.addWidget(overlay._sep(host))
  layout.addWidget(overlay._section(host, "Movement Parameters"))

  overlay._ctl_gravity = AdvancedScalarControl(
    title="Gravity",
    min_value=float(overlay._params.gravity_milli_min) / float(overlay._params.gravity_scale),
    max_value=float(overlay._params.gravity_milli_max) / float(overlay._params.gravity_scale),
    slider_scale=float(overlay._params.gravity_scale),
    decimals=int(overlay._params.gravity_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.gravity),
    parent=host,
  )
  overlay._ctl_gravity.value_changed.connect(overlay.gravity_changed.emit)
  layout.addWidget(overlay._ctl_gravity)

  overlay._ctl_walk_speed = AdvancedScalarControl(
    title="Walk speed",
    min_value=float(overlay._params.walk_speed_milli_min) / float(overlay._params.walk_speed_scale),
    max_value=float(overlay._params.walk_speed_milli_max) / float(overlay._params.walk_speed_scale),
    slider_scale=float(overlay._params.walk_speed_scale),
    decimals=int(overlay._params.walk_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.walk_speed),
    parent=host,
  )
  overlay._ctl_walk_speed.value_changed.connect(overlay.walk_speed_changed.emit)
  layout.addWidget(overlay._ctl_walk_speed)

  overlay._ctl_sprint_speed = AdvancedScalarControl(
    title="Sprint speed",
    min_value=float(overlay._params.sprint_speed_milli_min) / float(overlay._params.sprint_speed_scale),
    max_value=float(overlay._params.sprint_speed_milli_max) / float(overlay._params.sprint_speed_scale),
    slider_scale=float(overlay._params.sprint_speed_scale),
    decimals=int(overlay._params.sprint_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.sprint_speed),
    parent=host,
  )
  overlay._ctl_sprint_speed.value_changed.connect(overlay.sprint_speed_changed.emit)
  layout.addWidget(overlay._ctl_sprint_speed)

  overlay._ctl_jump_v0 = AdvancedScalarControl(
    title="Jump velocity",
    min_value=float(overlay._params.jump_v0_milli_min) / float(overlay._params.jump_v0_scale),
    max_value=float(overlay._params.jump_v0_milli_max) / float(overlay._params.jump_v0_scale),
    slider_scale=float(overlay._params.jump_v0_scale),
    decimals=int(overlay._params.jump_v0_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.jump_v0),
    parent=host,
  )
  overlay._ctl_jump_v0.value_changed.connect(overlay.jump_v0_changed.emit)
  layout.addWidget(overlay._ctl_jump_v0)

  overlay._ctl_auto_jump_cooldown = AdvancedScalarControl(
    title="Auto-jump cooldown",
    min_value=float(overlay._params.auto_jump_cooldown_milli_min) / float(overlay._params.auto_jump_cooldown_scale),
    max_value=float(overlay._params.auto_jump_cooldown_milli_max) / float(overlay._params.auto_jump_cooldown_scale),
    slider_scale=float(overlay._params.auto_jump_cooldown_scale),
    decimals=int(overlay._params.auto_jump_cooldown_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.auto_jump_cooldown_s),
    parent=host,
  )
  overlay._ctl_auto_jump_cooldown.value_changed.connect(overlay.auto_jump_cooldown_changed.emit)
  layout.addWidget(overlay._ctl_auto_jump_cooldown)

  layout.addWidget(overlay._section(host, "Flight Parameters"))

  overlay._ctl_fly_speed = AdvancedScalarControl(
    title="Flight speed",
    min_value=float(overlay._params.fly_speed_milli_min) / float(overlay._params.fly_speed_scale),
    max_value=float(overlay._params.fly_speed_milli_max) / float(overlay._params.fly_speed_scale),
    slider_scale=float(overlay._params.fly_speed_scale),
    decimals=int(overlay._params.fly_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.fly_speed),
    parent=host,
  )
  overlay._ctl_fly_speed.value_changed.connect(overlay.fly_speed_changed.emit)
  layout.addWidget(overlay._ctl_fly_speed)

  overlay._ctl_fly_ascend_speed = AdvancedScalarControl(
    title="Ascend speed",
    min_value=float(overlay._params.fly_ascend_speed_milli_min) / float(overlay._params.fly_ascend_speed_scale),
    max_value=float(overlay._params.fly_ascend_speed_milli_max) / float(overlay._params.fly_ascend_speed_scale),
    slider_scale=float(overlay._params.fly_ascend_speed_scale),
    decimals=int(overlay._params.fly_ascend_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.fly_ascend_speed),
    parent=host,
  )
  overlay._ctl_fly_ascend_speed.value_changed.connect(overlay.fly_ascend_speed_changed.emit)
  layout.addWidget(overlay._ctl_fly_ascend_speed)

  overlay._ctl_fly_descend_speed = AdvancedScalarControl(
    title="Descend speed",
    min_value=float(overlay._params.fly_descend_speed_milli_min) / float(overlay._params.fly_descend_speed_scale),
    max_value=float(overlay._params.fly_descend_speed_milli_max) / float(overlay._params.fly_descend_speed_scale),
    slider_scale=float(overlay._params.fly_descend_speed_scale),
    decimals=int(overlay._params.fly_descend_speed_decimals),
    default_value=float(DEFAULT_MOVEMENT_PARAMS.fly_descend_speed),
    parent=host,
  )
  overlay._ctl_fly_descend_speed.value_changed.connect(overlay.fly_descend_speed_changed.emit)
  layout.addWidget(overlay._ctl_fly_descend_speed)

  layout.addWidget(overlay._sep(host))

  btn_reset_adv = QPushButton("Reset Advanced to Defaults", host)
  btn_reset_adv.setObjectName("menuBtn")
  btn_reset_adv.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  btn_reset_adv.clicked.connect(overlay.advanced_reset_requested.emit)
  layout.addWidget(btn_reset_adv)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)


def build_about_tab(overlay: "SettingsOverlay") -> None:
  scroll, host, layout = overlay._make_scroll_page(page_object_name="aboutPage")
  layout.setContentsMargins(8, 8, 8, 8)
  layout.setSpacing(16)

  title_image_path = None if overlay._resource_root is None else status_overlay_title_image_path(overlay._resource_root)
  profile_path = _profile_image_path(overlay._resource_root)

  profile_card = QFrame(host)
  profile_card.setObjectName("aboutProfileCard")
  profile_layout = QGridLayout(profile_card)
  profile_layout.setContentsMargins(0, 0, 0, 24)
  profile_layout.setHorizontalSpacing(18)
  profile_layout.setVerticalSpacing(0)
  profile_layout.setColumnMinimumWidth(0, 176)
  profile_layout.setColumnStretch(0, 0)
  profile_layout.setColumnStretch(1, 1)
  profile_layout.setRowMinimumHeight(0, 140)
  profile_layout.setRowStretch(0, 0)
  profile_layout.setRowStretch(1, 1)

  cover = QFrame(profile_card)
  cover.setObjectName("aboutProfileCover")
  cover.setFixedHeight(140)
  cover.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
  cover_layout = QVBoxLayout(cover)
  cover_layout.setContentsMargins(22, 18, 22, 18)
  cover_layout.setSpacing(0)

  mark_label = QLabel("Ludoxel", cover)
  mark_label.setObjectName("aboutProfileMark")
  mark_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
  if title_image_path is not None:
    mark_pixmap = QPixmap(str(title_image_path))
    if not mark_pixmap.isNull():
      mark_label.setText("")
      mark_label.setPixmap(mark_pixmap.scaled(300, 96, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))
  cover_layout.addWidget(mark_label, alignment=Qt.AlignmentFlag.AlignRight)
  profile_layout.addWidget(cover, 0, 0, 1, 2)

  avatar_layer = QWidget(profile_card)
  avatar_layer.setObjectName("aboutAvatarLayer")
  avatar_layer_layout = QVBoxLayout(avatar_layer)
  avatar_layer_layout.setContentsMargins(22, 112, 22, 0)
  avatar_layer_layout.setSpacing(0)

  avatar = QLabel("KK", profile_card)
  avatar.setObjectName("aboutAvatar")
  avatar.setFixedSize(132, 132)
  avatar.setAlignment(Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
  if profile_path is not None:
    avatar_pixmap = QPixmap(str(profile_path))
    if not avatar_pixmap.isNull():
      avatar.setText("")
      avatar.setPixmap(avatar_pixmap.scaled(132, 132, Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation))
  avatar_layer_layout.addWidget(avatar, alignment=Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft)
  avatar_layer_layout.addStretch(1)
  profile_layout.addWidget(avatar_layer, 0, 0, 2, 1)

  profile_text_column = QVBoxLayout()
  profile_text_column.setContentsMargins(0, 22, 22, 0)
  profile_text_column.setSpacing(8)

  display_name = QLabel(_CREATOR_DISPLAY_NAME, profile_card)
  display_name.setObjectName("aboutProfileName")
  profile_text_column.addWidget(display_name)

  handle = QLabel(f"@{_CREATOR_HANDLE}", profile_card)
  handle.setObjectName("aboutProfileHandle")
  profile_text_column.addWidget(handle)

  role = QLabel(_CREATOR_ROLE, profile_card)
  role.setObjectName("aboutProfileRole")
  role.setWordWrap(True)
  profile_text_column.addWidget(role)

  pill_row = QHBoxLayout()
  pill_row.setContentsMargins(0, 4, 0, 0)
  pill_row.setSpacing(8)
  pill_row.addWidget(_about_pill(profile_card, "Engineering"))
  pill_row.addWidget(_about_pill(profile_card, "Law"))
  pill_row.addWidget(_about_pill(profile_card, "Voxel Systems"))
  pill_row.addStretch(1)
  profile_text_column.addLayout(pill_row)

  profile_text_column.addWidget(_about_text(profile_card, _ABOUT_PROFILE_BIO_TEXT, "aboutProfileBio"))
  profile_layout.addLayout(profile_text_column, 1, 1)
  layout.addWidget(profile_card)

  meta_card = QFrame(host)
  meta_card.setObjectName("aboutCard")
  meta_layout = QGridLayout(meta_card)
  meta_layout.setContentsMargins(18, 18, 18, 18)
  meta_layout.setHorizontalSpacing(18)
  meta_layout.setVerticalSpacing(10)
  _about_meta_row(meta_layout, 0, "Name", _CREATOR_DISPLAY_NAME, meta_card)
  _about_meta_row(meta_layout, 1, "Handle", f"@{_CREATOR_HANDLE}", meta_card)
  _about_meta_row(meta_layout, 2, "Age", _CREATOR_AGE, meta_card)
  _about_meta_row(meta_layout, 3, "Gender", _CREATOR_GENDER, meta_card)
  _about_meta_row(meta_layout, 4, "Work", _ABOUT_WORK_TEXT, meta_card)
  _about_meta_row(meta_layout, 5, "Academic direction", _ABOUT_ACADEMIC_DIRECTION_TEXT, meta_card)
  layout.addWidget(meta_card)

  etymology_card = QFrame(host)
  etymology_card.setObjectName("aboutCard")
  etymology_layout = QVBoxLayout(etymology_card)
  etymology_layout.setContentsMargins(18, 18, 18, 18)
  etymology_layout.setSpacing(10)

  etymology_title = QLabel("Etymology", etymology_card)
  etymology_title.setObjectName("sectionTitle")
  etymology_layout.addWidget(etymology_title)
  etymology_layout.addWidget(
    _about_text(
      etymology_card,
      "Latin 'ludus' underlies the initial element 'lud-'. Its attested semantic field extends across play, game, sport, and school or training. The stem therefore bears a general ludic reference: not combat in particular, not one ruleset in particular, and not training in isolation, but play taken in its broader and more exact genus.",
    )
  )
  etymology_layout.addWidget(
    _about_text(
      etymology_card,
      "'Voxel' is the modern technical contraction of 'volumetric' and 'pixel'. In technical usage, it denotes a discrete element of three-dimensional representation, commonly treated as the spatial analogue of the pixel, and thus refers to discretized volume rather than merely to visual style or atmospheric motif.",
    )
  )
  etymology_layout.addWidget(
    _about_text(
      etymology_card,
      "'Ludoxel' accordingly denotes ludic activity in voxel space, or, more strictly, play conducted within a discretized volumetric world. As the title of a sandbox application, the term is exact in the only sense that matters here: the operative environment is voxel-constituted, while the activity admitted within it is ludic in a broad sense, namely as play not exhausted by any single closed game form, but proceeding through locally open course and user-directed manipulation.",
    )
  )
  layout.addWidget(etymology_card)

  overview_card = QFrame(host)
  overview_card.setObjectName("aboutCard")
  overview_layout = QVBoxLayout(overview_card)
  overview_layout.setContentsMargins(18, 18, 18, 18)
  overview_layout.setSpacing(10)

  overview_title = QLabel("Project Overview", overview_card)
  overview_title.setObjectName("sectionTitle")
  overview_layout.addWidget(overview_title)
  for paragraph in _ABOUT_PROJECT_OVERVIEW_PARAGRAPHS:
    overview_layout.addWidget(_about_text(overview_card, paragraph))
  layout.addWidget(overview_card)

  layout.addStretch(1)
  overlay._stack.addWidget(scroll)
