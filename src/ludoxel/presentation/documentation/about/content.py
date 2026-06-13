# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.presentation.documentation.about.model import AboutSection, code_block, code_run, code_value, paragraph, text_run

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
ABOUT_PROJECT_OVERVIEW_SECTIONS: tuple[AboutSection, ...] = (
  AboutSection(
    title="Ludoxel v3.6 as an executable desktop system",
    blocks=(
      paragraph(
        text_run("Ludoxel v3.6 is an executable Python package, a PyQt6 desktop application, and a persistent interactive simulation system organized under the "),
        code_run("ludoxel"),
        text_run(" import namespace. Its identity is fixed in package metadata as "),
        code_run("ludoxel"),
        text_run(", version "),
        code_run("3.6.1"),
        text_run(", with the license identifier "),
        code_run("LicenseRef-All-Rights-Reserved"),
        text_run(", Python range "),
        code_run(">=3.13,<3.15"),
        text_run(", and an installed console entry point "),
        code_run("ludoxel = ludoxel.application.bootstrap:run_app"),
        text_run(
          ". The application should be understood as a controlled software system rather than a visual sample: it binds a voxel sandbox, Othello play space, block-state geometry, first-person interaction, third-person camera behavior, AI-player runtime, renderer backend contract, OpenGL and wgpu implementations, app-managed persistence, HMAC-backed manifest verification, native-extension tooling, desktop packaging, resource bundling, and legal material into one auditable source tree."
        ),
      ),
      paragraph(
        text_run("The executable boundary is intentionally narrow. Source-tree execution enters "),
        code_run("src/ludoxel/__main__.py"),
        text_run("; that file imports "),
        code_run("multiprocessing"),
        text_run(", imports "),
        code_run("run_app"),
        text_run(" from "),
        code_run("ludoxel.application"),
        text_run(", calls "),
        code_run("multiprocessing.freeze_support()"),
        text_run(", and then calls "),
        code_run("run_app()"),
        text_run(". The application package facade exposes "),
        code_run("run_app"),
        text_run(" lazily from "),
        code_run("ludoxel.application.bootstrap"),
        text_run(", and "),
        code_run("ludoxel.application.bootstrap.run.run_app()"),
        text_run(
          " performs root resolution, optional Python 3.14 re-execution outside frozen execution, Othello book storage hook installation, and final transfer into the Qt shell. This chain gives the project one startup model for editable installs, source-tree execution, and packaged desktop execution, while still allowing frozen application checks and platform-specific resource-root resolution."
        ),
      ),
      paragraph(
        "The project’s runtime dependency boundary is also explicit. PyQt6 provides the desktop shell and widget system; NumPy supports numerical and renderer-facing data; PyOpenGL is selected on Windows for the OpenGL renderer path; wgpu and rendercanvas are selected on Darwin for the macOS renderer path. The dependency markers in package metadata are not optional prose because renderer selection, surface creation, shader-resource handling, event-loop integration, and preview rendering depend on those platform constraints. Development extras such as build, Cython, PyInstaller, setuptools, wheel, and Ruff define the verification, native-extension, and distribution workflow, while ordinary source execution can remain Python-first and package-data-driven."
      ),
      paragraph(
        text_run("Ludoxel exposes two persistent play spaces inside one desktop shell: "),
        code_run("My World"),
        text_run(" and "),
        code_run("Play Othello (Reversi)"),
        text_run(". "),
        code_run("My World"),
        text_run(" is the voxel sandbox and inspection space for block-state placement, breaking, collision, falling blocks, AI actors, and route editing. "),
        code_run("Play Othello (Reversi)"),
        text_run(
          " is a second persistent space with its own player transform, board state, clocks, AI opponent, control items, opening-book state, and renderer scene. Both spaces share application preferences, renderer contracts, modal-state rules, data-root policy, save discipline, and desktop packaging. They differ at the session, world, inventory, Othello-state, and interaction-policy levels rather than at the process or executable level."
        ),
      ),
      paragraph(
        text_run(
          "The term restricted voxel-world model has a precise meaning in this project. Ludoxel does not claim general completeness as a full Minecraft implementation. It selects a limited but technically coherent subset of blocks, block states, collision volumes, pick volumes, rendering boxes, gravity behavior, placement rules, and survival damage so that the relationship among "
        ),
        code_run("WorldState"),
        text_run(", "),
        code_run("BlockDefinition"),
        text_run(
          ", state codecs, registries, renderer snapshots, backend upload, persistence files, and settings surfaces remains inspectable. This narrower model gives the codebase its engineering value: each domain object can be tracked across storage, simulation, renderer submission, UI editing, and packaged execution without dissolving into an unbounded catalogue of unrelated features."
        ),
      ),
      paragraph(
        "The About overview therefore belongs inside the product surface. It is not decorative biography text and not a README surrogate. It describes the executable package, root ownership, runtime state model, renderer contract, input-capture strategy, persistence schema, development command surface, native build boundary, and desktop packaging boundary implemented by the repository. A user opening this About page should be able to understand what the application is, which subsystems are implemented, how state is stored, why Windows and macOS renderers differ, which commands verify the repository, and what legal and distribution boundaries govern the shipped materials."
      ),
      code_block(
        "project identity:\n  package namespace: ludoxel\n  package version: 3.6.1\n  source root: src/ludoxel\n  module entry: src/ludoxel/__main__.py\n  console script: ludoxel = ludoxel.application.bootstrap:run_app\n  license identifier: LicenseRef-All-Rights-Reserved\n\nruntime dependency ranges:\n  Python: >=3.13,<3.15\n  PyQt6: >=6.6,<7\n  numpy: >=1.26,<3\n  PyOpenGL on Windows: >=3.1,<4\n  wgpu on Darwin: >=0.31,<0.32\n  rendercanvas on Darwin: >=2.6,<3\n\ndevelopment extras:\n  build>=1.2,<2\n  Cython>=3.0,<4\n  PyInstaller>=6,<7\n  setuptools>=82\n  wheel>=0.45\n  ruff>=0.14,<1\n\npersistent play spaces:\n  My World\n  Play Othello (Reversi)"
      ),
    ),
  ),
  AboutSection(
    title="Layered package architecture and import discipline",
    blocks=(
      paragraph(
        text_run("The source tree is organized into four principal layers: "),
        code_run("ludoxel.foundations"),
        text_run(", "),
        code_run("ludoxel.simulation"),
        text_run(", "),
        code_run("ludoxel.application"),
        text_run(", and "),
        code_run("ludoxel.presentation"),
        text_run(". "),
        code_run("foundations"),
        text_run(
          " contains project identity, root-location resolution, diagnostics, scalar coercion, numeric helpers, vector and matrix operations, view-angle calculations, AABB and ray mathematics, voxel DDA traversal, face constants, chunk-coordinate functions, and frustum clipping. It is the lowest layer because these facilities are used by both domain logic and presentation logic while carrying no Qt, renderer-backend, persistence-store, or play-space orchestration responsibilities."
        ),
      ),
      paragraph(
        code_run("simulation"),
        text_run(
          " owns domain state and rule execution. Its subpackages define worlds, generation fixtures, block definitions, block textures, block registries, block states, block-state codecs, block model geometry, structural connectivity, player entities, player movement, player damage, AI-player behavior, AI routing, AI combat, inventories, special items, collision, gravity, placement, picking, interaction, My World, Othello board rules, Othello engines, Othello matches, Othello books, Othello resources, and Othello control inventories. This layer is the owner of gameplay meaning: a block placement, legal Othello move, collision AABB, player health transition, or AI route decision is defined here rather than in a renderer pass or Qt widget."
        ),
      ),
      paragraph(
        code_run("application"),
        text_run(
          " owns orchestration and persisted application meaning. It contains bootstrap, runtime preferences, camera preferences, keybind preferences, crosshair schema, player-name normalization, player-skin kind, audio preferences, persistence schema, JSON file stores, integrity manifest handling, Othello book storage hooks, play-space context creation, session factories, session managers, runtime-state application, render-snapshot DTO construction, fixed-step runners, and save scheduling. This layer can assemble "
        ),
        code_run("simulation"),
        text_run(" and "),
        code_run("foundations"),
        text_run(", but its ordinary modules do not own Qt widgets, renderer buffers, shader programs, or audio playback implementations."),
      ),
      paragraph(
        code_run("presentation"),
        text_run(
          " owns the desktop-facing implementation. It includes user-facing documentation data, Qt windows, viewport widgets, input adapters, macOS cursor and keyboard guards, HUD widgets, route overlays, pause inventory and death overlays, skin preview, settings pages, About-page renderer and widgets, theme resources, audio playback catalogues, renderer contracts, OpenGL runtime, wgpu runtime, shader resources, texture atlases, visible-face construction, player visual state, Othello visual state, and render-loop lifecycle. Presentation can consume application and simulation state, but it must not redefine domain legality, persistence format, or package-root ownership."
        ),
      ),
      paragraph(
        text_run("The dependency direction is architectural, not ornamental. "),
        code_run("foundations"),
        text_run(" sits below the other layers; "),
        code_run("simulation"),
        text_run(" may depend on foundations; "),
        code_run("application"),
        text_run(" may depend on simulation and foundations; "),
        code_run("presentation"),
        text_run(" may depend on application, simulation, and foundations. The unavoidable final connection from application startup to Qt shell is localized as a composition-root exception in "),
        code_run("src/ludoxel/application/bootstrap/run.py"),
        text_run(", where "),
        code_run("ludoxel.presentation.interface.windows.main.run_app"),
        text_run(
          " is imported only after roots and storage hooks have been resolved. That exception should not be generalized into persistence, preference, store, schema, session, or simulation modules."
        ),
      ),
      paragraph(
        "This separation is required because Ludoxel stores long-lived state that crosses layers. A persisted AI route point must be meaningful to route planning, route overlay rendering, AI movement, and save/load. A block-state string must be meaningful to collision, picking, rendering, structural update, gravity support, and persistence. A crosshair pixel grid must be meaningful to settings UI, runtime preferences, HUD rendering, and serialized settings. Without explicit layer ownership, those meanings would drift into duplicated renderer or widget assumptions."
      ),
      code_block(
        "principal layers:\n  ludoxel.foundations\n  ludoxel.simulation\n  ludoxel.application\n  ludoxel.presentation\n\nfoundations responsibilities:\n  identity\n  root locations\n  diagnostics\n  scalar coercion\n  vectors and matrices\n  AABB and ray math\n  DDA voxel traversal\n  chunk keys\n  frustum clipping\n\nsimulation responsibilities:\n  worlds\n  blocks\n  block states\n  block models\n  actors\n  inventories\n  movement\n  collision\n  gravity\n  placement\n  picking\n  interaction\n  My World\n  Othello\n\napplication responsibilities:\n  bootstrap\n  preferences\n  persistence schema\n  stores\n  integrity manifest\n  sessions\n  render snapshots\n  fixed-step runners\n\npresentation responsibilities:\n  Qt shell\n  input\n  HUD\n  overlays\n  settings\n  audio\n  renderer contracts\n  OpenGL backend\n  wgpu backend\n\ncomposition-root exception:\n  src/ludoxel/application/bootstrap/run.py imports ludoxel.presentation.interface.windows.main.run_app"
      ),
    ),
  ),
  AboutSection(
    title="Bootstrap, root resolution, and application startup",
    blocks=(
      paragraph(
        text_run("Application startup begins at "),
        code_run("src/ludoxel/__main__.py"),
        text_run(" for module execution and at the console script declared in package metadata for installed execution. The module entry calls "),
        code_run("multiprocessing.freeze_support()"),
        text_run(" before "),
        code_run("run_app()"),
        text_run(" so that frozen desktop applications and multiprocessing-aware code paths do not enter uncontrolled child-process behavior. The imported "),
        code_run("run_app"),
        text_run(" symbol is resolved by "),
        code_run("ludoxel.application.__getattr__"),
        text_run(", which imports "),
        code_run("ludoxel.application.bootstrap"),
        text_run(" lazily. The lazy facade keeps package import cheap and prevents early presentation import before the actual startup phase."),
      ),
      paragraph(
        code_run("ludoxel.application.bootstrap.run.run_app()"),
        text_run(" is the composition function. It computes the project root by calling "),
        code_run("default_project_root(Path(__file__))"),
        text_run(", computes the resource root by calling "),
        code_run("default_resource_root(Path(__file__))"),
        text_run(", computes the data root by calling "),
        code_run("default_runtime_data_root(project_root)"),
        text_run(
          ", and only then evaluates the Python-version preference and presentation-shell import. Root calculation is centralized because the same application must work from a source tree, an editable install, and a PyInstaller bundle with a different resource layout."
        ),
      ),
      paragraph(
        text_run("The bootstrap module contains a Python 3.14 preference path for non-frozen execution. "),
        code_run("_ensure_python_314(project_root)"),
        text_run(" returns immediately when the application is frozen or already running under Python 3.14. Otherwise, "),
        code_run("_preferred_python_314()"),
        text_run(" searches local installation candidates, and the bootstrap can re-execute "),
        code_run("python -m ludoxel"),
        text_run(" under the preferred interpreter while preserving "),
        code_run("PYTHONPATH"),
        text_run(" for the source root. This behavior is deliberately outside persistence and presentation because interpreter selection is an execution concern, not a widget concern."),
      ),
      paragraph(
        text_run("Othello book storage hooks are installed immediately before the presentation shell is imported. "),
        code_run("install_othello_book_storage_hooks()"),
        text_run(
          " connects simulation-level opening-book functions to application-owned runtime paths, user-book files, compiled-cache files, JSON IO, and integrity manifest updates. This placement prevents the Othello simulation book module from importing application root policy directly while still allowing the application to provide persistent user book storage."
        ),
      ),
      paragraph(
        text_run("The final startup transfer calls "),
        code_run("ludoxel.presentation.interface.windows.main.run_app(project_root=project_root, resource_root=resource_root, data_root=data_root)"),
        text_run(
          ". The three roots are therefore already established before the Qt window, renderer widget, theme loader, font loader, audio manager, settings overlay, or viewport lifecycle code begins. This is important because all of those components need consistent access to immutable package resources and mutable runtime state."
        ),
      ),
      paragraph(
        text_run("Runtime root policy has platform-specific branches. "),
        code_run("LUDOXEL_DATA_ROOT"),
        text_run(" is an explicit override. Windows defaults to "),
        code_run("%LOCALAPPDATA%/Ludoxel"),
        text_run("; Darwin defaults to "),
        code_run("~/Library/Application Support/Ludoxel"),
        text_run("; other platforms follow XDG-style or home-directory fallback behavior. Runtime state and cache directories are produced underneath this data root. Repository-level "),
        code_run("configs/"),
        text_run(" remains a previous-format migration source, not the normal v3.6 write target."),
      ),
      code_block(
        'startup route:\n  python -m ludoxel\n  src/ludoxel/__main__.py\n  multiprocessing.freeze_support()\n  ludoxel.application.__getattr__("run_app")\n  ludoxel.application.bootstrap.run.run_app()\n  default_project_root(Path(__file__))\n  default_resource_root(Path(__file__))\n  default_runtime_data_root(project_root)\n  _ensure_python_314(project_root)\n  install_othello_book_storage_hooks()\n  ludoxel.presentation.interface.windows.main.run_app(project_root=..., resource_root=..., data_root=...)\n\nruntime root policy:\n  LUDOXEL_DATA_ROOT override\n  Windows: %LOCALAPPDATA%/Ludoxel\n  Darwin: ~/Library/Application Support/Ludoxel\n  runtime state root: state/\n  runtime cache root: cache/\n  manifest path: state/state_manifest.json\n  integrity key path: state/integrity_key.bin\n  previous-format migration root: configs/'
      ),
    ),
  ),
  AboutSection(
    title="Desktop shell, windows, and play-space switching",
    blocks=(
      paragraph(
        text_run(
          "The desktop shell is the user-facing composition of startup, state restoration, renderer initialization, input capture, modal surfaces, settings, and play-space switching. The main window restores persisted window geometry, applies theme resources, installs bundled fonts, loads icon and title-mark resources, constructs "
        ),
        code_run("GameScreen"),
        text_run(", attaches the renderer viewport, and coordinates loading overlay state. Minimum dimensions such as "),
        code_run("980 x 620"),
        text_run(" belong to the shell layer because they define the usable desktop surface for settings, gameplay, pause, Othello HUD, and live preview rather than domain simulation."),
      ),
      paragraph(
        code_run("GameScreen"),
        text_run(" selects the platform viewport widget. Darwin uses "),
        code_run("RendererViewportWidget"),
        text_run(", which enters the renderer-contract path that can host the wgpu backend through rendercanvas. Non-Darwin platforms use "),
        code_run("GLViewportWidget"),
        text_run(
          ", which enters the OpenGL-backed Qt surface path. This split is performed before resource loading and frame rendering because renderer initialization, canvas availability, OpenGL format requests, macOS cursor policy, and shader-resource expectations differ by platform."
        ),
      ),
      paragraph(
        text_run("The desktop shell hosts two persistent spaces: "),
        code_run("PLAY_SPACE_MY_WORLD = my_world"),
        text_run(" and "),
        code_run("PLAY_SPACE_OTHELLO = othello"),
        text_run(". "),
        code_run("PlaySpaceContext"),
        text_run(" contains one "),
        code_run("SessionManager"),
        text_run(" for each space and exposes "),
        code_run("session_for()"),
        text_run(", "),
        code_run("active_session()"),
        text_run(", and "),
        code_run("set_active_space()"),
        text_run(". "),
        code_run("RuntimePreferences.current_space_id"),
        text_run(" and "),
        code_run("AppState.current_space_id"),
        text_run(
          " persist the active space. Switching spaces is therefore not a temporary screen overlay; it is a state transition among persisted sessions that preserves player state, world state, AI actor state, inventory branch, Othello state, and renderer upload lifecycle."
        ),
      ),
      paragraph(
        "The pause menu belongs to the shell and runtime-state boundary. Its actions include returning to My World, entering Play Othello, opening settings, resuming gameplay, and saving before quitting. A destination action is disabled when the destination is already active. This prevents double activation and makes the current-space id visible as an application state variable rather than as a text label only. Saving on quit flows through application persistence so that both world branches and the active-space id are written together."
      ),
      paragraph(
        text_run(
          "The pause surface also hosts a live player preview. That preview uses the renderer API rather than duplicating skin UV logic in Qt painting code. The preview can rotate the player body, update head yaw and pitch, import a custom skin, reset to default Alex skin, and show a name tag when the same camera and HUD conditions that support in-world tags are active. This ties shell UI to renderer contract methods such as "
        ),
        code_run("set_player_skin_image()"),
        text_run(" and "),
        code_run("render_player_preview_frame()"),
        text_run("."),
      ),
      paragraph(
        text_run("Startup loading is also treated as shell state. The loading overlay begins with text such as "),
        code_run("Preparing viewport..."),
        text_run(
          ", and completion is tied to renderer initialization and initially needed world upload residency. That prevents a false-ready state where the window exists but the renderer, chunk uploads, skin resources, or selection state are not ready. The shell can suspend input while modal surfaces are open and re-arm world upload and selection refresh after returning to gameplay."
        ),
      ),
      code_block(
        "desktop shell objects:\n  MainWindow\n  GameScreen\n  GLViewportWidget\n  RendererViewportWidget\n  PlaySpaceContext\n  RuntimePreferences\n\nwindow and loading facts:\n  minimum width: 980\n  minimum height: 620\n  initial loading status: Preparing viewport...\n\nplay-space identifiers:\n  PLAY_SPACE_MY_WORLD: my_world\n  PLAY_SPACE_OTHELLO: othello\n  PLAY_SPACE_IDS: my_world, othello\n\nspace switch state:\n  RuntimePreferences.current_space_id\n  AppState.current_space_id\n  PlaySpaceContext.my_world\n  PlaySpaceContext.othello\n  PlaySpaceContext.active_session()\n  PlaySpaceContext.set_active_space(space_id)\n\nplatform viewport selection:\n  Darwin: RendererViewportWidget\n  other platforms: GLViewportWidget"
      ),
    ),
  ),
  AboutSection(
    title="Persistence schema and application state envelopes",
    blocks=(
      paragraph(
        text_run("Application persistence is divided into schema records and stores. "),
        code_run("AppState"),
        text_run(" is the in-memory aggregate: it stores "),
        code_run("current_space_id"),
        text_run(", "),
        code_run("settings"),
        text_run(", "),
        code_run("inventory"),
        text_run(", "),
        code_run("othello_settings"),
        text_run(", "),
        code_run("my_world"),
        text_run(", and "),
        code_run("othello_space"),
        text_run(
          ". It does not directly own JSON parsing, manifest verification, old-format migration, or renderer objects. The aggregate exists so the application can pass complete saved state through one object while the actual schema modules remain specialized: settings, inventory, player, world, AI player, play-space bundle, Othello-space bundle, and file envelopes."
        ),
      ),
      paragraph(
        code_run("PlayerStateFile"),
        text_run(" is the player-side envelope. Its current version is "),
        code_run("7"),
        text_run(". It serializes the active space id, "),
        code_run("PersistedSettings"),
        text_run(", "),
        code_run("PersistedInventory"),
        text_run(", and "),
        code_run("OthelloSettings"),
        text_run(
          ". The name can be misleading unless read together with the schema: it stores more than the local player transform because v3.6 separates stable user preferences and hotbar branches from world state. Its "
        ),
        code_run("from_dict()"),
        text_run(" path also accepts earlier input and normalizes missing or malformed settings into defaults."),
      ),
      paragraph(
        code_run("WorldStateFile"),
        text_run(" is the world-side envelope. Its current version is "),
        code_run("3"),
        text_run(". It serializes a "),
        code_run("spaces"),
        text_run(" mapping containing "),
        code_run("my_world"),
        text_run(" and "),
        code_run("othello"),
        text_run(", with each branch carrying player state, world state, and AI actors, and the Othello branch additionally carrying "),
        code_run("OthelloGameState"),
        text_run(". It also contains migration behavior for earlier files that had top-level "),
        code_run("player"),
        text_run(" and "),
        code_run("world"),
        text_run(" fields without a "),
        code_run("spaces"),
        text_run(" object. Such files are converted into the My World branch while Othello receives a default persisted space."),
      ),
      paragraph(
        code_run("PersistedSettings"),
        text_run(
          " is the application preference schema. It stores view parameters, axis inversion, selection outline, cloud state, wireframe flags, shadow state, sun orientation, creative mode, repeated-interaction timing, break-particle controls, auto-jump, auto-sprint, HUD and hand visibility, player name, crosshair mode and pixels, player-skin kind, camera perspective, fullscreen state, view bobbing, camera shake, first-person arm limits, animated texture state, movement parameters, render distance, debug flags, v-sync, HUD debug visibility, window geometry, keybind settings, and audio settings. The schema is intentionally broad because these settings must survive relaunch."
        ),
      ),
      paragraph(
        code_run("PersistedInventory"),
        text_run(
          " stores four hotbar branches: creative, survival, Othello, and route-edit. Each branch carries slot contents and selected index, normalized through the domain hotbar size. This is necessary because the same number keys and scroll operations can address different inventory semantics depending on creative mode, current play space, and route-edit state. A single flat hotbar would lose mode-local state when moving between My World, Othello, creative inventory, survival inventory, and AI route editing."
        ),
      ),
      paragraph(
        code_run("PersistedPlayer"),
        text_run(" stores local player transform and damage state: position, velocity, yaw, pitch, "),
        code_run("on_ground"),
        text_run(", "),
        code_run("flying"),
        text_run(
          ", auto-jump cooldown, crouch-eye offset, health, and maximum health. Flying state is restored only when runtime creative-mode state permits it. This avoids converting a previously creative player into an illegal survival flyer while still preserving movement mode in the appropriate context. Player restoration also clamps pitch and clears transient damage cooldowns so saved state remains durable rather than frame-local."
        ),
      ),
      paragraph(
        code_run("PersistedAiPlayer"),
        text_run(
          " stores actor identity, AI mode, personality, block-placement permission, held item id, display name, health-indicator position, auto-regeneration settings, position, velocity, yaw, pitch, health, max health, ground state, flying state, route points, route closed flag, route run flag, route style, and route target index. It converts to and from "
        ),
        code_run("AiPlayerState"),
        text_run(", and its "),
        code_run("from_dict()"),
        text_run(
          " path normalizes unknown modes, personalities, route styles, held items, indicator positions, regeneration values, and coordinates. Files written before these fields existed load with defaults: an empty name (replaced by an allocated default on restore), indicator "
        ),
        code_run("off"),
        text_run(", and auto regeneration disabled. This makes AI actors first-class persistent domain objects, not renderer decorations or temporary spawn effects."),
      ),
      code_block(
        "application persistence aggregate:\n  AppState.current_space_id\n  AppState.settings\n  AppState.inventory\n  AppState.othello_settings\n  AppState.my_world\n  AppState.othello_space\n\nfile envelopes:\n  PlayerStateFile(version=7)\n  WorldStateFile(version=3)\n\nschema records:\n  PersistedSettings\n  PersistedInventory\n  PersistedPlayer\n  PersistedWorld\n  PersistedAiPlayer\n  PersistedPlaySpace\n  PersistedOthelloSpace\n\nhotbar branches:\n  creative_hotbar_slots\n  survival_hotbar_slots\n  othello_hotbar_slots\n  route_hotbar_slots\n\nplayer persisted fields:\n  pos\n  vel\n  yaw_deg\n  pitch_deg\n  on_ground\n  flying\n  auto_jump_cooldown_s\n  crouch_eye_offset\n  health\n  max_health\n\nAI persisted fields:\n  actor_id\n  mode\n  personality\n  can_place_blocks\n  held_item_id\n  name\n  health_indicator\n  auto_regen_enabled\n  regen_start_delay_s\n  regen_interval_s\n  regen_amount_hp\n  regen_cap_hp\n  pos\n  vel\n  yaw_deg\n  pitch_deg\n  health\n  max_health\n  on_ground\n  flying\n  route_points\n  route_closed\n  route_run\n  route_style\n  route_target_index"
      ),
    ),
  ),
  AboutSection(
    title="JSON stores, migration, and integrity manifest",
    blocks=(
      paragraph(
        code_run("JsonFileStore"),
        text_run(
          " provides the low-level JSON persistence operation. It reads UTF-8 text, parses JSON, accepts only mapping objects for application state files, writes compact JSON with sorted keys and "
        ),
        code_run("ensure_ascii=False"),
        text_run(
          ", flushes and fsyncs a temporary file, and atomically replaces the target path. This store-level discipline matters because player state and world state are user-writable desktop files; partial writes, non-dictionary payloads, encoding drift, and malformed JSON must fail predictably without corrupting later startup."
        ),
      ),
      paragraph(
        code_run("AppStateStore"),
        text_run(" connects the JSON store to the schema envelopes. It resolves the app-managed data root, constructs "),
        code_run("state/player_state.json"),
        text_run(" and "),
        code_run("state/world_state.json"),
        text_run(", verifies runtime files when manifest entries exist, falls back to previous-format "),
        code_run("configs/player_state.json"),
        text_run(" and "),
        code_run("configs/world_state.json"),
        text_run(" only when runtime files are absent, converts raw dictionaries into "),
        code_run("PlayerStateFile"),
        text_run(" and "),
        code_run("WorldStateFile"),
        text_run(", and reassembles an "),
        code_run("AppState"),
        text_run(". Saving performs the reverse operation and updates the integrity manifest for player and world state files."),
      ),
      paragraph(
        text_run("The integrity manifest protects selected runtime files. "),
        code_run("PROTECTED_RUNTIME_RELATIVE_PATHS"),
        text_run(" contains "),
        code_run("state/player_state.json"),
        text_run(", "),
        code_run("state/world_state.json"),
        text_run(", "),
        code_run("state/player_skin.png"),
        text_run(", and "),
        code_run("state/othello_opening_book.json"),
        text_run(". "),
        code_run("_load_or_create_integrity_key()"),
        text_run(" creates "),
        code_run("state/integrity_key.bin"),
        text_run(" with "),
        code_run("secrets.token_bytes(32)"),
        text_run(" when no valid key exists and attempts chmod "),
        code_run("0o600"),
        text_run(". "),
        code_run("_file_hmac()"),
        text_run(" computes HMAC-SHA256 over the normalized relative path, a NUL byte, and file bytes streamed in "),
        code_run("1024 * 1024"),
        text_run(" byte chunks. The resulting manifest stores version "),
        code_run("1"),
        text_run(", algorithm "),
        code_run("hmac-sha256"),
        text_run(", and a mapping of file paths to digest entries."),
      ),
      paragraph(
        text_run(
          "Verification is intentionally conditional. If the file does not exist, verification succeeds; if the manifest does not exist or has no file map, verification succeeds; if the key is missing while a manifest entry exists, verification fails; if a manifest entry is absent for the particular file, verification succeeds; if an entry is present, the stored digest and recomputed digest must compare through "
        ),
        code_run("hmac.compare_digest"),
        text_run(
          ". This policy detects simple replacement and accidental corruption while preserving migration compatibility and avoiding hard failure on first launch before a manifest has been created."
        ),
      ),
      paragraph(
        text_run("Othello opening-book storage uses the same application-persistence boundary. "),
        code_run("stores/othello_book.py"),
        text_run(" normalizes the book root to the app-managed data root, maps the user book to "),
        code_run("state/othello_opening_book.json"),
        text_run(", maps compiled cache to "),
        code_run("cache/othello_opening_book_cache.json"),
        text_run(", verifies user-book integrity before loading, writes user-book payloads through JSON, updates the integrity manifest after saving user lines, and registers storage hooks through "),
        code_run("configure_opening_book_storage()"),
        text_run(". Simulation book logic therefore remains independent of OS-specific runtime-path selection."),
      ),
      paragraph(
        text_run("The previous-format "),
        code_run("configs/"),
        text_run(
          " migration path is not an instruction to keep writing repository-level mutable configuration. It is a compatibility input path. v3.6 writes into the app-managed state root, protects the principal runtime files with the manifest, and keeps cache data separate from durable state. That distinction is essential for desktop packaging because a PyInstaller bundle, a source checkout, a user profile data directory, and a compiled opening-book cache have different mutability and distribution semantics."
        ),
      ),
      code_block(
        "JSON store:\n  JsonFileStore.read()\n  JsonFileStore.write(obj)\n  UTF-8 text\n  dictionary payload only\n  compact sorted JSON\n  temporary file write\n  os.fsync()\n  os.replace()\n\napplication store:\n  AppStateStore.load()\n  AppStateStore.save(state)\n  _read_runtime_or_previous(name)\n  runtime state path: state/player_state.json, state/world_state.json\n  previous-format path: configs/player_state.json, configs/world_state.json\n\nintegrity manifest:\n  algorithm: hmac-sha256\n  manifest version: 1\n  key file: state/integrity_key.bin\n  created key length: 32 bytes\n  digest chunk size: 1024 * 1024 bytes\n  path separator in digest input: NUL byte\n\nprotected runtime paths:\n  state/player_state.json\n  state/world_state.json\n  state/player_skin.png\n  state/othello_opening_book.json\n\nOthello storage hooks:\n  install_othello_book_storage_hooks()\n  configure_opening_book_storage()\n  user book: state/othello_opening_book.json\n  compiled cache: cache/othello_opening_book_cache.json"
      ),
    ),
  ),
  AboutSection(
    title="Runtime preferences, settings normalization, and keybinds",
    blocks=(
      paragraph(
        code_run("RuntimePreferences"),
        text_run(
          " is the mutable preference vector shared by settings UI, session logic, persistence conversion, renderer runtime state, HUD behavior, and input routing. It contains current play-space id, inversion flags, selection outline, cloud wireframe, cloud enablement, cloud density, cloud seed, cloud-flow direction, world wireframe, shadow enablement, creative mode, four hotbar branches, route-edit state, Othello settings, reach, repeated-action intervals, break-particle controls, auto-jump, auto-sprint, HUD and hand hiding, player name, resolved player name, crosshair mode, crosshair pixels, skin kind, camera perspective, fullscreen flag, view bobbing, camera shake, arm animation limits, animated texture flag, render distance, sun orientation, debug flags, window geometry, keybinds, and audio preferences."
        ),
      ),
      paragraph(
        text_run("Normalization is code-level and bounded. Play-space ids are normalized through "),
        code_run("normalize_play_space_id"),
        text_run("; cloud-flow direction is normalized through "),
        code_run("normalize_backend_cloud_flow_direction"),
        text_run("; crosshair mode and pixels are normalized through "),
        code_run("normalize_crosshair_mode"),
        text_run(" and "),
        code_run("normalize_crosshair_pixels"),
        text_run("; camera perspective is normalized through "),
        code_run("normalize_camera_perspective"),
        text_run("; player-skin kind is normalized through "),
        code_run("normalize_player_skin_kind"),
        text_run(
          "; player names are normalized to a trimmed maximum length; hotbar slots and indices are normalized through domain hotbar helpers; Othello settings, keybinds, and audio each expose their own normalization path."
        ),
      ),
      paragraph(
        text_run("Default timing values are explicit. Block breaking repeats every "),
        code_run("0.30"),
        text_run(" seconds by default and clamps to "),
        code_run("0.0..1.0"),
        text_run(". Block placing has an initial delay of "),
        code_run("0.20"),
        text_run(" seconds and repeats at "),
        code_run("1.0 / 120.0"),
        text_run(" seconds by default, while legacy persisted "),
        code_run("0.20"),
        text_run(" place intervals are normalized to the current high-frequency value. Block interaction repeats every "),
        code_run("0.20"),
        text_run(" seconds and clamps to "),
        code_run("0.0..1.0"),
        text_run(". Break-particle spawn rate defaults to "),
        code_run("1.0"),
        text_run(" and clamps to "),
        code_run("0.0..2.0"),
        text_run("; break-particle speed scale defaults to "),
        code_run("1.0"),
        text_run(" and clamps to "),
        code_run("0.1..3.0"),
        text_run("."),
      ),
      paragraph(
        text_run("Camera and visual preference bounds are equally explicit. Render distance defaults to "),
        code_run("6"),
        text_run(" chunks and clamps to "),
        code_run("2..50"),
        text_run(". Cloud density clamps to "),
        code_run("0..4"),
        text_run("; cloud seed clamps to "),
        code_run("0..9999"),
        text_run("; view bobbing strength and camera shake strength clamp to "),
        code_run("0.0..1.0"),
        text_run("; arm rotation limits are allowed from "),
        code_run("-180.0"),
        text_run(" to "),
        code_run("180.0"),
        text_run(" degrees; arm swing duration defaults to "),
        code_run("6.0 / 20.0"),
        text_run(" seconds and clamps to "),
        code_run("0.05..1.50"),
        text_run("; sun azimuth is normalized modulo "),
        code_run("360.0"),
        text_run("; sun elevation clamps to "),
        code_run("0.0..90.0"),
        text_run(". Window width and height are clamped to minimum "),
        code_run("320 x 240"),
        text_run("."),
      ),
      paragraph(
        text_run("Keybind settings provide a portable action map rather than relying on platform-native text alone. Default movement binds forward, backward, left, and right to "),
        code_run("W"),
        text_run(", "),
        code_run("S"),
        text_run(", "),
        code_run("A"),
        text_run(", and "),
        code_run("D"),
        text_run("; jump to "),
        code_run("Space"),
        text_run("; crouch to "),
        code_run("Shift"),
        text_run("; sprint to "),
        code_run("Control"),
        text_run("; inventory to "),
        code_run("E"),
        text_run("; creative mode to "),
        code_run("B"),
        text_run("; camera perspective cycle to "),
        code_run("F5"),
        text_run("; gameplay HUD visibility to "),
        code_run("F1"),
        text_run("; debug HUD to "),
        code_run("F3"),
        text_run("; debug shadow to "),
        code_run("F4"),
        text_run("; clear selected slot to "),
        code_run("Q"),
        text_run("; and hotbar slots to "),
        code_run("1..9"),
        text_run(". Bindings reject modifier combinations and normalize through Qt portable key sequences."),
      ),
      paragraph(
        text_run("Audio preferences form a four-component gain vector: master, ambient, block, and player. Each component is projected into "),
        code_run("[0.0, 1.0]"),
        text_run(". "),
        code_run("volume_for(category)"),
        text_run(" returns master gain for the master channel and "),
        code_run("master * category_gain"),
        text_run(
          " for ambient, block, and player channels. This lets the application keep a global volume scalar while preserving independent category adjustments. Audio preference state is persisted in "
        ),
        code_run("PersistedSettings"),
        text_run(", restored into runtime preferences, and consumed by presentation audio playback."),
      ),
      code_block(
        "RuntimePreferences selected defaults:\n  reach: 5.0\n  render_distance_chunks: 6\n  cloud_density: 1\n  cloud_seed: 1337\n  creative_mode: False\n  shadow_enabled: True\n  hud_visible: False\n  window_width: 1280\n  window_height: 720\n\ninteraction timing:\n  block_break_repeat_interval_s: 0.30\n  block_place_repeat_initial_delay_s: 0.20\n  block_place_repeat_interval_s: 1.0 / 120.0\n  legacy place repeat interval: 0.20\n  block_interact_repeat_interval_s: 0.20\n\nparticle controls:\n  spawn rate default: 1.0\n  spawn rate clamp: 0.0..2.0\n  speed scale default: 1.0\n  speed scale clamp: 0.1..3.0\n\nvisual clamps:\n  render distance: 2..50\n  cloud density: 0..4\n  cloud seed: 0..9999\n  arm rotation: -180.0..180.0\n  arm swing duration: 0.05..1.50\n  sun elevation: 0.0..90.0\n  minimum window: 320 x 240\n\nkey defaults:\n  W/S/A/D movement\n  Space jump\n  Shift crouch\n  Control sprint\n  E inventory\n  B creative mode\n  F1 gameplay HUD\n  F3 debug HUD\n  F4 debug shadow\n  F5 camera perspective\n  Q clear selected slot\n  1..9 hotbar slots\n\naudio categories:\n  master\n  ambient\n  block\n  player\n  gain clamp: 0.0..1.0"
      ),
    ),
  ),
  AboutSection(
    title="My World session, world state, and generation fixture",
    blocks=(
      paragraph(
        text_run("My World is created through "),
        code_run("create_my_world_session(seed=0, block_registry=registry)"),
        text_run(". The factory wraps "),
        code_run("MyWorldSessionSeed"),
        text_run(", builds a "),
        code_run("SessionManager"),
        text_run(", constructs a "),
        code_run("PlayerEntity"),
        text_run(", supplies "),
        code_run("SessionSettings"),
        text_run(", creates a world through "),
        code_run("make_my_world_state(seed)"),
        text_run(", and uses the shared default block registry. The default spawn is "),
        code_run("(0.0, 1.0, -10.0)"),
        text_run(", yaw is "),
        code_run("0.0"),
        text_run(", and pitch is "),
        code_run("0.0"),
        text_run(". These defaults are not UI labels; they are the initial persisted-session state when no saved state overrides them."),
      ),
      paragraph(
        text_run("Current My World generation delegates to "),
        code_run("generate_test_map(seed)"),
        text_run(", which delegates to "),
        code_run("generate_flat_world()"),
        text_run(". The default flat generator uses "),
        code_run("half_extent=32"),
        text_run(", "),
        code_run("ground_y=0"),
        text_run(", and "),
        code_run("block_id=minecraft:grass_block"),
        text_run(". It iterates from "),
        code_run("-32"),
        text_run(" through "),
        code_run("32"),
        text_run(" on both horizontal axes, yielding a side length of "),
        code_run("65"),
        text_run(" and a base ground area of "),
        code_run("4225"),
        text_run(
          " block cells before any user edit, gravity transition, AI placement, structural update, or persistence restore. The world revision starts from a generated baseline rather than from an untracked renderer mesh."
        ),
      ),
      paragraph(
        text_run("The authoritative world model is "),
        code_run("WorldState"),
        text_run(", a mutable mapping from integer "),
        code_run("(x, y, z)"),
        text_run(" cells to block-state strings, augmented by revision and index structures. It exposes "),
        code_run("set_block()"),
        text_run(", "),
        code_run("remove_block()"),
        text_run(", "),
        code_run("set_blocks_bulk()"),
        text_run(", "),
        code_run("replace_all()"),
        text_run(", "),
        code_run("get_block()"),
        text_run(", "),
        code_run("snapshot_blocks()"),
        text_run(", "),
        code_run("snapshot_for_chunk_build()"),
        text_run(", "),
        code_run("snapshot_block_window()"),
        text_run(", "),
        code_run("snapshot_column()"),
        text_run(", "),
        code_run("chunk_blocks()"),
        text_run(", "),
        code_run("chunk_revision()"),
        text_run(", "),
        code_run("to_persisted_dict()"),
        text_run(", and "),
        code_run("from_persisted_dict()"),
        text_run(". A renderer can request snapshots, but the renderer does not own block truth."),
      ),
      paragraph(
        text_run("The persisted world branch is "),
        code_run("PersistedWorld"),
        text_run(", which stores a world revision and a dictionary mapping integer coordinate triples to state strings. Serialization is delegated through "),
        code_run("WorldState.to_persisted_dict()"),
        text_run(" and "),
        code_run("WorldState.from_persisted_dict()"),
        text_run(", so persisted coordinates, state strings, and revision values remain consistent with the runtime world model. "),
        code_run("PersistedPlaySpace"),
        text_run(" wraps this world state with player state and AI actor state for My World. "),
        code_run("PersistedOthelloSpace"),
        text_run(" applies the same structure to the Othello world branch and adds Othello match state."),
      ),
      paragraph(
        text_run(
          "My World is also the space where ordinary block interaction is enabled. Placement, breaking, creative inventory, route editing, AI special-item spawning, falling-block behavior, collision, player damage, camera motion, selection outline, HUD payload, chunk upload, and renderer frame metrics all refer back to the active "
        ),
        code_run("SessionManager"),
        text_run(
          ". This makes My World a full application mode rather than a passive terrain viewer. Its state must survive save/load, space switching, renderer backend choice, and settings changes."
        ),
      ),
      paragraph(
        text_run(
          "The flat fixture should therefore be described carefully. It is a current generation fixture, not an architectural limit that prevents later generation work. The persistence model already supports arbitrary block mappings and revision tracking, while chunk snapshots and renderer uploads operate over the current world mapping. A future generator can populate "
        ),
        code_run("WorldState"),
        text_run(" differently, but the current v3.6 overview must describe the actual flat fixture, its numerical extent, its default block id, and its relation to persistent user edits."),
      ),
      code_block(
        "My World creation path:\n  create_my_world_session(seed=0, block_registry=registry)\n  MyWorldSessionSeed\n  make_my_world_state(seed)\n  generate_test_map(seed)\n  generate_flat_world()\n\nMy World defaults:\n  seed: 0\n  spawn: (0.0, 1.0, -10.0)\n  yaw_deg: 0.0\n  pitch_deg: 0.0\n\nflat generation values:\n  half_extent: 32\n  ground_y: 0\n  block_id: minecraft:grass_block\n  x range: -32..32\n  z range: -32..32\n  side length: 65\n  base ground cells: 4225\n\nWorldState operations:\n  set_block()\n  remove_block()\n  set_blocks_bulk()\n  replace_all()\n  get_block()\n  snapshot_blocks()\n  snapshot_for_chunk_build()\n  snapshot_block_window()\n  snapshot_column()\n  chunk_blocks()\n  chunk_revision()\n  to_persisted_dict()\n  from_persisted_dict()"
      ),
    ),
  ),
  AboutSection(
    title="Chunk coordinates, mesh residency, and world upload",
    blocks=(
      paragraph(
        text_run("Chunk identity is defined in foundations rather than in a renderer backend. "),
        code_run("CHUNK_SIZE = 16"),
        text_run("; "),
        code_run("chunk_key(x, y, z)"),
        text_run(" maps block coordinates to a "),
        code_run("ChunkKey"),
        text_run("; "),
        code_run("chunk_origin(chunk_key_value)"),
        text_run(" reconstructs the world-space chunk origin; "),
        code_run("local_coords(x, y, z)"),
        text_run(" computes local coordinates; "),
        code_run("chunk_bounds(k)"),
        text_run(" returns coordinate bounds; and "),
        code_run("neighbor_chunk_keys_for_cell(x, y, z)"),
        text_run(
          " determines adjacent chunks affected when an edit occurs on a boundary. This common chunk vocabulary is used by world indexing, structural updates, selection refresh, mesh build snapshots, upload tracking, and renderer eviction."
        ),
      ),
      paragraph(
        text_run("World upload is handled by "),
        code_run("WorldUploadTracker"),
        text_run(", which mediates between authoritative "),
        code_run("WorldState"),
        text_run(
          " and backend-resident render chunks. It tracks submitted revisions, schedules chunk build work, holds pending futures, drains ready results, caches build output, evicts chunks no longer inside the keep set, and exposes whether the initially needed chunk set is resident. This makes loading completion observable through renderer residency instead of through a fixed delay or the mere existence of a window."
        ),
      ),
      paragraph(
        text_run("The visible chunk set is a function of eye position and render distance. The runtime default render distance is "),
        code_run("6"),
        text_run(" chunks and is clamped to "),
        code_run("2..50"),
        text_run(
          ", so a normal frame considers horizontal chunk neighborhoods around the player while preserving bounded resource demand. The upload path can scan surrounding chunks, prioritize by distance, and retain CPU-side build results across play-space switches so that returning to a previously visited space does not necessarily require rebuilding every mesh from scratch."
        ),
      ),
      paragraph(
        text_run("Chunk submission uses the renderer contract. Backends receive "),
        code_run("submit_chunk(chunk_key=..., world_revision=..., faces=..., shadow_faces=..., gpu_face_sources=..., gpu_bucket_counts=...)"),
        text_run(
          ". This call separates world mutation, CPU face construction, backend-specific buffer upload, shadow-face availability, and draw-resident chunk revision. If a block changes, the affected chunk and neighboring boundary chunks can be marked dirty while unchanged chunks remain resident. This is a fundamental performance and correctness boundary for a persistent voxel application."
        ),
      ),
      paragraph(
        text_run("Selection also depends on chunk state. "),
        code_run("set_selection_target()"),
        text_run(
          " receives a block coordinate, state string, state access function, and world revision. That means the outline, pick AABBs, and render boxes for partial block families can be refreshed against the actual world revision rather than a stale renderer-side copy. Selection clearing is an explicit renderer API operation so modal states, space switching, player death, and unsupported target states can remove selection without mutating the world."
        ),
      ),
      code_block(
        "chunk functions:\n  CHUNK_SIZE = 16\n  chunk_key(x, y, z)\n  chunk_origin(chunk_key_value)\n  local_coords(x, y, z)\n  chunk_bounds(k)\n  neighbor_chunk_keys_for_cell(x, y, z)\n\nrender distance:\n  default: 6 chunks\n  clamp minimum: 2 chunks\n  clamp maximum: 50 chunks\n\nupload tracker responsibilities:\n  visible chunk selection\n  asynchronous build scheduling\n  pending build tracking\n  ready result draining\n  resident revision tracking\n  build-result cache\n  chunk eviction\n  initial residency reporting\n\nrenderer upload API:\n  submit_chunk(chunk_key, world_revision, faces, shadow_faces, gpu_face_sources, gpu_bucket_counts)\n  evict_chunks(keep_chunks)\n  clear_selection()\n  set_selection_target(x, y, z, state_str, get_state, world_revision)"
      ),
    ),
  ),
  AboutSection(
    title="Movement, collision, and player damage",
    blocks=(
      paragraph(
        text_run("Player motion is domain logic rather than Qt input code. The movement system is parameterized through "),
        code_run("MovementParams"),
        text_run(", "),
        code_run("CollisionParams"),
        text_run(", and "),
        code_run("SessionSettings"),
        text_run(". Default movement values include "),
        code_run("tick_hz = 20.0"),
        text_run(", walk speed "),
        code_run("4.317"),
        text_run(", sprint speed "),
        code_run("5.612"),
        text_run(", crouch multiplier "),
        code_run("0.3"),
        text_run(", gravity "),
        code_run("32.0"),
        text_run(", maximum fall speed "),
        code_run("78.4"),
        text_run(", jump velocity "),
        code_run("8.4"),
        text_run(", ground acceleration "),
        code_run("30.0"),
        text_run(", air acceleration "),
        code_run("6.0"),
        text_run(", sprint-jump boost "),
        code_run("5.0"),
        text_run(", auto-jump probe "),
        code_run("0.35"),
        text_run(", auto-jump success delta "),
        code_run("0.90"),
        text_run(", auto-jump cooldown "),
        code_run("0.12"),
        text_run(", fly speed "),
        code_run("10.92"),
        text_run(", fly ascend speed "),
        code_run("10.92"),
        text_run(", and fly descend speed "),
        code_run("10.92"),
        text_run(". These numbers are restored through settings and runtime preferences rather than duplicated in widgets."),
      ),
      paragraph(
        text_run("Collision defaults are similarly explicit. Epsilon is "),
        code_run("1e-4"),
        text_run(", ground probe is "),
        code_run("0.03"),
        text_run(", step height is "),
        code_run("0.5625"),
        text_run(", nearby XZ padding is "),
        code_run("1"),
        text_run(", downward Y padding is "),
        code_run("2"),
        text_run(", upward Y padding is "),
        code_run("1"),
        text_run(", and sneak step is "),
        code_run("0.05"),
        text_run(
          ". Collision uses AABBs derived from block states and family-specific geometry. A slab, stair, fence, fence gate, or wall can therefore block or support the player differently from a full cube. Depenetration is required because restored state, block placement, gate closure, and falling-block settlement can create temporary overlap that must be resolved according to the same domain rules."
        ),
      ),
      paragraph(
        text_run("Player persistence stores movement-relevant state. "),
        code_run("PersistedPlayer"),
        text_run(" records position, velocity, yaw, pitch, "),
        code_run("on_ground"),
        text_run(", "),
        code_run("flying"),
        text_run(
          ", auto-jump cooldown, crouch-eye offset, health, and maximum health. During restore, the runtime player receives those values, pitch is clamped, flying is retained only when creative mode permits it, transient cooldowns are reset where appropriate, and overlap exemptions are reconstructed for closed fence gates and gravity blocks. This lets saved state restore into a legal simulation state instead of a purely serialized coordinate dump."
        ),
      ),
      paragraph(
        text_run("Damage is also part of the domain model. The normal health pool is "),
        code_run("20.0"),
        text_run(". Melee attack damage is "),
        code_run("1.0"),
        text_run("; melee cooldown is "),
        code_run("0.5"),
        text_run(" seconds; hurt flash and tilt timings are represented separately; void damage begins below "),
        code_run("y = -64.0"),
        text_run(", repeats every "),
        code_run("0.5"),
        text_run(" seconds, and applies "),
        code_run("4.0"),
        text_run(" damage per tick. Local player-to-AI targeting uses a melee reach of "),
        code_run("3.0"),
        text_run(" blocks. Death and respawn must interact with camera, HUD, pause state, renderer tint, and persistence without redefining health inside presentation code."),
      ),
      paragraph(
        text_run("The fixed-step runner coordinates simulation advancement. The desktop game loop has a "),
        code_run("sim_hz"),
        text_run(" of "),
        code_run("120.0"),
        text_run(", while movement constants also retain a Minecraft-like reference tick of "),
        code_run("20.0"),
        text_run(
          ". This distinction lets repeated placement and input sampling operate at desktop-loop cadence while preserving domain constants used by movement, gravity, and animation. The result is a layered time model: Qt event delivery, fixed-step session advancement, renderer frame submission, particle age, falling-block tick, and Othello clocks can each remain explicit."
        ),
      ),
      code_block(
        "movement defaults:\n  tick_hz: 20.0\n  walk_speed: 4.317\n  sprint_speed: 5.612\n  crouch_mult: 0.3\n  gravity: 32.0\n  fall_speed_max: 78.4\n  jump_v0: 8.4\n  accel_ground: 30.0\n  accel_air: 6.0\n  sprint_jump_boost: 5.0\n  auto_jump_probe: 0.35\n  auto_jump_success_dy: 0.90\n  auto_jump_cooldown_s: 0.12\n  fly_speed: 10.92\n  fly_ascend_speed: 10.92\n  fly_descend_speed: 10.92\n\ncollision defaults:\n  eps: 0.0001\n  ground_probe: 0.03\n  step_height: 0.5625\n  nearby_xz_pad: 1\n  nearby_y_down_pad: 2\n  nearby_y_up_pad: 1\n  sneak_step: 0.05\n\nplayer damage:\n  max_health default: 20.0\n  melee damage: 1.0\n  melee cooldown: 0.5\n  void damage start y: -64.0\n  void damage interval: 0.5\n  void damage amount: 4.0\n  local melee reach: 3.0\n\nloop reference:\n  GameLoopParams.sim_hz: 120.0"
      ),
    ),
  ),
  AboutSection(
    title="Block registry, block definitions, and texture declarations",
    blocks=(
      paragraph(
        text_run("The block system begins with "),
        code_run("BlockDefinition"),
        text_run(", "),
        code_run("BlockTextures"),
        text_run(", and "),
        code_run("BlockRegistry"),
        text_run(
          ". A block definition records its identifier, display name, texture assignment, kind, family, full-cube flag, solid flag, tags, and sound group. The registry maps identifiers to definitions and is constructed by default catalog and family modules. This explicit definition model avoids treating a block as only an image name, because the same block identifier must participate in placement, interaction, inventory display, collision, picking, renderer texture atlas lookup, audio material selection, and persistence."
        ),
      ),
      paragraph(
        text_run("Block textures are structured through "),
        code_run("BlockTextures"),
        text_run(
          " rather than a single side label. Different faces can use different textures, and renderer atlas lookup must be able to resolve the UV rectangle for a specific face and block state. Ordinary cubes, logs, planks, stones, ores, dirt variants, sand, gravel, slabs, stairs, fences, fence gates, and walls can therefore share texture names while retaining different geometry and interaction behavior. The texture model is part of the domain-to-renderer contract because a state string must be convertible into consistent face rows and shadow rows."
        ),
      ),
      paragraph(
        "The default registry is assembled from catalog and family modules such as common blocks, planks, stones, variant recipes, ore families, sandstone families, special dirt families, special stone families, stone families, wood families, slab variants, stair variants, fence variants, fence-gate variants, and wall variants. The families are meaningful because they determine more than display grouping: family selection routes geometry generation, structural connectivity, top support, neighbor updates, collision shape, pick shape, placement orientation, and sometimes gravity interaction."
      ),
      paragraph(
        text_run(
          "Sound groups are represented independently of texture groups. A block can visually use a wood-like texture while still needing a material category for audio playback, break sound, place sound, or step sound. Ludoxel’s audio category preferences are application-level, but block material sound groups are simulation and presentation-facing data. This separation permits audio playback to be volume-controlled by "
        ),
        code_run("AudioPreferences"),
        text_run(" while material selection remains anchored to block definitions."),
      ),
      paragraph(
        "The registry also cooperates with special items. Special items such as AI spawn eggs and Othello control items are not ordinary placeable block ids. Runtime preference helpers distinguish current item id, current block id, and current special item id. This distinction prevents the interaction path from attempting to place an AI spawn egg as a block, or from treating Othello start/settings controls as ordinary voxel materials. The hotbar therefore stores item identifiers, while placement logic projects them into either block ids or special-item behavior."
      ),
      code_block(
        "block data structures:\n  BlockDefinition\n  BlockTextures\n  BlockRegistry\n\nblock definition fields:\n  block_id\n  display_name\n  textures\n  kind\n  family\n  is_full_cube\n  is_solid\n  tags\n  sound_group\n\ncatalog and family modules:\n  blocks/catalogs/common.py\n  blocks/catalogs/planks.py\n  blocks/catalogs/stones.py\n  blocks/catalogs/variant_recipes.py\n  blocks/families/decorative_stone.py\n  blocks/families/ore.py\n  blocks/families/sandstone.py\n  blocks/families/special_dirt.py\n  blocks/families/special_stone.py\n  blocks/families/stone.py\n  blocks/families/wood.py\n\nspecial item distinction:\n  RuntimePreferences.current_item_id()\n  RuntimePreferences.current_block_id()\n  RuntimePreferences.current_special_item_id()\n  is_special_item_id(item_id)"
      ),
    ),
  ),
  AboutSection(
    title="Block-state codec and state-parametric voxel geometry",
    blocks=(
      paragraph(
        "Block-state geometry is state-parametric. In Ludoxel, that term means that render boxes, collision boxes, pick boxes, structural updates, and support checks are functions of the base block id, encoded properties, neighboring block states, and requested purpose. A wall may render a side arm, collide with a post, support a top connection, and update neighbors differently depending on adjacent states. A fence gate can be closed, open, powered, in-wall, or waterlogged. A stair can alter geometry based on facing, half, and neighbor shape. These are not cosmetic differences; they change physical and renderer-facing behavior."
      ),
      paragraph(
        text_run("The codec layer provides "),
        code_run("parse_state()"),
        text_run(", "),
        code_run("format_state()"),
        text_run(
          ", property values, and property access helpers. State strings must be stable enough for persistence, world mutation, placement logic, renderer snapshots, and neighbor updates. If a state string survives save/load but the renderer, collision system, and placement system interpret it differently, the application is incorrect. The state codec therefore belongs to simulation, while renderer-facing face construction consumes the resulting state through defined APIs rather than inventing parallel encodings."
        ),
      ),
      paragraph(
        "Slabs represent partial vertical occupancy. Depending on slab state, geometry can occupy lower half, upper half, or full-block space. This affects collision, picking, placement merge behavior, top support, and face generation. Stairs combine orientation and half-state with neighbor shape. Inner and outer stair forms require evaluating adjacent stairs rather than only reading the clicked block. This gives stair blocks a local-topological dependence that full cubes do not have."
      ),
      paragraph(
        "Fences, fence gates, and walls define connectivity through neighboring block states. Fences create posts and arms; walls create side heights and an optional top post; fence gates can be open or closed and can change shape when embedded in wall-like context. A block above a wall can force a top connection depending on support semantics. These features require structural neighbor updates after placement, breaking, gate toggles, falling-block settlement, and bulk world replacement. Without neighbor updates, the visible shape and collision state would lag behind the world map."
      ),
      paragraph(
        text_run("The geometry APIs separate render, collision, and pick purposes. "),
        code_run("collision_aabbs_for_block()"),
        text_run(
          " returns world-space AABBs used by player movement, depenetration, gravity settlement, and camera collision. Pick boxes and pick AABBs can be more selection-oriented. Render boxes feed visible-face construction and texture atlas mapping. This separation is necessary because a visually thin member, selectable outline, and physical collision volume can be related without being identical in every case."
        ),
      ),
      paragraph(
        "State-parametric geometry also controls falling-block support. A falling block landing on a lower slab, wall, fence, gate, or stair must consult implemented support rules rather than only checking whether the target cell is non-air. That makes gravity behavior consistent with the same world geometry used for the player and renderer. It also prevents the application from treating partial blocks as full support in one subsystem and non-support in another."
      ),
      code_block(
        "state codec:\n  parse_state(state_str)\n  format_state(base_id, props)\n  prop_as_bool(props, name, default)\n\ngeometry APIs:\n  collision_aabbs_for_block(state_str, get_state, get_definition, x, y, z)\n  pick_aabbs_for_block(state_str, get_state, get_definition, x, y, z)\n  render_boxes_for_block(state_str, get_state, get_definition, x, y, z)\n  has_full_top_support_for_block(state_str, get_state, get_definition, x, y, z)\n\nmodel families:\n  slabs\n  stairs\n  fences\n  fence gates\n  walls\n\nstructural concepts:\n  cardinal direction\n  neighbor connectivity\n  top support\n  wall side height\n  fence arm\n  fence gate open state\n  stair half\n  stair facing\n  stair shape"
      ),
    ),
  ),
  AboutSection(
    title="Interaction service, placement policy, and held placement",
    blocks=(
      paragraph(
        text_run("Block interaction is routed through "),
        code_run("InteractionService"),
        text_run(
          " and session manager methods rather than through direct viewport mutation. The interaction path handles picking, breaking, placing, fence-gate toggling, held placement, player-overlap rejection, structural neighbor updates, gravity conversion, break-particle emission, and world-revision updates. The viewport supplies input and targeting conditions; the simulation layer determines whether a requested action is legal and what world edits result."
        ),
      ),
      paragraph(
        text_run("Breaking and placing have independent repeat semantics. Breaking defaults to a "),
        code_run("0.30"),
        text_run(" second repeat interval. Placement has a "),
        code_run("0.20"),
        text_run(" second initial dwell before held repetition and then repeats at "),
        code_run("1.0 / 120.0"),
        text_run(" seconds. Interaction for toggles such as fence gates defaults to "),
        code_run("0.20"),
        text_run(
          " seconds. These timing values are persisted through runtime settings and influence how quickly the world can change under continuous input. They also determine how route-frontier state, collision correction, and renderer uploads react when the user holds a mouse button."
        ),
      ),
      paragraph(
        "Placement policy rejects player-overlapping target states. The implementation must evaluate the state that would be placed, not only whether the target cell is currently empty. This matters for slabs, stairs, walls, fences, and fence gates, because the collision volume depends on block-state properties and neighbors. It also matters for falling blocks: a gravity-affected block that cannot remain supported should not be treated as a stable static placement for subsequent held-placement continuation."
      ),
      paragraph(
        "Held placement has a route concept. It can begin from a hit side face, from a synthesized horizontal face for crouch bridging, or from a generic orientation when context requires it. The maintained frontier advances only when the attempted target cell actually receives a valid static block. If placement fails because the target overlaps the player, is unsupported, converts to a falling block, or is rejected by state resolution, the route frontier does not advance. This prevents held placement from skipping cells or building a misplaced vertical column after a failed bridge attempt."
      ),
      paragraph(
        "Fence-gate interaction is part of the same service path. A closed gate can open; an open gate can close; and player-overlap exemptions can preserve a player already inside a closing gate. The gate toggle cannot be a renderer-only visual change because collision, pick behavior, persistence, structural neighbor state, and movement response all depend on the gate state string. The application therefore treats gate toggles as world edits with renderer consequences rather than as local mesh toggles."
      ),
      paragraph(
        "Break particles are also emitted through interaction outcomes. Because particle sampling consults render boxes, partial blocks produce fragments from the actual implemented geometry instead of from an unconditional full cube. This keeps the visual feedback for slabs, stairs, fences, fence gates, and walls aligned with the state-parametric geometry model used by picking and collision."
      ),
      code_block(
        "interaction modules:\n  simulation/rules/interaction/breaking.py\n  simulation/rules/interaction/placing.py\n  simulation/rules/interaction/service.py\n  simulation/rules/interaction/toggles.py\n  simulation/rules/picking/block.py\n  simulation/rules/placement/policy.py\n  simulation/rules/placement/support.py\n\nsession-facing methods:\n  break_block_for_session()\n  place_block_for_session()\n  pick_block_for_session()\n  interact_block_at_hit_for_session()\n  attack_ai_player_for_session()\n\nrepeat timing:\n  break repeat interval: 0.30 s\n  place initial delay: 0.20 s\n  place repeat interval: 1.0 / 120.0 s\n  interact repeat interval: 0.20 s\n\nplacement invariants:\n  active hotbar item projection\n  block-state resolution\n  player-overlap rejection\n  structural neighbor update\n  falling-block conversion\n  route frontier advances only after valid static placement"
      ),
    ),
  ),
  AboutSection(
    title="Falling blocks, gravity samples, and break particles",
    blocks=(
      paragraph(
        text_run("Gravity is a simulation rule under "),
        code_run("simulation.rules.gravity.system"),
        text_run(". Blocks with "),
        code_run("GRAVITY_AFFECTED_TAG = gravity_affected"),
        text_run(" can convert from static world cells into falling-block samples when support fails. The falling tick is "),
        code_run("1.0 / 20.0"),
        text_run(" seconds; gravity per tick is "),
        code_run("0.04"),
        text_run("; drag is "),
        code_run("0.98"),
        text_run("; epsilon is "),
        code_run("1e-6"),
        text_run(". The system removes unsupported blocks from "),
        code_run("WorldState"),
        text_run(", advances transient falling samples, tests landing against collision and support conditions, and writes settled blocks back into the world when landing is valid."),
      ),
      paragraph(
        "The gravity-affected block family includes sand-like blocks such as sand, red sand, and gravel in the current implemented catalogue. Their behavior is distinct from ordinary blocks because placement, neighbor updates, and support changes can trigger conversion into a falling sample. This means a successful right-click is not always a static block placement in the final world map: if the placed gravity block is unsupported, it can immediately leave the static cell and become a falling entity. Held placement must observe that result before advancing its continuation state."
      ),
      paragraph(
        "Landing behavior uses existing geometry and support rules. A falling full block can land on valid implemented supports such as full top surfaces and certain partial-block support configurations. A lower slab case can destroy the falling block and emit break particles rather than producing an illegal static overlap. Landed gravity blocks also interact with player-overlap exemptions, because a falling block can settle onto the player’s volume under controlled conditions and must not immediately cause an inconsistent depenetration response."
      ),
      paragraph(
        text_run(
          "Falling-block rendering is a DTO problem. Simulation emits falling sample state, and presentation rendering turns it into face rows using the same atlas and block-state-to-render-box conventions as ordinary blocks. "
        ),
        code_run("FallingBlockRenderSampleDTO"),
        text_run(
          " carries enough state for the renderer to place and orient the moving block. This avoids giving the renderer authority to decide when a falling block lands or when it should be removed from world state."
        ),
      ),
      paragraph(
        "Break particles are sampled from block render boxes. The particle system must know the block state, face index, atlas UV information, age, lifetime, position, and velocity. It must not assume a full cube for every broken block because that would make a fence, slab, wall, or stair visually explode as though it occupied a full cube. Runtime preferences provide spawn-rate and speed-scale controls so the visual intensity can be configured without changing the actual block model."
      ),
      paragraph(
        "The combination of gravity and particles is important for Othello and My World alike. Othello board blocks and decorative control visuals are rendered in the same world renderer, while My World block edits and gravity transitions can produce transient samples and particles. The renderer contract must therefore accept falling-block samples and break-particle samples as normal frame inputs, not as backend-private side effects."
      ),
      code_block(
        "gravity constants:\n  GRAVITY_AFFECTED_TAG: gravity_affected\n  falling tick: 1.0 / 20.0 s\n  gravity per tick: 0.04\n  drag: 0.98\n  epsilon: 0.000001\n\nsample DTOs:\n  FallingBlockRenderSampleDTO\n  BlockBreakParticleRenderSampleDTO\n\nparticle controls:\n  block_break_particle_spawn_rate default: 1.0\n  block_break_particle_spawn_rate range: 0.0..2.0\n  block_break_particle_speed_scale default: 1.0\n  block_break_particle_speed_scale range: 0.1..3.0\n\nstate path:\n  static WorldState cell\n  unsupported gravity block\n  falling sample\n  landing test\n  settled world block or break-particle emission"
      ),
    ),
  ),
  AboutSection(
    title="Inventories, hotbars, and special items",
    blocks=(
      paragraph(
        text_run("The hotbar model is branch-aware. Domain hotbar size is "),
        code_run("9"),
        text_run(
          ", and persistence stores separate creative, survival, Othello, and route-edit branches. Each branch has its own slot tuple and selected index. This is required because the same numerical keys can select ordinary blocks in creative mode, survival items in ordinary play, Othello control items in the Othello space, and route-authoring tools during AI route editing. A single shared hotbar would erase mode-specific state when switching between these contexts."
        ),
      ),
      paragraph(
        text_run(
          "Runtime preferences determine the active hotbar branch. If the active play space is Othello, the Othello branch is selected. If route editing is active, the route branch is selected. If creative mode is active, the creative branch is selected. Otherwise, the survival branch is selected. This selection logic affects "
        ),
        code_run("current_item_id()"),
        text_run(", "),
        code_run("current_block_id()"),
        text_run(", and "),
        code_run("current_special_item_id()"),
        text_run(". Ordinary block placement uses the block-id projection; AI spawn eggs and Othello control items use special-item behavior."),
      ),
      paragraph(
        text_run("Special items are represented under "),
        code_run("simulation.inventories.special_items"),
        text_run(
          ". The core special-item registry includes AI spawn and route-editing items, while the Othello inventory defines Othello-specific control items. The presentation layer supplies visual artwork for special items through shared hotbar and held-item rendering helpers. Special items can appear in the hotbar, be rendered in first person and third person, affect interaction behavior, and persist through inventory branches without being valid placeable block ids."
        ),
      ),
      paragraph(
        text_run("Othello hotbar defaults are separate from My World hotbars. Slot "),
        code_run("0"),
        text_run(" contains the Othello start item and slot "),
        code_run("8"),
        text_run(
          " contains the Othello settings item. These positions match the user-facing convention that the left edge begins match control and the right edge opens settings. The Othello branch disables ordinary block placement and breaking but still uses the same selection, held-item, HUD, and renderer pathways as other hotbar branches."
        ),
      ),
      paragraph(
        "AI route-edit hotbar defaults are separate again. Route editing requires a confirmation item, eraser item, and cancel item, so the player can author, delete, commit, or abort route points without opening an unrelated modal widget for every point. This branch remains part of runtime preferences because a route-editing session can coexist with active AI actor settings, route overlay rendering, and world navigation state."
      ),
      code_block(
        "hotbar size:\n  HOTBAR_SIZE: 9\n\npersisted hotbar branches:\n  creative_hotbar_slots\n  creative_selected_hotbar_index\n  survival_hotbar_slots\n  survival_selected_hotbar_index\n  othello_hotbar_slots\n  othello_selected_hotbar_index\n  route_hotbar_slots\n  route_selected_hotbar_index\n\nruntime item projections:\n  current_item_id()\n  current_block_id()\n  current_special_item_id()\n\nOthello default controls:\n  slot 0: othello:start\n  slot 8: othello:settings\n\ncore special items:\n  ludoxel:ai_spawn_egg\n  ludoxel:ai_route_confirm\n  ludoxel:ai_route_erase\n  ludoxel:ai_route_cancel"
      ),
    ),
  ),
  AboutSection(
    title="AI-player state, spawn behavior, and persistence",
    blocks=(
      paragraph(
        text_run(
          "AI players are first-class runtime actors. They are not path lines, preview ghosts, or renderer-only meshes. The AI subsystem contains state, settings, spawning, serialization, manager coordination, idle behavior, wandering, route following, navigation, parkour, recovery, stuck detection, avoidance, combat, placement, route planning, background worker logic, and render-state extraction. The "
        ),
        code_run("AiPlayerState"),
        text_run(" object carries transform, velocity, behavior mode, personality, health, route information, and placement permission, and "),
        code_run("PersistedAiPlayer"),
        text_run(" stores the durable representation."),
      ),
      paragraph(
        text_run("Spawning is performed through the AI special item. The current item id can resolve to "),
        code_run("ludoxel:ai_spawn_egg"),
        text_run(", and the session manager can call "),
        code_run("spawn_ai_player_for_session(session, spawn_cell=..., settings=...)"),
        text_run(". A freshly spawned actor receives a default display name in the "),
        code_run("AI#0001"),
        text_run(
          " form: the lowest free four-digit suffix among live AI is allocated, and spawning fails if every suffix up to #9999 is taken. The resulting actor receives per-instance settings, an actor id, initial state, and a persisted identity. This route preserves the distinction between an inventory item, a click interaction, a spawn cell, actor settings, and the AI manager’s internal state."
        ),
      ),
      paragraph(
        text_run(
          "Every AI has a display name shown on its in-world nametag. The name body is validated as letters and digits only, must not start with a digit, and is limited to 1 to 16 characters; an optional "
        ),
        code_run("#0001"),
        text_run(" to "),
        code_run("#9999"),
        text_run(
          " suffix distinguishes AI that share the same body. Names of live AI must be unique; the comparison is case-insensitive so that visually identical tags cannot coexist, while the saved value keeps the entered casing. Dead or removed AI release their names. When a requested name collides with a live AI, the settings surface reports the conflict and suggests the lowest free suffixed variant; if all numbered variants of a body are taken, the rename is rejected with an explicit error."
        ),
      ),
      paragraph(
        text_run(
          "AI modes normalize to idle, route, and wander. User-facing labels can correspond to Standby, Route Patrol, and Free Roam / PVP. Personalities normalize to aggressive or peaceful. Route styles normalize to strict or flexible. Placement permission is per actor through "
        ),
        code_run("can_place_blocks"),
        text_run(", and held item defaults to a block id such as "),
        code_run("minecraft:oak_planks"),
        text_run(". Defaults include mode "),
        code_run("idle"),
        text_run(", personality "),
        code_run("aggressive"),
        text_run(", health "),
        code_run("20.0"),
        text_run(", maximum health "),
        code_run("20.0"),
        text_run(", route style "),
        code_run("strict"),
        text_run(", health indicator "),
        code_run("off"),
        text_run(", and auto regeneration disabled. These defaults matter because missing or malformed persisted state must restore to a valid actor rather than crashing the session."),
      ),
      paragraph(
        text_run("Each AI can draw a heart-row health indicator near its nametag. The position is selectable per actor as "),
        code_run("Off"),
        text_run(", "),
        code_run("Above nametag"),
        text_run(", or "),
        code_run("Below nametag"),
        text_run(
          ", with Off as the default. The hearts use the same pixel pattern and fill rules as the player's Survival health strip: one heart equals two health points, a half heart equals one health point, and 20 health points render as ten hearts in one row. The indicator is placed so that it does not overlap the nametag, follows the same screen clamping and occlusion dimming as the world nametag, and is drawn by Qt overlay widgets shared by the Windows OpenGL and macOS wgpu viewport paths."
        ),
      ),
      paragraph(
        text_run(
          "Auto regeneration is a per-actor setting and is disabled by default, which preserves the previous behavior of never healing. When enabled, the defaults are Minecraft-like: a start delay of "
        ),
        code_run("4.0"),
        text_run(" seconds after the most recent damage, one healing tick of "),
        code_run("1.0"),
        text_run(" health point every "),
        code_run("4.0"),
        text_run(
          " seconds, and a cap bounded by the actor's maximum health. Taking damage restarts the delay, healing never exceeds the configured cap, dead actors do not regenerate, and removed actors leave the regeneration path entirely. Regeneration advances inside the fixed-step simulation update of the AI manager, not in the render loop. The settings surface edits the delay, the cap, and the time required to heal the full cap; the per-tick interval is derived from that time."
        ),
      ),
      paragraph(
        text_run("AI persistence encodes route behavior. Route points are stored as "),
        code_run("AiRoutePoint"),
        text_run(" triples, together with the route closed flag, the "),
        code_run("route_run"),
        text_run(
          " sprint flag, route style, and target index. A closed route treats the connection from the final point back to the first as an authored patrol segment; an open route still returns toward the first point after the final one, without that closing segment. The run flag controls sprinting along segments, not route advancement. Persisting the target index means an actor can resume route progression rather than restarting from the first authored point every time the application loads. The route branch of the hotbar and route overlay are presentation tools layered over this domain state."
        ),
      ),
      paragraph(
        "AI actors also participate in combat. The local player can pick an AI actor through a ray, apply local melee attack logic, use sprint state from player combat helpers, and receive attack results from the AI manager. Aggressive AI can pursue and attack the local player; peaceful AI avoids combat behavior. Combat must consult health, hit cooldowns, reach, line-of-sight obstruction, movement state, and world collision so that it remains part of the simulation rather than a renderer animation."
      ),
      paragraph(
        "AI render snapshots are derived from state but do not own state. The simulation manager exposes actor observations and route-path snapshots to the application session boundary; the application converts each actor observation into an immutable renderer-facing DTO carrying body pose, actor id, display name, current and maximum health, health-indicator position, held item, attack swing, position, and height. The renderer and overlay layer can then draw AI bodies, route paths, nametags, heart indicators, held blocks, shadows, and combat indicators without receiving mutable actor entities. This separation is necessary because AI state is persistent and rule-driven, while rendering is frame-local and backend-dependent."
      ),
      code_block(
        "AI modules:\n  simulation/actors/ai_players/state.py\n  simulation/actors/ai_players/settings.py\n  simulation/actors/ai_players/naming.py\n  simulation/actors/ai_players/spawning.py\n  simulation/actors/ai_players/serialization.py\n  simulation/actors/ai_players/manager.py\n  simulation/actors/ai_players/idle.py\n  simulation/actors/ai_players/wander.py\n  simulation/actors/ai_players/route.py\n  simulation/actors/ai_players/navigation.py\n  simulation/actors/ai_players/parkour.py\n  simulation/actors/ai_players/recovery.py\n  simulation/actors/ai_players/stuck.py\n  simulation/actors/ai_players/avoidance.py\n  simulation/actors/ai_players/combat.py\n  simulation/actors/ai_players/placement.py\n  simulation/actors/ai_players/planner.py\n  simulation/actors/ai_players/worker.py\n\nAI persisted fields:\n  actor_id\n  mode\n  personality\n  can_place_blocks\n  held_item_id\n  name\n  health_indicator\n  auto_regen_enabled\n  regen_start_delay_s\n  regen_interval_s\n  regen_amount_hp\n  regen_cap_hp\n  pos\n  vel\n  yaw_deg\n  pitch_deg\n  health\n  max_health\n  on_ground\n  flying\n  route_points\n  route_closed\n  route_run\n  route_style\n  route_target_index\n\nAI defaults:\n  mode: idle\n  personality: aggressive\n  route_style: strict\n  health: 20.0\n  max_health: 20.0\n  default held item: minecraft:oak_planks\n  spawn name: lowest free AI#0001-style suffix\n  health indicator: off\n  auto regeneration: disabled\n  regen start delay: 4.0 s\n  regen interval: 4.0 s\n  regen amount: 1.0 health point\n  regen cap: bounded by max health\n\nAI name rules:\n  body: letters and digits, no leading digit, 1-16 characters\n  optional suffix: #0001 to #9999\n  live AI names unique (case-insensitive comparison)\n  dead or removed AI release their names"
      ),
    ),
  ),
  AboutSection(
    title="AI route planning, navigation, and background work",
    blocks=(
      paragraph(
        "Support-cell route planning is the AI routing model. In this overview, support-cell route planning means that the planner searches for actor paths through cells that can physically support the actor and can be traversed under implemented movement, collision, clearance, drop, step, and parkour constraints. It does not mean drawing straight lines through arbitrary point coordinates. A route point must be converted into a reachable support cell, and each segment must produce a sequence that the navigation runtime can follow."
      ),
      paragraph(
        text_run("The planner uses explicit numeric limits. Maximum support Y delta is "),
        code_run("1"),
        text_run("; parkour search cap is "),
        code_run("8"),
        text_run("; parkour sample count is "),
        code_run("5"),
        text_run("; drop search depth is "),
        code_run("4"),
        text_run("; visit limits range from "),
        code_run("1024"),
        text_run(" to "),
        code_run("4096"),
        text_run("; target support search radius is "),
        code_run("6"),
        text_run(
          ". These bounds prevent route planning from becoming an unbounded search across the entire world while still permitting local detours, drops, jumps, and support-cell repair. The route planner therefore has a bounded-world snapshot semantics rather than direct infinite-world authority."
        ),
      ),
      paragraph(
        "Flexible routes and strict routes differ in how they react to navigation failure. A strict route preserves authored intent: the actor walks directly toward each route point, does not search for detours, and getting stuck against blocks is accepted behavior. A flexible route asks the planner for a support-cell route across a bounded snapshot in a background worker process and follows the resulting path when complete; it can detour, recover from blocked spots, and use block placement for traversal when placement is allowed. Failed plans retry with exponential backoff, and a route point that keeps failing is placed on a per-actor cooldown blacklist and temporarily skipped in favor of the next route point instead of being retried without limit. If every route point is currently blacklisted, the actor holds position and turns toward the target until a cooldown expires."
      ),
      paragraph(
        "The background worker exists because route planning can be more expensive than a single frame. Worker logic receives a bounded snapshot, route point data, actor dimensions, and route settings, then computes route results without blocking the Qt event loop; route planning never touches presentation rendering state. Local recovery search inside the manager is also budgeted: its breadth-first escape search caches its result per actor for a short interval and the number of fresh searches per simulation step is capped, so several blocked actors cannot multiply the per-frame search cost. The application must still preserve synchronization: world edits, actor movement, route cancellation, space switching, and shutdown can invalidate or supersede worker results. Therefore route planning is background work, but route application remains manager-owned."
      ),
      paragraph(
        "Navigation includes stuck detection and recovery. An actor following a route or pursuing a player can become blocked by changed blocks, partial geometry, gravity-settled blocks, player placement, or route edits. Stuck detection, avoidance, recovery, and parkour modules provide corrective behavior, including escape candidates from boxed-in positions and placement-based steps when the actor may place blocks. The AI subsystem can cancel navigation for an actor, remove actors, update actor settings, and expose route path snapshots for the HUD and overlay layers. These controls are necessary because route editing is user-driven and persistent."
      ),
      paragraph(
        "Ground movement applies ledge and void safety before each forward step. When an AI walks on the ground in Free Roam, in PVP pursuit, or along a route, it checks whether the column ahead offers a landing surface: in Free Roam and PVP a drop of up to three blocks onto support is allowed, while route following accepts deeper descents only when support exists within eight blocks below. If no landing exists, the actor stops instead of walking off the edge; a wandering actor additionally turns toward a different heading. Planner-verified jumps and drops in flexible routes bypass this gate because their arcs are validated separately. PVP pursuit passes through the same check, so an aggressive AI does not walk into the void to reach its target."
      ),
      paragraph(
        "Block placement is treated as a movement aid with explicit safety rules. Before placing, the AI verifies a clear line of sight from its eye position to the targeted placement face using the picking ray; if another block model obstructs that ray, the placement is cancelled rather than placed through the obstruction. Bridge placement secures the next footing first, and the edge-safety gate keeps the actor from advancing ahead of an unfinished bridge, so the previous behavior of placing one block and walking on into the void no longer occurs. When placement is disabled, the actor never places blocks and prefers stopping or turning away over falling. Combat pursuit interacts with these rules as before: aggressive AI may suspend route planning during melee pursuit, peaceful AI avoids the combat path, and placement permission, mode, personality, route style, health, and route target index are persisted together."
      ),
      code_block(
        "support-cell route planning definition:\n  route search over physically supportable actor cells\n  route points converted to reachable support cells\n  bounded world snapshot\n  route result applied by AI manager\n\nplanner numeric bounds:\n  max support Y delta: 1\n  parkour search cap: 8\n  parkour sample count: 5\n  drop search depth: 4\n  visit limit minimum: 1024\n  visit limit maximum: 4096\n  target support search radius: 6\n\nsearch and retry budgets:\n  route plan requests per step: 1\n  local recovery searches per step: 1\n  local recovery result cache: 0.30 s\n  failed target blacklist after: 3 consecutive plan failures\n  failed target cooldown: 8.0 s\n\nmovement safety:\n  forward footing check before ground steps\n  free roam / PVP safe drop: up to 3 blocks\n  route-following drop window: up to 8 blocks with support below\n  placement line-of-sight check via picking ray\n  bridge placement secures next footing before advancing\n\nroute behavior controls:\n  route_closed\n  route_run\n  route_style: strict or flexible\n  route_target_index\n\nmanager operations:\n  update actor settings\n  validate AI display names\n  cancel actor navigation\n  remove actor\n  pick actor by ray\n  attack actor from local player\n  expose route path snapshots\n  expose actor observations"
      ),
    ),
  ),
  AboutSection(
    title="Camera, HUD, skin, crosshair, and audio surface",
    blocks=(
      paragraph(
        text_run(
          "Camera perspective is a persisted preference with a finite order: first person, third person back, and third person front. The default is first person, and the default cycle action is bound to "
        ),
        code_run("F5"),
        text_run(
          ". Third-person camera placement is constrained by collision checks so that the camera retracts before penetrating world geometry. First-person rendering uses view-model visibility and hand hiding rules, while third-person rendering exposes the player model, name-tag placement, held item state, and shadow-caster alignment."
        ),
      ),
      paragraph(
        text_run("HUD behavior is stateful. Gameplay HUD visibility can be toggled with "),
        code_run("F1"),
        text_run("; debug HUD can be toggled with "),
        code_run("F3"),
        text_run("; debug shadow can be toggled with "),
        code_run("F4"),
        text_run(
          "; Othello HUD visibility respects ordinary HUD suppression and debug HUD precedence. The HUD consumes payloads rather than directly reading every simulation object. It can display metrics, crosshair, hotbar state, route overlays, Othello evaluation, Othello turn state, player health, and debug information, while modal overlays such as pause, inventory, death, settings, and skin preview can suspend gameplay input."
        ),
      ),
      paragraph(
        text_run("The skin pipeline stores skin kind as "),
        code_run("alex"),
        text_run(" or "),
        code_run("custom"),
        text_run(", persists imported custom skin as "),
        code_run("state/player_skin.png"),
        text_run(", and protects that file through the integrity manifest. The renderer contract includes "),
        code_run("set_player_skin_image()"),
        text_run(" and "),
        code_run("render_player_preview_frame()"),
        text_run(", allowing both the in-world player and the pause preview to use the same skin texture state. A modern player skin uses the "),
        code_run("64 x 64"),
        text_run(
          " texture convention, and visual modules construct first-person arms, third-person body parts, UV maps, pose state, held block geometry, and player render state from that skin data."
        ),
      ),
      paragraph(
        text_run("Crosshair customization is stored as a "),
        code_run("16 x 16"),
        text_run(" binary grid. The default mode is "),
        code_run("default"),
        text_run("; custom mode uses the persisted pixel rows. "),
        code_run("normalize_crosshair_pixels()"),
        text_run(" accepts list or tuple input, truncates or pads rows to "),
        code_run("16"),
        text_run(", maps only "),
        code_run("1"),
        text_run(
          " to an active pixel, and fills missing rows with zeros. The reset action clears the persisted custom rows and mode through the existing preference path, then refreshes both the settings preview and HUD immediately. Restart therefore preserves the built-in crosshair without creating or modifying an external bitmap file."
        ),
      ),
      paragraph(
        text_run("Audio preference state is normalized through "),
        code_run("AudioPreferences"),
        text_run(". The categories are master, ambient, block, and player. Each volume is clamped to "),
        code_run("[0.0, 1.0]"),
        text_run(
          ". Master gain is returned directly for the master channel, while ambient, block, and player effective gains multiply the master value by the category-specific value. This structure allows one global attenuation control while preserving per-category mixing semantics. Presentation audio playback can then treat ambient loops, block sounds, and player sounds differently while respecting one persisted preference record."
        ),
      ),
      code_block(
        "camera perspectives:\n  first_person\n  third_person_back\n  third_person_front\n  default: first_person\n  cycle key: F5\n\nHUD toggles:\n  F1 gameplay HUD\n  F3 debug HUD\n  F4 debug shadow\n\nskin:\n  player skin kinds: alex, custom\n  custom skin path: state/player_skin.png\n  modern skin size: 64 x 64\n  renderer API: set_player_skin_image()\n  renderer API: render_player_preview_frame()\n\ncrosshair:\n  grid size: 16 x 16\n  mode: default\n  mode: custom\n  active pixel character: 1\n  inactive pixel character: 0\n\naudio:\n  master\n  ambient\n  block\n  player\n  clamp: 0.0..1.0\n  non-master effective gain: master * category"
      ),
    ),
  ),
  AboutSection(
    title="Othello play space and board state",
    blocks=(
      paragraph(
        text_run("The Othello play space is created through "),
        code_run("create_othello_session(seed=0, block_registry=registry)"),
        text_run(". Its default spawn is "),
        code_run("(0.0, 1.0, -12.0)"),
        text_run(", yaw is "),
        code_run("0.0"),
        text_run(", and pitch is "),
        code_run("0.0"),
        text_run(". The world factory generates a flat world with "),
        code_run("half_extent=48"),
        text_run(", "),
        code_run("ground_y=0"),
        text_run(", and "),
        code_run("minecraft:grass_block"),
        text_run(", then applies "),
        code_run("ensure_othello_board_layout(world)"),
        text_run(". The base generated floor spans "),
        code_run("-48..48"),
        text_run(" on both horizontal axes, giving side length "),
        code_run("97"),
        text_run(" and "),
        code_run("9409"),
        text_run(" ground cells before the board layout is applied."),
      ),
      paragraph(
        text_run("The Othello board has "),
        code_run("BOARD_SIZE = 8"),
        text_run(" and "),
        code_run("BOARD_CELL_COUNT = 64"),
        text_run(". Board footprint coordinates run from "),
        code_run("x=-4..3"),
        text_run(" and "),
        code_run("z=-4..3"),
        text_run("; board blocks occupy "),
        code_run("y=1"),
        text_run("; the board surface is at "),
        code_run("y=2.0"),
        text_run(". The board uses dark and light wood-like blocks for the square pattern. Square names are produced in algebraic form from "),
        code_run("a1"),
        text_run(" through "),
        code_run("h8"),
        text_run(". A board raycast maps a world-space ray hit to a square index, and square-index conversion functions map between row/column, index, and visible square name."),
      ),
      paragraph(
        code_run("OthelloGameState"),
        text_run(
          " stores match status, board tuple, settings, player side, AI side, current turn, black clock, white clock, move count, consecutive passes, winner, message, last move, animations, match generation, legal moves, and thinking state. Status values include idle, player turn, AI turn, animating, and finished. Sides are encoded as empty "
        ),
        code_run("0"),
        text_run(", black "),
        code_run("1"),
        text_run(", and white "),
        code_run("2"),
        text_run(
          ". Draw state is represented separately from either side. This explicit game-state object makes the Othello match persistable and renderable independently of the current viewport frame."
        ),
      ),
      paragraph(
        text_run("The initial board contains the standard "),
        code_run("2 x 2"),
        text_run(
          " center discs. Legal move logic computes captures, legal moves, pass conditions, and winner determination from the board representation. Disc placement is performed by aiming at the board and interacting with a legal square. The renderer can then update board visuals, HUD evaluation, move animations, and clock state while simulation rules continue to own legality. Othello therefore remains a domain game inside the same 3D world rather than a separate 2D widget detached from persistence."
        ),
      ),
      paragraph(
        text_run("Othello hotbar controls are domain-specific. Slot "),
        code_run("0"),
        text_run(" contains the start item, and slot "),
        code_run("8"),
        text_run(
          " contains the settings item. These items can be rendered as held controls in first-person and third-person contexts while still being special items rather than placeable blocks. Othello mode disables ordinary block placement and block breaking, but it preserves shared shell behavior, pause behavior, settings behavior, renderer contract usage, and persistent player state."
        ),
      ),
      paragraph(
        text_run(
          "Othello animation is also explicit. Animation modes include off, fast, and slow. Flip animation carries square index, from side, to side, elapsed time, duration, delay, and lift height. Default flip duration is "
        ),
        code_run("0.22"),
        text_run(", and lift height is "),
        code_run("0.075"),
        text_run(
          ". These values let the renderer animate disc transitions while the match state remains discrete and rule-driven. The animation path must not create illegal board state; it visualizes a transition determined by rules."
        ),
      ),
      code_block(
        "Othello session:\n  create_othello_session(seed=0, block_registry=registry)\n  spawn: (0.0, 1.0, -12.0)\n  yaw: 0.0\n  pitch: 0.0\n  flat half extent: 48\n  base side length: 97\n  base ground cells: 9409\n\nboard constants:\n  BOARD_SIZE: 8\n  BOARD_CELL_COUNT: 64\n  board x range: -4..3\n  board z range: -4..3\n  board block y: 1\n  board surface y: 2.0\n  square names: a1..h8\n\nstate values:\n  empty: 0\n  black: 1\n  white: 2\n  statuses: idle, player_turn, ai_turn, animating, finished\n\nhotbar:\n  slot 0: othello:start\n  slot 8: othello:settings\n\nanimation:\n  modes: off, fast, slow\n  flip duration: 0.22\n  lift height: 0.075"
      ),
    ),
  ),
  AboutSection(
    title="Othello settings, clocks, and search configuration",
    blocks=(
      paragraph(
        code_run("OthelloSettings"),
        text_run(" is a bounded configuration record for the match and engine. Difficulty values are "),
        code_run("weak"),
        text_run(", "),
        code_run("medium"),
        text_run(", "),
        code_run("strong"),
        text_run(", "),
        code_run("insane"),
        text_run(", and "),
        code_run("insane_plus"),
        text_run(". Time-control values include "),
        code_run("off"),
        text_run(", "),
        code_run("per_move_5s"),
        text_run(", "),
        code_run("per_move_10s"),
        text_run(", "),
        code_run("per_move_30s"),
        text_run(", "),
        code_run("per_side_1m"),
        text_run(", "),
        code_run("per_side_3m"),
        text_run(", "),
        code_run("per_side_5m"),
        text_run(", "),
        code_run("per_side_10m"),
        text_run(", and "),
        code_run("per_side_20m"),
        text_run(". Animation modes include "),
        code_run("off"),
        text_run(", "),
        code_run("fast"),
        text_run(", and "),
        code_run("slow"),
        text_run(". Player side can be black or white. These settings are persisted through "),
        code_run("PlayerStateFile"),
        text_run(" and restored into runtime preferences."),
      ),
      paragraph(
        text_run("Time controls map to explicit seconds. Per-move controls map to "),
        code_run("5.0"),
        text_run(", "),
        code_run("10.0"),
        text_run(", and "),
        code_run("30.0"),
        text_run(" seconds. Per-side controls map to "),
        code_run("60.0"),
        text_run(", "),
        code_run("180.0"),
        text_run(", "),
        code_run("300.0"),
        text_run(", "),
        code_run("600.0"),
        text_run(", and "),
        code_run("1200.0"),
        text_run(" seconds. The default time-control option is "),
        code_run("per_side_20m"),
        text_run(", giving "),
        code_run("1200.0"),
        text_run(" seconds. The default time limit constant is also "),
        code_run("20.0 * 60.0"),
        text_run(". Match clocks are part of Othello game state and must pause under modal conditions such as pause and detached Othello settings windows."),
      ),
      paragraph(
        text_run("Engine configuration includes sacrifice level, worker count, hash level, and opening-book learning parameters. Sacrifice level clamps to "),
        code_run("0..4"),
        text_run(". Worker count clamps to "),
        code_run("1..8"),
        text_run(". Hash level clamps to "),
        code_run("0..6"),
        text_run(". Book learning depth clamps to "),
        code_run("0..60"),
        text_run(". Per-move, cumulative, and leaf error bounds clamp to "),
        code_run("0.0..24.0"),
        text_run(". Defaults include medium difficulty, black player side, sacrifice level "),
        code_run("2"),
        text_run(", worker count "),
        code_run("1"),
        text_run(", hash level "),
        code_run("2"),
        text_run(", learning depth "),
        code_run("55"),
        text_run(", per-move error "),
        code_run("22.0"),
        text_run(", cumulative error "),
        code_run("19.0"),
        text_run(", and leaf error "),
        code_run("20.0"),
        text_run("."),
      ),
      paragraph(
        text_run(
          "The engine modules are split by responsibility. Bitboard code represents board state compactly; classic rules provide ordinary legal-move and capture behavior; evaluation profiles define scoring coefficients; evaluation computes position values; ordering ranks moves for search; transposition caches search states; worker modules isolate long-running AI evaluation from the UI; and insane-mode code selects stronger search behavior. "
        ),
        code_run("Insane+"),
        text_run(" can consult opening-book data before falling back to the same deeper search family."),
      ),
      paragraph(
        "The Othello HUD consumes engine output without owning game rules. It can display turn, best move, principal variation, evaluation score, evaluation graph, thinking status, and clock state. Legal moves still come from the rules functions; AI decisions still come from engine code; rendering still comes through Othello visual state. This separation keeps board legality and UI display consistent even when engine difficulty, animation mode, time control, or learning settings change."
      ),
      code_block(
        "Othello difficulty values:\n  weak\n  medium\n  strong\n  insane\n  insane_plus\n\ntime controls:\n  off: None\n  per_move_5s: 5.0\n  per_move_10s: 10.0\n  per_move_30s: 30.0\n  per_side_1m: 60.0\n  per_side_3m: 180.0\n  per_side_5m: 300.0\n  per_side_10m: 600.0\n  per_side_20m: 1200.0\n  default time limit: 1200.0\n\nsettings clamps:\n  sacrifice_level: 0..4\n  thread_count: 1..8\n  hash_level: 0..6\n  book_learning_depth: 0..60\n  book error bounds: 0.0..24.0\n\nsettings defaults:\n  difficulty: medium\n  time control: per_side_20m\n  player side: black\n  sacrifice level: 2\n  worker count: 1\n  hash level: 2\n  learning depth: 55\n  per-move error: 22.0\n  cumulative error: 19.0\n  leaf error: 20.0"
      ),
    ),
  ),
  AboutSection(
    title="Othello opening book and learning cache",
    blocks=(
      paragraph(
        text_run("Othello opening-book storage is divided between bundled resources, user state, and compiled cache. Bundled opening-book data lives under "),
        code_run("simulation/spaces/othello/resources/opening_book.json"),
        text_run(", which is included as package data. User-created or learned book lines are stored under the app-managed state path "),
        code_run("state/othello_opening_book.json"),
        text_run(". The compiled lookup cache is stored under "),
        code_run("cache/othello_opening_book_cache.json"),
        text_run(". This separation allows bundled data to remain immutable, user extensions to remain durable, and compiled structures to remain disposable cache."),
      ),
      paragraph(
        "Application persistence installs storage hooks into the simulation opening-book module. The hook set normalizes project root into a data root, loads user book payloads after integrity verification, saves user book payloads and updates the HMAC manifest, loads compiled cache, saves compiled cache, and clears compiled cache when necessary. This design lets the Othello book algorithm operate on line payloads and canonical positions without knowing OS-specific state-root paths or manifest files."
      ),
      paragraph(
        "Opening-book learning is bounded and cancellable. It can explore lines to a configured learning depth, apply per-move, cumulative, and leaf error bounds, preserve partial progress on cancellation, and write user book lines through the application storage hook. The learning path temporarily projects the position being explored onto the Othello board while preserving the distinction between active match state and learning-state visualization. This prevents learning UI from corrupting the ordinary match unless a deliberate reset or update occurs."
      ),
      paragraph(
        "Canonicalization is symmetry-aware. Othello positions can be rotated or reflected into equivalent states, and book lookup can use canonical board keys to avoid storing the same logical position multiple times. This is algorithmically important because Othello board symmetries reduce redundant opening positions without changing move legality. It also makes learning results more compact and more reusable across positions that differ only by board symmetry."
      ),
      paragraph(
        "Import and export operate at the application persistence boundary. An imported book file is decoded into move-line payloads, merged with existing user lines without duplicate logical lines, saved through the user book hook, and summarized. Export writes the current user lines to a chosen file. The simulation book code owns line semantics; the application store owns paths and manifest update. This keeps book IO auditable and prevents ad hoc file writes inside engine code."
      ),
      code_block(
        "book resource paths:\n  bundled book: simulation/spaces/othello/resources/opening_book.json\n  user book: state/othello_opening_book.json\n  compiled cache: cache/othello_opening_book_cache.json\n\nstorage hook installer:\n  install_othello_book_storage_hooks()\n\nopening-book storage hooks:\n  normalize_root_hook\n  load_user_lines_hook\n  save_user_lines_hook\n  load_cache_hook\n  save_cache_hook\n  clear_cache_hook\n\nlearning controls:\n  book_learning_depth: 0..60\n  per-move error: 0.0..24.0\n  cumulative error: 0.0..24.0\n  leaf error: 0.0..24.0\n\nbook operations:\n  load_opening_book_lines()\n  save_user_opening_book_lines()\n  opening_book_summary()\n  import_opening_book_file()\n  export_opening_book_file()\n  symmetry-aware canonicalization"
      ),
    ),
  ),
  AboutSection(
    title="Renderer contract and backend-neutral state",
    blocks=(
      paragraph(
        text_run("Rendering is organized around "),
        code_run("BackendRendererApi"),
        text_run(
          " and renderer contracts. The API includes initialization, destruction, renderer information reporting, shadow information reporting, payload validation reporting, frame metrics, runtime-state application, cloud-motion pause state, texture-animation pause state, atlas UV lookup, world-build tools, block display-name lookup, chunk eviction, selection clearing, selection targeting, chunk submission, frame rendering, player-skin image updates, and player-preview rendering. This contract is intentionally broad enough to support gameplay rendering, settings previews, pause previews, HUD overlays, chunk uploads, and platform-specific backend implementations."
        ),
      ),
      paragraph(
        text_run("The "),
        code_run("Renderer"),
        text_run(
          " facade owns backend parameters and forwards calls to the selected backend. This means Qt shell code can call renderer methods without committing itself to OpenGL or wgpu internals. Backend renderer parameters include preferred backend selection, runtime state, optional canvas, and resource roots. Runtime state can carry wireframe flags, cloud settings, shadow state, sun orientation, skin state, animated-texture state, and settings-derived visual flags. Renderer backends consume this state but do not own persisted settings."
        ),
      ),
      paragraph(
        text_run(
          "Render snapshots provide the bridge from session state to frame data. Snapshot DTOs can include player position, yaw, pitch, camera state, local player render state, AI render states, Othello render state, selection state, falling-block render samples, block-break particle samples, route overlay paths, HUD metrics, and world chunk payloads. This prevents the renderer from reaching back into "
        ),
        code_run("SessionManager"),
        text_run(" or "),
        code_run("WorldState"),
        text_run(" during draw calls. A frame should render the snapshot it was given, while simulation and application logic prepare the next state."),
      ),
      paragraph(
        "Frame metrics are part of the renderer contract. Backends can report pass timings, upload counts, draw counts, chunk residency, payload validation, and shadow information. The HUD and debug overlays can display these metrics without becoming backend-specific. This is important because the OpenGL backend and wgpu backend can differ internally while still exposing comparable runtime health information to the shell."
      ),
      paragraph(
        "Backend parity has a precise meaning. It does not require OpenGL and wgpu to use the same shader language, surface, buffer, pipeline object, or draw-call implementation. It requires the same application-level scene meaning: the same block-state geometry should produce the same visible block shape; the same atlas UV should address the same texture region; the same skin should map to the same player parts; the same Othello board state should render the same board; the same selection target should outline the same picked shape; the same falling-block sample should appear as the same moving block; and the same settings should affect the same visual feature."
      ),
      paragraph(
        "The renderer contract also protects settings and About pages. The About page can describe renderer behavior because renderer APIs, shader resources, package-data declarations, and backend modules exist in code. The settings pages can manipulate visual flags because those flags pass through runtime preferences into backend runtime state. Neither surface should invent renderer claims; both should reflect implemented API methods, resource roots, and backend-specific limitations."
      ),
      code_block(
        "renderer contract types:\n  BackendRendererApi\n  BackendRendererParams\n  BackendRendererRuntimeState\n  BackendRendererInfo\n  BackendRendererFrameMetrics\n  BackendPassFrameMetrics\n  Renderer\n  WorldUploadTracker\n\nBackendRendererApi methods:\n  initialize()\n  destroy()\n  gl_info()\n  shadow_info()\n  payload_validation_report()\n  frame_metrics()\n  apply_runtime_state()\n  set_cloud_motion_paused()\n  set_texture_animation_paused()\n  atlas_uv_face()\n  world_build_tools()\n  block_display_name()\n  evict_chunks()\n  clear_selection()\n  set_selection_target()\n  submit_chunk()\n  render()\n  set_player_skin_image()\n  render_player_preview_frame()\n\nsnapshot inputs:\n  camera state\n  local player render state\n  AI render states\n  Othello render state\n  chunk payloads\n  selection state\n  falling-block samples\n  break-particle samples\n  route overlay paths\n  HUD metrics"
      ),
    ),
  ),
  AboutSection(
    title="OpenGL backend, shader resources, and render passes",
    blocks=(
      paragraph(
        text_run("The Windows renderer path is the OpenGL backend under "),
        code_run("presentation.rendering.backends.opengl"),
        text_run(
          ". Its runtime is organized into GL resource wrappers, compute payload preparation, render passes, pipeline orchestration, texture resources, runtime state, upload tracking, and shader resources. It can use OpenGL-specific concepts such as shader programs, mesh buffers, colored mesh buffers, storage buffers, buffer upload helpers, state guards, texture atlases, and compute-oriented chunk payload generation. These mechanisms remain backend-specific and should not be projected onto the macOS wgpu path."
        ),
      ),
      paragraph(
        text_run("The Qt OpenGL surface parameters request a version "),
        code_run("4.3"),
        text_run(" context, core profile, depth buffer "),
        code_run("24"),
        text_run(", stencil buffer "),
        code_run("8"),
        text_run(", samples "),
        code_run("0"),
        text_run(
          ", double buffering, and a swap interval derived from the v-sync preference. The request is part of the presentation interface configuration because OpenGL context characteristics must exist before backend initialization can compile shader programs, create buffers, allocate textures, or validate payloads. OpenGL frame execution therefore depends on both Qt surface setup and renderer runtime code."
        ),
      ),
      paragraph(
        "The OpenGL pass structure is explicit. Pass modules include aggregated face batches, block-break particles, clouds, falling blocks, first-person arms, held blocks, player models, selection lines, shadow maps, special items, sun rendering, textured faces, world rendering, and Othello rendering. This decomposition keeps shadow generation, world pass drawing, first-person overlay drawing, player model drawing, selection outline drawing, and Othello scene drawing inspectable as separate responsibilities rather than one monolithic renderer method."
      ),
      paragraph(
        text_run("Shader resources are package-managed. The OpenGL shader root includes "),
        code_run("chunk_face_payload.comp"),
        text_run(", "),
        code_run("cloud_box.frag"),
        text_run(", "),
        code_run("cloud_box.vert"),
        text_run(", "),
        code_run("first_person_face.frag"),
        text_run(", "),
        code_run("first_person_face.vert"),
        text_run(", "),
        code_run("othello_shadow.vert"),
        text_run(", "),
        code_run("othello.frag"),
        text_run(", "),
        code_run("othello.vert"),
        text_run(", "),
        code_run("player_model_no_shadow.frag"),
        text_run(", "),
        code_run("player_model_shadow.vert"),
        text_run(", "),
        code_run("player_model.frag"),
        text_run(", "),
        code_run("player_model.vert"),
        text_run(", "),
        code_run("selection_line.frag"),
        text_run(", "),
        code_run("selection_line.vert"),
        text_run(", "),
        code_run("shadow.frag"),
        text_run(", "),
        code_run("shadow.vert"),
        text_run(", "),
        code_run("sun.frag"),
        text_run(", "),
        code_run("sun.vert"),
        text_run(", "),
        code_run("world_no_shadow.frag"),
        text_run(", "),
        code_run("world.frag"),
        text_run(", "),
        code_run("world.vert"),
        text_run(", and "),
        code_run("common/face_instance.glsl"),
        text_run(". These files are included by both "),
        code_run("MANIFEST.in"),
        text_run(" and package-data metadata."),
      ),
      paragraph(
        text_run("The compute shader "),
        code_run("chunk_face_payload.comp"),
        text_run(
          " is central to the OpenGL chunk payload path. It belongs to the OpenGL backend’s resource model, not to the abstract renderer contract. A project overview must therefore say that OpenGL can use the compute-backed path where available, while the backend-neutral contract remains expressed through chunk submission, face rows, shadow faces, and world-build tools. This distinction is necessary for macOS parity because the wgpu backend has a different runtime and pipeline model."
        ),
      ),
      paragraph(
        text_run("OpenGL shadow behavior uses backend defaults such as shadow map size "),
        code_run("2048"),
        text_run(", shadow dark multiplier "),
        code_run("0.20"),
        text_run(", bias values "),
        code_run("0.00005"),
        text_run(" and "),
        code_run("0.00050"),
        text_run(", sun azimuth "),
        code_run("45.0"),
        text_run(", sun elevation "),
        code_run("60.0"),
        text_run(", sun distance "),
        code_run("150.0"),
        text_run(", light distance "),
        code_run("60.0"),
        text_run(", and orthographic radius "),
        code_run("30.0"),
        text_run(
          ". These values matter because world pass, player model pass, first-person pass, special item rendering, cloud rendering, and Othello rendering need a coherent scene lighting and shadow basis."
        ),
      ),
      code_block(
        "OpenGL backend modules:\n  compute/chunk_payload.py\n  gl/array_view.py\n  gl/buffer_upload.py\n  gl/colored_mesh_buffer.py\n  gl/instanced_mesh_common.py\n  gl/mesh_buffer.py\n  gl/shader_program.py\n  gl/state_guard.py\n  gl/storage_buffer.py\n  othello/render_pass.py\n  passes/aggregated_face_batch.py\n  passes/block_break_particle.py\n  passes/cloud.py\n  passes/falling_block.py\n  passes/first_person_arm.py\n  passes/held_block.py\n  passes/player_model.py\n  passes/selection.py\n  passes/shadow_map.py\n  passes/special_item.py\n  passes/sun.py\n  passes/textured_face.py\n  passes/world.py\n  pipelines/frame.py\n  resources/image_texture.py\n  resources/texture_atlas.py\n  runtime/renderer.py\n\nOpenGL surface request:\n  version: 4.3\n  profile: CoreProfile\n  depth buffer: 24\n  stencil buffer: 8\n  samples: 0\n  swap behavior: DoubleBuffer\n  swap interval: 1 when vsync_on else 0\n\nOpenGL shader files:\n  chunk_face_payload.comp\n  cloud_box.frag\n  cloud_box.vert\n  first_person_face.frag\n  first_person_face.vert\n  othello_shadow.vert\n  othello.frag\n  othello.vert\n  player_model_no_shadow.frag\n  player_model_shadow.vert\n  player_model.frag\n  player_model.vert\n  selection_line.frag\n  selection_line.vert\n  shadow.frag\n  shadow.vert\n  sun.frag\n  sun.vert\n  world_no_shadow.frag\n  world.frag\n  world.vert\n  common/face_instance.glsl\n\nshadow defaults:\n  shadow map size: 2048\n  shadow dark multiplier: 0.20\n  bias minimum: 0.00005\n  bias slope: 0.00050\n  sun azimuth: 45.0\n  sun elevation: 60.0\n  sun distance: 150.0\n  light distance: 60.0\n  orthographic radius: 30.0"
      ),
    ),
  ),
  AboutSection(
    title="wgpu backend, rendercanvas surface, and macOS parity",
    blocks=(
      paragraph(
        text_run("The macOS renderer path uses the wgpu backend under "),
        code_run("presentation.rendering.backends.wgpu"),
        text_run(
          ". It is organized into chunk meshes, pipeline factory functions, runtime backend state, runtime resources, surface configuration, texture atlas handling, and shader source adaptation. It is selected through the presentation shell on Darwin and is intended to avoid dependence on an OpenGL 4.3 context on macOS. The backend operates through the renderer contract so shell code and settings surfaces can remain backend-neutral."
        ),
      ),
      paragraph(
        code_run("configure_wgpu_canvas(canvas, adapter, device)"),
        text_run(" is the surface configuration point. It obtains the "),
        code_run("wgpu"),
        text_run(" canvas context, asks for the preferred adapter format, and configures the surface with render-attachment usage and opaque alpha mode. The runtime uses depth format "),
        code_run("depth24plus"),
        text_run(", a "),
        code_run("44"),
        text_run("-float uniform vector, a "),
        code_run("176"),
        text_run(
          "-byte uniform buffer size, and a clip-space transform that adapts OpenGL-style projection conventions to wgpu depth conventions. These are backend implementation details, but they define how macOS frames become visible."
        ),
      ),
      paragraph(
        "The wgpu shader source tree mirrors the OpenGL shader naming surface: world, shadow, player model, first-person face, cloud box, selection line, sun, Othello, Othello shadow, and common face-instance sources. The pipeline factory expands includes, adapts declarations, and creates pipelines for world, world wireframe, world shadowed, shadow depth, transform shadow, sun, cloud, cloud wireframe, selection, Othello, Othello shadow, and textured faces. This mirrored source structure supports semantic parity even when the underlying graphics API differs."
      ),
      paragraph(
        text_run("Selection and wireframe parity use the OpenGL semantics rather than backend-specific approximations. Both backends obtain selection geometry from "),
        code_run("SelectionOutlineBuilder"),
        text_run(
          ", which evaluates the selected block state, six-neighbor state signature, model render boxes, and local occlusion. World and cloud wireframe in wgpu emit the same two-triangle edge sequence as the OpenGL triangle list, including each quad diagonal, and reject back-facing faces before line drawing to match OpenGL back-face culling."
        ),
      ),
      paragraph(
        "The macOS backend must be described by what it actually guarantees. It does not require OpenGL 4.3, GLSL 4.30 compute shaders, OpenGL shader storage buffers, or OpenGL multi-draw semantics. It does require wgpu device and surface setup, render pipelines, depth textures, bind groups, vertex buffers, uniform buffers, texture atlas resources, and rendercanvas integration. The contract is therefore not that macOS imitates OpenGL internals, but that it accepts the same renderer-facing scene state and produces equivalent application-level visuals."
      ),
      paragraph(
        text_run("Player preview is part of the wgpu parity surface. "),
        code_run("render_player_preview_frame()"),
        text_run(
          " must render the same skin, player model pose, name-tag conditions, and item visibility semantics as the OpenGL path. The preview camera uses specific eye and target defaults, and the first-person and third-person model builders supply geometry independent of backend. The backend can draw through different pipelines, but it must interpret skin UV maps and visual-state DTOs consistently."
        ),
      ),
      paragraph(
        "Othello rendering is also part of parity. The board, discs, flip animations, control items, shadow-caster state, HUD relationship, and selection or hover state need to map correctly through both backend families. Since Othello is a persistent play space rather than a widget-only board, the backend must render it in the same world scene as the local player, camera, lighting, and special held item state. That makes wgpu parity a game-state and renderer-contract issue, not only a shader translation issue."
      ),
      code_block(
        'wgpu backend modules:\n  meshes/chunk.py\n  pipelines/factory.py\n  runtime/backend.py\n  runtime/resources.py\n  runtime/surface.py\n  textures/atlas.py\n\nshared visual contracts:\n  SelectionOutlineBuilder\n  six-neighbor state signature\n  model render boxes\n  local face occlusion\n  triangle wireframe with back-face rejection\n\nsurface configuration:\n  configure_wgpu_canvas(canvas, adapter, device)\n  canvas.get_context("wgpu")\n  context.get_preferred_format(adapter)\n  usage: RENDER_ATTACHMENT\n  alpha_mode: opaque\n\nwgpu runtime values:\n  depth format: depth24plus\n  uniform floats: 44\n  uniform buffer size: 176 bytes\n\npipeline factory functions:\n  create_world_pipeline()\n  create_world_wireframe_pipeline()\n  create_world_shadowed_pipeline()\n  create_shadow_depth_pipeline()\n  create_transform_shadow_pipeline()\n  create_sun_pipeline()\n  create_cloud_pipeline()\n  create_cloud_wireframe_pipeline()\n  create_selection_pipeline()\n  create_othello_pipeline()\n  create_othello_shadow_pipeline()\n  create_textured_face_pipeline()\n\nmacOS backend exclusions:\n  no required OpenGL 4.3 context\n  no required GLSL 4.30 compute path\n  no required OpenGL shader storage buffer path\n  no required OpenGL multi-draw path'
      ),
    ),
  ),
  AboutSection(
    title="Input ownership, capture, and modal state",
    blocks=(
      paragraph(
        text_run("Gameplay input is owned by presentation input modules and viewport lifecycle code. "),
        code_run("InputFrame"),
        text_run(" represents the state consumed by gameplay: forward movement, strafe movement, jump held state, jump pressed edge, sprint, crouch, and mouse deltas. "),
        code_run("QtInputAdapter"),
        text_run(" maps Qt key events and keybind settings into this frame. "),
        code_run("ViewportInput"),
        text_run(
          " owns capture enablement, mouse and keyboard grab state, blank cursor application, cursor recentering, delta clearing, keyboard focus, viewport activation, and capture release. This ownership prevents ordinary widget focus from silently becoming the gameplay control model."
        ),
      ),
      paragraph(
        "Modal state changes input semantics. Pause, inventory, death overlay, detached settings, detached Othello settings, themed notices, application deactivation, and shell reactivation each require different behavior. Some states should suspend camera and movement; some should release capture; some should allow settings sliders to affect renderer state while the world remains visible; some should keep clocks paused; some should re-arm selection and world upload after closing. Input capture is therefore not a one-time mouse-grab call but an application state machine."
      ),
      paragraph(
        text_run("macOS input capture uses additional helpers. "),
        code_run("MacosGameplayInputGuard"),
        text_run(
          " installs a CoreGraphics event tap for key down, key up, and flags changed events; maps platform keycodes to Qt key semantics; and reports installation status when permission is missing. "
        ),
        code_run("MacosRelativeMouseCapture"),
        text_run(" uses CoreGraphics through "),
        code_run("ctypes"),
        text_run(" to disassociate cursor position from mouse motion, hide the display cursor, and read relative deltas from "),
        code_run("CGGetLastMouseDelta()"),
        text_run(". The "),
        code_run(".app"),
        text_run(" bundle declares "),
        code_run("NSInputMonitoringUsageDescription"),
        text_run(" because gameplay key capture on macOS can require Input Monitoring or Accessibility permission."),
      ),
      paragraph(
        "Native macOS capture does not depend on visible cursor displacement or repeated center warps during gameplay. Capture release restores cursor association and visibility for pause, inventory, focus loss, window or application deactivation, explicit release, and shutdown. The existing Qt recenter and zero-delta stabilization path remains a non-macOS or unavailable-CoreGraphics fallback, so native capture does not change input semantics on the Windows OpenGL path."
      ),
      paragraph(
        "World upload and selection refresh are tied to input reactivation. Returning from pause, inventory, death, settings, or app deactivation can leave the backend with stale selection or chunk residency expectations. The viewport lifecycle can re-arm world upload and selection refresh after modal state changes so that the next visible frame reflects current world state and current input ownership. This prevents a modal close from revealing stale selection outlines, stale chunk residency, or a renderer still paused for the wrong reason."
      ),
      paragraph(
        "The input path is also connected to keybind persistence. Keybind settings normalize bindings through Qt portable text and reject modifier combinations. The macOS guard maps raw keycodes into the same logical actions. The runtime input frame consumes actions rather than raw platform events. That layered mapping lets the project support configurable controls while still implementing platform-specific capture behavior where the OS requires it."
      ),
      code_block(
        "input modules:\n  presentation/interface/input/game_input.py\n  presentation/interface/input/qt.py\n  presentation/interface/input/macos_guard.py\n  presentation/interface/input/macos_cursor.py\n\ninput objects:\n  InputFrame\n  QtInputAdapter\n  ViewportInput\n  MacosGameplayInputGuard\n  MacosRelativeMouseCapture\n  MacosRelativeMouseDelta\n\nCoreGraphics mouse operations:\n  CGGetLastMouseDelta()\n  CGAssociateMouseAndMouseCursorPosition(false)\n  CGDisplayHideCursor()\n  CGAssociateMouseAndMouseCursorPosition(true)\n  CGDisplayShowCursor()\n\nmacOS event tap types:\n  key down: 10\n  key up: 11\n  flags changed: 12\n\nbundle permission key:\n  NSInputMonitoringUsageDescription\n\ncapture release states:\n  pause\n  inventory\n  focus loss\n  window deactivation\n  application deactivation\n  explicit release\n  shutdown"
      ),
    ),
  ),
  AboutSection(
    title="HUD, overlays, settings pages, and About content model",
    blocks=(
      paragraph(
        "Presentation interface code separates HUD, overlays, settings, and common widgets. HUD modules cover controller logic, payload data, metrics, crosshair art, crosshair widget, hotbar widget, route overlay, AI status tags, and composite HUD widget. The AI status tag pool draws each AI's nametag and optional heart-row health indicator as one projected Qt overlay block, reusing the world nametag style and the Survival heart pattern, and the same pool serves both the Windows OpenGL and macOS wgpu viewport paths. AI status tag projection uses a stable overlay camera derived from the player body position, crouch-adjusted eye height, yaw, pitch, and camera perspective, so player view bobbing, step-eye vertical bobbing, hurt tilt, and camera-shake translation or roll do not move the tag. The completed block is scaled from stable-camera-to-AI world distance, so its background, padding, text, hearts, and spacing shrink together; tags disappear beyond 64 blocks, and per-actor occlusion ray results are cached briefly so the overlay update does not cast a full ray for every AI on every frame. Overlay modules cover AI settings, death state, inventory, pause, and skin preview. Settings modules cover overlay shell, ordinary page construction, state synchronization, cloud-flow settings, scalar widgets, control widgets, crosshair widgets, and the Qt-specific About page renderer and widget helpers. The lightweight About document is owned separately under presentation documentation. This separation allows HUD updates, modal overlays, settings state, and About content to evolve without becoming one unstructured desktop-window file."
      ),
      paragraph(
        "The HUD consumes structured state. It can display hotbar contents, selected slot, crosshair, health, debug metrics, Othello state, evaluation graph, route lines, and status overlays. It should not own block placement legality, Othello move legality, AI route computation, or renderer resource allocation. HUD visibility can be controlled independently from debug HUD visibility, and Othello HUD is suppressed under conditions where ordinary gameplay HUD or debug HUD state requires it. This keeps user-visible display rules separate from domain state."
      ),
      paragraph(
        text_run(
          "Overlays are modal or semi-modal surfaces with simulation consequences. Pause can suspend input and clocks; death overlay can coordinate respawn; inventory can expose block and item selection; AI settings can update actor settings; skin preview can import and reset player skin; Othello settings can change match and engine configuration. These surfaces must integrate with "
        ),
        code_run("save_state()"),
        text_run(", runtime preferences, input capture, renderer pause state, and application shutdown. They are therefore part of the application contract, not ornamental dialogs."),
      ),
      paragraph(
        text_run("The AI settings overlay is organized by responsibility into "),
        code_run("Identity"),
        text_run(", "),
        code_run("Display"),
        text_run(", "),
        code_run("Health"),
        text_run(", "),
        code_run("Behavior"),
        text_run(", "),
        code_run("Safety"),
        text_run(", "),
        code_run("Block Placement"),
        text_run(", and "),
        code_run("Route"),
        text_run(
          " pages. Identity edits the validated AI name with live duplicate feedback; Display selects the health-indicator position; Health configures auto regeneration through the start delay, the cap, and the time needed to heal the full cap; Behavior selects mode and personality; Safety documents the always-active ledge and void checks; Block Placement holds the placement permission together with its bridging and line-of-sight rules; Route selects strict or flexible style and explains the two route toggles. The "
        ),
        code_run("Run route segments"),
        text_run(" toggle makes the AI sprint while traveling along route segments without changing the route itself, and "),
        code_run("Treat route as a closed loop"),
        text_run(
          " makes the final route point connect back to the first as an authored patrol segment; with the loop disabled the AI still returns toward the first point after the final one, but the direct closing connection is not part of the authored route."
        ),
      ),
      paragraph(
        text_run("The About document contract in "),
        code_run("presentation/documentation/about/content.py"),
        text_run(" and the settings renderer in "),
        code_run("presentation/interface/settings/about/"),
        text_run(" are implemented through "),
        code_run("AboutRun"),
        text_run(", "),
        code_run("AboutBlock"),
        text_run(", "),
        code_run("AboutSection"),
        text_run(", "),
        code_run("paragraph_runs()"),
        text_run(", "),
        code_run("text_run()"),
        text_run(", "),
        code_run("code_run()"),
        text_run(", "),
        code_run("code_value()"),
        text_run(", "),
        code_run("code_block()"),
        text_run(", and "),
        code_run("render_about_sections()"),
        text_run(
          ". Paragraphs carry ordered text and inline-code runs, so the renderer preserves spaces and punctuation without parsing Markdown. Independent one-line values and multi-line code blocks remain distinct block kinds with explicit object names and theme rules."
        ),
      ),
      paragraph(
        "About content import and widget construction are deferred until the About navigation item is selected. My World and Othello settings keep stable stack indexes with a temporary page object, replace that object exactly once on first selection, and reuse the generated page on later selections. The other settings pages therefore do not pay the About document and widget-tree construction cost during initial overlay creation."
      ),
      paragraph(
        "My World and Othello settings retain the shared left-navigation and stacked-page shell. Their pages use common page-header, card, setting-row, text-column, control-column, and primary, secondary, or danger button hooks. This structural reuse preserves the Minecraft-style theme while allowing each play space to define different settings groups and synchronization behavior."
      ),
      paragraph(
        text_run("Creator-profile content and project-overview content have distinct roles. "),
        code_run("ABOUT_PROFILE_BIO_TEXT"),
        text_run(", "),
        code_run("ABOUT_WORK_TEXT"),
        text_run(", "),
        code_run("ABOUT_ACADEMIC_DIRECTION_TEXT"),
        text_run(", and "),
        code_run("ABOUT_ETYMOLOGY_PARAGRAPHS"),
        text_run(" describe creator-facing biographical, academic, and naming material. "),
        code_run("ABOUT_PROJECT_OVERVIEW_SECTIONS"),
        text_run(
          " describes the implemented software system. It can and should include build commands, package metadata, renderer resources, persistence files, legal files, and desktop packaging because those are actual project boundaries visible in code, package configuration, and runtime behavior."
        ),
      ),
      paragraph(
        "The project overview should be technical enough to be useful inside the settings surface. It should mention concrete classes, functions, directories, commands, parameter values, shader resources, backend distinctions, persistence schema, and runtime state. It should avoid generic promotional claims that cannot be traced to code. It should also avoid relying on a README that is not part of the inspected evidence. The About page is part of the program, so its content must be auditable like any other application constant."
      ),
      code_block(
        "HUD modules:\n  controller.py\n  widget.py\n  payload.py\n  metrics.py\n  crosshair_art.py\n  crosshair_widget.py\n  hotbar_widget.py\n  route_overlay.py\n  ai_status_tags.py\n\noverlay modules:\n  ai_settings.py\n  death.py\n  inventory.py\n  pause.py\n  skin_preview.py\n\nsettings modules:\n  overlay.py\n  pages.py\n  surface.py\n  sync.py\n  cloud_flow.py\n  widgets/scalar.py\n  widgets/controls.py\n  widgets/crosshair.py\n\nAbout documentation and UI modules:\n  presentation/documentation/about/model.py\n  presentation/documentation/about/content.py\n  presentation/interface/settings/about/page.py\n  presentation/interface/settings/about/renderer.py\n  presentation/interface/settings/about/widgets.py\n\nAbout data structures:\n  AboutRun(kind, text)\n  AboutBlock(kind, text, runs)\n  AboutSection(title, blocks)\n\nAbout helper functions:\n  paragraph(text)\n  paragraph_runs(*runs)\n  text_run(text)\n  code_run(text)\n  inline_code(text)\n  code_value(text)\n  code_block(text)\n  render_about_sections(parent, layout, sections, text_factory)\n  about_card()\n  about_text()\n  about_inline_paragraph()\n  about_code_value()\n  about_code_block()\n  profile_image_path()\n  github_image_path()"
      ),
    ),
  ),
  AboutSection(
    title="Development workflow and repository command surface",
    blocks=(
      paragraph(
        text_run("The repository command surface is part of the project specification. It is declared in "),
        code_run("package.json"),
        text_run(" and implemented through "),
        code_run("tools/"),
        text_run(
          ". The command surface includes help rendering, formatting, linting, project checks, documentation checks, license checks, resource checks, shader checks, directory export, native-extension builds, desktop application builds, cleanup, and audio asset conversion. These commands are not external notes: they determine whether code, resources, package data, shader files, legal files, and desktop packaging are verifiable from the repository."
        ),
      ),
      paragraph(
        text_run("Core npm scripts include "),
        code_run("help"),
        text_run(", "),
        code_run("package:check"),
        text_run(", "),
        code_run("docs:check"),
        text_run(", "),
        code_run("license:check"),
        text_run(", "),
        code_run("resources:check"),
        text_run(", "),
        code_run("shader:check"),
        text_run(", "),
        code_run("lint"),
        text_run(", "),
        code_run("lint:js"),
        text_run(", "),
        code_run("lint:css"),
        text_run(", "),
        code_run("lint:py"),
        text_run(", "),
        code_run("format"),
        text_run(", "),
        code_run("format:web"),
        text_run(", "),
        code_run("format:py"),
        text_run(", "),
        code_run("format:check"),
        text_run(", "),
        code_run("format:web:check"),
        text_run(", "),
        code_run("format:py:check"),
        text_run(", "),
        code_run("tools:export"),
        text_run(", "),
        code_run("tools:export:help"),
        text_run(", "),
        code_run("tools:export:src"),
        text_run(", "),
        code_run("tools:export:root"),
        text_run(", "),
        code_run("tools:export:archive"),
        text_run(", "),
        code_run("tools:test"),
        text_run(", "),
        code_run("docs:export"),
        text_run(", "),
        code_run("build:desktop"),
        text_run(", "),
        code_run("build:desktop:help"),
        text_run(", "),
        code_run("build:windows"),
        text_run(", "),
        code_run("build:windows:help"),
        text_run(", "),
        code_run("build:macos"),
        text_run(", "),
        code_run("build:macos:help"),
        text_run(", "),
        code_run("build:macos:check"),
        text_run(", "),
        code_run("build:native"),
        text_run(", "),
        code_run("build:native:check"),
        text_run(", "),
        code_run("clean"),
        text_run(", "),
        code_run("clean:check"),
        text_run(", "),
        code_run("assets:audio:convert"),
        text_run(", "),
        code_run("assets:audio:check"),
        text_run(", "),
        code_run("assets:block-thumbnails:generate"),
        text_run(", "),
        code_run("assets:block-thumbnails:check"),
        text_run(", "),
        code_run("check"),
        text_run(", and "),
        code_run("ci"),
        text_run(". The "),
        code_run("check"),
        text_run(" script composes formatting, linting, tool tests, package checks, documentation checks, license checks, resource checks, and shader checks."),
      ),
      paragraph(
        text_run("The Node metadata sets "),
        code_run("type"),
        text_run(" to "),
        code_run("module"),
        text_run(", marks the package private, and declares engines "),
        code_run("^20.19.0 || ^22.13.0 || >=24"),
        text_run(". Development dependencies include "),
        code_run("@eslint/js"),
        text_run(" "),
        code_run("10.0.1"),
        text_run(", "),
        code_run("eslint"),
        text_run(" "),
        code_run("10.4.1"),
        text_run(", "),
        code_run("globals"),
        text_run(" "),
        code_run("17.6.0"),
        text_run(", "),
        code_run("prettier"),
        text_run(" "),
        code_run("3.8.3"),
        text_run(", "),
        code_run("stylelint"),
        text_run(" "),
        code_run("17.12.0"),
        text_run(", "),
        code_run("stylelint-config-standard"),
        text_run(" "),
        code_run("40.0.0"),
        text_run(", and "),
        code_run("vite"),
        text_run(" "),
        code_run("^8.0.16"),
        text_run(". Those versions matter because web-source formatting, JavaScript linting, CSS linting, and Node script execution depend on the declared toolchain."),
      ),
      paragraph(
        text_run("Block visual assets use one resolved family for renderer textures and item thumbnails. "),
        code_run("resolve_visual_asset_roots()"),
        text_run(" selects "),
        code_run("assets/ludoxel/"),
        text_run(" only when its block texture directory satisfies the registry-required texture names; otherwise it keeps the provenance-sensitive "),
        code_run("assets/minecraft/"),
        text_run(" family. OpenGL, wgpu, inventory, hotbar, and item-selection image resolution consume that same result, preventing a mixed texture and thumbnail family."),
      ),
      code_value("assets/ludoxel/thumbnails/blocks/"),
      paragraph(
        text_run(
          "The block-thumbnail repository tool accepts a texture root, output root, block selection, model category, orientation, fit, state overrides, connectivity, dry-run, and overwrite policy. Node modules own CLI validation and orchestration, while a Python helper reads the current block registry and model render-box contract and emits deterministic "
        ),
        code_run("300 x 300"),
        text_run(" RGBA PNG images on a transparent background. Existing Minecraft thumbnails are not overwritten without explicit output and overwrite options."),
      ),
      paragraph(
        text_run("Python formatting policy is declared in "),
        code_run("pyproject.toml"),
        text_run(". Ruff uses line length "),
        code_run("200"),
        text_run(", indent width "),
        code_run("2"),
        text_run(", target version "),
        code_run("py313"),
        text_run(", lint selection "),
        code_run("E9"),
        text_run(", "),
        code_run("F63"),
        text_run(", "),
        code_run("F7"),
        text_run(", and "),
        code_run("F82"),
        text_run(", double quote style, space indentation, "),
        code_run("skip-magic-trailing-comma = true"),
        text_run(
          ", and disabled docstring-code formatting. Two-space Python indentation is not a casual style note; it is declared in the formatter configuration and must be compatible with the actual code emitted into the repository."
        ),
      ),
      paragraph(
        text_run(
          "Package metadata and command checks interact with package resources. Shader validation must understand OpenGL shader files and wgpu shader sources. Resource validation must understand QSS, Othello JSON resources, assets, fonts, and third-party material. License validation must include "
        ),
        code_run("LICENSE"),
        text_run(", "),
        code_run("NOTICE"),
        text_run(
          ", and third-party notices. Build commands must include package data, legal material, and platform-specific renderer dependencies. The command surface therefore protects runtime correctness as much as formatting style."
        ),
      ),
      paragraph(
        text_run("Directory export tooling is also part of development workflow. It can output repository contents for inspection, and its own scripts appear under "),
        code_run("tools/export_directory_markdown"),
        text_run(
          ". That matters because tasks such as this overview audit rely on exported source rather than memory of a README. The application’s About text should be able to be checked against the same exported code and package metadata that project tools can produce."
        ),
      ),
      code_block(
        "core scripts:\n  npm run help\n  npm run check\n  npm run ci\n  npm run package:check\n  npm run docs:check\n  npm run license:check\n  npm run resources:check\n  npm run shader:check\n  npm run lint\n  npm run format\n  npm run tools:export\n  npm run tools:test\n  npm run build:native\n  npm run build:native:check\n  npm run build:desktop\n  npm run build:windows\n  npm run build:macos\n  npm run build:macos:check\n  npm run clean\n  npm run assets:audio:convert\n  npm run assets:block-thumbnails:generate\n  npm run assets:block-thumbnails:check\n\nvisual asset families:\n  assets/ludoxel/textures/block/\n  assets/ludoxel/thumbnails/blocks/\n  assets/minecraft/textures/block/\n  assets/minecraft/thumbnails/blocks/\n\nthumbnail output contract:\n  300 x 300 RGBA PNG\n  transparent background\n  deterministic model rendering\n  explicit overwrite opt-in\n\nNode metadata:\n  type: module\n  private: true\n  engines: ^20.19.0 || ^22.13.0 || >=24\n\nRuff configuration:\n  line-length: 200\n  indent-width: 2\n  target-version: py313\n  select: E9, F63, F7, F82\n  quote-style: double\n  indent-style: space\n  skip-magic-trailing-comma: true\n  docstring-code-format: false"
      ),
    ),
  ),
  AboutSection(
    title="Native build boundary and Python fallback model",
    blocks=(
      paragraph(
        text_run("Native acceleration is deliberately narrow. The native extension targets are "),
        code_run("ludoxel.foundations.mathematics.geometry.ray_aabb"),
        text_run(", "),
        code_run("ludoxel.foundations.mathematics.voxels.dda"),
        text_run(", and "),
        code_run("ludoxel.foundations.mathematics.linear.view_angles"),
        text_run(". These modules are mathematical hot paths: ray/AABB intersection, voxel traversal, and view-angle calculations. They belong under "),
        code_run("foundations"),
        text_run(" because they do not own application persistence, Qt widgets, renderer buffers, player sessions, Othello matches, or desktop packaging."),
      ),
      paragraph(
        text_run("The inspected repository contains Darwin CPython 3.13 "),
        code_run(".so"),
        text_run(
          " artifacts beside the Python modules for those targets. Those artifacts are interpreter-specific binary outputs, not portable source files and not package-level design documents. They demonstrate that the project can build native replacements for selected foundations modules, while the Python sources remain part of the package and editable source tree. This duality is important because development, source inspection, and fallback execution must still function when native binaries are absent."
        ),
      ),
      paragraph(
        code_run("tools/build_native_extensions"),
        text_run(
          " supplies the explicit native build and verification path. It contains run scripts, argument parsing, validation, help rendering, dispatch, source and binary collectors, native configuration, path configuration, build-script generation, temporary script handling, build service, list service, verify service, task service, file discovery helpers, process execution helpers, and Python executable resolution. The scripts are invoked through "
        ),
        code_run("npm run build:native"),
        text_run(" and "),
        code_run("npm run build:native:check"),
        text_run(". Native build is therefore a repository-managed operation, not an undocumented manual compiler invocation."),
      ),
      paragraph(
        text_run("The package metadata places Cython in development extras. Ordinary "),
        code_run("python -m pip install -e ."),
        text_run(
          " should not require compiling extension modules as a side effect of package metadata evaluation. The native build path can be invoked when performance recovery or binary verification is needed. Desktop packaging tools can call the native build where appropriate, while preserving the principle that only narrow mathematical foundations modules are compiled in place. This boundary prevents accidental attempts to compile UI, persistence, renderer orchestration, or application shell code as native extensions."
        ),
      ),
      paragraph(
        text_run("Native verification must inspect import resolution rather than merely checking that a build command returned zero. "),
        code_run("build:native:check"),
        text_run(
          " should confirm that the intended modules resolve to built binary files for the active interpreter. Because CPython extension suffixes include interpreter and platform markers, a stale binary from another interpreter or platform is not equivalent to a valid current build. This is especially important in a project that supports Python 3.13 and 3.14 metadata ranges while native files are interpreter-specific."
        ),
      ),
      code_block(
        "native extension targets:\n  ludoxel.foundations.mathematics.geometry.ray_aabb\n  ludoxel.foundations.mathematics.voxels.dda\n  ludoxel.foundations.mathematics.linear.view_angles\n\nnative command surface:\n  npm run build:native\n  npm run build:native:check\n\nnative tool files:\n  tools/build_native_extensions/scripts/run/build.run.mjs\n  tools/build_native_extensions/scripts/run/verify.run.mjs\n  tools/build_native_extensions/src/collect/source.collect.mjs\n  tools/build_native_extensions/src/collect/binary.collect.mjs\n  tools/build_native_extensions/src/config/native.config.mjs\n  tools/build_native_extensions/src/service/build.service.mjs\n  tools/build_native_extensions/src/service/list.service.mjs\n  tools/build_native_extensions/src/service/verify.service.mjs\n\nobserved Darwin binary suffix:\n  cpython-313-darwin.so\n\nPython package principle:\n  Python source remains authoritative fallback\n  native build is explicit\n  native targets stay inside foundations mathematics"
      ),
    ),
  ),
  AboutSection(
    title="Desktop packaging, resource inclusion, and distribution layout",
    blocks=(
      paragraph(
        text_run("Desktop packaging is implemented under "),
        code_run("tools/build_desktop_app"),
        text_run(" and declared through package scripts such as "),
        code_run("build:desktop"),
        text_run(", "),
        code_run("build:windows"),
        text_run(", "),
        code_run("build:macos"),
        text_run(", and "),
        code_run("build:macos:check"),
        text_run(
          ". The tool directory contains platform run scripts, argument parsing, validation, help rendering, dispatch, native-build command wiring, PyInstaller command construction, legal-copy service, macOS build service, macOS status service, Windows build service, task service, path configuration, file helpers, process helpers, and Python resolution. Packaging is therefore an auditable repository tool, not an external checklist."
        ),
      ),
      paragraph(
        text_run("Package resource inclusion is declared in both "),
        code_run("MANIFEST.in"),
        text_run(" and package-data metadata. "),
        code_run("MANIFEST.in"),
        text_run(" grafts "),
        code_run("assets"),
        text_run(", "),
        code_run("third-party"),
        text_run(", and "),
        code_run("tools"),
        text_run("; includes "),
        code_run("pyproject.toml"),
        text_run(", "),
        code_run("README.md"),
        text_run(", "),
        code_run("LICENSE"),
        text_run(", and "),
        code_run("NOTICE"),
        text_run(
          "; recursively includes theme QSS, OpenGL shader files, OpenGL common GLSL files, wgpu shader-source files, wgpu common GLSL files, and Othello JSON resources; and globally excludes Python bytecode. Package-data metadata mirrors QSS, OpenGL shaders, wgpu shader sources, and Othello resources under the "
        ),
        code_run("ludoxel"),
        text_run(" package. This duplication makes resource availability visible to both source distribution and installed package paths."),
      ),
      paragraph(
        "Windows desktop packaging produces a one-file executable path through PyInstaller. The build must package the source entry, package resources, legal material, assets, third-party notices, and platform dependencies. The Windows renderer path uses the OpenGL backend and can include native extension rebuilds unless skipped. Runtime writes must still go to the app-managed data root rather than beside the executable or inside immutable package resources. That prevents a packaged executable from writing ordinary state into distribution material."
      ),
      paragraph(
        "macOS desktop packaging produces an app bundle and uses the wgpu/rendercanvas renderer path. The bundle must preserve Python framework layout, include wgpu and rendercanvas packages, include assets and fonts, include legal material, and carry the input monitoring usage string for macOS gameplay keyboard capture. Local build verification can inspect app-bundle status and resource presence, while codesigning and notarization remain separate release steps. This separation keeps local packaging reproducible without pretending that local builds are notarized public releases."
      ),
      paragraph(
        "Font resources are part of desktop correctness. If bundled fonts are missing from the app bundle, macOS or Windows can fall back to platform fonts, which changes the actual UI surface even when the program launches. Theme QSS, font registration, title mark search, icon search, HUD typography, pause UI, settings UI, About page, and Othello HUD all depend on packaged resources being present. Resource checks and packaging services therefore directly affect the application surface."
      ),
      paragraph(
        text_run("Desktop packaging also interacts with legal material. "),
        code_run("LICENSE"),
        text_run(", "),
        code_run("NOTICE"),
        text_run(", and "),
        code_run("third-party/"),
        text_run(
          " must accompany distribution outputs. The legal-copy service exists because desktop artifacts are not only binaries; they include original project materials, third-party materials, provenance-sensitive assets, fonts, package resources, and generated distribution layouts. A correct package must make those materials available without converting third-party licenses into the project’s own license or treating local uncertain assets as original materials."
        ),
      ),
      code_block(
        "desktop build commands:\n  npm run build:desktop\n  npm run build:desktop:help\n  npm run build:windows\n  npm run build:windows:help\n  npm run build:macos\n  npm run build:macos:help\n  npm run build:macos:check\n\nresource declarations:\n  graft assets\n  graft third-party\n  graft tools\n  include pyproject.toml\n  include README.md\n  include LICENSE\n  include NOTICE\n\npackage data roots:\n  presentation/interface/theme/*.qss\n  presentation/rendering/backends/opengl/shaders/*.vert\n  presentation/rendering/backends/opengl/shaders/*.frag\n  presentation/rendering/backends/opengl/shaders/*.comp\n  presentation/rendering/backends/opengl/shaders/common/*.glsl\n  presentation/rendering/backends/wgpu/shaders/sources/*.vert\n  presentation/rendering/backends/wgpu/shaders/sources/*.frag\n  presentation/rendering/backends/wgpu/shaders/sources/*.comp\n  presentation/rendering/backends/wgpu/shaders/sources/common/*.glsl\n  simulation/spaces/othello/resources/*.json\n\nlegal distribution material:\n  LICENSE\n  NOTICE\n  third-party/\n\npackaging boundary:\n  immutable package resources\n  app-managed runtime state\n  app-managed runtime cache\n  separate codesigning and notarization concerns"
      ),
    ),
  ),
  AboutSection(
    title="Legal material, third-party assets, and runtime user data",
    blocks=(
      paragraph(
        text_run("Ludoxel Original Materials are governed by the Ludoxel Independent License in "),
        code_run("LICENSE"),
        text_run(" under "),
        code_run("LicenseRef-All-Rights-Reserved"),
        text_run(". The license text identifies version "),
        code_run("1.0.4"),
        text_run(", original effective date "),
        code_run("2026-06-03"),
        text_run(", current version effective date "),
        code_run("2026-06-11"),
        text_run(
          ", and states that the repository is not open source and not free software. It also states that the original materials are not licensed under Apache-2.0, MIT, BSD, GPL, AGPL, LGPL, MPL, or other open-source licenses. This legal status belongs in the project overview because it controls distribution, copying, reuse, derivative works, and training-data use."
        ),
      ),
      paragraph(
        text_run(
          "The license distinguishes original materials, third-party materials, user materials, and application output. Original materials include source code, documentation, configuration, build scripts, repository text, UI text, generated data, images, metadata, packaged files, distribution files, shaders, bundled resources, desktop app packaging material, and other repository contents created by Kento Konishi. Third-party libraries, fonts, external packages, vendor files, platform SDKs, and materials identified in "
        ),
        code_run("NOTICE"),
        text_run(" or "),
        code_run("third-party/"),
        text_run(
          " remain under their own terms. User materials and ordinary application output do not become original project materials merely because the application saved, displayed, or exported them."
        ),
      ),
      paragraph(
        code_run("NOTICE"),
        text_run(
          " records the relationship between Ludoxel original materials, third-party material, provenance-sensitive local assets, runtime user data, and distribution legal material. It identifies Kaisei Opti as a third-party font under SIL Open Font License "
        ),
        code_run("1.1"),
        text_run(", with corresponding notice and license files under "),
        code_run("third-party/kaisei-opti/"),
        text_run(". It also identifies Minecraft-named local assets and fonts under "),
        code_run("assets/"),
        text_run(" as materials whose provenance, rights, and redistribution status are not established by the repository. Those assets must not be described as Ludoxel original materials."),
      ),
      paragraph(
        "Runtime user data is treated separately from immutable package resources. Player settings, window state, custom crosshair data, imported player skin, world edits, Othello opening-book user extension, compiled cache, and future user-generated records are written under the app-managed data root. They are not ordinary package resources and should not be bundled back into source distribution as original repository material merely because the application can create or read them. This distinction matters for privacy, distribution, license scope, and persistence migration."
      ),
      paragraph(
        text_run("Distribution legal material must accompany desktop artifacts. Windows EXE and macOS app bundle outputs must include at least "),
        code_run("LICENSE"),
        text_run(", "),
        code_run("NOTICE"),
        text_run(", and "),
        code_run("third-party/"),
        text_run(
          ". That requirement is implemented through packaging services and resource-copying behavior. The presence of package metadata, SPDX headers, README summaries, generated file notices, translations, or UI descriptions does not override the English license text when legal terms conflict. The legal overview must therefore be precise and not replace license text with informal paraphrase."
        ),
      ),
      paragraph(
        "The legal and governance boundary also affects how the About page should speak. It can state that the repository is private in package metadata and not open source under the license; it can state that third-party materials remain third-party; it can state that app output and user materials are treated separately; it can state that distribution legal material is required. It should not imply that public visibility, clone buttons, fork buttons, dependency licenses, or ordinary desktop use grant reuse rights over original project materials."
      ),
      code_block(
        "license facts:\n  Ludoxel Independent License\n  license version: 1.0.4\n  original effective date: 2026-06-03\n  current version effective date: 2026-06-11\n  SPDX identifier: LicenseRef-All-Rights-Reserved\n  package.json private: true\n  repository is not open source\n  repository is not free software\n\nthird-party material:\n  third-party/\n  Kaisei Opti\n  SIL Open Font License 1.1\n  third-party/kaisei-opti/NOTICE.txt\n  third-party/kaisei-opti/LICENSE.txt\n\nproject visual asset migration roots:\n  assets/ludoxel/textures/block/\n  assets/ludoxel/thumbnails/blocks/\n\nprovenance-sensitive local assets:\n  assets/minecraft/\n  Minecraft-named font files under assets/fonts/\n\nruntime user data examples:\n  player settings\n  window state\n  custom crosshair\n  imported player skin\n  world edits\n  Othello opening-book user extension\n  compiled cache\n\nrequired distribution legal material:\n  LICENSE\n  NOTICE\n  third-party/"
      ),
    ),
  ),
)
