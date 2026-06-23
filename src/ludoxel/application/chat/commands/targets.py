# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from typing import Iterable

SELF_TARGET_TOKENS: frozenset[str] = frozenset({"@s", "@p"})


def is_local_player_target(token: str | None, *, local_name: str) -> bool:
  if token is None:
    return True
  candidate = str(token).strip()
  if candidate.lower() in SELF_TARGET_TOKENS:
    return True
  return bool(candidate) and candidate.lower() == str(local_name).strip().lower()


def resolve_entity_anchor(token: str, *, entities: Iterable[tuple[str, tuple[float, float, float]]], local_name: str, local_anchor: tuple[float, float, float]) -> tuple[float, float, float] | None:
  candidate = str(token).strip()
  if candidate.lower() in SELF_TARGET_TOKENS or (bool(candidate) and candidate.lower() == str(local_name).strip().lower()):
    return tuple(float(value) for value in local_anchor)
  for name, position in entities:
    if str(name).strip().lower() == candidate.lower():
      return tuple(float(value) for value in position)
  return None
