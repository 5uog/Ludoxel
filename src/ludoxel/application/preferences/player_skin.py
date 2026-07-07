# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

PLAYER_SKIN_KIND_TIMO = "timo"
PLAYER_SKIN_KIND_CUSTOM = "custom"


def normalize_player_skin_kind(value: object) -> str:
  normalized = str(value or "").strip().lower()
  if normalized == PLAYER_SKIN_KIND_CUSTOM:
    return PLAYER_SKIN_KIND_CUSTOM
  return PLAYER_SKIN_KIND_TIMO
