# FILE: src/maiming/infrastructure/rendering/opengl/facade/selection_controller.py
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from maiming.infrastructure.rendering.opengl._internal.passes.selection_pass import SelectionPass
from maiming.infrastructure.rendering.opengl._internal.scene.selection_outline_builder import GetState, SelectionOutlineBuilder

@dataclass
class SelectionController:
    outline_pass: SelectionPass
    outline_builder: SelectionOutlineBuilder
    outline_enabled: bool = True

    _selected_block: tuple[int, int, int] | None = field(default=None, init=False, repr=False)
    _outline_key: tuple[object, ...] | None = field(default=None, init=False, repr=False)

    def clear(self) -> None:
        self._selected_block = None
        self._outline_key = None
        self.outline_pass.clear()

    def set_outline_enabled(self, on: bool) -> None:
        enabled = bool(on)
        self.outline_enabled = enabled
        self._outline_key = None

        if not bool(self.outline_enabled):
            self.outline_pass.clear()

    @staticmethod
    def _outline_signature(
        *,
        x: int,
        y: int,
        z: int,
        state_str: str,
        get_state: GetState,
    ) -> tuple[str, ...]:
        sx = int(x)
        sy = int(y)
        sz = int(z)

        def gs(px: int, py: int, pz: int) -> str:
            s = get_state(int(px), int(py), int(pz))
            return "" if s is None else str(s)

        return (
            str(state_str),
            gs(sx + 1, sy, sz),
            gs(sx - 1, sy, sz),
            gs(sx, sy + 1, sz),
            gs(sx, sy - 1, sz),
            gs(sx, sy, sz + 1),
            gs(sx, sy, sz - 1),
        )

    def set_target(
        self,
        *,
        x: int,
        y: int,
        z: int,
        state_str: str,
        get_state: GetState,
        world_revision: int,
    ) -> None:
        _ = int(world_revision)

        cell = (int(x), int(y), int(z))
        self._selected_block = cell

        if not bool(self.outline_enabled):
            self.outline_pass.clear()
            self._outline_key = None
            return

        sig = self._outline_signature(
            x=int(cell[0]),
            y=int(cell[1]),
            z=int(cell[2]),
            state_str=str(state_str),
            get_state=get_state,
        )
        key: tuple[object, ...] = (
            int(cell[0]),
            int(cell[1]),
            int(cell[2]),
            *sig,
        )
        if self._outline_key == key:
            return

        verts = self.outline_builder.build(
            x=int(cell[0]),
            y=int(cell[1]),
            z=int(cell[2]),
            state_str=str(state_str),
            get_state=get_state,
        )
        self.outline_pass.set_lines(verts)
        self._outline_key = key

    def world_inputs(self) -> tuple[int, int, int, int]:
        if self._selected_block is None:
            return (0, 0, 0, 0)

        sx, sy, sz = self._selected_block
        mode = 1 if bool(self.outline_enabled) else 2
        return (int(mode), int(sx), int(sy), int(sz))

    def draw(self, *, view_proj: np.ndarray) -> None:
        if self._selected_block is None:
            return
        if not bool(self.outline_enabled):
            return
        self.outline_pass.draw(view_proj=view_proj)