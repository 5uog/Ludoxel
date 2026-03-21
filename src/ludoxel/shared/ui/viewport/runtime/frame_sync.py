# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass, field

import time

from ....math.vec3 import Vec3

_WORLD_CHANGE_FORCE_S = 0.12
_RESUME_FORCE_S = 0.18


@dataclass
class LoadingState:
    active: bool = True
    status: str = "Initializing renderer..."
    progress: tuple[int, int] = (-1, -1)

    def begin(self) -> bool:
        became_active = not bool(self.active)
        self.active = True
        self.progress = (-1, -1)
        return bool(became_active)

    def finish(self) -> bool:
        if not bool(self.active):
            return False
        self.active = False
        return True

    def status_text(self) -> str:
        return str(self.status)

    def set_status(self, text: str) -> bool:
        next_text = str(text).strip() or "Loading..."
        if next_text == str(self.status):
            return False
        self.status = str(next_text)
        return True

    def set_progress(self, *, ready_chunks: int, total_chunks: int) -> bool:
        progress = (int(ready_chunks), int(total_chunks))
        if progress == self.progress:
            return False
        self.progress = progress
        return True


@dataclass
class WorldUploadCadence:
    interval_s: float = 1.0 / 20.0
    linear_threshold_sq: float = 1.0 * 1.0
    last_eye: Vec3 | None = None
    last_world_revision: int = -1
    last_render_distance_chunks: int = -1
    last_session_token: int = -1
    last_time_s: float = 0.0
    force_until_s: float = 0.0

    def reset(self, *, force_duration_s: float=0.0) -> None:
        self.last_eye = None
        self.last_world_revision = -1
        self.last_render_distance_chunks = -1
        self.last_session_token = -1
        self.last_time_s = 0.0
        self.force_until_s = 0.0
        self.arm_force(force_duration_s=force_duration_s)

    def arm_force(self, *, force_duration_s: float) -> None:
        duration = max(0.0, float(force_duration_s))
        if duration <= 0.0:
            return
        self.force_until_s = max(float(self.force_until_s), float(time.perf_counter()) + duration)

    def arm_resume(self) -> None:
        self.last_eye = None
        self.arm_force(force_duration_s=_RESUME_FORCE_S)

    def note_runtime_started(self, *, now: float) -> None:
        self.last_time_s = float(now)

    def world_revision_changed(self, *, world_revision: int) -> bool:
        return int(world_revision) != int(self.last_world_revision)

    def due(self, *, has_ready_results: bool, visible_chunks_ready: bool, world_revision: int, session_token: int, render_distance_chunks: int, eye: Vec3) -> bool:
        now = time.perf_counter()
        if bool(has_ready_results):
            return True
        if not bool(visible_chunks_ready):
            return True
        if self.world_revision_changed(world_revision=int(world_revision)):
            return True
        if now < float(self.force_until_s):
            return True
        if int(session_token) != int(self.last_session_token):
            return True
        if int(render_distance_chunks) != int(self.last_render_distance_chunks):
            return True
        if self.last_eye is None:
            return True

        dx = float(eye.x) - float(self.last_eye.x)
        dy = float(eye.y) - float(self.last_eye.y)
        dz = float(eye.z) - float(self.last_eye.z)
        moved_sq = (dx * dx) + (dy * dy) + (dz * dz)
        if moved_sq < float(self.linear_threshold_sq):
            return False
        return (now - float(self.last_time_s)) >= float(self.interval_s)

    def mark(self, *, eye: Vec3, world_revision: int, render_distance_chunks: int, session_token: int) -> None:
        self.last_eye = Vec3(float(eye.x), float(eye.y), float(eye.z))
        self.last_world_revision = int(world_revision)
        self.last_render_distance_chunks = int(render_distance_chunks)
        self.last_session_token = int(session_token)
        self.last_time_s = float(time.perf_counter())


