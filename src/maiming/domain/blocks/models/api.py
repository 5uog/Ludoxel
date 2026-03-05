from __future__ import annotations

from typing import List

from maiming.domain.blocks.state_codec import parse_state
from maiming.domain.blocks.models.common import LocalBox, GetState, GetDef
from maiming.domain.blocks.models.slab import boxes_for_slab
from maiming.domain.blocks.models.stairs import boxes_for_stairs
from maiming.domain.blocks.models.fence import boxes_for_fence
from maiming.domain.blocks.models.fence_gate import boxes_for_fence_gate
from maiming.domain.blocks.models.wall import boxes_for_wall

def render_boxes_for_block(
    state_str: str,
    get_state: GetState,
    get_def: GetDef,
    x: int,
    y: int,
    z: int,
) -> List[LocalBox]:
    base, props = parse_state(state_str)
    defn = get_def(str(base))
    kind = defn.kind if defn is not None else "cube"

    if kind == "slab":
        return boxes_for_slab(props)

    if kind == "stairs":
        return boxes_for_stairs(
            base_id=str(base),
            props=props,
            get_state=get_state,
            get_def=get_def,
            x=int(x),
            y=int(y),
            z=int(z),
        )

    if kind == "fence":
        return boxes_for_fence(get_state=get_state, get_def=get_def, x=int(x), y=int(y), z=int(z))

    if kind == "fence_gate":
        return boxes_for_fence_gate(props)

    if kind == "wall":
        return boxes_for_wall(
            props=props,
            get_state=get_state,
            get_def=get_def,
            x=int(x),
            y=int(y),
            z=int(z),
        )

    if kind == "short_cube":
        return [LocalBox(0.0, 0.0, 0.0, 1.0, 15.0 / 16.0, 1.0)]

    return [LocalBox(0.0, 0.0, 0.0, 1.0, 1.0, 1.0)]

def collision_boxes_for_block(
    state_str: str,
    get_state: GetState,
    get_def: GetDef,
    x: int,
    y: int,
    z: int,
) -> List[LocalBox]:
    base, props = parse_state(state_str)
    defn = get_def(str(base))
    kind = defn.kind if defn is not None else "cube"

    if kind == "fence_gate":
        open_s = str(props.get("open", "false")).lower()
        is_open = open_s in ("1", "true", "yes", "on")
        if bool(is_open):
            return []
        r = render_boxes_for_block(state_str, get_state, get_def, x, y, z)
        out: list[LocalBox] = []
        for b in r:
            out.append(LocalBox(b.mn_x, b.mn_y, b.mn_z, b.mx_x, max(1.5, float(b.mx_y)), b.mx_z, uv_hint=str(b.uv_hint)))
        return out

    if kind == "fence":
        r = render_boxes_for_block(state_str, get_state, get_def, x, y, z)
        out: list[LocalBox] = []
        for b in r:
            out.append(LocalBox(b.mn_x, b.mn_y, b.mn_z, b.mx_x, 1.5, b.mx_z))
        return out

    if kind == "wall":
        r = render_boxes_for_block(state_str, get_state, get_def, x, y, z)
        out: list[LocalBox] = []
        for b in r:
            out.append(LocalBox(b.mn_x, b.mn_y, b.mn_z, b.mx_x, 1.5, b.mx_z))
        return out

    return render_boxes_for_block(state_str, get_state, get_def, x, y, z)