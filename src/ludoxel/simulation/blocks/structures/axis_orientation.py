# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Mapping

from ludoxel.foundations.mathematics.voxels.faces import FACE_NEG_X, FACE_NEG_Y, FACE_NEG_Z, FACE_POS_X, FACE_POS_Y, FACE_POS_Z
from ludoxel.simulation.blocks.definitions.block import BlockDefinition

PILLAR_AXIS_TAG: str = "pillar_axis"
AXIS_STATE_KEY: str = "axis"
_AXIS_VALUES: tuple[str, str, str] = ("x", "y", "z")
_ON_AXIS_FACES: dict[str, tuple[int, int]] = {"x": (FACE_POS_X, FACE_NEG_X), "y": (FACE_POS_Y, FACE_NEG_Y), "z": (FACE_POS_Z, FACE_NEG_Z)}


def is_axis_orientable(defn: BlockDefinition | None) -> bool:
  if defn is None:
    return False
  return bool(defn.has_tag(PILLAR_AXIS_TAG))


def normalize_axis(value: str | None, default: str = "y") -> str:
  s = "" if value is None else str(value).strip().lower()
  if s in _AXIS_VALUES:
    return s
  d = str(default).strip().lower()
  return d if d in _AXIS_VALUES else "y"


def axis_from_hit_face(hit_face: int) -> str:
  face = int(hit_face)
  if face == FACE_POS_X or face == FACE_NEG_X:
    return "x"
  if face == FACE_POS_Z or face == FACE_NEG_Z:
    return "z"
  return "y"


def resolve_oriented_texture_name(defn: BlockDefinition, props: Mapping[str, str], face_idx: int) -> str:
  fi = int(face_idx)
  if not is_axis_orientable(defn):
    return str(defn.texture_for_face(fi))

  axis = normalize_axis(props.get(AXIS_STATE_KEY))
  on_axis_faces = _ON_AXIS_FACES[axis]
  top_texture = defn.textures.pos_y
  side_texture = defn.textures.pos_x
  return str(top_texture) if fi in on_axis_faces else str(side_texture)
