# FILE: src/maiming/domain/blocks/connectivity.py
from __future__ import annotations

from maiming.domain.blocks.block_definition import BlockDefinition
from maiming.domain.blocks.default_registry import create_default_registry
from maiming.domain.blocks.state_codec import parse_state, format_state
from maiming.domain.world.world_state import WorldState

_REG = create_default_registry()

def _bool_str(v: bool) -> str:
    return "true" if bool(v) else "false"

def _as_bool(s: str | None, default: bool = False) -> bool:
    if s is None:
        return bool(default)
    t = str(s).strip().lower()
    if t in ("1", "true", "yes", "on"):
        return True
    if t in ("0", "false", "no", "off"):
        return False
    return bool(default)

def _state_at(world: WorldState, x: int, y: int, z: int) -> str | None:
    return world.blocks.get((int(x), int(y), int(z)))

def _def_from_state(state_str: str | None) -> BlockDefinition | None:
    if state_str is None:
        return None
    base, _props = parse_state(str(state_str))
    return _REG.get(str(base))

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

def _wall_side_from_neighbor(world: WorldState, x: int, y: int, z: int) -> str:
    st = _state_at(world, int(x), int(y), int(z))
    d = _def_from_state(st)

    if d is None:
        return "none"
    if _is_wall(d):
        return "low"
    if _is_fence(d):
        return "low"
    if _is_fence_gate(d):
        return "low"
    if _is_full_solid(d):
        return "tall"
    return "none"

def _wall_up_rule(
    *,
    north: str,
    east: str,
    south: str,
    west: str,
    above_def: BlockDefinition | None,
) -> bool:
    if _is_full_solid(above_def) or _is_wall(above_def):
        return True

    ns_line = (north != "none") and (south != "none") and (east == "none") and (west == "none")
    ew_line = (east != "none") and (west != "none") and (north == "none") and (south == "none")

    if ns_line and (str(north) == str(south)):
        return False
    if ew_line and (str(east) == str(west)):
        return False
    return True

def make_wall_state(base_id: str, waterlogged: bool = False) -> str:
    return format_state(
        str(base_id),
        {
            "east": "none",
            "north": "none",
            "south": "none",
            "up": "true",
            "waterlogged": _bool_str(bool(waterlogged)),
            "west": "none",
        },
    )

def canonical_wall_state(world: WorldState, x: int, y: int, z: int) -> str | None:
    st = _state_at(world, int(x), int(y), int(z))
    d = _def_from_state(st)
    if st is None or (not _is_wall(d)):
        return None

    base, props = parse_state(str(st))
    waterlogged = _as_bool(props.get("waterlogged"), False)

    north = _wall_side_from_neighbor(world, int(x), int(y), int(z - 1))
    east = _wall_side_from_neighbor(world, int(x + 1), int(y), int(z))
    south = _wall_side_from_neighbor(world, int(x), int(y), int(z + 1))
    west = _wall_side_from_neighbor(world, int(x - 1), int(y), int(z))

    above_def = _def_from_state(_state_at(world, int(x), int(y + 1), int(z)))
    up = _wall_up_rule(
        north=str(north),
        east=str(east),
        south=str(south),
        west=str(west),
        above_def=above_def,
    )

    return format_state(
        str(base),
        {
            "east": str(east),
            "north": str(north),
            "south": str(south),
            "up": _bool_str(bool(up)),
            "waterlogged": _bool_str(bool(waterlogged)),
            "west": str(west),
        },
    )

def make_fence_gate_state(
    base_id: str,
    facing: str,
    *,
    open_state: bool = False,
    powered: bool = False,
    in_wall: bool = False,
    waterlogged: bool = False,
) -> str:
    return format_state(
        str(base_id),
        {
            "facing": str(facing),
            "in_wall": _bool_str(bool(in_wall)),
            "open": _bool_str(bool(open_state)),
            "powered": _bool_str(bool(powered)),
            "waterlogged": _bool_str(bool(waterlogged)),
        },
    )

def _gate_in_wall(world: WorldState, x: int, y: int, z: int, facing: str) -> bool:
    f = str(facing)
    if f in ("north", "south"):
        a = _is_wall(_def_from_state(_state_at(world, int(x - 1), int(y), int(z))))
        b = _is_wall(_def_from_state(_state_at(world, int(x + 1), int(y), int(z))))
        return bool(a or b)

    a = _is_wall(_def_from_state(_state_at(world, int(x), int(y), int(z - 1))))
    b = _is_wall(_def_from_state(_state_at(world, int(x), int(y), int(z + 1))))
    return bool(a or b)

def canonical_fence_gate_state(
    world: WorldState,
    x: int,
    y: int,
    z: int,
    *,
    facing_override: str | None = None,
    open_override: bool | None = None,
) -> str | None:
    st = _state_at(world, int(x), int(y), int(z))
    d = _def_from_state(st)
    if st is None or (not _is_fence_gate(d)):
        return None

    base, props = parse_state(str(st))

    facing = str(facing_override) if facing_override is not None else str(props.get("facing", "south"))
    if facing not in ("north", "east", "south", "west"):
        facing = "south"

    open_state = bool(open_override) if open_override is not None else _as_bool(props.get("open"), False)
    powered = _as_bool(props.get("powered"), False)
    waterlogged = _as_bool(props.get("waterlogged"), False)
    in_wall = _gate_in_wall(world, int(x), int(y), int(z), str(facing))

    return make_fence_gate_state(
        str(base),
        str(facing),
        open_state=bool(open_state),
        powered=bool(powered),
        in_wall=bool(in_wall),
        waterlogged=bool(waterlogged),
    )

def refresh_structural_neighbors(world: WorldState, x: int, y: int, z: int) -> None:
    targets = {
        (int(x), int(y), int(z)),
        (int(x), int(y - 1), int(z)),
        (int(x + 1), int(y), int(z)),
        (int(x - 1), int(y), int(z)),
        (int(x), int(y), int(z + 1)),
        (int(x), int(y), int(z - 1)),
    }

    updates: list[tuple[int, int, int, str]] = []

    for tx, ty, tz in targets:
        st = _state_at(world, int(tx), int(ty), int(tz))
        d = _def_from_state(st)
        if st is None or d is None:
            continue

        nxt: str | None = None
        if _is_wall(d):
            nxt = canonical_wall_state(world, int(tx), int(ty), int(tz))
        elif _is_fence_gate(d):
            nxt = canonical_fence_gate_state(world, int(tx), int(ty), int(tz))

        if nxt is not None and str(nxt) != str(st):
            updates.append((int(tx), int(ty), int(tz), str(nxt)))

    for tx, ty, tz, nxt in updates:
        world.set_block(int(tx), int(ty), int(tz), str(nxt))