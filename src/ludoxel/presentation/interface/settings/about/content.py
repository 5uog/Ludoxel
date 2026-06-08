# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

PROFILE_IMAGE_CANDIDATE_NAMES: tuple[str, ...] = ("profile.png", "profile.jpg", "profile.jpeg", "profile.webp", "profile.bmp")

ABOUT_CREATOR_DISPLAY_NAME = "Kento Konishi"
ABOUT_CREATOR_HANDLE = "5uog"
ABOUT_CREATOR_ROLE = "Keio University student / Ludoxel creator"
ABOUT_CREATOR_AGE = "20"
ABOUT_CREATOR_GENDER = "he/him"

ABOUT_PROFILE_BIO_TEXT: str = (
  "My academic work is directed toward future legal practice, with particular concern for victim protection, fact finding, procedural access, information management, and "
  "institutional reform. Law is the principal field of that study. Information security, software architecture, persistence design, interface construction, and verification "
  "supply an adjacent technical discipline for examining how protective systems can remain inspectable, explainable, testable, and accountable when they process human claims, "
  "evidence, access routes, stored information, and institutional decisions. Ludoxel is developed as a separate personal desktop software project, but it shares that discipline "
  "of explicit structure: state must be preserved deliberately, renderer behavior must be observable, input ownership must be controlled, and user-facing systems must be "
  "described in terms precise enough to be tested."
)

ABOUT_WORK_TEXT: str = (
  "I work on Ludoxel as a PyQt6 desktop application with persistent voxel-world state, first-person and third-person camera behavior, collision, picking, block-state rendering, "
  "falling-block simulation, AI-player behavior and route planning, a separate Othello play space, platform-specific OpenGL and wgpu renderer paths, app-managed runtime "
  "persistence, bundled resources, desktop packaging, and application-facing documentation."
)

ABOUT_ACADEMIC_DIRECTION_TEXT: str = (
  "My academic direction centers on legal practice, victim protection, fact finding, procedural access, information management, and institutional reform. Software-system design "
  "is relevant to that direction because protective institutions also depend on inspectable architecture, controlled state, reliable access paths, durable records, explicit "
  "procedures, and explanations that remain accurate when a system is used by a person rather than only described by its designer."
)

