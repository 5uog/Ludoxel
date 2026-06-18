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
      'Explains what happens between launching Ludoxel and seeing the playable desktop window. The page follows the real startup path from the module entry point, through application bootstrap and root resolution, into the PyQt presentation shell, so players can separate launch evidence from saved data, rendering, packaging, and support issues.',
    sections: [
      {
        id: 'starting-ludoxel-entry-point',
        title: 'The Launch Starts at the Desktop Entry Point',
        body: [
          'Starting Ludoxel begins with the Python module entry point. The file does not build the window itself, does not choose a play space, and does not load renderer resources directly. Its job is narrower: prepare multiprocessing support for packaged execution and delegate control to `ludoxel.application.run_app`.',
          'That boundary matters for the Manual page. If the application never opens a window, the first confirmed fact is that the entry point attempted to enter the application bootstrap. A player-facing explanation should not jump from that symptom to renderer failure, saved-world corruption, or official release status unless later evidence points there.',
          'The entry point also shows why this article should avoid claiming that startup is a website route or a documentation action. The user is starting the desktop application, and the next owner is the application bootstrap layer.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The desktop module entry point delegates startup to the application layer.',
            code: `# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import multiprocessing

from ludoxel.application import run_app

if __name__ == "__main__":
  multiprocessing.freeze_support()
  run_app()`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-application-export',
        title: 'The Public Application Export Is Lazy',
        body: [
          '`ludoxel.application` exposes `run_app` without importing the whole bootstrap path eagerly. The module uses `__getattr__` to import `ludoxel.application.bootstrap` only when `run_app` is requested. For a public manual article, this is worth mentioning only as a boundary: the entry point asks the application layer to start the app, and the application layer resolves the concrete bootstrap function.',
          'This is not a player control, but it keeps the startup explanation honest. The entry point is not secretly constructing widgets, loading the theme, or restoring play-space state. Those actions happen later. If a report says the process exits before any visible window appears, the relevant evidence is still before the presentation surface.',
          'The page should use this boundary to prevent false conclusions. A missing desktop window is not automatically an Othello problem, a hotbar problem, or a camera problem; those systems are only available after the bootstrap reaches the presentation shell.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The application package resolves `run_app` through the bootstrap module only when it is requested.',
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
        id: 'starting-ludoxel-root-resolution',
        title: 'Bootstrap Resolves the Roots Before the Window Exists',
        body: [
          'The application bootstrap determines three roots before the presentation window is started: the project root, the resource root, and the runtime data root. Those roots answer different questions. The project root identifies the application context, the resource root identifies bundled assets such as fonts, icons, theme material, shaders, and data files, and the runtime data root identifies where user-specific state should live.',
          'This is the correct place to explain why startup is not the same subject as saved state. The bootstrap needs a data root before the window opens, but that does not mean every saved world or setting has already been displayed. It means the application has selected the storage location that later persistence code can use.',
          'The same distinction also prevents a local run from being described as a distribution result. Root resolution supports both source-tree execution and packaged execution, but seeing a local window does not by itself prove that a package is official, complete, or redistributable.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The bootstrap computes the project, resource, and runtime data roots before entering presentation code.',
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
        ],
      },
      {
        id: 'starting-ludoxel-python-runtime',
        title: 'Runtime Selection Happens Before User Interaction',
        body: [
          'The bootstrap checks the Python runtime before the PyQt window is created. In source-tree execution, it can look for a preferred Python 3.14 executable and re-execute the module with that interpreter. In frozen execution, the runtime is already part of the packaged application, so the check returns without replacing the process.',
          'For a player, the visible consequence is simple: a failure before any window appears may belong to the startup environment, not to a play-space rule or UI overlay. That is why this article should describe the window as the first user-visible milestone rather than the first startup operation.',
          'The article should not ask ordinary players to edit interpreter paths as a normal gameplay step. It should only explain that the supported runtime check occurs before the window is available, so reports about a missing window should preserve environment evidence separately from in-game evidence.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Runtime selection exits early for frozen builds and for an already supported Python runtime.',
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
        id: 'starting-ludoxel-runtime-data-root',
        title: 'The Data Root Is User State, Not Source Code',
        body: [
          'The runtime data root is where Ludoxel stores user-specific runtime state. It can be overridden with `LUDOXEL_DATA_ROOT`, otherwise it follows platform conventions: LocalAppData on Windows, Application Support on macOS, XDG data home on compatible systems, or a user-local fallback. This keeps normal saved data out of the repository source tree.',
          'This is the correct basis for explaining startup reports that mention previous worlds or preferences. If the window opens but previous state is absent, startup itself has already passed the window milestone. The next question is whether the expected runtime data root was used, whether the relevant state file exists, and whether persistence accepted it.',
          'The Manual page should not turn that storage rule into a full persistence article. It should only explain enough for the player to separate “Ludoxel did not start” from “Ludoxel started, but did not show the data I expected.”',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The runtime data root is resolved outside the repository by default.',
            code: `def default_runtime_data_root(project_root: Path | None = None) -> Path:
  env_root = os.environ.get("LUDOXEL_DATA_ROOT", "").strip()
  if env_root:
    return Path(env_root).expanduser().resolve()

  if sys.platform.startswith("win"):
    base = os.environ.get("LOCALAPPDATA", "").strip() or os.environ.get("AppData", "").strip()
    if base:
      return (Path(base).expanduser() / "Ludoxel").resolve()

  if sys.platform == "darwin":
    return (Path.home() / "Library" / "Application Support" / "Ludoxel").resolve()`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-othello-storage-hook',
        title: 'Othello Storage Hooks Are Installed During Bootstrap',
        body: [
          'The bootstrap installs Othello opening-book storage hooks before it enters the presentation shell. That does not mean the player is already in Othello, and it does not mean the Othello board has been drawn. It means the application-level storage functions are registered early enough that Othello code can use the same root and persistence rules once the relevant play space is active.',
          'This is a useful example of startup work that should not be mistaken for visible gameplay. A player cannot infer the active play space only from the existence of Othello storage preparation. The active surface must still be read from the desktop window after it appears.',
          'If the user reports a launch problem, mention Othello storage only when the failure evidence reaches application bootstrap or opening-book state. If the window opens and the board is visible, the next page should be about Othello state or settings, not the generic startup path.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The bootstrap installs the Othello opening-book storage hooks before starting the presentation shell.',
            code: `from ludoxel.application.persistence.stores.othello_book import install_othello_book_storage_hooks
from ludoxel.presentation.interface.windows.main import run_app as _run

install_othello_book_storage_hooks()
_run(project_root=project_root, resource_root=resource_root, data_root=data_root)`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-presentation-shell',
        title: 'The Presentation Shell Creates the Desktop Application',
        body: [
          'After bootstrap, control enters the presentation shell. That shell creates the `QApplication`, sets application identity, loads an application icon when available, registers bundled fonts, loads the QSS theme, configures single-instance activation, and then prepares the main window. This is the point where startup begins to become visible to the player.',
          'The Manual article should describe this as the transition from application preparation to desktop presentation. If the process reaches this phase but the user sees a font or theme failure, the evidence is different from a failure before root resolution. If a second launch only activates an existing window, the evidence also belongs to presentation-level activation rather than play-space state.',
          'The presentation shell is still not the renderer. It prepares the Qt application and host window. The viewport and renderer-facing session state are reached through the game screen and viewport widget after the main window is created.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The presentation shell creates the Qt application and applies application identity before showing the window.',
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
        ],
      },
      {
        id: 'starting-ludoxel-font-and-theme-loading',
        title: 'Fonts and Theme Are Startup Requirements',
        body: [
          'The presentation shell registers bundled UI fonts and applies the theme stylesheet before the player reaches the final visible game window. If bundled font registration fails, the implementation raises a runtime error rather than continuing with a partially styled application. That makes font and theme evidence part of launch troubleshooting, not a cosmetic afterthought.',
          'This also explains why the startup article should not tell players to fix visual problems by editing Python widgets. The application loads the theme through QSS and font helpers, then applies the resulting stylesheet to the Qt application. Player-facing documentation should describe the visible symptom and direct theme implementation details to developer-facing pages only when necessary.',
          'If a player reports that the startup splash appears but the game surface never arrives, the visible status text, font error, or theme loading error can be relevant evidence. If the game window is fully visible and only a later overlay looks wrong, the report should move to the page for that overlay or UI surface.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The presentation shell installs bundled fonts and applies QSS before the main window is shown.',
            code: `fonts = install_minecraft_fonts(font_dir=(bundled_root / "assets" / "fonts"))
if not bool(fonts.ok):
  details = "\\n".join(str(error) for error in tuple(fonts.errors) if str(error))
  raise RuntimeError(f"Ludoxel bundled font registration failed.\\n{details}")

apply_application_font(app=app, family=str(fonts.family), point_size=12, fallback_families=tuple(fonts.fallback_families))
theme_qss = load_theme_stylesheet(styles_dir)
if theme_qss:
  app.setStyleSheet(str(font_qss) + theme_qss)`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-single-instance-activation',
        title: 'A Second Launch Can Activate the Existing Window',
        body: [
          'Startup also checks whether another Ludoxel instance is already listening for activation. If an existing instance accepts the activation request, the new launch returns instead of opening a second independent game window. From the player perspective, the visible result may be that the already-running window comes forward.',
          'This behavior belongs in Starting Ludoxel because it changes what a “launch” looks like. A player may double-click the application and see an existing session activate rather than a fresh window. That is not saved-state restoration and not a play-space switch; it is single-instance activation.',
          'Reports should therefore distinguish “nothing happened,” “an existing window came forward,” and “a new window opened.” Those are different startup observations and should not be flattened into the same symptom.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'Single-instance activation can end a second startup before a new main window is created.',
            code: `relay = SingleInstanceRelay(managed_data_root, app)
if relay.activate_existing_instance():
  return
relay.listen()
app.aboutToQuit.connect(relay.close)`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-player-name-gate',
        title: 'The Player Name Dialog Can Appear Before the Main Window',
        body: [
          'Before creating the main window, the presentation shell loads persisted application state and checks whether a normalized player name is already available. If no launch player name is available, it opens the player name dialog. That dialog is part of startup because the game window has not yet been created.',
          'A player who sees the name dialog has passed the entry point, bootstrap, root resolution, runtime check, storage hook installation, Qt application setup, font registration, and theme loading. The report should not say that Ludoxel failed to start at the earliest stage. The correct observation is that startup is waiting for the player-name gate.',
          'If the dialog is cancelled, the presentation shell returns before the main window is created. That is an intentional exit path and should be described separately from a crash or renderer failure.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The player name dialog appears only when no launch player name is restored.',
            code: `persisted_state = AppStateStore(project_root=root, data_root=managed_data_root).load()
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
        id: 'starting-ludoxel-main-window',
        title: 'The Main Window Hosts the Game Screen',
        body: [
          'The main window is the desktop host for the game screen. It receives the project root, resource root, data root, and launch player name, creates `GameScreen`, installs it as the central widget, and connects fullscreen behavior to the viewport. That is the point where the startup path becomes the visible desktop application structure.',
          'This is the correct place to separate the window from the play space. The main window hosts the screen; it does not mean that the user has already interacted with My World or Othello. The active play space still needs to be read from the viewport and session state after the screen is live.',
          'When writing reports, “the main window appeared” is a different milestone from “the viewport finished loading.” A visible host window with a preparing overlay can still be in startup; a loaded viewport with active controls has moved into ordinary session use.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The main window owns the game screen as its central widget.',
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
        ],
      },
      {
        id: 'starting-ludoxel-viewport-preparation',
        title: 'The Game Screen Shows Viewport Preparation',
        body: [
          '`GameScreen` creates the platform-specific viewport widget and the HUD, then shows a loading overlay while the viewport is preparing. The overlay text is “Preparing viewport...”, and it is tied to viewport loading state and loading status signals. This is the first visible feedback that belongs directly to the game surface rather than the outer bootstrap.',
          'That visible loading overlay is important evidence. If the window appears with “Preparing viewport...” and stays there, the application has passed startup phases that occur before `GameScreen`. The relevant report should include the overlay text and whether it changes, not just say that the application did not start.',
          'When the viewport finishes loading, the overlay hides and the viewport receives focus. That is the handoff from launch into ordinary world or play-space interaction.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The game screen shows the preparing overlay until the viewport reports that loading has finished.',
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
self.viewport.loading_finished.connect(self._handle_loading_finished)`,
          },
        ],
      },
      {
        id: 'starting-ludoxel-first-observation',
        title: 'First Observation Should Name the Visible Milestone',
        body: [
          'The first observation should name the latest visible milestone. Examples include “no window appears,” “the player name dialog appears,” “the startup splash appears,” “the main window appears with Preparing viewport,” or “the viewport is loaded and accepts input.” Each sentence points to a different part of the startup path.',
          'This page should not use vague evidence such as “startup is broken” when a more precise visible milestone exists. A precise observation lets another reader decide whether the problem belongs before bootstrap, during root resolution, inside Qt presentation setup, at the player-name gate, while preparing the viewport, or after the session becomes interactive.',
          'The observation should also name whether the visible surface is accepting input. A dialog, splash, loading overlay, active viewport, settings overlay, or Othello board each changes what the next key or mouse action means.',
        ],
      },
      {
        id: 'starting-ludoxel-play-space-context',
        title: 'The Active Play Space Comes After Startup Preparation',
        body: [
          'Startup prepares the application so that a play space can become visible, but it should not be described as the same thing as playing My World or Othello. Once the viewport is loaded, the user can read the active play space from the visible surface and then use play-space-specific pages.',
          'This matters because My World and Othello have different control expectations. My World uses movement, camera control, hotbar state, inventory, and block interaction. Othello uses a board surface, legal move selection, side state, settings, and board animation. Starting Ludoxel should only carry the reader to the point where the correct surface can be identified.',
          'If the visible surface after launch is not the one the player expected, the follow-up is `Switching Play Spaces` or a saved-state page, not a rewrite of the startup path. Startup answers how the desktop session reached a visible surface; play-space documentation answers what that surface means.',
        ],
      },
      {
        id: 'starting-ludoxel-saved-state-boundary',
        title: 'Saved State Begins After the Data Root Is Chosen',
        body: [
          'The startup path chooses the data root and later the presentation shell loads persisted application state. That does not make saved state the same subject as launch. Saved state has its own evidence: player state, world state, Othello settings, inventory, and runtime integrity behavior.',
          'The article should therefore separate “the app opened” from “the expected state appeared.” If the player name dialog appears unexpectedly, the persisted state may not contain a usable player name. If the viewport opens but the expected world is missing, the application has still started; the report has moved to saved-world or play-space restoration.',
          'This boundary keeps the manual useful. Players can describe the visible launch result first, then move to data pages only when the desktop window is already available and the missing evidence is specifically saved content.',
        ],
      },
      {
        id: 'starting-ludoxel-reportable-evidence',
        title: 'Report the Startup Milestone, Not a Guess',
        body: [
          'A useful startup report names the action, the latest visible milestone, the expected result, the actual result, and the environment. It should avoid private paths, credentials, tokens, or unrelated source edits. The goal is to identify where the startup path stopped without asking the user to publish unsafe information.',
          'Good evidence for this page includes whether a second launch activates an existing window, whether the player name dialog appears, whether “Preparing viewport...” is visible, whether the splash closes, whether the main window appears, and whether the viewport receives focus after loading. These are concrete facts from the actual startup flow.',
          'A report should not conclude that the renderer, Othello engine, packaging process, or legal distribution status is responsible unless the symptom reaches that subject. Starting Ludoxel is a launch article, so the report should stay inside launch evidence until another page becomes clearly relevant.',
        ],
        codeBlocks: [
          {
            language: 'py',
            caption: 'The viewport loading handoff hides the overlay and gives focus to the viewport.',
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
        id: 'starting-ludoxel-adjacent-pages',
        title: 'Use Adjacent Pages Only After the Subject Changes',
        body: [
          'The related pages are real handoffs, not filler. Use `Reading the Main Window` after the desktop window is visible and the player needs help identifying surfaces. Use `Switching Play Spaces` after the window is interactive and the question is which mode or play space is active. Use `Changing Camera Preferences` after the viewport receives input but the camera response itself needs adjustment.',
          'The startup article should not repeat those pages. Its job is to explain the path to the first usable window and the evidence that proves how far startup progressed. Once the player is asking about hotbar selection, Othello moves, camera feel, inventory, saved worlds, or support routing, the subject has changed.',
          'This also protects the article from legal or distribution drift. A local run, a visible window, or a loaded viewport does not create redistribution permission, official release status, or private support routing. Those topics belong to Distribution, Legal, and Support pages.',
        ],
      },
      {
        id: 'starting-ludoxel-closing-check',
        title: 'Closing Check for a Successful Start',
        body: [
          'A successful start means Ludoxel moved from the module entry point, through application bootstrap, through root resolution, through presentation shell setup, through any player-name gate, and into a visible game window. If the viewport finishes loading and receives focus, the player can continue with ordinary Manual pages.',
          'The player should finish this article with a concrete sentence: “Ludoxel opened to the desktop window and the viewport is ready,” or “Ludoxel stopped at the player name dialog,” or “Ludoxel showed Preparing viewport and did not continue.” Those statements are narrow enough to act on and precise enough to hand off to the correct next page.',
          'That precision is the point of this article. It makes startup explainable without pretending to cover every saved-state, renderer, settings, Othello, support, distribution, or legal question in the project.',
        ],
      },
    ],
    relatedTitles: ['Reading the Main Window', 'Switching Play Spaces', 'Changing Camera Preferences'],
  }),
  defineDocsArticle({
    category: 'Manual',
    subcategory: 'Starting the Application',
    group: 'Launch and Space Selection',
    title: 'Switching Play Spaces',
    description:
      'Describes how the active My World or Othello space is selected and persisted. This page treats play-space selection as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'switching-play-spaces-scope',
        title: 'Switching Play Spaces Player Scope',
        body: [
          'Ludoxel stores the current play-space id as runtime state. The value selects My World or Othello, and unknown values normalize back to the default My World space. The fact also tells the reader which evidence to preserve for player scope: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Player Scope.',
          'Player Scope defines the useful size of Switching Play Spaces. The article should be broad enough to explain play-space selection, but narrow enough that merging My World and Othello state remains outside the conclusion.',
          'Use player scope to keep Switching Play Spaces tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'switching-play-spaces-first-observation',
        title: 'Switching Play Spaces First Observation',
        body: [
          'Player Scope defines the useful size of Switching Play Spaces. The article should be broad enough to explain play-space selection, but narrow enough that merging My World and Othello state remains outside the conclusion. The fact also tells the reader which evidence to preserve for first observation: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / First Observation.',
          'A direct observation for Switching Play Spaces should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'A public report based on the first observation part of Switching Play Spaces should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'switching-play-spaces-input-surface',
        title: 'Switching Play Spaces Input Surface',
        body: [
          'Use player scope to keep Switching Play Spaces tied to Starting the Application; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for input surface: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Input Surface.',
          'Switching Play Spaces separates the surface that accepts input from the component or document that controls the result. This is especially important when changing the active game context crosses a saved value, a renderer output, or a public form.',
          'A public report based on the input surface part of Switching Play Spaces should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'switching-play-spaces-session-owner',
        title: 'Switching Play Spaces Session Owner',
        body: [
          'Play-space switching selects between My World and Othello through the current play-space id. Each space keeps its own world and controller state instead of sharing one flat runtime object. The point matters in session owner because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Session Owner.',
          'Ownership in Switching Play Spaces is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'The useful result of Switching Play Spaces session owner is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Launch and Space Selection.',
        ],
      },
      {
        id: 'switching-play-spaces-visible-feedback',
        title: 'Switching Play Spaces Visible Feedback',
        body: [
          'A direct observation for Switching Play Spaces should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for visible feedback: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Visible Feedback.',
          'Visible feedback for Switching Play Spaces should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Launch and Space Selection.',
          'A public report based on the visible feedback part of Switching Play Spaces should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'switching-play-spaces-saved-state-link',
        title: 'Switching Play Spaces Saved State Link',
        body: [
          'A public report based on the first observation part of Switching Play Spaces should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Switching Play Spaces a public anchor for saved state link without adding behavior that the current category does not own. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Saved State Link.',
          'When Switching Play Spaces touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for saved state link does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Switching Play Spaces should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'switching-play-spaces-space-context',
        title: 'Switching Play Spaces Play-Space Context',
        body: [
          'Each play space keeps its own world, player, AI, and game-specific state. Switching spaces changes the session context; it does not merge Othello board data into My World or flatten My World blocks into Othello state. Switching Play Spaces uses the fact as play-space context evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Play-Space Context.',
          'The surrounding context for Switching Play Spaces decides which adjacent topic is relevant. Switching Play Spaces should be compared with Starting Ludoxel, Reading Saved World State, Reading Saved Othello State only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Switching Play Spaces crosses from play-space context into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'switching-play-spaces-recovery-path',
        title: 'Switching Play Spaces Recovery Path',
        body: [
          'Switching Play Spaces separates the surface that accepts input from the component or document that controls the result. This is especially important when changing the active game context crosses a saved value, a renderer output, or a public form. Switching Play Spaces uses the fact as recovery path evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Recovery Path.',
          'Recovery or follow-up for Switching Play Spaces should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use recovery path to keep Switching Play Spaces tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'switching-play-spaces-confusion-risk',
        title: 'Switching Play Spaces Confusion Risk',
        body: [
          'A public report based on the input surface part of Switching Play Spaces should state the action, expected result, actual result, environment, and any redaction needed before sharing. Switching Play Spaces uses the fact as confusion risk evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Confusion Risk.',
          'The main confusion risk in Switching Play Spaces is merging My World and Othello state. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Switching Play Spaces crosses from confusion risk into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'switching-play-spaces-reportable-evidence',
        title: 'Switching Play Spaces Reportable Evidence',
        body: [
          'My World state, Othello state, player state, AI state, and settings meet at the application aggregate, but each play space keeps its own domain meaning. The point matters in reportable evidence because changing the active game context can otherwise be mistaken for merging My World and Othello state. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Reportable Evidence.',
          'Reportable evidence for Switching Play Spaces should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Switching Play Spaces should not use reportable evidence to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'switching-play-spaces-adjacent-pages',
        title: 'Switching Play Spaces Adjacent Pages',
        body: [
          'Ownership in Switching Play Spaces is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. That reading gives Switching Play Spaces a public anchor for adjacent pages without adding behavior that the current category does not own. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Adjacent Pages.',
          'Adjacent pages matter for Switching Play Spaces, but adjacency does not move authority. Switching Play Spaces should be compared with Starting Ludoxel, Reading Saved World State, Reading Saved Othello State only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Switching Play Spaces adjacent pages is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Launch and Space Selection.',
        ],
      },
      {
        id: 'switching-play-spaces-public-boundary',
        title: 'Switching Play Spaces Public Boundary',
        body: [
          'The useful result of Switching Play Spaces session owner is a bounded explanation of play-space selection: enough detail to act, and enough restraint to avoid claims outside Launch and Space Selection. In Switching Play Spaces, public boundary is the difference between reading play-space selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Public Boundary.',
          'The public boundary for Switching Play Spaces is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Switching Play Spaces should not use public boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'switching-play-spaces-operator-reading',
        title: 'Switching Play Spaces Operator Reading',
        body: [
          'The selected space is saved with player preferences and restored through the persistence schema. If saved data is missing or invalid, the factories rebuild the appropriate default space state. In Switching Play Spaces, operator reading is the difference between reading play-space selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Operator Reading.',
          'An operator reading Switching Play Spaces should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'Switching Play Spaces should not use operator reading to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'switching-play-spaces-implementation-limit',
        title: 'Switching Play Spaces Implementation Limit',
        body: [
          'Visible feedback for Switching Play Spaces should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Launch and Space Selection. In Switching Play Spaces, implementation limit is the difference between reading play-space selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Implementation Limit.',
          'Implementation limits for Switching Play Spaces keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for implementation limit does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Switching Play Spaces should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'switching-play-spaces-safe-summary',
        title: 'Switching Play Spaces Safe Summary',
        body: [
          'Ludoxel stores the current play-space id as runtime state. The value selects My World or Othello, and unknown values normalize back to the default My World space. The fact also tells the reader which evidence to preserve for safe summary: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Safe Summary.',
          'The summary value of Switching Play Spaces is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use safe summary to keep Switching Play Spaces tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'switching-play-spaces-closing-check',
        title: 'Switching Play Spaces Closing Check',
        body: [
          'Player Scope defines the useful size of Switching Play Spaces. The article should be broad enough to explain play-space selection, but narrow enough that merging My World and Othello state remains outside the conclusion. In Switching Play Spaces, closing check is the difference between reading play-space selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Switching Play Spaces / Starting the Application / Launch and Space Selection / Closing Check.',
          'A final check for Switching Play Spaces should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'Switching Play Spaces should not use closing check to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
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
      'Identifies the visible areas of the Ludoxel game window and the state behind them. This page treats window composition as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'reading-the-main-window-scope',
        title: 'Main Window Player Scope',
        body: [
          'The central viewport is drawn by the active renderer backend. HUD text, crosshair, hotbar, Othello overlays, AI tags, and debug metrics are layered above renderer output without owning simulation rules. The point matters in player scope because reading the visible desktop surface can otherwise be mistaken for treating a rendered label as the saved schema. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Player Scope.',
          'Player Scope defines the useful size of Reading the Main Window. The article should be broad enough to explain window composition, but narrow enough that treating a rendered label as the saved schema remains outside the conclusion.',
          'The useful result of Reading the Main Window player scope is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'reading-the-main-window-first-observation',
        title: 'Main Window First Observation',
        body: [
          'Player Scope defines the useful size of Reading the Main Window. The article should be broad enough to explain window composition, but narrow enough that treating a rendered label as the saved schema remains outside the conclusion. The point matters in first observation because reading the visible desktop surface can otherwise be mistaken for treating a rendered label as the saved schema. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / First Observation.',
          'A direct observation for Reading the Main Window should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'Reading the Main Window should not use first observation to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-the-main-window-input-surface',
        title: 'Main Window Input Surface',
        body: [
          'The useful result of Reading the Main Window player scope is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces. The point matters in input surface because reading the visible desktop surface can otherwise be mistaken for treating a rendered label as the saved schema. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Input Surface.',
          'Reading the Main Window separates the surface that accepts input from the component or document that controls the result. This is especially important when reading the visible desktop surface crosses a saved value, a renderer output, or a public form.',
          'Reading the Main Window should not use input surface to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-the-main-window-session-owner',
        title: 'Main Window Session Owner',
        body: [
          'Reading the Main Window should be read as interpretation for the main window within Starting the Application and Window and Item Surfaces. For Reading the Main Window, that fact identifies the first concrete boundary for session owner: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Session Owner.',
          'Ownership in Reading the Main Window is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'A public report based on the session owner part of Reading the Main Window should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-the-main-window-visible-feedback',
        title: 'Main Window Visible Feedback',
        body: [
          'A direct observation for Reading the Main Window should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. That reading gives Reading the Main Window a public anchor for visible feedback without adding behavior that the current category does not own. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Visible Feedback.',
          'Visible feedback for Reading the Main Window should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Window and Item Surfaces.',
          'If the available evidence for visible feedback does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Reading the Main Window should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-the-main-window-saved-state-link',
        title: 'Main Window Saved State Link',
        body: [
          'Reading the Main Window should not use first observation to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. Reading the Main Window uses the fact as saved state link evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Saved State Link.',
          'When Reading the Main Window touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use saved state link to keep Reading the Main Window tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-the-main-window-space-context',
        title: 'Main Window Play-Space Context',
        body: [
          'Inventory, pause, settings, death, AI settings, and Othello settings surfaces temporarily take input focus. They read and write through controllers rather than directly mutating renderer buffers. The point matters in play-space context because reading the visible desktop surface can otherwise be mistaken for treating a rendered label as the saved schema. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Play-Space Context.',
          'The surrounding context for Reading the Main Window decides which adjacent topic is relevant. Reading the Main Window should be compared with Using the Hotbar, Using the Inventory Overlay, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Reading the Main Window play-space context is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'reading-the-main-window-recovery-path',
        title: 'Main Window Recovery Path',
        body: [
          'Reading the Main Window separates the surface that accepts input from the component or document that controls the result. This is especially important when reading the visible desktop surface crosses a saved value, a renderer output, or a public form. In Reading the Main Window, recovery path is the difference between reading window composition and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Recovery Path.',
          'Recovery or follow-up for Reading the Main Window should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for recovery path does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Reading the Main Window should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'reading-the-main-window-confusion-risk',
        title: 'Main Window Confusion Risk',
        body: [
          'Reading the Main Window should not use input surface to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in confusion risk because reading the visible desktop surface can otherwise be mistaken for treating a rendered label as the saved schema. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Confusion Risk.',
          'The main confusion risk in Reading the Main Window is treating a rendered label as the saved schema. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Reading the Main Window should not use confusion risk to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'reading-the-main-window-reportable-evidence',
        title: 'Main Window Reportable Evidence',
        body: [
          'The relevant state is constrained by the article category: Manual treats this topic as player-facing operation. The fact also tells the reader which evidence to preserve for reportable evidence: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Reportable Evidence.',
          'Reportable evidence for Reading the Main Window should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'A public report based on the reportable evidence part of Reading the Main Window should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-the-main-window-adjacent-pages',
        title: 'Main Window Adjacent Pages',
        body: [
          'Ownership in Reading the Main Window is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. Reading the Main Window uses the fact as adjacent pages evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Adjacent Pages.',
          'Adjacent pages matter for Reading the Main Window, but adjacency does not move authority. Reading the Main Window should be compared with Using the Hotbar, Using the Inventory Overlay, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'When Reading the Main Window crosses from adjacent pages into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'reading-the-main-window-public-boundary',
        title: 'Main Window Public Boundary',
        body: [
          'A public report based on the session owner part of Reading the Main Window should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for public boundary: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Public Boundary.',
          'The public boundary for Reading the Main Window is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use public boundary to keep Reading the Main Window tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-the-main-window-operator-reading',
        title: 'Main Window Operator Reading',
        body: [
          'The session manager remains the owner of player state, world state, AI state, and stepping. The main window coordinates presentation and input, then asks the session pipeline for current runtime data. Reading the Main Window uses the fact as operator reading evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Operator Reading.',
          'An operator reading Reading the Main Window should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'Use operator reading to keep Reading the Main Window tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'reading-the-main-window-implementation-limit',
        title: 'Main Window Implementation Limit',
        body: [
          'Visible feedback for Reading the Main Window should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Window and Item Surfaces. For Reading the Main Window, that fact identifies the first concrete boundary for implementation limit: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Implementation Limit.',
          'Implementation limits for Reading the Main Window keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the implementation limit part of Reading the Main Window should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'reading-the-main-window-safe-summary',
        title: 'Main Window Safe Summary',
        body: [
          'The central viewport is drawn by the active renderer backend. HUD text, crosshair, hotbar, Othello overlays, AI tags, and debug metrics are layered above renderer output without owning simulation rules. That reading gives Reading the Main Window a public anchor for safe summary without adding behavior that the current category does not own. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Safe Summary.',
          'The summary value of Reading the Main Window is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'The useful result of Reading the Main Window safe summary is a bounded explanation of window composition: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'reading-the-main-window-closing-check',
        title: 'Main Window Closing Check',
        body: [
          'Player Scope defines the useful size of Reading the Main Window. The article should be broad enough to explain window composition, but narrow enough that treating a rendered label as the saved schema remains outside the conclusion. Reading the Main Window uses the fact as closing check evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Reading the Main Window / Starting the Application / Window and Item Surfaces / Closing Check.',
          'A final check for Reading the Main Window should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'When Reading the Main Window crosses from closing check into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
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
      'Explains the nine-slot hotbar and why different modes keep separate slot sets. This page treats item selection as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'using-the-hotbar-scope',
        title: 'Hotbar Player Scope',
        body: [
          'The hotbar exposes nine selectable slots. Number keys select slots through the current keybind settings, and the selected slot decides the item used for placement, special tools, or empty-hand interaction. The fact also tells the reader which evidence to preserve for player scope: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Player Scope.',
          'Player Scope defines the useful size of Using the Hotbar. The article should be broad enough to explain item selection, but narrow enough that confusing UI selection with material ownership remains outside the conclusion.',
          'A public report based on the player scope part of Using the Hotbar should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-the-hotbar-first-observation',
        title: 'Hotbar First Observation',
        body: [
          'Player Scope defines the useful size of Using the Hotbar. The article should be broad enough to explain item selection, but narrow enough that confusing UI selection with material ownership remains outside the conclusion. Using the Hotbar uses the fact as first observation evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / First Observation.',
          'A direct observation for Using the Hotbar should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'When Using the Hotbar crosses from first observation into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-the-hotbar-input-surface',
        title: 'Hotbar Input Surface',
        body: [
          'A public report based on the player scope part of Using the Hotbar should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for input surface: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Input Surface.',
          'Using the Hotbar separates the surface that accepts input from the component or document that controls the result. This is especially important when moving between selected items and inventory surfaces crosses a saved value, a renderer output, or a public form.',
          'Use input surface to keep Using the Hotbar tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'using-the-hotbar-session-owner',
        title: 'Hotbar Session Owner',
        body: [
          'Using the Hotbar should be read as topic for using the hotbar within Starting the Application and Window and Item Surfaces. Using the Hotbar uses the fact as first observation evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / First Observation. That reading gives Using the Hotbar a public anchor for session owner without adding behavior that the current category does not own. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Session Owner.',
          'Ownership in Using the Hotbar is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'The useful result of Using the Hotbar session owner is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'using-the-hotbar-visible-feedback',
        title: 'Hotbar Visible Feedback',
        body: [
          'A direct observation for Using the Hotbar should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. For Using the Hotbar, that fact identifies the first concrete boundary for visible feedback: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Visible Feedback.',
          'Visible feedback for Using the Hotbar should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Window and Item Surfaces.',
          'A public report based on the visible feedback part of Using the Hotbar should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-the-hotbar-saved-state-link',
        title: 'Hotbar Saved State Link',
        body: [
          'When Using the Hotbar crosses from first observation into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. That reading gives Using the Hotbar a public anchor for saved state link without adding behavior that the current category does not own. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Saved State Link.',
          'When Using the Hotbar touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Using the Hotbar saved state link is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'using-the-hotbar-space-context',
        title: 'Hotbar Play-Space Context',
        body: [
          'Ludoxel stores separate hotbar branches for creative, survival, Othello, and route-editing contexts. This keeps Othello and route tools from replacing normal building selections. Using the Hotbar uses the fact as play-space context evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Play-Space Context.',
          'The surrounding context for Using the Hotbar decides which adjacent topic is relevant. Using the Hotbar should be compared with Using the Inventory Overlay, Understanding Application Output only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'Use play-space context to keep Using the Hotbar tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'using-the-hotbar-recovery-path',
        title: 'Hotbar Recovery Path',
        body: [
          'Using the Hotbar separates the surface that accepts input from the component or document that controls the result. This is especially important when moving between selected items and inventory surfaces crosses a saved value, a renderer output, or a public form. Using the Hotbar uses the fact as recovery path evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Recovery Path.',
          'Recovery or follow-up for Using the Hotbar should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'When Using the Hotbar crosses from recovery path into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-the-hotbar-confusion-risk',
        title: 'Hotbar Confusion Risk',
        body: [
          'Use input surface to keep Using the Hotbar tied to Starting the Application; use a related page only when the reader needs a different owner. For Using the Hotbar, that fact identifies the first concrete boundary for confusion risk: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Confusion Risk.',
          'The main confusion risk in Using the Hotbar is confusing UI selection with material ownership. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'When Using the Hotbar crosses from confusion risk into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-the-hotbar-reportable-evidence',
        title: 'Hotbar Reportable Evidence',
        body: [
          'The relevant state is constrained by the article category: Manual treats this topic as player-facing operation. The point matters in reportable evidence because moving between selected items and inventory surfaces can otherwise be mistaken for confusing UI selection with material ownership. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Reportable Evidence.',
          'Reportable evidence for Using the Hotbar should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Using the Hotbar reportable evidence is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'using-the-hotbar-adjacent-pages',
        title: 'Hotbar Adjacent Pages',
        body: [
          'Ownership in Using the Hotbar is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. That reading gives Using the Hotbar a public anchor for adjacent pages without adding behavior that the current category does not own. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Adjacent Pages.',
          'Adjacent pages matter for Using the Hotbar, but adjacency does not move authority. Using the Hotbar should be compared with Using the Inventory Overlay, Understanding Application Output only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'If the available evidence for adjacent pages does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using the Hotbar should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'using-the-hotbar-public-boundary',
        title: 'Hotbar Public Boundary',
        body: [
          'The useful result of Using the Hotbar session owner is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces. That reading gives Using the Hotbar a public anchor for public boundary without adding behavior that the current category does not own. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Public Boundary.',
          'The public boundary for Using the Hotbar is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Using the Hotbar public boundary is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'using-the-hotbar-operator-reading',
        title: 'Hotbar Operator Reading',
        body: [
          'A selected hotbar item is only a request. Placement, breaking, Othello moves, and special tools still pass through the current simulation or controller rules before state changes. That reading gives Using the Hotbar a public anchor for operator reading without adding behavior that the current category does not own. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Operator Reading.',
          'An operator reading Using the Hotbar should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'The useful result of Using the Hotbar operator reading is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'using-the-hotbar-implementation-limit',
        title: 'Hotbar Implementation Limit',
        body: [
          'Visible feedback for Using the Hotbar should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Window and Item Surfaces. In Using the Hotbar, implementation limit is the difference between reading item selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Implementation Limit.',
          'Implementation limits for Using the Hotbar keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'Using the Hotbar should not use implementation limit to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'using-the-hotbar-safe-summary',
        title: 'Hotbar Safe Summary',
        body: [
          'The hotbar exposes nine selectable slots. Number keys select slots through the current keybind settings, and the selected slot decides the item used for placement, special tools, or empty-hand interaction. For Using the Hotbar, that fact identifies the first concrete boundary for safe summary: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Safe Summary.',
          'The summary value of Using the Hotbar is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Using the Hotbar crosses from safe summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-the-hotbar-closing-check',
        title: 'Hotbar Closing Check',
        body: [
          'Player Scope defines the useful size of Using the Hotbar. The article should be broad enough to explain item selection, but narrow enough that confusing UI selection with material ownership remains outside the conclusion. In Using the Hotbar, closing check is the difference between reading item selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Using the Hotbar / Starting the Application / Window and Item Surfaces / Closing Check.',
          'A final check for Using the Hotbar should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using the Hotbar should be treated as an observation rather than a confirmed cause.',
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
      'Covers the creative and survival inventory overlay behavior. This page treats item selection as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'using-the-inventory-overlay-scope',
        title: 'Inventory Overlay Player Scope',
        body: [
          'In creative mode, the inventory shows a searchable item catalog. Items can be clicked, dragged to a hotbar slot, or assigned through number keys while the catalog is active. For Using the Inventory Overlay, that fact identifies the first concrete boundary for player scope: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Player Scope.',
          'Player Scope defines the useful size of Using the Inventory Overlay. The article should be broad enough to explain item selection, but narrow enough that confusing UI selection with material ownership remains outside the conclusion.',
          'When Using the Inventory Overlay crosses from player scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-first-observation',
        title: 'Inventory Overlay First Observation',
        body: [
          'Player Scope defines the useful size of Using the Inventory Overlay. The article should be broad enough to explain item selection, but narrow enough that confusing UI selection with material ownership remains outside the conclusion. For Using the Inventory Overlay, that fact identifies the first concrete boundary for first observation: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / First Observation.',
          'A direct observation for Using the Inventory Overlay should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'A public report based on the first observation part of Using the Inventory Overlay should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-input-surface',
        title: 'Inventory Overlay Input Surface',
        body: [
          'When Using the Inventory Overlay crosses from player scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. Using the Inventory Overlay uses the fact as input surface evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Input Surface.',
          'Using the Inventory Overlay separates the surface that accepts input from the component or document that controls the result. This is especially important when moving between selected items and inventory surfaces crosses a saved value, a renderer output, or a public form.',
          'When Using the Inventory Overlay crosses from input surface into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-session-owner',
        title: 'Inventory Overlay Session Owner',
        body: [
          'Using the Inventory Overlay should be read as topic for using the inventory overlay within Starting the Application and Window and Item Surfaces. That reading gives Using the Inventory Overlay a public anchor for session owner without adding behavior that the current category does not own. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Session Owner.',
          'Ownership in Using the Inventory Overlay is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'The useful result of Using the Inventory Overlay session owner is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-visible-feedback',
        title: 'Inventory Overlay Visible Feedback',
        body: [
          'A direct observation for Using the Inventory Overlay should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for visible feedback: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Visible Feedback.',
          'Visible feedback for Using the Inventory Overlay should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Window and Item Surfaces.',
          'Use visible feedback to keep Using the Inventory Overlay tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-saved-state-link',
        title: 'Inventory Overlay Saved State Link',
        body: [
          'A public report based on the first observation part of Using the Inventory Overlay should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Using the Inventory Overlay a public anchor for saved state link without adding behavior that the current category does not own. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Saved State Link.',
          'When Using the Inventory Overlay touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'The useful result of Using the Inventory Overlay saved state link is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-space-context',
        title: 'Inventory Overlay Play-Space Context',
        body: [
          'In survival mode, the same overlay surface opens as survival inventory, but the creative catalog is hidden. The hotbar remains visible as the practical item selection surface. Using the Inventory Overlay uses the fact as input surface evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Input Surface. For Using the Inventory Overlay, that fact identifies the first concrete boundary for play-space context: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Play-Space Context.',
          'The surrounding context for Using the Inventory Overlay decides which adjacent topic is relevant. Using the Inventory Overlay should be compared with Using the Hotbar, Understanding Overlay Input Blocking, Reading the Main Window only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'When Using the Inventory Overlay crosses from play-space context into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-recovery-path',
        title: 'Inventory Overlay Recovery Path',
        body: [
          'Using the Inventory Overlay separates the surface that accepts input from the component or document that controls the result. This is especially important when moving between selected items and inventory surfaces crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for recovery path: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Recovery Path.',
          'Recovery or follow-up for Using the Inventory Overlay should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Use recovery path to keep Using the Inventory Overlay tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-confusion-risk',
        title: 'Inventory Overlay Confusion Risk',
        body: [
          'When Using the Inventory Overlay crosses from input surface into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for confusion risk: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Confusion Risk.',
          'The main confusion risk in Using the Inventory Overlay is confusing UI selection with material ownership. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'A public report based on the confusion risk part of Using the Inventory Overlay should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-reportable-evidence',
        title: 'Inventory Overlay Reportable Evidence',
        body: [
          'The relevant state is constrained by the article category: Manual treats this topic as player-facing operation. That reading gives Using the Inventory Overlay a public anchor for reportable evidence without adding behavior that the current category does not own. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Reportable Evidence.',
          'Reportable evidence for Using the Inventory Overlay should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'If the available evidence for reportable evidence does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using the Inventory Overlay should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-adjacent-pages',
        title: 'Inventory Overlay Adjacent Pages',
        body: [
          'Ownership in Using the Inventory Overlay is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. In Using the Inventory Overlay, adjacent pages is the difference between reading item selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Adjacent Pages.',
          'Adjacent pages matter for Using the Inventory Overlay, but adjacency does not move authority. Using the Inventory Overlay should be compared with Using the Hotbar, Understanding Overlay Input Blocking, Reading the Main Window only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Using the Inventory Overlay should not use adjacent pages to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-public-boundary',
        title: 'Inventory Overlay Public Boundary',
        body: [
          'The useful result of Using the Inventory Overlay session owner is a bounded explanation of item selection: enough detail to act, and enough restraint to avoid claims outside Window and Item Surfaces. The point matters in public boundary because moving between selected items and inventory surfaces can otherwise be mistaken for confusing UI selection with material ownership. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Public Boundary.',
          'The public boundary for Using the Inventory Overlay is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Using the Inventory Overlay should not use public boundary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-operator-reading',
        title: 'Inventory Overlay Operator Reading',
        body: [
          'The inventory overlay takes focus while open. Search input, escape handling, and hotbar assignment are handled by the overlay so gameplay capture does not receive those keystrokes. In Using the Inventory Overlay, operator reading is the difference between reading item selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Operator Reading.',
          'An operator reading Using the Inventory Overlay should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for operator reading does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using the Inventory Overlay should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-implementation-limit',
        title: 'Inventory Overlay Implementation Limit',
        body: [
          'Visible feedback for Using the Inventory Overlay should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Starting the Application / Window and Item Surfaces. That reading gives Using the Inventory Overlay a public anchor for implementation limit without adding behavior that the current category does not own. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Implementation Limit.',
          'Implementation limits for Using the Inventory Overlay keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'If the available evidence for implementation limit does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using the Inventory Overlay should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-safe-summary',
        title: 'Inventory Overlay Safe Summary',
        body: [
          'In creative mode, the inventory shows a searchable item catalog. Items can be clicked, dragged to a hotbar slot, or assigned through number keys while the catalog is active. Using the Inventory Overlay uses the fact as safe summary evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Safe Summary.',
          'The summary value of Using the Inventory Overlay is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Use safe summary to keep Using the Inventory Overlay tied to Starting the Application; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'using-the-inventory-overlay-closing-check',
        title: 'Inventory Overlay Closing Check',
        body: [
          'Player Scope defines the useful size of Using the Inventory Overlay. The article should be broad enough to explain item selection, but narrow enough that confusing UI selection with material ownership remains outside the conclusion. In Using the Inventory Overlay, closing check is the difference between reading item selection and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Using the Inventory Overlay / Starting the Application / Window and Item Surfaces / Closing Check.',
          'A final check for Using the Inventory Overlay should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'If the available evidence for closing check does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using the Inventory Overlay should be treated as an observation rather than a confirmed cause.',
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
      'Explains camera input, perspective selection, and the values that affect view direction. This page treats camera and pointer control as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'looking-around-scope',
        title: 'Around Player Scope',
        body: [
          'Mouse movement is converted into yaw and pitch using the configured sensitivity and axis inversion preferences. The resulting view direction is part of the player state used by picking and rendering. The point matters in player scope because moving the view through input capture can otherwise be mistaken for mixing input focus with saved preference ownership. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Player Scope.',
          'Player Scope defines the useful size of Looking Around. The article should be broad enough to explain camera and pointer control, but narrow enough that mixing input focus with saved preference ownership remains outside the conclusion.',
          'The useful result of Looking Around player scope is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'looking-around-first-observation',
        title: 'Around First Observation',
        body: [
          'Player Scope defines the useful size of Looking Around. The article should be broad enough to explain camera and pointer control, but narrow enough that mixing input focus with saved preference ownership remains outside the conclusion. That reading gives Looking Around a public anchor for first observation without adding behavior that the current category does not own. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / First Observation.',
          'A direct observation for Looking Around should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'The useful result of Looking Around first observation is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'looking-around-input-surface',
        title: 'Around Input Surface',
        body: [
          'The useful result of Looking Around player scope is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture. That reading gives Looking Around a public anchor for input surface without adding behavior that the current category does not own. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Input Surface.',
          'Looking Around separates the surface that accepts input from the component or document that controls the result. This is especially important when moving the view through input capture crosses a saved value, a renderer output, or a public form.',
          'The useful result of Looking Around input surface is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'looking-around-session-owner',
        title: 'Around Session Owner',
        body: [
          'Looking Around should be read as topic for looking around within Controlling the Session and Camera and Capture. For Looking Around, that fact identifies the first concrete boundary for session owner: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Session Owner.',
          'Ownership in Looking Around is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'A public report based on the session owner part of Looking Around should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'looking-around-visible-feedback',
        title: 'Around Visible Feedback',
        body: [
          'A direct observation for Looking Around should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. In Looking Around, visible feedback is the difference between reading camera and pointer control and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Visible Feedback.',
          'Visible feedback for Looking Around should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Camera and Capture.',
          'Looking Around should not use visible feedback to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'looking-around-saved-state-link',
        title: 'Around Saved State Link',
        body: [
          'The useful result of Looking Around first observation is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture. The fact also tells the reader which evidence to preserve for saved state link: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Saved State Link.',
          'When Looking Around touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the saved state link part of Looking Around should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'looking-around-space-context',
        title: 'Around Play-Space Context',
        body: [
          'The camera preference supports first-person, third-person back, and third-person front views. The selected perspective changes how the renderer frames the player without changing movement rules. That reading gives Looking Around a public anchor for play-space context without adding behavior that the current category does not own. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Play-Space Context.',
          'The surrounding context for Looking Around decides which adjacent topic is relevant. Looking Around should be compared with Using Mouse Capture, Changing Camera Preferences, Understanding Keybind Resolution only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for play-space context does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Looking Around should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'looking-around-recovery-path',
        title: 'Around Recovery Path',
        body: [
          'Looking Around separates the surface that accepts input from the component or document that controls the result. This is especially important when moving the view through input capture crosses a saved value, a renderer output, or a public form. In Looking Around, recovery path is the difference between reading camera and pointer control and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Recovery Path.',
          'Recovery or follow-up for Looking Around should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for recovery path does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Looking Around should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'looking-around-confusion-risk',
        title: 'Around Confusion Risk',
        body: [
          'The useful result of Looking Around input surface is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture. That reading gives Looking Around a public anchor for confusion risk without adding behavior that the current category does not own. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Confusion Risk.',
          'The main confusion risk in Looking Around is mixing input focus with saved preference ownership. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Looking Around confusion risk is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'looking-around-reportable-evidence',
        title: 'Around Reportable Evidence',
        body: [
          'The relevant state is constrained by the article category: Manual treats this topic as player-facing operation. Looking Around uses the fact as reportable evidence evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Reportable Evidence.',
          'Reportable evidence for Looking Around should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use reportable evidence to keep Looking Around tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'looking-around-adjacent-pages',
        title: 'Around Adjacent Pages',
        body: [
          'Ownership in Looking Around is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The fact also tells the reader which evidence to preserve for adjacent pages: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Adjacent Pages.',
          'Adjacent pages matter for Looking Around, but adjacency does not move authority. Looking Around should be compared with Using Mouse Capture, Changing Camera Preferences, Understanding Keybind Resolution only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use adjacent pages to keep Looking Around tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'looking-around-public-boundary',
        title: 'Around Public Boundary',
        body: [
          'A public report based on the session owner part of Looking Around should state the action, expected result, actual result, environment, and any redaction needed before sharing. The fact also tells the reader which evidence to preserve for public boundary: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Public Boundary.',
          'The public boundary for Looking Around is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'Use public boundary to keep Looking Around tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'looking-around-operator-reading',
        title: 'Around Operator Reading',
        body: [
          'The session pipeline sends camera eye position, yaw, pitch, roll, field of view, and render distance to the renderer in a snapshot. The renderer draws from that data rather than reading input directly. In Looking Around, visible feedback is the difference between reading camera and pointer control and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Visible Feedback. Looking Around uses the fact as operator reading evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Operator Reading.',
          'An operator reading Looking Around should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'Use operator reading to keep Looking Around tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'looking-around-implementation-limit',
        title: 'Around Implementation Limit',
        body: [
          'Visible feedback for Looking Around should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Camera and Capture. For Looking Around, that fact identifies the first concrete boundary for implementation limit: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Implementation Limit.',
          'Implementation limits for Looking Around keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the implementation limit part of Looking Around should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'looking-around-safe-summary',
        title: 'Around Safe Summary',
        body: [
          'Mouse movement is converted into yaw and pitch using the configured sensitivity and axis inversion preferences. The resulting view direction is part of the player state used by picking and rendering. In Looking Around, safe summary is the difference between reading camera and pointer control and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Safe Summary.',
          'The summary value of Looking Around is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for safe summary does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Looking Around should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'looking-around-closing-check',
        title: 'Around Closing Check',
        body: [
          'Player Scope defines the useful size of Looking Around. The article should be broad enough to explain camera and pointer control, but narrow enough that mixing input focus with saved preference ownership remains outside the conclusion. For Looking Around, that fact identifies the first concrete boundary for closing check: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Looking Around / Controlling the Session / Camera and Capture / Closing Check.',
          'A final check for Looking Around should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Looking Around should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
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
      'Describes how Ludoxel captures relative mouse input during gameplay. This page treats camera and pointer control as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'using-mouse-capture-scope',
        title: 'Mouse Capture Player Scope',
        body: [
          'Mouse capture lets the viewport read relative movement for camera control while gameplay has focus. Click-to-capture behavior is part of the presentation input layer, not the simulation layer. Using Mouse Capture uses the fact as player scope evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Player Scope. Using Mouse Capture uses the fact as player scope evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Player Scope.',
          'Player Scope defines the useful size of Using Mouse Capture. The article should be broad enough to explain camera and pointer control, but narrow enough that mixing input focus with saved preference ownership remains outside the conclusion.',
          'When Using Mouse Capture crosses from player scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-mouse-capture-first-observation',
        title: 'Mouse Capture First Observation',
        body: [
          'Player Scope defines the useful size of Using Mouse Capture. The article should be broad enough to explain camera and pointer control, but narrow enough that mixing input focus with saved preference ownership remains outside the conclusion. The fact also tells the reader which evidence to preserve for first observation: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / First Observation.',
          'A direct observation for Using Mouse Capture should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'A public report based on the first observation part of Using Mouse Capture should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-mouse-capture-input-surface',
        title: 'Mouse Capture Input Surface',
        body: [
          'When Using Mouse Capture crosses from player scope into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. For Using Mouse Capture, that fact identifies the first concrete boundary for input surface: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Input Surface.',
          'Using Mouse Capture separates the surface that accepts input from the component or document that controls the result. This is especially important when moving the view through input capture crosses a saved value, a renderer output, or a public form.',
          'When Using Mouse Capture crosses from input surface into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-mouse-capture-session-owner',
        title: 'Mouse Capture Session Owner',
        body: [
          'Using Mouse Capture should be read as topic for using mouse capture within Controlling the Session and Camera and Capture. In Using Mouse Capture, session owner is the difference between reading camera and pointer control and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Session Owner.',
          'Ownership in Using Mouse Capture is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'Using Mouse Capture should not use session owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'using-mouse-capture-visible-feedback',
        title: 'Mouse Capture Visible Feedback',
        body: [
          'A direct observation for Using Mouse Capture should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. The fact also tells the reader which evidence to preserve for visible feedback: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Visible Feedback.',
          'Visible feedback for Using Mouse Capture should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Camera and Capture.',
          'A public report based on the visible feedback part of Using Mouse Capture should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-mouse-capture-saved-state-link',
        title: 'Mouse Capture Saved State Link',
        body: [
          'A public report based on the first observation part of Using Mouse Capture should state the action, expected result, actual result, environment, and any redaction needed before sharing. That reading gives Using Mouse Capture a public anchor for saved state link without adding behavior that the current category does not own. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Saved State Link.',
          'When Using Mouse Capture touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'If the available evidence for saved state link does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using Mouse Capture should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'using-mouse-capture-space-context',
        title: 'Mouse Capture Play-Space Context',
        body: [
          'The input adapter handles the active platform path. macOS cursor capture and keyboard guarding are separate code paths, so mouse capture and keyboard event protection should not be treated as the same feature. For Using Mouse Capture, that fact identifies the first concrete boundary for play-space context: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Play-Space Context.',
          'The surrounding context for Using Mouse Capture decides which adjacent topic is relevant. Using Mouse Capture should be compared with Looking Around, Understanding Keybind Resolution, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'A public report based on the play-space context part of Using Mouse Capture should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-mouse-capture-recovery-path',
        title: 'Mouse Capture Recovery Path',
        body: [
          'Using Mouse Capture separates the surface that accepts input from the component or document that controls the result. This is especially important when moving the view through input capture crosses a saved value, a renderer output, or a public form. The fact also tells the reader which evidence to preserve for recovery path: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Recovery Path.',
          'Recovery or follow-up for Using Mouse Capture should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'A public report based on the recovery path part of Using Mouse Capture should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'using-mouse-capture-confusion-risk',
        title: 'Mouse Capture Confusion Risk',
        body: [
          'When Using Mouse Capture crosses from input surface into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories. The fact also tells the reader which evidence to preserve for confusion risk: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Confusion Risk.',
          'The main confusion risk in Using Mouse Capture is mixing input focus with saved preference ownership. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'Use confusion risk to keep Using Mouse Capture tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'using-mouse-capture-reportable-evidence',
        title: 'Mouse Capture Reportable Evidence',
        body: [
          'The relevant state is constrained by the article category: Manual treats this topic as player-facing operation. In Using Mouse Capture, session owner is the difference between reading camera and pointer control and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Session Owner. That reading gives Using Mouse Capture a public anchor for reportable evidence without adding behavior that the current category does not own. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Reportable Evidence.',
          'Reportable evidence for Using Mouse Capture should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'The useful result of Using Mouse Capture reportable evidence is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'using-mouse-capture-adjacent-pages',
        title: 'Mouse Capture Adjacent Pages',
        body: [
          'Ownership in Using Mouse Capture is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. That reading gives Using Mouse Capture a public anchor for adjacent pages without adding behavior that the current category does not own. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Adjacent Pages.',
          'Adjacent pages matter for Using Mouse Capture, but adjacency does not move authority. Using Mouse Capture should be compared with Looking Around, Understanding Keybind Resolution, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'The useful result of Using Mouse Capture adjacent pages is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'using-mouse-capture-public-boundary',
        title: 'Mouse Capture Public Boundary',
        body: [
          'Using Mouse Capture should not use session owner to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in public boundary because moving the view through input capture can otherwise be mistaken for mixing input focus with saved preference ownership. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Public Boundary.',
          'The public boundary for Using Mouse Capture is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'The useful result of Using Mouse Capture public boundary is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'using-mouse-capture-operator-reading',
        title: 'Mouse Capture Operator Reading',
        body: [
          'Capture is released or blocked while overlays and dialogs need normal pointer interaction. Close the overlay or return focus to the viewport before testing gameplay camera movement. That reading gives Using Mouse Capture a public anchor for operator reading without adding behavior that the current category does not own. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Operator Reading.',
          'An operator reading Using Mouse Capture should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'If the available evidence for operator reading does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Using Mouse Capture should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'using-mouse-capture-implementation-limit',
        title: 'Mouse Capture Implementation Limit',
        body: [
          'Visible feedback for Using Mouse Capture should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Camera and Capture. That reading gives Using Mouse Capture a public anchor for implementation limit without adding behavior that the current category does not own. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Implementation Limit.',
          'Implementation limits for Using Mouse Capture keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'The useful result of Using Mouse Capture implementation limit is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
        ],
      },
      {
        id: 'using-mouse-capture-safe-summary',
        title: 'Mouse Capture Safe Summary',
        body: [
          'Mouse capture lets the viewport read relative movement for camera control while gameplay has focus. Click-to-capture behavior is part of the presentation input layer, not the simulation layer. Using Mouse Capture uses the fact as player scope evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Player Scope. Using Mouse Capture uses the fact as safe summary evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Safe Summary.',
          'The summary value of Using Mouse Capture is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'When Using Mouse Capture crosses from safe summary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'using-mouse-capture-closing-check',
        title: 'Mouse Capture Closing Check',
        body: [
          'Player Scope defines the useful size of Using Mouse Capture. The article should be broad enough to explain camera and pointer control, but narrow enough that mixing input focus with saved preference ownership remains outside the conclusion. The point matters in closing check because moving the view through input capture can otherwise be mistaken for mixing input focus with saved preference ownership. The local reading frame is Using Mouse Capture / Controlling the Session / Camera and Capture / Closing Check.',
          'A final check for Using Mouse Capture should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'The useful result of Using Mouse Capture closing check is a bounded explanation of camera and pointer control: enough detail to act, and enough restraint to avoid claims outside Camera and Capture.',
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
      'Explains normal player movement, movement assists, and recovery-sensitive hazards. This page treats player movement and recovery as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'moving-the-player-scope',
        title: 'Player Player Scope',
        body: [
          'Player movement uses walk, sprint, crouch, jump, fly, gravity, and collision parameters from the active settings. The stepping system advances those values on fixed simulation steps. The point matters in player scope because reading motion, collision, and recovery state can otherwise be mistaken for diagnosing a gameplay result as a renderer problem. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Player Scope.',
          'Player Scope defines the useful size of Moving the Player. The article should be broad enough to explain player movement and recovery, but narrow enough that diagnosing a gameplay result as a renderer problem remains outside the conclusion.',
          'Moving the Player should not use player scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'moving-the-player-first-observation',
        title: 'Player First Observation',
        body: [
          'Player Scope defines the useful size of Moving the Player. The article should be broad enough to explain player movement and recovery, but narrow enough that diagnosing a gameplay result as a renderer problem remains outside the conclusion. That reading gives Moving the Player a public anchor for first observation without adding behavior that the current category does not own. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / First Observation.',
          'A direct observation for Moving the Player should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'If the available evidence for first observation does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Moving the Player should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'moving-the-player-input-surface',
        title: 'Player Input Surface',
        body: [
          'Moving the Player should not use player scope to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. In Moving the Player, input surface is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Input Surface.',
          'Moving the Player separates the surface that accepts input from the component or document that controls the result. This is especially important when reading motion, collision, and recovery state crosses a saved value, a renderer output, or a public form.',
          'Moving the Player should not use input surface to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'moving-the-player-session-owner',
        title: 'Player Session Owner',
        body: [
          'Moving the Player should be read as topic for moving the player within Controlling the Session and Movement and Recovery. Moving the Player uses the fact as session owner evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Session Owner.',
          'Ownership in Moving the Player is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'Use session owner to keep Moving the Player tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'moving-the-player-visible-feedback',
        title: 'Player Visible Feedback',
        body: [
          'A direct observation for Moving the Player should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. In Moving the Player, visible feedback is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Visible Feedback.',
          'Visible feedback for Moving the Player should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Movement and Recovery.',
          'If the available evidence for visible feedback does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Moving the Player should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'moving-the-player-saved-state-link',
        title: 'Player Saved State Link',
        body: [
          'If the available evidence for first observation does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Moving the Player should be treated as an observation rather than a confirmed cause. The fact also tells the reader which evidence to preserve for saved state link: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Saved State Link.',
          'When Moving the Player touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'Use saved state link to keep Moving the Player tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'moving-the-player-space-context',
        title: 'Player Play-Space Context',
        body: [
          'Auto-jump and auto-sprint are preferences that modify movement intent. Creative mode also enables flight behavior, while survival movement remains subject to gravity, collision, fall damage, and void damage. In Moving the Player, input surface is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Input Surface. In Moving the Player, play-space context is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Play-Space Context.',
          'The surrounding context for Moving the Player decides which adjacent topic is relevant. Moving the Player should be compared with Surviving Fall and Void Hazards, Understanding Block Shapes, Changing Keybind Preferences only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'If the available evidence for play-space context does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Moving the Player should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'moving-the-player-recovery-path',
        title: 'Player Recovery Path',
        body: [
          'Moving the Player separates the surface that accepts input from the component or document that controls the result. This is especially important when reading motion, collision, and recovery state crosses a saved value, a renderer output, or a public form. In Moving the Player, recovery path is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Recovery Path.',
          'Recovery or follow-up for Moving the Player should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'Moving the Player should not use recovery path to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'moving-the-player-confusion-risk',
        title: 'Player Confusion Risk',
        body: [
          'Moving the Player should not use input surface to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text. The point matters in confusion risk because reading motion, collision, and recovery state can otherwise be mistaken for diagnosing a gameplay result as a renderer problem. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Confusion Risk.',
          'The main confusion risk in Moving the Player is diagnosing a gameplay result as a renderer problem. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'The useful result of Moving the Player confusion risk is a bounded explanation of player movement and recovery: enough detail to act, and enough restraint to avoid claims outside Movement and Recovery.',
        ],
      },
      {
        id: 'moving-the-player-reportable-evidence',
        title: 'Player Reportable Evidence',
        body: [
          'The relevant state is constrained by the article category: Manual treats this topic as player-facing operation. Moving the Player uses the fact as session owner evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Session Owner. The fact also tells the reader which evidence to preserve for reportable evidence: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Reportable Evidence.',
          'Reportable evidence for Moving the Player should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'Use reportable evidence to keep Moving the Player tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'moving-the-player-adjacent-pages',
        title: 'Player Adjacent Pages',
        body: [
          'Ownership in Moving the Player is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. Moving the Player uses the fact as adjacent pages evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Adjacent Pages.',
          'Adjacent pages matter for Moving the Player, but adjacency does not move authority. Moving the Player should be compared with Surviving Fall and Void Hazards, Understanding Block Shapes, Changing Keybind Preferences only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use adjacent pages to keep Moving the Player tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'moving-the-player-public-boundary',
        title: 'Player Public Boundary',
        body: [
          'Use session owner to keep Moving the Player tied to Controlling the Session; use a related page only when the reader needs a different owner. The fact also tells the reader which evidence to preserve for public boundary: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Public Boundary.',
          'The public boundary for Moving the Player is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'A public report based on the public boundary part of Moving the Player should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'moving-the-player-operator-reading',
        title: 'Player Operator Reading',
        body: [
          'Support checks decide whether the player is grounded and what block material is underfoot. Those checks also feed landing, footstep, damage, and audio feedback. In Moving the Player, visible feedback is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Visible Feedback. The fact also tells the reader which evidence to preserve for operator reading: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Operator Reading.',
          'An operator reading Moving the Player should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'Use operator reading to keep Moving the Player tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'moving-the-player-implementation-limit',
        title: 'Player Implementation Limit',
        body: [
          'Visible feedback for Moving the Player should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Movement and Recovery. For Moving the Player, that fact identifies the first concrete boundary for implementation limit: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Implementation Limit.',
          'Implementation limits for Moving the Player keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'When Moving the Player crosses from implementation limit into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'moving-the-player-safe-summary',
        title: 'Player Safe Summary',
        body: [
          'Player movement uses walk, sprint, crouch, jump, fly, gravity, and collision parameters from the active settings. The stepping system advances those values on fixed simulation steps. That reading gives Moving the Player a public anchor for safe summary without adding behavior that the current category does not own. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Safe Summary.',
          'The summary value of Moving the Player is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'If the available evidence for safe summary does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Moving the Player should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'moving-the-player-closing-check',
        title: 'Player Closing Check',
        body: [
          'Player Scope defines the useful size of Moving the Player. The article should be broad enough to explain player movement and recovery, but narrow enough that diagnosing a gameplay result as a renderer problem remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Moving the Player / Controlling the Session / Movement and Recovery / Closing Check.',
          'A final check for Moving the Player should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Moving the Player should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
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
      'Explains what the death overlay resets and what it leaves untouched. This page treats player movement and recovery as a player-facing operating guide for the desktop window, identifies the owner that controls the result, and separates observable evidence from adjacent topics such as persistence, distribution, support routing, and legal authority.',
    sections: [
      {
        id: 'recovering-after-death-scope',
        title: 'after Death Player Scope',
        body: [
          'Death can come from void damage, fall damage, or AI combat damage. The session reports a death reason, and the presentation layer displays the death overlay. That reading gives Recovering after Death a public anchor for player scope without adding behavior that the current category does not own. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Player Scope.',
          'Player Scope defines the useful size of Recovering after Death. The article should be broad enough to explain player movement and recovery, but narrow enough that diagnosing a gameplay result as a renderer problem remains outside the conclusion.',
          'The useful result of Recovering after Death player scope is a bounded explanation of player movement and recovery: enough detail to act, and enough restraint to avoid claims outside Movement and Recovery.',
        ],
      },
      {
        id: 'recovering-after-death-first-observation',
        title: 'after Death First Observation',
        body: [
          'Player Scope defines the useful size of Recovering after Death. The article should be broad enough to explain player movement and recovery, but narrow enough that diagnosing a gameplay result as a renderer problem remains outside the conclusion. That reading gives Recovering after Death a public anchor for first observation without adding behavior that the current category does not own. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / First Observation.',
          'A direct observation for Recovering after Death should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state.',
          'If the available evidence for first observation does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Recovering after Death should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'recovering-after-death-input-surface',
        title: 'after Death Input Surface',
        body: [
          'The useful result of Recovering after Death player scope is a bounded explanation of player movement and recovery: enough detail to act, and enough restraint to avoid claims outside Movement and Recovery. That reading gives Recovering after Death a public anchor for input surface without adding behavior that the current category does not own. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Input Surface.',
          'Recovering after Death separates the surface that accepts input from the component or document that controls the result. This is especially important when reading motion, collision, and recovery state crosses a saved value, a renderer output, or a public form.',
          'If the available evidence for input surface does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Recovering after Death should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'recovering-after-death-session-owner',
        title: 'after Death Session Owner',
        body: [
          'Recovering after Death should be read as state recovery for death within Controlling the Session and Movement and Recovery. The fact also tells the reader which evidence to preserve for session owner: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Session Owner.',
          'Ownership in Recovering after Death is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents.',
          'A public report based on the session owner part of Recovering after Death should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'recovering-after-death-visible-feedback',
        title: 'after Death Visible Feedback',
        body: [
          'A direct observation for Recovering after Death should name what the user or reader actually sees before it assigns cause. That keeps the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input ahead of guesses about hidden state. In Recovering after Death, visible feedback is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Visible Feedback.',
          'Visible feedback for Recovering after Death should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Movement and Recovery.',
          'If the available evidence for visible feedback does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Recovering after Death should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'recovering-after-death-saved-state-link',
        title: 'after Death Saved State Link',
        body: [
          'If the available evidence for first observation does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Recovering after Death should be treated as an observation rather than a confirmed cause. For Recovering after Death, that fact identifies the first concrete boundary for saved state link: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Saved State Link.',
          'When Recovering after Death touches saved data, the article should distinguish saved state, cache state, package resources, and public policy text. Those categories can interact, but they do not become the same authority.',
          'A public report based on the saved state link part of Recovering after Death should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'recovering-after-death-space-context',
        title: 'after Death Play-Space Context',
        body: [
          'Respawn resets the player to the active space spawn state with restored health. It does not erase the saved world, Othello board, hotbars, preferences, or learning artifacts. That reading gives Recovering after Death a public anchor for play-space context without adding behavior that the current category does not own. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Play-Space Context.',
          'The surrounding context for Recovering after Death decides which adjacent topic is relevant. Recovering after Death should be compared with Surviving Fall and Void Hazards, Reading Saved World State, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The related article should answer the new question instead of rewriting this one.',
          'The useful result of Recovering after Death play-space context is a bounded explanation of player movement and recovery: enough detail to act, and enough restraint to avoid claims outside Movement and Recovery.',
        ],
      },
      {
        id: 'recovering-after-death-recovery-path',
        title: 'after Death Recovery Path',
        body: [
          'Recovering after Death separates the surface that accepts input from the component or document that controls the result. This is especially important when reading motion, collision, and recovery state crosses a saved value, a renderer output, or a public form. That reading gives Recovering after Death a public anchor for recovery path without adding behavior that the current category does not own. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Recovery Path.',
          'Recovery or follow-up for Recovering after Death should stay inside the same boundary as the failure. A settings mistake needs settings evidence, a data mistake needs data evidence, and a support or legal issue needs the matching public route.',
          'If the available evidence for recovery path does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Recovering after Death should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'recovering-after-death-confusion-risk',
        title: 'after Death Confusion Risk',
        body: [
          'If the available evidence for input surface does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Recovering after Death should be treated as an observation rather than a confirmed cause. That reading gives Recovering after Death a public anchor for confusion risk without adding behavior that the current category does not own. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Confusion Risk.',
          'The main confusion risk in Recovering after Death is diagnosing a gameplay result as a renderer problem. The article avoids that risk by naming the owner, the evidence, and the public limit before it describes the result.',
          'If the available evidence for confusion risk does not identify the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents, Recovering after Death should be treated as an observation rather than a confirmed cause.',
        ],
      },
      {
        id: 'recovering-after-death-reportable-evidence',
        title: 'after Death Reportable Evidence',
        body: [
          'The relevant state is constrained by the article category: Manual treats this topic as player-facing operation. Recovering after Death uses the fact as reportable evidence evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Reportable Evidence.',
          'Reportable evidence for Recovering after Death should be small, concrete, and public. the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input is more useful than a broad conclusion because another reader can compare those facts directly.',
          'When Recovering after Death crosses from reportable evidence into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'recovering-after-death-adjacent-pages',
        title: 'after Death Adjacent Pages',
        body: [
          'Ownership in Recovering after Death is not the same as display. A consumer can show, store, or report a value while the controlling boundary remains the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. Recovering after Death uses the fact as adjacent pages evidence, then keeps the explanation inside Manual rather than turning it into a project-wide claim. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Adjacent Pages.',
          'Adjacent pages matter for Recovering after Death, but adjacency does not move authority. Recovering after Death should be compared with Surviving Fall and Void Hazards, Reading Saved World State, Understanding Overlay Input Blocking only when the reader has moved to that neighboring subject. The reader should switch pages only when the subject has changed.',
          'Use adjacent pages to keep Recovering after Death tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'recovering-after-death-public-boundary',
        title: 'after Death Public Boundary',
        body: [
          'A public report based on the session owner part of Recovering after Death should state the action, expected result, actual result, environment, and any redaction needed before sharing. For Recovering after Death, that fact identifies the first concrete boundary for public boundary: the active session, input adapter, viewport, overlay stack, hotbar surface, and player state that the desktop window presents. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Public Boundary.',
          'The public boundary for Recovering after Death is part of the article, not an afterthought. It does not define release status, source architecture, legal permission, or security-reporting procedure. This wording keeps public documentation from expanding permission or asking for unsafe evidence.',
          'When Recovering after Death crosses from public boundary into saved data, output, packaging, support, or legal interpretation, the reader should name that crossing instead of flattening the categories.',
        ],
      },
      {
        id: 'recovering-after-death-operator-reading',
        title: 'after Death Operator Reading',
        body: [
          'When reporting an unexpected death, describe the active play space, mode, position, recent movement, nearby AI, and relevant settings. Do not include private save files or unrelated local paths in a public report. In Recovering after Death, visible feedback is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Visible Feedback. The fact also tells the reader which evidence to preserve for operator reading: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Operator Reading.',
          'An operator reading Recovering after Death should follow manual use starts with a player action, passes through session ownership, and reaches a visible surface only when that surface is the consumer of the state. That order prevents a visible result from being treated as the first source of truth.',
          'Use operator reading to keep Recovering after Death tied to Controlling the Session; use a related page only when the reader needs a different owner.',
        ],
      },
      {
        id: 'recovering-after-death-implementation-limit',
        title: 'after Death Implementation Limit',
        body: [
          'Visible feedback for Recovering after Death should be read as evidence, not as a complete diagnosis. The next step is to connect the feedback to the owner and to the category path Manual / Controlling the Session / Movement and Recovery. The fact also tells the reader which evidence to preserve for implementation limit: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Implementation Limit.',
          'Implementation limits for Recovering after Death keep the article tied to confirmed behavior. If a command, backend, schema branch, or policy file is not part of this topic, the page should not use it as proof.',
          'A public report based on the implementation limit part of Recovering after Death should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
      {
        id: 'recovering-after-death-safe-summary',
        title: 'after Death Safe Summary',
        body: [
          'Death can come from void damage, fall damage, or AI combat damage. The session reports a death reason, and the presentation layer displays the death overlay. In Recovering after Death, safe summary is the difference between reading player movement and recovery and assuming authority from a nearby surface, file, or policy summary. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Safe Summary.',
          'The summary value of Recovering after Death is precision. It tells the reader what the topic covers, which owner controls it, and which evidence is enough for a public explanation.',
          'Recovering after Death should not use safe summary to infer permission, release status, hidden routes, accepted contributions, or private security handling beyond the controlling public text.',
        ],
      },
      {
        id: 'recovering-after-death-closing-check',
        title: 'after Death Closing Check',
        body: [
          'Player Scope defines the useful size of Recovering after Death. The article should be broad enough to explain player movement and recovery, but narrow enough that diagnosing a gameplay result as a renderer problem remains outside the conclusion. The fact also tells the reader which evidence to preserve for closing check: the active play space, focused surface, selected item, visible message, movement or camera response, and whether an overlay is accepting input. The local reading frame is Recovering after Death / Controlling the Session / Movement and Recovery / Closing Check.',
          'A final check for Recovering after Death should confirm the category, owner, evidence, and boundary. If any one of those is missing, the conclusion should remain narrower than the symptom.',
          'A public report based on the closing check part of Recovering after Death should state the action, expected result, actual result, environment, and any redaction needed before sharing.',
        ],
      },
    ],
    relatedTitles: ['Surviving Fall and Void Hazards', 'Reading Saved World State', 'Understanding Overlay Input Blocking'],
  }),
];
