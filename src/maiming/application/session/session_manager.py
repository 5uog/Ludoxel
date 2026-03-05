# FILE: src/maiming/application/session/session_manager.py
from __future__ import annotations

from dataclasses import dataclass

from maiming.core.math.vec3 import Vec3, clampf
from maiming.core.geometry.aabb import AABB

from maiming.domain.world.world_gen import WorldState, generate_test_map
from maiming.domain.entities.player_entity import PlayerEntity
from maiming.domain.systems.movement_system import MoveInput, step_bedrock
from maiming.domain.systems.collision_system import integrate_with_collisions, can_auto_jump_one_block
from maiming.domain.systems.build_system import pick_block

from maiming.domain.blocks.state_codec import parse_state, format_state
from maiming.domain.blocks.block_registry import BlockRegistry
from maiming.domain.blocks.default_registry import create_default_registry
from maiming.domain.blocks.connectivity import (
    make_wall_state,
    make_fence_gate_state,
    refresh_structural_neighbors,
)
from maiming.domain.blocks.models.api import collision_boxes_for_block

from maiming.application.session.session_settings import SessionSettings
from maiming.application.session.render_snapshot import CameraDTO, RenderSnapshotDTO

@dataclass
class SessionManager:
    settings: SessionSettings
    world: WorldState
    player: PlayerEntity
    block_registry: BlockRegistry

    @staticmethod
    def create_default(seed: int = 0) -> "SessionManager":
        st = SessionSettings(seed=seed)
        world = generate_test_map(seed=seed)
        player = PlayerEntity(
            position=Vec3(float(st.spawn_x), float(st.spawn_y), float(st.spawn_z)),
            velocity=Vec3(0.0, 0.0, 0.0),
            yaw_deg=0.0,
            pitch_deg=0.0,
        )
        return SessionManager(
            settings=st,
            world=world,
            player=player,
            block_registry=create_default_registry(),
        )

    def respawn(self) -> None:
        p = self.player
        p.position = Vec3(float(self.settings.spawn_x), float(self.settings.spawn_y), float(self.settings.spawn_z))
        p.velocity = Vec3(0.0, 0.0, 0.0)
        p.yaw_deg = 0.0
        p.pitch_deg = 0.0
        p.on_ground = False

        p.crouch_eye_offset = 0.0
        p.hold_jump_queued = False
        p.auto_jump_pending = False
        p.auto_jump_start_y = float(p.position.y)
        p.auto_jump_cooldown_s = 0.0

    def step(
        self,
        dt: float,
        move_f: float,
        move_s: float,
        jump_held: bool,
        jump_pressed: bool,
        sprint: bool,
        crouch: bool,
        mdx: float,
        mdy: float,
        auto_jump_enabled: bool,
    ) -> None:
        prev_on_ground = bool(self.player.on_ground)
        prev_vy = float(self.player.velocity.y)

        yaw_delta = (-float(mdx)) * float(self.settings.mouse_sens_deg_per_px)
        pitch_delta = (float(mdy)) * float(self.settings.mouse_sens_deg_per_px)

        if not bool(jump_held):
            self.player.hold_jump_queued = False

        jump_pulse = False

        if bool(self.player.on_ground) and bool(jump_pressed):
            jump_pulse = True
        elif bool(self.player.on_ground) and bool(self.player.hold_jump_queued) and bool(jump_held):
            jump_pulse = True
            self.player.hold_jump_queued = False
        else:
            if bool(auto_jump_enabled) and (not bool(jump_held)) and bool(self.player.on_ground):
                cd = float(self.player.auto_jump_cooldown_s)
                if cd > 0.0:
                    self.player.auto_jump_cooldown_s = max(0.0, cd - float(dt))
                else:
                    f = clampf(move_f, -1.0, 1.0)
                    s = clampf(move_s, -1.0, 1.0)
                    if abs(float(f)) + abs(float(s)) > 1e-6:
                        from maiming.domain.systems.movement_system import _wish_dir
                        wish = _wish_dir(self.player, f, s)
                        probe = float(self.settings.movement.auto_jump_probe)
                        dx = float(wish.x) * probe
                        dz = float(wish.z) * probe
                        if can_auto_jump_one_block(
                            self.player,
                            self.world,
                            dx=dx,
                            dz=dz,
                            params=self.settings.collision,
                        ):
                            jump_pulse = True
                            self.player.auto_jump_pending = True
                            self.player.auto_jump_start_y = float(self.player.position.y)

        mi = MoveInput(
            forward=clampf(move_f, -1.0, 1.0),
            strafe=clampf(move_s, -1.0, 1.0),
            sprint=bool(sprint),
            crouch=bool(crouch),
            jump_pulse=bool(jump_pulse),
            jump_held=bool(jump_held),
            yaw_delta_deg=float(yaw_delta),
            pitch_delta_deg=float(pitch_delta),
        )

        step_bedrock(self.player, mi, float(dt), params=self.settings.movement)

        report = integrate_with_collisions(
            self.player,
            self.world,
            float(dt),
            params=self.settings.collision,
            crouch=bool(crouch),
            jump_pressed=bool(jump_pulse),
        )

        landed_now = (not prev_on_ground) and bool(report.supported_after) and (float(prev_vy) <= 0.0)

        if bool(landed_now) and bool(jump_held):
            self.player.hold_jump_queued = True

        if bool(landed_now) and bool(self.player.auto_jump_pending):
            dy = float(self.player.position.y) - float(self.player.auto_jump_start_y)
            if dy >= float(self.settings.movement.auto_jump_success_dy):
                self.player.auto_jump_cooldown_s = float(self.settings.movement.auto_jump_cooldown_s)
            self.player.auto_jump_pending = False

    def make_snapshot(self) -> RenderSnapshotDTO:
        eye = self.player.eye_pos()
        cam = CameraDTO(
            eye_x=eye.x,
            eye_y=eye.y,
            eye_z=eye.z,
            yaw_deg=self.player.yaw_deg,
            pitch_deg=self.player.pitch_deg,
            fov_deg=self.settings.fov_deg,
        )
        return RenderSnapshotDTO(world_revision=int(self.world.revision), camera=cam)

    def break_block(self, reach: float = 5.0) -> bool:
        eye = self.player.eye_pos()
        d = self.player.view_forward()
        hit = pick_block(self.world, origin=eye, direction=d, reach=float(reach))
        if hit is None:
            return False

        hx, hy, hz = hit.hit
        self.world.remove_block(int(hx), int(hy), int(hz))
        refresh_structural_neighbors(self.world, int(hx), int(hy), int(hz))
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
        d = self.block_registry.get(str(base))
        if d is None or d.kind != "fence_gate":
            return False

        is_open = str(props.get("open", "false")).strip().lower() in ("1", "true", "yes", "on")
        facing = str(props.get("facing", "south"))
        powered = str(props.get("powered", "false")).strip().lower() in ("1", "true", "yes", "on")
        in_wall = str(props.get("in_wall", "false")).strip().lower() in ("1", "true", "yes", "on")
        waterlogged = str(props.get("waterlogged", "false")).strip().lower() in ("1", "true", "yes", "on")

        next_state = make_fence_gate_state(
            str(base),
            str(facing),
            open_state=(not bool(is_open)),
            powered=bool(powered),
            in_wall=bool(in_wall),
            waterlogged=bool(waterlogged),
        )
        self.world.set_block(k[0], k[1], k[2], next_state)
        refresh_structural_neighbors(self.world, k[0], k[1], k[2])
        return True

    def _placement_intersects_player(self, px: int, py: int, pz: int, place_state: str) -> bool:
        pa = self.player.aabb_at(self.player.position)

        def get_state(x: int, y: int, z: int) -> str | None:
            k = (int(x), int(y), int(z))
            if k == (int(px), int(py), int(pz)):
                return str(place_state)
            return self.world.blocks.get(k)

        def get_def(base_id: str):
            return self.block_registry.get(str(base_id))

        boxes = collision_boxes_for_block(
            str(place_state),
            get_state,
            get_def,
            int(px),
            int(py),
            int(pz),
        )
        if not boxes:
            return False

        for b in boxes:
            ba = AABB(
                mn=Vec3(float(px) + float(b.mn_x), float(py) + float(b.mn_y), float(pz) + float(b.mn_z)),
                mx=Vec3(float(px) + float(b.mx_x), float(py) + float(b.mx_y), float(pz) + float(b.mx_z)),
            )
            if pa.intersects(ba):
                return True
        return False

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
        defn = self.block_registry.get(base_sel)

        if defn is None:
            return False

        props: dict[str, str] = {}

        if defn.kind == "slab":
            props["type"] = self._choose_half_type(int(hit.face), hit.hit_point)
            place_state = format_state(base_sel, props)
        elif defn.kind == "stairs":
            props["facing"] = self._player_cardinal()
            props["half"] = self._choose_half_type(int(hit.face), hit.hit_point)
            place_state = format_state(base_sel, props)
        elif defn.kind == "fence_gate":
            place_state = make_fence_gate_state(base_sel, self._player_cardinal(), open_state=False)
        elif defn.kind == "wall":
            place_state = make_wall_state(base_sel, waterlogged=False)
        else:
            place_state = format_state(base_sel, props)

        if self._placement_intersects_player(int(px), int(py), int(pz), str(place_state)):
            return False

        self.world.set_block(int(px), int(py), int(pz), str(place_state))
        refresh_structural_neighbors(self.world, int(px), int(py), int(pz))
        return True