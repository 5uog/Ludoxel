# FILE: src/maiming/domain/blocks/models/fence_gate.py
from __future__ import annotations

from typing import Dict, List

from maiming.domain.blocks.models.common import LocalBox, rotate_box_y_cw, gate_turns_from_facing

def _b(
    x0: float,
    y0: float,
    z0: float,
    x1: float,
    y1: float,
    z1: float,
    *,
    uv_hint: str,
) -> LocalBox:
    return LocalBox(
        mn_x=float(x0) / 16.0,
        mn_y=float(y0) / 16.0,
        mn_z=float(z0) / 16.0,
        mx_x=float(x1) / 16.0,
        mx_y=float(y1) / 16.0,
        mx_z=float(z1) / 16.0,
        uv_hint=str(uv_hint),
    )

def _shift_y(boxes: list[LocalBox], dy_px: float) -> list[LocalBox]:
    dy = float(dy_px) / 16.0
    out: list[LocalBox] = []
    for b in boxes:
        out.append(
            LocalBox(
                mn_x=float(b.mn_x),
                mn_y=float(b.mn_y) + dy,
                mn_z=float(b.mn_z),
                mx_x=float(b.mx_x),
                mx_y=float(b.mx_y) + dy,
                mx_z=float(b.mx_z),
                uv_hint=str(b.uv_hint),
            )
        )
    return out

def _closed_boxes() -> list[LocalBox]:
    return [
        _b(0, 5, 7, 2, 16, 9, uv_hint="post"),
        _b(14, 5, 7, 16, 16, 9, uv_hint="post"),
        _b(6, 6, 7, 8, 15, 9, uv_hint="stile"),
        _b(8, 6, 7, 10, 15, 9, uv_hint="stile"),
        _b(2, 6, 7, 6, 9, 9, uv_hint="rail"),
        _b(2, 12, 7, 6, 15, 9, uv_hint="rail"),
        _b(10, 6, 7, 14, 9, 9, uv_hint="rail"),
        _b(10, 12, 7, 14, 15, 9, uv_hint="rail"),
    ]

def _wall_closed_boxes() -> list[LocalBox]:
    return _shift_y(_closed_boxes(), -3.0)

def _open_boxes() -> list[LocalBox]:
    return [
        _b(0, 5, 7, 2, 16, 9, uv_hint="post"),
        _b(14, 5, 7, 16, 16, 9, uv_hint="post"),
        _b(0, 6, 13, 2, 15, 15, uv_hint="stile"),
        _b(14, 6, 13, 16, 15, 15, uv_hint="stile"),
        _b(0, 6, 9, 2, 9, 13, uv_hint="rail"),
        _b(0, 12, 9, 2, 15, 13, uv_hint="rail"),
        _b(14, 6, 9, 16, 9, 13, uv_hint="rail"),
        _b(14, 12, 9, 16, 15, 13, uv_hint="rail"),
    ]

def _wall_open_boxes() -> list[LocalBox]:
    return _shift_y(_open_boxes(), -3.0)

def boxes_for_fence_gate(props: Dict[str, str]) -> List[LocalBox]:
    facing = str(props.get("facing", "south"))

    open_s = str(props.get("open", "false")).lower()
    is_open = open_s in ("1", "true", "yes", "on")

    in_wall_s = str(props.get("in_wall", "false")).lower()
    in_wall = in_wall_s in ("1", "true", "yes", "on")

    if bool(is_open):
        src = _wall_open_boxes() if bool(in_wall) else _open_boxes()
    else:
        src = _wall_closed_boxes() if bool(in_wall) else _closed_boxes()

    turns = gate_turns_from_facing(facing)
    return [rotate_box_y_cw(b, turns) for b in src]