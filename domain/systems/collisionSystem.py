# FILE: domain/systems/collisionSystem.py
from __future__ import annotations

from core.math.vec3 import Vec3
from core.geometry.aabb import AABB
from domain.entities.playerEntity import PlayerEntity
from domain.world.worldState import WorldState
from domain.config.collisionParams import CollisionParams, DEFAULT_COLLISION_PARAMS

def _block_aabb(x: int, y: int, z: int) -> AABB:
    return AABB(
        mn=Vec3(float(x), float(y), float(z)),
        mx=Vec3(float(x + 1), float(y + 1), float(z + 1)),
    )

def _iter_nearby_blocks(world: WorldState, aabb: AABB, params: CollisionParams):
    pxz = int(params.nearby_xz_pad)
    pyd = int(params.nearby_y_down_pad)
    pyu = int(params.nearby_y_up_pad)

    x0 = int(aabb.mn.x) - pxz
    x1 = int(aabb.mx.x) + pxz
    y0 = int(aabb.mn.y) - pyd
    y1 = int(aabb.mx.y) + pyu
    z0 = int(aabb.mn.z) - pxz
    z1 = int(aabb.mx.z) + pxz

    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            for z in range(z0, z1 + 1):
                if (x, y, z) in world.blocks:
                    yield x, y, z

def _has_support_at(player: PlayerEntity, world: WorldState, pos: Vec3, params: CollisionParams) -> bool:
    eps = float(params.eps)
    gp = float(params.ground_probe)

    aabb = player.aabb_at(pos)
    probe = AABB(
        mn=Vec3(aabb.mn.x, aabb.mn.y - gp, aabb.mn.z),
        mx=Vec3(aabb.mx.x, aabb.mn.y + eps, aabb.mx.z),
    )
    for bx, by, bz in _iter_nearby_blocks(world, probe, params):
        if probe.intersects(_block_aabb(bx, by, bz)):
            return True
    return False

def _ground_probe(player: PlayerEntity, world: WorldState, params: CollisionParams) -> bool:
    return _has_support_at(player, world, player.position, params)

def _backoff(delta: float, step: float) -> float:
    if abs(delta) <= step:
        return 0.0
    s = 1.0 if delta > 0.0 else -1.0
    v = delta - s * step
    if s > 0.0:
        return max(0.0, v)
    return min(0.0, v)

def _apply_sneak_edge_clamp(
    player: PlayerEntity,
    world: WorldState,
    pos: Vec3,
    delta: Vec3,
    params: CollisionParams,
) -> Vec3:
    """
    Clamp horizontal motion so the player's feet AABB remains supported.
    This is a simplified Minecraft-like edge-walk behavior.
    """
    step = float(params.sneak_step)
    dx = float(delta.x)
    dz = float(delta.z)

    for _ in range(128):
        if dx == 0.0:
            break
        cand = Vec3(pos.x + dx, pos.y, pos.z)
        if _has_support_at(player, world, cand, params):
            break
        dx = _backoff(dx, step)

    for _ in range(128):
        if dz == 0.0:
            break
        cand = Vec3(pos.x + dx, pos.y, pos.z + dz)
        if _has_support_at(player, world, cand, params):
            break
        dz = _backoff(dz, step)

    for _ in range(256):
        if dx == 0.0 or dz == 0.0:
            break
        cand = Vec3(pos.x + dx, pos.y, pos.z + dz)
        if _has_support_at(player, world, cand, params):
            break

        if abs(dx) >= abs(dz):
            dx = _backoff(dx, step)
        else:
            dz = _backoff(dz, step)

    return Vec3(dx, delta.y, dz)

def integrate_with_collisions(
    player: PlayerEntity,
    world: WorldState,
    dt: float,
    params: CollisionParams = DEFAULT_COLLISION_PARAMS,
    crouch: bool = False,
    jump_pressed: bool = False,
) -> bool:
    eps = float(params.eps)

    supported_before = bool(player.on_ground) or _ground_probe(player, world, params)

    delta = player.velocity * dt
    pos = player.position

    if supported_before and bool(crouch) and (not bool(jump_pressed)):
        delta = _apply_sneak_edge_clamp(player, world, pos, delta, params)

    hit_ground = False

    if abs(delta.x) > 0.0:
        pos_x = Vec3(pos.x + delta.x, pos.y, pos.z)
        aabb = player.aabb_at(pos_x)
        for bx, by, bz in _iter_nearby_blocks(world, aabb, params):
            ba = _block_aabb(bx, by, bz)
            if aabb.intersects(ba):
                if delta.x > 0.0:
                    pos_x = Vec3(ba.mn.x - (player.width * 0.5) - eps, pos_x.y, pos_x.z)
                else:
                    pos_x = Vec3(ba.mx.x + (player.width * 0.5) + eps, pos_x.y, pos_x.z)
                player.velocity = Vec3(0.0, player.velocity.y, player.velocity.z)
                aabb = player.aabb_at(pos_x)
        pos = pos_x

    if abs(delta.y) > 0.0:
        pos_y = Vec3(pos.x, pos.y + delta.y, pos.z)
        aabb = player.aabb_at(pos_y)
        for bx, by, bz in _iter_nearby_blocks(world, aabb, params):
            ba = _block_aabb(bx, by, bz)
            if aabb.intersects(ba):
                if delta.y > 0.0:
                    pos_y = Vec3(pos_y.x, ba.mn.y - player.height - eps, pos_y.z)
                    player.velocity = Vec3(player.velocity.x, 0.0, player.velocity.z)
                else:
                    pos_y = Vec3(pos_y.x, ba.mx.y + eps, pos_y.z)
                    player.velocity = Vec3(player.velocity.x, 0.0, player.velocity.z)
                    hit_ground = True
                aabb = player.aabb_at(pos_y)
        pos = pos_y

    if abs(delta.z) > 0.0:
        pos_z = Vec3(pos.x, pos.y, pos.z + delta.z)
        aabb = player.aabb_at(pos_z)
        for bx, by, bz in _iter_nearby_blocks(world, aabb, params):
            ba = _block_aabb(bx, by, bz)
            if aabb.intersects(ba):
                if delta.z > 0.0:
                    pos_z = Vec3(pos_z.x, pos_z.y, ba.mn.z - (player.width * 0.5) - eps)
                else:
                    pos_z = Vec3(pos_z.x, pos_z.y, ba.mx.z + (player.width * 0.5) + eps)
                player.velocity = Vec3(player.velocity.x, player.velocity.y, 0.0)
                aabb = player.aabb_at(pos_z)
        pos = pos_z

    player.position = pos
    supported_after = bool(hit_ground) or _ground_probe(player, world, params)
    player.on_ground = supported_after

    landed_now = (not supported_before) and supported_after
    return bool(landed_now)