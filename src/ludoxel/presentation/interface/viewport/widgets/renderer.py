# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import sys
import traceback
from pathlib import Path

from PyQt6.QtCore import QEvent, Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QGuiApplication, QImage, QKeyEvent, QMouseEvent, QWheelEvent
from PyQt6.QtWidgets import QGraphicsOpacityEffect, QLabel, QMessageBox, QWidget
from rendercanvas.qt import QRenderWidget

import ludoxel.presentation.interface.othello.viewport as othello_controller
import ludoxel.presentation.interface.viewport.controllers.interaction as interaction_controller
import ludoxel.presentation.interface.viewport.controllers.overlay_navigation as overlay_controller
import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.application.persistence.schedulers.state import apply_persisted_state_if_present
from ludoxel.application.preferences.runtime import RuntimePreferences
from ludoxel.application.sessions.context.play_space import PlaySpaceContext
from ludoxel.application.sessions.runners.fixed_step import FixedStepRunner
from ludoxel.presentation.audio import AudioManager
from ludoxel.presentation.interface.common.status_overlay import status_overlay_title_image_path
from ludoxel.presentation.interface.config.game_loop import DEFAULT_GAME_LOOP_PARAMS, GameLoopParams
from ludoxel.presentation.interface.hud.controller import HudController
from ludoxel.presentation.interface.hud.crosshair_widget import CrosshairWidget
from ludoxel.presentation.interface.hud.hotbar_widget import HotbarWidget
from ludoxel.presentation.interface.hud.route_overlay import RouteOverlayWidget
from ludoxel.presentation.interface.input.game_input import ViewportInput
from ludoxel.presentation.interface.input.qt import QtInputAdapter
from ludoxel.presentation.interface.othello.hud import OthelloHudWidget
from ludoxel.presentation.interface.othello.settings import OthelloSettingsOverlay
from ludoxel.presentation.interface.othello.worker import OthelloAiWorker
from ludoxel.presentation.interface.overlays.death import DeathOverlay
from ludoxel.presentation.interface.overlays.inventory import InventoryOverlay
from ludoxel.presentation.interface.overlays.pause import PauseOverlay
from ludoxel.presentation.interface.settings.overlay import SettingsOverlay
from ludoxel.presentation.interface.viewport.lifecycle.mixin import ViewportLifecycleMixin
from ludoxel.presentation.interface.viewport.lifecycle.state import ViewportStateMixin
from ludoxel.presentation.interface.viewport.overlays.controller import OverlayRefs, ViewportOverlays
from ludoxel.presentation.interface.viewport.overlays.state import ViewportOverlayMixin
from ludoxel.presentation.interface.viewport.render_loop.frame_sync import ViewportFrameSync
from ludoxel.presentation.interface.viewport.render_loop.loop import ViewportRenderLoopMixin
from ludoxel.presentation.interface.viewport.selection.state import ViewportSelectionState
from ludoxel.presentation.rendering.contracts.backend import Renderer
from ludoxel.presentation.rendering.uploads.world import WorldUploadTracker
from ludoxel.presentation.rendering.visuals.players.first_person_motion import FirstPersonMotionController
from ludoxel.simulation.actors.ai_players.state import AiSpawnEggSettings
from ludoxel.simulation.spaces.othello.game.state import OthelloAnalysis
from ludoxel.simulation.spaces.othello.matches.controller import OthelloMatchController

_APPLICATION_DEACTIVATION_PAUSE_DELAY_MS = 250


def _qt_event_type(name: str):
  return getattr(QEvent.Type, str(name), None)


_MACOS_CAPTURE_CONSUME_EVENT_TYPES = tuple(
  event_type
  for event_type in (
    _qt_event_type("ShortcutOverride"),
    _qt_event_type("InputMethod"),
    _qt_event_type("InputMethodQuery"),
    _qt_event_type("NativeGesture"),
    _qt_event_type("Gesture"),
    _qt_event_type("GestureOverride"),
    _qt_event_type("TabletPress"),
    _qt_event_type("TabletMove"),
    _qt_event_type("TabletRelease"),
    _qt_event_type("TouchBegin"),
    _qt_event_type("TouchUpdate"),
    _qt_event_type("TouchEnd"),
    _qt_event_type("TouchCancel"),
  )
  if event_type is not None
)
_MACOS_CAPTURE_REDIRECT_EVENT_TYPES = tuple(
  event_type
  for event_type in (
    _qt_event_type("KeyPress"),
    _qt_event_type("KeyRelease"),
    _qt_event_type("MouseButtonPress"),
    _qt_event_type("MouseButtonDblClick"),
    _qt_event_type("MouseButtonRelease"),
    _qt_event_type("MouseMove"),
    _qt_event_type("Wheel"),
  )
  if event_type is not None
)


