# FILE: src/maiming/presentation/widgets/viewport/viewport_hud.py
from __future__ import annotations

import math
import time
import tracemalloc
import threading
from dataclasses import dataclass

from maiming.core.math.vec3 import Vec3
from maiming.application.session.session_manager import SessionManager
from maiming.infrastructure.rendering.opengl.facade.gl_renderer import GLRenderer
from maiming.infrastructure.metrics import (
    SystemInfo,
    ProcessMemorySnapshot,
    GpuUtilizationSampler,
    read_system_info,
    read_process_memory,
)
from maiming.presentation.widgets.hud.hud_payload import HudPayload
from maiming.version import __version__

@dataclass
class HudFps:
    render_fps: float
    sim_fps: float

@dataclass
class _PyAllocState:
    cur_bytes: int
    peak_bytes: int
    rate_mib_s: float
    last_bytes: int
    last_t: float

@dataclass(frozen=True)
class _ExternalMetrics:
    """
    _ExternalMetrics stores values that are potentially expensive to query.
    The values are refreshed in a background thread so the UI thread never blocks on OS tools.
    """
    gpu_util_percent: float | None
    rss_bytes: int | None
    total_bytes: int | None
    updated_t: float

class ViewportHud:
    """
    ViewportHud owns time-windowed estimators and assembles a multi-cluster HUD payload.
    Expensive probes are sampled asynchronously, and the UI thread only consumes cached values.
    """
    def __init__(self) -> None:
        self._fps_render: float = 0.0
        self._fps_sim: float = 0.0
        self._fps_window_t0: float = time.perf_counter()
        self._fps_render_frames: int = 0
        self._fps_sim_steps: int = 0

        self._hud_emit_last_t: float = 0.0
        self._hud_emit_interval_s: float = 0.10

        self._sys: SystemInfo = read_system_info()
        self._gpu = GpuUtilizationSampler(min_interval_s=1.0)

        if not tracemalloc.is_tracing():
            tracemalloc.start()

        now = time.perf_counter()
        cur, peak = tracemalloc.get_traced_memory()
        self._py = _PyAllocState(
            cur_bytes=int(cur),
            peak_bytes=int(peak),
            rate_mib_s=0.0,
            last_bytes=int(cur),
            last_t=float(now),
        )

        self._ext_lock = threading.Lock()
        self._ext = _ExternalMetrics(
            gpu_util_percent=None,
            rss_bytes=None,
            total_bytes=self._sys.total_mem_bytes,
            updated_t=0.0,
        )

        self._ext_thread = threading.Thread(target=self._external_probe_loop, name="HudExternalProbe", daemon=True)
        self._ext_thread.start()

    def _external_probe_loop(self) -> None:
        """
        This loop performs best-effort probes at a low frequency and never touches UI objects.
        Failures are tolerated and simply leave the last cached values unchanged.
        """
        while True:
            try:
                snap = read_process_memory(total_mem_bytes=self._sys.total_mem_bytes)
            except Exception:
                snap = ProcessMemorySnapshot(rss_bytes=None, total_bytes=self._sys.total_mem_bytes)

            try:
                gpu = self._gpu.sample()
            except Exception:
                gpu = None

            t = time.perf_counter()
            with self._ext_lock:
                self._ext = _ExternalMetrics(
                    gpu_util_percent=gpu,
                    rss_bytes=snap.rss_bytes,
                    total_bytes=snap.total_bytes if snap.total_bytes is not None else self._sys.total_mem_bytes,
                    updated_t=float(t),
                )

            time.sleep(1.0)

    def on_render_frame(self) -> None:
        self._fps_render_frames += 1
        self._maybe_update_fps()

    def on_sim_step(self) -> None:
        self._fps_sim_steps += 1
        self._maybe_update_fps()

    def _maybe_update_fps(self) -> None:
        now = time.perf_counter()
        dt = float(now - self._fps_window_t0)
        if dt < 0.5:
            return

        self._fps_render = float(self._fps_render_frames) / dt if dt > 1e-9 else 0.0
        self._fps_sim = float(self._fps_sim_steps) / dt if dt > 1e-9 else 0.0

        self._fps_window_t0 = now
        self._fps_render_frames = 0
        self._fps_sim_steps = 0

    def fps(self) -> HudFps:
        return HudFps(render_fps=float(self._fps_render), sim_fps=float(self._fps_sim))

    def should_emit(self) -> bool:
        now = time.perf_counter()
        if (now - float(self._hud_emit_last_t)) < float(self._hud_emit_interval_s):
            return False
        self._hud_emit_last_t = now
        return True

    @staticmethod
    def _mib(x_bytes: int | None) -> float | None:
        if x_bytes is None:
            return None
        return float(x_bytes) / (1024.0 * 1024.0)

    @staticmethod
    def _fmt_mib(x_bytes: int | None, digits: int = 0) -> str:
        v = ViewportHud._mib(x_bytes)
        if v is None:
            return ""
        if digits <= 0:
            return f"{v:.0f} MiB"
        return f"{v:.{digits}f} MiB"

    def _update_py_alloc(self) -> None:
        now = time.perf_counter()
        cur, peak = tracemalloc.get_traced_memory()

        dt = float(now - float(self._py.last_t))
        dcur = float(int(cur) - int(self._py.last_bytes))
        rate = (dcur / (1024.0 * 1024.0)) / dt if dt > 1e-6 else 0.0
        if rate < 0.0:
            rate = 0.0

        self._py = _PyAllocState(
            cur_bytes=int(cur),
            peak_bytes=int(peak),
            rate_mib_s=float(rate),
            last_bytes=int(cur),
            last_t=float(now),
        )

    @staticmethod
    def _cardinal_and_towards(forward: Vec3) -> tuple[str, str]:
        fx = float(forward.x)
        fz = float(forward.z)
        ax = abs(fx)
        az = abs(fz)

        if ax >= az:
            d = "E" if fx > 0.0 else "W"
            t = "positive X" if fx > 0.0 else "negative X"
            return d, t

        d = "S" if fz > 0.0 else "N"
        t = "positive Z" if fz > 0.0 else "negative Z"
        return d, t

    @staticmethod
    def _chunk_coords(b: int) -> tuple[int, int]:
        c = int(math.floor(float(b) / 16.0))
        r = int(b - c * 16)
        return c, r

    def build_payload(
        self,
        *,
        session: SessionManager,
        renderer: GLRenderer,
        auto_jump_enabled: bool,
        build_mode: bool,
        inventory_open: bool,
        selected_block_id: str,
        reach: float,
        sun_az_deg: float,
        sun_el_deg: float,
        shadow_enabled: bool,
        world_wire: bool,
        cloud_wire: bool,
        cloud_enabled: bool,
        cloud_density: int,
        cloud_seed: int,
        debug_shadow: bool,
        fb_w: int,
        fb_h: int,
        dpr: float,
        vsync_on: bool,
        render_timer_interval_ms: int,
        sim_hz: float,
    ) -> HudPayload:
        fps = self.fps()

        t_txt = "inf" if int(render_timer_interval_ms) <= 0 else f"{(1000.0 / float(render_timer_interval_ms)):.0f}"
        vs = "vsync" if bool(vsync_on) else ""

        top_left = (
            f"FPS: {fps.render_fps:.1f} T: {t_txt} {vs}\n"
            f"SIM: {fps.sim_fps:.1f} Hz: {float(sim_hz):.0f}\n"
            "F4: shadow debug | F3: toggle HUD | ESC: pause/menu | Click: capture mouse"
        ).strip()

        with self._ext_lock:
            ext = self._ext

        gpu = ext.gpu_util_percent
        gpu_line = f"GPU: {gpu:.0f}%" if gpu is not None else "GPU: n/a"

        self._update_py_alloc()

        used_bytes = ext.rss_bytes
        used_label = "rss"
        if used_bytes is None or int(used_bytes) <= 0:
            used_bytes = int(max(0, int(self._py.cur_bytes)))
            used_label = "heap"

        total_bytes = ext.total_bytes
        if total_bytes is not None and int(total_bytes) > 0:
            pct = float(used_bytes) / float(total_bytes) * 100.0 if float(total_bytes) > 1.0 else 0.0
            mem_line = f"Mem: {pct:.0f}% {self._fmt_mib(int(used_bytes))} / {self._fmt_mib(int(total_bytes))} ({used_label})"
        else:
            mem_line = f"Mem: {self._fmt_mib(int(used_bytes))} ({used_label})"

        ap = 0.0
        if int(self._py.peak_bytes) > 0:
            ap = float(self._py.cur_bytes) / float(self._py.peak_bytes) * 100.0

        top_right = (
            f"{gpu_line}\n\n"
            f"{mem_line}\n"
            f"Allocation rate: {self._py.rate_mib_s:.1f} MiB/s\n"
            f"Allocated: {ap:.0f}% {self._fmt_mib(int(self._py.cur_bytes))}"
        ).strip()

        p = session.player

        px, py, pz = float(p.position.x), float(p.position.y), float(p.position.z)
        bx, by, bz = int(math.floor(px)), int(math.floor(py)), int(math.floor(pz))

        cx, rx = self._chunk_coords(bx)
        cy, ry = self._chunk_coords(by)
        cz, rz = self._chunk_coords(bz)

        fwd = p.view_forward()
        d, t = self._cardinal_and_towards(fwd)

        bottom_left = (
            f"XYZ: {px:.2f} / {py:.2f} / {pz:.2f}\n"
            f"Block: {bx} {by} {bz}\n"
            f"Chunk: {cx} {cy} {cz} [{rx} {rz}]\n"
            f"Facing: {d} (Towards {t}) ({p.yaw_deg:.1f} {p.pitch_deg:.1f})\n"
            "DIM FC: overworld"
        ).strip()

        shadow_ok, shadow_size = renderer.shadow_info()
        mode = renderer.shadow_status_text()

        cloud_mode = ""
        if bool(cloud_enabled):
            cloud_mode = "fancy-clouds" if int(cloud_density) >= 2 else ("fast-clouds" if int(cloud_density) == 1 else "")
        filtering = "None"

        cpu_speed = ""
        if self._sys.cpu_speed_ghz is not None and float(self._sys.cpu_speed_ghz) > 0.0:
            cpu_speed = f" {float(self._sys.cpu_speed_ghz):.2f} GHz"

        gl_vendor, gl_rend, gl_ver, _glsl = renderer.gl_info()

        bottom_right = (
            f"C: {cloud_mode}\n"
            f"Filtering: {filtering}\n"
            f"shadow={int(bool(shadow_ok))} size={int(shadow_size)} mode={mode}\n"
            f"worldWire={int(bool(world_wire))} cloudWire={int(bool(cloud_wire))} dbgShadow={int(bool(debug_shadow))}\n"
            f"sunAz={float(sun_az_deg):.0f} sunEl={float(sun_el_deg):.0f}\n\n"
            f"Maiming: {__version__}\n"
            f"CPU: {int(self._sys.cpu_threads)} threads{cpu_speed} {str(self._sys.cpu_name)}\n"
            f"Display: {int(fb_w)}x{int(fb_h)} (dpr={float(dpr):.2f})\n"
            f"{str(gl_vendor)}\n"
            f"{str(gl_rend)}\n"
            f"OpenGL {str(gl_ver)}"
        ).strip()

        return HudPayload(
            top_left=str(top_left),
            top_right=str(top_right),
            bottom_left=str(bottom_left),
            bottom_right=str(bottom_right),
        )