ABOUT_ETYMOLOGY_PARAGRAPHS: tuple[str, ...] = (
  (
    "Latin 'ludus' underlies the initial element 'lud-'. Its attested semantic field extends across play, game, sport, school, and training. The stem therefore carries a broad "
    "ludic reference: play as a general class of rule-bound or exploratory activity, rather than one combat form, one genre, or one fixed rule set."
  ),
  (
    "'Voxel' is the modern technical contraction of 'volumetric' and 'pixel'. In technical usage, it denotes a discrete element of three-dimensional representation, commonly "
    "treated as the spatial analogue of the pixel, and therefore refers to discretized volume rather than to a merely visual style or atmospheric motif."
  ),
  (
    "'Ludoxel' accordingly denotes ludic activity conducted in voxel space. As the title of a sandbox desktop application, the term is operationally exact: the represented "
    "environment is voxel-constituted, while the admitted activity remains broadly ludic, extending across local manipulation, traversal, authored routes, AI observation, and a "
    "separate board-game space hosted inside the same shell."
  ),
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
        "Ludoxel is a PyQt6 desktop application for controlled experimentation on a restricted voxel-world model, a first-person and third-person camera pipeline, persistent "
        "local state, and platform-specific voxel renderers. The application currently contains a persistent sandbox space, a separate Othello play space, survival-health "
        "handling with fall and void damage, melee feedback and knockback, block-state geometry for selected structural block families, gravity-affected falling blocks, AI-player "
        "behavior with authored routes, custom crosshair editing, imported slim-arm skin display, player-name projection, audio mixing, runtime preferences, app-managed state, and "
        "desktop packaging support."
      ),
      paragraph(
        "The application is best understood as an engineering workbench expressed as a playable desktop system. Rendering, collision, picking, input ownership, persistence, "
        "deterministic numerical inspection, UI state, platform graphics behavior, and frozen-application resource loading are exposed as ordinary application concerns. "
        "Minecraft-derived semantics operate as local design references for implemented subsystems; the project does not claim full Minecraft equivalence for movement, combat, "
        "world generation, inventory breadth, redstone, networking, or content coverage."
      ),
      paragraph(
        "The title states the operative idea of the software. Ludoxel combines ludic activity with voxel space, and the desktop shell therefore hosts several forms of play under "
        "one runtime: sandbox editing, first-person traversal, third-person inspection, route authorship, AI observation, player preview, persistent settings, and an Othello "
        "subsystem that preserves its own board rules while sharing the same presentation and runtime frame."
      ),
    ),
  ),
  AboutSection(
    title="Application spaces",
    blocks=(
      paragraph(
        "The desktop shell exposes two persistent application modes: My World and Play Othello (Reversi). The pause menu transfers the session between those spaces, disables the "
        "already-active destination, and exposes Save & Quit as the closing path that persists the current world, player state, mode-local session data, and runtime preferences. "
        "Each space keeps its own player transform and session-specific state, so returning to a space restores its own play context without overwriting it with the other mode's "
        "context."
      ),
      code_block("My World\nPlay Othello (Reversi)\nSave & Quit"),
      paragraph(
        "The pause overlay is organized as a screen-wide two-column surface. The left half presents the Ludoxel title mark above boxed session and space-management controls, using "
        "the same title-image search path as the loading screen and keeping the logo/control stack centered as one unit. The right half contains a vertically centered live "
        "slim-arm player preview with skin import and reset actions directly below it."
      ),
      paragraph(
        "The preview interaction path supplies desired view angles to the renderer-owned player-preview surface, preserving the backend's skin texture path, cube layout, and body "
        "preview API. Pointer motion across the pause surface steers the head whenever the left mouse button is not held. Holding the left mouse button and dragging rotates the "
        "preview body around the vertical axis. The head yaw remains a bounded offset from the body heading, and pitch follows screen-space vertical direction. In third person, "
        "with gameplay HUD rendering enabled, the same name-panel treatment used in-world can project the resolved session player name above the preview head."
      ),
    ),
  ),
  AboutSection(
    title="My World",
    blocks=(
      paragraph(
        "My World is the ordinary persistent sandbox space. It is a flat inspection environment in which the implemented block subset can be placed, broken, rendered, picked, and "
        "collided against. The space preserves imported skin state, camera perspective, HUD visibility, explicit player-name persistence, inventory selection, local world edits, "
        "and the player transform attached to the sandbox state."
      ),
      paragraph(
        "Outside creative mode, the local player runs under a survival-health path with a 20-point health pool shown on the gameplay HUD. Fall damage follows Minecraft-like "
        "thresholds, falling below y = -64 applies repeated void damage on a fixed half-second cadence, and lethal damage enters the ordinary death-and-respawn flow. Health, "
        "position, velocity, orientation, grounded state, and mode-specific world edits are restored when the space is re-entered."
      ),
      paragraph(
        "The implemented block catalog includes full cubes, slabs, stairs, fences, fence gates, and walls. Those families use explicit block-state logic for render boxes, collision "
        "volumes, pick volumes, structural connectivity, and wall top-support behavior. The same shape information aligns visual selection, collision response, fence and wall "
        "behavior, falling-block support, and restart restoration with the visible world."
      ),
      paragraph(
        "Sand, red sand, and gravel are gravity-affected blocks. They leave the static world as transient falling bodies, descend on a Minecraft-like falling-block tick, render "
        "continuously between ticks, settle on valid lower structural supports, and break with terrain-fragment particle output when the implemented support rules require "
        "destruction. Their state is part of the sandbox simulation path rather than a decorative animation layered over the world."
      ),
      paragraph(
        "The player collision and block-edit paths include depenetration for pre-existing overlaps, special restoration for saved overlaps inside closed fence gates, and preserved "
        "overlap handling when landed gravity blocks settle onto the player. Runtime restoration reconstructs those exemptions before the first post-load collision step, so a "
        "saved state does not force the camera or player body into a new support condition on relaunch."
      ),
    ),
  ),
  AboutSection(
    title="Block interaction",
    blocks=(
      paragraph(
        "The ordinary block interaction path remains active inside My World. Holding the left mouse button in creative mode repeats block breaking continuously, and holding the "
        "right mouse button repeats placement or fence-gate interaction. The persistent default cadences are 0.30 seconds for break repetition, approximately 0.008 seconds for "
        "placement continuation, and 0.20 seconds for interaction repetition. These values are stored with runtime preferences and can be edited through the Game Player settings "
        "page."
      ),
      paragraph(
        "Held placement is constrained to a maintained continuation line. It distinguishes visible side-face starts, support-face starts, grounded crouch-bridging starts, top-face "
        "and bottom-face starts, vertical branches from the first follow-up decision, and deferred starts where the target cell is temporarily occupied by the player body. The "
        "frontier advances only after the attempted cell remains a valid world block at that exact coordinate, so rejected placement, player overlap, missing support, and "
        "unsupported falling-block conversion cannot be counted as route progress."
      ),
      paragraph(
        "The maintained placement route can grow in either signed direction from the first placed block. Support-face continuation evaluates the live movement command projected "
        "onto the route axis, live pick context, visible frontier faces, support transfer, grounded state, and vertical displacement before admitting horizontal or vertical "
        "continuation. The resulting behavior supports bridging, upward and downward starts, visible face chains, ordinary single-click placement, and sustained high-cadence "
        "placement without the previous accidental two-block burst."
      ),
      paragraph(
        "Block destruction emits short-lived terrain-fragment break particles. Spawn positions are sampled from the broken block's active render boxes through stochastic volume "
        "sampling, so thin members and partial-volume blocks emit fragments from their actual visible or structural volume instead of from a hard-coded full-cube lattice."
      ),
    ),
  ),
  AboutSection(
    title="AI players and route editing",
    blocks=(
      paragraph(
        "AI-player behavior is implemented inside the sandbox. The creative inventory exposes a searchable AI special item. Right-clicking a valid placement cell spawns a standby "
        "AI instance immediately, and right-clicking that actor opens an application-modal per-instance settings window built on the same detached sidebar-dialog and main.qss "
        "styling path used by the common settings surfaces."
      ),
      code_block("Standby\nRoute Patrol\nFree Roam / PVP\nAggressive\nPeaceful"),
      paragraph(
        "The per-instance settings surface owns behavior mode, personality, block-placement permission, route editing, route deletion, and actor deletion. Route configuration "
        "temporarily switches the active hotbar to a dedicated route-edit branch. The leftmost slot contains the check item, the second slot contains the eraser item, and the "
        "rightmost slot contains the cancel item. While route editing is active, left-clicking ground-block top faces records route points, the eraser focuses and deletes points "
        "under the crosshair, and the viewport draws draft and committed routes as world-space line strips."
      ),
      paragraph(
        "Closing the route back onto the first point yields a continuous loop. An open route causes the AI to traverse to the terminal point, return to the first point, and repeat. "
        "The actor currently being edited is frozen during the route-edit branch, and any pending route request for that actor is canceled before editing begins so the instance "
        "does not continue stepping into damage or death while its patrol path is being authored."
      ),
      paragraph(
        "Spawned AI players persist independently with transform, health, behavior mode, personality, block-placement permission, route style, and route state. Their visible model "
        "uses the same skin pipeline, third-person body renderer, and shadow path as the local player, and their state remains attached to the play space in which they were "
        "created."
      ),
    ),
  ),
  AboutSection(
    title="AI movement, combat, and planning",
    blocks=(
      paragraph(
        "Route AI supports strict and flexible routing styles. The strict form aims directly at authored patrol points. The flexible form snapshots a bounded world window around "
        "the patrol region, offloads support-cell route planning to a background worker, accepts only complete routes that reach the presently authored patrol point, and reuses "
        "returned support-cell paths until world changes, blocked edges, failed placement, or repeated lack of progress invalidate them."
      ),
      paragraph(
        "The flexible planner uses the same collision-derived support semantics as the player ground detector. It admits ordinary short step-up and auto-jump traversals before "
        "longer parkour, admits short downward drop transitions where landing support is collision-safe, resolves authored patrol points onto nearby standable supports, retries "
        "failed patrol targets, and applies bounded local recovery when no fresh full route is available. When no complete route exists to the present authored patrol point, the "
        "actor freezes instead of skipping to a later point or marching toward an unreachable closest-approach cell."
      ),
      paragraph(
        "Free-roam and route AI share the local player's collision, jump, placement, interaction, and kinematic stepping paths. AI actors can receive and deal melee knockback, flash "
        "red when damaged, swing the visible attack arm during successful melee strikes, and use jump-reset, knockback-reduction placement, and bridge-placement heuristics while "
        "traversing and fighting whenever block placement is enabled for that instance."
      ),
      paragraph(
        "During active melee pursuit, route AI suspends route planning and falls back to direct combat pursuit so that combat does not consume route-planner work on the gameplay "
        "thread. Aggressive route AI may break off briefly to attack the player when the player enters the nearby engagement volume, then return to patrol after the target leaves "
        "that limited range. Peaceful AI does not attack."
      ),
    ),
  ),
  AboutSection(
    title="Camera, HUD, and player preview",
    blocks=(
      paragraph(
        "Camera perspective is persistent runtime state. The default perspective cycle follows First Person, Third Person Back, Third Person Front, and then First Person again. "
        "The same action is remappable through control settings, and the video settings page can select the current perspective directly."
      ),
      code_block("First Person\nThird Person Back\nThird Person Front"),
      paragraph(
        "Third-person camera placement is collision-constrained against block collision volumes. The camera retracts before penetrating nearby geometry and uses a smaller near "
        "plane with a larger clearance margin so nearby faces remain visible while the camera is pressed back against blocks. The gameplay crosshair is suppressed outside first "
        "person."
      ),
      paragraph(
        "Gameplay HUD rendering is remappable and defaults to the F1 gameplay action. When HUD rendering is enabled and the camera is in third person, the resolved session player "
        "name is projected above the player head in world space and in the pause preview. It uses the same translucent debug-style background treatment, fades when geometry "
        "occludes the head or when the player is crouching, follows the rendered player-model base position during step transitions, and disappears with the rest of the gameplay "
        "HUD when the HUD setting is disabled."
      ),
      paragraph(
        "The third-person player body and first-person arm use a persistent slim-arm skin texture. The default texture remains Alex, a custom modern 64 by 64 skin can be imported "
        "from the pause menu, the imported file is stored as state/player_skin.png under the app-managed data root, and resetting returns the renderer to Alex. Held blocks and "
        "Othello control items follow the same swing state in the visible model and shadow path."
      ),
    ),
  ),
  AboutSection(
    title="Video settings and interaction surfaces",
    blocks=(
      paragraph(
        "Video settings are hosted in a separate application-modal settings window, so visual changes can be inspected against the live world while the window remains open. The "
        "video page exposes field of view, camera perspective, view bobbing, camera shake, cloud options, render distance, world wireframe, cloud wireframe, shadow visibility, "
        "animated texture behavior, break-particle controls, arm-rotation limits, and arm-swing duration."
      ),
      paragraph(
        "The crosshair surface exposes the default Minecraft-style crosshair together with a persistent 16 by 16 pixel editor. A custom pattern can be drawn with the left mouse "
        "button, erased with the right mouse button, and reset through Clear Board, which clears the editor board and restores the default pattern. The gameplay crosshair is "
        "rendered without the previous forced black outline."
      ),
      paragraph(
        "The Game Player page stores movement parameters, creative mode, auto-jump, auto-sprint, interaction cadences, particle output, and the explicit player name. Leaving the "
        "name blank keeps the launch name dialog enabled and causes a new random session name to be generated at each restart. The creative inventory also includes a live search "
        "field for block names, block ids, and special-item ids."
      ),
      paragraph(
        "The audio page controls master, ambient, block, and player volume. The controls page owns movement actions, gameplay actions, hotbar actions, and keybind reset. When a "
        "detached settings window or detached Othello settings window is opened while fullscreen is enabled, the host window temporarily returns to normal state for dialog "
        "access and reapplies the stored fullscreen preference after the detached window closes."
      ),
    ),
  ),
  AboutSection(
    title="Play Othello (Reversi)",
    blocks=(
      paragraph(
        "Play Othello (Reversi) is a second persistent play space hosted inside the same application shell. It has its own hotbar, match settings, AI opponent, clocks, board "
        "interaction path, piece animation path, rendering path, opening-book state, and HUD. Ordinary block placement, block breaking, and the block inventory overlay are "
        "disabled while this mode is active."
      ),
      paragraph(
        "The Othello hotbar is reserved for control items. Slot 1 contains Start, and slot 9 contains Settings. Selecting either slot equips a dedicated enlarged control icon "
        "rendered in first person and attached to the third-person player model and its shadow, keeping the active control item legible before use."
      ),
      paragraph(
        "Right-clicking Start begins a fresh match or restarts the current match under stored defaults. Right-clicking Settings opens a separate application-modal Othello settings "
        "window for AI strength, time control, disc-animation mode, player order, sacrifice level, worker count, hash level, opening-book learning limits, and opening-book import "
        "or export."
      ),
      code_block("Weak\nMedium\nStrong\nInsane\nInsane+"),
      paragraph(
        "Disc placement is performed by aiming at the board and pressing the left mouse button on a legal square. Hovering reports algebraic square names from a1 through h8. The "
        "Othello HUD uses the same panel style as the ordinary debug HUD, hides when the F3 debug HUD is shown or gameplay HUD rendering is disabled, and otherwise reports turn, "
        "best move, principal line, player-versus-AI evaluation, and an evaluation graph derived from the current search trace. Match clocks pause while the pause menu or the "
        "separate Othello settings window is open."
      ),
    ),
  ),
  AboutSection(
    title="Othello learning and board behavior",
    blocks=(
      paragraph(
        "The Othello difficulty menu exposes Weak, Medium, Strong, Insane, and Insane+. Insane remains the cached bitboard-search engine without enforced opening-book selection, "
        "while Insane+ consults bundled and user-extended opening-book lines before falling through to the same search core. The default configuration remains Medium, 20 minutes "
        "per side, Animation off, and player moves first."
      ),
      paragraph(
        "The time-control menu exposes timer-off play, per-move limits, and side-clock limits. The animation menu exposes the previous simultaneous-flip path as Animation off "
        "together with Ripple fast and Ripple slow, both of which start successive flips from the placed disc outward instead of rotating every captured disc at once."
      ),
      paragraph(
        "Opening-book learning is threshold-controlled and cancellable. It admits explicit depth, per-move error, cumulative error, and leaf-error bounds; mirrors progress in the "
        "detached settings window and the in-world Othello title HUD; temporarily projects the explored learning position onto the rendered board; and preserves partial progress "
        "on cancellation because user-generated book lines are durable state."
      ),
      paragraph(
        "Book storage is symmetry-aware at the position level through canonicalized board transforms, so search lookup and learning-state pruning treat rotated and reflected "
        "equivalents as the same opening-book position. A pristine persisted Othello state renders the standard initial 2 by 2 opening discs before the first match is started."
      ),
    ),
  ),
  AboutSection(
    title="Startup and shell execution",
    blocks=(
      paragraph(
        "The canonical source-tree startup route is python -m ludoxel. The package entry path is rooted at src/ludoxel/__main__.py, after which control passes into "
        "ludoxel.application.bootstrap. The public project title is Ludoxel, while the source package and import namespace remain ludoxel, allowing visible application identity "
        "to remain separate from the current Python package boundary."
      ),
      code_block("python -m ludoxel"),
      paragraph(
        "At startup, Ludoxel enforces a single desktop shell instance. A second launch restores, raises, and activates the already-running top-level Ludoxel surface instead of "
        "opening a second process window. Before either the loading surface or the main window is shown, the shell loads persisted player identity and presents the name dialog "
        "when no explicit stored name exists. An empty continuation is preserved as no stored name, which causes a new random session name to be generated on each launch."
      ),
      paragraph(
        "The launch path shows a dedicated top-level loading screen before the main window surfaces, while the embedded viewport keeps its in-window loading overlay until renderer "
        "initialization has completed and the initially visible chunk set has reached GPU residency. Loading surfaces search bundled UI assets for the Ludoxel title image, then "
        "fall back to the textual title. Simulation input is suspended during that phase, and the persisted window rectangle and target monitor are restored before splash or main "
        "window presentation."
      ),
      paragraph(
        "Space transfers between My World and Play Othello reuse a retained CPU-side chunk-build cache and immediately re-enter the loading overlay while the target residency set "
        "is unresolved. Application deactivation suspends simulation input and releases mouse capture. The pause menu opens only after ordinary captured gameplay deactivation, "
        "and already-released states such as inventory do not get replaced by an unsolicited pause surface."
      ),
    ),
  ),
  AboutSection(
    title="Source layout and execution boundaries",
    blocks=(
      paragraph(
        "The source tree is organized by responsibility. ludoxel.foundations contains identity, repository and runtime root resolution, diagnostics, and math kernels. "
        "ludoxel.simulation contains world state, block catalogs and models, movement, collision, interaction rules, player and AI-player state, inventories, Othello rules, "
        "engines, books, and bundled Othello resources. ludoxel.application contains bootstrap, UI-independent preferences, persistence stores, integrity checking, session "
        "factories, managers, runtime-state pipelines, render snapshot DTOs, and fixed-step runners. ludoxel.presentation contains Qt windows, input, HUD, overlays, settings "
        "surfaces, theme resources, renderer contracts, OpenGL and wgpu backends, shader resources, visual builders, and audio playback."
      ),
      code_block("ludoxel.foundations\nludoxel.simulation\nludoxel.application\nludoxel.presentation"),
      paragraph(
        "Package resources live under presentation/interface/theme, presentation/rendering/backends/opengl/shaders, presentation/rendering/backends/wgpu/shaders/sources, and "
        "simulation/spaces/othello/resources, while repository-level UI assets remain under assets/ui. This division keeps immutable package resources, renderer sources, bundled "
        "game resources, and repository-level visual material visible as separate responsibility classes."
      ),
      paragraph(
        "The native build remains deliberately narrow. Only ludoxel.foundations.mathematics.geometry.ray_aabb, ludoxel.foundations.mathematics.voxels.dda, and "
        "ludoxel.foundations.mathematics.linear.view_angles are compiled in place. Those modules are dominated by scalar arithmetic, geometric branching, and dense numerical work. "
        "Broader scene and block orchestration layers remain in Python because their dominant costs are Python object traffic, callback dispatch, dictionary access, and "
        "heterogeneous container traversal, which reduce the benefit of opaque extension-module compilation."
      ),
      paragraph(
        "The editable install and the explicit native build are separated. python -m pip install -e . is described by pyproject.toml and does not make Cython part of ordinary "
        "metadata evaluation. npm run build:native enters tools/build_native_extensions, drives the optional in-place native build, and verifies that the interpreter resolves the "
        "three hot-path imports to compiled binaries instead of Python fallback sources."
      ),
    ),
  ),
  AboutSection(
    title="Runtime persistence",
    blocks=(
      paragraph(
        "Runtime-writable data is separated from immutable application resources. Player settings, window state, world edits, custom player skin, player identity, space-local "
        "player transforms, AI actor state, Othello state, and user-generated opening-book lines are durable state. Rebuildable opening-book cache data is treated separately."
      ),
      paragraph(
        "The app-managed data root is resolved through ludoxel.foundations.locations.roots.default_runtime_data_root and honors LUDOXEL_DATA_ROOT when that environment variable is "
        "set explicitly. Runtime writes do not use the repository-level configs directory as the ordinary save location. An existing repository-level configs directory is treated "
        "only as previous-format input for migration and compatibility."
      ),
      paragraph(
        "The app-managed data root is split into state and cache. The main state files are covered by state/state_manifest.json and state/integrity_key.bin through HMAC-SHA256 "
        "checks. This provides tamper detection for ordinary local use and accidental corruption, while a local user who can rewrite both stored files and the local integrity key "
        "can still defeat the mechanism."
      ),
      code_block("state/player_state.json\nstate/world_state.json\nstate/player_skin.png\nstate/othello_opening_book.json\ncache/othello_opening_book_cache.json"),
      paragraph(
        "Persistence is described to the user as application state, not as a development surface. The About page therefore identifies durable state, cache-like data, migration-only "
        "legacy input, and relaunch restoration behavior without treating local state files as ordinary authoring or configuration APIs."
      ),
    ),
  ),
  AboutSection(
    title="Packaging and command surface",
    blocks=(
      paragraph(
        "Development support is entered through package.json and tools. The supported command surface includes help, check, CI, formatting, linting, directory export, project "
        "checks, native build recovery, desktop packaging, cleanup, audio-asset conversion, license checks, resource checks, and shader checks. A root-level scripts directory is "
        "not part of the supported structure."
      ),
      code_block(
        "npm run help\n"
        "npm run check\n"
        "npm run ci\n"
        "npm run format\n"
        "npm run format:check\n"
        "npm run lint:py\n"
        "npm run tools:export\n"
        "npm run build:native\n"
        "npm run build:windows\n"
        "npm run build:macos"
      ),
      paragraph(
        "The Windows executable builder uses src/ludoxel/__main__.py as the frozen entry script, collects package data under src/ludoxel, bundles assets, LICENSE, NOTICE, and "
        "third-party material, assigns a Windows AppUserModelID, enables multiprocessing freeze support, suppresses visible diagnostic probe consoles, and publishes the staged "
        "one-file executable under dist/windows while preserving legal companion material beside it."
      ),
      paragraph(
        "The macOS packaging command builds a PyInstaller app bundle, preserves the bundled Python.framework symlink layout, bundles assets, fonts, LICENSE, NOTICE, and third-party "
        "material, records the gameplay input monitoring usage string for the keyboard guard in Info.plist, re-signs the bundle after that Info.plist patch, forwards a macOS icon "
        "only when a real .icns asset exists, and verifies the bundle shape through the macOS check path. Codesigning and notarization remain separate release steps."
      ),
    ),
  ),
  AboutSection(
    title="Renderer paths and platform behavior",
    blocks=(
      paragraph(
        "The renderer target is selected by platform. Windows uses the existing PyOpenGL renderer and its OpenGL 4.3 contract. macOS uses wgpu-native through a Qt rendercanvas "
        "surface, reaching Metal through wgpu-native instead of depending on Apple's OpenGL implementation."
      ),
      paragraph(
        "The renderer paths are intended to expose the same application behavior: visible world faces, player model and preview, HUD projection, Othello board rendering, shadow "
        "and selection behavior where supported, texture atlas behavior, falling-block presentation, break-particle presentation, and first-person or third-person item display."
      ),
      paragraph(
        "On macOS, gameplay input handling keeps keyboard interception and mouse confinement as separate presentation concerns. The keyboard path installs the CoreGraphics event "
        "tap used by the native guard, and the mouse path recenters the system cursor through a small CoreGraphics cursor-warp helper before falling back to Qt cursor positioning. "
        "The app bundle declares keyboard Input Monitoring usage, while the cursor recenter path does not require a separate mouse-specific permission text."
      ),
      paragraph(
        "Mouse-look capture enters a short resynchronization phase after capture is re-enabled. During that phase the system cursor is repeatedly re-centered, keyboard movement "
        "continues to flow, camera delta is forced to zero, and normal mouse-look sampling resumes only after the cursor has remained at the viewport center across successive "
        "polls. Cursor rearming, focus return, loading completion, and dialog state are visible application behavior because they determine whether the desktop shell can be used "
        "reliably."
      ),
    ),
  ),
  AboutSection(
    title="Shaders, resources, and platform assets",
    blocks=(
      paragraph(
        "Shader validation targets the package shader roots under src/ludoxel/presentation/rendering/backends/opengl/shaders and "
        "src/ludoxel/presentation/rendering/backends/wgpu/shaders/sources. The check keeps obvious cross-profile hazards out of source. The macOS renderer path does not compile "
        "or link chunk_face_payload.comp and does not require GLSL 4.30 compute shaders, shader storage buffers, or glMultiDrawArraysIndirect; the Windows renderer path continues "
        "to use the existing OpenGL implementation until a migrated path is verified on Windows hardware."
      ),
      paragraph(
        "The application registers bundled fonts and uses bundled visual resources when available. Desktop builds must bundle fonts under assets/fonts, and runtime startup "
        "registers those bundled fonts instead of relying on a platform system-font fallback. Loading screens and About surfaces search bundled UI assets for the Ludoxel title "
        "mark, and the About page falls back to that title mark and a text avatar when no separate creator portrait asset is present."
      ),
      paragraph(
        "Windows icon handling and runtime Qt icon handling are separate. A real assets/ui/app_icon.ico file can be forwarded to PyInstaller so the generated Windows executable "
        "carries the custom shell icon, while the running Qt application searches bundled icon assets and applies the first decodable file as the runtime window icon. The macOS "
        "builder forwards an icon only when a real .icns asset is present."
      ),
    ),
  ),
  AboutSection(
    title="Legal and repository governance",
    blocks=(
      paragraph(
        "Ludoxel Original Materials are governed by LicenseRef-All-Rights-Reserved under the Ludoxel Independent License in LICENSE. The repository is not open source and is not "
        "licensed under Apache-2.0. NOTICE records the relationship between Ludoxel Original Materials, third-party materials, provenance-sensitive local assets, runtime user "
        "data, and distribution legal material."
      ),
      paragraph(
        "Third-party license texts are kept under third-party. Kaisei Opti is documented with the SIL Open Font License text, and desktop builds must carry the bundled fonts and "
        "legal material required for distribution review. Local Minecraft-named assets and fonts under assets are not covered by the Ludoxel Independent License and must not be "
        "represented as original Ludoxel assets."
      ),
      paragraph(
        "The GitHub governance boundary mirrors the repository's non-open-source status. External contributions are not accepted, issue forms are limited, security reporting is "
        "separated, Dependabot is scoped, and CI runs the same npm entrypoint used locally. The public-facing legal and policy text therefore remains aligned with the technical "
        "separation between original project material, third-party material, local runtime state, and distribution artifacts."
      ),
    ),
  ),
)
