from __future__ import annotations

from dataclasses import dataclass, field

from maiming.domain.world.world_state import WorldState
from maiming.domain.entities.player_entity import PlayerEntity

from maiming.domain.blocks.block_registry import BlockRegistry
from maiming.domain.blocks.state_codec import parse_state
from maiming.domain.blocks.connectivity import (
    make_fence_gate_state,
    canonical_fence_gate_state,
    refresh_structural_neighbors,
)

from maiming.domain.systems.build_system import BlockPick, pick_block

from maiming.application.services.placement_policy import PlacementPolicy

@dataclass
class InteractionService:
    world: WorldState
    player: PlayerEntity
    block_registry: BlockRegistry

    placement_policy: PlacementPolicy = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self.placement_policy = PlacementPolicy(block_registry=self.block_registry)

    @classmethod
    def create(
        cls,
        *,
        world: WorldState,
        player: PlayerEntity,
        block_registry: BlockRegistry,
    ) -> "InteractionService":
        return cls(
            world=world,
            player=player,
            block_registry=block_registry,
        )

    def _pick_target(self, reach: float) -> BlockPick | None:
        eye = self.player.eye_pos()
        direction = self.player.view_forward()
        return pick_block(
            self.world,
            origin=eye,
            direction=direction,
            reach=float(reach),
        )

    def break_block(self, reach: float = 5.0) -> bool:
        hit = self._pick_target(reach=float(reach))
        if hit is None:
            return False

        hx, hy, hz = hit.hit
        self.world.remove_block(int(hx), int(hy), int(hz))
        refresh_structural_neighbors(self.world, int(hx), int(hy), int(hz))
        return True

    @staticmethod
    def _opposite_cardinal(f: str) -> str:
        s = str(f)
        if s == "north":
            return "south"
        if s == "south":
            return "north"
        if s == "east":
            return "west"
        if s == "west":
            return "east"
        return "south"

    @staticmethod
    def _facing_vec_xz(f: str) -> tuple[float, float]:
        s = str(f)
        if s == "north":
            return (0.0, -1.0)
        if s == "south":
            return (0.0, 1.0)
        if s == "east":
            return (1.0, 0.0)
        if s == "west":
            return (-1.0, 0.0)
        return (0.0, 1.0)

    def _toggle_fence_gate_if_hit(self, hit_cell: tuple[int, int, int]) -> bool:
        k = (int(hit_cell[0]), int(hit_cell[1]), int(hit_cell[2]))
        st = self.world.blocks.get(k)
        if st is None:
            return False

        base, props = parse_state(st)
        d = self.block_registry.get(str(base))
        if d is None or d.kind != "fence_gate":
            return False

        is_open = str(props.get("open", "false")).strip().lower() in ("1", "true", "yes", "on")
        facing = str(props.get("facing", "south"))
        powered = str(props.get("powered", "false")).strip().lower() in ("1", "true", "yes", "on")
        waterlogged = str(props.get("waterlogged", "false")).strip().lower() in ("1", "true", "yes", "on")

        next_open = not bool(is_open)
        next_facing = str(facing)

        if bool(next_open):
            px = float(self.player.position.x)
            pz = float(self.player.position.z)
            cx = float(k[0]) + 0.5
            cz = float(k[2]) + 0.5
            dx = px - cx
            dz = pz - cz

            fx, fz = self._facing_vec_xz(str(facing))
            dot = float(dx) * float(fx) + float(dz) * float(fz)

            if dot > 1e-9:
                next_facing = self._opposite_cardinal(str(facing))

        nxt = canonical_fence_gate_state(
            self.world,
            int(k[0]),
            int(k[1]),
            int(k[2]),
            facing_override=str(next_facing),
            open_override=bool(next_open),
        )

        if nxt is None:
            nxt = make_fence_gate_state(
                str(base),
                str(next_facing),
                open_state=bool(next_open),
                powered=bool(powered),
                in_wall=str(props.get("in_wall", "false")).strip().lower() in ("1", "true", "yes", "on"),
                waterlogged=bool(waterlogged),
            )

        self.world.set_block(int(k[0]), int(k[1]), int(k[2]), str(nxt))
        refresh_structural_neighbors(self.world, int(k[0]), int(k[1]), int(k[2]))
        return True

    def place_block(self, block_id: str, reach: float = 5.0) -> bool:
        hit = self._pick_target(reach=float(reach))
        if hit is None:
            return False

        if self._toggle_fence_gate_if_hit(hit.hit):
            return True

        if hit.place is None:
            return False

        px, py, pz = hit.place
        k = (int(px), int(py), int(pz))

        if k in self.world.blocks:
            return False

        place_state = self.placement_policy.resolve_place_state(
            player=self.player,
            block_id=str(block_id),
            hit_face=int(hit.face),
            hit_point=hit.hit_point,
        )
        if place_state is None:
            return False

        if self.placement_policy.placement_intersects_player(
            player=self.player,
            world=self.world,
            px=int(px),
            py=int(py),
            pz=int(pz),
            place_state=str(place_state),
        ):
            return False

        self.world.set_block(int(px), int(py), int(pz), str(place_state))
        refresh_structural_neighbors(self.world, int(px), int(py), int(pz))
        return True