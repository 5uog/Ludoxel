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
          {
            kind: 'paragraph',
            text: '`GameLoopParams` supplies the configured frequency and timer overrides, viewport lifecycle derives the Qt timer requests, and `FixedStepRunner` converts elapsed wall time into bounded simulation quanta. `_on_step` then passes each quantum through `SessionManager.step`, learning updates, HUD synchronization, and audio-event playback before the render loop consumes the session-facing result. The OpenGL and WGPU backends receive render state through their renderer contracts after simulation mutation has occurred. Timer activity, fixed-step advancement, snapshot preparation, and draw submission therefore remain consecutive subsystem boundaries with distinct owners and observable outputs.',
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
            text: 'Two clamps bound the loop against a stall. The elapsed-time clamp of 0.25 seconds caps how much real time a single frame may inject, and the trailing reduction discards excess accumulated time once the substep budget is exhausted, reducing the accumulator to at most one quantum. Under sustained overload the simulation slows relative to wall time while the bounded accumulator prevents a catch-up backlog. Each call to `on_step` represents exactly one quantum of simulated time, the contract consumed by session state.',
          },
          {
            kind: 'paragraph',
            text: '`FixedStepRunner.update` is consumed by the viewport lifecycle after `_tick_sim` admits runtime activity. Its `on_step` callback reaches `_on_step` in `src/ludoxel/presentation/interface/viewport/render_loop/loop.py`, where input is consumed before `SessionManager.step`, learning runtime updates, HUD synchronization, and audio-event playback. The accumulator therefore converts irregular wall-clock frames into ordered simulation quanta whose result records feed presentation consumers without giving the render timer authority to mutate simulation state independently.',
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
              'Step every AI actor, optionally excluding paused route-edit actors, collect AI death-log events, and feed the learning coordinator.',
              'Record a player movement demonstration when the learning coordinator is recording.',
              'Resolve the player death cause from void, fall, or PvP damage and return a SessionStepResult.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The result is the frozen `SessionStepResult`, carrying jump-started, landed, footstep-triggered, the support block state and position, fall distance, damage taken, the player death reason and killer name, the gravity-broken blocks, the damage-sound positions, and the AI death-log events reported by `AiPlayerManager.step`. The render loop reads these fields to drive footstep, landing, break, and damage audio, append player and AI death rows to chat history, and raise the death overlay only for the local player. Player death reasons use `void`, `fall`, `pvp`, or generic `damage`; AI death-log events use the same cause vocabulary while carrying the removed actor name separately.',
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
              'The order is consequential: an active-space label and renderer flags are derived after their admitting state has been normalized. A missing state file leaves the default runtime intact; `AppStateStore` withholds a present runtime file that fails integrity verification. The envelope version, JSON failure behavior, legacy fallback, and integrity records are the responsibility of ',
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
            text: '`AppState` is an immutable aggregate of the current space identifier, persisted settings, standing Othello settings, My World state, and Othello state. Player inventory is not a top-level member: each My World entry carries its own `PersistedWorldInventory`, while the Othello play space has no persisted inventory. The global envelope `PersistedAppFile` owns the current space, settings, standing Othello settings, and the Othello play space in `app_state.json`, while the active My World is owned by its `state/worlds/<id>.ldxworld` package through `WorldLibraryStore`. The global file is written atomically through `JsonFileStore` and each world package through the `.ldxworld` writer; both are durability boundaries, not a claim that arbitrary edits preserve schema or integrity validity.',
          },
          {
            kind: 'paragraph',
            text: '`runtime_preferences_from_app_state` produces mutable runtime state for the live session, reading the My World hotbar branches from the active world entry while the Othello hotbar is rebuilt from its defaults. Its inverse, `persisted_settings_from_runtime`, pulls movement values from the active session settings, while `persisted_world_inventory_from_runtime` copies the My World hotbar branches into the world inventory schema. `save_state` serializes both sessions and their AI projections and then delegates to `AppStateStore.save`. The application keeps the file shape, live aggregate, session parameters, and renderer commands separate because their consumers require different times and mutability.',
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
              'The snapshot types in `src/ludoxel/application/sessions/pipelines/render_snapshot.py` are all frozen dataclasses. `RenderSnapshotDTO` aggregates a world revision, a `CameraDTO`, a `PlayerModelSnapshotDTO`, and tuples of `FallingBlockRenderSampleDTO` and `BlockBreakParticleRenderSampleDTO`. `CameraDTO` carries eye position, yaw, pitch, field of view, and six separable camera-shake channels for translation and rotation. `PlayerModelSnapshotDTO` carries base position, the body and head angles, limb phase and swing, the signed `limb_forward_ratio` and `limb_strafe_ratio` that report the local movement direction, crouch amount, an `idle_anim_time_s` visual-animation clock, hurt tint, the six first-person view-model channels, and a first-person flag. Here `body_yaw_deg` is the lagged visual body yaw, `head_yaw_deg` is the lagged visual head yaw measured from that body, and `head_pitch_deg` is the lagged visual head pitch; how those angles and the movement ratios are produced and consumed is owned by the ',
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
            text: 'Every field is a scalar, a tuple of scalars, or another frozen DTO. Presentation receives a stable per-frame value composed without `PlayerEntity`, `WorldState`, or another mutable simulation object, preserving domain-state ownership within the simulation.',
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
            text: '`make_render_snapshot_for_session` composes the camera and the player model and then scales only the first-person view-model channels by the view-bobbing strength, clamped to the unit interval and forced to zero when bobbing is disabled. It also projects the interpolated gravity samples into falling-block DTOs. The player projection itself is `build_player_model_snapshot` in `src/ludoxel/application/sessions/pipelines/player_model.py`, which converts the mutable entity and motion state into renderer-facing scalars, deriving crouch amount from the eye drop and the first-person bob from the walk phase. It also decomposes the horizontal velocity in the look frame into signed forward and strafe ratios, and reads the lagged visual body yaw, the lagged visual head yaw and pitch, and the always-advancing visual clock from the motion state. It emits `body_yaw_deg` as the visual body yaw, `head_yaw_deg` as the lagged visual head yaw taken relative to the body and clamped to the maximum head separation, `head_pitch_deg` as the lagged visual head pitch, the two movement ratios, and `idle_anim_time_s` as the clock that drives idle animation. The first-person bob is additionally reduced while the forward ratio is negative so a backward step does not bob like a forward stride.',
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
            text: 'The render-state types in `src/ludoxel/presentation/rendering/visuals/players/render_state.py` are frozen and serve as cache keys. `PlayerRenderState` carries base pose, the visual body and relative head angles, locomotion phase, crouch, the signed `limb_forward_ratio` and `limb_strafe_ratio`, the `idle_anim_time_s` clock, the perspective flag, a resolved `skin_texture_key`, and an optional `FirstPersonRenderState`; two actors with the same pose but different skins are distinct cache entries because the key includes the skin reference, and because the idle clock advances every step a standing actor still produces a fresh key each step so its idle motion animates. `FirstPersonRenderState` carries the visible and target item identifiers, the held block kind, the special-item icon, equip and swing progress, the arm and view-model flags, the view-bob channels, the arm rotation limits, and an `idle_time_s` clock with an `idle_sway_weight`, so the first-person view model is reconstructed from one sample. The idle weight is computed by the composer from the walk amount, swing, and equip progress, and `src/ludoxel/presentation/rendering/visuals/players/first_person_geometry.py` applies a faint camera-space breathing to the held item, arm, and special item that fades to nothing while walking, swinging, or switching items.',
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
            text: '`RuntimePreferences` in `src/ludoxel/application/preferences/runtime.py` is the mutable aggregate shared by persistence, the settings surface, the renderer state, and the active session. It holds the play-space identifier, input inversion, selection and cloud and shadow flags, cloud density and seed and flow and speed and height parameters, one My World hotbar and upper-inventory state, separate Othello and route-edit hotbar branches, the Othello settings, reach and block-repeat intervals, particle rates, camera and view-model and arm parameters, render distance, sun angles, window geometry, and the keybind and audio sub-objects. Numerous class-level constants fix the allowed ranges and defaults.',
          },
          {
            kind: 'paragraph',
            text: '`normalize` projects every component into its allowed domain in one pass: booleans are coerced, shadow quality and render distance and cloud parameters are clamped, the play-space identifier and Othello settings are normalized, the arm rotation limits are clamped and reordered if inverted, the legacy block-place interval is migrated to the current default, sun azimuth is wrapped to a full turn and elevation clamped, the shared My World, Othello, and route-edit hotbar branches are normalized to size and index, and the keybind and audio sub-objects are normalized in turn.',
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
            text: 'The hotbar accessors select the active branch by play space and route-edit state through `_active_hotbar_state_attrs`; Creative Mode continues to use the shared My World branch while exposing the catalog in the overlay. `set_hotbar_slot`, `select_hotbar_index`, `cycle_hotbar`, and `clear_selected_hotbar_slot` normalize before mutating so the slot count and index stay coherent. `current_item_id`, `current_block_id`, and `current_special_item_id` resolve the selected slot, excluding special items from block placement and ordinary blocks from the special path. `is_othello_space`, `is_first_person_view`, `view_model_visible`, and `cycle_camera_perspective` answer derived predicates from the same normalized state.',
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
            text: '`PersistedSettings` in `src/ludoxel/application/persistence/schema/settings.py` is the frozen on-disk form. It owns the documented default values, a `__post_init__` that normalizes cloud and shadow fields at construction, a `to_dict` serializer, and a tolerant `from_dict` reader. The reader coerces each scalar through a typed mapping helper with an explicit default. Missing or malformed keys select that default, while legacy `cloud_wire` and `build_mode` keys map to `cloud_wireframe` and `creative_mode`.',
          },
          {
            kind: 'paragraph',
            text: 'The runtime-state pipeline in `src/ludoxel/application/sessions/pipelines/runtime_state.py` converts between the two representations. `runtime_preferences_from_app_state` reads a persisted aggregate into a normalized runtime object; `persisted_settings_from_runtime` projects the runtime object and the session movement parameters back into a `PersistedSettings`; `persisted_world_inventory_from_runtime` extracts the My World hotbar branches, and `apply_world_inventory_to_runtime` restores a selected world hotbar set into the runtime when the active world changes. `apply_runtime_to_renderer` pushes the visual flags and cloud and shadow and sun parameters into the renderer, `sync_runtime_sun_from_renderer` reads the sun angles back, and `apply_persisted_settings_to_session` installs the field-of-view, sensitivity, and movement values into the session settings.',
          },
        ],
      },
      {
        id: 'saved-preferences-store',
        title: 'The Store and Integrity Verification',
        content: [
          {
            kind: 'paragraph',
            text: '`AppStateStore` in `src/ludoxel/application/persistence/stores/app.py` writes the active space, settings, standing Othello settings, and the Othello play space into `app_state.json` beneath the runtime state root, delegates the active My World to `WorldLibraryStore.save_space`, and updates an integrity manifest. It raises when `save_space` reports that the present active world could not be written, so a caller is not told a save succeeded when the world body was not persisted. `_read_runtime_or_previous` reads the runtime file first, verifies a protected runtime file before trusting it, and consults the legacy configuration path only when the runtime file is absent. `load` reads `app_state.json`, then merges the active world entry from the library, so the returned `AppState` joins one global file with the per-world My World state.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/persistence/stores/app.py',
            code: `def save(self, state: AppState, *, my_world_thumbnail_bytes: bytes | None = None) -> None:
  app_file = PersistedAppFile(
    version=int(APP_STATE_FILE_VERSION),
    current_space_id=state.current_space_id,
    settings=state.settings,
    othello_settings=state.othello_settings.normalized(),
    othello_space=(state.othello_space if isinstance(state.othello_space, PersistedOthelloSpace) else PersistedOthelloSpace()),
  )
  self._app_store().write(app_file.to_dict())
  update_runtime_integrity_manifest(self._data_root(), (_APP_STATE_RELATIVE,))
  library = self._library()
  active_id = self._resolve_active_world_id(library)
  if not active_id:
    return
  my_world = state.my_world if isinstance(state.my_world, PersistedPlaySpace) else default_new_world_space()
  if not library.save_space(active_id, my_world, game_mode=world_game_mode_from_creative(state.settings.creative_mode), thumbnail_bytes=my_world_thumbnail_bytes):
    raise OSError(f"failed to save My World package for active world {active_id}")`,
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
                'A persisted preferences file records the normalized runtime aggregate at the last save event. Defined lifecycle points issue the write; intermediate control adjustments remain live runtime state until then.',
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
            text: 'Bindings use portable text names. `portable_text_for_key` and `normalize_key_code` convert a Qt key code to a stable name without importing PyQt6, admitting ASCII, function, navigation, and modifier keys. `normalize_binding_text` folds arbitrary input to a single key: a plus or comma marks a rejected sequence, and an alias table maps `Ctrl` and `Control`, `Esc` and `Escape`, and related spellings to one canonical name. `binding_to_key` resolves a normalized binding to a Qt key code; unknown or empty bindings resolve to no key, and `display_text_for_binding` emits `Unbound` for that state.',
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
            text: 'Binding resolution is separate from capture. `ViewportInput` in `src/ludoxel/presentation/interface/input/game_input.py` owns mouse capture, cursor warping, relative-delta polling, and the override-cursor synchronisation. Its reset path clears the pressed keys, accumulated mouse delta, pending macOS relative delta, and capture-resume guard state. When gameplay capture is reacquired after an overlay, it clears stale delta, recenters once when native relative mode is unavailable, rejects center-position recenter events through the ordinary near-center threshold, and accepts the next real movement as gameplay input. On macOS it installs the keyboard event tap `MacosGameplayInputGuard` in `src/ludoxel/presentation/interface/input/macos_guard.py`, a Core Graphics tap that intercepts hardware key events and re-dispatches them to the native key handler while capture is active, swallowing the operating-system event. On other platforms that guard is absent and Qt key events flow directly through the adapter.',
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
      'Documents the overlay state machine and the input gate: every overlay transition and its capture handling, the resume path, the transient-modal counter, the loop predicates that freeze stepping, the precise inventory exception, and the visibility and ambient-audio predicates that deliberately diverge.',
    sections: [
      {
        id: 'overlay-input-blocking-state-machine',
        title: 'The Overlay State Machine',
        content: [
          {
            kind: 'paragraph',
            text: '`ViewportOverlays` in `src/ludoxel/presentation/interface/viewport/overlays/state.py` owns the blocking flags and their transitions. It holds independent flags for paused, dead, inventory-open, settings-open, and Othello-settings-open, with the two settings flags remembering whether to return to the pause menu on close. `set_paused`, `set_dead`, `set_settings_open`, `set_othello_settings_open`, and `set_inventory_open` enforce mutual exclusion: opening the pause menu clears the settings flags and closes the inventory, the death overlay clears pause and settings, and the inventory cannot open while a modal is already up. `any_modal_open` reports every overlay flag in that state machine, including a plain inventory.',
          },
          {
            kind: 'paragraph',
            text: 'Every transition calls `self._inp.reset` to clear the pressed-key set, accumulated mouse delta, pending macOS relative delta, and capture-resume guard state, and the modal transitions release mouse capture. `_resume_gameplay` and its deferred form re-acquire capture, restart the runner, and re-raise the gameplay HUD only when no overlay remains. The capture reacquisition uses the post-close cursor baseline, so movement gathered while an overlay was active is discarded before camera input resumes.',
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
            text: 'When the predicate holds, the runner receives no update and stepping halts, freezing gravity, movement, AI actors, and the simulation clock. The pause overlay, death overlay, settings overlay, Othello settings overlay, AI settings dialog flag, a transient modal counted by `_begin_transient_modal` and `_end_transient_modal`, and loading state each independently halt stepping.',
          },
        ],
      },
      {
        id: 'overlay-input-blocking-inventory',
        title: 'The Inventory Exception',
        content: [
          {
            kind: 'paragraph',
            text: 'The inventory overlay is absent from the stepping gate. `set_inventory_open` releases mouse capture and resets the input adapter, clearing pressed keys, accumulated mouse delta, and capture-resume guards while leaving the player with no movement or look input; `inventory_open` is outside the gate conditions. Closing the overlay reacquires capture from the post-close cursor baseline. Gravity, falling blocks, and AI actors continue advancing while the inventory is open, with neutralized input holding the player still.',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              'Pause, death, settings, Othello settings, the AI settings flag, a transient modal, and loading freeze the simulation: the runner is not updated and no step runs.',
              'The inventory overlay continues the simulation but neutralizes input by releasing capture and clearing the pressed-key set.',
              'Every modal transition resets input; modal transitions release capture, and resuming gameplay re-acquires capture from a fresh cursor baseline and restarts the runner.',
            ],
          },
          {
            kind: 'note',
            note: {
              type: 'warning',
              content: 'The stepping gate names the overlays that freeze simulation. The inventory overlay removes player input while gravity and AI continue running.',
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
            text: '`_gameplay_hud_active`, `_debug_hud_active`, `_sync_gameplay_hud_visibility`, and the related helpers in `src/ludoxel/presentation/interface/viewport/overlays/state.py` hide the hotbar, crosshair, route overlay, and player and AI name tags when an overlay, chat, or HUD-hidden state removes the gameplay surface. The route overlay has a separate content gate: draft route-edit feedback can show while editing, while completed route paths require the F3 Debug HUD to be visible. `_ambient_audio_active` is narrower: loading, death, pause, and Othello settings stop the ambient source, while the inventory, chat, HUD-hidden state, ordinary settings surface, and AI settings surface leave the My World ambient loop under the same `AudioManager` key. The inventory therefore behaves as an input-neutral storage surface, not as an audio reset boundary. The navigation between overlays is wired in `src/ludoxel/presentation/interface/viewport/controllers/overlay_navigation.py`, whose `open_pause_menu`, `resume_from_overlay`, `switch_play_space`, `open_settings_from_pause`, `back_from_settings`, `on_inventory_closed`, and `save_and_quit` drive the state machine and synchronise the surfaces.',
          },
          {
            kind: 'paragraph',
            text: '`route_overlay_paths` in `src/ludoxel/presentation/interface/viewport/controllers/ai.py` builds draft paths from the active route-edit points and builds completed paths from the active session route snapshots only while `_debug_hud_active()` is true. `completed_route_color_hex` in `src/ludoxel/presentation/interface/hud/route_overlay.py` derives the completed-route color from the actor id, so path color is stable across actor-list order changes and overlay rebuilds. `RouteOverlayWidget` owns the final screen projection: point markers are projected individually, and line drawing clips each route segment against the conservative view volume before screen conversion, so a segment remains visible while any part of it crosses the viewport and is skipped only when the whole segment is outside the overlay bounds.',
          },
        ],
      },
    ],
    relatedTitles: ['Using the Inventory Overlay', 'Recovering after Death', 'Understanding Keybind Resolution', 'Understanding the Chat Runtime and Command Routing'],
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
            text: [
              '`RendererBackend` in `src/ludoxel/presentation/rendering/backends/opengl/runtime/backend.py` requires an OpenGL 4.3 Core Profile context. `_require_gl43_core_context` raises with the context details unless the version, the core profile, and the GLSL version are sufficient, because the chunk face payload is built by a compute shader that needs that floor. `initialize` probes the context, loads shader programs, the texture atlas, and the skin texture into `GLResources`, builds a `BlockVisualResolver`, initializes each pass with its program and resources, assembles the `FramePipeline`, constructs the `TextureAnimationController`, and applies runtime state. `GLResources.load` compiles every program with `ShaderProgram.from_files` from the ',
              {
                kind: 'link',
                label: 'shared shader source',
                href: '/docs/systems/rendering-backends/backend-implementations/understanding-shared-shader-sources-and-color-targets',
              },
              ', so the Windows path consumes the GLSL 330 source directly with no dialect adaptation.',
            ],
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
              'As background, draw the Ultra veiling glare when the view faces the sun, then the camera-facing sun billboard; neither writes depth. Then enable the depth test.',
              'Draw the world pass with shadow, fog, and selection tint, then falling blocks and block-break particles; the opaque world overdraws the background glare and disc where geometry stands.',
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
        id: 'opengl-rendering-dynamic-instance-upload',
        title: 'Per-Frame Instance Uploads for Moving Faces',
        content: [
          {
            kind: 'paragraph',
            text: 'The falling-block, block-break-particle, player-model, and first-person arm, held-block, and special-item passes all draw through `TexturedFacePass` in `src/ludoxel/presentation/rendering/backends/opengl/passes/textured_face.py`. Each frame the row builders emit six per-face arrays of transform-instanced rows; every row is a row-major model matrix flattened to sixteen floats followed by a four-component atlas UV rect, and the matrix carries the position, orientation, and scale of that instance. These objects change pose every frame, so the builders allocate fresh `numpy` arrays on each call and the array handed to the pass is not a stable identity across frames.',
          },
          {
            kind: 'paragraph',
            text: '`TexturedFacePass.draw` uploads the current rows for every non-empty face into that face’s stream-draw instance buffer immediately before the instanced draw, and skips a face whose row count is zero. The pass retains no previously uploaded array, so a moving object draws from a buffer holding the transform and UV rect built for the frame in flight. `PlayerModelPass.draw_shadow` applies the same rule to the player shadow and uploads current `shadow_rows` before the instanced shadow draw.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/backends/opengl/passes/textured_face.py',
            code: `for face_idx, rows in enumerate(face_rows):
  if rows.size <= 0 or int(rows.shape[0]) <= 0:
    continue
  mesh = self._meshes[int(face_idx)]
  mesh.upload_instances(rows)
  glBindVertexArray(int(mesh.vao))
  glDrawArraysInstanced(GL_TRIANGLES, 0, int(mesh.vertex_count), int(rows.shape[0]))`,
          },
        ],
      },
      {
        id: 'opengl-rendering-runtime-and-preview',
        title: 'Runtime State and Offscreen Preview',
        content: [
          {
            kind: 'paragraph',
            text: '`apply_runtime_state` pushes the cloud flags, density, seed, flow, speed, and height variation into the cloud pass, the animation flag into the texture-animation controller, and the outline flag into the selection controller. `FramePipeline.render` reads the Ultra shadow-quality threshold once for the sun pass and cloud pass. `SunPass.draw` passes that value into `sun.frag`, whose lower branch keeps the simple billboard and whose Ultra branch draws a circular disc with halo. `CloudPass.draw` obtains visible cloud clusters from `CloudField.visible_shapes`, whose culler tests the shifted footprint extents against the view and skips only clusters confirmed outside the camera bounds, then draws exterior cell faces below Ultra or a neighbor-aware raymarched volume at Ultra. `set_cloud_motion_paused` and `set_texture_animation_paused` freeze motion for overlays. `render_player_preview_frame` renders a single player pose into an offscreen framebuffer created by `_ensure_preview_target`, reads the pixels back as an image, and restores the prior framebuffer and viewport; the pause and AI-settings preview surfaces consume this path. The thin wrapper `Renderer` in `src/ludoxel/presentation/rendering/contracts/api.py` forwards every backend call and is where the backend is selected.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                '`src/ludoxel/presentation/rendering/backends/opengl/` supplies this backend path. WGPU uses its own clip-space conversion, chunk-mesh path, and camera-roll handling under `src/ludoxel/presentation/rendering/backends/wgpu/`; parity requires evidence from both implementations.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding WGPU Rendering', 'Understanding Shared Shader Sources and Color Targets', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding WGPU Rendering',
    description:
      'Documents the WGPU backend end to end: device, surface, and resource construction, the clip-space conversion, the frame-uniform layout, the CPU per-face instance path and wireframe emulation, the shared fog, shadow, light-space, and selection contracts, the full pass order, the offscreen player preview, and the confirmed differences from OpenGL.',
    sections: [
      {
        id: 'wgpu-rendering-device',
        title: 'Device, Surface, and Resources',
        content: [
          {
            kind: 'paragraph',
            text: [
              '`WgpuRendererBackend` in `src/ludoxel/presentation/rendering/backends/wgpu/runtime/backend.py` requests a high-performance WebGPU adapter and device through wgpu-native, configures the canvas surface, and builds its pipelines from GLSL 450 modules adapted from the ',
              {
                kind: 'link',
                label: 'shared shader source',
                href: '/docs/systems/rendering-backends/backend-implementations/understanding-shared-shader-sources-and-color-targets',
              },
              '. `initialize` creates the camera bind-group layout and one uniform buffer per face, builds the texture atlas and its bind group, the shadow bind-group layout, the player skin and special-item textures, and the world, shadowed, wireframe, sun, cloud, Othello, shadow-depth, transform-shadow, textured-face, and selection pipelines, all held in `WgpuRendererResources`. The color target uses a `depth24plus` depth texture and the shadow target uses a `depth32float` texture with a comparison sampler.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The surface color format is fixed by `configure_wgpu_canvas` in `src/ludoxel/presentation/rendering/backends/wgpu/runtime/surface.py`. It reads the adapter-preferred format and passes it through `linear_color_target_format`, which drops a trailing `-srgb` suffix, so the configured surface and every pipeline target store fragment output without an automatic linear-to-sRGB encode. The block atlas is uploaded as `rgba8unorm` and sampled raw, matching the OpenGL backend, which uploads a `GL_RGBA` atlas and renders to its default framebuffer with no sRGB encode. Both backends therefore run the shared lighting and fog math on raw atlas texels and store the result unencoded, so the WGPU image carries the same tone and contrast as the OpenGL image rather than the lighter, lower-contrast output a preferred `-srgb` surface would produce.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/backends/wgpu/runtime/surface.py',
            code: `def linear_color_target_format(preferred_format) -> str:
  fmt = str(preferred_format)
  if fmt.endswith(_SRGB_SUFFIX):
    return fmt[: -len(_SRGB_SUFFIX)]
  return fmt`,
          },
          {
            kind: 'paragraph',
            text: 'WGPU clip space uses a zero-to-one depth interval. `_opengl_clip_to_wgpu` corrects every view-projection matrix before upload. `_frame_uniform_bytes` packs the view-projection and light view-projection, the sun direction, the selection tint and mode and block, the fog parameters, and the shadow texel, darkness, bias, and PCF radius into a fixed-width uniform consumed by the shaders.',
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
            text: 'The WGPU backend does not use the compute payload builder. Its `submit_chunk` discards the GPU face sources and shadow faces and uploads CPU-built face rows through `upload_chunk_mesh` into a `WgpuChunkMesh`. Transient geometry such as falling blocks, particles, player skins, held blocks, and Othello pieces is built into per-face instance rows each frame by the row builders and uploaded into temporary vertex buffers, drawn with per-face camera bind groups, and destroyed after the frame’s commands are submitted, so a moving object never carries a prior frame’s instance buffer into the next. `set_selection_target` builds the outline vertices inline and `_refresh_selection_buffer` uploads them. This per-face CPU instancing is the structural difference from the OpenGL backend, which builds chunk payloads on the GPU.',
          },
          {
            kind: 'paragraph',
            text: 'World wireframe uses CPU-side emulation. `_front_facing_world_rows` and `_front_facing_cloud_rows` filter front-facing rows so the WGPU line list matches the edges produced by OpenGL back-face culling and polygon-line mode.',
          },
        ],
      },
      {
        id: 'wgpu-rendering-shared',
        title: 'Shared Contracts and Pass Order',
        content: [
          {
            kind: 'paragraph',
            text: 'The WGPU backend imports the same render-contract helpers as the OpenGL backend: `render_distance_fog_range`, `cloud_fog_range`, `effective_backend_shadow_params`, `max_unfogged_render_distance_radius_blocks`, the `GeometryDistanceFog` and `CloudDistanceFog` types, `compute_light_view_proj`, the `SelectionOutlineBuilder`, the `BlockVisualResolver`, and the `CloudField`. `CloudField.visible_shapes` shifts each cloud by its per-cloud speed, projects the footprint extents against the camera basis, and returns a cluster unless its rendered volume lies outside the conservative view bounds. Cloud visibility, face rows, volume rows, fog math, shadow coverage, light-space construction, and selection-outline geometry are therefore shared between backends. The WGPU render method reads the Ultra shadow-quality threshold for the same sun and cloud decisions as the OpenGL frame pipeline. The frame is drawn in the same sequence as the OpenGL pipeline.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Render the shadow depth pass from chunk meshes, player transform casters, and Othello pieces.',
              'Begin the main pass clearing to the fog color; as background, draw the Ultra veiling glare when the view faces the sun through `create_sun_glare_pipeline`, then the camera-facing sun billboard; neither writes depth.',
              'Draw the world, shadowed or plain, or the emulated wireframe; the opaque world overdraws the background glare and disc where geometry stands.',
              'Draw falling blocks, block-break particles, player skins, and held blocks.',
              'Draw the Othello board, pieces, and highlight overlay; then clouds; then the selection lines.',
              'Begin a separate first-person pass with depth cleared and draw the special item, held block, or arm.',
            ],
          },
        ],
      },
      {
        id: 'wgpu-rendering-preview',
        title: 'Offscreen Player Preview',
        content: [
          {
            kind: 'paragraph',
            text: '`render_player_preview_frame` draws a single third-person player into an offscreen color texture for the pause, inventory, and AI-settings surfaces. It builds the pose with `build_player_model_pose`, allocates a color and depth texture, and opens one render pass that first draws `pose.skin_face_rows` with the skin bind group and then draws the third-person held block from `_third_person_held_block_face_rows(pose.held_block_pose)` with the atlas bind group, before reading the texture back as a `QImage`. The held block uses the same per-face instance path and `held_block_model_boxes_for_kind` geometry as the main third-person model, so the block held in the selected hotbar slot appears in the preview and changes with the slot. This matches the OpenGL preview, whose `draw_world` path already emits the held block alongside the skin.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/backends/wgpu/runtime/backend.py',
            code: `held_rows = self._third_person_held_block_face_rows(pose.held_block_pose)
held_uniform_buffers, held_uniform_bind_groups = self._create_frame_uniform_bind_groups(
  label="ludoxel-preview-held-frame", view_proj=view_proj, tint_value=0.0, sel_mode=0, sel_block=None
)
self._draw_transform_buckets(render_pass, buckets=held_rows, texture_bind_group=self._res.atlas_bind_group, label="ludoxel-preview-held-temp", camera_bind_groups=held_uniform_bind_groups)`,
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'The preview clears its own color and depth and composes the skin and held block from the shared pose builder and held-block geometry. Equivalence with the OpenGL preview is claimed only for that shared pose and geometry, not for the offscreen framebuffer construction or pixel readback, which each backend implements separately.',
            },
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
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding Shared Shader Sources and Color Targets', 'Understanding Render Distance Fog and Shadows', 'Understanding Selection Outlines'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'Backend Implementations',
    title: 'Understanding Shared Shader Sources and Color Targets',
    description:
      'Documents the backend-neutral shader source owner and its include preprocessing, the OpenGL direct-compile path and the WGPU dialect adaptation that both derive from it, the color and lighting and fog and shadow and selection math fixed by the shared GLSL, the WGPU-only clip-space conversion, uniform blocks, bind groups, and non-sRGB color target, and the parity range each derivation supports.',
    sections: [
      {
        id: 'shared-shaders-source-owner',
        title: 'The Shared Shader Source Owner',
        content: [
          {
            kind: 'paragraph',
            text: 'The GLSL stage files and the `common/` includes live once under `src/ludoxel/presentation/rendering/shaders/`, outside either backend directory. `src/ludoxel/presentation/rendering/shaders/source.py` owns the root resolution and the include preprocessing: `shader_source_root` returns that directory, `expand_shader_source` reads a stage file and expands every `#include "..."` directive against the including file, and `load_shader_source` joins a stage name to the root and expands it. Include resolution is recursive and tracks the active include stack, so a cycle raises rather than recursing without bound. The `chunk_face_payload.comp` compute source, the world, shadow, sun, cloud, selection, Othello, player-model, and first-person stages, and the `distance_fog.glsl` and `face_instance.glsl` includes are all read from this one owner.',
          },
          {
            kind: 'paragraph',
            text: 'The loader exposes one dialect control. `collapse_blank_before_include` is false for the OpenGL path, which preserves the source layout verbatim, and true for the WGPU path, which removes a blank line standing immediately before an expanded include. That flag changes only inert whitespace ahead of included text; it does not alter any declaration, statement, or value the compiler reads.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/shaders/source.py',
            code: `def load_shader_source(name: str, *, collapse_blank_before_include: bool = False) -> str:
  return expand_shader_source(shader_source_root() / str(name), collapse_blank_before_include=bool(collapse_blank_before_include))`,
          },
        ],
      },
      {
        id: 'shared-shaders-opengl-path',
        title: 'The OpenGL Direct-Compile Path',
        content: [
          {
            kind: 'paragraph',
            text: '`GLResources.load` in `src/ludoxel/presentation/rendering/backends/opengl/runtime/resources.py` resolves `shader_source_root()` and compiles each program from it with `ShaderProgram.from_files`. `ShaderProgram` in `src/ludoxel/presentation/rendering/backends/opengl/gl/shader_program.py` delegates its include expansion to `expand_shader_source` and hands the GLSL 330 text to the GL compiler unchanged, so the desktop-GL source is the dialect the Windows backend compiles. The attribute locations the pipeline binds come from the `layout(location = ...)` qualifiers already written in the vertex sources, and the loose `uniform` declarations are set through the `glUniform*` helpers on `ShaderProgram`. The block atlas is uploaded with the `GL_RGBA` internal format and the backend renders to its default framebuffer, neither of which applies an sRGB encode.',
          },
        ],
      },
      {
        id: 'shared-shaders-wgpu-adaptation',
        title: 'The WGPU Dialect Adaptation',
        content: [
          {
            kind: 'paragraph',
            text: '`src/ludoxel/presentation/rendering/backends/wgpu/pipelines/factory.py` derives the WGPU modules from the same files. `_wgpu_glsl_source` loads a stage through `load_shader_source`, applies `_adapt_wgpu_glsl`, and rewrites the version line to `#version 450 core`. `_adapt_wgpu_glsl` rewrites the desktop-GL declarations into the dialect wgpu-native accepts: it adds explicit `layout(location = ...)` qualifiers to the inter-stage varyings, replaces the loose `uniform` declarations with `set = 0` uniform blocks, splits each combined sampler into a `texture2D` and a `sampler` bind-group entry, flips the shadow lookup in clip-to-texture space, and substitutes a determinant-guarded inverse-transpose helper for `transpose(inverse(...))`. The fog uniform declarations are removed because the uniform block already carries those fields. The lighting, fog, shadow, selection, and atlas-sampling statements in each shader body are left intact, so the adaptation rewrites interface declarations and leaves the color computation as authored.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/backends/wgpu/pipelines/factory.py',
            code: `def _wgpu_glsl_source(filename: str) -> str:
  name = str(filename)
  text = load_shader_source(name, collapse_blank_before_include=True)
  text = _adapt_wgpu_glsl(name, text)
  lines = text.splitlines()
  version_idx = next((i for i, line in enumerate(lines) if line.strip().startswith("#version")), None)
  if version_idx is None:
    raise RuntimeError(f"Shader is missing #version: {filename}")
  rest = lines[:version_idx] + lines[version_idx + 1 :]
  return "\\n".join(("#version 450 core", *rest)) + "\\n"`,
          },
        ],
      },
      {
        id: 'shared-shaders-boundary',
        title: 'Shared Math and Backend-Specific Targets',
        content: [
          {
            kind: 'paragraph',
            text: 'The vertex transforms, normal and UV handling, the sun lighting terms, the fog mix, the shadow percentage-closer filtering, the selection tint, and the atlas sampling are written once in the shared GLSL, so both backends evaluate the same color math by construction. Each backend retains the work its API requires around that math. The derivation runs as one sequence per stage.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'The shared owner reads the stage file and expands its includes.',
              'The OpenGL backend compiles the expanded GLSL 330 directly through `ShaderProgram`.',
              'The WGPU backend adapts the expanded source into the GLSL 450 dialect, rewrites the version line, and builds a pipeline module.',
              'Each backend binds its own vertex buffers, uniform storage, and color target to that module.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The backend-specific surface state is what makes the stored result agree. The WGPU backend applies `_opengl_clip_to_wgpu` for the zero-to-one depth interval, packs its uniforms into blocks, and declares its bind-group layout, none of which the OpenGL backend shares. For color it configures the surface through `linear_color_target_format`, which selects the non-sRGB variant of the adapter-preferred format, so fragment output is stored without a linear-to-sRGB encode. With a raw `rgba8unorm` atlas matching the OpenGL `GL_RGBA` atlas and a non-sRGB target matching the OpenGL default framebuffer, the shared lighting and fog math is evaluated on the same inputs and stored with the same encoding on both backends.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'The color, lighting, fog, shadow, and selection math is identical because it is authored once in the shared GLSL, and the non-sRGB color target and raw atlas make the stored output match the OpenGL framebuffer rather than a lighter, lower-contrast sRGB-encoded surface. Areas each backend implements separately remain distinct: the zero-to-one clip-space depth correction, the uniform-block and bind-group layout, the CPU per-face chunk path against the OpenGL compute payload, and the `depth32float` shadow target against the OpenGL 24-bit depth. No pixel-level identity is claimed beyond the shared source and the matched color target.',
            },
          },
        ],
      },
      {
        id: 'shared-shaders-sun-optics',
        title: 'The Ultra Sun, Veiling Glare, and Lens Flare',
        content: [
          {
            kind: 'paragraph',
            text: 'The sun billboard is the shared `sun.frag`. Both tiers shape the disc through coverage alone in `ldx_sun_body`: a photospheric disc fills most of the billboard, a near-white hot core sits at its centre, and a thin warm corona rings the disc, with each radial term falling to zero before the quad border and an edge mask retiring coverage there, so the straight quad edge never clips a lit texel into a visible frame or corner. `ldx_simple_sun` and `ldx_ultra_sun` both call `ldx_sun_body` and differ only in the outer-glow weight, so neither tier draws a square-masked billboard. `half_angle_deg` in `BackendSunParams` sets the billboard half-angle that both backends read, so the disc subtends a fixed apparent size. The emitted color is dominated by the black-body white of the core and disc, and the falloffs do not pre-attenuate it, so alpha blending over the sky brightens toward the disc rather than pulling a dark ring around it. The `u_ultra` value both backends carry in the sun-mode uniform selects the outer-glow branch.',
          },
          {
            kind: 'code',
            language: 'glsl',
            caption: 'sun.frag; the sun-mode dispatch shared by both backends',
            code: `void main() {
    if (u_mode > 0.5) {
        vec4 glare = ldx_sun_glare(v_uv, u_glare);
        if (glare.a < 0.003) {
            discard;
        }
        fragColor = glare;
        return;
    }
    if (u_ultra < 0.5) {
        fragColor = ldx_simple_sun(v_uv);
        return;
    }
    vec4 sun = ldx_ultra_sun(v_uv);
    if (sun.a < 0.01) {
        discard;
    }
    fragColor = sun;
}`,
          },
          {
            kind: 'paragraph',
            text: 'The Ultra tier also draws a veiling glare when the view faces the sun. The sun-mode uniform carries a glare flag and a strength; `ldx_sun_glare` whitens a camera-facing billboard most strongly toward the sun center and thins outward, and `sun_glare_strength` in `src/ludoxel/presentation/rendering/contracts/config.py`, read by both backends, scales it by the squared view-to-sun alignment and the sun elevation, so the veil falls to zero when the sun sits behind the camera or near the horizon. The billboard is a flat card whose surface resolves to a single world depth, so depth-testing it against the world buffer cut a hard line where that depth crossed the fogged terrain and framed the veil against the sky beyond the fog band. The glare therefore draws as background before the world pass, together with the sun disc: the OpenGL `SunPass.draw_glare` runs before the world with the depth test disabled, and the WGPU backend issues the `create_sun_glare_pipeline` draw before the world. Neither writes depth, so the opaque world drawn next overdraws the veil wherever geometry stands, and world geometry nearer than the sun occludes the glow at the terrain silhouette instead of the glow painting over foreground blocks.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'The disc shape, the glare shader, and the glare strength are shared source evaluated the same way on both backends. Both draw the glare and the disc as background before the world pass and neither writes depth, so the opaque world overdraws them and occludes the glow at the terrain silhouette. The disc and the veil are handled the same way on both backends.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The Ultra tier also composites a screen-space lens flare. `sun_flare_screen` in `src/ludoxel/presentation/rendering/contracts/config.py`, read by both backends, projects the sun position through the same view-projection the sun billboard uses, returns its normalized device coordinates, and derives a strength that falls to zero when the sun sits behind the camera, off the screen by a wide margin, near the horizon, or when the view turns well away from it. `sun_flare.frag` runs over a fullscreen triangle emitted by `sun_flare.vert` and places ghost discs along the axis through the sun screen position and the frame center, mirroring the source across the optical axis, with a warm-to-cool tint variation and a soft halo, and fades the whole overlay by that strength. The OpenGL `SunPass.draw_flare` and the WGPU `create_sun_flare_pipeline` draw it as background before the world pass, together with the sun disc and the veiling glare; the fullscreen triangle writes no depth, so the opaque world drawn next overdraws it and geometry nearer than the sun occludes it at the block silhouette. It is gated to the Ultra tier alongside the glare.',
          },
          {
            kind: 'note',
            note: {
              type: 'note',
              content:
                'The flare is occluded by the world overdraw, the same mechanism that occludes the sun disc and the glare: all three draw as background before the world and write no depth, so a block that hides the sun hides its flare at that block silhouette without a depth query. The elevation and view-alignment terms in `sun_flare_screen` still fade the flare as the sun nears the horizon or the view turns away.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding OpenGL Rendering', 'Understanding WGPU Rendering', 'Understanding Render Distance Fog and Shadows'],
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
            text: 'Render distance is configured in chunks and converted to a horizontal block radius by `render_distance_radius_blocks` in `src/ludoxel/presentation/rendering/contracts/config.py`. `render_distance_fog_range` derives the geometry fog from that radius and the camera far plane: the end distance is the smaller of the radius and the far plane, and the start distance is a fixed fraction of the end, so fully fogged geometry is reached before the hard far-plane clip. `cloud_far_distance` derives a separate cloud reach whose value is the render radius scaled by five, raised to a three-hundred-and-twenty-block floor so the sky stays wider than the world chunk radius even at a narrow render distance, and `cloud_fog_range` fades over that reach without capping it at the camera far plane. `CloudField.set_view_radius` in `src/ludoxel/presentation/rendering/visuals/worlds/cloud_field.py` generates cloud shapes out to that same reach, so clouds fill the horizon the fade covers rather than ending at a fixed radius short of it. `cloud_projection_z_far` gives the cloud pass its own far plane covering that reach, so the cloud fade is decoupled from both the geometry fog and the world camera far plane.',
          },
          {
            kind: 'math',
            math: {
              expression:
                'e_{\\text{geom}} = \\min\\bigl(\\mathrm{rd}\\cdot\\mathrm{CHUNK},\\ z_{\\mathrm{far}}\\bigr), \\qquad e_{\\text{cloud}} = \\max\\bigl(5\\,\\mathrm{rd}\\cdot\\mathrm{CHUNK},\\ 320\\bigr), \\qquad s = 0.85\\,e',
              displayMode: true,
              caption: 'render_distance_fog_range and cloud_far_distance; both fade ranges start at the same fraction of their end, but the cloud reach is not capped at the camera far plane.',
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
            text: [
              'Both backends consume one fog factor defined once in `src/ludoxel/presentation/rendering/shaders/common/distance_fog.glsl` and pulled into each geometry and cloud shader through its `#include` directive. `ldx_geometry_fog_factor` measures three-dimensional distance, `ldx_cloud_fog_factor` measures horizontal distance, and `ldx_apply_geometry_distance_fog` mixes toward the fog color by the factor. A range with end at or below start returns zero, disabling the fade. The OpenGL program and the WGPU module are both derived from that single file through the ',
              {
                kind: 'link',
                label: 'shared shader source',
                href: '/docs/systems/rendering-backends/backend-implementations/understanding-shared-shader-sources-and-color-targets',
              },
              ' loader.',
            ],
          },
          {
            kind: 'code',
            language: 'glsl',
            caption: 'distance_fog.glsl, shared by both backends',
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
        id: 'fog-shadows-sun-shafts',
        title: 'Ultra Sun-Direction In-Scattering',
        content: [
          {
            kind: 'paragraph',
            text: 'The Ultra tier modulates that same fog toward the sun. `ldx_apply_sun_shafts` in the shared `distance_fog.glsl` adds warm in-scattered light to a fogged surface, weighted by the geometry fog factor and by the alignment of the view ray with the sun direction, so the term rises only where a surface sits far enough to lie in the fog band and its view ray runs toward the sun. A near surface carries no fog weight and a surface turned away from the sun carries no alignment, so scene depth and view direction govern where the crepuscular light lands rather than a flat screen overlay. `world.frag` and `world_no_shadow.frag` add the term under the `u_ultra` gate, which both backends raise only when the shadow-map quality reaches Ultra, so every lower tier leaves the fogged color unchanged.',
          },
          {
            kind: 'code',
            language: 'glsl',
            caption: 'distance_fog.glsl; the Ultra sun-shaft term reuses the geometry fog factor',
            code: `vec3 ldx_apply_sun_shafts(vec3 color, vec3 worldPos, vec3 camPos, vec3 sunDir, float fogStart, float fogEnd) {
    float fogAmt = ldx_geometry_fog_factor(worldPos, camPos, fogStart, fogEnd);
    if (fogAmt <= 0.0) {
        return color;
    }
    vec3 viewVec = worldPos - camPos;
    vec3 viewDir = viewVec / max(length(viewVec), 1e-4);
    float sunAlign = max(dot(viewDir, normalize(sunDir)), 0.0);
    float shaft = pow(sunAlign, 6.0) * fogAmt;
    vec3 shaftColor = vec3(1.00, 0.86, 0.62);
    return color + shaftColor * shaft * 0.55;
}`,
          },
          {
            kind: 'math',
            math: {
              expression: 's = \\max(\\hat{v}\\cdot\\hat{l},\\ 0)^{6}\\, f',
              displayMode: true,
              caption: 'The shaft weight: the sixth power of the view-to-sun alignment times the fog factor f, so warm light concentrates on distant geometry aligned with the sun.',
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
            text: 'Shadow quality is a discrete level from one to five. `ShadowQualityPreset` maps each level to a shadow-map size, a light-space coverage radius, and a PCF radius; `resolve_shadow_quality_preset` normalizes an arbitrary level to a valid preset, collapsing a missing or out-of-range value to the standard level. `effective_backend_shadow_params` substitutes the preset size, coverage, and PCF radius while keeping bias, slope bias, polygon offset, darkness, and stabilization from the base parameters. The OpenGL and WGPU frame paths also read the Ultra threshold as the visual gate for the volumetric cloud path and the Ultra sun disc branch. The coverage radius is a shadow-specific policy, not a function of render distance, so changing render distance does not degrade the texel density of a given quality level.',
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
                '`src/ludoxel/presentation/rendering` computes fog ranges, the shared fog factor, shadow quality presets, and light-space transforms from the corresponding preference values. Cloud-field generation and chunk culling follow their separate world-visual data and selection paths.',
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
            text: 'The result `BlockPick` carries the hit cell, the placement cell derived from the face neighbour offset, the entry parameter, the face, and the hit point; the placement cell is cleared when it is already occupied. Block-shape AABBs make picking respect slabs, stairs, fences, and walls. For a fence or wall, a downward ray that strikes near the top is reassigned to the top face so placement lands on the post.',
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
            text: 'The OpenGL backend wraps the builder in a `SelectionController` and draws the result through the selection pass in `src/ludoxel/presentation/rendering/backends/opengl/passes/selection.py`; the WGPU backend builds the same line vertices in `set_selection_target` and draws them with its selection pipeline. Both backends key selection on the picked cell, its state, and a six-neighbour state signature. A changed block or surrounding state rebuilds the outline; `_refresh_selection_for_frame` refreshes the selection on its cadence and clears it when nothing is targeted.',
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
      'Documents how the third-person player and AI bodies are posed: the shared pose builder and its shadow rows consumed by both backends, the visual-side mapping that does not match the variable names, the delayed body yaw with a bounded head separation, the pure-strafe body turn that leaves head direction intact, the shoulder-pivoted idle arm sway, and the forward attack swing that keeps the arm and held item clear of the torso.',
    sections: [
      {
        id: 'player-model-pose-shared-builder',
        title: 'One Pose Builder Feeds Both Backends',
        content: [
          {
            kind: 'paragraph',
            text: '`build_player_model_pose` in `src/ludoxel/presentation/rendering/visuals/players/model_pose.py` turns one `PlayerRenderState` into a frozen `PlayerModelPose`. The pose holds the skin face rows, an optional `HeldBlockPose`, the special-item face rows and icon, the hurt-tint strength, a resolved skin key, and the `shadow_rows` instance matrices. The builder is wrapped in an `lru_cache` keyed on render state, so two actors in the same pose share one computation and a standing actor recomputes when its key changes. The OpenGL frame pipeline in `src/ludoxel/presentation/rendering/backends/opengl/pipelines/frame.py` and the WGPU backend in `src/ludoxel/presentation/rendering/backends/wgpu/runtime/backend.py` call `build_player_model_pose`, propagating a row-contract change to both renderers.',
          },
          {
            kind: 'paragraph',
            text: 'A first-person render state returns empty skin and held-item face rows while building full `shadow_rows`, because the local player casts a ground shadow when the body model is behind the camera. The shadow rows use the same head, body, arm, and leg matrices that produce visible skin, and the held block and special item append cube rows from the hand transform. Shared matrices keep corrected arm and held-item poses aligned with the body and ground shadow.',
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
        title: 'The Body and Head Trail the Look',
        content: [
          {
            kind: 'paragraph',
            text: '`PlayerMotionState` in `src/ludoxel/simulation/actors/player/kinematics.py` carries a runtime-only `visual_time_s` clock together with a `body_visual_yaw_deg`, a `head_visual_yaw_deg`, and a `head_visual_pitch_deg`. None are persisted; all are reset with the rest of the motion state on respawn. During each fixed step, after the look yaw and pitch are applied to the player, `_update_player_visual_animation` advances the clock and eases each visual angle toward the immediate look angle through the shared `_ease_angle_toward` helper. The AI manager advances its actors through the same `advance_runtime_player`, so every body, player and actor alike, trails its look the same way.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/player/kinematics.py',
            code: `def _ease_angle_toward(current, target, *, tau, dt, max_lag_deg):
  if current is None:
    return float(math.remainder(float(target), 360.0))
  diff = float(math.remainder(float(target) - float(current), 360.0))
  alpha = 1.0 - math.exp(-float(dt) / float(tau)) if float(tau) > 1e-6 else 1.0
  next_value = float(current) + float(diff) * float(alpha)
  remaining = float(math.remainder(float(target) - float(next_value), 360.0))
  if remaining > float(max_lag_deg):
    next_value = float(target) - float(max_lag_deg)
  elif remaining < -float(max_lag_deg):
    next_value = float(target) + float(max_lag_deg)
  return float(math.remainder(float(next_value), 360.0))`,
          },
          {
            kind: 'math',
            math: {
              expression:
                '\\alpha = 1 - e^{-\\Delta t / \\tau}, \\qquad \\psi \\leftarrow \\psi + \\alpha \\cdot \\operatorname{rem}\\!\\left(\\psi_{\\ell} - \\psi,\\ 360^{\\circ}\\right), \\qquad \\lvert \\psi_{\\ell} - \\psi \\rvert \\le \\Lambda',
              displayMode: true,
              caption:
                'Each visual angle ψ eases toward its look target ψ_ℓ with a time constant τ and is held within a maximum lag Λ. The body uses a longer τ and a large Λ; the head uses a short τ and a small Λ. The signed remainder takes the shortest path, so a turn past ±180° never spins the long way around.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The body follows with `PLAYER_BODY_YAW_FOLLOW_TAU_S` and is held within `PLAYER_HEAD_BODY_YAW_MAX_DEG` of the look, so it trails a turn and then catches up quickly. The head follows the look with the much shorter `PLAYER_HEAD_VISUAL_LAG_TAU_S` but is held within only `PLAYER_HEAD_VISUAL_YAW_LAG_MAX_DEG` of yaw and `PLAYER_HEAD_VISUAL_PITCH_LAG_MAX_DEG` of pitch, so during a fast turn the head trails the camera by at most a few degrees while the body trails further behind. `build_player_model_snapshot` emits `body_yaw_deg` as the visual body yaw after any pure-strafe body turn, then emits `head_yaw_deg` as the lagged visual head yaw relative to that body pose. The compensating relative head yaw keeps the visible head aimed at the head visual yaw while the body, limbs, held item, and shadow rows rotate with the body. The look yaw and pitch the player entity holds are unchanged, so camera placement, picking, placement, collision, the crosshair, and the first-person view keep responding to the turn with no delay.',
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
            text: 'The idle weight is the product of the complementary walk fraction and the complementary attack weight, reaching full strength while standing and idle before fading as the player walks or starts a swing. The idle clock advances every fixed step, changing render state for a static player and refreshing the cached pose for idle motion.',
          },
        ],
      },
      {
        id: 'player-model-pose-swing',
        title: 'The Attack Swing Clears the Torso',
        content: [
          {
            kind: 'paragraph',
            text: 'The render state carries first-person swing progress into the third-person body. `_third_person_swing_arm_angles` converts the progress into a forward shoulder pitch and a small outward roll for the main-hand arm. The pitch raises the arm forward from the shoulder, and the non-negative roll pushes the hand outward. The third-person transform uses no inward roll or yaw, keeping the hand and held item clear of the torso.',
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
              caption: 'The eased swing s_e drives forward pitch θ_x and outward roll ρ_z, sending the arm forward and to the side from the shoulder.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The forward pitch rotates the arm in the plane that holds its model `X`, keeping the hand on the outward side of the torso through the swing. A held block or special item anchored to that hand follows the forward motion. The held-item parent transform and shadow rows use the same arm matrices, so the visible swing, held item, and ground shadow follow one motion. Attack weight, derived separately from swing progress, damps walk swing and idle sway on the main hand during the strike.',
          },
        ],
      },
      {
        id: 'player-model-pose-movement-direction',
        title: 'Movement Direction Shapes the Limb Swing',
        content: [
          {
            kind: 'paragraph',
            text: '`build_player_model_snapshot` decomposes horizontal velocity in the look frame into signed `limb_forward_ratio` and `limb_strafe_ratio` values, each the dot product of velocity with the look forward or right basis over walk speed. The pose builder uses direction and raw speed for limb amplitude: the forward component drives the fore-and-aft stride, a negative forward component damps it, and the strafe component only contributes a smaller fore-and-aft step term so the feet keep their forward-facing animation. Overall speed still advances walk phase, keeping the alternating limb cadence in every direction.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/visuals/players/model_pose.py',
            code: `backward_scale = 1.0 if forward_ratio >= -1e-6 else _BACKWARD_SWING_SCALE
fore_aft_amp = 0.5 * abs(forward_ratio) * backward_scale
strafe_step = abs(clampf(strafe_ratio, -1.0, 1.0))
pitch_amp = clampf(fore_aft_amp + strafe_step * _STRAFE_FOREAFT_SCALE, 0.0, swing)
right_leg_rot_x = pitch_amp * walk_r
left_leg_rot_x = pitch_amp * walk_l
root = compose_matrices(translate_matrix(base_x, base_y, base_z), rotate_y_rad_matrix(body_yaw), translate_matrix(0.0, _MODEL_FEET_OFFSET_Y, 0.0))`,
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/actors/player/kinematics.py',
            code: `target = 0.0
if abs(strafe) > PLAYER_STRAFE_INPUT_EPS and abs(forward) <= PLAYER_STRAFE_INPUT_EPS:
  target = -strafe * PLAYER_STRAFE_BODY_TURN_MAX_DEG
alpha = 1.0 - math.exp(-dt / PLAYER_STRAFE_BODY_TURN_TAU_S)
motion.strafe_turn_deg = motion.strafe_turn_deg + (target - motion.strafe_turn_deg) * alpha`,
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/sessions/pipelines/player_model.py',
            code: `body_pose_yaw_deg = math.remainder(body_visual_yaw_deg + motion.strafe_turn_deg, 360.0)
head_yaw_rel_deg = math.remainder(head_visual_yaw_deg - body_pose_yaw_deg, 360.0)`,
          },
          {
            kind: 'math',
            math: {
              expression:
                'A_{fa} = \\tfrac{1}{2}\\,\\lvert f \\rvert\\,k_{back}, \\qquad A_{pitch} = \\operatorname{clamp}\\bigl(A_{fa} + \\lvert s \\rvert\\,c_{fa},\\ 0,\\ A_{swing}\\bigr), \\qquad \\theta \\leftarrow \\theta + (\\theta^{*} - \\theta)(1 - e^{-\\Delta t / \\tau})',
              displayMode: true,
              caption:
                'The fore/aft pitch amplitude A_pitch follows the forward ratio f, is damped by k_back while moving backward, adds a small strafe term, and is capped at the total-speed swing A_swing. The separate body-turn state θ eases toward θ* only for a pure left/right input, with τ = PLAYER_STRAFE_BODY_TURN_TAU_S.',
            },
          },
          {
            kind: 'paragraph',
            text: 'The fore-and-aft amplitude follows the magnitude of the forward ratio and is multiplied by `_BACKWARD_SWING_SCALE` when that ratio is negative, giving a backward step a shorter stride. A strafe keeps the same forward-facing fore-and-aft leg step. Body turning is owned by `PlayerMotionState.strafe_turn_deg`, not by `limb_strafe_ratio`: the state moves toward a bounded yaw only when the input is pure left or right, and it returns toward zero when a forward or backward component is present. `build_player_model_snapshot` adds that eased yaw to the body pose and subtracts the same pose from the head yaw relation, so the body, arms, legs, held block, and ground-shadow rows turn toward the sidestep while the visible head keeps its own visual heading.',
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
      'Documents material-driven audio in full: the sound groups and fallback chain, the block, surface, and player event catalogs, the audio sample pool, the manager routing for local feedback and remote world sources, the pooled-effect admission path with request-specific gain, the dedicated PCM one-shot mixer for weak and strong attacks, the volume categories, and the audio-output rebinding path that keeps both `QSoundEffect` slots and the attack mixer attached to the current platform output.',
    sections: [
      {
        id: 'material-sounds-groups',
        title: 'Sound Groups and the Fallback Chain',
        content: [
          {
            kind: 'paragraph',
            text: 'Each block definition names a sound group, defined in `src/ludoxel/simulation/blocks/sounds/groups.py`. `AudioManager.sound_group_for_block_state` resolves a block state to its group through the block registry and caches the result. Groups form a fallback chain so a specialised material can borrow a general one: `iter_sound_group_candidates` walks the `SOUND_GROUP_FALLBACKS` map until it terminates, then appends the default stone group. The playback path resolves the first candidate that defines a pool for the action and commits to that material; it does not advance to another material when the resolved pool is momentarily out of voices, so a placed block keeps its own sound during rapid placement instead of falling through to the default stone pool.',
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
            text: 'The catalogs in `src/ludoxel/presentation/audio/catalogs/material.py` map each group to its pools. `BLOCK_SOUND_CATALOG` carries break and place pools, with interactable wood groups also carrying open and close pools; `PLAYER_SURFACE_SOUND_CATALOG` maps each group to a footstep pool; and `PLAYER_EVENT_SOUND_CATALOG` in `src/ludoxel/presentation/audio/catalogs/player.py` holds landing, damage, weak attack, strong attack, and Othello event pools. `AudioManager._collect_named_pools` flattens every catalog into a keyed pool table at construction. Playback path selection occurs after the catalog has supplied the pool: landing, damage, and Othello events enter the pooled `QSoundEffect` path, while weak and strong attack events keep the same catalog metadata and enter the dedicated `PcmOneShotMixer` path in `src/ludoxel/presentation/audio/playback/manager.py`.',
          },
        ],
      },
      {
        id: 'material-sounds-pool',
        title: 'The Audio Sample Pool',
        content: [
          {
            kind: 'paragraph',
            text: '`AudioSamplePool` in `src/ludoxel/presentation/audio/types/events.py` is a frozen record naming its sample paths, an audio category, a selection mode, a spatial flag with a distance cutoff and size, a maximum polyphony, and a cooldown. `make_audio_pool` constructs one with a polyphony floor of one and a non-negative cooldown, and `indexed_paths` expands a numbered family such as the four place samples of a material. `prime_effects` pre-creates the effect slots for non-ambient pools so the first play begins from loaded effect objects.',
          },
        ],
      },
      {
        id: 'material-sounds-events',
        title: 'Where Events Originate and Resolve',
        content: [
          {
            kind: 'paragraph',
            text: 'Material and player events are emitted during the simulation step and routed at the presentation layer. The step result carries footstep, landing, gravity-break, and damage signals; the render loop in `src/ludoxel/presentation/interface/viewport/render_loop/loop.py` plays a local footstep or landing through `play_surface_event`, a gravity-broken block through `play_remote_interaction`, a local player damage hit through `play_player_event`, and each remote AI damage-hit position through `play_remote_player_event`. A landing plays only when the step result raises `play_landing_sound`, and the session step in `src/ludoxel/application/sessions/managers/stepping.py` withholds that flag on any step that applies fall damage, so a damaging landing plays the local damage hit under `play_damage_sound` and the landing sample plays only on a fall that did no damage. Player block interactions and placements emit their own break, place, and interact feedback through `play_interaction`, which splits an interaction into open and close variants by reading the block open property from its state. Left-click melee audio enters the player-event catalog separately: `_perform_left_click` in `src/ludoxel/presentation/interface/viewport/controllers/interaction.py` plays `PLAYER_EVENT_ATTACK_STRONG` after `attack_ai_player` accepts a target, plays the accepted target hit through `play_remote_player_event` when that target has a position, and plays `PLAYER_EVENT_ATTACK_WEAK` when the click ends without an accepted AI target and without a successful creative block break. Weak and strong attack events therefore remain local player events; target damage hits and world-origin material events use the remote route.',
          },
          {
            kind: 'paragraph',
            text: '`play_block_action` resolves the first candidate group that defines a pool for the action and plays only that pool, so an exhausted voice budget on the placed material no longer advances the candidate chain to the default stone pool; `play_surface_event` routes a footstep to `_play_surface_step` and a landing to `_play_landing_event`. Landing severity is distance-graded: a fall of at least twelve blocks plays the big landing sample, at least six blocks plays the small landing sample, and a shorter landing falls back to an ordinary surface step.',
          },
          {
            kind: 'paragraph',
            text: 'Remote world block actions share the same material pools as local player feedback. `AiPlayerManager` records each successful placement, break, and interaction as an `AiBlockSoundEvent` and returns them on `AiStepReport.block_sound_events`; the session step forwards them on `SessionStepResult.ai_block_sound_events`; and the render loop replays each one through `AudioManager.play_remote_interaction`. Gravity-broken blocks use the same remote interaction entrance after their break particles are spawned. The remote entrance resolves the same sound group fallback chain as local player feedback, but it requires a world position and a cached listener pose before playback can reach a pooled slot.',
          },
        ],
      },
      {
        id: 'material-sounds-playback',
        title: 'Admission, Polyphony, and Volume',
        content: [
          {
            kind: 'paragraph',
            text: 'Pooled `QSoundEffect` playback has separate local-feedback and remote-world entrances before it reaches the shared effect-slot allocator. `_play_local_pool` resolves only the category volume, so player block placement, block breaking, block interaction, footsteps, landings, local player damage, and Othello feedback remain outside listener cutoff and distance gain even when the simulation result carries a target or board position. `_play_remote_pool` requires a world position and a cached listener pose, checks the pool distance cutoff, multiplies the category volume by `spatial_distance_gain` for spatial pools, and refuses playback when the listener is absent, the position is absent, or the source lies outside the cutoff. Both entrances then call `_play_effect_pool`, which applies pool cooldown admission, searches for an idle prepared `QSoundEffect` slot, applies active-voice headroom to the request gain, calls `setVolume(final_volume)` immediately before `play()`, and records the voice hold interval. The voice search is pool-wide: `_play_effect_pool` ensures the slots of every prepared source, checks `has_idle_voice` in `src/ludoxel/presentation/audio/playback/effects.py`, and runs random or round-robin selection only across sources with an idle voice. A voice qualifies as idle only when its `QSoundEffect` is loaded, playback has ended, and the source hold interval recorded on `EffectVoiceSlot.busy_until_s` has passed. That hold interval comes from the WAV duration plus a small release pad in `src/ludoxel/presentation/audio/playback/sources.py`, so a pooled source keeps its voice reserved until the recorded audible tail has cleared even after the Qt playback state has cleared. When every reserved voice of every source is still busy, `_play_effect_pool` selects a source over the whole pool and reclaims its longest-playing voice through `steal_oldest_effect_slot` in `src/ludoxel/presentation/audio/playback/effects.py`: the stolen effect is stopped, restarted with the new request gain, and re-marked with its hold interval, so an event that passed cooldown admission always reaches a voice instead of being dropped under load.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/playback/manager.py',
            code: `request_volume = float(self._preferences.volume_for(pool.category))
if bool(pool.spatial) and float(pool.distance_cutoff) > 1e-6:
  if not self._listener_within_cutoff(position=position, cutoff=float(pool.distance_cutoff)):
    return False
  distance_gain = self._spatial_distance_gain(position=position, cutoff=float(pool.distance_cutoff))
  if float(distance_gain) <= 1e-6:
    return False
  request_volume = float(request_volume) * float(distance_gain)

return self._play_effect_pool(pool_key=str(pool_key), pool=pool, request_volume=float(request_volume))`,
          },
          {
            kind: 'paragraph',
            text: 'Every sound belongs to one of the categories in `src/ludoxel/application/preferences/audio.py`: master, ambient, block, or player. `AudioPreferences.volume_for` returns the product of master and the category factor, each clamped to the unit interval. Block break, place, and interact sounds use the block category; footsteps, landings, and damage hits use the player category. This category is a volume preference, not a spatial classification. Local feedback versus remote world source is decided by the render-loop route that consumed the event, and only the remote route applies listener cutoff and distance gain. The audio preference object is the boundary between the saved volume values and playback; the playback manager reads it and never alters simulation rules to make a sound.',
          },
          {
            kind: 'paragraph',
            text: 'Audio output recovery has two playback branches. `AudioManager` constructs `QMediaDevices`, listens for `audioOutputsChanged`, and schedules `_refresh_audio_output_bindings` through the Qt event loop. That refresh first retargets `self._player_attack_mixer`, then walks every prepared material and player `QSoundEffect` slot, and then retargets the ambient effect when one is live. `PcmOneShotMixer.retarget_default_audio_output` drops the current sink and opens a new one when attack voices remain active; the effect-slot branch stops and rebinds each `QSoundEffect` to the current default output. A Windows WASAPI endpoint invalidation therefore changes both the attack mixer sink and the existing effect-slot bindings; the sound-group fallback chain, event routing contract, category gain formula, and simulation state that emitted the sound remain unchanged.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/playback/manager.py',
            code: `self._player_attack_mixer.retarget_default_audio_output()

for prepared_group in tuple(self._prepared_sources.values()):
  for prepared in tuple(prepared_group):
    for slot in tuple(prepared.slots):
      self._retarget_effect_to_default_audio_output(slot.effect)`,
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
      {
        id: 'material-sounds-attack-pcm-mixer',
        title: 'Weak and Strong Attack PCM Mixing',
        content: [
          {
            kind: 'paragraph',
            text: '`AudioManager.play_player_event` intercepts `PLAYER_EVENT_ATTACK_WEAK` and `PLAYER_EVENT_ATTACK_STRONG` before the generic player-event path. `_play_player_attack_event` reads `PLAYER_EVENT_SOUND_CATALOG`, applies the player category gain, runs the pool cooldown admission, resolves existing WAV URLs, and then delegates to `PcmOneShotMixer.play`. The weak and strong attack pools in `src/ludoxel/presentation/audio/catalogs/player.py` are non-spatial, use zero cooldown, and carry twelve-voice limits; those catalog values control the PCM mixer call, and the attack branch bypasses the `QSoundEffect` allocation path for those two event names. The mixer remains scoped to weak and strong attack feedback; block, material, footstep, landing, damage, and Othello one-shots stay on prepared `QSoundEffect` slots.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/playback/manager.py',
            code: `def _play_player_attack_event(self, *, event_name: str) -> None:
  pool = PLAYER_EVENT_SOUND_CATALOG.get(str(event_name))
  if pool is None:
    return

  base_volume = float(self._preferences.volume_for(pool.category))
  if base_volume <= 1e-6:
    return

  pool_key = f"player_event:{event_name}"
  if not self._admit_pool_play(pool_key=str(pool_key), pool=pool):
    return

  urls = self._resolved_urls.get(str(pool_key))
  if urls is None:
    urls = self._resolve_existing_urls(pool)
    self._resolved_urls[str(pool_key)] = urls

  self._player_attack_mixer.play(
    urls=tuple(urls), pool_key=str(pool_key), selection_mode=str(pool.selection_mode), volume=float(base_volume), max_voices=int(pool.max_polyphony), random_source=self._random
  )`,
          },
          {
            kind: 'paragraph',
            text: '`PcmOneShotMixer` in `src/ludoxel/presentation/audio/playback/mixer.py` owns a single `QAudioSink` stream for rapid attack one-shots. `_ensure_sink` opens a stereo 44.1 kHz signed-16-bit format on the current default output device with an explicit 4096-frame sink buffer; `_sample_for_url` caches decoded WAV data as NumPy `int16` frame arrays; `_load_wav_as_stereo_44100_int16` accepts one-byte and two-byte PCM, converts mono or multichannel data into stereo, and resamples to the mixer rate through linear interpolation when the source rate differs. `_mix_frames` sums the active voices into an `int32` accumulation array with vectorized slice additions, clips to signed 16-bit range, and writes little-endian PCM frames; each pump tick refills every free frame of the sink buffer. The pump timer runs on the GUI thread, so the buffer depth — roughly 93 milliseconds — and the vectorized mix are what keep a render stall from draining the sink and audibly tearing the attack stream while the player walks and swings.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/playback/mixer.py',
            code: `voice_limit = max(1, min(_MAX_MIX_VOICES, int(max_voices)))
if len(self._active) >= voice_limit:
  self._active = self._active[-max(0, voice_limit - 1) :]

sample = self._pick_sample(pool_key=str(pool_key), selection_mode=str(selection_mode), samples=samples, random_source=random_source)
if sample is None:
  return False

self._active.append(_ActivePcmVoice(sample=sample, frame_index=0, volume=max(0.0, min(1.0, float(volume)))))`,
          },
          {
            kind: 'paragraph',
            text: 'The mixer bound acts as an active-voice ceiling. When the active list reaches the catalog voice limit, `PcmOneShotMixer.play` retains the newest `voice_limit - 1` voices, appends the new attack voice, starts the sink if necessary, and immediately pumps available frames. `_play_effect_pool` reclaims the oldest busy `QSoundEffect` voice for an admitted event; the attack mixer admits the new voice after trimming its active list. Repeated air-punch and accepted attack input therefore share a continuous output stream while the attack mixer remains inside `_MAX_MIX_VOICES` and the pool-specific `max_polyphony` bound.',
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
      'Documents the ambient audio loop in full: the ambient catalog and its single play-space key, the preference and play-space gating, the dedicated looping-effect lifecycle and its transition guard, the round-robin source rotation, the current-output rebinding path used after platform audio-device changes, and the boundary that keeps ambient audio distinct from material sounds.',
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
            text: '`ambient_desired_key` in `src/ludoxel/presentation/audio/playback/ambient.py` returns the My World key when ambient audio is enabled and the current play space is My World; every other play-space key resolves to no ambient key. The viewport supplies the enabled flag and current space through `AudioManager.set_ambient_active`. `_ambient_audio_active` in `src/ludoxel/presentation/interface/viewport/overlays/state.py` withholds that flag during loading, death, pause, and Othello settings, but it does not treat the inventory or chat as an ambient reset boundary. Effective volume is the product of master and ambient-category gain; an inaudible gain or absent key stops the effect and clears its source.',
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
            text: 'Round-robin selection in `_pick_existing_url` advances through the four samples on each restart, varying the loop across wind tracks. `_ensure_ambient_effect` creates one reusable effect and swaps its source. `set_preferences` re-applies ambient volume to that effect; pooled material and player slots receive their request gain immediately before each one-shot `play()` call.',
          },
          {
            kind: 'paragraph',
            text: 'The same manager also treats the ambient effect as an output-bound object. When Qt reports an output-device list change, `_refresh_audio_output_bindings` stops the ambient effect, assigns the current default audio output, and resumes only if an ambient key is still active and the ambient category remains audible. A device recovery therefore cannot resurrect muted ambient audio or start a loop in Othello; it only reattaches the already-authorized My World loop to the current desktop output.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/audio/playback/manager.py',
            code: `should_resume = self._ambient_key is not None and float(self._preferences.volume_for(AUDIO_CATEGORY_AMBIENT)) > 1e-6
self._ambient_transitioning = True
self._ambient_effect.stop()
self._retarget_effect_to_default_audio_output(self._ambient_effect)
self._ambient_transitioning = False`,
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
            text: '`AiPlayerManager.step` in `src/ludoxel/simulation/actors/ai_players/manager.py` advances every actor once per simulation quantum. It drains completed route plans from the worker, opens the learning tick, and for each non-paused living actor advances the attack swing, decays the attack, place, interact, and combat-strafe cooldowns, and computes a control input from the actor mode. The control is fed to `advance_runtime_player`, after which fall and void damage are applied, `_advance_ai_regeneration` runs for survivors, stuck recovery is updated, and discrete interactions, placements, and attacks are issued. Dead actors are removed and their pending plans cancelled; `AiStepReport` now separates player damage and killer metadata from `AiDeathLogEvent` rows for AI actors that died during the step.',
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
            text: '`_route_control` chases a combat target when one is present and otherwise advances toward the active route point, choosing pursuit, parkour, or turn-only controls while respecting flexible-route replanning. `_wander_control` issues periodic randomized headings updated by `_update_wander_state`, and `idle_control` issues no movement. Modes and their normalization live in `src/ludoxel/simulation/actors/ai_players/modes.py`; navigation, parkour, combat, placement, recovery, stuck, avoidance, and route modules provide the focused behaviours that the manager composes.',
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
            text: 'Each tick the actor follows the most recent completed plan; planning never blocks the step. `_mark_nav_failure` retries a failed plan with exponential backoff and, after enough retries, blacklists an unreachable route target for a cooldown. The actor turns during that cooldown.',
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
            text: '`DemonstrationRecord` in `src/ludoxel/simulation/actors/ai_players/learning/dataset.py` captures game state and action. It is a frozen dataclass holding a record kind drawn from `RECORD_KINDS`, a tick, an actor identifier, a serializable observation, an action identifier, a tri-valued success flag, an optional reward, and a kind-specific detail mapping. `encode_record_line` and `decode_record_line` serialize one record per line as JSON with sorted keys; a corrupt or truncated line decodes to no record. `DatasetSummary` records count, byte size, and per-kind tally, and `DatasetSink` is the write protocol implemented outside the simulation layer.',
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
            text: 'Records embed a serialized observation, and learning conditions on a derived feature-key set. `encode_features` in `src/ludoxel/simulation/actors/ai_players/learning/feature_encoder.py` maps observation state to stable keys for health thresholds, player distance and visibility, combat readiness, route state, hazards, terrain gaps, placement and breaking opportunities, and stuck signals. The encoder is versioned by `FEATURE_ENCODER_VERSION`, so policy compatibility can be checked against the feature vocabulary used to generate records.',
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
                '`DatasetSink` carries records across the simulation/application boundary. `AiLearningStore.dataset_writer` selects the JSON Lines path and writer beneath the runtime data root; decode, export, corrupt-line accounting, and retention follow `AiLearningStore` storage paths.',
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
            text: 'The action mask forms the safety boundary. `build_action_mask` in `src/ludoxel/simulation/actors/ai_players/learning/action_mask.py` derives, from the observation, the set of permitted actions and a reason for each forbidden one: moving into a void, launching while airborne, attacking out of range or on cooldown, placing where no face allows it, breaking the actor own footing, operating an absent fence gate, following a missing or blocked route, replanning without a route, or idling at low health within reach. View rotation and sneak remain permitted, keeping the allowed set non-empty. `AiActionMask.is_allowed` reports membership, and the policy adjusts utilities for permitted actions only.',
          },
        ],
      },
      {
        id: 'policy-evaluation-usability',
        title: 'The Usability Gate and Registry Fallback',
        content: [
          {
            kind: 'paragraph',
            text: '`Policy.is_usable` admits a policy when its schema version and compatibility target match the engine, its feature-encoder and action-catalog versions match or use legacy zero, and its evaluation records a pass. `builtin_deterministic_policy` is the always-usable baseline identity. `PolicyRegistry` in `src/ludoxel/simulation/actors/ai_players/learning/policy_registry.py` loads bundled artifacts once, resolves a requested policy by kind and identifier, and selects the built-in baseline for missing, broken, or unusable policies and user-loader exceptions. A defective artifact leaves AI operation available.',
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
            text: '`src/ludoxel/simulation/spaces/othello/engines/bitboards.py` supplies the bitboard representation used by the strong and exact search. Weaker difficulties operate on a list-based board through `src/ludoxel/simulation/spaces/othello/game/rules.py`; that representation carries the corresponding legal-move and flip semantics for its engine path.',
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
          {
            kind: 'paragraph',
            text: 'Below the root, the insane search runs in the compiled Othello engine when it is present. `InsaneSearchCache.ensure_native_search` holds one `InsaneSearch` session from `ludoxel.simulation.spaces.othello.engines._othello_native` — the PyO3 binding of the `native/ludoxel_othello` crate — and `_root_move_evaluations` sends each root move’s subtree into the compiled `negamax` and `solve_exact`, which own their transposition tables under the same soft-limit clearing policy the Python cache applies and expose the root ordering hint through `root_best_move`. The pure Python search in `search.py` remains the fallback owner when the compiled module is absent, both implementations raise `TimeoutError` on a deadline overrun so iterative deepening truncates identically, and bitboard primitives, evaluations, fixed-depth searches, and exact endgame solves return bit-identical values across the two paths; within the same time budget the compiled subtree search reaches greater depths.',
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
                '`src/ludoxel/simulation/spaces/othello/` implements the Ludoxel Othello search. Its engine consults opening and learning books as move sources, while the persistence store determines their on-disk form and the worker keeps search off the interface thread.',
            },
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Othello AI Turns', 'Changing Othello AI Strength', 'Changing Othello Book Behavior', 'Building the Rust Othello Engine Extension'],
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
            text: '`src/ludoxel/foundations/identity/version.py` owns the runtime version identity as one assigned string. `pyproject.toml` obtains the package version from that attribute, while `src/ludoxel/presentation/interface/windows/main.py` consumes the same value for the Qt application version, display name, and window title. The root README and Website display the same label as descriptions. Release approval, legal permission, packaging, and publication remain under their governing sources.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/identity/version.py',
            code: `__version__ = "3.8.1"`,
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
            text: '`src/ludoxel/foundations/diagnostics/system.py` gathers CPU thread count, a platform-specific CPU name and nominal speed when obtainable, total memory, current-process RSS, and optional NVIDIA utilization. `read_system_info` returns `cpu_threads`, `cpu_name`, `cpu_speed_ghz`, and `total_mem_bytes`; `read_process_memory` returns `rss_bytes` and `total_bytes`. The dataclasses omit operating-system version, Python version, renderer, scene metric, and backend result fields. Linux reads procfs before a `ps` fallback, macOS uses `sysctl` and `ps`, and Windows uses registry, Win32, PSAPI, and `tasklist` fallbacks. `HudController` consumes those values on a background loop and renders unavailable values as `n/a`. `BackendRendererApi.gl_info()` separately provides renderer name, vendor, API, and shader information to the HUD.',
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
              caption: '`Vec3.length` and `Vec3.normalized` in `src/ludoxel/foundations/mathematics/linear/vec3.py`; zero-length input resolves to the zero vector.',
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
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Chat and Commands',
    group: 'Chat Runtime',
    title: 'Understanding the Chat Runtime and Command Routing',
    description:
      'Defines the runtime-only chat state, sent-input recall, the non-pausing chat overlay, the heads-up feed visibility and fade arbitration, the periodic support message, and the command coordinator that routes slash commands through the simulation player operations.',
    sections: [
      {
        id: 'chat-runtime-overlay-does-not-pause',
        title: 'The Chat Overlay Releases Input Without Stopping the Runtime',
        content: [
          {
            kind: 'paragraph',
            text: '`chat_controller.bind_chat` attaches one `ChatController` to both viewport widgets in `src/ludoxel/presentation/interface/viewport/widgets/gl.py` and `renderer.py`. The `toggle_chat` keybind reaches `interaction.handle_key_press`, which calls `chat_controller.open_chat`. Opening releases gameplay capture through `ViewportInput.set_mouse_capture(False)` and resets held movement. `interaction.handle_mouse_press` and `handle_wheel` then consume viewport-level pointer events while the chat-open flag is set, preserving the chat surface as the input boundary. `_tick_sim` and `_on_step` in `src/ludoxel/presentation/interface/viewport/render_loop/loop.py` have no chat-open stop condition, so the fixed-step runtime, the Othello clock, gravity, and cloud and AI motion keep advancing while the chat input field holds focus.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/interface/viewport/render_loop/loop.py',
            code: `if (
  bool(getattr(self, "_shutdown_done", False))
  or (not bool(getattr(self, "_runtime_active", False)))
  or (not bool(self.isVisible()))
  or bool(self.loading_active())
  or bool(getattr(self, "_ai_settings_overlay_open", False))
  or bool(self._transient_modal_active())
  or (self._overlays.dead() or self._overlays.paused() or self._overlays.settings_open() or self._overlays.othello_settings_open())
):
  return`,
          },
          {
            kind: 'paragraph',
            text: 'Because the chat-open flag is absent from that gate, the screen behaves as a focus boundary rather than a time stop. The gameplay HUD is hidden while chat is open because `_gameplay_hud_active` in `src/ludoxel/presentation/interface/viewport/overlays/state.py` excludes the chat-open condition, and `ChatController.close` restores capture for the active play space only when no modal is open and the application is active.',
          },
        ],
      },
      {
        id: 'chat-runtime-history-and-mute',
        title: 'History and Mute Are Held Only While Running',
        content: [
          {
            kind: 'paragraph',
            text: 'The application chat state lives under `src/ludoxel/application/chat/`. `ChatRuntime` owns a `ChatHistory`, a `SentInputHistory`, and a `ChatRuntimeSettings`. Both histories use the one-hundred-entry cap, so the oldest entry is dropped when the corresponding sequence reaches capacity. `ChatController` records every nonempty submitted message or command before command routing, while `ChatScreen` keeps only the current traversal index and draft text for its focused field. The mute flag and both histories are held for the running game and are absent from saved preferences, the app-state schema, and every world and Othello save.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/chat/runtime.py',
            code: `def display_messages(self) -> tuple[ChatMessage, ...]:
  if self.mute_all():
    return ()
  return self._history.display_messages()

def recent_display_messages(self, count: int) -> tuple[ChatMessage, ...]:
  if self.mute_all():
    return ()
  return self._history.recent_display_messages(int(count))`,
          },
          {
            kind: 'paragraph',
            text: 'Mute suppresses every message kind in both surfaces without deleting anything. `display_messages` feeds the full chat screen and `recent_display_messages` feeds the heads-up feed; both return an empty tuple while muted, so unmuting reveals exactly the retained messages still inside the cap. The command-candidate kind is excluded from the display set by `ChatHistory.display_messages`, keeping candidate rows out of the persistent message list.',
          },
        ],
      },
      {
        id: 'chat-runtime-support-message',
        title: 'The Periodic Support Message',
        content: [
          {
            kind: 'paragraph',
            text: 'A presentation `QTimer` in `ChatController` fires every 600 seconds and calls `ChatRuntime.add_support_message`. The interval and the message body are owned by `src/ludoxel/application/chat/support.py`, which appends one information message carrying a single trusted link span. The displayed callout reads `Support the creator: 5uog`. The `5uog` token is the only span that opens an external URL, routed through the Qt desktop URL service in `ChatController._on_link_activated`; the rest of the message text carries no link.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/chat/support.py',
            code: `SUPPORT_INTERVAL_S: float = 600.0
SUPPORT_MESSAGE_TEXT: str = "§6[§e!§6] §7Support the creator: 5uog"
SUPPORT_LINK_LABEL: str = "5uog"
SUPPORT_LINK_URL: str = "https://github.com/5uog/"`,
          },
          {
            kind: 'paragraph',
            text: 'The message accumulates into the history even while Mute All Chat is enabled; mute only withholds the display. Local-player death reaches the history through `chat_controller.note_death`, called from `_on_step` with the same cause string the death overlay shows. AI deaths reach the same `death_log` message kind through `chat_controller.note_ai_death`: direct player kills are reported by `AiLocalAttackResult.target_death_log`, while fall, void, and generic AI deaths are reported by `SessionStepResult.ai_death_logs`. A death-log row is exempt from the player-name and separator structure used for sent messages.',
          },
        ],
      },
      {
        id: 'chat-runtime-command-routing',
        title: 'Command Routing Reaches Simulation Player Operations',
        content: [
          {
            kind: 'paragraph',
            text: 'Input beginning with a slash is handled by `src/ludoxel/application/chat/commands/`. `parse_command` accepts `/teleport` and `/tp` through the same teleport parser, then produces a typed `TeleportCommand`, a `GameModeCommand`, or a `CommandError`; `execute_command` resolves targets and applies the mutation. The candidate model exposes both teleport spellings. Teleport calls `SessionManager.teleport`, which delegates the player-state change to `teleport_player` in `src/ludoxel/simulation/actors/player/teleport.py`. Game mode calls `apply_game_mode` in `src/ludoxel/application/sessions/game_mode.py`, which writes the runtime creative flag and routes the player change through `apply_player_game_mode`. The Settings game-mode toggle calls the same `apply_game_mode` operation.',
          },
          {
            kind: 'paragraph',
            text: '`ChatScreen` keeps `ChatCandidateView` in the chat display area and hides the message scroll while candidates are visible. Slash-command candidates and mention candidates therefore share the same row design, selected-row state, mouse activation, and keyboard navigation while the popup is clamped inside the display area and aligned to its lower edge. Tab activates the selected candidate for both suggestion modes. Enter activates the selected candidate only when mention mode is active; slash-command mode leaves Enter to the message field submission path. `ChatController` chooses one suggestion mode from the current token: slash commands when the input begins with `/`, or mention candidates when the token under the cursor begins with `@`.',
          },
          {
            kind: 'paragraph',
            text: 'Mention candidates are presentation-time input help. The controller builds them from the resolved local player name and live AI render snapshots, filters by the typed prefix, removes ambiguous duplicate names, and omits defeated AI snapshots. Selecting a mention replaces only the current `@` token with `@Name` and leaves command parsing and command execution unchanged.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/application/chat/commands/coordinator.py',
            code: `def execute_command(text: str, *, prefs, sessions) -> CommandResult:
  parsed = parse_command(text)
  if isinstance(parsed, CommandError):
    return CommandResult(messages=(make_command_error_message(f"§c{parsed.message}"),))
  if isinstance(parsed, GameModeCommand):
    return _execute_gamemode(parsed, prefs=prefs, sessions=sessions)
  return _execute_teleport(parsed, prefs=prefs, sessions=sessions)`,
          },
          {
            kind: 'paragraph',
            text: 'The coordinator returns a `CommandResult` carrying feedback or error messages and a `CommandEffects` record. `ChatController._apply_effects` reads the flags: a game-mode change re-synchronises the hotbar, the first-person target, and the Settings values, and a teleport invalidates the selection target and, when `chunkForBlocks` is true, arms a world-upload sync. The presentation passes the input string and renders the result; it does not write player state directly.',
          },
        ],
      },
      {
        id: 'chat-runtime-feed-arbitration',
        title: 'Heads-Up Feed Visibility Arbitration',
        content: [
          {
            kind: 'paragraph',
            text: '`ChatController.sync_visibility`, called from `_sync_gameplay_hud_visibility`, decides the lower-left feed. The feed is shown only while the gameplay HUD is active, the F3 Debug HUD is inactive, Mute All Chat is disabled, the chat screen is closed, and at least one display message exists. `ChatFeedWidget` starts a thirty-second single-shot `QTimer` only under those conditions and applies a three-second opacity animation when the timer expires. A new display message resets that presentation timer and returns the widget to full opacity. The feed widget is transparent to mouse events, so it never takes camera control, hotbar selection, or block interaction. Closing the F3 Debug HUD restores the feed under the same conditions; opening the chat screen hides it because the chat screen renders the same messages at full size.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding Chat Text Formatting', 'Understanding Overlay Input Blocking', 'Using Chat and Commands', 'Using Teleport and Game Mode Commands', 'Changing Chat Visibility'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Chat and Commands',
    group: 'Chat Runtime',
    title: 'Understanding Chat Text Formatting',
    description:
      'Defines the Qt-free section-formatting contract, the foreground and background color rule, the reset behavior of the formatting flags, the layout-stable obfuscation source, and the single renderer adapter that paints every chat message kind.',
    sections: [
      {
        id: 'chat-formatting-contract',
        title: 'The Section-Formatting Contract Is Qt-Free',
        content: [
          {
            kind: 'paragraph',
            text: 'Section formatting is owned by `src/ludoxel/foundations/text/`. `palette.py` holds the color table, `format_codes.py` parses a string into a flat tuple of style segments, and `obfuscation.py` supplies replacement characters by width class. The module set holds no Qt type, no widget, and no domain state. `parse_formatted_text` emits a `FormattedSegment` for each run of identical style, carrying the foreground, the optional background, and the bold, italic, underline, strikethrough, and obfuscated flags.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/text/format_codes.py',
            code: `@dataclass(frozen=True, slots=True)
class FormattedSegment:
  text: str
  foreground: str
  background: str | None
  bold: bool
  italic: bool
  underline: bool
  strikethrough: bool
  obfuscated: bool`,
          },
        ],
      },
      {
        id: 'chat-formatting-color-and-reset',
        title: 'Color Codes Set Foreground and Background; Reset Clears Flags Only',
        content: [
          {
            kind: 'paragraph',
            text: 'A color code changes the foreground and the background of the following text and leaves the formatting flags untouched. `§r` clears the bold, italic, underline, strikethrough, and obfuscated flags and leaves the colors as they stand; it does not return to a default color. White is reached with `§f`, which sets the foreground to white and a dark backing color. Segments before any color code use a default white foreground and a transparent background, so ordinary text shows the chat background rather than a backing fill.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/foundations/text/format_codes.py',
            code: `def _apply_code(state: _FormatState, code: str) -> None:
  lowered = str(code).lower()
  if is_color_code(lowered):
    color = color_for_code(lowered)
    if color is not None:
      state.foreground = str(color.foreground)
      state.background = str(color.background)
    return
  if lowered == FLAG_RESET:
    state.reset_flags()
    return`,
          },
          {
            kind: 'paragraph',
            text: 'The codes `§m` and `§n` are strikethrough and underline flags, not material colors, and the color table never assigns them a foreground. The flag codes `§k`, `§l`, `§m`, `§n`, and `§o` persist until `§r`, so a later color code keeps the active flags while changing only the foreground and background.',
          },
        ],
      },
      {
        id: 'chat-formatting-obfuscation',
        title: 'Obfuscated Text Preserves Layout Width',
        content: [
          {
            kind: 'paragraph',
            text: 'The `§k` flag marks a segment obfuscated. `obfuscation.py` partitions characters into a space, wide, or narrow width class from the Unicode east-asian-width property and returns a same-class replacement. The renderer pins each glyph advance to the original character, so a wide source position keeps a wide replacement and a narrow source position keeps a narrow replacement, and the cycling characters never shift the surrounding layout.',
          },
          {
            kind: 'paragraph',
            text: '`ChatTextView` in `src/ludoxel/presentation/interface/chat/text_view.py` measures each source glyph once with the segment font, records the advance, and at paint time substitutes a random same-class character while advancing by the recorded width. A repaint timer drives the cycling only while obfuscated content is visible.',
          },
        ],
      },
      {
        id: 'chat-formatting-single-renderer',
        title: 'One Renderer Adapter for Every Message Kind',
        content: [
          {
            kind: 'paragraph',
            text: '`ChatTextView` is the single renderer adapter. The full chat screen, the heads-up feed, command feedback, command errors, the periodic support message, and death-log rows are all painted by it, so the parser and the renderer are not duplicated per message kind. The widget converts parser segments into a wrapped, painted layout, fills the per-segment background, draws the foreground glyphs, and applies underline and strikethrough through the segment font. Clickable external links are limited to explicitly authored trusted spans carried on the message; user-entered text never produces a link.',
          },
          {
            kind: 'paragraph',
            text: 'Mention color is derived by the renderer rather than stored in the raw chat body. `ChatController` supplies the local display user as the mention target, `ChatTextView` detects exact known `@Name` spans with word-boundary checks, and only those characters receive the `§e` foreground color. `named_message_text` strips user-provided section formatting from named chat bodies before the runtime message is stored, so a typed control sequence does not become persistent formatting and raw `§e` is not required for a mention.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding the Chat Runtime and Command Routing', 'Using Chat and Commands'],
  }),
  defineDocsArticle({
    category: 'Systems',
    subcategory: 'Rendering Backends',
    group: 'World Visuals',
    title: 'Understanding Surface Envelope Uploads',
    description:
      'Defines the surface-envelope materialization behind chunk mesh uploads: the per-chunk content bands derived from the generation spec, the bounded build snapshot, content-based visible-chunk selection in the upload tracker, and the loading gate that waits for resident chunks.',
    sections: [
      {
        id: 'understanding-surface-envelope-uploads-content-bands',
        title: 'Content Bands Bound What Exists to Render',
        content: [
          {
            kind: 'paragraph',
            text: 'A seeded world has no finite block dictionary to enumerate, so `WorldState` in `src/ludoxel/simulation/worlds/state/world.py` answers rendering questions through per-chunk-column content bands. `_chunk_column_band` requests the surface heights of one 16-by-16 chunk column plus a one-cell margin from the native terrain engine, then derives an inclusive y band: the top is the highest carved surface in the core, and the bottom is the lowest of each column’s surface minus the sub-surface buffer and its lowest side-exposed cell against the four neighbor columns. Flat generation — including the Othello play space, whose world carries a flat `WorldGenerationSpec` — collapses the band to the single ground layer without sampling heights. `chunk_has_content` admits any chunk holding placed blocks or broken cells and, for generated worlds, any chunk inside the solid span between the content floor — the bedrock layer for normal generation, the flat layer for flat generation — and the band top. Bands are cached per column because base terrain is immutable for a given spec; edits are tracked separately through the placed and broken chunk indexes.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/simulation/worlds/state/world.py',
            code: `def chunk_has_content(self, ck: ChunkKey) -> bool:
  key = (int(ck[0]), int(ck[1]), int(ck[2]))
  with self._lock:
    if key in self._chunk_index or key in self._broken_chunk_keys:
      return True
  band = self._chunk_column_band(int(key[0]), int(key[2]))
  if band is None:
    return False
  y_lo = int(key[1]) * CHUNK_SIZE
  y_hi = y_lo + CHUNK_SIZE - 1
  return int(y_hi) >= int(self._content_floor_y()) and int(y_lo) <= int(band[1])`,
          },
          {
            kind: 'paragraph',
            text: 'Content admission and face output are separate questions: a chunk buried between the surface band and the bedrock layer holds content, but its build snapshot emits zero faces until an edit — its own or a neighboring cell’s — exposes a cell, so admitting the interior does not materialize the underground into geometry. The two permanently face-bearing regions are the surface skin, whose top is open to the sky, and the bedrock layer at the content floor, whose underside is open to the void below; both upload through the same candidate path. Static worlds — legacy My Worlds — skip the band path entirely and report content from their explicit block indexes.',
          },
        ],
      },
      {
        id: 'understanding-surface-envelope-uploads-build-snapshot',
        title: 'The Build Snapshot Is a Bounded Box',
        content: [
          {
            kind: 'paragraph',
            text: '`snapshot_for_chunk_build` materializes one 18-cubed box — the 16-cubed target chunk plus a one-cell margin — through a single bulk `terrain_materials` call, applies the placed and broken deltas inside that box, and produces the two structures the face builder consumes. `state_at` maps every solid composite cell of the box to its block state so face-visibility checks resolve without further world queries; `blocks_local` holds only the exposed core cells. Occupancy and face occlusion are separate grids: `solid` marks any occupied cell, and `full_occ` marks only cells filled by a full solid cube — every terrain material, and each placed block whose definition reports `is_full_cube` and `is_solid` through the shared block registry. A cell is exposed when it holds a block and is not fully buried, where buried means the cell is itself a full cube and all six neighbors are full-cube occluders, evaluated with vectorized shifts over `full_occ`. A slab, stair, fence, fence gate, or wall never counts as a full occluder, so a full cube behind such a partial shape is kept and a non-full-cube block is always kept; `iter_visible_faces` then drops only the faces a full-cube neighbor actually covers. Interior full-cube cells never reach `iter_visible_faces`, which cuts the per-chunk face-source work to the visible envelope, and the margin cells occlude faces against neighboring chunks without enumerating them.',
          },
          {
            kind: 'paragraph',
            text: 'The snapshot runs inside the mesh-build worker thread of `WorldUploadTracker`, not on the render thread: `_schedule_build` submits the chunk key and revision, and `_build_result_for_chunk` performs materialization and face generation together in the executor. `WorldState` guards its indexes and caches with a reentrant lock, so a build snapshot taken while the simulation mutates blocks sees a consistent composition, and a mutation after scheduling marks the chunk dirty again through the mesh-revision counters so the stale build is superseded rather than trusted.',
          },
        ],
      },
      {
        id: 'understanding-surface-envelope-uploads-tracker-selection',
        title: 'Tracker Selection and Residency',
        content: [
          {
            kind: 'paragraph',
            text: '`WorldUploadTracker` in `src/ludoxel/presentation/rendering/uploads/world.py` selects work from `visible_content_chunk_keys` around the eye chunk at the clamped render distance, sorted by horizontal then vertical chunk distance. The candidate set is the union of four bounded families: the full vertical band of every column inside the horizontal radius, the content-floor row of every such column, the three-by-three-by-three chunk neighborhood around the eye chunk, and every chunk with tracked mesh state — placed blocks, broken cells, or a mesh revision advanced by a neighboring cell edit — filtered by horizontal distance alone. The band and tracked families are deliberately unclamped against the player’s chunk Y: a column’s surface stays a candidate while the player stands at bedrock beneath it, and a shaft dug from the surface to bedrock stays visible over its whole height. `upload_if_needed` drains finished builds into `submit_chunk`, evicts residents outside a keep margin of two chunks beyond the render distance, schedules dirty chunks reported by the world, and schedules any visible content chunk whose resident mesh revision does not match the world’s. A chunk is resident only after the backend accepted its faces; scheduled, built, and queued states are tracked separately and never counted as resident. Camera motion re-evaluates the needed set against existing residents instead of rebuilding them, so a viewpoint change rebuilds nothing whose revision still matches.',
          },
          {
            kind: 'paragraph',
            text: 'The draw-side bound agrees with that selection: `within_render_distance` in `src/ludoxel/presentation/rendering/visuals/selections/chunk.py` compares only the horizontal chunk distances against the render distance, and the vertical extent of drawn chunks is whatever the tracker keeps resident. The WGPU backend draws every resident chunk, so a vertical clamp in the OpenGL predicate would have culled resident terrain — the surface seen from bedrock depth — that the other backend keeps visible; frustum culling against the view-projection matrix remains the per-frame visibility test on both paths.',
          },
          {
            kind: 'paragraph',
            text: 'Prefetching and caching are subordinate to that selection: a bounded result cache keyed by world content generation, chunk, and revision replays a mesh for a chunk that left and re-entered the keep set, and `reset` clears residency, pending futures, and the cache when the play space or loaded world changes so one world’s meshes cannot satisfy another’s uploads.',
          },
        ],
      },
      {
        id: 'understanding-surface-envelope-uploads-loading-gate',
        title: 'The Loading Gate Counts Resident Content Chunks',
        content: [
          {
            kind: 'paragraph',
            text: '`visible_load_progress` reports progress over the content chunks within the gate radius — the full clamped render distance, so the overlay stays up until every content chunk the renderer will draw is built and resident — and it counts a chunk only when its mesh revision is positive, the same set the upload scheduler builds. `visible_chunks_ready` closes the loading state when every counted chunk is resident at its current mesh revision, expressed as `ready >= total`. A zero denominator is therefore completion, not a stall: the candidate set also holds the empty chunks the eye can reach into, and the eye’s own chunk column resolves to mesh revision 0, so the scheduler skips them; when no visible chunk carries buildable content there is nothing to upload and the loader closes. The earlier gate instead asked whether the world reported any content chunk key in range, and that key set included those reachable empty chunks, so a world whose only in-range content was the revision-0 chunks held the loader open with no build ever scheduled. During loading, `_tick_sim` and `_on_step` in the render loop continue to return, while `paintGL` keeps draining and scheduling uploads, so simulation stays gated while chunk builds and backend submissions proceed.',
          },
          {
            kind: 'code',
            language: 'py',
            caption: 'src/ludoxel/presentation/rendering/uploads/world.py',
            code: `def visible_chunks_ready(self, *, world: WorldState, eye: Vec3, render_distance_chunks: int) -> bool:
  ready, total = self.visible_load_progress(world=world, eye=eye, render_distance_chunks=int(render_distance_chunks))
  return int(ready) >= int(total)`,
          },
          {
            kind: 'paragraph',
            text: 'The loading overlay text is produced from this state: with content in range the status line reads `Loading world... R/T chunks` and appends the outstanding build count, while a denominator still at zero reads `Selecting world chunks...`, and either line gains the tracker’s stall detail — pending and resident counts and the last scheduled, built, and uploaded chunk keys — once the progress pair has held for four seconds. Because a zero denominator now completes loading rather than holding it, the `Selecting world chunks... [pending 0, resident 0]` stall no longer persists. Readiness here is residency of the counted content chunks; it is not a claim that both renderer backends perform identically or that later streaming as the player moves cannot be observed.',
          },
        ],
      },
    ],
    relatedTitles: ['Understanding View, Transform, and Chunk Visibility Contracts', 'Understanding Render Distance Fog and Shadows', 'Creating Seeded My Worlds'],
  }),
];
