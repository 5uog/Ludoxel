# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from ..block_definition import BlockDefinition
from ..state.state_codec import parse_state
from ..state.state_values import slab_type_value
from .cardinal import normalize_cardinal

DefLookup = Callable[[str], BlockDefinition | None]
_WALL_SIDES: tuple[str, str, str, str] = ("north", "east", "south", "west")


@dataclass(frozen=True)
class WallTopSupportProfile:
    force_center_post: bool
    covers_center: bool
    side_supports: frozenset[str]


def is_full_solid(defn: BlockDefinition | None) -> bool:
    if defn is None:
        return False
    return bool(defn.is_full_cube) and bool(defn.is_solid)


def _is_family(defn: BlockDefinition | None, family: str) -> bool:
    if defn is None:
        return False
    return defn.is_family(str(family))


def is_slab(defn: BlockDefinition | None) -> bool:
    return _is_family(defn, "slab")


def is_stairs(defn: BlockDefinition | None) -> bool:
    return _is_family(defn, "stairs")


def is_wall(defn: BlockDefinition | None) -> bool:
    return _is_family(defn, "wall")


def is_fence(defn: BlockDefinition | None) -> bool:
    return _is_family(defn, "fence")


def is_fence_gate(defn: BlockDefinition | None) -> bool:
    return _is_family(defn, "fence_gate")


def _state_is_full_solid_parts(defn: BlockDefinition | None, props: dict[str, str]) -> bool:
    if defn is None:
        return False

    if is_full_solid(defn):
        return True

    if is_slab(defn) and slab_type_value(props) == "double":
        return True

    return False


def block_state_is_full_solid(state_str: str | None, *, get_def: DefLookup) -> bool:
    if state_str is None:
        return False

    base, props = parse_state(str(state_str))
    defn = get_def(str(base))
    return _state_is_full_solid_parts(defn, props)


def block_state_extends_wall_post(state_str: str | None, *, get_def: DefLookup) -> bool:
    profile = wall_top_support_profile(state_str, get_def=get_def)
    return bool(profile.force_center_post or profile.covers_center)


def wall_top_support_profile(state_str: str | None, *, get_def: DefLookup) -> WallTopSupportProfile:
    if state_str is None:
        return WallTopSupportProfile(force_center_post=False, covers_center=False, side_supports=frozenset())

    base, props = parse_state(str(state_str))
    defn = get_def(str(base))
    if defn is None:
        return WallTopSupportProfile(force_center_post=False, covers_center=False, side_supports=frozenset())

    if _state_is_full_solid_parts(defn, props) or is_fence_gate(defn) or is_slab(defn) or is_stairs(defn):
        return WallTopSupportProfile(force_center_post=False, covers_center=True, side_supports=frozenset(_WALL_SIDES))

    if is_wall(defn) or is_fence(defn):
        return WallTopSupportProfile(force_center_post=True, covers_center=True, side_supports=frozenset())

    return WallTopSupportProfile(force_center_post=False, covers_center=False, side_supports=frozenset())


def wall_side_with_top_support(side: str, *, side_name: str, above_state: str | None, get_def: DefLookup) -> str:
    normalized = str(side)
    if normalized not in ("none", "low", "tall"):
        normalized = "none"

    if normalized == "none" or normalized == "tall":
        return normalized

    profile = wall_top_support_profile(above_state, get_def=get_def)
    if str(side_name) in profile.side_supports:
        return "tall"
    return normalized


def fence_gate_connects_to_side(*, facing: str, side_from_gate: str) -> bool:
    f = normalize_cardinal(str(facing), default="south")
    s = normalize_cardinal(str(side_from_gate), default="south")

    if f in ("north", "south"):
        return s in ("east", "west")
    if f in ("east", "west"):
        return s in ("north", "south")
    return s in ("east", "west")


def fence_connects_to_neighbor_state(state_str: str | None, *, side_from_neighbor: str, get_def: DefLookup) -> bool:
    if state_str is None:
        return False

    base, props = parse_state(str(state_str))
    nd = get_def(str(base))
    if nd is None:
        return True

    if _state_is_full_solid_parts(nd, props) or is_fence(nd):
        return True

    if is_fence_gate(nd):
        facing = str(props.get("facing", "south"))
        return fence_gate_connects_to_side(facing=str(facing), side_from_gate=str(side_from_neighbor))

    return False


def wall_side_from_neighbor_state(state_str: str | None, *, side_from_neighbor: str, get_def: DefLookup) -> str:
    if state_str is None:
        return "none"

    base, props = parse_state(str(state_str))
    nd = get_def(str(base))
    if nd is None:
        return "none"

    if is_wall(nd):
        return "low"

    if is_fence_gate(nd):
        facing = str(props.get("facing", "south"))
        if fence_gate_connects_to_side(facing=str(facing), side_from_gate=str(side_from_neighbor)):
            return "low"
        return "none"

    if _state_is_full_solid_parts(nd, props):
        return "tall"

    return "none"


def wall_up_rule(*, north: str, east: str, south: str, west: str, above_state: str | None, get_def: DefLookup) -> bool:
    profile = wall_top_support_profile(above_state, get_def=get_def)
    if bool(profile.force_center_post):
        return True

    opposite_tall = (str(north) == "tall" and str(south) == "tall") or (str(east) == "tall" and str(west) == "tall")
    if bool(profile.covers_center) and (not bool(opposite_tall)):
        return True

    connected = int(north != "none") + int(east != "none") + int(south != "none") + int(west != "none")
    if connected == 4:
        return False

    ns_line = (north != "none") and (south != "none") and (east == "none") and (west == "none")
    ew_line = (east != "none") and (west != "none") and (north == "none") and (south == "none")

    if ns_line and (str(north) == str(south)):
        return False
    if ew_line and (str(east) == str(west)):
        return False
    return True
