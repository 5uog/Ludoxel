# FILE: src/maiming/domain/blocks/models/wall.py
from __future__ import annotations

from typing import Dict, List

from maiming.domain.blocks.models.common import LocalBox, GetState, GetDef, get_neighbor_def
from maiming.domain.blocks.block_definition import BlockDefinition

def _norm_side(s: str) -> str:
    t = str(s)
    if t in ("none", "low", "tall"):
        return t
    return "none"

def _is_full_solid(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    return bool(defn.is_full_cube) and bool(defn.is_solid)

def _is_wall(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    return str(defn.kind) == "wall" or defn.has_tag("wall")

def _is_fence(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    return str(defn.kind) == "fence" or defn.has_tag("fence")

def _is_fence_gate(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    return str(defn.kind) == "fence_gate" or defn.has_tag("fence_gate")

def _derive_side(get_state: GetState, get_def: GetDef, x: int, y: int, z: int) -> str:
    nd = get_neighbor_def(get_state, get_def, int(x), int(y), int(z))
    if nd is None:
        return "none"
    if _is_wall(nd):
        return "low"
    if _is_fence(nd):
        return "low"
    if _is_fence_gate(nd):
        return "low"
    if _is_full_solid(nd):
        return "tall"
    return "none"

def _derive_up(
    *,
    north: str,
    east: str,
    south: str,
    west: str,
    above: BlockDefinition | None,
) -> bool:
    if _is_full_solid(above) or _is_wall(above):
        return True

    ns_line = (north != "none") and (south != "none") and (east == "none") and (west == "none")
    ew_line = (east != "none") and (west != "none") and (north == "none") and (south == "none")

    if ns_line and (str(north) == str(south)):
        return False
    if ew_line and (str(east) == str(west)):
        return False
    return True

def _arm_north(kind: str) -> LocalBox:
    if str(kind) == "tall":
        return LocalBox(5.0 / 16.0, 0.0, 0.0, 11.0 / 16.0, 1.0, 11.0 / 16.0)
    return LocalBox(5.0 / 16.0, 0.0, 0.0, 11.0 / 16.0, 14.0 / 16.0, 11.0 / 16.0)

def boxes_for_wall(
    *,
    props: Dict[str, str],
    get_state: GetState,
    get_def: GetDef,
    x: int,
    y: int,
    z: int,
) -> List[LocalBox]:
    north = _norm_side(str(props.get("north", ""))) if "north" in props else _derive_side(get_state, get_def, x, y, z - 1)
    east = _norm_side(str(props.get("east", ""))) if "east" in props else _derive_side(get_state, get_def, x + 1, y, z)
    south = _norm_side(str(props.get("south", ""))) if "south" in props else _derive_side(get_state, get_def, x, y, z + 1)
    west = _norm_side(str(props.get("west", ""))) if "west" in props else _derive_side(get_state, get_def, x - 1, y, z)

    if "up" in props:
        up = str(props.get("up", "true")).strip().lower() in ("1", "true", "yes", "on")
    else:
        above = get_neighbor_def(get_state, get_def, x, y + 1, z)
        up = _derive_up(north=north, east=east, south=south, west=west, above=above)

    out: list[LocalBox] = []

    if bool(up):
        out.append(LocalBox(4.0 / 16.0, 0.0, 4.0 / 16.0, 12.0 / 16.0, 1.0, 12.0 / 16.0))

    if north != "none":
        out.append(_arm_north(north))
    if east != "none":
        out.append(LocalBox(5.0 / 16.0, 0.0, 5.0 / 16.0, 1.0, 1.0 if east == "tall" else 14.0 / 16.0, 11.0 / 16.0))
    if south != "none":
        out.append(LocalBox(5.0 / 16.0, 0.0, 5.0 / 16.0, 11.0 / 16.0, 1.0 if south == "tall" else 14.0 / 16.0, 1.0))
    if west != "none":
        out.append(LocalBox(0.0, 0.0, 5.0 / 16.0, 11.0 / 16.0, 1.0 if west == "tall" else 14.0 / 16.0, 11.0 / 16.0))

    if not out:
        out.append(LocalBox(4.0 / 16.0, 0.0, 4.0 / 16.0, 12.0 / 16.0, 1.0, 12.0 / 16.0))

    return out