/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { defineDocsArticle, type DocsPageContent } from '../types';

export const manualPages: DocsPageContent[] = [
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Starting the Application',
    group: 'Launch and Space Selection',
    title: 'Starting Ludoxel',
    description:
      'Traces the launch path from the Python module entry to a focused, loaded viewport. `src/ludoxel/__main__.py`, `application/bootstrap/run.py`, root resolution, the Qt shell, single-instance relay, player-name admission, `MainWindow`, `GameScreen`, and the viewport each own a distinct transition; the visible surface identifies the latest completed transition and supplies no evidence for later persistence, play-space, or simulation outcomes.',
    sections: [
      {
        id: 'starting-ludoxel-entry-delegation',
        title: 'Entry Is Delegation, Not Window Construction',
        body: [
          'Starting Ludoxel begins at `src/ludoxel/__main__.py`. The entry module prepares multiprocessing support for frozen execution and delegates to `ludoxel.application.run_app`. `QApplication` creation, My World or Othello selection, saved-state reads, and renderer construction occur through later owners in the launch chain; the entry module contributes process setup and application delegation.',
          '`ludoxel.application` exposes that entry through a lazy package facade. The symbol `run_app` is resolved from `ludoxel.application.bootstrap` only when requested, so the module-level import path does not pull the presentation layer into the application package before the bootstrap gate has fixed project roots, resource roots, runtime data roots, and runtime selection. The first executable evidence is therefore delegation into the application composition root, not a visible desktop surface.',
          '`src/ludoxel/__main__.py` supplies process ingress, while `bootstrap/run.py` supplies the composition decision and `windows/main.py` supplies the Qt shell. The bootstrap passes resolved project, resource, and runtime-data roots across that handoff; `MainWindow` and `GameScreen` use those values when the viewport begins loading its session and renderer state. The window becoming visible records successful arrival at the presentation shell. Persistence restoration, active-space selection, and frame-by-frame simulation remain later gates with their own state owners and failure paths.',
          '`multiprocessing.freeze_support()` executes before `run_app()`. That ordering belongs to the module entry and has no player, session, renderer, or saved-state payload. `run_app()` is the sole handoff exposed by the module; a stack trace or process exit before that call terminates execution upstream of every Qt surface described later on this page.',
          '`MainWindow` persists host geometry through the viewport on move, resize, and close events. During construction, `main.run_app` chooses a screen from persisted name or position, clamps geometry against available screen bounds, and establishes fullscreen separately. Window placement belongs to the presentation shell and runtime preferences; completion of that restoration does not imply that the viewport has initialized its renderer or loaded world chunks.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The Python module entry delegates into the application layer after frozen-process preparation.',
            code: `import multiprocessing

from ludoxel.application import run_app

if __name__ == "__main__":
  multiprocessing.freeze_support()
  run_app()`,
          },
          {
            language: 'py',
            caption: 'The application package exposes `run_app` through a lazy facade, not a direct presentation import.',
            code: `__all__ = ["run_app"]


def __getattr__(name: str):
  if str(name) == "run_app":
    return import_module("ludoxel.application." + "bootstrap").run_app
  raise AttributeError(str(name))`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-bootstrap-gates',
        title: 'Bootstrap Fixes Roots, Runtime, and Storage Hooks Before Qt',
        body: [
          'The application bootstrap is the first substantive execution gate. `src/ludoxel/application/bootstrap/run.py` determines `project_root`, `resource_root`, and `data_root`, then enforces the source-runtime preference before importing the presentation shell. The ordering is load-bearing. Gameplay evidence begins after root resolution, runtime-data selection, optional runtime substitution, and Othello opening-book storage-hook installation complete.',
          '`run_app` imports `install_othello_book_storage_hooks` only after root resolution and invokes it before `ludoxel.presentation.interface.windows.main.run_app`. `MainWindow` then constructs `GameScreen` with the same project, resource, and data roots; `GameScreen` constructs the viewport that owns loading state and session presentation. The startup chain preserves those roots across the bootstrap-to-window transition, so a visible screen can be tied to the runtime roots supplied at launch.',
          '`project_root` identifies the application context, `resource_root` identifies bundled runtime material, and `data_root` identifies the user-state root that later persistence consumers will use. The pre-presentation Othello book-storage hook prepares its storage path. Board activation, visibility, restoration, and selection occur through the Othello session and interface paths.',
          'In source-tree execution, `_ensure_python_314` may re-execute the module through a preferred Python 3.14 interpreter. In a frozen executable the function returns immediately because the runtime is already part of the packaged process. A failure before any Qt surface exists is therefore a launch-environment or bootstrap-path condition, not camera movement, hotbar interaction, Othello move legality, renderer overlay behavior, or play-space switching.',
          '`default_project_root` and `default_resource_root` first honor a frozen application root, then search upward from the module location and working directory for `pyproject.toml` or the `assets`/`src` pair. The fallback is the supplied start directory. Those functions establish locations only; `run_app` has not admitted an `AppState`, instantiated a `SessionManager`, or asked a renderer to allocate resources at that point.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The bootstrap computes roots, checks the runtime, installs storage hooks, and only then enters presentation code.',
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
            language: 'py',
            caption: 'Runtime substitution is skipped for frozen builds and for an already selected Python 3.14 runtime.',
            code: `def _ensure_python_314(project_root: Path) -> None:
  if is_frozen_application():
    return
  if sys.version_info[:2] == (3, 14):
    return

  candidate = _preferred_python_314()
  if candidate is None:
    return`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-data-root-boundary',
        title: 'The Runtime Data Root Is Storage Jurisdiction, Not Repository Content',
        body: [
          'The runtime data root is selected before any user-facing interaction, but root selection is not state admission. It fixes only the base location from which later state, cache, integrity, and store paths can be derived. A selected `data_root` does not prove that a player name, inventory, My World payload, Othello payload, runtime preference, or saved world fragment has been loaded or accepted.',
          '`LUDOXEL_DATA_ROOT` overrides the default location. Without that override, the implementation follows platform storage conventions: `LOCALAPPDATA` or `AppData` on Windows, `~/Library/Application Support/Ludoxel` on macOS, `XDG_DATA_HOME/ludoxel` on compatible systems, and `~/.local/share/ludoxel` as the final fallback. The repository source tree is not the ordinary storage authority for user runtime state.',
          'Consequently, "the process opened" and "the expected saved state appeared" remain separate propositions. A missing player name, an unexpected world, absent Othello state, lost inventory, or a mismatched current-space selector after a window exists is a persistence, play-space restoration, or runtime-integrity condition. It is not proof that the module entry point or bootstrap gate failed.',
          '`runtime_state_root`, `runtime_cache_root`, `runtime_state_manifest_path`, and `runtime_integrity_key_path` derive later locations from `data_root`. They do not create files during root resolution. A chosen path therefore establishes where later owners look; it supplies no confirmation that a state envelope exists, passes integrity handling, or was applied to a session.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The data root is resolved from an override or from platform storage conventions.',
            code: `def default_runtime_data_root(project_root: Path | None = None) -> Path:
  env_root = os.environ.get("LUDOXEL_DATA_ROOT", "").strip()
  if env_root:
    return Path(env_root).expanduser().resolve()

  if sys.platform.startswith("win"):
    base = os.environ.get("LOCALAPPDATA", "").strip() or os.environ.get("AppData", "").strip()
    if base:
      return (Path(base).expanduser() / "Ludoxel").resolve()

  if sys.platform == "darwin":
    return (Path.home() / "Library" / "Application Support" / "Ludoxel").resolve()

  xdg_data_home = os.environ.get("XDG_DATA_HOME", "").strip()
  if xdg_data_home:
    return (Path(xdg_data_home).expanduser() / "ludoxel").resolve()

  return (Path.home() / ".local" / "share" / "ludoxel").resolve()`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-presentation-admission',
        title: 'The Presentation Shell Admits the Desktop Process',
        body: [
          'After bootstrap, `src/ludoxel/presentation/interface/windows/main.py` constructs the desktop process. It creates `QApplication`, assigns organization and application identity, loads an application icon when one exists, registers bundled fonts, applies the QSS theme, and only then proceeds toward single-instance coordination and state admission. Bundled font registration is a startup requirement in this path; failure raises before the final game window can be authorized as a partially styled desktop surface.',
          'Single-instance activation is an execution gate, not a saved-state operation. `SingleInstanceRelay` is bound to the managed data root. If an existing instance accepts activation, the new launch returns without constructing a second independent `MainWindow`. An apparent second launch may therefore be an activation request delivered to an existing desktop process.',
          'The player-name gate is also part of startup. The shell loads `AppStateStore`, normalizes the persisted player name, and displays `PlayerNameDialog` only when no launch name is available. Cancelling that dialog returns before `MainWindow` exists. That return is an intentional admission failure, not a renderer crash and not a failed play-space switch.',
          '`MainWindow` receives the selected name as `launch_player_name` and passes it to `GameScreen`, which passes it to the backend-selected viewport. The name crosses this construction chain as an explicit argument. Its presence on the active viewport remains separate from later profile editing, persisted preference writes, and any label rendered over the game surface.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The presentation shell creates the Qt application identity before the main window.',
            code: `def run_app(*, project_root: Path, resource_root: Path, data_root: Path) -> None:
  root = Path(project_root)
  bundled_root = Path(resource_root)
  managed_data_root = Path(data_root)

  _set_windows_application_id()
  app = QApplication([])
  app.setOrganizationName("Kento Konishi")
  app.setApplicationName("Ludoxel")
  app.setApplicationVersion(str(__version__))`,
          },
          {
            language: 'py',
            caption: 'Bundled font registration is a startup requirement and failure raises before the final game window.',
            code: `fonts = install_minecraft_fonts(font_dir=(bundled_root / "assets" / "fonts"))
if not bool(fonts.ok):
  details = "\\n".join(str(error) for error in tuple(fonts.errors) if str(error))
  raise RuntimeError(f"Ludoxel bundled font registration failed.\\n{details}")

apply_application_font(app=app, family=str(fonts.family), point_size=12, fallback_families=tuple(fonts.fallback_families))
theme_qss = load_theme_stylesheet(styles_dir)
if theme_qss:
  app.setStyleSheet(str(font_qss) + theme_qss)`,
          },
          {
            language: 'py',
            caption: 'Single-instance activation and the player-name gate can end startup before a new main window exists.',
            code: `relay = SingleInstanceRelay(managed_data_root, app)
if relay.activate_existing_instance():
  return
relay.listen()
app.aboutToQuit.connect(relay.close)

persisted_state = AppStateStore(project_root=root, data_root=managed_data_root).load()
explicit_player_name = ""
if persisted_state is not None:
  explicit_player_name = normalize_player_name(persisted_state.settings.player_name)

launch_player_name = explicit_player_name
if not launch_player_name:
  dialog = PlayerNameDialog(title_image_path=splash_title_image_path, initial_name=explicit_player_name)
  if not bool(dialog.exec()):
    return
  launch_player_name = dialog.selected_player_name()`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-window-and-viewport-gates',
        title: 'The Host Window and the Viewport Are Separate Milestones',
        body: [
          '`MainWindow` is the host. It stores the resolved roots, constructs `GameScreen`, installs that screen as its central widget, and connects fullscreen behavior to the viewport. The existence of this host window proves that startup has passed the shell admission gates. It does not prove that the viewport has finished loading, that a play-space rule has executed, or that saved state has been applied without later contradiction.',
          '`GameScreen` chooses the platform viewport widget, constructs the HUD, and displays a loading overlay whose initial status is `Preparing viewport...`. The overlay is bound to the viewport loading-state and loading-status signals. `loading_finished` hides the overlay and queues the viewport focus transfer so the startup shell can finish its own completion work first.',
          'The startup splash in `src/ludoxel/presentation/interface/windows/main.py` follows the same status channel. On the first `loading_finished`, the shell closes `startupSplash`, restores the main window only when `QApplication` is active, and leaves the deferred viewport focus transfer to `GameScreen`. A visible splash, a host window with `Preparing viewport...`, and a focused viewport are distinct execution positions; they are not interchangeable evidence that ordinary play-space interaction has started.',
          '`GameScreen` binds the overlay geometry to both `resizeEvent` and `showEvent`; an active overlay is raised after either update. The overlay therefore follows the host widget’s dimensions while loading. Its text is supplied from `loading_status_text()` and `loading_status_changed`, so a static screenshot identifies a presentation state and the latest reported status string, with no direct access to renderer internals or session persistence.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The main window hosts GameScreen; play-space interaction is still downstream of the viewport.',
            code: `class MainWindow(QMainWindow):
  def __init__(self, project_root: Path, resource_root: Path, data_root: Path, *, launch_player_name: str | None = None) -> None:
    super().__init__()
    self._project_root = Path(project_root)
    self._resource_root = Path(resource_root)
    self._data_root = Path(data_root)
    self._screen = GameScreen(project_root=self._project_root, resource_root=self._resource_root, data_root=self._data_root, launch_player_name=launch_player_name)
    self.setCentralWidget(self._screen)
    self.setMinimumSize(_MIN_WINDOW_WIDTH, _MIN_WINDOW_HEIGHT)`,
          },
          {
            language: 'py',
            caption: 'The game screen keeps the preparing overlay visible until the viewport reports completion.',
            code: `self._loading_overlay = StatusOverlayFrame(
  title_text="Ludoxel",
  status_text="Preparing viewport...",
  object_name="loadingOverlay",
  title_object_name="loadingTitle",
  status_object_name="loadingStatus",
  title_image_path=title_image_path,
  parent=self,
)
self._loading_overlay.set_status_text(self.viewport.loading_status_text())
self._loading_overlay.setVisible(bool(self.viewport.loading_active()))
self.viewport.loading_state_changed.connect(self._handle_loading_state_changed)
self.viewport.loading_status_changed.connect(self._loading_overlay.set_status_text)
self.viewport.loading_finished.connect(self._handle_loading_finished)`,
          },
          {
            language: 'py',
            caption: 'Viewport completion hides the overlay, then defers the focus transfer until the current signal delivery completes.',
            code: `def _handle_loading_finished(self) -> None:
  self._loading_overlay.hide()
  QTimer.singleShot(0, self._focus_viewport_after_loading)

def _focus_viewport_after_loading(self) -> None:
  if bool(self.viewport.loading_active()):
    return
  self.viewport.setFocus(Qt.FocusReason.OtherFocusReason)

def _handle_loading_state_changed(self, active: bool) -> None:
  self._loading_overlay.setVisible(bool(active))
  if bool(active):
    self._loading_overlay.raise_()`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-viewport-preparation-when-inactive',
        title: 'Viewport Preparation Continues Without Gameplay Focus',
        body: [
          '`LoadingState` in `src/ludoxel/presentation/interface/viewport/render_loop/frame_sync.py` owns the active flag, text, and chunk-progress pair. Renderer initialization enters that state through `_begin_loading`; `paintGL` in `src/ludoxel/presentation/interface/viewport/render_loop/loop.py` drains and schedules `WorldUploadTracker` work, updates `Loading world... ready/total chunks`, and calls `_finish_loading` only after the visible chunk set is resident. The status is therefore produced by viewport preparation, not by a splash timer or a fixed message.',
          '`ViewportLifecycleMixin._on_application_state_changed` still clears held input, releases mouse capture, and suppresses the delayed pause while loading. Its runtime-activity gate now keeps the render timer alive when the initialized viewport remains visible and loading is active, even if `_application_active` is false. `_tick_sim` and `_on_step` continue to return during loading, so inactive startup does not advance player simulation, gameplay input, pause state, HUD interaction, or ordinary capture.',
          'When visible chunks become ready, `_finish_loading` clears loading state, updates HUD and cloud-motion state, re-evaluates runtime activity, emits `loading_state_changed(False)`, and emits `loading_finished`. The initial completion handler closes the splash before activating the main window when the application is already active; the queued `GameScreen` callback then focuses the viewport. This keeps preparation independent of foreground focus without making Ludoxel request foreground activation from an inactive desktop application.',
          'The implementation keeps Ludoxel-owned Qt timers and the render/upload path eligible to run during this specific inactive loading state. It does not establish that an operating system will display frames while the process is hidden, suspended, or denied rendering by the window manager, and it does not claim identical OpenGL and WGPU presentation timing on Windows and macOS.',
          '`GLViewportWidget` accepts key, wheel, mouse-press, mouse-release, and mouse-move events during ordinary operation, then accepts and returns for each of those paths while `loading_active()` is true. Loading retains the preparation path while excluding gameplay mutation from these event handlers. The source fixes the in-application gate; compositor scheduling, driver behavior, and platform suspension remain outside this code path.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Runtime activity retains the initialized visible render path while loading is active, but not ordinary inactive gameplay.',
            code: `def _sync_runtime_activity(self: "GLViewportWidget") -> None:
  self._set_runtime_active(bool(self._gl_initialized) and bool(self.isVisible()) and (bool(self._application_active) or bool(self.loading_active())) and (not bool(self._shutdown_done)))`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-startup-evidence-routing',
        title: 'Startup Evidence Must Be Classified Before Any Public Channel',
        body: [
          'A startup observation has force only at the last gate it can identify. No visible Qt surface, player-name dialog, startup splash, existing-window activation, main window with `Preparing viewport...`, loaded viewport focus, and loaded viewport with an unexpected play space are different execution positions. None of those observations, by itself, becomes a diagnosis, proposed patch, vulnerability disclosure, support entitlement, repository-policy request, or permission to publish private machine material.',
          [
            'Public submission is controlled by the repository support gates, not by the mere existence of a local observation. A public ',
            {
              kind: 'link',
              label: 'problem report',
              href: '/docs/support/public-problem-support/issue-report-content/writing-a-problem-report',
            },
            ' is available only for a reproducible, non-security problem affecting the Current Repository or an Official Distribution and expressible through public, non-sensitive facts. A narrow question about repository policy, the LICENSE, Third-Party Materials, Ordinary Application Use, packaging status, build status, or the Security Reporting Policy follows the ',
            {
              kind: 'link',
              label: 'limited-question',
              href: '/docs/support/scope-and-closure-support/limited-question-scope/asking-a-limited-question',
            },
            ' route. A suspected vulnerability, exploit mechanism, proof-of-concept path, secret-bearing reproduction, sensitive URL, private local file, or other non-public reproduction condition must be separated from the public problem route before it is described, through the Support classification between ',
            {
              kind: 'link',
              label: 'Security Reports and problem reports',
              href: '/docs/support/security-and-safety-support/private-security-contact/separating-security-reports-from-problem-reports',
            },
            '.',
          ],
          [
            'The same classification controls startup evidence that looks technically useful. Operating-system, Python, PyQt6, GPU, OpenGL, package, or build facts are admissible as ',
            {
              kind: 'link',
              label: 'platform evidence',
              href: '/docs/support/public-problem-support/evidence-handling/supplying-platform-evidence',
            },
            ' only when they materially narrow reproduction without exposing unrelated private machine detail. Logs, local paths, crash text, or diagnostic excerpts remain inadmissible public material unless they satisfy ',
            {
              kind: 'link',
              label: 'logs without secrets',
              href: '/docs/support/public-problem-support/evidence-handling/supplying-logs-without-secrets',
            },
            '; decisive material that cannot be made public without unsafe disclosure belongs outside the public report.',
          ],
          'A startup locator has no independent publication authority. It proves the implemented point reached by the launch chain: which gate executed, which surface appeared, which surface accepted focus, and where execution stopped or diverged. `.github/ISSUE_TEMPLATE/` and the Support policy determine whether that locator supports a reproducible non-security problem report, a limited public question, a minimal request for a Private Reporting Channel, or no public submission. The policy governs admissibility. The forms exclude secrets, vulnerability detail, and Contribution Materials — replacement text, design assets, datasets, generated files, shader rewrites, and implementation proposals — while unrelated machine-specific material remains outside reportable Ludoxel evidence.',
        ],
      },
      {
        id: 'starting-ludoxel-play-space-and-state-boundary',
        title: 'Play-Space and Saved-State Questions Begin After Launch',
        body: [
          'After the viewport is loaded and focused, the active surface controls the next interpretation. My World uses movement, camera control, hotbar state, inventory, block interaction, and world persistence. Othello uses board state, legal-move selection, side state, settings, board animation, and engine response. A loaded viewport showing the wrong surface identifies a play-space or restored-state condition; module-entry evidence remains in the launch chain.',
          [
            'The immediate operational continuations are ',
            {
              kind: 'link',
              label: 'Reading the Main Window',
              href: '/docs/manual/starting-the-application/window-and-item-surfaces/reading-the-main-window',
            },
            ' and ',
            {
              kind: 'link',
              label: 'Switching Play Spaces',
              href: '/docs/manual/starting-the-application/launch-and-space-selection/switching-play-spaces',
            },
            '. Camera behavior after a loaded viewport is governed by ',
            {
              kind: 'link',
              label: 'Changing Camera Preferences',
              href: '/docs/settings/visual-and-audio-settings/camera-and-crosshair/changing-camera-preferences',
            },
            ', not by the launch chain.',
          ],
          'Saved-state analysis begins only after `data_root` has been chosen and a later consumer has attempted to load the relevant state. A missing player name, absent world, unexpected Othello configuration, or lost inventory after a visible window exists is a persistence or play-space consequence. Starting Ludoxel ends when the desktop process has admitted the viewport; it does not absorb every later state discrepancy into startup.',
        ],
      },
    ],
    relatedTitles: [
      'Reading the Main Window',
      'Switching Play Spaces',
      'Changing Camera Preferences',
      'Writing a Problem Report',
      'Supplying Platform Evidence',
      'Supplying Logs Without Secrets',
      'Asking a Limited Question',
      'Separating Security Reports from Problem Reports',
      'Understanding Unsafe Public Content',
    ],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Starting the Application',
    group: 'Launch and Space Selection',
    title: 'Switching Play Spaces',
    description:
      'Traces the My World/Othello transition through `PlaySpaceContext`, `SessionManager`, pause-overlay signals, and the viewport controller. The accepted request replaces the active session reference, establishes a new loading cycle, resets upload and selection consumers, clears Othello controller transients, and preserves the two persisted payloads as separate schema branches under one normalized active-space selector.',
    sections: [
      {
        id: 'switching-play-spaces-context-authority',
        title: 'The Play-Space Context Retains Two Session Managers',
        body: [
          'The switch is a mutation of `PlaySpaceContext.active_space_id` and a replacement of the active `SessionManager` reference consumed by the viewport, beneath the route name, button label, or visual mode flag a reader might take it for. `PlaySpaceContext` constructs two independent session managers at startup: one for My World and one for Othello. Both sessions receive the same default block registry, but each session retains its own world, player entity, AI-player collection, revision sequence, and domain interpretation.',
          '`session_for` normalizes the requested id and returns the matching manager. `set_active_space` mutates the active id and returns the manager for that normalized id. A switch changes the already constructed session authoritative for the viewport. The inactive session remains intact in memory; each play-space persistence path retains its own state form across the switch.',
          '`all_sessions()` exposes the pair in a fixed My World/Othello order and `shutdown()` delegates shutdown to both managers. The active selector therefore controls viewport consumption, not the lifetime of a single global world object. A request containing an unknown value is first sent through `normalize_play_space_id`; only the normalized result reaches the manager lookup.',
          'A request for the already active normalized id takes the early return in `switch_play_space`; `resume=True` closes the pause overlay and refreshes runtime cadence, while the world, upload tracker, selection state, and Othello controller state remain in their current form. The no-op path establishes that a destination label alone does not trigger a session reload.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: '`PlaySpaceContext` constructs and retains separate My World and Othello sessions.',
            code: `@dataclass
class PlaySpaceContext:
  my_world: SessionManager
  othello: SessionManager
  active_space_id: str = PLAY_SPACE_MY_WORLD

  @staticmethod
  def create_default(seed: int = 0) -> "PlaySpaceContext":
    registry = create_default_registry()

    my_world = create_my_world_session(seed=int(seed), block_registry=registry)
    othello = create_othello_session(seed=int(seed), block_registry=registry)

    return PlaySpaceContext(my_world=my_world, othello=othello, active_space_id=PLAY_SPACE_MY_WORLD)`,
          },
          {
            language: 'py',
            caption: 'The active manager is selected by normalized space id; unknown ids fall back before lookup.',
            code: `def session_for(self, space_id: object) -> SessionManager:
  normalized = normalize_play_space_id(space_id)
  if normalized == PLAY_SPACE_OTHELLO:
    return self.othello
  return self.my_world

def set_active_space(self, space_id: object) -> SessionManager:
  normalized = normalize_play_space_id(space_id)
  self.active_space_id = normalized
  return self.session_for(normalized)`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-domain-construction',
        title: 'My World and Othello Are Constructed from Different Domain Seeds',
        body: [
          'The two sessions are built from different domain seeds. My World is created from `MyWorldSessionSeed` and `generate_test_map`; Othello is created from `OthelloSessionSeed`, a flat grass world, and `ensure_othello_board_layout`. Their spawn coordinates differ, their generated worlds differ, and Othello carries an additional board-layout requirement before it can serve as the Othello play surface.',
          'The shared `SessionManager` type is a runtime envelope, not an erasure of domain origin. Treating the switch as a mode toggle over one world misstates the implementation. The code creates two domain sessions first and later selects one active reference. The hidden session remains a session with its own world revision and actor state, not a dormant view over the active world.',
          '`make_session_manager` constructs each manager from a `SessionSettings` value, a `WorldState`, a `PlayerEntity`, and the registry. `SessionManager.__post_init__` then constructs its `InteractionService`, `GravitySystem`, and AI manager around that world and player. My World and Othello consequently begin with separate simulation envelopes even though `PlaySpaceContext.create_default` passes one default registry into both factories.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'My World is produced through the My World seed and test-map generator.',
            code: `MY_WORLD_SPAWN: tuple[float, float, float] = (0.0, 1.0, -10.0)

@dataclass(frozen=True)
class MyWorldSessionSeed:
  seed: int = 0
  spawn: tuple[float, float, float] = MY_WORLD_SPAWN
  yaw_deg: float = MY_WORLD_YAW_DEG
  pitch_deg: float = MY_WORLD_PITCH_DEG


def make_my_world_state(seed: int) -> WorldState:
  return generate_test_map(seed=int(seed))`,
          },
          {
            language: 'py',
            caption: 'Othello is produced from a flat world and then receives the Othello board layout.',
            code: `OTHELLO_SPAWN: tuple[float, float, float] = (0.0, 1.0, -12.0)


def _make_world() -> WorldState:
  world = generate_flat_world(half_extent=48, ground_y=0, block_id="minecraft:grass_block")
  ensure_othello_board_layout(world)
  return world


def create_othello_session(*, seed: int = 0, block_registry: BlockRegistry) -> SessionManager:
  spec = OthelloSessionSeed(seed=int(seed))
  return make_session_manager(seed=int(spec.seed), spawn=tuple(spec.spawn), yaw_deg=float(spec.yaw_deg), pitch_deg=float(spec.pitch_deg), world=_make_world(), block_registry=block_registry)`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-restoration-admission',
        title: 'Restoration Loads Both Spaces Before the Active Reference Is Chosen',
        body: [
          'Startup restoration does not load only the space that will be shown first. `apply_persisted_state_if_present` applies persisted settings to every session, restores My World from `state.my_world`, restores Othello from `state.othello_space`, repairs Othello board placement, lifts the Othello player above the board when required, restores overlap exemptions, normalizes runtime preferences, and then calls `sessions.set_active_space(runtime.current_space_id)`. The selected runtime reference is admitted only after both persisted branches have been projected back into their session managers.',
          '`SessionManager.set_active_space` makes the later visible switch non-destructive after startup. The dormant space is a session object whose persisted world, player, AI players, and, for Othello, `OthelloGameState`, have already been rehydrated or defaulted. The switch selects the runtime reference consumed by the viewport. Envelope validation and semantic correctness remain with the persistence paths for `state/player_state.json`, `state/world_state.json`, and the Othello payload.',
          '`AppState` carries `current_space_id`, `my_world`, and `othello_space` as separate fields alongside shared settings, inventory, and Othello settings. That schema shape preserves the split introduced by the session factories. A current-space value selects one branch for presentation after restoration; it does not serialize a conversion between `PersistedPlaySpace` and `PersistedOthelloSpace`.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Persistence restores both session branches before selecting the active space id.',
            code: `if state is not None:
  persisted_settings = state.settings
  for session in sessions.all_sessions():
    apply_persisted_settings_to_session(session, persisted_settings)

  runtime = runtime_preferences_from_app_state(state, runtime=runtime)

  _load_player_into_session(session=sessions.my_world, player=state.my_world.player, allow_flying=bool(runtime.creative_mode))
  _maybe_replace_world(sessions.my_world, state.my_world.world)
  sessions.my_world.set_ai_players(tuple(player.to_state() for player in state.my_world.ai_players))
  _restore_player_overlap_exemptions(sessions.my_world)

  _load_player_into_session(session=sessions.othello, player=state.othello_space.player, allow_flying=False)
  _maybe_replace_world(sessions.othello, state.othello_space.world)
  sessions.othello.set_ai_players(tuple(player.to_state() for player in state.othello_space.ai_players))
  ensure_othello_board_layout(sessions.othello.world)
  _lift_player_above_othello_board_if_needed(sessions.othello)
  _restore_player_overlap_exemptions(sessions.othello)
  othello_game_state = state.othello_space.othello_game_state.normalized()

runtime.normalize()
sessions.set_active_space(runtime.current_space_id)
apply_runtime_to_renderer(runtime, renderer)`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-pause-surface',
        title: 'The Pause Overlay Dispatches the Visible Switch Request',
        body: [
          'The visible switch command is exposed through the pause overlay. `PauseOverlay` declares separate signals for My World and Othello, wires them to the two menu buttons, and disables the button representing the current normalized space. That disabled state is a presentation guard: the overlay does not offer the active destination as a distinct operation.',
          'The viewport controller binds those signals to `switch_play_space` with `resume=True`. The command is therefore a pause-menu dispatch path. It exits the overlay when a same-space request is resumed or when a real switch is accepted. The pause origin matters because the controller resets held mouse actions, cancels route editing, and clears transition feedback before the active session reference changes.',
          '`PauseOverlay.keyPressEvent` maps Escape to `resume_requested`; destination buttons emit their own signals without embedding a session mutation. The widget records the enabled state for the two controls, while `bind_overlay_actions` supplies the controller callbacks. A displayed button therefore reports an available request path; `switch_play_space` remains the owner of the accepted transition.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The pause overlay exposes one signal per destination and disables the active destination button.',
            code: `play_my_world_requested = pyqtSignal()
play_othello_requested = pyqtSignal()

self._btn_my_world = QPushButton("Play My World", panel)
self._btn_my_world.clicked.connect(self.play_my_world_requested.emit)

self._btn_othello = QPushButton("Play Othello (Reversi)", panel)
self._btn_othello.clicked.connect(self.play_othello_requested.emit)


def set_current_space(self, space_id: str) -> None:
  normalized = normalize_play_space_id(space_id)
  self._btn_my_world.setEnabled(not is_my_world_space(normalized))
  self._btn_othello.setEnabled(not is_othello_space(normalized))`,
          },
          {
            language: 'py',
            caption: 'Pause-overlay signals are bound to the controller switch with resume enabled.',
            code: `viewport._overlay.play_my_world_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_MY_WORLD, resume=True))
viewport._overlay.play_othello_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_OTHELLO, resume=True))`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-controller-sequence',
        title: 'The Controller Switch Is an Ordered Mutation, Not a Visual Shortcut',
        body: [
          'The controller sequence is the operative switch. It first normalizes the requested space and short-circuits if the normalized value already equals `viewport._state.current_space_id`. A same-space request with `resume=True` resumes from the overlay and returns. It does not reload the world, rebind the renderer, rewrite saved state, or reinitialize the Othello controller.',
          'A real space change follows a fixed mutation order: compute the loading label; reset held mouse actions; cancel route editing; clear block-break particles; clear Othello transition state; write the normalized runtime id; normalize runtime preferences; replace `viewport._session` with `viewport._sessions.set_active_space(normalized)`; run learning-runtime flush and configuration against the post-swap active session reference; begin loading; update the pause-overlay current-space state; reset upload tracking against the new session world; invalidate the selection target; clear renderer selection; resynchronize hotbar, first-person target, Othello HUD, and gameplay-HUD visibility; optionally resume; request an Othello AI move if the destination state requires it; then schedule a widget update.',
          'The order corrects a common but false inference. The learning runtime is not flushed against the session being left by this code. The `_session` reference is replaced before `_learning_runtime.flush(viewport._session)` is called. The flush and configuration therefore address the new active session reference selected by `set_active_space`, not an invented departing-session hook.',
          'The controller writes the normalized id into `viewport._state`, calls `normalize()`, then replaces `viewport._session` before beginning loading. `WorldUploadTracker.reset` receives `viewport._session.world` after that replacement, and `settings_controller.sync_hotbar_widgets` plus `sync_first_person_target` read from the same active reference. Upload cadence, selected target, visible hotbar, and held-item projection therefore converge on one destination session before the next repaint request.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: '`switch_play_space` is the ordered mutation path for an accepted destination change.',
            code: `def switch_play_space(viewport: "RendererViewportWidget", space_id: str, *, resume: bool = False) -> None:
  normalized = normalize_play_space_id(space_id)
  if normalized == normalize_play_space_id(viewport._state.current_space_id):
    if resume:
      resume_from_overlay(viewport)
    return

  target_label = "Loading My World..." if normalized == PLAY_SPACE_MY_WORLD else "Loading Play Othello..."
  viewport._reset_held_mouse_actions()
  ai_controller.cancel_route_edit(viewport)
  viewport._clear_block_break_particles()
  othello_controller.clear_state_for_space_switch(viewport)
  viewport._state.current_space_id = normalized
  viewport._state.normalize()
  viewport._session = viewport._sessions.set_active_space(normalized)
  _learning_runtime = getattr(viewport, "_learning_runtime", None)
  if _learning_runtime is not None:
    _learning_runtime.flush(viewport._session)
    _learning_runtime.configure_session(viewport._session)
  viewport._begin_loading(target_label)
  viewport._overlay.set_current_space(normalized)
  viewport._upload.reset(viewport._renderer, world=viewport._session.world)
  viewport._invalidate_selection_target()
  viewport._renderer.clear_selection()
  settings_controller.sync_hotbar_widgets(viewport)
  settings_controller.sync_first_person_target(viewport)
  othello_controller.sync_hud_text(viewport)
  viewport._sync_gameplay_hud_visibility()

  if resume:
    resume_from_overlay(viewport)

  othello_controller.maybe_request_ai(viewport)
  viewport.update()`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-othello-volatile-state',
        title: 'Othello Volatile Controller State Is Cleared at the Boundary',
        body: [
          'Switching out of or into Othello requires more than changing a world reference. The Othello viewport controller carries transient analysis, AI request arming, hover-square state, render-state caches, title flashes, passive messages, opening-book learning progress, and animation settlement. `clear_state_for_space_switch` cancels or clears those volatile surfaces before the active session reference is exchanged.',
          'That cleanup resets the controller at the boundary where Othello-specific transient state would otherwise leak into a different visible space or survive as stale HUD evidence. The persisted Othello game is untouched: its board state remains governed by `PersistedOthelloSpace` and by the save/load path, while the cleanup removes only transient viewport state.',
          '`clear_state_for_space_switch` clears pending results, request arming, hover coordinates, HUD signatures, render cache keys, analysis values, book-learning progress, title flash, and passive message text. Those fields reside on the viewport controller; `AppState` carries the persisted Othello payload separately. The cleanup changes immediate controller memory and presentation eligibility while the schema field remains intact.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Othello controller state is cleared before the active session is exchanged.',
            code: `def clear_state_for_space_switch(viewport: "RendererViewportWidget") -> None:
  viewport._othello_ai.cancel_book_learning(emit_ready=False)
  viewport._othello_match.settle_animations()
  viewport._pending_othello_ai_result = None
  viewport._othello_ai_request_armed = False
  viewport._othello_hover_square = None
  viewport._othello_hud_signature = None
  viewport._othello_render_state_cache_key = None
  viewport._othello_render_state_cache = None
  viewport._othello_analysis = OthelloAnalysis().normalized()
  viewport._othello_analysis_request_signature = None
  viewport._othello_book_learning_running = False
  viewport._othello_book_learning_status_text = ""
  viewport._othello_book_learning_progress = None
  clear_title_flash(viewport)
  viewport._last_othello_message = ""`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-loading-renderer-hud',
        title: 'Loading, Upload, Selection, and HUD State Follow the New Active Session',
        body: [
          'The visible transition includes the labels `Loading My World...` and `Loading Play Othello...` with frame-sync loading state. `_begin_loading` resets held mouse actions, clears block-break particles, publishes loading status text, resynchronizes gameplay-HUD visibility, pauses cloud motion through settings synchronization, emits the loading-state signal when the transition becomes active, and requests repaint. The host `GameScreen` displays the status overlay while `loading_active()` is true and hides it when loading finishes.',
          'After `_session` is replaced, the upload tracker is reset with `world=viewport._session.world`, the previous selection target is invalidated, and renderer selection is cleared. These operations prevent a target, chunk-upload schedule, or selected outline from surviving under the wrong session token or wrong world revision. HUD state is then recomputed from the destination space: Othello can suppress ordinary block-gameplay HUD surfaces, while My World can expose them again.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Beginning a transition publishes loading state and resynchronizes pause-sensitive surfaces.',
            code: `def _begin_loading(self: "RendererViewportWidget", text: str) -> None:
  became_active = self._frame_sync.loading.begin()
  self._reset_held_mouse_actions()
  self._clear_block_break_particles()
  self._set_loading_status(text)
  self._sync_gameplay_hud_visibility()
  settings_controller.sync_cloud_motion_pause(self)
  if bool(became_active):
    self.loading_state_changed.emit(True)
  self.update()`,
          },
          {
            language: 'py',
            caption: 'Selection cadence is keyed by current space id and world revision.',
            code: `def _selection_due(self: "RendererViewportWidget", *, eye: Vec3, yaw_deg: float, pitch_deg: float) -> bool:
  current_space_id = str(self._state.current_space_id)
  current_world_revision = int(self._session.world.revision)
  if self._frame_sync.selection.world_revision_changed(world_revision=int(current_world_revision)):
    self._arm_world_change_sync()
  return self._frame_sync.selection.due(
    eye=eye,
    yaw_deg=float(yaw_deg),
    pitch_deg=float(pitch_deg),
    current_space_id=str(current_space_id),
    current_world_revision=int(current_world_revision),
    target_present=(self._selection_state.target() is not None),
    is_othello_space=bool(self._state.is_othello_space()),
  )`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-persistence-boundary',
        title: 'Persistence Stores the Selector and the Separate Space Payloads',
        body: [
          'Saving records the normalized active selector and the two separate space payloads. `save_state` writes `current_space_id=normalize_play_space_id(state_runtime.current_space_id)`, serializes `sessions.my_world` into `PersistedPlaySpace`, and serializes `sessions.othello` into `PersistedOthelloSpace`. The selector answers which session should be active at the next admission point; it does not collapse the stored payloads into one shared world.',
          'The switch sequence ends at the runtime boundary between visible space selection and persisted state. It identifies which session is active, which pause-overlay command invoked the change, which upload and selection state was invalidated, and which HUD or Othello transient state was resynchronized. The persisted envelopes stay unread as evidence here: their stored content, the correctness of a saved-preference, saved-world, or saved-Othello payload, and any claim of data loss, data duplication, support admissibility, or license authority are settled by the save/load path and the governing policy, not by a switching observation.',
          'A pause-menu selection reports the controller path, normalized destination, loading state, and post-switch presentation reset. It cannot establish that a subsequent save reached disk or that a previous payload was semantically correct. `AppState` and its nested persisted branches are the data model; controller-side selection supplies the runtime choice that a later save operation may record.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Save state writes the normalized selector and separate My World/Othello payloads.',
            code: `state = AppState(
  current_space_id=normalize_play_space_id(state_runtime.current_space_id),
  settings=settings,
  inventory=inventory,
  othello_settings=state_runtime.othello_settings.normalized(),
  my_world=PersistedPlaySpace(
    player=_persisted_player_from_session(sessions.my_world, allow_flying=bool(state_runtime.creative_mode)),
    world=_persisted_world_from_session(sessions.my_world),
    ai_players=tuple(PersistedAiPlayer.from_state(player_state) for player_state in sessions.my_world.ai_states()),
  ),
  othello_space=PersistedOthelloSpace(
    player=_persisted_player_from_session(sessions.othello, allow_flying=False),
    world=_persisted_world_from_session(sessions.othello),
    othello_game_state=persisted_othello_state,
    ai_players=tuple(PersistedAiPlayer.from_state(player_state) for player_state in sessions.othello.ai_states()),
  ),
)`,
          },
        ],
      },
    ],
    relatedTitles: ['Starting Ludoxel', 'Using the Hotbar', 'Reading Saved Preferences', 'Reading Saved World State', 'Reading Saved Othello State'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Starting the Application',
    group: 'Window and Item Surfaces',
    title: 'Reading the Main Window',
    description:
      'Maps the Ludoxel window to its concrete presentation owners: the backend-selected viewport, `HUDWidget`, loading `StatusOverlayFrame`, hotbar and health surfaces, and modal overlays. Each region receives or blocks input through a defined Qt surface; controller signals and synchronization paths deliver renderer and session data into the window, while visible labels consume their presentation values.',
    sections: [
      {
        id: 'reading-the-main-window-composition',
        title: 'The Game Screen Stacks a Viewport and a HUD',
        body: [
          '`GameScreen` is the central widget of the main window. It places a platform-specific viewport widget in a zero-margin vertical layout and creates a HUD widget that is driven from the viewport. The viewport renders the world; the HUD is layered above it and receives payloads through a signal connection.',
          'On macOS the viewport is the wgpu-backed renderer widget; on every other platform it is the OpenGL widget. Both present the same game surface to the player, so what you see in the central region is renderer output, and the labels drawn over it are HUD elements, not the underlying simulation or save data.',
          '`GameScreen` constructs the selected viewport with `project_root`, `resource_root`, `data_root`, and the launch player name, then passes `HudPayload` values through `hud_updated.connect(self.hud.set_payload)`. The platform branch selects a widget class; it does not prove backend equivalence beyond this shared host wiring. The displayed scene and the text labels arrive through different consumers inside the same central widget stack.',
          '`HUDWidget` itself is transparent to mouse events, has no system background, and creates two plain-text labels. It calculates their available panel width from the window width, then places a left label and optional right label. This root HUD surface provides an overlay for payload text; it receives no keyboard focus and carries no direct overlay-navigation actions.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The game screen wires the viewport to the HUD and selects the backend by platform.',
            code: `if sys.platform == "darwin":
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget as ViewportWidget
else:
  from ludoxel.presentation.interface.viewport.widgets.gl import GLViewportWidget as ViewportWidget

self.viewport = ViewportWidget(project_root=self.project_root, resource_root=self.resource_root, data_root=self.data_root, launch_player_name=launch_player_name)
self.hud = HUDWidget()
self.viewport.set_hud(self.hud)
self.viewport.hud_updated.connect(self.hud.set_payload)`,
          },
        ],
      },
      {
        id: 'reading-the-main-window-preparing-overlay',
        title: 'The Preparing Overlay Covers the Surface While Loading',
        body: [
          'A `StatusOverlayFrame` is created over the game screen with the title "Ludoxel" and status text "Preparing viewport...". It is sized to the full screen, raised above the viewport, and shown whenever the viewport reports active loading. When loading finishes it hides and hands focus to the viewport.',
          'If this overlay is visible, the central region is not yet interactive. The overlay tracks the viewport loading state and status text through signals, so the status line can change while the surface is still preparing. A visible preparing overlay is a load-in-progress state, distinct from a finished, input-accepting viewport.',
          'The viewport event handlers accept and return while `loading_active()` holds, covering keyboard, wheel, button, and mouse-move entry points. `GameScreen` then hides the overlay on `loading_finished` and queues focus with `QTimer.singleShot(0, ...)`. Overlay visibility, event admission, and focus transfer form one load-state transition; the status frame itself contains neither a session manager nor renderer command path.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The overlay follows viewport loading state and resizes with the screen.',
            code: `self._loading_overlay.setVisible(bool(self.viewport.loading_active()))
self.viewport.loading_state_changed.connect(self._handle_loading_state_changed)
self.viewport.loading_status_changed.connect(self._loading_overlay.set_status_text)
self.viewport.loading_finished.connect(self._handle_loading_finished)

def resizeEvent(self, e) -> None:
  super().resizeEvent(e)
  self._loading_overlay.setGeometry(0, 0, max(1, self.width()), max(1, self.height()))`,
          },
        ],
      },
      {
        id: 'reading-the-main-window-hud-layers',
        title: 'HUD Elements Are Layered, Not Part of the World',
        body: [
          'The HUD draws on top of renderer output: the hotbar and its health strip near the bottom, the crosshair at the center, and text payloads supplied by the viewport. AI status tags and debug metrics are also HUD layers. None of these own simulation rules; they display values produced elsewhere.',
          'The HUD payload is a small frozen dataclass with left and right text fields, pushed from the viewport via `hud_updated`. Reading a number off the HUD is reading a presentation label, so a wrong HUD value is a display question, while a wrong saved value is a persistence question handled by the data pages.',
          '`HUDWidget.set_payload` coerces an incoming payload into left and right strings and returns early when both strings match the prior values. Its relayout code sizes labels from their text and current widget bounds. The HUD owns text placement and truncation behavior; it does not mutate the `SessionManager`, `RuntimePreferences`, block registry, or persisted envelopes that produced values upstream.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The HUD payload is a presentation value object, separate from saved state.',
            code: `@dataclass(frozen=True, slots=True)
class HudPayload:
  left_text: str
  right_text: str = ""

  @property
  def text(self) -> str:
    return str(self.left_text)`,
          },
        ],
      },
      {
        id: 'reading-the-main-window-hotbar-strip',
        title: 'The Hotbar and Health Strip Sit at the Bottom',
        body: [
          'The hotbar widget centers a fixed row of nine slots near the bottom of the screen, with a pixel-art health strip positioned just above it. The hotbar is transparent to mouse events; it reflects the selected slot and item icons but does not capture clicks, so pointer input passes through to the captured viewport.',
          'The health strip is only visible when the active mode shows health. It draws hearts from a fixed bitmap mask scaled to the strip width, filling proportionally to the current health relative to the maximum. Both surfaces are positioned in code, while their colors and styling come from the theme.',
          '`HotbarWidget.set_status` forwards `show_health`, `health`, and `max_health` into `_HealthStrip`; `_HealthStrip.set_state` clamps displayed health into the supplied maximum and requests repaint. The input-transparent attributes on both `HotbarWidget` and its display slots preserve pointer delivery to the viewport. A highlighted slot or heart fill therefore supplies presentation feedback without becoming a clickable inventory editor.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The hotbar centers its panel and places the health strip above it.',
            code: `def _layout_children(self) -> None:
  pw = int(self._panel.sizeHint().width())
  ph = int(self._panel.sizeHint().height())
  x = max(0, (int(self.width()) - pw) // 2)
  y = max(0, int(self.height()) - ph - 18)
  self._panel.setGeometry(x, y, pw, ph)

  hh = int(self._health_strip.sizeHint().height())
  hy = max(0, int(y) - hh - 8)
  self._health_strip.setGeometry(int(x), int(hy), int(pw), int(hh))`,
          },
        ],
      },
      {
        id: 'reading-the-main-window-modal-overlays',
        title: 'Modal Surfaces Temporarily Take Focus',
        body: [
          'Inventory, pause, settings, death, AI settings, and Othello settings are overlay widgets that temporarily take input focus over the viewport. While one is open, gameplay input is blocked, and the overlay reads and writes through controllers connected to application state.',
          'These surfaces sit above the viewport in the same window. Which overlay is open determines what a key press or click does next, so when describing the window state it matters whether the central viewport is live or whether an overlay such as the inventory or pause menu currently owns input.',
          '`RendererViewportWidget` creates `PauseOverlay`, `SettingsOverlay`, `OthelloSettingsOverlay`, `DeathOverlay`, and `InventoryOverlay`, then places their references in `ViewportOverlays`. The event path checks modal and capture state before treating mouse motion as gameplay input. A window screenshot can identify an overlay surface; it cannot show the controller mutation that led there unless the corresponding runtime state and signal path are also observed.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Opening the pause menu closes other overlays before it takes focus.',
            code: `def open_pause_menu(viewport):
  if viewport._overlays.dead():
    return
  if viewport._overlays.inventory_open():
    viewport._set_inventory_overlay(False)
  if viewport._overlays.settings_open():
    back_from_settings(viewport)
  viewport._overlay.set_current_space(viewport._state.current_space_id)
  viewport._set_paused_overlay(True)`,
          },
        ],
      },
      {
        id: 'reading-the-main-window-death-overlay',
        title: 'The Death Overlay Replaces Interaction With a Respawn Prompt',
        body: [
          'When the player dies, the death overlay shows a "YOU DIED" panel with a message line and a Respawn button. While it is visible the pause menu cannot be opened, so this surface takes priority over the other overlays.',
          'The message text is set from the cause of death and defaults to "Player died." The Respawn button emits a single request that the controller turns into a respawn. Its presence identifies the session’s dead state.',
          '`DeathOverlay` owns the title label, message label, and `respawn_requested` signal. `bind_overlay_actions` connects that signal to `respawn(viewport)`, where the active `SessionManager` resets the player and the controller clears selection plus held mouse actions. The button identifies a recovery entry point; its label does not describe the world, inventory, or save operation performed elsewhere.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The death overlay exposes a respawn request and a settable message.',
            code: `class DeathOverlay(QWidget):
  respawn_requested = pyqtSignal()

  def set_message(self, text: str) -> None:
    body = str(text).strip()
    if not body:
      body = "Player died."
    self._message.setText(body)`,
          },
        ],
      },
      {
        id: 'reading-the-main-window-background',
        title: 'The Game Screen Has a Solid Background',
        body: [
          'The game screen sets a styled dark background before and around viewport content. A narrow object-name selector applies the background color to the game-screen widget itself.',
          'Because the central widget paints its own `#121212` background under the viewport, the window never shows desktop bleed-through: the viewport renders over the solid background, and the HUD and overlays stack above it. The visible window is therefore a deliberate stack of solid background, renderer output, HUD, and any active overlay.',
          'The background declaration belongs to `GameScreen` and executes before the backend viewport is inserted into its zero-margin layout. It supplies a host-widget paint surface around renderer content. The declaration provides no information about world geometry, scene clear color, backend shader state, or the composition timing of HUD and overlays beyond their shared parent widget.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The game screen paints a solid background under the viewport.',
            code: `self.setObjectName("gameScreen")
self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
self.setStyleSheet("QWidget#gameScreen { background: #121212; }")`,
          },
        ],
      },
    ],
    relatedTitles: ['Using the Hotbar', 'Using the Inventory Overlay', 'Understanding Overlay Input Blocking'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Starting the Application',
    group: 'Window and Item Surfaces',
    title: 'Using the Hotbar',
    description:
      'Defines the nine-slot hotbar as normalized simulation state consumed by keybind dispatch, interaction resolution, first-person targeting, and a transparent HUD projection. Direct index selection, wrapped wheel cycling, assignment, clearing, item-id resolution, tooltip derivation, and photo refresh each pass through explicit owners before the visible slot row changes.',
    sections: [
      {
        id: 'using-the-hotbar-nine-slots',
        title: 'The Hotbar Has Exactly Nine Slots',
        body: [
          'The hotbar size is fixed at nine. Slot contents are normalized to a tuple of nine item-id strings, padding with empty strings and truncating extras, so the hotbar always has a well-defined width regardless of what was loaded or assigned.',
          'Each slot holds an item id or the empty string for an empty hand. The selected index is normalized into the valid range, with out-of-range values clamped to the nearest endpoint.',
          '`normalize_hotbar_slots` accepts a `Sequence[object] | None`, converts non-null entries to stripped strings, pads short input, and truncates excess entries. `default_hotbar_slots` calls that function with `None`. The fixed tuple shape is the hotbar contract consumed by settings synchronization and visible slot widgets; raw list length carries no independent gameplay meaning after normalization.',
          '`hotbar_panel_width` derives a panel width from slot count, 46-pixel slot sides, and 6-pixel gaps; `centered_hotbar_panel_geometry` applies the 18-pixel bottom margin. `HotbarWidget._layout_children` follows the same dimensions while placing the health strip eight pixels above the panel. These layout constants determine screen placement alone and never index or mutate a hotbar item tuple.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Slot contents and the selected index are normalized to the fixed hotbar width.',
            code: `HOTBAR_SIZE: int = 9


def normalize_hotbar_index(index: int, *, size: int = HOTBAR_SIZE) -> int:
  width = int(max(1, int(size)))
  try:
    idx = int(index)
  except Exception:
    idx = 0
  return max(0, min(width - 1, idx))`,
          },
        ],
      },
      {
        id: 'using-the-hotbar-number-keys',
        title: 'Number Keys 1-9 Select Slots',
        body: [
          'Each hotbar slot has its own bound action, named for its one-based slot number. The default bindings map the digit keys 1 through 9 directly onto the nine slots, so pressing a number selects the matching slot.',
          'These are real keybinds, resolved through the same keybind settings as movement and other actions. Because hotbar actions are distinguished from ordinary actions, the input path never confuses a slot selection with another bound key.',
          '`KeybindSettings` stores an action-to-binding map and builds the inverse key-to-action map after normalizing names and duplicate bindings. `hotbar_index_for_action` maps only the `HOTBAR_ACTIONS` sequence back to a zero-based slot index. A changed keybind therefore changes action resolution first; the hotbar receives an index only after that action-level admission.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Hotbar slot actions and their default digit bindings.',
            code: `HOTBAR_ACTIONS = tuple(f"hotbar_slot_{int(index) + 1}" for index in range(9))

for _index, _action in enumerate(HOTBAR_ACTIONS, start=1):
  DEFAULT_KEYBINDS[_action] = str(int(_index))`,
          },
        ],
      },
      {
        id: 'using-the-hotbar-scroll-cycle',
        title: 'The Mouse Wheel Cycles the Selection',
        body: [
          'The selection can also be moved by a number of steps, which is how the mouse wheel changes slots. Cycling wraps around the nine slots using modular arithmetic, so scrolling past the last slot returns to the first and scrolling before the first moves to the last.',
          'A step of zero leaves the selection unchanged. This wrap-around behavior is intentionally different from the clamping used for direct index selection, because cycling is meant to be continuous.',
          '`cycle_hotbar_index` first clamps the existing selected index through `normalize_hotbar_index`, then applies `delta_steps` with `% width`. The source distinguishes the two operations by their inputs: direct selection admits a destination index, while wheel movement applies a signed displacement to an existing valid selection. The function changes an index value only; item contents remain untouched.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Cycling the hotbar index wraps around the nine slots.',
            code: `def cycle_hotbar_index(selected_index: int, delta_steps: int, *, size: int = HOTBAR_SIZE) -> int:
  width = int(max(1, int(size)))
  idx = normalize_hotbar_index(int(selected_index), size=width)
  step = int(delta_steps)
  if step == 0:
    return idx
  return int((idx + step) % width)`,
          },
        ],
      },
      {
        id: 'using-the-hotbar-held-item',
        title: 'The Held Item Comes From the Selected Slot',
        body: [
          'The currently held item is the content of the selected slot. The resolver normalizes the slots and index, reads the item id at the selected slot, and returns it, or returns nothing when that slot is empty.',
          '`current_hotbar_block_id` supplies the single hotbar read used by the first-person held-item visual and placement logic. An empty selected slot resolves to an empty hand, which removes the held-block visual and provides no block to placement.',
          '`SessionManager.place_block` delegates placement through `application/sessions/managers/interactions.py` into its session interaction service, accepting a `block_id` argument supplied by the active hotbar path. The resolver returns `None` for an empty value before that call. A selected icon alone carries no placement authority; the downstream interaction service receives the resolved id and applies its own target and rule checks.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The held block id is read from the selected, normalized slot.',
            code: `def current_hotbar_block_id(slots, selected_index, *, size: int = HOTBAR_SIZE) -> str | None:
  norm = normalize_hotbar_slots(slots, size=int(size))
  idx = normalize_hotbar_index(int(selected_index), size=int(size))
  bid = str(norm[idx]).strip()
  return bid if bid else None`,
          },
        ],
      },
      {
        id: 'using-the-hotbar-assign-and-clear',
        title: 'Slots Can Be Assigned and Cleared',
        body: [
          'A slot can be set to a specific item id, or cleared by assigning nothing. Assignment normalizes the existing slots first, replaces the chosen index, and returns a new tuple, leaving the other slots untouched. Passing nothing as the item produces an empty slot.',
          'The default "Clear Selected Slot" action is bound to Q. It empties the selected slot, which is the quick way to return a slot to an empty hand without opening the inventory.',
          '`with_hotbar_assignment` is a pure tuple transformation. It neither writes a persistence store nor updates a Qt widget. Controller code must install the returned value into runtime state, then call hotbar and first-person synchronization consumers before the window reflects the assignment. The clear action uses the same state path with an empty item value.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Assigning a slot replaces only the chosen index.',
            code: `def with_hotbar_assignment(slots, index, block_id, *, size: int = HOTBAR_SIZE):
  out = list(normalize_hotbar_slots(slots, size=int(size)))
  idx = normalize_hotbar_index(int(index), size=int(size))
  out[idx] = "" if block_id is None else str(block_id).strip()
  return tuple(out)`,
          },
        ],
      },
      {
        id: 'using-the-hotbar-display-widget',
        title: 'The HUD Hotbar Is a Display Mirror',
        body: [
          '`HotbarWidget` projects simulation hotbar state into nine fixed-size display slots. It marks the root and child slots transparent to mouse events, receives normalized contents plus selected index through `sync_hotbar`, and renders icons and tooltips without accepting an assignment request.',
          'When synchronized, the widget normalizes the incoming slots and index exactly as the simulation does, then sets each slot button to the matching item, tooltip, and selected state. Item icons are supplied asynchronously by a photo provider and updated as they become available.',
          '`apply_item_slot_state` writes the Qt properties `itemId` and `selected`, tooltip text, and the current pixmap before refreshing widget style. `_DisplaySlot` has `Qt.NoFocus` and the arrow cursor, while the hotbar root is also input-transparent. The visual selected border thus follows a synchronized index and remains outside keyboard focus and mouse dispatch.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The display hotbar synchronizes its slots from normalized simulation values.',
            code: `def sync_hotbar(self, *, slots, selected_index: int) -> None:
  norm = normalize_hotbar_slots(slots, size=HOTBAR_SIZE)
  idx = normalize_hotbar_index(selected_index, size=HOTBAR_SIZE)
  for i, btn in enumerate(self._slots):
    item_id = str(norm[i]).strip()
    self._slot_item_ids[i] = str(item_id)
    btn.set_slot_state(item_id=item_id, tooltip=hotbar_slot_tooltip(self._registry, slot_index=i, item_id=item_id), selected=(int(i) == int(idx)), photos=self._photos)`,
          },
        ],
      },
      {
        id: 'using-the-hotbar-tooltips',
        title: 'Slot Tooltips Name the Item',
        body: [
          'Each display slot carries a tooltip generated from the block registry for the slot index and item id. An empty slot reports an empty hand; a filled slot reports the item it holds. The tooltip text is derived, not stored, so it always reflects the current slot content.',
          'Because the tooltip is computed from the registry, it stays consistent with the item icons. When the photo provider reports a new icon for an item, the matching slots are re-synced so icon and tooltip update together.',
          '`ItemPhotoProvider.pixmap_for_item` first parses a state string to its base id, then checks the cache, special-item descriptors, registered block definition, animated thumbnail, static thumbnail, and item texture paths in that order. Missing descriptors or files produce `None`. The hotbar can therefore present an empty icon surface while retaining the normalized item id and registry-derived tooltip; source availability controls the image result.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A new item icon re-syncs every slot that holds that item.',
            code: `def _on_item_pixmap_changed(self, item_id: str) -> None:
  normalized = str(item_id).strip()
  if not normalized:
    return
  for index, btn in enumerate(self._slots):
    if str(self._slot_item_ids[index]).strip() != normalized:
      continue
    btn.set_slot_state(item_id=normalized, tooltip=hotbar_slot_tooltip(self._registry, slot_index=index, item_id=normalized), selected=bool(btn.property("selected")), photos=self._photos)`,
          },
        ],
      },
    ],
    relatedTitles: ['Using the Inventory Overlay', 'Understanding Application Output'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Starting the Application',
    group: 'Window and Item Surfaces',
    title: 'Using the Inventory Overlay',
    description:
      'Defines the inventory as a focus-taking overlay whose creative catalog is assembled from `BlockRegistry` and catalog-visible special-item descriptors. Search, click, drag, and numeric assignment emit requests through overlay-navigation and settings controllers; the active hotbar state mutates only after that controller path admits the request.',
    sections: [
      {
        id: 'using-the-inventory-overlay-toggle',
        title: 'The Inventory Opens With E and Closes With E or Escape',
        body: [
          'The inventory is bound to the toggle-inventory action, which defaults to E. Inside the overlay, the same bound action or the Escape key closes it. Closing emits a closed signal so the controller can hide the overlay and re-arm the viewport.',
          'While the overlay is open it holds input focus, so the keys that would otherwise move the player are interpreted by the overlay. Opening the inventory therefore enters a held-focus state that routes the movement keys to the overlay until E or Escape closes it, a deliberate state change beyond a transient popup.',
          '`InventoryOverlay.setVisible` clears the hover id and search text when the surface hides. When a visible creative inventory opens, it focuses and selects the search box with `PopupFocusReason`. The controller receives the `closed` signal and calls `_set_inventory_overlay(False)` followed by `arm_resume_refresh`, so visibility, input focus, capture recovery, and repaint eligibility are coordinated through the overlay path.',
          '`BlockRegistry.register` rejects mutation after sealing, empty ids, and duplicate ids; `create_default_registry` builds its default catalog once behind a lock and seals it before reuse. Inventory construction reads `all_blocks()` from that registry. The overlay can order and display registered definitions, yet it holds no path that extends the registry from a catalog search or drag operation.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The bound inventory action or Escape closes the overlay.',
            code: `bound_action = action_for_key(int(key), self._keybinds)
if bound_action == ACTION_TOGGLE_INVENTORY or key == int(Qt.Key.Key_Escape):
  self._close()
  e.accept()
  return`,
          },
        ],
      },
      {
        id: 'using-the-inventory-overlay-modes',
        title: 'Creative and Survival Modes Show Different Panels',
        body: [
          'In creative mode the overlay is titled "CREATIVE INVENTORY" and shows the searchable item catalog and search box. In survival mode it is titled "SURVIVAL INVENTORY", hides the catalog and search, and states that creative item selection is unavailable.',
          'The creative-mode toggle defaults to B. Switching modes changes the title, the subtitle instructions, and whether the catalog grid and search box are visible, while the hotbar row at the bottom remains in both modes.',
          '`set_creative_mode` clears the hovered catalog item and search query on the survival branch, hides both catalog surfaces, and keeps the overlay’s normalized hotbar slots intact. The mode changes a presentation and controller admission condition; it does not manufacture a new item catalog, alter the block registry, or write a saved hotbar branch by itself.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Survival mode hides the creative catalog and search.',
            code: `if bool(self._creative_mode):
  self._title_label.setText("CREATIVE INVENTORY")
  self._search_box.setVisible(True)
  self._catalog_scroll.setVisible(True)
  self._apply_filter()
  return

self._title_label.setText("SURVIVAL INVENTORY")
self._subtitle_label.setText("Creative item selection is unavailable in Survival Mode.")
self._search_box.setVisible(False)
self._catalog_scroll.setVisible(False)`,
          },
        ],
      },
      {
        id: 'using-the-inventory-overlay-catalog',
        title: 'The Item Grid Is Built From Blocks and Special Items',
        body: [
          'The catalog is assembled from every block in the block registry plus every special item in the special-item catalog. Each entry becomes a draggable button with an icon and a search key built from its display name and id, and special items add their description to the search key.',
          'The grid is laid out twelve columns wide. Registry and catalog entries determine the inventory’s item set at runtime.',
          '`BlockRegistry.all_blocks` returns definitions sorted by block id. `iter_catalog_special_items` filters descriptors by `catalog_visible`, while the special-item registry joins core and Othello descriptor sources under normalized ids. The inventory’s item list is therefore a projection of the active registry and catalog-visible descriptors. A raw item-id string absent from those owners has no catalog button generated here.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Blocks and special items are both added to the inventory grid.',
            code: `for block_def in self._reg.all_blocks():
  item_id = str(block_def.block_id)
  display_name = str(block_def.display_name)
  button = _InventoryItemButton(item_id, display_name, self)
  self._slot_entries.append((str(item_id), f"{display_name.casefold()} {item_id.casefold()}", button))

for descriptor in iter_catalog_special_items():
  item_id = str(descriptor.item_id)
  display_name = str(descriptor.display_name)
  button = _InventoryItemButton(item_id, display_name, self)
  search_key = f"{display_name.casefold()} {item_id.casefold()} {str(descriptor.description).casefold()}"
  self._slot_entries.append((str(item_id), search_key, button))`,
          },
        ],
      },
      {
        id: 'using-the-inventory-overlay-search',
        title: 'The Search Box Filters by Name and Id',
        body: [
          'The search box filters the catalog by splitting the query into tokens and keeping only entries whose search key contains every token. The search key is case-folded name, id, and (for special items) description, so a partial name or id narrows the grid.',
          'While the search box has focus it takes priority: typing edits the query, and only Escape is treated specially to close the overlay. This keeps number keys and other shortcuts from firing while you are typing a search.',
          '`_apply_filter` removes the current grid layout entries, hides their widgets, then re-adds matching buttons across twelve columns. It also clears `_hovered_item_id` when its item falls outside the filtered id set. Search reshapes the visible catalog and hover candidate; it never assigns an item until a click, drop, or numeric branch emits a controller-facing signal.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Every query token must be present in an entry to keep it visible.',
            code: `query_text = str(self._search_box.text() or "").strip().casefold()
tokens = tuple(token for token in query_text.split() if token)
matching_entries = [entry for entry in self._slot_entries if all(token in entry[1] for token in tokens)]`,
          },
        ],
      },
      {
        id: 'using-the-inventory-overlay-assign',
        title: 'Click, Drag, or Press a Number to Assign',
        body: [
          'There are three ways to put an item into the hotbar. Clicking an item assigns it to the currently selected hotbar slot. Dragging an item onto a specific hotbar slot assigns it there. Hovering an item and pressing 1-9 assigns it to that numbered slot. Each path emits a hotbar-assignment signal that the controller applies.',
          'The hotbar row inside the overlay is itself made of slots that accept drops and report selection. Dropping an item both assigns the slot and selects it, so a drag leaves that slot active.',
          '`DraggableItemButton` creates `application/x-ludoxel-block-id` MIME data and executes a copy drag. `_HotbarSlotButton.dropEvent` decodes that MIME payload, emits `item_dropped`, emits `slot_selected`, and accepts the proposed action. The widget transfers an item id and target slot index; overlay-navigation and settings controllers remain responsible for installing the resulting runtime hotbar value.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Hovering an item and pressing a number assigns it to that slot.',
            code: `idx = hotbar_index_from_key(key, self._keybinds)
if idx is not None:
  self.hotbar_slot_selected.emit(int(idx))
  if bool(self._creative_mode) and self._hovered_item_id is not None:
    self.hotbar_slot_assigned.emit(int(idx), str(self._hovered_item_id))
  e.accept()
  return`,
          },
        ],
      },
      {
        id: 'using-the-inventory-overlay-signals',
        title: 'The Overlay Edits Hotbar State Through Signals',
        body: [
          'The overlay does not write hotbar state directly. It emits item-selected, hotbar-slot-selected, and hotbar-slot-assigned signals, which the overlay-navigation controller connects to the settings controller. A creative selection sets the active slot to the chosen item and re-syncs the hotbar and first-person target.',
          'The emitted signals route inventory hotbar changes through the controller. The controller evaluates permission, including the creative-mode condition, before applying the change.',
          '`bind_overlay_actions` connects `item_selected`, `hotbar_slot_selected`, and `hotbar_slot_assigned` separately. `on_inventory_selected` checks both `viewport._state.creative_mode` and `settings_controller.inventory_available(viewport)` before mutating the active slot; assignment and selection use their dedicated settings-controller functions. The signal graph gives click, hover-plus-number, and drag operations a common runtime consumer without giving the overlay direct access to the session state object.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A creative inventory selection is applied to the active hotbar slot by the controller.',
            code: `def on_inventory_selected(viewport, item_id: str) -> None:
  if not bool(viewport._state.creative_mode) or not settings_controller.inventory_available(viewport):
    return
  active_index = viewport._state.active_hotbar_index()
  viewport._state.set_hotbar_slot(int(active_index), str(item_id))
  settings_controller.sync_hotbar_widgets(viewport)
  settings_controller.sync_first_person_target(viewport)`,
          },
        ],
      },
      {
        id: 'using-the-inventory-overlay-icons',
        title: 'Item Icons Load Asynchronously',
        body: [
          'Item icons are provided by a photo provider that becomes active only while the overlay is visible in creative mode. As icons become available the overlay updates the matching catalog buttons and re-syncs the hotbar row, so icons can appear shortly after the grid is shown.',
          'Because the provider is deactivated when the overlay is hidden, the inventory does not keep generating icons in the background. This keeps icon work tied to the time the catalog is actually on screen.',
          '`ItemPhotoProvider` owns caches for static pixmaps, animated pixmaps, and `QMovie` instances. `set_active` and `set_animations_enabled` synchronize each movie’s playback state; an inactive provider stops a movie, jumps to frame zero, updates its cache, and emits the item id. The visible grid and hotbar row consume those emissions through `_on_item_pixmap_changed`, while registry membership and hotbar assignment remain unchanged.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The icon provider activates only while the creative catalog is visible.',
            code: `def setVisible(self, visible: bool) -> None:
  normalized_visible = bool(visible)
  super().setVisible(normalized_visible)
  self._photos.set_active(normalized_visible and bool(self._creative_mode))`,
          },
        ],
      },
    ],
    relatedTitles: ['Using the Hotbar', 'Understanding Overlay Input Blocking', 'Reading the Main Window'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Controlling the Session',
    group: 'Camera and Capture',
    title: 'Looking Around',
    description:
      'Traces relative pointer movement through `ViewportInput`, `QtInputAdapter`, session stepping, `PlayerEntity`, and third-person camera resolution. Mouse deltas become sensitivity-scaled yaw and pitch deltas in the fixed-step input; the player owns the resulting orientation, the pitch clamp bounds it, and renderer cameras consume the established pose.',
    sections: [
      {
        id: 'looking-around-relative-delta',
        title: 'Looking Uses Relative Mouse Deltas',
        mediaBlocks: [
          {
            kind: 'video',
            sources: [
              {
                src: '/assets/videos/looking-around-relative-delta.mp4',
                type: 'video/mp4',
              },
            ],
            controls: false,
            loop: true,
            autoPlay: true,
            muted: true,
            playsInline: true,
          },
        ],
        body: [
          'Camera rotation is driven by relative mouse movement, not the absolute cursor position. The input adapter accumulates a mouse delta as the pointer moves, and the consume step reads that delta and resets it for the next frame.',
          'Accumulating deltas means rotation is continuous and unbounded by the screen edges: the pointer is held at the center of the viewport while only its movement is reported. Holding the pointer at the center and reporting only its movement is what lets you keep turning in one direction without the cursor leaving the window.',
          '`QtInputAdapter` stores `_mdx` and `_mdy` until `consume()` creates one `InputFrame` and resets both accumulators to zero. `ViewportInput.consume` then returns that frame with a `MouseDelta` after inversion handling. Relative motion therefore has a bounded collection interval: one consumed step observes the accumulated pointer displacement since the previous consume, then clears that raw accumulator for the next input interval.',
          '`PlayerMotionState` separately tracks visual body and head angles. `_update_player_visual_animation` eases those display angles toward the immediate player yaw and pitch with bounded lag values, while `PlayerEntity.yaw_deg` and `pitch_deg` retain the step result. The visible model can trail a turn; the input, collision, and camera-anchor orientation stay on the player entity.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The input adapter accumulates and then drains the mouse delta per frame.',
            code: `def add_mouse_delta(self, dx: float, dy: float) -> None:
  self._mdx += float(dx)
  self._mdy += float(dy)

def consume(self) -> InputFrame:
  out = InputFrame(mdx=float(self._mdx), mdy=float(self._mdy))
  self._mdx = 0.0
  self._mdy = 0.0
  return out`,
          },
        ],
      },
      {
        id: 'looking-around-invert-axes',
        title: 'The Look Axes Can Be Inverted',
        body: [
          'When the input frame is consumed, the horizontal and vertical mouse deltas can each be negated according to the invert-x and invert-y preferences. This is applied at the boundary between raw input and camera control, so a single setting flips the corresponding look direction.',
          'Because inversion happens at consume time, the rest of the pipeline always receives a delta in the player’s preferred orientation. Nothing downstream needs to know whether the axes were inverted.',
          'The preferences enter the input path as `invert_x` and `invert_y` arguments to `ViewportInput.consume`. The adapter keeps raw deltas independent of those flags; inversion mutates the values passed onward from the consume boundary. Session stepping receives the resulting `mdx` and `mdy`, not the preference object itself, so the simulation path operates on already-oriented deltas.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Look-axis inversion is applied when the frame is consumed.',
            code: `def consume(self, *, invert_x: bool, invert_y: bool) -> tuple[InputFrame, MouseDelta]:
  fr = self._a.consume()
  mdx = float(fr.mdx)
  mdy = float(fr.mdy)
  if bool(invert_x):
    mdx = -mdx
  if bool(invert_y):
    mdy = -mdy
  return fr, MouseDelta(dx=float(mdx), dy=float(mdy))`,
          },
        ],
      },
      {
        id: 'looking-around-yaw-pitch',
        title: 'Yaw and Pitch Are Applied in the Player Step',
        body: [
          'The mouse delta is converted into yaw and pitch deltas that are passed into the player step input. Each fixed step adds the yaw delta and pitch delta to the player’s heading and elevation before movement and collision are resolved.',
          'Rotation is therefore part of the same fixed-step simulation as movement, not a separate camera-only update. The yaw and pitch the renderer reads come from the player entity after the step, so the view direction stays consistent with what collision and picking use.',
          '`step_session` computes `yaw_delta = -mdx * mouse_sens_deg_per_px` and `pitch_delta = mdy * mouse_sens_deg_per_px`, then constructs `PlayerStepInput` alongside movement flags. `advance_runtime_player` applies those angles before it builds movement input, resolves flying or grounded motion, and asks collision code for integration. The resulting player orientation supplies a shared input to view direction, camera snapshots, and target selection consumers.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Yaw and pitch deltas are added to the player at the start of each step.',
            code: `player.yaw_deg += float(control.yaw_delta_deg)
player.pitch_deg += float(control.pitch_delta_deg)
player.clamp_pitch()`,
          },
        ],
      },
      {
        id: 'looking-around-pitch-clamp',
        title: 'Pitch Is Clamped to Prevent Flipping',
        body: [
          'After the pitch delta is applied, the player pitch is clamped so the view cannot roll past straight up or straight down. This keeps the camera from flipping over when you push the mouse to its vertical limit.',
          'Yaw is free to accumulate without a limit, since turning all the way around is expected. The asymmetry between a clamped pitch and an unbounded yaw matches normal first-person look behavior.',
          '`PlayerEntity.clamp_pitch` calls the scalar clamp with `-89.5` and `89.5`; `yaw_deg` receives additive updates without a normalization operation in `advance_runtime_player`. This source establishes the angular range of player pitch. It supplies no independent guarantee about controller sensitivity values, operating-system pointer acceleration, or platform capture availability.',
        ],
        mathBlocks: [
          {
            expression:
              '\\varphi \\leftarrow \\operatorname{clamp}\\bigl(\\varphi + \\Delta\\varphi,\\ -89.5^{\\circ},\\ 89.5^{\\circ}\\bigr), \\qquad \\psi \\leftarrow \\psi + \\Delta\\psi \\;\\; (\\text{unbounded})',
            displayMode: true,
            caption:
              'clamp_pitch in src/ludoxel/simulation/actors/player/entity.py bounds the pitch φ to ±89.5° after each step, while the yaw ψ accumulates without limit, so the view turns fully but never rolls past vertical.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The player step input carries per-step yaw and pitch deltas alongside movement.',
            code: `@dataclass(frozen=True)
class PlayerStepInput:
  move_f: float
  move_s: float
  jump_held: bool
  jump_pressed: bool
  sprint: bool
  crouch: bool
  yaw_delta_deg: float
  pitch_delta_deg: float
  auto_jump_enabled: bool`,
          },
        ],
      },
      {
        id: 'looking-around-perspective',
        title: 'Camera Perspective Cycles With F5',
        body: [
          'Looking changes the view direction, while the camera perspective changes how the player is framed. The cycle-camera-perspective action, bound to F5 by default, switches between first-person and third-person views without changing movement or look input.',
          'The perspective is a renderer framing choice applied on top of the same yaw and pitch. Switching it does not alter the player’s heading or the collision and picking that depend on it; only the camera placement the renderer uses changes.',
          [
            'In the third-person views the body turns to follow your look with a short delay and the visible head trails the camera by a few degrees, so a fast turn lets the head lead while the body catches up and settles; how that ',
            {
              kind: 'link',
              label: 'delayed body and head turn',
              href: '/docs/systems/rendering-backends/world-visuals/understanding-the-player-model-pose',
            },
            ' is produced is a visual effect only. The look direction that camera control, picking, placement, and the first-person view use is the immediate heading, so it is never delayed by the visible body or head turn.',
          ],
          '`cycle_camera_perspective` normalizes the stored value, advances within `CAMERA_PERSPECTIVE_ORDER`, updates HUD and view-model visibility, synchronizes the settings surface, and invalidates the selection target. `resolve_camera` consumes the normalized perspective with the player eye and angles: first person returns the anchor eye, back view places a desired eye behind it, and front view derives its look angles from the resolved eye-to-anchor direction. The player entity remains the orientation owner throughout that renderer-facing selection.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The perspective cycle is a bound action with a default of F5.',
            code: `ACTION_CYCLE_CAMERA_PERSPECTIVE = "cycle_camera_perspective"

DEFAULT_KEYBINDS[ACTION_CYCLE_CAMERA_PERSPECTIVE] = "F5"`,
          },
        ],
      },
      {
        id: 'looking-around-requires-capture',
        title: 'Looking Requires Mouse Capture',
        body: [
          'Relative look deltas are only produced while the mouse is captured. When capture is off, the pointer is a normal cursor and no look delta is generated, so menus and overlays leave the camera still.',
          'On the polling path, the captured cursor is repeatedly compared against the viewport center and warped back, turning each frame’s offset into a delta. If you cannot look around, the first thing to confirm is whether the viewport is captured.',
          '`poll_relative_mouse_delta` exits before any cursor read when `_captured` is false. During capture synchronization it clears accumulated delta, recenters the cursor, and waits for two near-center polls; ordinary polling then adds only non-zero offsets. Capture state therefore gates delta production before the session sees mouse sensitivity or player-angle computation.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Capture polling converts the offset from center into a look delta.',
            code: `center = self._center_global()
cur = QCursor.pos()
dx = float(cur.x() - center.x())
dy = float(cur.y() - center.y())
if dx == 0.0 and dy == 0.0:
  return
self._a.add_mouse_delta(dx, dy)
self._warp_cursor_to_center()`,
          },
        ],
      },
      {
        id: 'looking-around-sensitivity',
        title: 'Sensitivity Scales the Delta Into Degrees',
        body: [
          'The raw pixel delta is not used directly as a degree value. It is scaled by the mouse-sensitivity preference when forming the yaw and pitch deltas, so the same pointer movement turns the view more or less depending on the setting.',
          'Because sensitivity is applied before the player step, changing it adjusts how far the view turns per unit of mouse movement without affecting movement speed or any other input. Camera feel is therefore a settings concern that builds on the look pipeline described here.',
          '`SessionSettings` supplies `mouse_sens_deg_per_px` to `step_session`; settings controller code applies sensitivity across session settings, while movement parameters such as walk speed live in separate fields. The multiplication has no branch that modifies `move_f`, `move_s`, collision bounds, or camera perspective. A look-speed observation therefore concerns the session setting and consumed pointer deltas, not the hotbar or world save payload.',
        ],
        mathBlocks: [
          {
            expression: '\\Delta\\psi = -\\,\\Delta x \\cdot s, \\qquad \\Delta\\varphi = \\Delta y \\cdot s, \\qquad s = \\texttt{mouse\\_sens\\_deg\\_per\\_px}',
            displayMode: true,
            caption:
              'The look mapping in src/ludoxel/application/sessions/managers/stepping.py multiplies the raw pixel offset by the sensitivity s in degrees per pixel; the yaw delta Δψ is negated so a rightward push turns the view right, and inversion preferences are applied to Δx and Δy upstream.',
          },
        ],
      },
    ],
    relatedTitles: ['Using Mouse Capture', 'Changing Camera Preferences', 'Understanding Keybind Resolution'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Controlling the Session',
    group: 'Camera and Capture',
    title: 'Using Mouse Capture',
    description:
      'Defines gameplay pointer capture as a viewport input state: focus, blank cursor, mouse and keyboard grabs, relative-delta production, and release each have separate operations in `ViewportInput`. macOS adds CoreGraphics relative capture and a distinct native keyboard guard; overlay, focus, loading, and shutdown transitions remove capture before their own surfaces accept input.',
    sections: [
      {
        id: 'using-mouse-capture-grab',
        title: 'Capture Grabs the Mouse and Keyboard',
        body: [
          'Turning capture on activates the window, focuses the viewport, hides the cursor with a blank cursor override, and grabs both the mouse and keyboard. Grabbing routes pointer and key events to the viewport so gameplay input is not stolen by other widgets.',
          'The cursor is hidden both through a Qt override cursor and by setting the blank cursor on the viewport and its host window, so the pointer does not reappear over the window chrome while you play.',
          '`set_mouse_capture(True)` records `_captured` before it activates the host, focuses the viewport, applies the override, sets both cursors, and requests Qt grabs. `ensure_mouse_capture_applied` repeats the focus and cursor application while capture stays active. The capture state therefore controls the input adapter’s own actions; Qt and the operating system still retain their separate focus and permission rules.',
          '`MacosCursorWarp.available()` and `warp()` reject non-macOS execution and report CoreGraphics load or call failures through `MacosCursorWarpResult`. `ViewportInput` falls through to `QCursor.setPos` when that native warp does not succeed. The result identifies the branch selected by Ludoxel; it cannot certify the host desktop’s pointer confinement, Input Monitoring grant, or all device-specific event behavior.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Enabling capture focuses the viewport, hides the cursor, and grabs input.',
            code: `self._w.setFocus(Qt.FocusReason.MouseFocusReason)
self._sync_override_cursor(hidden=True)
self._w.setCursor(Qt.CursorShape.BlankCursor)
if host_window is not None:
  host_window.setCursor(Qt.CursorShape.BlankCursor)
self._w.grabMouse()
self._w.grabKeyboard()`,
          },
        ],
      },
      {
        id: 'using-mouse-capture-recenter',
        title: 'The Cursor Is Recentered to Produce Deltas',
        body: [
          'On the non-native path, capture works by warping the cursor back to the viewport center and measuring how far it moved before each warp. The offset from center becomes the look delta, and recentering keeps the pointer from reaching a screen edge.',
          'Right after enabling capture, a short settling window ignores the first cursor moves so the initial warp does not register as a large jump. This is the capture-sync-pending state, which clears once the cursor reports stable, near-center positions.',
          '`_warp_cursor_to_center` marks a 25 ms ignore window and reserves two mouse-move events before using `MacosCursorWarp` or `QCursor.setPos`. `poll_relative_mouse_delta` clears accumulated delta while synchronization is pending, counts near-center polls, and enables regular offset collection after two stable polls. The settling gate removes synthetic recentering movement from the gameplay delta stream.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A warp recenters the cursor and briefly ignores the resulting moves.',
            code: `def _warp_cursor_to_center(self) -> None:
  self._ignore_mouse_move_until_s = max(float(self._ignore_mouse_move_until_s), float(time.perf_counter()) + 0.025)
  self._ignore_mouse_move_events = max(int(self._ignore_mouse_move_events), 2)
  center = self._center_global()
  warped = False
  if self._macos_cursor_warp is not None:
    warped = bool(self._macos_cursor_warp.warp(x=int(center.x()), y=int(center.y())).succeeded)
  if not bool(warped):
    QCursor.setPos(center)`,
          },
        ],
      },
      {
        id: 'using-mouse-capture-macos-relative',
        title: 'macOS Uses Native Relative Capture',
        body: [
          'On macOS, capture prefers a native relative-mouse path. When it begins successfully, the system reports relative deltas directly and no cursor warping is needed, so the capture-sync-pending settling step is skipped.',
          'If the native relative capture cannot start, the code falls back to the warp-and-recenter method. Either way the viewport receives a relative delta; only the mechanism that produces it differs by platform.',
          '`MacosRelativeMouseCapture.begin` loads CoreGraphics and CoreFoundation, creates an event tap over mouse movement and drag events, warps to the supplied center, disassociates cursor movement, hides the display cursor, enables the tap, and marks itself active. `poll()` drains accumulated integer deltas under a lock. An unavailable framework, a null tap, or an unsuccessful begin returns control to the Qt warp path; the source supplies no claim that macOS has granted the required system permissions.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Native relative capture is tried first; warping is the fallback.',
            code: `self._a.clear_mouse_delta()
center = self._center_global()
native_relative = bool(self._macos_relative_mouse is not None and self._macos_relative_mouse.begin(x=int(center.x()), y=int(center.y())))
if not bool(native_relative):
  self._warp_cursor_to_center()
self._capture_sync_pending = not bool(native_relative)`,
          },
        ],
      },
      {
        id: 'using-mouse-capture-macos-guard',
        title: 'A macOS Keyboard Guard Is Separate From Cursor Capture',
        body: [
          'On macOS, gameplay also installs a keyboard input guard that is distinct from mouse capture. The guard is activated and deactivated alongside capture but handles native key events; it is not the cursor-warp or relative-mouse mechanism.',
          'Because the keyboard guard and cursor handling are separate components, a fault in one does not imply a fault in the other. Cursor capture concerns pointer hiding and look deltas, while the guard concerns native key delivery during play.',
          '`MacosGameplayInputGuard` creates a second CoreGraphics event tap for key-down, key-up, and modifier events, maps macOS keycodes to Qt keys, and calls its injected handler only while active. It reports installation failure through its status and stderr path. `ViewportInput` constructs that guard only when a native key handler is supplied, whereas the relative cursor capture has its own lifecycle and pending delta buffer.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The macOS keyboard guard is toggled with capture but is a separate component.',
            code: `if self._macos_input_guard is not None:
  self._macos_input_guard.set_active(True)
# on release:
if self._macos_relative_mouse is not None:
  self._macos_relative_mouse.end()
if self._macos_input_guard is not None:
  self._macos_input_guard.set_active(False)`,
          },
        ],
      },
      {
        id: 'using-mouse-capture-polling',
        title: 'Relative Movement Is Polled Each Frame',
        body: [
          'While captured, the relative delta is polled each frame. On the native path it reads accumulated relative movement; on the warp path it measures the cursor offset from center, adds it to the input adapter, and warps back. The captured-move event handler feeds the same adapter when Qt delivers move events.',
          'The poll re-applies the capture state every frame, which keeps focus, the hidden cursor, and the grabs in place even if the window manager tried to change them, so capture stays stable during continuous play.',
          '`poll_relative_mouse_delta` chooses one producer per call: an active native capture drains `MacosRelativeMouseCapture`, pending synchronization discards movement and recenters, and the normal path measures `QCursor.pos()` against `_center_global()`. `on_captured_mouse_move` feeds the same adapter for accepted Qt move events after ignore gates expire. Both producers converge at `QtInputAdapter.add_mouse_delta`; neither producer changes player yaw directly.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Polling reads native relative movement when it is active.',
            code: `if self._macos_relative_mouse is not None and self._macos_relative_mouse.active():
  delta = self._macos_relative_mouse.poll()
  if int(delta.dx) != 0 or int(delta.dy) != 0:
    self._a.add_mouse_delta(float(delta.dx), float(delta.dy))
  return`,
          },
        ],
      },
      {
        id: 'using-mouse-capture-release',
        title: 'Capture Releases Cleanly',
        body: [
          'Turning capture off ends native relative capture, deactivates the keyboard guard, releases the keyboard and mouse grabs, restores the override cursor, and unsets the blank cursor on both the viewport and its host window. The pointer becomes a normal cursor again.',
          'Capture is released when an overlay takes focus, when the viewport loses focus, and on shutdown. Because release also resets the pending mouse delta, no leftover movement is applied after the cursor returns.',
          '`ViewportLifecycleMixin._on_application_state_changed` clears held actions, resets input, and calls `set_mouse_capture(False)` on deactivation. The viewport mouse-move handler also routes ordinary Qt motion whenever pause, inventory, death, settings, Othello settings, loading, or uncaptured state applies. Capture release changes cursor and input routing; it leaves player position, world blocks, inventory slots, and persisted settings unchanged.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Disabling capture releases the grabs and restores the cursor.',
            code: `self._w.releaseKeyboard()
self._w.releaseMouse()
self._sync_override_cursor(hidden=False)
self._w.unsetCursor()
host_window = self._w.window()
if host_window is not None:
  host_window.unsetCursor()`,
          },
        ],
      },
    ],
    relatedTitles: ['Looking Around', 'Understanding Keybind Resolution', 'Understanding Overlay Input Blocking'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Controlling the Session',
    group: 'Movement and Recovery',
    title: 'Moving the Player',
    description:
      'Traces movement from normalized keybinds through `QtInputAdapter`, `FixedStepRunner`, `step_session`, `PlayerStepInput`, movement rules, collision integration, and audio feedback. The fixed-step path resolves orientation, movement axes, jump edges, flight state, support contact, fall distance, and footstep events before HUD, renderer, and audio consumers receive the resulting state.',
    sections: [
      {
        id: 'moving-the-player-wasd',
        title: 'Movement Comes From Bound Keys',
        body: [
          'Forward, backward, left, and right are bound actions resolved through the keybind settings. The defaults are W, S, A, and D. The input adapter checks which movement actions are currently pressed and combines them into a forward and a strafe value for the frame.',
          'Forward minus backward gives the forward axis, and right minus left gives the strafe axis, so opposing keys cancel out. The result is a small movement vector that the player step turns into velocity.',
          '`QtInputAdapter` resolves physical keys through its normalized `KeybindSettings` map, then emits one `InputFrame` with `move_f` and `move_s`. The mapping stores axes independently of camera yaw. `step_bedrock` later combines the axes with `_basis_from_yaw_deg(player.yaw_deg)` and normalizes the resulting wish direction, so key state alone carries no world-space direction until the active player orientation is read.',
          '`KeybindSettings.__post_init__` seeds default actions, normalizes binding text, and removes an earlier action when the same normalized binding appears again. The resulting map can leave a prior action unbound. Movement behavior therefore begins with the current normalized action map, not with an assumption that every default key remains available after preference changes.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Pressed movement actions are combined into forward and strafe values.',
            code: `if self._action_pressed(ACTION_MOVE_FORWARD):
  f += 1.0
if self._action_pressed(ACTION_MOVE_BACKWARD):
  f -= 1.0
if self._action_pressed(ACTION_MOVE_RIGHT):
  s += 1.0
if self._action_pressed(ACTION_MOVE_LEFT):
  s -= 1.0`,
          },
        ],
      },
      {
        id: 'moving-the-player-jump-crouch-sprint',
        title: 'Jump, Crouch, and Sprint Have Held and Edge States',
        body: [
          'Jump defaults to Space, crouch to Shift, and sprint to Control. The adapter tracks both the held state of jump and a one-shot pressed edge, so a single press can trigger a jump while holding can queue further jumps. Crouch and sprint are read as held states.',
          'Auto-repeat key events are ignored, so holding a key does not produce a stream of fresh presses. The jump pressed edge is consumed when the frame is read, which is what distinguishes a tap from a hold in the movement logic.',
          '`QtInputAdapter.on_key_press` adds the key to its held-key set and marks `_jump_pressed_edge` only for the action currently bound to jump. `consume()` copies that flag into `InputFrame.jump_pressed` and clears it. Held state, edge state, and auto-repeat admission therefore reach `PlayerStepInput` as separate fields, allowing `advance_runtime_player` to distinguish a first press from continuous key presence.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Jump tracks a held state and a single pressed edge.',
            code: `def on_key_press(self, e: QKeyEvent) -> None:
  if bool(e.isAutoRepeat()):
    return
  k = int(e.key())
  self._keys.add(k)
  if self._action_keys.get(ACTION_JUMP) == int(k):
    self._jump_pressed_edge = True`,
          },
        ],
      },
      {
        id: 'moving-the-player-step-input',
        title: 'Input Becomes a Per-Step Control Object',
        body: [
          'Each fixed step, the consumed input frame and the look deltas are packed into a player step input. It carries the clamped forward and strafe values, the jump held and pressed flags, sprint and crouch, the yaw and pitch deltas, and whether auto-jump is enabled.',
          'The player advance reads this control object for movement input. Packing the complete step state preserves fixed-timestep determinism across event timing.',
          '`FixedStepRunner.update` accumulates elapsed time, clamps a frame contribution to 0.25 seconds, invokes `on_step(step_dt)` while enough time remains, and caps a cycle at `max_substeps`. The runner supplies a fixed `dt` to the viewport step callback; it does not store keys, world state, or collision geometry. Input collection and simulation stepping meet only at the control object assembled for each executed substep.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The fixed-step advance reads one control object per step.',
            code: `def advance_runtime_player(*, player, world, block_registry, settings, motion, dt, control: PlayerStepInput):
  player.advance_hurt_state(float(dt))
  player.yaw_deg += float(control.yaw_delta_deg)
  player.pitch_deg += float(control.pitch_delta_deg)
  player.clamp_pitch()`,
          },
        ],
      },
      {
        id: 'moving-the-player-walk-vs-fly',
        title: 'Walking and Flying Use Different Movement Models',
        body: [
          'If the player is flying, movement uses the flying model and collision integration with flying enabled, and ground-related state such as airborne tracking is cleared. Otherwise movement uses the grounded model, where gravity, jumping, and support contact apply.',
          'Both paths end by integrating against the world with collisions, but the velocity model that feeds the integration differs, so flying clears and ignores fall state while grounded movement tracks the fall start height.',
          '`step_flying` computes horizontal target velocity from the same yaw-relative wish direction and can use jump-held or crouch-held for vertical target velocity. `step_bedrock` computes a grounded or airborne velocity, applies a jump impulse when admitted, and applies gravity plus fall-speed clamping while airborne. `integrate_with_collisions` receives the selected velocity model, current world, registry, collision parameters, crouch flag, jump pulse, and flight flag before it reports support and positional correction.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The grounded path steps the walking model then integrates with collisions.',
            code: `step_bedrock(player, move_input, float(dt), params=settings.movement)
report = integrate_with_collisions(player, world, float(dt), block_registry=block_registry, params=settings.collision, crouch=bool(control.crouch), jump_pressed=bool(jump_pulse), flying=False)`,
          },
        ],
      },
      {
        id: 'moving-the-player-jump-pulse',
        title: 'A Jump Pulse Is Decided Before Stepping',
        body: [
          'A jump only fires when the player is on the ground. A fresh jump press produces a pulse, and a queued hold-jump can also produce one while the jump key stays held. The pulse is then passed into the movement model so the upward impulse is applied that step.',
          'Landing while still holding jump queues the next jump, which is how holding the jump key produces repeated hops. The queue is cleared as soon as the jump key is released.',
          'The runtime records `prev_on_ground`, `prev_vy`, and prior Y before integration, then recognizes a landing only when support appears after an airborne, downward state. A held jump at that landing sets `hold_jump_queued`; the next grounded step may consume it. The queue resides in `PlayerEntity` runtime state and resets during respawn, flight, or key release; the keybind map retains only action bindings.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Ground state and the press or hold queue decide the jump pulse.',
            code: `jump_pulse = False
if bool(player.on_ground) and bool(control.jump_pressed):
  jump_pulse = True
elif bool(player.on_ground) and bool(player.hold_jump_queued) and bool(control.jump_held):
  jump_pulse = True
  player.hold_jump_queued = False`,
          },
        ],
      },
      {
        id: 'moving-the-player-auto-jump',
        title: 'Auto-Jump Steps Up One Block',
        body: [
          'When auto-jump is enabled and the jump key is not held, the step probes ahead in the wished direction. If a one-block step up is possible there, a jump pulse is generated automatically and an auto-jump is marked pending so the result can be checked on landing.',
          'Auto-jump has a cooldown that is set only after a successful step up, which prevents it from firing every frame while walking into a wall it cannot climb. This is the behavior that lets the player walk up single-block ledges without pressing jump.',
          '`can_auto_jump_one_block` receives a horizontal probe from `wish_dir_from_input` and collision parameters. The runtime sets `auto_jump_pending` plus a start height when the probe admits a pulse; after landing, it compares vertical gain with `auto_jump_success_dy` before installing `auto_jump_cooldown_s`. A failed probe or failed gain leaves the cooldown branch unarmed. The source constrains this behavior to the current session world and collision model.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Auto-jump probes one block ahead in the wished direction.',
            code: `wish = wish_dir_from_input(player, forward, strafe)
probe = float(settings.movement.auto_jump_probe)
if can_auto_jump_one_block(player, world, dx=float(wish.x) * probe, dz=float(wish.z) * probe, block_registry=block_registry, params=settings.collision):
  jump_pulse = True
  player.auto_jump_pending = True
  player.auto_jump_start_y = float(player.position.y)`,
          },
        ],
      },
      {
        id: 'moving-the-player-footsteps',
        title: 'Walking Advances a Phase for Footsteps and View Bob',
        body: [
          'Each grounded step advances a walk phase proportional to horizontal speed relative to the configured walk speed. Crossing a half-cycle of that phase while grounded and moving above a minimum speed triggers a footstep event, which the audio and view systems read.',
          'The phase also drives view bobbing and held-item swing. Its speed scaling keeps footsteps and bob aligned with player movement.',
          '`_update_player_walk_phase` advances `walk_phase_total_rad` by speed divided by configured walk speed and detects a footstep at a π-boundary crossing while grounded above the minimum speed. `SessionStepResult.footstep_triggered`, support block state, and support cell move into presentation consumers after stepping. `AudioManager.play_surface_event` resolves a sound group from the support block and may select step or landing playback; the audio manager consumes the event and does not determine movement physics.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A footstep fires when the walk phase crosses a half cycle while grounded.',
            code: `rate = float(PLAYER_WALK_PHASE_RATE_AT_WALK_SPEED) * (float(speed) / float(base))
motion.walk_phase_total_rad = float(previous_total + rate * float(dt))
if bool(player.flying) or (not bool(player.on_ground)) or speed < float(PLAYER_FOOTSTEP_MIN_SPEED):
  return False
return int(math.floor(previous_total / math.pi)) != int(math.floor(float(motion.walk_phase_total_rad) / math.pi))`,
          },
        ],
      },
      {
        id: 'moving-the-player-crouch-eye',
        title: 'Crouch Lowers the Eye Smoothly',
        body: [
          'Crouching does not snap the camera down. The crouch eye offset eases toward its target each step with an exponential approach, and eases back up when crouch is released. A separate step eye offset smooths the small vertical correction when the collision system steps the player up a ledge.',
          'These eased offsets are applied to the eye height the renderer reads, settling the view. They provide visual smoothing above the collision result and leave the player collision box unchanged.',
          '`PlayerEntity.eye_pos()` applies `eye_height - crouch_eye_offset + step_eye_offset` to player position, while `aabb_at()` derives the collision box from width and height. `_update_crouch_eye` and `_update_step_eye` mutate the former visual offsets after collision integration. Crouch can affect collision integration through its explicit flag, yet the eye smoothing fields themselves operate on the camera anchor and carry no block-placement or persistence write path.',
        ],
        mathBlocks: [
          {
            expression:
              '\\alpha = 1 - e^{-18\\,\\Delta t}, \\qquad o \\leftarrow \\operatorname{clamp}\\bigl(o + (o^{*} - o)\\,\\alpha,\\ 0,\\ o_{\\max}\\bigr), \\qquad o^{*} = \\begin{cases} o_{\\max} & \\text{crouching} \\\\[1pt] 0 & \\text{otherwise} \\end{cases}',
            displayMode: true,
            caption:
              '_update_crouch_eye in src/ludoxel/simulation/actors/player/kinematics.py drives the eye offset o toward its target with a frame-rate-independent decay α; the same form smooths the step-up offset, and o_max = crouch_eye_drop = 0.25 blocks bounds the drop.',
          },
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The crouch eye offset eases toward its target each step.',
            code: `def _update_crouch_eye(player, *, dt: float, crouch: bool) -> None:
  target = float(player.crouch_eye_drop) if bool(crouch) else 0.0
  current = float(player.crouch_eye_offset)
  alpha = 1.0 - math.exp(-18.0 * max(0.0, float(dt)))
  next_value = current + (target - current) * alpha
  player.crouch_eye_offset = max(0.0, min(float(player.crouch_eye_drop), float(next_value)))`,
          },
        ],
      },
    ],
    relatedTitles: ['Surviving Fall and Void Hazards', 'Understanding Block Shapes', 'Changing Keybind Preferences'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Controlling the Session',
    group: 'Movement and Recovery',
    title: 'Recovering after Death',
    description:
      'Traces damage and recovery through `PlayerEntity`, fall and void rules, `SessionManager`, session stepping, the death overlay, and overlay-navigation respawn. The death surface exposes an accepted respawn request only after session state reaches zero health; respawn resets the active player and transient interaction consumers while world and persistence branches remain outside that mutation.',
    sections: [
      {
        id: 'recovering-after-death-health',
        title: 'Health Is the Default Twenty Points',
        body: [
          'The player starts with twenty health points, shown by the hotbar health strip as ten hearts. Damage reduces this value, and reaching zero is what puts the session into the dead state. The health strip fills each heart proportionally, so half-heart amounts are visible.',
          'Health is simulation state, while the heart strip is a HUD display of it. Recovering after death is about how that value reaches zero and how respawn restores it, not about the way the hearts are drawn.',
          '`PlayerEntity` initializes `health` and `max_health` to `20.0`, clamps health through `clamp_health`, and defines `alive()` as health greater than a small positive threshold. `_HealthStrip.set_state` receives presentation values, clamps them again for drawing, and requests repaint. The strip can expose a rendered ratio; session stepping and `PlayerEntity.apply_damage` own the authoritative health mutation.',
          '`apply_melee_damage` calls `target.apply_damage` with a half-second cooldown, hurt flash, tilt, and source position, then applies knockback only when positive damage was accepted. `attack_sprinting` derives its condition from attacker horizontal speed relative to walk speed. Melee input and AI combat can therefore feed the same health and hurt-state owner, while death reason classification remains in `step_session` after its fall, void, and AI reports are assembled.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The health strip draws hearts from the current and maximum health.',
            code: `def set_state(self, *, show_health: bool, health: float, max_health: float) -> None:
  self._show_health = bool(show_health)
  self._max_health = max(2.0, float(max_health))
  self._health = max(0.0, min(float(health), float(self._max_health)))
  self.update()`,
          },
        ],
      },
      {
        id: 'recovering-after-death-fall-damage',
        title: 'Fall Damage Starts Beyond a Safe Distance',
        body: [
          'Fall damage is computed from the distance fallen, measured from the height where the player became airborne to where they land. Falls up to the safe distance of three blocks do no damage; beyond that, damage is the whole number of blocks past the safe distance.',
          'The fall distance is captured on landing from the recorded airborne start height, so a drop past the three-block safe distance hurts while stepping off a small ledge does not, and the damage scales with how far past three blocks you fell.',
          '`advance_runtime_player` stores an airborne start height after support disappears, detects landing from pre-step and post-step support conditions, and computes non-negative fall distance from that stored height to the resolved player Y. `step_session` passes the resulting value to `fall_damage_amount` and immediately calls `player.apply_damage(..., bypass_cooldown=True)` outside creative mode. The formula therefore applies after collision has established the landing outcome, not from a raw vertical key input or HUD reading.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Fall damage is the rounded-up distance past the safe distance.',
            code: `FALL_DAMAGE_SAFE_DISTANCE_BLOCKS = 3.0


def fall_damage_amount(*, fall_distance_blocks: float | None) -> float:
  if fall_distance_blocks is None:
    return 0.0
  distance = max(0.0, float(fall_distance_blocks))
  if distance <= float(FALL_DAMAGE_SAFE_DISTANCE_BLOCKS):
    return 0.0
  return float(math.ceil(float(distance) - float(FALL_DAMAGE_SAFE_DISTANCE_BLOCKS)))`,
          },
        ],
      },
      {
        id: 'recovering-after-death-void',
        title: 'The Void Applies Repeating Damage Below a Threshold',
        body: [
          'Below the void threshold depth, the player takes repeating damage. While the player is alive and below the threshold, the void timer accumulates and applies a fixed damage amount each interval, bypassing the normal damage cooldown so it keeps ticking.',
          'The fixed damage amount and interval form a steady void drain. A player below the threshold loses health over time until reaching the safe depth. The remaining sub-interval time carries across frames to preserve cadence.',
          '`apply_void_damage` carries `timer_s` forward, adds the fixed-step `dt`, subtracts one half-second interval for each eligible tick, and returns the residual timer with total damage. `SessionManager` stores that residual in `_void_damage_timer_s`; creative mode resets it to zero in `step_session`. The void branch is evaluated after player movement for that simulation step, so the current resolved Y determines whether the accumulator advances.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Void damage ticks at a fixed interval below the threshold depth.',
            code: `VOID_DAMAGE_START_Y = -64.0
VOID_DAMAGE_INTERVAL_S = 0.50
VOID_DAMAGE_AMOUNT = 4.0


def apply_void_damage(*, player, dt, timer_s):
  if (not bool(player.alive())) or float(player.position.y) >= float(VOID_DAMAGE_START_Y):
    return (0.0, 0.0)
  remaining = max(0.0, float(timer_s)) + max(0.0, float(dt))
  damage_taken = 0.0
  while float(remaining) + 1e-9 >= float(VOID_DAMAGE_INTERVAL_S) and bool(player.alive()):
    remaining -= float(VOID_DAMAGE_INTERVAL_S)
    damage_taken += float(player.apply_damage(float(VOID_DAMAGE_AMOUNT), bypass_cooldown=True))
  return (float(damage_taken), max(0.0, float(remaining)))`,
          },
        ],
      },
      {
        id: 'recovering-after-death-overlay',
        title: 'The Death Overlay Shows a Cause and a Respawn Button',
        body: [
          'When health reaches zero, the death overlay appears with a "YOU DIED" title, a message line, and a Respawn button. The message is set from the cause of death and falls back to "Player died." when no specific text is supplied.',
          'While the death overlay is visible, the pause menu cannot be opened, so the only forward action from this state is to respawn. The overlay itself only emits a respawn request; the controller decides what that does.',
          '`open_pause_menu` begins with a dead-overlay check and returns when `viewport._overlays.dead()` is true. `DeathOverlay` has no direct session reference: its button emits `respawn_requested`, and `bind_overlay_actions` connects that signal to the controller. The visible panel therefore blocks the pause route and exposes one recovery request without granting the widget authority over world persistence or damage calculations.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The death overlay sets its message and emits a respawn request.',
            code: `class DeathOverlay(QWidget):
  respawn_requested = pyqtSignal()

  def set_message(self, text: str) -> None:
    body = str(text).strip()
    if not body:
      body = "Player died."
    self._message.setText(body)`,
          },
        ],
      },
      {
        id: 'recovering-after-death-respawn',
        title: 'Respawn Resets the Player and Clears the Overlay',
        body: [
          'Pressing Respawn resets held mouse actions, cancels any pending AI route edit, respawns the session player, invalidates the current selection target, clears the renderer selection, hides the dead overlay, and re-syncs the hotbar widgets. After this, the viewport is back to ordinary play.',
          'Respawn is handled by the overlay-navigation controller, not by the overlay itself. Because it clears selection and held actions, you do not resume mid-interaction; you start fresh from the respawn position with the hotbar restored.',
          '`SessionManager.respawn` restores position from `SessionSettings.spawn_x`, `spawn_y`, and `spawn_z`, clears velocity, pitch, flight, eye offsets, queued jump and auto-jump state, overlap exemptions, health, death reason, and void timer. `overlay_navigation.respawn` then hides the dead overlay and synchronizes hotbar widgets after it clears renderer selection. The active session player changes immediately; a later save remains a separate persistence operation.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Respawn resets player state and clears the dead overlay.',
            code: `def respawn(viewport) -> None:
  viewport._reset_held_mouse_actions()
  ai_controller.cancel_route_edit(viewport)
  viewport._session.respawn()
  viewport._invalidate_selection_target()
  viewport._renderer.clear_selection()
  viewport._set_dead_overlay(False)
  settings_controller.sync_hotbar_widgets(viewport)`,
          },
        ],
      },
      {
        id: 'recovering-after-death-preserves-data',
        title: 'Respawn Restores the Player, Not the World',
        body: [
          'Respawn returns the player to the active space’s spawn state with restored health. It does not erase the saved world, the Othello board, hotbar contents, preferences, or AI learning artifacts. Those belong to persistence and the other play space, not to the death-and-respawn cycle.',
          'Respawn resets the player’s position and condition while the saved world, Othello board, hotbar, preferences, and learning artifacts persist. Dying is recoverable. Loss of another state after death points to the relevant saved-state path.',
          '`AppState` keeps `my_world`, `othello_space`, inventory, settings, and Othello settings in separate persistence fields. `SessionManager.respawn` mutates none of those schema values and has no store call. A recovery observation establishes that the active player was reset through the session manager; it cannot establish the condition of an on-disk world, another play-space payload, or a later synchronization failure.',
        ],
      },
      {
        id: 'recovering-after-death-hurt-feedback',
        title: 'Taking Damage Produces Hurt Feedback',
        body: [
          'Non-fatal damage advances a hurt state on the player each step, which drives a short hurt flash and a brief view tilt. Timed decay clears both effects after the hit.',
          'The HUD hurt-feedback and death-message paths expose damage before and at terminal state. A health-loss report can correlate those surfaces with fall, void, or melee simulation causes.',
          '`apply_damage` clamps health, honors its cooldown unless bypassed, subtracts positive damage from a living player, and calls `trigger_hurt_feedback`. That feedback updates flash duration, tilt duration, jump-reset window, and a tilt sign derived from source direction where available. `SessionStepResult` carries damage total and selected death reason forward; `HUDWidget` and the death overlay consume presentation values without changing the cause-selection order in session stepping.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Melee damage uses a cooldown, hurt flash, and view tilt.',
            code: `MELEE_ATTACK_DAMAGE = 1.0
MELEE_DAMAGE_COOLDOWN_S = 0.50
MELEE_HURT_FLASH_S = 0.50
MELEE_HURT_TILT_S = 0.18`,
          },
        ],
      },
    ],
    relatedTitles: ['Surviving Fall and Void Hazards', 'Reading Saved World State', 'Understanding Overlay Input Blocking'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Controlling the Session',
    group: 'Chat and Commands',
    title: 'Using Chat and Commands',
    description:
      'Explains how to open and close the shared chat screen in My World and Othello, send messages and commands, read the heads-up feed after closing, and open the embedded Chat Settings, grounded in the chat surfaces and the chat runtime.',
    sections: [
      {
        id: 'using-chat-opening',
        title: 'Opening and Closing the Chat Screen',
        content: [
          {
            kind: 'paragraph',
            text: 'The chat screen is shared by My World and Othello. It is opened with the Open Chat keybind, which defaults to `T`, and closed with `Esc` or the title-bar `< Back` button. Opening it releases the gameplay mouse capture so the message field can take keyboard focus, and closing it returns to the normal gameplay input and cursor state for the active play space. The screen reuses the pause-screen background tone, but it does not pause the game: time, the simulation step, the Othello clock, and world motion keep running behind it.',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'Press T during gameplay to open the chat screen; the message field receives focus.',
              'Type a message, or type a command that begins with a slash.',
              'Send with the bottom-right send button or with Enter; empty and whitespace-only input is not sent.',
              'Press Esc or click < Back to close the screen and return to gameplay.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'The title bar and the bottom bar are equal-height bars spanning the full window width. The title text Chat and Commands stays centered on the whole window across resizes, and the bottom bar places a square settings button on the left, the message field in the middle, and a wider send button on the right.',
          },
        ],
      },
      {
        id: 'using-chat-feed',
        title: 'Reading the Heads-Up Feed After Closing',
        content: [
          {
            kind: 'paragraph',
            text: 'After the chat screen closes, a small recent chat box appears at the lower-left of the gameplay HUD, above the hotbar, showing the newest messages. It is a display only: it does not take mouse capture, camera control, hotbar selection, or block interaction. Messages added while the screen is closed appear in the box, which is limited to roughly the newest ten rows while the full history retains up to one hundred messages.',
          },
          {
            kind: 'paragraph',
            text: 'While the F3 Debug HUD is shown, the recent chat box is hidden so the two do not overlap at the lower-left. Closing the F3 Debug HUD restores the box when Mute All Chat is disabled and the chat screen is closed.',
          },
        ],
      },
      {
        id: 'using-chat-settings-and-commands',
        title: 'Chat Settings and Command Entry',
        content: [
          {
            kind: 'paragraph',
            text: 'The square settings button on the bottom bar opens the embedded Chat Settings surface inside the chat screen, with the chat screen still visible behind it. Its only control in this version is Mute All Chat, a setting held only while the game runs. When the message field begins with a slash, the message list is replaced by a command candidate list showing the available command signatures; `/t` shows the teleport signatures and `/g` shows the game-mode signatures. Showing a candidate is not running a command. The full command behavior, the runtime-only mute, and the runtime history are described in the related articles.',
          },
        ],
      },
    ],
    relatedTitles: ['Using the Inventory Overlay', 'Understanding the Chat Runtime and Command Routing', 'Using Teleport and Game Mode Commands', 'Changing Chat Visibility'],
  }),
];
