# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

PROFILE_IMAGE_CANDIDATE_NAMES: tuple[str, ...] = ("profile.png", "profile.jpg", "profile.jpeg", "profile.webp", "profile.bmp")
GITHUB_IMAGE_CANDIDATE_NAMES: tuple[str, ...] = ("github.png", "github.jpg", "github.jpeg", "github.webp", "github.bmp", "github.svg")
ABOUT_GITHUB_URL = "https://github.com/5uog/Ludoxel/"

ABOUT_CREATOR_DISPLAY_NAME = "Kento Konishi"
ABOUT_CREATOR_HANDLE = "5uog"
ABOUT_CREATOR_ROLE = "Keio University student / Ludoxel creator"
ABOUT_CREATOR_AGE = "20"
ABOUT_CREATOR_GENDER = "he/him"

ABOUT_PROFILE_BIO_TEXT: str = "My academic work is directed toward future legal practice, with particular concern for victim protection, fact finding, procedural access, information management, and institutional reform. Law is the principal field of that study. Information security, software architecture, persistence design, interface construction, and verification supply an adjacent technical discipline for examining how protective systems can remain inspectable, explainable, testable, and accountable when they process human claims, evidence, access routes, stored information, and institutional decisions. Ludoxel is developed as a separate personal desktop software project, but it shares that discipline of explicit structure: state must be preserved deliberately, renderer behavior must be observable, input ownership must be controlled, and user-facing systems must be described in terms precise enough to be tested."

ABOUT_WORK_TEXT: str = "I work on Ludoxel as a PyQt6 desktop application with persistent voxel-world state, first-person and third-person camera behavior, collision, picking, block-state rendering, falling-block simulation, AI-player behavior and route planning, a separate Othello play space, platform-specific OpenGL and wgpu renderer paths, app-managed runtime persistence, bundled resources, desktop packaging, and application-facing documentation."

ABOUT_ACADEMIC_DIRECTION_TEXT: str = "My academic direction centers on legal practice, victim protection, fact finding, procedural access, information management, and institutional reform. Software-system design is relevant to that direction because protective institutions also depend on inspectable architecture, controlled state, reliable access paths, durable records, explicit procedures, and explanations that remain accurate when a system is used by a person rather than only described by its designer."

ABOUT_ETYMOLOGY_PARAGRAPHS: tuple[str, ...] = (
  "Latin 'ludus' underlies the initial element 'lud-'. Its attested semantic field extends across play, game, sport, school, and training. The stem therefore carries a broad ludic reference: play as a general class of rule-bound or exploratory activity, rather than one combat form, one genre, or one fixed rule set.",
  "'Voxel' is the modern technical contraction of 'volumetric' and 'pixel'. In technical usage, it denotes a discrete element of three-dimensional representation, commonly treated as the spatial analogue of the pixel, and therefore refers to discretized volume rather than to a merely visual style or atmospheric motif.",
  "'Ludoxel' accordingly denotes ludic activity conducted in voxel space. As the title of a sandbox desktop application, the term is operationally exact: the represented environment is voxel-constituted, while the admitted activity remains broadly ludic, extending across local manipulation, traversal, authored routes, AI observation, and a separate board-game space hosted inside the same shell.",
)


@dataclass(frozen=True)
class AboutBlock:
  kind: str
  text: str


@dataclass(frozen=True)
class AboutSection:
  title: str
  blocks: tuple[AboutBlock, ...]


def paragraph(text: str) -> AboutBlock:
  return AboutBlock(kind="paragraph", text=str(text))


def code_block(text: str) -> AboutBlock:
  return AboutBlock(kind="code", text=str(text))


