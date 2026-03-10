# FILE: src/maiming/infrastructure/rendering/opengl/facade/cloud_flow_direction.py
from __future__ import annotations

CLOUD_FLOW_DIRECTIONS: tuple[str, str, str, str] = ("east_to_west", "west_to_east", "south_to_north", "north_to_south")

def normalize_cloud_flow_direction(raw: str) -> str:
    s = str(raw).strip().lower()
    if s in CLOUD_FLOW_DIRECTIONS:
        return s
    return "west_to_east"