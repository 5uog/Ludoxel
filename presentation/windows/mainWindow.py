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
    fmt.setSamples(4)
    fmt.setSwapBehavior(QSurfaceFormat.SwapBehavior.DoubleBuffer)
    QSurfaceFormat.setDefaultFormat(fmt)

class MainWindow(QMainWindow):
    def __init__(self, root: Path) -> None:
        super().__init__()
        self._root = Path(root)
        self._screen = GameScreen(project_root=self._root)
        self.setCentralWidget(self._screen)

    def closeEvent(self, e) -> None:
        try:
            self._screen.viewport.save_state()
        except Exception:
            pass
        super().closeEvent(e)

def run_app() -> None:
    _set_default_gl_format()

    app = QApplication([])
    app.setApplicationName("Maiming v2.5")

    root = Path(__file__).resolve().parents[2]
    qss = root / "presentation" / "theme" / "main.qss"
    if qss.exists():
        app.setStyleSheet(qss.read_text(encoding="utf-8"))

    w = MainWindow(root=root)
    w.setWindowTitle("Maiming v2.5")
    w.resize(1280, 720)
    w.show()

    app.exec()