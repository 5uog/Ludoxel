# FILE: presentation/windows/mainWindow.py
from __future__ import annotations
from pathlib import Path
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtGui import QSurfaceFormat
from presentation.screens.gameScreen import GameScreen

def _set_default_gl_format() -> None:
    fmt = QSurfaceFormat()
    fmt.setVersion(3, 3)
    fmt.setProfile(QSurfaceFormat.OpenGLContextProfile.CoreProfile)
    fmt.setDepthBufferSize(24)
    fmt.setStencilBufferSize(8)
    fmt.setSamples(4)  # MSAA for smoother projected shadow edges
    fmt.setSwapBehavior(QSurfaceFormat.SwapBehavior.DoubleBuffer)
    QSurfaceFormat.setDefaultFormat(fmt)

def run_app() -> None:
    _set_default_gl_format()

    app = QApplication([])
    app.setApplicationName("Maiming v2.5")

    root = Path(__file__).resolve().parents[2]
    qss = root / "presentation" / "theme" / "main.qss"
    if qss.exists():
        app.setStyleSheet(qss.read_text(encoding="utf-8"))

    w = QMainWindow()
    w.setWindowTitle("Maiming v2.5")
    w.setCentralWidget(GameScreen(project_root=root))
    w.resize(1280, 720)
    w.show()

    app.exec()