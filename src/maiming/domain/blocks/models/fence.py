# FILE: src/maiming/domain/blocks/models/fence.py
from __future__ import annotations

from typing import List

from maiming.domain.blocks.state_codec import parse_state
from maiming.domain.blocks.block_definition import BlockDefinition
from maiming.domain.blocks.models.common import (
    LocalBox,
    GetState,
    GetDef,
    rotate_box_y_cw,
    is_full_solid,
    fence_gate_connects_to_side,
    opposite_cardinal,
)

def _is_wall_like(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    if defn.kind == "wall":
        return True
    return defn.has_tag("wall")

def _is_fence(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    if defn.kind == "fence":
        return True
    return defn.has_tag("fence")

def _is_fence_gate(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    if defn.kind == "fence_gate":
        return True
    return defn.has_tag("fence_gate")

def boxes_for_fence(
    *,
    get_state: GetState,
    get_def: GetDef,
    x: int,
    y: int,
    z: int,
) -> List[LocalBox]:
    connections = {"north": False, "south": False, "east": False, "west": False}

    for d, (dx, dz) in (("north", (0, -1)), ("south", (0, 1)), ("east", (1, 0)), ("west", (-1, 0))):
        s = get_state(int(x + dx), int(y), int(z + dz))
        if s is None:
            continue
        nb, np = parse_state(str(s))
        nd = get_def(str(nb))
        if nd is None:
            connections[d] = True
            continue

        if is_full_solid(nd) or _is_fence(nd) or _is_wall_like(nd):
            connections[d] = True
            continue

        if _is_fence_gate(nd):
            side_from_gate = opposite_cardinal(str(d))
            facing = str(np.get("facing", "south"))
            if fence_gate_connects_to_side(facing=facing, side_from_gate=side_from_gate):
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