class RendererViewportWidget(ViewportRenderLoopMixin, ViewportStateMixin, ViewportOverlayMixin, ViewportLifecycleMixin, QRenderWidget):
  hud_updated = pyqtSignal(object)
  fullscreen_changed = pyqtSignal(bool)
  loading_state_changed = pyqtSignal(bool)
  loading_status_changed = pyqtSignal(str)
  loading_finished = pyqtSignal()

  def __init__(self, project_root: Path, resource_root: Path, data_root: Path, parent=None, loop_params: GameLoopParams = DEFAULT_GAME_LOOP_PARAMS, launch_player_name: str | None = None) -> None:
    super().__init__(parent)

    self._project_root = Path(project_root)
    self._resource_root = Path(resource_root)
    self._data_root = Path(data_root)
    self._assets_dir = self._resource_root / "assets"
    self._loop = loop_params

    self._adapter = QtInputAdapter(self)
    self._inp = ViewportInput(widget=self, adapter=self._adapter, native_key_handler=self._handle_native_game_key)

    self._sessions = PlaySpaceContext.create_default(seed=0)
    self._session = self._sessions.active_session()
    self._runner = FixedStepRunner(step_dt=self._loop.step_dt(), on_step=self._on_step)

    self._renderer = Renderer(canvas=self)
    self._hud = None
    self._othello_hud = OthelloHudWidget(self)
    self._othello_hud.setVisible(False)
    self._player_name_tag = QLabel(self)
    self._player_name_tag.setObjectName("playerNameTag")
    self._player_name_tag.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self._player_name_tag.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
    self._player_name_tag.setAlignment(Qt.AlignmentFlag.AlignCenter)
    self._player_name_tag.setVisible(False)
    self._player_name_tag_effect = QGraphicsOpacityEffect(self._player_name_tag)
    self._player_name_tag_effect.setOpacity(1.0)
    self._player_name_tag.setGraphicsEffect(self._player_name_tag_effect)

    self._upload = WorldUploadTracker()
    self._hud_ctl = HudController()

    self._state = RuntimePreferences()
    settings_controller.sync_state_from_renderer_sun(self)
    self._first_person_motion = FirstPersonMotionController(slim_arm=True)

    self._selection_state = ViewportSelectionState()
    self._othello_match = OthelloMatchController()
    self._othello_ai = OthelloAiWorker(self)
    self._othello_hover_square: int | None = None
    self._pending_othello_ai_result: tuple[int, int | None] | None = None
    self._othello_ai_request_armed: bool = False
    self._othello_title_flash_text: str = ""
    self._othello_title_flash_until_s: float = 0.0
    self._last_othello_message: str = ""
    self._othello_hud_signature: tuple[object, ...] | None = None
    self._othello_render_state_cache_key: tuple[object, ...] | None = None
    self._othello_render_state_cache = None
    self._othello_analysis = OthelloAnalysis().normalized()
    self._othello_analysis_request_signature: tuple[object, ...] | None = None
    self._othello_book_learning_running: bool = False
    self._othello_book_learning_status_text: str = ""
    self._othello_book_summary_text: str = ""
    self._othello_book_learning_progress: dict[str, object] | None = None
    self._othello_last_passive_hud_sync_s: float = 0.0

    self._last_paint_ms: float = 0.0
    self._last_selection_pick_ms: float = 0.0
    self._shutdown_done = False
    self._gl_initialized = False
    self._renderer_initialized = False
    self._runtime_active = False
    self._frame_sync = ViewportFrameSync()
    self._player_skin_image = QImage()
    self._pause_preview_cache_key: tuple[object, ...] | None = None
    self._pause_preview_frame = QImage()
    self._block_break_particles = ()
    self._ai_edit_settings = AiSpawnEggSettings().normalized()
    self._ai_settings_overlay_open: bool = False
    self._transient_modal_depth: int = 0
    self._ai_edit_actor_id: str | None = None
    self._ai_route_edit_actor_id: str | None = None
    self._ai_route_edit_points = []
    self._ai_route_edit_closed: bool = False
    self._ai_route_hover_index: int | None = None
    self._left_mouse_held: bool = False
    self._right_mouse_held: bool = False
    self._dispatched_mouse_buttons: set[Qt.MouseButton] = set()
    self._left_mouse_repeat_due_s: float = 0.0
    self._right_mouse_repeat_due_s: float = 0.0
    self._right_mouse_repeat_enabled: bool = False
    self._right_mouse_repeat_mode: str | None = None
    self._right_mouse_repeat_target_cell: tuple[int, int, int] | None = None
    self._right_mouse_repeat_line_start: tuple[int, int, int] | None = None
    self._right_mouse_repeat_line_step: tuple[int, int, int] | None = None
    self._right_mouse_repeat_line_face: int | None = None
    self._right_mouse_repeat_line_plane_normal: tuple[int, int, int] | None = None
    self._right_mouse_repeat_line_plane_point: tuple[float, float, float] | None = None
    self._right_mouse_repeat_line_min_progress: int = 0
    self._right_mouse_repeat_line_max_progress: int = 0
    self._right_mouse_repeat_line_start_cell_materialized: bool = True
    self._right_mouse_repeat_line_pending_support_cell: tuple[int, int, int] | None = None
    self._right_mouse_repeat_line_pending_support_face: int | None = None
    self._right_mouse_repeat_line_pending_support_hit_point: tuple[float, float, float] | None = None
    self._right_mouse_repeat_support_face_mode: bool = False
    self._right_mouse_repeat_visible_face_chain_mode: bool = False
    self._right_mouse_repeat_origin_player_y: float = 0.0
    self._right_mouse_repeat_vertical_lock_sign: int = 0
    self._recent_move_f: float = 0.0
    self._recent_move_s: float = 0.0
    self._recent_jump_held: bool = False
    self._recent_jump_pressed: bool = False
    self._recent_crouch_held: bool = False
    self._recent_vertical_motion_sign: int = 0
    app = QGuiApplication.instance()
    self._application_active = bool(app is None or app.applicationState() == Qt.ApplicationState.ApplicationActive)
    self._application_event_filter_app = None

    self._overlay = PauseOverlay(self)
    self._overlay.set_title_image_path(status_overlay_title_image_path(self._resource_root))
    self._settings = SettingsOverlay(None, resource_root=self._resource_root, as_window=True)
    self._othello_settings = OthelloSettingsOverlay(None, resource_root=self._resource_root, as_window=True)
    self._death = DeathOverlay(self)

    self._crosshair = CrosshairWidget(self)
    self._crosshair.setVisible(False)

    self._hotbar = HotbarWidget(parent=self, resource_root=self._resource_root, registry=self._session.block_registry)
    self._hotbar.setVisible(False)
    self._route_overlay = RouteOverlayWidget(self)
    self._route_overlay.setVisible(True)

    self._inventory = InventoryOverlay(parent=self, resource_root=self._resource_root, registry=self._session.block_registry)

    self._overlays = ViewportOverlays(
      refs=OverlayRefs(
        pause=self._overlay,
        settings=self._settings,
        othello_settings=self._othello_settings,
        inventory=self._inventory,
        death=self._death,
        crosshair=self._crosshair,
        hotbar=self._hotbar,
        hud_getter=lambda: self._hud,
        othello_hud_getter=lambda: self._othello_hud,
      ),
      runner=self._runner,
      inp=self._inp,
    )
    self._overlay.preview_changed.connect(self._invalidate_pause_preview_cache)
    self._overlay.preview_changed.connect(self.update)
    settings_controller.bind_settings_overlay(self)
    othello_controller.bind_othello_controls(self)
    overlay_controller.bind_overlay_actions(self)

    self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
    self.setMouseTracking(True)
    self.setAttribute(Qt.WidgetAttribute.WA_OpaquePaintEvent, True)
    self.setAttribute(Qt.WidgetAttribute.WA_NoSystemBackground, True)
    self.setAttribute(Qt.WidgetAttribute.WA_InputMethodEnabled, False)
    self.setAutoFillBackground(False)
    self.request_draw(self._draw_render_frame)

    self._sim_timer = QTimer(self)
    self._sim_timer.setTimerType(Qt.TimerType.PreciseTimer)
    self._sim_timer.setInterval(int(self._effective_sim_timer_interval_ms()))
    self._sim_timer.timeout.connect(self._tick_sim)

    self._render_timer = QTimer(self)
    self._render_timer.setTimerType(Qt.TimerType.PreciseTimer)
    self._render_timer.setInterval(int(self._effective_render_timer_interval_ms()))
    self._render_timer.timeout.connect(self._request_render)
    self._deactivation_pause_timer = QTimer(self)
    self._deactivation_pause_timer.setSingleShot(True)
    self._deactivation_pause_timer.setInterval(int(_APPLICATION_DEACTIVATION_PAUSE_DELAY_MS))
    self._deactivation_pause_timer.timeout.connect(self._pause_after_application_deactivation)
    self._pause_on_application_deactivation = False

    self._state, persisted_othello_state = apply_persisted_state_if_present(project_root=self._project_root, data_root=self._data_root, sessions=self._sessions, renderer=self._renderer)
    if launch_player_name is not None:
      self._state.player_name = str(launch_player_name)
    self._session = self._sessions.set_active_space(self._state.current_space_id)
    self._othello_match.set_default_settings(self._state.othello_settings)
    self._othello_match.set_game_state(persisted_othello_state)
    self._overlay.set_current_space(self._state.current_space_id)
    self._audio = AudioManager(resource_root=self._resource_root, block_registry=self._session.block_registry, parent=self)

    settings_controller.refresh_player_identity(self, regenerate_if_blank=True)
    settings_controller.apply_runtime_to_renderer(self)
    settings_controller.sync_input_bindings(self)
    settings_controller.sync_audio_preferences(self)
    settings_controller.sync_hotbar_widgets(self)
    settings_controller.sync_crosshair_widgets(self)
    settings_controller.sync_player_skin(self)
    settings_controller.sync_first_person_target(self)
    settings_controller.sync_view_model_visibility(self)
    othello_controller.sync_settings_values(self)
    othello_controller.sync_hud_text(self)
    self._sync_gameplay_hud_visibility()
    if app is not None:
      app.applicationStateChanged.connect(self._on_application_state_changed)
      app.installEventFilter(self)
      self._application_event_filter_app = app

  def _visible_overlay_blocks_game_input(self) -> bool:
    for overlay in (self._overlay, self._settings, self._othello_settings, self._inventory, self._death):
      try:
        if overlay is not None and bool(overlay.isVisible()):
          return True
      except RuntimeError:
        continue
    return False

  def _macos_game_input_priority_active(self) -> bool:
    if sys.platform != "darwin":
      return False
    if not hasattr(self, "_frame_sync") or not hasattr(self, "_overlays") or not hasattr(self, "_inp"):
      return False
    if bool(self.loading_active()) or not bool(getattr(self, "_application_active", True)):
      return False
    if not bool(getattr(self, "_runtime_active", False)) or not bool(self._inp.captured()):
      return False
    if bool(self._overlays.any_modal_open()) or bool(self._visible_overlay_blocks_game_input()):
      return False
    return not bool(self._overlays.paused() or self._overlays.inventory_open() or self._overlays.dead() or self._overlays.settings_open() or self._overlays.othello_settings_open())

  def _queue_render_after_input(self) -> None:
    if not bool(getattr(self, "_renderer_initialized", False)):
      return
    try:
      self.request_draw()
    except Exception:
      pass

  def event(self, e) -> bool:
    if bool(self._macos_game_input_priority_active()):
      if e.type() in _MACOS_CAPTURE_CONSUME_EVENT_TYPES:
        e.accept()
        return True
    return super().event(e)

  def eventFilter(self, watched, e) -> bool:
    if bool(self._macos_game_input_priority_active()):
      event_type = e.type()
      if event_type in _MACOS_CAPTURE_CONSUME_EVENT_TYPES:
        e.accept()
        return True
      if self._redirected_game_input_source(watched) and event_type in _MACOS_CAPTURE_REDIRECT_EVENT_TYPES:
        if event_type == QEvent.Type.KeyPress:
          self.keyPressEvent(e)
          return bool(e.isAccepted())
        if event_type == QEvent.Type.KeyRelease:
          self.keyReleaseEvent(e)
          return bool(e.isAccepted())
        if event_type == QEvent.Type.MouseButtonPress:
          self.mousePressEvent(e)
          return bool(e.isAccepted())
        if event_type == QEvent.Type.MouseButtonDblClick:
          self.mouseDoubleClickEvent(e)
          return bool(e.isAccepted())
        if event_type == QEvent.Type.MouseButtonRelease:
          self.mouseReleaseEvent(e)
          return bool(e.isAccepted())
        if event_type == QEvent.Type.MouseMove:
          self.mouseMoveEvent(e)
          return bool(e.isAccepted())
        if event_type == QEvent.Type.Wheel:
          self.wheelEvent(e)
          return bool(e.isAccepted())
    return super().eventFilter(watched, e)

  def _redirected_game_input_source(self, watched) -> bool:
    """
    application-wide event filter からviewportへ転送する対象を、rendercanvasを含む子QWidgetに限定する。
    同じnative mouse eventに由来するQWindow段階とQWidget段階の双方をinteractionへ配送するとtoggleが二重適用されるため、window objectと無関係なapplication widgetは通常のQt配送へ委譲する。
    """
    return bool(watched is not self and isinstance(watched, QWidget) and self.isAncestorOf(watched))

  def _dispatch_game_mouse_press(self, e: QMouseEvent) -> bool:
    """
    一つの物理button-downから生じるpress又はdouble-clickを一度だけgameplay interactionへ配送する。
    button-upまで同じbuttonをactive集合へ保持し、rendercanvasとviewportの重複配送又はnative double-click変換が同一stateを二回toggleして元へ戻すことを防ぐ。
    """
    button = e.button()
    if button != Qt.MouseButton.NoButton and button in self._dispatched_mouse_buttons:
      e.accept()
      return True
    if button != Qt.MouseButton.NoButton:
      self._dispatched_mouse_buttons.add(button)
    return bool(interaction_controller.handle_mouse_press(self, e))

  def keyPressEvent(self, e: QKeyEvent) -> None:
    if bool(self.loading_active()):
      e.accept()
      return
    if interaction_controller.handle_key_press(self, e):
      self._queue_render_after_input()
      return
    if bool(self._macos_game_input_priority_active()):
      e.accept()
      self._queue_render_after_input()
      return
    super().keyPressEvent(e)

  def keyReleaseEvent(self, e) -> None:
    if bool(self.loading_active()):
      e.accept()
      return
    self._inp.on_key_release(e)
    self._queue_render_after_input()
    if bool(self._macos_game_input_priority_active()):
      e.accept()
      return
    super().keyReleaseEvent(e)

  def _handle_native_game_key(self, key: int, pressed: bool, auto_repeat: bool) -> None:
    if sys.platform != "darwin":
      return
    if bool(self.loading_active()) or (not bool(self._macos_game_input_priority_active())):
      return
    event_type = QEvent.Type.KeyPress if bool(pressed) else QEvent.Type.KeyRelease
    event = QKeyEvent(event_type, int(key), Qt.KeyboardModifier.NoModifier, "", bool(auto_repeat), 1)
    if bool(pressed):
      interaction_controller.handle_key_press(self, event)
    else:
      self._inp.on_key_release(event)
    event.accept()
    self._queue_render_after_input()

  def wheelEvent(self, e: QWheelEvent) -> None:
    if bool(self.loading_active()):
      e.accept()
      return
    if interaction_controller.handle_wheel(self, e):
      self._queue_render_after_input()
      return
    if bool(self._macos_game_input_priority_active()):
      e.accept()
      self._queue_render_after_input()
      return
    super().wheelEvent(e)

  def mousePressEvent(self, e: QMouseEvent) -> None:
    if bool(self.loading_active()):
      e.accept()
      return
    self._dispatch_game_mouse_press(e)
    self._queue_render_after_input()
    if bool(self._macos_game_input_priority_active()):
      e.accept()
      return
    super().mousePressEvent(e)

  def mouseDoubleClickEvent(self, e: QMouseEvent) -> None:
    """
    Qt が高速な第2押下を `MouseButtonDblClick` へ置換した場合も、単独の物理押下として gameplay interaction へ配送する。
    macOS WGPU の rendercanvas 子 widget から転送された event と viewport 自身へ届いた event を同一経路で処理し、長押し repeat の interval は変更しない。
    """
    if bool(self.loading_active()):
      e.accept()
      return
    handled = bool(self._dispatch_game_mouse_press(e))
    self._queue_render_after_input()
    if bool(handled) or bool(self._macos_game_input_priority_active()):
      e.accept()
      return
    super().mouseDoubleClickEvent(e)

  def mouseReleaseEvent(self, e: QMouseEvent) -> None:
    if bool(self.loading_active()):
      e.accept()
      return
    self._dispatched_mouse_buttons.discard(e.button())
    interaction_controller.handle_mouse_release(self, e)
    self._queue_render_after_input()
    if bool(self._macos_game_input_priority_active()):
      e.accept()
      return
    super().mouseReleaseEvent(e)

  def mouseMoveEvent(self, e: QMouseEvent) -> None:
    if bool(self.loading_active()) or (
      self._overlays.paused() or self._overlays.inventory_open() or self._overlays.dead() or self._overlays.settings_open() or self._overlays.othello_settings_open() or (not self._inp.captured())
    ):
      super().mouseMoveEvent(e)
      return
    e.accept()
    self._inp.on_captured_mouse_move(e)
    self._queue_render_after_input()

  def resizeEvent(self, e) -> None:
    super().resizeEvent(e)
    self.resize_renderer(int(self.width()), int(self.height()))

  def _request_render(self) -> None:
    if not bool(self._renderer_initialized):
      self.initialize_renderer()
    try:
      self.force_draw()
    except RuntimeError:
      self.request_draw()

  def _draw_render_frame(self) -> None:
    self.paint_renderer()
    self._on_frame_swapped()

  def defaultFramebufferObject(self) -> int:
    return 0

  def initialize_renderer(self) -> None:
    self._begin_loading("Initializing renderer...")
    try:
      self._renderer.initialize(self._assets_dir, block_registry=self._session.block_registry)
    except Exception as exc:
      try:
        self._sim_timer.stop()
      except Exception:
        pass
      try:
        self._render_timer.stop()
      except Exception:
        pass
      try:
        self._inp.set_mouse_capture(False)
      except Exception:
        pass
      print("".join(traceback.format_exception(type(exc), exc, exc.__traceback__)), file=sys.stderr, flush=True)
      QMessageBox.critical(self, "Renderer initialization failed", str(exc).strip() if str(exc).strip() else "Unknown renderer initialization error.")
      raise

    self._state.vsync_on = False
    self._frame_sync.reset_after_gl_initialize()
    self._sync_player_skin_design(push_to_renderer=True, context_current=True)
    settings_controller.apply_runtime_to_renderer(self)
    settings_controller.sync_input_bindings(self)
    settings_controller.sync_audio_preferences(self)
    settings_controller.sync_hotbar_widgets(self)
    settings_controller.sync_crosshair_widgets(self)
    settings_controller.sync_cloud_motion_pause(self)
    othello_controller.sync_hud_text(self)
    self._sync_gameplay_hud_visibility()
    self._gl_initialized = True
    self._renderer_initialized = True
    self._begin_loading("Loading world...")
    self._sync_runtime_activity()

  def resize_renderer(self, w: int, h: int) -> None:
    self.resizeGL(int(w), int(h))

  def paint_renderer(self) -> None:
    try:
      self.paintGL()
    except Exception as exc:
      try:
        self._sim_timer.stop()
      except Exception:
        pass
      try:
        self._render_timer.stop()
      except Exception:
        pass
      print("".join(traceback.format_exception(type(exc), exc, exc.__traceback__)), file=sys.stderr, flush=True)
      raise

  def showEvent(self, e) -> None:
    super().showEvent(e)
    self.arm_resume_refresh()
    settings_controller.sync_cloud_motion_pause(self)
    self._sync_runtime_activity()
    self._request_render()

  def hideEvent(self, e) -> None:
    self._set_runtime_active(False)
    settings_controller.sync_cloud_motion_pause(self)
    super().hideEvent(e)
