# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3


def break_block_for_session(session, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None):
  return session.interaction.break_block(reach=float(reach), origin=origin, direction=direction)


def pick_block_for_session(session, reach: float = 5.0, *, origin: Vec3 | None = None, direction: Vec3 | None = None):
  return session.interaction.pick_block(reach=float(reach), origin=origin, direction=direction)


def interact_block_at_hit_for_session(session, hit_cell: tuple[int, int, int]):
  return session.interaction.interact_block_at_hit(hit_cell)


def place_block_from_hit_for_session(session, hit, block_id: str | None):
  return session.interaction.place_block_from_hit(hit, block_id)


def place_block_for_session(session, block_id: str | None, reach: float = 5.0, *, crouching: bool = False, origin: Vec3 | None = None, direction: Vec3 | None = None):
  return session.interaction.place_block(block_id=block_id, reach=float(reach), crouching=bool(crouching), origin=origin, direction=direction)
