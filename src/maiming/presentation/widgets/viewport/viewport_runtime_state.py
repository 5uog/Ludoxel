# FILE: src/maiming/presentation/widgets/viewport/viewport_runtime_state.py
from __future__ import annotations

from dataclasses import dataclass

_VALID_CLOUD_FLOW_DIRECTIONS = (
    "east_to_west",
    "west_to_east",
    "south_to_north",
    "north_to_south",
)

def _normalize_cloud_flow_direction(raw: str) -> str:
    s = str(raw).strip().lower()
    if s in _VALID_CLOUD_FLOW_DIRECTIONS:
        return s
    return "west_to_east"

@dataclass
class ViewportRuntimeState:
    invert_x: bool = False
    invert_y: bool = False

    outline_selection: bool = True

    cloud_wire: bool = False
    cloud_enabled: bool = True
    cloud_density: int = 1
    cloud_seed: int = 1337
    cloud_flow_direction: str = "west_to_east"

    world_wire: bool = False
    shadow_enabled: bool = True

    build_mode: bool = False
    selected_block_id: str = "minecraft:grass_block"
    reach: float = 5.0
    auto_jump_enabled: bool = False
    auto_sprint_enabled: bool = False

    render_distance_chunks: int = 6

    sun_az_deg: float = 45.0
    sun_el_deg: float = 60.0

    debug_shadow: bool = False
    vsync_on: bool = False

    hud_visible: bool = False

    def normalize(self) -> None:
        self.cloud_density = int(max(0, min(4, int(self.cloud_density))))
        self.cloud_seed = int(max(0, min(9999, int(self.cloud_seed))))
        self.cloud_flow_direction = _normalize_cloud_flow_direction(str(self.cloud_flow_direction))

        self.render_distance_chunks = int(max(2, min(16, int(self.render_distance_chunks))))

        reach = float(self.reach)
        self.reach = 0.0 if reach < 0.0 else reach

        az = float(self.sun_az_deg) % 360.0
        if az < 0.0:
            az += 360.0
        self.sun_az_deg = az

        el = float(self.sun_el_deg)
        self.sun_el_deg = max(0.0, min(90.0, el))

        block_id = str(self.selected_block_id).strip()
        self.selected_block_id = block_id if block_id else "minecraft:grass_block"