# FILE: domain/blocks/runtimeModels.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict, List, Tuple

from domain.blocks.stateCodec import parse_state
from domain.blocks.blockDefinition import BlockDefinition

@dataclass(frozen=True)
class LocalBox:
    mn_x: float
    mn_y: float
    mn_z: float
    mx_x: float
    mx_y: float
    mx_z: float

    def clamp01(self) -> "LocalBox":
        def c(v: float) -> float:
            return 0.0 if v < 0.0 else 1.0 if v > 1.0 else float(v)

        return LocalBox(
            mn_x=c(self.mn_x), mn_y=c(self.mn_y), mn_z=c(self.mn_z),
            mx_x=c(self.mx_x), mx_y=c(self.mx_y), mx_z=c(self.mx_z),
        )

GetState = Callable[[int, int, int], str | None]
GetDef = Callable[[str], BlockDefinition | None]

def _rot_y_cw(p_x: float, p_z: float, turns: int) -> tuple[float, float]:
    t = int(turns) & 3
    x = float(p_x)
    z = float(p_z)

    if t == 0:
        return x, z
    if t == 1:
        return 1.0 - z, x
    if t == 2:
        return 1.0 - x, 1.0 - z
    return z, 1.0 - x

def rotate_box_y_cw(b: LocalBox, turns: int) -> LocalBox:
    xs = [b.mn_x, b.mx_x]
    zs = [b.mn_z, b.mx_z]
    pts: list[tuple[float, float]] = []
    for x in xs:
        for z in zs:
            pts.append(_rot_y_cw(x, z, turns))

    mnx = min(p[0] for p in pts)
    mxx = max(p[0] for p in pts)
    mnz = min(p[1] for p in pts)
    mxz = max(p[1] for p in pts)

    return LocalBox(mnx, b.mn_y, mnz, mxx, b.mx_y, mxz)

def _cardinal_turns_from_facing(facing: str) -> int:
    f = str(facing)
    if f == "east":
        return 0
    if f == "south":
        return 1
    if f == "west":
        return 2
    if f == "north":
        return 3
    return 0

def _gate_turns_from_facing(facing: str) -> int:
    f = str(facing)
    if f == "south":
        return 0
    if f == "west":
        return 1
    if f == "north":
        return 2
    if f == "east":
        return 3
    return 0

