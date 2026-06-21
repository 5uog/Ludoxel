/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const systemsPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Session Loop',
    title: 'Understanding Fixed Step Sessions',
    description:
      'Documents the entire fixed-step session loop: the game-loop configuration and timers, the FixedStepRunner accumulator and substep budget, the step_session domain advance and its result record, the creative-flight toggle and movement-action mapping, and the separation between simulation and render cadence.',
    sections: [
      {
        id: 'fixed-step-sessions-configuration',
        title: 'Loop Configuration and Timers',
        content: [
          {
            kind: 'paragraph',
            text: 'The cadence is configured by `GameLoopParams` in `src/ludoxel/presentation/interface/config/game_loop.py`. Its `sim_hz` field defaults to 120.0 and `step_dt` returns the reciprocal with a small denominator floor, so a zero or negative frequency cannot produce a division error. The optional `sim_timer_interval_ms` and `render_timer_interval_ms` fields are zero by default, which means the interval is derived from the frequency. `DEFAULT_GAME_LOOP_PARAMS` is the shared instance the viewport receives.',
          },
          {
            kind: 'math',
            math: {
              expression: '\\Delta t = \\frac{1}{\\max(\\mathrm{simHz},\\ 10^{-6})}',
              displayMode: true,
              caption: 'GameLoopParams.step_dt; at the default 120 hertz the quantum is one one-hundred-twentieth of a second.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The viewport derives two timer intervals in `src/ludoxel/presentation/interface/viewport/lifecycle/mixin.py`. `_effective_sim_timer_interval_ms` rounds the reciprocal of `sim_hz` to milliseconds, while `_effective_render_timer_interval_ms` rounds the reciprocal of at least 120 hertz. The first timer drives `_tick_sim`, the second requests repaints. Either field, if set above zero, overrides the derived interval. These are nominal scheduling intervals; the runner itself measures real elapsed time and is not bound to them. `_sync_runtime_activity` keeps both timers running for an initialized, visible viewport while loading remains active even after desktop deactivation; after loading ends, an inactive application again stops the runtime timers.',
          },
        ],
      },
      {
        id: 'fixed-step-sessions-runner',
        title: 'The FixedStepRunner Accumulator',
        content: [
          {
            kind: 'paragraph',
            text: 'The runner in `src/ludoxel/application/sessions/runners/fixed_step.py` holds `step_dt`, the `on_step` callback, a substep ceiling `max_substeps` defaulting to eight, an accumulator, and the previous timestamp. `start` records the current `time.perf_counter` and clears the accumulator. `update` samples the clock, guards the first frame when the previous timestamp is non-positive, rejects a non-positive quantum, clamps the elapsed frame time, accumulates it, and then drains the accumulator in fixed quanta.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/sessions/runners/fixed_step.py',
            code: `frame_dt = max(0.0, min(0.25, now - self._last))
self._last = now
self._accum += frame_dt

substeps = 0
limit = int(max(1, int(self.max_substeps)))

while self._accum >= step and substeps < limit:
  self.on_step(step)
  self._accum -= step
  substeps += 1

if self._accum >= step:
  self._accum = min(float(self._accum), step)`,
          },
          {
            kind: 'math',
            math: {
              expression:
                'f = \\max\\bigl(0,\\ \\min(0.25,\\ t_{now}-t_{last})\\bigr), \\qquad n = \\min\\!\\left(\\left\\lfloor\\frac{a}{\\Delta t}\\right\\rfloor,\\ \\max(1,\\text{maxSubsteps})\\right)',
              displayMode: true,
              caption: 'The per-frame elapsed time f is clamped to 0.25 s; n fixed steps are emitted per update from accumulated time a.',
            },
          },
          {
            kind: 'paragraph',
            text: 'Two clamps bound the loop against a stall. The elapsed-time clamp of 0.25 seconds caps how much real time a single frame may inject, and the trailing reduction discards excess accumulated time once the substep budget is exhausted, reducing the accumulator to at most one quantum. Together they prevent an unbounded catch-up spiral: under sustained overload the simulation slows relative to wall time instead of accumulating an ever-growing backlog. Each call to `on_step` is guaranteed to represent exactly one quantum of simulated time, which is the contract every consumer of session state relies upon.',
          },
        ],
      },
      {
        id: 'fixed-step-sessions-step',
        title: 'What One Step Advances',
        content: [
          {
            kind: 'paragraph',
            text: 'The runner callback is `_on_step` in `src/ludoxel/presentation/interface/viewport/render_loop/loop.py`, which consumes input, calls `SessionManager.step`, ticks the learning runtime, synchronises the heads-up display, and plays the audio events implied by the step result. `SessionManager.step` in `src/ludoxel/application/sessions/managers/session.py` delegates to `step_session` in `src/ludoxel/application/sessions/managers/stepping.py`, which performs the domain advance for one quantum.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Advance the session simulation clock by dt and run the gravity system over the world and player.',
              'Convert the mouse delta into yaw and pitch deltas scaled by mouse sensitivity.',
              'Apply the creative-flight double-tap toggle through _update_creative_flight_toggle.',
              'Advance the runtime player with movement, collision, and the assembled PlayerStepInput.',
              'Apply fall and void damage outside creative mode; reset the void-damage timer inside it.',
              'Step every AI actor, optionally excluding paused route-edit actors, and feed the learning coordinator.',
              'Record a player movement demonstration when the learning coordinator is recording.',
              'Resolve the death cause from void, fall, or PvP damage and return a SessionStepResult.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The result is the frozen `SessionStepResult`, carrying jump-started, landed, footstep-triggered, the support block state and position, fall distance, damage taken, the death reason and killer name, the gravity-broken blocks, and the flags for damage and AI-damage sound positions. The render loop reads these fields to drive footstep, landing, break, and damage audio and to raise the death overlay. The death reason is `void`, `fall`, `pvp`, or a generic `damage`, distinguishing the cause so the overlay can phrase it correctly.',
          },
        ],
      },
      {
        id: 'fixed-step-sessions-movement-and-flight',
        title: 'Movement Mapping and Creative Flight',
        content: [
          {
            kind: 'paragraph',
            text: 'Two helpers in the stepping module fix narrow contracts. `_player_movement_action` maps the per-step movement input to a demonstration action identifier: a jump press dominates, a horizontal magnitude below the threshold yields `sneak` only when crouching and otherwise no record, and the cardinal and diagonal directions classify the remainder, with forward plus sprint becoming `sprint`. It returns nothing for a step that should not be recorded as movement. `_update_creative_flight_toggle` on the session manager toggles flight on a double jump press within a fixed window, zeroing vertical velocity on enable and clamping it on disable, and forces flight off outside creative mode.',
          },
          {
            kind: 'paragraph',
            text: '`SessionManager` also owns `respawn`, which resets the player to spawn, clears motion and timers, and heals to full; `support_block_contact`, which reports the block beneath the player for audio and physics; `current_death_reason`, which returns the stored cause only while the player is dead; and the recording helpers `_player_observation_dict`, `_player_feature_keys`, and `_record_player_action`, which capture only player-knowable self state for learning and never leak world truth the player could not observe.',
          },
        ],
      },
      {
        id: 'fixed-step-sessions-velocity-smoothing',
        title: 'Velocity Smoothing Remains a Lower-Level Computation',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/mathematics/scalars/smoothing.py` owns the exponential blend factor used by the movement system. `exp_alpha` clamps its rate and elapsed time to non-negative values, returns zero when either is at most `1e-9`, and otherwise returns the factor consumed by `src/ludoxel/simulation/rules/movement/system.py` to move each velocity component toward its target. The foundation function receives only a rate and a time delta; it does not decide whether the target is walking, sprinting, flying, grounded, or airborne, and it does not own a user setting.',
          },
          {
            kind: 'math',
            math: {
              expression: 'a=\\begin{cases}0&r\\le10^{-9}\\ \\text{or}\\ t\\le10^{-9}\\\\1-e^{-rt}&r>10^{-9}\\ \\text{and}\\ t>10^{-9}\\end{cases},\\qquad v_{next}=v+(v_{target}-v)a',
              displayMode: true,
              caption:
                '`exp_alpha` in `src/ludoxel/foundations/mathematics/scalars/smoothing.py` clamps its inputs to non-negative values before this guard; `src/ludoxel/simulation/rules/movement/system.py` applies the component-wise update.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/scalars/smoothing.py',
            code: `def exp_alpha(rate: float, dt: float) -> float:
  r = float(max(0.0, rate))
  t = float(max(0.0, dt))

  if r <= 1e-9 or t <= 1e-9:
    return 0.0

  return 1.0 - math.exp(-r * t)`,
          },
          {
            kind: 'paragraph',
            text: 'The rate belongs to the movement parameters and the state transition belongs to the simulation step. For the positive branch, the returned value is strictly between zero and one; the zero branch authorizes no velocity movement at all. The scalar computation therefore provides a bounded blend factor for a supplied rate and delta. It neither sets acceleration policy nor reports a completed player action.',
          },
        ],
      },
      {
        id: 'fixed-step-sessions-render-cadence',
        title: 'Render Cadence Is Not the Step Loop',
        content: [
          {
            kind: 'paragraph',
            text: '`_tick_sim` calls `self._runner.update()` and then requests a repaint; the paint event builds a render snapshot from the latest session state independently. A rendered frame therefore corresponds to zero, one, or several substeps depending on accumulated real time. Both `_tick_sim` and `_on_step` early-return while loading, while an overlay or transient modal is active, so stepping is suspended without losing the accumulator contract. The paint path remains separately available during inactive loading because `paintGL` owns the chunk upload, loading-status update, and visible-chunk completion check; it is not a simulation-step side effect.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content: [
                'A fixed step advances simulation and emits a result record. Drawing, chunk upload, audio, and persistence are triggered by that record, not part of the quantum. The conversion of session state to renderer input is owned by ',
                {
                  kind: 'link',
                  label: 'render snapshots',
                  href: '/docs/systems/runtime-and-render-state/session-loop/understanding-render-snapshots',
                },
                '.',
              ],
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Application Runtime Assembly', 'Understanding Render Snapshots', 'Understanding Saved Preferences', 'Switching Play Spaces'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Session Loop',
    title: 'Understanding Application Runtime Assembly',
    description:
      'Traces the application-owned construction of a desktop runtime from bootstrap roots and Othello storage hooks through dual play-space construction, persisted-state rehydration, normalized runtime projection, and the fixed-step and snapshot boundaries that hand work to presentation.',
    sections: [
      {
        id: 'application-runtime-assembly-bootstrap',
        title: 'Bootstrap Establishes Runtime Roots Before Presentation',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/bootstrap/run.py` is the composition root. It resolves the project, resource, and runtime-data roots before importing the desktop window entry point, and it installs the Othello opening-book storage hooks before the presentation shell can create a worker or request a book. The Python 3.14 handoff is deliberately earlier still: in an unfrozen process, a discovered alternate interpreter relaunches the module with the project `src` directory added to `PYTHONPATH`; a frozen application and an already-matching interpreter continue in place. This is process assembly, not a second implementation of a window, renderer, or game rule.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/bootstrap/run.py',
            code: `def run_app() -> None:
  project_root = default_project_root(Path(__file__))
  resource_root = default_resource_root(Path(__file__))
  data_root = default_runtime_data_root(project_root)
  _ensure_python_314(project_root)

  from ludoxel.application.persistence.stores.othello_book import install_othello_book_storage_hooks
  from ludoxel.presentation.interface.windows.main import run_app as _run

  install_othello_book_storage_hooks()
  _run(project_root=project_root, resource_root=resource_root, data_root=data_root)`,
          },
          {
            kind: 'paragraph',
            text: 'The opening-book hook separates a user delta at `state/othello_opening_book.json` from its compiled cache under the runtime cache root. The application writes and integrity-updates the user file, while cache load, save, and removal remain cache operations. A resolved data root therefore locates mutable state; it does not grant any permission over that state or over material that may be imported into it.',
          },
        ],
      },
      {
        id: 'application-runtime-assembly-spaces',
        title: 'One Context Holds Independent Play-Space Sessions',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/sessions/context/builders.py` turns a seed, spawn, world, and block registry into `SessionSettings`, a `PlayerEntity`, and a `SessionManager`. `PlaySpaceContext.create_default` in `src/ludoxel/application/sessions/context/play_space.py` constructs one default block registry and gives that registry to both factories. `src/ludoxel/application/sessions/factories/my_world.py` obtains the My World state from its simulation factory through `MyWorldSessionSeed`; `src/ludoxel/application/sessions/factories/othello.py` instead creates a flat world, lays out the board, and fixes an Othello spawn record. The application layer therefore chooses and retains two stateful sessions; it does not reimplement terrain generation, board legality, player kinematics, or backend rendering.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/sessions/context/play_space.py',
            code: `@staticmethod
def create_default(seed: int = 0) -> "PlaySpaceContext":
  registry = create_default_registry()

  my_world = create_my_world_session(seed=int(seed), block_registry=registry)
  othello = create_othello_session(seed=int(seed), block_registry=registry)

  return PlaySpaceContext(my_world=my_world, othello=othello, active_space_id=PLAY_SPACE_MY_WORLD)`,
          },
          {
            kind: 'paragraph',
            text: [
              '`session_for` normalizes a requested space identifier and returns either the Othello or My World manager; `set_active_space` changes only that selection. It does not merge players, worlds, AI actors, inventories, or Othello state. `shutdown` delegates to both managers so AI resources are released for the complete context. The user-facing switch procedure is documented under ',
              {
                kind: 'link',
                label: 'play-space switching',
                href: '/docs/manual/starting-the-application/launch-and-space-selection/switching-play-spaces',
              },
              '; this runtime boundary only establishes how the two persistent session objects remain distinct.',
            ],
          },
        ],
      },
      {
        id: 'application-runtime-assembly-rehydration',
        title: 'Rehydration Restores State in a Fixed Order',
        content: [
          {
            kind: 'paragraph',
            text: '`apply_persisted_state_if_present` in `src/ludoxel/application/persistence/schedulers/state.py` first asks `AppStateStore` for the paired player and world envelopes. When state exists, it applies persisted session settings to both managers, projects the saved aggregate into `RuntimePreferences`, restores each player and world, loads each AI-state tuple, and restores collision-related overlap exemptions. The Othello branch additionally ensures its board layout and lifts a restored player that would otherwise be below the board surface. Only after those repairs does the function normalize runtime preferences, select the active space, and push the visual subset into the renderer.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/schedulers/state.py',
            code: `runtime.normalize()
sessions.set_active_space(runtime.current_space_id)
apply_runtime_to_renderer(runtime, renderer)
return (runtime, othello_game_state)`,
          },
          {
            kind: 'paragraph',
            text: [
              'The order is consequential: an active-space label and renderer flags are derived only after their admitting state has been normalized. A missing pair of state files leaves the default runtime intact; a present runtime file that fails integrity verification is withheld by `AppStateStore` rather than decoded. The envelope versions, JSON failure behavior, legacy fallback, and integrity records are the responsibility of ',
              {
                kind: 'link',
                label: 'saved runtime state',
                href: '/docs/data/local-and-saved-data/saved-runtime-state/reading-saved-preferences',
              },
              ', not of the renderer or either simulation space.',
            ],
          },
        ],
      },
      {
        id: 'application-runtime-assembly-projection',
        title: 'Runtime State Is a Projection, Not an Alias for Disk Data',
        content: [
          {
            kind: 'paragraph',
            text: '`AppState` is an immutable aggregate of the current space identifier, persisted settings, inventory, standing Othello settings, My World state, and Othello state. Its two on-disk envelopes split the aggregate: `PlayerStateFile` owns the current space, settings, inventory, and standing Othello settings, while `WorldStateFile` owns both play spaces. `JsonFileStore` serializes each dictionary through a sibling temporary file, flushes and fsyncs it, replaces the target, and removes a remaining temporary path. That write protocol is a durability boundary; it is not a claim that arbitrary edits preserve schema or integrity validity.',
          },
          {
            kind: 'paragraph',
            text: '`runtime_preferences_from_app_state` deliberately produces mutable runtime state rather than exposing a saved dataclass to the live session. Its inverse, `persisted_settings_from_runtime`, pulls movement values from the active session settings, while `persisted_inventory_from_runtime` copies every hotbar branch. `save_state` serializes both sessions and their AI projections and then delegates to `AppStateStore.save`. The application keeps the file shape, live aggregate, session parameters, and renderer commands separate because they are consumed at different times and with different mutability requirements.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'A cache is not primary state. Removing the Othello opening-book cache does not remove the user opening-book file; deleting or corrupting a primary state envelope changes what the next runtime can restore. Neither classification answers a permission question about data at the resolved path.',
            },
          },
        ],
      },
      {
        id: 'application-runtime-assembly-step-and-snapshot',
        title: 'The Running Context Emits Bounded Application Values',
        content: [
          {
            kind: 'paragraph',
            text: '`SessionManager` in `src/ludoxel/application/sessions/managers/session.py` keeps a simulation world, player, registry, interaction service, gravity system, AI manager, learning coordinator, and per-session motion and damage state together. Its thin interaction and AI methods delegate into simulation-owned services, recording a player demonstration only after a successful block action or local AI attack. `src/ludoxel/application/sessions/managers/learning.py` owns `AiLearningRuntime`, which separately reads normalized learning settings, resolves a policy only for the learned-policy mode, configures the active session, and flushes buffered records on its two-second cadence or on demand. A setting or file cannot make an unsupported policy format or action path live merely by existing on disk.',
          },
          {
            kind: 'paragraph',
            text: [
              'At each fixed quantum, the session manager returns `SessionStepResult`; its bounded clocking and damage/audio consequences are covered by the ',
              {
                kind: 'link',
                label: 'fixed-step loop',
                href: '/docs/systems/runtime-and-render-state/session-loop/understanding-fixed-step-sessions',
              },
              '. At paint time, the manager projects mutable player, AI, gravity, and camera state into frozen DTOs. The renderer receives those values, not a mutable `WorldState` or `PlayerEntity`; the exact DTO contract and numerical view effects are documented by ',
              {
                kind: 'link',
                label: 'render snapshots',
                href: '/docs/systems/runtime-and-render-state/session-loop/understanding-render-snapshots',
              },
              '.',
            ],
          },
        ],
      },
    ],
    relatedTitles: [
      'Understanding Fixed Step Sessions',
      'Understanding Render Snapshots',
      'Understanding Saved Preferences',
      'Reading Saved Preferences',
      'Reading Saved Othello State',
      'Switching Play Spaces',
    ],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Session Loop',
    title: 'Understanding Render Snapshots',
    description:
      'Documents the render-snapshot contract end to end: the camera, player-model, falling-block, and particle DTOs, the camera-shake and view-bobbing mathematics that build them, the AI snapshot projection, the renderer protocol and wrapper that consume them, and the cache-key render states.',
    sections: [
      {
        id: 'render-snapshots-dtos',
        title: 'The Snapshot Data Types',
        content: [
          {
            kind: 'paragraph',
            text: [
              'The snapshot types in `src/ludoxel/application/sessions/pipelines/render_snapshot.py` are all frozen dataclasses. `RenderSnapshotDTO` aggregates a world revision, a `CameraDTO`, a `PlayerModelSnapshotDTO`, and tuples of `FallingBlockRenderSampleDTO` and `BlockBreakParticleRenderSampleDTO`. `CameraDTO` carries eye position, yaw, pitch, field of view, and six separable camera-shake channels for translation and rotation. `PlayerModelSnapshotDTO` carries base position, the body and head angles, limb phase and swing, crouch amount, an `idle_anim_time_s` visual-animation clock, hurt tint, the six first-person view-model channels, and a first-person flag. Here `body_yaw_deg` is the lagged visual body yaw and `head_yaw_deg` is the head yaw measured relative to that body, not the raw look yaw; how those two angles are produced and consumed is owned by the ',
              {
                kind: 'link',
                label: 'player-model pose',
                href: '/docs/systems/rendering-backends/world-visuals/understanding-the-player-model-pose',
              },
              '.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Every field is a scalar, a tuple of scalars, or another frozen DTO. No `PlayerEntity`, `WorldState`, or other mutable simulation object crosses the boundary, so presentation cannot mutate domain state through the snapshot and each snapshot is a stable per-frame value rather than a window onto changing data.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/sessions/pipelines/render_snapshot.py',
            code: `@dataclass(frozen=True)
class RenderSnapshotDTO:
  world_revision: int
  camera: CameraDTO
  player_model: PlayerModelSnapshotDTO
  falling_blocks: tuple[FallingBlockRenderSampleDTO, ...] = ()
  block_break_particles: tuple[BlockBreakParticleRenderSampleDTO, ...] = ()`,
          },
        ],
      },
      {
        id: 'render-snapshots-camera',
        title: 'Camera and View-Bobbing Mathematics',
        content: [
          {
            kind: 'paragraph',
            text: '`make_camera_snapshot_for_session` in `src/ludoxel/application/sessions/managers/snapshots.py` derives the camera. It computes a speed ratio from horizontal velocity over walk speed, clamped to a maximum swing scale, scales the bob down while flying or airborne, and synthesises translation and pitch and roll shake from the walk phase. Hurt camera strength adds a tilt by the hurt sign. When camera shake is disabled the shake channels are zeroed. The shake strength preference scales the whole shake by a clamped factor.',
          },
          {
            kind: 'paragraph',
            text: '`make_render_snapshot_for_session` composes the camera and the player model and then scales only the first-person view-model channels by the view-bobbing strength, clamped to the unit interval and forced to zero when bobbing is disabled. It also projects the interpolated gravity samples into falling-block DTOs. The player projection itself is `build_player_model_snapshot` in `src/ludoxel/application/sessions/pipelines/player_model.py`, which converts the mutable entity and motion state into renderer-facing scalars, deriving crouch amount from the eye drop and the first-person bob from the walk phase. It also reads the lagged visual body yaw and the always-advancing visual clock from the motion state, emitting `body_yaw_deg` as the visual body yaw, `head_yaw_deg` as the look yaw taken relative to it and clamped to the maximum head separation, and `idle_anim_time_s` as the clock that drives idle animation.',
          },
          {
            kind: 'math',
            math: {
              expression: 'r = \\mathrm{clamp}\\!\\left(\\frac{\\lVert v_{xz}\\rVert}{\\max(\\text{walk},\\,10^{-6})},\\ 0,\\ r_{\\max}\\right)',
              displayMode: true,
              caption: 'The swing-and-bob speed ratio used by both the camera snapshot and the player-model snapshot.',
            },
          },
        ],
      },
      {
        id: 'render-snapshots-actors',
        title: 'AI Actor Projection',
        content: [
          {
            kind: 'paragraph',
            text: 'AI actors reach the renderer the same way. `ai_render_snapshots_for_session` in `src/ludoxel/application/sessions/managers/ai_players.py` walks the actor observations and builds an `AiPlayerRenderSnapshotDTO` for each, reusing `build_player_model_snapshot` in third-person mode and carrying the held item, attack swing progress and its previous value, the actor identity and name, health and the health indicator, the skin mode and skin identifier, and the position and height for the world-space name tag. The skin mode is a three-valued field selecting the shared player skin, a bundled Alex skin, or an actor-specific imported skin, and the renderer uses only a resolved skin reference per frame.',
          },
          {
            kind: 'paragraph',
            text: 'The same module owns the rest of the session-manager AI surface: `set_ai_players_for_session`, `ai_states_for_session`, `spawn_ai_player_for_session`, the settings accessors, `ai_player_name_error_for_session` for save-time name validation, `remove_ai_player_for_session`, `cancel_ai_navigation_for_session`, `pick_ai_player_for_session`, `attack_ai_player_for_session`, and `ai_route_paths_for_session`. These are session-boundary projections; none expose a mutable simulation entity to presentation.',
          },
        ],
      },
      {
        id: 'render-snapshots-contract',
        title: 'The Renderer Contract and Render States',
        content: [
          {
            kind: 'paragraph',
            text: 'The backend protocol `BackendRendererApi` in `src/ludoxel/presentation/rendering/contracts/api.py` declares the surface every backend implements: `initialize`, `render`, `submit_chunk`, `set_selection_target`, `clear_selection`, `evict_chunks`, `atlas_uv_face`, `set_player_skin_image`, `set_ai_skin_images`, `render_player_preview_frame`, and the diagnostic accessors. The concrete `Renderer` wrapper in the same module forwards each call to the active backend and forwards the snapshot fields, the player render state, the extra player states, the Othello state, and the falling-block and particle tuples to `render`.',
          },
          {
            kind: 'paragraph',
            text: 'The render-state types in `src/ludoxel/presentation/rendering/visuals/players/render_state.py` are frozen and serve as cache keys. `PlayerRenderState` carries base pose, the visual body and relative head angles, locomotion phase, crouch, the `idle_anim_time_s` clock, the perspective flag, a resolved `skin_texture_key`, and an optional `FirstPersonRenderState`; two actors with the same pose but different skins are distinct cache entries because the key includes the skin reference, and because the idle clock advances every step a standing actor still produces a fresh key each step so its idle motion animates. `FirstPersonRenderState` carries the visible and target item identifiers, the held block kind, the special-item icon, equip and swing progress, the arm and view-model flags, the view-bob channels, and the arm rotation limits, so the first-person view model is reconstructed from one sample.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'A render snapshot proves what one frame should depict from the latest session state. It does not carry chunk geometry, the heads-up display, overlay state, or the selection target; those reach the renderer through the upload cadence, the HUD signal, and the selection path described in the OpenGL, WGPU, and selection-outline articles.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Fixed Step Sessions', 'Understanding the Player Model Pose', 'Understanding OpenGL Rendering', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Saved Preferences',
    description:
      'Documents the full preference architecture: the runtime preference aggregate, its normalization and hotbar accessors, the coercion helper, the persisted settings schema and its tolerant reader, the runtime-state conversion pipeline, the application state store with integrity verification, and the lifecycle save points.',
    sections: [
      {
        id: 'saved-preferences-runtime-object',
        title: 'The Runtime Preference Aggregate',
        content: [
          {
            kind: 'paragraph',
            text: '`RuntimePreferences` in `src/ludoxel/application/preferences/runtime.py` is the mutable aggregate shared by persistence, the settings surface, the renderer state, and the active session. It holds the play-space identifier, input inversion, selection and cloud and shadow flags, cloud density and seed and flow and speed and height parameters, hotbar slot lists and selected indices for the creative, survival, Othello, and route branches, the Othello settings, reach and block-repeat intervals, particle rates, camera and view-model and arm parameters, render distance, sun angles, window geometry, and the keybind and audio sub-objects. Numerous class-level constants fix the allowed ranges and defaults.',
          },
          {
            kind: 'paragraph',
            text: '`normalize` projects every component into its allowed domain in one pass: booleans are coerced, shadow quality and render distance and cloud parameters are clamped, the play-space identifier and Othello settings are normalized, the arm rotation limits are clamped and reordered if inverted, the legacy block-place interval is migrated to the current default, sun azimuth is wrapped to a full turn and elevation clamped, all four hotbar branches are normalized to size and index, and the keybind and audio sub-objects are normalized in turn.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/runtime.py',
            code: `self.shadow_map_quality = normalize_shadow_map_quality(self.shadow_map_quality)
self.render_distance_chunks = clamp_render_distance_chunks(int(self.render_distance_chunks))
self.view_bobbing_strength = clampf(float(self.view_bobbing_strength), 0.0, 1.0)
if float(self.arm_rotation_limit_min_deg) > float(self.arm_rotation_limit_max_deg):
  self.arm_rotation_limit_min_deg, self.arm_rotation_limit_max_deg = float(self.arm_rotation_limit_max_deg), float(self.arm_rotation_limit_min_deg)`,
          },
          {
            kind: 'paragraph',
            text: 'The hotbar accessors select the active branch by play space, route-edit, and creative mode through `_active_hotbar_state_attrs`, and `set_hotbar_slot`, `select_hotbar_index`, `cycle_hotbar`, and `clear_selected_hotbar_slot` normalize before mutating so the slot count and index stay coherent. `current_item_id`, `current_block_id`, and `current_special_item_id` resolve the selected slot, excluding special items from block placement and ordinary blocks from the special path. `is_othello_space`, `is_first_person_view`, `view_model_visible`, and `cycle_camera_perspective` answer derived predicates from the same normalized state.',
          },
        ],
      },
      {
        id: 'saved-preferences-coercion',
        title: 'Partial Updates and Cloning',
        content: [
          {
            kind: 'paragraph',
            text: '`coerce_runtime_preferences` copies the aggregate field by field, applies only the supplied overrides, and normalizes the result. Hotbar slot lists, crosshair pixels, Othello settings, keybinds, and audio receive type-specific coercion, the last two accepting either a typed object or a raw mapping. `clone` is the no-argument form. Because the whole aggregate is re-validated after every override, a caller cannot install an out-of-range value by updating a single field.',
          },
        ],
      },
      {
        id: 'saved-preferences-schema',
        title: 'The Persisted Settings Schema',
        content: [
          {
            kind: 'paragraph',
            text: '`PersistedSettings` in `src/ludoxel/application/persistence/schema/settings.py` is the frozen on-disk form. It owns the documented default values, a `__post_init__` that normalizes cloud and shadow fields at construction, a `to_dict` serializer, and a tolerant `from_dict` reader. The reader coerces each scalar through a typed mapping helper with an explicit default, so a missing or malformed key falls back to the default rather than failing the load, and it accepts legacy key names where they existed, reading `cloud_wire` as a fallback for `cloud_wireframe` and `build_mode` as a fallback for `creative_mode`.',
          },
          {
            kind: 'paragraph',
            text: 'The runtime-state pipeline in `src/ludoxel/application/sessions/pipelines/runtime_state.py` converts between the two representations. `runtime_preferences_from_app_state` reads a persisted aggregate into a normalized runtime object; `persisted_settings_from_runtime` projects the runtime object and the session movement parameters back into a `PersistedSettings`; `persisted_inventory_from_runtime` extracts the hotbar branches. `apply_runtime_to_renderer` pushes the visual flags and cloud and shadow and sun parameters into the renderer, `sync_runtime_sun_from_renderer` reads the sun angles back, and `apply_persisted_settings_to_session` installs the field-of-view, sensitivity, and movement values into the session settings.',
          },
        ],
      },
      {
        id: 'saved-preferences-store',
        title: 'The Store and Integrity Verification',
        content: [
          {
            kind: 'paragraph',
            text: '`AppStateStore` in `src/ludoxel/application/persistence/stores/app.py` writes settings and inventory into `player_state.json` and world data into `world_state.json` beneath the runtime state root and updates an integrity manifest. `_read_runtime_or_previous` reads the runtime file first, verifies a protected runtime file before trusting it, and consults the legacy configuration path only when the runtime file is absent. `load` returns nothing when neither file exists, otherwise it reconstructs an `AppState` from the two file schemas.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/app.py',
            code: `def save(self, state: AppState) -> None:
  player_file = PlayerStateFile(version=7, current_space_id=state.current_space_id, settings=state.settings, inventory=state.inventory, othello_settings=state.othello_settings.normalized())
  world_file = WorldStateFile(
    version=3,
    my_world=state.my_world if isinstance(state.my_world, PersistedPlaySpace) else PersistedPlaySpace(),
    othello_space=(state.othello_space if isinstance(state.othello_space, PersistedOthelloSpace) else PersistedOthelloSpace()),
  )
  self._player_store().write(player_file.to_dict())
  self._world_store().write(world_file.to_dict())
  update_runtime_integrity_manifest(self._data_root(), ("state/player_state.json", "state/world_state.json"))`,
          },
          {
            kind: 'paragraph',
            text: [
              'The aggregating functions are `apply_persisted_state_if_present` and `save_state` in `src/ludoxel/application/persistence/schedulers/state.py`, which build an `AppState` from both play-space sessions, restore players and worlds and AI actors, and resolve overlap exemptions. The on-disk layout and the state-versus-cache split are documented by the Data article on ',
              {
                kind: 'link',
                label: 'reading saved preferences',
                href: '/docs/data/local-and-saved-data/saved-runtime-state/reading-saved-preferences',
              },
              '.',
            ],
          },
        ],
      },
      {
        id: 'saved-preferences-ui-and-when',
        title: 'The Settings Surface and Save Points',
        content: [
          {
            kind: 'paragraph',
            text: 'The settings surface in `src/ludoxel/presentation/interface/settings/` displays and edits these values. `sync_overlay_values` in `src/ludoxel/presentation/interface/settings/sync.py` is the one-way push from runtime preferences into the visible controls: it clamps and rounds each value, blocks widget signals while setting, and renders the field-of-view, sensitivity, render distance, sun angles, toggles, sliders, hotbar, crosshair, camera, cloud, particle, movement, audio, and keybind controls. The pause-overlay parameter ranges are fixed by `PauseOverlayParams` in `src/ludoxel/presentation/interface/config/pause_overlay.py`.',
          },
          {
            kind: 'paragraph',
            text: 'Saving is event-driven. `ViewportStateMixin.save_state` synchronises the sun angles back from the renderer, settles Othello animations, and calls `save_state`. It is invoked during the viewport shutdown sequence and when the pause menu issues save-and-quit. Geometry is captured separately by `record_host_window_geometry`.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'A persisted preferences file records the normalized runtime aggregate at the last save event, not every intermediate adjustment, because the write occurs at defined lifecycle points rather than on every control change.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Reading Saved Preferences', 'Locating User Data', 'Changing Camera Preferences'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Keybind Resolution',
    description:
      'Documents the complete keybind path: the action catalog and default bindings, the portable-text normalization and alias folding, the duplicate resolution, the action-to-key and key-to-action maps, the immutable settings object, the Qt input adapter for continuous movement, the discrete dispatch, and the platform cursor and keyboard boundary.',
    sections: [
      {
        id: 'keybind-resolution-actions',
        title: 'Actions, Defaults, and Display',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/application/preferences/keybinds.py` defines the bindable actions: movement, jump, crouch, sprint, the inventory, creative-mode, camera-cycle, gameplay-HUD, debug-HUD, debug-shadow, and clear-slot toggles, and nine hotbar-slot actions. `KEYBIND_ACTION_ORDER` fixes the canonical order shared by saving, the settings view, and duplicate resolution, with the hotbar actions last. `DEFAULT_KEYBINDS` assigns the default key for each, `KEYBIND_DISPLAY_NAMES` and `action_display_name` provide human labels, and `keybind_actions`, `default_keybinds_map`, `hotbar_action_for_index`, and `hotbar_index_for_action` expose the catalog without leaking mutable state.',
          },
        ],
      },
      {
        id: 'keybind-resolution-normalization',
        title: 'Portable Text and Alias Folding',
        content: [
          {
            kind: 'paragraph',
            text: 'Bindings are stored as portable text rather than platform key codes. `portable_text_for_key` and `normalize_key_code` convert a Qt key code to a stable name without importing PyQt6, accepting only ASCII, function, navigation, and modifier keys. `normalize_binding_text` folds an arbitrary input to a single key: text containing a plus or comma is rejected as a sequence, and the remainder is matched against an alias table so `Ctrl` and `Control`, `Esc` and `Escape`, and similar spellings collapse to one canonical name. `binding_to_key` resolves a normalized binding back to a Qt key code, returning nothing for an unknown or empty binding, and `display_text_for_binding` returns `Unbound` for any binding that does not resolve.',
          },
          {
            kind: 'paragraph',
            text: 'Duplicate resolution is performed by `_normalized_bindings_from_items`, which seeds every action to empty, then assigns each binding so that a key reused on a later action clears it from the earlier one, keeping the runtime one-to-one. `_key_maps_for_bindings` builds the forward action-to-key and reverse key-to-action lookups, omitting from the reverse map any binding that does not resolve to a key code.',
          },
        ],
      },
      {
        id: 'keybind-resolution-settings',
        title: 'The Immutable Settings Object',
        content: [
          {
            kind: 'paragraph',
            text: '`KeybindSettings` is a frozen dataclass whose constructor seeds the full default action set, normalizes every binding through the duplicate resolver, and precomputes the two lookups. `binding_for_action` returns the stored text, `key_for_action` the Qt key code or nothing, and `action_for_key_code` the reverse. `with_binding` returns a new object with one action changed and the whole map re-normalized, `to_dict` serialises in canonical order, and `from_dict` restores from saved data accepting only known actions. The settings schema persists this map through these two methods, and the free function `action_for_key` is the shared lookup used across the viewport, inventory, and hotbar input paths.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/preferences/keybinds.py',
            code: `def key_for_action(self, action: str) -> int | None:
  return self._keys_by_action.get(str(action).strip())

def action_for_key_code(self, key: int) -> str | None:
  try:
    normalized_key = int(key)
  except Exception:
    return None
  return self._action_by_key.get(int(normalized_key))`,
          },
        ],
      },
      {
        id: 'keybind-resolution-two-paths',
        title: 'Continuous Movement and Discrete Dispatch',
        content: [
          {
            kind: 'paragraph',
            text: 'Continuous and discrete inputs use different mechanisms. The `QtInputAdapter` in `src/ludoxel/presentation/interface/input/qt.py` keeps a set of pressed key codes, refreshes its action-to-key cache on `set_keybinds`, and on `consume` reads the movement, jump, sprint, and crouch actions from the pressed set into an `InputFrame`. Jump is edge-detected: a key press sets a one-shot flag that the next `consume` clears, distinguishing a tapped jump from a held one.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/input/qt.py',
            code: `if self._action_pressed(ACTION_MOVE_FORWARD):
  f += 1.0
if self._action_pressed(ACTION_MOVE_BACKWARD):
  f -= 1.0
if self._action_pressed(ACTION_MOVE_RIGHT):
  s += 1.0
if self._action_pressed(ACTION_MOVE_LEFT):
  s -= 1.0

crouch = self._action_pressed(ACTION_CROUCH)
sprint = self._action_pressed(ACTION_SPRINT)

jump_held = self._action_pressed(ACTION_JUMP)
jump_pressed = bool(self._jump_pressed_edge)`,
          },
          {
            kind: 'paragraph',
            text: 'Discrete actions such as opening the inventory, selecting a hotbar slot, or toggling a HUD do not flow through the pressed set; they are resolved on the key event in `src/ludoxel/presentation/interface/viewport/controllers/interaction.py` through `action_for_key` and dispatched once. `ViewportInput.consume` applies the inversion preferences to the mouse delta before the frame reaches the session step.',
          },
        ],
      },
      {
        id: 'keybind-resolution-platform',
        title: 'The Cursor and Keyboard Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'Binding resolution is separate from capture. `ViewportInput` in `src/ludoxel/presentation/interface/input/game_input.py` owns mouse capture, cursor warping, relative-delta polling, and the override-cursor synchronisation. On macOS it installs the keyboard event tap `MacosGameplayInputGuard` in `src/ludoxel/presentation/interface/input/macos_guard.py`, a Core Graphics tap that intercepts hardware key events and re-dispatches them to the native key handler while capture is active, swallowing the operating-system event. On other platforms that guard is absent and Qt key events flow directly through the adapter.',
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Mouse capture and the keyboard guard are distinct: the macOS cursor capture lives in the cursor helpers, while the keyboard event tap lives in the gameplay input guard, which requires Input Monitoring or Accessibility permission and is unavailable without it. Binding resolution depends on neither, and neither changes which action a key maps to.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Changing Keybind Preferences', 'Using Mouse Capture', 'Understanding Overlay Input Blocking'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Preferences and Input Boundaries',
    title: 'Understanding Overlay Input Blocking',
    description:
      'Documents the overlay state machine and the input gate: every overlay transition and its capture handling, the resume path, the transient-modal counter, the loop predicates that freeze stepping, the precise inventory exception, and the visibility and audio predicates that read the same flags.',
    sections: [
      {
        id: 'overlay-input-blocking-state-machine',
        title: 'The Overlay State Machine',
        content: [
          {
            kind: 'paragraph',
            text: '`ViewportOverlays` in `src/ludoxel/presentation/interface/viewport/overlays/state.py` owns the blocking flags and their transitions. It holds independent flags for paused, dead, inventory-open, settings-open, and Othello-settings-open, with the two settings flags remembering whether to return to the pause menu on close. `set_paused`, `set_dead`, `set_settings_open`, `set_othello_settings_open`, and `set_inventory_open` enforce mutual exclusion: opening the pause menu clears the settings flags and closes the inventory, the death overlay clears pause and settings, and the inventory cannot open while a modal is already up. `any_modal_open` reports whether any of these except a plain inventory is active.',
          },
          {
            kind: 'paragraph',
            text: 'Every transition calls `self._inp.reset` to clear the pressed-key set, and the modal transitions release mouse capture. `_resume_gameplay` and its deferred form re-acquire capture, restart the runner, and re-raise the gameplay HUD only when no overlay remains. The state machine is the single owner of which overlay is active and what happens to input when it becomes active.',
          },
        ],
      },
      {
        id: 'overlay-input-blocking-gate',
        title: 'The Stepping Gate',
        content: [
          {
            kind: 'paragraph',
            text: 'The simulation is gated in `src/ludoxel/presentation/interface/viewport/render_loop/loop.py`. Both `_tick_sim`, which drives the runner, and `_on_step`, the step callback, early-return under the same conditions, so neither the accumulator nor the domain advance proceeds while an overlay holds.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/viewport/render_loop/loop.py',
            code: `if (
  bool(self.loading_active())
  or bool(getattr(self, "_ai_settings_overlay_open", False))
  or bool(self._transient_modal_active())
  or (self._overlays.dead() or self._overlays.paused() or self._overlays.settings_open() or self._overlays.othello_settings_open())
):
  return`,
          },
          {
            kind: 'paragraph',
            text: 'When the predicate holds the runner is not updated and no step runs, so gravity, movement, AI actors, and the simulation clock are frozen. The pause overlay, the death overlay, the settings overlay, the Othello settings overlay, the AI settings dialog flag, a transient modal counted by `_begin_transient_modal` and `_end_transient_modal`, and the loading state each independently halt stepping.',
          },
        ],
      },
      {
        id: 'overlay-input-blocking-inventory',
        title: 'The Inventory Exception',
        content: [
          {
            kind: 'paragraph',
            text: 'The inventory overlay is deliberately absent from the stepping gate. `set_inventory_open` releases mouse capture and resets the input adapter, so the player issues no movement and no look, but `inventory_open` is not one of the gate conditions. Simulation therefore continues: gravity, falling blocks, and AI actors keep advancing while the inventory is open, with the player held still by the neutralized input rather than by a frozen clock.',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              'Pause, death, settings, Othello settings, the AI settings flag, a transient modal, and loading freeze the simulation: the runner is not updated and no step runs.',
              'The inventory overlay continues the simulation but neutralizes input by releasing capture and clearing the pressed-key set.',
              'Every modal transition resets input; modal transitions release capture, and resuming gameplay re-acquires capture and restarts the runner.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content:
                'Do not infer that opening any overlay stops the world. Only the overlays named in the stepping gate freeze simulation; the inventory overlay leaves gravity and AI running while it removes input.',
            },
          },
        ],
      },
      {
        id: 'overlay-input-blocking-surfaces',
        title: 'Overlay State, Visibility, and Audio',
        content: [
          {
            kind: 'paragraph',
            text: 'The same predicates drive drawing and audio. `_gameplay_hud_active`, `_sync_gameplay_hud_visibility`, and the related helpers in `src/ludoxel/presentation/interface/viewport/overlays/state.py` hide the hotbar, crosshair, route overlay, and player and AI name tags when an overlay is active, and `_set_paused_overlay` and its siblings pause cloud motion. `_ambient_audio_active` follows a related but distinct predicate that keeps ambient audio running while only the HUD is hidden, so hiding the HUD alone does not stop the simulation or the ambient source. The navigation between overlays is wired in `src/ludoxel/presentation/interface/viewport/controllers/overlay_navigation.py`, whose `open_pause_menu`, `resume_from_overlay`, `switch_play_space`, `open_settings_from_pause`, `back_from_settings`, `on_inventory_closed`, and `save_and_quit` drive the state machine and synchronise the surfaces.',
          },
        ],
      },
    ],
    relatedTitles: ['Using the Inventory Overlay', 'Recovering after Death', 'Understanding Keybind Resolution'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding OpenGL Rendering',
    description:
      'Documents the Windows OpenGL backend end to end: the OpenGL 4.3 core requirement, resource and pass construction, the compute-backed and CPU chunk payload paths, the ordered frame pipeline and every pass, runtime-state application, and the offscreen preview path.',
    sections: [
      {
        id: 'opengl-rendering-context',
        title: 'Context Requirement and Construction',
        content: [
          {
            kind: 'paragraph',
            text: '`RendererBackend` in `src/ludoxel/presentation/rendering/backends/opengl/runtime/backend.py` requires an OpenGL 4.3 Core Profile context. `_require_gl43_core_context` raises with the context details unless the version, the core profile, and the GLSL version are sufficient, because the chunk face payload is built by a compute shader that needs that floor. `initialize` probes the context, loads shader programs, the texture atlas, and the skin texture into `GLResources`, builds a `BlockVisualResolver`, initializes each pass with its program and resources, assembles the `FramePipeline`, constructs the `TextureAnimationController`, and applies runtime state.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/backends/opengl/runtime/backend.py',
            code: `def _require_gl43_core_context(info: GLInfoSnapshot) -> None:
  if not info.is_version_at_least(4, 3):
    raise RuntimeError(f"The active context does not satisfy the OpenGL 4.3 requirement for the compute-backed chunk face payload path. {_format_context_details(info)}")

  if not info.is_core_profile():
    raise RuntimeError(f"The active context is not Core Profile, but the renderer requires OpenGL 4.3 Core Profile for the compute-backed chunk face payload path. {_format_context_details(info)}")

  if not info.is_glsl_at_least(4, 30):
    raise RuntimeError(f"The active GLSL version is insufficient for the compute-backed chunk face payload path. {_format_context_details(info)}")`,
          },
          {
            kind: 'paragraph',
            text: 'The pass objects are constructed once: a shadow-map pass, a world pass, falling-block and block-break-particle passes, a player-model pass, first-person arm and held-block and special-item passes, a sun pass, a cloud pass, an Othello pass, a selection pass, and the compute payload builder. `destroy` releases every pass, the resources, and the preview target. The backend owns resource lifetime and pass construction; the per-frame ordering is the pipeline.',
          },
        ],
      },
      {
        id: 'opengl-rendering-chunk-payload',
        title: 'Chunk Submission and the Compute Payload',
        content: [
          {
            kind: 'paragraph',
            text: '`submit_chunk` accepts either a CPU-built list of face buckets or a GPU face-source array with bucket counts. When the GPU path is supplied, `ChunkFacePayloadBuilder` runs the compute program to build and store the authoritative face buckets, and the same buckets feed both the world pass and the shadow pass; when only CPU faces are supplied, those become authoritative and the shadow faces default to them. `evict_chunks` removes chunks from the world pass, the shadow pass, and the payload builder together. This compute-backed path is specific to the OpenGL 4.3 backend.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/backends/opengl/runtime/backend.py',
            code: `if gpu_face_sources is not None and gpu_bucket_counts is not None:
  gpu_payload = self._gpu_payload_builder.build_and_store(chunk_key=chunk_key, world_revision=int(world_revision), face_sources=gpu_face_sources, bucket_counts=gpu_bucket_counts)
  authoritative_world_faces = gpu_payload.face_buckets
  authoritative_shadow_faces = authoritative_world_faces
  self._last_payload_validation = None`,
          },
        ],
      },
      {
        id: 'opengl-rendering-pass-order',
        title: 'The Ordered Frame Pipeline',
        content: [
          {
            kind: 'paragraph',
            text: '`FramePipeline.render` in `src/ludoxel/presentation/rendering/backends/opengl/pipelines/frame.py` executes the frame in a fixed order. It computes the camera chunk, the world and cloud fog ranges, and the effective shadow parameters, builds the light view-projection, renders the shadow map, builds the camera view and projection with a closer near plane in third person, clears, and draws the scene before composing the first-person view model.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Compute the camera chunk, world and cloud fog ranges, and effective shadow parameters; build the light view-projection from the sun direction and coverage radius.',
              'Render the shadow map from world geometry plus player and Othello casters.',
              'Build the camera view and projection; clear color and depth to the sky color.',
              'Draw the sun billboard, then enable the depth test.',
              'Draw the world pass with shadow, fog, and selection tint, then falling blocks and block-break particles.',
              'Draw each player model, then the Othello board and pieces.',
              'Draw clouds, then the selection outline.',
              'Clear the depth buffer and draw exactly one first-person view model: a special item, a held block, or the arm, at a reduced field of view.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The first-person view model clears depth before drawing so the hand or held block is never occluded by world geometry, and `_first_person_viewmodel_fov_deg` reduces a wide field of view to keep the model proportionate. The special item, held block, and arm are mutually exclusive, selected by the first-person render state. The pipeline returns frame metrics aggregated across the world, falling-block, particle, player, and Othello draws.',
          },
        ],
      },
      {
        id: 'opengl-rendering-runtime-and-preview',
        title: 'Runtime State and Offscreen Preview',
        content: [
          {
            kind: 'paragraph',
            text: '`apply_runtime_state` pushes the cloud flags, density, seed, flow, speed, and height variation into the cloud pass, the animation flag into the texture-animation controller, and the outline flag into the selection controller. `set_cloud_motion_paused` and `set_texture_animation_paused` freeze motion for overlays. `render_player_preview_frame` renders a single player pose into an offscreen framebuffer created by `_ensure_preview_target`, reads the pixels back as an image, and restores the prior framebuffer and viewport; the pause and AI-settings preview surfaces consume this path. The thin wrapper `Renderer` in `src/ludoxel/presentation/rendering/contracts/api.py` forwards every backend call and is where the backend is selected.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'This article documents the OpenGL backend only. Differences from the WGPU backend, including the clip-space convention, the chunk-mesh path, and camera roll, are stated in the WGPU rendering article where both implementations are compared.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding WGPU Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding WGPU Rendering',
    description:
      'Documents the WGPU backend end to end: device, surface, and resource construction, the clip-space conversion, the frame-uniform layout, the CPU per-face instance path and wireframe emulation, the shared fog, shadow, light-space, and selection contracts, the full pass order, and the confirmed differences from OpenGL.',
    sections: [
      {
        id: 'wgpu-rendering-device',
        title: 'Device, Surface, and Resources',
        content: [
          {
            kind: 'paragraph',
            text: '`WgpuRendererBackend` in `src/ludoxel/presentation/rendering/backends/wgpu/runtime/backend.py` requests a high-performance WebGPU adapter and device through wgpu-native, configures the canvas surface, and builds its pipelines from GLSL 450 sources. `initialize` creates the camera bind-group layout and one uniform buffer per face, builds the texture atlas and its bind group, the shadow bind-group layout, the player skin and special-item textures, and the world, shadowed, wireframe, sun, cloud, Othello, shadow-depth, transform-shadow, textured-face, and selection pipelines, all held in `WgpuRendererResources`. The color target uses a `depth24plus` depth texture and the shadow target uses a `depth32float` texture with a comparison sampler.',
          },
          {
            kind: 'paragraph',
            text: 'WGPU clip space runs depth from zero to one rather than minus one to one, so `_opengl_clip_to_wgpu` corrects every view-projection matrix before upload. `_frame_uniform_bytes` packs the view-projection and light view-projection, the sun direction, the selection tint and mode and block, the fog parameters, and the shadow texel, darkness, bias, and PCF radius into a fixed-width uniform consumed by the shaders.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/backends/wgpu/runtime/backend.py',
            code: `_OPENGL_TO_WGPU_CLIP = np.asarray(((1.0, 0.0, 0.0, 0.0), (0.0, 1.0, 0.0, 0.0), (0.0, 0.0, 0.5, 0.5), (0.0, 0.0, 0.0, 1.0)), dtype=np.float32)

def _opengl_clip_to_wgpu(view_proj: np.ndarray) -> np.ndarray:
  return (_OPENGL_TO_WGPU_CLIP @ np.asarray(view_proj, dtype=np.float32)).astype(np.float32)`,
          },
        ],
      },
      {
        id: 'wgpu-rendering-mesh-path',
        title: 'The CPU Face-Instance Path',
        content: [
          {
            kind: 'paragraph',
            text: 'The WGPU backend does not use the compute payload builder. Its `submit_chunk` discards the GPU face sources and shadow faces and uploads CPU-built face rows through `upload_chunk_mesh` into a `WgpuChunkMesh`. Transient geometry such as falling blocks, particles, player skins, held blocks, and Othello pieces is built into per-face instance rows each frame by the row builders and uploaded into temporary vertex buffers, drawn with per-face camera bind groups. `set_selection_target` builds the outline vertices inline and `_refresh_selection_buffer` uploads them. This per-face CPU instancing is the structural difference from the OpenGL backend, which builds chunk payloads on the GPU.',
          },
          {
            kind: 'paragraph',
            text: 'World wireframe is emulated rather than rasterized as lines by the driver. `_front_facing_world_rows` and `_front_facing_cloud_rows` filter front-facing rows on the CPU so the WGPU line list matches the edges the OpenGL back-face culling and polygon line mode would produce.',
          },
        ],
      },
      {
        id: 'wgpu-rendering-shared',
        title: 'Shared Contracts and Pass Order',
        content: [
          {
            kind: 'paragraph',
            text: 'The WGPU backend imports the same render-contract helpers as the OpenGL backend: `render_distance_fog_range`, `cloud_fog_range`, `effective_backend_shadow_params`, `max_unfogged_render_distance_radius_blocks`, the `GeometryDistanceFog` and `CloudDistanceFog` types, `compute_light_view_proj`, the `SelectionOutlineBuilder`, the `BlockVisualResolver`, and the `CloudField`. Fog math, shadow coverage, light-space construction, and selection-outline geometry are therefore shared between backends. The frame is drawn in the same sequence as the OpenGL pipeline.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Render the shadow depth pass from chunk meshes, player transform casters, and Othello pieces.',
              'Begin the main pass clearing to the fog color; draw the sun.',
              'Draw the world, shadowed or plain, or the emulated wireframe.',
              'Draw falling blocks, block-break particles, player skins, and held blocks.',
              'Draw the Othello board, pieces, and highlight overlay; then clouds; then the selection lines.',
              'Begin a separate first-person pass with depth cleared and draw the special item, held block, or arm.',
            ],
          },
        ],
      },
      {
        id: 'wgpu-rendering-differences',
        title: 'Confirmed Differences from OpenGL',
        content: [
          {
            kind: 'paragraph',
            text: 'Three differences are visible in the confirmed source. The WGPU render method discards the camera roll argument, so the camera-shake roll the OpenGL pipeline applies is not applied to the WGPU main view. The chunk-geometry path differs: WGPU uploads CPU face rows while OpenGL builds payloads with a compute shader. The shadow depth format differs, with WGPU using `depth32float` and OpenGL a 24-bit depth texture.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'Fog factors, shadow coverage, light-space construction, and selection-outline geometry are shared modules and are equivalent across backends by construction. Camera roll, the chunk-geometry path, and the shadow depth format are confirmed to differ. No claim of pixel-level parity is made for areas not backed by shared source.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding Render Distance Fog and Shadows',
    description:
      'Documents the distance and shadow mathematics: the render-distance radius and the geometry and cloud fog ranges, the disabled-fog sentinels, the shared fog shader, the shadow quality presets and their decoupling from render distance, and the texel-snapped light-space orthographic.',
    sections: [
      {
        id: 'fog-shadows-fog-range',
        title: 'Render Distance and the Fog Ranges',
        content: [
          {
            kind: 'paragraph',
            text: 'Render distance is configured in chunks and converted to a horizontal block radius by `render_distance_radius_blocks` in `src/ludoxel/presentation/rendering/contracts/config.py`. `render_distance_fog_range` derives the geometry fog from that radius and the camera far plane: the end distance is the smaller of the radius and the far plane, and the start distance is a fixed fraction of the end, so fully fogged geometry is reached before the hard far-plane clip. `cloud_fog_range` derives a separate cloud range whose end is the radius scaled by 1.5, raised to a minimum visible radius so a narrow render distance does not empty the sky, then capped at the far plane.',
          },
          {
            kind: 'math',
            math: {
              expression: 'e_{\\text{geom}} = \\min\\bigl(\\mathrm{rd}\\cdot\\mathrm{CHUNK},\\ z_{\\mathrm{far}}\\bigr), \\qquad s = 0.85\\,e',
              displayMode: true,
              caption: 'render_distance_fog_range; the cloud end raises the radius by 1.5 and a minimum visible radius before the same start fraction.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The two fog inputs are distinct types. `GeometryDistanceFog` carries the camera position and is faded by three-dimensional distance, so the world responds to vertical camera motion as well as horizontal; `CloudDistanceFog` carries only the horizontal camera coordinates and is faded by horizontal distance, so high clouds do not vanish purely because the camera changes altitude. Each type exposes a `disabled` sentinel whose end is at or below its start, which the shaders read as no fade; the first-person view model receives the disabled geometry fog.',
          },
        ],
      },
      {
        id: 'fog-shadows-fog-shader',
        title: 'The Shared Fog Shader',
        content: [
          {
            kind: 'paragraph',
            text: 'Both backends consume the same fog factor, defined identically in `src/ludoxel/presentation/rendering/backends/opengl/shaders/common/distance_fog.glsl` and `src/ludoxel/presentation/rendering/backends/wgpu/shaders/sources/common/distance_fog.glsl`. `ldx_geometry_fog_factor` measures three-dimensional distance, `ldx_cloud_fog_factor` measures horizontal distance, and `ldx_apply_geometry_distance_fog` mixes toward the fog color by the factor. A range with end at or below start returns zero, disabling the fade.',
          },
          {
            kind: 'code',
            language: 'glsl',
            caption: 'distance_fog.glsl (identical in both backends)',
            code: `float ldx_geometry_fog_factor(vec3 worldPos, vec3 camPos, float fogStart, float fogEnd) {
    if (fogEnd <= fogStart) {
        return 0.0;
    }
    float d = length(worldPos - camPos);
    return clamp((d - fogStart) / max(fogEnd - fogStart, 1e-3), 0.0, 1.0);
}`,
          },
          {
            kind: 'math',
            math: {
              expression: 'f = \\mathrm{clamp}\\!\\left(\\frac{d - s}{\\max(e - s,\\ 10^{-3})},\\ 0,\\ 1\\right)',
              displayMode: true,
              caption: 'The shared fog factor; geometry uses the 3D distance d, the cloud variant uses the horizontal distance.',
            },
          },
        ],
      },
      {
        id: 'fog-shadows-quality',
        title: 'Shadow Quality Decoupled from Render Distance',
        content: [
          {
            kind: 'paragraph',
            text: 'Shadow quality is a discrete level from one to five. `ShadowQualityPreset` maps each level to a shadow-map size, a light-space coverage radius, and a PCF radius; `resolve_shadow_quality_preset` normalizes an arbitrary level to a valid preset, collapsing a missing or out-of-range value to the standard level. `effective_backend_shadow_params` substitutes the preset size, coverage, and PCF radius while keeping bias, slope bias, polygon offset, darkness, and stabilization from the base parameters. The coverage radius is a shadow-specific policy, not a function of render distance, so changing render distance does not degrade the texel density of a given quality level.',
          },
          {
            kind: 'math',
            math: {
              expression: '\\text{texel}_{\\mathrm{world}} \\approx \\frac{2\\,r}{\\text{size}}',
              displayMode: true,
              caption: 'Effective world-space shadow texel size; as quality rises, size grows faster than coverage radius r, so the texel shrinks.',
            },
          },
          {
            kind: 'paragraph',
            text: '`BackendRendererRuntimeState.set_shadow_quality` in `src/ludoxel/presentation/rendering/contracts/state.py` normalizes the stored level so a malformed value converges to standard, independent of render distance. To keep shadows present across the visible scene regardless of quality, the pipeline raises the coverage radius to at least the unfogged radius at maximum render distance, computed by `max_unfogged_render_distance_radius_blocks`, so casters within the fully visible range cast into the light box while texel density remains governed by quality alone.',
          },
        ],
      },
      {
        id: 'fog-shadows-light-space',
        title: 'The Stabilized Light Space',
        content: [
          {
            kind: 'paragraph',
            text: '`compute_light_view_proj` in `src/ludoxel/presentation/rendering/visuals/worlds/light_space.py` builds a light-space orthographic projection centered on the camera. `_coverage_scaled_sun_extents` scales the orthographic radius, light distance, and far plane to the coverage radius while keeping the near plane, so the light box always contains the coverage sphere. When stabilization is enabled the center is snapped to the shadow texel grid so the shadow does not crawl as the camera moves: the texel size is two times the radius divided by the shadow size, and the center coordinates in light space are rounded to that quantum. The shadow-map pass in `src/ludoxel/presentation/rendering/backends/opengl/passes/shadow_map.py` recreates the depth texture only when the requested size changes through `ensure_size`, and skips rendering when no instances and no extra casters exist.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/visuals/worlds/light_space.py',
            code: `s = float(max(1, int(shadow_size)))
texel = (2.0 * r) / s

cx = right.dot(center)
cy = up.dot(center)
cz = light_axis.dot(center)

sx = _snap(float(cx), float(texel))
sy = _snap(float(cy), float(texel))`,
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'This article covers fog ranges, the shared fog factor, shadow quality presets, and light-space construction. It does not extend to cloud-field generation or chunk culling, which are owned by other world-visual modules.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Changing Shadow Preferences', 'Changing Cloud Preferences', 'Understanding OpenGL Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding Selection Outlines',
    description:
      'Documents the selection pipeline: ray-cast picking through voxel traversal and per-shape AABBs, the placement-cell derivation and fence and wall special case, the shape-aware outline built from block-model render boxes on a sixteenth-voxel lattice, and the line pass and neighbour-signature caching shared by both backends.',
    sections: [
      {
        id: 'selection-outlines-picking',
        title: 'Picking by Ray and Voxel Traversal',
        content: [
          {
            kind: 'paragraph',
            text: '`pick_block` in `src/ludoxel/simulation/rules/picking/block.py` finds the selected cell. A ray is built from the eye offset by a small epsilon, and `dda_grid_traverse` in `src/ludoxel/foundations/mathematics/voxels/dda.py` walks the voxel grid one cell at a time up to the reach. For each occupied cell the picker fetches the shape AABBs through `pick_aabbs_for_block` and tests the ray against each with `ray_aabb_face` from `src/ludoxel/foundations/mathematics/geometry/ray_aabb.py`, keeping the nearest entry parameter and the struck face.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/rules/picking/block.py',
            code: `for h in dda_grid_traverse(origin=o, direction=d, t_max=r, cell_size=1.0):
  cx, cy, cz = int(h.cell_x), int(h.cell_y), int(h.cell_z)
  k = (cx, cy, cz)
  st = world.blocks.get(k)
  if st is None:
    prev_cell = k
    continue

  aabbs = pick_aabbs_for_block(str(st), get_state, get_def, x=int(cx), y=int(cy), z=int(cz))
  if not aabbs:
    prev_cell = k
    continue

  best_t: float | None = None
  best_face: int = -1
  best_point: Vec3 | None = None`,
          },
          {
            kind: 'paragraph',
            text: 'The result `BlockPick` carries the hit cell, the placement cell derived from the face neighbour offset, the entry parameter, the face, and the hit point; the placement cell is cleared when it is already occupied. Because the AABBs come from the block shape rather than a unit cube, picking respects slabs, stairs, fences, and walls; for a fence or wall a downward ray that strikes near the top is reassigned to the top face so placement lands on the post.',
          },
        ],
      },
      {
        id: 'selection-outlines-builder',
        title: 'Shape-Aware Outline Construction',
        content: [
          {
            kind: 'paragraph',
            text: '`SelectionOutlineBuilder` in `src/ludoxel/presentation/rendering/visuals/selections/outline.py` maps one block-state realization to world-space line segments. The geometry source is the block-model render-box decomposition through `_outline_boxes`, the same boxes the renderer uses for faces, so the outline matches the visible shape of slabs, stairs, fences, fence gates, and walls. For each box, `build` iterates the six faces, skips faces occluded by sibling boxes or by neighbouring blocks, computes the face plane and its two intervals with `_plane_rect_for_face`, projects the face onto a sixteenth-voxel lattice, and marks the occupied lattice cells.',
          },
          {
            kind: 'math',
            math: {
              expression: 'Q_{16}(v) = \\operatorname{round}(16\\,v), \\qquad Q(v) = \\operatorname{round}(v / 10^{-6})',
              displayMode: true,
              caption: 'The face lattice quantum used to mark occupied cells, and the edge-key quantum used to de-duplicate segments.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The builder then emits a line segment for every lattice-cell edge whose neighbour is not occupied, producing the boundary of the lit region. `_segment_points` converts each edge to world space and lifts it along the face normal by a small epsilon to avoid z-fighting, and `_edge_key` and `_quant` de-duplicate segments by a symmetric quantized key so the same edge is never emitted twice. The result is an array of segment endpoints.',
          },
        ],
      },
      {
        id: 'selection-outlines-pass',
        title: 'The Line Pass and Both Backends',
        content: [
          {
            kind: 'paragraph',
            text: 'The OpenGL backend wraps the builder in a `SelectionController` and draws the result through the selection pass in `src/ludoxel/presentation/rendering/backends/opengl/passes/selection.py`; the WGPU backend builds the same line vertices in `set_selection_target` and draws them with its selection pipeline. Both backends key the selection on the picked cell, its state, and a six-neighbour state signature, so the outline is rebuilt only when the picked block or its surroundings change rather than every frame. The render loop refreshes the selection on a cadence in `_refresh_selection_for_frame`, clearing it when nothing is targeted.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'The outline is the silhouette of the block-model render boxes for the picked cell, not a wireframe of a unit cube. The same builder is shared by both backends, so the outline geometry is equivalent across them; only the line-drawing pass that consumes it differs.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Block Shapes', 'Reading Placement Rejection', 'Understanding WGPU Rendering'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding the Player Model Pose',
    description:
      'Documents how the third-person player and AI bodies are posed: the shared pose builder and its shadow rows consumed by both backends, the visual-side mapping that does not match the variable names, the delayed body yaw with a bounded head separation, the shoulder-pivoted idle arm sway, and the forward attack swing that keeps the arm and held item clear of the torso.',
    sections: [
      {
        id: 'player-model-pose-shared-builder',
        title: 'One Pose Builder Feeds Both Backends',
        content: [
          {
            kind: 'paragraph',
            text: '`build_player_model_pose` in `src/ludoxel/presentation/rendering/visuals/players/model_pose.py` turns one `PlayerRenderState` into a frozen `PlayerModelPose`. The pose holds the skin face rows, an optional `HeldBlockPose`, the special-item face rows and icon, the hurt-tint strength, a resolved skin key, and the `shadow_rows` instance matrices. The builder is wrapped in an `lru_cache` keyed on the render state, so two actors in the same pose share one computation and a standing actor is recomputed only when its key changes. The OpenGL frame pipeline in `src/ludoxel/presentation/rendering/backends/opengl/pipelines/frame.py` and the WGPU backend in `src/ludoxel/presentation/rendering/backends/wgpu/runtime/backend.py` both call this same function, so a change to the row contract reaches both renderers at once rather than in one backend alone.',
          },
          {
            kind: 'paragraph',
            text: 'A first-person render state returns empty skin and held-item face rows but still builds the full `shadow_rows`, because the local player casts a ground shadow even when the body model itself is hidden behind the camera. The shadow rows are assembled from the same head, body, arm, and leg matrices that produce the visible skin, and the held block and special item append their own cube rows from the hand transform. Because the visible pose and the shadow share those matrices, a corrected arm or held-item pose moves the body and its shadow together rather than letting them diverge.',
          },
        ],
      },
      {
        id: 'player-model-pose-visual-sides',
        title: 'Visual Sides Are Not the Variable Names',
        content: [
          {
            kind: 'paragraph',
            text: 'The pose builder names one arm group `right_arm_parent` and the other `left_arm_parent`, but those names describe the model-local position, not the visible side of the body. The group named `right_arm_parent` sits on the model `-X` side and is textured with `VISUAL_LEFT_ARM_BASE_UV_PX`, so it is the visible left arm, the off hand. The group named `left_arm_parent` sits on the model `+X` side, is textured with `VISUAL_RIGHT_ARM_BASE_UV_PX`, and is the visible right arm, the main hand. The held block and special item anchor to that same `+X` group through `THIRD_PERSON_RIGHT_HAND_ANCHOR`, so the held item is carried in the visible right hand.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/visuals/players/model_pose.py',
            code: `for model, uv_map in (
  (head, _HEAD_BASE_UV_PX),
  (body, _BODY_BASE_UV_PX),
  (right_arm, VISUAL_LEFT_ARM_BASE_UV_PX),
  (left_arm, VISUAL_RIGHT_ARM_BASE_UV_PX),
  (right_leg, _RIGHT_LEG_BASE_UV_PX),
  (left_leg, _LEFT_LEG_BASE_UV_PX),
):
  _append_unit_cube_rows(skin_buffers, model, uv_map)`,
          },
          {
            kind: 'paragraph',
            text: 'The mapping is consequential for any change to arm motion. The fingertip of the visible right arm moves outward by a positive roll about its model `+X` shoulder, while the fingertip of the visible left arm moves outward by a negative roll about its `-X` shoulder, so the two arms take mirrored roll and pitch signs to sway away from the body symmetrically. Reasoning from the variable name alone would invert which hand swings, which side an idle sway pushes toward, and which arm carries the held item.',
          },
        ],
      },
      {
        id: 'player-model-pose-body-yaw',
        title: 'The Body Yaw Follows the Look With a Delay',
        content: [
          {
            kind: 'paragraph',
            text: '`PlayerMotionState` in `src/ludoxel/simulation/actors/player/kinematics.py` carries a runtime-only `body_visual_yaw_deg` and a `visual_time_s` clock. Neither is persisted; both are reset with the rest of the motion state on respawn. During each fixed step, after the look yaw is applied to the player, `_update_player_visual_animation` advances the visual clock and eases the visual body yaw toward the immediate look yaw with a frame-rate-independent factor. The AI manager advances its actors through the same `advance_runtime_player`, so every body, player and actor alike, receives the same delayed turn.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/player/kinematics.py',
            code: `diff = float(math.remainder(target - float(current), 360.0))
tau = float(PLAYER_BODY_YAW_FOLLOW_TAU_S)
alpha = 1.0 - math.exp(-float(step) / tau) if tau > 1e-6 else 1.0
next_yaw = float(current) + float(diff) * float(alpha)

remaining = float(math.remainder(target - float(next_yaw), 360.0))
max_sep = float(PLAYER_HEAD_BODY_YAW_MAX_DEG)
if remaining > max_sep:
  next_yaw = float(target) - float(max_sep)
elif remaining < -max_sep:
  next_yaw = float(target) + float(max_sep)`,
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\alpha = 1 - e^{-\\Delta t / \\tau}, \\qquad \\psi_{b} \\leftarrow \\psi_{b} + \\alpha \\cdot \\operatorname{rem}\\!\\left(\\psi_{\\ell} - \\psi_{b},\\ 360^{\\circ}\\right)',
              displayMode: true,
              caption: 'The visual body yaw ψ_b eases toward the look yaw ψ_ℓ with time constant τ; the signed remainder takes the shortest path so a turn past ±180° never spins the long way around.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The signed remainder is what fixes wrap-around: turning from `179°` to `-179°` is a two-degree move, not a three-hundred-fifty-eight-degree spin. After easing, the body yaw is forced to stay within `PLAYER_HEAD_BODY_YAW_MAX_DEG` of the look yaw, so a fast flick snaps the body just enough to keep the head ahead by at most that bound and then lets the body settle. `build_player_model_snapshot` reads the eased value as the absolute `body_yaw_deg` and the clamped signed remainder as the relative `head_yaw_deg`; the pose builder applies the body yaw at the model root and the head yaw at the head group, so the head total equals the look yaw while the body trails it. The look yaw the player entity holds is unchanged, so camera placement, picking, placement, and collision keep responding to the turn without any delay.',
          },
        ],
      },
      {
        id: 'player-model-pose-idle-sway',
        title: 'Idle Sway Pivots at the Shoulder',
        content: [
          {
            kind: 'paragraph',
            text: 'When the player is standing still, the walk swing is zero and there is no attack, so the arms would otherwise hang motionless. The pose builder adds a small idle sway driven by `idle_anim_time_s` so the lower arms drift gently. The sway is applied as a rotation about the shoulder, not as a translation of the arm group, so the shoulder stays fixed to the torso and only the fingertip side moves. The roll term carries a constant outward bias so each hand rests slightly away from the body and never crosses inward, and the two arms take mirrored signs so the visible right hand drifts toward `+X` and the visible left hand toward `-X`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/visuals/players/model_pose.py',
            code: `idle_weight = (1.0 - walk_fraction) * (1.0 - attack_weight)
idle_time = float(state.idle_anim_time_s)
idle_roll = (math.cos(idle_time * _IDLE_SWAY_ROLL_FREQ) * _IDLE_SWAY_ROLL_AMP + _IDLE_SWAY_ROLL_BIAS) * idle_weight
idle_pitch = math.sin(idle_time * _IDLE_SWAY_PITCH_FREQ) * _IDLE_SWAY_PITCH_AMP * idle_weight`,
          },
          {
            kind: 'math',
            math: {
              expression: 'w_{idle} = (1 - f_{walk})(1 - w_{atk}), \\qquad \\rho = \\bigl(A_{r}\\cos(\\omega_{r} t) + b_{r}\\bigr)\\,w_{idle}, \\qquad \\theta = A_{p}\\sin(\\omega_{p} t)\\,w_{idle}',
              displayMode: true,
              caption:
                'The idle roll ρ and pitch θ scale by the idle weight, which falls to zero as the walk fraction f_walk or the attack weight w_atk rises, so the idle sway never fights the walk cycle or a swing.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The idle weight is the product of the complementary walk fraction and the complementary attack weight, so the sway is at full strength only while standing and idle, and it fades smoothly to nothing as the player begins to walk or starts a swing. Because the idle clock advances every fixed step, the render state changes each step even when the player is otherwise static, which is what allows the cached pose to refresh and the idle motion to animate rather than freeze on one cached frame.',
          },
        ],
      },
      {
        id: 'player-model-pose-swing',
        title: 'The Attack Swing Clears the Torso',
        content: [
          {
            kind: 'paragraph',
            text: 'The first-person swing progress is carried into the third-person body through the render state, but it is not applied to the body as the first-person camera-space arm motion. `_third_person_swing_arm_angles` converts the swing progress into a forward shoulder pitch and a small outward roll for the main-hand arm. The pitch raises the arm forward from the shoulder, and the roll is non-negative, so the hand is pushed outward rather than across the chest. There is no inward roll and no yaw, which is what previously drew the hand and held item through the torso.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/visuals/players/model_pose.py',
            code: `def _third_person_swing_arm_angles(swing_progress: float) -> tuple[float, float]:
  swing = clampf(float(swing_progress), 0.0, 1.0)
  if swing <= 1e-6:
    return (0.0, 0.0)

  eased = 1.0 - pow(1.0 - swing, 4.0)
  forward = math.sin(float(eased) * math.pi)
  pitch_x = -float(_THIRD_PERSON_SWING_FORWARD_RAD) * float(forward)
  roll_z = float(_THIRD_PERSON_SWING_OUTWARD_RAD) * math.sin(float(swing) * math.pi)
  return (float(pitch_x), float(roll_z))`,
          },
          {
            kind: 'math',
            math: {
              expression: 's_e = 1 - (1 - s)^4, \\qquad \\theta_{x} = -\\,\\Phi\\,\\sin(\\pi s_e) \\le 0, \\qquad \\rho_{z} = R\\,\\sin(\\pi s) \\ge 0',
              displayMode: true,
              caption:
                'The eased swing s_e drives a forward pitch θ_x that is always toward the front, while the roll ρ_z stays outward, so the arm leaves the shoulder forward and to the side rather than turning into the body.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The forward pitch rotates the arm in the plane that holds its model `X`, so the hand stays on the outward side of the torso through the whole swing, and the held block or special item, anchored to that hand, swings forward with it instead of sweeping across the chest in the front view or out through the back in the rear view. Because the held-item parent transform and the shadow rows are built from the same arm matrices, the visible swing, the held item, and the ground shadow all follow one motion. The attack weight, derived separately from the swing progress, damps the walk swing and idle sway on the main hand during the strike so the forward pitch dominates while the swing is active.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Render Snapshots', 'Understanding OpenGL Rendering', 'Understanding WGPU Rendering', 'Understanding Selection Outlines', 'Looking Around'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Audio Feedback',
    title: 'Understanding Material Sounds',
    description:
      'Documents material-driven audio in full: the sound groups and fallback chain, the block, surface, and player event catalogs, the audio sample pool, the manager routing for break, place, interact, footstep, landing, and damage events, the playback admission with polyphony and cooldown, and the volume categories.',
    sections: [
      {
        id: 'material-sounds-groups',
        title: 'Sound Groups and the Fallback Chain',
        content: [
          {
            kind: 'paragraph',
            text: 'Each block definition names a sound group, defined in `src/ludoxel/simulation/blocks/sounds/groups.py`. `AudioManager.sound_group_for_block_state` resolves a block state to its group through the block registry and caches the result. Groups form a fallback chain so a specialised material can borrow a general one: `iter_sound_group_candidates` walks the `SOUND_GROUP_FALLBACKS` map until it terminates, then appends the default stone group, and the playback path tries each candidate in order until a pool resolves.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/blocks/sounds/groups.py',
            code: `SOUND_GROUP_FALLBACKS: dict[str, str] = {
  SOUND_GROUP_CHERRY_WOOD: SOUND_GROUP_WOOD,
  SOUND_GROUP_BAMBOO_WOOD: SOUND_GROUP_WOOD,
  SOUND_GROUP_NETHER_WOOD: SOUND_GROUP_WOOD,
  SOUND_GROUP_DEEPSLATE_BRICKS: SOUND_GROUP_DEEPSLATE,
  SOUND_GROUP_TUFF: SOUND_GROUP_STONE,
  SOUND_GROUP_CALCITE: SOUND_GROUP_STONE,
  SOUND_GROUP_BASALT: SOUND_GROUP_STONE,
  SOUND_GROUP_GILDED_BLACKSTONE: SOUND_GROUP_STONE,
  SOUND_GROUP_LODESTONE: SOUND_GROUP_STONE,
  SOUND_GROUP_RESIN: SOUND_GROUP_STONE,
  SOUND_GROUP_NETHERITE: SOUND_GROUP_METAL,
  SOUND_GROUP_ROOTED_DIRT: SOUND_GROUP_DIRT,
  SOUND_GROUP_MUD: SOUND_GROUP_DIRT,
  SOUND_GROUP_NYLIUM: SOUND_GROUP_GRASS,
  SOUND_GROUP_SOUL_SAND: SOUND_GROUP_SAND,
  SOUND_GROUP_SOUL_SOIL: SOUND_GROUP_SAND,
  SOUND_GROUP_NETHERRACK: SOUND_GROUP_STONE,
  SOUND_GROUP_NETHER_BRICKS: SOUND_GROUP_STONE,
  SOUND_GROUP_NETHER_ORE: SOUND_GROUP_STONE,
  SOUND_GROUP_NETHER_GOLD_ORE: SOUND_GROUP_NETHER_ORE,
  SOUND_GROUP_ANCIENT_DEBRIS: SOUND_GROUP_STONE,
  SOUND_GROUP_CORAL_BLOCK: SOUND_GROUP_STONE,
}`,
          },
          {
            kind: 'paragraph',
            text: 'The catalogs in `src/ludoxel/presentation/audio/catalogs/material.py` map each group to its pools. `BLOCK_SOUND_CATALOG` carries break and place pools, with interactable wood groups also carrying open and close pools; `PLAYER_SURFACE_SOUND_CATALOG` maps each group to a footstep pool; and `PLAYER_EVENT_SOUND_CATALOG` in `src/ludoxel/presentation/audio/catalogs/player.py` holds the landing, damage, attack, and Othello events. `AudioManager._collect_named_pools` flattens every catalog into a keyed pool table at construction.',
          },
        ],
      },
      {
        id: 'material-sounds-pool',
        title: 'The Audio Sample Pool',
        content: [
          {
            kind: 'paragraph',
            text: '`AudioSamplePool` in `src/ludoxel/presentation/audio/types/events.py` is a frozen record naming its sample paths, an audio category, a selection mode, a spatial flag with a distance cutoff and size, a maximum polyphony, and a cooldown. `make_audio_pool` constructs one with a polyphony floor of one and a non-negative cooldown, and `indexed_paths` expands a numbered family such as the four place samples of a material. `prime_effects` pre-creates the effect slots for non-ambient pools so the first play is not delayed.',
          },
        ],
      },
      {
        id: 'material-sounds-events',
        title: 'Where Events Originate and Resolve',
        content: [
          {
            kind: 'paragraph',
            text: 'Material and player events are emitted during the simulation step and routed at the presentation layer. The step result carries footstep, landing, gravity-break, and damage signals; the render loop in `src/ludoxel/presentation/interface/viewport/render_loop/loop.py` calls `play_surface_event` for footsteps and landings, `play_interaction` for gravity-broken blocks, and `play_player_event` for damage hits. Block interactions and placements emit their own break, place, and interact events through `play_interaction`, which splits an interaction into open and close variants by reading the block open property from its state.',
          },
          {
            kind: 'paragraph',
            text: '`play_block_action` walks the group fallback candidates and plays the first resolved pool; `play_surface_event` routes a footstep to `_play_surface_step` and a landing to `_play_landing_event`. Landing severity is distance-graded: a fall of at least twelve blocks plays the big landing sample, at least six blocks plays the small landing sample, and a shorter landing falls back to an ordinary surface step.',
          },
        ],
      },
      {
        id: 'material-sounds-playback',
        title: 'Admission, Polyphony, and Volume',
        content: [
          {
            kind: 'paragraph',
            text: '`_play_pool` in `src/ludoxel/presentation/audio/playback/manager.py` gates a sound on four conditions in order: the resolved category volume must be audible, the pool cooldown must have elapsed through `_admit_pool_play`, a spatial pool must be within its distance cutoff of the cached listener pose, and a free effect slot must be available within the polyphony budget through the effect helpers in `src/ludoxel/presentation/audio/playback/effects.py` and the source helpers in `src/ludoxel/presentation/audio/playback/sources.py`.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/playback/manager.py',
            code: `base_volume = float(self._preferences.volume_for(pool.category))
if base_volume <= 1e-6:
  return False
if not self._admit_pool_play(pool_key=str(pool_key), pool=pool):
  return False
if bool(pool.spatial) and float(pool.distance_cutoff) > 1e-6:
  if not self._listener_within_cutoff(position=position, cutoff=float(pool.distance_cutoff)):
    return False`,
          },
          {
            kind: 'paragraph',
            text: 'Every sound belongs to one of the categories in `src/ludoxel/application/preferences/audio.py`: master, ambient, block, or player. `AudioPreferences.volume_for` returns the product of master and the category factor, each clamped to the unit interval. Block break, place, and interact sounds use the block category; footsteps, landings, and damage hits use the player category. The audio preference object is the boundary between the saved volume values and playback; the playback manager reads it and never alters simulation rules to make a sound.',
          },
          {
            kind: 'math',
            math: {
              expression: 'g_{\\text{cat}} = \\mathrm{master} \\times \\mathrm{factor}_{\\text{cat}}, \\quad 0 \\le \\mathrm{master},\\ \\mathrm{factor}_{\\text{cat}} \\le 1',
              displayMode: true,
              caption: 'AudioPreferences.volume_for; a category at zero, or master at zero, silences the pool before any slot is taken.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Supplying Logs Without Secrets'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Audio Feedback',
    title: 'Understanding Ambient Sounds',
    description:
      'Documents the ambient audio loop in full: the ambient catalog and its single play-space key, the preference and play-space gating, the dedicated looping-effect lifecycle and its transition guard, the round-robin source rotation, and the boundary that keeps ambient audio distinct from material sounds.',
    sections: [
      {
        id: 'ambient-sounds-catalog',
        title: 'The Ambient Catalog',
        content: [
          {
            kind: 'paragraph',
            text: 'Ambient audio is a small catalog in `src/ludoxel/presentation/audio/catalogs/ambient.py`. It defines a single key for the My World play space whose pool names four wind samples beneath the ambient asset directory, with round-robin selection, a non-spatial flag, and a maximum polyphony of one. Ambient audio is therefore a single looping voice, not a spatial event family.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/catalogs/ambient.py',
            code: `AMBIENT_SOUND_CATALOG: dict[str, AudioSamplePool] = {
  AMBIENT_KEY_MY_WORLD: make_audio_pool(
    "assets/audio/ambient/my_world/wind1.wav",
    "assets/audio/ambient/my_world/wind2.wav",
    "assets/audio/ambient/my_world/wind3.wav",
    "assets/audio/ambient/my_world/wind4.wav",
    category=AUDIO_CATEGORY_AMBIENT,
    selection_mode=SELECTION_ROUND_ROBIN,
    spatial=False,
    distance_cutoff=0.0,
    size=0.0,
    max_polyphony=1,
  )
}`,
          },
        ],
      },
      {
        id: 'ambient-sounds-gating',
        title: 'Selection and Gating',
        content: [
          {
            kind: 'paragraph',
            text: '`ambient_desired_key` in `src/ludoxel/presentation/audio/playback/ambient.py` decides the key: it returns the My World key only when ambient audio is enabled and the current play space is My World, and returns nothing otherwise. The viewport supplies the enabled flag and the current space through `AudioManager.set_ambient_active`, gating ambient audio on the same gameplay-audible predicate that governs whether the simulation is running, so the Othello space and the menu states have no ambient loop. The effective volume is the ambient category gain, the product of master and the ambient factor; when that gain is inaudible or the key is absent, the effect is stopped and its source cleared rather than played at zero volume.',
          },
        ],
      },
      {
        id: 'ambient-sounds-lifecycle',
        title: 'The Looping Effect Lifecycle',
        content: [
          {
            kind: 'paragraph',
            text: 'Ambient playback uses one dedicated effect, not the pooled slots material sounds use. `_sync_ambient_sound` ensures the effect exists, sets its volume, and either starts the next source when the key changes or restarts it when it has stopped. `_start_next_ambient_source` picks the next source through `_pick_existing_url`, swaps it onto the effect, and defers play until loaded through `_play_ambient_effect_when_ready`. A transitioning flag suppresses the restart that the stop during a deliberate source change would otherwise trigger, so switching sources does not loop incorrectly.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/playback/manager.py',
            code: `def _on_ambient_playing_changed(self) -> None:
  if self._ambient_effect is None:
    return
  if self._ambient_transitioning or self._ambient_pending_play:
    return
  if self._ambient_key is not None and not self._ambient_effect.isPlaying():
    self._start_next_ambient_source()`,
          },
          {
            kind: 'paragraph',
            text: 'Round-robin selection in `_pick_existing_url` advances through the four samples on each restart, so the loop varies across the wind tracks rather than repeating a single file. The effect is created once by `_ensure_ambient_effect` and reused; only its source is swapped. `set_preferences` re-applies the ambient volume to the effect and the category volume to every pooled slot.',
          },
        ],
      },
      {
        id: 'ambient-sounds-boundary',
        title: 'Distinct from Material Sounds',
        content: [
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'Ambient audio is a single looping voice in the ambient category, gated by the play space and the ambient preference. Material sounds are spatial, pooled, event-driven, and in the block or player category. They share the volume preference object but not the playback path, the effect lifecycle, or the gating predicate.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Changing Audio Preferences', 'Supplying Platform Evidence', 'Understanding Material Sounds'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'AI Decision Records',
    title: 'Understanding AI Action Selection',
    description:
      'Documents how AI actors choose actions: the manager per-tick step over every actor, the deterministic route, wander, and idle controls and their edge-safety guard, the asynchronous A-star route planner and its worker, regeneration and stuck recovery, and the narrow boundary in which a learned policy overrides movement.',
    sections: [
      {
        id: 'ai-action-selection-step',
        title: 'The Per-Tick Manager Step',
        content: [
          {
            kind: 'paragraph',
            text: '`AiPlayerManager.step` in `src/ludoxel/simulation/actors/ai_players/manager.py` advances every actor once per simulation quantum. It drains completed route plans from the worker, opens the learning tick, and for each non-paused actor advances the attack swing, decays the attack, place, interact, and combat-strafe cooldowns, and computes a control input from the actor mode. The control is fed to `advance_runtime_player`, after which fall and void damage are applied, `_advance_ai_regeneration` runs, stuck recovery is updated, and discrete interactions, placements, and attacks are issued. Dead actors are removed and their pending plans cancelled, and the step returns an `AiStepReport` summarising player damage, the death reason and killer, and damage sound positions.',
          },
          {
            kind: 'paragraph',
            text: 'The actor runtime is `_AiPlayerRuntime` in `src/ludoxel/simulation/actors/ai_players/runtime.py`, a mutable record of the player entity, mode and personality, route points and target, navigation plan and cursors, cooldowns, regeneration timers, combat phase, and the last learned action; `to_state` projects it back to the persisted `AiPlayerState`. The control input is the deterministic baseline; a learned policy, when it applies at all, only adjusts which action that control represents within wander mode.',
          },
        ],
      },
      {
        id: 'ai-action-selection-deterministic',
        title: 'Deterministic Route, Wander, and Idle',
        content: [
          {
            kind: 'paragraph',
            text: '`_route_control` chases a combat target when one is present, otherwise advances toward the active route point, choosing between pursuit, parkour, and turn-only controls and respecting flexible-route replanning. `_wander_control` issues periodic randomized headings updated by `_update_wander_state`, and `idle_control` issues no movement. Modes and their normalization live in `src/ludoxel/simulation/actors/ai_players/modes.py`, and the focused behaviours live in the navigation, parkour, combat, placement, recovery, stuck, avoidance, and route modules under `src/ludoxel/simulation/actors/ai_players/`; the manager composes them rather than embedding their logic.',
          },
          {
            kind: 'paragraph',
            text: 'The edge-safety guard prevents an actor from walking into the void. `_apply_edge_safety` passes through flying, airborne, or jumping steps, and otherwise checks `_forward_step_safe`, which probes the support column ahead and within a bounded drop; when no footing exists it returns `_halted_control`, which keeps the look rotation but removes movement and jump. Free roam and PvP use a shallow safe drop while route following allows a deeper drop with a clear path. The deterministic path is the authority that keeps an actor functioning even when no learned policy is selected.',
          },
        ],
      },
      {
        id: 'ai-action-selection-planner',
        title: 'The Asynchronous Route Planner',
        content: [
          {
            kind: 'paragraph',
            text: 'Long-range navigation is planned off the simulation thread. `compute_ai_route_plan` in `src/ludoxel/simulation/actors/ai_players/planner.py` runs an A-star search over support cells whose transitions, generated by `_neighbor_support_transitions`, include walking, stepping, jumping, dropping, parkour leaps, and block placement, each with a travel cost and a heuristic toward the target; `_world_xz_bounds` bounds the search to the populated map with padding. `AiRouteWorker` in `src/ludoxel/simulation/actors/ai_players/worker.py` dispatches the search to a spawn-context process pool, falling back to a thread pool, and `poll_ready` collects results.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/worker.py',
            code: `def request_plan(self, request: AiRoutePlanRequest) -> None:
  self.cancel_actor(str(request.actor_id))
  executor = self._ensure_process_executor()
  future: Future
  if executor is not None:
    try:
      future = executor.submit(compute_ai_route_plan, request)
    except Exception:
      self._process_unavailable = True
      future = self._ensure_thread_executor().submit(compute_ai_route_plan, request)
  else:
    future = self._ensure_thread_executor().submit(compute_ai_route_plan, request)
  self._pending[str(request.actor_id)] = _PendingRoutePlan(actor_id=str(request.actor_id), generation=int(request.generation), future=future)`,
          },
          {
            kind: 'paragraph',
            text: 'Each tick the actor follows the most recent completed plan; planning never blocks the step. `_mark_nav_failure` retries a failed plan with exponential backoff and, after enough retries, blacklists an unreachable route target for a cooldown so the actor turns rather than stalling indefinitely on an impossible goal.',
          },
        ],
      },
      {
        id: 'ai-action-selection-policy',
        title: 'The Learned-Policy Override Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'A learned policy may participate only under tight conditions. When learning is active, the actor mode is wander, and the coordinator reports the policy as enabled, the manager builds an observation, builds an action mask, asks the coordinator to decide, and applies the chosen action through `_apply_learned_action`, later executing any world action through `_execute_policy_action`; otherwise the action is derived from the deterministic control through `_control_to_action_id`. Route navigation is always deterministic and planner-driven.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/manager.py',
            code: `if mode == AI_MODE_WANDER and bool(learning.policy_enabled()):
  decision = learning.decide(learn_observation, learn_mask)
  learn_action_id = str(decision.action_id)
  learn_action_source = ACTION_SOURCE_LEARNED_POLICY
  control = self._apply_learned_action(actor, control, str(decision.action_id))
else:
  learn_action_id = self._control_to_action_id(control)
  learn_action_source = ACTION_SOURCE_DETERMINISTIC`,
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content: [
                'Learned-policy selection is confined to wander mode and only when a usable policy is active; the action mask still bounds any selection, so a policy reorders permitted actions without bypassing the safety rules described under ',
                {
                  kind: 'link',
                  label: 'policy evaluation',
                  href: '/docs/systems/feedback-and-intelligence/policy-and-search/understanding-policy-evaluation',
                },
                '.',
              ],
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding AI Learning Records', 'Understanding Policy Evaluation', 'Understanding AI Combat'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'AI Decision Records',
    title: 'Understanding AI Learning Records',
    description:
      'Documents how demonstration records are formed and consumed: record structure, observation feature encoding, reward transition, buffered recording, learning-mode activation, and the application-layer sink boundary that keeps file paths outside simulation.',
    sections: [
      {
        id: 'ai-learning-records-record',
        title: 'The Demonstration Record',
        content: [
          {
            kind: 'paragraph',
            text: '`DemonstrationRecord` in `src/ludoxel/simulation/actors/ai_players/learning/dataset.py` captures game state and action, not screen pixels. It is a frozen dataclass holding a record kind drawn from `RECORD_KINDS`, a tick, an actor identifier, a serializable observation, an action identifier, a tri-valued success flag, an optional reward, and a kind-specific detail mapping. `encode_record_line` and `decode_record_line` serialize one record per line as JSON with sorted keys, and a corrupt or truncated line decodes to nothing rather than raising. `DatasetSummary` records count, byte size, and per-kind tally, and `DatasetSink` is the write protocol implemented outside the simulation layer.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/dataset.py',
            code: `@dataclass(frozen=True)
class DemonstrationRecord:
  kind: str
  tick: int = 0
  actor_id: str = ""
  observation: dict[str, Any] = field(default_factory=dict)
  action: str | None = None
  success: bool | None = None
  reward: float | None = None
  detail: dict[str, Any] = field(default_factory=dict)`,
          },
        ],
      },
      {
        id: 'ai-learning-records-features',
        title: 'Observation Feature Encoding',
        content: [
          {
            kind: 'paragraph',
            text: 'Records embed a serialized observation, and learning conditions on a derived feature key set rather than raw rendered values. `encode_features` in `src/ludoxel/simulation/actors/ai_players/learning/feature_encoder.py` maps observation state to stable keys for health thresholds, player distance and visibility, combat readiness, route state, hazards, terrain gaps, placement and breaking opportunities, and stuck signals. The encoder is versioned by `FEATURE_ENCODER_VERSION`, so policy compatibility can be checked against the same feature vocabulary used to generate records.',
          },
          {
            kind: 'paragraph',
            text: 'Rewards are computed from `RewardTransition`, not from visual presentation. `compute_step_reward` weights survival, progress, damage, falling, death, and void death. The resulting reward is a state-transition measurement attached to a record; it is not a renderer score and not a UI animation metric.',
          },
        ],
      },
      {
        id: 'ai-learning-records-recorder',
        title: 'The Buffered Recorder',
        content: [
          {
            kind: 'paragraph',
            text: '`DemonstrationRecorder` accumulates records in a bounded buffer and records only when enabled for the requested kind. `captures` lets a caller avoid constructing an observation for an unrecorded kind. The buffer drops the oldest row when full, `should_flush` exposes the flush threshold, and `flush` clears the buffer only after the sink reports a positive write. The simulation component therefore owns record formation and buffering, but not the storage path.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/recorder.py',
            code: `def captures(self, kind: str) -> bool:
  return bool(self._enabled) and str(kind) in self._captured_kinds`,
          },
        ],
      },
      {
        id: 'ai-learning-records-mode-and-sink',
        title: 'Learning Mode and Sink Boundary',
        content: [
          {
            kind: 'paragraph',
            text: '`LearningCoordinator` exposes only three runtime modes: `off`, `observe_only`, and `use_learned_policy`. The persisted settings layer can store train modes, but `is_active_learning_mode` excludes those train modes from ordinary play. Training is handled by the overlay controller and training services; live session stepping receives only a coordinator configured for recording, policy use, or inactivity.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/coordinator.py',
            code: `def configure(self, *, mode: str, captured_kinds: Iterable[str], policy: Policy | None) -> None:
  self._mode = str(mode)
  self._policy = policy if isinstance(policy, Policy) else None
  self._recorder.configure(enabled=(str(mode) == LEARNING_RUNTIME_OBSERVE_ONLY), captured_kinds=tuple(captured_kinds))

def policy_enabled(self) -> bool:
  return self._mode == LEARNING_RUNTIME_USE_LEARNED_POLICY and isinstance(self._policy, Policy) and bool(self._policy.is_usable())`,
          },
          {
            kind: 'paragraph',
            text: 'The sink boundary is the architectural separation created by `DatasetSink`. `LearningCoordinator.flush` writes to a sink supplied by the application layer. `AiLearningStore.dataset_writer` produces that sink with a concrete path under the runtime data root. This keeps simulation independent of repository paths, user-profile directories, JSON Lines filenames, legacy dataset layout, and filesystem mutation policy.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'This Systems article explains how records are formed, gated, and flushed. The Data category owns the JSON Lines path, export/import behavior, corrupt-line accounting, and retention consequences.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Reading Demonstration Data', 'Handling Corrupt Learning Rows', 'Training a Policy'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Policy and Search',
    title: 'Understanding Policy Evaluation',
    description:
      'Documents the learned-policy mechanism in full: the policy as a feature-conditioned utility overlay, the deterministic baseline and its scoring, the action mask that fixes the safety boundary, the usability gate and registry fallback, and the six-task evaluation a policy must pass before runtime use.',
    sections: [
      {
        id: 'policy-evaluation-overlay',
        title: 'A Utility Overlay, Not a Network',
        content: [
          {
            kind: 'paragraph',
            text: 'A learned policy in Ludoxel is a lightweight set of feature-conditioned utility adjustments, not a neural network. `Policy` in `src/ludoxel/simulation/actors/ai_players/learning/policy.py` holds, among schema and version fields, a mapping from feature key to per-action weights, per-action negative modifiers, and legacy global modifiers. `load_policy` reconstructs one tolerantly, coercing weight maps and reading either the new or the legacy evaluation field; a structural defect yields nothing while a version or compatibility mismatch is loaded but later rejected by the usability gate.',
          },
          {
            kind: 'paragraph',
            text: '`DeterministicPolicy` is the baseline that decides actions. `decide` computes a baseline utility for each permitted action with `_baseline_scores` from the observation context, then `_apply_policy` adds the policy adjustments for the encoded feature keys, the negative modifiers, and the legacy category and skill modifiers, and selects the highest-utility action with a deterministic tie-break by catalog order. The policy biases the ranking; it does not replace the baseline, and `PolicyDecision` reports the chosen action, its utility, the ranked candidates, and the decision source.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/policy.py',
            code: `features = encode_features(observation)
for feature in features:
  mapping = policy.action_weights.get(feature)
  if not mapping:
    continue
  for action_id, weight in mapping.items():
    if action_id in scores:
      scores[action_id] += float(weight)`,
          },
          {
            kind: 'paragraph',
            text: 'A bundled policy artifact is short and human-readable. The movement policy, for example, reweights movement actions through global modifiers and declares in its evaluation summary that it cannot bypass any safety rule.',
          },
          {
            kind: 'code',
            language: 'json',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/resources/policies/movement_policy.json',
            code: `{
  "schema_version": 1,
  "policy_id": "bundled_movement_v1",
  "compatibility_target": "ludoxel.ai.v1",
  "evaluation_summary": { "passed": true },
  "utility_score_modifiers": { "movement": 0.08, "wasd_control": 0.06, "jumping": 0.04 }
}`,
          },
        ],
      },
      {
        id: 'policy-evaluation-mask',
        title: 'The Action Mask Fixes the Boundary',
        content: [
          {
            kind: 'paragraph',
            text: 'The safety boundary is the action mask, not the policy. `build_action_mask` in `src/ludoxel/simulation/actors/ai_players/learning/action_mask.py` derives, from the observation, the set of permitted actions and a reason for each forbidden one: moving into a void, launching while airborne, attacking out of range or on cooldown, placing where no face allows it, breaking the actor own footing, operating an absent fence gate, following a missing or blocked route, replanning without a route, or idling at low health within reach. View rotation and sneak are always permitted so the allowed set is never empty. `AiActionMask.is_allowed` reports membership, and the policy adjusts only the utilities of permitted actions, so a bias can never resurrect a forbidden action.',
          },
        ],
      },
      {
        id: 'policy-evaluation-usability',
        title: 'The Usability Gate and Registry Fallback',
        content: [
          {
            kind: 'paragraph',
            text: 'A policy is used only when usable. `Policy.is_usable` requires the schema version and compatibility target to match the engine, the feature-encoder and action-catalog versions to match or be the legacy zero, and the evaluation to record a passing result. `builtin_deterministic_policy` is the always-usable baseline identity. `PolicyRegistry` in `src/ludoxel/simulation/actors/ai_players/learning/policy_registry.py` loads bundled artifacts once, resolves a requested policy by kind and identifier, and falls back to the built-in baseline whenever the policy is missing, broken, or not usable, swallowing a user-loader exception as a fallback rather than a failure, so a defective artifact never disables the AI.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/ai_players/learning/policy.py',
            code: `def is_usable(self) -> bool:
  if int(self.schema_version) != int(POLICY_SCHEMA_VERSION):
    return False
  if str(self.compatibility_target) != str(POLICY_COMPATIBILITY_TARGET):
    return False
  if int(self.feature_encoder_version) not in (0, int(FEATURE_ENCODER_VERSION)):
    return False
  if int(self.action_catalog_version) not in (0, int(ACTION_SCHEMA_VERSION)):
    return False
  return bool(self.evaluation.get("passed", False))`,
          },
          {
            kind: 'paragraph',
            text: 'The `LearningCoordinator.decide` path uses the selected policy only when `policy_enabled` is true, which requires the use-learned-policy mode and a usable policy; otherwise it decides on the deterministic baseline alone. The coordinator can also report the deterministic and policy-adjusted rankings side by side for debugging.',
          },
        ],
      },
      {
        id: 'policy-evaluation-evaluation',
        title: 'What Evaluation Checks',
        content: [
          {
            kind: 'paragraph',
            text: '`run_evaluation` in `src/ludoxel/simulation/actors/ai_players/learning/evaluator.py` runs six checks: schema validation, compatibility validation, action-catalog validation that every referenced action exists, feature-encoder validation that every referenced feature key is producible, mask compliance that no sampled decision selects a forbidden action, and a headless sandbox behaviour check that the policy scores at least as well as the deterministic baseline across the scenarios from `src/ludoxel/simulation/actors/ai_players/learning/sandbox.py`. The report passes only if all checks pass, and that passing flag is what `is_usable` reads. The report also records a decision diff per sample observation. Evaluation uses no external machine-learning framework; it exercises Ludoxel rules directly.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'Evaluation here is a technical usability gate over an action-bias artifact. It is unrelated to the legal restrictions on AI use, which are defined by the License and the Legal category. A policy passing evaluation says only that the artifact is structurally valid, compatible, and mask-compliant, not that any external use is permitted.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Applying a Learned Policy', 'Reading Learned Policies', 'Understanding AI Action Selection'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Feedback and Intelligence',
    group: 'Policy and Search',
    title: 'Understanding Othello Search',
    description:
      'Documents the Othello engine in full: the bitboard representation and legal-move generation, the negamax search with alpha-beta pruning, transposition, and an exact endgame solver, the two evaluation implementations and their weights, the difficulty engines and iterative deepening, the off-thread worker, and the opening-book compilation and handoff.',
    sections: [
      {
        id: 'othello-search-bitboards',
        title: 'Bitboards and Legal Moves',
        content: [
          {
            kind: 'paragraph',
            text: 'The strong engine represents the board as two 64-bit integers, one per side, in `src/ludoxel/simulation/spaces/othello/engines/bitboards.py`. The eight direction shifts mask the A and H files to prevent horizontal wrap. `legal_moves_bitboard` generates moves by dilating the player discs through opponent runs in each direction and projecting onto empty squares; `apply_move_bits` flips captured runs through `capture_line`; `bitboard_to_moves`, `bit_count`, and `adjacent_bits` support move enumeration and evaluation.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/engines/bitboards.py',
            code: `def legal_moves_bitboard(player_bits: int, opponent_bits: int) -> int:
  player = int(player_bits)
  opponent = int(opponent_bits)
  empty = (~(player | opponent)) & FULL_MASK
  moves = 0
  for shift in SHIFT_FUNCS:
    frontier = shift(player) & opponent
    captured = frontier
    for _ in range(5):
      frontier = shift(frontier) & opponent
      if frontier == 0:
        break
      captured |= frontier
    moves |= shift(captured) & empty
  return int(moves)`,
          },
          {
            kind: 'paragraph',
            text: 'This bitboard model is the basis for the strong and exact search. The weaker difficulties operate on a list-based board through the rules in `src/ludoxel/simulation/spaces/othello/game/rules.py`, which share the legal-move and flip semantics in their own representation.',
          },
        ],
      },
      {
        id: 'othello-search-negamax',
        title: 'Negamax, Pruning, and Transposition',
        content: [
          {
            kind: 'paragraph',
            text: '`negamax` in `src/ludoxel/simulation/spaces/othello/engines/search.py` searches in the negamax form with alpha-beta pruning. A side with no legal move passes to the opponent; two consecutive passes resolve to the terminal score. When the empty count falls to the exact threshold the search switches to `solve_exact`; at depth zero it returns the static evaluation. A transposition table keyed by the position stores depth, score, a bound classification, and the best move; `store_transposition` and `store_exact_transposition` in `src/ludoxel/simulation/spaces/othello/engines/transposition.py` apply a soft-limit clear, and `ordered_moves` seeds ordering with the stored best move. `check_deadline` raises on timeout.',
          },
          {
            kind: 'math',
            math: {
              expression: 'v = \\max_{m \\in M}\\ \\bigl(-\\,\\mathrm{negamax}(\\text{child}(m),\\ d-1,\\ -\\beta,\\ -\\alpha)\\bigr), \\quad \\text{cutoff when } \\alpha \\ge \\beta',
              displayMode: true,
              caption: 'Negamax recurrence with alpha-beta window; a stored entry is bounded EXACT, LOWER, or UPPER by best score against the original window.',
            },
          },
          {
            kind: 'paragraph',
            text: 'Both searches honour a deadline, raising on timeout so the caller keeps the last completed depth, and the exact solver proves the final score once the board is near full.',
          },
        ],
      },
      {
        id: 'othello-search-evaluation',
        title: 'Evaluation Terms',
        content: [
          {
            kind: 'paragraph',
            text: 'The bitboard evaluation in `src/ludoxel/simulation/spaces/othello/engines/evaluation.py` combines a positional weight table, corner control, a corner-adjacency penalty, actual and potential mobility, a frontier difference, parity, and a stage-weighted disc difference. The component weights come from `evaluation_weights` in `src/ludoxel/simulation/spaces/othello/engines/evaluation_profile.py`, which derive disc, mobility, corner, and frontier weights from the sacrifice level, and the disc term is additionally scaled by game stage so material matters more as the board fills. A list-based evaluation in `src/ludoxel/simulation/spaces/othello/engines/classic.py` mirrors these terms for the weaker engines.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/spaces/othello/engines/evaluation.py',
            code: `score += float(position_score(int(player_bits), int(opponent_bits)))
score += float(corner_score(int(player_bits), int(opponent_bits))) * float(corner_weight)
score += float(corner_closeness_penalty(int(player_bits), int(opponent_bits)))
score += float(mobility_score(int(player_bits), int(opponent_bits))) * float(mobility_weight)
score += float(frontier_score(int(player_bits), int(opponent_bits))) * float(frontier_weight)
score += float(parity_score(int(player_bits), int(opponent_bits)))
score += float(disc_score(int(player_bits), int(opponent_bits))) * float(disc_stage_weight) * float(disc_weight)`,
          },
          {
            kind: 'paragraph',
            text: '`terminal_score` scores a finished position by disc margin with a large win or loss base, so a proven win always outranks any heuristic value. The shared `POSITION_WEIGHTS` table assigns the largest positive weight to the four corners and a negative weight to the squares adjacent to an empty corner.',
          },
        ],
      },
      {
        id: 'othello-search-difficulty',
        title: 'Difficulty Engines and Iterative Deepening',
        content: [
          {
            kind: 'paragraph',
            text: 'Difficulty selects the search in `analyze_position` and `choose_ai_move` in `src/ludoxel/simulation/spaces/othello/engines/classic.py`. Weak searches the list board to depth one and medium to depth three; the strong setting iteratively deepens to depth five under a time budget. The insane setting runs `analyze_insane_position` in `src/ludoxel/simulation/spaces/othello/engines/insane.py`, which deepens until the time budget expires or the position is solved, switching to the exact solver near the endgame through the shared `InsaneSearchCache`. The insane-plus setting layers opening-book selection on top.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Weak: list-based alpha-beta at depth one, positional move ordering.',
              'Medium: list-based alpha-beta at depth three.',
              'Strong: iterative deepening from depth one to five under a time budget.',
              'Insane: bitboard iterative deepening with transposition and an exact endgame solver under a time budget.',
              'Insane-plus: insane search with opening-book moves preferred when available.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Tied best moves are broken by a seeded random choice, so equal-value play varies across matches without becoming non-deterministic for a given seed.',
          },
        ],
      },
      {
        id: 'othello-search-worker-book',
        title: 'The Worker and Opening-Book Handoff',
        content: [
          {
            kind: 'paragraph',
            text: 'Search never runs on the interface thread. `OthelloAiWorker` in `src/ludoxel/presentation/interface/othello/worker.py` submits move, analysis, and book-learning requests to spawn-context process pools, polls for completion on a timer, and emits the result; if a pool cannot be created it falls back to an in-process computation. The opening book is supplied through application-side storage hooks registered in `src/ludoxel/simulation/spaces/othello/books/opening.py`: the engine holds an `OpeningBook` keyed by a dihedral-canonical position computed by `canonical_position_key`, while `_load_opening_book_from_lines` compiles user and bundled lines into that map through a prefix trie, with the user delta and a fingerprinted compiled cache persisted by the application store.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'This article documents the Ludoxel Othello search, not Othello in general. The opening-book and learning-book contents and their on-disk form are owned by the Data category; here the book is the move source the engine consults and the worker is the boundary that keeps search off the interface thread.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Othello AI Turns', 'Changing Othello AI Strength', 'Changing Othello Book Behavior'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Runtime and Render State',
    group: 'Runtime Identity and Diagnostics',
    title: 'Understanding Runtime Identity and Diagnostic Evidence',
    description:
      'Defines the version source, root-resolution boundary, and operating-system diagnostic probes that the desktop runtime consumes, while keeping release authority, file contents, and renderer implementation outside those foundation contracts.',
    sections: [
      {
        id: 'runtime-identity-and-diagnostics-version-source',
        title: 'One Runtime Version Source Does Not Authorize a Release',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/identity/version.py` owns the runtime version identity as one assigned string. `pyproject.toml` obtains the package version from that attribute, while `src/ludoxel/presentation/interface/windows/main.py` consumes the same value for the Qt application version, display name, and window title. The root README currently displays the same version label, but README text and Website text are descriptions rather than alternate runtime authorities. The source value identifies the running application; it does not issue release approval, establish legal permission, or decide what may be packaged or published.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/identity/version.py',
            code: `__version__ = "3.6.3"`,
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'A matching version string can identify one runtime and one metadata value. It is not evidence that a local build is an official release or that any distribution action is authorized.',
            },
          },
        ],
      },
      {
        id: 'runtime-identity-and-diagnostics-root-resolution',
        title: 'Root Resolution Supplies Locations, Not File Semantics',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/locations/roots.py` owns root discovery before the application bootstrap imports the presentation entry point. For an unfrozen process, the project resolver walks upward from the supplied start path and then the working directory, accepting a directory with `pyproject.toml` or both `assets` and `src`. The resource resolver uses the same search. For a frozen process, project resolution returns the executable parent; resource resolution prefers `sys._MEIPASS`, then an `_internal` directory beside the executable, then that executable parent. `src/ludoxel/application/bootstrap/run.py` consumes the resulting project, resource, and runtime-data paths, but the foundation resolver neither reads resource contents nor defines a persistence schema.',
          },
          {
            kind: 'paragraph',
            text: '`is_frozen_application` is exactly `bool(getattr(sys, "frozen", False))`. A failed executable-path resolution yields no frozen root, after which each default resolver resumes its ordinary module-root, working-root, then start-directory fallback. `default_runtime_data_root` follows a different chain: `LUDOXEL_DATA_ROOT`, Windows `LOCALAPPDATA` or `AppData`, macOS Application Support, `XDG_DATA_HOME`, and finally `~/.local/share/ludoxel`. Its `project_root` parameter is resolved only in an otherwise unused guarded branch; it does not make the project directory a data-root fallback. The same file derives `state`, `cache`, `state_manifest.json`, and `integrity_key.bin` below the data root and exposes `previous_configs_root(project_root)` as `<project_root>/configs`. These functions fix location composition and fallback order, not file contents, migration, integrity validation, or retention rules.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/locations/roots.py',
            code: `def is_project_root(path: Path) -> bool:
  root = Path(path).resolve()
  if (root / "pyproject.toml").is_file():
    return True
  return (root / "assets").is_dir() and (root / "src").is_dir()


def search_project_root(start: Path) -> Path | None:
  cursor = _start_directory(start)

  while True:
    if is_project_root(cursor):
      return cursor

    parent = cursor.parent
    if parent == cursor:
      return None
    cursor = parent`,
          },
          {
            kind: 'paragraph',
            text: 'Runtime data, cache, and integrity leaves are derived by the same source file, but their data ownership is defined by the persistence articles and stores that consume those paths. A path resolver can establish where a runtime looks. It cannot establish whether a file is valid, what its bytes mean, or whether it may be copied.',
          },
        ],
      },
      {
        id: 'runtime-identity-and-diagnostics-probe-limit',
        title: 'Diagnostic Sampling Is Evidence with Explicit Gaps',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/diagnostics/system.py` gathers CPU thread count, a platform-specific CPU name and nominal speed when obtainable, total memory, current-process RSS, and optional NVIDIA utilization. `read_system_info` returns only `cpu_threads`, `cpu_name`, `cpu_speed_ghz`, and `total_mem_bytes`; `read_process_memory` returns only `rss_bytes` and `total_bytes`. There is no operating-system version field, Python-version field, renderer field, scene metric, or backend result in these dataclasses. Linux reads procfs before a `ps` fallback, macOS uses `sysctl` and `ps`, and Windows uses registry, Win32, PSAPI, and `tasklist` fallbacks. `HudController` consumes those values on a background loop and renders unavailable values as `n/a`. The module does not import a renderer backend or query its API; renderer name, vendor, API, and shader information are separately requested from `BackendRendererApi.gl_info()` by the HUD.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/diagnostics/system.py',
            code: `def sample(self) -> float | None:
  now = time.perf_counter()
  if (now - float(self._last_t)) < float(self.min_interval_s):
    return self._last
  self._last_t = now
  self._last = _nvidia_smi_util_percent()
  return self._last`,
          },
          {
            kind: 'paragraph',
            text: '`GpuUtilizationSampler` caches one NVIDIA query result until its `min_interval_s` boundary expires; `_nvidia_smi_util_percent` returns `None` on a failed command and clips a parsed utilization below zero to zero and above 100 to 100. A sampled CPU, memory, or GPU value is bounded runtime evidence at that probe boundary. It is not a feature guarantee, an assertion of backend correctness, or a statement that the application can render a particular scene on that machine.',
          },
        ],
      },
    ],
    relatedTitles: ['Starting Ludoxel', 'Locating User Data', 'Understanding Render Snapshots'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding View, Transform, and Chunk Visibility Contracts',
    description:
      'Documents the lower-level vector, angle, matrix, transform, chunk-key, and clip-volume contracts consumed by camera, renderer, and world-upload code without assigning backend draw work or simulation rules to those contracts.',
    sections: [
      {
        id: 'view-transform-and-chunk-visibility-vectors-and-angles',
        title: 'Vectors and View Angles Fix the Camera Input Shape',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/mathematics/linear/vec3.py` owns the immutable three-component value and its component-wise addition, subtraction, scalar multiplication, dot product, cross product, Euclidean length, and normalization. Its zero-length guard returns `(0.0, 0.0, 0.0)` when the length is at most `1e-12`; it does not implement movement, collision, or a camera controller. `src/ludoxel/foundations/mathematics/linear/view_angles.py` builds a normalized forward vector from yaw and pitch, reconstructs yaw and pitch from a normalized forward vector, and separately derives a normalized sun direction from azimuth and elevation. Player view, third-person camera placement, selection input, and both renderer paths consume those vectors, while input event handling and backend draw submission remain elsewhere.',
          },
          {
            kind: 'math',
            math: {
              expression: '\\mathbf{a}\\pm\\mathbf{b}=(a_x\\pm b_x,a_y\\pm b_y,a_z\\pm b_z),\\qquad k\\mathbf{a}=(ka_x,ka_y,ka_z)',
              displayMode: true,
              caption: '`Vec3.__add__`, `Vec3.__sub__`, and `Vec3.__mul__` in `src/ludoxel/foundations/mathematics/linear/vec3.py`; scalar multiplication is also exposed by `__rmul__`.',
            },
          },
          {
            kind: 'math',
            math: {
              expression: '\\mathbf{a}\\cdot\\mathbf{b}=a_xb_x+a_yb_y+a_zb_z,\\qquad \\mathbf{a}\\times\\mathbf{b}=(a_yb_z-a_zb_y,\\ a_zb_x-a_xb_z,\\ a_xb_y-a_yb_x)',
              displayMode: true,
              caption: '`Vec3.dot` and `Vec3.cross` in `src/ludoxel/foundations/mathematics/linear/vec3.py`; the component arithmetic remains a value contract consumed by geometry and transforms.',
            },
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\|\\mathbf{v}\\|=\\sqrt{x^2+y^2+z^2},\\qquad \\operatorname{normalized}(\\mathbf{v})=\\begin{cases}\\mathbf{v}/\\|\\mathbf{v}\\|&\\|\\mathbf{v}\\|>10^{-12}\\\\(0,0,0)&\\|\\mathbf{v}\\|\\le10^{-12}\\end{cases}',
              displayMode: true,
              caption: '`Vec3.length` and `Vec3.normalized` in `src/ludoxel/foundations/mathematics/linear/vec3.py`; callers receive a zero vector rather than a divide-by-zero failure.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/linear/vec3.py',
            code: `def dot(self, o: "Vec3") -> float:
  return self.x * o.x + self.y * o.y + self.z * o.z

def cross(self, o: "Vec3") -> "Vec3":
  return Vec3(self.y * o.z - self.z * o.y, self.z * o.x - self.x * o.z, self.x * o.y - self.y * o.x)

def normalized(self) -> "Vec3":
  n = self.length()
  if n <= 1e-12:
    return Vec3(0.0, 0.0, 0.0)
  inv = 1.0 / n
  return Vec3(self.x * inv, self.y * inv, self.z * inv)`,
          },
          {
            kind: 'math',
            math: {
              expression:
                'y=\\operatorname{radians}(\\mathrm{yaw}_{deg}),\\quad p=\\operatorname{radians}(\\mathrm{pitch}_{deg}),\\qquad \\mathbf{f}=\\operatorname{normalize}(-\\sin(y)\\cos(p),-\\sin(p),\\cos(y)\\cos(p))',
              displayMode: true,
              caption: '`forward_from_yaw_pitch_deg` in `src/ludoxel/foundations/mathematics/linear/view_angles.py`, after converting the supplied degree values to radians.',
            },
          },
          {
            kind: 'math',
            math: {
              expression:
                'p=-\\arcsin(\\operatorname{clamp}(d_y,-1,1)),\\qquad y=\\operatorname{atan2}(-d_x,d_z),\\qquad \\mathbf{s}=\\operatorname{normalize}(\\cos(e)\\sin(a),\\sin(e),\\cos(e)\\cos(a))',
              displayMode: true,
              caption:
                '`yaw_pitch_deg_from_forward` and `sun_dir_from_az_el_deg` in `src/ludoxel/foundations/mathematics/linear/view_angles.py`; they normalize their vector input or output and convert degrees at the function boundary.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/linear/view_angles.py',
            code: `def forward_from_yaw_pitch_deg(yaw_deg: float, pitch_deg: float) -> Vec3:
  yaw = math.radians(float(yaw_deg))
  pitch = math.radians(float(pitch_deg))

  cy = math.cos(yaw)
  sy = math.sin(yaw)
  cp = math.cos(pitch)
  sp = math.sin(pitch)

  return Vec3(-sy * cp, -sp, cy * cp).normalized()`,
          },
          {
            kind: 'paragraph',
            text: 'The forward relation takes degree-valued inputs through `math.radians(float(...))` before trigonometry. The inverse clamps only the normalized `y` component to `[-1, 1]` before `asin`; yaw then comes from `atan2(-x, z)` and both outputs return through `math.degrees`. The sun function has its own azimuth/elevation relation and normalizes its result. These are concrete conversion and zero-vector boundaries. They authorize a camera, ray, or light consumer to receive a vector or reconstructed angle pair; they do not authorize an input layer to accept an invalid action or a backend to interpret a scene.',
          },
          {
            kind: 'paragraph',
            text: '`tools/build_native_extensions/src/config/native.config.mjs` registers `src/ludoxel/foundations/mathematics/linear/view_angles.py`, `src/ludoxel/foundations/mathematics/geometry/ray_aabb.py`, and `src/ludoxel/foundations/mathematics/voxels/dda.py` as native-build candidates under their existing module names. The generated build script passes each source path to `Extension` and `cythonize` in place; verification reports that the Python fallback source exists when no `.pyd`, `.so`, or `.dylib` binary is found beside that source. The Python files therefore define the fallback contract from which those candidates are built. Candidate registration does not independently prove native semantic parity, backend correctness, or availability on every target.',
          },
        ],
      },
      {
        id: 'view-transform-and-chunk-visibility-matrices',
        title: 'Matrix Constructors Preserve Float32 Composition',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/mathematics/linear/mat4.py` returns `numpy` 4-by-4 `float32` arrays for identity, perspective, orthographic, and look-direction matrices. Perspective derives its focal factor from half of the supplied vertical field of view and floors only the aspect denominator at `1e-9`; `look_dir` normalizes the forward and derived basis vectors before placing basis rows and eye translation into the matrix. `mul` computes `a @ b` and casts that product to `float32`. The OpenGL frame pipeline consumes the functions to form view-projection and light view-projection matrices, while the WGPU backend converts the resulting clip representation for its uniform layout. This file constructs arrays; it does not issue a draw pass.',
          },
          {
            kind: 'math',
            math: {
              expression: 'f = \\frac{1}{\\tan(\\operatorname{radians}(\\mathrm{fovY})/2)}, \\qquad m_{00} = \\frac{f}{\\max(\\mathrm{aspect}, 10^{-9})}',
              displayMode: true,
              caption: '`perspective` in `src/ludoxel/foundations/mathematics/linear/mat4.py`; the remaining entries are set directly by that implementation.',
            },
          },
          {
            kind: 'math',
            math: {
              expression: 'm_{11}=f,\\qquad m_{22}=\\frac{z_f+z_n}{z_n-z_f},\\qquad m_{23}=\\frac{2z_fz_n}{z_n-z_f},\\qquad m_{32}=-1',
              displayMode: true,
              caption: 'The remaining nonzero perspective entries written by `perspective` in `src/ludoxel/foundations/mathematics/linear/mat4.py`.',
            },
          },
          {
            kind: 'math',
            math: {
              expression:
                'r_l=\\max(r-l,10^{-9}),\\ t_b=\\max(t-b,10^{-9}),\\ f_n=\\max(z_f-z_n,10^{-9}),\\quad M_{\\mathrm{ortho}}=\\begin{bmatrix}2/r_l&0&0&-(r+l)/r_l\\\\0&2/t_b&0&-(t+b)/t_b\\\\0&0&-2/f_n&-(z_f+z_n)/f_n\\\\0&0&0&1\\end{bmatrix}',
              displayMode: true,
              caption: '`ortho` in `src/ludoxel/foundations/mathematics/linear/mat4.py`; each span denominator is floored independently before the `float32` entries are written.',
            },
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\mathbf{f}=\\operatorname{normalize}(\\mathrm{forward}),\\quad \\mathbf{r}=\\operatorname{normalize}(\\mathrm{upHint}\\times\\mathbf{f}),\\quad \\mathbf{u}=\\operatorname{normalize}(\\mathbf{f}\\times\\mathbf{r}),\\quad M_{0:3,0:3}=[\\mathbf{r};\\mathbf{u};-\\mathbf{f}]',
              displayMode: true,
              caption: '`look_dir` in `src/ludoxel/foundations/mathematics/linear/mat4.py`; the source writes the basis in rows, then writes the eye terms into column 3.',
            },
          },
          {
            kind: 'math',
            math: {
              expression:
                '(M_{03},M_{13},M_{23})=(-\\mathbf{r}\\cdot\\mathbf{e},-\\mathbf{u}\\cdot\\mathbf{e},\\mathbf{f}\\cdot\\mathbf{e}),\\qquad \\operatorname{mul}(A,B)=\\operatorname{float32}(A@B),\\quad A,B\\in\\mathbb{R}^{4\\times4}',
              displayMode: true,
              caption: 'The translation placement and multiplication result of `look_dir` and `mul` in `src/ludoxel/foundations/mathematics/linear/mat4.py`.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The shape and cast are part of the contract: every constructor begins with either an identity or a zero array of shape `(4, 4)` and dtype `numpy.float32`, and `mul` recasts the product. The implementation does not protect a zero forward vector or a parallel up hint beyond the `Vec3.normalized` zero-vector behavior. A caller therefore receives the exact basis construction above, not a hidden camera-recovery policy.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/linear/mat4.py',
            code: `def look_dir(eye: Vec3, forward: Vec3, up_hint: Vec3 = Vec3(0.0, 1.0, 0.0)) -> np.ndarray:
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
  return (a @ b).astype(np.float32)`,
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/mathematics/linear/transform_matrices.py` supplies identity, translation, scale, and axis-rotation constructors, including degree wrappers, then composes any supplied matrices left-to-right from identity with `out @ matrix`. Player-model poses, first-person geometry, Othello scene transforms, face rows, particles, HUD overlays, and frame roll consume this contract. The function fixes multiplication order for its callers; it does not own a UI camera mode, model policy, or backend implementation.',
          },
          {
            kind: 'math',
            math: {
              expression: 'I=I_4,\\qquad T(x,y,z)_{0:3,3}=(x,y,z)^\\mathsf{T},\\qquad S(x,y,z)=\\operatorname{diag}(x,y,z,1)',
              displayMode: true,
              caption: '`identity_matrix`, `translate_matrix`, and `scale_matrix` in `src/ludoxel/foundations/mathematics/linear/transform_matrices.py`, all constructed as `float32` arrays.',
            },
          },
          {
            kind: 'math',
            math: {
              expression:
                'R_x=\\begin{bmatrix}1&0&0&0\\\\0&c&-s&0\\\\0&s&c&0\\\\0&0&0&1\\end{bmatrix},\\quad R_y=\\begin{bmatrix}c&0&-s&0\\\\0&1&0&0\\\\s&0&c&0\\\\0&0&0&1\\end{bmatrix},\\quad R_z=\\begin{bmatrix}c&-s&0&0\\\\s&c&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix},\\quad c=\\cos(\\theta),\\ s=\\sin(\\theta)',
              displayMode: true,
              caption:
                'The three radian rotation constructors in `src/ludoxel/foundations/mathematics/linear/transform_matrices.py`; the degree wrappers pass `math.radians(float(deg))` to these constructors.',
            },
          },
          {
            kind: 'math',
            math: {
              expression: 'O_0=I_4,\\qquad O_k=\\operatorname{float32}\\!\\left(O_{k-1}@\\operatorname{float32}(M_k)\\right)',
              displayMode: true,
              caption: '`compose_matrices` in `src/ludoxel/foundations/mathematics/linear/transform_matrices.py`; the supplied sequence is multiplied from identity in argument order.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/linear/transform_matrices.py',
            code: `def compose_matrices(*matrices: np.ndarray) -> np.ndarray:
  out = identity_matrix()
  for matrix in matrices:
    out = (out @ np.asarray(matrix, dtype=np.float32)).astype(np.float32)
  return out`,
          },
        ],
      },
      {
        id: 'view-transform-and-chunk-visibility-chunks-and-clip-space',
        title: 'Chunk Coordinates and Clip Tests Bound Visibility Work',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/mathematics/chunks/grid.py` defines `CHUNK_SIZE` as 16 and converts integer cell coordinates to a `ChunkKey` with Python floor division. `chunk_bounds` maps that key back to half-open world bounds, while `neighbor_chunk_keys_for_cell` adds an adjacent key only when the local coordinate lies on the lower or upper chunk boundary. `WorldState` consumes the neighbour set when a cell edit marks dirty chunks, and renderer upload and backend caches consume normalized keys. The grid source neither determines a block rule nor submits a renderer pass.',
          },
          {
            kind: 'math',
            math: {
              expression: '(c_x, c_y, c_z) = (\\lfloor x/16 \\rfloor, \\lfloor y/16 \\rfloor, \\lfloor z/16 \\rfloor)',
              displayMode: true,
              caption: '`chunk_key` in `src/ludoxel/foundations/mathematics/chunks/grid.py` after each input has been converted to `int`.',
            },
          },
          {
            kind: 'math',
            math: {
              expression: 'B(c)= [16c_x,16c_x+16)\\times[16c_y,16c_y+16)\\times[16c_z,16c_z+16),\\qquad \\ell_i=q_i-16c_i',
              displayMode: true,
              caption: '`chunk_bounds` and `neighbor_chunk_keys_for_cell` in `src/ludoxel/foundations/mathematics/chunks/grid.py`; the local coordinate is derived after floor-division key selection.',
            },
          },
          {
            kind: 'math',
            math: {
              expression: '\\ell_i\\le0\\Rightarrow c-\\mathbf{e}_i\\in N(q),\\qquad \\ell_i\\ge15\\Rightarrow c+\\mathbf{e}_i\\in N(q)',
              displayMode: true,
              caption: 'The lower and upper boundary branches in `neighbor_chunk_keys_for_cell`; each condition adds only the adjacent key on that axis.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/chunks/grid.py',
            code: `def chunk_bounds(k: ChunkKey) -> tuple[int, int, int, int, int, int]:
  cx, cy, cz = normalize_chunk_key(k)
  x0 = cx * CHUNK_SIZE
  y0 = cy * CHUNK_SIZE
  z0 = cz * CHUNK_SIZE
  return (x0, x0 + CHUNK_SIZE, y0, y0 + CHUNK_SIZE, z0, z0 + CHUNK_SIZE)

if int(lx) <= 0:
  keys.add((int(cx) - 1, int(cy), int(cz)))
if int(lx) >= int(CHUNK_SIZE - 1):
  keys.add((int(cx) + 1, int(cy), int(cz)))`,
          },
          {
            kind: 'paragraph',
            text: '`src/ludoxel/foundations/mathematics/frustums/clip.py` constructs the eight homogeneous corners of those chunk bounds as `float32`, applies the caller matrix, and rejects a chunk only when every transformed corner lies outside the same left, right, bottom, top, near, or far clip inequality. `select_visible_chunks` in `src/ludoxel/presentation/rendering/visuals/selections/chunk.py` consumes the boolean before adding a normalized key to its result. The test is a visibility predicate over a supplied matrix; it does not select a graphics API, allocate GPU resources, or draw the chunk.',
          },
          {
            kind: 'math',
            math: {
              expression: '\\mathbf{C}_{clip}=\\left(M_{\\mathrm{float32}}\\mathbf{C}_{world}^{\\mathsf{T}}\\right)^{\\mathsf{T}},\\qquad \\mathbf{C}_{world}\\in\\mathbb{R}^{8\\times4},\\quad c_w=1',
              displayMode: true,
              caption:
                '`chunk_corners_homogeneous` and `chunk_intersects_clip_volume` in `src/ludoxel/foundations/mathematics/frustums/clip.py`: eight `float32` homogeneous chunk corners enter the supplied matrix product.',
            },
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\operatorname{reject}\\Longleftrightarrow \\operatorname{all}(x<-w)\\lor\\operatorname{all}(x>w)\\lor\\operatorname{all}(y<-w)\\lor\\operatorname{all}(y>w)\\lor\\operatorname{all}(z<-w)\\lor\\operatorname{all}(z>w)',
              displayMode: true,
              caption: 'The six exact all-corners tests in `chunk_intersects_clip_volume`. A chunk is retained unless one complete corner set violates one plane inequality.',
            },
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/mathematics/frustums/clip.py',
            code: `def chunk_intersects_clip_volume(chunk_key: ChunkKey, matrix: np.ndarray) -> bool:
  corners = chunk_corners_homogeneous(chunk_key)
  clip = (matrix.astype(np.float32, copy=False) @ corners.T).T

  xs = clip[:, 0]
  ys = clip[:, 1]
  zs = clip[:, 2]
  ws = clip[:, 3]

  if bool(np.all(xs < (-ws))):
    return False
  if bool(np.all(xs > ws)):
    return False
  if bool(np.all(ys < (-ws))):
    return False
  if bool(np.all(ys > ws)):
    return False
  if bool(np.all(zs < (-ws))):
    return False
  if bool(np.all(zs > ws)):
    return False

  return True`,
          },
        ],
      },
    ],
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding WGPU Rendering', 'Understanding Selection Outlines', 'Building in My World'],
  }),
];