@dataclass
class SelectionRefreshCadence:
    interval_s: float = 1.0 / 30.0
    linear_threshold_sq: float = 0.20 * 0.20
    angular_threshold_deg: float = 0.75
    last_pose: tuple[float, float, float, float, float] | None = None
    last_space_id: str = ""
    last_world_revision: int = -1
    last_refresh_time_s: float = 0.0
    force_until_s: float = 0.0

    def reset(self, *, force_duration_s: float=0.0) -> None:
        self.last_pose = None
        self.last_space_id = ""
        self.last_world_revision = -1
        self.last_refresh_time_s = 0.0
        self.force_until_s = 0.0
        self.arm_force(force_duration_s=force_duration_s)

    def invalidate(self, *, force_duration_s: float) -> None:
        self.last_pose = None
        self.last_space_id = ""
        self.last_world_revision = -1
        self.arm_force(force_duration_s=force_duration_s)

    def arm_force(self, *, force_duration_s: float) -> None:
        duration = max(0.0, float(force_duration_s))
        if duration <= 0.0:
            return
        self.force_until_s = max(float(self.force_until_s), float(time.perf_counter()) + duration)

    def arm_resume(self) -> None:
        self.last_pose = None
        self.last_space_id = ""
        self.last_world_revision = -1
        self.arm_force(force_duration_s=_RESUME_FORCE_S)

    def note_runtime_started(self, *, now: float) -> None:
        self.last_refresh_time_s = float(now)

    def world_revision_changed(self, *, world_revision: int) -> bool:
        return int(world_revision) != int(self.last_world_revision)

    @staticmethod
    def _angle_delta_deg(left: float, right: float) -> float:
        delta = (float(left) - float(right) + 180.0) % 360.0 - 180.0
        return abs(float(delta))

    def due(self, *, eye: Vec3, yaw_deg: float, pitch_deg: float, current_space_id: str, current_world_revision: int, target_present: bool, is_othello_space: bool) -> bool:
        now = time.perf_counter()
        if self.world_revision_changed(world_revision=int(current_world_revision)):
            return True
        if now < float(self.force_until_s):
            return True
        if str(current_space_id) != str(self.last_space_id):
            return True
        if self.last_pose is None:
            return True
        if (now - float(self.last_refresh_time_s)) < float(self.interval_s):
            return False

        px, py, pz, pyaw, ppitch = self.last_pose
        dx = float(eye.x) - float(px)
        dy = float(eye.y) - float(py)
        dz = float(eye.z) - float(pz)
        moved_sq = (dx * dx) + (dy * dy) + (dz * dz)
        if moved_sq >= float(self.linear_threshold_sq):
            return True
        if self._angle_delta_deg(float(yaw_deg), float(pyaw)) >= float(self.angular_threshold_deg):
            return True
        if self._angle_delta_deg(float(pitch_deg), float(ppitch)) >= float(self.angular_threshold_deg):
            return True
        if (not bool(is_othello_space)) and (not bool(target_present)):
            return False
        return False

    def mark(self, *, eye: Vec3, yaw_deg: float, pitch_deg: float, current_space_id: str, current_world_revision: int) -> None:
        self.last_pose = (float(eye.x), float(eye.y), float(eye.z), float(yaw_deg), float(pitch_deg))
        self.last_space_id = str(current_space_id)
        self.last_world_revision = int(current_world_revision)
        self.last_refresh_time_s = float(time.perf_counter())


@dataclass
class ViewportFrameSync:
    loading: LoadingState = field(default_factory=LoadingState)
    upload: WorldUploadCadence = field(default_factory=WorldUploadCadence)
    selection: SelectionRefreshCadence = field(default_factory=SelectionRefreshCadence)

    def arm_world_change_sync(self) -> None:
        self.upload.arm_force(force_duration_s=_WORLD_CHANGE_FORCE_S)
        self.selection.arm_force(force_duration_s=_WORLD_CHANGE_FORCE_S)

    def arm_resume_refresh(self) -> None:
        self.upload.arm_resume()
        self.selection.arm_resume()

    def reset_after_gl_initialize(self) -> None:
        self.upload.reset(force_duration_s=_WORLD_CHANGE_FORCE_S)
        self.selection.reset(force_duration_s=_WORLD_CHANGE_FORCE_S)

    def note_runtime_started(self, *, now: float) -> None:
        self.upload.note_runtime_started(now=float(now))
        self.selection.note_runtime_started(now=float(now))
