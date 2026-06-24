/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const settingsPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Visual and Audio Settings',
    group: 'Camera and Crosshair',
    title: 'Changing Camera Preferences',
    description: 'Defines camera preferences as a bounded runtime contract for projection, perspective, mouse response, and first-person presentation.',
    sections: [
      {
        id: 'changing-camera-preferences-owner-chain',
        title: 'Owner Chain',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/presentation/interface/settings/pages.py` creates the FOV slider, perspective combo, sensitivity slider, and inversion toggles; `src/ludoxel/presentation/interface/settings/overlay.py` turns those widgets into typed change signals; `src/ludoxel/application/preferences/runtime.py` stores the active values; and `src/ludoxel/application/preferences/camera.py` defines the finite perspective vocabulary. The settings surface supplies preference ingress, while input capture, collision, frustum construction, and renderer internals retain their own runtime owners.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/presentation/interface/viewport/controllers/settings.py` writes each accepted control value into `viewport._state` and calls `RuntimePreferences.normalize()` before synchronizing consumers. Camera-perspective changes pass through `normalize_camera_perspective`; view-bobbing and camera-shake values are clamped in the runtime aggregate; settings synchronization then projects the normalized values back into the overlay. The renderer and first-person motion read that normalized state, making the displayed control, stored preference, and visible camera behavior one explicit propagation path.',
          },
          {
            kind: 'paragraph',
            text: 'Camera preference handling has four distinct write and read stages. `SettingsOverlay` emits a control value, the viewport settings controller applies it to runtime state, `RuntimePreferences.normalize()` admits the canonical representation, and the synchronization/runtime-application path distributes that value to widgets and presentation consumers. `PersistedSettings` later serializes the normalized preference set for the application store. Projection, mouse response, first-person geometry, and the camera-facing renderer state consume the admitted fields; the widget label supplies neither a second value domain nor a rendering instruction outside that pipeline.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/settings/pages.py',
            code: `overlay._lbl_fov = QLabel("FOV: 80 deg", host)
overlay._sld_fov = overlay._new_slider(host, int(overlay._params.fov_min), int(overlay._params.fov_max))
overlay._sld_fov.valueChanged.connect(overlay._on_fov)

for value in CAMERA_PERSPECTIVE_ORDER:
  overlay._cmb_camera_perspective.addItem(str(CAMERA_PERSPECTIVE_LABELS[str(value)]), userData=str(value))
overlay._cmb_camera_perspective.currentIndexChanged.connect(overlay._on_camera_perspective)`,
          },
        ],
      },
      {
        id: 'changing-camera-preferences-decode-and-widget-range',
        title: 'Decode, Range, and Widget Projection',
        content: [
          {
            kind: 'paragraph',
            text: 'Persisted camera-related scalars first cross `src/ludoxel/foundations/mathematics/scalars/coercion.py`, not the widget layer. `PersistedSettings.from_dict` in `src/ludoxel/application/persistence/schema/settings.py` calls `mapping_float` and `mapping_bool` for saved FOV, sensitivity, inversion, view-bobbing, and camera-shake fields. The numeric helpers convert with `float` or `int` and use the supplied default only when that conversion raises; the boolean and string helpers have their own direct branches. None of these helpers defines a camera vocabulary, a slider range, semantic validity, or a renderer consequence. In particular, this source does not perform a finite-value test, so finite-value policy cannot be inferred from the coercion helper alone.',
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\operatorname{coerceFloat}(v,d)=\\operatorname{float}(v)\\ \\text{when conversion succeeds};\\qquad \\operatorname{coerceFloat}(v,d)=\\operatorname{float}(d)\\ \\text{when it raises}',
              displayMode: true,
              caption: '`coerce_float` in `src/ludoxel/foundations/mathematics/scalars/coercion.py`; this is exception fallback, not a finite-value, range, or camera-mode validator.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/scalars/coercion.py',
            code: `def coerce_float(value: object, default: float) -> float:
  try:
    return float(value)
  except Exception:
    return float(default)


def mapping_float(d: Mapping[str, Any], key: str, default: float) -> float:
  return coerce_float(d.get(str(key), default), float(default))`,
          },
          {
            kind: 'paragraph',
            text: '`coerce_bool` preserves booleans directly, treats numeric values through Python truthiness, and recognizes only the case-folded string sets `1,true,yes,on` and `0,false,no,off`. Other strings return the supplied default. The mapping helpers first convert the lookup key with `str(key)` and use the default when the mapping has no entry. This is an admission mechanism for serialized values, not a declaration that every admitted truthy or non-finite numeric value is semantically supported by a control.',
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/mathematics/scalars/numeric.py` supplies the separate range operation. `clampf` and `round_clampi` convert their operands and bound a value against caller-provided limits; they do not decide which setting a value represents. `src/ludoxel/presentation/interface/settings/sync.py` consumes those primitives while projecting admitted runtime values back into sliders: for view bobbing and camera shake it clamps the runtime scalar to `[0, 1]`, multiplies by 100, rounds, and then bounds the integer percent. The visible percent is therefore a UI projection of the runtime value, not a second persisted representation.',
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\operatorname{clampf}(x,\\ell,h)=\\min(\\max(x,\\ell),h)\\quad(\\ell\\le h),\\qquad \\operatorname{round\\_clampi}(x,\\ell,h)=\\operatorname{clampi}(\\operatorname{int}(\\operatorname{round}(\\operatorname{float}(x))),\\ell,h)',
              displayMode: true,
              caption:
                '`clampf` and `round_clampi` in `src/ludoxel/foundations/mathematics/scalars/numeric.py`. The source compares the caller-provided bounds as given; it does not sort or normalize an inverted interval.',
            },
          },
          {
            kind: 'math',
            math: {
              expression: 'q = \\operatorname{round}(100\\,\\operatorname{clamp}(s, 0, 1))',
              displayMode: true,
              caption: 'The view-bobbing and camera-shake slider projection in `sync_overlay_values`, where s is the runtime strength and q is the widget percent.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/scalars/numeric.py',
            code: `def clampf(x: float, lo: float, hi: float) -> float:
  value = float(x)
  low = float(lo)
  high = float(hi)
  if value < low:
    return low
  if value > high:
    return high
  return value


def round_clampi(x: float, lo: int, hi: int) -> int:
  return clampi(int(round(float(x))), int(lo), int(hi))`,
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'Coercion and clamping preserve a technical admission boundary: they convert a serialized scalar and bound it. Supported camera modes are fixed by `normalize_camera_perspective`, input capture by the input adapter, and renderer-backend selection by the rendering layer — none of which this admission step reaches.',
            },
          },
        ],
      },
      {
        id: 'changing-camera-preferences-perspective-normalization',
        title: 'Perspective Normalization',
        content: [
          {
            kind: 'paragraph',
            text: 'Perspective is stored as one identifier drawn from a closed vocabulary. `normalize_camera_perspective` admits only `first_person`, `third_person_back`, and `third_person_front`, and it falls back to first person for missing or malformed values. The cycling helper applies modular movement across that same order. A saved value outside the vocabulary does not create a hidden perspective mode; it is projected back to the canonical first-person identifier before runtime use.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/camera.py',
            code: `CAMERA_PERSPECTIVE_ORDER: tuple[str, ...] = (CAMERA_PERSPECTIVE_FIRST_PERSON, CAMERA_PERSPECTIVE_THIRD_PERSON_BACK, CAMERA_PERSPECTIVE_THIRD_PERSON_FRONT)

def normalize_camera_perspective(value: object) -> str:
  normalized = str(value).strip().lower()
  if normalized in CAMERA_PERSPECTIVE_LABELS:
    return normalized
  return CAMERA_PERSPECTIVE_FIRST_PERSON

def cycle_camera_perspective(value: object, step: int = 1) -> str:
  normalized = normalize_camera_perspective(value)
  count = len(CAMERA_PERSPECTIVE_ORDER)
  index = CAMERA_PERSPECTIVE_ORDER.index(normalized)
  return str(CAMERA_PERSPECTIVE_ORDER[(index + int(step)) % count])`,
          },
        ],
      },
      {
        id: 'changing-camera-preferences-runtime-effect',
        title: 'Runtime Effect and Reportable Evidence',
        content: [
          {
            kind: 'paragraph',
            text: '`RuntimePreferences.normalize` is the point where camera perspective is canonicalized together with FOV, sensitivity, inversion, view bobbing, camera shake, HUD visibility, and hand visibility. The consumer may then decide how those values affect render snapshots and camera motion, but the Settings article should not pretend that a widget label directly changes renderer state. A useful bug report should preserve the perspective identifier, FOV, sensitivity, inversion flags, mouse-capture state, overlay focus state, and observed view effect as separate facts.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/runtime.py',
            code: `self.player_name = normalize_player_name(self.player_name)
self.crosshair_mode = normalize_crosshair_mode(self.crosshair_mode)
self.crosshair_pixels = normalize_crosshair_pixels(self.crosshair_pixels)
self.player_skin_kind = normalize_player_skin_kind(self.player_skin_kind)
self.camera_perspective = normalize_camera_perspective(self.camera_perspective)`,
          },
          {
            kind: 'paragraph',
            text: 'The same normalization pass clamps both view-bobbing and camera-shake strength to `[0, 1]`, clamps arm rotation limits to `[-180, 180]` degrees and orders them if reversed, and clamps arm swing duration to `[0.05, 1.50]` seconds. Those are admitted runtime values, not claims that every camera mode displays the same motion. `view_model_visible()` separately requires the normalized first-person perspective and `hide_hand == false`; a saved third-person perspective cannot expose the first-person arm merely by retaining hand-motion fields.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Changing perspective changes camera presentation. It does not by itself establish a change to the player collision body, world state, save-file authority, input-capture policy, or legal permission boundary.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Looking Around', 'Using Mouse Capture', 'Understanding Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Visual and Audio Settings',
    group: 'Camera and Crosshair',
    title: 'Changing Crosshair Preferences',
    description:
      'Defines the 16 x 16 crosshair editor, normalized bitmap persistence, and F3 Debug HUD axis projection as separate HUD rendering contracts that share the center-screen crosshair surface.',
    sections: [
      {
        id: 'changing-crosshair-preferences-surface',
        title: 'Settings Surface',
        content: [
          {
            kind: 'paragraph',
            text: 'The Display tab constructs the crosshair setting after the camera and view-motion controls. `CrosshairPixelEditor` admits the visible 16 x 16 edit surface, `CrosshairPreviewWidget` renders the local preview, and the reset button emits `crosshair_clear_requested` to return the runtime setting to the built-in art. The Settings page owns preference ingress; `src/ludoxel/presentation/interface/hud/crosshair_art.py` and `CrosshairWidget` own the pixels that reach the gameplay HUD.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/settings/pages.py',
            code: `overlay._crosshair_preview = CrosshairPreviewWidget(crosshair_body)

overlay._crosshair_editor = CrosshairPixelEditor(crosshair_body)
overlay._crosshair_editor.pixels_changed.connect(overlay.crosshair_pixels_changed.emit)

overlay._btn_crosshair_reset = QPushButton("Reset to Built-in Crosshair", crosshair_body)
overlay._btn_crosshair_reset.clicked.connect(overlay.crosshair_clear_requested.emit)`,
          },
        ],
      },
      {
        id: 'changing-crosshair-preferences-bitmap-contract',
        title: 'Bitmap Contract',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/crosshair.py` owns the custom-crosshair value domain. The custom crosshair is a logical bitmap value. Image-file import, texture-pack substitution, and shader material replacement sit outside that preference contract. `normalize_crosshair_pixels` admits list-like rows, truncates the row set to sixteen entries, truncates each row to sixteen characters, converts the character `1` into an active pixel, converts every other character into `0`, and pads missing cells or rows with zeroes. The persisted representation is therefore a deterministic tuple of sixteen binary strings.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/crosshair.py',
            code: `CROSSHAIR_GRID_SIZE = 16
CROSSHAIR_MODE_DEFAULT = "default"
CROSSHAIR_MODE_CUSTOM = "custom"

def normalize_crosshair_pixels(value: object) -> tuple[str, ...]:
  rows: list[str] = []
  if isinstance(value, (list, tuple)):
    for raw_row in value[:CROSSHAIR_GRID_SIZE]:
      text = str(raw_row or "")
      row = "".join("1" if ch == "1" else "0" for ch in text[:CROSSHAIR_GRID_SIZE])
      rows.append(row.ljust(CROSSHAIR_GRID_SIZE, "0"))
  while len(rows) < CROSSHAIR_GRID_SIZE:
    rows.append(_EMPTY_ROW)
  return tuple(rows[:CROSSHAIR_GRID_SIZE])`,
          },
          {
            kind: 'math',
            math: {
              expression: '16 \\times 16 = 256',
              displayMode: true,
              caption: 'A custom crosshair contains at most 256 binary pixel decisions.',
            },
          },
          {
            kind: 'paragraph',
            text: '`crosshair_mode` is a separate two-value selector. The literal `custom` selects the normalized bitmap. Missing, malformed, and other text resolves to `default`. A valid all-zero bitmap therefore remains a custom value, while an invalid mode loses access to the custom drawing branch.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/crosshair.py',
            code: `def normalize_crosshair_mode(value: object) -> str:
  if str(value or "").strip().lower() == CROSSHAIR_MODE_CUSTOM:
    return CROSSHAIR_MODE_CUSTOM
  return CROSSHAIR_MODE_DEFAULT`,
          },
        ],
      },
      {
        id: 'changing-crosshair-preferences-debug-hud-axis',
        title: 'Debug HUD Axis Crosshair',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`ACTION_TOGGLE_DEBUG_HUD`, bound to `F3` by default, moves the center crosshair into a diagnostic paint branch. `_sync_gameplay_hud_visibility` in `src/ludoxel/presentation/interface/viewport/overlays/state.py` calls `set_axis_crosshair_enabled(self._debug_hud_active())` on `CrosshairWidget`, and the viewport overlay path forwards the ',
              {
                kind: 'link',
                label: 'renderer effective camera',
                href: '/docs/systems/runtime-and-render-state/session-loop/understanding-render-snapshots',
              },
              ' through `set_axis_camera`. The visible result is a three-arm world-axis crosshair: world `+X` in red, world `+Y` in green, and world `+Z` in blue, all resolved from the live `render_yaw_deg`, `render_pitch_deg`, and `render_roll_deg` values.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The demonstration video records that branch during the periodic camera phase. Its left panel keeps the projection equations visible; its right panel reports `p`, `q`, `pi`, and `m` for `+X`, `+Y`, and `+Z` on separate rows; the center crosshair draws the colored world axes; the ground plane resolves into one-block wire segments; and the `5uog` label rotates and scales with its world-space sign plane.',
          },
          {
            kind: 'media',
            media: {
              kind: 'video',
              sources: [
                {
                  src: '/figures/videos/debug-hud-axis-crosshair-camera.mp4',
                  type: 'video/mp4',
                },
              ],
              controls: false,
              loop: true,
              autoPlay: true,
              muted: true,
              playsInline: true,
              poster: '/figures/photos/debug-hud-axis-crosshair-projection.png',
            },
          },
          {
            kind: 'paragraph',
            text: '`axis_screen_offsets` in `src/ludoxel/presentation/interface/hud/crosshair_axis.py` owns the runtime projection math. The function builds the camera basis from `forward_from_yaw_pitch_deg`, derives the right vector as `u_0 x f`, derives the up vector as `f x r`, projects each unit world axis into the view plane, applies roll through `R_rho`, and flips the vertical component into screen coordinates. The crosshair arm therefore follows the same center-screen orientation that a world-space axis produces under the active camera.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/hud/crosshair_axis.py',
            code: `right = _UP_HINT.cross(forward).normalized()
up = forward.cross(right).normalized()

view_x = float(right.dot(axis))
view_y = float(up.dot(axis))
rolled_x = float(cos_roll) * float(view_x) - float(sin_roll) * float(view_y)
rolled_y = float(sin_roll) * float(view_x) + float(cos_roll) * float(view_y)
screen_dx = float(rolled_x)
screen_dy = -float(rolled_y)`,
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\begin{aligned}p_a&=(\\hat r\\cdot a,\\ \\hat u\\cdot a)\\\\q_a&=R_\\rho p_a\\\\\\pi(q_x,q_y)&=(q_x,-q_y)\\\\m_a&=\\lVert p_a\\rVert_2=\\sqrt{1-(\\hat f\\cdot a)^2}\\end{aligned}',
              displayMode: true,
              caption:
                'The notation exposes the implementation quantities: view-plane components enter the roll transform, the vertical component is inverted for screen coordinates, and the painter derives m from the resulting pair before arm scaling.',
            },
          },
          {
            kind: 'paragraph',
            text: '`CrosshairWidget._paint_axis_crosshair` consumes those offsets as immediate HUD geometry. It multiplies `_AXIS_ARM_LENGTH` by `m`, leaves `_AXIS_CENTER_GAP` around the exact center point, and draws each admitted arm with its axis color through `QPainter`. Degenerate or non-finite offsets are rejected for the affected arm in that frame; the singular camera orientation is confined to one missing or shortened axis while the surrounding HUD paint path continues with the remaining admitted geometry.',
          },
          {
            kind: 'paragraph',
            text: 'The video uses the same projection quantities to expose their visual consequences. The ground plane is drawn from integer block-boundary segments, so every displayed edge corresponds to a single one-block interval before the near-plane clip is applied. The `5uog` label sits on a world-space sign plane; its screen position, in-plane rotation, opacity, and width are derived from the projected sign center, projected horizontal edge, and camera depth. The camera phase is periodic, so the first frame and the terminal loop frame resolve to the same `+Z` label position and the same axis telemetry.',
          },
        ],
      },
      {
        id: 'changing-crosshair-preferences-boundaries',
        title: 'Boundaries',
        content: [
          {
            kind: 'paragraph',
            text: 'Crosshair preferences are saved as application settings and normalized through the runtime aggregate. The Debug HUD axis branch remains a transient paint branch over the same center-screen widget. The branch leaves `crosshair_mode` and `crosshair_pixels` under the bitmap preference path, and `set_pattern` continues to own the default and custom bitmap that returns when the Debug HUD closes. Asset replacement, shader mutation, package redistribution, and general theme override claims sit outside this setting surface.',
          },
          {
            kind: 'paragraph',
            text: 'Visibility remains controlled by the gameplay HUD gate. The crosshair is drawn in the first-person gameplay HUD, then suppressed by the same conditions that suppress the ordinary bitmap crosshair: a hidden HUD, an open overlay, the pause surface, the death surface, or a non-first-person perspective. A diagnostic record for this surface must preserve the selected mode, the normalized sixteen-row bitmap, the reset state, the HUD visibility state, and the Debug HUD state before the visible crosshair can be classified as a renderer defect.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content: 'A blank custom bitmap is valid after normalization. Every cell is zero, and the setting still has an explicit custom state.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Looking Around', 'Understanding Saved Preferences', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Visual and Audio Settings',
    group: 'World Visual Preferences',
    title: 'Changing Cloud Preferences',
    description:
      'Defines the cloud settings surface as a constrained renderer-input contract: visibility, density, seed, flow direction, per-cloud speed range, height range, preferred-height interval, and the normalization rules that prevent malformed saved values from entering the renderer.',
    sections: [
      {
        id: 'changing-cloud-preferences-setting-scope',
        title: 'Setting Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'Cloud preferences are exposed on the World tab of `SettingsOverlay`, but their authority is not the widget tree. `src/ludoxel/presentation/interface/settings/pages.py` creates the visible controls, `src/ludoxel/presentation/interface/settings/overlay.py` emits the typed change signals, `src/ludoxel/application/preferences/runtime.py` holds the mutable runtime fields, and `src/ludoxel/application/preferences/clouds.py` is the numerical contract that clamps and orders speed and height values. The page therefore concerns a renderer-facing preference vector, not a general weather system and not a world-generation rule.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/settings/pages.py',
            code: `overlay._tg_clouds_enabled = overlay._add_toggle(cloud_layout, cloud_body, "Show clouds", overlay._on_clouds_toggled)
overlay._tg_cloud_wire = overlay._add_toggle(cloud_layout, cloud_body, "Cloud wireframe", overlay.cloud_wireframe_changed.emit)

overlay._ctl_cloud_speed_min = AdvancedScalarControl(
  title="Slowest cloud speed (blocks/s)",
  min_value=float(RuntimePreferences.CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND),
  max_value=float(RuntimePreferences.CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND),
  slider_scale=100.0,
  decimals=2,
  default_value=float(RuntimePreferences.DEFAULT_CLOUD_SPEED_MIN_BLOCKS_PER_SECOND),
  parent=cloud_body,
)`,
          },
          {
            kind: 'paragraph',
            text: 'The visible surface names ordinary controls—show clouds, cloud wireframe, flow direction, density, seed, speed variation, speed endpoints, height variation, fixed Y, spawn interval, preferred interval, and preferred probability—but the persisted and runtime state is narrower than those labels. Every numeric value is admitted only after the runtime preference aggregate calls the corresponding normalizer.',
          },
        ],
      },
      {
        id: 'changing-cloud-preferences-normalization',
        title: 'Normalization Contract',
        content: [
          {
            kind: 'paragraph',
            text: 'Cloud speed is a closed interval measured in blocks per second. `normalize_cloud_speed_range` converts both endpoints to floats, clamps them to the implementation range `[0, 4]`, and swaps them when the user or saved file supplies the endpoints in the wrong order. The invariant is therefore not advisory: the renderer is never supposed to receive a speed interval where `min_speed > max_speed`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/clouds.py',
            code: `def normalize_cloud_speed_range(min_speed: object, max_speed: object) -> tuple[float, float]:
  lo = clampf(float(min_speed), float(CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND), float(CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND))
  hi = clampf(float(max_speed), float(CLOUD_SPEED_ALLOWED_MIN_BLOCKS_PER_SECOND), float(CLOUD_SPEED_ALLOWED_MAX_BLOCKS_PER_SECOND))
  if float(lo) > float(hi):
    lo, hi = float(hi), float(lo)
  return (float(lo), float(hi))`,
          },
          {
            kind: 'paragraph',
            text: 'Cloud height is an integer coordinate contract. Fixed height, spawn minimum, spawn maximum, preferred minimum, and preferred maximum are clamped to `CLOUD_Y_MIN` through `CLOUD_Y_MAX`, which are `28` and `250`. Reversed intervals are exchanged. The preferred interval is then clamped inside the normalized spawn interval, and the probability is clamped to `0` through `100`. A saved value outside the allowed range is not preserved as evidence of a hidden mode; it is projected back into the admitted domain.',
          },
          {
            kind: 'math',
            math: {
              expression: '28 \\le y_{fixed}, y_{spawn}, y_{preferred} \\le 250,\\qquad 0 \\le p_{preferred} \\le 100',
              displayMode: true,
              caption: 'The cloud normalizer enforces these bounds before renderer consumption.',
            },
          },
        ],
      },
      {
        id: 'changing-cloud-preferences-runtime-consumer',
        title: 'Runtime Consumer and Failure Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`RuntimePreferences.normalize` is the synchronization gate between persistence, the Settings overlay, and rendering. It normalizes the speed interval and height tuple together with the other runtime fields, then the renderer receives normalized cloud values through the runtime-state application path. A cloud control changing on screen is therefore not the same as a renderer accepting an arbitrary value; the value must survive the application preference contract first.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/runtime.py',
            code: `self.cloud_speed_min_blocks_per_second, self.cloud_speed_max_blocks_per_second = normalize_cloud_speed_range(
  self.cloud_speed_min_blocks_per_second, self.cloud_speed_max_blocks_per_second
)
(
  self.cloud_fixed_y,
  self.cloud_spawn_y_min,
  self.cloud_spawn_y_max,
  self.cloud_preferred_y_min,
  self.cloud_preferred_y_max,
  self.cloud_preferred_y_probability_percent,
) = normalize_cloud_height_settings(
  self.cloud_fixed_y,
  self.cloud_spawn_y_min,
  self.cloud_spawn_y_max,
  self.cloud_preferred_y_min,
  self.cloud_preferred_y_max,
  self.cloud_preferred_y_probability_percent,
)`,
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/cloud_flow.py` owns cloud-flow direction admission. Before range normalization, the runtime aggregate clamps cloud density to `[0, 4]`, cloud seed to `[0, 9999]`, and passes direction through `normalize_backend_cloud_flow_direction`. The admitted directions are `east_to_west`, `west_to_east`, `south_to_north`, and `north_to_south`; any other text becomes `west_to_east`. Direction is therefore neither a free label nor a world-generation seed, and a malformed saved direction cannot reach renderer configuration unchanged.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/cloud_flow.py',
            code: `DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION: str = "west_to_east"
BACKEND_CLOUD_FLOW_DIRECTIONS: tuple[str, str, str, str] = (
  "east_to_west",
  DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION,
  "south_to_north",
  "north_to_south",
)

def normalize_backend_cloud_flow_direction(raw: object) -> str:
  value = str(raw or "").strip().lower()
  if value in BACKEND_CLOUD_FLOW_DIRECTIONS:
    return value
  return DEFAULT_BACKEND_CLOUD_FLOW_DIRECTION`,
          },
          {
            kind: 'paragraph',
            text: 'A diagnostic report about cloud behavior should preserve the visible control values, the saved preference values, and the resulting rendered behavior separately. A mismatch may come from widget synchronization, persistence normalization, runtime projection, or renderer consumption. Collapsing those layers into “the cloud setting failed” destroys the boundary that the implementation deliberately maintains.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Saved Preferences', 'Reading Saved Preferences', 'Understanding Render Distance Fog and Shadows'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Visual and Audio Settings',
    group: 'World Visual Preferences',
    title: 'Changing Shadow Preferences',
    description:
      'Explains the shadow-map toggle and five-step quality setting as a renderer-input contract independent of render distance, including UI emission, persistence normalization, fallback to Standard, and backend consumption.',
    sections: [
      {
        id: 'changing-shadow-preferences-setting-scope',
        title: 'Setting Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'Shadow preferences have two surfaces: a boolean `Shadow map` toggle and a `Shadow map quality` combo box on the World tab. The combo box is populated from `SHADOW_MAP_QUALITY_ORDER`; the labels come from `SHADOW_MAP_QUALITY_LABELS`; and the selection is emitted as an integer. The setting is an admitted quality stage that later renderer code may consume, derived independently of render distance and carrying no promise that every backend produces identical shadow quality on every driver.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/settings/pages.py',
            code: `overlay._tg_shadow_enabled = overlay._add_toggle(world_layout, world_body, "Shadow map", overlay._on_shadow_enabled_toggled)

overlay._lbl_shadow_quality = QLabel("Shadow map quality", host)
overlay._cmb_shadow_quality = QComboBox(host)
for value in SHADOW_MAP_QUALITY_ORDER:
  overlay._cmb_shadow_quality.addItem(str(SHADOW_MAP_QUALITY_LABELS[int(value)]), userData=int(value))
overlay._cmb_shadow_quality.currentIndexChanged.connect(overlay._on_shadow_map_quality)`,
          },
        ],
      },
      {
        id: 'changing-shadow-preferences-normalization',
        title: 'Five-Step Quality Normalization',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/shadow.py` defines the quality scale as an integer stage from `1` through `5`: `Lowest`, `Low`, `Standard`, `High`, and `Ultra`. The normalizer does not clamp malformed data into the nearest edge. It attempts integer conversion and returns `Standard` (`3`) for type errors, value errors, and out-of-range integers. A saved value of `0`, `6`, `None`, or a non-numeric string therefore does not silently become a supported extreme.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/shadow.py',
            code: `def normalize_shadow_map_quality(value: object) -> int:
  try:
    quality = int(value)
  except (TypeError, ValueError):
    return int(SHADOW_MAP_QUALITY_DEFAULT)
  if int(quality) < int(SHADOW_MAP_QUALITY_MIN) or int(quality) > int(SHADOW_MAP_QUALITY_MAX):
    return int(SHADOW_MAP_QUALITY_DEFAULT)
  return int(quality)`,
          },
          {
            kind: 'paragraph',
            text: 'The important boundary is the independence from render distance. Render distance controls world chunk radius and fog relationships; shadow quality controls the shadow-map stage. Reading a larger render distance as an implicit shadow-quality request is a category error because the quality normalizer has its own stage domain and default behavior.',
          },
        ],
      },
      {
        id: 'changing-shadow-preferences-runtime-consumer',
        title: 'Runtime Consumer and Diagnostic Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`SettingsOverlay._on_shadow_enabled_toggled` enables or disables the combo box with the toggle and emits the boolean. `_on_shadow_map_quality` emits the current normalized quality value. Runtime preferences then normalize the integer again before renderer state consumes it. The UI can present a disabled combo box, but the persisted stage remains a distinct saved value and must still be read through the normalizer.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/settings/overlay.py',
            code: `def _on_shadow_enabled_toggled(self, on: bool) -> None:
  enabled = bool(on)
  self._cmb_shadow_quality.setEnabled(enabled)
  self.shadow_enabled_changed.emit(enabled)

def _on_shadow_map_quality(self, _index: int) -> None:
  self.shadow_map_quality_changed.emit(int(self._current_shadow_map_quality_value()))`,
          },
          {
            kind: 'paragraph',
            text: 'A shadow report must distinguish four facts: whether the shadow toggle is enabled, which quality stage is selected, what value is persisted, and what the backend rendered. The setting article does not convert those facts into backend parity, driver correctness, or release-readiness evidence.',
          },
          {
            kind: 'paragraph',
            text: '`PersistedSettings.__post_init__` normalizes the saved quality at construction, and `RuntimePreferences.normalize` repeats the same admission before `apply_runtime_to_renderer` calls `set_shadow_map_quality`. The repeated normalization is intentional: a typed settings object and a later mutable runtime object have separate mutation boundaries. Neither one accepts an out-of-range tier merely because the other was previously valid.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Render Distance Fog and Shadows', 'Reading Saved Preferences', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Visual and Audio Settings',
    group: 'Audio and Keybinds',
    title: 'Changing Audio Preferences',
    description:
      'Defines audio settings as a four-component normalized gain vector: master, ambient, block, and player gains, the closed [0, 1] admission rule, persistence shape, and multiplicative category consumption.',
    sections: [
      {
        id: 'changing-audio-preferences-setting-scope',
        title: 'Setting Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'Audio preferences are edited on the Audio tab, whose page builder exposes `Master volume`, `Ambient volume`, `Block volume`, and `Player volume`. The visible controls use percent labels, but the stored data model is a four-field gain vector in `src/ludoxel/application/preferences/audio.py`. The category names are fixed by `AUDIO_CATEGORY_MASTER`, `AUDIO_CATEGORY_AMBIENT`, `AUDIO_CATEGORY_BLOCK`, and `AUDIO_CATEGORY_PLAYER`; a new slider label does not create a new audio category.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/settings/pages.py',
            code: `add_page_header(layout, host, title="Audio", subtitle="Independent gain controls for master, ambient, block, and player audio.")
_mixer_card, mixer_body, mixer_layout = add_settings_card(layout, host, title="Mixer", description="Master gain and category gains persisted by the audio preference schema.")

overlay._lbl_master_volume = QLabel("Master volume: 100%", host)
overlay._sld_master_volume = overlay._new_slider(host, 0, 100)
overlay._sld_master_volume.valueChanged.connect(overlay._on_master_volume)`,
          },
        ],
      },
      {
        id: 'changing-audio-preferences-normalization',
        title: 'Normalization and Persistence',
        content: [
          {
            kind: 'paragraph',
            text: '`AudioPreferences` is a frozen value object. Construction immediately passes every component through `_clamp_volume`, which converts the input to `float`, falls back to the default when conversion fails, and clamps the result to the closed interval `[0, 1]`. The object is normalized after construction; `normalized()` returns that instance.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/audio.py',
            code: `def _clamp_volume(value: object, *, default: float = 1.0) -> float:
  try:
    numeric = float(value)
  except Exception:
    numeric = float(default)
  return float(clampf(float(numeric), 0.0, 1.0))

@dataclass(frozen=True)
class AudioPreferences:
  master: float = 1.0
  ambient: float = 1.0
  block: float = 1.0
  player: float = 1.0`,
          },
          {
            kind: 'paragraph',
            text: '`to_dict` writes the normalized vector as a flat mapping. `from_dict` reads only dictionaries and treats non-dictionary input as the default vector. A malformed saved value reaches playback only after conversion, default selection, or clamping has reduced it to the admitted gain interval.',
          },
        ],
      },
      {
        id: 'changing-audio-preferences-runtime-consumer',
        title: 'Category Gain Consumption',
        content: [
          {
            kind: 'paragraph',
            text: 'Category volume is multiplicative. Ambient playback receives `master * ambient`, block sounds receive `master * block`, and player or actor sounds receive `master * player`. Unknown category text remains outside the category set; the method returns the master gain for `master` itself and for unrecognized categories.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/audio.py',
            code: `def volume_for(self, category: str) -> float:
  key = str(category).strip().lower()
  if key == AUDIO_CATEGORY_AMBIENT:
    return float(self.master) * float(self.ambient)
  if key == AUDIO_CATEGORY_BLOCK:
    return float(self.master) * float(self.block)
  if key == AUDIO_CATEGORY_PLAYER:
    return float(self.master) * float(self.player)
  return float(self.master)`,
          },
          {
            kind: 'math',
            math: {
              expression: 'g_{ambient}=g_{master}g_{ambient}^{local},\\quad g_{block}=g_{master}g_{block}^{local},\\quad g_{player}=g_{master}g_{player}^{local}',
              displayMode: true,
              caption: 'The implementation composes each category gain by multiplication, not replacement.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The diagnostic path separates the saved gain vector from material-sound routing. A silent block-placement sound can involve the master gain, block gain, material-sound catalog, event source, or playback admission. `AudioPreferences` and `PersistedSettings` supply the normalized gains, while `src/ludoxel/presentation/audio` resolves catalog entries, pooled effects, and the attack PCM mixer.',
          },
          {
            kind: 'paragraph',
            text: '`RuntimePreferences.normalize` retains `audio` as an `AudioPreferences` value object, and the persistence projection writes `runtime.audio.normalized()` into `PersistedSettings`. The setting therefore crosses disk and runtime as the same four-channel model, but its effective gain is still computed at the playback category. Saving a master value does not precompute or store separate ambient, block, and player effective gains.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Material Sounds', 'Understanding Ambient Sounds', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Visual and Audio Settings',
    group: 'Audio and Keybinds',
    title: 'Changing Keybind Preferences',
    description:
      'Defines keybind settings as a fixed action-to-portable-text mapping with alias folding, single-key admission, duplicate resolution, runtime key-code projection, and public evidence limits for input bugs.',
    sections: [
      {
        id: 'changing-keybind-preferences-setting-scope',
        title: 'Setting Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'Keybind preferences are not free-form shortcuts. `src/ludoxel/application/preferences/keybinds.py` defines the action catalog, the display names, the defaults, the portable key names, the alias table, duplicate-resolution behavior, and runtime lookup maps. The Controls tab merely exposes those known actions through rows; it does not authorize arbitrary key sequences, modifier chords, or additional commands.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/keybinds.py',
            code: `KEYBIND_ACTION_ORDER: tuple[str, ...] = (
  ACTION_MOVE_FORWARD,
  ACTION_MOVE_BACKWARD,
  ACTION_MOVE_LEFT,
  ACTION_MOVE_RIGHT,
  ACTION_JUMP,
  ACTION_CROUCH,
  ACTION_SPRINT,
  ACTION_TOGGLE_INVENTORY,
  ACTION_TOGGLE_CHAT,
  ACTION_CYCLE_CAMERA_PERSPECTIVE,
  ACTION_TOGGLE_GAMEPLAY_HUD,
  ACTION_TOGGLE_DEBUG_HUD,
  ACTION_TOGGLE_DEBUG_SHADOW,
  ACTION_CLEAR_SELECTED_SLOT,
) + HOTBAR_ACTIONS`,
          },
          {
            kind: 'paragraph',
            text: '`keybind_actions()` returns this fixed order, and `default_keybinds_map()` returns a new dictionary to prevent caller mutation of the module constant. Hotbar actions are part of the same mapping, appended as `hotbar_slot_1` through `hotbar_slot_9`; they are not interpreted as ordinary textual commands.',
          },
        ],
      },
      {
        id: 'changing-keybind-preferences-normalization',
        title: 'Single-Key Normalization and Duplicate Resolution',
        content: [
          {
            kind: 'paragraph',
            text: 'The portable binding language admits one key. `normalize_key_code` accepts positive Qt key codes only when the module knows a portable text name for them. `_normalize_binding_text_cached` rejects strings containing `+` or `,`, folds spaces, underscores, hyphens, and aliases, and returns the empty binding for unknown input. Empty binding is not an error object; it is the canonical unbound value.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/keybinds.py',
            code: `def _normalize_binding_text_cached(raw: str) -> str:
  source = str(raw).strip()
  if not source:
    return ""
  if "+" in source or "," in source:
    return ""
  compact = " ".join(source.replace("_", " ").replace("-", " ").split()).lower()
  collapsed = compact.replace(" ", "")
  return str(_KEY_ALIASES.get(compact, _KEY_ALIASES.get(collapsed, ""))).strip()`,
          },
          {
            kind: 'paragraph',
            text: 'Duplicate keys are resolved while constructing the saved mapping. `_normalized_bindings_from_items` begins with every known action, ignores unknown action identifiers, and gives the later action the duplicated binding by clearing the earlier action. This produces one runtime action per key code. A bug report that shows two actions claiming the same key must therefore identify whether the duplication is visible before normalization, after normalization, or inside the input adapter.',
          },
        ],
      },
      {
        id: 'changing-keybind-preferences-runtime-consumer',
        title: 'Runtime Lookup and Display',
        content: [
          {
            kind: 'paragraph',
            text: '`KeybindSettings` is frozen after construction. It stores the normalized `bindings` mapping and builds two derived maps: action to key code and key code to action. `binding_for_action` and `key_for_action` return empty or `None` for unknown actions, so an unrecognized saved action cannot become a live input path. Display text uses the same normalizer and renders invalid or empty bindings as `Unbound`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/keybinds.py',
            code: `def _key_maps_for_bindings(bindings: dict[str, str]) -> tuple[dict[str, int | None], dict[int, str]]:
  keys_by_action: dict[str, int | None] = {}
  action_by_key: dict[int, str] = {}

  for action in KEYBIND_ACTION_ORDER:
    key = binding_to_key(bindings.get(str(action), ""))
    keys_by_action[str(action)] = key
    if key is not None:
      action_by_key[int(key)] = str(action)

  return keys_by_action, action_by_key`,
          },
          {
            kind: 'paragraph',
            text: 'A settings row changes a known action to a known single-key portable binding under one-to-one runtime lookup. Modifier chords, multi-key sequences, platform-native display strings, and arbitrary command text remain outside the implemented setting.',
          },
          {
            kind: 'paragraph',
            text: 'Persistence preserves that fixed action domain. `to_dict()` serializes exactly `KEYBIND_ACTION_ORDER`, including unbound entries, while `from_dict()` begins from the default map and accepts values for those known actions. A hand-edited unknown key has no command owner, and a missing known key returns to its declared default.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Keybind Resolution', 'Using the Hotbar', 'Understanding Overlay Input Blocking', 'Using Chat and Commands'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Player Skin',
    title: 'Changing the Player Skin Source',
    description: 'Explains the player skin source as a two-value runtime preference whose custom branch is valid only when the protected runtime skin file can be verified and decoded.',
    sections: [
      {
        id: 'changing-player-skin-source-domain',
        title: 'Source Domain',
        content: [
          {
            kind: 'paragraph',
            text: 'The player skin source is a narrow preference: bundled Alex or a custom runtime PNG. `src/ludoxel/application/preferences/player_skin.py` admits only `custom`; every other value, including missing data and older strings, collapses to `alex`. The setting therefore cannot be used to name an arbitrary package asset, a network resource, or an AI-specific skin identifier.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/player_skin.py',
            code: `PLAYER_SKIN_KIND_ALEX = "alex"
PLAYER_SKIN_KIND_CUSTOM = "custom"

def normalize_player_skin_kind(value: object) -> str:
  normalized = str(value or "").strip().lower()
  if normalized == PLAYER_SKIN_KIND_CUSTOM:
    return PLAYER_SKIN_KIND_CUSTOM
  return PLAYER_SKIN_KIND_ALEX`,
          },
        ],
      },
      {
        id: 'changing-player-skin-source-runtime-file',
        title: 'Runtime File and Integrity Gate',
        content: [
          {
            kind: 'paragraph',
            text: 'A custom player skin is stored as `state/player_skin.png` under the runtime state root. The loader verifies that protected runtime file before use, then normalizes the image to the accepted 64 x 64 RGBA form. Verification or decoding failure selects the bundled Alex texture and closes the custom-skin branch.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/visuals/players/skin.py',
            code: `def load_player_skin_image(data_root: Path, *, kind: object, resource_root: Path | None = None) -> QImage:
  normalized_kind = normalize_player_skin_kind(kind)
  if normalized_kind == PLAYER_SKIN_KIND_CUSTOM:
    custom_path = custom_player_skin_path(data_root)
    if not verify_runtime_file(Path(data_root), "state/player_skin.png"):
      custom_path = Path()
    custom_image = QImage(str(custom_path))
    if not custom_image.isNull():
      try:
        return normalize_player_skin_image(custom_image)
      except ValueError:
        pass
  default_image = QImage(str(default_player_skin_path(bundled_root)))`,
          },
        ],
      },
      {
        id: 'changing-player-skin-source-public-limit',
        title: 'Public Limit',
        content: [
          {
            kind: 'paragraph',
            text: 'Changing the source changes which player-skin image the runtime attempts to load. It does not publish the custom PNG, license the custom image, copy it into documentation, or make imported third-party art safe to redistribute. The correct evidence for a setting report is the selected kind, the existence and integrity status of `state/player_skin.png`, the image dimensions, and whether the renderer fell back to Alex.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'Do not include a private or third-party skin image in a public issue unless the right to share that image is independently clear.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Importing a Player Skin', 'Reading Saved Preferences', 'Understanding Protected Runtime Files'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Player Skin',
    title: 'Importing a Player Skin',
    description: 'Explains player skin import as a local PNG validation and protected runtime-file write, not as an asset ingestion pipeline for package materials.',
    sections: [
      {
        id: 'importing-player-skin-ingress',
        title: 'Import Ingress',
        content: [
          {
            kind: 'paragraph',
            text: 'Player skin import is initiated from the viewport settings controller by opening a local PNG file dialog. The controller decodes the selected path into a `QImage`, normalizes the image through the shared skin validator, writes the normalized result to the runtime state root, switches `player_skin_kind` to `custom`, and then synchronizes the renderer skin design. The operation is immediate runtime state work; it is not a source-tree edit and not a website asset import.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/viewport/controllers/settings.py',
            code: `def change_player_skin(viewport: "RendererViewportWidget") -> None:
  selected_path, _selected_filter = QFileDialog.getOpenFileName(viewport, "Select Player Skin", "", "PNG Files (*.png)")
  if not str(selected_path).strip():
    return

  image = QImage(str(selected_path))
  normalized_image = normalize_player_skin_image(image)
  write_custom_player_skin(viewport._data_root, normalized_image)
  viewport._state.player_skin_kind = PLAYER_SKIN_KIND_CUSTOM
  viewport._state.normalize()
  sync_player_skin(viewport, push_to_renderer=True)`,
          },
        ],
      },
      {
        id: 'importing-player-skin-validation',
        title: 'Validation and Storage',
        content: [
          {
            kind: 'paragraph',
            text: 'The validator accepts only modern 64 x 64 Minecraft skin textures and converts the accepted image to RGBA8888. The writer saves that normalized image as `state/player_skin.png` and updates the runtime integrity manifest for that protected path. Reset deletes the same runtime file and returns the preference to bundled Alex. The persistence consequence is explicit: the imported image is a local runtime artifact guarded by integrity metadata.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/visuals/players/skin.py',
            code: `def normalize_player_skin_image(image: QImage) -> QImage:
  candidate = QImage(image)
  if candidate.isNull():
    raise ValueError("The selected skin image could not be decoded.")
  if int(candidate.width()) != int(_SKIN_WIDTH) or int(candidate.height()) != int(_SKIN_HEIGHT):
    raise ValueError("Only modern 64x64 Minecraft skin textures are accepted.")
  return candidate.convertToFormat(QImage.Format.Format_RGBA8888)

def write_custom_player_skin(data_root: Path, image: QImage) -> None:
  normalized = normalize_player_skin_image(image)
  target = custom_player_skin_path(data_root)
  target.parent.mkdir(parents=True, exist_ok=True)
  normalized.save(str(target), "PNG")
  update_runtime_integrity_manifest(Path(data_root), ("state/player_skin.png",))`,
          },
        ],
      },
      {
        id: 'importing-player-skin-risk',
        title: 'Risk Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'A failed import should be reported with the file dimensions, decode result, error message, selected skin kind after the attempt, and whether `state/player_skin.png` exists under the runtime data root. A failed import should not be described as an asset-pack problem unless the evidence reaches the asset loader. The public documentation must also keep custom skins legally separate from Ludoxel original materials; importing an image for local use does not determine the right to redistribute it.',
          },
        ],
      },
    ],
    relatedTitles: ['Changing the Player Skin Source', 'Understanding Protected Runtime Files', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Player and Othello State',
    title: 'Changing the Player Name',
    description: 'Defines the player display name as a normalized runtime preference with a blank-value random fallback.',
    sections: [
      {
        id: 'changing-player-name-ingress',
        title: 'Ingress and Normalization',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/player_name.py` owns player-name normalization and the blank-value session fallback. The Player tab exposes a single name field with a blank-value fallback hint, but the controller does not persist raw text verbatim: `normalize_player_name` collapses internal whitespace, truncates to thirty-two characters, and strips the result. A display name is therefore a normalized runtime preference, not an account credential and not a world-state block value.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/player_name.py',
            code: `def normalize_player_name(value: object) -> str:
  text = " ".join(str(value or "").split())
  return str(text[:32]).strip()

def resolve_session_player_name(explicit_name: object, *, fallback_name: str | None = None) -> str:
  normalized = normalize_player_name(explicit_name)
  if normalized:
    return normalized
  fallback = normalize_player_name(fallback_name)
  if fallback:
    return fallback
  return generate_random_player_name()`,
          },
        ],
      },
      {
        id: 'changing-player-name-random-fallback',
        title: 'Random Fallback',
        content: [
          {
            kind: 'paragraph',
            text: 'When the explicit player name is blank after normalization, the session name resolver uses a normalized fallback name when one exists; otherwise it generates a name from an adjective, noun, and three-digit number. The randomness belongs to session identity resolution, not to saved preference mutation. The saved blank field remains meaningful because it instructs the application to resolve a display name later.',
          },
          {
            kind: 'paragraph',
            text: '`has_explicit_player_name` tests the normalized string. Whitespace-only input follows the empty-field fallback path. The predicate separates a persisted display preference from launch-time display resolution; name reservation, account validation, and AI-actor uniqueness belong to separate systems.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/settings/pages.py',
            code: `overlay._name_edit = QLineEdit(identity_body)
overlay._name_edit.setPlaceholderText("Leave blank for a random name each launch")
overlay._name_edit.editingFinished.connect(overlay._on_player_name_edited)

overlay._player_name_hint = QLabel("", identity_body)`,
          },
        ],
      },
      {
        id: 'changing-player-name-boundary',
        title: 'Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The name can appear in HUD or world presentation through runtime state, but it does not define saved world geometry, Othello rules, AI naming uniqueness, or legal attribution. A report should state the entered string, the normalized string, whether the input was blank, the resolved session name, and the surface where the wrong name appeared.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Saved Preferences', 'Naming an AI NPC', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Player and Othello State',
    title: 'Changing Player Regeneration Settings',
    description:
      'Defines the Player-tab regeneration controls as a persisted player-health contract whose disabled default preserves existing survival damage behavior until the setting is explicitly enabled.',
    sections: [
      {
        id: 'changing-player-regeneration-settings-visible-controls',
        title: 'Visible Controls and Stored Fields',
        content: [
          {
            kind: 'paragraph',
            text: 'The Player tab exposes a Health Regeneration card with `Regeneration`, `Start delay`, `Health cap`, and `Time to cap`. The controls are immediate settings controls, not per-world block state and not AI actor fields. `PersistedSettings` owns the saved keys `player_regen_enabled`, `player_regen_start_delay_s`, `player_regen_cap_hp`, and `player_regen_time_to_cap_s`; missing keys load through the disabled default and the numeric defaults declared by `src/ludoxel/simulation/worlds/config/player_health.py`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/settings.py',
            code: `player_regen_enabled: bool = bool(PLAYER_REGEN_DEFAULT_ENABLED)
player_regen_start_delay_s: float = float(PLAYER_REGEN_DEFAULT_START_DELAY_S)
player_regen_cap_hp: float = float(PLAYER_REGEN_DEFAULT_CAP_HP)
player_regen_time_to_cap_s: float = float(PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S)`,
          },
          {
            kind: 'paragraph',
            text: 'The UI writes into the same preference aggregate that stores movement, audio, and skin preferences. `apply_persisted_settings_to_session` transfers the persisted values into `SessionSettings.player_regen`, so the fixed-step session owns the runtime copy. A saved preference file cannot enable regeneration for AI actors through these player keys; AI health settings remain in the AI actor settings surface and state path.',
          },
        ],
      },
      {
        id: 'changing-player-regeneration-settings-value-domain',
        title: 'Value Domain and Normalization',
        content: [
          {
            kind: 'paragraph',
            text: '`PlayerRegenParams` is the simulation-facing value object. It normalizes the boolean enabled state and clamps the three numeric values to the admitted ranges: start delay from `0.0` to `600.0` seconds, cap from `1.0` to `1000.0` health points, and time to cap from `0.5` to `600.0` seconds. The default set is disabled, starts at `4.0` seconds, caps at `20.0` health, and reaches that cap over `80.0` seconds when the toggle is enabled.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/worlds/config/player_health.py',
            code: `@dataclass(frozen=True)
class PlayerRegenParams:
  enabled: bool = PLAYER_REGEN_DEFAULT_ENABLED
  start_delay_s: float = PLAYER_REGEN_DEFAULT_START_DELAY_S
  cap_hp: float = PLAYER_REGEN_DEFAULT_CAP_HP
  time_to_cap_s: float = PLAYER_REGEN_DEFAULT_TIME_TO_CAP_S

  def normalized(self) -> "PlayerRegenParams":
    return PlayerRegenParams(
      enabled=bool(self.enabled),
      start_delay_s=normalize_player_regen_start_delay_s(self.start_delay_s),
      cap_hp=normalize_player_regen_cap_hp(self.cap_hp),
      time_to_cap_s=normalize_player_regen_time_to_cap_s(self.time_to_cap_s),
    )`,
          },
          {
            kind: 'math',
            math: {
              expression:
                'd \\in [0,600], \\qquad c \\in [1,1000], \\qquad T \\in [0.5,600]',
              displayMode: true,
              caption:
                '`PlayerRegenParams.normalized()` clamps start delay d, cap c, and time-to-cap T before the fixed-step session consumes the values.',
            },
          },
        ],
      },
      {
        id: 'changing-player-regeneration-settings-runtime-effect',
        title: 'Runtime Effect',
        content: [
          {
            kind: 'paragraph',
            text: '`advance_player_regeneration` runs during the fixed-step session after damage resolution. Damage resets the wait timer to zero. A dead player receives no regeneration. A disabled toggle leaves health unchanged while the wait timer continues to measure time since damage; enabling the setting later can therefore use the current no-damage interval rather than requiring a separate respawn or reload.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/player/regeneration.py',
            code: `if bool(took_damage):
  return 0.0
if not player.alive():
  return 0.0

new_wait_s = max(0.0, float(wait_s)) + max(0.0, float(dt))
if not bool(params.enabled):
  return float(new_wait_s)`,
          },
          {
            kind: 'paragraph',
            text: 'When enabled, regeneration starts only after `start_delay_s`. The healed amount advances at `cap_hp / time_to_cap_s` health per second and stops at the lower of the configured cap and `player.max_health`. The cap therefore limits the recovery destination, while the player entity still owns current health, maximum health, death state, and damage cooldown.',
          },
          {
            kind: 'math',
            math: {
              expression:
                'h \\leftarrow \\min\\left(\\min(c,h_{max}),\\ h + \\frac{c}{T}\\Delta t\\right)',
              displayMode: true,
              caption:
                '`advance_player_regeneration` applies the enabled regeneration rate after the delay has elapsed, with configured cap c, time-to-cap T, player maximum health h_max, and fixed-step quantum Δt.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Saved Preferences', 'Reading Saved Preferences', 'Surviving Fall and Void Hazards'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Player and Othello State',
    title: 'Understanding Othello Setting Persistence',
    description:
      'Explains how Othello settings enter the runtime preference aggregate and the persisted Othello space without collapsing match rules, player state, and world state into one authority.',
    sections: [
      {
        id: 'understanding-othello-setting-persistence-aggregate',
        title: 'Runtime Aggregate',
        content: [
          {
            kind: 'paragraph',
            text: 'Othello settings live inside `RuntimePreferences` as an `OthelloSettings` object and are normalized with the rest of the runtime preference aggregate. The aggregate also carries Othello hotbar slots and the selected Othello hotbar index, but those values are not the match rule object. The Settings article must therefore separate rule preferences, hotbar branch state, persisted Othello game state, and visible board state.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/runtime.py',
            code: `othello_hotbar_slots: list[str] = field(default_factory=_default_othello_hotbar_slots_list)
othello_selected_hotbar_index: int = 0
othello_settings: OthelloSettings = field(default_factory=OthelloSettings)

self.othello_hotbar_slots, self.othello_selected_hotbar_index = _normalize_hotbar_state(self.othello_hotbar_slots, self.othello_selected_hotbar_index, size=HOTBAR_SIZE)
self.othello_settings = self.othello_settings.normalized()`,
          },
        ],
      },
      {
        id: 'understanding-othello-setting-persistence-schema',
        title: 'Persisted Othello Space',
        content: [
          {
            kind: 'paragraph',
            text: 'The persisted Othello space schema is broader than settings. It stores player state, world state, `othello_game_state`, and AI players as separate payloads. Settings explain how the preference object is normalized and applied; Data explains the file shape and recovery behavior; Gameplay explains legal Othello moves and match outcome. Treating those three subjects as one page would erase the implementation boundary.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/othello.py',
            code: `@dataclass(frozen=True)
class PersistedOthelloSpace:
  player: PersistedPlayerState = field(default_factory=PersistedPlayerState)
  world: PersistedWorldState = field(default_factory=PersistedWorldState)
  othello_game_state: dict[str, Any] = field(default_factory=dict)
  ai_players: PersistedAiPlayerCollection = field(default_factory=PersistedAiPlayerCollection)`,
          },
        ],
      },
      {
        id: 'understanding-othello-setting-persistence-diagnostic',
        title: 'Diagnostic Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'A persistence report should state which object changed: normalized `OthelloSettings`, Othello game state, player state, world state, or AI collection. A wrong AI move after restart may come from difficulty or book settings, saved board state, or opening-book data. Naming the persisted branch preserves that diagnostic distinction.',
          },
        ],
      },
    ],
    relatedTitles: ['Reading Saved Othello Space', 'Changing Match Rules', 'Reading Saved Preferences'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Othello Match Rules',
    title: 'Changing Match Rules',
    description: 'Explains time control, animation mode, player side, and difficulty as normalized Othello rule preferences that are distinct from board legality and opening-book data.',
    sections: [
      {
        id: 'changing-match-rules-rule-object',
        title: 'Rule Object',
        content: [
          {
            kind: 'paragraph',
            text: 'Othello match controls write into `OthelloSettings`. The object contains difficulty, time control, animation mode, player side, sacrifice level, thread count, hash level, and opening-book learning tolerances. The rule page should not present those fields as board state; they are settings that influence a match or engine choice around the board state.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/game/settings.py',
            code: `@dataclass(frozen=True)
class OthelloSettings:
  difficulty: str = OTHELLO_DIFFICULTY_MEDIUM
  time_control: str = OTHELLO_TIME_CONTROL_PER_SIDE_20M
  animation_mode: str = OTHELLO_ANIMATION_OFF
  player_side: int = SIDE_BLACK
  sacrifice_level: int = DEFAULT_OTHELLO_SACRIFICE_LEVEL
  thread_count: int = DEFAULT_OTHELLO_THREAD_COUNT
  hash_level: int = DEFAULT_OTHELLO_HASH_LEVEL`,
          },
        ],
      },
      {
        id: 'changing-match-rules-normalization',
        title: 'Normalization',
        content: [
          {
            kind: 'paragraph',
            text: 'Every externally supplied rule value is read through a normalizer before storage or runtime use. Difficulty falls back to medium unless it is one of the five admitted difficulty identifiers. Thread count, hash level, sacrifice level, book depth, and book error values are clamped to their declared domains. That design prevents a corrupt or obsolete settings file from turning a visible combo box into undefined engine input.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/game/settings.py',
            code: `OTHELLO_DIFFICULTIES: tuple[str, ...] = (OTHELLO_DIFFICULTY_WEAK, OTHELLO_DIFFICULTY_MEDIUM, OTHELLO_DIFFICULTY_STRONG, OTHELLO_DIFFICULTY_INSANE, OTHELLO_DIFFICULTY_INSANE_PLUS)

def normalize_difficulty(value: object, *, default: str = OTHELLO_DIFFICULTY_MEDIUM) -> str:
  raw = str(value).strip().lower()
  if raw in OTHELLO_DIFFICULTIES:
    return raw
  fallback = str(default).strip().lower()
  if fallback in OTHELLO_DIFFICULTIES:
    return fallback
  return OTHELLO_DIFFICULTY_MEDIUM`,
          },
        ],
      },
      {
        id: 'changing-match-rules-boundary',
        title: 'Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'Changing match rules does not rewrite existing board coordinates, opening-book storage, or Othello legal-move generation. It changes the normalized parameters used by the match and engine paths. A report should include the normalized settings object, the active side, time control, difficulty, and board state separately.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Othello Setting Persistence', 'Changing Othello AI Strength', 'Changing Othello Book Behavior'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Othello Match Rules',
    title: 'Changing Othello AI Strength',
    description: 'Explains Othello AI strength as normalized engine parameters: difficulty, thread count, hash level, and sacrifice level, with fixed bounds before worker execution.',
    sections: [
      {
        id: 'changing-othello-ai-strength-parameters',
        title: 'Engine Parameters',
        content: [
          {
            kind: 'paragraph',
            text: 'Othello AI strength resolves into independent difficulty, thread-count, hash-level, and sacrifice-level parameters. Difficulty chooses the qualitative search profile, thread count bounds CPU parallelism, hash level bounds transposition or cache capacity, and sacrifice level adjusts evaluation behavior. Those fields configure the engine; the search produces the move result.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/game/settings.py',
            code: `OTHELLO_AI_THREAD_MIN: int = 1
OTHELLO_AI_THREAD_MAX: int = 8
OTHELLO_AI_HASH_LEVEL_MIN: int = 0
OTHELLO_AI_HASH_LEVEL_MAX: int = 6
OTHELLO_AI_SACRIFICE_LEVEL_MIN: int = 0
OTHELLO_AI_SACRIFICE_LEVEL_MAX: int = 4

def normalize_thread_count(value: object, *, default: int = DEFAULT_OTHELLO_THREAD_COUNT) -> int:
  return coerce_clampi(value, default=int(default), lo=int(OTHELLO_AI_THREAD_MIN), hi=int(OTHELLO_AI_THREAD_MAX))`,
          },
        ],
      },
      {
        id: 'changing-othello-ai-strength-worker-boundary',
        title: 'Worker Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The engine worker receives normalized difficulty, seed, generation, project root, sacrifice level, and hash level. A settings defect should be distinguished from a worker defect by recording what normalized values crossed that boundary. If the worker receives `insane_plus` with the expected hash and sacrifice levels but selects a weak move, the relevant investigation is different from a combo box that saved `medium` when the user selected `insane_plus`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/engines/worker.py',
            code: `def _compute_ai_move(board: tuple[int, ...], side: int, difficulty: str, seed: int, generation: int, project_root: str, sacrifice_level: int, hash_level: int) -> int | None:
  return choose_ai_move(
    board,
    side,
    difficulty,
    seed=int(seed),
    generation=int(generation),
    project_root=project_root,
    sacrifice_level=int(sacrifice_level),
    hash_level=int(hash_level),
  )`,
          },
        ],
      },
      {
        id: 'changing-othello-ai-strength-reporting',
        title: 'Reporting',
        content: [
          {
            kind: 'paragraph',
            text: 'A report about strength should include the selected difficulty, normalized thread count, hash level, sacrifice level, board position, side to move, and whether the move came from the opening book. Without those facts, settings, engine search, and book lookup become indistinguishable.',
          },
        ],
      },
    ],
    relatedTitles: ['Changing Match Rules', 'Changing Othello Book Behavior', 'Playing Othello'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Player and Match Settings',
    group: 'Othello Match Rules',
    title: 'Changing Othello Book Behavior',
    description: 'Explains opening-book controls as normalized learning and lookup parameters whose storage path is separate from match-rule widgets and saved board state.',
    sections: [
      {
        id: 'changing-othello-book-behavior-controls',
        title: 'Book Controls',
        content: [
          {
            kind: 'paragraph',
            text: 'Opening-book behavior is configured through depth and three error tolerances: per-move, cumulative, and leaf. The defaults are high enough for the current book-learning path, but all values are normalized before use. The book settings therefore describe bounded parameters for learning and lookup, not an unbounded instruction to rewrite match history.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/game/settings.py',
            code: `OTHELLO_BOOK_LEARNING_DEPTH_MIN: int = 0
OTHELLO_BOOK_LEARNING_DEPTH_MAX: int = 60
DEFAULT_OTHELLO_BOOK_LEARNING_DEPTH: int = 55
DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR: float = 22.0
DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR: float = 19.0
DEFAULT_OTHELLO_BOOK_LEAF_ERROR: float = 20.0
OTHELLO_BOOK_ERROR_MIN: float = 0.0
OTHELLO_BOOK_ERROR_MAX: float = 24.0`,
          },
        ],
      },
      {
        id: 'changing-othello-book-behavior-learning-path',
        title: 'Learning Path',
        content: [
          {
            kind: 'paragraph',
            text: 'The book-learning worker forwards normalized depth, error tolerances, hash level, and sacrifice level into `learn_opening_book`. Existing book lines are loaded, new lines are accumulated, and cancellation is handled by the learning routine. Settings own the parameter values; Data owns the persisted book file; Gameplay owns whether a move is legal and strategically useful.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/books/learning.py',
            code: `normalized_depth = normalize_book_learning_depth(depth)
normalized_per_move_error = normalize_book_error(per_move_error, default=float(DEFAULT_OTHELLO_BOOK_PER_MOVE_ERROR))
normalized_cumulative_error = normalize_book_error(cumulative_error, default=float(DEFAULT_OTHELLO_BOOK_CUMULATIVE_ERROR))
normalized_leaf_error = normalize_book_error(leaf_error, default=float(DEFAULT_OTHELLO_BOOK_LEAF_ERROR))
normalized_hash_level = normalize_hash_level(hash_level, default=DEFAULT_OTHELLO_HASH_LEVEL)
normalized_sacrifice_level = normalize_sacrifice_level(sacrifice_level, default=DEFAULT_OTHELLO_SACRIFICE_LEVEL)`,
          },
        ],
      },
      {
        id: 'changing-othello-book-behavior-failure-boundary',
        title: 'Failure Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'If book behavior appears wrong, report the normalized book settings, whether the move was a learned book move, the board state, and the book file status. Do not treat the book-learning tolerance values as proof that the AI searcher or the saved Othello game state is broken.',
          },
        ],
      },
    ],
    relatedTitles: ['Changing Othello AI Strength', 'Reading Saved Othello Space', 'Playing Othello'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'AI Configuration',
    group: 'AI Identity and Skin',
    title: 'Naming an AI NPC',
    description: 'Explains AI NPC naming as a validated per-actor setting with a constrained body, optional numeric suffix, and live-AI uniqueness check.',
    sections: [
      {
        id: 'naming-ai-npc-format',
        title: 'Name Format',
        content: [
          {
            kind: 'paragraph',
            text: 'AI NPC names use a stricter format than the player display name. The body must begin with a letter, may contain only letters and digits, and may have at most sixteen characters. An optional suffix uses exactly four digits after `#`, from `#0001` to `#9999`. The overlay enforces this format as a hard gate: `split_ai_display_name` returns `None` for input that fails the body or suffix pattern, and the per-actor settings update is refused before it is accepted.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/naming.py',
            code: `AI_NAME_BODY_MAX_LENGTH: int = 16
AI_NAME_SUFFIX_MIN: int = 1
AI_NAME_SUFFIX_MAX: int = 9999

_AI_NAME_BODY_PATTERN = re.compile(r"\A[A-Za-z][A-Za-z0-9]{0,15}\Z")
_AI_NAME_SUFFIX_PATTERN = re.compile(r"\A[0-9]{4}\Z")

def split_ai_display_name(name: object) -> tuple[str, int | None] | None:
  text = str(name).strip()
  if "#" not in text:
    if _AI_NAME_BODY_PATTERN.match(text) is None:
      return None
    return (text, None)`,
          },
        ],
      },
      {
        id: 'naming-ai-npc-overlay-validation',
        title: 'Overlay Validation',
        content: [
          {
            kind: 'paragraph',
            text: 'The AI Settings overlay exposes the name on its Identity page and routes validation through the session boundary so that format errors and duplicate live names are checked against the current actor collection. The actor being renamed is passed through `actor_id`, which allows the manager to ignore self-collision while still rejecting another living AI that already owns the same display key.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_settings.py',
            code: `self._name_edit = QLineEdit(body)
self._name_edit.setMaxLength(int(_AI_NAME_INPUT_MAX_LENGTH))
self._name_edit.setPlaceholderText("Example: Guard or Guard#0001")
add_setting_row(body_layout, body, label="Name", description="Shown in the world nametag above this AI.", control=self._name_edit)`,
          },
        ],
      },
      {
        id: 'naming-ai-npc-boundary',
        title: 'Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'An AI NPC name belongs to per-actor simulation state and world-space presentation. It does not change the player name preference, Othello participant identity, license attribution, or saved route semantics. A report should include the attempted name, the exact validation error, whether the target actor already existed, and the names of other live AI if a duplicate is suspected.',
          },
        ],
      },
    ],
    relatedTitles: ['Changing the Player Name', 'Choosing an AI Skin Source', 'Understanding AI Player State'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'AI Configuration',
    group: 'AI Identity and Skin',
    title: 'Choosing an AI Skin Source',
    description:
      'Explains AI skin source selection as a per-actor mode with player, bundled Alex, and imported PNG branches, including the fallback when a custom skin identifier is absent or invalid.',
    sections: [
      {
        id: 'choosing-ai-skin-source-mode-domain',
        title: 'Mode Domain',
        content: [
          {
            kind: 'paragraph',
            text: 'AI skin selection is independent from player skin selection. The per-actor mode can follow the player skin, use bundled Alex, or use a custom AI PNG identified by a thirty-two-character hexadecimal skin id. The normalizer accepts `alex` and `custom`; everything else collapses to `player`. The custom branch is additionally invalid without a valid `skin_id`, and both spawn settings and live AI state fall back to `player` in that case.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/modes.py',
            code: `AI_SKIN_MODE_PLAYER: str = "player"
AI_SKIN_MODE_ALEX: str = "alex"
AI_SKIN_MODE_CUSTOM: str = "custom"

def normalize_ai_skin_mode(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_SKIN_MODE_ALEX:
    return AI_SKIN_MODE_ALEX
  if raw == AI_SKIN_MODE_CUSTOM:
    return AI_SKIN_MODE_CUSTOM
  return AI_SKIN_MODE_PLAYER

def normalize_ai_skin_id(value: object) -> str:
  raw = str(value or "").strip().lower()
  if len(raw) != 32 or any(character not in "0123456789abcdef" for character in raw):
    return ""
  return raw`,
          },
        ],
      },
      {
        id: 'choosing-ai-skin-source-overlay',
        title: 'Overlay Behavior',
        content: [
          {
            kind: 'paragraph',
            text: 'The AI Settings overlay uses one combo box for the source. Selecting Imported PNG triggers the importer if no available imported skin exists. An import failure restores the previous mode and leaves the actor on a resolved skin source. Status text distinguishes three facts: an imported file exists, an imported id is present but unavailable, or no imported PNG has been stored.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_settings.py',
            code: `def _on_skin_mode_changed(self, _index: int) -> None:
  if str(self._skin_mode_combo.currentData()) == AI_SKIN_MODE_CUSTOM and not self._has_available_imported_skin():
    previous_mode = str(self._settings.skin_mode)
    if not self._import_custom_skin():
      blocker = QSignalBlocker(self._skin_mode_combo)
      self._set_combo_value(self._skin_mode_combo, previous_mode)
      del blocker
      self._sync_skin_controls()
    return
  self._persist_current_settings()
  self._sync_skin_controls()`,
          },
        ],
      },
      {
        id: 'choosing-ai-skin-source-boundary',
        title: 'Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'AI custom skins are actor-specific runtime files under the AI skin storage path, not player skins and not package assets. A public issue should not attach private imported PNGs unless the right to share them is clear; the useful technical evidence is the selected mode, normalized skin id, file availability, and fallback status.',
          },
        ],
      },
    ],
    relatedTitles: ['Naming an AI NPC', 'Changing the Player Skin Source', 'Understanding AI Player State'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'AI Configuration',
    group: 'AI Behavior and Mode',
    title: 'Changing AI Behavior Values',
    description: 'Defines AI behavior settings as per-actor normalized state for role, personality, route patrol, block placement, and regeneration.',
    sections: [
      {
        id: 'changing-ai-behavior-values-state-object',
        title: 'State Object',
        content: [
          {
            kind: 'paragraph',
            text: 'AI behavior values are held in `AiSpawnEggSettings` while editing and in `AiPlayerState` while the actor is alive. The shared fields include mode, personality, block-placement permission, health indicator, regeneration parameters, route points, route loop state, route run flag, and route style. The object is a bounded state vector, not a script interface and not permission for the AI to modify arbitrary world data.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/settings.py',
            code: `@dataclass(frozen=True)
class AiSpawnEggSettings:
  mode: str = AI_MODE_IDLE
  personality: str = AI_PERSONALITY_AGGRESSIVE
  can_place_blocks: bool = False
  health_indicator: str = AI_HEALTH_INDICATOR_ABOVE
  auto_regen_enabled: bool = AI_REGEN_DEFAULT_ENABLED
  regen_start_delay_s: float = AI_REGEN_DEFAULT_START_DELAY_S
  regen_interval_s: float = AI_REGEN_DEFAULT_INTERVAL_S
  regen_amount_hp: float = AI_REGEN_DEFAULT_AMOUNT_HP
  regen_cap_hp: float = AI_REGEN_DEFAULT_CAP_HP
  route_points: tuple[AiRoutePoint, ...] = ()
  route_closed: bool = False
  route_run: bool = False
  route_style: str = AI_ROUTE_STYLE_STRICT`,
          },
        ],
      },
      {
        id: 'changing-ai-behavior-values-normalization',
        title: 'Normalization',
        content: [
          {
            kind: 'paragraph',
            text: 'Mode and personality are finite enumerations. `idle` and `route` are accepted explicitly; every other mode value becomes `wander`. Peaceful personality is accepted explicitly; otherwise the AI is aggressive. Route style defaults to strict unless flexible is supplied. Regeneration values are clamped to numerical ranges, with interval lower bound `0.05` seconds to prevent a zero-interval regeneration loop.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/modes.py',
            code: `def normalize_ai_mode(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_MODE_IDLE:
    return AI_MODE_IDLE
  if raw == AI_MODE_ROUTE:
    return AI_MODE_ROUTE
  return AI_MODE_WANDER

def normalize_ai_personality(value: object) -> str:
  raw = str(value).strip().lower()
  if raw == AI_PERSONALITY_PEACEFUL:
    return AI_PERSONALITY_PEACEFUL
  return AI_PERSONALITY_AGGRESSIVE`,
          },
        ],
      },
      {
        id: 'changing-ai-behavior-values-overlay-and-route',
        title: 'Overlay and Route Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The AI Settings overlay applies behavior changes immediately through `_persist_current_settings`. Route Patrol cannot be activated as a final persisted mode until at least two route points are confirmed; otherwise the candidate is replaced with the previous mode. Route editing is deliberately moved into the world through the dedicated route hotbar, so the Behavior page describes role selection and route flags, not the geometry-editing interaction itself.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_settings.py',
            code: `def _persist_current_settings(self, _value=None) -> bool:
  candidate = self.settings()
  if self._current_name_error() is not None:
    candidate = replace(candidate, name=str(self._settings.name)).normalized()
  if str(candidate.mode) == AI_MODE_ROUTE and len(candidate.route_points) < 2:
    candidate = replace(candidate, mode=str(self._settings.mode)).normalized()
  return self._persist_candidate(candidate)`,
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'Block placement in AI behavior is movement support and safety handling. It should not be described as unrestricted building authority.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Choosing a Learning Mode', 'Naming an AI NPC', 'Understanding AI Player State'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'AI Configuration',
    group: 'AI Behavior and Mode',
    title: 'Choosing a Learning Mode',
    description:
      'Defines the Learning Mode control as a five-value saved setting whose runtime-active subset is deliberately smaller than the selectable set, separating observation, learned-policy use, training triggers, and safe fallback.',
    sections: [
      {
        id: 'choosing-a-learning-mode-setting-scope',
        title: 'Setting Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'The AI Learning page exposes five labels: `Off`, `Observe Only`, `Use Learned Policy`, `Train From Player Data`, and `Train In Sandbox`. That visible set is larger than the set of modes that remain active during ordinary play. `src/ludoxel/application/persistence/schema/ai_learning.py` stores the selected value, while `src/ludoxel/application/sessions/managers/learning.py` configures the active session from the normalized setting. The setting is therefore a control over learning participation, not a general command to run continuous training inside the step loop.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_settings.py',
            code: `_LEARNING_MODE_LABELS: tuple[tuple[str, str], ...] = (
  (LEARNING_MODE_OFF, "Off"),
  (LEARNING_MODE_OBSERVE_ONLY, "Observe Only"),
  (LEARNING_MODE_USE_LEARNED_POLICY, "Use Learned Policy"),
  (LEARNING_MODE_TRAIN_FROM_PLAYER_DATA, "Train From Player Data"),
  (LEARNING_MODE_TRAIN_IN_SANDBOX, "Train In Sandbox"),
)`,
          },
        ],
      },
      {
        id: 'choosing-a-learning-mode-normalization',
        title: 'Normalization and Active-Mode Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`normalize_learning_mode` accepts only the five constants in `LEARNING_MODES`. It stringifies, trims, lowercases, and accepts only an exact constant match. Missing, malformed, or unknown values fall back to `off`, specifically so a corrupted or future value cannot accidentally enable recording or learned-policy use. `is_active_learning_mode` then restricts ordinary play to `off`, `observe_only`, and `use_learned_policy`; both train modes are selectable workflow triggers but are not active live-play modes.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/ai_learning.py',
            code: `def normalize_learning_mode(value: object) -> str:
  raw = str(value).strip().lower()
  if raw in _LEARNING_MODE_SET:
    return raw
  return LEARNING_MODE_OFF


def is_active_learning_mode(mode: object) -> bool:
  return normalize_learning_mode(mode) in ACTIVE_LEARNING_MODES`,
          },
          {
            kind: 'paragraph',
            text: '`AiSettingsOverlay` and the learning-task completion path govern how a learning report is read. Selecting `Train From Player Data` starts a task; completion assigns `Use Learned Policy` for a completed training result and restores `Off` for every other result. `is_active_learning_mode` remains the runtime gate, so the combo-box label records a requested operation while the session step loop receives a learning mode only after the completion path writes it.',
          },
        ],
      },
      {
        id: 'choosing-a-learning-mode-runtime-effect',
        title: 'Runtime Effect',
        content: [
          {
            kind: 'paragraph',
            text: 'Session configuration derives recording and policy usage from the normalized setting. Observe-only mode enables the recorder and uses `captured_kinds()` to decide which demonstration record families are captured. Use-learned-policy mode attempts to resolve a selected policy. Off mode records nothing and supplies no policy. Train modes do not become live learning loops; they run through the overlay controller and training services.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schema/ai_learning.py',
            code: `def recording_enabled(self) -> bool:
  return normalize_learning_mode(self.learning_mode) == LEARNING_MODE_OBSERVE_ONLY

def captured_kinds(self) -> tuple[str, ...]:
  if not self.recording_enabled():
    return ()
  normalized = _normalize_flag_map(self.capture_flags, keys=RECORD_KINDS, default=False)
  return tuple(kind for kind in RECORD_KINDS if bool(normalized.get(kind, False)))`,
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Learning Mode is not evidence that a learned policy is usable, that a dataset is clean, or that training succeeded. Those conclusions require the Data and Systems articles that own policy artifacts, corrupt rows, and evaluation.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Training a Policy', 'Applying a Learned Policy', 'Understanding AI Learning Records'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'AI Configuration',
    group: 'AI Policy Workflow',
    title: 'Training a Policy',
    description:
      'Defines the two training triggers as settings-surface workflows that read normalized learning state, decode or synthesize training evidence, write user policy artifacts, save evaluation and training summaries, and switch the selected policy only after a completed result.',
    sections: [
      {
        id: 'training-a-policy-setting-scope',
        title: 'Setting Scope',
        content: [
          {
            kind: 'paragraph',
            text: '`Train From Player Data` and `Train In Sandbox` are displayed as Learning Mode choices, but they are not persistent live-play modes. `AiSettingsOverlay._on_learning_mode_changed` intercepts those values and starts a learning task. While a task is running, the overlay disables learning controls through `_set_learning_busy`, preventing the user from changing the policy source, evaluation button, import/export controls, or reset controls mid-run.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_settings.py',
            code: `def _on_learning_mode_changed(self, _index: int = 0) -> None:
  mode = str(self._learning_mode_combo.currentData())
  self._sync_learning_mode_notice()
  if mode == LEARNING_MODE_TRAIN_FROM_PLAYER_DATA:
    self._run_learning_task(self._learning_controller.train_from_player_data, self._on_training_done, busy_text="Training from player data...")
    return
  if mode == LEARNING_MODE_TRAIN_IN_SANDBOX:
    self._run_learning_task(self._learning_controller.train_in_sandbox, self._on_training_done, busy_text="Training in sandbox...")
    return
  self._learning_controller.set_learning_mode(mode)`,
          },
        ],
      },
      {
        id: 'training-a-policy-player-data',
        title: 'Training From Player Data',
        content: [
          {
            kind: 'paragraph',
            text: 'Player-data training reads the current dataset id from `PersistedAiLearningSettings`, decodes records through `AiLearningStore.iter_demonstration_records`, computes the dataset summary, increments the policy version, and calls `TrainingService.train_from_player_data`. The workflow records corrupt-line count in the training input; it does not pretend that malformed rows were usable demonstrations. If no policy is produced, only a training-run record and summary are saved. If a policy is produced, the controller evaluates it, saves a policy artifact and an evaluation report, updates summaries, and selects the user policy.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_learning_controller.py',
            code: `dataset_id = str(self._state.settings.dataset_id)
records, corrupt = self._store.iter_demonstration_records(dataset_id)
summary = self._store.dataset_summary(dataset_id)
next_version = int(self._state.policy_version) + 1
result = TrainingService().train_from_player_data(
  records,
  policy_id=USER_PLAYER_POLICY_ID,
  policy_name="User Learned Policy",
  dataset_id=dataset_id,
  dataset_size=int(summary.record_count),
  policy_version=int(next_version),
  corrupt_lines=int(corrupt),
)`,
          },
        ],
      },
      {
        id: 'training-a-policy-sandbox',
        title: 'Training In Sandbox',
        content: [
          {
            kind: 'paragraph',
            text: 'Sandbox training uses the selected raw policy as a base when one exists and calls the headless sandbox trainer for a single iteration. It is still a settings-surface workflow: it writes a training-run record, saves a user policy or failure summary, stores evaluation data derived from the resulting policy, and updates selected policy fields. It is not an invitation to infer an external model architecture or long-running background learner beyond the implementation call.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_learning_controller.py',
            code: `base = self._raw_selected_policy()
next_version = int(self._state.policy_version) + 1
result = sandbox_train(policy_id=USER_SANDBOX_POLICY_ID, policy_name="Sandbox Learned Policy", base_policy=base, policy_version=int(next_version), iterations=1)`,
          },
          {
            kind: 'paragraph',
            text: 'The completion handler is intentionally conservative. Only a `completed` status switches the combo box and saved state to `Use Learned Policy`; failure restores the combo to `Off`. A training label on the UI is therefore not by itself evidence that runtime AI now uses a learned policy.',
          },
        ],
      },
    ],
    relatedTitles: ['Choosing a Learning Mode', 'Reading Demonstration Data', 'Reading Learned Policies'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'AI Configuration',
    group: 'AI Policy Workflow',
    title: 'Applying a Learned Policy',
    description: 'Defines learned-policy application as a selected-policy resolution path guarded by source family, policy id, usability evaluation, active learning mode, and deterministic fallback.',
    sections: [
      {
        id: 'applying-a-learned-policy-setting-scope',
        title: 'Setting Scope',
        content: [
          {
            kind: 'paragraph',
            text: 'Applying a learned policy begins with two saved fields, `selected_policy_kind` and `selected_policy_id`, not with a file path typed into the renderer or the AI actor. The policy source combo selects built-in, bundled, user, or experimental policy family through `normalize_policy_kind`; the policy id combo is enabled only for bundled and user families. The setting is therefore a policy-resolution instruction, not direct authority for arbitrary JSON execution.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_settings.py',
            code: `def _sync_learning_policy_id_enabled(self) -> None:
  kind = str(self._learning_policy_kind_combo.currentData())
  self._learning_policy_id_combo.setEnabled(kind in (POLICY_KIND_BUNDLED, POLICY_KIND_USER))

def _on_learning_policy_changed(self, _index: int = 0) -> None:
  kind = str(self._learning_policy_kind_combo.currentData())
  policy_id = str(self._learning_policy_id_combo.currentData() or "")
  self._learning_controller.set_policy(kind, policy_id)`,
          },
        ],
      },
      {
        id: 'applying-a-learned-policy-resolution',
        title: 'Resolution and Fallback',
        content: [
          {
            kind: 'paragraph',
            text: '`AiLearningController._raw_selected_policy` resolves the selected family. User policy ids are loaded from the store, bundled policy ids are matched against the bundled registry, the built-in family returns `builtin_deterministic_policy`, and any unsupported or unresolved family returns nothing. The runtime coordinator later uses a learned policy only when `policy_enabled()` is true: the mode must be `use_learned_policy`, the policy object must exist, and `Policy.is_usable()` must pass. Otherwise the deterministic policy remains the decision source.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/overlays/ai_learning_controller.py',
            code: `def _raw_selected_policy(self) -> Policy | None:
  settings = self._state.settings
  kind = str(settings.selected_policy_kind)
  if kind == POLICY_KIND_USER:
    return self._load_user_policy(settings.selected_policy_id)
  if kind == POLICY_KIND_BUNDLED:
    requested = str(settings.selected_policy_id).strip()
    for policy in self._registry.bundled_policies():
      if not requested or str(policy.policy_id) == requested:
        return policy
    return None
  if kind == POLICY_KIND_BUILTIN:
    return builtin_deterministic_policy()
  return None`,
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/coordinator.py',
            code: `def policy_enabled(self) -> bool:
  return self._mode == LEARNING_RUNTIME_USE_LEARNED_POLICY and isinstance(self._policy, Policy) and bool(self._policy.is_usable())

def decide(self, observation: AiObservation, mask: AiActionMask) -> PolicyDecision:
  policy = self._policy if self.policy_enabled() else None
  return self._deterministic.decide(observation, mask, policy)`,
          },
        ],
      },
      {
        id: 'applying-a-learned-policy-evidence-limit',
        title: 'Evidence Limit',
        content: [
          {
            kind: 'paragraph',
            text: 'A selected policy id, a readable policy file, and a visible `Use Learned Policy` label are three different facts. Runtime application requires all of them to pass the active-mode and usability gates. The learned policy modifies decision ranking through the deterministic policy machinery; it does not bypass action masks, placement preconditions, route rules, combat constraints, physics, or collision. The visible effect of a policy should therefore be reported as a bounded AI-decision symptom, not as proof that a policy file is valid, that training was successful, or that dataset records are clean.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                '`Use Learned Policy` selects a stored policy identifier through the AI settings surface and runtime preference path. `PolicyRegistry` admits that identifier only after schema, compatibility, feature-encoder, action-catalog, and evaluation checks; dataset content and evaluation records remain in the learning store and determine artifact evidence independently of the control value.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Choosing a Learning Mode', 'Understanding Policy Evaluation', 'Reading Learned Policies'],
  }),
  defineDocsArticle({
    category: 'Settings',
    subcategory: 'Visual and Audio Settings',
    group: 'Chat Settings',
    title: 'Changing Chat Visibility',
    description:
      'Defines the runtime-only Mute All Chat setting, the surface that exposes it, the runtime state that owns it, its effect on the chat screen and the heads-up feed, and its relationship to the one-hundred-message history cap.',
    sections: [
      {
        id: 'chat-visibility-surface-and-owner',
        title: 'Surface and Owner',
        content: [
          {
            kind: 'paragraph',
            text: 'Mute All Chat is the only control on the embedded Chat Settings surface, opened from the settings button on the chat screen bottom bar. The surface is a display and operation surface only; the setting itself is owned by the application chat runtime. `ChatRuntimeSettings` in `src/ludoxel/application/chat/settings.py` holds the flag, and `ChatRuntime` reads it. The presentation toggle does not own the value, and the value is not stored in the keybind, audio, or runtime-preference schemas.',
          },
        ],
      },
      {
        id: 'chat-visibility-runtime-only',
        title: 'The Setting Is Held Only While the Game Runs',
        content: [
          {
            kind: 'paragraph',
            text: 'Mute All Chat is a runtime-only setting. It is held for the duration of the running game and is never written to saved preferences, the app-state schema, a world save, or an Othello save, so it resets when the application or the game restarts. No default-value record is read for it from disk because no persisted record exists.',
          },
        ],
      },
      {
        id: 'chat-visibility-runtime-effect',
        title: 'Runtime Effect and the History Cap',
        content: [
          {
            kind: 'paragraph',
            text: 'While Mute All Chat is enabled, every message kind is hidden in both the full chat screen and the heads-up feed: `ChatRuntime.display_messages` and `recent_display_messages` return an empty set. Messages are not deleted; they continue to accumulate into the runtime history, which is capped at one hundred messages. Disabling the setting reveals the retained messages still inside the cap, with the newest roughly ten rows shown in the heads-up feed. Messages dropped by the cap while muted are not restored.',
          },
        ],
      },
    ],
    relatedTitles: ['Using Chat and Commands', 'Understanding the Chat Runtime and Command Routing', 'Changing Keybind Preferences'],
  }),
];
