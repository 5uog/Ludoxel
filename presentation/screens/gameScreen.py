# FILE: presentation/screens/gameScreen.py
from __future__ import annotations
from pathlib import Path
from PyQt6.QtWidgets import QWidget, QVBoxLayout

from presentation.widgets.glViewportWidget import GLViewportWidget
from presentation.widgets.hudWidget import HUDWidget

class GameScreen(QWidget):
    def __init__(self, project_root: Path, parent=None) -> None:
        super().__init__(parent)
        self.project_root = project_root

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        self.viewport = GLViewportWidget(project_root=self.project_root)
        self.hud = HUDWidget()

        layout.addWidget(self.viewport)
        self.viewport.set_hud(self.hud)
        self.viewport.hud_updated.connect(self.hud.set_text)