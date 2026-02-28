# FILE: application/session/sessionManager.py
from __future__ import annotations

from dataclasses import dataclass

from core.math.vec3 import Vec3, clampf
from domain.world.worldState import WorldState, generate_test_map
from domain.entities.playerEntity import PlayerEntity
from domain.systems.movementSystem import MoveInput, step_minecraft
from domain.systems.collisionSystem import integrate_with_collisions
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