def _is_full_solid(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    return bool(defn.is_full_cube and defn.is_solid)

def _is_fence_like(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    if defn.kind == "fence":
        return True
    if defn.kind == "fence_gate":
        return True
    return defn.has_tag("fence") or defn.has_tag("fence_gate")

def _get_neighbor_def(get_state: GetState, get_def: GetDef, x: int, y: int, z: int) -> BlockDefinition | None:
    s = get_state(int(x), int(y), int(z))
    if s is None:
        return None
    base, _p = parse_state(s)
    return get_def(str(base))

def _stairs_shape(
    base_id: str,
    props: Dict[str, str],
    get_state: GetState,
    get_def: GetDef,
    x: int,
    y: int,
    z: int,
) -> str:
    facing = str(props.get("facing", "east"))
    half = str(props.get("half", "bottom"))
    if half not in ("bottom", "top"):
        half = "bottom"

    def _is_same_stair_at(nx: int, ny: int, nz: int) -> tuple[bool, str, str]:
        s = get_state(nx, ny, nz)
        if s is None:
            return (False, "east", "bottom")
        b, p = parse_state(s)
        if str(b) != str(base_id):
            return (False, "east", "bottom")
        d = get_def(str(b))
        if d is None or d.kind != "stairs":
            return (False, "east", "bottom")
        hf = str(p.get("half", "bottom"))
        fc = str(p.get("facing", "east"))
        return (hf == half, fc, hf)

    dir_vec: dict[str, tuple[int, int]] = {
        "east": (1, 0),
        "south": (0, 1),
        "west": (-1, 0),
        "north": (0, -1),
    }
    left = {"east": "north", "north": "west", "west": "south", "south": "east"}[facing]
    right = {"east": "south", "south": "west", "west": "north", "north": "east"}[facing]

    fdx, fdz = dir_vec[facing]
    ok_f, fc_f, _ = _is_same_stair_at(x + fdx, y, z + fdz)
    if ok_f:
        if fc_f == left:
            return "outer_left"
        if fc_f == right:
            return "outer_right"

    ok_b, fc_b, _ = _is_same_stair_at(x - fdx, y, z - fdz)
    if ok_b:
        if fc_b == left:
            return "inner_left"
        if fc_b == right:
            return "inner_right"

    return "straight"

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
        t = str(props.get("type", "bottom"))
        if t == "top":
            return [LocalBox(0.0, 0.5, 0.0, 1.0, 1.0, 1.0)]
        if t == "double":
            return [LocalBox(0.0, 0.0, 0.0, 1.0, 1.0, 1.0)]
        return [LocalBox(0.0, 0.0, 0.0, 1.0, 0.5, 1.0)]

    if kind == "stairs":
        facing = str(props.get("facing", "east"))
        half = str(props.get("half", "bottom"))
        if half not in ("bottom", "top"):
            half = "bottom"

        shape = _stairs_shape(str(base), props, get_state, get_def, int(x), int(y), int(z))

        if half == "bottom":
            base_y0, base_y1 = 0.0, 0.5
            step_y0, step_y1 = 0.5, 1.0
        else:
            base_y0, base_y1 = 0.5, 1.0
            step_y0, step_y1 = 0.0, 0.5

        def base_q(x0: float, x1: float, z0: float, z1: float) -> LocalBox:
            return LocalBox(float(x0), float(base_y0), float(z0), float(x1), float(base_y1), float(z1))

        base_boxes: list[LocalBox] = [
            base_q(0.0, 0.5, 0.0, 0.5),
            base_q(0.5, 1.0, 0.0, 0.5),
            base_q(0.0, 0.5, 0.5, 1.0),
            base_q(0.5, 1.0, 0.5, 1.0),
        ]

        def step_box(x0: float, x1: float, z0: float, z1: float) -> LocalBox:
            return LocalBox(float(x0), float(step_y0), float(z0), float(x1), float(step_y1), float(z1))

        step_boxes: list[LocalBox] = []
        if shape == "straight":
            step_boxes.append(step_box(0.5, 1.0, 0.0, 1.0))
        elif shape == "outer_left":
            step_boxes.append(step_box(0.5, 1.0, 0.0, 0.5))
        elif shape == "outer_right":
            step_boxes.append(step_box(0.5, 1.0, 0.5, 1.0))
        elif shape == "inner_left":
            step_boxes.append(step_box(0.5, 1.0, 0.0, 1.0))
            step_boxes.append(step_box(0.0, 0.5, 0.0, 0.5))
        elif shape == "inner_right":
            step_boxes.append(step_box(0.5, 1.0, 0.0, 1.0))
            step_boxes.append(step_box(0.0, 0.5, 0.5, 1.0))
        else:
            step_boxes.append(step_box(0.5, 1.0, 0.0, 1.0))

        turns = _cardinal_turns_from_facing(facing)
        boxes = base_boxes + step_boxes
        return [rotate_box_y_cw(b, turns) for b in boxes]

    if kind == "fence":
        connections = {"north": False, "south": False, "east": False, "west": False}

        for d, (dx, dz) in (("north", (0, -1)), ("south", (0, 1)), ("east", (1, 0)), ("west", (-1, 0))):
            s = get_state(int(x + dx), int(y), int(z + dz))
            if s is None:
                continue
            nb, _np = parse_state(str(s))
            nd = get_def(str(nb))
            if nd is None:
                connections[d] = True
                continue
            if _is_full_solid(nd) or _is_fence_like(nd):
                connections[d] = True

        post = LocalBox(6.0 / 16.0, 0.0, 6.0 / 16.0, 10.0 / 16.0, 1.0, 10.0 / 16.0)
        boxes = [post]

        base_low = LocalBox(7.0 / 16.0, 6.0 / 16.0, 0.0 / 16.0, 9.0 / 16.0, 9.0 / 16.0, 9.0 / 16.0)
        base_high = LocalBox(7.0 / 16.0, 12.0 / 16.0, 0.0 / 16.0, 9.0 / 16.0, 15.0 / 16.0, 9.0 / 16.0)

        if connections["north"]:
            boxes.append(base_low)
            boxes.append(base_high)
        if connections["east"]:
            boxes.append(rotate_box_y_cw(base_low, 1))
            boxes.append(rotate_box_y_cw(base_high, 1))
        if connections["south"]:
            boxes.append(rotate_box_y_cw(base_low, 2))
            boxes.append(rotate_box_y_cw(base_high, 2))
        if connections["west"]:
            boxes.append(rotate_box_y_cw(base_low, 3))
            boxes.append(rotate_box_y_cw(base_high, 3))

        return boxes

    if kind == "fence_gate":
        facing = str(props.get("facing", "south"))
        open_s = str(props.get("open", "false")).lower()
        is_open = open_s in ("1", "true", "yes", "on")

        closed_boxes = [
            LocalBox(0.0 / 16.0, 5.0 / 16.0, 7.0 / 16.0, 2.0 / 16.0, 16.0 / 16.0, 9.0 / 16.0),
            LocalBox(14.0 / 16.0, 5.0 / 16.0, 7.0 / 16.0, 16.0 / 16.0, 16.0 / 16.0, 9.0 / 16.0),
            LocalBox(6.0 / 16.0, 6.0 / 16.0, 7.0 / 16.0, 8.0 / 16.0, 15.0 / 16.0, 9.0 / 16.0),
            LocalBox(8.0 / 16.0, 6.0 / 16.0, 7.0 / 16.0, 10.0 / 16.0, 15.0 / 16.0, 9.0 / 16.0),
            LocalBox(2.0 / 16.0, 6.0 / 16.0, 7.0 / 16.0, 6.0 / 16.0, 9.0 / 16.0, 9.0 / 16.0),
            LocalBox(2.0 / 16.0, 12.0 / 16.0, 7.0 / 16.0, 6.0 / 16.0, 15.0 / 16.0, 9.0 / 16.0),
            LocalBox(10.0 / 16.0, 6.0 / 16.0, 7.0 / 16.0, 14.0 / 16.0, 9.0 / 16.0, 9.0 / 16.0),
            LocalBox(10.0 / 16.0, 12.0 / 16.0, 7.0 / 16.0, 14.0 / 16.0, 15.0 / 16.0, 9.0 / 16.0),
        ]

        open_boxes = [
            LocalBox(0.0 / 16.0, 5.0 / 16.0, 7.0 / 16.0, 2.0 / 16.0, 16.0 / 16.0, 9.0 / 16.0),
            LocalBox(14.0 / 16.0, 5.0 / 16.0, 7.0 / 16.0, 16.0 / 16.0, 16.0 / 16.0, 9.0 / 16.0),
            LocalBox(0.0 / 16.0, 6.0 / 16.0, 13.0 / 16.0, 2.0 / 16.0, 15.0 / 16.0, 15.0 / 16.0),
            LocalBox(14.0 / 16.0, 6.0 / 16.0, 13.0 / 16.0, 16.0 / 16.0, 15.0 / 16.0, 15.0 / 16.0),
            LocalBox(0.0 / 16.0, 6.0 / 16.0, 9.0 / 16.0, 2.0 / 16.0, 9.0 / 16.0, 13.0 / 16.0),
            LocalBox(0.0 / 16.0, 12.0 / 16.0, 9.0 / 16.0, 2.0 / 16.0, 15.0 / 16.0, 13.0 / 16.0),
            LocalBox(14.0 / 16.0, 6.0 / 16.0, 9.0 / 16.0, 16.0 / 16.0, 9.0 / 16.0, 13.0 / 16.0),
            LocalBox(14.0 / 16.0, 12.0 / 16.0, 9.0 / 16.0, 16.0 / 16.0, 15.0 / 16.0, 13.0 / 16.0),
        ]

        turns = _gate_turns_from_facing(facing)
        src = open_boxes if is_open else closed_boxes
        return [rotate_box_y_cw(b, turns) for b in src]

    return [LocalBox(0.0, 0.0, 0.0, 1.0, 1.0, 1.0)]

def collision_boxes_for_block(
    state_str: str,
    get_state: GetState,
    get_def: GetDef,
    x: int,
    y: int,
    z: int,
) -> List[LocalBox]:
    base, _props = parse_state(state_str)
    defn = get_def(str(base))
    kind = defn.kind if defn is not None else "cube"

    if kind == "fence":
        r = render_boxes_for_block(state_str, get_state, get_def, x, y, z)
        out: list[LocalBox] = []
        for b in r:
            out.append(LocalBox(b.mn_x, b.mn_y, b.mn_z, b.mx_x, 1.5, b.mx_z))
        return out

    return render_boxes_for_block(state_str, get_state, get_def, x, y, z)