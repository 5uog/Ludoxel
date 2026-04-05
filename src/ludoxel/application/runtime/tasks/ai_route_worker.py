# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from concurrent.futures import Future, ProcessPoolExecutor, ThreadPoolExecutor
from dataclasses import dataclass
import multiprocessing

from .ai_route_planner import AiRoutePlanRequest, AiRoutePlanResult, compute_ai_route_plan

_PROCESS_WORKERS = 1
_THREAD_FALLBACK_WORKERS = 1


@dataclass
class _PendingRoutePlan:
    actor_id: str
    generation: int
    future: Future


class AiRouteWorker:

    def __init__(self) -> None:
        self._process_executor: ProcessPoolExecutor | None = None
        self._process_unavailable = False
        self._thread_executor: ThreadPoolExecutor | None = None
        self._pending: dict[str, _PendingRoutePlan] = {}

    def _ensure_process_executor(self) -> ProcessPoolExecutor | None:
        if self._process_unavailable:
            return None
        if self._process_executor is not None:
            return self._process_executor
        try:
            self._process_executor = ProcessPoolExecutor(max_workers=int(_PROCESS_WORKERS), mp_context=multiprocessing.get_context("spawn"))
        except Exception:
            self._process_executor = None
            self._process_unavailable = True
        return self._process_executor

    def _ensure_thread_executor(self) -> ThreadPoolExecutor:
        if self._thread_executor is None:
            self._thread_executor = ThreadPoolExecutor(max_workers=int(_THREAD_FALLBACK_WORKERS), thread_name_prefix="ludoxel-ai-route")
        return self._thread_executor

    def warmup(self) -> None:
        self._ensure_process_executor()

    def request_plan(self, request: AiRoutePlanRequest) -> None:
        self.cancel_actor(str(request.actor_id))
        executor = self._ensure_process_executor()
        future: Future
        if executor is not None:
            try:
                future = executor.submit(compute_ai_route_plan, request)
            except Exception:
                self._process_unavailable = True
                future = self._ensure_thread_executor().submit(compute_ai_route_plan, request)
        else:
            future = self._ensure_thread_executor().submit(compute_ai_route_plan, request)
        self._pending[str(request.actor_id)] = _PendingRoutePlan(actor_id=str(request.actor_id), generation=int(request.generation), future=future)

    def cancel_actor(self, actor_id: str) -> None:
        pending = self._pending.pop(str(actor_id), None)
        if pending is None:
            return
        try:
            pending.future.cancel()
        except Exception:
            pass

    def poll_ready(self) -> tuple[AiRoutePlanResult, ...]:
        ready: list[AiRoutePlanResult] = []
        completed_ids: list[str] = []
        for actor_id, pending in self._pending.items():
            if not pending.future.done():
                continue
            completed_ids.append(str(actor_id))
            try:
                result = pending.future.result()
            except Exception:
                result = AiRoutePlanResult(generation=int(pending.generation), actor_id=str(actor_id), world_revision=-1, start_support=(0, 0, 0), route_target_index=0, success=False, path=())
            ready.append(result)
        for actor_id in completed_ids:
            self._pending.pop(str(actor_id), None)
        return tuple(ready)

    def shutdown(self) -> None:
        for pending in self._pending.values():
            try:
                pending.future.cancel()
            except Exception:
                pass
        self._pending.clear()
        if self._process_executor is not None:
            try:
                self._process_executor.shutdown(wait=False, cancel_futures=True)
            except Exception:
                pass
            self._process_executor = None
        if self._thread_executor is not None:
            try:
                self._thread_executor.shutdown(wait=False, cancel_futures=True)
            except Exception:
                pass
            self._thread_executor = None
