# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SpecialItemDescriptor:
    item_id: str
    display_name: str
    icon_key: str
    description: str
    catalog_visible: bool = False
