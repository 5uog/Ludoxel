# Copyright 2026 Kento Konishi (https://github.com/5uog)
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations
from pathlib import Path

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QApplication, QFrame, QLabel, QMainWindow, QVBoxLayout

from ...application.boot.version import __version__
from .config.gl_surface_format import install_default_gl_surface_format
from .game_screen import GameScreen
from .theme.fonts import install_minecraft_fonts, apply_application_font

class _StartupSplash(QFrame):
    def __init__(self, *, status_text: str) -> None:
        super().__init__(None, Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint | Qt.WindowType.SplashScreen)
        self.setObjectName("startupSplash")
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setStyleSheet("QFrame#startupSplash { background: #121212; }" "QLabel#startupTitle { color: #f4f4f4; font-size: 28px; font-weight: 700; }" "QLabel#startupStatus { color: #c8c8c8; font-size: 14px; }")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.addStretch(1)

        title = QLabel("Ludoxel", self)
        title.setObjectName("startupTitle")
        title.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        layout.addWidget(title)

        self._status = QLabel("", self)
        self._status.setObjectName("startupStatus")
        self._status.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        layout.addWidget(self._status)

        layout.addStretch(1)
        self.set_status_text(status_text)

    def set_status_text(self, text: str) -> None:
        self._status.setText(str(text).strip() or "Loading...")

class MainWindow(QMainWindow):
    def __init__(self, project_root: Path) -> None:
        super().__init__()
        self._project_root = Path(project_root)
        self._screen = GameScreen(project_root=self._project_root)
        self.setCentralWidget(self._screen)
        self._screen.viewport.fullscreen_changed.connect(self._apply_fullscreen)

    def wants_fullscreen(self) -> bool:
        return bool(self._screen.viewport.fullscreen_enabled())

    def _apply_fullscreen(self, on: bool) -> None:
        if bool(on):
            if not self.isFullScreen():
                self.showFullScreen()
            return

        if self.isFullScreen():
            self.showNormal()

    def closeEvent(self, e) -> None:
        try:
            self._screen.viewport.shutdown()
        except Exception:
            pass
        super().closeEvent(e)

def run_app(*, project_root: Path) -> None:
    install_default_gl_surface_format()

    root = Path(project_root)

    app = QApplication([])
    app.setApplicationName(f"Ludoxel v{__version__}")

    fonts = install_minecraft_fonts(font_dir=(root / "assets" / "fonts"))
    if bool(fonts.ok):
        apply_application_font(app=app, family=str(fonts.family), point_size=12)

    qss = Path(__file__).resolve().parent / "theme" / "main.qss"
    if qss.exists():
        app.setStyleSheet(qss.read_text(encoding="utf-8"))

    w = MainWindow(project_root=root)
    w.setWindowTitle(f"Ludoxel v{__version__}")
    w.resize(1280, 720)
    w.setMinimumSize(1280, 720)
    screen = app.primaryScreen()
    available = None if screen is None else screen.availableGeometry()
    if available is not None:
        if bool(w.wants_fullscreen()):
            splash_geometry = available
            w.setGeometry(available)
        else:
            target_width = max(int(w.minimumWidth()), int(w.width()))
            target_height = max(int(w.minimumHeight()), int(w.height()))
            left = int(available.x() + max(0, (available.width() - target_width) // 2))
            top = int(available.y() + max(0, (available.height() - target_height) // 2))
            w.setGeometry(left, top, target_width, target_height)
            splash_geometry = w.geometry()
    else:
        splash_geometry = w.geometry()

    splash = _StartupSplash(status_text="Preparing viewport...")
    splash.setGeometry(splash_geometry)
    splash.show()
    splash.raise_()
    app.processEvents()

    viewport = w._screen.viewport
    viewport.loading_status_changed.connect(splash.set_status_text)
    viewport.loading_finished.connect(splash.close)
    splash.set_status_text(viewport.loading_status_text())
    if bool(w.wants_fullscreen()):
        w.showFullScreen()
    else:
        w.show()
    splash.raise_()

    app.exec()