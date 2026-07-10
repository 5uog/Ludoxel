# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable

from ludoxel.simulation.blocks.definitions.block import BlockDefinition

UVRect = tuple[float, float, float, float]
UVLookup = Callable[[str, int], UVRect]
WorldUVLookup = Callable[[int, int, int, str, int], tuple[UVRect, float]]
DefLookup = Callable[[str], BlockDefinition | None]
GetState = Callable[[int, int, int], str | None]
