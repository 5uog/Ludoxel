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
      'Defines the implemented startup chain from the Python module entry point to the loaded viewport. Launch is treated as a sequence of executable gates—entry delegation, bootstrap root selection, runtime selection, presentation-shell construction, single-instance activation, player-name admission, host-window creation, and viewport loading—so startup evidence is not confused with play-space restoration or support intake.',
    sections: [
      {
        id: 'starting-ludoxel-entry-delegation',
        title: 'Entry Is Delegation, Not Window Construction',
        body: [
          'Starting Ludoxel begins at `src/ludoxel/__main__.py`, whose operative act is deliberately narrow. The module prepares multiprocessing support for frozen execution and delegates to the application layer. It does not create `QApplication`, does not select My World or Othello, does not read persisted play-space state, and does not initialize a renderer.',
          '`ludoxel.application` preserves that boundary by exposing `run_app` through a lazy package export. The name is resolved only when requested, and the actual bootstrap function is imported from `ludoxel.application.bootstrap` at that point. A launch that reaches this boundary proves delegation into the application layer; it proves nothing about the later presentation shell, viewport backend, HUD, saved world, or active play space.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The module entry point delegates startup to the application layer.',
            code: `# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import multiprocessing

from ludoxel.application import run_app

if __name__ == "__main__":
  multiprocessing.freeze_support()
  run_app()`,
          },
          {
            language: 'py',
            caption: 'The application package resolves run_app lazily through the bootstrap module.',
            code: `from importlib import import_module

__all__ = ["run_app"]


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
          'The application bootstrap is the first substantive execution gate. `src/ludoxel/application/bootstrap/run.py` determines `project_root`, `resource_root`, and `data_root`, then enforces the source-runtime preference before importing the presentation shell. The ordering matters: no visible window can be read as gameplay evidence before the roots and runtime gate have been fixed.',
          '`project_root` identifies the application context, `resource_root` identifies bundled runtime material, and `data_root` identifies the user-state jurisdiction that later persistence code will use. The bootstrap also installs Othello opening-book storage hooks before the presentation shell starts. That hook registration is only storage preparation; it is not proof that the Othello board is active, visible, or selected.',
          'In source-tree execution, `_ensure_python_314` may re-execute the module through a preferred Python 3.14 interpreter. In frozen execution the function returns immediately because the runtime is already part of the packaged process. A failure before any Qt surface exists therefore belongs to the launch environment or bootstrap path, not to camera movement, hotbar interaction, Othello move legality, or a renderer overlay.',
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
          'The runtime data root is selected before the user can interact with the window, but its selection does not mean that the expected save, setting, inventory, Othello state, or world fragment has already been accepted. It means only that later persistence consumers have a resolved base location from which runtime state and cache paths may be derived.',
          '`LUDOXEL_DATA_ROOT` overrides the default location. Without that override, the implementation follows platform-specific storage conventions: `LOCALAPPDATA` or `AppData` on Windows, `~/Library/Application Support/Ludoxel` on macOS, `XDG_DATA_HOME/ludoxel` on compatible systems, and `~/.local/share/ludoxel` as the final fallback. The repository source tree is not the ordinary storage authority for user runtime state.',
          'Consequently, "the application opened" and "the expected saved state appeared" remain separate propositions. A missing player name, an unexpected world, or absent Othello state after a window exists is no longer a pure launch question; it has crossed into persisted data, play-space restoration, or runtime integrity evidence.',
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
          'After bootstrap, `src/ludoxel/presentation/interface/windows/main.py` constructs the desktop process. It creates `QApplication`, assigns organization and application identity, loads an application icon when one exists, registers bundled fonts, applies the QSS theme, and only then proceeds toward single-instance coordination and state admission. A font-registration failure at this level is not cosmetic; the shell raises instead of authorizing a partially styled desktop surface.',
          'Single-instance activation is an execution gate, not a saved-state operation. `SingleInstanceRelay` is bound to the managed data root; if an existing instance accepts activation, the new launch returns without constructing a second independent main window. An apparent second launch may therefore be an activation request delivered to an existing desktop process.',
          'The player-name gate is also part of startup. The shell loads `AppStateStore`, normalizes the persisted player name, and displays `PlayerNameDialog` only when no launch name is available. Cancelling that dialog returns before `MainWindow` exists. That return is an intentional admission failure, not a renderer crash and not a failed play-space switch.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The presentation shell creates the Qt application identity and applies the bundled font and theme before the main window.',
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
          '`MainWindow` is the host. It stores the resolved roots, constructs `GameScreen`, installs that screen as its central widget, and connects fullscreen behavior to the viewport. The existence of this host window proves that startup has passed the shell admission gates; it does not prove that the viewport has finished loading or that a play-space rule has been executed.',
          '`GameScreen` then chooses the platform viewport widget, constructs the HUD, and displays a loading overlay whose status begins as `Preparing viewport...`. The overlay is bound to the viewport loading state and loading-status signals. Until `loading_finished` hides that overlay and gives focus to the viewport, the process is still at the boundary between desktop launch and ordinary play-space interaction.',
          'The startup splash in the presentation shell follows the same status channel. It connects to `viewport.loading_status_changed`, closes on `viewport.loading_finished`, and only then leaves the ordinary window as the visible authority. A visible splash, a host window with `Preparing viewport...`, and a focused viewport are therefore three distinct observations, not three phrasings of the same condition.',
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
self._loading_overlay.setVisible(bool(self.viewport.loading_active()))
self.viewport.loading_state_changed.connect(self._handle_loading_state_changed)
self.viewport.loading_status_changed.connect(self._loading_overlay.set_status_text)
self.viewport.loading_finished.connect(self._handle_loading_finished)`,
          },
          {
            language: 'py',
            caption: 'Viewport completion hides the overlay and transfers focus to the viewport.',
            code: `def _handle_loading_finished(self) -> None:
  self._loading_overlay.hide()
  self.viewport.setFocus(Qt.FocusReason.OtherFocusReason)

def _handle_loading_state_changed(self, active: bool) -> None:
  self._loading_overlay.setVisible(bool(active))
  if bool(active):
    self._loading_overlay.raise_()`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-startup-evidence-routing',
        title: 'Startup Evidence Must Be Classified Before Any Public Channel',
        body: [
          'A disciplined startup reading names the latest executed gate and then stops. The relevant observations are: no visible Qt surface; player-name dialog; startup splash; existing-window activation; main window with `Preparing viewport...`; loaded viewport accepting focus; or loaded viewport showing an unexpected play space. Each observation belongs to a different location in the startup chain and must not be inflated into a diagnosis, proposed patch, vulnerability disclosure, support entitlement, or repository-policy request.',
          [
            'The latest executed startup gate is only the Manual fact. Public submission is governed by the repository support gates, not by the mere existence of an observation. A public ',
            {
              kind: 'link',
              label: 'problem report',
              href: '/docs/support/public-problem-support/issue-report-content/writing-a-problem-report',
            },
            ' is available only for a reproducible, non-security problem affecting the Current Repository or an Official Distribution and expressible through public, non-sensitive facts. A narrow question about repository policy, the LICENSE, Third-Party Materials, Ordinary Application Use, packaging status, build status, or the Security Reporting Policy belongs to the ',
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
            'The same classification controls startup evidence that looks useful. Operating-system, Python, PyQt6, GPU, OpenGL, package, or build facts are admissible as ',
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
            '; if the decisive material cannot be made public without disclosing unsafe content, the public report is the wrong surface rather than an incomplete version of the right one.',
          ],
          'A startup locator has no independent publication authority. It proves only the implemented point reached by the launch chain: which gate executed, which surface appeared, which surface accepted focus, and where execution stopped or diverged. Support documentation and `.github/ISSUE_TEMPLATE/` files supply the controlling public-channel classification. That classification may admit a reproducible non-security problem report, confine the matter to a limited public question, require only a minimal request for a Private Reporting Channel, or exclude public submission altogether. The Manual therefore stops at implemented startup localization. It does not transform local evidence into admissible public evidence, does not authorize publication of secrets or vulnerability detail, does not receive Contribution Materials, replacement text, design assets, datasets, generated files, shader rewrites, or implementation proposals, and does not convert unrelated machine-specific material into reportable Ludoxel evidence.',
        ],
      },
      {
        id: 'starting-ludoxel-play-space-and-state-boundary',
        title: 'Play-Space and Saved-State Questions Begin After Launch',
        body: [
          'After the viewport is loaded and focused, the active surface rather than the startup chain controls the next reading. My World uses movement, camera control, hotbar state, inventory, block interaction, and world persistence. Othello uses board state, legal-move selection, side state, settings, board animation, and engine response. A loaded viewport showing the wrong surface is a play-space or restored-state question, not evidence that the module entry point failed.',
          [
            'The immediate Manual continuation is ',
            {
              kind: 'link',
              label: 'Reading the Main Window',
              href: '/docs/manual/starting-the-application/window-and-item-surfaces/reading-the-main-window',
            },
            ' or ',
            {
              kind: 'link',
              label: 'Switching Play Spaces',
              href: '/docs/manual/starting-the-application/launch-and-space-selection/switching-play-spaces',
            },
            '. Camera behavior after a loaded viewport belongs to ',
            {
              kind: 'link',
              label: 'Changing Camera Preferences',
              href: '/docs/settings/visual-and-audio-settings/camera-and-crosshair/changing-camera-preferences',
            },
            ', not to the launch chain.',
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
      'Explains how the pause menu switches the active session between My World and Othello, how each space keeps its own world and controller state, and how the selected space is normalized, loaded, and persisted with player preferences. Switching changes the active session context; it does not merge My World and Othello data.',
    sections: [
      {
        id: 'switching-play-spaces-two-sessions',
        title: 'Two Independent Sessions Exist at Once',
        body: [
          'Ludoxel does not keep one flat runtime object that toggles between modes. The play-space context constructs a separate `SessionManager` for My World and for Othello, both backed by the same default block registry, and remembers which one is active. My World state, Othello state, player state, AI state, and settings meet only at the application aggregate; each session keeps its own domain meaning.',
          'Because both sessions exist simultaneously, switching is a change of which session is active, not a rebuild of the other. The active space id starts at My World and is normalized so that unknown values fall back to My World rather than producing an undefined state.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The play-space context owns both sessions and tracks the active space id.',
            code: `@dataclass
class PlaySpaceContext:
  my_world: SessionManager
  othello: SessionManager
  active_space_id: str = PLAY_SPACE_MY_WORLD

  def session_for(self, space_id: object) -> SessionManager:
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
        id: 'switching-play-spaces-pause-menu',
        title: 'The Pause Menu Triggers the Switch',
        body: [
          'Switching is initiated from the pause overlay. The overlay emits `play_my_world_requested` and `play_othello_requested`, which the overlay-navigation controller binds to `switch_play_space` with `resume=True` so the game resumes immediately after the new space is loaded.',
          'Because the request comes from the pause menu, the player is never mid-input when the switch happens. Held mouse actions are reset, any in-progress AI route edit is cancelled, and block-break particles are cleared before the active session changes.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Pause-overlay signals are bound to the play-space switch with immediate resume.',
            code: `viewport._overlay.play_my_world_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_MY_WORLD, resume=True))
viewport._overlay.play_othello_requested.connect(lambda: switch_play_space(viewport, PLAY_SPACE_OTHELLO, resume=True))`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-same-space-guard',
        title: 'Requesting the Active Space Only Resumes',
        body: [
          'If the requested space equals the currently active space, `switch_play_space` does not tear anything down. It either resumes from the pause overlay (when `resume` is set) or returns. This guard keeps a redundant request from reloading a world that is already live.',
          'The comparison is made on normalized ids, so a stray or differently cased value resolves to the same canonical space before the equality check, and the same-space path is taken rather than a spurious reload.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'A request for the already-active space short-circuits to resume.',
            code: `def switch_play_space(viewport, space_id, *, resume=False):
  normalized = normalize_play_space_id(space_id)
  if normalized == normalize_play_space_id(viewport._state.current_space_id):
    if resume:
      resume_from_overlay(viewport)
    return`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-loading-label',
        title: 'A Loading Overlay Names the Target Space',
        body: [
          'When the space actually changes, the viewport begins a loading phase with a label that names the destination: "Loading My World..." or "Loading Play Othello...". This is the same preparing-overlay machinery used at startup, reused for the transition so the visible feedback is consistent.',
          'During this phase the active session reference is replaced, the world upload tracker is reset against the new world, the previous selection target is invalidated, and the renderer selection is cleared. The label is the player-visible signal that the switch is in progress rather than stalled.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The loading label is chosen from the normalized destination space.',
            code: `target_label = "Loading My World..." if normalized == PLAY_SPACE_MY_WORLD else "Loading Play Othello..."
viewport._state.current_space_id = normalized
viewport._session = viewport._sessions.set_active_space(normalized)
viewport._begin_loading(target_label)
viewport._upload.reset(viewport._renderer, world=viewport._session.world)`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-learning-runtime',
        title: 'The AI Learning Runtime Follows the Active Session',
        body: [
          'If an AI learning runtime is attached, switching flushes it against the session that is being left and reconfigures it for the session that is becoming active. This keeps generated learning data tied to the session that produced it instead of bleeding across spaces.',
          'The flush happens before the new session is configured, so any pending learning state from the previous space is committed first. Only after that does the runtime begin observing the new active session.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The learning runtime is flushed and reconfigured around the session swap.',
            code: `_learning_runtime = getattr(viewport, "_learning_runtime", None)
if _learning_runtime is not None:
  _learning_runtime.flush(viewport._session)
  _learning_runtime.configure_session(viewport._session)`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-hud-resync',
        title: 'HUD and First-Person Targets Resync to the New Space',
        body: [
          'After the session changes, the controller resynchronizes the surfaces that depend on the active space: hotbar widgets, the first-person held-item target, the Othello HUD text, and gameplay HUD visibility. Othello hides the block-gameplay HUD that My World shows, so the HUD must follow the destination space rather than carrying over.',
          'If the destination is Othello, an AI move request may be issued as part of the switch. These resyncs are why a switched-into space looks complete immediately instead of showing leftover widgets from the previous space.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Surface resynchronization after the active session changes.',
            code: `settings_controller.sync_hotbar_widgets(viewport)
settings_controller.sync_first_person_target(viewport)
othello_controller.sync_hud_text(viewport)
viewport._sync_gameplay_hud_visibility()
othello_controller.maybe_request_ai(viewport)`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-persistence',
        title: 'The Selected Space Is Saved and Restored',
        body: [
          'The active space id is part of saved runtime state, so the space a session is left in is the space it returns to. On load, the value is normalized through the same `normalize_play_space_id` rule, which means a missing or invalid stored id resolves to My World instead of failing.',
          'Persistence stores the selection, not the merged contents of both spaces. Reading a saved world or saved Othello board is a separate concern handled by the corresponding data pages; switching only records which space should be active when the session resumes.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Known space ids and the My World default used during normalization.',
            code: `def known_space_ids(self) -> tuple[str, ...]:
  return PLAY_SPACE_IDS

def active_session(self) -> SessionManager:
  return self.session_for(self.active_space_id)`,
          },
        ],
      },
      {
        id: 'switching-play-spaces-no-merge',
        title: 'Switching Never Merges State',
        body: [
          'A frequent misreading is that switching combines the two spaces. It does not. Othello board state is never written into My World, and My World blocks are never flattened into Othello. The two sessions are constructed independently and only the active reference is exchanged.',
          'If a switch appears to lose or duplicate state, the evidence belongs to the specific session that owns that state, not to the switch itself. The switch changes context; the per-space world, player, and AI state are owned by `SessionManager`, and saved-state questions route to the data pages for that space.',
        ],
      },
    ],
    relatedTitles: ['Starting Ludoxel', 'Reading Saved World State', 'Reading Saved Othello State'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Starting the Application',
    group: 'Window and Item Surfaces',
    title: 'Reading the Main Window',
    description:
      'Identifies the visible regions of the Ludoxel game window and the components behind them: the renderer-drawn central viewport, the HUD layered above it, the preparing overlay, and the modal surfaces that take focus. Rendered labels are not the saved schema, and overlays read and write through controllers rather than renderer buffers.',
    sections: [
      {
        id: 'reading-the-main-window-composition',
        title: 'The Game Screen Stacks a Viewport and a HUD',
        body: [
          '`GameScreen` is the central widget of the main window. It places a platform-specific viewport widget in a zero-margin vertical layout and creates a HUD widget that is driven from the viewport. The viewport renders the world; the HUD is layered above it and receives payloads through a signal connection.',
          'On macOS the viewport is the wgpu-backed renderer widget; on every other platform it is the OpenGL widget. Both present the same game surface to the player, so what you see in the central region is renderer output, and the labels drawn over it are HUD elements, not the underlying simulation or save data.',
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
          'Inventory, pause, settings, death, AI settings, and Othello settings are overlay widgets that temporarily take input focus over the viewport. While one is open, gameplay input is blocked, and the overlay reads and writes through controllers rather than mutating renderer buffers directly.',
          'These surfaces sit above the viewport in the same window. Which overlay is open determines what a key press or click does next, so when describing the window state it matters whether the central viewport is live or whether an overlay such as the inventory or pause menu currently owns input.',
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
          'The message text is set from the cause of death and defaults to "Player died." The Respawn button emits a single request that the controller turns into a respawn. Recognizing this surface in the window tells you the session is in the dead state rather than active play.',
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
          'The game screen sets a styled dark background so that, before or around viewport content, the window is a solid surface rather than transparent. The background color is applied with a narrow object-name selector on the game screen widget itself.',
          'This is why the window never shows desktop bleed-through behind the viewport: the central widget paints its own background, the viewport renders over it, and the HUD and overlays stack above. The visible window is therefore a deliberate stack of solid background, renderer output, HUD, and any active overlay.',
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
      'Describes the nine-slot hotbar: how the selected slot is chosen with the number keys and the mouse wheel, how the currently held item is resolved, how slots are cleared, and how the display widget mirrors the simulation hotbar without owning it. The HUD hotbar is a transparent display layer over the viewport.',
    sections: [
      {
        id: 'using-the-hotbar-nine-slots',
        title: 'The Hotbar Has Exactly Nine Slots',
        body: [
          'The hotbar size is fixed at nine. Slot contents are normalized to a tuple of nine item-id strings, padding with empty strings and truncating extras, so the hotbar always has a well-defined width regardless of what was loaded or assigned.',
          'Each slot holds an item id or the empty string for an empty hand. The selected index is also normalized into the valid range, clamping out-of-range values to the nearest endpoint rather than wrapping unexpectedly.',
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
          'This single source of truth is what the first-person held-item visual and placement logic read. An empty selected slot means an empty hand, which is why selecting an empty slot stops showing a held block.',
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
          'The on-screen hotbar widget is a display of the simulation hotbar, not its owner. It builds nine fixed-size display slots, marks itself transparent to mouse events, and is synchronized by being told the slot contents and the selected index. It renders icons and tooltips but never captures input.',
          'When synchronized, the widget normalizes the incoming slots and index exactly as the simulation does, then sets each slot button to the matching item, tooltip, and selected state. Item icons are supplied asynchronously by a photo provider and updated as they become available.',
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
      'Explains the inventory overlay: how it opens and closes, how creative and survival modes differ, how the searchable item grid is built from the block registry and special-item catalog, and how clicking, dragging, or pressing a number key assigns an item to a hotbar slot. The overlay edits hotbar state through signals.',
    sections: [
      {
        id: 'using-the-inventory-overlay-toggle',
        title: 'The Inventory Opens With E and Closes With E or Escape',
        body: [
          'The inventory is bound to the toggle-inventory action, which defaults to E. Inside the overlay, the same bound action or the Escape key closes it. Closing emits a closed signal so the controller can hide the overlay and re-arm the viewport.',
          'While the overlay is open it holds input focus, so the keys that would otherwise move the player are interpreted by the overlay. This is why opening the inventory is a deliberate state change rather than a transient popup.',
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
          'The grid is laid out twelve columns wide. Because the entries come straight from the registry and catalog, the inventory always reflects the items the simulation actually knows about rather than a hard-coded list.',
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
          'This signal boundary is why the inventory is a presentation surface that requests changes rather than a direct mutator of simulation state. The controller decides whether the change is allowed (for example, only in creative mode) before applying it.',
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
      'Explains how mouse movement turns into camera rotation: relative mouse deltas become yaw and pitch changes applied to the player each fixed step, pitch is clamped to avoid flipping, and the look axes can be inverted. Camera rotation is applied through the player step, not directly to the renderer camera.',
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
          'Accumulating deltas means rotation is continuous and unbounded by the screen edges: the pointer is held at the center of the viewport while only its movement is reported. This is what allows you to keep turning in one direction without the cursor leaving the window.',
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
          'Relative look deltas are only produced while the mouse is captured. When capture is off, the pointer is a normal cursor and no look delta is generated, which is why menus and overlays do not rotate the camera.',
          'On the polling path, the captured cursor is repeatedly compared against the viewport center and warped back, turning each frame’s offset into a delta. If you cannot look around, the first thing to confirm is whether the viewport is captured.',
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
      'Explains pointer capture during gameplay: how the viewport grabs the mouse and keyboard, hides the cursor, and recenters it so movement becomes a relative look delta, including the macOS native relative-capture and keyboard-guard paths. Capture is released when an overlay opens or the viewport loses focus.',
    sections: [
      {
        id: 'using-mouse-capture-grab',
        title: 'Capture Grabs the Mouse and Keyboard',
        body: [
          'Turning capture on activates the window, focuses the viewport, hides the cursor with a blank cursor override, and grabs both the mouse and keyboard. Grabbing routes pointer and key events to the viewport so gameplay input is not stolen by other widgets.',
          'The cursor is hidden both through a Qt override cursor and by setting the blank cursor on the viewport and its host window, so the pointer does not reappear over the window chrome while you play.',
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
          'Keeping the keyboard guard separate from cursor handling means a problem with one does not imply a problem with the other. Cursor capture concerns pointer hiding and look deltas, while the guard concerns native key delivery during play.',
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
          'The poll re-applies the capture state every frame, which keeps focus, the hidden cursor, and the grabs in place even if the window manager tried to change them. This is why capture stays stable during continuous play.',
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
      'Describes movement: how WASD, jump, crouch, and sprint are read from keybinds into a per-frame input frame, how the fixed-step player advance applies walking, flying, jumping, and auto-jump, and how collision integration resolves the result. Movement is part of the same fixed step as camera rotation and collision.',
    sections: [
      {
        id: 'moving-the-player-wasd',
        title: 'Movement Comes From Bound Keys',
        body: [
          'Forward, backward, left, and right are bound actions resolved through the keybind settings. The defaults are W, S, A, and D. The input adapter checks which movement actions are currently pressed and combines them into a forward and a strafe value for the frame.',
          'Forward minus backward gives the forward axis, and right minus left gives the strafe axis, so opposing keys cancel out. The result is a small movement vector that the player step turns into velocity.',
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
          'This single control object is the only movement input the player advance reads. Packing everything for the step keeps movement deterministic with respect to the fixed timestep rather than depending on event timing.',
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
          'Both paths end by integrating against the world with collisions, but the velocity model that feeds the integration differs. This is why flying ignores fall state while grounded movement tracks the fall start height.',
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
          'The phase is also what drives view bobbing and the held-item swing. Because it scales with speed, footsteps and bob keep pace with how fast the player is actually moving rather than ticking at a fixed rate.',
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
          'These eased offsets are applied to the eye height the renderer reads, so the view settles instead of jumping. They are visual smoothing on top of the collision result, not changes to the player’s collision box.',
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
      'Explains the death and respawn flow: how fall distance and the void produce damage, what the death overlay shows, and what respawn resets and preserves. Fall damage starts beyond a safe distance, void damage applies in intervals below a threshold depth, and respawn restores the player without erasing saved content.',
    sections: [
      {
        id: 'recovering-after-death-health',
        title: 'Health Is the Default Twenty Points',
        body: [
          'The player starts with twenty health points, shown by the hotbar health strip as ten hearts. Damage reduces this value, and reaching zero is what puts the session into the dead state. The health strip fills each heart proportionally, so half-heart amounts are visible.',
          'Health is simulation state, while the heart strip is a HUD display of it. Recovering after death is about how that value reaches zero and how respawn restores it, not about the way the hearts are drawn.',
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
          'The fall distance is captured on landing, using the recorded airborne start height. This is why a long drop hurts while stepping off a small ledge does not, and why the damage scales with how far past three blocks you fell.',
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
          'This is a steady drain rather than a single hit, so falling into the void leads to death over a short time unless the player gets back above the threshold. The remaining sub-interval time is carried over so the cadence stays consistent across frames.',
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
          'This separation is why dying is recoverable: only the player’s position and condition are reset, while everything you built or configured remains. If something other than the player appears to have been lost after a death, that points to a saved-state question rather than the respawn itself.',
        ],
      },
      {
        id: 'recovering-after-death-hurt-feedback',
        title: 'Taking Damage Produces Hurt Feedback',
        body: [
          'Non-fatal damage advances a hurt state on the player each step, which drives a short hurt flash and a brief view tilt. These are timed effects that decay on their own, so they fade after a hit rather than persisting.',
          'This feedback is what signals that damage occurred before death. If health is dropping without an obvious cause, the hurt feedback and the death message together identify whether the damage came from a fall, the void, or melee.',
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
];
