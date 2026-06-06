# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.voxels.faces import FACE_NEG_X, FACE_NEG_Z, FACE_POS_X, FACE_POS_Z
from ludoxel.simulation.actors.ai_players.state import AI_DEFAULT_HELD_ITEM_ID


def _held_item_id_for_settings(*, can_place_blocks: bool, held_item_id: str | None = None) -> str | None:
  if not bool(can_place_blocks):
    return None
  normalized = None if held_item_id is None else str(held_item_id).strip()
  return str(normalized) if normalized else str(AI_DEFAULT_HELD_ITEM_ID)


def _face_for_horizontal_step(step_x: int, step_z: int) -> int:
  if int(step_x) > 0:
    return int(FACE_POS_X)
  if int(step_x) < 0:
    return int(FACE_NEG_X)
  if int(step_z) > 0:
    return int(FACE_POS_Z)
  return int(FACE_NEG_Z)


def _face_hit_point(cell: tuple[int, int, int], face: int) -> Vec3:
  x, y, z = (int(cell[0]), int(cell[1]), int(cell[2]))
  if int(face) == int(FACE_POS_X):
    return Vec3(float(x + 1), float(y) + 0.5, float(z) + 0.5)
  if int(face) == int(FACE_NEG_X):
    return Vec3(float(x), float(y) + 0.5, float(z) + 0.5)
  if int(face) == int(FACE_POS_Z):
    return Vec3(float(x) + 0.5, float(y) + 0.5, float(z + 1))
  if int(face) == int(FACE_NEG_Z):
    return Vec3(float(x) + 0.5, float(y) + 0.5, float(z))
  return Vec3(float(x) + 0.5, float(y + 1), float(z) + 0.5)


def _side_step_from_forward(step_x: int, step_z: int, *, side_sign: int) -> tuple[int, int]:
  if int(side_sign) >= 0:
    return (-int(step_z), int(step_x))
  return (int(step_z), -int(step_x))
