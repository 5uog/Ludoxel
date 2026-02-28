# FILE: presentation/widgets/pauseOverlay.py
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QSlider, QCheckBox, QFrame, QSizePolicy
)

from presentation.config.pauseOverlayParams import PauseOverlayParams, DEFAULT_PAUSE_OVERLAY_PARAMS

class PauseOverlay(QWidget):
    resume_requested = pyqtSignal()
    fov_changed = pyqtSignal(float)
    sens_changed = pyqtSignal(float)
    invert_x_changed = pyqtSignal(bool)
    invert_y_changed = pyqtSignal(bool)
    cloud_wireframe_changed = pyqtSignal(bool)

    def __init__(self, parent: QWidget | None = None, params: PauseOverlayParams = DEFAULT_PAUSE_OVERLAY_PARAMS) -> None:
        super().__init__(parent)
        self._params = params

        self.setVisible(False)
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)

        self.setStyleSheet(
            "QWidget#pauseRoot { background: rgba(0,0,0,140); }"
            "QFrame#panel { background: rgba(32,34,37,230); border: 1px solid rgba(255,255,255,30); border-radius: 8px; }"
            "QLabel { color: white; font: 13px; }"
            "QPushButton { color: white; background: rgba(70,70,70,200); border: 1px solid rgba(255,255,255,40); padding: 8px 10px; border-radius: 6px; }"
            "QPushButton:hover { background: rgba(90,90,90,220); }"
            "QCheckBox { color: white; font: 13px; }"
        )
        self.setObjectName("pauseRoot")

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)

        root.addStretch(1)

        panel = QFrame(self)
        panel.setObjectName("panel")
        panel.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        panel.setMinimumWidth(520)

        pv = QVBoxLayout(panel)
        pv.setContentsMargins(18, 16, 18, 16)
        pv.setSpacing(12)

        title = QLabel("PAUSED", panel)
        title.setStyleSheet("QLabel { font: 20px; font-weight: 600; }")
        pv.addWidget(title)

        btn_row = QHBoxLayout()
        self._btn_resume = QPushButton("Resume", panel)
        self._btn_resume.clicked.connect(self.resume_requested.emit)
        btn_row.addWidget(self._btn_resume)
        btn_row.addStretch(1)
        pv.addLayout(btn_row)

        sep = QFrame(panel)
        sep.setFrameShape(QFrame.Shape.HLine)
        sep.setStyleSheet("QFrame { color: rgba(255,255,255,40); }")
        pv.addWidget(sep)

        st = QLabel("Settings (MVP)", panel)
        st.setStyleSheet("QLabel { font: 15px; font-weight: 600; }")
        pv.addWidget(st)

        fov_row = QVBoxLayout()
        self._lbl_fov = QLabel("FOV: 80", panel)
        self._sld_fov = QSlider(Qt.Orientation.Horizontal, panel)
        self._sld_fov.setRange(int(self._params.fov_min), int(self._params.fov_max))
        self._sld_fov.valueChanged.connect(self._on_fov)
        fov_row.addWidget(self._lbl_fov)
        fov_row.addWidget(self._sld_fov)
        pv.addLayout(fov_row)

        sens_row = QVBoxLayout()
        self._lbl_sens = QLabel("Mouse sensitivity: 0.090 deg/px", panel)
        self._sld_sens = QSlider(Qt.Orientation.Horizontal, panel)
        self._sld_sens.setRange(int(self._params.sens_milli_min), int(self._params.sens_milli_max))
        self._sld_sens.valueChanged.connect(self._on_sens)
        sens_row.addWidget(self._lbl_sens)
        sens_row.addWidget(self._sld_sens)
        pv.addLayout(sens_row)

        inv_row = QHBoxLayout()
        self._cb_inv_x = QCheckBox("Invert X", panel)
        self._cb_inv_y = QCheckBox("Invert Y", panel)
        self._cb_inv_x.toggled.connect(self.invert_x_changed.emit)
        self._cb_inv_y.toggled.connect(self.invert_y_changed.emit)
        inv_row.addWidget(self._cb_inv_x)
        inv_row.addWidget(self._cb_inv_y)
        inv_row.addStretch(1)
        pv.addLayout(inv_row)

        dbg_row = QHBoxLayout()
        self._cb_cloud_wire = QCheckBox("Cloud wireframe", panel)
        self._cb_cloud_wire.toggled.connect(self.cloud_wireframe_changed.emit)
        dbg_row.addWidget(self._cb_cloud_wire)
        dbg_row.addStretch(1)
        pv.addLayout(dbg_row)

        root.addWidget(panel, alignment=Qt.AlignmentFlag.AlignHCenter)
        root.addStretch(1)

    def sync_values(self, fov_deg: float, sens_deg_per_px: float, inv_x: bool, inv_y: bool, cloud_wire: bool) -> None:
        fov_i = int(round(float(fov_deg)))
        fov_i = max(int(self._params.fov_min), min(int(self._params.fov_max), fov_i))
        self._sld_fov.blockSignals(True)
        self._sld_fov.setValue(fov_i)
        self._sld_fov.blockSignals(False)
        self._lbl_fov.setText(f"FOV: {fov_i}")

        s = max(float(self._params.sens_min), min(float(self._params.sens_max), float(sens_deg_per_px)))
        si = int(round(s * float(self._params.sens_scale)))
        si = max(int(self._params.sens_milli_min), min(int(self._params.sens_milli_max), si))
        self._sld_sens.blockSignals(True)
        self._sld_sens.setValue(si)
        self._sld_sens.blockSignals(False)
        self._lbl_sens.setText(f"Mouse sensitivity: {s:.3f} deg/px")

        self._cb_inv_x.blockSignals(True)
        self._cb_inv_y.blockSignals(True)
        self._cb_inv_x.setChecked(bool(inv_x))
        self._cb_inv_y.setChecked(bool(inv_y))
        self._cb_inv_x.blockSignals(False)
        self._cb_inv_y.blockSignals(False)

        self._cb_cloud_wire.blockSignals(True)
        self._cb_cloud_wire.setChecked(bool(cloud_wire))
        self._cb_cloud_wire.blockSignals(False)

    def _on_fov(self, v: int) -> None:
        self._lbl_fov.setText(f"FOV: {int(v)}")
        self.fov_changed.emit(float(v))

    def _on_sens(self, v: int) -> None:
        s = float(v) / float(self._params.sens_scale)
        self._lbl_sens.setText(f"Mouse sensitivity: {s:.3f} deg/px")
        self.sens_changed.emit(s)