ABOUT_PROJECT_OVERVIEW_SECTIONS: tuple[AboutSection, ...] = (
  AboutSection(
    title="Ludoxel v3.6",
    blocks=(
      paragraph(
        "Ludoxel v3.6 is a PyQt6 desktop application that treats a restricted voxel world, a first-person and third-person camera system, persistent play-space state, AI-player behavior, Othello search, platform-specific rendering, and desktop packaging as one inspectable engineering object. The application is not described here as a general clone of any external game. Its technical identity is narrower and more precise: it is a controlled voxel-interaction laboratory in which world state, block-state geometry, collision, picking, persistence, rendering, input ownership, and verification commands are implemented as explicit software strata."
      ),
      paragraph(
        "The term controlled voxel-interaction laboratory is used here in a defined sense. It means that Ludoxel deliberately limits its world model while making the implemented portion technically accountable: a block is not merely a visible cube, but an object whose definition, state codec, render boxes, collision volumes, pick volumes, structural connectivity, persistence representation, renderer payload, and user interaction behavior must remain mutually consistent across Python simulation code, GLSL shader resources, OpenGL upload paths, and the macOS wgpu path."
      ),
      code_block("""public application title: Ludoxel
Python package and import namespace: ludoxel
package version: 3.6.0
source entry point: src/ludoxel/__main__.py
runtime entry function: ludoxel.application.bootstrap.run_app
console script: ludoxel = ludoxel.application.bootstrap:run_app
declared Python range: >=3.13,<3.15
principal GUI toolkit: PyQt6 >=6.6,<7
numerical dependency: NumPy >=1.26,<3
Windows renderer dependency: PyOpenGL >=3.1,<4
macOS renderer dependencies: wgpu >=0.31,<0.32 and rendercanvas >=2.6,<3
persistent play spaces: My World and Play Othello (Reversi)"""),
    ),
  ),
  AboutSection(
    title="Source layout and architectural stratification",
    blocks=(
      paragraph(
        "The source tree is organized around four top-level Python packages whose names describe dependency direction rather than visual location in the application. `ludoxel.foundations` owns identity, root resolution, diagnostics, scalar normalization, vector and matrix mathematics, ray-box tests, voxel traversal, chunk-coordinate utilities, and frustum clipping. `ludoxel.simulation` owns world state, block catalogs, block models, player and AI-player state, inventories, movement, collision, gravity, interaction, placement, picking, My World, and Othello rules. `ludoxel.application` owns bootstrap, preferences, persistence schemas, state stores, session factories, session managers, runtime-state pipelines, and fixed-step runners. `ludoxel.presentation` owns Qt windows, input adapters, HUD, overlays, settings pages, theme resources, audio playback, renderer contracts, OpenGL backends, wgpu backends, shader resources, visual-state composers, and viewport widgets."
      ),
      paragraph(
        "This structure is a one-way dependency discipline. Foundations can be imported by every layer. Simulation can depend on foundations but must not know presentation widgets or application storage policy. Application connects simulation to persistence and runtime orchestration; it may reach presentation only at the bootstrap composition root. Presentation consumes simulation and application DTOs and renders or edits them through Qt, OpenGL, wgpu, audio playback, and settings controls. This is the central reason why `application.persistence.schema.PlayerStateFile`, `WorldStateFile`, `PersistedSettings`, `PersistedInventory`, `PersistedWorld`, `PersistedAiPlayer`, `PersistedPlaySpace`, and `PersistedOthelloSpace` exist as explicit dataclasses rather than allowing renderer or widget classes to become save-file schema."
      ),
      code_block("""reported repository export size: 534 files
principal source packages:
  src/ludoxel/foundations
  src/ludoxel/simulation
  src/ludoxel/application
  src/ludoxel/presentation

major package-resource roots:
  src/ludoxel/presentation/interface/theme
  src/ludoxel/presentation/rendering/backends/opengl/shaders
  src/ludoxel/presentation/rendering/backends/wgpu/shaders/sources
  src/ludoxel/simulation/spaces/othello/resources

representative public composition route:
  src/ludoxel/__main__.py
  -> ludoxel.application.run_app
  -> ludoxel.application.bootstrap.run.run_app
  -> ludoxel.presentation.interface.windows.main.run_app"""),
    ),
  ),
  AboutSection(
    title="Application bootstrap, shell ownership, and play-space switching",
    blocks=(
      paragraph(
        "Application startup is deliberately routed through `src/ludoxel/__main__.py`, which calls `multiprocessing.freeze_support()` before transferring control to `ludoxel.application.run_app`. The application package facade resolves `run_app` lazily through `ludoxel.application.bootstrap`, and `ludoxel.application.bootstrap.run.run_app` computes `project_root`, `resource_root`, and `data_root` by using `default_project_root`, `default_resource_root`, and `default_runtime_data_root` before installing Othello book storage hooks and importing the Qt shell. This order keeps root resolution and persistence-hook installation outside presentation initialization while still permitting the bootstrap composition root to connect the final desktop window."
      ),
      paragraph(
        "The desktop shell hosts two persistent spaces inside one application surface. `My World` is the sandbox voxel space. `Play Othello (Reversi)` is a separate persistent Othello space with its own board, hotbar, match settings, AI opponent, clocks, animation path, and renderer integration. The pause menu offers the three persistent actions `Play My World`, `Play Othello (Reversi)`, and `Save & Quit`; the first two switch active play-space context, and the last persists world, player, and mode-local state before closing. Each space owns its own player transform and session-specific state rather than sharing a single mutable player slot across unrelated modes."
      ),
      code_block("""bootstrap functions and classes:
  ludoxel.application.bootstrap.run.run_app()
  ludoxel.application.bootstrap.run._ensure_python_314()
  ludoxel.application.sessions.context.play_space.PlaySpaceContext
  ludoxel.application.sessions.factories.my_world.create_my_world_session()
  ludoxel.application.sessions.factories.othello.create_othello_session()
  ludoxel.application.sessions.managers.session.SessionManager
  ludoxel.application.sessions.runners.fixed_step.FixedStepRunner

persistent shell actions:
  Play My World
  Play Othello (Reversi)
  Save & Quit

startup identity behavior:
  stored player name present -> use persisted identity
  stored player name blank -> show name dialog and allow random session name generation on each restart"""),
    ),
  ),
  AboutSection(
    title="Runtime persistence, file integrity, and data-root policy",
    blocks=(
      paragraph(
        "Runtime-writable state is kept outside immutable package resources. `default_runtime_data_root` resolves the application-managed data root and honors `LUDOXEL_DATA_ROOT` when it is explicitly supplied. The runtime root is divided into `state` and `cache`: player settings, window state, world edits, custom player skin, and user-authored Othello opening-book data belong to state, while compiled Othello opening-book cache belongs to cache. Repository-level `configs` is treated as previous-format input for migration and compatibility, not as the ordinary v3.6 write target."
      ),
      paragraph(
        "Persistence is expressed through small dataclasses instead of ad hoc dictionaries. `PlayerStateFile` currently serializes version `7`, current play-space id, settings, inventory, and Othello settings. `WorldStateFile` currently serializes version `3` and contains the two persisted play-space bundles. `AppStateStore.load` reads `player_state.json` and `world_state.json`, verifies runtime files when a manifest exists, migrates previous-format input where available, and returns an `AppState` aggregate. `AppStateStore.save` writes both JSON files through `JsonFileStore`, then updates the HMAC manifest."
      ),
      paragraph(
        "The integrity layer is an external-edit and accidental-corruption detector. `update_runtime_integrity_manifest` stores HMAC-SHA256 digests for protected runtime files by using a locally generated 32-byte key, and `verify_runtime_file` compares stored and computed digests with `hmac.compare_digest`. The file-reading path hashes the relative path, a null separator, and file data streamed in `1024 * 1024` byte chunks. This is an integrity signal for local runtime files, not a cryptographic prevention mechanism against a user who can edit both data and key material."
      ),
      code_block("""state files:
  state/player_state.json
  state/world_state.json
  state/player_skin.png
  state/othello_opening_book.json

cache files:
  cache/othello_opening_book_cache.json

integrity implementation:
  class AppStateStore
  class JsonFileStore
  class PlayerStateFile(version=7)
  class WorldStateFile(version=3)
  class PersistedSettings
  class PersistedInventory
  class PersistedPlayer
  class PersistedWorld
  class PersistedAiPlayer
  class PersistedPlaySpace
  class PersistedOthelloSpace
  function verify_runtime_file(data_root, relative_path)
  function update_runtime_integrity_manifest(data_root, relative_paths)
  algorithm: hmac-sha256
  generated key length: 32 bytes
  protected paths: player_state.json, world_state.json, player_skin.png, othello_opening_book.json"""),
    ),
  ),
  AboutSection(
    title="Fixed-step simulation, movement, collision, and survival parameters",
    blocks=(
      paragraph(
        "The gameplay loop separates simulation cadence from renderer presentation. `GameLoopParams` defines `sim_hz = 120.0`, and `step_dt()` therefore returns `1 / 120` seconds for the fixed-step simulation path. Movement constants are kept in `MovementParams`, collision tolerances in `CollisionParams`, and runtime user preferences in `RuntimePreferences`; this prevents a settings page, physics rule, and persistence schema from silently becoming three independent definitions of the same quantity."
      ),
      paragraph(
        "The local player is modeled by `PlayerEntity` and advanced through movement, collision, and damage services. The default movement profile uses a `20.0` tick reference for Minecraft-like reasoning, a walking speed of `4.317`, sprint speed of `5.612`, crouch multiplier `0.3`, gravity `32.0`, maximum fall speed `78.4`, jump velocity `8.4`, fly speed `10.92`, and auto-jump cooldown `0.12 s`. Collision uses an epsilon of `1e-4`, a ground probe of `0.03`, a step height of `0.5625`, and neighborhood padding values that bound local collision searches around the player body."
      ),
      paragraph(
        "The survival path gives the local player a `20`-point health pool. Fall damage is computed after a safe distance of `3.0` blocks, and void damage begins below `y = -64.0`, applying `4.0` damage on a `0.50 s` cadence until death. Melee sampling is also explicit: local empty swings and successful AI hits are separated, melee damage cooldown is `0.50 s`, first-person and third-person hurt feedback share the same state, and knockback calculations use the movement vector rather than storing an isolated visual-only strike event."
      ),
      code_block("""classes and functions:
  MovementParams
  CollisionParams
  GameLoopParams
  PlayerEntity
  PlayerMotionState
  PlayerStepInput
  RuntimePlayerStepResult
  fall_damage_amount()
  damage_local_player()
  kill_player()
  respawn_player()
  step_player_motion()
  resolve_player_collision()

fixed-step and movement values:
  simulation frequency: 120.0 Hz
  simulation dt: 0.0083333333 s
  movement tick reference: 20.0 Hz
  walk_speed: 4.317
  sprint_speed: 5.612
  crouch_mult: 0.3
  gravity: 32.0
  fall_speed_max: 78.4
  jump_v0: 8.4
  fly_speed: 10.92
  auto_jump_cooldown_s: 0.12
  collision_eps: 1e-4
  ground_probe: 0.03
  step_height: 0.5625
  default health: 20.0
  void threshold: y < -64.0
  void damage interval: 0.50 s
  void damage amount: 4.0"""),
    ),
  ),
  AboutSection(
    title="World state, flat generation, chunks, and GPU residency",
    blocks=(
      paragraph(
        "Voxel state is held in `WorldState`, which stores a block mapping, revision number, dirty chunk set, chunk index, column index, chunk mesh revision map, gravity-dirty columns, and an internal lock. The world API includes `set_block`, `remove_block`, `set_blocks_bulk`, `snapshot_for_chunk_build`, `snapshot_block_window`, `snapshot_column`, `column_y_values`, `replace_all`, `to_persisted_dict`, and `from_persisted_dict`, so persistence, chunk building, gravity, and interaction all observe the same domain object rather than private renderer-specific copies."
      ),
      paragraph(
        "The current generated My World baseline is intentionally flat. `generate_flat_world` defaults to `half_extent = 32`, `ground_y = 0`, and `block_id = minecraft:grass_block`, producing a square from `-32` through `32` on both horizontal axes. That is a `65 * 65` block floor, or `4225` initial ground cells, before the user places, breaks, or persists modifications. The function `generate_test_map` delegates to this flat generator, which makes the flat world a deliberate reproducible fixture rather than an incidental fallback map."
      ),
      paragraph(
        "Chunk addressing is based on `CHUNK_SIZE = 16`. `chunk_key` maps world coordinates to chunk coordinates by integer division, and `neighbor_chunk_keys_for_cell` marks adjacent chunks when edits occur on chunk boundaries. `WorldUploadTracker` then operates as a renderer-residency coordinator: it uses a single background worker, drains a bounded number of completed results per update, keeps a bounded cache of mesh-build results, and distinguishes visible chunks, retained chunks, prefetch radius, and prewarm radius. The important engineering point is that chunk residency is not equivalent to world state; world state remains authoritative, while renderer upload is a derived, eventually synchronized view."
      ),
      code_block("""world functions:
  generate_flat_world(half_extent=32, ground_y=0, block_id="minecraft:grass_block")
  generate_test_map(seed=0)
  chunk_key(x, y, z)
  chunk_origin(chunk_key_value)
  neighbor_chunk_keys_for_cell(x, y, z)
  WorldState.set_block()
  WorldState.remove_block()
  WorldState.set_blocks_bulk()
  WorldState.snapshot_for_chunk_build()
  WorldState.to_persisted_dict()
  WorldState.from_persisted_dict()

numeric world constants:
  CHUNK_SIZE: 16
  default flat half extent: 32
  default flat ground y: 0
  default flat side length: 65 cells
  default flat floor size: 4225 blocks
  render distance range: 2..50 chunks
  default render distance: 6 chunks

upload coordination:
  class WorldUploadTracker
  background workers: 1
  max results per drain: 4
  max cached mesh results: 192
  prefetch radius: render_distance + 2
  prewarm radius: render_distance + 1"""),
    ),
  ),
  AboutSection(
    title="Block registry, block-state geometry, and structural semantics",
    blocks=(
      paragraph(
        "Block behavior is not stored as a monolithic texture id. A block enters the simulation through `BlockDefinition`, `BlockTextures`, the default registry, model-specific geometry functions, state codecs, and structural-update rules. The exported v3.6 code contains full cubes together with slabs, stairs, fences, fence gates, and walls; each family is represented through explicit state and geometry functions so that rendering, picking, collision, support checks, placement resolution, and neighbor updates can agree on the same object."
      ),
      paragraph(
        "The inspected registry construction registers wood, stone, decorative stone, sandstone, ore, special stone, and special dirt families. At the registered block-id level, the observed v3.6 snapshot contains `276` concrete block definitions before block-state expansion. The wood branch contributes planks, slabs, stairs, fences, and fence gates across `13` plank-like material entries, including `12` fence-capable wood entries and the mosaic branch; the stone-like branches contribute `213` registered variants across stone, decorative stone, sandstone, ore, special stone, and special dirt catalog modules. This count is a codebase count, not a claim about parity with a complete Minecraft catalog."
      ),
      paragraph(
        "Geometry is authored in sixteenth-block units through functions such as `px_box`, and then converted to local or world AABBs. For example, fence posts use a central `6..10` pixel range on the X and Z axes, walls use a central `4..12` pixel post, and fence-gate variants alter collision and render boxes according to open, closed, facing, and in-wall state. The term state-parametric voxel geometry is used here to describe that design: the geometry of a block is a function of its block id, encoded properties, neighboring states, and requested purpose, rather than a fixed mesh attached to a texture name."
      ),
      code_block("""principal block classes and functions:
  class BlockDefinition
  class BlockTextures
  class BlockRegistry
  create_default_registry()
  register_wood_blocks()
  register_stones()
  collision_aabbs_for_block()
  render_boxes_for_block()
  pick_boxes_for_block()
  pick_aabbs_for_block()
  has_full_top_support_for_block()
  parse_state()
  format_state()
  prop_as_bool()
  collect_structural_neighbor_updates()

observed registered block-id scale:
  total registered block ids: 276
  wood-family variants: 63
  stone-like variants: 213
  gravity-affected block ids: sand, red_sand, gravel

representative geometry:
  slab heights: half-block state selected by face and hit position
  fence post: px_box(6, 0, 6, 10, 16, 10)
  wall post: px_box(4, 0, 4, 12, 16, 12)
  fence gate: open and closed variants, including in-wall vertical offsets
  wall top support: full cubes, fences, fence gates, slabs, stairs, and walls affect arm and post height"""),
    ),
  ),
  AboutSection(
    title="Picking, placement, breaking, and held interaction cadences",
    blocks=(
      paragraph(
        "The interaction layer is centered on `InteractionService`. Picking, breaking, placing, fence-gate toggling, slab merging, structural neighbor updates, player-overlap rejection, and world-revision updates pass through service functions rather than being scattered across viewport event handlers. `pick_block_for_session`, `break_block_for_session`, `place_block_from_hit_for_session`, `place_block_for_session`, and `interact_block_at_hit_for_session` expose the session-facing path, while lower-level placement policy functions decide slab type, stair facing, fence-gate facing, wall state, and support validity."
      ),
      paragraph(
        "Continuous interaction is parameterized through persisted runtime preferences. The default left-button creative break cadence is `0.30 s`. The held-placement path uses an initial dwell of `0.20 s` and then a continuation cadence of `1 / 120 s`, approximately `0.008333 s`, matching the simulation step. Fence-gate interaction repeats at `0.20 s`. These values are not UI decoration; they govern the temporal relation between mouse input, simulation steps, collision checks, and world edit commits."
      ),
      paragraph(
        "Held placement is constrained by route state. The first right-click remains a single isolated placement; only after the initial dwell does the continuation route advance. The route can be a visible side-face chain, a synthesized support-face chain for crouch bridging, a generic horizontal route, or a first-follow-up vertical branch. The maintained frontier advances only when a valid world block actually remains at the attempted target cell, so rejected placement, player overlap, missing support, and unsupported falling-block conversion do not falsely advance the route."
      ),
      code_block("""interaction classes and functions:
  class InteractionService
  class PlacementPolicy
  pick_block_for_session()
  break_block_for_session()
  place_block_from_hit_for_session()
  place_block_for_session()
  interact_block_at_hit_for_session()
  place_from_hit_for_service()
  place_block_for_service()
  toggle_fence_gate_if_hit_for_service()
  player_intersects_state_for_service()
  resolve_place_state()
  choose_half_type()

default repeat parameters:
  block_break_repeat_interval_s: 0.30
  block_place_repeat_initial_delay_s: 0.20
  block_place_repeat_interval_s: 1 / 120 = 0.0083333333
  block_interact_repeat_interval_s: 0.20
  editable interval range: 0.0..1.0 s

hotbar and key defaults:
  inventory: E
  creative mode: B
  gameplay HUD: F1
  debug HUD: F3
  debug shadow: F4
  camera cycle: F5
  clear selected slot: Q
  movement: W, A, S, D, Space, Shift, Control
  hotbar slots: 1..9"""),
    ),
  ),
  AboutSection(
    title="Gravity blocks and break-particle sampling",
    blocks=(
      paragraph(
        "Gravity-affected blocks are implemented as a transition from static world state to transient falling bodies. `GravitySystem` identifies blocks with the `gravity_affected` tag, removes unsupported gravity blocks from the static world, advances falling state on the falling-block tick, emits render samples between discrete ticks, and resolves landing against collision and support geometry. This is materially different from moving a block cell-by-cell through the chunk mesh, because the renderer sees a continuous falling-block sample while the static world remains a discrete voxel map."
      ),
      paragraph(
        "The current gravity set is deliberately small: `sand`, `red_sand`, and `gravel`. Their landing path treats full support and implemented partial supports carefully; lower stairs, fences, fence gates, and walls can support the falling block, while a lower slab collision destroys the falling block and emits the block-break particle path. The same overlap-preservation discipline used for closed fence gates is also applied to landed gravity blocks, preventing load or landing events from pushing a player out through a state transition that the domain model has chosen to exempt."
      ),
      paragraph(
        "Break particles are sampled from active render boxes rather than a full-cube assumption. This matters for slabs, fences, walls, fence gates, and stairs, because a lattice sampled over the unit cube would place fragments where no visible material exists. The break-particle path therefore uses stochastic volume sampling over the block's actual render-box set, and renderer preferences expose both spawn-rate and speed scale so visual density and kinetic scale can be adjusted without changing block geometry semantics."
      ),
      code_block("""gravity and particle classes/functions:
  class GravitySystem
  class GravityStepResult
  class GravityBrokenBlock
  class FallingBlockRenderSample
  break_particle_samples_for_block()
  build_break_particle_instances()
  render_boxes_for_block()

gravity-affected tag:
  gravity_affected

current gravity-affected blocks:
  minecraft:sand
  minecraft:red_sand
  minecraft:gravel

particle preference parameters:
  block_break_particle_spawn_rate default: 1.0
  block_break_particle_spawn_rate range: 0.0..2.0
  block_break_particle_speed_scale default: 1.0
  block_break_particle_speed_scale range: 0.1..3.0"""),
    ),
  ),
  AboutSection(
    title="AI-player subsystem and route planning",
    blocks=(
      paragraph(
        "The AI special item turns a voxel cell into an actor-spawn operation. Right-clicking a valid placement cell with the searchable `AI` item spawns a standby AI instance at that cell. Each instance is then configured through a per-instance settings dialog with behavior mode, personality, block-placement permission, route style, and deletion action. This is an actor system integrated with world interaction, persistence, and rendering, not a decorative non-player model."
      ),
      paragraph(
        "AI state is represented by `AiPlayerState` and persisted by `PersistedAiPlayer`. The persisted fields include actor id, mode, personality, block-placement permission, held item id, position, velocity, yaw, pitch, health, max health, ground state, flying state, route points, route closure, route-running state, route style, and target index. Runtime behavior is distributed across route, navigation, avoidance, stuck recovery, parkour, placement, combat, idle, wander, spawning, serialization, and background worker modules. This distribution is necessary because a route actor can move, jump, fall, place blocks, recover from local obstruction, enter combat, and return to patrol without converting all behavior into one untestable update function."
      ),
      paragraph(
        "Flexible route planning snapshots a bounded world window around the patrol region and computes support-cell paths on a background worker. The route planner distinguishes complete target reachability from closest-approach failure, and the runtime freezes an actor when no complete route exists to the authored patrol point. During melee pursuit, route planning is suspended so combat pursuit does not consume route-planner work on the gameplay thread. The term support-cell route is used in its concrete code meaning: a path whose nodes represent standable support cells derived from the same collision semantics used by the player ground detector."
      ),
      code_block("""AI classes and modules:
  class AiPlayerState
  class AiRoutePoint
  class AiPlayerManager
  class AiRoutePlanRequest
  class AiRoutePlanResult
  class AiRoutePlanStep
  class PersistedAiPlayer

AI modules:
  avoidance.py
  combat.py
  idle.py
  manager.py
  modes.py
  navigation.py
  parkour.py
  placement.py
  planner.py
  recovery.py
  route.py
  runtime.py
  serialization.py
  settings.py
  spawning.py
  state.py
  stuck.py
  wander.py
  worker.py

available instance controls:
  modes: Standby, Route Patrol, Free Roam / PVP
  personalities: Aggressive, Peaceful
  route styles: Strict, Flexible
  route-edit hotbar: check item, eraser item, cancel item
  combat reach against player: 3 blocks
  default AI health: 20.0"""),
    ),
  ),
  AboutSection(
    title="Camera, HUD, skin, crosshair, and user-facing visual state",
    blocks=(
      paragraph(
        "Camera perspective is a persisted runtime preference. The cycle order is `First Person -> Third Person Back -> Third Person Front -> First Person`, exposed through the `F5` action and through video settings. Third-person placement is collision-constrained against block collision volumes, and the gameplay crosshair is suppressed outside first person. Player name tags are projected from world coordinates into screen composition, do not participate in shadow casting, and fade according to crouch and occlusion state."
      ),
      paragraph(
        "The player visual path separates simulation body state from rendered presentation state. `PlayerModelSnapshotDTO`, player visual composers, first-person geometry builders, first-person motion, held-block geometry, skin UV maps, and skin image handling collectively produce first-person arms, third-person bodies, held items, hurt tint, swing motion, and shadow-caster alignment. Modern imported skins are expected as `64x64` textures and are persisted as `state/player_skin.png`; resetting returns the renderer to the Alex default."
      ),
      paragraph(
        "The settings system exposes a persistent `16x16` crosshair editor, video and gameplay parameters, player name storage, camera perspective, clouds, shadow settings, movement parameters, arm-rotation limits, arm-swing duration, audio category volumes, and fullscreen behavior. `AudioPreferences` stores master, ambient, block, and player volumes, each clamped to the closed interval `[0, 1]`, and category gain is computed as master gain multiplied by the category-specific gain."
      ),
      code_block("""camera and HUD preferences:
  CAMERA_PERSPECTIVE_FIRST_PERSON: first_person
  CAMERA_PERSPECTIVE_THIRD_PERSON_BACK: third_person_back
  CAMERA_PERSPECTIVE_THIRD_PERSON_FRONT: third_person_front
  camera order: first_person, third_person_back, third_person_front
  default FOV: 80.0 degrees
  mouse sensitivity: 0.09 degrees per px
  default gameplay HUD toggle: F1
  default camera cycle: F5

crosshair:
  CROSSHAIR_GRID_SIZE: 16
  modes: default, custom
  custom grid: 16x16 pixels

skin and model:
  imported skin size: 64x64
  persisted skin path: state/player_skin.png
  default skin kind: Alex
  arm rotation limit default: -180.0..180.0 degrees
  arm swing duration default: 0.30 s
  arm swing duration range: 0.05..1.50 s

audio:
  class AudioPreferences
  categories: master, ambient, block, player
  volume clamp: 0.0..1.0
  effective non-master gain: master * category"""),
    ),
  ),
  AboutSection(
    title="Othello play space, board model, clocks, and interaction",
    blocks=(
      paragraph(
        "`Play Othello (Reversi)` is a second persistent play space with its own hotbar, board world, match state, clocks, AI opponent, animation state, settings window, and renderer integration. Ordinary block placement, block breaking, and the block inventory overlay are disabled in this space. Slot `1` contains `Start`, slot `9` contains `Settings`, and each selected control item is rendered as an enlarged visible item in first person, third person, and the shadow path."
      ),
      paragraph(
        "The Othello board is represented as an 8-by-8 domain board with `64` squares and a separate world-space board footprint. The initial board contains the standard four central discs: white at `(3,3)` and `(4,4)`, black at `(3,4)` and `(4,3)`. World interaction maps ray hits to algebraic square names from `a1` through `h8`, and the Othello HUD reports turn, best move, principal line, player-versus-AI evaluation, and evaluation graph while respecting the ordinary gameplay HUD visibility state."
      ),
      paragraph(
        "Match settings include difficulty, time control, animation mode, player order, sacrifice level, worker count, hash level, and opening-book learning bounds. The default Othello configuration is `Medium`, `20 minutes per side`, `Animation off`, and player moves first. Clocks pause while the pause menu or the detached Othello settings window is open, which makes UI inspection and settings edits part of the runtime-control model rather than an accidental clock leak."
      ),
      code_block("""Othello domain constants:
  BOARD_SIZE: 8
  BOARD_CELL_COUNT: 64
  SIDE_EMPTY: 0
  SIDE_BLACK: 1
  SIDE_WHITE: 2
  initial discs:
    white: (3,3), (4,4)
    black: (3,4), (4,3)

world-board placement:
  OTHELLO_BOARD_MIN_X: -4
  OTHELLO_BOARD_MIN_Z: -4
  OTHELLO_BOARD_GROUND_Y: 0
  OTHELLO_BOARD_BLOCK_Y: 1
  OTHELLO_BOARD_SURFACE_Y: 2.0
  board dark block: minecraft:dark_oak_planks
  board light block: minecraft:spruce_planks

Othello functions and classes:
  create_initial_board()
  counts_for_board()
  captures_for_move()
  find_legal_moves()
  has_any_legal_move()
  apply_move()
  winner_for_board()
  square_index_to_name()
  world_xz_to_square_index()
  raycast_board_square()
  class OthelloGameState
  class OthelloSettings
  class OthelloAnimationState"""),
    ),
  ),
  AboutSection(
    title="Othello search, opening-book learning, and persistent book storage",
    blocks=(
      paragraph(
        "The Othello AI is split into classic rules, bitboard representation, evaluation, move ordering, search, transposition, insane-tier analysis, worker execution, and opening-book handling. The difficulty menu exposes `Weak`, `Medium`, `Strong`, `Insane`, and `Insane+`. `Insane` uses the cached bitboard-search engine, while `Insane+` consults the bundled and user-extended opening book before falling through to the same search core."
      ),
      paragraph(
        "Opening-book learning is bounded by explicit parameters rather than by a vague learning label. Depth admits `0..60` with default `55`. Per-move error, cumulative error, and leaf error each admit `0..24`, with defaults `22`, `19`, and `20`. Learning state is cancellable and persists partial user-generated lines under `state/othello_opening_book.json`, while the compiled lookup cache is stored under `cache/othello_opening_book_cache.json`. Storage is symmetry-aware through canonicalized board transforms, so rotated and reflected equivalents are treated as the same position for lookup and pruning."
      ),
      paragraph(
        "The Othello time-control set is also concrete. Per-move controls are `5`, `10`, and `30` seconds. Per-side controls are `1`, `3`, `5`, `10`, and `20` minutes, stored internally as `60`, `180`, `300`, `600`, and `1200` seconds. Animation modes include simultaneous off-state rendering and ripple variants; the flip animation state uses a `0.22 s` duration and `0.075` lift height, making disc movement a bounded visual process attached to match generation."
      ),
      code_block("""engine modules:
  bitboards.py
  classic.py
  evaluation_profile.py
  evaluation.py
  insane.py
  ordering.py
  search.py
  transposition.py
  worker.py
  books/opening.py
  books/learning.py

difficulty values:
  weak
  medium
  strong
  insane
  insane_plus

time controls:
  off: no side limit
  per move: 5 s, 10 s, 30 s
  per side: 60 s, 180 s, 300 s, 600 s, 1200 s
  default: 1200 s per side

book learning:
  depth range: 0..60
  default depth: 55
  error bound range: 0..24
  default per-move error: 22
  default cumulative error: 19
  default leaf error: 20
  worker count range: 1..8
  hash level range: 0..6
  user book: state/othello_opening_book.json
  compiled cache: cache/othello_opening_book_cache.json

animation:
  animation duration: 0.22 s
  lift height: 0.075"""),
    ),
  ),
  AboutSection(
    title="Renderer contracts, render snapshots, and platform selection",
    blocks=(
      paragraph(
        "Rendering is mediated through contracts rather than direct widget access to backend internals. `BackendRendererApi` defines initialization, destruction, renderer information, shadow information, payload validation, frame metrics, runtime-state application, cloud and texture-animation pause controls, atlas UV lookup, world-build tools, block display-name resolution, chunk eviction, selection targeting, chunk submission, frame rendering, player-skin image update, and player-preview rendering. The session layer emits render snapshots, while the presentation layer turns those snapshots into OpenGL or wgpu calls."
      ),
      paragraph(
        "The renderer target is platform-selected. Windows keeps the existing PyOpenGL path and an OpenGL `4.3` surface contract. macOS uses wgpu-native through a Qt rendercanvas surface, reaching Metal through wgpu instead of relying on Apple's legacy OpenGL implementation. The same shader source names are mirrored under the OpenGL shader root and the wgpu shader source root, but the macOS path does not require the OpenGL compute-shader payload path that the Windows renderer can use."
      ),
      paragraph(
        "The term renderer-contract bifurcation is used here for a precise condition: Ludoxel has two backend families, but they are expected to implement the same application-visible renderer contract. Backend differences are allowed at API and upload level; they are not allowed to change the meaning of a block state, a skin UV map, a selected face, a shadow-caster transform, or a submitted chunk snapshot."
      ),
      code_block("""renderer contract classes:
  BackendRendererApi
  BackendRendererBackend
  BackendRendererConfig
  BackendRendererResources
  BackendRendererRuntimeState
  BackendRendererFrameMetrics
  BackendPassFrameMetrics
  BackendUploadTracker
  RenderSnapshotDTO

BackendRendererApi methods:
  initialize()
  destroy()
  gl_info()
  shadow_info()
  payload_validation_report()
  frame_metrics()
  apply_runtime_state()
  set_cloud_motion_paused()
  set_texture_animation_paused()
  atlas_uv_face()
  world_build_tools()
  block_display_name()
  evict_chunks()
  clear_selection()
  set_selection_target()
  submit_chunk()
  render()
  set_player_skin_image()
  render_player_preview_frame()

platform renderer selection:
  Windows: PyOpenGL / OpenGL 4.3
  macOS: wgpu-native / rendercanvas / Metal

shader roots:
  src/ludoxel/presentation/rendering/backends/opengl/shaders
  src/ludoxel/presentation/rendering/backends/wgpu/shaders/sources"""),
    ),
  ),
  AboutSection(
    title="OpenGL renderer, GLSL resources, and frame parameters",
    blocks=(
      paragraph(
        "The Windows rendering path uses `RendererBackend`, `GLRenderer`, OpenGL resource wrappers, shader-program compilation, mesh buffers, storage buffers, texture atlases, frame pipelines, and pass-specific render modules. The OpenGL surface configuration requests version `4.3`, core profile, `24`-bit depth buffer, `8`-bit stencil buffer, double buffering, zero multisample samples, and a swap interval determined by the v-sync preference. This is an explicit desktop-renderer contract rather than a generic Qt paint event."
      ),
      paragraph(
        "The OpenGL shader root contains world, shadow, player-model, first-person, cloud, sun, selection, and Othello shader resources, plus `chunk_face_payload.comp` and shared `face_instance.glsl`. The compute payload path is relevant because the Windows OpenGL implementation can rely on GLSL 4.30-level mechanisms such as compute shaders and buffer-backed face payload processing. The macOS path deliberately avoids requiring that same OpenGL compute contract."
      ),
      paragraph(
        "Frame parameters are likewise explicit. `BackendCameraParams` uses near and far planes `0.05` and `200.0`. `BackendShadowParams` defaults to a `2048`-square shadow map, dark multiplier `0.20`, minimum bias `0.00005`, slope bias `0.00050`, polygon offset factor `0.50`, and units `0.75`. `BackendSunParams` defaults to azimuth `45.0`, elevation `60.0`, distance `150.0`, half angle `2.6`, light distance `60.0`, orthographic radius `30.0`, near plane `0.1`, and far plane `140.0`. Clouds use a volumetric field abstraction with `y = 28`, thickness `3`, macro cell size `32`, view radius `150`, horizontal speed components `0.70` and `0.10`, and default seed `1337`."
      ),
      code_block("""OpenGL classes and modules:
  RendererBackend
  GLRenderer
  ShaderProgram
  MeshBuffer
  ColoredMeshBuffer
  StorageBuffer
  TextureAtlas
  ImageTexture
  FramePipeline
  WorldPass
  ShadowMapPass
  PlayerModelPass
  FirstPersonArmPass
  HeldBlockPass
  FallingBlockPass
  BlockBreakParticlePass
  CloudPass
  SelectionPass
  OthelloRenderPass

OpenGL surface:
  version: 4.3
  profile: CoreProfile
  depth buffer: 24 bits
  stencil buffer: 8 bits
  samples: 0
  double buffer: true
  swap interval: 1 when vsync_on else 0

shader count per backend root:
  fragment shaders: 10
  vertex shaders: 10
  compute shaders: 1
  shared GLSL include: 1
  total shader files per root: 22

representative shader names:
  world.vert / world.frag
  world_no_shadow.frag
  shadow.vert / shadow.frag
  player_model.vert / player_model.frag
  player_model_shadow.vert
  first_person_face.vert / first_person_face.frag
  cloud_box.vert / cloud_box.frag
  selection_line.vert / selection_line.frag
  othello.vert / othello.frag
  chunk_face_payload.comp
  common/face_instance.glsl"""),
    ),
  ),
  AboutSection(
    title="wgpu renderer, rendercanvas surface, and cross-backend parity",
    blocks=(
      paragraph(
        "The macOS rendering path is organized under `presentation.rendering.backends.wgpu` and contains chunk meshes, pipeline factory functions, runtime backend objects, surface configuration, resources, texture atlas handling, and shader sources. `configure_wgpu_canvas` and the wgpu surface layer adapt the Qt-hosted rendercanvas surface to the backend. The design follows the wgpu model in which the canvas context is configured, a current texture is acquired for rendering, and the rendered texture is presented through the canvas context."
      ),
      paragraph(
        "The wgpu path exists because macOS should not be forced through Apple's legacy OpenGL implementation. wgpu supplies a WebGPU-shaped abstraction over native graphics backends, including Metal on macOS, while rendercanvas supplies a GUI-agnostic canvas API that can be hosted in Qt. In Ludoxel, this external stack is not treated as a reason to relax renderer parity: block UVs, face orientation, culling behavior, skin mapping, first-person arm transforms, third-person model transforms, Othello control items, shadow-caster orientation, and selection outlines still have to match the renderer contract established by the application."
      ),
      paragraph(
        "The wgpu shader source directory mirrors the OpenGL shader naming surface, but the macOS path does not compile or link `chunk_face_payload.comp` and does not require GLSL 4.30 compute shaders, shader storage buffers, or `glMultiDrawArraysIndirect`. The engineering requirement is therefore not textual shader identity; it is semantic identity at the submitted-render-snapshot level. A chunk face emitted by CPU payload builders, a UV rectangle from the atlas, or a player skin vertex from `skin_uv_maps` must denote the same visual object in both backend families."
      ),
      code_block("""wgpu modules:
  presentation/rendering/backends/wgpu/meshes/chunk.py
  presentation/rendering/backends/wgpu/pipelines/factory.py
  presentation/rendering/backends/wgpu/runtime/backend.py
  presentation/rendering/backends/wgpu/runtime/resources.py
  presentation/rendering/backends/wgpu/runtime/surface.py
  presentation/rendering/backends/wgpu/textures/atlas.py

wgpu pipeline factory functions:
  create_world_pipeline()
  create_world_wireframe_pipeline()
  create_world_shadowed_pipeline()
  create_shadow_depth_pipeline()
  create_transform_shadow_pipeline()
  create_sun_pipeline()
  create_cloud_pipeline()
  create_cloud_wireframe_pipeline()
  create_selection_pipeline()
  create_othello_pipeline()
  create_othello_shadow_pipeline()

wgpu backend classes and functions:
  class WgpuRendererBackend
  class _WgpuBlockVisualResolver
  configure_wgpu_canvas()

macOS renderer stack:
  PyQt6 window
  rendercanvas Qt surface
  wgpu Python package
  wgpu-native
  Metal backend

explicit macOS non-requirements:
  no OpenGL 4.3 context requirement
  no GLSL 4.30 compute requirement
  no shader storage buffer requirement
  no glMultiDrawArraysIndirect requirement"""),
    ),
  ),
  AboutSection(
    title="Input ownership, macOS cursor capture, and modal-state suspension",
    blocks=(
      paragraph(
        "Input handling is owned by presentation input modules rather than by arbitrary widgets. Qt key and mouse events, gameplay input state, macOS keyboard interception, and macOS cursor recentering are separated into `game_input.py`, `qt.py`, `macos_guard.py`, and `macos_cursor.py`. This separation is important because gameplay capture, UI interaction, pause overlays, settings windows, Othello dialogs, inventory screens, and application deactivation each impose different rules on whether simulation input should be consumed, suspended, or released."
      ),
      paragraph(
        "Mouse-look capture has a resynchronization phase after re-enable. During that phase the system cursor is repeatedly recentered, keyboard movement remains available, camera delta is forced to zero, and normal sampling resumes only after the cursor has remained at the viewport center across successive polls. On macOS, keyboard interception and mouse confinement are separate: the keyboard path uses the native CoreGraphics event-tap guard, while the mouse path recenters through a CoreGraphics cursor-warp helper before falling back to Qt cursor positioning."
      ),
      paragraph(
        "Time-based renderer motion is suspended for true application deactivation and for pause, death, inventory, Othello-settings, and short-lived notice-dialog states. The detached settings window is the controlled exception: visual settings remain live so the user can inspect world rendering while the dialog is open. The viewport explicitly re-arms world upload and selection refresh after returning from pause or inventory, preventing stale render cadence from becoming visible as delayed world recovery."
      ),
      code_block("""input modules:
  presentation/interface/input/game_input.py
  presentation/interface/input/qt.py
  presentation/interface/input/macos_guard.py
  presentation/interface/input/macos_cursor.py

viewport and lifecycle modules:
  presentation/interface/viewport/widgets/gl.py
  presentation/interface/viewport/widgets/renderer.py
  presentation/interface/viewport/lifecycle/mixin.py
  presentation/interface/viewport/render_loop/frame_sync.py
  presentation/interface/viewport/render_loop/loop.py
  presentation/interface/viewport/overlays/controller.py
  presentation/interface/viewport/selection/state.py

macOS packaging permission string:
  NSInputMonitoringUsageDescription

capture policy:
  gameplay captured -> mouse-look and gameplay keys are owned by Ludoxel
  modal UI open -> simulation input suspended
  application inactive -> capture released
  recapture -> cursor recentering and zero-delta resynchronization"""),
    ),
  ),
  AboutSection(
    title="Settings surfaces, About page composition, and creator-facing metadata",
    blocks=(
      paragraph(
        "The settings layer is implemented as detached Qt surfaces and composable about-page widgets, not as literal markdown injected into the viewport. `ABOUT_PROJECT_OVERVIEW_SECTIONS` is consumed by `render_about_sections`, and each `AboutSection` contains a title and an ordered tuple of `AboutBlock` objects. Blocks are produced by `paragraph` and `code_block`, which allows ordinary prose and technical code-like listings to be rendered consistently through `about_text` and `about_code_block`. This is why the overview text must be precise: it is application UI content, but it is also a condensed specification of actual code architecture."
      ),
      paragraph(
        "The About page is therefore not a promotional page. It is a compact technical account of what Ludoxel v3.6 actually contains: package boundaries, runtime state, renderer contracts, interaction rules, block models, AI behavior, Othello search, packaging surfaces, and legal-resource treatment. Creator metadata, profile image candidates, GitHub image candidates, title-mark fallback, and project overview sections are all handled by the settings/about content and widget modules, but the substantive project overview must remain grounded in code, file layout, and numeric constants."
      ),
      code_block("""About page content structures:
  @dataclass(frozen=True)
  class AboutBlock:
    kind: str
    text: str

  @dataclass(frozen=True)
  class AboutSection:
    title: str
    blocks: tuple[AboutBlock, ...]

helper functions:
  paragraph(text: str) -> AboutBlock
  code_block(text: str) -> AboutBlock
  render_about_sections(layout, sections)
  about_card()
  about_text()
  about_code_block()
  about_meta_row()
  about_pill()

image candidate names:
  profile.png, profile.jpg, profile.jpeg, profile.webp, profile.bmp
  github.png, github.jpg, github.jpeg, github.webp, github.bmp, github.svg"""),
    ),
  ),
  AboutSection(
    title="Native acceleration and development command surface",
    blocks=(
      paragraph(
        "The native build is intentionally narrow. Only `ludoxel.foundations.mathematics.geometry.ray_aabb`, `ludoxel.foundations.mathematics.voxels.dda`, and `ludoxel.foundations.mathematics.linear.view_angles` are compiled in place. These modules are appropriate native candidates because they are dominated by scalar arithmetic, geometric branching, voxel traversal, and dense numerical operations. Broader block orchestration, session management, renderer dispatch, and UI behavior remain in Python because their cost model is governed by object traffic, dictionaries, callbacks, heterogeneous containers, and user-interface state rather than a single arithmetic kernel."
      ),
      paragraph(
        "The editable install and native build are separated. `pyproject.toml` describes ordinary editable installation, while `tools/build_native_extensions` drives the optional in-place extension build and verifies that imports resolve to generated binary modules rather than Python fallback files. This separation keeps `python -m pip install -e .` lightweight and prevents Cython execution from becoming an implicit metadata-evaluation side effect."
      ),
      paragraph(
        "Repository development is entered through `package.json` and `tools`. The check surface includes formatting, linting, directory export tests, package checks, documentation checks, license checks, resource checks, and shader checks. Python source is formatted with `indent-width = 2`, `line-length = 200`, target version `py313`, and the Ruff formatter configuration preserves the two-space house style rather than rewriting the project into four-space indentation."
      ),
      code_block("""native extension targets:
  ludoxel.foundations.mathematics.geometry.ray_aabb
  ludoxel.foundations.mathematics.voxels.dda
  ludoxel.foundations.mathematics.linear.view_angles

native commands:
  npm run build:native
  npm run build:native:check

active tool directories:
  tools/help_commands
  tools/check_project
  tools/build_native_extensions
  tools/build_desktop_app
  tools/clean_build_artifacts
  tools/export_directory_markdown
  tools/format_python_source
  tools/format_web_source
  tools/convert_audio_assets

principal repository commands:
  npm run help
  npm run check
  npm run ci
  npm run format
  npm run format:check
  npm run lint
  npm run tools:export
  npm run tools:test
  npm run package:check
  npm run docs:check
  npm run license:check
  npm run resources:check
  npm run shader:check
  npm run clean
  npm run assets:audio:check
  npm run assets:audio:convert

Ruff source policy:
  line-length: 200
  indent-width: 2
  target-version: py313
  quote-style: double
  skip-magic-trailing-comma: true"""),
    ),
  ),
  AboutSection(
    title="Desktop packaging, bundled resources, fonts, and legal material",
    blocks=(
      paragraph(
        "Desktop packaging is handled through `tools/build_desktop_app`. The Windows path builds a PyInstaller one-file executable from `src/ludoxel/__main__.py`, runs the narrow native rebuild unless skipped, collects package data under `src/ludoxel`, bundles repository-level assets, preserves runtime writes under the app-managed data root, and publishes `Ludoxel.exe` beside legal material. The macOS path builds a PyInstaller `.app`, preserves Python framework layout, collects wgpu and rendercanvas packages, patches the input-monitoring usage string, re-signs the bundle after Info.plist modification, verifies fonts, and checks bundle shape."
      ),
      paragraph(
        "Resource handling distinguishes immutable bundled resources from runtime user data. Theme resources live under `presentation/interface/theme`, shader resources live under the renderer backend shader roots, Othello bundled resources live under `simulation/spaces/othello/resources`, and repository-level UI assets remain under `assets/ui`. Desktop builds must bundle `LICENSE`, `NOTICE`, and `third-party`, and runtime startup registers bundled fonts rather than relying on a platform system-font fallback."
      ),
      paragraph(
        "The legal boundary is part of the engineering surface because packaging and documentation can otherwise misrepresent provenance. Ludoxel Original Materials are governed by `LicenseRef-All-Rights-Reserved` under the Ludoxel Independent License. The repository is not open source. Third-party materials, fonts, SDKs, external packages, and local provenance-sensitive assets remain governed by their own terms or by unresolved provenance, and must not be described as original Ludoxel assets merely because they are present under a local resource directory."
      ),
      code_block("""Windows packaging:
  npm run build:windows
  frozen entry: src/ludoxel/__main__.py
  published executable: dist/windows/Ludoxel.exe
  executable icon candidate: assets/ui/app_icon.ico
  companion material: LICENSE, NOTICE, third-party/

macOS packaging:
  npm run build:macos
  npm run build:macos:check
  npm run build:macos -- --status
  app bundle: dist/macos/Ludoxel.app
  renderer path: wgpu-native / rendercanvas / Metal
  input-monitoring key: NSInputMonitoringUsageDescription
  release steps kept separate: codesigning and notarization

package data:
  presentation/interface/theme/*.qss
  presentation/rendering/backends/opengl/shaders/*.vert, *.frag, *.comp, common/*.glsl
  presentation/rendering/backends/wgpu/shaders/sources/*.vert, *.frag, *.comp, common/*.glsl
  simulation/spaces/othello/resources/*.json

license boundary:
  license id: LicenseRef-All-Rights-Reserved
  legal files: LICENSE, NOTICE, third-party/
  local runtime data: not original package resource
  repository-level configs: migration input only"""),
    ),
  ),
)
