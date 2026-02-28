# FILE: presentation/config/pauseOverlayParams.py
from __future__ import annotations

from dataclasses import dataclass

from application.session.sessionSettings import SessionSettings

@dataclass(frozen=True)
class PauseOverlayParams:
    """
    UI mapping parameters for the pause overlay.
    Value ranges are sourced from SessionSettings to avoid duplication.
    Slider scaling is a UI concern and stays here.
    """

    fov_min: int = int(SessionSettings.FOV_MIN)
    fov_max: int = int(SessionSettings.FOV_MAX)

    sens_milli_min: int = 1
    sens_milli_max: int = 300
    sens_scale: float = 1000.0

    sens_min: float = float(SessionSettings.SENS_MIN)
    sens_max: float = float(SessionSettings.SENS_MAX)

DEFAULT_PAUSE_OVERLAY_PARAMS = PauseOverlayParams()