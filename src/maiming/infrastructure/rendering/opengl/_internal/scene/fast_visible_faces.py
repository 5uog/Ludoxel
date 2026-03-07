# FILE: src/maiming/infrastructure/rendering/opengl/_internal/scene/fast_visible_faces.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Iterator

from maiming.domain.blocks.block_definition import BlockDefinition
from maiming.domain.blocks.models.api import render_boxes_for_block
from maiming.domain.blocks.models.common import LocalBox
from maiming.domain.blocks.state_codec import parse_state
from maiming.infrastructure.rendering.opengl._internal.scene.face_occlusion import is_local_face_occluded

GetState = Callable[[int, int, int], str | None]
DefLookup = Callable[[str], BlockDefinition | None]

_EPS = 1e-7

@dataclass(frozen=True)
class FastVisibleFace:
    box: object
    face_idx: int
    mn: tuple[float, float, float]
    mx: tuple[float, float, float]

def _eq(a: float, b: float) -> bool:
    return abs(float(a) - float(b)) <= _EPS

def _face_touches_cell_boundary(face_idx: int, box: LocalBox) -> bool:
    fi = int(face_idx)

    if fi == 0:
        return _eq(float(box.mx_x), 1.0)
    if fi == 1:
        return _eq(float(box.mn_x), 0.0)
    if fi == 2:
        return _eq(float(box.mx_y), 1.0)
    if fi == 3:
        return _eq(float(box.mn_y), 0.0)
    if fi == 4:
        return _eq(float(box.mx_z), 1.0)
    return _eq(float(box.mn_z), 0.0)

def _neighbor_cell(x: int, y: int, z: int, face_idx: int) -> tuple[int, int, int]:
    fi = int(face_idx)

    if fi == 0:
        return (int(x + 1), int(y), int(z))
    if fi == 1:
        return (int(x - 1), int(y), int(z))
    if fi == 2:
        return (int(x), int(y + 1), int(z))
    if fi == 3:
        return (int(x), int(y - 1), int(z))
    if fi == 4:
        return (int(x), int(y), int(z + 1))
    return (int(x), int(y), int(z - 1))

def _boundary_neighbor_is_full_cube_solid(
    *,
    x: int,
    y: int,
    z: int,
    face_idx: int,
    box: LocalBox,
    get_state: GetState,
    def_lookup: DefLookup,
) -> bool:
    if not _face_touches_cell_boundary(int(face_idx), box):
        return False

    nx, ny, nz = _neighbor_cell(int(x), int(y), int(z), int(face_idx))
    nst = get_state(int(nx), int(ny), int(nz))
    if nst is None:
        return False

    nb, _np = parse_state(str(nst))
    nd = def_lookup(str(nb))
    if nd is None:
        return False

    return bool(nd.is_full_cube) and bool(nd.is_solid)

def iter_fast_visible_faces(
    *,
    x: int,
    y: int,
    z: int,
    state_str: str,
    get_state: GetState,
    def_lookup: DefLookup,
) -> Iterator[FastVisibleFace]:
    boxes = render_boxes_for_block(
        str(state_str),
        get_state,
        def_lookup,
        int(x),
        int(y),
        int(z),
    )
    if not boxes:
        return

    for box in boxes:
        mn = (
            float(x) + float(box.mn_x),
            float(y) + float(box.mn_y),
            float(z) + float(box.mn_z),
        )
        mx = (
            float(x) + float(box.mx_x),
            float(y) + float(box.mx_y),
            float(z) + float(box.mx_z),
        )

        for fi in range(6):
            if is_local_face_occluded(
                box=box,
                face_idx=int(fi),
                boxes=boxes,
            ):
                continue

            if _boundary_neighbor_is_full_cube_solid(
                x=int(x),
                y=int(y),
                z=int(z),
                face_idx=int(fi),
                box=box,
                get_state=get_state,
                def_lookup=def_lookup,
            ):
                continue

            yield FastVisibleFace(
                box=box,
                face_idx=int(fi),
                mn=mn,
                mx=mx,
            )