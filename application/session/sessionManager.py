# FILE: application/session/sessionManager.py
from __future__ import annotations

from dataclasses import dataclass

from core.math.vec3 import Vec3, clampf
from core.geometry.aabb import AABB

from domain.world.worldState import WorldState, generate_test_map
from domain.entities.playerEntity import PlayerEntity
from domain.systems.movementSystem import MoveInput, step_minecraft
from domain.systems.collisionSystem import integrate_with_collisions
from domain.systems.buildSystem import pick_block

from domain.blocks.stateCodec import parse_state, format_state
from domain.blocks.blockRegistry import create_default_registry

from application.session.sessionSettings import SessionSettings
from application.ports.rendererPort import BlockInstanceDTO, CameraDTO, RenderSnapshotDTO

@dataclass
class SessionManager:
    settings: SessionSettings
    world: WorldState
    player: PlayerEntity

    @staticmethod
    def create_default(seed: int = 0) -> "SessionManager":
        st = SessionSettings(seed=seed)
        world = generate_test_map(seed=seed)
        player = PlayerEntity(
            position=Vec3(0.0, 1.0, -10.0),
            velocity=Vec3(0.0, 0.0, 0.0),
            yaw_deg=0.0,
            pitch_deg=0.0,
        )
        return SessionManager(settings=st, world=world, player=player)

    def step(self, dt: float, move_f: float, move_s: float, jump: bool, crouch: bool, mdx: float, mdy: float) -> None:
        yaw_delta = (-mdx) * self.settings.mouse_sens_deg_per_px
        pitch_delta = (mdy) * self.settings.mouse_sens_deg_per_px

        mi = MoveInput(
            forward=clampf(move_f, -1.0, 1.0),
            strafe=clampf(move_s, -1.0, 1.0),
            jump_pressed=bool(jump),
            crouch=bool(crouch),
            yaw_delta_deg=yaw_delta,
            pitch_delta_deg=pitch_delta,
        )

        step_minecraft(self.player, mi, dt, params=self.settings.movement)

        landed_now = integrate_with_collisions(
            self.player,
            self.world,
            dt,
            params=self.settings.collision,
            crouch=bool(crouch),
            jump_pressed=bool(jump),
        )

        if landed_now and bool(jump):
            delay = float(self.settings.movement.jump_repeat_delay_s)
            self.player.jump_cooldown_s = max(float(self.player.jump_cooldown_s), delay)

    def make_snapshot(self) -> RenderSnapshotDTO:
        blocks = [BlockInstanceDTO(x, y, z, bid) for x, y, z, bid in self.world.iter_blocks()]
        eye = self.player.eye_pos()
        cam = CameraDTO(
            eye_x=eye.x,
            eye_y=eye.y,
            eye_z=eye.z,
            yaw_deg=self.player.yaw_deg,
            pitch_deg=self.player.pitch_deg,
            fov_deg=self.settings.fov_deg,
        )
        return RenderSnapshotDTO(world_revision=self.world.revision, blocks=blocks, camera=cam)

    def break_block(self, reach: float = 5.0) -> bool:
        eye = self.player.eye_pos()
        d = self.player.view_forward()
        hit = pick_block(self.world, origin=eye, direction=d, reach=float(reach))
        if hit is None:
            return False

        hx, hy, hz = hit.hit
        self.world.remove_block(int(hx), int(hy), int(hz))
        return True

    def _player_cardinal(self) -> str:
        f = self.player.view_forward()
        ax = abs(float(f.x))
        az = abs(float(f.z))
        if ax >= az:
            return "east" if float(f.x) > 0.0 else "west"
        return "south" if float(f.z) > 0.0 else "north"

    def _choose_half_type(self, hit_face: int, hit_point: Vec3) -> str:
        if int(hit_face) == 2:
            return "bottom"
        if int(hit_face) == 3:
            return "top"
        fy = float(hit_point.y) - float(int(hit_point.y))
        return "top" if fy >= 0.5 else "bottom"

    def _toggle_fence_gate_if_hit(self, hit_cell: tuple[int, int, int]) -> bool:
        k = (int(hit_cell[0]), int(hit_cell[1]), int(hit_cell[2]))
        st = self.world.blocks.get(k)
        if st is None:
            return False

        base, props = parse_state(st)
        reg = create_default_registry()
        d = reg.get(str(base))
        if d is None or d.kind != "fence_gate":
            return False

        open_s = str(props.get("open", "false")).lower()
        is_open = open_s in ("1", "true", "yes", "on")
        props["open"] = "false" if is_open else "true"
        self.world.set_block(k[0], k[1], k[2], format_state(str(base), props))
        return True

    def place_block(self, block_id: str, reach: float = 5.0) -> bool:
        eye = self.player.eye_pos()
        d = self.player.view_forward()
        hit = pick_block(self.world, origin=eye, direction=d, reach=float(reach))
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

        base_sel = str(block_id)
        reg = create_default_registry()
        defn = reg.get(base_sel)

        props: dict[str, str] = {}

        if defn is not None and defn.kind == "slab":
            props["type"] = self._choose_half_type(int(hit.face), hit.hit_point)
        elif defn is not None and defn.kind == "stairs":
            props["facing"] = self._player_cardinal()
            props["half"] = self._choose_half_type(int(hit.face), hit.hit_point)
        elif defn is not None and defn.kind == "fence_gate":
            props["facing"] = self._player_cardinal()
            props["open"] = "false"

        place_state = format_state(base_sel, props)

        ba = AABB(
            mn=Vec3(float(px), float(py), float(pz)),
            mx=Vec3(float(px + 1), float(py + 1), float(pz + 1)),
        )
        pa = self.player.aabb_at(self.player.position)
        if pa.intersects(ba):
            return False

        self.world.set_block(int(px), int(py), int(pz), place_state)
        return True