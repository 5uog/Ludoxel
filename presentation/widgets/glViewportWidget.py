# FILE: presentation/widgets/glViewportWidget.py
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QPoint
from PyQt6.QtOpenGLWidgets import QOpenGLWidget
from PyQt6.QtGui import QMouseEvent, QKeyEvent, QSurfaceFormat, QCursor

from core.math.vec3 import Vec3
from application.session.fixedStepRunner import FixedStepRunner
from application.session.sessionManager import SessionManager
from infrastructure.platform.qtInputAdapter import QtInputAdapter
from infrastructure.rendering.opengl.glRenderer import GLRenderer
from presentation.widgets.pauseOverlay import PauseOverlay
from presentation.widgets.crosshairWidget import CrosshairWidget
from presentation.config.gameLoopParams import GameLoopParams, DEFAULT_GAME_LOOP_PARAMS

class GLViewportWidget(QOpenGLWidget):
    hud_updated = pyqtSignal(str)

    def __init__(self, project_root: Path, parent=None, loop_params: GameLoopParams = DEFAULT_GAME_LOOP_PARAMS) -> None:
        super().__init__(parent)
        self._project_root = project_root
        self._assets_dir = project_root / "assets"
        self._loop = loop_params

        self._input = QtInputAdapter(self)
        self._session = SessionManager.create_default(seed=0)
        self._runner = FixedStepRunner(step_dt=self._loop.step_dt(), on_step=self._on_step)

        self._renderer = GLRenderer()
        self._hud = None
        self._world_uploaded = -1

        self._captured = False
        self._ignore_next_move = False

        self._paused = False
        self._invert_x = False
        self._invert_y = False
        self._cloud_wire = False

        self._debug_shadow = False
        self._renderer.set_debug_shadow(self._debug_shadow)

        self._overlay = PauseOverlay(self)
        self._overlay.resume_requested.connect(self._resume_from_overlay)
        self._overlay.fov_changed.connect(self._set_fov)
        self._overlay.sens_changed.connect(self._set_sens)
        self._overlay.invert_x_changed.connect(self._set_invert_x)
        self._overlay.invert_y_changed.connect(self._set_invert_y)
        self._overlay.cloud_wireframe_changed.connect(self._set_cloud_wire)

        self._crosshair = CrosshairWidget(self)
        self._crosshair.setVisible(True)

        self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.setMouseTracking(True)

        self._sim_timer = QTimer(self)
        self._sim_timer.setInterval(int(self._loop.sim_timer_interval_ms))
        self._sim_timer.timeout.connect(self._tick_sim)

        self._render_timer = QTimer(self)
        self._render_timer.setInterval(int(self._loop.render_timer_interval_ms))
        self._render_timer.timeout.connect(self.update)

        fmt = QSurfaceFormat()
        fmt.setVersion(3, 3)
        fmt.setProfile(QSurfaceFormat.OpenGLContextProfile.CoreProfile)
        fmt.setDepthBufferSize(24)
        self.setFormat(fmt)

    def set_hud(self, hud) -> None:
        self._hud = hud
        self._hud.setParent(self)
        self._hud.move(10, 10)
        self._hud.show()
        self._hud.raise_()

    def initializeGL(self) -> None:
        self._renderer.initialize(self._assets_dir)
        self._renderer.set_cloud_wireframe(self._cloud_wire)
        self._runner.start()
        self._sim_timer.start()
        self._render_timer.start()

    def resizeGL(self, w: int, h: int) -> None:
        if self._hud is not None:
            self._hud.move(10, 10)
            self._hud.raise_()
        self._overlay.setGeometry(0, 0, max(1, w), max(1, h))
        self._crosshair.setGeometry(0, 0, max(1, w), max(1, h))
        if self._paused:
            self._overlay.raise_()
        else:
            self._crosshair.raise_()

    def paintGL(self) -> None:
        snap = self._session.make_snapshot()

        if int(snap.world_revision) != int(self._world_uploaded):
            blocks = [(b.x, b.y, b.z, b.block_id) for b in snap.blocks]
            self._renderer.submit_world(world_revision=int(snap.world_revision), blocks=blocks)
            self._world_uploaded = int(snap.world_revision)

        cam = snap.camera
        self._renderer.render(
            w=max(1, self.width()),
            h=max(1, self.height()),
            eye=Vec3(cam.eye_x, cam.eye_y, cam.eye_z),
            yaw_deg=cam.yaw_deg,
            pitch_deg=cam.pitch_deg,
            fov_deg=cam.fov_deg,
        )

    def _tick_sim(self) -> None:
        if not self._paused:
            self._runner.update()

    def _on_step(self, dt: float) -> None:
        fr = self._input.consume()

        mdx = fr.mdx
        mdy = fr.mdy
        if self._invert_x:
            mdx = -mdx
        if self._invert_y:
            mdy = -mdy

        self._session.step(
            dt=dt,
            move_f=fr.move_f,
            move_s=fr.move_s,
            jump=fr.jump_pressed,
            crouch=fr.crouch,
            mdx=mdx,
            mdy=mdy,
        )

        shadow_ok, shadow_size = self._renderer.shadow_info()
        mode = self._renderer.shadow_status_text()

        p = self._session.player
        hud = (
            "WASD: move | Space: jump | Shift: crouch | Click: capture mouse | ESC: pause/menu | F3: shadow debug view\n"
            f"pos=({p.position.x:.2f},{p.position.y:.2f},{p.position.z:.2f}) "
            f"vel=({p.velocity.x:.2f},{p.velocity.y:.2f},{p.velocity.z:.2f}) "
            f"ground={int(p.on_ground)} yaw={p.yaw_deg:.1f} pitch={p.pitch_deg:.1f} "
            f"fov={self._session.settings.fov_deg:.0f} sens={self._session.settings.mouse_sens_deg_per_px:.3f}\n"
            f"shadow={int(shadow_ok)} size={int(shadow_size)} mode={mode} dbg={int(self._debug_shadow)}"
        )
        self.hud_updated.emit(hud)

    def _center_global(self) -> QPoint:
        c = QPoint(self.width() // 2, self.height() // 2)
        return self.mapToGlobal(c)

    def _set_mouse_capture(self, on: bool) -> None:
        if on == self._captured:
            return
        self._captured = on
        if on:
            self.setCursor(Qt.CursorShape.BlankCursor)
            self.grabMouse()
            QCursor.setPos(self._center_global())
            self._ignore_next_move = True
        else:
            self.releaseMouse()
            self.unsetCursor()

    def _sync_overlay_values(self) -> None:
        self._overlay.sync_values(
            fov_deg=self._session.settings.fov_deg,
            sens_deg_per_px=self._session.settings.mouse_sens_deg_per_px,
            inv_x=self._invert_x,
            inv_y=self._invert_y,
            cloud_wire=self._cloud_wire,
        )

    def _set_paused(self, on: bool) -> None:
        if on == self._paused:
            return
        self._paused = on

        self._input.reset()

        if on:
            self._set_mouse_capture(False)
            self._sync_overlay_values()
            self._overlay.setVisible(True)
            self._overlay.raise_()
        else:
            self._overlay.setVisible(False)
            self._runner.start()
            self._set_mouse_capture(True)
            self._crosshair.raise_()
            if self._hud is not None:
                self._hud.raise_()

    def _resume_from_overlay(self) -> None:
        self._set_paused(False)

    def _set_fov(self, fov: float) -> None:
        self._session.settings.set_fov(float(fov))

    def _set_sens(self, sens: float) -> None:
        self._session.settings.set_mouse_sens(float(sens))

    def _set_invert_x(self, on: bool) -> None:
        self._invert_x = bool(on)

    def _set_invert_y(self, on: bool) -> None:
        self._invert_y = bool(on)

    def _set_cloud_wire(self, on: bool) -> None:
        self._cloud_wire = bool(on)
        self._renderer.set_cloud_wireframe(self._cloud_wire)

    def keyPressEvent(self, e: QKeyEvent) -> None:
        if int(e.key()) == int(Qt.Key.Key_F3):
            self._debug_shadow = not self._debug_shadow
            self._renderer.set_debug_shadow(self._debug_shadow)
            return

        if int(e.key()) == int(Qt.Key.Key_Escape):
            self._set_paused(not self._paused)
            return

        if not self._paused:
            self._input.on_key_press(e)
        super().keyPressEvent(e)

    def keyReleaseEvent(self, e: QKeyEvent) -> None:
        self._input.on_key_release(e)
        super().keyReleaseEvent(e)

    def mousePressEvent(self, e: QMouseEvent) -> None:
        self.setFocus()
        if self._paused:
            super().mousePressEvent(e)
            return
        if not self._captured:
            self._set_mouse_capture(True)
        super().mousePressEvent(e)

    def mouseMoveEvent(self, e: QMouseEvent) -> None:
        if self._paused or not self._captured:
            super().mouseMoveEvent(e)
            return

        if self._ignore_next_move:
            self._ignore_next_move = False
            super().mouseMoveEvent(e)
            return

        center_local = QPoint(self.width() // 2, self.height() // 2)
        dx = float(e.position().x() - center_local.x())
        dy = float(e.position().y() - center_local.y())

        if dx != 0.0 or dy != 0.0:
            self._input.add_mouse_delta(dx, dy)
            QCursor.setPos(self._center_global())
            self._ignore_next_move = True

        super().mouseMoveEvent(e)